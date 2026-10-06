import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useSession } from '@/contexts/session-context';
import {
  getMySkillPassport,
  type SkillPassportSummary,
} from '@/features/passport/passport.service';

const C = {
  primary: '#15157d',
  primarySoft: '#eeedff',
  orange: '#F7941D',
  green: '#178c4f',
  greenSoft: '#eaf8f0',
  bg: '#f7f6fb',
  text: '#181820',
  muted: '#6b6b78',
  border: '#e5e2eb',
  red: '#c43d39',
};

function labelFor(category: string) {
  return category
    .replace('ac', 'AC')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, value => value.toUpperCase());
}

export default function WorkerSkillPassportScreen() {
  const router = useRouter();
  const { profile, workerProfile } = useSession();

  const [summary, setSummary] = useState<SkillPassportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    await Promise.resolve();

    setLoading(true);
    setError(null);

    try {
      setSummary(await getMySkillPassport());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Could not load Skill Passport.',
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

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.centerText}>Building your Skill Passport…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Worker Skill Passport</Text>
          <Text style={styles.headerSubtitle}>Evidence from completed ThiKorben jobs</Text>
        </View>

        <Pressable style={styles.headerButton} onPress={() => void load()}>
          <Ionicons name="refresh" size={20} color={C.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.display_name?.trim()[0] ?? 'W').toUpperCase()}
            </Text>
          </View>

          <View style={styles.flex}>
            <Text style={styles.name}>{profile?.display_name ?? 'Worker'}</Text>
            <Text style={styles.trade}>
              {labelFor(workerProfile?.primary_trade ?? 'service professional')}
            </Text>

            <View style={styles.badges}>
              <View style={styles.badge}>
                <Ionicons name="shield-checkmark" size={13} color={C.green} />
                <Text style={styles.badgeText}>
                  {(workerProfile?.verification_status ?? 'unverified').toUpperCase()}
                </Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="location-outline" size={13} color={C.primary} />
                <Text style={styles.badgeText}>
                  {workerProfile?.service_radius_km ?? 0} km service radius
                </Text>
              </View>
            </View>
          </View>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={20} color={C.red} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{summary?.completedJobs ?? 0}</Text>
            <Text style={styles.statLabel}>Completed jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{summary?.assignedJobs ?? 0}</Text>
            <Text style={styles.statLabel}>Accepted jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{summary?.skills.length ?? 0}</Text>
            <Text style={styles.statLabel}>Evidence skills</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="certificate-outline" size={23} color={C.primary} />
          <View style={styles.flex}>
            <Text style={styles.sectionTitle}>Evidence-backed service skills</Text>
            <Text style={styles.sectionText}>
              Skills appear only after an accepted job reaches Completed status.
            </Text>
          </View>
        </View>

        {!summary || summary.skills.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="progress-wrench" size={34} color={C.muted} />
            <Text style={styles.emptyTitle}>Complete jobs to build evidence</Text>
            <Text style={styles.emptyText}>
              Accepted jobs become Skill Passport evidence after the worker marks them completed.
            </Text>
          </View>
        ) : (
          summary.skills.map(skill => (
            <View key={skill.category} style={styles.skillCard}>
              <View style={styles.skillIcon}>
                <Ionicons name="checkmark-circle" size={22} color={C.green} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.skillName}>{labelFor(skill.category)}</Text>
                <Text style={styles.skillText}>
                  {skill.completedJobs} completed job{skill.completedJobs === 1 ? '' : 's'} recorded as evidence
                </Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{skill.completedJobs}</Text>
              </View>
            </View>
          ))
        )}

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={20} color={C.primary} />
          <Text style={styles.noteText}>
            This passport is derived from ThiKorben transaction history. It does not self-claim skills that have no completed-job evidence.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    minHeight: 66,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: '#fff',
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
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 15,
    paddingBottom: 50,
    gap: 12,
  },
  hero: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderRadius: 20,
    backgroundColor: C.primary,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  avatarText: { fontSize: 25, fontWeight: '900', color: C.primary },
  name: { fontSize: 18, fontWeight: '900', color: '#fff' },
  trade: { marginTop: 2, fontSize: 10.5, textTransform: 'capitalize', color: '#d6d5ff' },
  badges: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  badgeText: { fontSize: 8, fontWeight: '900', color: C.text },
  errorCard: {
    padding: 13,
    flexDirection: 'row',
    gap: 8,
    borderRadius: 14,
    backgroundColor: '#fff0ef',
  },
  errorText: { flex: 1, fontSize: 10, lineHeight: 15, color: C.red },
  stats: { flexDirection: 'row', gap: 9 },
  statCard: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  statValue: { fontSize: 20, fontWeight: '900', color: C.primary },
  statLabel: { marginTop: 3, fontSize: 8.5, color: C.muted },
  sectionHeader: {
    marginTop: 4,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 16,
    backgroundColor: C.primarySoft,
  },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: C.primary },
  sectionText: { marginTop: 2, fontSize: 9.5, lineHeight: 14, color: C.muted },
  emptyCard: {
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 17,
    backgroundColor: '#fff',
  },
  emptyTitle: { marginTop: 8, fontSize: 12, fontWeight: '900', color: C.text },
  emptyText: {
    marginTop: 4,
    maxWidth: 330,
    fontSize: 9.5,
    lineHeight: 15,
    textAlign: 'center',
    color: C.muted,
  },
  skillCard: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    backgroundColor: '#fff',
  },
  skillIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.greenSoft,
  },
  skillName: { fontSize: 11.5, fontWeight: '900', color: C.text },
  skillText: { marginTop: 2, fontSize: 9.5, color: C.muted },
  countBadge: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primarySoft,
  },
  countText: { fontSize: 11, fontWeight: '900', color: C.primary },
  note: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 15,
    backgroundColor: C.greenSoft,
  },
  noteText: { flex: 1, fontSize: 9.5, lineHeight: 15, color: C.muted },
  center: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  centerText: { marginTop: 8, fontSize: 10.5, color: C.muted },
});
