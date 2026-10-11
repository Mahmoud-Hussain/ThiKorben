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

import { PRESENTATION_MODE } from '@/lib/presentation-mode';
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
  startPresentationSession: (
    phone: string,
    displayName?: string,
  ) => Promise<void>;
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

const PRESENTATION_USER_ID = '00000000-0000-4000-8000-000000000001';

function createPresentationIdentity(
  phone: string,
  displayName?: string,
): AuthIdentity {
  const now = new Date().toISOString();
  const safeName = displayName?.trim() || 'Demo User';

  const user = {
    id: PRESENTATION_USER_ID,
    aud: 'authenticated',
    role: 'authenticated',
    phone,
    app_metadata: {
      provider: 'phone',
      providers: ['phone'],
    },
    user_metadata: {
      full_name: safeName,
    },
    identities: [],
    created_at: now,
    updated_at: now,
  } as User;

  const session = {
    access_token: 'presentation-mode',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'presentation-mode',
    user,
  } as Session;

  return {
    session,
    user,
    profile: {
      id: PRESENTATION_USER_ID,
      active_role: 'customer',
      avatar_path: null,
      created_at: now,
      display_name: safeName,
      updated_at: now,
    },
    roles: ['customer', 'worker'],
    customerProfile: {
      completed_at: now,
      created_at: now,
      emergency_contact: null,
      home_location: 'Dhaka',
      updated_at: now,
      user_id: PRESENTATION_USER_ID,
    },
    workerProfile: {
      completed_at: now,
      created_at: now,
      experience_years: 3,
      preferred_rate_bdt: 800,
      primary_trade: 'plumber',
      service_radius_km: 10,
      updated_at: now,
      user_id: PRESENTATION_USER_ID,
      verification_status: 'verified',
    },
  };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    status: PRESENTATION_MODE ? 'anonymous' : 'loading',
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
    if (PRESENTATION_MODE) {
      return;
    }

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
    if (PRESENTATION_MODE) {
      return;
    }

    const requestId = ++authRequestIdRef.current;

    await hydrateAuthenticatedUser(requestId);
  }, [hydrateAuthenticatedUser]);

  const startPresentationSession = useCallback(
    async (phone: string, displayName?: string) => {
      if (!PRESENTATION_MODE) {
        throw new Error('Presentation mode is not enabled.');
      }

      authRequestIdRef.current += 1;

      setAuthState({
        status: 'authenticated',
        identity: createPresentationIdentity(phone, displayName),
        error: null,
      });
    },
    [],
  );

  const registerWorker = useCallback(async () => {
    if (PRESENTATION_MODE) {
      setAuthState(current => {
        if (!current.identity) {
          return current;
        }

        const roles = current.identity.roles.includes('worker')
          ? current.identity.roles
          : [...current.identity.roles, 'worker' as AppRole];

        return {
          status: 'authenticated',
          identity: {
            ...current.identity,
            roles,
            profile: {
              ...current.identity.profile,
              active_role: 'worker',
              updated_at: new Date().toISOString(),
            },
          },
          error: null,
        };
      });

      return;
    }

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

      if (PRESENTATION_MODE) {
        setAuthState(current => {
          if (!current.identity) {
            return current;
          }

          const roles = current.identity.roles.includes(nextRole)
            ? current.identity.roles
            : [...current.identity.roles, nextRole];

          return {
            status: 'authenticated',
            identity: {
              ...current.identity,
              roles,
              profile: {
                ...current.identity.profile,
                active_role: nextRole,
                updated_at: new Date().toISOString(),
              },
            },
            error: null,
          };
        });

        return;
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
      if (PRESENTATION_MODE) {
        const identity = authState.identity;

        if (!identity) {
          throw new Error('Authentication required.');
        }

        const profile: AppProfile = {
          ...identity.profile,
          ...(input.displayName !== undefined
            ? {
                display_name:
                  input.displayName.trim() || identity.profile.display_name,
              }
            : {}),
          ...(input.avatarPath !== undefined
            ? {
                avatar_path: input.avatarPath,
              }
            : {}),
          updated_at: new Date().toISOString(),
        };

        setAuthState(current =>
          current.identity
            ? {
                status: 'authenticated',
                identity: {
                  ...current.identity,
                  profile,
                },
                error: null,
              }
            : current,
        );

        return profile;
      }

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
    [authState.identity],
  );

  const saveCustomerProfile = useCallback(
    async (input: SaveCustomerProfileInput) => {
      if (PRESENTATION_MODE) {
        const identity = authState.identity;

        if (!identity) {
          throw new Error('Authentication required.');
        }

        const now = new Date().toISOString();
        const customerProfile: CustomerProfileRecord = {
          completed_at: now,
          created_at: identity.customerProfile?.created_at ?? now,
          emergency_contact: input.emergencyContact?.trim() || null,
          home_location: input.homeLocation.trim() || 'Dhaka',
          updated_at: now,
          user_id: identity.user.id,
        };
        const profile: AppProfile = {
          ...identity.profile,
          display_name:
            input.displayName.trim() || identity.profile.display_name,
          active_role: 'customer',
          updated_at: now,
        };

        setAuthState(current =>
          current.identity
            ? {
                status: 'authenticated',
                identity: {
                  ...current.identity,
                  profile,
                  customerProfile,
                },
                error: null,
              }
            : current,
        );

        return customerProfile;
      }

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
    [authState.identity],
  );

  const saveWorkerProfile = useCallback(
    async (input: SaveWorkerProfileInput) => {
      if (PRESENTATION_MODE) {
        const identity = authState.identity;

        if (!identity) {
          throw new Error('Authentication required.');
        }

        const now = new Date().toISOString();
        const workerProfile: WorkerProfileRecord = {
          completed_at: now,
          created_at: identity.workerProfile?.created_at ?? now,
          experience_years: Number.isFinite(input.experienceYears)
            ? input.experienceYears
            : 0,
          preferred_rate_bdt: Number.isFinite(input.preferredRateBdt)
            ? input.preferredRateBdt
            : 0,
          primary_trade: input.primaryTrade.trim() || 'plumber',
          service_radius_km: Number.isFinite(input.serviceRadiusKm)
            ? input.serviceRadiusKm
            : 5,
          updated_at: now,
          user_id: identity.user.id,
          verification_status:
            identity.workerProfile?.verification_status ?? 'verified',
        };
        const profile: AppProfile = {
          ...identity.profile,
          display_name:
            input.displayName.trim() || identity.profile.display_name,
          active_role: 'worker',
          updated_at: now,
        };

        setAuthState(current =>
          current.identity
            ? {
                status: 'authenticated',
                identity: {
                  ...current.identity,
                  profile,
                  workerProfile,
                  roles: current.identity.roles.includes('worker')
                    ? current.identity.roles
                    : [...current.identity.roles, 'worker'],
                },
                error: null,
              }
            : current,
        );

        return workerProfile;
      }

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
    [authState.identity],
  );

  const logout = useCallback(async () => {
    authRequestIdRef.current += 1;

    if (!PRESENTATION_MODE) {
      await logoutCurrentDevice();
    }

    setAuthState({
      status: 'anonymous',
      identity: null,
      error: null,
    });

    setLogoutModalVisible(false);
  }, []);

  const logoutEverywhere = useCallback(async () => {
    authRequestIdRef.current += 1;

    if (!PRESENTATION_MODE) {
      await logoutAllDevices();
    }

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
      startPresentationSession,
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
      startPresentationSession,
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
