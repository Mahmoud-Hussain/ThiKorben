import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
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

import {
  acceptProposal,
  addJobComment,
  createJob,
  CURRENT_WORKER,
  getAcceptedProposal,
  getDemoRole,
  getSelectedJob,
  JobCategory,
  MarketplaceRole,
  openJobChat,
  selectJob,
  sendWorkerProposal,
  setDemoRole,
  useMarketplaceVersion,
} from '@/constants/community-marketplace';

const COLORS = {
  orange: '#FF7315',
  orangeDark: '#E85D04',
  orangeSoft: '#FFF4EA',

  purple: '#4338A8',
  purpleDark: '#2F2877',
  purpleSoft: '#EFEEFF',

  text: '#171927',
  muted: '#777C8E',

  background: '#F6F7FB',
  card: '#FFFFFF',
  border: '#E7E9F0',

  success: '#16A760',
  successSoft: '#ECFDF3',

  warning: '#F5A300',

  danger: '#D9485F',
};

const CATEGORIES: {
  id: JobCategory;
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
  {
    id: 'plumbing',
    title: 'Plumbing',
    icon: 'water-outline',
  },

  {
    id: 'electrical',
    title: 'Electrical',
    icon: 'flash-outline',
  },

  {
    id: 'carpentry',
    title: 'Carpentry',
    icon: 'hammer-outline',
  },

  {
    id: 'cleaning',
    title: 'Cleaning',
    icon: 'sparkles-outline',
  },

  {
    id: 'painting',
    title: 'Painting',
    icon: 'color-palette-outline',
  },

  {
    id: 'ac',
    title: 'AC Repair',
    icon: 'snow-outline',
  },
];

const SCHEDULES = ['Today', 'Tomorrow', 'This Week'];

function formatMoney(value: number) {
  return `৳${value.toLocaleString()}`;
}

function RoleSwitcher({ role }: { role: MarketplaceRole }) {
  return (
    <View style={styles.roleSwitcher}>
      <Pressable
        onPress={() => setDemoRole('customer')}
        style={[
          styles.roleOption,
          role === 'customer' && styles.customerRoleActive,
        ]}
      >
        <Ionicons
          name="person-outline"
          size={15}
          color={role === 'customer' ? '#FFFFFF' : COLORS.muted}
        />

        <Text
          style={[
            styles.roleText,
            role === 'customer' && styles.roleTextActive,
          ]}
        >
          Customer
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setDemoRole('worker')}
        style={[
          styles.roleOption,
          role === 'worker' && styles.workerRoleActive,
        ]}
      >
        <Ionicons
          name="construct-outline"
          size={15}
          color={role === 'worker' ? '#FFFFFF' : COLORS.muted}
        />

        <Text
          style={[styles.roleText, role === 'worker' && styles.roleTextActive]}
        >
          Worker
        </Text>
      </Pressable>
    </View>
  );
}

export default function JobBoardScreen() {
  useMarketplaceVersion();

  const params = useLocalSearchParams<{
    mode?: string;
  }>();

  const role = getDemoRole();

  const selectedJob = getSelectedJob();

  const createMode = params.mode === 'create' || !selectedJob;

  const [title, setTitle] = useState('Kitchen Sink Pipe Leakage');

  const [category, setCategory] = useState<JobCategory>('plumbing');

  const [description, setDescription] = useState(
    'Water is leaking from the pipe under my kitchen sink whenever the tap is used. I need someone to inspect and fix it.',
  );

  const [location, setLocation] = useState('Dhanmondi 8/A, Dhaka');

  const [budget, setBudget] = useState('1000');

  const [schedule, setSchedule] = useState('Today');

  const [photoUri, setPhotoUri] = useState<string | undefined>();

  const [commentText, setCommentText] = useState('');

  const [proposalVisible, setProposalVisible] = useState(false);

  const [proposalPrice, setProposalPrice] = useState('700');

  const [proposalAvailability, setProposalAvailability] = useState(
    'Today, after 5:00 PM',
  );

  const [proposalNote, setProposalNote] = useState(
    'I can inspect the problem and complete the repair. Any required materials will be discussed before purchase.',
  );

  const pickPhoto = async () => {
    if (Platform.OS !== 'web') {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Please allow photo access to attach a job image.',
        );

        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,

      allowsEditing: false,

      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const submitJob = () => {
    const numericBudget = Number(budget);

    if (
      !title.trim() ||
      !description.trim() ||
      !location.trim() ||
      !budget.trim() ||
      Number.isNaN(numericBudget) ||
      numericBudget <= 0
    ) {
      Alert.alert(
        'Complete the form',
        'Please provide title, description, location and a valid budget.',
      );

      return;
    }

    const job = createJob({
      title: title.trim(),
      category,
      description: description.trim(),
      location: location.trim(),
      budget: numericBudget,
      schedule,
      photoUri,
    });

    selectJob(job.id);

    router.replace('/community');
  };

  if (createMode) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <SafeAreaView style={styles.screen} edges={['top']}>
          <View style={styles.appShell}>
            <View style={styles.header}>
              <Pressable
                onPress={() => router.replace('/community')}
                style={styles.headerButton}
              >
                <Ionicons name="arrow-back" size={20} color={COLORS.text} />
              </Pressable>

              <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>Post a Job</Text>

                <Text style={styles.headerSubtitle}>
                  Community service request
                </Text>
              </View>

              <View style={styles.headerButton} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.hero}>
                <View style={styles.heroIcon}>
                  <Ionicons
                    name="megaphone-outline"
                    size={24}
                    color="#FFFFFF"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.heroTitle}>
                    Tell the community what you need
                  </Text>

                  <Text style={styles.heroText}>
                    Workers will see your post, comment, send proposals and
                    contact you privately.
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>Job title</Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="create-outline"
                  size={18}
                  color={COLORS.muted}
                />

                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                  placeholder="Job title"
                  placeholderTextColor="#A2A6B3"
                />
              </View>

              <Text style={[styles.label, styles.spacedLabel]}>Category</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
              >
                {CATEGORIES.map(item => {
                  const selected = category === item.id;

                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setCategory(item.id)}
                      style={[
                        styles.categoryButton,
                        selected && styles.categoryButtonSelected,
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={16}
                        color={selected ? '#FFFFFF' : COLORS.purple}
                      />

                      <Text
                        style={[
                          styles.categoryButtonText,
                          selected && styles.categoryButtonTextSelected,
                        ]}
                      >
                        {item.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Text style={[styles.label, styles.spacedLabel]}>
                Problem description
              </Text>

              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="top"
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the problem"
                  placeholderTextColor="#A2A6B3"
                />
              </View>

              <Text style={[styles.label, styles.spacedLabel]}>
                Service location
              </Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={COLORS.muted}
                />

                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  style={styles.input}
                />
              </View>

              <Text style={[styles.label, styles.spacedLabel]}>
                Expected budget
              </Text>

              <View style={styles.inputWrapper}>
                <Text style={styles.currency}>৳</Text>

                <TextInput
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <Text style={[styles.label, styles.spacedLabel]}>
                Preferred schedule
              </Text>

              <View style={styles.scheduleRow}>
                {SCHEDULES.map(item => (
                  <Pressable
                    key={item}
                    onPress={() => setSchedule(item)}
                    style={[
                      styles.scheduleButton,
                      schedule === item && styles.scheduleButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.scheduleText,
                        schedule === item && styles.scheduleTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.label, styles.spacedLabel]}>
                Problem photo
              </Text>

              {photoUri ? (
                <View style={styles.selectedImageWrapper}>
                  <Image
                    source={{
                      uri: photoUri,
                    }}
                    style={styles.selectedImage}
                  />

                  <Pressable
                    onPress={() => setPhotoUri(undefined)}
                    style={styles.removePhoto}
                  >
                    <Ionicons name="close" size={17} color="#FFFFFF" />
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={pickPhoto} style={styles.photoPicker}>
                  <Ionicons
                    name="images-outline"
                    size={30}
                    color={COLORS.orange}
                  />

                  <Text style={styles.photoPickerTitle}>
                    Upload job picture
                  </Text>

                  <Text style={styles.photoPickerText}>
                    Select a real image from your device
                  </Text>
                </Pressable>
              )}

              {photoUri && (
                <Pressable onPress={pickPhoto} style={styles.changePhotoButton}>
                  <Ionicons
                    name="image-outline"
                    size={15}
                    color={COLORS.purple}
                  />

                  <Text style={styles.changePhotoText}>Change photo</Text>
                </Pressable>
              )}

              <Pressable onPress={submitJob} style={styles.primaryButton}>
                <Ionicons name="paper-plane" size={17} color="#FFFFFF" />

                <Text style={styles.primaryButtonText}>Post to Community</Text>
              </Pressable>
            </ScrollView>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const job = selectedJob!;

  const accepted = getAcceptedProposal(job.id);

  const categoryMeta =
    CATEGORIES.find(item => item.id === job.category) ?? CATEGORIES[0];

  const addComment = () => {
    if (!commentText.trim()) {
      return;
    }

    addJobComment(job.id, commentText, role);

    setCommentText('');
  };

  const submitProposal = () => {
    const numericPrice = Number(proposalPrice);

    if (
      Number.isNaN(numericPrice) ||
      numericPrice <= 0 ||
      !proposalAvailability.trim()
    ) {
      Alert.alert(
        'Invalid proposal',
        'Please provide valid labor cost and availability.',
      );

      return;
    }

    sendWorkerProposal(job.id, {
      price: numericPrice,
      availability: proposalAvailability.trim(),
      note: proposalNote.trim() || 'Available for this job.',
    });

    setProposalVisible(false);
  };

  const messageCustomer = () => {
    openJobChat(job.id, CURRENT_WORKER.id);

    router.push('/job-chat');
  };

  const messageAcceptedWorker = () => {
    if (!accepted) {
      return;
    }

    openJobChat(job.id, accepted.workerId);

    router.push('/job-chat');
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.appShell}>
          <View style={styles.header}>
            <Pressable
              onPress={() => router.replace('/community')}
              style={styles.headerButton}
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.text} />
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Job Details</Text>

              <Text style={styles.headerSubtitle}>Community marketplace</Text>
            </View>

            <View style={styles.headerButton} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <RoleSwitcher role={role} />

            <View style={styles.jobCard}>
              <View style={styles.jobTopRow}>
                <View style={styles.jobCategoryIcon}>
                  <Ionicons
                    name={categoryMeta.icon}
                    size={22}
                    color={COLORS.orange}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.jobCategory}>{categoryMeta.title}</Text>

                  <Text style={styles.jobTitle}>{job.title}</Text>
                </View>

                <View style={styles.openStatusBadge}>
                  <Text style={styles.openStatusText}>
                    {job.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {job.photoUri && (
                <Image
                  source={{
                    uri: job.photoUri,
                  }}
                  style={styles.detailImage}
                />
              )}

              <Text style={styles.jobDescription}>{job.description}</Text>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Ionicons
                    name="location-outline"
                    size={15}
                    color={COLORS.purple}
                  />

                  <Text style={styles.infoText}>{job.location}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons
                    name="wallet-outline"
                    size={15}
                    color={COLORS.orange}
                  />

                  <Text style={styles.infoText}>
                    Budget {formatMoney(job.budget)}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={15}
                    color={COLORS.purple}
                  />

                  <Text style={styles.infoText}>{job.schedule}</Text>
                </View>
              </View>
            </View>

            {role === 'worker' && (
              <View style={styles.workerCTA}>
                <Pressable onPress={messageCustomer} style={styles.inboxButton}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={17}
                    color={COLORS.purple}
                  />

                  <Text style={styles.inboxButtonText}>Message Customer</Text>
                </Pressable>

                <Pressable
                  onPress={() => setProposalVisible(true)}
                  style={styles.sendProposalButton}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={17}
                    color="#FFFFFF"
                  />

                  <Text style={styles.sendProposalText}>Send Proposal</Text>
                </Pressable>
              </View>
            )}

            {accepted && role === 'customer' && (
              <Pressable
                onPress={messageAcceptedWorker}
                style={styles.acceptedCard}
              >
                <View style={styles.acceptedIcon}>
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.acceptedTitle}>
                    {accepted.workerName} selected
                  </Text>

                  <Text style={styles.acceptedText}>
                    Agreed labor {formatMoney(accepted.price)} • Open active
                    chat
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
              </Pressable>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Public Discussion</Text>

              <Text style={styles.sectionCount}>
                {job.comments.length} comments
              </Text>
            </View>

            <View style={styles.discussionCard}>
              {job.comments.length === 0 ? (
                <Text style={styles.emptyDiscussion}>
                  No comments yet. Workers can ask public questions here.
                </Text>
              ) : (
                job.comments.map(comment => (
                  <View key={comment.id} style={styles.commentRow}>
                    <View
                      style={[
                        styles.commentAvatar,
                        comment.authorRole === 'worker'
                          ? styles.workerAvatar
                          : styles.customerAvatar,
                      ]}
                    >
                      <Text style={styles.avatarText}>
                        {comment.authorName
                          .split(' ')
                          .slice(0, 2)
                          .map(part => part[0])
                          .join('')}
                      </Text>
                    </View>

                    <View style={styles.commentBody}>
                      <Text style={styles.commentAuthor}>
                        {comment.authorName}
                      </Text>

                      <Text style={styles.commentText}>{comment.text}</Text>

                      <Text style={styles.commentTime}>{comment.time}</Text>
                    </View>
                  </View>
                ))
              )}

              <View style={styles.commentComposer}>
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Write a public comment..."
                  placeholderTextColor="#A2A6B3"
                  returnKeyType="send"
                  onSubmitEditing={addComment}
                  style={styles.commentInput}
                />

                <Pressable
                  onPress={addComment}
                  disabled={!commentText.trim()}
                  style={[
                    styles.commentSend,
                    !commentText.trim() && styles.disabledButton,
                  ]}
                >
                  <Ionicons name="send" size={15} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Worker Proposals</Text>

              <Text style={styles.sectionCount}>
                {job.proposals.length} offers
              </Text>
            </View>

            {job.proposals.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="document-text-outline"
                  size={25}
                  color={COLORS.muted}
                />

                <Text style={styles.emptyCardTitle}>No proposals yet</Text>
              </View>
            ) : (
              job.proposals.map(proposal => (
                <View
                  key={proposal.id}
                  style={[
                    styles.proposalCard,
                    proposal.status === 'accepted' && styles.proposalAccepted,
                  ]}
                >
                  <View style={styles.proposalHeader}>
                    <View style={styles.proposalAvatar}>
                      <Text style={styles.avatarText}>
                        {proposal.workerName
                          .split(' ')
                          .slice(0, 2)
                          .map(part => part[0])
                          .join('')}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.proposalName}>
                        {proposal.workerName}
                      </Text>

                      <Text style={styles.proposalProfession}>
                        {proposal.profession} • ⭐ {proposal.rating}
                      </Text>
                    </View>

                    <Text style={styles.proposalPrice}>
                      {formatMoney(proposal.price)}
                    </Text>
                  </View>

                  <View style={styles.proposalAvailability}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={COLORS.purple}
                    />

                    <Text style={styles.proposalAvailabilityText}>
                      {proposal.availability}
                    </Text>
                  </View>

                  <Text style={styles.proposalNote}>{proposal.note}</Text>

                  {proposal.status === 'accepted' ? (
                    <View style={styles.acceptedProposalBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={15}
                        color={COLORS.success}
                      />

                      <Text style={styles.acceptedProposalText}>Accepted</Text>
                    </View>
                  ) : role === 'customer' ? (
                    <Pressable
                      onPress={() => {
                        acceptProposal(job.id, proposal.id);

                        Alert.alert(
                          'Worker selected',
                          'The proposal has been accepted. Private chat is now an active job conversation.',
                        );
                      }}
                      style={styles.acceptProposalButton}
                    >
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />

                      <Text style={styles.acceptProposalText}>
                        Accept Proposal
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </SafeAreaView>

      <Modal
        visible={proposalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProposalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setProposalVisible(false)}
          />

          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Send Proposal</Text>

                <Text style={styles.modalSubtitle}>
                  Offer labor price and availability.
                </Text>
              </View>

              <Pressable onPress={() => setProposalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.text} />
              </Pressable>
            </View>

            <Text style={styles.label}>Labor price</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.currency}>৳</Text>

              <TextInput
                value={proposalPrice}
                onChangeText={setProposalPrice}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <Text style={[styles.label, styles.spacedLabel]}>Availability</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                value={proposalAvailability}
                onChangeText={setProposalAvailability}
                style={styles.input}
              />
            </View>

            <Text style={[styles.label, styles.spacedLabel]}>Note</Text>

            <View style={[styles.inputWrapper, styles.modalTextArea]}>
              <TextInput
                value={proposalNote}
                onChangeText={setProposalNote}
                multiline
                textAlignVertical="top"
                style={[styles.input, styles.modalNoteInput]}
              />
            </View>

            <Pressable onPress={submitProposal} style={styles.primaryButton}>
              <Ionicons name="paper-plane" size={17} color="#FFFFFF" />

              <Text style={styles.primaryButtonText}>Send Proposal</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
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
    height: 62,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },

  headerButton: {
    width: 39,
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerCenter: {
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 7,
    color: COLORS.muted,
  },

  scrollContent: {
    padding: 13,
    paddingBottom: 50,
  },

  hero: {
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.purple,
  },

  heroIcon: {
    width: 44,
    height: 44,
    marginRight: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.13)',
  },

  heroTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  heroText: {
    marginTop: 3,
    fontSize: 7.5,
    lineHeight: 11,
    color: '#DDD9FF',
  },

  label: {
    marginTop: 15,
    marginBottom: 6,
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.text,
  },

  spacedLabel: {
    marginTop: 15,
  },

  inputWrapper: {
    minHeight: 48,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor: COLORS.card,
  },

  input: {
    flex: 1,
    minHeight: 46,
    fontSize: 9.5,
    color: COLORS.text,
  },

  currency: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.orange,
  },

  textAreaWrapper: {
    minHeight: 115,
    alignItems: 'flex-start',
  },

  textArea: {
    minHeight: 110,
    paddingVertical: 11,
  },

  categoryRow: {
    gap: 7,
    paddingRight: 8,
  },

  categoryButton: {
    minHeight: 39,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    backgroundColor: COLORS.card,
  },

  categoryButtonSelected: {
    borderColor: COLORS.purple,
    backgroundColor: COLORS.purple,
  },

  categoryButtonText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.purple,
  },

  categoryButtonTextSelected: {
    color: '#FFFFFF',
  },

  scheduleRow: {
    flexDirection: 'row',
    gap: 7,
  },

  scheduleButton: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    backgroundColor: COLORS.card,
  },

  scheduleButtonSelected: {
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orangeSoft,
  },

  scheduleText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: COLORS.muted,
  },

  scheduleTextSelected: {
    color: COLORS.orangeDark,
  },

  photoPicker: {
    minHeight: 125,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#F1B687',
    borderRadius: 15,
    backgroundColor: '#FFF9F5',
  },

  photoPickerTitle: {
    marginTop: 7,
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  photoPickerText: {
    marginTop: 3,
    fontSize: 7,
    color: COLORS.muted,
  },

  selectedImageWrapper: {
    position: 'relative',
  },

  selectedImage: {
    width: '100%',
    height: 220,
    borderRadius: 15,
  },

  removePhoto: {
    width: 34,
    height: 34,
    position: 'absolute',
    top: 8,
    right: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: 'rgba(20,20,30,0.75)',
  },

  changePhotoButton: {
    minHeight: 38,
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 11,
    backgroundColor: COLORS.purpleSoft,
  },

  changePhotoText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: COLORS.purple,
  },

  primaryButton: {
    minHeight: 49,
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 13,
    backgroundColor: COLORS.orange,
  },

  primaryButtonText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  roleSwitcher: {
    marginBottom: 12,
    padding: 4,
    flexDirection: 'row',
    borderRadius: 13,
    backgroundColor: '#EDEEF3',
  },

  roleOption: {
    flex: 1,
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 10,
  },

  customerRoleActive: {
    backgroundColor: COLORS.orange,
  },

  workerRoleActive: {
    backgroundColor: COLORS.purple,
  },

  roleText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.muted,
  },

  roleTextActive: {
    color: '#FFFFFF',
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
    alignItems: 'center',
  },

  jobCategoryIcon: {
    width: 44,
    height: 44,
    marginRight: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: COLORS.orangeSoft,
  },

  jobCategory: {
    fontSize: 6.5,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: COLORS.orangeDark,
  },

  jobTitle: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.text,
  },

  openStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: COLORS.successSoft,
  },

  openStatusText: {
    fontSize: 6,
    fontWeight: '900',
    color: COLORS.success,
  },

  detailImage: {
    width: '100%',
    height: 200,
    marginTop: 11,
    borderRadius: 14,
  },

  jobDescription: {
    marginTop: 12,
    fontSize: 8.5,
    lineHeight: 13,
    color: '#626775',
  },

  infoGrid: {
    marginTop: 12,
    gap: 7,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  infoText: {
    fontSize: 7.5,
    color: COLORS.muted,
  },

  workerCTA: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 7,
  },

  inboxButton: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#D9D6F3',
    borderRadius: 11,
    backgroundColor: COLORS.purpleSoft,
  },

  inboxButtonText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: COLORS.purple,
  },

  sendProposalButton: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 11,
    backgroundColor: COLORS.purple,
  },

  sendProposalText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  acceptedCard: {
    marginTop: 10,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: COLORS.purple,
  },

  acceptedIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: COLORS.orange,
  },

  acceptedTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  acceptedText: {
    marginTop: 2,
    fontSize: 6.8,
    color: '#DDD9FF',
  },

  sectionHeader: {
    marginTop: 17,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text,
  },

  sectionCount: {
    fontSize: 7,
    color: COLORS.muted,
  },

  discussionCard: {
    padding: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    backgroundColor: COLORS.card,
  },

  emptyDiscussion: {
    paddingVertical: 15,
    textAlign: 'center',
    fontSize: 8,
    color: COLORS.muted,
  },

  commentRow: {
    marginBottom: 12,
    flexDirection: 'row',
  },

  commentAvatar: {
    width: 34,
    height: 34,
    marginRight: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },

  workerAvatar: {
    backgroundColor: COLORS.purple,
  },

  customerAvatar: {
    backgroundColor: COLORS.orange,
  },

  avatarText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  commentBody: {
    flex: 1,
  },

  commentAuthor: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.text,
  },

  commentText: {
    marginTop: 3,
    fontSize: 8,
    lineHeight: 12,
    color: COLORS.muted,
  },

  commentTime: {
    marginTop: 3,
    fontSize: 6,
    color: '#A4A7B0',
  },

  commentComposer: {
    minHeight: 43,
    paddingLeft: 10,
    paddingRight: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: '#F8F8FA',
  },

  commentInput: {
    flex: 1,
    minHeight: 40,
    fontSize: 8,
    color: COLORS.text,
  },

  commentSend: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.orange,
  },

  disabledButton: {
    opacity: 0.35,
  },

  emptyCard: {
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    backgroundColor: COLORS.card,
  },

  emptyCardTitle: {
    marginTop: 6,
    fontSize: 8.5,
    fontWeight: '900',
    color: COLORS.muted,
  },

  proposalCard: {
    marginBottom: 9,
    padding: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    backgroundColor: COLORS.card,
  },

  proposalAccepted: {
    borderColor: '#A9DCC2',
    backgroundColor: '#FCFFFD',
  },

  proposalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  proposalAvatar: {
    width: 42,
    height: 42,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: COLORS.purple,
  },

  proposalName: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.text,
  },

  proposalProfession: {
    marginTop: 2,
    fontSize: 6.5,
    color: COLORS.muted,
  },

  proposalPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  proposalAvailability: {
    marginTop: 9,
    padding: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 9,
    backgroundColor: COLORS.purpleSoft,
  },

  proposalAvailabilityText: {
    fontSize: 7,
    color: COLORS.purpleDark,
  },

  proposalNote: {
    marginTop: 8,
    fontSize: 7.5,
    lineHeight: 11,
    color: COLORS.muted,
  },

  acceptProposalButton: {
    minHeight: 39,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 10,
    backgroundColor: COLORS.orange,
  },

  acceptProposalText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  acceptedProposalBadge: {
    marginTop: 10,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 10,
    backgroundColor: COLORS.successSoft,
  },

  acceptedProposalText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: COLORS.success,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,17,30,0.45)',
  },

  modalSheet: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 27,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    backgroundColor: COLORS.card,
  },

  modalHandle: {
    width: 43,
    height: 4,
    marginBottom: 14,
    alignSelf: 'center',
    borderRadius: 3,
    backgroundColor: '#D6D8E0',
  },

  modalHeader: {
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  modalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
  },

  modalSubtitle: {
    marginTop: 2,
    fontSize: 7.5,
    color: COLORS.muted,
  },

  modalTextArea: {
    minHeight: 90,
    alignItems: 'flex-start',
  },

  modalNoteInput: {
    minHeight: 85,
    paddingVertical: 10,
  },
});
