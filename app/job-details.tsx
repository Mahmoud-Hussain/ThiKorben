import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useSession } from '@/contexts/session-context';
import {
  advanceServiceRequestStatus,
  getServiceRequest,
  getServiceRequestProposals,
} from '@/features/community/community.service';
import type {
  CommunityProposal,
  CommunityRequest,
} from '@/features/community/types';

const C = {
  primary: '#15157d',
  primarySoft: '#eeedff',
  orange: '#F7941D',
  orangeSoft: '#fff4e7',
  green: '#178c4f',
  greenSoft: '#eaf8f0',
  bg: '#f7f6fb',
  card: '#fff',
  text: '#181820',
  muted: '#6b6b78',
  border: '#e5e2eb',
  red: '#c43d39',
};

function money(value: number, currency: string) {
  return `${currency === 'BDT' ? '৳' : currency + ' '}${Number(value).toLocaleString()}`;
}

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

const STEPS = [
  { key: 'assigned', label: 'Worker assigned' },
  { key: 'ordered', label: 'Work in progress' },
  { key: 'completed', label: 'Job completed' },
] as const;

export default function JobDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ requestId?: string }>();
  const { user, role } = useSession();

  const [request, setRequest] = useState<CommunityRequest | null>(null);
  const [proposals, setProposals] = useState<CommunityProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptedProposal = useMemo(
    () => proposals.find(item => item.status === 'accepted') ?? null,
    [proposals],
  );

  const assignedWorker = acceptedProposal?.worker_id === user?.id;
  const customer = request?.customer_id === user?.id;

  const currentStep = useMemo(() => {
    if (!request) return -1;
    if (request.status === 'completed') return 2;
    if (request.status === 'ordered') return 1;
    if (request.status === 'assigned') return 0;
    return -1;
  }, [request]);

  const load = useCallback(async () => {
    if (!params.requestId) {
      setError('Service request ID is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [nextRequest, nextProposals] = await Promise.all([
        getServiceRequest(params.requestId),
        getServiceRequestProposals(params.requestId),
      ]);

      setRequest(nextRequest);
      setProposals(nextProposals);
    } catch (loadError) {
      setError(messageFrom(loadError));
    } finally {
      setLoading(false);
    }
  }, [params.requestId]);

  useEffect(() => {
    void load();
  }, [load]);

  const advance = async () => {
    if (!request || !assignedWorker || saving) {
      return;
    }

    const nextStatus =
      request.status === 'assigned'
        ? 'ordered'
        : request.status === 'ordered'
          ? 'completed'
          : null;

    if (!nextStatus) {
      return;
    }

    setSaving(true);

    try {
      await advanceServiceRequestStatus(request.id, nextStatus);
      await load();

      Alert.alert(
        nextStatus === 'completed' ? 'Job completed' : 'Status updated',
        nextStatus === 'completed'
          ? 'The service request is now marked completed.'
          : 'The customer can now see that work is in progress.',
      );
    } catch (advanceError) {
      Alert.alert('Could not update job', messageFrom(advanceError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.centerText}>Loading job progress…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !request) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={36} color={C.red} />
          <Text style={styles.centerTitle}>Unable to open job</Text>
          <Text style={styles.centerText}>{error ?? 'Job not found.'}</Text>
          <Pressable style={styles.retry} onPress={() => void load()}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Job Progress</Text>
          <Text style={styles.headerSubtitle}>{request.title}</Text>
        </View>

        <Pressable style={styles.headerButton} onPress={() => void load()}>
          <Ionicons name="refresh" size={20} color={C.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summary}>
          <View style={styles.summaryIcon}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={24} color={C.primary} />
          </View>

          <View style={styles.flex}>
            <Text style={styles.summaryTitle}>{request.title}</Text>
            <Text style={styles.summaryMeta}>
              {request.location_label} • {request.status.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.budget}>
            {money(request.budget_amount, request.currency)}
          </Text>
        </View>

        {acceptedProposal ? (
          <View style={styles.assigned}>
            <Ionicons name="person-circle-outline" size={27} color={C.green} />
            <View style={styles.flex}>
              <Text style={styles.assignedTitle}>Assigned worker confirmed</Text>
              <Text style={styles.assignedText}>
                Labor proposal {money(acceptedProposal.price_amount, acceptedProposal.currency)} • {acceptedProposal.availability_note}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Service lifecycle</Text>
          <Text style={styles.sectionText}>
            Controlled status transitions are written through secure backend RPCs.
          </Text>

          <View style={styles.timeline}>
            {STEPS.map((step, index) => {
              const done = currentStep >= index;
              const active = currentStep === index;

              return (
                <View key={step.key} style={styles.timelineRow}>
                  <View style={styles.timelineRail}>
                    <View
                      style={[
                        styles.timelineDot,
                        done && styles.timelineDotDone,
                        active && styles.timelineDotActive,
                      ]}
                    >
                      {done ? (
                        <Ionicons name="checkmark" size={13} color="#fff" />
                      ) : null}
                    </View>

                    {index < STEPS.length - 1 ? (
                      <View
                        style={[
                          styles.timelineLine,
                          currentStep > index && styles.timelineLineDone,
                        ]}
                      />
                    ) : null}
                  </View>

                  <View style={styles.timelineBody}>
                    <Text
                      style={[
                        styles.timelineTitle,
                        active && styles.timelineTitleActive,
                      ]}
                    >
                      {step.label}
                    </Text>
                    <Text style={styles.timelineText}>
                      {index === 0
                        ? 'Customer accepted a worker proposal.'
                        : index === 1
                          ? 'Assigned worker started the service.'
                          : 'Assigned worker completed the service.'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {acceptedProposal ? (
          <View style={styles.actionGrid}>
            <Pressable
              style={styles.actionCard}
              onPress={() =>
                router.push({
                  pathname: '/job-chat',
                  params: { requestId: request.id },
                })
              }
            >
              <View style={[styles.actionIcon, { backgroundColor: C.primarySoft }]}>
                <Ionicons name="chatbubbles-outline" size={22} color={C.primary} />
              </View>
              <Text style={styles.actionTitle}>Private Chat</Text>
              <Text style={styles.actionText}>
                Secure conversation between the customer and assigned worker.
              </Text>
            </Pressable>

            <Pressable
              style={styles.actionCard}
              onPress={() =>
                router.push({
                  pathname: '/job-materials',
                  params: { requestId: request.id },
                })
              }
            >
              <View style={[styles.actionIcon, { backgroundColor: C.orangeSoft }]}>
                <Ionicons name="cart-outline" size={22} color={C.orange} />
              </View>
              <Text style={styles.actionTitle}>Materials</Text>
              <Text style={styles.actionText}>
                Request, review, approve, or reject catalog-backed materials.
              </Text>
            </Pressable>
          </View>
        ) : null}

        {assignedWorker && (request.status === 'assigned' || request.status === 'ordered') ? (
          <Pressable
            style={[styles.advanceButton, saving && styles.disabled]}
            disabled={saving}
            onPress={() => void advance()}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name={request.status === 'assigned' ? 'play' : 'checkmark-circle'}
                  size={18}
                  color="#fff"
                />
                <Text style={styles.advanceText}>
                  {request.status === 'assigned'
                    ? 'Start Work'
                    : 'Mark Job Completed'}
                </Text>
              </>
            )}
          </Pressable>
        ) : null}

        {customer ? (
          <View style={styles.customerInfo}>
            <Ionicons name="eye-outline" size={20} color={C.primary} />
            <Text style={styles.customerInfoText}>
              You can follow progress here. Only the assigned worker can advance lifecycle status.
            </Text>
          </View>
        ) : null}

        {role === 'worker' && !assignedWorker ? (
          <View style={styles.customerInfo}>
            <Ionicons name="lock-closed-outline" size={20} color={C.primary} />
            <Text style={styles.customerInfoText}>
              This progress view is read-only unless you are the accepted worker for this request.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    minHeight: 66,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: '#fff',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 14, fontWeight: '900', color: C.text },
  headerSubtitle: { marginTop: 2, fontSize: 9.5, color: C.muted },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 15,
    paddingBottom: 50,
    gap: 12,
  },
  summary: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primarySoft,
  },
  summaryTitle: { fontSize: 12.5, fontWeight: '900', color: C.text },
  summaryMeta: { marginTop: 2, fontSize: 9.5, color: C.muted },
  budget: { fontSize: 13, fontWeight: '900', color: C.orange },
  assigned: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 16,
    backgroundColor: C.greenSoft,
  },
  assignedTitle: { fontSize: 11.5, fontWeight: '900', color: C.green },
  assignedText: { marginTop: 2, fontSize: 9.5, lineHeight: 15, color: C.muted },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: C.text },
  sectionText: { marginTop: 3, fontSize: 9.5, lineHeight: 15, color: C.muted },
  timeline: { marginTop: 16 },
  timelineRow: { minHeight: 72, flexDirection: 'row' },
  timelineRail: { width: 31, alignItems: 'center', position: 'relative' },
  timelineDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#d5d2dc',
    backgroundColor: '#fff',
    zIndex: 2,
  },
  timelineDotDone: { borderColor: C.green, backgroundColor: C.green },
  timelineDotActive: { borderColor: C.primary },
  timelineLine: {
    position: 'absolute',
    top: 26,
    bottom: 0,
    width: 2,
    backgroundColor: '#dedbe4',
  },
  timelineLineDone: { backgroundColor: C.green },
  timelineBody: { flex: 1, paddingLeft: 10, paddingTop: 2 },
  timelineTitle: { fontSize: 11.5, fontWeight: '800', color: C.muted },
  timelineTitleActive: { color: C.primary, fontWeight: '900' },
  timelineText: { marginTop: 3, fontSize: 9.5, lineHeight: 14, color: C.muted },
  actionGrid: { flexDirection: 'row', gap: 10 },
  actionCard: {
    flex: 1,
    minHeight: 132,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 17,
    backgroundColor: '#fff',
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: { marginTop: 9, fontSize: 11.5, fontWeight: '900', color: C.text },
  actionText: { marginTop: 3, fontSize: 9.5, lineHeight: 14, color: C.muted },
  advanceButton: {
    minHeight: 49,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  advanceText: { fontSize: 11.5, fontWeight: '900', color: '#fff' },
  disabled: { opacity: 0.5 },
  customerInfo: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderRadius: 15,
    backgroundColor: C.primarySoft,
  },
  customerInfoText: { flex: 1, fontSize: 9.5, lineHeight: 15, color: C.muted },
  center: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  centerTitle: { marginTop: 10, fontSize: 15, fontWeight: '900', color: C.text },
  centerText: {
    marginTop: 7,
    maxWidth: 330,
    fontSize: 10.5,
    lineHeight: 16,
    textAlign: 'center',
    color: C.muted,
  },
  retry: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: C.primary,
  },
  retryText: { fontSize: 10.5, fontWeight: '900', color: '#fff' },
});
