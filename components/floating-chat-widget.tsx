import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSession } from '@/contexts/session-context';

export interface ChatMessage {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
  type?: 'text' | 'location' | 'image' | 'system';
  status?: 'sent' | 'delivered' | 'read';
}

export interface ChatConversation {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientRole: string;
  jobTitle: string;
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
  avatarColor: string;
  messages: ChatMessage[];
}

const STORAGE_KEY = 'thikorben_floating_chat_conversations_v2';

const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-rahim',
    recipientId: 'worker-demo-1',
    recipientName: 'Rahim Uddin',
    recipientRole: 'Verified Plumber • 4.9 ★',
    jobTitle: 'Plumbing Leak Fix (Dhanmondi 27)',
    unreadCount: 1,
    lastMessage: 'ঠিক আছে, আমি আর কয়েক মিনিটের মধ্যে পৌঁছাব ইনশাল্লাহ।',
    lastTime: '11:44 AM',
    avatarColor: '#10b981',
    messages: [
      {
        id: 'msg-1',
        sender: 'other',
        text: 'আসসালামু আলাইকুম! আমি আপনার রিকোয়েস্ট পেয়েছি, ধানমন্ডি ২৭ নম্বর রোডের দিকে আসছি।',
        time: '11:42 AM',
        type: 'text',
        status: 'read',
      },
      {
        id: 'msg-2',
        sender: 'me',
        text: 'ওয়ালাইকুম আসসালাম ভাই। মেইন গেইট খোলা আছে, ৩ তলায় উঠুন।',
        time: '11:43 AM',
        type: 'text',
        status: 'read',
      },
      {
        id: 'msg-3',
        sender: 'other',
        text: 'ঠিক আছে, আমি আর কয়েক মিনিটের মধ্যে পৌঁছাব ইনশাল্লাহ। কোনো নির্দিষ্ট টুল লাগবে কি?',
        time: '11:44 AM',
        type: 'text',
        status: 'delivered',
      },
    ],
  },
  {
    id: 'conv-kamal',
    recipientId: 'worker-demo-2',
    recipientName: 'Kamal Hossain',
    recipientRole: 'Electrician • 4.8 ★',
    jobTitle: 'Main Breaker Tripping (Mirpur 10)',
    unreadCount: 0,
    lastMessage: 'সার্কিট ব্রেকারের ছবি দেখতে পেয়েছি, স্পেয়ার পার্টস নিয়ে আসছি।',
    lastTime: 'Yesterday',
    avatarColor: '#f59e0b',
    messages: [
      {
        id: 'msg-k1',
        sender: 'other',
        text: 'আসসালামু আলাইকুম, মেইন সুইচের তারে কোনো পোড়া গন্ধ পেয়েছেন?',
        time: '3:15 PM',
        type: 'text',
        status: 'read',
      },
      {
        id: 'msg-k2',
        sender: 'me',
        text: 'জী হালকা গন্ধ আছে, মাইক্রোওয়েভ চালালেই ট্রিপ করছে।',
        time: '3:18 PM',
        type: 'text',
        status: 'read',
      },
      {
        id: 'msg-k3',
        sender: 'other',
        text: 'সার্কিট ব্রেকারের ছবি দেখতে পেয়েছি, স্পেয়ার পার্টস নিয়ে আসছি।',
        time: '3:20 PM',
        type: 'text',
        status: 'read',
      },
    ],
  },
  {
    id: 'conv-support',
    recipientId: 'support-1',
    recipientName: 'ThiKorben Support',
    recipientRole: 'Customer Help Desk',
    jobTitle: 'Order & Safety Inquiries',
    unreadCount: 0,
    lastMessage: 'আমাদের হেল্পলাইনে যোগাযোগ করার জন্য ধন্যবাদ। যেকোনো সমস্যায় আমরা আছি।',
    lastTime: 'Oct 10',
    avatarColor: '#15157d',
    messages: [
      {
        id: 'msg-s1',
        sender: 'other',
        text: 'ঠিককরবেনে স্বাগতম! আপনার সেবায় কোনো সমস্যা হলে জানান।',
        time: '10:00 AM',
        type: 'text',
        status: 'read',
      },
    ],
  },
];

const QUICK_CHIPS = [
  { label: 'কতক্ষণ লাগবে ভাই?', reply: 'আর ৫-৭ মিনিটের মধ্যে পৌঁছে যাচ্ছি ভাই।' },
  { label: 'দরজার সামনে আছি', reply: 'জী আমি মেইন গেইটে ঢুকছি।' },
  { label: 'গেইটের বেল বাজান', reply: 'ঠিক আছে, বেল বাজাচ্ছি।' },
  { label: 'Flat number?', reply: 'Flat 4B, 4th floor.' },
  { label: 'Call on arrival', reply: 'Sure, I will call as soon as I arrive.' },
];

function getStoredConversations(): ChatConversation[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const data = window.localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {}
  }
  return INITIAL_CONVERSATIONS;
}

function saveConversations(convs: ChatConversation[]) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
    } catch {}
  }
}

let msgSequenceCounter = 200;
function generateMsgId(prefix: string) {
  msgSequenceCounter += 1;
  return `${prefix}-${msgSequenceCounter}`;
}

function getCurrentFormattedTime() {
  const d = new Date();
  const h = d.getHours() % 12 || 12;
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
  return `${h}:${m} ${ampm}`;
}

export function FloatingChatWidget() {
  const router = useRouter();
  const { role } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>(getStoredConversations);
  const [selectedConvId, setSelectedConvId] = useState<string>('conv-rahim');
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const activeConv = conversations.find(c => c.id === selectedConvId) || conversations[0];
  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [isOpen, activeTab, selectedConvId, activeConv.messages.length, isTyping]);

  const handleSelectConv = (convId: string) => {
    setSelectedConvId(convId);
    setActiveTab('chat');
    // Clear unread
    setConversations(prev =>
      prev.map(c => (c.id === convId ? { ...c, unreadCount: 0 } : c)),
    );
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: generateMsgId('msg'),
      sender: 'me',
      text,
      time: getCurrentFormattedTime(),
      type: 'text',
      status: 'sent',
    };

    const updatedMessages = [...activeConv.messages, newMsg];

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConv.id
          ? {
              ...c,
              messages: updatedMessages,
              lastMessage: text,
              lastTime: newMsg.time,
            }
          : c,
      ),
    );

    setInputVal('');

    // Trigger simulated reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyMsg: ChatMessage = {
        id: generateMsgId('reply'),
        sender: 'other',
        text: text.includes('কতক্ষণ')
          ? 'আর ৫ মিনিটের মধ্যে পৌঁছে যাব ভাই।'
          : text.includes('Flat')
          ? 'ধন্যবাদ, আমি লিফট দিয়ে উঠছি।'
          : 'জী বুঝতে পেরেছি, আমি প্রস্তুত আছি।',
        time: getCurrentFormattedTime(),
        type: 'text',
        status: 'delivered',
      };

      setConversations(prev =>
        prev.map(c =>
          c.id === activeConv.id
            ? {
                ...c,
                messages: [...c.messages, replyMsg],
                lastMessage: replyMsg.text,
                lastTime: replyMsg.time,
              }
            : c,
        ),
      );
    }, 1200);
  };

  const handleSendLocation = () => {
    const newMsg: ChatMessage = {
      id: generateMsgId('loc'),
      sender: 'me',
      text: '📍 Shared Location: Road 27, House 42, Dhanmondi, Dhaka',
      time: getCurrentFormattedTime(),
      type: 'location',
      status: 'sent',
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConv.id
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: newMsg.text,
              lastTime: newMsg.time,
            }
          : c,
      ),
    );

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyMsg: ChatMessage = {
        id: generateMsgId('reply'),
        sender: 'other',
        text: 'লোকেশন পেয়েছি, ম্যাপ ধরে এগিয়ে আসছি।',
        time: getCurrentFormattedTime(),
        type: 'text',
      };
      setConversations(prev =>
        prev.map(c =>
          c.id === activeConv.id
            ? {
                ...c,
                messages: [...c.messages, replyMsg],
                lastMessage: replyMsg.text,
                lastTime: replyMsg.time,
              }
            : c,
        ),
      );
    }, 1100);
  };

  const handleSendPhoto = () => {
    const newMsg: ChatMessage = {
      id: generateMsgId('img'),
      sender: 'me',
      text: '📸 Attached: Photo of damaged plumbing pipe & basin joint',
      time: getCurrentFormattedTime(),
      type: 'image',
      status: 'sent',
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConv.id
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: newMsg.text,
              lastTime: newMsg.time,
            }
          : c,
      ),
    );

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyMsg: ChatMessage = {
        id: generateMsgId('reply'),
        sender: 'other',
        text: 'ছবি দেখেছি, টেফলন টেপ ও ওয়্যাশার আমার কাছে আছে। চিন্তা করবেন না।',
        time: getCurrentFormattedTime(),
        type: 'text',
      };
      setConversations(prev =>
        prev.map(c =>
          c.id === activeConv.id
            ? {
                ...c,
                messages: [...c.messages, replyMsg],
                lastMessage: replyMsg.text,
                lastTime: replyMsg.time,
              }
            : c,
        ),
      );
    }, 1300);
  };

  const handleCall = () => {
    const phone = '01712345678';
    if (Platform.OS === 'web') {
      window.open(`tel:${phone}`);
    } else {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const openFullScreen = () => {
    setIsOpen(false);
    router.push({
      pathname: '/chat',
      params: {
        recipientName: activeConv.recipientName,
        recipientRole: activeConv.recipientRole,
        jobTitle: activeConv.jobTitle,
        userRole: role,
      },
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <Pressable
        style={styles.floatingTrigger}
        onPress={() => setIsOpen(true)}
        testID="floating-chat-trigger-button"
        accessibilityLabel="Open Chat Widget"
      >
        <View style={styles.triggerContent}>
          <Ionicons name="chatbubble-ellipses" size={21} color="#ffffff" />
          <Text style={styles.triggerText}>Chat</Text>
        </View>

        {totalUnread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{totalUnread}</Text>
          </View>
        )}
      </Pressable>

      {/* Interactive Chat Modal Drawer */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContainer}
          >
            {/* Widget Top Bar */}
            <View style={styles.widgetHeader}>
              <View style={styles.headerTitleRow}>
                <View style={[styles.avatarBox, { backgroundColor: activeConv.avatarColor }]}>
                  <Text style={styles.avatarText}>{activeConv.recipientName.charAt(0)}</Text>
                </View>

                <View style={styles.headerInfo}>
                  <Text style={styles.recipientNameText} numberOfLines={1}>
                    {activeConv.recipientName}
                  </Text>
                  <View style={styles.statusRow}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.statusText}>{activeConv.recipientRole}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={handleCall}
                  accessibilityLabel="Call Pro"
                >
                  <Ionicons name="call" size={17} color="#15157d" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={openFullScreen}
                  accessibilityLabel="Full Screen"
                >
                  <Ionicons name="expand" size={17} color="#15157d" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.closeBtn]}
                  onPress={() => setIsOpen(false)}
                  accessibilityLabel="Close Chat"
                >
                  <Ionicons name="close" size={18} color="#4b5563" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Conversation Switcher Tabs */}
            <View style={styles.tabsRow}>
              <TouchableOpacity
                testID="floating-chat-tab-chat"
                style={[styles.tabButton, activeTab === 'chat' && styles.tabButtonActive]}
                onPress={() => setActiveTab('chat')}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={15}
                  color={activeTab === 'chat' ? '#15157d' : '#6b7280'}
                />
                <Text
                  style={[styles.tabButtonText, activeTab === 'chat' && styles.tabButtonTextActive]}
                >
                  Live Chat
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="floating-chat-tab-history"
                style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
                onPress={() => setActiveTab('history')}
              >
                <Ionicons
                  name="time-outline"
                  size={15}
                  color={activeTab === 'history' ? '#15157d' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'history' && styles.tabButtonTextActive,
                  ]}
                >
                  Recent History ({conversations.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* View 1: History / Recent Chats List */}
            {activeTab === 'history' ? (
              <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionHeading}>Active Conversations</Text>
                {conversations.map(conv => {
                  const isSelected = conv.id === selectedConvId;
                  return (
                    <TouchableOpacity
                      key={conv.id}
                      testID={`floating-chat-conv-${conv.id}`}
                      style={[styles.convCard, isSelected && styles.convCardSelected]}
                      onPress={() => handleSelectConv(conv.id)}
                    >
                      <View style={[styles.convAvatar, { backgroundColor: conv.avatarColor }]}>
                        <Text style={styles.convAvatarText}>{conv.recipientName.charAt(0)}</Text>
                      </View>

                      <View style={styles.convDetails}>
                        <View style={styles.convTop}>
                          <Text style={styles.convName}>{conv.recipientName}</Text>
                          <Text style={styles.convTime}>{conv.lastTime}</Text>
                        </View>
                        <Text style={styles.convJob} numberOfLines={1}>
                          {conv.jobTitle}
                        </Text>
                        <Text style={styles.convSnippet} numberOfLines={1}>
                          {conv.lastMessage}
                        </Text>
                      </View>

                      {conv.unreadCount > 0 && (
                        <View style={styles.convBadge}>
                          <Text style={styles.convBadgeText}>{conv.unreadCount}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              /* View 2: Active Chat Thread */
              <View style={styles.chatBody}>
                {/* Job Title Bar */}
                <View style={styles.jobContextBar}>
                  <MaterialCommunityIcons name="tools" size={15} color="#ea580c" />
                  <Text style={styles.jobContextText} numberOfLines={1}>
                    {activeConv.jobTitle}
                  </Text>
                </View>

                {/* Messages List */}
                <FlatList
                  ref={flatListRef}
                  data={activeConv.messages}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.messagesContent}
                  renderItem={({ item }) => {
                    const isMe = item.sender === 'me';
                    return (
                      <View
                        style={[
                          styles.msgRow,
                          isMe ? styles.msgRowMe : styles.msgRowOther,
                        ]}
                      >
                        {!isMe && (
                          <View
                            style={[
                              styles.miniAvatar,
                              { backgroundColor: activeConv.avatarColor },
                            ]}
                          >
                            <Text style={styles.miniAvatarText}>
                              {activeConv.recipientName.charAt(0)}
                            </Text>
                          </View>
                        )}

                        <View
                          style={[
                            styles.bubble,
                            isMe ? styles.bubbleMe : styles.bubbleOther,
                            item.type === 'location' && styles.bubbleLocation,
                            item.type === 'image' && styles.bubbleImage,
                          ]}
                        >
                          {item.type === 'location' && (
                            <View style={styles.attachmentBadge}>
                              <Ionicons name="location" size={14} color="#ffffff" />
                              <Text style={styles.attachmentBadgeText}>GPS Pin</Text>
                            </View>
                          )}

                          {item.type === 'image' && (
                            <View style={styles.attachmentBadge}>
                              <Ionicons name="image" size={14} color="#ffffff" />
                              <Text style={styles.attachmentBadgeText}>Photo</Text>
                            </View>
                          )}

                          <Text
                            style={[
                              styles.bubbleText,
                              isMe ? styles.bubbleTextMe : styles.bubbleTextOther,
                            ]}
                          >
                            {item.text}
                          </Text>

                          <View style={styles.bubbleFooter}>
                            <Text
                              style={[
                                styles.timeText,
                                isMe ? styles.timeTextMe : styles.timeTextOther,
                              ]}
                            >
                              {item.time}
                            </Text>
                            {isMe && (
                              <Ionicons name="checkmark-done" size={13} color="#93c5fd" />
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  }}
                  ListFooterComponent={
                    isTyping ? (
                      <View style={styles.typingContainer}>
                        <View style={styles.typingBubble}>
                          <Text style={styles.typingText}>
                            {activeConv.recipientName} is typing...
                          </Text>
                        </View>
                      </View>
                    ) : null
                  }
                />

                {/* Quick Chips Scroll */}
                <View style={styles.quickChipsWrapper}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickChipsRow}
                  >
                    {QUICK_CHIPS.map((chip, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.chip}
                        onPress={() => handleSendMessage(chip.label)}
                      >
                        <Text style={styles.chipText}>{chip.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Input Bar */}
                <View style={styles.inputBar}>
                  <TouchableOpacity
                    style={styles.mediaButton}
                    onPress={handleSendLocation}
                    accessibilityLabel="Share GPS Pin"
                  >
                    <Ionicons name="location-outline" size={20} color="#ea580c" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.mediaButton}
                    onPress={handleSendPhoto}
                    accessibilityLabel="Share Photo"
                  >
                    <Ionicons name="camera-outline" size={20} color="#10b981" />
                  </TouchableOpacity>

                  <TextInput
                    testID="floating-chat-input"
                    style={styles.textInput}
                    placeholder="Type a message..."
                    placeholderTextColor="#9ca3af"
                    value={inputVal}
                    onChangeText={setInputVal}
                    onSubmitEditing={() => handleSendMessage()}
                    returnKeyType="send"
                  />

                  <TouchableOpacity
                    testID="floating-chat-send-btn"
                    style={[
                      styles.sendButton,
                      !inputVal.trim() && styles.sendButtonDisabled,
                    ]}
                    onPress={() => handleSendMessage()}
                    disabled={!inputVal.trim()}
                    accessibilityLabel="Send Message"
                  >
                    <Ionicons name="send" size={17} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingTrigger: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    zIndex: 9990,
    backgroundColor: '#15157d',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#15157d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  triggerText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  unreadBadge: {
    marginLeft: 6,
    backgroundColor: '#ea580c',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 520,
    height: '88%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  widgetHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
  },
  recipientNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    backgroundColor: '#fee2e2',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f5',
    backgroundColor: '#f9fafb',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 2,
    borderBottomColor: '#15157d',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabButtonTextActive: {
    color: '#15157d',
    fontWeight: '800',
  },
  historyList: {
    flex: 1,
    padding: 14,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  convCardSelected: {
    backgroundColor: '#ede9fe',
    borderColor: '#c4b5fd',
  },
  convAvatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  convAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  convDetails: {
    flex: 1,
  },
  convTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  convTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
  convJob: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '600',
    marginTop: 1,
  },
  convSnippet: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  convBadge: {
    backgroundColor: '#ea580c',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  convBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  chatBody: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  jobContextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#fff7ed',
    borderBottomWidth: 1,
    borderBottomColor: '#fed7aa',
  },
  jobContextText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#c2410c',
    flex: 1,
  },
  messagesContent: {
    padding: 14,
    paddingBottom: 8,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  msgRowMe: {
    justifyContent: 'flex-end',
  },
  msgRowOther: {
    justifyContent: 'flex-start',
  },
  miniAvatar: {
    width: 26,
    height: 26,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  miniAvatarText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 18,
  },
  bubbleMe: {
    backgroundColor: '#15157d',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bubbleLocation: {
    backgroundColor: '#c2410c',
  },
  bubbleImage: {
    backgroundColor: '#047857',
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  attachmentBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  bubbleText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  bubbleTextMe: {
    color: '#ffffff',
  },
  bubbleTextOther: {
    color: '#1f2937',
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    fontSize: 9.5,
  },
  timeTextMe: {
    color: '#cbd5e1',
  },
  timeTextOther: {
    color: '#9ca3af',
  },
  typingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typingBubble: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  typingText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#4b5563',
  },
  quickChipsWrapper: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f1f5',
    paddingVertical: 7,
  },
  quickChipsRow: {
    paddingHorizontal: 12,
    gap: 6,
  },
  chip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f1f5',
  },
  mediaButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f1f5',
  },
  textInput: {
    flex: 1,
    minHeight: 38,
    maxHeight: 80,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 18,
    paddingHorizontal: 12,
    fontSize: 12.5,
    color: '#111827',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#15157d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
});
