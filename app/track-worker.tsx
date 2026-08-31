import React from 'react';
import {
  Alert,
  Image,
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNavBar } from '@/components/bottom-nav-bar';
import { LeafletMap } from '@/components/leaflet-map';
import { PageQuickSwitcher } from '@/components/page-quick-switcher';

const C = {
  primary: '#15157d',
  primaryContainer: '#2e3192',
  onPrimaryContainer: '#9da1ff',
  secondaryContainer: '#fd9923',
  onSecondaryContainer: '#663800',
  accentOrange: '#F7941D',
  background: '#fcf8ff',
  surface: '#ffffff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f5f2fb',
  surfaceContainerHigh: '#eae7f0',
  surfaceContainerHighest: '#e4e1ea',
  surfaceVariant: '#e4e1ea',
  surfaceDim: '#dbd9e1',
  onSurface: '#1b1b21',
  onSurfaceVariant: '#464652',
  outline: '#777683',
  outlineVariant: '#c7c5d4',
  greenSuccess: '#27AE60',
};

const RAHIM_AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCv3ndAOA1HXwuXdDv15r5Bfc9c_rxhJyNc2SXzQsu7SuF6OtdDXPeZ_jIU-grZ3O9d4VZ7_K9x7qKeOqpqH6pjTZbPPmTSdjJK2MzxOVaSPjgGqHZwJMKC6h6eJKTNV6aRRU_yvgm5w2L60KMcltF2TyjSfzSbC2yqCiwpGsRgeRxwqS44YOdBOJqmW8D0yi0j3Tb7_ZKpDbdft_DBKHGnIrK9nMnGuAhoe6Ym8J1J3OX6K2SLGLPXOg';

export default function TrackWorkerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleCallWorker = () => {
    Linking.openURL('tel:+8801700000000').catch(() => {
      Alert.alert('Call Worker', 'Calling Rahim (+880 1700-000000)...');
    });
  };

  const handleMessageWorker = () => {
    Alert.alert('Message Worker', 'Opening chat with Rahim...');
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ── Top App Bar ── */}
      <View style={s.appBar}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={C.primary} />
        </TouchableOpacity>

        <Text style={s.appBarTitle}>Track Worker</Text>

        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.push('/worker-profile')}
          activeOpacity={0.7}>
          <Ionicons name="person" size={18} color={C.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Main Canvas ── */}
      <View style={s.mainCanvas}>
        {/* Map Area */}
        <View style={s.mapWrapper}>
          <LeafletMap
            workerLat={23.7700}
            workerLng={90.3600}
            customerLat={23.7639}
            customerLng={90.3589}
            style={s.mapView}
          />

          {/* ETA Badge Overlay */}
          <View style={s.etaBadge}>
            <MaterialIcons name="schedule" size={18} color={C.primary} />
            <Text style={s.etaText}>12 min away</Text>
          </View>
        </View>

        {/* Tracking Details Bottom Sheet */}
        <View style={[s.bottomSheet, { paddingBottom: Math.max(insets.bottom, 10) + 70 }]}>
          <View style={s.dragHandleRow}>
            <View style={s.dragHandle} />
          </View>

          <View style={s.bottomSheetContent}>
            {/* Status & Profile Header */}
            <View style={s.profileRow}>
              <TouchableOpacity
                onPress={() => router.push('/worker-profile')}
                activeOpacity={0.8}
                style={s.avatarWrapper}>
                <Image
                  source={{ uri: RAHIM_AVATAR_URL }}
                  style={s.avatarImage}
                  resizeMode="cover"
                />
                <View style={s.onlineDot} />
              </TouchableOpacity>

              <View style={s.profileTextCol}>
                <Text style={s.statusTitle}>Rahim is on the way</Text>
                <View style={s.ratingRow}>
                  <MaterialIcons name="star" size={16} color={C.secondaryContainer} />
                  <Text style={s.ratingText}>4.9 • Master Plumber</Text>
                </View>
              </View>

              <TouchableOpacity
                style={s.viewDetailsBtn}
                onPress={() => router.push('/worker-profile')}
                activeOpacity={0.7}>
                <Text style={s.viewDetailsText}>Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={s.actionRow}>
              <TouchableOpacity
                style={s.callBtn}
                onPress={handleCallWorker}
                activeOpacity={0.85}>
                <Ionicons name="call" size={18} color="#ffffff" />
                <Text style={s.callBtnText}>Call Worker</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.messageBtn}
                onPress={handleMessageWorker}
                activeOpacity={0.85}>
                <Ionicons name="chatbubble" size={18} color={C.onPrimaryContainer} />
                <Text style={s.messageBtnText}>Message</Text>
              </TouchableOpacity>
            </View>

            <View style={s.divider} />

            {/* Timeline */}
            <View style={s.timelineContainer}>
              {/* Step 1: Accepted */}
              <View style={s.timelineStepRow}>
                <View style={s.stepLeftCol}>
                  <View style={[s.stepBadge, s.stepBadgeGreen]}>
                    <Ionicons name="checkmark" size={14} color="#ffffff" />
                  </View>
                  <View style={[s.connectingLine, s.connectingLineGreen]} />
                </View>
                <View style={s.stepTextCol}>
                  <Text style={s.stepTitleDone}>Job Accepted</Text>
                  <Text style={s.stepSubtextDone}>10:15 AM</Text>
                </View>
              </View>

              {/* Step 2: On the Way */}
              <View style={s.timelineStepRow}>
                <View style={s.stepLeftCol}>
                  <View style={[s.stepBadge, s.stepBadgePrimary]}>
                    <MaterialIcons name="local-shipping" size={14} color="#ffffff" />
                  </View>
                  <View style={[s.connectingLine, s.connectingLineDashed]} />
                </View>
                <View style={s.stepTextCol}>
                  <Text style={s.stepTitleActive}>On the Way</Text>
                  <Text style={s.stepSubtextActive}>Arriving at 10:45 AM (Dhanmondi)</Text>
                </View>
              </View>

              {/* Step 3: Arrived */}
              <View style={s.timelineStepRow}>
                <View style={s.stepLeftCol}>
                  <View style={s.stepBadgePending} />
                  <View style={[s.connectingLine, s.connectingLineDashed]} />
                </View>
                <View style={s.stepTextCol}>
                  <Text style={s.stepTitlePending}>Arrived at Doorstep</Text>
                </View>
              </View>

              {/* Step 4: Working */}
              <View style={s.timelineStepRow}>
                <View style={s.stepLeftCol}>
                  <View style={s.stepBadgePending} />
                  <View style={[s.connectingLine, s.connectingLineDashed]} />
                </View>
                <View style={s.stepTextCol}>
                  <Text style={s.stepTitlePending}>Working on Repair</Text>
                </View>
              </View>

              {/* Step 5: Completed */}
              <View style={[s.timelineStepRow, { minHeight: 28 }]}>
                <View style={s.stepLeftCol}>
                  <View style={s.stepBadgePending} />
                </View>
                <View style={s.stepTextCol}>
                  <Text style={s.stepTitlePending}>Job Completed</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* ── Unified Bottom Navigation Bar ── */}
      <BottomNavBar activeTab="track" />

      {/* ── Quick Switcher Floating Button ── */}
      <PageQuickSwitcher />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: C.surfaceContainerHigh,
    zIndex: 50,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surfaceContainerLow,
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.primary,
  },
  mainCanvas: {
    flex: 1,
    backgroundColor: C.surface,
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: C.surfaceContainerLow,
  },
  mapView: {
    flex: 1,
  },
  etaBadge: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: C.surfaceDim,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    zIndex: 20,
  },
  etaText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.onSurface,
  },
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    zIndex: 30,
  },
  dragHandleRow: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.surfaceDim,
  },
  bottomSheetContent: {
    paddingHorizontal: 18,
    gap: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: C.surfaceContainerHighest,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileTextCol: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.onSurface,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  viewDetailsBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: C.surfaceContainerLow,
  },
  viewDetailsText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  callBtn: {
    flex: 1,
    height: 46,
    backgroundColor: C.accentOrange,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  callBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  messageBtn: {
    flex: 1,
    height: 46,
    backgroundColor: C.primaryContainer,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  messageBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.onPrimaryContainer,
  },
  divider: {
    height: 1,
    backgroundColor: C.surfaceVariant,
  },
  timelineContainer: {
    gap: 0,
    paddingVertical: 2,
  },
  timelineStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    minHeight: 44,
  },
  stepLeftCol: {
    alignItems: 'center',
    width: 22,
    position: 'relative',
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepBadgeGreen: {
    backgroundColor: C.greenSuccess,
  },
  stepBadgePrimary: {
    backgroundColor: C.primary,
  },
  stepBadgePending: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: C.outlineVariant,
    backgroundColor: '#ffffff',
    zIndex: 2,
  },
  connectingLine: {
    position: 'absolute',
    top: 22,
    bottom: -2,
    left: 10,
    width: 2,
    zIndex: 1,
  },
  connectingLineGreen: {
    backgroundColor: C.greenSuccess,
  },
  connectingLineDashed: {
    backgroundColor: C.surfaceVariant,
  },
  stepTextCol: {
    flex: 1,
    paddingBottom: 10,
  },
  stepTitleDone: {
    fontSize: 13,
    fontWeight: '600',
    color: C.onSurface,
  },
  stepSubtextDone: {
    fontSize: 11,
    color: C.onSurfaceVariant,
    marginTop: 1,
  },
  stepTitleActive: {
    fontSize: 13,
    fontWeight: '800',
    color: C.primary,
  },
  stepSubtextActive: {
    fontSize: 11,
    fontWeight: '600',
    color: C.primary,
    marginTop: 1,
  },
  stepTitlePending: {
    fontSize: 13,
    fontWeight: '500',
    color: C.onSurfaceVariant,
  },
});
