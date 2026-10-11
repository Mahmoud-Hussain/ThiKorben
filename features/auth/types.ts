import type { Session, User } from '@supabase/supabase-js';

import type { Enums, Tables, TablesUpdate } from '@/types/database.types';

export type AppRole = Enums<'app_role'>;
export type WorkerVerificationStatus = Enums<'worker_verification_status'>;

export type AppProfile = Tables<'profiles'>;
export type CustomerProfileRecord = Tables<'customer_profiles'>;
export type WorkerProfileRecord = Tables<'worker_profiles'>;
export type UserRole = Tables<'user_roles'>;

export type AppProfileUpdate = TablesUpdate<'profiles'>;

export type PhoneOtpMode = 'login' | 'signup';

export interface AuthIdentity {
  session: Session;
  user: User;
  profile: AppProfile;
  roles: AppRole[];
  customerProfile: CustomerProfileRecord | null;
  workerProfile: WorkerProfileRecord | null;
}

export interface VerifiedPhoneSession {
  session: Session;
  user: User;
}

export interface UpdateMyProfileInput {
  displayName?: string;
  avatarPath?: string | null;
}

export interface RequestPhoneOtpInput {
  phone: string;
  mode: PhoneOtpMode;
  fullName?: string;
}

export interface VerifyPhoneOtpInput {
  phone: string;
  token: string;
}

export interface SaveCustomerProfileInput {
  displayName: string;
  homeLocation: string;
  emergencyContact?: string;
}

export interface SaveWorkerProfileInput {
  displayName: string;
  primaryTrade: string;
  experienceYears: number;
  preferredRateBdt: number;
  serviceRadiusKm: number;
}
