import React, { useState } from 'react';
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
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNavBar } from '@/components/bottom-nav-bar';
import { PageQuickSwitcher } from '@/components/page-quick-switcher';

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

const STRINGS = {
  en: {
    appName: 'ThiKorben',
    tagline: 'Instant Home Services in Dhaka',
    heroTitle: 'Fastest Way to Fix Anything at Home',
    heroSubtitle:
      'Book verified plumbers, electricians, and technicians in under 2 minutes.',
    categoriesTitle: 'Popular Services',
    chooseRole: 'Select How You Want to Continue',
    customerTitle: 'I Need a Service',
    customerDesc: 'Find plumbers, electricians & emergency pros near you.',
    workerTitle: 'I Am a Worker / Pro',
    workerDesc: 'Accept nearby jobs, track earnings & grow your business.',
    verifiedBadge: '100% Verified Pros',
    fastDispatch: '15 Min Fast Dispatch',
    fairPricing: 'Transparent Pricing',
    enterCustomer: 'Enter as Customer',
    enterWorker: 'Enter as Worker',
  },
  bn: {
    appName: 'ঠিককরবেন',
    tagline: 'ঢাকায় দ্রুততম হোম সার্ভিস',
    heroTitle: 'বাসার যেকোনো সমস্যায় দ্রুত সমাধান',
    heroSubtitle:
      'মাত্র ২ মিনিটে বিশ্বস্ত প্লাম্বার, ইলেকট্রিশিয়ান ও টেকনিশিয়ান খুঁজুন।',
    categoriesTitle: 'জনপ্রিয় সেবা সমূহ',
    chooseRole: 'আপনি কীভাবে ব্যবহার করতে চান?',
    customerTitle: 'আমার সার্ভিস প্রয়োজন',
    customerDesc: 'কাছের অভিজ্ঞ প্লাম্বার ও ইলেকট্রিশিয়ান বুক করুন।',
    workerTitle: 'আমি একজন টেকনিশিয়ান / কারিগর',
    workerDesc: 'নতুন কাজের অর্ডার পান ও প্রতিদিন আয় বৃদ্ধি করুন।',
    verifiedBadge: '১০০% ভেরিফাইড প্রফেশনাল',
    fastDispatch: '১৫ মিনিটে দ্রুত সেবা',
    fairPricing: 'স্বচ্ছ মূল্য তালিকা',
    enterCustomer: 'কাস্টমার হিসেবে প্রবেশ করুন',
    enterWorker: 'ওয়ার্কার হিসেবে প্রবেশ করুন',
  },
};

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [lang, setLang] = useState<'en' | 'bn'>('en');

  const t = STRINGS[lang];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ── Top Header ── */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <MaterialIcons name="handyman" size={20} color="#ffffff" />
          </View>
          <Text style={styles.appName}>{t.appName}</Text>
        </View>

        {/* Language Switcher */}
        <View style={styles.langToggle}>
          <TouchableOpacity
            style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}
            onPress={() => setLang('en')}
            activeOpacity={0.8}>
            <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, lang === 'bn' && styles.langBtnActive]}
            onPress={() => setLang('bn')}
            activeOpacity={0.8}>
            <Text style={[styles.langText, lang === 'bn' && styles.langTextActive]}>বাং</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 40 },
        ]}
        showsVerticalScrollIndicator={false}>

        {/* ── Hero Banner ── */}
        <View style={styles.heroSection}>
          <View style={styles.brandPill}>
            <MaterialCommunityIcons name="lightning-bolt" size={14} color={COLORS.accentOrange} />
            <Text style={styles.brandPillText}>{t.tagline}</Text>
          </View>
          <Text style={styles.heroTitle}>{t.heroTitle}</Text>
          <Text style={styles.heroSubtitle}>{t.heroSubtitle}</Text>
        </View>

        {/* ── Popular Categories ── */}
        <View style={styles.bentoGrid}>
          {[
            { label: 'Plumber', icon: 'water-pump', color: '#15157d', bg: '#edeaff' },
            { label: 'Electrician', icon: 'flash', color: '#fd9923', bg: '#fff4e5' },
            { label: 'Carpenter', icon: 'hammer', color: '#059669', bg: '#e6f7f0' },
            { label: 'Sanitary', icon: 'pipe-wrench', color: '#7c3aed', bg: '#f5f0ff' },
          ].map((item) => (
            <View key={item.label} style={styles.bentoCard}>
              <View style={[styles.bentoIconBox, { backgroundColor: item.bg }]}>
                <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={styles.bentoLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Role Selection Cards ── */}
        <Text style={styles.sectionHeading}>{t.chooseRole}</Text>

        <View style={styles.rolesContainer}>
          {/* Customer Card */}
          <TouchableOpacity
            style={styles.roleCardCustomer}
            onPress={() => router.push('/')}
            activeOpacity={0.88}>
            <View style={styles.roleCardTop}>
              <View style={styles.roleIconBoxCustomer}>
                <Ionicons name="person" size={24} color="#ffffff" />
              </View>
              <View style={styles.roleTextCol}>
                <Text style={styles.roleTitle}>{t.customerTitle}</Text>
                <Text style={styles.roleDesc}>{t.customerDesc}</Text>
              </View>
            </View>

            <View style={styles.roleCardActionRow}>
              <Text style={styles.roleActionTextCustomer}>{t.enterCustomer}</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </View>
          </TouchableOpacity>

          {/* Worker Card */}
          <TouchableOpacity
            style={styles.roleCardWorker}
            onPress={() => router.push('/worker-dashboard')}
            activeOpacity={0.88}>
            <View style={styles.roleCardTop}>
              <View style={styles.roleIconBoxWorker}>
                <MaterialCommunityIcons name="hammer-wrench" size={24} color="#ffffff" />
              </View>
              <View style={styles.roleTextCol}>
                <Text style={styles.roleTitle}>{t.workerTitle}</Text>
                <Text style={styles.roleDesc}>{t.workerDesc}</Text>
              </View>
            </View>

            <View style={styles.roleCardActionRow}>
              <Text style={styles.roleActionTextWorker}>{t.enterWorker}</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.accentOrange} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Trust Badges ── */}
        <View style={styles.trustSection}>
          <View style={styles.trustBadge}>
            <MaterialIcons name="verified" size={16} color={COLORS.success} />
            <Text style={styles.trustBadgeText}>{t.verifiedBadge}</Text>
          </View>

          <View style={styles.trustBadge}>
            <MaterialIcons name="timer" size={16} color={COLORS.accentOrange} />
            <Text style={styles.trustBadgeText}>{t.fastDispatch}</Text>
          </View>

          <View style={styles.trustBadge}>
            <MaterialIcons name="price-check" size={16} color={COLORS.primary} />
            <Text style={styles.trustBadgeText}>{t.fairPricing}</Text>
          </View>
        </View>

      </ScrollView>

      {/* ── Unified Bottom Navigation Bar ── */}
      <BottomNavBar activeTab="home" />

      {/* ── Quick Switcher Floating Button ── */}
      <PageQuickSwitcher />
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  langBtnActive: {
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
      android: { elevation: 1 },
      web: { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    }),
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  langTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 18,
  },
  heroSection: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff7ed',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  brandPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentOrange,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 30,
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 340,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  bentoCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bentoIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  bentoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 4,
  },
  rolesContainer: {
    gap: 12,
  },
  roleCardCustomer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#d0ccff',
    ...Platform.select({
      ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 2 },
      web: { boxShadow: '0 4px 12px rgba(21,21,125,0.06)' },
    }),
  },
  roleCardWorker: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    ...Platform.select({
      ios: { shadowColor: COLORS.accentOrange, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 2 },
      web: { boxShadow: '0 4px 12px rgba(247,148,29,0.06)' },
    }),
  },
  roleCardTop: {
    flexDirection: 'row',
    gap: 14,
  },
  roleIconBoxCustomer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconBoxWorker: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.accentOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTextCol: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
  },
  roleDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 3,
    lineHeight: 17,
  },
  roleCardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerLow,
  },
  roleActionTextCustomer: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  roleActionTextWorker: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.accentOrange,
  },
  trustSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  trustBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
});
