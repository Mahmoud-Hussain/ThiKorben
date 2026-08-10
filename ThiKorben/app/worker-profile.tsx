import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#FF7315',
  primaryDark: '#E85D04',
  navy: '#25206A',
  navyDark: '#17134D',
  text: '#171927',
  muted: '#71778A',
  background: '#F6F7FB',
  card: '#FFFFFF',
  border: '#E8EAF1',
  softOrange: '#FFF4EA',
  softPurple: '#F0EFFF',
  softBlue: '#EEF5FF',
  success: '#17A860',
  yellow: '#F5A300',
};

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
};

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={19} color={COLORS.primary} />
      </View>

      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export default function WorkerProfileScreen() {
  const handleShare = async () => {
    try {
      await Share.share({
        message:
          'Check out Rahim Ahmed, a verified Expert Plumber on ThiKorben.',
      });
    } catch {
      // Share dialog dismissed or unavailable.
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.appShell}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.iconButtonPressed,
            ]}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              }
            }}
          >
            <Ionicons name="chevron-back" size={25} color={COLORS.navyDark} />
          </Pressable>

          <Text style={styles.brand}>
            Thi<Text style={styles.brandAccent}>Korben</Text>
          </Text>

          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share worker profile"
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.iconButtonPressed,
              ]}
              onPress={handleShare}
            >
              <Ionicons
                name="share-social-outline"
                size={21}
                color={COLORS.navyDark}
              />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="More options"
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.iconButtonPressed,
              ]}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={20}
                color={COLORS.navyDark}
              />
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Worker Hero */}
          <View style={styles.heroCard}>
            <Image
              source={require('@/assets/images/worker-plumber.jpg')}
              style={styles.heroImage}
              contentFit="cover"
              contentPosition="center"
              transition={250}
            />

            <View style={styles.heroOverlay} />

            <View style={styles.verifiedBadge}>
              <View style={styles.verifiedIcon}>
                <Ionicons name="checkmark" size={11} color="#FFFFFF" />
              </View>

              <Text style={styles.verifiedText}>Verified Worker</Text>
            </View>

            <View style={styles.availableBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.availableText}>Available</Text>
            </View>
          </View>

          {/* Worker Identity */}
          <View style={styles.identitySection}>
            <View style={styles.identityTopRow}>
              <View style={styles.identityContent}>
                <View style={styles.nameRow}>
                  <Text style={styles.workerName}>Rahim Ahmed</Text>

                  <Ionicons
                    name="checkmark-circle"
                    size={19}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.professionRow}>
                  <Ionicons
                    name="construct-outline"
                    size={14}
                    color={COLORS.primary}
                  />
                  <Text style={styles.profession}>Expert Plumber</Text>
                </View>
              </View>

              <View style={styles.ratingBox}>
                <Ionicons name="star" size={16} color={COLORS.yellow} />
                <Text style={styles.ratingValue}>4.9</Text>
              </View>
            </View>

            <View style={styles.reviewRow}>
              <Text style={styles.reviewText}>128 completed jobs</Text>

              <View style={styles.smallDot} />

              <Text style={styles.reviewText}>86 reviews</Text>
            </View>
          </View>

          {/* Statistics */}
          <View style={styles.statsRow}>
            <StatCard icon="briefcase-outline" value="5+" label="Years Exp." />

            <StatCard
              icon="checkmark-done-outline"
              value="128"
              label="Jobs Done"
            />

            <StatCard icon="time-outline" value="~2 hr" label="Response" />
          </View>

          {/* About */}
          <View style={styles.section}>
            <SectionTitle>About Rahim</SectionTitle>

            <Text style={styles.bodyText}>
              Reliable and experienced plumber serving the Dhaka metro area.
              Specialized in leak repairs, pipe installation, fitting,
              maintenance and emergency plumbing services. Focused on clean,
              dependable and professional workmanship.
            </Text>

            <View style={styles.skillsRow}>
              <View style={styles.skillChip}>
                <Ionicons
                  name="water-outline"
                  size={13}
                  color={COLORS.primaryDark}
                />
                <Text style={styles.skillText}>Pipe Repair</Text>
              </View>

              <View style={styles.skillChip}>
                <Ionicons
                  name="construct-outline"
                  size={13}
                  color={COLORS.primaryDark}
                />
                <Text style={styles.skillText}>Installation</Text>
              </View>

              <View style={styles.skillChip}>
                <Ionicons
                  name="settings-outline"
                  size={13}
                  color={COLORS.primaryDark}
                />
                <Text style={styles.skillText}>Maintenance</Text>
              </View>
            </View>
          </View>

          {/* Service Area */}
          <View style={styles.section}>
            <View style={styles.sectionHeadingRow}>
              <View style={styles.sectionTitleWithIcon}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={COLORS.navy}
                />
                <Text style={styles.inlineSectionTitle}>Service Area</Text>
              </View>

              <Pressable>
                <Text style={styles.viewMapText}>View map</Text>
              </Pressable>
            </View>

            <View style={styles.mapCard}>
              <View style={[styles.mapRoad, styles.mapRoadOne]} />
              <View style={[styles.mapRoad, styles.mapRoadTwo]} />
              <View style={[styles.mapRoad, styles.mapRoadThree]} />

              <View style={styles.mapBlockOne} />
              <View style={styles.mapBlockTwo} />
              <View style={styles.mapBlockThree} />
              <View style={styles.mapBlockFour} />

              <View style={styles.radiusCircle}>
                <View style={styles.mapPin}>
                  <Ionicons name="construct" size={18} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.locationCard}>
                <View style={styles.locationIcon}>
                  <Ionicons name="location" size={18} color={COLORS.primary} />
                </View>

                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationTitle}>Dhanmondi, Dhaka</Text>

                  <Text style={styles.locationSubtitle}>
                    Dhanmondi & surrounding areas · 8 km
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Preferred Rate */}
          <View style={styles.section}>
            <SectionTitle>Preferred Rate</SectionTitle>

            <View style={styles.rateCard}>
              <View style={styles.rateLeft}>
                <View style={styles.moneyIcon}>
                  <Ionicons
                    name="wallet-outline"
                    size={21}
                    color={COLORS.navy}
                  />
                </View>

                <View style={styles.rateContent}>
                  <View style={styles.priceRow}>
                    <Text style={styles.currency}>৳</Text>
                    <Text style={styles.price}>500</Text>
                    <Text style={styles.perVisit}> / visit</Text>
                  </View>

                  <Text style={styles.rateNote}>Basic inspection included</Text>
                </View>
              </View>

              <View style={styles.negotiableBadge}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={13}
                  color={COLORS.primaryDark}
                />
                <Text style={styles.negotiableText}>Includes inspection</Text>
              </View>
            </View>
          </View>

          {/* Trust Card */}
          <View style={styles.trustCard}>
            <View style={styles.trustIcon}>
              <Ionicons name="shield-checkmark" size={24} color={COLORS.navy} />
            </View>

            <View style={styles.trustContent}>
              <Text style={styles.trustTitle}>Verified by ThiKorben</Text>

              <Text style={styles.trustText}>
                Worker identity and profile information have been verified for
                your confidence.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Sticky Bottom CTA */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomPriceArea}>
            <Text style={styles.bottomLabel}>Preferred rate</Text>

            <View style={styles.bottomPriceRow}>
              <Text style={styles.bottomPrice}>৳500</Text>
              <Text style={styles.bottomPerVisit}> / visit</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Request service from Rahim Ahmed"
            style={({ pressed }) => [
              styles.requestButton,
              pressed && styles.requestButtonPressed,
            ]}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color="#FFFFFF"
            />

            <Text style={styles.requestButtonText}>Request Service</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E9ECF3',
  },

  appShell: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },

  header: {
    height: 58,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
    backgroundColor: COLORS.card,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },

  iconButtonPressed: {
    backgroundColor: '#F4F5F8',
  },

  brand: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.navy,
    pointerEvents: 'none',
  },

  brandAccent: {
    color: COLORS.primary,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 110,
  },

  heroCard: {
    height: 235,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#D7DCE4',
  },

  heroImage: {
    width: '100%',
    height: '100%',
  },

  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 17, 38, 0.12)',
  },

  verifiedBadge: {
    position: 'absolute',
    left: 14,
    bottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.96)',
  },

  verifiedIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: COLORS.success,
  },

  verifiedText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.text,
  },

  availableBadge: {
    position: 'absolute',
    right: 14,
    bottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(23, 19, 77, 0.90)',
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#26D07C',
  },

  availableText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  identitySection: {
    paddingHorizontal: 17,
    paddingTop: 18,
    paddingBottom: 17,
    backgroundColor: COLORS.card,
  },

  identityTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },

  identityContent: {
    flex: 1,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  workerName: {
    flexShrink: 1,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900',
    color: COLORS.text,
  },

  professionRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  profession: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },

  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 11,
    backgroundColor: '#FFF9E9',
  },

  ratingValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
  },

  reviewRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  reviewText: {
    fontSize: 12,
    color: COLORS.muted,
  },

  smallDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C9CDDA',
  },

  statsRow: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 15,
    flexDirection: 'row',
    gap: 8,
  },

  statCard: {
    flex: 1,
    minHeight: 105,
    paddingHorizontal: 5,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    backgroundColor: COLORS.card,
  },

  statIcon: {
    width: 34,
    height: 34,
    marginBottom: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: COLORS.softOrange,
  },

  statValue: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.navyDark,
  },

  statLabel: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    color: COLORS.muted,
  },

  section: {
    marginHorizontal: 14,
    marginBottom: 13,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    backgroundColor: COLORS.card,
  },

  sectionHeadingRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  sectionTitle: {
    marginBottom: 11,
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
  },

  inlineSectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
  },

  bodyText: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.muted,
  },

  skillsRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.softOrange,
  },

  skillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },

  viewMapText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },

  mapCard: {
    height: 205,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 14,
    backgroundColor: '#EDF1F7',
  },

  mapRoad: {
    position: 'absolute',
    height: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },

  mapRoadOne: {
    width: 320,
    top: 43,
    left: -67,
    transform: [{ rotate: '-18deg' }],
  },

  mapRoadTwo: {
    width: 270,
    top: 102,
    left: 45,
    transform: [{ rotate: '27deg' }],
  },

  mapRoadThree: {
    width: 225,
    top: 28,
    left: 164,
    transform: [{ rotate: '81deg' }],
  },

  mapBlockOne: {
    position: 'absolute',
    width: 66,
    height: 40,
    top: 25,
    left: 22,
    borderRadius: 7,
    backgroundColor: '#D9E2EE',
  },

  mapBlockTwo: {
    position: 'absolute',
    width: 70,
    height: 47,
    top: 83,
    right: 19,
    borderRadius: 7,
    backgroundColor: '#D9E2EE',
  },

  mapBlockThree: {
    position: 'absolute',
    width: 56,
    height: 35,
    top: 102,
    left: 32,
    borderRadius: 7,
    backgroundColor: '#D9E2EE',
  },

  mapBlockFour: {
    position: 'absolute',
    width: 54,
    height: 34,
    top: 18,
    right: 60,
    borderRadius: 7,
    backgroundColor: '#D9E2EE',
  },

  radiusCircle: {
    position: 'absolute',
    top: 53,
    left: '50%',
    width: 58,
    height: 58,
    marginLeft: -29,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    backgroundColor: 'rgba(255, 115, 21, 0.20)',
  },

  mapPin: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: COLORS.primary,
  },

  locationCard: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    minHeight: 59,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.97)',
  },

  locationIcon: {
    width: 35,
    height: 35,
    marginRight: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.softOrange,
  },

  locationTextContainer: {
    flex: 1,
  },

  locationTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  locationSubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: COLORS.muted,
  },

  rateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  rateLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  moneyIcon: {
    width: 43,
    height: 43,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: COLORS.softPurple,
  },

  rateContent: {
    flexShrink: 1,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  currency: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.navyDark,
  },

  price: {
    fontSize: 23,
    fontWeight: '900',
    color: COLORS.navyDark,
  },

  perVisit: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
  },

  rateNote: {
    marginTop: 1,
    fontSize: 10,
    color: COLORS.muted,
  },

  negotiableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.softOrange,
  },

  negotiableText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },

  trustCard: {
    marginHorizontal: 14,
    marginBottom: 16,
    padding: 14,
    flexDirection: 'row',
    borderRadius: 17,
    backgroundColor: COLORS.softPurple,
  },

  trustIcon: {
    width: 42,
    height: 42,
    marginRight: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },

  trustContent: {
    flex: 1,
    justifyContent: 'center',
  },

  trustTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: COLORS.navy,
  },

  trustText: {
    marginTop: 3,
    fontSize: 10.5,
    lineHeight: 15,
    color: '#595A78',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 86,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },

  bottomPriceArea: {
    minWidth: 90,
  },

  bottomLabel: {
    fontSize: 9.5,
    color: COLORS.muted,
  },

  bottomPriceRow: {
    marginTop: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  bottomPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.navyDark,
  },

  bottomPerVisit: {
    fontSize: 9.5,
    color: COLORS.muted,
  },

  requestButton: {
    flex: 1,
    maxWidth: 230,
    height: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    shadowColor: '#E85D04',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },

  requestButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },

  requestButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
