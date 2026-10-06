import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNavBar } from '@/components/bottom-nav-bar';
import { LeafletMap } from '@/components/leaflet-map';
import {
  getServiceRequest,
  getServiceRequestProposals,
} from '@/features/community/community.service';
import type {
  CommunityProposal,
  CommunityRequest,
} from '@/features/community/types';
import { loadServiceOrder } from '@/features/orders/order.service';
import type { ServiceOrderRecord } from '@/features/orders/types';

const C = {
  primary: '#15157d',
  primaryContainer: '#2e3192',
  onPrimaryContainer: '#9da1ff',
  secondaryContainer: '#fd9923',
  accentOrange: '#F7941D',
  background: '#fcf8ff',
  surface: '#ffffff',
  surfaceContainerLow: '#f5f2fb',
  surfaceContainerHigh: '#eae7f0',
  surfaceVariant: '#e4e1ea',
  surfaceDim: '#dbd9e1',
  onSurface: '#1b1b21',
  onSurfaceVariant: '#464652',
  outlineVariant: '#c7c5d4',
  greenSuccess: '#27AE60',
};

function errorText(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

export default function TrackWorkerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ requestId?: string }>();

  const [request, setRequest] = useState<CommunityRequest | null>(null);
  const [accepted, setAccepted] = useState<CommunityProposal | null>(null);
  const [order, setOrder] = useState<ServiceOrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    await Promise.resolve();

    if (!params.requestId) {
      setError('Open tracking from an active service order.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextRequest = await getServiceRequest(params.requestId);
      const [nextProposals, nextOrder] = await Promise.all([
        getServiceRequestProposals(params.requestId),
        loadServiceOrder(params.requestId),
      ]);

      setRequest(nextRequest);
      setAccepted(
        nextProposals.find(item => item.status === 'accepted') ?? null,
      );
      setOrder(nextOrder);
    } catch (loadError) {
      setError(errorText(loadError));
    } finally {
      setLoading(false);
    }
  }, [params.requestId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);

    return () => clearTimeout(timer);
  }, [load]);

  const step = useMemo(() => {
    if (!request) return 0;
    if (request.status === 'completed') return 4;
    if (request.status === 'ordered') return 3;
    if (order) return 2;
    if (accepted) return 1;
    return 0;
  }, [accepted, order, request]);

  if (loading) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={s.centerText}>Loading service progress…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !request || !accepted) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.center}>
          <Ionicons
            name="navigate-circle-outline"
            size={42}
            color={C.primary}
          />
          <Text style={s.centerTitle}>Tracking not ready</Text>
          <Text style={s.centerText}>
            {error ?? 'An accepted worker is required before tracking.'}
          </Text>
          <TouchableOpacity
            style={s.retryButton}
            onPress={() => void load()}
          >
            <Text style={s.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const activeTitle =
    request.status === 'completed'
      ? 'Service completed'
      : request.status === 'ordered'
        ? 'Worker is completing the service'
        : order
          ? 'Worker is scheduled for the job'
          : 'Worker assigned';

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={s.appBar}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={C.primary} />
        </TouchableOpacity>

        <View style={s.appBarText}>
          <Text style={s.appBarTitle}>Track Service</Text>
          <Text style={s.appBarSub} numberOfLines={1}>
            {request.title}
          </Text>
        </View>

        <TouchableOpacity
          style={s.backBtn}
          onPress={() => void load()}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={18} color={C.primary} />
        </TouchableOpacity>
      </View>

      <View style={s.mainCanvas}>
        <View style={s.mapWrapper}>
          <LeafletMap
            workerLat={23.7700}
            workerLng={90.3600}
            customerLat={23.7639}
            customerLng={90.3589}
            style={s.mapView}
          />

          <View style={s.etaBadge}>
            <MaterialIcons name="route" size={18} color={C.primary} />
            <Text style={s.etaText}>Presentation route • Dhaka</Text>
          </View>
        </View>

        <View
          style={[
            s.bottomSheet,
            {
              paddingBottom: Math.max(insets.bottom, 10) + 70,
            },
          ]}
        >
          <View style={s.dragHandleRow}>
            <View style={s.dragHandle} />
          </View>

          <View style={s.bottomSheetContent}>
            <View style={s.profileRow}>
              <View style={s.avatar}>
                <Ionicons name="construct" size={23} color="#fff" />
              </View>

              <View style={s.profileTextCol}>
                <Text style={s.statusTitle}>{activeTitle}</Text>
                <Text style={s.ratingText}>
                  Accepted labor ৳
                  {Number(accepted.price_amount).toLocaleString()} •{' '}
                  {accepted.availability_note}
                </Text>
              </View>

              <View style={s.liveBadge}>
                <View style={s.liveDot} />
                <Text style={s.liveText}>LIVE</Text>
              </View>
            </View>

            <View style={s.actionRow}>
              <TouchableOpacity
                style={s.callBtn}
                onPress={() =>
                  router.push({
                    pathname: '/job-chat',
                    params: { requestId: request.id },
                  })
                }
                activeOpacity={0.85}
              >
                <Ionicons name="chatbubble" size={18} color="#ffffff" />
                <Text style={s.callBtnText}>Job Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.messageBtn}
                onPress={() =>
                  router.push({
                    pathname: '/job-details',
                    params: { requestId: request.id },
                  })
                }
                activeOpacity={0.85}
              >
                <Ionicons
                  name="pulse-outline"
                  size={18}
                  color={C.onPrimaryContainer}
                />
                <Text style={s.messageBtnText}>Job Progress</Text>
              </TouchableOpacity>
            </View>

            <View style={s.divider} />

            <View style={s.timelineContainer}>
              <TimelineStep
                label="Worker Assigned"
                detail="Customer accepted a worker proposal"
                state={step >= 1 ? 'done' : 'pending'}
                connect
              />
              <TimelineStep
                label="Service Order Confirmed"
                detail={
                  order
                    ? `Order TK-${order.id.slice(0, 8).toUpperCase()}`
                    : 'Waiting for customer checkout'
                }
                state={step >= 2 ? 'done' : step === 1 ? 'active' : 'pending'}
                connect
              />
              <TimelineStep
                label="Work In Progress"
                detail={
                  request.status === 'ordered'
                    ? 'Assigned worker started the service'
                    : 'Worker starts this step from Job Progress'
                }
                state={step >= 3 ? 'done' : step === 2 ? 'active' : 'pending'}
                connect
              />
              <TimelineStep
                label="Job Completed"
                detail="Completion becomes Skill Passport evidence"
                state={step >= 4 ? 'done' : step === 3 ? 'active' : 'pending'}
              />
            </View>

            {request.status === 'completed' ? (
              <TouchableOpacity
                style={s.passportButton}
                onPress={() =>
                  router.push('/worker-skill-passport' as Href)
                }
              >
                <Ionicons name="ribbon-outline" size={18} color="#fff" />
                <Text style={s.passportText}>View Worker Skill Passport</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      <BottomNavBar />
    </SafeAreaView>
  );
}

function TimelineStep({
  label,
  detail,
  state,
  connect = false,
}: {
  label: string;
  detail: string;
  state: 'done' | 'active' | 'pending';
  connect?: boolean;
}) {
  return (
    <View style={s.timelineStepRow}>
      <View style={s.stepLeftCol}>
        <View
          style={[
            s.stepBadge,
            state === 'done'
              ? s.stepBadgeGreen
              : state === 'active'
                ? s.stepBadgePrimary
                : s.stepBadgePending,
          ]}
        >
          {state === 'done' ? (
            <Ionicons name="checkmark" size={14} color="#fff" />
          ) : state === 'active' ? (
            <View style={s.activeInnerDot} />
          ) : null}
        </View>

        {connect ? (
          <View
            style={[
              s.connectingLine,
              state === 'done' && s.connectingLineGreen,
            ]}
          />
        ) : null}
      </View>

      <View style={s.stepTextCol}>
        <Text
          style={[
            s.stepTitle,
            state === 'done' && s.stepTitleDone,
            state === 'active' && s.stepTitleActive,
          ]}
        >
          {label}
        </Text>
        <Text style={s.stepDetail}>{detail}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  appBar: {
    minHeight: 58,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderBottomWidth: 1,
    borderBottomColor: C.surfaceContainerHigh,
    backgroundColor: '#ffffff',
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
  appBarText: { flex: 1, alignItems: 'center' },
  appBarTitle: { fontSize: 15, fontWeight: '900', color: C.primary },
  appBarSub: {
    marginTop: 2,
    maxWidth: 250,
    fontSize: 8.5,
    color: C.onSurfaceVariant,
  },
  mainCanvas: { flex: 1, backgroundColor: C.surface },
  mapWrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: C.surfaceContainerLow,
  },
  mapView: { flex: 1 },
  etaBadge: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: C.surfaceDim,
    borderRadius: 999,
    backgroundColor: '#ffffff',
  },
  etaText: { fontSize: 10, fontWeight: '800', color: C.onSurface },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#ffffff',
  },
  dragHandleRow: { alignItems: 'center', paddingVertical: 9 },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.surfaceDim,
  },
  bottomSheetContent: { paddingHorizontal: 17, gap: 14 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
  },
  profileTextCol: { flex: 1 },
  statusTitle: { fontSize: 14, fontWeight: '900', color: C.onSurface },
  ratingText: {
    marginTop: 3,
    fontSize: 9,
    lineHeight: 13,
    color: C.onSurfaceVariant,
  },
  liveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: '#eaf8f0',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.greenSuccess,
  },
  liveText: { fontSize: 7.5, fontWeight: '900', color: C.greenSuccess },
  actionRow: { flexDirection: 'row', gap: 9 },
  callBtn: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: C.accentOrange,
  },
  callBtnText: { fontSize: 10.5, fontWeight: '900', color: '#ffffff' },
  messageBtn: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: C.primaryContainer,
  },
  messageBtnText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: C.onPrimaryContainer,
  },
  divider: { height: 1, backgroundColor: C.surfaceVariant },
  timelineContainer: { gap: 0 },
  timelineStepRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepLeftCol: { width: 24, alignItems: 'center', position: 'relative' },
  stepBadge: {
    width: 24,
    height: 24,
    zIndex: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeGreen: { backgroundColor: C.greenSuccess },
  stepBadgePrimary: { backgroundColor: C.primary },
  stepBadgePending: {
    borderWidth: 2,
    borderColor: C.outlineVariant,
    backgroundColor: '#ffffff',
  },
  activeInnerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  connectingLine: {
    position: 'absolute',
    top: 24,
    bottom: -2,
    width: 2,
    backgroundColor: C.surfaceVariant,
  },
  connectingLineGreen: { backgroundColor: C.greenSuccess },
  stepTextCol: { flex: 1, paddingBottom: 11 },
  stepTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: C.onSurfaceVariant,
  },
  stepTitleDone: { color: C.onSurface },
  stepTitleActive: { fontWeight: '900', color: C.primary },
  stepDetail: {
    marginTop: 2,
    fontSize: 8.5,
    lineHeight: 13,
    color: C.onSurfaceVariant,
  },
  passportButton: {
    minHeight: 43,
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: C.primary,
  },
  passportText: { fontSize: 10, fontWeight: '900', color: '#fff' },
  center: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: { marginTop: 9, fontSize: 15, fontWeight: '900', color: C.onSurface },
  centerText: {
    marginTop: 7,
    maxWidth: 320,
    textAlign: 'center',
    fontSize: 10.5,
    lineHeight: 16,
    color: C.onSurfaceVariant,
  },
  retryButton: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 11,
    backgroundColor: C.primary,
  },
  retryText: { fontSize: 10, fontWeight: '900', color: '#fff' },
});
