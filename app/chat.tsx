import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
  type?: 'text' | 'location' | 'image' | 'system';
  status?: 'sent' | 'delivered' | 'read';
}

const QUICK_CHIPS = [
  { label: 'কতক্ষণ লাগবে ভাই?', reply: 'আর ৫-৭ মিনিটের মধ্যে পৌঁছে যাচ্ছি ভাই।' },
  { label: 'দরজার সামনে আছি', reply: 'জী আমি মেইন গেইটে ঢুকছি।' },
  { label: 'গেইটের বেল বাজান', reply: 'ঠিক আছে, বেল বাজাচ্ছি।' },
  { label: 'Plat / Flat number?', reply: 'Flat 4B, 4th floor.' },
  { label: 'Call me on arrival', reply: 'Sure, I will call as soon as I arrive.' },
];

let msgSequence = 10;
function createMessageId(prefix: string) {
  msgSequence += 1;
  return `${prefix}_${msgSequence}`;
}

function getCurrentFormattedTime() {
  const d = new Date();
  const h = d.getHours() % 12 || 12;
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
  return `${h}:${m} ${ampm}`;
}

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    recipientName?: string;
    recipientRole?: string;
    jobTitle?: string;
    userRole?: string;
  }>();

  const recipientName = params.recipientName || 'Rahim Uddin';
  const recipientRole = params.recipientRole || 'Plumber • 4.9 ★';
  const jobTitle = params.jobTitle || 'Plumbing Leak Fix (Dhanmondi 27)';
  const isWorker = params.userRole === 'worker';

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'other',
      text: 'আসসালামু আলাইকুম! আমি আপনার রিকোয়েস্ট পেয়েছি, ধানমন্ডি ২৭ নম্বর রোডের দিকে আসছি।',
      time: '11:42 AM',
      type: 'text',
      status: 'read',
    },
    {
      id: 'm2',
      sender: 'me',
      text: 'ওয়ালাইকুম আসসালাম ভাই। মেইন গেইট খোলা আছে, ৩ তলায় উঠুন।',
      time: '11:43 AM',
      type: 'text',
      status: 'read',
    },
    {
      id: 'm3',
      sender: 'other',
      text: 'ঠিক আছে, আমি আর কয়েক মিনিটের মধ্যে পৌঁছাব ইনশাল্লাহ। কোনো নির্দিষ্ট টুল লাগবে কি?',
      time: '11:44 AM',
      type: 'text',
      status: 'read',
    },
  ]);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom when messages update
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages, isTyping]);

  const handleSend = (customText?: string) => {
    const textToSend = (customText || inputVal).trim();
    if (!textToSend) return;

    const currentTime = getCurrentFormattedTime();

    const newMsg: Message = {
      id: createMessageId('msg'),
      sender: 'me',
      text: textToSend,
      time: currentTime,
      type: 'text',
      status: 'sent',
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!customText) setInputVal('');

    // Simulate other participant typing & auto-replying
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);

      // Context-aware auto reply
      let replyText = 'জী ভাই, বুঝতে পেরেছি। আমি ঠিক সময়ে পৌঁছে যাব।';
      const matchedChip = QUICK_CHIPS.find((c) => c.label === textToSend);
      if (matchedChip) {
        replyText = matchedChip.reply;
      } else if (textToSend.toLowerCase().includes('location') || textToSend.includes('কোথায়')) {
        replyText = 'আমি ধানমন্ডি ২৭ এর মোড়ে আছি, জ্যাম কম আছে।';
      } else if (textToSend.toLowerCase().includes('bill') || textToSend.includes('টাকা') || textToSend.includes('price')) {
        replyText = 'কাজের পরিদর্শন শেষে ফিক্সড রেট অনুযায়ী ৳৫00 চার্জ হবে।';
      }

      const replyMsg: Message = {
        id: createMessageId('reply'),
        sender: 'other',
        text: replyText,
        time: getCurrentFormattedTime(),
        type: 'text',
      };

      setMessages((prev) => [...prev, replyMsg]);
    }, 1400);
  };

  const handleSendLocation = () => {
    const currentTime = getCurrentFormattedTime();
    const locMsg: Message = {
      id: createMessageId('loc'),
      sender: 'me',
      text: '📍 Live Location Shared: House 42, Road 11/A, Dhanmondi, Dhaka',
      time: currentTime,
      type: 'location',
      status: 'sent',
    };
    setMessages((prev) => [...prev, locMsg]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId('reply'),
          sender: 'other',
          text: 'লোকেশন পেয়েছি ভাই, গুগল ম্যাপ ফলো করে আসছি।',
          time: getCurrentFormattedTime(),
          type: 'text',
        },
      ]);
    }, 1200);
  };

  const handleSendPhoto = () => {
    const currentTime = getCurrentFormattedTime();
    const imgMsg: Message = {
      id: createMessageId('img'),
      sender: 'me',
      text: '📸 Attached: Photo of pipe leak under the sink',
      time: currentTime,
      type: 'image',
      status: 'sent',
    };
    setMessages((prev) => [...prev, imgMsg]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId('reply'),
          sender: 'other',
          text: 'ছবি দেখেছি, প্রয়োজনীয় টেফলন টেপ ও রেঞ্চ আমার সাথে আছে। চিন্তা করবেন না।',
          time: getCurrentFormattedTime(),
          type: 'text',
        },
      ]);
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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push(isWorker ? '/worker-dashboard' : '/track-worker');
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isMe = item.sender === 'me';

    return (
      <View
        style={[
          styles.msgRow,
          isMe ? styles.msgRowMe : styles.msgRowOther,
        ]}>
        {!isMe && (
          <View style={styles.avatarMini}>
            <Text style={styles.avatarMiniText}>
              {recipientName.charAt(0)}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleOther,
            item.type === 'location' && styles.bubbleLocation,
            item.type === 'image' && styles.bubbleImage,
          ]}>
          {item.type === 'location' && (
            <View style={styles.badgeLocationRow}>
              <Ionicons name="location" size={16} color="#ffffff" />
              <Text style={styles.badgeLocationText}>GPS Pin</Text>
            </View>
          )}

          {item.type === 'image' && (
            <View style={styles.badgeImageRow}>
              <MaterialCommunityIcons name="image" size={16} color="#ffffff" />
              <Text style={styles.badgeImageText}>Photo Attachment</Text>
            </View>
          )}

          <Text
            style={[
              styles.msgText,
              isMe ? styles.msgTextMe : styles.msgTextOther,
            ]}>
            {item.text}
          </Text>

          <View style={styles.msgFooter}>
            <Text
              style={[
                styles.timeText,
                isMe ? styles.timeTextMe : styles.timeTextOther,
              ]}>
              {item.time}
            </Text>
            {isMe && (
              <Ionicons
                name="checkmark-done"
                size={14}
                color="#60a5fa"
                style={styles.checkIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* ── Top Header Bar ── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={24} color="#15157d" />
          </TouchableOpacity>

          <View style={styles.headerInfoCol}>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerName} numberOfLines={1}>
                {recipientName}
              </Text>
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            </View>
            <Text style={styles.headerRole} numberOfLines={1}>
              {recipientRole}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={handleCall}
              activeOpacity={0.8}
              accessibilityLabel="Call via phone">
              <Ionicons name="call" size={18} color="#15157d" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => router.push('/track-worker')}
              activeOpacity={0.8}
              accessibilityLabel="Track on map">
              <Ionicons name="map" size={18} color="#F7941D" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Active Service Context Banner ── */}
        <View style={styles.serviceContextBanner}>
          <MaterialCommunityIcons name="tools" size={15} color="#15157d" />
          <Text style={styles.serviceContextText} numberOfLines={1}>
            {jobTitle}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/track-worker')}
            style={styles.trackPill}>
            <Text style={styles.trackPillText}>Live Track</Text>
            <Ionicons name="chevron-forward" size={12} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Message Thread ── */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 16 },
        ]}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingContainer}>
              <View style={styles.avatarMini}>
                <Text style={styles.avatarMiniText}>
                  {recipientName.charAt(0)}
                </Text>
              </View>
              <View style={styles.typingBubble}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, styles.typingDotDelay1]} />
                <View style={[styles.typingDot, styles.typingDotDelay2]} />
                <Text style={styles.typingText}>{recipientName.split(' ')[0]} is typing...</Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* ── Quick Suggestions Bar ── */}
      <View style={styles.quickChipsWrapper}>
        <FlatList
          horizontal
          data={QUICK_CHIPS}
          keyExtractor={(item) => item.label}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickChipsContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.quickChip}
              onPress={() => handleSend(item.label)}
              activeOpacity={0.75}>
              <Text style={styles.quickChipText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ── Bottom Input Row ── */}
      <View
        style={[
          styles.inputContainer,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}>
        <TouchableOpacity
          style={styles.attachBtn}
          onPress={handleSendPhoto}
          activeOpacity={0.7}
          accessibilityLabel="Attach photo">
          <Ionicons name="camera-outline" size={22} color="#64748b" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.attachBtn}
          onPress={handleSendLocation}
          activeOpacity={0.7}
          accessibilityLabel="Share current location">
          <Ionicons name="location-outline" size={22} color="#64748b" />
        </TouchableOpacity>

        <TextInput
          testID="chat-input"
          style={styles.textInput}
          placeholder="Message Rahim (English বা বাংলা)..."
          placeholderTextColor="#94a3b8"
          value={inputVal}
          onChangeText={setInputVal}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
        />

        <TouchableOpacity
          testID="chat-send-btn"
          style={[
            styles.sendBtn,
            inputVal.trim().length > 0 && styles.sendBtnActive,
          ]}
          onPress={() => handleSend()}
          disabled={inputVal.trim().length === 0}
          activeOpacity={0.8}
          accessibilityLabel="Send message">
          <Ionicons
            name="send"
            size={18}
            color={inputVal.trim().length > 0 ? '#ffffff' : '#94a3b8'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfoCol: {
    flex: 1,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  headerRole: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceContextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f3ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e7ff',
    gap: 8,
  },
  serviceContextText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  trackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15157d',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 2,
  },
  trackPillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
    gap: 8,
  },
  msgRowMe: {
    justifyContent: 'flex-end',
  },
  msgRowOther: {
    justifyContent: 'flex-start',
  },
  avatarMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15157d',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      },
      default: {
        elevation: 1,
      },
    }),
  },
  bubbleMe: {
    backgroundColor: '#15157d',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bubbleLocation: {
    backgroundColor: '#0284c7',
  },
  bubbleImage: {
    backgroundColor: '#4338ca',
  },
  badgeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  badgeLocationText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
  },
  badgeImageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  badgeImageText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  msgTextMe: {
    color: '#ffffff',
  },
  msgTextOther: {
    color: '#1e293b',
  },
  msgFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timeText: {
    fontSize: 10,
  },
  timeTextMe: {
    color: '#cbd5e1',
  },
  timeTextOther: {
    color: '#94a3b8',
  },
  checkIcon: {
    marginLeft: 2,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94a3b8',
  },
  typingDotDelay1: {
    opacity: 0.6,
  },
  typingDotDelay2: {
    opacity: 0.3,
  },
  typingText: {
    fontSize: 11,
    color: '#64748b',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  quickChipsWrapper: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingVertical: 6,
  },
  quickChipsContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  quickChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
  },
  attachBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#f8fafc',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0f172a',
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: '#15157d',
  },
});
