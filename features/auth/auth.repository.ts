import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

import type {
  AppProfile,
  AppProfileUpdate,
  AppRole,
  UserRole,
  VerifiedPhoneSession,
} from './types';

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}

export async function requestPhoneOtp(
  phone: string,
  options: {
    shouldCreateUser: boolean;
    fullName?: string;
  },
): Promise<void> {
  const fullName = options.fullName?.trim();

  const { error } = await supabase.auth.signInWithOtp({
    phone,

    options: {
      channel: 'sms',

      shouldCreateUser: options.shouldCreateUser,

      ...(fullName
        ? {
            data: {
              full_name: fullName,
            },
          }
        : {}),
    },
  });

  if (error) {
    throw error;
  }
}

export async function verifyPhoneOtp(
  phone: string,
  token: string,
): Promise<VerifiedPhoneSession> {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });

  if (error) {
    throw error;
  }

  if (!data.session || !data.user) {
    throw new Error(
      'Phone verification did not create an authenticated session.',
    );
  }

  return {
    session: data.session,

    user: data.user,
  };
}

export async function getProfile(userId: string): Promise<AppProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getUserRoles(userId: string): Promise<UserRole[]> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function updateProfile(
  userId: string,
  input: AppProfileUpdate,
): Promise<AppProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(input)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function registerWorkerRole(): Promise<AppRole> {
  const { data, error } = await supabase.rpc('register_worker_role');

  if (error) {
    throw error;
  }

  return data;
}

export async function setActiveRole(role: AppRole): Promise<AppRole> {
  const { data, error } = await supabase.rpc('set_active_role', {
    p_role: role,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOutCurrentDevice(): Promise<void> {
  const { error } = await supabase.auth.signOut({
    scope: 'local',
  });

  if (error) {
    throw error;
  }
}

export async function signOutAllDevices(): Promise<void> {
  const { error } = await supabase.auth.signOut({
    scope: 'global',
  });

  if (error) {
    throw error;
  }
}
