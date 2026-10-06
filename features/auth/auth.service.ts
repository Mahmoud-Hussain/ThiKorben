import * as authRepository from './auth.repository';

import { normalizeBangladeshPhone, normalizePhoneOtp } from './phone';

import type {
  AppProfile,
  AppProfileUpdate,
  AppRole,
  AuthIdentity,
  RequestPhoneOtpInput,
  UpdateMyProfileInput,
  VerifiedPhoneSession,
  VerifyPhoneOtpInput,
} from './types';

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

  if (input.mode === 'login') {
    await authRepository.requestPhoneOtp(phone, {
      /*
       * Login must never silently create a new account.
       */
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
  /*
   * Sending another OTP through the same endpoint keeps
   * signup/login account-creation semantics identical to
   * the original request.
   *
   * Supabase rate limits remain authoritative.
   */
  return requestPhoneOtp(input);
}

export async function verifyPhoneOtp(
  input: VerifyPhoneOtpInput,
): Promise<VerifiedPhoneSession> {
  const phone = normalizeBangladeshPhone(input.phone);

  const token = normalizePhoneOtp(input.token);

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

  const [profile, roleRows] = await Promise.all([
    authRepository.getProfile(userId),

    authRepository.getUserRoles(userId),
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
