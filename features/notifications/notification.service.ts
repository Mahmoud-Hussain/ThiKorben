import * as repository from './notification.repository';
import type { AppNotification } from './types';

function requireId(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error('Notification ID is required.');
  }

  return normalized;
}

export async function getMyNotifications(): Promise<AppNotification[]> {
  return repository.listMyNotifications();
}

export async function readNotification(
  notificationId: string,
): Promise<void> {
  return repository.markNotificationRead(requireId(notificationId));
}
