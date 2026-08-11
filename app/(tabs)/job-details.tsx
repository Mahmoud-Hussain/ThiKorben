import React, { useState } from 'react';
import {
  Alert,
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

import { LeafletMap } from '@/components/leaflet-map';
import { Colors } from '@/constants/theme';

interface StatusStep {
  id: number;
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  description: string;
}

const JOB_STATUS_STEPS: StatusStep[] = [
  { id: 1, key: 'accepted', label: 'Accepted', icon: 'check-circle', description: 'Job request confirmed' },
  { id: 2, key: 'on_the_way', label: 'On the Way', icon: 'directions-car', description: 'Heading to location' },
  { id: 3, key: 'arrived', label: 'Arrived', icon: 'home-pin', description: 'At customer location' },
  { id: 4, key: 'working', label: 'Working', icon: 'handyman', description: 'Repair work in progress' },
  { id: 5, key: 'completed', label: 'Completed', icon: 'done-all', description: 'Job completed' },
];

export default function JobDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1); // -1 = pending approval
  const [isAccepted, setIsAccepted] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleAcceptJob = () => {
    setIsAccepted(true);
    setCurrentStepIndex(0);
    setStatusMessage('Job accepted successfully! You can now update your status as you progress.');
  };

  const handleStepPress = (index: number) => {
    if (!isAccepted) {
      Alert.alert('Accept Job First', 'Please tap "Accept Job" before updating the job status.');
      return;
    }
    setCurrentStepIndex(index);
    setStatusMessage(`Status updated to: ${JOB_STATUS_STEPS[index].label}`);
  };

  const handleNegotiate = () => {
    Alert.alert('Negotiate Price', 'Propose a revised rate for this job:', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Propose ৳600', onPress: () => setStatusMessage('Offer of ৳600 sent to customer Nusrat Ahmed.') },
      { text: 'Propose ৳700', onPress: () => setStatusMessage('Offer of ৳700 sent to customer Nusrat Ahmed.') },
    ]);
  };

  const handleDecline = () => {
    Alert.alert('Decline Job', 'Are you sure you want to decline this job request?', [
      { text: 'Keep Job', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: () => {
          setIsAccepted(false);
          setCurrentStepIndex(-1);
          setStatusMessage('Job declined.');
        },
      },
    ]);
  };

  const handleOpenNavigation = () => {
    const lat = 23.7639;
    const lng = 90.3589;
    const label = encodeURIComponent('Customer Location - Nusrat Ahmed');
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
      web: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Location', 'Dhaka, Bangladesh (Lat: 23.7639, Lng: 90.3589)');
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* Fixed Top AppBar */}
      <View style={styles.topAppBar}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>

        <Text style={styles.appBarTitle}>Job Details</Text>

        <View style={styles.appBarRightSpacer} />
      </View>

      {/* Main Content Scroll Canvas */}
      <ScrollView
        style={styles.scrollCanvas}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Status Notification Toast */}
        {statusMessage ? (
          <View style={styles.statusToast}>
            <Ionicons name="information-circle" size={20} color={Colors.primary} />
            <Text style={styles.statusToastText}>{statusMessage}</Text>
            <TouchableOpacity onPress={() => setStatusMessage(null)}>
              <Ionicons name="close" size={18} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* 1. Job Header Card */}
        <View style={styles.card}>
          {/* Urgent Status Badge */}
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentBadgeText}>Urgent</Text>
          </View>

          <View style={styles.jobHeaderRow}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="pipe-wrench" size={26} color={Colors.primary} />
            </View>

            <View style={styles.jobHeaderMeta}>
              <Text style={styles.jobTitle}>Kitchen sink pipe leaking</Text>
              <View style={styles.customerRow}>
                <MaterialIcons name="person" size={16} color={Colors.onSurfaceVariant} />
                <Text style={styles.customerName}>Nusrat Ahmed</Text>
              </View>
            </View>
          </View>

          {/* Location & Price Sub-card Box */}
          <View style={styles.infoMetaBox}>
            <View style={styles.infoItem}>
              <MaterialIcons name="location-on" size={18} color={Colors.outline} />
              <Text style={styles.infoItemText}>1.2 km away</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.infoItem}>
              <MaterialIcons name="payments" size={20} color={Colors.secondary} />
              <Text style={styles.priceText}>৳500</Text>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.descriptionText}>
              {'“Sink is leaking from the main pipe, needs urgent fix.”'}
            </Text>
          </View>
        </View>

        {/* 2. Customer Location Map Card */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Customer Location</Text>

          <View style={styles.mapContainer}>
            <LeafletMap
              style={styles.mapView}
              latitude={23.7639}
              longitude={90.3589}
              zoom={16}
              label="Nusrat Ahmed - Leakage Site"
            />

            {/* Navigate Pill Button */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Navigate to location"
              activeOpacity={0.8}
              onPress={handleOpenNavigation}
              style={styles.navigatePill}>
              <MaterialIcons name="directions" size={18} color={Colors.primary} />
              <Text style={styles.navigatePillText}>Navigate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Job Status Timeline Card */}
        <View style={styles.card}>
          <View style={styles.timelineHeaderRow}>
            <Text style={styles.sectionLabel}>Job Status</Text>
            {isAccepted && (
              <Text style={styles.timelineSubText}>Tap step to update progress</Text>
            )}
          </View>

          <View style={styles.timelineContainer}>
            {JOB_STATUS_STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isLast = index === JOB_STATUS_STEPS.length - 1;

              return (
                <TouchableOpacity
                  key={step.key}
                  activeOpacity={0.7}
                  onPress={() => handleStepPress(index)}
                  style={styles.timelineStepRow}>
                  {/* Timeline Icon Column + Line */}
                  <View style={styles.timelineIconCol}>
                    <View
                      style={[
                        styles.timelineBadge,
                        isCurrent && styles.timelineBadgeCurrent,
                        isCompleted && !isCurrent && styles.timelineBadgeCompleted,
                      ]}>
                      <MaterialIcons
                        name={step.icon}
                        size={16}
                        color={
                          isCompleted
                            ? '#ffffff'
                            : Colors.outline
                        }
                      />
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.timelineLine,
                          isCompleted && index < currentStepIndex && styles.timelineLineCompleted,
                        ]}
                      />
                    )}
                  </View>

                  {/* Step Label Content */}
                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.timelineStepTitle,
                        isCompleted && styles.timelineStepTitleActive,
                        isCurrent && styles.timelineStepTitleCurrent,
                      ]}>
                      {step.label}
                    </Text>
                    <Text style={styles.timelineStepDesc}>{step.description}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* 4. Bottom Sticky Action Bar */}
      <View style={[styles.bottomActionBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.bottomActionContainer}>
          {/* Main Primary Button: Accept Job */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Accept Job"
            activeOpacity={0.85}
            onPress={handleAcceptJob}
            style={[styles.acceptButton, isAccepted && styles.acceptedButton]}>
            <MaterialIcons
              name={isAccepted ? 'check-circle' : 'check-circle-outline'}
              size={24}
              color="#ffffff"
            />
            <Text style={styles.acceptButtonText}>
              {isAccepted ? 'Job Accepted' : 'Accept Job'}
            </Text>
          </TouchableOpacity>

          {/* Secondary Action Row: Negotiate & Decline */}
          <View style={styles.secondaryActionRow}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Negotiate"
              activeOpacity={0.8}
              onPress={handleNegotiate}
              style={styles.negotiateButton}>
              <MaterialCommunityIcons name="forum" size={18} color="#ffffff" />
              <Text style={styles.negotiateButtonText}>Negotiate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Decline"
              activeOpacity={0.8}
              onPress={handleDecline}
              style={styles.declineButton}>
              <MaterialIcons name="close" size={18} color={Colors.onSurfaceVariant} />
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },

  // Top App Bar
  topAppBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    zIndex: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  appBarRightSpacer: {
    width: 40,
  },

  // Scroll Canvas
  scrollCanvas: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 160, // Space for sticky bottom action bar
    gap: 16,
  },

  // Status Toast
  statusToast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryFixed,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
  },
  statusToastText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.onPrimaryFixed,
  },

  // Cards
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },

  // Urgent Badge
  urgentBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    zIndex: 10,
  },
  urgentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSecondaryContainer,
  },

  // Job Header Section
  jobHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
    paddingRight: 60, // Avoid overlap with badge
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobHeaderMeta: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
    lineHeight: 24,
    marginBottom: 4,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },

  // Location & Price Meta Box
  infoMetaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.outlineVariant,
    marginHorizontal: 12,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.secondary,
  },

  // Description
  descriptionSection: {
    gap: 4,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.onSurface,
  },

  // Map Container
  mapContainer: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    position: 'relative',
    backgroundColor: Colors.surfaceContainerHigh,
  },
  mapView: {
    flex: 1,
  },
  navigatePill: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  navigatePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },

  // Timeline
  timelineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timelineSubText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    minHeight: 52,
  },
  timelineIconCol: {
    alignItems: 'center',
    width: 28,
  },
  timelineBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineBadgeCompleted: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  timelineBadgeCurrent: {
    borderColor: Colors.accentOrange,
    backgroundColor: Colors.accentOrange,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 26,
    backgroundColor: Colors.outlineVariant,
    marginVertical: 2,
  },
  timelineLineCompleted: {
    backgroundColor: Colors.primary,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 14,
  },
  timelineStepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.outline,
  },
  timelineStepTitleActive: {
    color: Colors.onSurface,
  },
  timelineStepTitleCurrent: {
    color: Colors.accentOrange,
    fontWeight: '700',
  },
  timelineStepDesc: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },

  // Bottom Action Bar
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceVariant,
    paddingHorizontal: 16,
    paddingTop: 12,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    zIndex: 100,
  },
  bottomActionContainer: {
    gap: 10,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  acceptButton: {
    height: 54,
    backgroundColor: Colors.accentOrange,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: Colors.accentOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  acceptedButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
  },
  acceptButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  secondaryActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  negotiateButton: {
    flex: 1,
    height: 46,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  negotiateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  declineButton: {
    flex: 1,
    height: 46,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
});