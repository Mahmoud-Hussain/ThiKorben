import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#FF7315',
  primaryDark: '#E85D04',
  purple: '#4338A8',
  purpleDark: '#302878',
  purpleSoft: '#EFEEFF',
  navy: '#17134D',
  text: '#171927',
  muted: '#74798B',
  background: '#F6F7FB',
  card: '#FFFFFF',
  border: '#E8EAF1',
  softOrange: '#FFF4EA',
  softGreen: '#ECFDF3',
  success: '#17A860',
  yellow: '#F4A300',
};

type JobRequest = {
  id: number;
  title: string;
  distance: string;
  type: string;
  price: number;
  icon: keyof typeof Ionicons.glyphMap;
};

const JOB_REQUESTS: JobRequest[] = [
  {
    id: 1,
    title: 'Leaking pipe',
    distance: '1.2 km away',
    type: 'Plumbing',
    price: 500,
    icon: 'water-outline',
  },
  {
    id: 2,
    title: 'Ceiling fan repair',
    distance: '2.8 km away',
    type: 'Home Repair',
    price: 800,
    icon: 'build-outline',
  },
  {
    id: 3,
    title: 'Bathroom tap fitting',
    distance: '3.4 km away',
    type: 'Plumbing',
    price: 650,
    icon: 'construct-outline',
  },
];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 17) {
    return 'Good afternoon';
  }

  return 'Good evening';
}

type JobCardProps = {
  job: JobRequest;
};

function JobCard({ job }: JobCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateDown = () => {
    Animated.spring(scale, {
      toValue: 0.985,
      useNativeDriver: true,
    }).start();
  };

  const animateUp = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const showJobDetails = () => {
    Alert.alert(
      job.title,
      `${job.distance}\n${job.type}\nBudget: ৳${job.price}`,
      [
        {
          text: 'Close',
          style: 'cancel',
        },
        {
          text: 'Interested',
          onPress: () => {
            Alert.alert(
              'Request opened',
              'This will connect to the full job details flow later.',
            );
          },
        },
      ],
    );
  };

  return (
    <Animated.View
      style={[
        styles.jobCard,
        {
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable
        onPressIn={animateDown}
        onPressOut={animateUp}
        onPress={showJobDetails}
      >
        <View style={styles.jobTopRow}>
          <View style={styles.jobInfoRow}>
            <View style={styles.jobIcon}>
              <Ionicons name={job.icon} size={18} color={COLORS.primary} />
            </View>

            <View style={styles.jobTextArea}>
              <Text style={styles.jobTitle}>{job.title}</Text>

              <View style={styles.distanceRow}>
                <Ionicons
                  name="location-outline"
                  size={11}
                  color={COLORS.muted}
                />

                <Text style={styles.jobDistance}>{job.distance}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.jobPrice}>৳{job.price}</Text>
        </View>

        <View style={styles.jobMetaRow}>
          <View style={styles.jobTag}>
            <Text style={styles.jobTagText}>{job.type}</Text>
          </View>

          <Text style={styles.newLabel}>New</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.viewJobButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={showJobDetails}
        >
          <Text style={styles.viewJobText}>View Job</Text>

          <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

type NavItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
};

function NavItem({ icon, label, active = false }: NavItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.navItem, pressed && styles.navPressed]}
    >
      <View
        style={[
          styles.navIconContainer,
          active && styles.navIconContainerActive,
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={active ? '#FFFFFF' : COLORS.muted}
        />
      </View>

      <Text style={[styles.navLabel, active && styles.navLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function WorkerDashboardScreen() {
  const [available, setAvailable] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [earnings, setEarnings] = useState(0);

  const pageOpacity = useRef(new Animated.Value(0)).current;
  const pageTranslate = useRef(new Animated.Value(18)).current;

  const bannerScale = useRef(new Animated.Value(1)).current;

  const toggleAnimation = useRef(new Animated.Value(available ? 1 : 0)).current;

  const earningsAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(pageOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),

      Animated.spring(pageTranslate, {
        toValue: 0,
        friction: 7,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bannerScale, {
          toValue: 1.015,
          duration: 1100,
          useNativeDriver: true,
        }),

        Animated.timing(bannerScale, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();

    earningsAnimation.addListener(({ value }) => {
      setEarnings(Math.round(value));
    });

    Animated.timing(earningsAnimation, {
      toValue: 1250,
      duration: 900,
      useNativeDriver: false,
    }).start();

    return () => {
      pulseAnimation.stop();
      earningsAnimation.removeAllListeners();
    };
  }, [bannerScale, earningsAnimation, pageOpacity, pageTranslate]);

  const toggleAvailability = () => {
    const nextValue = !available;

    setAvailable(nextValue);

    Animated.spring(toggleAnimation, {
      toValue: nextValue ? 1 : 0,
      friction: 7,
      tension: 90,
      useNativeDriver: false,
    }).start();
  };

  const toggleTranslate = toggleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const toggleBackground = toggleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#D4D7DE', COLORS.success],
  });

  const onRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 900);
  };

  const viewRequests = () => {
    Alert.alert(
      'Nearby requests',
      '3 new service requests are currently available near you.',
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.appShell}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={18} color="#FFFFFF" />
            </View>

            <Text style={styles.brand}>
              Thi<Text style={styles.brandAccent}>Korben</Text>
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.notificationButton,
              pressed && styles.iconPressed,
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={21}
              color={COLORS.navy}
            />

            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        <Animated.View
          style={[
            styles.contentWrapper,
            {
              opacity: pageOpacity,
              transform: [
                {
                  translateY: pageTranslate,
                },
              ],
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
          >
            {/* Greeting */}
            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>{getGreeting()}, Rahim 👋</Text>

              <Text style={styles.greetingSubtitle}>
                Ready to help people around you?
              </Text>
            </View>

            {/* Availability */}
            <View style={styles.availabilityCard}>
              <View>
                <Text style={styles.availabilityTitle}>Available for work</Text>

                <Text style={styles.availabilitySubtitle}>
                  {available
                    ? 'Customers can send you requests'
                    : 'You are currently unavailable'}
                </Text>
              </View>

              <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: available }}
                onPress={toggleAvailability}
              >
                <Animated.View
                  style={[
                    styles.toggleTrack,
                    {
                      backgroundColor: toggleBackground,
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.toggleThumb,
                      {
                        transform: [
                          {
                            translateX: toggleTranslate,
                          },
                        ],
                      },
                    ]}
                  />

                  {available && (
                    <Ionicons
                      name="checkmark"
                      size={12}
                      color="#FFFFFF"
                      style={styles.toggleCheck}
                    />
                  )}
                </Animated.View>
              </Pressable>
            </View>

            {/* New Jobs Banner */}
            <Animated.View
              style={[
                styles.newJobsBanner,
                {
                  transform: [{ scale: bannerScale }],
                },
              ]}
            >
              <View style={styles.bannerTopRow}>
                <View style={styles.bannerIcon}>
                  <Ionicons name="briefcase" size={20} color="#FFFFFF" />
                </View>

                <View style={styles.bannerTextArea}>
                  <Text style={styles.bannerTitle}>3 new jobs near you</Text>

                  <Text style={styles.bannerSubtitle}>
                    Customers are looking for your skills.
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={viewRequests}
                style={({ pressed }) => [
                  styles.requestsButton,
                  pressed && styles.requestsButtonPressed,
                ]}
              >
                <Text style={styles.requestsButtonText}>View Requests</Text>

                <Ionicons name="arrow-forward" size={17} color={COLORS.navy} />
              </Pressable>
            </Animated.View>

            {/* Earnings */}
            <View style={styles.earningsCard}>
              <View>
                <Text style={styles.earningsLabel}>TODAY&apos;S EARNINGS</Text>

                <Text style={styles.earningsValue}>
                  ৳{earnings.toLocaleString()}
                </Text>

                <Text style={styles.earningsSubtitle}>
                  From completed services
                </Text>
              </View>

              <View style={styles.earningsIcon}>
                <Ionicons
                  name="wallet-outline"
                  size={22}
                  color={COLORS.primary}
                />
              </View>
            </View>

            {/* Nearby Requests Heading */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Nearby Requests</Text>

                <Text style={styles.sectionSubtitle}>
                  Jobs matching your services
                </Text>
              </View>

              <Pressable onPress={viewRequests}>
                <Text style={styles.seeAllText}>See all</Text>
              </Pressable>
            </View>

            {/* Job Requests */}
            <View style={styles.jobsList}>
              {JOB_REQUESTS.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </View>

            {/* Weekly Summary */}
            <View style={styles.weeklyCard}>
              <View style={styles.weeklyHeader}>
                <View>
                  <Text style={styles.weeklyTitle}>This Week</Text>

                  <Text style={styles.weeklySubtitle}>
                    Your recent performance
                  </Text>
                </View>

                <View style={styles.performanceBadge}>
                  <Ionicons
                    name="trending-up"
                    size={14}
                    color={COLORS.success}
                  />

                  <Text style={styles.performanceText}>+18%</Text>
                </View>
              </View>

              <View style={styles.weeklyStats}>
                <View style={styles.weeklyStat}>
                  <Text style={styles.weeklyStatValue}>12</Text>
                  <Text style={styles.weeklyStatLabel}>Jobs</Text>
                </View>

                <View style={styles.weeklyDivider} />

                <View style={styles.weeklyStat}>
                  <Text style={styles.weeklyStatValue}>4.9</Text>
                  <Text style={styles.weeklyStatLabel}>Rating</Text>
                </View>

                <View style={styles.weeklyDivider} />

                <View style={styles.weeklyStat}>
                  <Text style={styles.weeklyStatValue}>৳8.4k</Text>

                  <Text style={styles.weeklyStatLabel}>Earned</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </Animated.View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <NavItem icon="home" label="Home" active />

          <NavItem icon="construct-outline" label="Jobs" />

          <NavItem icon="map-outline" label="Map" />

          <NavItem icon="notifications-outline" label="Alerts" />

          <NavItem icon="person-outline" label="Profile" />
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
    backgroundColor: COLORS.background,
  },

  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 32,
    height: 32,
    marginRight: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.purple,
  },

  brand: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.navy,
  },

  brandAccent: {
    color: COLORS.primary,
  },

  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },

  iconPressed: {
    backgroundColor: '#F1F2F6',
  },

  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.card,
    backgroundColor: COLORS.primary,
  },

  contentWrapper: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 100,
  },

  greetingSection: {
    marginBottom: 14,
  },

  greeting: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },

  greetingSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.muted,
  },

  availabilityCard: {
    marginBottom: 13,
    paddingHorizontal: 15,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.card,
  },

  availabilityTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },

  availabilitySubtitle: {
    marginTop: 3,
    maxWidth: 245,
    fontSize: 10.5,
    color: COLORS.muted,
  },

  toggleTrack: {
    width: 48,
    height: 28,
    position: 'relative',
    justifyContent: 'center',
    borderRadius: 14,
  },

  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },

  toggleCheck: {
    position: 'absolute',
    left: 7,
  },

  newJobsBanner: {
    marginBottom: 14,
    padding: 15,
    borderRadius: 19,
    backgroundColor: COLORS.purple,
    shadowColor: COLORS.purpleDark,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },

  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  bannerIcon: {
    width: 42,
    height: 42,
    marginRight: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },

  bannerTextArea: {
    flex: 1,
  },

  bannerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  bannerSubtitle: {
    marginTop: 4,
    fontSize: 10.5,
    color: '#DAD7FF',
  },

  requestsButton: {
    height: 43,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
  },

  requestsButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },

  requestsButtonText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  earningsCard: {
    marginBottom: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    backgroundColor: COLORS.card,
  },

  earningsLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: COLORS.muted,
  },

  earningsValue: {
    marginTop: 4,
    fontSize: 25,
    fontWeight: '900',
    color: COLORS.navy,
  },

  earningsSubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: COLORS.muted,
  },

  earningsIcon: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: COLORS.softOrange,
  },

  sectionHeader: {
    marginBottom: 10,
    paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: COLORS.muted,
  },

  seeAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.purple,
  },

  jobsList: {
    gap: 10,
  },

  jobCard: {
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    backgroundColor: COLORS.card,
  },

  jobTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  jobInfoRow: {
    flex: 1,
    flexDirection: 'row',
  },

  jobIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: COLORS.softOrange,
  },

  jobTextArea: {
    flex: 1,
  },

  jobTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.text,
  },

  distanceRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  jobDistance: {
    fontSize: 10,
    color: COLORS.muted,
  },

  jobPrice: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.purple,
  },

  jobMetaRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  jobTag: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: COLORS.purpleSoft,
  },

  jobTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.purple,
  },

  newLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.success,
  },

  viewJobButton: {
    height: 36,
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 11,
    backgroundColor: COLORS.purple,
  },

  buttonPressed: {
    opacity: 0.86,
  },

  viewJobText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  weeklyCard: {
    marginTop: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    backgroundColor: COLORS.card,
  },

  weeklyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  weeklyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
  },

  weeklySubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: COLORS.muted,
  },

  performanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 999,
    backgroundColor: COLORS.softGreen,
  },

  performanceText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.success,
  },

  weeklyStats: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  weeklyStat: {
    flex: 1,
    alignItems: 'center',
  },

  weeklyStatValue: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.navy,
  },

  weeklyStatLabel: {
    marginTop: 3,
    fontSize: 9.5,
    color: COLORS.muted,
  },

  weeklyDivider: {
    width: 1,
    height: 34,
    backgroundColor: COLORS.border,
  },

  bottomNav: {
    height: 76,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIconContainer: {
    width: 36,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },

  navIconContainerActive: {
    backgroundColor: COLORS.primary,
  },

  navLabel: {
    marginTop: 3,
    fontSize: 8.5,
    fontWeight: '600',
    color: COLORS.muted,
  },

  navLabelActive: {
    fontWeight: '800',
    color: COLORS.primaryDark,
  },

  navPressed: {
    opacity: 0.65,
  },
});
