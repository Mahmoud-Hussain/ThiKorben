import { useCallback, useEffect, useRef, useState } from 'react';

import { getCommunityFeed } from './community.service';

import type {
  CommunityCategory,
  CommunityRequest,
  CommunityRequestStatus,
} from './types';

export type CommunityFeedOptions = {
  category?: CommunityCategory;
  status?: CommunityRequestStatus;
  pageSize?: number;
  enabled?: boolean;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong while loading the community feed.';
}

function createQueryKey(
  category: CommunityCategory | undefined,
  status: CommunityRequestStatus | undefined,
  pageSize: number,
) {
  return JSON.stringify([category ?? null, status ?? null, pageSize]);
}

export function useCommunityFeed(options: CommunityFeedOptions = {}) {
  const { category, status, pageSize = 20, enabled = true } = options;

  const queryKey = createQueryKey(category, status, pageSize);

  const [items, setItems] = useState<CommunityRequest[]>([]);

  const [dataQueryKey, setDataQueryKey] = useState<string | null>(null);

  const [settledQueryKey, setSettledQueryKey] = useState<string | null>(null);

  const [nextOffset, setNextOffset] = useState<number | null>(null);

  const [hasMore, setHasMore] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  /*
   * Every network operation receives an increasing request ID.
   * Only the latest request is allowed to update feed data.
   *
   * This protects against:
   * - fast filter changes
   * - refresh racing with pagination
   * - old network responses arriving late
   */
  const requestIdRef = useRef(0);

  /*
   * Prevent rapid repeated Refresh / Load More actions before
   * React has had a chance to render the updated loading state.
   */
  const manualOperationRef = useRef<'refresh' | 'more' | null>(null);

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    let isActive = true;

    /*
     * Any previous manual request belongs to the old query.
     * Ref mutation does not trigger a React render.
     */
    manualOperationRef.current = null;

    if (!enabled) {
      return () => {
        isActive = false;
      };
    }

    const loadInitialPage = async () => {
      try {
        /*
         * The first state update happens only after this awaited
         * external request finishes.
         *
         * Therefore the effect itself does not synchronously
         * trigger React state updates.
         */
        const page = await getCommunityFeed({
          offset: 0,
          limit: pageSize,
          category,
          status,
        });

        if (!isActive || requestId !== requestIdRef.current) {
          return;
        }

        setItems(page.items);
        setNextOffset(page.nextOffset);
        setHasMore(page.hasMore);

        setError(null);

        setDataQueryKey(queryKey);
        setSettledQueryKey(queryKey);

        setIsRefreshing(false);
        setIsLoadingMore(false);
      } catch (loadError) {
        if (!isActive || requestId !== requestIdRef.current) {
          return;
        }

        setError(getErrorMessage(loadError));

        setSettledQueryKey(queryKey);

        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    };

    void loadInitialPage();

    return () => {
      isActive = false;
    };
  }, [category, enabled, pageSize, queryKey, status]);

  const refresh = useCallback(async () => {
    if (!enabled || manualOperationRef.current !== null) {
      return;
    }

    manualOperationRef.current = 'refresh';

    const requestId = ++requestIdRef.current;

    setIsRefreshing(true);
    setIsLoadingMore(false);
    setError(null);

    try {
      const page = await getCommunityFeed({
        offset: 0,
        limit: pageSize,
        category,
        status,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setItems(page.items);
      setNextOffset(page.nextOffset);
      setHasMore(page.hasMore);

      setError(null);

      setDataQueryKey(queryKey);
      setSettledQueryKey(queryKey);
    } catch (refreshError) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError(getErrorMessage(refreshError));

      setSettledQueryKey(queryKey);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }

      if (manualOperationRef.current === 'refresh') {
        manualOperationRef.current = null;
      }
    }
  }, [category, enabled, pageSize, queryKey, status]);

  const loadMore = useCallback(async () => {
    if (
      !enabled ||
      manualOperationRef.current !== null ||
      dataQueryKey !== queryKey ||
      !hasMore ||
      nextOffset === null
    ) {
      return;
    }

    manualOperationRef.current = 'more';

    const requestId = ++requestIdRef.current;

    setIsLoadingMore(true);

    try {
      const page = await getCommunityFeed({
        offset: nextOffset,
        limit: pageSize,
        category,
        status,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setItems(currentItems => {
        const existingIds = new Set(currentItems.map(item => item.id));

        const uniqueNewItems = page.items.filter(
          item => !existingIds.has(item.id),
        );

        return [...currentItems, ...uniqueNewItems];
      });

      setNextOffset(page.nextOffset);
      setHasMore(page.hasMore);

      setError(null);

      setDataQueryKey(queryKey);
      setSettledQueryKey(queryKey);
    } catch (loadMoreError) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError(getErrorMessage(loadMoreError));
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }

      if (manualOperationRef.current === 'more') {
        manualOperationRef.current = null;
      }
    }
  }, [
    category,
    dataQueryKey,
    enabled,
    hasMore,
    nextOffset,
    pageSize,
    queryKey,
    status,
  ]);

  /*
   * Retry uses the same safe first-page loading behavior
   * as pull-to-refresh.
   */
  const retry = refresh;

  /*
   * Old results remain internally cached, but they are never
   * exposed for a different filter/query.
   *
   * Example:
   *
   * Plumbing request running
   *       ↓
   * user selects Electrical
   *       ↓
   * old Plumbing response arrives
   *       ↓
   * request ID mismatch -> ignored
   */
  const hasCurrentData = enabled && dataQueryKey === queryKey;

  const currentQueryHasSettled = enabled && settledQueryKey === queryKey;

  const isLoading = enabled && !currentQueryHasSettled;

  return {
    items: hasCurrentData ? items : [],

    isLoading,

    isRefreshing: enabled && isRefreshing,

    isLoadingMore: enabled && isLoadingMore,

    error: currentQueryHasSettled ? error : null,

    hasMore: hasCurrentData ? hasMore : false,

    refresh,
    loadMore,
    retry,
  };
}
