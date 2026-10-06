import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  getMyNotifications,
  readNotification,
} from '@/features/notifications/notification.service';
import type { AppNotification } from '@/features/notifications/types';
import { supabase } from '@/lib/supabase';

const C = {
  primary: '#15157d',
  orange: '#F7941D',
  green: '#16a34a',
  background: '#f8f7fc',
  surface: '#ffffff',
  text: '#1b1b21',
  muted: '#5b5a68',
  border: '#e6e3ee',
  primarySoft: '#ede9fe',
  orangeSoft: '#fff4e5',
};

function relativeTime(value: string) {
  const delta = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(delta / 60000));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

function iconFor(type: string): React.ComponentProps<typeof Ionicons>['name'] {
  if (type === 'proposal_received') return 'document-text-outline';
  if (type === 'proposal_accepted') return 'checkmark-circle-outline';
  if (type === 'material_requested') return 'cart-outline';
  if (type === 'material_resolved') return 'shield-checkmark-outline';
  return 'pulse-outline';
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const unread = useMemo(
    () => items.filter(item => !item.read_at).length,
    [items],
  );

  const load = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);

    try {
      setItems(await getMyNotifications());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Could not load notifications.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);

    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel('my-app-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'app_notifications',
        },
        () => {
          void load();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  const openItem = async (item: AppNotification) => {
    if (!item.read_at) {
      await readNotification(item.id);
    }

    if (
      item.notification_type === 'material_requested' &&
      item.service_request_id
    ) {
      router.push({
        pathname: '/job-materials',
        params: { requestId: item.service_request_id },
      } as Href);
      return;
    }

    if (item.service_request_id) {
      router.push({
        pathname: '/job-board',
        params: {
          mode: 'detail',
          requestId: item.service_request_id,
        },
      });
      return;
    }

    await load();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {unread} unread update{unread === 1 ? '' : 's'}
          </Text>
        </View>

        <Pressable style={styles.headerButton} onPress={() => void load()}>
          <Ionicons name="refresh" size={20} color={C.primary} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.centerText}>Loading updates…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={35} color="#ba1a1a" />
          <Text style={styles.centerTitle}>Could not load notifications</Text>
          <Text style={styles.centerText}>{error}</Text>
          <Pressable style={styles.retry} onPress={() => void load()}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.infoCard}>
            <Ionicons name="notifications-outline" size={22} color={C.primary} />
            <Text style={styles.infoText}>
              Worker proposals, material approvals, and job updates appear here
              for the signed-in account.
            </Text>
          </View>

          {items.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={38} color={C.muted} />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyText}>
                Shared customer-worker activity will appear here.
              </Text>
            </View>
          ) : (
            items.map(item => (
              <Pressable
                key={item.id}
                onPress={() => void openItem(item)}
                style={[
                  styles.card,
                  !item.read_at && styles.cardUnread,
                ]}
              >
                <View
                  style={[
                    styles.icon,
                    !item.read_at ? styles.iconUnread : styles.iconRead,
                  ]}
                >
                  <Ionicons
                    name={iconFor(item.notification_type)}
                    size={21}
                    color={!item.read_at ? C.orange : C.primary}
                  />
                </View>

                <View style={styles.flex}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>{item.title}</Text>
                    {!item.read_at ? <View style={styles.unreadDot} /> : null}
                  </View>

                  <Text style={styles.body}>{item.body}</Text>
                  <Text style={styles.time}>{relativeTime(item.created_at)}</Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color={C.muted} />
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: C.background },
  header: {
    minHeight: 64,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: '#ffffff',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 14, fontWeight: '900', color: C.text },
  headerSubtitle: { marginTop: 2, fontSize: 9.5, color: C.muted },
  content: { padding: 14, paddingBottom: 45, gap: 9 },
  infoCard: {
    marginBottom: 3,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 15,
    backgroundColor: C.primarySoft,
  },
  infoText: { flex: 1, fontSize: 9.5, lineHeight: 15, color: C.muted },
  card: {
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    backgroundColor: C.surface,
  },
  cardUnread: {
    borderColor: '#fed7aa',
    backgroundColor: '#fffdfa',
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUnread: { backgroundColor: C.orangeSoft },
  iconRead: { backgroundColor: C.primarySoft },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 11, fontWeight: '900', color: C.text },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.orange,
  },
  body: {
    marginTop: 3,
    fontSize: 9.5,
    lineHeight: 14,
    color: C.muted,
  },
  time: { marginTop: 4, fontSize: 8, color: C.muted },
  center: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  centerTitle: { marginTop: 9, fontSize: 14, fontWeight: '900', color: C.text },
  centerText: {
    marginTop: 6,
    maxWidth: 310,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 15,
    color: C.muted,
  },
  retry: {
    marginTop: 13,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 11,
    backgroundColor: C.primary,
  },
  retryText: { fontSize: 10, fontWeight: '900', color: '#ffffff' },
  empty: {
    paddingVertical: 70,
    alignItems: 'center',
  },
  emptyTitle: { marginTop: 10, fontSize: 13, fontWeight: '900', color: C.text },
  emptyText: { marginTop: 4, fontSize: 9.5, color: C.muted },
});
