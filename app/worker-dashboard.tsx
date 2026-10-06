import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNavBar } from '@/components/bottom-nav-bar';
import { useSession } from '@/contexts/session-context';
import { useCommunityFeed } from '@/features/community/community.hooks';

const COLORS = {
  primary: '#15157d',
  primaryContainer: '#2e3192',
  secondary: '#fd9923',
  accentOrange: '#F7941D',
  background: '#f8f7fc',
  surface: '#ffffff',
  surfaceContainerLow: '#f4f2fa',
  surfaceContainerHigh: '#eae7f0',
  surfaceDim: '#dbd9e1',
  text: '#1b1b21',
  textMuted: '#5b5a68',
  border: '#e6e3ee',
  success: '#16a34a',
  purpleSoft: '#ede9fe',
  purpleDark: '#4338ca',
};

const RAHIM_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCv3ndAOA1HXwuXdDv15r5Bfc9c_rxhJyNc2SXzQsu7SuF6OtdDXPeZ_jIU-grZ3O9d4VZ7_K9x7qKeOqpqH6pjTZbPPmTSdjJK2MzxOVaSPjgGqHZwJMKC6h6eJKTNV6aRRU_yvgm5w2L60KMcltF2TyjSfzSbC2yqCiwpGsRgeRxwqS44YOdBOJqmW8D0yi0j3Tb7_ZKpDbdft_DBKHGnIrK9nMnGuAhoe6Ym8J1J3OX6K2SLGLPXOg';

function relativeTime(value: string) {
  const delta = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(delta / 60000));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} mins ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

function jobIcon(category: string): React.ComponentProps<typeof MaterialCommunityIcons>['name'] {
  if (category === 'plumbing') return 'pipe-wrench';
  if (category === 'electrical') return 'flash';
  if (category === 'carpentry') return 'hammer-screwdriver';
  if (category === 'cleaning') return 'broom';
  if (category === 'painting') return 'format-paint';
  return 'snowflake';
}

function categoryLabel(category: string) {
  return category === 'ac'
    ? 'AC Service'
    : category.charAt(0).toUpperCase() + category.slice(1);
}

export default function WorkerDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, workerProfile } = useSession();
  const [isOnline, setIsOnline] = useState(true);

  const {
    items: nearbyJobs,
    isLoading: jobsLoading,
    refresh: refreshJobs,
  } = useCommunityFeed({
    status: 'open',
    pageSize: 8,
  });

  const urgentJob = nearbyJobs[0];

  const workerName = profile?.display_name || 'ThiKorben Worker';
  const workerTrade = workerProfile?.primary_trade
    ? workerProfile.primary_trade.replace(/_/g, ' ')
    : 'Service Professional';

  const toggleOnline = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    Alert.alert(
      nextState ? 'You are Online' : 'You are Offline',
      nextState
        ? 'You will now receive job notifications in Dhanmondi area.'
        : 'You will not receive new job alerts until you go online.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ── Top Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.push('/worker-profile')}
            activeOpacity={0.8}
            style={styles.avatarWrapper}>
            <Image source={{ uri: RAHIM_AVATAR }} style={styles.avatar} />
            <View
              style={[
                styles.onlineDot,
                { backgroundColor: isOnline ? COLORS.success : '#9ca3af' },
              ]}
            />
          </TouchableOpacity>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.workerName}>{workerName}</Text>
              <MaterialIcons name="verified-user" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.workerTitle}>
              {workerTrade} • ThiKorben Worker
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.8}>
            <Ionicons
              name="notifications-outline"
              size={17}
              color={COLORS.primary}
            />
            <View style={styles.notificationDot} />
          </TouchableOpacity>

          <TouchableOpacity
              style={styles.switchModeBtn}
              onPress={() => router.push('/role-selection')}
              activeOpacity={0.8}>
            <Ionicons name="people" size={16} color={COLORS.accentOrange} />
            <Text style={styles.switchModeText}>Customer Mode</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 70 },
        ]}
        showsVerticalScrollIndicator={false}>

        {/* ── Online Status Toggle Card ── */}
        <View style={styles.statusCard}>
          <View style={styles.statusInfo}>
            <View style={styles.statusBadgeRow}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: isOnline ? COLORS.success : '#9ca3af' },
                ]}
              />
              <Text style={styles.statusStateText}>
                {isOnline ? 'AVAILABLE FOR JOBS' : 'CURRENTLY OFFLINE'}
              </Text>
            </View>
            <Text style={styles.statusDesc}>
              {isOnline
                ? 'Receiving instant requests in Dhanmondi & Lalmatia'
                : 'Turn on to start getting service bookings'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.toggleBtn, isOnline ? styles.toggleBtnOn : styles.toggleBtnOff]}
            onPress={toggleOnline}
            activeOpacity={0.8}>
            <View
              style={[
                styles.toggleThumb,
                isOnline ? styles.toggleThumbOn : styles.toggleThumbOff,
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* ── Urgent New Job Request Banner ── */}
        {urgentJob ? (
          <View style={styles.urgentBanner}>
            <View style={styles.urgentHeader}>
              <View style={styles.urgentTag}>
                <Ionicons name="alert-circle" size={14} color="#ffffff" />
                <Text style={styles.urgentTagText}>NEW INCOMING JOB</Text>
              </View>
              <Text style={styles.urgentTime}>{relativeTime(urgentJob.created_at)}</Text>
            </View>

            <Text style={styles.urgentJobTitle}>{urgentJob.title}</Text>
            <Text style={styles.urgentJobLocation}>
              {urgentJob.location_label} • {categoryLabel(urgentJob.category)}
            </Text>

            <View style={styles.urgentFooter}>
              <View>
                <Text style={styles.urgentPayoutLabel}>Customer Budget</Text>
                <Text style={styles.urgentPayoutValue}>
                  ৳{Number(urgentJob.budget_amount).toLocaleString()}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.acceptJobBtn}
                onPress={() =>
                  router.push({
                    pathname: '/job-board',
                    params: {
                      mode: 'detail',
                      requestId: urgentJob.id,
                    },
                  })
                }
                activeOpacity={0.85}>
                <Text style={styles.acceptJobText}>View & Propose</Text>
                <Ionicons name="arrow-forward" size={15} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* ── Today's Earnings & Stats ── */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>Today&apos;s Marketplace Activity</Text>
            <Text style={styles.statsDate}>Live</Text>
          </View>

          <View style={styles.earningsRow}>
            <View>
              <Text style={styles.earningsAmount}>{nearbyJobs.length}</Text>
              <Text style={styles.earningsSub}>Open jobs visible now</Text>
            </View>
            <View style={styles.earningsTrend}>
              <Ionicons name="trending-up" size={16} color={COLORS.success} />
              <Text style={styles.earningsTrendText}>Realtime feed</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="clock-check-outline" size={20} color={COLORS.primary} />
              <Text style={styles.statBoxVal}>{workerProfile?.experience_years ?? 0}y</Text>
              <Text style={styles.statBoxLabel}>Experience</Text>
            </View>
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="star-outline" size={20} color="#eab308" />
              <Text style={styles.statBoxVal}>{workerProfile?.service_radius_km ?? 0}km</Text>
              <Text style={styles.statBoxLabel}>Service Radius</Text>
            </View>
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="wallet-outline" size={20} color={COLORS.accentOrange} />
              <Text style={styles.statBoxVal}>LIVE</Text>
              <Text style={styles.statBoxLabel}>Shared Feed</Text>
            </View>
          </View>
        </View>

        {/* ── Nearby Job Feed ── */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Available Job Requests</Text>
            <Text style={styles.sectionSubtitle}>Tap any job to view map & customer details</Text>
          </View>
          <TouchableOpacity onPress={() => void refreshJobs()}>
            <Text style={styles.feedCount}>
              {jobsLoading ? 'Loading…' : `${nearbyJobs.length} Open`}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.jobsList}>
          {nearbyJobs.length === 0 ? (
            <View style={styles.emptyJobsCard}>
              <Ionicons name="briefcase-outline" size={28} color={COLORS.textMuted} />
              <Text style={styles.emptyJobsTitle}>No open requests right now</Text>
              <Text style={styles.emptyJobsText}>
                Refresh the feed or check again when a customer posts a new service request.
              </Text>
            </View>
          ) : (
            nearbyJobs.map(job => (
              <TouchableOpacity
                key={job.id}
                style={styles.jobCard}
                onPress={() =>
                  router.push({
                    pathname: '/job-board',
                    params: {
                      mode: 'detail',
                      requestId: job.id,
                    },
                  })
                }
                activeOpacity={0.88}>
                <View style={styles.jobCardHeader}>
                  <View style={styles.jobIconBox}>
                    <MaterialCommunityIcons
                      name={jobIcon(job.category)}
                      size={22}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.jobTitleCol}>
                    <View style={styles.jobTitleRow}>
                      <Text style={styles.jobTitle}>{job.title}</Text>
                    </View>
                    <Text style={styles.jobCustomer}>
                      Customer request • {job.location_label}
                    </Text>
                  </View>

                  <Text style={styles.jobPrice}>
                    ৳{Number(job.budget_amount).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.jobCardFooter}>
                  <View style={styles.jobMetaBadge}>
                    <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
                    <Text style={styles.jobMetaText}>{job.location_label}</Text>
                  </View>

                  <View style={styles.jobMetaBadge}>
                    <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
                    <Text style={styles.jobMetaText}>{relativeTime(job.created_at)}</Text>
                  </View>

                  <View style={[styles.jobTagPill, { backgroundColor: '#15157d12' }]}>
                    <Text style={[styles.jobTagPillText, { color: COLORS.primary }]}>
                      {categoryLabel(job.category)}
                    </Text>
                  </View>

                  <View style={styles.jobArrow}>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>

      {/* ── Unified Bottom Navigation Bar ── */}
      <BottomNavBar activeTab="home" />


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workerName: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
  },
  workerTitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.accentOrange,
    borderWidth: 1,
    borderColor: '#ffffff',
  },

  switchModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  switchModeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.accentOrange,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4 },
      android: { elevation: 1 },
      web: { boxShadow: '0 2px 6px rgba(0,0,0,0.04)' },
    }),
  },
  statusInfo: {
    flex: 1,
    paddingRight: 10,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusStateText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.4,
  },
  statusDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  toggleBtn: {
    width: 48,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  toggleBtnOn: {
    backgroundColor: COLORS.success,
  },
  toggleBtnOff: {
    backgroundColor: '#d1d5db',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
      android: { elevation: 2 },
      web: { boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
    }),
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  toggleThumbOff: {
    alignSelf: 'flex-start',
  },
  urgentBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
      android: { elevation: 4 },
      web: { boxShadow: '0 4px 14px rgba(21, 21, 125, 0.2)' },
    }),
  },
  urgentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  urgentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgentTagText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  urgentTime: {
    fontSize: 11,
    color: '#c7c5d4',
  },
  urgentJobTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  urgentJobLocation: {
    fontSize: 12,
    color: '#dadaf8',
    marginTop: 2,
    marginBottom: 12,
  },
  urgentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 10,
  },
  urgentPayoutLabel: {
    fontSize: 10,
    color: '#c7c5d4',
  },
  urgentPayoutValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#ffffff',
  },
  acceptJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.accentOrange,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  acceptJobText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  statsDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  earningsAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primary,
  },
  earningsSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  earningsTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  earningsTrendText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statBoxVal: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 4,
  },
  statBoxLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  feedCount: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyJobsCard: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  emptyJobsTitle: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text,
  },
  emptyJobsText: {
    marginTop: 4,
    maxWidth: 310,
    textAlign: 'center',
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.textMuted,
  },

  jobsList: {
    gap: 10,
    marginBottom: 10,
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  jobCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  jobIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobTitleCol: {
    flex: 1,
  },
  jobTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.text,
  },
  jobCustomer: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  jobPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary,
  },
  jobCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerLow,
    gap: 8,
  },
  jobMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  jobMetaText: {
    fontSize: 10.5,
    color: COLORS.textMuted,
  },
  jobTagPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  jobTagPillText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  jobArrow: {
    marginLeft: 'auto',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    position: 'relative',
    zIndex: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIconBox: {
    width: 36,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconBoxActive: {
    backgroundColor: COLORS.primary,
  },
  navLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  navLabelActive: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
});
