import React, { useCallback, useEffect, useRef, useState } from 'react';
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

import {
  addMessageToConversation,
  ChatConversation,
  ChatMessage,
  DemoRole,
  getCartCount,
  getCartSubtotal,
  getDemoRole,
  loadConversationsFromStorage,
  setDemoRole as persistDemoRole,
  subscribeToChatSync,
  updateRecommendationDecision,
} from '@/services/chat-sync-service';
import { ChatProductRecommendationGroup } from '@/components/chat-product-recommendation';
import { InChatCartModal } from '@/components/in-chat-cart-modal';

const CUSTOMER_CHIPS = [
  'কতক্ষণ লাগবে ভাই?',
  'দরজার সামনে আছি',
  'গেইটের বেল বাজান',
  'Flat 4B, 4th floor.',
  'Call me on arrival',
  'ঠিক আছে ভাই, পার্টস অনুমোদন করছি।',
  'কার্টে যোগ করে দিয়েছি।',
];

const WORKER_CHIPS = [
  'We need a 20A double-pole circuit breaker and 2.5mm electrical cable for this installation.',
  'We need a replacement water pump.',
  'PVC pipe 1/2 inch and brass angle valve required.',
  'Teflon tape and rubber washer set needed for pipe joints.',
  '16A modular switch and copper wire.',
  'কাজ শুরু করেছি, পার্টস রেডি থাকলে সুবিধা হবে।',
];

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    conversationId?: string;
    recipientName?: string;
    recipientRole?: string;
    jobTitle?: string;
    userRole?: string;
  }>();

  const [demoRole, setDemoRoleState] = useState<DemoRole>(getDemoRole);
  const [conversations, setConversations] = useState<ChatConversation[]>(loadConversationsFromStorage);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(getCartCount);
  const [cartSubtotal, setCartSubtotal] = useState(getCartSubtotal);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const recipientParamName = params.recipientName;
  const conversationParamId = params.conversationId;
  const activeConv =
    conversations.find(
      c =>
        (conversationParamId && c.id === conversationParamId) ||
        (recipientParamName &&
          c.recipientName.toLowerCase() === recipientParamName.toLowerCase())
    ) ||
    conversations[0] || {
      id: 'conv-rahim',
      recipientId: 'worker-demo-1',
      recipientName: 'Rahim Uddin',
      recipientRole: 'Verified Plumber • 4.9 ★',
      jobTitle: 'Plumbing Leak Fix (Dhanmondi 27)',
      unreadCount: 0,
      lastMessage: '',
      lastTime: '',
      avatarColor: '#10b981',
      messages: [],
      recommendations: [],
    };

  const recipientName = activeConv.recipientName;
  const recipientRole = activeConv.recipientRole;
  const jobTitle = params.jobTitle || activeConv.jobTitle;

  const refreshCart = useCallback(() => {
    setCartCount(getCartCount());
    setCartSubtotal(getCartSubtotal());
  }, []);

  // Subscribe to reactive sync across components & storage
  useEffect(() => {
    const unsubscribe = subscribeToChatSync((updatedConvs) => {
      setConversations(updatedConvs);
      refreshCart();
    });
    return unsubscribe;
  }, [refreshCart]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 120);
  }, [activeConv.messages.length, activeConv.recommendations.length, isTyping]);

  const handleRoleSwitch = (newRole: DemoRole) => {
    setDemoRoleState(newRole);
    persistDemoRole(newRole);
  };

  const handleSend = (customText?: string) => {
    const textToSend = (customText || inputVal).trim();
    if (!textToSend) return;

    if (!customText) setInputVal('');

    const senderName =
      demoRole === 'customer' ? 'You (Customer)' : activeConv.recipientName;

    addMessageToConversation(
      activeConv.id,
      demoRole,
      textToSend,
      senderName,
      'text'
    );

    // If customer sent a message, simulate a short worker reply if appropriate
    if (demoRole === 'customer') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        let replyText = 'জী ভাই, বুঝতে পেরেছি। আমি ঠিক সময়ে পৌঁছে যাব।';
        if (textToSend.includes('কতক্ষণ')) {
          replyText = 'আর ৫-৭ মিনিটের মধ্যে পৌঁছে যাচ্ছি ভাই।';
        } else if (textToSend.includes('অনুমোদন') || textToSend.includes('কার্ট')) {
          replyText = 'ধন্যবাদ ভাই! অনুমোদিত পার্টসগুলো দিয়ে কাজ এগিয়ে নিচ্ছি।';
        }

        addMessageToConversation(
          activeConv.id,
          'worker',
          replyText,
          activeConv.recipientName,
          'text'
        );
      }, 1200);
    }
  };

  const handleSendLocation = () => {
    addMessageToConversation(
      activeConv.id,
      demoRole,
      '📍 Shared Location: Road 27, House 42, Dhanmondi, Dhaka',
      demoRole === 'customer' ? 'You (Customer)' : activeConv.recipientName,
      'location'
    );
  };

  const handleSendPhoto = () => {
    addMessageToConversation(
      activeConv.id,
      demoRole,
      '📸 Attached Photo: Breaker panel / pipe joint',
      demoRole === 'customer' ? 'You (Customer)' : activeConv.recipientName,
      'image'
    );
  };

  const handleApprove = (recId: string) => {
    updateRecommendationDecision(activeConv.id, recId, 'approved');
    refreshCart();
  };

  const handleReject = (recId: string) => {
    updateRecommendationDecision(activeConv.id, recId, 'rejected');
    refreshCart();
  };

  const handleChangeProduct = (recId: string, newProductId: string) => {
    updateRecommendationDecision(activeConv.id, recId, 'alternative_requested', undefined, newProductId);
    refreshCart();
  };

  const handleAddToCart = (recId: string) => {
    updateRecommendationDecision(activeConv.id, recId, 'added_to_cart');
    refreshCart();
  };

  const handleQuantityChange = (recId: string, newQty: number) => {
    const rec = activeConv.recommendations.find(r => r.id === recId);
    if (rec) {
      updateRecommendationDecision(activeConv.id, recId, rec.status, newQty);
    }
    refreshCart();
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
      router.push(demoRole === 'worker' ? '/worker-dashboard' : '/customer-dashboard');
    }
  };

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    // System message
    if (item.type === 'system' || item.senderRole === 'system') {
      return (
        <View style={styles.systemMsgWrapper} testID={`system-msg-${item.id}`}>
          <View style={styles.systemMsgBubble}>
            <Text style={styles.systemMsgText}>{item.text}</Text>
          </View>
        </View>
      );
    }

    const isMe =
      (demoRole === 'customer' && item.senderRole === 'customer') ||
      (demoRole === 'worker' && item.senderRole === 'worker');

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
              styles.avatarMini,
              { backgroundColor: item.senderRole === 'worker' ? '#ea580c' : '#15157d' },
            ]}
          >
            <Text style={styles.avatarMiniText}>
              {item.senderName ? item.senderName.charAt(0) : 'W'}
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
          {/* Sender Role Tag */}
          <Text style={[styles.senderTag, isMe ? styles.senderTagMe : styles.senderTagOther]}>
            {item.senderRole === 'customer' ? 'Customer' : 'Worker'} • {item.senderName || (isMe ? 'You' : recipientName)}
          </Text>

          {item.type === 'location' && (
            <View style={styles.badgeLocationRow}>
              <Ionicons name="location" size={15} color="#ffffff" />
              <Text style={styles.badgeLocationText}>GPS Location Pin</Text>
            </View>
          )}

          {item.type === 'image' && (
            <View style={styles.badgeImageRow}>
              <MaterialCommunityIcons name="image" size={15} color="#ffffff" />
              <Text style={styles.badgeImageText}>Photo Attachment</Text>
            </View>
          )}

          <Text
            style={[
              styles.msgText,
              isMe ? styles.msgTextMe : styles.msgTextOther,
            ]}
          >
            {item.text}
          </Text>

          <View style={styles.msgFooter}>
            <Text
              style={[
                styles.timeText,
                isMe ? styles.timeTextMe : styles.timeTextOther,
              ]}
            >
              {item.time}
            </Text>
            {isMe && (
              <Ionicons
                name="checkmark-done"
                size={14}
                color="#93c5fd"
                style={styles.checkIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const activeChips = demoRole === 'worker' ? WORKER_CHIPS : CUSTOMER_CHIPS;

  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── Demo Role Switcher & In-Chat Cart Bar ── */}
      <View style={[styles.topControlBar, { paddingTop: Math.max(insets.top, 10) }]}>
        <View style={styles.roleSegmentedControl}>
          <TouchableOpacity
            testID="demo-role-customer"
            style={[
              styles.roleTab,
              demoRole === 'customer' && styles.roleTabActiveCustomer,
            ]}
            onPress={() => handleRoleSwitch('customer')}
            activeOpacity={0.85}
            accessibilityLabel="Switch to Customer Mode"
          >
            <Ionicons
              name="person"
              size={13}
              color={demoRole === 'customer' ? '#ffffff' : '#15157d'}
            />
            <Text
              style={[
                styles.roleTabText,
                demoRole === 'customer' && styles.roleTabTextActive,
              ]}
            >
              Customer Mode
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="demo-role-worker"
            style={[
              styles.roleTab,
              demoRole === 'worker' && styles.roleTabActiveWorker,
            ]}
            onPress={() => handleRoleSwitch('worker')}
            activeOpacity={0.85}
            accessibilityLabel="Switch to Worker Mode"
          >
            <Ionicons
              name="construct"
              size={13}
              color={demoRole === 'worker' ? '#ffffff' : '#ea580c'}
            />
            <Text
              style={[
                styles.roleTabText,
                demoRole === 'worker' && styles.roleTabTextActive,
              ]}
            >
              Worker Mode
            </Text>
          </TouchableOpacity>
        </View>

        {/* In-Chat Cart Shortcut */}
        <TouchableOpacity
          testID="header-cart-btn"
          style={styles.headerCartBtn}
          onPress={() => setIsCartOpen(true)}
          activeOpacity={0.85}
          accessibilityLabel="Open in-chat cart"
        >
          <Ionicons name="cart" size={17} color="#4338a8" />
          {cartCount > 0 && (
            <View testID="header-cart-badge" style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
          <Text style={styles.cartBtnAmount}>৳{cartSubtotal.toLocaleString()}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Chat Header Bar ── */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#15157d" />
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
              accessibilityLabel="Call via phone"
            >
              <Ionicons name="call" size={17} color="#15157d" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => router.push('/track-worker')}
              activeOpacity={0.8}
              accessibilityLabel="Track on map"
            >
              <Ionicons name="map" size={17} color="#F7941D" />
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
            style={styles.trackPill}
          >
            <Text style={styles.trackPillText}>Live Track</Text>
            <Ionicons name="chevron-forward" size={12} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Message Thread & Recommendations ── */}
      <FlatList
        ref={flatListRef}
        data={activeConv.messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 16 },
        ]}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <>
            {/* Inline AI Component Recommendations Panel */}
            {activeConv.recommendations && activeConv.recommendations.length > 0 && (
              <ChatProductRecommendationGroup
                recommendations={activeConv.recommendations}
                demoRole={demoRole}
                onApprove={handleApprove}
                onReject={handleReject}
                onChangeProduct={handleChangeProduct}
                onAddToCart={handleAddToCart}
                onQuantityChange={handleQuantityChange}
              />
            )}

            {isTyping && (
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
                  <Text style={styles.typingText}>
                    {recipientName.split(' ')[0]} is typing...
                  </Text>
                </View>
              </View>
            )}
          </>
        }
      />

      {/* ── Quick Suggestions Bar ── */}
      <View style={styles.quickChipsWrapper}>
        <View style={styles.quickChipsHeader}>
          <Text style={styles.chipsRoleLabel}>
            {demoRole === 'worker'
              ? '🛠️ Worker quick mentions (test AI detection):'
              : '👤 Customer quick replies:'}
          </Text>
        </View>
        <FlatList
          horizontal
          data={activeChips}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickChipsContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.quickChip,
                demoRole === 'worker' && styles.quickChipWorker,
              ]}
              onPress={() => handleSend(item)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.quickChipText,
                  demoRole === 'worker' && styles.quickChipTextWorker,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ── Bottom Input Row ── */}
      <View
        style={[
          styles.inputContainer,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <TouchableOpacity
          style={styles.attachBtn}
          onPress={handleSendPhoto}
          activeOpacity={0.7}
          accessibilityLabel="Attach photo"
        >
          <Ionicons name="camera-outline" size={21} color="#64748b" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.attachBtn}
          onPress={handleSendLocation}
          activeOpacity={0.7}
          accessibilityLabel="Share current location"
        >
          <Ionicons name="location-outline" size={21} color="#64748b" />
        </TouchableOpacity>

        <TextInput
          testID="chat-input"
          style={styles.textInput}
          placeholder={
            demoRole === 'worker'
              ? "Type part mention (e.g., 'We need a 20A double-pole circuit breaker and 2.5mm electrical cable')..."
              : `Reply as Customer to ${recipientName}...`
          }
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
          accessibilityLabel="Send message"
        >
          <Ionicons
            name="send"
            size={17}
            color={inputVal.trim().length > 0 ? '#ffffff' : '#94a3b8'}
          />
        </TouchableOpacity>
      </View>

      {/* ── In-Chat Demo Cart Drawer / Modal ── */}
      <InChatCartModal
        visible={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCartUpdated={refreshCart}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topControlBar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 8,
  },
  roleSegmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 3,
    flex: 1,
    maxWidth: 290,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  roleTabActiveCustomer: {
    backgroundColor: '#15157d',
    shadowColor: '#15157d',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  roleTabActiveWorker: {
    backgroundColor: '#ea580c',
    shadowColor: '#ea580c',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  roleTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  roleTabTextActive: {
    color: '#ffffff',
  },
  headerCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#f3e8ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  cartBadge: {
    backgroundColor: '#7c3aed',
    borderRadius: 999,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  cartBtnAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6b21a8',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  backBtn: {
    padding: 4,
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
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a760',
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
  },
  headerRole: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceContextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  serviceContextText: {
    fontSize: 11.5,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  trackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#15157d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trackPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
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
  avatarMini: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  avatarMiniText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
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
    backgroundColor: '#059669',
  },
  senderTag: {
    fontSize: 9.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  senderTagMe: {
    color: '#bfdbfe',
  },
  senderTagOther: {
    color: '#64748b',
  },
  badgeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  badgeLocationText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeImageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  badgeImageText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  msgText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  msgTextMe: {
    color: '#ffffff',
  },
  msgTextOther: {
    color: '#0f172a',
  },
  msgFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 3,
  },
  timeText: {
    fontSize: 9.5,
  },
  timeTextMe: {
    color: '#93c5fd',
  },
  timeTextOther: {
    color: '#94a3b8',
  },
  checkIcon: {
    marginLeft: 2,
  },
  systemMsgWrapper: {
    alignItems: 'center',
    marginVertical: 6,
    paddingHorizontal: 16,
  },
  systemMsgBubble: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  systemMsgText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
    textAlign: 'center',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#64748b',
  },
  typingDotDelay1: {
    opacity: 0.7,
  },
  typingDotDelay2: {
    opacity: 0.4,
  },
  typingText: {
    fontSize: 11,
    color: '#475569',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  quickChipsWrapper: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingVertical: 6,
  },
  quickChipsHeader: {
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  chipsRoleLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
  },
  quickChipsContent: {
    paddingHorizontal: 12,
    gap: 6,
  },
  quickChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickChipWorker: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  quickChipTextWorker: {
    color: '#c2410c',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  attachBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  textInput: {
    flex: 1,
    minHeight: 38,
    maxHeight: 80,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 18,
    paddingHorizontal: 12,
    fontSize: 12.5,
    color: '#0f172a',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: '#15157d',
  },
});
