import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
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
  warningSoft: '#FFF8E7',

  softGray: '#F1F2F6',
};

type Role = 'customer' | 'worker';

type Sender = Role | 'system';

type ChatMessage = {
  id: string;
  sender: Sender;
  text: string;
  time: string;
  materials?: string[];
};

const MATERIAL_KEYWORDS = [
  {
    keyword: 'connector',
    label: 'PVC Connector',
  },
  {
    keyword: 'teflon',
    label: 'Teflon Tape',
  },
  {
    keyword: 'tape',
    label: 'Teflon Tape',
  },
  {
    keyword: 'washer',
    label: 'Rubber Washer',
  },
  {
    keyword: 'pipe',
    label: 'PVC Pipe',
  },
  {
    keyword: 'valve',
    label: 'Water Valve',
  },
  {
    keyword: 'faucet',
    label: 'Faucet',
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    sender: 'system',
    text: 'Rahim Ahmed’s proposal was accepted. You can now communicate privately about this job.',
    time: '5:42 PM',
  },
  {
    id: '2',
    sender: 'customer',
    text: 'Hello Rahim, thank you. The leak is under the kitchen sink.',
    time: '5:43 PM',
  },
  {
    id: '3',
    sender: 'worker',
    text: 'Thank you. I can come today after 6 PM and inspect the connection first.',
    time: '5:44 PM',
  },
  {
    id: '4',
    sender: 'customer',
    text: 'Okay. Do you think any materials will be needed?',
    time: '5:45 PM',
  },
];

const CUSTOMER_QUICK_REPLIES = [
  'Okay, please proceed.',
  'What materials are needed?',
  'When can you arrive?',
];

const WORKER_QUICK_REPLIES = [
  'I can arrive in 30 minutes.',
  'I will inspect it first.',
  'You may need a 1/2 inch PVC connector and Teflon tape.',
];

function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function detectMaterials(text: string) {
  const lowerText = text.toLowerCase();

  const matches = MATERIAL_KEYWORDS.filter(item =>
    lowerText.includes(item.keyword),
  ).map(item => item.label);

  return [...new Set(matches)];
}

type RoleSwitcherProps = {
  role: Role;
  onChange: (role: Role) => void;
};

function RoleSwitcher({ role, onChange }: RoleSwitcherProps) {
  return (
    <View style={styles.roleSwitcher}>
      <Pressable
        onPress={() => onChange('customer')}
        style={[
          styles.roleOption,
          role === 'customer' && styles.customerRoleActive,
        ]}
      >
        <Ionicons
          name={role === 'customer' ? 'person' : 'person-outline'}
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
        onPress={() => onChange('worker')}
        style={[
          styles.roleOption,
          role === 'worker' && styles.workerRoleActive,
        ]}
      >
        <Ionicons
          name={role === 'worker' ? 'construct' : 'construct-outline'}
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

type MessageBubbleProps = {
  message: ChatMessage;
  onProductHook: (materials: string[]) => void;
};

function MessageBubble({ message, onProductHook }: MessageBubbleProps) {
  if (message.sender === 'system') {
    return (
      <View style={styles.systemMessage}>
        <View style={styles.systemIcon}>
          <Ionicons name="shield-checkmark" size={15} color={COLORS.success} />
        </View>

        <View style={styles.systemContent}>
          <Text style={styles.systemText}>{message.text}</Text>

          <Text style={styles.systemTime}>{message.time}</Text>
        </View>
      </View>
    );
  }

  const isCustomer = message.sender === 'customer';

  const hasMaterials = Boolean(message.materials?.length);

  return (
    <View
      style={[
        styles.messageRow,
        isCustomer ? styles.messageCustomerRow : styles.messageWorkerRow,
      ]}
    >
      {!isCustomer && (
        <View style={styles.smallWorkerAvatar}>
          <Text style={styles.smallAvatarText}>RA</Text>
        </View>
      )}

      <View
        style={[
          styles.messageBubble,
          isCustomer ? styles.customerBubble : styles.workerBubble,
        ]}
      >
        <View style={styles.messageSenderRow}>
          <Text
            style={[
              styles.messageSender,
              isCustomer
                ? styles.customerMessageText
                : styles.workerMessageText,
            ]}
          >
            {isCustomer ? 'Nusrat' : 'Rahim'}
          </Text>

          {!isCustomer && (
            <Ionicons name="checkmark-circle" size={13} color="#DCD9FF" />
          )}
        </View>

        <Text
          style={[
            styles.messageText,
            isCustomer ? styles.customerMessageText : styles.workerMessageText,
          ]}
        >
          {message.text}
        </Text>

        {hasMaterials && (
          <Pressable
            onPress={() => onProductHook(message.materials ?? [])}
            style={[
              styles.materialMention,
              isCustomer
                ? styles.customerMaterialMention
                : styles.workerMaterialMention,
            ]}
          >
            <Ionicons
              name="sparkles"
              size={13}
              color={isCustomer ? COLORS.orangeDark : '#FFFFFF'}
            />

            <View style={styles.materialMentionText}>
              <Text
                style={[
                  styles.materialMentionTitle,
                  {
                    color: isCustomer ? COLORS.orangeDark : '#FFFFFF',
                  },
                ]}
              >
                Product mention detected
              </Text>

              <Text
                numberOfLines={1}
                style={[
                  styles.materialMentionItems,
                  {
                    color: isCustomer ? '#9A5A2C' : '#DDD9FF',
                  },
                ]}
              >
                {message.materials?.join(' • ')}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={14}
              color={isCustomer ? COLORS.orangeDark : '#FFFFFF'}
            />
          </Pressable>
        )}

        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.messageTime,
              {
                color: isCustomer ? '#B56D38' : '#CCC8F2',
              },
            ]}
          >
            {message.time}
          </Text>

          <Ionicons
            name="checkmark-done"
            size={13}
            color={isCustomer ? COLORS.orangeDark : '#DDD9FF'}
          />
        </View>
      </View>

      {isCustomer && (
        <View style={styles.smallCustomerAvatar}>
          <Text style={styles.smallAvatarText}>NJ</Text>
        </View>
      )}
    </View>
  );
}

export default function JobChatScreen() {
  const scrollRef = useRef<ScrollView>(null);

  const [role, setRole] = useState<Role>('customer');

  const [draft, setDraft] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  const [detectedMaterials, setDetectedMaterials] = useState<string[]>([]);

  const entranceOpacity = useRef(new Animated.Value(0)).current;

  const entranceTranslate = useRef(new Animated.Value(15)).current;

  const onlinePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entranceOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      Animated.spring(entranceTranslate, {
        toValue: 0,
        friction: 7,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(onlinePulse, {
          toValue: 1.4,
          duration: 850,
          useNativeDriver: true,
        }),

        Animated.timing(onlinePulse, {
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
  }, [entranceOpacity, entranceTranslate, onlinePulse]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollToEnd({
        animated: true,
      });
    }, 120);

    return () => clearTimeout(timeout);
  }, [messages]);

  const addMessage = (customText?: string) => {
    const text = (customText ?? draft).trim();

    if (!text) {
      return;
    }

    const materials = detectMaterials(text);

    const message: ChatMessage = {
      id: `${Date.now()}`,
      sender: role,
      text,
      time: getCurrentTime(),
      materials: materials.length > 0 ? materials : undefined,
    };

    setMessages(current => [...current, message]);

    if (materials.length > 0) {
      setDetectedMaterials(current => [...new Set([...current, ...materials])]);
    }

    setDraft('');
  };

  const quickReplies =
    role === 'customer' ? CUSTOMER_QUICK_REPLIES : WORKER_QUICK_REPLIES;

  const openProductHook = (materials: string[]) => {
    Alert.alert(
      'AI Product Recommendation',
      `Detected: ${materials.join(
        ', ',
      )}\n\nIn the next milestone, ThiKorben AI will match these terms with exact products from the shop, including price, warranty and Add to Cart.`,
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.appShell}>
            {/* Header */}
            <View style={styles.header}>
              <Pressable
                onPress={() => router.back()}
                style={styles.headerButton}
              >
                <Ionicons name="arrow-back" size={20} color={COLORS.text} />
              </Pressable>

              <View style={styles.workerHeader}>
                <View style={styles.headerAvatar}>
                  <Text style={styles.headerAvatarText}>RA</Text>

                  <View style={styles.onlineWrapper}>
                    <Animated.View
                      style={[
                        styles.onlinePulse,
                        {
                          transform: [
                            {
                              scale: onlinePulse,
                            },
                          ],
                          opacity: onlinePulse.interpolate({
                            inputRange: [1, 1.4],
                            outputRange: [0.5, 0.05],
                          }),
                        },
                      ]}
                    />

                    <View style={styles.onlineDot} />
                  </View>
                </View>

                <View>
                  <View style={styles.workerNameRow}>
                    <Text style={styles.workerName}>Rahim Ahmed</Text>

                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={COLORS.orange}
                    />
                  </View>

                  <Text style={styles.workerStatus}>
                    Online • Expert Plumber
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() =>
                  Alert.alert('Call Worker', 'Calling Rahim Ahmed...')
                }
                style={styles.callButton}
              >
                <Ionicons name="call-outline" size={18} color={COLORS.purple} />
              </Pressable>
            </View>

            <Animated.View
              style={[
                styles.content,
                {
                  opacity: entranceOpacity,
                  transform: [
                    {
                      translateY: entranceTranslate,
                    },
                  ],
                },
              ]}
            >
              {/* Job context */}
              <View style={styles.jobContext}>
                <View style={styles.jobContextTop}>
                  <View style={styles.jobContextIcon}>
                    <Ionicons
                      name="water-outline"
                      size={18}
                      color={COLORS.orange}
                    />
                  </View>

                  <View style={styles.jobContextInfo}>
                    <Text style={styles.jobContextLabel}>ACTIVE JOB</Text>

                    <Text numberOfLines={1} style={styles.jobContextTitle}>
                      Kitchen Sink Pipe Leakage
                    </Text>
                  </View>

                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        'Job Details',
                        'Kitchen Sink Pipe Leakage\nDhanmondi 8/A, Dhaka\nAgreed labor: ৳700',
                      )
                    }
                    style={styles.jobDetailsButton}
                  >
                    <Text style={styles.jobDetailsText}>Details</Text>

                    <Ionicons
                      name="chevron-forward"
                      size={13}
                      color={COLORS.purple}
                    />
                  </Pressable>
                </View>

                <View style={styles.jobContextStats}>
                  <View style={styles.contextStat}>
                    <Ionicons
                      name="wallet-outline"
                      size={14}
                      color={COLORS.orange}
                    />

                    <View>
                      <Text style={styles.contextStatLabel}>Agreed labor</Text>

                      <Text style={styles.contextStatValue}>৳700</Text>
                    </View>
                  </View>

                  <View style={styles.contextDivider} />

                  <View style={styles.contextStat}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={COLORS.purple}
                    />

                    <View>
                      <Text style={styles.contextStatLabel}>Schedule</Text>

                      <Text style={styles.contextStatValue}>Today, 6 PM</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Demo Role */}
              <View style={styles.demoArea}>
                <View>
                  <Text style={styles.demoLabel}>Demo conversation as</Text>

                  <Text style={styles.demoHint}>
                    Switch sides to test both users
                  </Text>
                </View>

                <RoleSwitcher role={role} onChange={setRole} />
              </View>

              {/* Detected materials */}
              {detectedMaterials.length > 0 && (
                <Pressable
                  onPress={() => openProductHook(detectedMaterials)}
                  style={styles.aiDetectionCard}
                >
                  <View style={styles.aiIcon}>
                    <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                  </View>

                  <View style={styles.aiContent}>
                    <Text style={styles.aiTitle}>
                      Material mention detected
                    </Text>

                    <Text numberOfLines={1} style={styles.aiDescription}>
                      {detectedMaterials.join(' • ')}
                    </Text>
                  </View>

                  <View style={styles.aiBadge}>
                    <Text style={styles.aiBadgeText}>AI READY</Text>
                  </View>
                </Pressable>
              )}

              {/* Messages */}
              <ScrollView
                ref={scrollRef}
                style={styles.messages}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.dateDivider}>
                  <View style={styles.dateLine} />

                  <Text style={styles.dateText}>Today</Text>

                  <View style={styles.dateLine} />
                </View>

                {messages.map(message => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onProductHook={openProductHook}
                  />
                ))}
              </ScrollView>

              {/* Quick Replies */}
              <View style={styles.quickReplyArea}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.quickReplyContent}
                >
                  {quickReplies.map(reply => (
                    <Pressable
                      key={reply}
                      onPress={() => addMessage(reply)}
                      style={styles.quickReply}
                    >
                      <Ionicons
                        name="flash-outline"
                        size={12}
                        color={COLORS.purple}
                      />

                      <Text numberOfLines={1} style={styles.quickReplyText}>
                        {reply}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Composer */}
              <View style={styles.composer}>
                <Pressable
                  onPress={() =>
                    Alert.alert(
                      'Attachment',
                      'Image and document attachments can be connected later.',
                    )
                  }
                  style={styles.attachmentButton}
                >
                  <Ionicons name="add" size={22} color={COLORS.purple} />
                </Pressable>

                <View style={styles.inputWrapper}>
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    placeholder={
                      role === 'customer'
                        ? 'Message Rahim...'
                        : 'Message Nusrat...'
                    }
                    placeholderTextColor="#A2A6B3"
                    multiline
                    style={styles.input}
                  />
                </View>

                <Pressable
                  onPress={() => addMessage()}
                  disabled={!draft.trim()}
                  style={[
                    styles.sendButton,
                    !draft.trim() && styles.sendButtonDisabled,
                  ]}
                >
                  <Ionicons name="send" size={17} color="#FFFFFF" />
                </Pressable>
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E9ECF3',
  },

  keyboardContainer: {
    flex: 1,
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
    paddingHorizontal: 10,

    flexDirection: 'row',
    alignItems: 'center',

    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,

    backgroundColor: COLORS.card,
  },

  headerButton: {
    width: 38,
    height: 38,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,
  },

  workerHeader: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',
  },

  headerAvatar: {
    width: 39,
    height: 39,
    marginRight: 9,

    position: 'relative',

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 13,

    backgroundColor: COLORS.purple,
  },

  headerAvatarText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  onlineWrapper: {
    position: 'absolute',
    right: -3,
    bottom: -2,

    width: 15,
    height: 15,

    alignItems: 'center',
    justifyContent: 'center',
  },

  onlinePulse: {
    position: 'absolute',

    width: 13,
    height: 13,

    borderRadius: 7,

    backgroundColor: COLORS.success,
  },

  onlineDot: {
    width: 8,
    height: 8,

    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 5,

    backgroundColor: COLORS.success,
  },

  workerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 3,
  },

  workerName: {
    fontSize: 11.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  workerStatus: {
    marginTop: 2,

    fontSize: 8.5,
    color: COLORS.success,
  },

  callButton: {
    width: 38,
    height: 38,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: COLORS.purpleSoft,
  },

  content: {
    flex: 1,
  },

  jobContext: {
    marginHorizontal: 12,
    marginTop: 10,

    padding: 11,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,

    backgroundColor: COLORS.card,
  },

  jobContextTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  jobContextIcon: {
    width: 38,
    height: 38,
    marginRight: 9,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 11,

    backgroundColor: COLORS.orangeSoft,
  },

  jobContextInfo: {
    flex: 1,
  },

  jobContextLabel: {
    marginBottom: 2,

    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.6,

    color: COLORS.success,
  },

  jobContextTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  jobDetailsButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 9,

    backgroundColor: COLORS.purpleSoft,
  },

  jobDetailsText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.purple,
  },

  jobContextStats: {
    marginTop: 10,
    paddingTop: 9,

    flexDirection: 'row',
    alignItems: 'center',

    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  contextStat: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 6,
  },

  contextStatLabel: {
    fontSize: 7.5,
    color: COLORS.muted,
  },

  contextStatValue: {
    marginTop: 1,

    fontSize: 9,
    fontWeight: '900',
    color: COLORS.text,
  },

  contextDivider: {
    width: 1,
    height: 27,
    marginHorizontal: 10,

    backgroundColor: COLORS.border,
  },

  demoArea: {
    marginHorizontal: 12,
    marginTop: 8,

    padding: 8,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderRadius: 13,

    backgroundColor: '#EEF0F5',
  },

  demoLabel: {
    fontSize: 8.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  demoHint: {
    marginTop: 1,

    fontSize: 7,
    color: COLORS.muted,
  },

  roleSwitcher: {
    padding: 3,

    flexDirection: 'row',

    borderRadius: 10,

    backgroundColor: '#FFFFFF',
  },

  roleOption: {
    minHeight: 31,
    paddingHorizontal: 9,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 4,

    borderRadius: 8,
  },

  customerRoleActive: {
    backgroundColor: COLORS.orange,
  },

  workerRoleActive: {
    backgroundColor: COLORS.purple,
  },

  roleText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.muted,
  },

  roleTextActive: {
    color: '#FFFFFF',
  },

  aiDetectionCard: {
    marginHorizontal: 12,
    marginTop: 8,
    padding: 9,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 13,

    backgroundColor: COLORS.purple,
  },

  aiIcon: {
    width: 32,
    height: 32,
    marginRight: 8,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 10,

    backgroundColor: 'rgba(255,255,255,0.14)',
  },

  aiContent: {
    flex: 1,
  },

  aiTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  aiDescription: {
    marginTop: 2,

    fontSize: 7.5,
    color: '#DDD9FF',
  },

  aiBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,

    borderRadius: 999,

    backgroundColor: COLORS.orange,
  },

  aiBadgeText: {
    fontSize: 6.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  messages: {
    flex: 1,
    marginTop: 5,
  },

  messagesContent: {
    paddingHorizontal: 12,
    paddingTop: 7,
    paddingBottom: 10,
  },

  dateDivider: {
    marginVertical: 8,

    flexDirection: 'row',
    alignItems: 'center',
  },

  dateLine: {
    flex: 1,
    height: 1,

    backgroundColor: COLORS.border,
  },

  dateText: {
    marginHorizontal: 8,

    fontSize: 7.5,
    color: COLORS.muted,
  },

  systemMessage: {
    marginBottom: 12,
    padding: 9,

    flexDirection: 'row',
    alignItems: 'flex-start',

    borderRadius: 12,

    backgroundColor: COLORS.successSoft,
  },

  systemIcon: {
    width: 29,
    height: 29,
    marginRight: 8,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 9,

    backgroundColor: '#FFFFFF',
  },

  systemContent: {
    flex: 1,
  },

  systemText: {
    fontSize: 8.5,
    lineHeight: 13,

    color: '#417158',
  },

  systemTime: {
    marginTop: 3,

    fontSize: 6.5,
    color: '#799887',
  },

  messageRow: {
    marginBottom: 9,

    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  messageCustomerRow: {
    justifyContent: 'flex-end',
  },

  messageWorkerRow: {
    justifyContent: 'flex-start',
  },

  messageBubble: {
    maxWidth: '78%',

    paddingHorizontal: 11,
    paddingVertical: 9,

    borderRadius: 15,
  },

  customerBubble: {
    borderBottomRightRadius: 4,

    backgroundColor: COLORS.orangeSoft,
  },

  workerBubble: {
    borderBottomLeftRadius: 4,

    backgroundColor: COLORS.purple,
  },

  messageSenderRow: {
    marginBottom: 4,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 3,
  },

  messageSender: {
    fontSize: 7.5,
    fontWeight: '900',
  },

  messageText: {
    fontSize: 9.5,
    lineHeight: 15,
  },

  customerMessageText: {
    color: '#7D431E',
  },

  workerMessageText: {
    color: '#FFFFFF',
  },

  smallWorkerAvatar: {
    width: 27,
    height: 27,
    marginRight: 6,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 9,

    backgroundColor: COLORS.purple,
  },

  smallCustomerAvatar: {
    width: 27,
    height: 27,
    marginLeft: 6,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 9,

    backgroundColor: COLORS.orange,
  },

  smallAvatarText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  materialMention: {
    marginTop: 8,
    padding: 7,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 6,

    borderRadius: 9,
  },

  customerMaterialMention: {
    backgroundColor: '#FFFFFF',
  },

  workerMaterialMention: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  materialMentionText: {
    flex: 1,
  },

  materialMentionTitle: {
    fontSize: 7.5,
    fontWeight: '900',
  },

  materialMentionItems: {
    marginTop: 1,

    fontSize: 6.5,
  },

  messageFooter: {
    marginTop: 5,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',

    gap: 3,
  },

  messageTime: {
    fontSize: 6.5,
  },

  quickReplyArea: {
    minHeight: 42,

    justifyContent: 'center',

    borderTopWidth: 1,
    borderTopColor: COLORS.border,

    backgroundColor: COLORS.card,
  },

  quickReplyContent: {
    paddingHorizontal: 10,

    gap: 6,
  },

  quickReply: {
    maxWidth: 200,
    minHeight: 30,

    paddingHorizontal: 9,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,

    borderWidth: 1,
    borderColor: '#DCD9F0',
    borderRadius: 999,

    backgroundColor: COLORS.purpleSoft,
  },

  quickReplyText: {
    maxWidth: 165,

    fontSize: 7.5,
    fontWeight: '700',

    color: COLORS.purple,
  },

  composer: {
    minHeight: 63,
    paddingHorizontal: 10,
    paddingVertical: 8,

    flexDirection: 'row',
    alignItems: 'flex-end',

    borderTopWidth: 1,
    borderTopColor: COLORS.border,

    backgroundColor: COLORS.card,
  },

  attachmentButton: {
    width: 40,
    height: 40,
    marginRight: 6,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: COLORS.purpleSoft,
  },

  inputWrapper: {
    flex: 1,
    minHeight: 40,
    maxHeight: 95,

    paddingHorizontal: 11,

    justifyContent: 'center',

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,

    backgroundColor: '#F8F8FB',
  },

  input: {
    maxHeight: 85,

    paddingVertical: 9,

    fontSize: 9.5,
    color: COLORS.text,
  },

  sendButton: {
    width: 40,
    height: 40,
    marginLeft: 6,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: COLORS.orange,
  },

  sendButtonDisabled: {
    opacity: 0.35,
  },
});
