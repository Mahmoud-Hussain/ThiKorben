/**
 * Teacher/demo presentation mode.
 *
 * This mode intentionally bypasses live SMS/Supabase authentication so the
 * UI flow can be demonstrated offline or without an SMS provider. Keep it
 * disabled for production builds.
 */
export const PRESENTATION_MODE =
  (process.env.EXPO_PUBLIC_PRESENTATION_MODE ?? '').trim().toLowerCase() ===
  'true';

export function normalizePresentationPhone(value: string) {
  const phone = value.trim();

  if (!phone) {
    throw new Error('Enter a phone number.');
  }

  if (phone.startsWith('+')) {
    return phone;
  }

  if (phone.startsWith('880')) {
    return `+${phone}`;
  }

  if (phone.startsWith('0')) {
    return `+88${phone}`;
  }

  return `+880${phone}`;
}
