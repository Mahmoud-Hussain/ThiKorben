import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

import type {
  AppProfile,
  AppProfileUpdate,
  AppRole,
  CustomerProfileRecord,
  UserRole,
  VerifiedPhoneSession,
  WorkerProfileRecord,
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

export async function signInPresentationUser(
  fullName?: string,
  phoneDisplay?: string,
): Promise<VerifiedPhoneSession> {
  const { data, error } = await supabase.auth.signInAnonymously({
    options: {
      data: {
        full_name: fullName?.trim() || 'ThiKorben User',
        phone_display: phoneDisplay?.trim() || null,
        presentation_mode: true,
      },
    },
  });

  if (error) {
    throw error;
  }

  if (!data.session || !data.user) {
    throw new Error('Presentation session could not be created.');
  }

  return {
    session: data.session,
    user: data.user,
  };
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

export async function getCustomerProfile(
  userId: string,
): Promise<CustomerProfileRecord | null> {
  const { data, error } = await supabase
    .from('customer_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getWorkerProfile(
  userId: string,
): Promise<WorkerProfileRecord | null> {
  const { data, error } = await supabase
    .from('worker_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

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

export async function saveCustomerProfile(input: {
  displayName: string;
  homeLocation: string;
  emergencyContact: string | null;
}): Promise<CustomerProfileRecord> {
  const { data, error } = await supabase.rpc('save_customer_profile', {
    p_display_name: input.displayName,
    p_home_location: input.homeLocation,
    p_emergency_contact: input.emergencyContact,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Customer profile was not saved.');
  }

  return data;
}

export async function saveWorkerProfile(input: {
  displayName: string;
  primaryTrade: string;
  experienceYears: number;
  preferredRateBdt: number;
  serviceRadiusKm: number;
}): Promise<WorkerProfileRecord> {
  const { data, error } = await supabase.rpc('save_worker_profile', {
    p_display_name: input.displayName,
    p_primary_trade: input.primaryTrade,
    p_experience_years: input.experienceYears,
    p_preferred_rate_bdt: input.preferredRateBdt,
    p_service_radius_km: input.serviceRadiusKm,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Worker profile was not saved.');
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
