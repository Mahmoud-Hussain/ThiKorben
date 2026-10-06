import { Ionicons } from '@expo/vector-icons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

import {
  addToCart,
  formatShopMoney,
} from '@/constants/shop-data';
import { recommendProductsFromMessage } from '@/constants/product-recommendation';
import { useSession } from '@/contexts/session-context';
import {
  getMessages,
  openConversation,
  sendMessage,
} from '@/features/chat/chat.service';
import type {
  JobConversation,
  JobMessage,
} from '@/features/chat/types';
import { getServiceRequest } from '@/features/community/community.service';
import type { CommunityRequest } from '@/features/community/types';
import { supabase } from '@/lib/supabase';

const COLORS = {
  primary: '#15157d',
  primarySoft: '#eeedff',
  orange: '#F7941D',
  background: '#f7f6fb',
  card: '#ffffff',
  text: '#181820',
  muted: '#6b6b78',
  border: '#e5e2eb',
  green: '#178c4f',
  red: '#c43d39',
};

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function JobChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ requestId?: string }>();
  const { user, role, profile } = useSession();

  const [conversation, setConversation] = useState<JobConversation | null>(null);
  const [request, setRequest] = useState<CommunityRequest | null>(null);
  const [messages, setMessages] = useState<JobMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView | null>(null);

  const participantLabel = useMemo(
    () => (role === 'worker' ? 'Customer' : 'Assigned worker'),
    [role],
  );

  const recommendations = useMemo(() => {
    const latest = [...messages]
      .reverse()
      .find(item => item.message_type === 'text' && item.body.trim());

    return latest
      ? recommendProductsFromMessage(latest.body)
      : [];
  }, [messages]);

  const hydrate = useCallback(async () => {
    await Promise.resolve();

    if (!params.requestId) {
      setError('Service request ID is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [nextConversation, nextRequest] = await Promise.all([
        openConversation(params.requestId),
        getServiceRequest(params.requestId),
      ]);

      const nextMessages = await getMessages(nextConversation.id);

      setConversation(nextConversation);
      setRequest(nextRequest);
      setMessages(nextMessages);
    } catch (hydrateError) {
      setError(messageFrom(hydrateError));
    } finally {
      setLoading(false);
    }
  }, [params.requestId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void hydrate();
    }, 0);

    return () => clearTimeout(timer);
  }, [hydrate]);

  useEffect(() => {
    if (!conversation) {
      return;
    }

    const channel = supabase
      .channel(`job-chat:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'job_messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        payload => {
          const incoming = payload.new as JobMessage;

          setMessages(current => {
            if (current.some(item => item.id === incoming.id)) {
              return current;
            }

            return [...current, incoming];
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);

    return () => clearTimeout(timer);
  }, [messages.length]);

  const handleSend = async () => {
    if (!conversation || !draft.trim() || sending) {
      return;
    }

    const body = draft;
    setDraft('');
    setSending(true);

    try {
      const created = await sendMessage({
        conversationId: conversation.id,
        body,
      });

      setMessages(current => {
        if (current.some(item => item.id === created.id)) {
          return current;
        }

        return [...current, created];
      });
    } catch (sendError) {
      setDraft(body);
      setError(messageFrom(sendError));
    } finally {
      setSending(false);
    }
  };

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

  if (error && !conversation) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={38} color={COLORS.red} />
          <Text style={styles.centerTitle}>Chat unavailable</Text>
          <Text style={styles.centerText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => void hydrate()}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
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
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </Pressable>

          <View style={styles.avatar}>
            <Ionicons
              name={role === 'worker' ? 'person' : 'construct'}
              size={19}
              color="#fff"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{participantLabel}</Text>
            <Text style={styles.headerSubtitle}>
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
            <Ionicons name="cart-outline" size={15} color={COLORS.primary} />
            <Text style={styles.materialButtonText}>Materials</Text>
          </Pressable>

          <View style={styles.secureBadge}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.green} />
            <Text style={styles.secureText}>Private</Text>
          </View>
        </View>

        <View style={styles.contextBar}>
          <Ionicons name="briefcase-outline" size={16} color={COLORS.primary} />
          <View style={styles.flex}>
            <Text style={styles.contextTitle}>
              {request?.title ?? 'Assigned service request'}
            </Text>
            <Text style={styles.contextText}>
              Job context is linked to this conversation. Only the accepted customer and worker can access it.
            </Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="chatbubbles-outline" size={27} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>Start the job conversation</Text>
              <Text style={styles.emptyText}>
                Confirm arrival, clarify the work, and discuss materials before purchase.
              </Text>
            </View>
          ) : (
            messages.map(item => {
              const mine = item.sender_id === user?.id;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.messageWrap,
                    mine ? styles.messageWrapMine : styles.messageWrapOther,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      mine ? styles.bubbleMine : styles.bubbleOther,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        mine ? styles.messageTextMine : styles.messageTextOther,
                      ]}
                    >
                      {item.body}
                    </Text>
                    <Text
                      style={[
                        styles.time,
                        mine ? styles.timeMine : styles.timeOther,
                      ]}
                    >
                      {formatTime(item.created_at)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}

          {recommendations.length > 0 ? (
            <View style={styles.recommendationPanel}>
              <View style={styles.recommendationHeader}>
                <View style={styles.recommendationIcon}>
                  <Ionicons name="sparkles" size={17} color="#ffffff" />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.recommendationTitle}>
                    Product recommendation
                  </Text>
                  <Text style={styles.recommendationSub}>
                    Matched from the latest job conversation.
                  </Text>
                </View>
              </View>

              {recommendations.slice(0, 2).map(item => (
                <View key={item.product.id} style={styles.productCard}>
                  <View style={styles.productIcon}>
                    <Ionicons
                      name={item.product.icon}
                      size={23}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.flex}>
                    <Text style={styles.productName}>
                      {item.product.name}
                    </Text>
                    <Text style={styles.productReason}>
                      {item.reason}
                    </Text>
                    <Text style={styles.productPrice}>
                      {formatShopMoney(item.product.price)}
                    </Text>

                    <View style={styles.productActions}>
                      <Pressable
                        style={styles.viewProductButton}
                        onPress={() =>
                          router.push({
                            pathname: '/product-details',
                            params: { id: item.product.id },
                          })
                        }
                      >
                        <Text style={styles.viewProductText}>View Product</Text>
                      </Pressable>

                      {role === 'customer' ? (
                        <Pressable
                          style={[
                            styles.addProductButton,
                            addedProductId === item.product.id &&
                              styles.addedProductButton,
                          ]}
                          onPress={() => {
                            addToCart(item.product.id);
                            setAddedProductId(item.product.id);
                          }}
                        >
                          <Ionicons
                            name={
                              addedProductId === item.product.id
                                ? 'checkmark'
                                : 'cart'
                            }
                            size={14}
                            color="#ffffff"
                          />
                          <Text style={styles.addProductText}>
                            {addedProductId === item.product.id
                              ? 'Added'
                              : 'Add to Cart'}
                          </Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          style={styles.addProductButton}
                          onPress={() =>
                            router.push({
                              pathname: '/job-materials',
                              params: { requestId: params.requestId },
                            } as Href)
                          }
                        >
                          <Ionicons
                            name="shield-checkmark-outline"
                            size={14}
                            color="#ffffff"
                          />
                          <Text style={styles.addProductText}>
                            Request Approval
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              ))}

              <Text style={styles.recommendationDisclaimer}>
                Worker-side product actions require customer approval before
                entering the customer purchase flow.
              </Text>
            </View>
          ) : null}
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

        <View style={styles.composer}>
          <View style={styles.identityPill}>
            <Ionicons
              name={role === 'worker' ? 'construct' : 'person'}
              size={14}
              color={COLORS.primary}
            />
            <Text style={styles.identityText}>
              {profile?.display_name ?? (role === 'worker' ? 'Worker' : 'Customer')}
            </Text>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="Write a message…"
              placeholderTextColor={COLORS.muted}
              multiline
              maxLength={4000}
            />

            <Pressable
              style={[
                styles.sendButton,
                (!draft.trim() || sending) && styles.disabled,
              ]}
              disabled={!draft.trim() || sending}
              onPress={() => void handleSend()}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={18} color="#fff" />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: {
    minHeight: 68,
    paddingHorizontal: 14,
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 13, fontWeight: '900', color: COLORS.text },
  headerSubtitle: { marginTop: 2, fontSize: 9.5, color: COLORS.muted },
  materialButton: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
  },
  materialButtonText: { fontSize: 8.5, fontWeight: '900', color: COLORS.primary },
  secureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: '#eaf8f0',
  },
  secureText: { fontSize: 8.5, fontWeight: '900', color: COLORS.green },
  contextBar: {
    margin: 12,
    marginBottom: 0,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
  },
  contextTitle: { fontSize: 10.5, fontWeight: '900', color: COLORS.primary },
  contextText: { marginTop: 2, fontSize: 9.5, lineHeight: 14, color: COLORS.muted },
  messages: { flex: 1 },
  messagesContent: { padding: 14, paddingBottom: 22 },
  empty: { paddingVertical: 70, alignItems: 'center' },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
  },
  emptyTitle: { marginTop: 12, fontSize: 14, fontWeight: '900', color: COLORS.text },
  emptyText: {
    marginTop: 5,
    maxWidth: 310,
    fontSize: 10.5,
    lineHeight: 16,
    textAlign: 'center',
    color: COLORS.muted,
  },
  messageWrap: { marginBottom: 9 },
  messageWrapMine: { alignItems: 'flex-end' },
  messageWrapOther: { alignItems: 'flex-start' },
  bubble: { maxWidth: '82%', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 15 },
  bubbleMine: { borderBottomRightRadius: 4, backgroundColor: COLORS.primary },
  bubbleOther: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  messageText: { fontSize: 11, lineHeight: 17 },
  messageTextMine: { color: '#fff' },
  messageTextOther: { color: COLORS.text },
  time: { marginTop: 4, fontSize: 8.5 },
  timeMine: { color: '#c9c8ff', textAlign: 'right' },
  timeOther: { color: COLORS.muted },
  recommendationPanel: {
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dcd9f0',
    borderRadius: 16,
    backgroundColor: '#faf9ff',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recommendationIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  recommendationTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: COLORS.primary,
  },
  recommendationSub: {
    marginTop: 2,
    fontSize: 8.5,
    color: COLORS.muted,
  },
  productCard: {
    marginTop: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor: COLORS.card,
  },
  productIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
  },
  productName: {
    fontSize: 10.5,
    fontWeight: '900',
    color: COLORS.text,
  },
  productReason: {
    marginTop: 3,
    fontSize: 8.3,
    lineHeight: 12,
    color: COLORS.muted,
  },
  productPrice: {
    marginTop: 4,
    fontSize: 10.5,
    fontWeight: '900',
    color: COLORS.orange,
  },
  productActions: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 6,
  },
  viewProductButton: {
    flex: 1,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: COLORS.primarySoft,
  },
  viewProductText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: COLORS.primary,
  },
  addProductButton: {
    flex: 1,
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 9,
    backgroundColor: COLORS.orange,
  },
  addedProductButton: {
    backgroundColor: COLORS.green,
  },
  addProductText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#ffffff',
  },
  recommendationDisclaimer: {
    marginTop: 9,
    fontSize: 7.8,
    lineHeight: 12,
    color: COLORS.muted,
  },

  inlineError: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 11,
    backgroundColor: '#fff0ef',
  },
  inlineErrorText: { flex: 1, fontSize: 9.5, color: COLORS.red },
  composer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#fff',
  },
  identityPill: {
    marginBottom: 7,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
  },
  identityText: { fontSize: 8.5, fontWeight: '800', color: COLORS.primary },
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
    backgroundColor: COLORS.orange,
  },
  disabled: { opacity: 0.45 },
  center: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  centerTitle: { marginTop: 10, fontSize: 15, fontWeight: '900', color: COLORS.text },
  centerText: {
    marginTop: 8,
    maxWidth: 330,
    textAlign: 'center',
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.muted,
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
  },
  retryText: { fontSize: 10.5, fontWeight: '900', color: '#fff' },
});
