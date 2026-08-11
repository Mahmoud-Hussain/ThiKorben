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
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LeafletMap } from '@/components/leaflet-map';

// ─── Design Tokens — directly from code.html tailwind config ─────────────────
const C = {
  primary:                '#15157d',
  primaryContainer:       '#2e3192',
  onPrimaryContainer:     '#9da1ff',
  secondaryContainer:     '#fd9923',
  onSecondaryContainer:   '#663800',
  accentOrange:           '#F7941D',
  background:             '#fcf8ff',
  surface:                '#fcf8ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow:    '#f5f2fb',
  surfaceContainerHigh:   '#eae7f0',
  surfaceContainerHighest:'#e4e1ea',
  surfaceVariant:         '#e4e1ea',
  surfaceDim:             '#dbd9e1',
  onSurface:              '#1b1b21',
  onSurfaceVariant:       '#464652',
  outline:                '#777683',
  outlineVariant:         '#c7c5d4',
  greenSuccess:           '#27AE60',
};

const RAHIM_AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCv3ndAOA1HXwuXdDv15r5Bfc9c_rxhJyNc2SXzQsu7SuF6OtdDXPeZ_jIU-grZ3O9d4VZ7_K9x7qKeOqpqH6pjTZbPPmTSdjJK2MzxOVaSPjgGqHZwJMKC6h6eJKTNV6aRRU_yvgm5w2L60KMcltF2TyjSfzSbC2yqCiwpGsRgeRxwqS44YOdBOJqmW8D0yi0j3Tb7_ZKpDbdft_DBKHGnIrK9nMnGuAhoe6Ym8J1J3OX6K2SLGLPXOg';

export default function TrackWorkerScreen() {
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
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      {/* ── TopAppBar (code.html <header>) ─────────────────────────────────
           fixed top-0 w-full z-50 bg-surface shadow-sm
           flex justify-between items-center px-margin-mobile h-16         */}
      <View style={s.appBar}>
        <TouchableOpacity
          style={s.backBtn}
          activeOpacity={0.7}
          accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={C.primary} />
        </TouchableOpacity>

        <Text style={s.appBarTitle}>Track Worker</Text>

        <View style={s.appBarSpacer} />
      </View>

      {/* ── Main Content Canvas ──────────────────────────────────────────── */}
      <View style={s.mainCanvas}>

        {/* ── Map Area ────────────────────────────────────────────────────── */}
        <View style={s.mapWrapper}>
          <LeafletMap
            workerLat={23.7700}
            workerLng={90.3600}
            customerLat={23.7639}
            customerLng={90.3589}
            style={s.mapView}
          />

          {/* ETA Badge Overlay (top center) — 12 min away */}
          <View style={s.etaBadge}>
            <MaterialIcons name="schedule" size={18} color={C.primary} />
            <Text style={s.etaText}>12 min away</Text>
          </View>
        </View>

        {/* ── Tracking Details Bottom Sheet / Card ──────────────────────────
             bg-surface rounded-t-xl shadow-[0_-8px_20px_rgba(0,0,0,0.08)]
             pb-margin-mobile flex flex-col shrink-0                         */}
        <View style={[s.bottomSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>

          {/* Drag Handle */}
          <View style={s.dragHandleRow}>
            <View style={s.dragHandle} />
          </View>

          <View style={s.bottomSheetContent}>

            {/* ── Status & Profile Header ─────────────────────────────────── */}
            <View style={s.profileRow}>
              <View style={s.avatarWrapper}>
                <Image
                  source={{ uri: RAHIM_AVATAR_URL }}
                  style={s.avatarImage}
                  resizeMode="cover"
                />
                <View style={s.onlineDot} />
              </View>

              <View style={s.profileTextCol}>
                <Text style={s.statusTitle}>Rahim is on the way</Text>
                <View style={s.ratingRow}>
                  <MaterialIcons name="star" size={16} color={C.secondaryContainer} />
                  <Text style={s.ratingText}>4.9 • Plumber</Text>
                </View>
              </View>
            </View>

            {/* ── Action Buttons (Call Worker & Message) ─────────────────── */}
            <View style={s.actionRow}>
              {/* Call Worker — bg-[#F7941D] text-white rounded-full py-4 px-6 */}
              <TouchableOpacity
                style={s.callBtn}
                onPress={handleCallWorker}
                activeOpacity={0.85}
                accessibilityLabel="Call Worker">
                <Ionicons name="call" size={18} color="#ffffff" />
                <Text style={s.callBtnText}>Call Worker</Text>
              </TouchableOpacity>

              {/* Message — bg-primary-container text-on-primary-container rounded-full py-4 px-6 */}
              <TouchableOpacity
                style={s.messageBtn}
                onPress={handleMessageWorker}
                activeOpacity={0.85}
                accessibilityLabel="Message">
                <Ionicons name="chatbubble" size={18} color={C.onPrimaryContainer} />
                <Text style={s.messageBtnText}>Message</Text>
              </TouchableOpacity>
            </View>

            {/* Divider Line */}
            <View style={s.divider} />

            {/* ── Timeline ─────────────────────────────────────────────────── */}
            <View style={s.timelineContainer}>

              {/* Step 1: Accepted (Completed) */}
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

              {/* Step 2: On the Way (Active) */}
              <View style={s.timelineStepRow}>
                <View style={s.stepLeftCol}>
                  <View style={[s.stepBadge, s.stepBadgePrimary]}>
                    <MaterialIcons name="local-shipping" size={14} color="#ffffff" />
                  </View>
                  <View style={[s.connectingLine, s.connectingLineDashed]} />
                </View>
                <View style={s.stepTextCol}>
                  <Text style={s.stepTitleActive}>On the Way</Text>
                  <Text style={s.stepSubtextActive}>Arriving at 10:45 AM</Text>
                </View>
              </View>

              {/* Step 3: Arrived (Pending) */}
              <View style={s.timelineStepRow}>
                <View style={s.stepLeftCol}>
                  <View style={s.stepBadgePending} />
                  <View style={[s.connectingLine, s.connectingLineDashed]} />
                </View>
                <View style={s.stepTextCol}>
                  <Text style={s.stepTitlePending}>Arrived</Text>
                </View>
              </View>

              {/* Step 4: Working (Pending) */}
              <View style={s.timelineStepRow}>
                <View style={s.stepLeftCol}>
                  <View style={s.stepBadgePending} />
                  <View style={[s.connectingLine, s.connectingLineDashed]} />
                </View>
                <View style={s.stepTextCol}>
                  <Text style={s.stepTitlePending}>Working</Text>
                </View>
              </View>

              {/* Step 5: Completed (Pending) */}
              <View style={[s.timelineStepRow, { minHeight: 28 }]}>
                <View style={s.stepLeftCol}>
                  <View style={s.stepBadgePending} />
                </View>
                <View style={s.stepTextCol}>
                  <Text style={s.stepTitlePending}>Completed</Text>
                </View>
              </View>

            </View>

          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

// ─── Styles — mapping directly to code.html tailwind classes ───────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.surface,
  },

  // ── TopAppBar ──────────────────────────────────────────────────────────────
  appBar: {
    height: 64,                    // h-16 = 64px
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,         // px-margin-mobile = 20px
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.surfaceContainerHigh,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    zIndex: 50,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surfaceContainerLow,
  },
  appBarTitle: {
    fontSize: 22,                  // text-headline-lg-mobile
    lineHeight: 28,
    fontWeight: '700',
    color: C.primary,
  },
  appBarSpacer: {
    width: 40,
  },

  // ── Main Canvas ────────────────────────────────────────────────────────────
  mainCanvas: {
    flex: 1,
    backgroundColor: C.surface,
  },

  // ── Map Area ───────────────────────────────────────────────────────────────
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
    backgroundColor: C.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    fontSize: 14,                  // font-label-lg
    lineHeight: 20,
    fontWeight: '600',
    color: C.onSurface,
  },

  // ── Bottom Sheet / Card ───────────────────────────────────────────────────
  bottomSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    zIndex: 30,
  },
  dragHandleRow: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.surfaceDim,
  },
  bottomSheetContent: {
    paddingHorizontal: 20,         // px-margin-mobile
    gap: 20,                       // gap-lg
  },

  // ── Profile Header ────────────────────────────────────────────────────────
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: C.surfaceContainerHighest,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',     // bg-green-500
    borderWidth: 2,
    borderColor: C.surface,
  },
  profileTextCol: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,                  // font-headline-md
    lineHeight: 28,
    fontWeight: '600',
    color: C.onSurface,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 16,                  // font-body-md
    lineHeight: 24,
    color: C.onSurfaceVariant,
  },

  // ── Action Buttons ─────────────────────────────────────────────────────────
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  callBtn: {
    flex: 1,
    height: 52,
    backgroundColor: C.accentOrange, // bg-[#F7941D]
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: C.accentOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  callBtnText: {
    fontSize: 14,                  // font-label-lg
    lineHeight: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  messageBtn: {
    flex: 1,
    height: 52,
    backgroundColor: C.primaryContainer, // bg-primary-container
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: C.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  messageBtnText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: C.onPrimaryContainer,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: C.surfaceVariant,
  },

  // ── Timeline ───────────────────────────────────────────────────────────────
  timelineContainer: {
    gap: 0,
    paddingVertical: 4,
  },
  timelineStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    minHeight: 48,
  },
  stepLeftCol: {
    alignItems: 'center',
    width: 24,
    position: 'relative',
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.outlineVariant,
    backgroundColor: C.surface,
    zIndex: 2,
  },
  connectingLine: {
    position: 'absolute',
    top: 24,
    bottom: -4,
    left: 11,
    width: 2,
    zIndex: 1,
  },
  connectingLineGreen: {
    backgroundColor: C.greenSuccess,
  },
  connectingLineDashed: {
    backgroundColor: C.surfaceVariant,
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    borderColor: C.outlineVariant,
  },
  stepTextCol: {
    flex: 1,
    paddingBottom: 12,
  },
  stepTitleDone: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: C.onSurface,
  },
  stepSubtextDone: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: C.onSurfaceVariant,
    marginTop: 2,
  },
  stepTitleActive: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: C.primary,
  },
  stepSubtextActive: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: C.primary,
    marginTop: 2,
  },
  stepTitlePending: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: C.onSurfaceVariant,
  },
});
