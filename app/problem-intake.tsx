import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const C = {
  primary: '#15157d',
  orange: '#F7941D',
  background: '#f8f7fc',
  surface: '#ffffff',
  text: '#1b1b21',
  muted: '#5b5a68',
  border: '#e6e3ee',
  primarySoft: '#ede9fe',
  orangeSoft: '#fff4e5',
};

export default function ProblemIntakeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.headerTitle}>How can ThiKorben help?</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="tools" size={30} color="#ffffff" />
          </View>
          <Text style={styles.heroTitle}>Tell us what went wrong</Text>
          <Text style={styles.heroText}>
            You can create the service request yourself or let the ThiKorben
            assistant guide you to the right service and worker.
          </Text>
        </View>

        <Pressable
          style={styles.optionCard}
          onPress={() =>
            router.push({
              pathname: '/job-board',
              params: { mode: 'create' },
            })
          }
        >
          <View style={[styles.optionIcon, { backgroundColor: C.primarySoft }]}>
            <Ionicons name="create-outline" size={26} color={C.primary} />
          </View>

          <View style={styles.flex}>
            <Text style={styles.optionTitle}>I will create the request myself</Text>
            <Text style={styles.optionText}>
              Choose the service category, describe the problem, add your
              budget and location, then publish it to the community.
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color={C.primary} />
        </Pressable>

        <Pressable
          style={[styles.optionCard, styles.aiCard]}
          onPress={() => router.push('/ai-assistant' as Href)}
        >
          <View style={[styles.optionIcon, { backgroundColor: C.orangeSoft }]}>
            <Ionicons name="sparkles" size={26} color={C.orange} />
          </View>

          <View style={styles.flex}>
            <View style={styles.aiTitleRow}>
              <Text style={styles.optionTitle}>Ask ThiKorben AI to help me</Text>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            </View>

            <Text style={styles.optionText}>
              Describe the issue in Bangla, Banglish, or English. Add a photo,
              get a likely service category, and review nearby worker options.
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color={C.orange} />
        </Pressable>

        <View style={styles.guardrail}>
          <Ionicons name="shield-checkmark-outline" size={21} color={C.primary} />
          <Text style={styles.guardrailText}>
            AI can help organize the problem, but you decide what gets
            published and which worker gets selected.
          </Text>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: '#ffffff',
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 15, fontWeight: '900', color: C.text },
  headerSpacer: { width: 40 },
  content: { padding: 18, paddingBottom: 40, gap: 13 },
  hero: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: C.primary,
  },
  heroIcon: {
    width: 58,
    height: 58,
    marginBottom: 13,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
  },
  heroText: {
    marginTop: 6,
    maxWidth: 380,
    fontSize: 11.5,
    lineHeight: 18,
    color: '#dfdeff',
    textAlign: 'center',
  },
  optionCard: {
    minHeight: 132,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#d6d1ff',
    borderRadius: 20,
    backgroundColor: C.surface,
  },
  aiCard: { borderColor: '#fed7aa' },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: { fontSize: 13.5, fontWeight: '900', color: C.text },
  optionText: {
    marginTop: 5,
    fontSize: 10.5,
    lineHeight: 16,
    color: C.muted,
  },
  aiTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: C.orangeSoft,
  },
  aiBadgeText: { fontSize: 8, fontWeight: '900', color: C.orange },
  guardrail: {
    padding: 14,
    flexDirection: 'row',
    gap: 9,
    borderRadius: 15,
    backgroundColor: C.primarySoft,
  },
  guardrailText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 15,
    color: C.muted,
  },
});
