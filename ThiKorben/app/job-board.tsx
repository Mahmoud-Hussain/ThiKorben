import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
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

const COLORS = {
  orange: '#FF7315',
  orangeDark: '#E85D04',
  purple: '#4338A8',
  purpleDark: '#2F2877',
  purpleSoft: '#EFEEFF',

  navy: '#17134D',
  text: '#171927',
  muted: '#777C8E',

  background: '#F6F7FB',
  card: '#FFFFFF',
  border: '#E7E9F0',

  success: '#16A760',
  successSoft: '#ECFDF3',

  warning: '#F5A300',
  warningSoft: '#FFF8E7',

  softOrange: '#FFF4EA',
  softGray: '#F1F2F6',

  danger: '#D9485F',
};

type Role = 'customer' | 'worker';

type CommentItem = {
  id: string;
  name: string;
  role: Role;
  text: string;
  time: string;
};

type ProposalStatus = 'pending' | 'accepted';

type Proposal = {
  id: string;
  workerName: string;
  profession: string;
  rating: number;
  completedJobs: number;
  price: number;
  availability: string;
  note: string;
  status: ProposalStatus;
};

const CATEGORIES = [
  {
    id: 'plumbing',
    title: 'Plumbing',
    icon: 'water-outline' as const,
  },
  {
    id: 'electrical',
    title: 'Electrical',
    icon: 'flash-outline' as const,
  },
  {
    id: 'carpentry',
    title: 'Carpentry',
    icon: 'hammer-outline' as const,
  },
  {
    id: 'cleaning',
    title: 'Cleaning',
    icon: 'sparkles-outline' as const,
  },
  {
    id: 'painting',
    title: 'Painting',
    icon: 'color-palette-outline' as const,
  },
  {
    id: 'ac',
    title: 'AC Repair',
    icon: 'snow-outline' as const,
  },
];

const SCHEDULE_OPTIONS = ['Today', 'Tomorrow', 'This Week'];

const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: 'comment-1',
    name: 'Rahim Ahmed',
    role: 'worker',
    text: 'Could you please confirm whether the leaking pipe is under the kitchen sink or inside the wall?',
    time: '8 min ago',
  },
  {
    id: 'comment-2',
    name: 'Nusrat Jahan',
    role: 'customer',
    text: 'It is under the kitchen sink. Water starts dripping whenever we use the tap.',
    time: '5 min ago',
  },
];

const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'proposal-1',
    workerName: 'Rahim Ahmed',
    profession: 'Expert Plumber',
    rating: 4.9,
    completedJobs: 128,
    price: 700,
    availability: 'Today, after 5:00 PM',
    note: 'I can inspect the leak and replace the connector or washer if needed. Material cost will be discussed separately.',
    status: 'pending',
  },
];

function getCurrentTimeLabel() {
  return 'Just now';
}

function formatMoney(value: string | number) {
  const numericValue = typeof value === 'number' ? value : Number(value || 0);

  return `৳${numericValue.toLocaleString()}`;
}

type RoleSwitcherProps = {
  role: Role;
  onChange: (role: Role) => void;
};

function RoleSwitcher({ role, onChange }: RoleSwitcherProps) {
  return (
    <View style={styles.roleSwitcherWrapper}>
      <View style={styles.roleSwitcherHeader}>
        <View>
          <Text style={styles.roleSwitcherLabel}>Demo Role</Text>

          <Text style={styles.roleSwitcherHint}>
            Switch role to preview both sides of the marketplace
          </Text>
        </View>

        <View style={styles.demoBadge}>
          <View style={styles.demoDot} />

          <Text style={styles.demoBadgeText}>INTERACTIVE</Text>
        </View>
      </View>

      <View style={styles.roleSwitcher}>
        <Pressable
          onPress={() => onChange('customer')}
          style={[
            styles.roleOption,
            role === 'customer' && styles.roleOptionActive,
          ]}
        >
          <Ionicons
            name={role === 'customer' ? 'person' : 'person-outline'}
            size={17}
            color={role === 'customer' ? '#FFFFFF' : COLORS.muted}
          />

          <Text
            style={[
              styles.roleOptionText,
              role === 'customer' && styles.roleOptionTextActive,
            ]}
          >
            Customer
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onChange('worker')}
          style={[
            styles.roleOption,
            role === 'worker' && styles.roleOptionWorkerActive,
          ]}
        >
          <Ionicons
            name={role === 'worker' ? 'construct' : 'construct-outline'}
            size={17}
            color={role === 'worker' ? '#FFFFFF' : COLORS.muted}
          />

          <Text
            style={[
              styles.roleOptionText,
              role === 'worker' && styles.roleOptionTextActive,
            ]}
          >
            Worker
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

type CategoryButtonProps = {
  category: (typeof CATEGORIES)[number];
  selected: boolean;
  onPress: () => void;
};

function CategoryButton({ category, selected, onPress }: CategoryButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 110,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[
          styles.categoryButton,
          selected && styles.categoryButtonSelected,
        ]}
      >
        <Ionicons
          name={category.icon}
          size={18}
          color={selected ? '#FFFFFF' : COLORS.purple}
        />

        <Text
          style={[
            styles.categoryButtonText,
            selected && styles.categoryButtonTextSelected,
          ]}
        >
          {category.title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

type CommentCardProps = {
  comment: CommentItem;
};

function CommentCard({ comment }: CommentCardProps) {
  const isWorker = comment.role === 'worker';

  return (
    <View style={styles.commentRow}>
      <View
        style={[
          styles.commentAvatar,
          isWorker ? styles.workerAvatar : styles.customerAvatar,
        ]}
      >
        <Text style={styles.commentAvatarText}>
          {comment.name
            .split(' ')
            .slice(0, 2)
            .map(part => part[0])
            .join('')}
        </Text>
      </View>

      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <View style={styles.commentNameRow}>
            <Text style={styles.commentName}>{comment.name}</Text>

            <View
              style={[
                styles.roleBadge,
                isWorker ? styles.workerRoleBadge : styles.customerRoleBadge,
              ]}
            >
              <Text
                style={[
                  styles.roleBadgeText,
                  {
                    color: isWorker ? COLORS.purple : COLORS.orangeDark,
                  },
                ]}
              >
                {isWorker ? 'Worker' : 'Customer'}
              </Text>
            </View>
          </View>

          <Text style={styles.commentTime}>{comment.time}</Text>
        </View>

        <Text style={styles.commentText}>{comment.text}</Text>
      </View>
    </View>
  );
}

type ProposalCardProps = {
  proposal: Proposal;
  customerMode: boolean;
  onAccept: () => void;
};

function ProposalCard({ proposal, customerMode, onAccept }: ProposalCardProps) {
  const accepted = proposal.status === 'accepted';

  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.985,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.proposalCard,
        accepted && styles.proposalCardAccepted,
        {
          transform: [{ scale }],
        },
      ]}
    >
      {accepted && (
        <View style={styles.acceptedBanner}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />

          <Text style={styles.acceptedBannerText}>Proposal Accepted</Text>
        </View>
      )}

      <View style={styles.proposalWorkerRow}>
        <View style={styles.proposalAvatar}>
          <Text style={styles.proposalAvatarText}>
            {proposal.workerName
              .split(' ')
              .slice(0, 2)
              .map(part => part[0])
              .join('')}
          </Text>
        </View>

        <View style={styles.proposalWorkerInfo}>
          <View style={styles.verifiedRow}>
            <Text style={styles.proposalWorkerName}>{proposal.workerName}</Text>

            <Ionicons name="checkmark-circle" size={16} color={COLORS.orange} />
          </View>

          <Text style={styles.proposalProfession}>{proposal.profession}</Text>

          <View style={styles.proposalStats}>
            <View style={styles.proposalStat}>
              <Ionicons name="star" size={12} color={COLORS.warning} />

              <Text style={styles.proposalStatText}>{proposal.rating}</Text>
            </View>

            <View style={styles.proposalStat}>
              <Ionicons
                name="briefcase-outline"
                size={12}
                color={COLORS.muted}
              />

              <Text style={styles.proposalStatText}>
                {proposal.completedJobs} jobs
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.proposalPriceArea}>
          <Text style={styles.proposalPrice}>
            {formatMoney(proposal.price)}
          </Text>

          <Text style={styles.proposalPriceLabel}>labor</Text>
        </View>
      </View>

      <View style={styles.proposalInfoBox}>
        <View style={styles.proposalInfoRow}>
          <Ionicons name="calendar-outline" size={15} color={COLORS.purple} />

          <Text style={styles.proposalInfoText}>{proposal.availability}</Text>
        </View>
      </View>

      <Text style={styles.proposalNote}>{proposal.note}</Text>

      <View style={styles.proposalActions}>
        <Pressable
          onPress={() =>
            Alert.alert(
              'Worker Profile',
              `${proposal.workerName}\n${proposal.profession}\n⭐ ${proposal.rating}\n${proposal.completedJobs} completed jobs`,
            )
          }
          onPressIn={pressIn}
          onPressOut={pressOut}
          style={styles.secondaryButton}
        >
          <Ionicons name="person-outline" size={16} color={COLORS.purple} />

          <Text style={styles.secondaryButtonText}>View Profile</Text>
        </Pressable>

        {customerMode && !accepted && (
          <Pressable onPress={onAccept} style={styles.acceptButton}>
            <Ionicons name="checkmark" size={17} color="#FFFFFF" />

            <Text style={styles.acceptButtonText}>Accept Proposal</Text>
          </Pressable>
        )}

        {customerMode && accepted && (
          <Pressable
            onPress={() => router.push('/job-chat')}
            style={styles.messageButton}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#FFFFFF" />

            <Text style={styles.acceptButtonText}>Message Worker</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

export default function JobBoardScreen() {
  const scrollRef = useRef<ScrollView>(null);

  const [role, setRole] = useState<Role>('customer');

  const [jobPosted, setJobPosted] = useState(false);

  const [title, setTitle] = useState('Kitchen Sink Pipe Leakage');

  const [category, setCategory] = useState('plumbing');

  const [description, setDescription] = useState(
    'Water is leaking from the pipe under my kitchen sink whenever the tap is used. I need someone to inspect and fix it.',
  );

  const [location, setLocation] = useState('Dhanmondi 8/A, Dhaka');

  const [budget, setBudget] = useState('1000');

  const [schedule, setSchedule] = useState('Today');

  const [comments, setComments] = useState<CommentItem[]>(INITIAL_COMMENTS);

  const [commentText, setCommentText] = useState('');

  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);

  const [proposalModalVisible, setProposalModalVisible] = useState(false);

  const [proposalPrice, setProposalPrice] = useState('750');

  const [proposalAvailability, setProposalAvailability] = useState(
    'Tomorrow, 10:00 AM - 12:00 PM',
  );

  const [proposalNote, setProposalNote] = useState(
    'I can inspect the issue and complete the repair. Any required materials will be discussed with you before purchase.',
  );

  const pageOpacity = useRef(new Animated.Value(0)).current;

  const pageTranslate = useRef(new Animated.Value(15)).current;

  const livePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(pageOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      Animated.spring(pageTranslate, {
        toValue: 0,
        friction: 7,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, {
          toValue: 1.25,
          duration: 850,
          useNativeDriver: true,
        }),

        Animated.timing(livePulse, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [livePulse, pageOpacity, pageTranslate]);

  const selectedCategory =
    CATEGORIES.find(item => item.id === category) ?? CATEGORIES[0];

  const handlePostJob = () => {
    if (!title.trim()) {
      Alert.alert(
        'Job title required',
        'Please enter a short title for your job.',
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        'Description required',
        'Please describe the problem or service you need.',
      );
      return;
    }

    if (!location.trim()) {
      Alert.alert('Location required', 'Please add the service location.');
      return;
    }

    if (!budget.trim()) {
      Alert.alert('Budget required', 'Please add your expected budget.');
      return;
    }

    setJobPosted(true);

    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    }, 100);
  };

  const addComment = () => {
    const cleanText = commentText.trim();

    if (!cleanText) {
      return;
    }

    const newComment: CommentItem = {
      id: `comment-${Date.now()}`,
      name: role === 'customer' ? 'Nusrat Jahan' : 'You',
      role,
      text: cleanText,
      time: getCurrentTimeLabel(),
    };

    setComments(current => [...current, newComment]);

    setCommentText('');
  };

  const sendProposal = () => {
    const numericPrice = Number(proposalPrice);

    if (
      !proposalPrice.trim() ||
      Number.isNaN(numericPrice) ||
      numericPrice <= 0
    ) {
      Alert.alert(
        'Invalid labor cost',
        'Please enter a valid proposed labor cost.',
      );
      return;
    }

    if (!proposalAvailability.trim()) {
      Alert.alert(
        'Availability required',
        'Please tell the customer when you are available.',
      );
      return;
    }

    const newProposal: Proposal = {
      id: `proposal-${Date.now()}`,
      workerName: 'You',
      profession: 'Verified Service Worker',
      rating: 4.8,
      completedJobs: 64,
      price: numericPrice,
      availability: proposalAvailability.trim(),
      note: proposalNote.trim() || 'Available to complete this job.',
      status: 'pending',
    };

    setProposals(current => [...current, newProposal]);

    setProposalModalVisible(false);

    Alert.alert(
      'Proposal sent',
      'Your proposal is now visible to the customer.',
    );
  };

  const acceptProposal = (proposalId: string) => {
    setProposals(current =>
      current.map(proposal => ({
        ...proposal,
        status: proposal.id === proposalId ? 'accepted' : 'pending',
      })),
    );

    Alert.alert(
      'Worker selected',
      'The proposal has been accepted. You can now continue to private messaging.',
    );
  };

  const acceptedProposal = proposals.find(
    proposal => proposal.status === 'accepted',
  );

  const resetToEdit = () => {
    setJobPosted(false);

    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    }, 100);
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
            <View style={styles.brandArea}>
              <View style={styles.logo}>
                <Ionicons name="construct" size={18} color="#FFFFFF" />
              </View>

              <View>
                <Text style={styles.brand}>
                  Thi
                  <Text style={styles.brandAccent}>Korben</Text>
                </Text>

                <Text style={styles.headerSubtitle}>Job Marketplace</Text>
              </View>
            </View>

            <Pressable
              onPress={() =>
                Alert.alert(
                  'Job Marketplace',
                  'Customers can post jobs while workers can publicly discuss the job and send private proposals.',
                )
              }
              style={styles.infoButton}
            >
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={COLORS.navy}
              />
            </Pressable>
          </View>

          <Animated.View
            style={[
              styles.content,
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
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              <RoleSwitcher role={role} onChange={setRole} />

              {!jobPosted ? (
                <>
                  <View style={styles.pageHeading}>
                    <View style={styles.headingIcon}>
                      <Ionicons
                        name="add-circle-outline"
                        size={23}
                        color={COLORS.orange}
                      />
                    </View>

                    <View style={styles.pageHeadingText}>
                      <Text style={styles.pageTitle}>Post a New Job</Text>

                      <Text style={styles.pageSubtitle}>
                        Describe your problem and receive offers from verified
                        workers.
                      </Text>
                    </View>
                  </View>

                  {role === 'worker' && (
                    <View style={styles.roleNotice}>
                      <Ionicons
                        name="information-circle"
                        size={18}
                        color={COLORS.purple}
                      />

                      <Text style={styles.roleNoticeText}>
                        Job creation belongs to customers. Switch to Customer
                        mode to post the job, then switch back to Worker mode
                        after posting.
                      </Text>
                    </View>
                  )}

                  <View style={styles.formCard}>
                    <Text style={styles.inputLabel}>Job title</Text>

                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color={COLORS.muted}
                      />

                      <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g. Kitchen sink pipe leakage"
                        placeholderTextColor="#A2A6B3"
                        style={styles.textInput}
                      />
                    </View>

                    <Text style={[styles.inputLabel, styles.inputLabelSpacing]}>
                      Service category
                    </Text>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.categoryList}
                    >
                      {CATEGORIES.map(item => (
                        <CategoryButton
                          key={item.id}
                          category={item}
                          selected={category === item.id}
                          onPress={() => setCategory(item.id)}
                        />
                      ))}
                    </ScrollView>

                    <Text style={[styles.inputLabel, styles.inputLabelSpacing]}>
                      Describe the problem
                    </Text>

                    <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                      <Ionicons
                        name="document-text-outline"
                        size={18}
                        color={COLORS.muted}
                        style={styles.textAreaIcon}
                      />

                      <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Tell workers what happened and what you need..."
                        placeholderTextColor="#A2A6B3"
                        multiline
                        textAlignVertical="top"
                        style={[styles.textInput, styles.textArea]}
                      />
                    </View>

                    <Text style={[styles.inputLabel, styles.inputLabelSpacing]}>
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
                        placeholder="Enter location"
                        placeholderTextColor="#A2A6B3"
                        style={styles.textInput}
                      />
                    </View>

                    <View style={styles.twoColumnRow}>
                      <View style={styles.halfColumn}>
                        <Text
                          style={[styles.inputLabel, styles.inputLabelSpacing]}
                        >
                          Budget
                        </Text>

                        <View style={styles.inputWrapper}>
                          <Text style={styles.currencyPrefix}>৳</Text>

                          <TextInput
                            value={budget}
                            onChangeText={setBudget}
                            keyboardType="numeric"
                            placeholder="1000"
                            placeholderTextColor="#A2A6B3"
                            style={styles.textInput}
                          />
                        </View>
                      </View>

                      <View style={styles.halfColumn}>
                        <Text
                          style={[styles.inputLabel, styles.inputLabelSpacing]}
                        >
                          Preferred time
                        </Text>

                        <View style={styles.scheduleCompact}>
                          <Ionicons
                            name="calendar-outline"
                            size={17}
                            color={COLORS.purple}
                          />

                          <Text style={styles.scheduleCompactText}>
                            {schedule}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.scheduleOptions}>
                      {SCHEDULE_OPTIONS.map(option => (
                        <Pressable
                          key={option}
                          onPress={() => setSchedule(option)}
                          style={[
                            styles.scheduleOption,
                            schedule === option &&
                              styles.scheduleOptionSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.scheduleOptionText,
                              schedule === option &&
                                styles.scheduleOptionTextSelected,
                            ]}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <View style={styles.photoArea}>
                      <View style={styles.photoIconBox}>
                        <Ionicons
                          name="camera-outline"
                          size={22}
                          color={COLORS.orange}
                        />
                      </View>

                      <View style={styles.photoTextArea}>
                        <Text style={styles.photoTitle}>Add photos</Text>

                        <Text style={styles.photoDescription}>
                          Optional. Photos can help workers understand the
                          problem faster.
                        </Text>
                      </View>

                      <Pressable
                        onPress={() =>
                          Alert.alert(
                            'Photo Upload',
                            'Camera/gallery upload will be connected with the backend integration later.',
                          )
                        }
                        style={styles.photoButton}
                      >
                        <Ionicons name="add" size={18} color={COLORS.orange} />
                      </Pressable>
                    </View>

                    <Pressable
                      disabled={role !== 'customer'}
                      onPress={handlePostJob}
                      style={[
                        styles.postButton,
                        role !== 'customer' && styles.postButtonDisabled,
                      ]}
                    >
                      <Ionicons name="paper-plane" size={18} color="#FFFFFF" />

                      <Text style={styles.postButtonText}>Post Job</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.liveStatusHeader}>
                    <View style={styles.liveStatusLeft}>
                      <View style={styles.liveDotWrapper}>
                        <Animated.View
                          style={[
                            styles.livePulse,
                            {
                              transform: [
                                {
                                  scale: livePulse,
                                },
                              ],
                              opacity: livePulse.interpolate({
                                inputRange: [1, 1.25],
                                outputRange: [0.6, 0.08],
                              }),
                            },
                          ]}
                        />

                        <View style={styles.liveDot} />
                      </View>

                      <View>
                        <Text style={styles.liveTitle}>Job is Live</Text>

                        <Text style={styles.liveSubtitle}>
                          Verified workers can now comment and send proposals
                        </Text>
                      </View>
                    </View>

                    {role === 'customer' && (
                      <Pressable
                        onPress={resetToEdit}
                        style={styles.editButton}
                      >
                        <Ionicons
                          name="create-outline"
                          size={15}
                          color={COLORS.purple}
                        />

                        <Text style={styles.editButtonText}>Edit</Text>
                      </Pressable>
                    )}
                  </View>

                  {acceptedProposal && (
                    <View style={styles.workerSelectedCard}>
                      <View style={styles.selectedIcon}>
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                      </View>

                      <View style={styles.selectedWorkerInfo}>
                        <Text style={styles.selectedWorkerTitle}>
                          Worker selected
                        </Text>

                        <Text style={styles.selectedWorkerText}>
                          {acceptedProposal.workerName} •{' '}
                          {formatMoney(acceptedProposal.price)} labor
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => router.push('/job-chat')}
                        style={styles.selectedMessageButton}
                      >
                        <Ionicons
                          name="chatbubble-outline"
                          size={18}
                          color="#FFFFFF"
                        />
                      </Pressable>
                    </View>
                  )}

                  <View style={styles.jobCard}>
                    <View style={styles.jobCardHeader}>
                      <View style={styles.categoryIconLarge}>
                        <Ionicons
                          name={selectedCategory.icon}
                          size={24}
                          color={COLORS.orange}
                        />
                      </View>

                      <View style={styles.jobTitleArea}>
                        <Text style={styles.jobCategoryLabel}>
                          {selectedCategory.title}
                        </Text>

                        <Text style={styles.jobTitle}>{title}</Text>
                      </View>

                      <View style={styles.openBadge}>
                        <Text style={styles.openBadgeText}>OPEN</Text>
                      </View>
                    </View>

                    <View style={styles.jobMetadata}>
                      <View style={styles.metadataItem}>
                        <Ionicons
                          name="location-outline"
                          size={15}
                          color={COLORS.muted}
                        />

                        <Text style={styles.metadataText}>{location}</Text>
                      </View>

                      <View style={styles.metadataItem}>
                        <Ionicons
                          name="calendar-outline"
                          size={15}
                          color={COLORS.muted}
                        />

                        <Text style={styles.metadataText}>{schedule}</Text>
                      </View>

                      <View style={styles.metadataItem}>
                        <Ionicons
                          name="wallet-outline"
                          size={15}
                          color={COLORS.muted}
                        />

                        <Text style={styles.metadataText}>
                          Budget {formatMoney(budget)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.descriptionBox}>
                      <Text style={styles.descriptionLabel}>
                        Job Description
                      </Text>

                      <Text style={styles.descriptionText}>{description}</Text>
                    </View>

                    <View style={styles.jobStats}>
                      <View style={styles.jobStatItem}>
                        <Text style={styles.jobStatValue}>
                          {comments.length}
                        </Text>

                        <Text style={styles.jobStatLabel}>Comments</Text>
                      </View>

                      <View style={styles.jobStatDivider} />

                      <View style={styles.jobStatItem}>
                        <Text style={styles.jobStatValue}>
                          {proposals.length}
                        </Text>

                        <Text style={styles.jobStatLabel}>Proposals</Text>
                      </View>

                      <View style={styles.jobStatDivider} />

                      <View style={styles.jobStatItem}>
                        <Text style={styles.jobStatValue}>6</Text>

                        <Text style={styles.jobStatLabel}>Views</Text>
                      </View>
                    </View>
                  </View>

                  {role === 'worker' && (
                    <Pressable
                      onPress={() => setProposalModalVisible(true)}
                      style={styles.sendProposalCTA}
                    >
                      <View style={styles.sendProposalIcon}>
                        <Ionicons
                          name="document-text-outline"
                          size={21}
                          color="#FFFFFF"
                        />
                      </View>

                      <View style={styles.sendProposalContent}>
                        <Text style={styles.sendProposalTitle}>
                          Interested in this job?
                        </Text>

                        <Text style={styles.sendProposalSubtitle}>
                          Send the customer your labor price and availability
                        </Text>
                      </View>

                      <Ionicons
                        name="arrow-forward"
                        size={19}
                        color="#FFFFFF"
                      />
                    </Pressable>
                  )}

                  <View style={styles.sectionHeader}>
                    <View>
                      <Text style={styles.sectionTitle}>Public Discussion</Text>

                      <Text style={styles.sectionSubtitle}>
                        Questions and answers are visible to everyone
                      </Text>
                    </View>

                    <View style={styles.publicBadge}>
                      <Ionicons
                        name="people-outline"
                        size={13}
                        color={COLORS.purple}
                      />

                      <Text style={styles.publicBadgeText}>Public</Text>
                    </View>
                  </View>

                  <View style={styles.discussionCard}>
                    {comments.map(comment => (
                      <CommentCard key={comment.id} comment={comment} />
                    ))}

                    <View style={styles.commentComposer}>
                      <View
                        style={[
                          styles.composerAvatar,
                          role === 'worker'
                            ? styles.workerAvatar
                            : styles.customerAvatar,
                        ]}
                      >
                        <Ionicons
                          name={role === 'worker' ? 'construct' : 'person'}
                          size={15}
                          color="#FFFFFF"
                        />
                      </View>

                      <View style={styles.commentInputWrapper}>
                        <TextInput
                          value={commentText}
                          onChangeText={setCommentText}
                          placeholder={
                            role === 'worker'
                              ? 'Ask the customer a question...'
                              : 'Reply to workers...'
                          }
                          placeholderTextColor="#A2A6B3"
                          multiline
                          style={styles.commentInput}
                        />

                        <Pressable
                          onPress={addComment}
                          style={[
                            styles.commentSendButton,
                            !commentText.trim() &&
                              styles.commentSendButtonDisabled,
                          ]}
                        >
                          <Ionicons name="send" size={15} color="#FFFFFF" />
                        </Pressable>
                      </View>
                    </View>
                  </View>

                  <View style={styles.sectionHeader}>
                    <View>
                      <Text style={styles.sectionTitle}>Worker Proposals</Text>

                      <Text style={styles.sectionSubtitle}>
                        Private offers with labor cost and availability
                      </Text>
                    </View>

                    <View style={styles.proposalCountBadge}>
                      <Text style={styles.proposalCountText}>
                        {proposals.length}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.proposalList}>
                    {proposals.map(proposal => (
                      <ProposalCard
                        key={proposal.id}
                        proposal={proposal}
                        customerMode={role === 'customer'}
                        onAccept={() => acceptProposal(proposal.id)}
                      />
                    ))}
                  </View>

                  {role === 'worker' && (
                    <Pressable
                      onPress={() => setProposalModalVisible(true)}
                      style={styles.bottomProposalButton}
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={18}
                        color={COLORS.purple}
                      />

                      <Text style={styles.bottomProposalButtonText}>
                        Send another proposal
                      </Text>
                    </Pressable>
                  )}

                  <View style={styles.securityCard}>
                    <View style={styles.securityIcon}>
                      <Ionicons
                        name="shield-checkmark"
                        size={22}
                        color={COLORS.purple}
                      />
                    </View>

                    <View style={styles.securityContent}>
                      <Text style={styles.securityTitle}>
                        Safe marketplace communication
                      </Text>

                      <Text style={styles.securityText}>
                        Public comments help clarify the job. Worker proposals
                        are separate offers that customers can review before
                        selecting a professional.
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </SafeAreaView>

      <Modal
        visible={proposalModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProposalModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setProposalModalVisible(false)}
          />

          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Send Proposal</Text>

                <Text style={styles.modalSubtitle}>
                  Your offer will be visible to the customer.
                </Text>
              </View>

              <Pressable
                onPress={() => setProposalModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={20} color={COLORS.text} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Proposed labor cost</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.currencyPrefix}>৳</Text>

              <TextInput
                value={proposalPrice}
                onChangeText={setProposalPrice}
                keyboardType="numeric"
                placeholder="750"
                placeholderTextColor="#A2A6B3"
                style={styles.textInput}
              />
            </View>

            <Text style={[styles.inputLabel, styles.inputLabelSpacing]}>
              Your availability
            </Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={COLORS.muted}
              />

              <TextInput
                value={proposalAvailability}
                onChangeText={setProposalAvailability}
                placeholder="e.g. Tomorrow, 10 AM"
                placeholderTextColor="#A2A6B3"
                style={styles.textInput}
              />
            </View>

            <Text style={[styles.inputLabel, styles.inputLabelSpacing]}>
              Note to customer
            </Text>

            <View style={[styles.inputWrapper, styles.proposalNoteWrapper]}>
              <TextInput
                value={proposalNote}
                onChangeText={setProposalNote}
                placeholder="Explain your offer..."
                placeholderTextColor="#A2A6B3"
                multiline
                textAlignVertical="top"
                style={[styles.textInput, styles.proposalNoteInput]}
              />
            </View>

            <View style={styles.modalNotice}>
              <Ionicons
                name="information-circle-outline"
                size={17}
                color={COLORS.purple}
              />

              <Text style={styles.modalNoticeText}>
                Material/product costs should be discussed separately. ThiKorben
                Shop recommendations will be connected in a later milestone.
              </Text>
            </View>

            <Pressable onPress={sendProposal} style={styles.modalSubmitButton}>
              <Ionicons name="paper-plane" size={17} color="#FFFFFF" />

              <Text style={styles.modalSubmitButtonText}>Send Proposal</Text>
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

  logo: {
    width: 34,
    height: 34,
    marginRight: 9,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 11,

    backgroundColor: COLORS.purple,
  },

  brand: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.navy,
  },

  brandAccent: {
    color: COLORS.orange,
  },

  headerSubtitle: {
    marginTop: 1,
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.muted,
  },

  infoButton: {
    width: 40,
    height: 40,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 20,
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 50,
  },

  roleSwitcherWrapper: {
    marginBottom: 18,
    padding: 12,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,

    backgroundColor: COLORS.card,
  },

  roleSwitcherHeader: {
    marginBottom: 10,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  roleSwitcherLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.text,
  },

  roleSwitcherHint: {
    maxWidth: 255,
    marginTop: 2,

    fontSize: 8.5,
    color: COLORS.muted,
  },

  demoBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 999,

    backgroundColor: COLORS.successSoft,
  },

  demoDot: {
    width: 6,
    height: 6,
    marginRight: 4,

    borderRadius: 3,

    backgroundColor: COLORS.success,
  },

  demoBadgeText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: COLORS.success,
  },

  roleSwitcher: {
    padding: 4,

    flexDirection: 'row',

    borderRadius: 13,

    backgroundColor: COLORS.softGray,
  },

  roleOption: {
    flex: 1,
    minHeight: 39,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,

    borderRadius: 10,
  },

  roleOptionActive: {
    backgroundColor: COLORS.orange,
  },

  roleOptionWorkerActive: {
    backgroundColor: COLORS.purple,
  },

  roleOptionText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.muted,
  },

  roleOptionTextActive: {
    color: '#FFFFFF',
  },

  pageHeading: {
    marginBottom: 14,

    flexDirection: 'row',
    alignItems: 'center',
  },

  headingIcon: {
    width: 44,
    height: 44,
    marginRight: 10,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 14,

    backgroundColor: COLORS.softOrange,
  },

  pageHeadingText: {
    flex: 1,
  },

  pageTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.text,
  },

  pageSubtitle: {
    maxWidth: 310,
    marginTop: 3,

    fontSize: 10,
    lineHeight: 15,

    color: COLORS.muted,
  },

  roleNotice: {
    marginBottom: 13,
    padding: 11,

    flexDirection: 'row',
    alignItems: 'flex-start',

    gap: 8,

    borderRadius: 13,

    backgroundColor: COLORS.purpleSoft,
  },

  roleNoticeText: {
    flex: 1,

    fontSize: 9.5,
    lineHeight: 14,

    color: COLORS.purpleDark,
  },

  formCard: {
    padding: 15,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 19,

    backgroundColor: COLORS.card,
  },

  inputLabel: {
    marginBottom: 7,

    fontSize: 10.5,
    fontWeight: '800',

    color: COLORS.text,
  },

  inputLabelSpacing: {
    marginTop: 15,
  },

  inputWrapper: {
    minHeight: 49,
    paddingHorizontal: 12,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 8,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,

    backgroundColor: '#FAFAFC',
  },

  textInput: {
    flex: 1,
    minHeight: 47,

    paddingVertical: 0,

    fontSize: 11.5,
    color: COLORS.text,
  },

  categoryList: {
    gap: 8,
    paddingRight: 10,
  },

  categoryButton: {
    minHeight: 40,
    paddingHorizontal: 12,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 6,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,

    backgroundColor: '#FAFAFC',
  },

  categoryButtonSelected: {
    borderColor: COLORS.purple,
    backgroundColor: COLORS.purple,
  },

  categoryButtonText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.purple,
  },

  categoryButtonTextSelected: {
    color: '#FFFFFF',
  },

  textAreaWrapper: {
    minHeight: 120,
    alignItems: 'flex-start',
  },

  textAreaIcon: {
    marginTop: 14,
  },

  textArea: {
    minHeight: 116,
    paddingTop: 13,
    paddingBottom: 13,
  },

  twoColumnRow: {
    flexDirection: 'row',
    gap: 9,
  },

  halfColumn: {
    flex: 1,
  },

  currencyPrefix: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.orange,
  },

  scheduleCompact: {
    minHeight: 49,
    paddingHorizontal: 10,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 6,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,

    backgroundColor: '#FAFAFC',
  },

  scheduleCompactText: {
    flex: 1,

    fontSize: 10,
    fontWeight: '700',

    color: COLORS.text,
  },

  scheduleOptions: {
    marginTop: 10,

    flexDirection: 'row',

    gap: 7,
  },

  scheduleOption: {
    flex: 1,
    minHeight: 35,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,

    backgroundColor: '#FAFAFC',
  },

  scheduleOptionSelected: {
    borderColor: COLORS.orange,

    backgroundColor: COLORS.softOrange,
  },

  scheduleOptionText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.muted,
  },

  scheduleOptionTextSelected: {
    color: COLORS.orangeDark,
  },

  photoArea: {
    marginTop: 15,
    padding: 11,

    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#F2B98F',
    borderRadius: 13,

    backgroundColor: '#FFF9F4',
  },

  photoIconBox: {
    width: 38,
    height: 38,
    marginRight: 9,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 11,

    backgroundColor: '#FFFFFF',
  },

  photoTextArea: {
    flex: 1,
  },

  photoTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  photoDescription: {
    maxWidth: 230,
    marginTop: 2,

    fontSize: 8.5,
    lineHeight: 12,

    color: COLORS.muted,
  },

  photoButton: {
    width: 33,
    height: 33,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 10,

    backgroundColor: COLORS.softOrange,
  },

  postButton: {
    minHeight: 50,
    marginTop: 17,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    borderRadius: 14,

    backgroundColor: COLORS.orange,
  },

  postButtonDisabled: {
    opacity: 0.45,
  },

  postButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  liveStatusHeader: {
    marginBottom: 13,
    padding: 11,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderRadius: 14,

    backgroundColor: COLORS.successSoft,
  },

  liveStatusLeft: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',
  },

  liveDotWrapper: {
    width: 28,
    height: 28,
    marginRight: 8,

    position: 'relative',

    alignItems: 'center',
    justifyContent: 'center',
  },

  livePulse: {
    position: 'absolute',

    width: 24,
    height: 24,

    borderRadius: 12,

    backgroundColor: COLORS.success,
  },

  liveDot: {
    width: 9,
    height: 9,

    borderRadius: 5,

    backgroundColor: COLORS.success,
  },

  liveTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0D7B47',
  },

  liveSubtitle: {
    maxWidth: 250,
    marginTop: 1,

    fontSize: 8.5,
    color: '#4C8066',
  },

  editButton: {
    paddingHorizontal: 9,
    paddingVertical: 7,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,

    borderRadius: 9,

    backgroundColor: '#FFFFFF',
  },

  editButtonText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.purple,
  },

  workerSelectedCard: {
    marginBottom: 13,
    padding: 12,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 15,

    backgroundColor: COLORS.purple,
  },

  selectedIcon: {
    width: 38,
    height: 38,
    marginRight: 10,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: 'rgba(255,255,255,0.14)',
  },

  selectedWorkerInfo: {
    flex: 1,
  },

  selectedWorkerTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  selectedWorkerText: {
    marginTop: 2,

    fontSize: 9,
    color: '#DDD9FF',
  },

  selectedMessageButton: {
    width: 38,
    height: 38,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: COLORS.orange,
  },

  jobCard: {
    marginBottom: 16,
    padding: 14,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,

    backgroundColor: COLORS.card,
  },

  jobCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  categoryIconLarge: {
    width: 46,
    height: 46,
    marginRight: 10,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 14,

    backgroundColor: COLORS.softOrange,
  },

  jobTitleArea: {
    flex: 1,
  },

  jobCategoryLabel: {
    marginBottom: 2,

    fontSize: 8,
    fontWeight: '900',

    textTransform: 'uppercase',
    letterSpacing: 0.6,

    color: COLORS.orangeDark,
  },

  jobTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
  },

  openBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,

    borderRadius: 999,

    backgroundColor: COLORS.successSoft,
  },

  openBadgeText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: COLORS.success,
  },

  jobMetadata: {
    marginTop: 14,

    gap: 8,
  },

  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 6,
  },

  metadataText: {
    flex: 1,

    fontSize: 9.5,
    color: COLORS.muted,
  },

  descriptionBox: {
    marginTop: 14,
    padding: 11,

    borderRadius: 12,

    backgroundColor: '#F8F8FB',
  },

  descriptionLabel: {
    marginBottom: 5,

    fontSize: 9,
    fontWeight: '900',

    color: COLORS.text,
  },

  descriptionText: {
    fontSize: 10,
    lineHeight: 16,
    color: '#666B7A',
  },

  jobStats: {
    marginTop: 13,
    paddingVertical: 10,

    flexDirection: 'row',
    alignItems: 'center',

    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  jobStatItem: {
    flex: 1,
    alignItems: 'center',
  },

  jobStatValue: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text,
  },

  jobStatLabel: {
    marginTop: 2,
    fontSize: 8,
    color: COLORS.muted,
  },

  jobStatDivider: {
    width: 1,
    height: 25,

    backgroundColor: COLORS.border,
  },

  sendProposalCTA: {
    marginBottom: 18,
    padding: 13,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 16,

    backgroundColor: COLORS.purple,
  },

  sendProposalIcon: {
    width: 40,
    height: 40,
    marginRight: 9,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: 'rgba(255,255,255,0.13)',
  },

  sendProposalContent: {
    flex: 1,
  },

  sendProposalTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  sendProposalSubtitle: {
    maxWidth: 280,
    marginTop: 2,

    fontSize: 8.5,
    color: '#DDD9FF',
  },

  sectionHeader: {
    marginTop: 4,
    marginBottom: 10,

    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  sectionSubtitle: {
    maxWidth: 300,
    marginTop: 2,

    fontSize: 8.5,
    color: COLORS.muted,
  },

  publicBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,

    borderRadius: 999,

    backgroundColor: COLORS.purpleSoft,
  },

  publicBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.purple,
  },

  discussionCard: {
    marginBottom: 19,
    padding: 13,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,

    backgroundColor: COLORS.card,
  },

  commentRow: {
    marginBottom: 15,

    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  commentAvatar: {
    width: 37,
    height: 37,
    marginRight: 9,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,
  },

  workerAvatar: {
    backgroundColor: COLORS.purple,
  },

  customerAvatar: {
    backgroundColor: COLORS.orange,
  },

  commentAvatarText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  commentContent: {
    flex: 1,
  },

  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  commentNameRow: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 5,
  },

  commentName: {
    fontSize: 10.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,

    borderRadius: 999,
  },

  workerRoleBadge: {
    backgroundColor: COLORS.purpleSoft,
  },

  customerRoleBadge: {
    backgroundColor: COLORS.softOrange,
  },

  roleBadgeText: {
    fontSize: 7,
    fontWeight: '900',
  },

  commentTime: {
    fontSize: 7.5,
    color: '#A2A6B3',
  },

  commentText: {
    marginTop: 5,

    fontSize: 9.5,
    lineHeight: 15,

    color: '#626775',
  },

  commentComposer: {
    paddingTop: 12,

    flexDirection: 'row',
    alignItems: 'flex-end',

    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  composerAvatar: {
    width: 31,
    height: 31,
    marginRight: 8,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 10,
  },

  commentInputWrapper: {
    flex: 1,
    minHeight: 43,

    paddingLeft: 11,
    paddingRight: 5,

    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,

    backgroundColor: '#FAFAFC',
  },

  commentInput: {
    flex: 1,
    maxHeight: 85,

    paddingVertical: 10,

    fontSize: 9.5,
    color: COLORS.text,
  },

  commentSendButton: {
    width: 32,
    height: 32,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 10,

    backgroundColor: COLORS.orange,
  },

  commentSendButtonDisabled: {
    opacity: 0.4,
  },

  proposalCountBadge: {
    minWidth: 27,
    height: 27,

    paddingHorizontal: 7,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 999,

    backgroundColor: COLORS.softOrange,
  },

  proposalCountText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  proposalList: {
    gap: 11,
  },

  proposalCard: {
    padding: 13,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,

    backgroundColor: COLORS.card,
  },

  proposalCardAccepted: {
    borderColor: '#A6DFC3',
    backgroundColor: '#FCFFFD',
  },

  acceptedBanner: {
    marginBottom: 11,
    padding: 8,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 5,

    borderRadius: 10,

    backgroundColor: COLORS.successSoft,
  },

  acceptedBannerText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: COLORS.success,
  },

  proposalWorkerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  proposalAvatar: {
    width: 50,
    height: 50,
    marginRight: 10,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 15,

    backgroundColor: COLORS.purple,
  },

  proposalAvatarText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  proposalWorkerInfo: {
    flex: 1,
  },

  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,
  },

  proposalWorkerName: {
    fontSize: 11.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  proposalProfession: {
    marginTop: 2,

    fontSize: 8.5,
    color: COLORS.muted,
  },

  proposalStats: {
    marginTop: 5,

    flexDirection: 'row',

    gap: 9,
  },

  proposalStat: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 3,
  },

  proposalStatText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.muted,
  },

  proposalPriceArea: {
    alignItems: 'flex-end',
  },

  proposalPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  proposalPriceLabel: {
    marginTop: 1,

    fontSize: 7.5,
    color: COLORS.muted,
  },

  proposalInfoBox: {
    marginTop: 11,
    padding: 8,

    borderRadius: 10,

    backgroundColor: COLORS.purpleSoft,
  },

  proposalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 6,
  },

  proposalInfoText: {
    flex: 1,

    fontSize: 8.5,
    fontWeight: '700',

    color: COLORS.purpleDark,
  },

  proposalNote: {
    marginTop: 10,

    fontSize: 9.5,
    lineHeight: 15,

    color: '#646978',
  },

  proposalActions: {
    marginTop: 12,

    flexDirection: 'row',

    gap: 7,
  },

  secondaryButton: {
    flex: 1,
    minHeight: 39,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 5,

    borderWidth: 1,
    borderColor: '#D9D6F4',
    borderRadius: 11,

    backgroundColor: COLORS.purpleSoft,
  },

  secondaryButtonText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: COLORS.purple,
  },

  acceptButton: {
    flex: 1.2,
    minHeight: 39,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 5,

    borderRadius: 11,

    backgroundColor: COLORS.orange,
  },

  messageButton: {
    flex: 1.2,
    minHeight: 39,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 5,

    borderRadius: 11,

    backgroundColor: COLORS.purple,
  },

  acceptButtonText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  bottomProposalButton: {
    minHeight: 44,
    marginTop: 11,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,

    borderWidth: 1,
    borderColor: '#D7D4F0',
    borderRadius: 12,

    backgroundColor: COLORS.purpleSoft,
  },

  bottomProposalButtonText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.purple,
  },

  securityCard: {
    marginTop: 18,
    padding: 12,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 15,

    backgroundColor: COLORS.purpleSoft,
  },

  securityIcon: {
    width: 40,
    height: 40,
    marginRight: 9,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: '#FFFFFF',
  },

  securityContent: {
    flex: 1,
  },

  securityTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: COLORS.purpleDark,
  },

  securityText: {
    marginTop: 3,

    fontSize: 8.5,
    lineHeight: 13,

    color: '#6A668E',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: 'rgba(18,20,35,0.46)',
  },

  modalSheet: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',

    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 25,

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    backgroundColor: COLORS.card,
  },

  modalHandle: {
    width: 43,
    height: 4,
    marginBottom: 13,

    alignSelf: 'center',

    borderRadius: 4,

    backgroundColor: '#D6D8E0',
  },

  modalHeader: {
    marginBottom: 17,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.text,
  },

  modalSubtitle: {
    marginTop: 3,

    fontSize: 9,
    color: COLORS.muted,
  },

  modalCloseButton: {
    width: 36,
    height: 36,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: COLORS.softGray,
  },

  proposalNoteWrapper: {
    minHeight: 93,
    alignItems: 'flex-start',
  },

  proposalNoteInput: {
    minHeight: 90,

    paddingTop: 12,
    paddingBottom: 12,
  },

  modalNotice: {
    marginTop: 13,
    padding: 10,

    flexDirection: 'row',
    alignItems: 'flex-start',

    gap: 7,

    borderRadius: 12,

    backgroundColor: COLORS.purpleSoft,
  },

  modalNoticeText: {
    flex: 1,

    fontSize: 8.5,
    lineHeight: 13,

    color: '#67638A',
  },

  modalSubmitButton: {
    minHeight: 49,
    marginTop: 14,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 7,

    borderRadius: 13,

    backgroundColor: COLORS.purple,
  },

  modalSubmitButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
