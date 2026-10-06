import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSession } from '@/contexts/session-context';

const C = {
  primary: '#15157d',
  orange: '#F7941D',
  bg: '#f8f7fc',
  card: '#fff',
  text: '#1b1b21',
  muted: '#626171',
  border: '#e6e3ee',
  purpleSoft: '#eeedff',
  orangeSoft: '#fff4e7',
  green: '#178c4f',
  greenSoft: '#eaf8f0',
};

const COPY = {
  en: {
    tagline: 'Service work, organized from request to completion',
    title: 'Get the right local help with clear decisions at every step',
    subtitle:
      'Create a structured service request, compare worker proposals, chat privately, approve materials, and follow job progress in one place.',
    start: 'Get Started',
    continue: 'Continue to ThiKorben',
    login: 'Sign In',
    customer: 'Customer workflow',
    worker: 'Worker workflow',
    community: 'Community marketplace',
  },
  bn: {
    tagline: 'রিকোয়েস্ট থেকে কাজ শেষ হওয়া পর্যন্ত একটি পরিষ্কার সার্ভিস ফ্লো',
    title: 'বাসার সমস্যার জন্য সঠিক স্থানীয় কর্মী খুঁজুন, প্রতিটি সিদ্ধান্ত আপনার নিয়ন্ত্রণে',
    subtitle:
      'সার্ভিস রিকোয়েস্ট তৈরি করুন, ওয়ার্কারের প্রপোজাল তুলনা করুন, প্রাইভেট চ্যাট করুন, প্রয়োজনীয় উপকরণ অনুমোদন করুন এবং কাজের অগ্রগতি দেখুন।',
    start: 'শুরু করুন',
    continue: 'ThiKorben এ যান',
    login: 'সাইন ইন',
    customer: 'কাস্টমার ফ্লো',
    worker: 'ওয়ার্কার ফ্লো',
    community: 'কমিউনিটি মার্কেটপ্লেস',
  },
};

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, role, customerProfile, workerProfile } = useSession();
  const [lang, setLang] = useState<'en' | 'bn'>('en');

  const t = COPY[lang];

  const continueRoute =
    role === 'worker'
      ? workerProfile
        ? '/worker-dashboard'
        : '/worker-profile-setup'
      : customerProfile
        ? '/customer-dashboard'
        : '/customer-profile-setup';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <MaterialIcons name="handyman" size={21} color="#fff" />
          </View>
          <View>
            <Text style={styles.brand}>ThiKorben</Text>
            <Text style={styles.brandSub}>Shop. Fix. Work. Grow.</Text>
          </View>
        </View>

        <View style={styles.language}>
          <TouchableOpacity
            style={[styles.languageButton, lang === 'en' && styles.languageActive]}
            onPress={() => setLang('en')}
          >
            <Text style={[styles.languageText, lang === 'en' && styles.languageTextActive]}>
              EN
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.languageButton, lang === 'bn' && styles.languageActive]}
            onPress={() => setLang('bn')}
          >
            <Text style={[styles.languageText, lang === 'bn' && styles.languageTextActive]}>
              বাংলা
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroPill}>
            <Ionicons name="shield-checkmark" size={14} color={C.orange} />
            <Text style={styles.heroPillText}>{t.tagline}</Text>
          </View>

          <Text style={styles.heroTitle}>{t.title}</Text>
          <Text style={styles.heroSubtitle}>{t.subtitle}</Text>

          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                router.push(isAuthenticated ? continueRoute : '/auth/signup')
              }
              activeOpacity={0.88}
            >
              <Text style={styles.primaryButtonText}>
                {isAuthenticated ? t.continue : t.start}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>

            {!isAuthenticated ? (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push('/auth/login')}
                activeOpacity={0.88}
              >
                <Text style={styles.secondaryButtonText}>{t.login}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: C.purpleSoft }]}>
              <Ionicons name="document-text-outline" size={23} color={C.primary} />
            </View>
            <Text style={styles.featureTitle}>Structured Requests</Text>
            <Text style={styles.featureText}>
              Customers publish clear service needs with category, budget, location label, and timing.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: C.orangeSoft }]}>
              <Ionicons name="people-outline" size={23} color={C.orange} />
            </View>
            <Text style={styles.featureTitle}>Worker Proposals</Text>
            <Text style={styles.featureText}>
              Workers submit labor price and availability. Customers choose the proposal they want.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: C.greenSoft }]}>
              <Ionicons name="chatbubbles-outline" size={23} color={C.green} />
            </View>
            <Text style={styles.featureTitle}>Private Job Chat</Text>
            <Text style={styles.featureText}>
              Accepted customer-worker pairs receive a secure job-specific conversation.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: C.purpleSoft }]}>
              <Ionicons name="cart-outline" size={23} color={C.primary} />
            </View>
            <Text style={styles.featureTitle}>Material Approval</Text>
            <Text style={styles.featureText}>
              Workers request catalog items with reasons. Customers approve or reject before purchase.
            </Text>
          </View>
        </View>

        <View style={styles.flowCard}>
          <View style={styles.flowHeader}>
            <MaterialCommunityIcons name="transit-connection-variant" size={24} color={C.primary} />
            <View style={styles.flex}>
              <Text style={styles.flowTitle}>One connected service lifecycle</Text>
              <Text style={styles.flowText}>Built around real authorization and explicit human decisions.</Text>
            </View>
          </View>

          <View style={styles.flowSteps}>
            {[
              ['1', 'Post'],
              ['2', 'Proposal'],
              ['3', 'Accept'],
              ['4', 'Chat'],
              ['5', 'Materials'],
              ['6', 'Complete'],
            ].map(([number, label], index) => (
              <View key={number} style={styles.flowStepWrap}>
                <View style={styles.flowStep}>
                  <Text style={styles.flowStepNumber}>{number}</Text>
                </View>
                <Text style={styles.flowStepLabel}>{label}</Text>
                {index < 5 ? <View style={styles.flowLine} /> : null}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.roles}>
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() =>
              router.push(isAuthenticated ? '/customer-dashboard' : '/auth/signup')
            }
            activeOpacity={0.88}
          >
            <View style={[styles.roleIcon, { backgroundColor: C.primary }]}>
              <Ionicons name="person" size={23} color="#fff" />
            </View>
            <View style={styles.flex}>
              <Text style={styles.roleTitle}>{t.customer}</Text>
              <Text style={styles.roleText}>
                Create requests, compare proposals, approve materials, follow progress.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={C.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() =>
              router.push(isAuthenticated ? '/worker-dashboard' : '/auth/signup')
            }
            activeOpacity={0.88}
          >
            <View style={[styles.roleIcon, { backgroundColor: C.orange }]}>
              <MaterialCommunityIcons name="hammer-wrench" size={23} color="#fff" />
            </View>
            <View style={styles.flex}>
              <Text style={styles.roleTitle}>{t.worker}</Text>
              <Text style={styles.roleText}>
                Find suitable jobs, submit proposals, chat, request materials, complete work.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={C.orange} />
          </TouchableOpacity>
        </View>

        {isAuthenticated ? (
          <TouchableOpacity
            style={styles.communityButton}
            onPress={() => router.push('/community')}
          >
            <Ionicons name="people" size={20} color={C.primary} />
            <Text style={styles.communityText}>{t.community}</Text>
            <Ionicons name="arrow-forward" size={18} color={C.primary} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.principle}>
          <Ionicons name="hand-left-outline" size={22} color={C.primary} />
          <View style={styles.flex}>
            <Text style={styles.principleTitle}>AI assists. People decide.</Text>
            <Text style={styles.principleText}>
              ThiKorben is designed so publishing, worker selection, material approval, and transaction decisions remain explicit human actions.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    minHeight: 68,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: '#fff',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logo: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
  },
  brand: { fontSize: 17, fontWeight: '900', color: C.primary },
  brandSub: { marginTop: 1, fontSize: 8.5, color: C.muted },
  language: {
    padding: 3,
    flexDirection: 'row',
    borderRadius: 999,
    backgroundColor: C.bg,
  },
  languageButton: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999 },
  languageActive: { backgroundColor: '#fff' },
  languageText: { fontSize: 9.5, fontWeight: '700', color: C.muted },
  languageTextActive: { color: C.primary },
  content: {
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 60,
    gap: 18,
  },
  hero: { paddingVertical: 18, alignItems: 'center' },
  heroPill: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#f5d7b1',
    borderRadius: 999,
    backgroundColor: C.orangeSoft,
  },
  heroPillText: { fontSize: 9.5, fontWeight: '800', color: C.orange },
  heroTitle: {
    marginTop: 16,
    maxWidth: 720,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '900',
    textAlign: 'center',
    color: C.text,
  },
  heroSubtitle: {
    marginTop: 10,
    maxWidth: 650,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: C.muted,
  },
  heroActions: { marginTop: 20, flexDirection: 'row', gap: 9 },
  primaryButton: {
    minHeight: 49,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  primaryButtonText: { fontSize: 11.5, fontWeight: '900', color: '#fff' },
  secondaryButton: {
    minHeight: 49,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  secondaryButtonText: { fontSize: 11.5, fontWeight: '900', color: C.primary },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureCard: {
    minWidth: 210,
    flex: 1,
    minHeight: 160,
    padding: 15,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    backgroundColor: '#fff',
    ...Platform.select({
      web: { boxShadow: '0 5px 18px rgba(21,21,125,0.04)' },
    }),
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: { marginTop: 11, fontSize: 12.5, fontWeight: '900', color: C.text },
  featureText: { marginTop: 5, fontSize: 9.5, lineHeight: 15, color: C.muted },
  flowCard: {
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    backgroundColor: C.bg,
  },
  flowHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flowTitle: { fontSize: 13.5, fontWeight: '900', color: C.text },
  flowText: { marginTop: 2, fontSize: 9.5, color: C.muted },
  flowSteps: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  flowStepWrap: { flex: 1, alignItems: 'center', position: 'relative' },
  flowStep: {
    width: 34,
    height: 34,
    zIndex: 2,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
  },
  flowStepNumber: { fontSize: 10, fontWeight: '900', color: '#fff' },
  flowStepLabel: { marginTop: 6, fontSize: 8.5, fontWeight: '800', color: C.text },
  flowLine: {
    position: 'absolute',
    top: 16,
    left: '66%',
    width: '68%',
    height: 2,
    backgroundColor: '#d7d3e4',
  },
  roles: { gap: 10 },
  roleCard: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 17,
    backgroundColor: '#fff',
  },
  roleIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTitle: { fontSize: 12.5, fontWeight: '900', color: C.text },
  roleText: { marginTop: 3, fontSize: 9.5, lineHeight: 14, color: C.muted },
  communityButton: {
    minHeight: 50,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: C.primarySoft,
  },
  communityText: { flex: 1, fontSize: 11, fontWeight: '900', color: C.primary },
  principle: {
    padding: 15,
    flexDirection: 'row',
    gap: 10,
    borderRadius: 16,
    backgroundColor: C.greenSoft,
  },
  principleTitle: { fontSize: 11.5, fontWeight: '900', color: C.green },
  principleText: { marginTop: 3, fontSize: 9.5, lineHeight: 15, color: C.muted },
});
