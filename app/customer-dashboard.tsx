import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useSession } from '@/contexts/session-context';
import { useCommunityFeed } from '@/features/community/community.hooks';

const C = {
  primary: '#15157d',
  primarySoft: '#eeedff',
  orange: '#F7941D',
  orangeSoft: '#fff4e7',
  green: '#178c4f',
  greenSoft: '#eaf8f0',
  bg: '#f7f6fb',
  card: '#fff',
  text: '#181820',
  muted: '#6b6b78',
  border: '#e5e2eb',
};

export default function CustomerDashboardScreen() {
  const router = useRouter();
  const {
    profile,
    customerProfile,
    setLogoutModalVisible,
  } = useSession();

  const { items, isLoading } = useCommunityFeed({
    status: 'open',
    pageSize: 20,
  });

  const ownRequests = useMemo(
    () => items.filter(item => item.customer_id === profile?.id),
    [items, profile?.id],
  );

  const firstName =
    profile?.display_name?.trim().split(/s+/)[0] || 'Customer';

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>ThiKorben</Text>
          <Text style={styles.welcome}>Welcome back, {firstName}</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.push('/role-selection')}
          >
            <Ionicons name="swap-horizontal" size={20} color={C.primary} />
          </Pressable>
          <Pressable
            style={styles.iconButton}
            onPress={() => setLogoutModalVisible(true)}
          >
            <Ionicons name="log-out-outline" size={20} color={C.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="handyman" size={28} color="#fff" />
          </View>
          <View style={styles.flex}>
            <Text style={styles.heroEyebrow}>SERVICE REQUEST</Text>
            <Text style={styles.heroTitle}>What needs fixing today?</Text>
            <Text style={styles.heroText}>
              Post the problem once, compare worker proposals, and keep job communication in one secure flow.
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.primaryAction}
          onPress={() =>
            router.push({
              pathname: '/job-board',
              params: { mode: 'create' },
            })
          }
        >
          <View style={styles.primaryActionIcon}>
            <Ionicons name="add" size={24} color="#fff" />
          </View>
          <View style={styles.flex}>
            <Text style={styles.primaryActionTitle}>Create Service Request</Text>
            <Text style={styles.primaryActionText}>
              Describe the problem, location, budget, and timing.
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </Pressable>

        <View style={styles.quickGrid}>
          <Pressable
            style={styles.quickCard}
            onPress={() => router.push('/community')}
          >
            <View style={[styles.quickIcon, { backgroundColor: C.primarySoft }]}>
              <Ionicons name="people" size={22} color={C.primary} />
            </View>
            <Text style={styles.quickTitle}>Community</Text>
            <Text style={styles.quickText}>
              Browse active requests and your own posts.
            </Text>
          </Pressable>

          <Pressable
            style={styles.quickCard}
            onPress={() => router.push('/role-selection')}
          >
            <View style={[styles.quickIcon, { backgroundColor: C.orangeSoft }]}>
              <Ionicons name="construct" size={22} color={C.orange} />
            </View>
            <Text style={styles.quickTitle}>Worker Mode</Text>
            <Text style={styles.quickText}>
              Register worker capability and switch roles securely.
            </Text>
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <Ionicons name="location" size={20} color={C.green} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.profileTitle}>Service profile</Text>
            <Text style={styles.profileText}>
              {customerProfile?.home_location || 'Location not set'}
            </Text>
          </View>
          <View style={styles.readyBadge}>
            <Text style={styles.readyText}>READY</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Your open requests</Text>
            <Text style={styles.sectionSubtitle}>
              {isLoading
                ? 'Loading…'
                : `${ownRequests.length} active request${ownRequests.length === 1 ? '' : 's'}`}
            </Text>
          </View>

          <Pressable onPress={() => router.push('/community')}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        {ownRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="clipboard-outline" size={30} color={C.muted} />
            <Text style={styles.emptyTitle}>No open requests</Text>
            <Text style={styles.emptyText}>
              Create a service request when you need help.
            </Text>
          </View>
        ) : (
          ownRequests.slice(0, 4).map(item => (
            <Pressable
              key={item.id}
              style={styles.requestCard}
              onPress={() =>
                router.push({
                  pathname: '/job-board',
                  params: {
                    mode: 'detail',
                    requestId: item.id,
                  },
                })
              }
            >
              <View style={styles.requestIcon}>
                <Ionicons name="construct-outline" size={20} color={C.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.requestTitle}>{item.title}</Text>
                <Text style={styles.requestMeta}>
                  {item.location_label} • {item.proposal_count} proposal{item.proposal_count === 1 ? '' : 's'}
                </Text>
              </View>
              <Text style={styles.requestBudget}>৳{Number(item.budget_amount).toLocaleString()}</Text>
            </Pressable>
          ))
        )}

        <View style={styles.safety}>
          <Ionicons name="shield-checkmark" size={21} color={C.primary} />
          <View style={styles.flex}>
            <Text style={styles.safetyTitle}>Human-in-the-loop by design</Text>
            <Text style={styles.safetyText}>
              You decide which proposal to accept and which materials to approve. ThiKorben never silently commits a transaction.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    minHeight: 70,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: '#fff',
  },
  brand: { fontSize: 18, fontWeight: '900', color: C.primary },
  welcome: { marginTop: 2, fontSize: 10.5, color: C.muted },
  headerActions: { flexDirection: 'row', gap: 7 },
  iconButton: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primarySoft,
  },
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 60,
    gap: 12,
  },
  hero: {
    padding: 18,
    flexDirection: 'row',
    gap: 13,
    borderRadius: 22,
    backgroundColor: C.primary,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  heroEyebrow: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: '#c9c8ff' },
  heroTitle: { marginTop: 3, fontSize: 20, fontWeight: '900', color: '#fff' },
  heroText: { marginTop: 4, fontSize: 11, lineHeight: 16, color: '#dedcff' },
  primaryAction: {
    minHeight: 76,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 19,
    backgroundColor: C.orange,
  },
  primaryActionIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  primaryActionTitle: { fontSize: 14, fontWeight: '900', color: '#fff' },
  primaryActionText: { marginTop: 3, fontSize: 10, lineHeight: 15, color: '#fff7ec' },
  quickGrid: { flexDirection: 'row', gap: 10 },
  quickCard: {
    flex: 1,
    minHeight: 132,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitle: { marginTop: 10, fontSize: 12.5, fontWeight: '900', color: C.text },
  quickText: { marginTop: 4, fontSize: 9.5, lineHeight: 14, color: C.muted },
  profileCard: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 17,
    backgroundColor: '#fff',
  },
  profileIcon: {
    width: 41,
    height: 41,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.greenSoft,
  },
  profileTitle: { fontSize: 11.5, fontWeight: '900', color: C.text },
  profileText: { marginTop: 2, fontSize: 9.5, color: C.muted },
  readyBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: C.greenSoft },
  readyText: { fontSize: 8, fontWeight: '900', color: C.green },
  sectionHeader: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: C.text },
  sectionSubtitle: { marginTop: 2, fontSize: 9.5, color: C.muted },
  seeAll: { fontSize: 10, fontWeight: '900', color: C.primary },
  emptyCard: {
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 17,
    backgroundColor: '#fff',
  },
  emptyTitle: { marginTop: 8, fontSize: 12, fontWeight: '900', color: C.text },
  emptyText: { marginTop: 4, fontSize: 9.5, color: C.muted },
  requestCard: {
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    backgroundColor: '#fff',
  },
  requestIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primarySoft,
  },
  requestTitle: { fontSize: 11.5, fontWeight: '900', color: C.text },
  requestMeta: { marginTop: 2, fontSize: 9, color: C.muted },
  requestBudget: { fontSize: 11, fontWeight: '900', color: C.orange },
  safety: {
    marginTop: 5,
    padding: 14,
    flexDirection: 'row',
    gap: 9,
    borderRadius: 16,
    backgroundColor: C.primarySoft,
  },
  safetyTitle: { fontSize: 11.5, fontWeight: '900', color: C.primary },
  safetyText: { marginTop: 3, fontSize: 9.5, lineHeight: 15, color: C.muted },
});
