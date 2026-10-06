import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
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

function money(value: number, currency: string) {
  return `${currency === 'BDT' ? '৳' : currency + ' '}${Number(value).toLocaleString()}`;
}

export default function WorkerDashboardScreen() {
  const router = useRouter();

  const {
    profile,
    workerProfile,
    setLogoutModalVisible,
  } = useSession();

  const { items, isLoading, refresh } = useCommunityFeed({
    status: 'open',
    pageSize: 12,
  });

  const matchingJobs = useMemo(() => {
    if (!workerProfile?.primary_trade) {
      return items;
    }

    const category =
      workerProfile.primary_trade === 'electrician'
        ? 'electrical'
        : workerProfile.primary_trade === 'carpenter'
          ? 'carpentry'
          : workerProfile.primary_trade === 'cleaner'
            ? 'cleaning'
            : workerProfile.primary_trade === 'painter'
              ? 'painting'
              : workerProfile.primary_trade === 'ac_technician'
                ? 'ac'
                : workerProfile.primary_trade;

    return items.filter(item => item.category === category);
  }, [items, workerProfile?.primary_trade]);

  const firstName =
    profile?.display_name?.trim().split(/s+/)[0] || 'Worker';

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>ThiKorben Pro</Text>
          <Text style={styles.welcome}>Ready for work, {firstName}</Text>
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
            <MaterialCommunityIcons name="hammer-wrench" size={28} color="#fff" />
          </View>
          <View style={styles.flex}>
            <Text style={styles.heroEyebrow}>WORKER MODE</Text>
            <Text style={styles.heroTitle}>Build trust through completed work</Text>
            <Text style={styles.heroText}>
              Discover suitable requests, submit transparent proposals, chat securely, and request materials for customer approval.
            </Text>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <Ionicons name="person-circle-outline" size={28} color={C.primary} />
          </View>

          <View style={styles.flex}>
            <Text style={styles.profileName}>
              {profile?.display_name ?? 'Worker'}
            </Text>
            <Text style={styles.profileMeta}>
              {workerProfile?.primary_trade?.replace('_', ' ') ?? 'Service professional'}
              {' • '}
              {workerProfile?.experience_years ?? 0} years experience
            </Text>
            <Text style={styles.profileMeta}>
              Preferred rate ৳{Number(workerProfile?.preferred_rate_bdt ?? 0).toLocaleString()}
              {' • '}
              {workerProfile?.service_radius_km ?? 0} km radius
            </Text>
          </View>

          <View
            style={[
              styles.verificationBadge,
              workerProfile?.verification_status === 'verified'
                ? styles.verificationVerified
                : styles.verificationPending,
            ]}
          >
            <Text style={styles.verificationText}>
              {(workerProfile?.verification_status ?? 'unverified').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.actionGrid}>
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/community')}
          >
            <View style={[styles.actionIcon, { backgroundColor: C.primarySoft }]}>
              <Ionicons name="briefcase-outline" size={22} color={C.primary} />
            </View>
            <Text style={styles.actionTitle}>Find Jobs</Text>
            <Text style={styles.actionText}>
              Browse real service requests and submit a proposal.
            </Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/worker-profile-setup')}
          >
            <View style={[styles.actionIcon, { backgroundColor: C.orangeSoft }]}>
              <Ionicons name="settings-outline" size={22} color={C.orange} />
            </View>
            <Text style={styles.actionTitle}>Service Profile</Text>
            <Text style={styles.actionText}>
              Update trade, rate, experience, and service radius.
            </Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/worker-skill-passport' as Href)}
          >
            <View style={[styles.actionIcon, { backgroundColor: C.greenSoft }]}>
              <MaterialCommunityIcons name="certificate-outline" size={22} color={C.green} />
            </View>
            <Text style={styles.actionTitle}>Skill Passport</Text>
            <Text style={styles.actionText}>
              See evidence generated from completed ThiKorben jobs.
            </Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Matching open jobs</Text>
            <Text style={styles.sectionSubtitle}>
              {isLoading
                ? 'Loading…'
                : `${matchingJobs.length} request${matchingJobs.length === 1 ? '' : 's'} matching your trade`}
            </Text>
          </View>

          <Pressable onPress={() => void refresh()}>
            <Ionicons name="refresh" size={20} color={C.primary} />
          </Pressable>
        </View>

        {matchingJobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="briefcase-outline" size={31} color={C.muted} />
            <Text style={styles.emptyTitle}>No matching jobs right now</Text>
            <Text style={styles.emptyText}>
              Check the full community feed or refresh later.
            </Text>
            <Pressable
              style={styles.communityButton}
              onPress={() => router.push('/community')}
            >
              <Text style={styles.communityButtonText}>Open Community</Text>
            </Pressable>
          </View>
        ) : (
          matchingJobs.slice(0, 6).map(item => (
            <Pressable
              key={item.id}
              style={styles.jobCard}
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
              <View style={styles.jobIcon}>
                <Ionicons name="construct-outline" size={20} color={C.primary} />
              </View>

              <View style={styles.flex}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.jobMeta}>
                  {item.location_label} • {item.proposal_count} proposal{item.proposal_count === 1 ? '' : 's'}
                </Text>
              </View>

              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>
                  {money(item.budget_amount, item.currency)}
                </Text>
              </View>
            </Pressable>
          ))
        )}

        <View style={styles.safety}>
          <Ionicons name="shield-checkmark" size={21} color={C.green} />
          <View style={styles.flex}>
            <Text style={styles.safetyTitle}>Material purchases need customer approval</Text>
            <Text style={styles.safetyText}>
              After assignment, use the private job chat and catalog-backed material request flow. You cannot add items directly to a customer order.
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
  heroTitle: { marginTop: 3, fontSize: 19, fontWeight: '900', color: '#fff' },
  heroText: { marginTop: 4, fontSize: 11, lineHeight: 16, color: '#dedcff' },
  profileCard: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  profileIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primarySoft,
  },
  profileName: { fontSize: 12.5, fontWeight: '900', color: C.text },
  profileMeta: { marginTop: 2, fontSize: 9.5, color: C.muted, textTransform: 'capitalize' },
  verificationBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999 },
  verificationVerified: { backgroundColor: C.greenSoft },
  verificationPending: { backgroundColor: C.orangeSoft },
  verificationText: { fontSize: 7.5, fontWeight: '900', color: C.text },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: {
    minWidth: 210,
    flex: 1,
    minHeight: 132,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: { marginTop: 10, fontSize: 12.5, fontWeight: '900', color: C.text },
  actionText: { marginTop: 4, fontSize: 9.5, lineHeight: 14, color: C.muted },
  sectionHeader: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: C.text },
  sectionSubtitle: { marginTop: 2, fontSize: 9.5, color: C.muted },
  emptyCard: {
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 17,
    backgroundColor: '#fff',
  },
  emptyTitle: { marginTop: 8, fontSize: 12, fontWeight: '900', color: C.text },
  emptyText: { marginTop: 4, fontSize: 9.5, color: C.muted, textAlign: 'center' },
  communityButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 11,
    backgroundColor: C.primary,
  },
  communityButtonText: { fontSize: 10, fontWeight: '900', color: '#fff' },
  jobCard: {
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    backgroundColor: '#fff',
  },
  jobIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primarySoft,
  },
  jobTitle: { fontSize: 11.5, fontWeight: '900', color: C.text },
  jobMeta: { marginTop: 2, fontSize: 9, color: C.muted },
  priceBadge: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 9, backgroundColor: C.orangeSoft },
  priceText: { fontSize: 10.5, fontWeight: '900', color: C.orange },
  safety: {
    marginTop: 4,
    padding: 14,
    flexDirection: 'row',
    gap: 9,
    borderRadius: 16,
    backgroundColor: C.greenSoft,
  },
  safetyTitle: { fontSize: 11.5, fontWeight: '900', color: C.green },
  safetyText: { marginTop: 3, fontSize: 9.5, lineHeight: 15, color: C.muted },
});
