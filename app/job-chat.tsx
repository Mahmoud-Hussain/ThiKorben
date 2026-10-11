import { Ionicons } from '@expo/vector-icons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useSession } from '@/contexts/session-context';
import {
  openConversation,
  sendMessage,
} from '@/features/chat/chat.service';
import type {
  JobConversation,
} from '@/features/chat/types';
import { getServiceRequest } from '@/features/community/community.service';
import type { CommunityRequest } from '@/features/community/types';
import {
  addMessageToConversation,
  ChatConversation,
  ChatMessage,
  DemoRole,
  getCartCount,
  getCartSubtotal,
  getDemoRole,
  getOrCreateConversation,
  loadConversationsFromStorage,
  setDemoRole as persistDemoRole,
  subscribeToChatSync,
  updateRecommendationDecision,
} from '@/services/chat-sync-service';
import { ChatProductRecommendationGroup } from '@/components/chat-product-recommendation';
import { InChatCartModal } from '@/components/in-chat-cart-modal';

const COLORS = {
  primary: '#15157d',
  primarySoft: '#eeedff',
  orange: '#F7941D',
  orangeSoft: '#fff4e7',
  background: '#f7f6fb',
  card: '#ffffff',
  text: '#181820',
  muted: '#6b6b78',
  border: '#e5e2eb',
  green: '#178c4f',
  greenSoft: '#eaf8f0',
  red: '#c43d39',
  redSoft: '#fff0ef',
};

const FALLBACK_DEMO_REQUEST: CommunityRequest = {
  id: 'req-demo-plumbing-1',
  customer_id: 'customer-demo-1',
  accepted_proposal_id: 'prop-demo-1',
  title: 'Bathroom Tap Leaking & Basin Pipe Joint Repair',
  category: 'plumbing',
  description:
    'Water pipe leaking under kitchen basin and main bathroom valve dripping. Need replacement fittings and Teflon tape.',
  location_label: 'Dhanmondi 27, Dhaka',
  budget_amount: 1500,
  currency: 'BDT',
  requested_start_at: new Date().toISOString(),
  schedule_note: 'Morning visit preferred',
  status: 'assigned',
  comment_count: 3,
  proposal_count: 2,
  reaction_count: 5,
  last_activity_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const WORKER_QUICK_CHIPS = [
  '20a double-pole circuit breaker, double-pole circuit breaker',
  'We need a replacement water pump.',
  'PVC pipe 1/2 inch and brass angle valve required.',
  'Teflon tape and rubber washer set needed for pipe joints.',
  '16A modular switch and copper wire.',
  'কাজ শুরু করেছি, পার্টস রেডি থাকলে সুবিধা হবে।',
];

const CUSTOMER_QUICK_CHIPS = [
  'ঠিক আছে ভাই, পার্টস অনুমোদন করছি।',
  'পার্টস অনুমোদিত, কাজ শুরু করুন।',
  'কতক্ষণ লাগবে ভাই?',
  'দরজার সামনে আছি',
  'মেইন গেইট খোলা আছে, ৩ তলায় উঠুন।',
];

export default function JobChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ requestId?: string }>();
  const { user, profile } = useSession();

  const [demoRole, setDemoRoleState] = useState<DemoRole>(getDemoRole);
  const [conversations, setConversations] = useState<ChatConversation[]>(loadConversationsFromStorage);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(getCartCount);
  const [cartSubtotal, setCartSubtotal] = useState(getCartSubtotal);

  const [conversation, setConversation] = useState<JobConversation | null>(null);
  const [request, setRequest] = useState<CommunityRequest | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView | null>(null);

  const activeConvId = useMemo(() => {
    if (params.requestId) {
      return `conv-${params.requestId}`;
    }
    if (conversation?.id) {
      return `conv-${conversation.id}`;
    }
    return 'conv-rahim';
  }, [params.requestId, conversation?.id]);

  const activeConv = useMemo(() => {
    const found = conversations.find(c => c.id === activeConvId);
    if (found) return found;
    return getOrCreateConversation(
      activeConvId,
      request?.title ?? FALLBACK_DEMO_REQUEST.title,
      'Rahim Uddin (Assigned Worker)'
    );
  }, [conversations, activeConvId, request?.title]);

  const refreshCart = useCallback(() => {
    setCartCount(getCartCount());
    setCartSubtotal(getCartSubtotal());
  }, []);

  // Subscribe to real-time synchronized storage
  useEffect(() => {
    const unsubscribe = subscribeToChatSync(updated => {
      setConversations(updated);
      refreshCart();
    });
    return unsubscribe;
  }, [refreshCart]);

  const hydrate = useCallback(async () => {
    setLoading(true);
    setError(null);

    let nextRequest: CommunityRequest | null = null;
    let nextConv: JobConversation | null = null;

    if (params.requestId) {
      try {
        const timeoutReq = new Promise<null>(resolve =>
          setTimeout(() => resolve(null), 1500)
        );
        const [loadedConv, loadedReq] = await Promise.race([
          Promise.all([
            openConversation(params.requestId),
            getServiceRequest(params.requestId),
          ]),
          timeoutReq.then(() => [null, null]),
        ]);

        if (loadedConv) nextConv = loadedConv;
        if (loadedReq) nextRequest = loadedReq;
      } catch (err) {
        console.warn('Could not hydrate backend chat, using synchronized demo', err);
      }
    }

    if (!nextRequest) {
      nextRequest = FALLBACK_DEMO_REQUEST;
    }

    setRequest(nextRequest);
    setConversation(nextConv);

    // Ensure conversation exists in synchronized storage
    getOrCreateConversation(
      params.requestId ? `conv-${params.requestId}` : 'conv-rahim',
      nextRequest.title,
      'Rahim Uddin (Assigned Worker)'
    );

    setLoading(false);
  }, [params.requestId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void hydrate();
    }, 0);
    return () => clearTimeout(timer);
  }, [hydrate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 90);
    return () => clearTimeout(timer);
  }, [activeConv.messages.length, activeConv.recommendations.length]);

  const handleRoleSwitch = (newRole: DemoRole) => {
    setDemoRoleState(newRole);
    persistDemoRole(newRole);
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
    const rec = (activeConv.recommendations || []).find(r => r.id === recId);
    if (rec) {
      updateRecommendationDecision(activeConv.id, recId, rec.status, newQty);
    }
    refreshCart();
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || draft).trim();
    if (!textToSend || sending) return;

    if (!customText) setDraft('');
    setSending(true);

    const senderName =
      demoRole === 'worker'
        ? 'Rahim Uddin (Worker)'
        : (profile?.display_name || user?.email?.split('@')[0] || 'Customer');

    try {
      // 1. Add to synchronized store (runs component detection, broadcast events, creates recommendations)
      addMessageToConversation(
        activeConv.id,
        demoRole,
        textToSend,
        senderName,
        'text'
      );

      // 2. Non-blocking attempt to send to backend if conversation exists
      if (conversation?.id) {
        void sendMessage({
          conversationId: conversation.id,
          body: textToSend,
        }).catch(() => {
          // offline demo fallback is already safely handled
        });
      }
    } catch (err) {
      console.warn('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  const activeChips = demoRole === 'worker' ? WORKER_QUICK_CHIPS : CUSTOMER_QUICK_CHIPS;

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.centerText}>Opening secure job chat…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Demo Role Switcher & In-Chat Cart Bar ── */}
        <View style={styles.topControlBar}>
          <View style={styles.roleSegmentedControl}>
            <Pressable
              testID="demo-role-customer"
              style={[
                styles.roleTab,
                demoRole === 'customer' && styles.roleTabActiveCustomer,
              ]}
              onPress={() => handleRoleSwitch('customer')}
              accessibilityLabel="Switch to Customer Mode"
            >
              <Ionicons
                name="person"
                size={13}
                color={demoRole === 'customer' ? '#ffffff' : COLORS.primary}
              />
              <Text
                style={[
                  styles.roleTabText,
                  demoRole === 'customer' && styles.roleTabTextActive,
                ]}
              >
                Customer Mode
              </Text>
            </Pressable>

            <Pressable
              testID="demo-role-worker"
              style={[
                styles.roleTab,
                demoRole === 'worker' && styles.roleTabActiveWorker,
              ]}
              onPress={() => handleRoleSwitch('worker')}
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
            </Pressable>
          </View>

          {/* In-Chat Cart Shortcut */}
          <Pressable
            testID="header-cart-btn"
            style={styles.headerCartBtn}
            onPress={() => setIsCartOpen(true)}
            accessibilityLabel="Open in-chat cart"
          >
            <Ionicons name="cart" size={16} color={COLORS.primary} />
            {cartCount > 0 && (
              <View testID="header-cart-badge" style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
            <Text style={styles.cartBtnAmount}>৳{cartSubtotal.toLocaleString()}</Text>
          </Pressable>
        </View>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable
            style={styles.headerButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </Pressable>

          <View
            style={[
              styles.avatar,
              { backgroundColor: demoRole === 'worker' ? '#ea580c' : COLORS.primary },
            ]}
          >
            <Ionicons
              name={demoRole === 'worker' ? 'construct' : 'person'}
              size={19}
              color="#fff"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              {demoRole === 'worker' ? 'Customer Conversation' : 'Assigned Worker'}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {request?.title ?? 'Private job conversation'}
            </Text>
          </View>

          <Pressable
            style={styles.materialButton}
            onPress={() =>
              router.push({
                pathname: '/job-materials',
                params: { requestId: params.requestId },
              } as Href)
            }
          >
            <Ionicons name="cube-outline" size={15} color={COLORS.primary} />
            <Text style={styles.materialButtonText}>Materials</Text>
          </Pressable>

          <View style={styles.secureBadge}>
            <Ionicons name="shield-checkmark" size={13} color={COLORS.green} />
            <Text style={styles.secureText}>Private</Text>
          </View>
        </View>

        {/* ── Service Context Banner ── */}
        <View style={styles.contextBar}>
          <Ionicons name="briefcase-outline" size={16} color={COLORS.primary} />
          <View style={styles.flex}>
            <Text style={styles.contextTitle} numberOfLines={1}>
              {request?.title ?? 'Assigned service request'}
            </Text>
            <Text style={styles.contextText}>
              Job context is linked to this conversation. Only the accepted customer and worker can access it.
            </Text>
          </View>
        </View>

        {/* ── Messages & Recommendations Stream ── */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {activeConv.messages.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="chatbubbles-outline" size={27} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>Start the job conversation</Text>
              <Text style={styles.emptyText}>
                Confirm arrival, clarify the work, and discuss components before approval.
              </Text>
            </View>
          ) : (
            activeConv.messages.map((item: ChatMessage) => {
              const isMe = item.senderRole === demoRole;
              const isWorkerMsg = item.senderRole === 'worker';
              const isSystem = item.type === 'system';

              // Attached component recommendations
              const msgRecs = (activeConv.recommendations || []).filter(
                r =>
                  r.triggeringMessageId === item.id ||
                  (item.recommendationIds && item.recommendationIds.includes(r.id))
              );

              if (isSystem) {
                return (
                  <View key={item.id} style={styles.systemMsgWrap}>
                    <View style={styles.systemMsgBubble}>
                      <Ionicons name="sparkles" size={14} color={COLORS.orange} />
                      <Text style={styles.systemMsgText}>{item.text}</Text>
                    </View>
                  </View>
                );
              }

              return (
                <View key={item.id} style={styles.msgBlock}>
                  <View
                    style={[
                      styles.messageWrap,
                      isMe ? styles.messageWrapMine : styles.messageWrapOther,
                    ]}
                  >
                    <View
                      style={[
                        styles.bubble,
                        isMe ? styles.bubbleMine : styles.bubbleOther,
                      ]}
                    >
                      {/* Sender identification pill */}
                      <Text
                        style={[
                          styles.senderRoleTag,
                          isMe ? styles.senderRoleTagMine : styles.senderRoleTagOther,
                        ]}
                      >
                        {isWorkerMsg ? 'Worker 🔧' : 'Customer 👤'} • {item.senderName || (isMe ? 'You' : 'Participant')}
                      </Text>

                      <Text
                        style={[
                          styles.messageText,
                          isMe ? styles.messageTextMine : styles.messageTextOther,
                        ]}
                      >
                        {item.text}
                      </Text>

                      <Text
                        style={[
                          styles.time,
                          isMe ? styles.timeMine : styles.timeOther,
                        ]}
                      >
                        {item.time}
                      </Text>
                    </View>
                  </View>

                  {/* ── Inline Product Recommendation Window ── */}
                  {msgRecs.length > 0 && (
                    <View style={styles.recommendationWrap}>
                      <ChatProductRecommendationGroup
                        recommendations={msgRecs}
                        demoRole={demoRole}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onChangeProduct={handleChangeProduct}
                        onAddToCart={handleAddToCart}
                        onQuantityChange={handleQuantityChange}
                      />
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>

        {error ? (
          <View style={styles.inlineError}>
            <Ionicons name="alert-circle-outline" size={16} color={COLORS.red} />
            <Text style={styles.inlineErrorText}>{error}</Text>
            <Pressable onPress={() => setError(null)}>
              <Ionicons name="close" size={16} color={COLORS.red} />
            </Pressable>
          </View>
        ) : null}

        {/* ── Quick Chips for 1-Tap Testing ── */}
        <View style={styles.quickChipsBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickChipsContent}
          >
            {activeChips.map((chip, idx) => (
              <Pressable
                key={idx}
                style={[
                  styles.quickChip,
                  demoRole === 'worker' ? styles.quickChipWorker : styles.quickChipCustomer,
                ]}
                onPress={() => void handleSend(chip)}
              >
                <Ionicons
                  name={demoRole === 'worker' ? 'flash' : 'chatbubble-ellipses'}
                  size={11}
                  color={demoRole === 'worker' ? '#ea580c' : COLORS.primary}
                />
                <Text
                  style={[
                    styles.quickChipText,
                    demoRole === 'worker' ? styles.quickChipTextWorker : styles.quickChipTextCustomer,
                  ]}
                  numberOfLines={1}
                >
                  {chip}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ── Interactive Composer ── */}
        <View style={styles.composer}>
          {/* Identity switcher button right above message bar */}
          <Pressable
            testID="identity-toggle-btn"
            style={[
              styles.identityPillButton,
              demoRole === 'worker' ? styles.identityPillWorker : styles.identityPillCustomer,
            ]}
            onPress={() => handleRoleSwitch(demoRole === 'customer' ? 'worker' : 'customer')}
            accessibilityLabel="Tap to switch sender role"
          >
            <Ionicons
              name={demoRole === 'worker' ? 'construct' : 'person'}
              size={13}
              color={demoRole === 'worker' ? '#ea580c' : COLORS.primary}
            />
            <Text style={styles.identityText}>
              Chatting as:{' '}
              <Text style={styles.identityRoleBold}>
                {demoRole === 'worker' ? 'Worker 🔧' : 'Customer 👤'}
              </Text>{' '}
              <Text style={styles.identityActionHint}>(Tap to Switch Role)</Text>
            </Text>
          </Pressable>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder={
                demoRole === 'worker'
                  ? 'Mention a component (e.g. 20A circuit breaker, water pump)…'
                  : 'Reply to worker (e.g. approval, questions)…'
              }
              placeholderTextColor={COLORS.muted}
              multiline
              maxLength={4000}
            />

            <Pressable
              style={[
                styles.sendButton,
                (!draft.trim() || sending) && styles.disabled,
                demoRole === 'worker' ? styles.sendButtonWorker : styles.sendButtonCustomer,
              ]}
              disabled={!draft.trim() || sending}
              onPress={() => void handleSend()}
              accessibilityLabel="Send message"
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={17} color="#fff" />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ── In-Chat Demo Cart Drawer ── */}
      <InChatCartModal
        visible={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCartUpdated={refreshCart}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: COLORS.background },
  topControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0eef6',
    gap: 8,
  },
  roleSegmentedControl: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f1f0f7',
    borderRadius: 11,
    padding: 3,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  roleTabActiveCustomer: {
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  roleTabActiveWorker: {
    backgroundColor: '#ea580c',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  roleTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted,
  },
  roleTabTextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  headerCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#dedcf5',
    gap: 5,
  },
  cartBadge: {
    backgroundColor: '#ea580c',
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
  cartBtnAmount: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#fff',
  },
  headerButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 13, fontWeight: '900', color: COLORS.text },
  headerSubtitle: { marginTop: 2, fontSize: 9.5, color: COLORS.muted },
  materialButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 9,
    backgroundColor: COLORS.primarySoft,
  },
  materialButtonText: { fontSize: 9, fontWeight: '900', color: COLORS.primary },
  secureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 999,
    backgroundColor: '#eaf8f0',
  },
  secureText: { fontSize: 8.5, fontWeight: '900', color: COLORS.green },
  contextBar: {
    margin: 10,
    marginBottom: 0,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 13,
    backgroundColor: COLORS.primarySoft,
  },
  contextTitle: { fontSize: 10.5, fontWeight: '900', color: COLORS.primary },
  contextText: { marginTop: 2, fontSize: 9.5, lineHeight: 14, color: COLORS.muted },
  messages: { flex: 1 },
  messagesContent: { padding: 12, paddingBottom: 20 },
  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
  },
  emptyTitle: { marginTop: 12, fontSize: 13.5, fontWeight: '900', color: COLORS.text },
  emptyText: {
    marginTop: 5,
    maxWidth: 310,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    color: COLORS.muted,
  },
  msgBlock: {
    marginBottom: 11,
  },
  messageWrap: { width: '100%' },
  messageWrapMine: { alignItems: 'flex-end' },
  messageWrapOther: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 15,
  },
  bubbleMine: {
    borderBottomRightRadius: 4,
    backgroundColor: COLORS.primary,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  senderRoleTag: {
    fontSize: 8.5,
    fontWeight: '800',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  senderRoleTagMine: {
    color: '#c9c8ff',
  },
  senderRoleTagOther: {
    color: COLORS.muted,
  },
  messageText: { fontSize: 11.5, lineHeight: 17 },
  messageTextMine: { color: '#fff' },
  messageTextOther: { color: COLORS.text },
  time: { marginTop: 4, fontSize: 8 },
  timeMine: { color: '#c9c8ff', textAlign: 'right' },
  timeOther: { color: COLORS.muted },
  systemMsgWrap: {
    alignItems: 'center',
    marginVertical: 6,
  },
  systemMsgBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ffedd5',
    maxWidth: '90%',
  },
  systemMsgText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#9a3412',
    lineHeight: 14,
  },
  recommendationWrap: {
    marginTop: 6,
    width: '100%',
  },
  quickChipsBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f0f6',
    paddingVertical: 5,
  },
  quickChipsContent: {
    paddingHorizontal: 12,
    gap: 7,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    gap: 4,
    maxWidth: 260,
  },
  quickChipCustomer: {
    backgroundColor: COLORS.primarySoft,
    borderColor: '#dedcf5',
  },
  quickChipWorker: {
    backgroundColor: COLORS.orangeSoft,
    borderColor: '#fed7aa',
  },
  quickChipText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  quickChipTextCustomer: {
    color: COLORS.primary,
  },
  quickChipTextWorker: {
    color: '#c2410c',
  },
  inlineError: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 11,
    backgroundColor: COLORS.redSoft,
  },
  inlineErrorText: { flex: 1, fontSize: 9.5, color: COLORS.red },
  composer: {
    padding: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#fff',
  },
  identityPillButton: {
    marginBottom: 7,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  identityPillCustomer: {
    backgroundColor: COLORS.primarySoft,
    borderColor: '#dcd9f7',
  },
  identityPillWorker: {
    backgroundColor: COLORS.orangeSoft,
    borderColor: '#fed7aa',
  },
  identityText: { fontSize: 9.5, color: COLORS.text },
  identityRoleBold: { fontWeight: '900', color: COLORS.text },
  identityActionHint: { fontSize: 8.5, color: COLORS.muted, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    fontSize: 11,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonCustomer: {
    backgroundColor: COLORS.primary,
  },
  sendButtonWorker: {
    backgroundColor: '#ea580c',
  },
  disabled: { opacity: 0.45 },
  center: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  centerText: {
    marginTop: 8,
    maxWidth: 330,
    textAlign: 'center',
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.muted,
  },
});
