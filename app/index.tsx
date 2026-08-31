import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
  onPrimaryContainer: '#9da1ff',
  secondaryContainer: '#fd9923',
  onSecondaryContainer: '#663800',
  secondaryFixed: '#ffdcbf',
  primaryFixed: '#e1e0ff',
  tertiaryFixed: '#ffdbcb',
  accentOrange: '#F7941D',
  background: '#fcf8ff',
  surface: '#ffffff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f5f2fb',
  surfaceContainerHigh: '#eae7f0',
  surfaceDim: '#dbd9e1',
  text: '#1b1b21',
  onSurfaceVariant: '#464652',
  outlineVariant: '#c7c5d4',
  success: '#27AE60',
};

const HERO_ILLUSTRATION_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC3VDnT-CPUdyjnuT4vUh10etA7T5WiPfh63z6V3u33Iqx-_aHnLmrrOrdHQBJaJMuclw05a2r9OIaiMgx01qSfP5N_X_kN4hykB_y8dKMHHDLzZKaznXawhK1G1YmUKmod5mfhTRZjocEJKUpw9Y8pGxh0fKqECqC9Sn_JkZvXQU3KwkLNAlWxLiJsnIF-BGVVvs11NqivfNM-VyV5Vv5cBRMK2X8L9qk-PMZqmMMm39e7ecZoV98nPw';

const RAHIM_AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCv3ndAOA1HXwuXdDv15r5Bfc9c_rxhJyNc2SXzQsu7SuF6OtdDXPeZ_jIU-grZ3O9d4VZ7_K9x7qKeOqpqH6pjTZbPPmTSdjJK2MzxOVaSPjgGqHZwJMKC6h6eJKTNV6aRRU_yvgm5w2L60KMcltF2TyjSfzSbC2yqCiwpGsRgeRxwqS44YOdBOJqmW8D0yi0j3Tb7_ZKpDbdft_DBKHGnIrK9nMnGuAhoe6Ym8J1J3OX6K2SLGLPXOg';

const STRINGS = {
  en: {
    appName: 'ThiKorben',
    heroTitle: 'Need a helping hand?',
    heroSubtitle: 'Find trusted local workers for your everyday needs.',
    chooseRole: 'How would you like to use ThiKorben?',
    customerTitle: "I'm a Customer",
    customerDesc:
      'Find trusted local workers to solve your everyday household problems.',
    workerTitle: "I'm a Worker",
    workerDesc:
      'Find local jobs, build your reputation, and earn more on your schedule.',
    verifiedWorkers: 'Verified Workers',
    localServices: 'Local Services',
    trustedRatings: 'Trusted Ratings',
    plumber: 'Plumber',
    electrician: 'Electrician',
    carpenter: 'Carpenter',
    cleaner: 'Cleaner',
    emergencyBtn: 'Emergency Request',
    activeTracking: 'Rahim is on the way (12 min away)',
  },
  bn: {
    appName: 'ঠিককরবেন',
    heroTitle: 'বাসার যেকোনো কাজে সাহায্য প্রয়োজন?',
    heroSubtitle: 'আপনার এলাকার বিশ্বস্ত প্লাম্বার, ইলেকট্রিশিয়ান ও কারিগর খুঁজুন।',
    chooseRole: 'আপনি কীভাবে ঠিককরবেন ব্যবহার করতে চান?',
    customerTitle: 'আমি একজন কাস্টমার',
    customerDesc: 'দৈনন্দিন বাসার কাজের জন্য দক্ষ ও যাচাইকৃত কর্মী খুঁজুন।',
    workerTitle: 'আমি একজন কারিগর / ওয়ার্কার',
    workerDesc: 'নতুন কাজের অর্ডার গ্রহণ করুন এবং আয় বৃদ্ধি করুন।',
    verifiedWorkers: 'ভেরিফাইড কারিগর',
    localServices: 'স্থানীয় সেবা',
    trustedRatings: 'বিশ্বস্ত রেটিং',
    plumber: 'প্লাম্বার',
    electrician: 'ইলেকট্রিশিয়ান',
    carpenter: 'কার্পেন্টার',
    cleaner: 'ক্লিনার',
    emergencyBtn: 'জরুরি রিকোয়েস্ট',
    activeTracking: 'রহিম আসছেন (১২ মিনিট দূরে)',
  },
};

const PROS = [
  {
    id: 'rahim',
    name: 'Rahim Uddin',
    profession: 'Master Plumber',
    category: 'plumber',
    rating: 4.9,
    reviews: 128,
    jobs: 450,
    distance: '1.2 km',
    price: '৳500',
    avatar: RAHIM_AVATAR_URL,
    specialty: 'Pipe leakage, Sanitary & Motor fix',
  },
  {
    id: 'karim',
    name: 'Karim Mollah',
    profession: 'Senior Electrician',
    category: 'electrician',
    rating: 4.8,
    reviews: 94,
    jobs: 320,
    distance: '2.1 km',
    price: '৳450',
    avatar:
      'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    specialty: 'Wiring, Circuit breaker & Fan repair',
  },
  {
    id: 'kamal',
    name: 'Kamal Hossain',
    profession: 'Expert Carpenter',
    category: 'carpenter',
    rating: 4.7,
    reviews: 76,
    jobs: 210,
    distance: '3.4 km',
    price: '৳600',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    specialty: 'Door locks, Furniture repair & Woodwork',
  },
];

export default function CustomerDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  const t = STRINGS[lang];

  const filteredPros = PROS.filter((pro) => {
    const matchesCategory = !selectedService || pro.category === selectedService;
    const matchesSearch =
      pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBookEmergency = (serviceName: string) => {
    setEmergencyModalOpen(false);
    Alert.alert(
      'Emergency Dispatch Sent!',
      `Searching nearest available worker for "${serviceName}" in Dhanmondi... Rahim has accepted!`,
      [
        {
          text: 'Track Rahim Live',
          onPress: () => router.push('/track-worker'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ── TopAppBar (Header from code.html) ── */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.logoRow}
            onPress={() => setSelectedService(null)}
            activeOpacity={0.8}>
            <View style={styles.logoIcon}>
              <MaterialIcons name="handyman" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.logoText}>{t.appName}</Text>
          </TouchableOpacity>

          <View style={styles.headerRight}>
            {/* Language Selector */}
            <View style={styles.langSelector}>
              <TouchableOpacity
                onPress={() => setLang('bn')}
                style={[styles.langBtn, lang === 'bn' && styles.langBtnActive]}>
                <Text style={[styles.langText, lang === 'bn' && styles.langTextActive]}>
                  বাংলা
                </Text>
              </TouchableOpacity>
              <Text style={styles.langDivider}>|</Text>
              <TouchableOpacity
                onPress={() => setLang('en')}
                style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}>
                <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>
                  English
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 10) + 80 },
        ]}
        showsVerticalScrollIndicator={false}>

        {/* ── Active Live Tracking Floating Banner ── */}
        <TouchableOpacity
          style={styles.activeTrackingCard}
          onPress={() => router.push('/track-worker')}
          activeOpacity={0.9}>
          <View style={styles.pulseDotWrapper}>
            <View style={styles.pulseDot} />
          </View>
          <View style={styles.activeTrackingTextCol}>
            <Text style={styles.activeTrackingTitle}>{t.activeTracking}</Text>
            <Text style={styles.activeTrackingSub}>Tap to view live Leaflet map & status</Text>
          </View>
          <Ionicons name="chevron-forward-circle" size={24} color={COLORS.accentOrange} />
        </TouchableOpacity>

        {/* ── Hero Section ── */}
        <View style={styles.heroSection}>
          <View style={styles.heroImageWrapper}>
            <Image
              source={{ uri: HERO_ILLUSTRATION_URL }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.heroTitle}>{t.heroTitle}</Text>
          <Text style={styles.heroSubtitle}>{t.heroSubtitle}</Text>
        </View>

        {/* ── Search Bar ── */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search plumber, electrician, repairs..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Service Bento Grid ── */}
        <View style={styles.bentoSection}>
          <View style={styles.bentoGrid}>
            {/* Plumber */}
            <TouchableOpacity
              style={[
                styles.bentoCard,
                selectedService === 'plumber' && styles.bentoCardSelected,
              ]}
              onPress={() =>
                setSelectedService(selectedService === 'plumber' ? null : 'plumber')
              }
              activeOpacity={0.85}>
              <View style={[styles.bentoIconBg, { backgroundColor: COLORS.secondaryFixed }]}>
                <MaterialCommunityIcons
                  name="pipe-wrench"
                  size={24}
                  color={COLORS.onSecondaryContainer}
                />
              </View>
              <Text style={styles.bentoLabel}>{t.plumber}</Text>
            </TouchableOpacity>

            {/* Electrician */}
            <TouchableOpacity
              style={[
                styles.bentoCard,
                selectedService === 'electrician' && styles.bentoCardSelected,
              ]}
              onPress={() =>
                setSelectedService(selectedService === 'electrician' ? null : 'electrician')
              }
              activeOpacity={0.85}>
              <View style={[styles.bentoIconBg, { backgroundColor: COLORS.primaryFixed }]}>
                <MaterialIcons name="bolt" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.bentoLabel}>{t.electrician}</Text>
            </TouchableOpacity>

            {/* Carpenter */}
            <TouchableOpacity
              style={[
                styles.bentoCard,
                selectedService === 'carpenter' && styles.bentoCardSelected,
              ]}
              onPress={() =>
                setSelectedService(selectedService === 'carpenter' ? null : 'carpenter')
              }
              activeOpacity={0.85}>
              <View style={[styles.bentoIconBg, { backgroundColor: COLORS.tertiaryFixed }]}>
                <MaterialIcons name="carpenter" size={24} color="#491a00" />
              </View>
              <Text style={styles.bentoLabel}>{t.carpenter}</Text>
            </TouchableOpacity>

            {/* Cleaner */}
            <TouchableOpacity
              style={[
                styles.bentoCard,
                selectedService === 'cleaner' && styles.bentoCardSelected,
              ]}
              onPress={() =>
                setSelectedService(selectedService === 'cleaner' ? null : 'cleaner')
              }
              activeOpacity={0.85}>
              <View style={[styles.bentoIconBg, { backgroundColor: COLORS.surfaceContainerHigh }]}>
                <MaterialIcons
                  name="cleaning-services"
                  size={24}
                  color={COLORS.onSurfaceVariant}
                />
              </View>
              <Text style={styles.bentoLabel}>{t.cleaner}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── User Role Selection Section ── */}
        <View style={styles.roleSection}>
          <Text style={styles.sectionHeaderTitle}>{t.chooseRole}</Text>
          <View style={styles.roleGrid}>
            {/* Customer Card */}
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => setEmergencyModalOpen(true)}
              activeOpacity={0.88}>
              <View style={styles.roleCardTop}>
                <View style={[styles.roleIconBox, { backgroundColor: COLORS.primaryFixed }]}>
                  <MaterialIcons name="person-search" size={26} color={COLORS.primary} />
                </View>
                <View style={styles.roleTextCol}>
                  <Text style={styles.roleCardHeading}>{t.customerTitle}</Text>
                  <Text style={styles.roleCardDesc}>{t.customerDesc}</Text>
                </View>
              </View>

              <View style={styles.roleCardAction}>
                <Text style={styles.roleCardActionText}>{t.emergencyBtn}</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
              </View>
            </TouchableOpacity>

            {/* Worker Card */}
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => router.push('/worker-dashboard')}
              activeOpacity={0.88}>
              <View style={styles.roleCardTop}>
                <View style={[styles.roleIconBox, { backgroundColor: COLORS.secondaryFixed }]}>
                  <MaterialIcons name="work" size={26} color={COLORS.secondaryContainer} />
                </View>
                <View style={styles.roleTextCol}>
                  <Text style={styles.roleCardHeading}>{t.workerTitle}</Text>
                  <Text style={styles.roleCardDesc}>{t.workerDesc}</Text>
                </View>
              </View>

              <View style={styles.roleCardAction}>
                <Text style={[styles.roleCardActionText, { color: COLORS.accentOrange }]}>
                  Open Worker Dashboard
                </Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.accentOrange} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Available Pros Near You List ── */}
        <View style={styles.prosSection}>
          <View style={styles.prosSectionHeader}>
            <View>
              <Text style={styles.prosSectionTitle}>Verified Pros Near You</Text>
              <Text style={styles.prosSectionSubtitle}>
                {selectedService ? `Showing ${selectedService}s` : 'All nearby professionals'}
              </Text>
            </View>
            {selectedService && (
              <TouchableOpacity onPress={() => setSelectedService(null)}>
                <Text style={styles.clearFilterText}>Show All</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.proList}>
            {filteredPros.map((pro) => (
              <TouchableOpacity
                key={pro.id}
                style={styles.proCard}
                onPress={() => router.push('/worker-profile')}
                activeOpacity={0.88}>
                <View style={styles.proCardLeft}>
                  <Image source={{ uri: pro.avatar }} style={styles.proAvatar} />
                  <View style={styles.proOnlineBadge} />
                </View>

                <View style={styles.proInfo}>
                  <View style={styles.proNameRow}>
                    <Text style={styles.proName}>{pro.name}</Text>
                    <MaterialIcons name="verified" size={15} color={COLORS.primary} />
                  </View>
                  <Text style={styles.proProfession}>{pro.profession}</Text>
                  <Text style={styles.proSpecialty} numberOfLines={1}>
                    {pro.specialty}
                  </Text>

                  <View style={styles.proMetaRow}>
                    <View style={styles.ratingBadge}>
                      <MaterialIcons name="star" size={13} color="#eab308" />
                      <Text style={styles.ratingText}>{pro.rating}</Text>
                      <Text style={styles.ratingCount}>({pro.reviews})</Text>
                    </View>
                    <View style={styles.distBadge}>
                      <Ionicons name="location-outline" size={12} color="#6b7280" />
                      <Text style={styles.distText}>{pro.distance}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.proRight}>
                  <Text style={styles.proPrice}>{pro.price}</Text>
                  <Text style={styles.proPriceSub}>per visit</Text>
                  <View style={styles.viewProBtn}>
                    <Text style={styles.viewProBtnText}>View</Text>
                    <Ionicons name="chevron-forward" size={12} color="#ffffff" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Trust Badges (from code.html) ── */}
        <View style={styles.trustSection}>
          <View style={styles.badgeItem}>
            <MaterialIcons name="verified" size={18} color={COLORS.success} />
            <Text style={styles.badgeText}>{t.verifiedWorkers}</Text>
          </View>

          <View style={styles.badgeItem}>
            <MaterialIcons name="location-on" size={18} color={COLORS.primaryContainer} />
            <Text style={styles.badgeText}>{t.localServices}</Text>
          </View>

          <View style={styles.badgeItem}>
            <MaterialIcons name="star" size={18} color={COLORS.secondaryContainer} />
            <Text style={styles.badgeText}>{t.trustedRatings}</Text>
          </View>
        </View>

      </ScrollView>

      {/* ── Unified Bottom Navigation Bar ── */}
      <BottomNavBar activeTab="home" />

      {/* ── Quick Switcher Floating Button ── */}
      <PageQuickSwitcher />

      {/* ── Emergency Request Modal ── */}
      <Modal
        visible={emergencyModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setEmergencyModalOpen(false)}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setEmergencyModalOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalTopRow}>
              <View style={styles.modalTitleRow}>
                <MaterialIcons name="bolt" size={24} color={COLORS.accentOrange} />
                <Text style={styles.modalTitle}>Request Instant Service</Text>
              </View>
              <TouchableOpacity
                onPress={() => setEmergencyModalOpen(false)}
                style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Select service needed right now at Dhanmondi:
            </Text>

            <View style={styles.modalOptions}>
              {[
                { title: 'Plumbing Leak Fix', icon: 'pipe-wrench', price: '৳500' },
                { title: 'Short Circuit & Power Spark', icon: 'flash', price: '৳450' },
                { title: 'Door Jam / Lock Repair', icon: 'key', price: '৳600' },
                { title: 'Water Pump / Motor Issue', icon: 'water-pump', price: '৳550' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.title}
                  style={styles.modalOptionCard}
                  onPress={() => handleBookEmergency(opt.title)}
                  activeOpacity={0.8}>
                  <View style={styles.modalOptionIconBox}>
                    <MaterialCommunityIcons
                      name={opt.icon as any}
                      size={22}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.modalOptionTextCol}>
                    <Text style={styles.modalOptionTitle}>{opt.title}</Text>
                    <Text style={styles.modalOptionPrice}>Fixed visiting fee: {opt.price}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
    zIndex: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  langBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  langBtnActive: {
    backgroundColor: '#ffffff',
  },
  langText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  langTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  langDivider: {
    color: COLORS.outlineVariant,
    fontSize: 11,
    marginHorizontal: 3,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },
  activeTrackingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.accentOrange,
    gap: 10,
    ...Platform.select({
      ios: { shadowColor: COLORS.accentOrange, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6 },
      android: { elevation: 3 },
      web: { boxShadow: '0 4px 12px rgba(247, 148, 29, 0.15)' },
    }),
  },
  pulseDotWrapper: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(247, 148, 29, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.accentOrange,
  },
  activeTrackingTextCol: {
    flex: 1,
  },
  activeTrackingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  activeTrackingSub: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginTop: 1,
  },
  heroSection: {
    alignItems: 'center',
  },
  heroImageWrapper: {
    width: '100%',
    height: 190,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.text,
  },
  bentoSection: {},
  bentoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  bentoCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
      web: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)' },
    }),
  },
  bentoCardSelected: {
    borderColor: COLORS.primaryContainer,
    backgroundColor: '#f4f4ff',
  },
  bentoIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  bentoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  roleSection: {},
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  roleGrid: {
    gap: 12,
  },
  roleCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
      web: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)' },
    }),
  },
  roleCardTop: {
    flexDirection: 'row',
    gap: 12,
  },
  roleIconBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTextCol: {
    flex: 1,
  },
  roleCardHeading: {
    fontSize: 15.5,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 3,
  },
  roleCardDesc: {
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
  },
  roleCardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerLow,
  },
  roleCardActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  prosSection: {},
  prosSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  prosSectionTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: COLORS.text,
  },
  prosSectionSubtitle: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginTop: 1,
  },
  clearFilterText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  proList: {
    gap: 10,
  },
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
  },
  proCardLeft: {
    position: 'relative',
  },
  proAvatar: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  proOnlineBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  proInfo: {
    flex: 1,
  },
  proNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  proName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.text,
  },
  proProfession: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 1,
  },
  proSpecialty: {
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  proMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#fef9c3',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#854d0e',
  },
  ratingCount: {
    fontSize: 8.5,
    color: '#a16207',
  },
  distBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distText: {
    fontSize: 9.5,
    color: COLORS.onSurfaceVariant,
  },
  proRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 54,
  },
  proPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary,
  },
  proPriceSub: {
    fontSize: 8.5,
    color: COLORS.onSurfaceVariant,
    marginBottom: 4,
  },
  viewProBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewProBtnText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  trustSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceDim,
    paddingTop: 16,
    marginBottom: 10,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
    gap: 14,
  },
  modalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.text,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  modalOptions: {
    gap: 8,
  },
  modalOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
  },
  modalOptionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionTextCol: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalOptionPrice: {
    fontSize: 10.5,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
});
