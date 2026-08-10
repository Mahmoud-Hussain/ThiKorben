import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThiKorbenTheme } from '@/constants/theme';

type Language = 'en' | 'bn';
type Role = 'customer' | 'worker' | null;
type Category = 'plumber' | 'electrician' | 'carpenter' | 'cleaner' | null;

const translations = {
  en: {
    appName: 'ThiKorben',
    heroTitle: 'Need a\nhelping hand?',
    heroSubtitle: 'Find trusted local workers for your everyday needs.',
    plumber: 'Plumber',
    electrician: 'Electrician',
    carpenter: 'Carpenter',
    cleaner: 'Cleaner',
    roleHeader: 'How would you like to use ThiKorben?',
    customerTitle: "I'm a Customer",
    customerDesc: 'Find trusted local workers to solve your everyday household problems.',
    workerTitle: "I'm a Worker",
    workerDesc: 'Find local jobs, build your reputation, and earn more on your schedule.',
    verifiedWorkers: 'Verified Workers',
    localServices: 'Local Services',
    trustedRatings: 'Trusted Ratings',
    continueAsCustomer: 'Continue as Customer',
    continueAsWorker: 'Continue as Worker',
    findWorkersFor: 'Find nearby',
    clearSelection: 'Clear',
  },
  bn: {
    appName: 'ThiKorben',
    heroTitle: 'আপনার কি\nসাহায্য দরকার?',
    heroSubtitle: 'আপনার দৈনন্দিন প্রয়োজনে বিশ্বস্ত স্থানীয় কর্মী খুঁজুন।',
    plumber: 'প্লাম্বার',
    electrician: 'ইলেকট্রিশিয়ান',
    carpenter: 'কাঠমিস্ত্রি',
    cleaner: 'ক্লিনার',
    roleHeader: 'আপনি কিভাবে ThiKorben ব্যবহার করতে চান?',
    customerTitle: 'আমি গ্রাহক',
    customerDesc: 'আপনার ঘরের সমস্যাগুলো সমাধানের জন্য স্থানীয় কর্মী খুঁজুন।',
    workerTitle: 'আমি কর্মী',
    workerDesc: 'স্থানীয় কাজ খুঁজুন, সুনাম তৈরি করুন এবং আপনার সুবিধাজনক সময়ে আয় করুন।',
    verifiedWorkers: 'যাচাইকৃত কর্মী',
    localServices: 'স্থানীয় সেবা',
    trustedRatings: 'বিশ্বস্ত রেটিং',
    continueAsCustomer: 'গ্রাহক হিসেবে এগিয়ে যান',
    continueAsWorker: 'কর্মী হিসেবে এগিয়ে যান',
    findWorkersFor: 'নিকটস্থ খুঁজুন:',
    clearSelection: 'মুছে ফেলুন',
  },
};

const HERO_IMAGE_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC3VDnT-CPUdyjnuT4vUh10etA7T5WiPfh63z6V3u33Iqx-_aHnLmrrOrdHQBJaJMuclw05a2r9OIaiMgx01qSfP5N_X_kN4hykB_y8dKMHHDLzZKaznXawhK1G1YmUKmod5mfhTRZjocEJKUpw9Y8pGxh0fKqECqC9Sn_JkZvXQU3KwkLNAlWxLiJsnIF-BGVVvs11NqivfNM-VyV5Vv5cBRMK2X8L9qk-PMZqmMMm39e7ecZoV98nPw';

export default function WelcomeScreen() {
  const [lang, setLang] = useState<Language>('en');
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);
  const { width } = useWindowDimensions();

  const t = translations[lang];
  const isLargeScreen = width >= 768;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.logoRow}>
            <MaterialIcons name="handyman" size={26} color={ThiKorbenTheme.primary} />
            <Text style={styles.logoText}>{t.appName}</Text>
          </View>

          {/* Language Selector */}
          <View style={styles.langSelectorContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setLang('bn')}
              style={[
                styles.langButton,
                lang === 'bn' && styles.langButtonActive,
              ]}>
              <Text
                style={[
                  styles.langText,
                  lang === 'bn' && styles.langTextActive,
                ]}>
                বাংলা
              </Text>
            </TouchableOpacity>

            <Text style={styles.langDivider}>|</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setLang('en')}
              style={[
                styles.langButton,
                lang === 'en' && styles.langButtonActive,
              ]}>
              <Text
                style={[
                  styles.langText,
                  lang === 'en' && styles.langTextActive,
                ]}>
                English
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={[styles.container, isLargeScreen && styles.containerLarge]}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroImageWrapper}>
              <Image
                source={{ uri: HERO_IMAGE_URL }}
                style={styles.heroImage}
                contentFit="cover"
                transition={300}
              />
            </View>
            <Text style={styles.heroTitle}>{t.heroTitle}</Text>
            <Text style={styles.heroSubtitle}>{t.heroSubtitle}</Text>
          </View>

          {/* Bento Grid Service Icons */}
          <View style={styles.bentoSection}>
            <View style={styles.bentoGrid}>
              {/* Plumber */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedCategory('plumber')}
                style={[
                  styles.bentoCard,
                  selectedCategory === 'plumber' && styles.bentoCardActive,
                ]}>
                <View
                  style={[
                    styles.bentoIconBg,
                    { backgroundColor: ThiKorbenTheme.secondaryFixed },
                  ]}>
                  <MaterialIcons
                    name="plumbing"
                    size={24}
                    color={ThiKorbenTheme.onSecondaryContainer}
                  />
                </View>
                <Text style={styles.bentoLabel}>{t.plumber}</Text>
              </TouchableOpacity>

              {/* Electrician */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedCategory('electrician')}
                style={[
                  styles.bentoCard,
                  selectedCategory === 'electrician' && styles.bentoCardActive,
                ]}>
                <View
                  style={[
                    styles.bentoIconBg,
                    { backgroundColor: ThiKorbenTheme.primaryFixed },
                  ]}>
                  <MaterialIcons
                    name="bolt"
                    size={24}
                    color={ThiKorbenTheme.primary}
                  />
                </View>
                <Text style={styles.bentoLabel}>{t.electrician}</Text>
              </TouchableOpacity>

              {/* Carpenter */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedCategory('carpenter')}
                style={[
                  styles.bentoCard,
                  selectedCategory === 'carpenter' && styles.bentoCardActive,
                ]}>
                <View
                  style={[
                    styles.bentoIconBg,
                    { backgroundColor: ThiKorbenTheme.tertiaryFixed },
                  ]}>
                  <MaterialIcons
                    name="carpenter"
                    size={24}
                    color={ThiKorbenTheme.tertiary}
                  />
                </View>
                <Text style={styles.bentoLabel}>{t.carpenter}</Text>
              </TouchableOpacity>

              {/* Cleaner */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedCategory('cleaner')}
                style={[
                  styles.bentoCard,
                  selectedCategory === 'cleaner' && styles.bentoCardActive,
                ]}>
                <View
                  style={[
                    styles.bentoIconBg,
                    { backgroundColor: ThiKorbenTheme.surfaceContainerHigh },
                  ]}>
                  <MaterialIcons
                    name="cleaning-services"
                    size={24}
                    color={ThiKorbenTheme.onSurfaceVariant}
                  />
                </View>
                <Text style={styles.bentoLabel}>{t.cleaner}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* User Role Selection */}
          <View style={styles.roleSection}>
            <Text style={styles.roleHeader}>{t.roleHeader}</Text>
            <View style={[styles.roleGrid, isLargeScreen && styles.roleGridLarge]}>
              {/* Customer Card */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setSelectedRole('customer')}
                style={[
                  styles.roleCard,
                  selectedRole === 'customer' && styles.roleCardActiveCustomer,
                ]}>
                <View>
                  <View
                    style={[
                      styles.roleIconBg,
                      { backgroundColor: ThiKorbenTheme.primaryFixed },
                    ]}>
                    <MaterialIcons
                      name="person-search"
                      size={26}
                      color={ThiKorbenTheme.primary}
                    />
                  </View>
                  <Text style={styles.roleTitle}>{t.customerTitle}</Text>
                  <Text style={styles.roleDesc}>{t.customerDesc}</Text>
                </View>
                <View style={styles.roleArrowRow}>
                  <MaterialIcons
                    name="arrow-forward"
                    size={20}
                    color={ThiKorbenTheme.primary}
                  />
                </View>
              </TouchableOpacity>

              {/* Worker Card */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setSelectedRole('worker')}
                style={[
                  styles.roleCard,
                  selectedRole === 'worker' && styles.roleCardActiveWorker,
                ]}>
                <View>
                  <View
                    style={[
                      styles.roleIconBg,
                      { backgroundColor: ThiKorbenTheme.secondaryFixed },
                    ]}>
                    <MaterialIcons
                      name="work"
                      size={26}
                      color={ThiKorbenTheme.secondary}
                    />
                  </View>
                  <Text style={styles.roleTitle}>{t.workerTitle}</Text>
                  <Text style={styles.roleDesc}>{t.workerDesc}</Text>
                </View>
                <View style={styles.roleArrowRow}>
                  <MaterialIcons
                    name="arrow-forward"
                    size={20}
                    color={ThiKorbenTheme.secondary}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Trust Badges */}
          <View style={styles.trustSection}>
            <View style={styles.badgeRow}>
              <View style={styles.badgeItem}>
                <MaterialIcons
                  name="verified"
                  size={18}
                  color={ThiKorbenTheme.verifiedGreen}
                />
                <Text style={styles.badgeText}>{t.verifiedWorkers}</Text>
              </View>

              <View style={styles.badgeItem}>
                <MaterialIcons
                  name="location-on"
                  size={18}
                  color={ThiKorbenTheme.primaryContainer}
                />
                <Text style={styles.badgeText}>{t.localServices}</Text>
              </View>

              <View style={styles.badgeItem}>
                <MaterialIcons
                  name="star"
                  size={18}
                  color={ThiKorbenTheme.secondaryContainer}
                />
                <Text style={styles.badgeText}>{t.trustedRatings}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ThiKorbenTheme.background,
  },
  headerContainer: {
    backgroundColor: ThiKorbenTheme.surface,
    borderBottomWidth: 1,
    borderBottomColor: ThiKorbenTheme.surfaceContainer,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 64,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: ThiKorbenTheme.primary,
    letterSpacing: -0.5,
  },
  langSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ThiKorbenTheme.surfaceContainerLow,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: ThiKorbenTheme.outlineVariant,
  },
  langButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  langButtonActive: {
    backgroundColor: ThiKorbenTheme.surfaceContainerLowest,
  },
  langText: {
    fontSize: 12,
    fontWeight: '500',
    color: ThiKorbenTheme.onSurfaceVariant,
  },
  langTextActive: {
    color: ThiKorbenTheme.primary,
    fontWeight: '700',
  },
  langDivider: {
    color: ThiKorbenTheme.outlineVariant,
    fontSize: 12,
    marginHorizontal: 2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    maxWidth: 768,
    width: '100%',
    alignSelf: 'center',
  },
  containerLarge: {
    paddingTop: 32,
  },

  /* Hero Section */
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroImageWrapper: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: ThiKorbenTheme.surfaceContainerLow,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: ThiKorbenTheme.onBackground,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: ThiKorbenTheme.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 400,
  },

  /* Bento Grid */
  bentoSection: {
    marginBottom: 36,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  bentoCard: {
    width: '23%',
    minWidth: 72,
    flexGrow: 1,
    backgroundColor: ThiKorbenTheme.surfaceContainerLowest,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ThiKorbenTheme.surfaceContainer,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  bentoCardActive: {
    borderColor: ThiKorbenTheme.primaryContainer,
    borderWidth: 1.5,
  },
  bentoIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bentoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: ThiKorbenTheme.onBackground,
    textAlign: 'center',
  },

  /* User Role Section */
  roleSection: {
    marginBottom: 36,
  },
  roleHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: ThiKorbenTheme.onBackground,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 26,
  },
  roleGrid: {
    gap: 16,
  },
  roleGridLarge: {
    flexDirection: 'row',
  },
  roleCard: {
    flex: 1,
    backgroundColor: ThiKorbenTheme.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 160,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  roleCardActiveCustomer: {
    borderColor: ThiKorbenTheme.primaryContainer,
    backgroundColor: ThiKorbenTheme.surfaceContainerLow,
  },
  roleCardActiveWorker: {
    borderColor: ThiKorbenTheme.secondaryContainer,
    backgroundColor: ThiKorbenTheme.surfaceContainerLow,
  },
  roleIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ThiKorbenTheme.onBackground,
    marginBottom: 6,
  },
  roleDesc: {
    fontSize: 14,
    lineHeight: 20,
    color: ThiKorbenTheme.onSurfaceVariant,
  },
  roleArrowRow: {
    alignItems: 'flex-end',
    marginTop: 12,
  },

  /* Trust Badges */
  trustSection: {
    borderTopWidth: 1,
    borderTopColor: ThiKorbenTheme.surfaceDim,
    paddingTop: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ThiKorbenTheme.surfaceContainerLow,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: ThiKorbenTheme.outlineVariant,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: ThiKorbenTheme.onBackground,
  },
});
