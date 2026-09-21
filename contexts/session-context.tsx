import type { Session, User } from '@supabase/supabase-js';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  getAuthIdentity,
  logoutAllDevices,
  logoutCurrentDevice,
  registerAsWorker,
  switchActiveRole,
  updateMyProfile,
} from '@/features/auth/auth.service';

import type {
  AppProfile,
  AppRole,
  AuthIdentity,
  UpdateMyProfileInput,
} from '@/features/auth/types';

import { supabase } from '@/lib/supabase';

export type { AppRole };

export interface CustomerProfile {
  name: string;
  phone: string;
  location: string;
  emergencyContact: string;
  avatar?: string | null;
}

export interface WorkerProfile {
  name: string;
  phone: string;
  trade: string;
  experience: string;
  desiredRate: string;
  serviceRadius: number;
  avatar?: string | null;
}

type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'error';

interface AuthState {
  status: AuthStatus;
  identity: AuthIdentity | null;
  error: string | null;
}

interface SessionContextValue {
  status: AuthStatus;

  isBootstrapping: boolean;
  isAuthenticated: boolean;

  session: Session | null;
  user: User | null;

  profile: AppProfile | null;
  roles: AppRole[];

  role: AppRole | null;

  authError: string | null;

  refreshAuth: () => Promise<void>;

  setRole: (role: AppRole | null) => Promise<void>;

  registerWorker: () => Promise<void>;

  updatePublicProfile: (input: UpdateMyProfileInput) => Promise<AppProfile>;

  logout: () => Promise<void>;

  logoutEverywhere: () => Promise<void>;

  customerProfile: CustomerProfile;

  setCustomerProfile: React.Dispatch<React.SetStateAction<CustomerProfile>>;

  updateCustomerProfile: (updates: Partial<CustomerProfile>) => void;

  workerProfile: WorkerProfile;

  setWorkerProfile: React.Dispatch<React.SetStateAction<WorkerProfile>>;

  updateWorkerProfile: (updates: Partial<WorkerProfile>) => void;

  clearSession: () => Promise<void>;

  isLogoutModalVisible: boolean;

  setLogoutModalVisible: (visible: boolean) => void;
}

const EMPTY_CUSTOMER_PROFILE: CustomerProfile = {
  name: '',
  phone: '',
  location: '',
  emergencyContact: '',
  avatar: null,
};

const EMPTY_WORKER_PROFILE: WorkerProfile = {
  name: '',
  phone: '',
  trade: '',
  experience: '',
  desiredRate: '',
  serviceRadius: 5,
  avatar: null,
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Authentication operation failed.';
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    status: 'loading',
    identity: null,
    error: null,
  });

  /*
   * These temporary UI models are kept for compatibility
   * with the existing profile screens.
   *
   * They are NOT the authorization source of truth.
   *
   * Authentication and role authorization come exclusively
   * from Supabase Auth + profiles + user_roles.
   */
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(
    EMPTY_CUSTOMER_PROFILE,
  );

  const [workerProfile, setWorkerProfile] =
    useState<WorkerProfile>(EMPTY_WORKER_PROFILE);

  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

  /*
   * Prevent an older authentication request from replacing
   * newer session state.
   *
   * Example:
   *
   * session A hydration starts
   *        ↓
   * user logs out
   *        ↓
   * old session A request finishes
   *        ↓
   * ignored
   */
  const authRequestIdRef = useRef(0);

  const applyIdentity = useCallback(
    (identity: AuthIdentity | null, requestId?: number) => {
      if (requestId !== undefined && requestId !== authRequestIdRef.current) {
        return;
      }

      if (!identity) {
        setAuthState({
          status: 'anonymous',
          identity: null,
          error: null,
        });

        return;
      }

      setAuthState({
        status: 'authenticated',
        identity,
        error: null,
      });

      /*
       * Keep legacy profile screens visually aligned with
       * the authenticated public profile while they are being
       * migrated to their dedicated database-backed models.
       */
      setCustomerProfile(current => ({
        ...current,
        name: identity.profile.display_name || current.name,
        avatar: identity.profile.avatar_path ?? current.avatar,
      }));

      setWorkerProfile(current => ({
        ...current,
        name: identity.profile.display_name || current.name,
        avatar: identity.profile.avatar_path ?? current.avatar,
      }));
    },
    [],
  );

  const hydrateAuthenticatedUser = useCallback(
    async (requestId: number) => {
      try {
        const identity = await getAuthIdentity();

        applyIdentity(identity, requestId);
      } catch (error) {
        if (requestId !== authRequestIdRef.current) {
          return;
        }

        setAuthState(current => ({
          status: current.identity ? 'authenticated' : 'error',

          identity: current.identity,

          error: getErrorMessage(error),
        }));
      }
    },
    [applyIdentity],
  );

  useEffect(() => {
    let isActive = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isActive) {
        return;
      }

      /*
       * SIGNED_OUT must invalidate every in-flight
       * identity request immediately.
       */
      if (event === 'SIGNED_OUT' || !session) {
        authRequestIdRef.current += 1;

        setAuthState({
          status: 'anonymous',
          identity: null,
          error: null,
        });

        return;
      }

      /*
       * Token refresh does not require another profile
       * database round trip when identity is already
       * hydrated.
       */
      if (event === 'TOKEN_REFRESHED') {
        setAuthState(current => {
          if (!current.identity) {
            return current;
          }

          return {
            ...current,

            identity: {
              ...current.identity,
              session,
              user: session.user,
            },
          };
        });

        return;
      }

      const requestId = ++authRequestIdRef.current;

      /*
       * Supabase recommends keeping the auth callback
       * lightweight. Hydration is deferred outside the
       * callback's synchronous execution.
       */
      setTimeout(() => {
        if (!isActive || requestId !== authRequestIdRef.current) {
          return;
        }

        void hydrateAuthenticatedUser(requestId);
      }, 0);
    });

    return () => {
      isActive = false;

      authRequestIdRef.current += 1;

      subscription.unsubscribe();
    };
  }, [hydrateAuthenticatedUser]);

  const refreshAuth = useCallback(async () => {
    const requestId = ++authRequestIdRef.current;

    await hydrateAuthenticatedUser(requestId);
  }, [hydrateAuthenticatedUser]);

  const registerWorker = useCallback(async () => {
    const result = await registerAsWorker();

    setAuthState(current => {
      if (!current.identity) {
        return current;
      }

      return {
        status: 'authenticated',

        identity: {
          ...current.identity,

          profile: result.profile,

          roles: result.roles,
        },

        error: null,
      };
    });
  }, []);

  const setRole = useCallback(
    async (nextRole: AppRole | null) => {
      if (nextRole === null) {
        return;
      }

      const identity = authState.identity;

      if (!identity) {
        throw new Error('Authentication required.');
      }

      /*
       * A customer choosing Worker for the first time
       * receives the worker capability through the
       * controlled database RPC.
       */
      if (nextRole === 'worker' && !identity.roles.includes('worker')) {
        const result = await registerAsWorker();

        setAuthState(current => {
          if (!current.identity) {
            return current;
          }

          return {
            status: 'authenticated',

            identity: {
              ...current.identity,

              profile: result.profile,

              roles: result.roles,
            },

            error: null,
          };
        });

        return;
      }

      const profile = await switchActiveRole(nextRole);

      setAuthState(current => {
        if (!current.identity) {
          return current;
        }

        return {
          status: 'authenticated',

          identity: {
            ...current.identity,
            profile,
          },

          error: null,
        };
      });
    },
    [authState.identity],
  );

  const updatePublicProfile = useCallback(
    async (input: UpdateMyProfileInput) => {
      const profile = await updateMyProfile(input);

      setAuthState(current => {
        if (!current.identity) {
          return current;
        }

        return {
          status: 'authenticated',

          identity: {
            ...current.identity,
            profile,
          },

          error: null,
        };
      });

      setCustomerProfile(current => ({
        ...current,

        name: profile.display_name,

        avatar: profile.avatar_path,
      }));

      setWorkerProfile(current => ({
        ...current,

        name: profile.display_name,

        avatar: profile.avatar_path,
      }));

      return profile;
    },
    [],
  );

  const resetLocalUiState = useCallback(() => {
    setCustomerProfile(EMPTY_CUSTOMER_PROFILE);

    setWorkerProfile(EMPTY_WORKER_PROFILE);

    setLogoutModalVisible(false);
  }, []);

  const logout = useCallback(async () => {
    authRequestIdRef.current += 1;

    await logoutCurrentDevice();

    setAuthState({
      status: 'anonymous',
      identity: null,
      error: null,
    });

    resetLocalUiState();
  }, [resetLocalUiState]);

  const logoutEverywhere = useCallback(async () => {
    authRequestIdRef.current += 1;

    await logoutAllDevices();

    setAuthState({
      status: 'anonymous',
      identity: null,
      error: null,
    });

    resetLocalUiState();
  }, [resetLocalUiState]);

  const clearSession = logout;

  const updateCustomerProfile = useCallback(
    (updates: Partial<CustomerProfile>) => {
      setCustomerProfile(current => ({
        ...current,
        ...updates,
      }));
    },
    [],
  );

  const updateWorkerProfile = useCallback((updates: Partial<WorkerProfile>) => {
    setWorkerProfile(current => ({
      ...current,
      ...updates,
    }));
  }, []);

  const identity = authState.identity;

  const value = useMemo<SessionContextValue>(
    () => ({
      status: authState.status,

      isBootstrapping: authState.status === 'loading',

      isAuthenticated: authState.status === 'authenticated',

      session: identity?.session ?? null,

      user: identity?.user ?? null,

      profile: identity?.profile ?? null,

      roles: identity?.roles ?? [],

      role: identity?.profile.active_role ?? null,

      authError: authState.error,

      refreshAuth,

      setRole,

      registerWorker,

      updatePublicProfile,

      logout,

      logoutEverywhere,

      customerProfile,

      setCustomerProfile,

      updateCustomerProfile,

      workerProfile,

      setWorkerProfile,

      updateWorkerProfile,

      clearSession,

      isLogoutModalVisible,

      setLogoutModalVisible,
    }),
    [
      authState.error,
      authState.status,
      clearSession,
      customerProfile,
      identity,
      isLogoutModalVisible,
      logout,
      logoutEverywhere,
      refreshAuth,
      registerWorker,
      setRole,
      updateCustomerProfile,
      updatePublicProfile,
      updateWorkerProfile,
      workerProfile,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used within a SessionProvider.');
  }

  return context;
}
