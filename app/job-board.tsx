import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/contexts/session-context';
import { supabase } from '@/lib/supabase';
import {
  acceptServiceProposal,
  addServiceRequestComment,
  createServiceRequest,
  getServiceRequest,
  getServiceRequestComments,
  getServiceRequestProposals,
  submitServiceProposal,
} from '@/features/community/community.service';
import type {
  CommunityCategory,
  CommunityComment,
  CommunityProposal,
  CommunityRequest,
} from '@/features/community/types';

const COLORS = {
  primary: '#15157d',
  purpleSoft: '#eeedff',
  orange: '#F7941D',
  orangeSoft: '#fff4e7',
  green: '#178c4f',
  greenSoft: '#eaf8f0',
  red: '#c43d39',
  redSoft: '#fff0ef',
  background: '#f7f6fb',
  card: '#ffffff',
  text: '#181820',
  muted: '#6c6c79',
  border: '#e5e2eb',
};

const CATEGORIES: {
  id: CommunityCategory;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
  { id: 'plumbing', label: 'Plumbing', icon: 'water-outline' },
  { id: 'electrical', label: 'Electrical', icon: 'flash-outline' },
  { id: 'carpentry', label: 'Carpentry', icon: 'hammer-outline' },
  { id: 'cleaning', label: 'Cleaning', icon: 'sparkles-outline' },
  { id: 'painting', label: 'Painting', icon: 'color-palette-outline' },
  { id: 'ac', label: 'AC Repair', icon: 'snow-outline' },
];

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

function money(value: number, currency = 'BDT') {
  return `${currency === 'BDT' ? '৳' : currency + ' '}${Number(value).toLocaleString()}`;
}

function initials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');
}

export default function JobBoardScreen() {
  const params = useLocalSearchParams<{
    mode?: string;
    params.requestId?: string;
    title?: string;
    category?: CommunityCategory;
    description?: string;
    budget?: string;
    schedule?: string;
  }>();

  const { role, user, profile } = useSession();

  const createMode = params.mode === 'create';

  const [request, setRequest] = useState<CommunityRequest | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [proposals, setProposals] = useState<CommunityProposal[]>([]);
  const [loading, setLoading] = useState(!createMode);
  const [saving, setSaving] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [title, setTitle] = useState(params.title ?? '');
  const [category, setCategory] = useState<CommunityCategory>(
    CATEGORIES.some(item => item.id === params.category)
      ? (params.category as CommunityCategory)
      : 'plumbing',
  );
  const [description, setDescription] = useState(params.description ?? '');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState(params.budget ?? '');
  const [scheduleNote, setScheduleNote] = useState(
    params.schedule ?? 'As soon as possible',
  );

  const [comment, setComment] = useState('');

  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalPrice, setProposalPrice] = useState('');
  const [proposalAvailability, setProposalAvailability] = useState('Available today');
  const [proposalNote, setProposalNote] = useState('');

  const isOwner = request?.customer_id === user?.id;
  const acceptedProposal = useMemo(
    () => proposals.find(item => item.status === 'accepted') ?? null,
    [proposals],
  );

  const loadDetails = useCallback(async () => {
    if (createMode || !params.requestId) {
      return;
    }

    setLoading(true);
    setDetailError(null);

    try {
      const [nextRequest, nextComments, nextProposals] = await Promise.all([
        getServiceRequest(params.requestId),
        getServiceRequestComments(params.requestId),
        getServiceRequestProposals(params.requestId),
      ]);

      setRequest(nextRequest);
      setComments(nextComments);
      setProposals(nextProposals);
    } catch (error) {
      setDetailError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [createMode, params.requestId]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      await Promise.resolve();

      if (active) {
        await loadDetails();
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [loadDetails]);

  useEffect(() => {
    if (!params.requestId || createMode) {
      return;
    }

    const reload = () => {
      void loadDetails();
    };

    const channel = supabase
      .channel(`job-board:${params.requestId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_requests',
          filter: `id=eq.${params.requestId}`,
        },
        reload,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_proposals',
          filter: `service_request_id=eq.${params.requestId}`,
        },
        reload,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_request_comments',
          filter: `service_request_id=eq.${params.requestId}`,
        },
        reload,
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [createMode, loadDetails, params.requestId]);

  const submitRequest = async () => {
    if (role !== 'customer') {
      Alert.alert('Customer mode required', 'Switch to customer mode to post a service request.');
      return;
    }

    const numericBudget = Number(budget);

    if (
      !title.trim() ||
      !description.trim() ||
      !location.trim() ||
      !budget.trim() ||
      !Number.isFinite(numericBudget)
    ) {
      Alert.alert('Complete the form', 'Add a title, description, location, and valid budget.');
      return;
    }

    setSaving(true);

    try {
      const created = await createServiceRequest({
        title,
        category,
        description,
        locationLabel: location,
        budgetAmount: numericBudget,
        scheduleNote,
      });

      router.replace({
        pathname: '/job-board',
        params: {
          mode: 'detail',
          params.requestId: created.id,
        },
      });
    } catch (error) {
      Alert.alert('Could not post request', errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const submitComment = async () => {
    if (!request || !comment.trim() || saving) {
      return;
    }

    setSaving(true);

    try {
      await addServiceRequestComment({
        serviceRequestId: request.id,
        body: comment,
      });

      setComment('');
      await loadDetails();
    } catch (error) {
      Alert.alert('Comment failed', errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const sendProposal = async () => {
    if (!request || role !== 'worker' || saving) {
      return;
    }

    const price = Number(proposalPrice);

    if (!Number.isFinite(price) || price <= 0) {
      Alert.alert('Invalid price', 'Enter a valid labor price.');
      return;
    }

    setSaving(true);

    try {
      await submitServiceProposal({
        serviceRequestId: request.id,
        priceAmount: price,
        availabilityNote: proposalAvailability,
        note: proposalNote,
      });

      setProposalOpen(false);
      setProposalPrice('');
      setProposalNote('');
      await loadDetails();
    } catch (error) {
      Alert.alert('Proposal failed', errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const acceptProposal = async (proposalId: string) => {
    if (!request || !isOwner || saving) {
      return;
    }

    setSaving(true);

    try {
      await acceptServiceProposal(proposalId);
      await loadDetails();

      Alert.alert(
        'Worker selected',
        'Proposal accepted successfully. The job is now assigned.',
      );
    } catch (error) {
      Alert.alert('Could not accept proposal', errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (createMode) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />

        <SafeAreaView style={styles.screen} edges={['top']}>
          <View style={styles.shell}>
            <View style={styles.header}>
              <Pressable style={styles.headerButton} onPress={() => router.replace('/community')}>
                <Ionicons name="arrow-back" size={21} color={COLORS.text} />
              </Pressable>

              <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>Post a Service Request</Text>
                <Text style={styles.headerSubtitle}>Real community marketplace</Text>
              </View>

              <View style={styles.headerButton} />
            </View>

            <KeyboardAvoidingView
              style={styles.flex}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.content}
              >
                <View style={styles.hero}>
                  <View style={styles.heroIcon}>
                    <Ionicons name="megaphone-outline" size={24} color="#fff" />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.heroTitle}>Describe the job clearly</Text>
                    <Text style={styles.heroText}>
                      Workers can discover the request, ask questions, and submit real proposals.
                    </Text>
                  </View>
                </View>

                <Text style={styles.label}>Job title</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Kitchen sink pipe leaking"
                  placeholderTextColor={COLORS.muted}
                  maxLength={120}
                />

                <Text style={styles.label}>Category</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryRow}
                >
                  {CATEGORIES.map(item => {
                    const selected = item.id === category;

                    return (
                      <Pressable
                        key={item.id}
                        style={[styles.category, selected && styles.categoryActive]}
                        onPress={() => setCategory(item.id)}
                      >
                        <Ionicons
                          name={item.icon}
                          size={16}
                          color={selected ? '#fff' : COLORS.primary}
                        />
                        <Text
                          style={[
                            styles.categoryText,
                            selected && styles.categoryTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <Text style={styles.label}>Problem description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="top"
                  placeholder="Explain what is happening and what help you need."
                  placeholderTextColor={COLORS.muted}
                  maxLength={5000}
                />

                <Text style={styles.label}>Service location</Text>
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g. Dhanmondi, Dhaka"
                  placeholderTextColor={COLORS.muted}
                  maxLength={200}
                />

                <Text style={styles.label}>Budget (BDT)</Text>
                <TextInput
                  style={styles.input}
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                  placeholder="e.g. 800"
                  placeholderTextColor={COLORS.muted}
                />

                <Text style={styles.label}>Schedule note</Text>
                <TextInput
                  style={styles.input}
                  value={scheduleNote}
                  onChangeText={setScheduleNote}
                  placeholder="Today, tomorrow morning, this week..."
                  placeholderTextColor={COLORS.muted}
                  maxLength={200}
                />

                <View style={styles.privacyCard}>
                  <Ionicons name="shield-checkmark" size={20} color={COLORS.green} />
                  <Text style={styles.privacyText}>
                    Only a location label is posted publicly. Keep apartment, phone, and other sensitive details out of the description.
                  </Text>
                </View>

                <Pressable
                  style={[styles.primaryButton, saving && styles.disabled]}
                  disabled={saving}
                  onPress={() => void submitRequest()}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="send" size={17} color="#fff" />
                      <Text style={styles.primaryButtonText}>Publish Request</Text>
                    </>
                  )}
                </Pressable>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.centerText}>Loading job details…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (detailError || !request) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={36} color={COLORS.red} />
          <Text style={styles.centerTitle}>Unable to open request</Text>
          <Text style={styles.centerText}>{detailError ?? 'Request not found.'}</Text>
          <Pressable style={styles.retryButton} onPress={() => void loadDetails()}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.shell}>
          <View style={styles.header}>
            <Pressable style={styles.headerButton} onPress={() => router.replace('/community')}>
              <Ionicons name="arrow-back" size={21} color={COLORS.text} />
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Service Request</Text>
              <Text style={styles.headerSubtitle}>
                {isOwner ? 'Your request' : role === 'worker' ? 'Worker opportunity' : 'Community request'}
              </Text>
            </View>

            <Pressable style={styles.headerButton} onPress={() => void loadDetails()}>
              <Ionicons name="refresh" size={20} color={COLORS.primary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.requestCard}>
              <View style={styles.requestTop}>
                <View style={styles.serviceIcon}>
                  <Ionicons
                    name={
                      CATEGORIES.find(item => item.id === request.category)?.icon ??
                      'construct-outline'
                    }
                    size={23}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.flex}>
                  <Text style={styles.requestTitle}>{request.title}</Text>
                  <Text style={styles.requestMeta}>
                    {request.location_label} • {request.status.toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.price}>
                  {money(request.budget_amount, request.currency)}
                </Text>
              </View>

              <Text style={styles.requestDescription}>{request.description}</Text>

              {request.schedule_note ? (
                <View style={styles.schedule}>
                  <Ionicons name="calendar-outline" size={15} color={COLORS.primary} />
                  <Text style={styles.scheduleText}>{request.schedule_note}</Text>
                </View>
              ) : null}
            </View>

            {acceptedProposal ? (
              <View style={styles.assignedCard}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.green} />
                <View style={styles.flex}>
                  <Text style={styles.assignedTitle}>Worker selected</Text>
                  <Text style={styles.assignedText}>
                    Labor proposal {money(acceptedProposal.price_amount, acceptedProposal.currency)} • {acceptedProposal.availability_note}
                  </Text>
                </View>
                <View style={styles.assignmentActions}>
                  <Pressable
                    style={styles.progressButton}
                    onPress={() =>
                      router.push({
                        pathname: '/job-details',
                        params: { params.requestId: request.id },
                      })
                    }
                  >
                    <Ionicons name="pulse-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.progressButtonText}>Progress</Text>
                  </Pressable>

                  <Pressable
                    style={styles.chatButton}
                    onPress={() =>
                      router.push({
                        pathname: '/job-chat',
                        params: { params.requestId: request.id },
                      })
                    }
                  >
                    <Ionicons name="chatbubble-ellipses" size={17} color="#fff" />
                    <Text style={styles.chatButtonText}>Chat</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {role === 'worker' && request.status === 'open' && !isOwner ? (
              <Pressable style={styles.workerProposalButton} onPress={() => setProposalOpen(true)}>
                <Ionicons name="document-text-outline" size={18} color="#fff" />
                <Text style={styles.workerProposalText}>Submit Proposal</Text>
              </Pressable>
            ) : null}

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Worker Proposals</Text>
                <Text style={styles.sectionSubtitle}>
                  {proposals.length} proposal{proposals.length === 1 ? '' : 's'}
                </Text>
              </View>
            </View>

            {proposals.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="document-text-outline" size={30} color={COLORS.muted} />
                <Text style={styles.emptyTitle}>No proposals yet</Text>
                <Text style={styles.emptyText}>Worker proposals will appear here.</Text>
              </View>
            ) : (
              proposals.map(item => (
                <View
                  key={item.id}
                  style={[
                    styles.proposalCard,
                    item.status === 'accepted' && styles.proposalAccepted,
                  ]}
                >
                  <View style={styles.proposalTop}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {initials(item.worker_id.slice(0, 6))}
                      </Text>
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.proposalTitle}>Worker proposal</Text>
                      <Text style={styles.proposalAvailability}>{item.availability_note}</Text>
                    </View>
                    <Text style={styles.proposalPrice}>
                      {money(item.price_amount, item.currency)}
                    </Text>
                  </View>

                  {item.note ? <Text style={styles.proposalNote}>{item.note}</Text> : null}

                  {item.status === 'accepted' ? (
                    <View style={styles.acceptedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
                      <Text style={styles.acceptedBadgeText}>Accepted</Text>
                    </View>
                  ) : isOwner && request.status === 'open' ? (
                    <Pressable
                      style={[styles.acceptButton, saving && styles.disabled]}
                      disabled={saving}
                      onPress={() => void acceptProposal(item.id)}
                    >
                      <Text style={styles.acceptText}>Accept Proposal</Text>
                    </Pressable>
                  ) : null}
                </View>
              ))
            )}

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Public Discussion</Text>
                <Text style={styles.sectionSubtitle}>
                  {comments.length} comment{comments.length === 1 ? '' : 's'}
                </Text>
              </View>
            </View>

            <View style={styles.discussionCard}>
              {comments.length === 0 ? (
                <Text style={styles.emptyText}>No comments yet. Ask a public question about the job.</Text>
              ) : (
                comments.map(item => (
                  <View key={item.id} style={styles.commentRow}>
                    <View style={styles.commentAvatar}>
                      <Ionicons name="person" size={15} color="#fff" />
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.commentAuthor}>
                        {item.author_id === user?.id ? profile?.display_name ?? 'You' : 'Community member'}
                      </Text>
                      <Text style={styles.commentText}>{item.body}</Text>
                    </View>
                  </View>
                ))
              )}

              <View style={styles.composer}>
                <TextInput
                  style={styles.commentInput}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Write a public comment…"
                  placeholderTextColor={COLORS.muted}
                  maxLength={2000}
                />
                <Pressable
                  style={[styles.sendButton, (!comment.trim() || saving) && styles.disabled]}
                  disabled={!comment.trim() || saving}
                  onPress={() => void submitComment()}
                >
                  <Ionicons name="send" size={16} color="#fff" />
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>

      <Modal
        transparent
        animationType="slide"
        visible={proposalOpen}
        onRequestClose={() => setProposalOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.backdrop} onPress={() => setProposalOpen(false)} />

          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Submit a Proposal</Text>
            <Text style={styles.modalSubtitle}>
              Add your labor price, availability, and a clear service note.
            </Text>

            <Text style={styles.label}>Labor price (BDT)</Text>
            <TextInput
              style={styles.input}
              value={proposalPrice}
              onChangeText={setProposalPrice}
              keyboardType="numeric"
              placeholder="e.g. 700"
              placeholderTextColor={COLORS.muted}
            />

            <Text style={styles.label}>Availability</Text>
            <TextInput
              style={styles.input}
              value={proposalAvailability}
              onChangeText={setProposalAvailability}
              maxLength={300}
            />

            <Text style={styles.label}>Note</Text>
            <TextInput
              style={[styles.input, styles.modalTextArea]}
              value={proposalNote}
              onChangeText={setProposalNote}
              multiline
              textAlignVertical="top"
              placeholder="Explain what you can do and any conditions."
              placeholderTextColor={COLORS.muted}
              maxLength={2000}
            />

            <Pressable
              style={[styles.primaryButton, saving && styles.disabled]}
              disabled={saving}
              onPress={() => void sendProposal()}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={17} color="#fff" />
                  <Text style={styles.primaryButtonText}>Send Proposal</Text>
                </>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: '#ecebf2' },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#fff',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 14, fontWeight: '900', color: COLORS.text },
  headerSubtitle: { marginTop: 2, fontSize: 9.5, color: COLORS.muted },
  content: { padding: 15, paddingBottom: 54 },
  hero: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  heroTitle: { fontSize: 15, fontWeight: '900', color: '#fff' },
  heroText: { marginTop: 4, fontSize: 11, lineHeight: 17, color: '#d9d8ff' },
  label: { marginTop: 17, marginBottom: 7, fontSize: 11, fontWeight: '900', color: COLORS.text },
  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: '#fff',
    color: COLORS.text,
    fontSize: 12,
  },
  textArea: { minHeight: 120, paddingTop: 13 },
  modalTextArea: { minHeight: 90, paddingTop: 12 },
  categoryRow: { gap: 7 },
  category: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  categoryActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  categoryText: { fontSize: 10.5, fontWeight: '800', color: COLORS.primary },
  categoryTextActive: { color: '#fff' },
  privacyCard: {
    marginTop: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderRadius: 15,
    backgroundColor: COLORS.greenSoft,
  },
  privacyText: { flex: 1, fontSize: 10.5, lineHeight: 16, color: COLORS.muted },
  primaryButton: {
    minHeight: 51,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: { fontSize: 12, fontWeight: '900', color: '#fff' },
  disabled: { opacity: 0.55 },
  requestCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  requestTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  serviceIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.purpleSoft,
  },
  requestTitle: { fontSize: 15, fontWeight: '900', color: COLORS.text },
  requestMeta: { marginTop: 3, fontSize: 10, color: COLORS.muted },
  price: { fontSize: 14, fontWeight: '900', color: COLORS.orange },
  requestDescription: { marginTop: 14, fontSize: 11.5, lineHeight: 18, color: COLORS.muted },
  schedule: {
    marginTop: 12,
    padding: 10,
    flexDirection: 'row',
    gap: 6,
    borderRadius: 11,
    backgroundColor: COLORS.purpleSoft,
  },
  scheduleText: { fontSize: 10.5, color: COLORS.primary },
  assignedCard: {
    marginTop: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    backgroundColor: COLORS.greenSoft,
  },
  assignedTitle: { fontSize: 12, fontWeight: '900', color: COLORS.green },
  assignedText: { marginTop: 3, fontSize: 10, lineHeight: 15, color: COLORS.muted },
  assignmentActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  progressButton: {
    minHeight: 34,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    backgroundColor: COLORS.purpleSoft,
  },
  progressButtonText: { fontSize: 9, fontWeight: '900', color: COLORS.primary },
  chatButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
  },
  chatButtonText: { fontSize: 10, fontWeight: '900', color: '#fff' },
  workerProposalButton: {
    minHeight: 48,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 14,
    backgroundColor: COLORS.orange,
  },
  workerProposalText: { fontSize: 12, fontWeight: '900', color: '#fff' },
  sectionHeader: { marginTop: 22, marginBottom: 9 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: COLORS.text },
  sectionSubtitle: { marginTop: 2, fontSize: 9.5, color: COLORS.muted },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  emptyTitle: { marginTop: 7, fontSize: 12, fontWeight: '900', color: COLORS.text },
  emptyText: { marginTop: 4, fontSize: 10.5, lineHeight: 16, color: COLORS.muted, textAlign: 'center' },
  proposalCard: {
    marginBottom: 9,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  proposalAccepted: { borderColor: '#b9e2c9', backgroundColor: '#fcfffd' },
  proposalTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  avatarText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  proposalTitle: { fontSize: 11.5, fontWeight: '900', color: COLORS.text },
  proposalAvailability: { marginTop: 2, fontSize: 9.5, color: COLORS.muted },
  proposalPrice: { fontSize: 13, fontWeight: '900', color: COLORS.orange },
  proposalNote: { marginTop: 10, fontSize: 10.5, lineHeight: 16, color: COLORS.muted },
  acceptedBadge: {
    marginTop: 11,
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 10,
    backgroundColor: COLORS.greenSoft,
  },
  acceptedBadgeText: { fontSize: 10, fontWeight: '900', color: COLORS.green },
  acceptButton: {
    minHeight: 40,
    marginTop: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: COLORS.orange,
  },
  acceptText: { fontSize: 10.5, fontWeight: '900', color: '#fff' },
  discussionCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    backgroundColor: '#fff',
  },
  commentRow: { flexDirection: 'row', gap: 9, marginBottom: 12 },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  commentAuthor: { fontSize: 10, fontWeight: '900', color: COLORS.text },
  commentText: { marginTop: 2, fontSize: 10.5, lineHeight: 16, color: COLORS.muted },
  composer: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    minHeight: 43,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    fontSize: 10.5,
  },
  sendButton: {
    width: 43,
    height: 43,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  centerState: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  centerTitle: { marginTop: 9, fontSize: 15, fontWeight: '900', color: COLORS.text },
  centerText: { marginTop: 7, fontSize: 11, lineHeight: 17, textAlign: 'center', color: COLORS.muted },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
  },
  retryText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15,15,25,0.46)',
  },
  modalSheet: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#fff',
  },
  modalHandle: {
    width: 42,
    height: 4,
    marginBottom: 16,
    alignSelf: 'center',
    borderRadius: 3,
    backgroundColor: '#d4d1db',
  },
  modalTitle: { fontSize: 17, fontWeight: '900', color: COLORS.text },
  modalSubtitle: { marginTop: 3, fontSize: 10.5, color: COLORS.muted },
});
