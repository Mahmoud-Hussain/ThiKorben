import React, { useState } from 'react';
import {
  Alert,
  Image,
  Linking,
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
import { LeafletMap } from '@/components/leaflet-map';
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

const RAHIM_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCv3ndAOA1HXwuXdDv15r5Bfc9c_rxhJyNc2SXzQsu7SuF6OtdDXPeZ_jIU-grZ3O9d4VZ7_K9x7qKeOqpqH6pjTZbPPmTSdjJK2MzxOVaSPjgGqHZwJMKC6h6eJKTNV6aRRU_yvgm5w2L60KMcltF2TyjSfzSbC2yqCiwpGsRgeRxwqS44YOdBOJqmW8D0yi0j3Tb7_ZKpDbdft_DBKHGnIrK9nMnGuAhoe6Ym8J1J3OX6K2SLGLPXOg';

const SKILLS = [
  'Pipe Leakage Repair',
  'Sanitary & Basin Fitting',
  'Water Pump & Motor',
  'Bathroom Drain Cleaning',
  'Water Heater / Geyser',
  'Emergency Valve Fix',
];

const REVIEWS = [
  {
    id: 'r1',
    name: 'Nusrat Ahmed',
    rating: 5,
    date: 'Yesterday',
    comment: 'Rahim bhai came in just 12 minutes. Fixed our leaking kitchen pipe cleanly with proper seals. Highly recommended!',
  },
  {
    id: 'r2',
    name: 'Tanvir Rahman',
    rating: 5,
    date: '3 days ago',
    comment: 'Very polite, brought high quality PPR pipe replacement, transparent pricing without hidden charges.',
  },
  {
    id: 'r3',
    name: 'Shamim Hossain',
    rating: 4.8,
    date: '1 week ago',
    comment: 'Emergency water motor issue solved at night in Dhanmondi. Saved the day!',
  },
];

export default function WorkerProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleCall = () => {
    Linking.openURL('tel:+8801700000000').catch(() => {
      Alert.alert('Call Worker', 'Calling Rahim Uddin (+880 1700-000000)...');
    });
  };

  const handleBookWorker = () => {
    Alert.alert(
      'Confirm Booking with Rahim',
      'Rahim Uddin has accepted your request for Dhanmondi. He is preparing tools and starting trip!',
      [
        {
          text: 'Go to Live Tracking',
          onPress: () => router.push('/track-worker'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ── Top Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Worker Profile</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setIsFavorite(!isFavorite)}
            activeOpacity={0.7}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? '#ef4444' : COLORS.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 90 },
        ]}
        showsVerticalScrollIndicator={false}>

        {/* ── Hero Profile Card ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: RAHIM_AVATAR }} style={styles.avatar} />
              <View style={styles.onlineBadge} />
            </View>

            <View style={styles.nameBlock}>
              <View style={styles.nameRow}>
                <Text style={styles.workerName}>Rahim Uddin</Text>
                <MaterialIcons name="verified" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.profession}>Master Plumber & Sanitary Expert</Text>
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={16} color="#eab308" />
                <Text style={styles.ratingNum}>4.9</Text>
                <Text style={styles.reviewsCount}>(128 Verified Reviews)</Text>
              </View>
            </View>
          </View>

          {/* Quick Stats Grid */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialIcons name="task-alt" size={20} color={COLORS.primary} />
              <Text style={styles.statVal}>450+</Text>
              <Text style={styles.statLbl}>Jobs Done</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="shield-star" size={20} color={COLORS.accentOrange} />
              <Text style={styles.statVal}>99%</Text>
              <Text style={styles.statLbl}>On-Time</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="military-tech" size={20} color={COLORS.success} />
              <Text style={styles.statVal}>5 Yrs</Text>
              <Text style={styles.statLbl}>Experience</Text>
            </View>
          </View>
        </View>

        {/* ── Pricing & Service Rate Card ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Standard Pricing</Text>
          <View style={styles.priceRow}>
            <View style={styles.priceLeft}>
              <Text style={styles.priceCurrency}>৳</Text>
              <Text style={styles.priceValue}>500</Text>
              <Text style={styles.priceUnit}>/ visit</Text>
            </View>
            <View style={styles.negotiablePill}>
              <Ionicons name="checkmark-circle" size={13} color={COLORS.success} />
              <Text style={styles.negotiableText}>Includes Inspection & Minor Fixes</Text>
            </View>
          </View>
          <Text style={styles.priceNote}>
            Parts and major pipe replacements are quoted upfront before starting work.
          </Text>
        </View>

        {/* ── Skills & Specialization ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Skills & Specialization</Text>
          <View style={styles.skillsWrap}>
            {SKILLS.map((skill) => (
              <View key={skill} style={styles.skillChip}>
                <MaterialCommunityIcons name="check-decagram" size={14} color={COLORS.primary} />
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Service Coverage Area Map ── */}
        <View style={styles.sectionCard}>
          <View style={styles.mapHeaderRow}>
            <View>
              <Text style={styles.sectionHeading}>Active Coverage Area</Text>
              <Text style={styles.sectionSubheading}>Dhanmondi, Lalmatia, Mohammadpur, Mirpur</Text>
            </View>
            <View style={styles.etaPill}>
              <Ionicons name="time" size={12} color={COLORS.accentOrange} />
              <Text style={styles.etaPillText}>10-15m ETA</Text>
            </View>
          </View>

          <View style={styles.mapWrapper}>
            <LeafletMap
              workerLat={23.7700}
              workerLng={90.3600}
              customerLat={23.7639}
              customerLng={90.3589}
              style={styles.mapView}
            />
          </View>
        </View>

        {/* ── Customer Reviews ── */}
        <View style={styles.sectionCard}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionHeading}>Verified Reviews (128)</Text>
            <View style={styles.starRow}>
              <MaterialIcons name="star" size={16} color="#eab308" />
              <Text style={styles.overallRating}>4.9 / 5.0</Text>
            </View>
          </View>

          <View style={styles.reviewsList}>
            {REVIEWS.map((rev) => (
              <View key={rev.id} style={styles.reviewItem}>
                <View style={styles.reviewTop}>
                  <Text style={styles.reviewerName}>{rev.name}</Text>
                  <Text style={styles.reviewDate}>{rev.date}</Text>
                </View>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <MaterialIcons key={s} name="star" size={13} color="#eab308" />
                  ))}
                </View>
                <Text style={styles.reviewText}>{rev.comment}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* ── Sticky Bottom Action Bar ── */}
      <View style={[styles.bottomBar, { bottom: 64 + Math.max(insets.bottom, 10) }]}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Visiting Fee</Text>
          <View style={styles.bottomPriceRow}>
            <Text style={styles.bottomPrice}>৳500</Text>
            <Text style={styles.bottomPriceSub}>/ visit</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.callWorkerBtn}
          onPress={handleCall}
          activeOpacity={0.8}>
          <Ionicons name="call" size={18} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookWorkerBtn}
          onPress={handleBookWorker}
          activeOpacity={0.88}>
          <MaterialIcons name="handyman" size={18} color="#ffffff" />
          <Text style={styles.bookWorkerText}>Book Rahim Now</Text>
        </TouchableOpacity>
      </View>

      {/* ── Unified Bottom Navigation Bar ── */}
      <BottomNavBar activeTab="pros" />

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
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 14,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 10px rgba(0,0,0,0.04)' },
    }),
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 2.5,
    borderColor: '#ffffff',
  },
  nameBlock: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  workerName: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.text,
  },
  profession: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  ratingNum: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#854d0e',
  },
  reviewsCount: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerLow,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 4,
  },
  statLbl: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubheading: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceCurrency: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  priceValue: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 3,
  },
  negotiablePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  negotiableText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.success,
  },
  priceNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 8,
    lineHeight: 16,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.purpleSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  skillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.purpleDark,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  etaPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.accentOrange,
  },
  mapWrapper: {
    height: 150,
    borderRadius: 14,
    overflow: 'hidden',
  },
  mapView: {
    flex: 1,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  overallRating: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },
  reviewsList: {
    gap: 12,
  },
  reviewItem: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewerName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.text,
  },
  reviewDate: {
    fontSize: 10.5,
    color: COLORS.textMuted,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 3,
    marginBottom: 6,
  },
  reviewText: {
    fontSize: 11.5,
    color: COLORS.text,
    lineHeight: 17,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 6 },
      android: { elevation: 6 },
      web: { boxShadow: '0 -4px 14px rgba(0,0,0,0.06)' },
    }),
  },
  bottomPriceCol: {
    minWidth: 70,
  },
  bottomPriceLabel: {
    fontSize: 9.5,
    color: COLORS.textMuted,
  },
  bottomPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomPrice: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.primary,
  },
  bottomPriceSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  callWorkerBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookWorkerBtn: {
    flex: 1,
    height: 46,
    backgroundColor: COLORS.accentOrange,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bookWorkerText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#ffffff',
  },
});
