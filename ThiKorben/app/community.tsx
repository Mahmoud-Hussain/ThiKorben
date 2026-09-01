import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  addJobComment,
  CURRENT_WORKER,
  getAcceptedProposal,
  getDemoRole,
  getJobs,
  hasReacted,
  JobCategory,
  JobPost,
  MarketplaceRole,
  openJobChat,
  selectJob,
  setDemoRole,
  toggleReaction,
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

  danger: '#D9485F',
};

const CATEGORY_META: Record<
  JobCategory,
  {
    title: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
  }
> = {
  plumbing: {
    title: 'Plumbing',
    icon: 'water-outline',
  },

  electrical: {
    title: 'Electrical',
    icon: 'flash-outline',
  },

  carpentry: {
    title: 'Carpentry',
    icon: 'hammer-outline',
  },

  cleaning: {
    title: 'Cleaning',
    icon: 'sparkles-outline',
  },

  painting: {
    title: 'Painting',
    icon: 'color-palette-outline',
  },

  ac: {
    title: 'AC Repair',
    icon: 'snow-outline',
  },
};

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

function JobFeedCard({ job, role }: { job: JobPost; role: MarketplaceRole }) {
  const [commentText, setCommentText] = useState('');

  const category = CATEGORY_META[job.category];

  const reacted = hasReacted(job, role);

  const accepted = getAcceptedProposal(job.id);

  const handleComment = () => {
    if (!commentText.trim()) {
      return;
    }

    addJobComment(job.id, commentText, role);

    setCommentText('');
  };

  const openDetails = () => {
    selectJob(job.id);

    router.push({
      pathname: '/job-board',
      params: {
        mode: 'detail',
      },
    });
  };

  const openMessage = () => {
    selectJob(job.id);

    openJobChat(job.id, accepted?.workerId ?? CURRENT_WORKER.id);

    router.push('/job-chat');
  };

  return (
    <View style={styles.feedCard}>
      <View style={styles.postHeader}>
        <View style={styles.customerAvatar}>
          <Text style={styles.customerAvatarText}>
            {job.customerName
              .split(' ')
              .slice(0, 2)
              .map(part => part[0])
              .join('')}
          </Text>
        </View>

        <View style={styles.postAuthor}>
          <Text style={styles.customerName}>{job.customerName}</Text>

          <Text style={styles.postTime}>
            {job.createdAt} • {job.location}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            job.status === 'open'
              ? styles.openBadge
              : job.status === 'assigned'
                ? styles.assignedBadge
                : styles.orderedBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  job.status === 'open'
                    ? COLORS.success
                    : job.status === 'assigned'
                      ? COLORS.purple
                      : COLORS.orangeDark,
              },
            ]}
          >
            {job.status === 'open'
              ? 'OPEN'
              : job.status === 'assigned'
                ? 'ASSIGNED'
                : 'ORDERED'}
          </Text>
        </View>
      </View>

      <View style={styles.categoryRow}>
        <View style={styles.categoryBadge}>
          <Ionicons name={category.icon} size={13} color={COLORS.orangeDark} />

          <Text style={styles.categoryText}>{category.title}</Text>
        </View>

        <Text style={styles.budgetText}>Budget {formatMoney(job.budget)}</Text>
      </View>

      <Text style={styles.jobTitle}>{job.title}</Text>

      <Text style={styles.jobDescription}>{job.description}</Text>

      {job.photoUri ? (
        <Image
          source={{
            uri: job.photoUri,
          }}
          style={styles.jobImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Ionicons name={category.icon} size={42} color={COLORS.purple} />

          <Text style={styles.photoPlaceholderText}>Service request</Text>
        </View>
      )}

      <View style={styles.jobMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.muted} />

          <Text style={styles.metaText}>{job.schedule}</Text>
        </View>

        <View style={styles.metaItem}>
          <Ionicons name="chatbubbles-outline" size={14} color={COLORS.muted} />

          <Text style={styles.metaText}>{job.comments.length} comments</Text>
        </View>

        <View style={styles.metaItem}>
          <Ionicons
            name="document-text-outline"
            size={14}
            color={COLORS.muted}
          />

          <Text style={styles.metaText}>{job.proposals.length} proposals</Text>
        </View>
      </View>

      <View style={styles.socialStats}>
        <Text style={styles.socialText}>👍 {job.reactions}</Text>

        <Text style={styles.socialText}>{job.comments.length} comments</Text>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          onPress={() => toggleReaction(job.id, role)}
          style={styles.actionButton}
        >
          <Ionicons
            name={reacted ? 'thumbs-up' : 'thumbs-up-outline'}
            size={17}
            color={reacted ? COLORS.orange : COLORS.muted}
          />

          <Text
            style={[
              styles.actionText,
              reacted && {
                color: COLORS.orange,
              },
            ]}
          >
            React
          </Text>
        </Pressable>

        <Pressable onPress={openDetails} style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={17} color={COLORS.muted} />

          <Text style={styles.actionText}>Comment</Text>
        </Pressable>

        <Pressable onPress={openMessage} style={styles.actionButton}>
          <Ionicons
            name="paper-plane-outline"
            size={17}
            color={COLORS.purple}
          />

          <Text
            style={[
              styles.actionText,
              {
                color: COLORS.purple,
              },
            ]}
          >
            Message
          </Text>
        </Pressable>
      </View>

      {job.comments.length > 0 && (
        <View style={styles.commentPreview}>
          {job.comments.slice(-2).map(comment => (
            <View key={comment.id} style={styles.previewComment}>
              <Text style={styles.previewAuthor}>{comment.authorName}</Text>

              <Text style={styles.previewText}>{comment.text}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.commentComposer}>
        <View
          style={[
            styles.miniAvatar,
            role === 'worker'
              ? styles.workerMiniAvatar
              : styles.customerMiniAvatar,
          ]}
        >
          <Ionicons
            name={role === 'worker' ? 'construct' : 'person'}
            size={14}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.commentInputWrapper}>
          <TextInput
            value={commentText}
            onChangeText={setCommentText}
            placeholder={
              role === 'worker'
                ? 'Write a public comment...'
                : 'Reply publicly...'
            }
            placeholderTextColor="#A2A6B3"
            returnKeyType="send"
            onSubmitEditing={handleComment}
            style={styles.commentInput}
          />

          <Pressable
            onPress={handleComment}
            disabled={!commentText.trim()}
            style={[
              styles.commentSendButton,
              !commentText.trim() && styles.disabledButton,
            ]}
          >
            <Ionicons name="send" size={14} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {role === 'worker' && (
        <View style={styles.workerActions}>
          <Pressable onPress={openDetails} style={styles.proposalButton}>
            <Ionicons name="document-text-outline" size={16} color="#FFFFFF" />

            <Text style={styles.proposalButtonText}>View / Send Proposal</Text>
          </Pressable>

          <Pressable onPress={openMessage} style={styles.messageCustomerButton}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={16}
              color={COLORS.purple}
            />

            <Text style={styles.messageCustomerText}>Inbox Customer</Text>
          </Pressable>
        </View>
      )}

      {role === 'customer' && accepted && (
        <Pressable onPress={openMessage} style={styles.acceptedWorkerBar}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />

          <View style={{ flex: 1 }}>
            <Text style={styles.acceptedWorkerTitle}>
              {accepted.workerName} selected
            </Text>

            <Text style={styles.acceptedWorkerText}>
              Labor {formatMoney(accepted.price)} • Open private chat
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={17} color={COLORS.purple} />
        </Pressable>
      )}
    </View>
  );
}

export default function CommunityScreen() {
  useMarketplaceVersion();

  const role = getDemoRole();

  const jobs = getJobs();

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

                <Text style={styles.headerSubtitle}>Community</Text>
              </View>
            </View>

            <Pressable
              onPress={() => {
                setDemoRole('customer');

                router.push({
                  pathname: '/job-board',
                  params: {
                    mode: 'create',
                  },
                });
              }}
              style={styles.createButton}
            >
              <Ionicons name="add" size={17} color="#FFFFFF" />

              <Text style={styles.createButtonText}>Post Job</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.welcomeRow}>
              <View>
                <Text style={styles.pageTitle}>Community Feed</Text>

                <Text style={styles.pageSubtitle}>
                  Post service needs, discuss publicly and connect privately.
                </Text>
              </View>

              <Ionicons
                name="people-circle-outline"
                size={36}
                color={COLORS.purple}
              />
            </View>

            <RoleSwitcher role={role} />

            <View style={styles.composerCard}>
              <View style={styles.composerAvatar}>
                <Text style={styles.composerAvatarText}>NJ</Text>
              </View>

              <Pressable
                onPress={() => {
                  setDemoRole('customer');

                  router.push({
                    pathname: '/job-board',
                    params: {
                      mode: 'create',
                    },
                  });
                }}
                style={styles.composerPrompt}
              >
                <Text style={styles.composerPromptText}>
                  What service do you need?
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setDemoRole('customer');

                  router.push({
                    pathname: '/job-board',
                    params: {
                      mode: 'create',
                    },
                  });
                }}
                style={styles.composerPhoto}
              >
                <Ionicons
                  name="image-outline"
                  size={20}
                  color={COLORS.orange}
                />
              </Pressable>
            </View>

            <View style={styles.feedHeading}>
              <Text style={styles.feedHeadingTitle}>Recent Jobs</Text>

              <Text style={styles.feedHeadingCount}>{jobs.length} posts</Text>
            </View>

            {jobs.map(job => (
              <JobFeedCard key={job.id} job={job} role={role} />
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
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
    height: 64,
    paddingHorizontal: 14,
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
    width: 36,
    height: 36,
    marginRight: 9,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.purple,
  },

  brand: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.text,
  },

  brandAccent: {
    color: COLORS.orange,
  },

  headerSubtitle: {
    marginTop: 1,
    fontSize: 8,
    color: COLORS.muted,
  },

  createButton: {
    minHeight: 38,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 11,
    backgroundColor: COLORS.orange,
  },

  createButtonText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  scrollContent: {
    padding: 13,
    paddingBottom: 45,
  },

  welcomeRow: {
    marginBottom: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  pageTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },

  pageSubtitle: {
    maxWidth: 310,
    marginTop: 3,
    fontSize: 8.5,
    lineHeight: 13,
    color: COLORS.muted,
  },

  roleSwitcher: {
    padding: 4,
    flexDirection: 'row',
    borderRadius: 13,
    backgroundColor: '#EDEEF3',
  },

  roleOption: {
    flex: 1,
    minHeight: 37,
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
    fontSize: 8.5,
    fontWeight: '900',
    color: COLORS.muted,
  },

  roleTextActive: {
    color: '#FFFFFF',
  },

  composerCard: {
    marginTop: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    backgroundColor: COLORS.card,
  },

  composerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.orange,
  },

  composerAvatarText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  composerPrompt: {
    flex: 1,
    minHeight: 38,
    marginHorizontal: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#F1F2F6',
  },

  composerPromptText: {
    fontSize: 8.5,
    color: COLORS.muted,
  },

  composerPhoto: {
    width: 37,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: COLORS.orangeSoft,
  },

  feedHeading: {
    marginTop: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  feedHeadingTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.text,
  },

  feedHeadingCount: {
    fontSize: 7.5,
    color: COLORS.muted,
  },

  feedCard: {
    marginBottom: 13,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    backgroundColor: COLORS.card,
  },

  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  customerAvatar: {
    width: 42,
    height: 42,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: COLORS.orange,
  },

  customerAvatarText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  postAuthor: {
    flex: 1,
  },

  customerName: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.text,
  },

  postTime: {
    marginTop: 2,
    fontSize: 6.8,
    color: COLORS.muted,
  },

  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 999,
  },

  openBadge: {
    backgroundColor: COLORS.successSoft,
  },

  assignedBadge: {
    backgroundColor: COLORS.purpleSoft,
  },

  orderedBadge: {
    backgroundColor: COLORS.orangeSoft,
  },

  statusText: {
    fontSize: 6,
    fontWeight: '900',
  },

  categoryRow: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  categoryBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: COLORS.orangeSoft,
  },

  categoryText: {
    fontSize: 6.5,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  budgetText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.purple,
  },

  jobTitle: {
    marginTop: 9,
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.text,
  },

  jobDescription: {
    marginTop: 5,
    fontSize: 8.5,
    lineHeight: 13,
    color: '#626775',
  },

  jobImage: {
    width: '100%',
    height: 185,
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: '#E8E9EE',
  },

  photoPlaceholder: {
    height: 120,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: COLORS.purpleSoft,
  },

  photoPlaceholderText: {
    marginTop: 5,
    fontSize: 7.5,
    fontWeight: '800',
    color: COLORS.purple,
  },

  jobMeta: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  metaText: {
    fontSize: 6.8,
    color: COLORS.muted,
  },

  socialStats: {
    marginTop: 10,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  socialText: {
    fontSize: 7,
    color: COLORS.muted,
  },

  actionRow: {
    height: 42,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  actionText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: COLORS.muted,
  },

  commentPreview: {
    marginTop: 8,
  },

  previewComment: {
    marginTop: 6,
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F7',
  },

  previewAuthor: {
    fontSize: 7.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  previewText: {
    marginTop: 2,
    fontSize: 7.5,
    lineHeight: 11,
    color: COLORS.muted,
  },

  commentComposer: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  miniAvatar: {
    width: 31,
    height: 31,
    marginRight: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },

  workerMiniAvatar: {
    backgroundColor: COLORS.purple,
  },

  customerMiniAvatar: {
    backgroundColor: COLORS.orange,
  },

  commentInputWrapper: {
    flex: 1,
    minHeight: 38,
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
    minHeight: 36,
    fontSize: 8,
    color: COLORS.text,
  },

  commentSendButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: COLORS.orange,
  },

  disabledButton: {
    opacity: 0.35,
  },

  workerActions: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 7,
  },

  proposalButton: {
    flex: 1.2,
    minHeight: 39,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 11,
    backgroundColor: COLORS.purple,
  },

  proposalButtonText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  messageCustomerButton: {
    flex: 1,
    minHeight: 39,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#D9D6F3',
    borderRadius: 11,
    backgroundColor: COLORS.purpleSoft,
  },

  messageCustomerText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: COLORS.purple,
  },

  acceptedWorkerBar: {
    marginTop: 10,
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 11,
    backgroundColor: COLORS.successSoft,
  },

  acceptedWorkerTitle: {
    fontSize: 7.8,
    fontWeight: '900',
    color: '#19744B',
  },

  acceptedWorkerText: {
    marginTop: 2,
    fontSize: 6.5,
    color: '#648A75',
  },
});
