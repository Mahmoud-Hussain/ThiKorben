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
  saveCustomerProfile as saveCustomerProfileService,
  saveWorkerProfile as saveWorkerProfileService,
  switchActiveRole,
  updateMyProfile,
} from '@/features/auth/auth.service';

import type {
  AppProfile,
  AppRole,
  AuthIdentity,
  CustomerProfileRecord,
  SaveCustomerProfileInput,
  SaveWorkerProfileInput,
  UpdateMyProfileInput,
  WorkerProfileRecord,
} from '@/features/auth/types';

import { supabase } from '@/lib/supabase';

export type { AppRole };

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
  customerProfile: CustomerProfileRecord | null;
  workerProfile: WorkerProfileRecord | null;
  authError: string | null;
  refreshAuth: () => Promise<void>;
  setRole: (role: AppRole | null) => Promise<void>;
  registerWorker: () => Promise<void>;
  updatePublicProfile: (input: UpdateMyProfileInput) => Promise<AppProfile>;
  saveCustomerProfile: (
    input: SaveCustomerProfileInput,
  ) => Promise<CustomerProfileRecord>;
  saveWorkerProfile: (
    input: SaveWorkerProfileInput,
  ) => Promise<WorkerProfileRecord>;
  logout: () => Promise<void>;
  logoutEverywhere: () => Promise<void>;
  clearSession: () => Promise<void>;
  isLogoutModalVisible: boolean;
  setLogoutModalVisible: (visible: boolean) => void;
}

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

  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
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

      if (event === 'SIGNED_OUT' || !session) {
        authRequestIdRef.current += 1;

        setAuthState({
          status: 'anonymous',
          identity: null,
          error: null,
        });

        return;
      }

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

      return profile;
    },
    [],
  );

  const saveCustomerProfile = useCallback(
    async (input: SaveCustomerProfileInput) => {
      const result = await saveCustomerProfileService(input);

      setAuthState(current => {
        if (!current.identity) {
          return current;
        }

        return {
          status: 'authenticated',
          identity: {
            ...current.identity,
            profile: result.profile,
            customerProfile: result.customerProfile,
          },
          error: null,
        };
      });

      return result.customerProfile;
    },
    [],
  );

  const saveWorkerProfile = useCallback(
    async (input: SaveWorkerProfileInput) => {
      const result = await saveWorkerProfileService(input);

      setAuthState(current => {
        if (!current.identity) {
          return current;
        }

        return {
          status: 'authenticated',
          identity: {
            ...current.identity,
            profile: result.profile,
            workerProfile: result.workerProfile,
          },
          error: null,
        };
      });

      return result.workerProfile;
    },
    [],
  );

  const logout = useCallback(async () => {
    authRequestIdRef.current += 1;

    await logoutCurrentDevice();

    setAuthState({
      status: 'anonymous',
      identity: null,
      error: null,
    });

    setLogoutModalVisible(false);
  }, []);

  const logoutEverywhere = useCallback(async () => {
    authRequestIdRef.current += 1;

    await logoutAllDevices();

    setAuthState({
      status: 'anonymous',
      identity: null,
      error: null,
    });

    setLogoutModalVisible(false);
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
      customerProfile: identity?.customerProfile ?? null,
      workerProfile: identity?.workerProfile ?? null,
      authError: authState.error,
      refreshAuth,
      setRole,
      registerWorker,
      updatePublicProfile,
      saveCustomerProfile,
      saveWorkerProfile,
      logout,
      logoutEverywhere,
      clearSession: logout,
      isLogoutModalVisible,
      setLogoutModalVisible,
    }),
    [
      authState.error,
      authState.status,
      identity,
      isLogoutModalVisible,
      logout,
      logoutEverywhere,
      refreshAuth,
      registerWorker,
      saveCustomerProfile,
      saveWorkerProfile,
      setRole,
      updatePublicProfile,
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
