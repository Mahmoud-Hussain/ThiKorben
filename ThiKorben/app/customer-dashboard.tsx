import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#FF7315',
  primaryDark: '#E85D04',

  purple: '#4338A8',
  purpleDark: '#2F2877',
  purpleSoft: '#EFEEFF',

  navy: '#17134D',
  text: '#171927',
  muted: '#777C8E',

  background: '#F6F7FB',
  card: '#FFFFFF',
  border: '#E8EAF1',

  softOrange: '#FFF4EA',
  softBlue: '#EEF3FF',
  softGreen: '#ECFDF3',

  success: '#16A760',
  yellow: '#F5A300',
};

type Service = {
  id: number;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  background: string;
  color: string;
};

type Worker = {
  id: number;
  name: string;
  profession: string;
  rating: number;
  distance: string;
  price: number;
  available: boolean;
  image: string;
};

const SERVICES: Service[] = [
  {
    id: 1,
    title: 'Plumbing',
    icon: 'water-outline',
    background: '#FFF0E4',
    color: '#FF7315',
  },
  {
    id: 2,
    title: 'Electrical',
    icon: 'flash-outline',
    background: '#EEECFF',
    color: '#4338A8',
  },
  {
    id: 3,
    title: 'Carpentry',
    icon: 'hammer-outline',
    background: '#F2F2F5',
    color: '#575B68',
  },
  {
    id: 4,
    title: 'Cleaning',
    icon: 'sparkles-outline',
    background: '#F0F1F6',
    color: '#5F6575',
  },
  {
    id: 5,
    title: 'Painting',
    icon: 'color-palette-outline',
    background: '#F5F0FF',
    color: '#7652B8',
  },
  {
    id: 6,
    title: 'AC Repair',
    icon: 'snow-outline',
    background: '#EDEFFF',
    color: '#4338A8',
  },
];

const WORKERS: Worker[] = [
  {
    id: 1,
    name: 'Rahim Ahmed',
    profession: 'Expert Plumber',
    rating: 4.9,
    distance: '1.2 km',
    price: 500,
    available: true,
    image:
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=500&q=85',
  },
  {
    id: 2,
    name: 'Sakib Hasan',
    profession: 'Electrician',
    rating: 4.8,
    distance: '2.1 km',
    price: 650,
    available: true,
    image:
      'https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?auto=format&fit=crop&w=500&q=85',
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

type ServiceCardProps = {
  service: Service;
  selected: boolean;
  onPress: () => void;
};

function ServiceCard({ service, selected, onPress }: ServiceCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      friction: 7,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        width: '31.5%',
        transform: [{ scale }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[styles.serviceCard, selected && styles.serviceCardSelected]}
      >
        {selected && (
          <View style={styles.serviceSelectedIndicator}>
            <Ionicons name="checkmark" size={10} color="#FFFFFF" />
          </View>
        )}

        <View
          style={[
            styles.serviceIcon,
            {
              backgroundColor: service.background,
            },
            selected && styles.serviceIconSelected,
          ]}
        >
          <Ionicons
            name={service.icon}
            size={21}
            color={selected ? '#FFFFFF' : service.color}
          />
        </View>

        <Text
          numberOfLines={1}
          style={[styles.serviceTitle, selected && styles.serviceTitleSelected]}
        >
          {service.title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

type WorkerCardProps = {
  worker: Worker;
  delay: number;
};

function WorkerCard({ worker, delay }: WorkerCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),

      Animated.spring(translateY, {
        toValue: 0,
        delay,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [delay, opacity, translateY]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const openWorker = () => {
    Alert.alert(
      worker.name,
      `${worker.profession}\n${worker.distance} away\nStarting from ৳${worker.price}/visit`,
      [
        {
          text: 'Close',
          style: 'cancel',
        },
        {
          text: 'View Profile',
          onPress: () => {
            Alert.alert(
              'Worker Profile',
              'This will connect to the Worker Profile screen when shared navigation is integrated.',
            );
          },
        },
      ],
    );
  };

  return (
    <Animated.View
      style={[
        styles.workerCard,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <Pressable
        onPress={openWorker}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.workerCardPressable}
      >
        <View style={styles.workerImageWrapper}>
          <Image
            source={{
              uri: worker.image,
            }}
            style={styles.workerImage}
            contentFit="cover"
            transition={200}
          />

          {worker.available && (
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineIndicatorInner} />
            </View>
          )}
        </View>

        <View style={styles.workerInfo}>
          <View style={styles.workerNameRow}>
            <Text numberOfLines={1} style={styles.workerName}>
              {worker.name}
            </Text>

            <Ionicons
              name="checkmark-circle"
              size={16}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.workerProfessionRow}>
            <Ionicons name="construct-outline" size={12} color={COLORS.muted} />

            <Text style={styles.workerProfession}>{worker.profession}</Text>
          </View>

          <View style={styles.workerMetaRow}>
            <View style={styles.workerMeta}>
              <Ionicons
                name="location-outline"
                size={12}
                color={COLORS.muted}
              />

              <Text style={styles.workerMetaText}>{worker.distance}</Text>
            </View>

            <View style={styles.workerMeta}>
              <Ionicons name="cash-outline" size={12} color={COLORS.muted} />

              <Text style={styles.workerMetaText}>From ৳{worker.price}</Text>
            </View>
          </View>
        </View>

        <View style={styles.workerRight}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={COLORS.yellow} />

            <Text style={styles.ratingText}>{worker.rating}</Text>
          </View>

          <View style={styles.workerArrow}>
            <Ionicons name="chevron-forward" size={16} color={COLORS.purple} />
          </View>
        </View>
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
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.86,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPressIn={pressIn} onPressOut={pressOut} style={styles.navItem}>
      <Animated.View
        style={{
          alignItems: 'center',
          transform: [{ scale }],
        }}
      >
        <View style={[styles.navIconBox, active && styles.navIconBoxActive]}>
          <Ionicons
            name={icon}
            size={19}
            color={active ? '#FFFFFF' : COLORS.muted}
          />
        </View>

        <Text style={[styles.navText, active && styles.navTextActive]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function CustomerDashboardScreen() {
  const [query, setQuery] = useState('');
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const greetingOpacity = useRef(new Animated.Value(0)).current;

  const greetingTranslate = useRef(new Animated.Value(15)).current;

  const searchOpacity = useRef(new Animated.Value(0)).current;

  const searchTranslate = useRef(new Animated.Value(15)).current;

  const servicesOpacity = useRef(new Animated.Value(0)).current;

  const servicesTranslate = useRef(new Animated.Value(15)).current;

  const quickHelpOpacity = useRef(new Animated.Value(0)).current;

  const quickHelpTranslate = useRef(new Animated.Value(15)).current;

  const mapOpacity = useRef(new Animated.Value(0)).current;

  const mapTranslate = useRef(new Animated.Value(15)).current;

  const recommendedOpacity = useRef(new Animated.Value(0)).current;

  const recommendedTranslate = useRef(new Animated.Value(15)).current;

  const mapPulse = useRef(new Animated.Value(1)).current;

  const urgentPulse = useRef(new Animated.Value(1)).current;

  const bellRotation = useRef(new Animated.Value(0)).current;

  const pinOneFloat = useRef(new Animated.Value(0)).current;

  const pinTwoFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entranceAnimation = Animated.stagger(90, [
      Animated.parallel([
        Animated.timing(greetingOpacity, {
          toValue: 1,
          duration: 330,
          useNativeDriver: true,
        }),
        Animated.spring(greetingTranslate, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(searchOpacity, {
          toValue: 1,
          duration: 330,
          useNativeDriver: true,
        }),
        Animated.spring(searchTranslate, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(servicesOpacity, {
          toValue: 1,
          duration: 330,
          useNativeDriver: true,
        }),
        Animated.spring(servicesTranslate, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(quickHelpOpacity, {
          toValue: 1,
          duration: 330,
          useNativeDriver: true,
        }),
        Animated.spring(quickHelpTranslate, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(mapOpacity, {
          toValue: 1,
          duration: 330,
          useNativeDriver: true,
        }),
        Animated.spring(mapTranslate, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(recommendedOpacity, {
          toValue: 1,
          duration: 330,
          useNativeDriver: true,
        }),
        Animated.spring(recommendedTranslate, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
    ]);

    entranceAnimation.start();

    const locationPulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(mapPulse, {
          toValue: 1.35,
          duration: 1000,
          useNativeDriver: true,
        }),

        Animated.timing(mapPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    locationPulseAnimation.start();

    const urgentAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(urgentPulse, {
          toValue: 1.012,
          duration: 1300,
          useNativeDriver: true,
        }),

        Animated.timing(urgentPulse, {
          toValue: 1,
          duration: 1300,
          useNativeDriver: true,
        }),
      ]),
    );

    urgentAnimation.start();

    const bellAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(3000),

        Animated.timing(bellRotation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),

        Animated.timing(bellRotation, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),

        Animated.timing(bellRotation, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }),

        Animated.timing(bellRotation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    );

    bellAnimation.start();

    const pinAnimationOne = Animated.loop(
      Animated.sequence([
        Animated.timing(pinOneFloat, {
          toValue: -5,
          duration: 1000,
          useNativeDriver: true,
        }),

        Animated.timing(pinOneFloat, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    pinAnimationOne.start();

    const pinAnimationTwo = Animated.loop(
      Animated.sequence([
        Animated.delay(350),

        Animated.timing(pinTwoFloat, {
          toValue: -5,
          duration: 1000,
          useNativeDriver: true,
        }),

        Animated.timing(pinTwoFloat, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    pinAnimationTwo.start();

    return () => {
      entranceAnimation.stop();
      locationPulseAnimation.stop();
      urgentAnimation.stop();
      bellAnimation.stop();
      pinAnimationOne.stop();
      pinAnimationTwo.stop();
    };
  }, [
    bellRotation,
    greetingOpacity,
    greetingTranslate,
    mapOpacity,
    mapPulse,
    mapTranslate,
    pinOneFloat,
    pinTwoFloat,
    quickHelpOpacity,
    quickHelpTranslate,
    recommendedOpacity,
    recommendedTranslate,
    searchOpacity,
    searchTranslate,
    servicesOpacity,
    servicesTranslate,
    urgentPulse,
  ]);

  const bellRotate = bellRotation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-12deg', '0deg', '12deg'],
  });

  const onRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 900);
  };

  const handleSearch = () => {
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      return;
    }

    Alert.alert('Searching services', `Looking for "${cleanQuery}" near you.`);
  };

  const openMap = () => {
    Alert.alert(
      'Nearby Workers',
      'The full interactive map will open here when the map module is connected.',
    );
  };

  const selectService = (service: Service) => {
    const alreadySelected = selectedService === service.id;

    setSelectedService(alreadySelected ? null : service.id);

    if (!alreadySelected) {
      setQuery(service.title);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.appShell}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandArea}>
            <View style={styles.headerAvatar}>
              <Ionicons name="person" size={16} color="#FFFFFF" />
            </View>

            <Text style={styles.brand}>
              Thi
              <Text style={styles.brandAccent}>Korben</Text>
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.notificationButton,
              pressed && styles.iconPressed,
            ]}
            onPress={() =>
              Alert.alert('Notifications', 'You have 2 new updates.')
            }
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: bellRotate,
                  },
                ],
              }}
            >
              <Ionicons
                name="notifications-outline"
                size={21}
                color={COLORS.navy}
              />
            </Animated.View>

            <View style={styles.notificationDot} />
          </Pressable>
        </View>

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
          <Animated.View
            style={[
              styles.greetingSection,
              {
                opacity: greetingOpacity,
                transform: [
                  {
                    translateY: greetingTranslate,
                  },
                ],
              },
            ]}
          >
            <Text style={styles.greeting}>{getGreeting()}, Nusrat 👋</Text>

            <Text style={styles.greetingSubtitle}>
              What do you need help with today?
            </Text>
          </Animated.View>

          {/* Search */}
          <Animated.View
            style={{
              opacity: searchOpacity,
              transform: [
                {
                  translateY: searchTranslate,
                },
              ],
            }}
          >
            <View
              style={[
                styles.searchContainer,
                searchFocused && styles.searchContainerFocused,
              ]}
            >
              <Ionicons
                name="search-outline"
                size={19}
                color={searchFocused ? COLORS.primary : COLORS.muted}
              />

              <TextInput
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search for a service"
                placeholderTextColor="#A0A4B2"
                returnKeyType="search"
                style={styles.searchInput}
              />

              {query.length > 0 && (
                <Pressable
                  onPress={() => {
                    setQuery('');
                    setSelectedService(null);
                  }}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={18} color="#A5A9B6" />
                </Pressable>
              )}
            </View>
          </Animated.View>

          {/* Services */}
          <Animated.View
            style={[
              styles.servicesGrid,
              {
                opacity: servicesOpacity,
                transform: [
                  {
                    translateY: servicesTranslate,
                  },
                ],
              },
            ]}
          >
            {SERVICES.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                selected={selectedService === service.id}
                onPress={() => selectService(service)}
              />
            ))}
          </Animated.View>

          {/* Quick Help */}
          <Animated.View
            style={{
              opacity: quickHelpOpacity,
              transform: [
                {
                  translateY: quickHelpTranslate,
                },
                {
                  scale: urgentPulse,
                },
              ],
            }}
          >
            <Pressable
              onPress={() =>
                Alert.alert(
                  'Quick Help',
                  'We will show the fastest available verified workers near you.',
                )
              }
              style={({ pressed }) => [
                styles.quickHelpCard,
                pressed && styles.quickHelpPressed,
              ]}
            >
              <View style={styles.quickHelpIcon}>
                <Ionicons name="flash" size={21} color="#FFFFFF" />
              </View>

              <View style={styles.quickHelpContent}>
                <Text style={styles.quickHelpTitle}>Need urgent help?</Text>

                <Text style={styles.quickHelpSubtitle}>
                  Find the fastest available worker nearby
                </Text>
              </View>

              <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
            </Pressable>
          </Animated.View>

          {/* Nearby Workers */}
          <Animated.View
            style={{
              opacity: mapOpacity,
              transform: [
                {
                  translateY: mapTranslate,
                },
              ],
            }}
          >
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Nearby Verified Workers</Text>

                <Text style={styles.sectionSubtitle}>
                  Trusted professionals around you
                </Text>
              </View>

              <Pressable
                onPress={openMap}
                style={({ pressed }) => [pressed && styles.smallButtonPressed]}
              >
                <Text style={styles.viewMapText}>View Map</Text>
              </Pressable>
            </View>

            {/* Visual Map */}
            <Pressable
              onPress={openMap}
              style={({ pressed }) => [
                styles.mapCard,
                pressed && styles.mapCardPressed,
              ]}
            >
              <View style={[styles.mapRoad, styles.roadOne]} />

              <View style={[styles.mapRoad, styles.roadTwo]} />

              <View style={[styles.mapRoad, styles.roadThree]} />

              <View style={[styles.mapRoad, styles.roadFour]} />

              <View style={[styles.mapBlock, styles.mapBlockOne]} />

              <View style={[styles.mapBlock, styles.mapBlockTwo]} />

              <View style={[styles.mapBlock, styles.mapBlockThree]} />

              <View style={[styles.mapBlock, styles.mapBlockFour]} />

              <View style={styles.areaLabel}>
                <Ionicons name="location" size={12} color={COLORS.primary} />

                <Text style={styles.areaLabelText}>Dhanmondi</Text>
              </View>

              <Animated.View
                style={[
                  styles.mapWorkerPin,
                  styles.pinOne,
                  {
                    transform: [
                      {
                        translateY: pinOneFloat,
                      },
                    ],
                  },
                ]}
              >
                <Ionicons name="construct" size={14} color="#FFFFFF" />
              </Animated.View>

              <Animated.View
                style={[
                  styles.mapWorkerPin,
                  styles.pinTwo,
                  {
                    transform: [
                      {
                        translateY: pinTwoFloat,
                      },
                    ],
                  },
                ]}
              >
                <Ionicons name="flash" size={14} color="#FFFFFF" />
              </Animated.View>

              <Animated.View
                style={[
                  styles.currentLocationPulse,
                  {
                    transform: [
                      {
                        scale: mapPulse,
                      },
                    ],
                    opacity: mapPulse.interpolate({
                      inputRange: [1, 1.35],
                      outputRange: [0.8, 0.15],
                    }),
                  },
                ]}
              />

              <View style={styles.currentLocation}>
                <View style={styles.currentLocationInner} />
              </View>

              <View style={styles.mapBottomCard}>
                <View style={styles.mapBottomIcon}>
                  <Ionicons name="navigate" size={16} color={COLORS.purple} />
                </View>

                <View style={styles.mapBottomText}>
                  <Text style={styles.mapBottomTitle}>
                    8 verified workers nearby
                  </Text>

                  <Text style={styles.mapBottomSubtitle}>
                    Within approximately 5 km
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color={COLORS.muted}
                />
              </View>
            </Pressable>
          </Animated.View>

          {/* Recommended */}
          <Animated.View
            style={{
              opacity: recommendedOpacity,
              transform: [
                {
                  translateY: recommendedTranslate,
                },
              ],
            }}
          >
            <View style={styles.recommendedHeader}>
              <View>
                <Text style={styles.sectionTitle}>Recommended Workers</Text>

                <Text style={styles.sectionSubtitle}>
                  Top-rated professionals for you
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  Alert.alert(
                    'Recommended Workers',
                    'All recommended workers will be shown here.',
                  )
                }
                style={({ pressed }) => [pressed && styles.smallButtonPressed]}
              >
                <Text style={styles.seeAllText}>See all</Text>
              </Pressable>
            </View>

            <View style={styles.workerList}>
              {WORKERS.map((worker, index) => (
                <WorkerCard
                  key={worker.id}
                  worker={worker}
                  delay={index * 110}
                />
              ))}
            </View>

            {/* Safety */}
            <View style={styles.safetyCard}>
              <View style={styles.safetyIcon}>
                <Ionicons
                  name="shield-checkmark"
                  size={22}
                  color={COLORS.purple}
                />
              </View>

              <View style={styles.safetyContent}>
                <Text style={styles.safetyTitle}>Book with confidence</Text>

                <Text style={styles.safetyText}>
                  Workers shown here are verified by ThiKorben.
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

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

  brandArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerAvatar: {
    width: 31,
    height: 31,
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

  notificationDot: {
    position: 'absolute',

    top: 8,
    right: 8,

    width: 7,
    height: 7,

    borderRadius: 4,

    borderWidth: 1.5,
    borderColor: '#FFFFFF',

    backgroundColor: COLORS.primary,
  },

  iconPressed: {
    backgroundColor: '#F1F2F6',
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 15,
    paddingBottom: 100,
  },

  greetingSection: {
    marginBottom: 13,
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

  searchContainer: {
    height: 50,
    marginBottom: 16,
    paddingHorizontal: 14,

    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,

    backgroundColor: COLORS.card,

    shadowColor: '#191D38',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 2,
  },

  searchContainerFocused: {
    borderColor: COLORS.primary,

    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,

    elevation: 3,
  },

  searchInput: {
    flex: 1,
    height: '100%',

    marginLeft: 9,

    fontSize: 12,
    color: COLORS.text,
  },

  clearButton: {
    width: 30,
    height: 30,

    alignItems: 'center',
    justifyContent: 'center',
  },

  servicesGrid: {
    marginBottom: 16,

    flexDirection: 'row',
    flexWrap: 'wrap',

    gap: 9,
  },

  serviceCard: {
    width: '100%',
    minHeight: 91,

    paddingHorizontal: 5,
    paddingVertical: 11,

    alignItems: 'center',
    justifyContent: 'center',

    position: 'relative',

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,

    backgroundColor: COLORS.card,
  },

  serviceCardSelected: {
    borderColor: COLORS.primary,

    backgroundColor: '#FFF9F4',

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    elevation: 2,
  },

  serviceSelectedIndicator: {
    position: 'absolute',

    top: 7,
    right: 7,

    width: 17,
    height: 17,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 9,

    backgroundColor: COLORS.primary,
  },

  serviceIcon: {
    width: 40,
    height: 40,

    marginBottom: 8,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 13,
  },

  serviceIconSelected: {
    backgroundColor: COLORS.primary,
  },

  serviceTitle: {
    fontSize: 10.5,
    fontWeight: '700',

    textAlign: 'center',

    color: COLORS.text,
  },

  serviceTitleSelected: {
    fontWeight: '900',
    color: COLORS.primaryDark,
  },

  quickHelpCard: {
    marginBottom: 19,
    padding: 14,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 17,

    backgroundColor: COLORS.purple,

    shadowColor: COLORS.purpleDark,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,

    elevation: 4,
  },

  quickHelpPressed: {
    opacity: 0.9,
  },

  quickHelpIcon: {
    width: 42,
    height: 42,

    marginRight: 11,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 13,

    backgroundColor: 'rgba(255,255,255,0.14)',
  },

  quickHelpContent: {
    flex: 1,
  },

  quickHelpTitle: {
    fontSize: 13.5,
    fontWeight: '900',

    color: '#FFFFFF',
  },

  quickHelpSubtitle: {
    marginTop: 3,

    fontSize: 10,

    color: '#DDD9FF',
  },

  sectionHeader: {
    marginBottom: 10,

    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 15.5,
    fontWeight: '900',

    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 3,

    fontSize: 10,

    color: COLORS.muted,
  },

  viewMapText: {
    fontSize: 11,
    fontWeight: '800',

    color: COLORS.purple,
  },

  smallButtonPressed: {
    opacity: 0.5,
  },

  mapCard: {
    height: 238,

    marginBottom: 19,

    overflow: 'hidden',
    position: 'relative',

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,

    backgroundColor: '#EAF0F6',
  },

  mapCardPressed: {
    opacity: 0.96,
  },

  mapRoad: {
    position: 'absolute',

    height: 9,

    borderRadius: 20,

    backgroundColor: '#FFFFFF',
  },

  roadOne: {
    width: 330,
    top: 58,
    left: -70,

    transform: [
      {
        rotate: '-18deg',
      },
    ],
  },

  roadTwo: {
    width: 300,
    top: 112,
    left: 45,

    transform: [
      {
        rotate: '27deg',
      },
    ],
  },

  roadThree: {
    width: 230,
    top: 25,
    left: 170,

    transform: [
      {
        rotate: '80deg',
      },
    ],
  },

  roadFour: {
    width: 250,
    top: 152,
    left: -30,

    transform: [
      {
        rotate: '-7deg',
      },
    ],
  },

  mapBlock: {
    position: 'absolute',

    borderRadius: 8,

    backgroundColor: '#D6E1ED',
  },

  mapBlockOne: {
    width: 65,
    height: 43,

    top: 25,
    left: 24,
  },

  mapBlockTwo: {
    width: 75,
    height: 48,

    top: 84,
    right: 22,
  },

  mapBlockThree: {
    width: 55,
    height: 37,

    top: 123,
    left: 35,
  },

  mapBlockFour: {
    width: 60,
    height: 38,

    top: 28,
    right: 72,
  },

  areaLabel: {
    position: 'absolute',

    left: 13,
    top: 11,

    paddingHorizontal: 8,
    paddingVertical: 6,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,

    borderRadius: 999,

    backgroundColor: 'rgba(255,255,255,0.94)',
  },

  areaLabelText: {
    fontSize: 9.5,
    fontWeight: '800',

    color: COLORS.text,
  },

  mapWorkerPin: {
    position: 'absolute',

    width: 34,
    height: 34,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 17,

    backgroundColor: COLORS.purple,

    shadowColor: COLORS.purpleDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,

    elevation: 3,
  },

  pinOne: {
    top: 74,
    left: 96,
  },

  pinTwo: {
    top: 91,
    right: 78,

    backgroundColor: COLORS.primary,
  },

  currentLocationPulse: {
    position: 'absolute',

    top: 93,
    left: '50%',

    width: 42,
    height: 42,

    marginLeft: -21,

    borderRadius: 21,

    backgroundColor: 'rgba(67,56,168,0.18)',
  },

  currentLocation: {
    position: 'absolute',

    top: 104,
    left: '50%',

    width: 20,
    height: 20,

    marginLeft: -10,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 10,

    borderWidth: 3,
    borderColor: '#FFFFFF',

    backgroundColor: COLORS.purple,
  },

  currentLocationInner: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: '#FFFFFF',
  },

  mapBottomCard: {
    position: 'absolute',

    left: 10,
    right: 10,
    bottom: 10,

    minHeight: 59,

    paddingHorizontal: 10,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 13,

    backgroundColor: 'rgba(255,255,255,0.97)',
  },

  mapBottomIcon: {
    width: 36,
    height: 36,

    marginRight: 9,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 11,

    backgroundColor: COLORS.purpleSoft,
  },

  mapBottomText: {
    flex: 1,
  },

  mapBottomTitle: {
    fontSize: 11.5,
    fontWeight: '900',

    color: COLORS.text,
  },

  mapBottomSubtitle: {
    marginTop: 2,

    fontSize: 9.5,

    color: COLORS.muted,
  },

  recommendedHeader: {
    marginBottom: 10,

    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  seeAllText: {
    fontSize: 11,
    fontWeight: '800',

    color: COLORS.purple,
  },

  workerList: {
    gap: 10,
  },

  workerCard: {
    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: 17,

    backgroundColor: COLORS.card,

    shadowColor: '#111827',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.035,
    shadowRadius: 6,

    elevation: 1,
  },

  workerCardPressable: {
    minHeight: 101,

    padding: 12,

    flexDirection: 'row',
    alignItems: 'center',
  },

  workerImageWrapper: {
    width: 66,
    height: 72,

    marginRight: 11,

    position: 'relative',
  },

  workerImage: {
    width: '100%',
    height: '100%',

    borderRadius: 13,

    backgroundColor: '#E6E8EE',
  },

  onlineIndicator: {
    position: 'absolute',

    right: -3,
    bottom: 4,

    width: 18,
    height: 18,

    padding: 3,

    borderRadius: 9,

    backgroundColor: '#FFFFFF',
  },

  onlineIndicatorInner: {
    flex: 1,

    borderRadius: 6,

    backgroundColor: COLORS.success,
  },

  workerInfo: {
    flex: 1,
  },

  workerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,
  },

  workerName: {
    maxWidth: 130,

    fontSize: 13.5,
    fontWeight: '900',

    color: COLORS.text,
  },

  workerProfessionRow: {
    marginTop: 4,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,
  },

  workerProfession: {
    fontSize: 10.5,
    fontWeight: '600',

    color: COLORS.muted,
  },

  workerMetaRow: {
    marginTop: 8,

    flexDirection: 'row',
    flexWrap: 'wrap',

    gap: 9,
  },

  workerMeta: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 3,
  },

  workerMetaText: {
    fontSize: 9,

    color: COLORS.muted,
  },

  workerRight: {
    height: 67,

    marginLeft: 5,

    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  ratingBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 3,

    borderRadius: 999,

    backgroundColor: '#FFF8E8',
  },

  ratingText: {
    fontSize: 10,
    fontWeight: '900',

    color: COLORS.text,
  },

  workerArrow: {
    width: 27,
    height: 27,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 9,

    backgroundColor: COLORS.purpleSoft,
  },

  safetyCard: {
    marginTop: 14,
    marginBottom: 4,

    padding: 13,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 16,

    backgroundColor: COLORS.purpleSoft,
  },

  safetyIcon: {
    width: 40,
    height: 40,

    marginRight: 10,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: '#FFFFFF',
  },

  safetyContent: {
    flex: 1,
  },

  safetyTitle: {
    fontSize: 11.5,
    fontWeight: '900',

    color: COLORS.purpleDark,
  },

  safetyText: {
    marginTop: 3,

    fontSize: 9.5,
    lineHeight: 14,

    color: '#67638B',
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

  navIconBox: {
    width: 36,
    height: 30,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 10,
  },

  navIconBoxActive: {
    backgroundColor: COLORS.primary,
  },

  navText: {
    marginTop: 3,

    fontSize: 8.5,
    fontWeight: '600',

    color: COLORS.muted,
  },

  navTextActive: {
    fontWeight: '800',

    color: COLORS.primaryDark,
  },
});
