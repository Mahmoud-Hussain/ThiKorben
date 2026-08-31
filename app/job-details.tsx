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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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

const JOB_STEPS = [
  { id: 0, title: 'Job Accepted', time: '10:15 AM', desc: 'Worker confirmed request' },
  { id: 1, title: 'On the Way', time: '10:20 AM', desc: 'Traveling to Dhanmondi 11/A' },
  { id: 2, title: 'Arrived at Location', time: '10:35 AM', desc: 'At customer doorstep' },
  { id: 3, title: 'Work in Progress', time: '10:40 AM', desc: 'Fixing sink pipe & seal' },
  { id: 4, title: 'Job Completed', time: '11:15 AM', desc: 'Payment received (৳500)' },
];

export default function JobDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1); // 1 = On the way

  const handleNextStep = () => {
    if (currentStep < 4) {
      const next = currentStep + 1;
      setCurrentStep(next);
      Alert.alert('Status Updated', `Job status moved to: "${JOB_STEPS[next].title}"`);
    } else {
      Alert.alert(
        'Job Finished!',
        '৳500 has been credited to your ThiKorben wallet. Great job!',
        [{ text: 'Back to Worker Dashboard', onPress: () => router.push('/worker-dashboard') }]
      );
    }
  };

  const handleCallCustomer = () => {
    Linking.openURL('tel:+8801800000000').catch(() => {
      Alert.alert('Call Customer', 'Calling Nusrat Ahmed (+880 1800-000000)...');
    });
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Job Details</Text>
          <Text style={styles.jobIdText}>#TK-88219 • Dhanmondi</Text>
        </View>
        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={() => router.push('/track-worker')}
          activeOpacity={0.7}>
          <Ionicons name="navigate-circle" size={26} color={COLORS.accentOrange} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 90 },
        ]}
        showsVerticalScrollIndicator={false}>

        {/* ── Job Summary Card ── */}
        <View style={styles.card}>
          <View style={styles.summaryTopRow}>
            <View style={styles.serviceIconBox}>
              <MaterialCommunityIcons name="pipe-wrench" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.summaryTitleCol}>
              <View style={styles.tagRow}>
                <View style={styles.urgentPill}>
                  <Text style={styles.urgentPillText}>URGENT FIX</Text>
                </View>
                <Text style={styles.payoutBadge}>৳500 Cash / bKash</Text>
              </View>
              <Text style={styles.jobHeading}>Kitchen sink pipe leaking</Text>
              <Text style={styles.customerName}>Customer: Nusrat Ahmed</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location" size={14} color={COLORS.primary} />
              <Text style={styles.metaText}>House 42, Road 11/A, Dhanmondi</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="car" size={14} color={COLORS.textMuted} />
              <Text style={styles.metaText}>1.2 km (8 mins drive)</Text>
            </View>
          </View>

          {/* Customer Call & Message Buttons */}
          <View style={styles.contactRow}>
            <TouchableOpacity
              style={styles.contactBtnCall}
              onPress={handleCallCustomer}
              activeOpacity={0.8}>
              <Ionicons name="call" size={16} color="#ffffff" />
              <Text style={styles.contactBtnCallText}>Call Customer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactBtnChat}
              onPress={() => Alert.alert('Chat', 'Opening direct messaging with Nusrat Ahmed...')}
              activeOpacity={0.8}>
              <Ionicons name="chatbubble" size={16} color={COLORS.primary} />
              <Text style={styles.contactBtnChatText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Customer Problem Description ── */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Customer Note</Text>
          <Text style={styles.descriptionText}>
            &quot;Water is leaking under the kitchen sink every time the tap is turned on. Need someone to bring replacement pipe/coupling and seal it urgently.&quot;
          </Text>
        </View>

        {/* ── Customer Location & Map ── */}
        <View style={styles.card}>
          <View style={styles.mapTitleRow}>
            <View>
              <Text style={styles.cardHeading}>Destination Map</Text>
              <Text style={styles.cardSubheading}>Road 11/A, Dhanmondi 27</Text>
            </View>
            <TouchableOpacity
              style={styles.trackCustomerBtn}
              onPress={() => router.push('/track-worker')}
              activeOpacity={0.8}>
              <Text style={styles.trackCustomerText}>Customer View</Text>
              <Ionicons name="arrow-forward" size={12} color={COLORS.primary} />
            </TouchableOpacity>
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

        {/* ── Job Status Workflow Timeline ── */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Job Lifecycle Progress</Text>
          <Text style={styles.cardSubheading}>Tap action button below to advance stage</Text>

          <View style={styles.timeline}>
            {JOB_STEPS.map((step, idx) => {
              const isDone = idx < currentStep;
              const isCurrent = idx === currentStep;
              const isPending = idx > currentStep;

              return (
                <View key={step.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeftCol}>
                    <View
                      style={[
                        styles.timelineDot,
                        isDone && styles.timelineDotDone,
                        isCurrent && styles.timelineDotCurrent,
                        isPending && styles.timelineDotPending,
                      ]}>
                      {isDone ? (
                        <Ionicons name="checkmark" size={12} color="#ffffff" />
                      ) : isCurrent ? (
                        <View style={styles.pulseInner} />
                      ) : null}
                    </View>
                    {idx < JOB_STEPS.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          isDone ? styles.timelineLineDone : styles.timelineLinePending,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.timelineContent}>
                    <View style={styles.timelineTitleRow}>
                      <Text
                        style={[
                          styles.stepTitle,
                          isCurrent && styles.stepTitleCurrent,
                          isPending && styles.stepTitlePending,
                        ]}>
                        {step.title}
                      </Text>
                      <Text style={styles.stepTime}>{step.time}</Text>
                    </View>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* ── Sticky Action Button Bar ── */}
      <View style={[styles.bottomBar, { bottom: 64 + Math.max(insets.bottom, 10) }]}>
        <TouchableOpacity
          style={styles.advanceStepBtn}
          onPress={handleNextStep}
          activeOpacity={0.88}>
          <MaterialCommunityIcons
            name={
              currentStep === 1
                ? 'navigation'
                : currentStep === 2
                ? 'map-marker-check'
                : currentStep === 3
                ? 'hammer-wrench'
                : 'check-circle'
            }
            size={20}
            color="#ffffff"
          />
          <Text style={styles.advanceStepBtnText}>
            {currentStep === 0
              ? 'Start Trip (On the Way)'
              : currentStep === 1
              ? 'Mark Arrived at Location'
              : currentStep === 2
              ? 'Start Working'
              : currentStep === 3
              ? 'Complete Job & Collect ৳500'
              : 'Job Completed (Finish)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Unified Bottom Navigation Bar ── */}
      <BottomNavBar activeTab="jobs" />

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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  jobIdText: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 1 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
    }),
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  serviceIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitleCol: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  urgentPill: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgentPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  payoutBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.success,
  },
  jobHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
  },
  customerName: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  metaRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerLow,
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.text,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  contactBtnCall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.accentOrange,
    paddingVertical: 10,
    borderRadius: 12,
  },
  contactBtnCallText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  contactBtnChat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.purpleSoft,
    paddingVertical: 10,
    borderRadius: 12,
  },
  contactBtnChatText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  cardSubheading: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 12.5,
    color: COLORS.text,
    lineHeight: 18,
    marginTop: 8,
  },
  mapTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  trackCustomerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.purpleSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trackCustomerText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  mapWrapper: {
    height: 150,
    borderRadius: 14,
    overflow: 'hidden',
  },
  mapView: {
    flex: 1,
  },
  timeline: {
    marginTop: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 52,
  },
  timelineLeftCol: {
    alignItems: 'center',
    width: 22,
    position: 'relative',
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineDotDone: {
    backgroundColor: COLORS.success,
  },
  timelineDotCurrent: {
    backgroundColor: COLORS.primary,
  },
  timelineDotPending: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  pulseInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  timelineLine: {
    position: 'absolute',
    top: 20,
    bottom: -2,
    width: 2,
    zIndex: 1,
  },
  timelineLineDone: {
    backgroundColor: COLORS.success,
  },
  timelineLinePending: {
    backgroundColor: '#e5e7eb',
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 14,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  stepTitleCurrent: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  stepTitlePending: {
    color: '#9ca3af',
  },
  stepTime: {
    fontSize: 10.5,
    color: COLORS.textMuted,
  },
  stepDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 6 },
      android: { elevation: 6 },
      web: { boxShadow: '0 -4px 14px rgba(0,0,0,0.06)' },
    }),
  },
  advanceStepBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  advanceStepBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
});
