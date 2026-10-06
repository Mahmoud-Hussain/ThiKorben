import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/contexts/session-context';
import { useCommunityFeed } from '@/features/community/community.hooks';
import {
  toggleServiceRequestReaction,
} from '@/features/community/community.service';
import type {
  CommunityCategory,
  CommunityRequest,
} from '@/features/community/types';

const COLORS = {
  primary: '#15157d',
  orange: '#F7941D',
  orangeSoft: '#fff4e7',
  purpleSoft: '#eeedff',
  background: '#f7f6fb',
  card: '#ffffff',
  text: '#181820',
  muted: '#6c6c79',
  border: '#e6e3ed',
  green: '#178c4f',
  greenSoft: '#eaf8f0',
  red: '#c43d39',
};

const CATEGORIES: Array<{
  value?: CommunityCategory;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}> = [
  { label: 'All', icon: 'apps-outline' },
  { value: 'plumbing', label: 'Plumbing', icon: 'water-outline' },
  { value: 'electrical', label: 'Electrical', icon: 'flash-outline' },
  { value: 'carpentry', label: 'Carpentry', icon: 'hammer-outline' },
  { value: 'cleaning', label: 'Cleaning', icon: 'sparkles-outline' },
  { value: 'painting', label: 'Painting', icon: 'color-palette-outline' },
  { value: 'ac', label: 'AC', icon: 'snow-outline' },
];

function money(value: number, currency: string) {
  return `${currency === 'BDT' ? '৳' : currency + ' '}${Number(value).toLocaleString()}`;
}

function relativeTime(value: string) {
  const delta = Date.now() - new Date(value).getTime();
  const mins = Math.max(0, Math.floor(delta / 60000));

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function categoryLabel(category: string) {
  return CATEGORIES.find(item => item.value === category)?.label ?? category;
}

function RequestCard({
  item,
  ownRequest,
  onReact,
  reacting,
}: {
  item: CommunityRequest;
  ownRequest: boolean;
  onReact: () => void;
  reacting: boolean;
}) {
  const openDetails = () => {
    router.push({
      pathname: '/job-board',
      params: {
        mode: 'detail',
        requestId: item.id,
      },
    });
  };

  return (
    <Pressable onPress={openDetails} style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.categoryIcon}>
          <Ionicons
            name={
              item.category === 'plumbing'
                ? 'water-outline'
                : item.category === 'electrical'
                  ? 'flash-outline'
                  : item.category === 'carpentry'
                    ? 'hammer-outline'
                    : item.category === 'cleaning'
                      ? 'sparkles-outline'
                      : item.category === 'painting'
                        ? 'color-palette-outline'
                        : 'snow-outline'
            }
            size={21}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.cardTopText}>
          <View style={styles.metaLine}>
            <Text style={styles.categoryText}>
              {categoryLabel(item.category)}
            </Text>
            {ownRequest ? <Text style={styles.ownBadge}>YOUR REQUEST</Text> : null}
          </View>
          <Text style={styles.timeText}>{relativeTime(item.created_at)}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            item.status === 'open'
              ? styles.statusOpen
              : item.status === 'assigned'
                ? styles.statusAssigned
                : styles.statusOther,
          ]}
        >
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text numberOfLines={3} style={styles.description}>
        {item.description}
      </Text>

      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={15} color={COLORS.muted} />
          <Text numberOfLines={1} style={styles.detailText}>
            {item.location_label}
          </Text>
        </View>
        <View style={styles.budgetBadge}>
          <Text style={styles.budgetText}>
            {money(item.budget_amount, item.currency)}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Pressable
          onPress={event => {
            event.stopPropagation();
            onReact();
          }}
          disabled={reacting}
          style={styles.statButton}
        >
          {reacting ? (
            <ActivityIndicator size="small" color={COLORS.orange} />
          ) : (
            <Ionicons name="thumbs-up-outline" size={16} color={COLORS.orange} />
          )}
          <Text style={styles.statText}>{item.reaction_count}</Text>
        </Pressable>

        <View style={styles.statButton}>
          <Ionicons name="chatbubble-outline" size={16} color={COLORS.muted} />
          <Text style={styles.statText}>{item.comment_count}</Text>
        </View>

        <View style={styles.statButton}>
          <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
          <Text style={styles.statText}>{item.proposal_count} proposals</Text>
        </View>

        <View style={styles.openLink}>
          <Text style={styles.openLinkText}>Open</Text>
          <Ionicons name="arrow-forward" size={15} color={COLORS.primary} />
        </View>
      </View>
    </Pressable>
  );
}

export default function CommunityScreen() {
  const { role, user } = useSession();
  const [category, setCategory] = useState<CommunityCategory | undefined>();
  const [reactingId, setReactingId] = useState<string | null>(null);

  const {
    items,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
    retry,
  } = useCommunityFeed({
    category,
    status: 'open',
    pageSize: 12,
  });

  const subtitle = useMemo(
    () =>
      role === 'worker'
        ? 'Browse real service requests and submit proposals.'
        : 'Post a service need and compare worker proposals.',
    [role],
  );

  const handleReaction = async (requestId: string) => {
    if (reactingId) {
      return;
    }

    setReactingId(requestId);

    try {
      await toggleServiceRequestReaction(requestId);
      await refresh();
    } finally {
      setReactingId(null);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.shell}>
          <View style={styles.header}>
            <Pressable
              style={styles.headerButton}
              onPress={() =>
                router.replace(
                  role === 'worker' ? '/worker-dashboard' : '/customer-dashboard',
                )
              }
            >
              <Ionicons name="arrow-back" size={21} color={COLORS.text} />
            </Pressable>

            <View style={styles.headerTitleWrap}>
              <Text style={styles.brand}>ThiKorben Community</Text>
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            </View>

            {role === 'customer' ? (
              <Pressable
                style={styles.createButton}
                onPress={() =>
                  router.push({
                    pathname: '/job-board',
                    params: { mode: 'create' },
                  })
                }
              >
                <Ionicons name="add" size={19} color="#fff" />
              </Pressable>
            ) : (
              <View style={styles.headerButton} />
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {CATEGORIES.map(item => {
              const selected = item.value === category;

              return (
                <Pressable
                  key={item.label}
                  style={[styles.filter, selected && styles.filterActive]}
                  onPress={() => setCategory(item.value)}
                >
                  <Ionicons
                    name={item.icon}
                    size={15}
                    color={selected ? '#fff' : COLORS.primary}
                  />
                  <Text
                    style={[
                      styles.filterText,
                      selected && styles.filterTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.centerText}>Loading service requests…</Text>
            </View>
          ) : error ? (
            <View style={styles.centerState}>
              <Ionicons name="cloud-offline-outline" size={34} color={COLORS.red} />
              <Text style={styles.errorTitle}>Could not load community</Text>
              <Text style={styles.centerText}>{error}</Text>
              <Pressable style={styles.retryButton} onPress={() => void retry()}>
                <Text style={styles.retryText}>Try Again</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView
              style={styles.feed}
              contentContainerStyle={styles.feedContent}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={() => void refresh()}
                  tintColor={COLORS.primary}
                />
              }
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.hero}>
                <View style={styles.heroIcon}>
                  <Ionicons
                    name={role === 'worker' ? 'construct' : 'people'}
                    size={25}
                    color="#fff"
                  />
                </View>
                <View style={styles.heroTextWrap}>
                  <Text style={styles.heroTitle}>
                    {role === 'worker'
                      ? 'Find work that matches your skills'
                      : 'Get help from the right local professional'}
                  </Text>
                  <Text style={styles.heroText}>{subtitle}</Text>
                </View>
              </View>

              {items.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="file-tray-outline" size={34} color={COLORS.muted} />
                  <Text style={styles.emptyTitle}>No open requests found</Text>
                  <Text style={styles.emptyText}>
                    {role === 'customer'
                      ? 'Create the first request in this category.'
                      : 'Try another category or refresh the feed.'}
                  </Text>
                </View>
              ) : (
                items.map(item => (
                  <RequestCard
                    key={item.id}
                    item={item}
                    ownRequest={item.customer_id === user?.id}
                    reacting={reactingId === item.id}
                    onReact={() => void handleReaction(item.id)}
                  />
                ))
              )}

              {hasMore ? (
                <Pressable
                  style={styles.loadMore}
                  disabled={isLoadingMore}
                  onPress={() => void loadMore()}
                >
                  {isLoadingMore ? (
                    <ActivityIndicator color={COLORS.primary} />
                  ) : (
                    <Text style={styles.loadMoreText}>Load More</Text>
                  )}
                </Pressable>
              ) : null}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ecebf2' },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    minHeight: 66,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#fff',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: { flex: 1 },
  brand: { fontSize: 16, fontWeight: '900', color: COLORS.primary },
  headerSubtitle: { marginTop: 2, fontSize: 10.5, color: COLORS.muted },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.orange,
  },
  filters: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 7,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#fff',
  },
  filter: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  filterActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  filterText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  filterTextActive: { color: '#fff' },
  feed: { flex: 1 },
  feedContent: { padding: 14, gap: 12, paddingBottom: 50 },
  hero: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  heroTextWrap: { flex: 1 },
  heroTitle: { fontSize: 15, fontWeight: '900', color: '#fff' },
  heroText: { marginTop: 4, fontSize: 11, lineHeight: 16, color: '#d9d8ff' },
  card: {
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    backgroundColor: COLORS.card,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.purpleSoft,
  },
  cardTopText: { flex: 1 },
  metaLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryText: { fontSize: 11, fontWeight: '900', color: COLORS.primary },
  ownBadge: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.orange,
  },
  timeText: { marginTop: 2, fontSize: 9.5, color: COLORS.muted },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusOpen: { backgroundColor: COLORS.greenSoft },
  statusAssigned: { backgroundColor: COLORS.purpleSoft },
  statusOther: { backgroundColor: COLORS.orangeSoft },
  statusText: { fontSize: 8, fontWeight: '900', color: COLORS.text },
  title: { marginTop: 13, fontSize: 15, fontWeight: '900', color: COLORS.text },
  description: {
    marginTop: 6,
    fontSize: 11.5,
    lineHeight: 18,
    color: COLORS.muted,
  },
  detailRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailText: { flex: 1, fontSize: 10.5, color: COLORS.muted },
  budgetBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: COLORS.orangeSoft,
  },
  budgetText: { fontSize: 11, fontWeight: '900', color: COLORS.orange },
  stats: {
    marginTop: 13,
    paddingTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 10, color: COLORS.muted },
  openLink: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 3 },
  openLinkText: { fontSize: 10, fontWeight: '900', color: COLORS.primary },
  centerState: {
    flex: 1,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    marginTop: 9,
    maxWidth: 320,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
  },
  errorTitle: { marginTop: 10, fontSize: 15, fontWeight: '900', color: COLORS.text },
  retryButton: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
  },
  retryText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  emptyTitle: { marginTop: 8, fontSize: 13, fontWeight: '900', color: COLORS.text },
  emptyText: { marginTop: 4, fontSize: 10.5, color: COLORS.muted, textAlign: 'center' },
  loadMore: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: COLORS.purpleSoft,
  },
  loadMoreText: { fontSize: 11, fontWeight: '900', color: COLORS.primary },
});
