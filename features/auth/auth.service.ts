import * as authRepository from './auth.repository';

import {
  normalizeBangladeshPhone,
  normalizePhoneOtp,
} from './phone';

import type {
  AppProfile,
  AppProfileUpdate,
  AppRole,
  AuthIdentity,
  CustomerProfileRecord,
  RequestPhoneOtpInput,
  SaveCustomerProfileInput,
  SaveWorkerProfileInput,
  UpdateMyProfileInput,
  VerifiedPhoneSession,
  VerifyPhoneOtpInput,
  WorkerProfileRecord,
} from './types';

export const PRESENTATION_OTP = '246810';

export function isPresentationAuthEnabled() {
  return process.env.EXPO_PUBLIC_PRESENTATION_AUTH !== 'false';
}

const WORKER_TRADES = new Set([
  'plumber',
  'electrician',
  'carpenter',
  'cleaner',
  'painter',
  'ac_technician',
]);

function normalizeDisplayName(value: string) {
  const normalized = value.trim();

  if (normalized.length < 2) {
    throw new Error('Display name must contain at least 2 characters.');
  }

  if (normalized.length > 100) {
    throw new Error('Display name cannot exceed 100 characters.');
  }

  return normalized;
}

function normalizeAvatarPath(value: string | null) {
  if (value === null) {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length > 512) {
    throw new Error('Avatar path cannot exceed 512 characters.');
  }

  return normalized;
}

function normalizeLocation(value: string) {
  const normalized = value.trim();

  if (normalized.length < 2) {
    throw new Error('Home location is required.');
  }

  if (normalized.length > 160) {
    throw new Error('Home location cannot exceed 160 characters.');
  }

  return normalized;
}

function normalizeOptionalEmergencyContact(value?: string) {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  return normalizeBangladeshPhone(normalized);
}

function normalizeWorkerTrade(value: string) {
  const normalized = value.trim().toLowerCase();

  if (!WORKER_TRADES.has(normalized)) {
    throw new Error('Select a supported primary trade.');
  }

  return normalized;
}

function normalizeExperienceYears(value: number) {
  if (!Number.isInteger(value) || value < 0 || value > 60) {
    throw new Error('Experience must be a whole number between 0 and 60.');
  }

  return value;
}

function normalizePreferredRate(value: number) {
  if (!Number.isFinite(value) || value <= 0 || value > 10000000) {
    throw new Error('Enter a valid preferred rate.');
  }

  return Math.round(value * 100) / 100;
}

function normalizeServiceRadius(value: number) {
  if (!Number.isInteger(value) || value < 1 || value > 50) {
    throw new Error('Service radius must be between 1 and 50 km.');
  }

  return value;
}

function requireUserId(userId: string) {
  const normalized = userId.trim();

  if (!normalized) {
    throw new Error('User ID is required.');
  }

  return normalized;
}

export async function requestPhoneOtp(
  input: RequestPhoneOtpInput,
): Promise<string> {
  const phone = normalizeBangladeshPhone(input.phone);

  if (isPresentationAuthEnabled()) {
    if (input.mode === 'signup') {
      normalizeDisplayName(input.fullName ?? '');
    }

    return phone;
  }

  if (input.mode === 'login') {
    await authRepository.requestPhoneOtp(phone, {
      shouldCreateUser: false,
    });

    return phone;
  }

  const fullName = normalizeDisplayName(input.fullName ?? '');

  await authRepository.requestPhoneOtp(phone, {
    shouldCreateUser: true,
    fullName,
  });

  return phone;
}

export async function resendPhoneOtp(
  input: RequestPhoneOtpInput,
): Promise<string> {
  return requestPhoneOtp(input);
}

export async function verifyPhoneOtp(
  input: VerifyPhoneOtpInput,
): Promise<VerifiedPhoneSession> {
  const phone = normalizeBangladeshPhone(input.phone);
  const token = normalizePhoneOtp(input.token);

  if (isPresentationAuthEnabled()) {
    if (token !== PRESENTATION_OTP) {
      throw new Error('Invalid presentation verification code.');
    }

    return authRepository.signInPresentationUser(
      input.fullName,
      phone,
    );
  }

  return authRepository.verifyPhoneOtp(phone, token);
}

export async function getAuthIdentity(): Promise<AuthIdentity | null> {
  const session = await authRepository.getCurrentSession();

  if (!session) {
    return null;
  }

  const user = await authRepository.getCurrentUser();

  if (!user) {
    return null;
  }

  const userId = requireUserId(user.id);

  const [profile, roleRows, customerProfile, workerProfile] = await Promise.all([
    authRepository.getProfile(userId),
    authRepository.getUserRoles(userId),
    authRepository.getCustomerProfile(userId),
    authRepository.getWorkerProfile(userId),
  ]);

  const roles = roleRows.map(row => row.role);

  if (roles.length === 0) {
    throw new Error('Authenticated user has no application role.');
  }

  if (!roles.includes(profile.active_role)) {
    throw new Error('Active role is not available for this user.');
  }

  return {
    session,
    user,
    profile,
    roles,
    customerProfile,
    workerProfile,
  };
}

export async function getMyProfile(): Promise<AppProfile> {
  const user = await authRepository.getCurrentUser();

  if (!user) {
    throw new Error('Authentication required.');
  }

  return authRepository.getProfile(requireUserId(user.id));
}

export async function updateMyProfile(
  input: UpdateMyProfileInput,
): Promise<AppProfile> {
  const user = await authRepository.getCurrentUser();

  if (!user) {
    throw new Error('Authentication required.');
  }

  const changes: AppProfileUpdate = {};

  if (input.displayName !== undefined) {
    changes.display_name = normalizeDisplayName(input.displayName);
  }

  if (input.avatarPath !== undefined) {
    changes.avatar_path = normalizeAvatarPath(input.avatarPath);
  }

  if (Object.keys(changes).length === 0) {
    throw new Error('No profile changes were provided.');
  }

  return authRepository.updateProfile(requireUserId(user.id), changes);
}

export async function saveCustomerProfile(
  input: SaveCustomerProfileInput,
): Promise<{
  profile: AppProfile;
  customerProfile: CustomerProfileRecord;
}> {
  const user = await authRepository.getCurrentUser();

  if (!user) {
    throw new Error('Authentication required.');
  }

  const customerProfile = await authRepository.saveCustomerProfile({
    displayName: normalizeDisplayName(input.displayName),
    homeLocation: normalizeLocation(input.homeLocation),
    emergencyContact: normalizeOptionalEmergencyContact(
      input.emergencyContact,
    ),
  });

  const profile = await authRepository.getProfile(user.id);

  return {
    profile,
    customerProfile,
  };
}

export async function saveWorkerProfile(
  input: SaveWorkerProfileInput,
): Promise<{
  profile: AppProfile;
  workerProfile: WorkerProfileRecord;
}> {
  const user = await authRepository.getCurrentUser();

  if (!user) {
    throw new Error('Authentication required.');
  }

  const workerProfile = await authRepository.saveWorkerProfile({
    displayName: normalizeDisplayName(input.displayName),
    primaryTrade: normalizeWorkerTrade(input.primaryTrade),
    experienceYears: normalizeExperienceYears(input.experienceYears),
    preferredRateBdt: normalizePreferredRate(input.preferredRateBdt),
    serviceRadiusKm: normalizeServiceRadius(input.serviceRadiusKm),
  });

  const profile = await authRepository.getProfile(user.id);

  return {
    profile,
    workerProfile,
  };
}

export async function registerAsWorker(): Promise<{
  role: AppRole;
  profile: AppProfile;
  roles: AppRole[];
}> {
  const user = await authRepository.getCurrentUser();

  if (!user) {
    throw new Error('Authentication required.');
  }

  const role = await authRepository.registerWorkerRole();

  const [profile, roleRows] = await Promise.all([
    authRepository.getProfile(user.id),
    authRepository.getUserRoles(user.id),
  ]);

  return {
    role,
    profile,
    roles: roleRows.map(row => row.role),
  };
}

export async function switchActiveRole(role: AppRole): Promise<AppProfile> {
  const user = await authRepository.getCurrentUser();

  if (!user) {
    throw new Error('Authentication required.');
  }

  await authRepository.setActiveRole(role);

  return authRepository.getProfile(user.id);
}

export async function logoutCurrentDevice(): Promise<void> {
  await authRepository.signOutCurrentDevice();
}

export async function logoutAllDevices(): Promise<void> {
  await authRepository.signOutAllDevices();
}
