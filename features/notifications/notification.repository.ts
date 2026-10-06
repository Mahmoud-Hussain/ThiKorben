import { supabase } from '@/lib/supabase';
import type { AppNotification } from './types';

export async function listMyNotifications(
  limit = 30,
): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('app_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  const { error } = await supabase
    .from('app_notifications')
    .update({
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId);

  if (error) {
    throw error;
  }
}
