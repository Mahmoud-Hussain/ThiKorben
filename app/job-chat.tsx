import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
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

import {
  addToCart,
  formatShopMoney,
  getCartCount,
  getProductById,
  ShopProduct,
} from '@/constants/shop-data';

import { recommendProductsFromMessage } from '@/constants/product-recommendation';

import {
  getActiveChatContext,
  getDemoRole,
  MarketplaceChatMessage,
  MessageRecommendation,
  selectJob,
  sendChatMessage,
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
  warningSoft: '#FFF8E7',
};

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(part => part[0])
    .join('');
}

function ProductCard({
  product,
  reason,
  confidence,
  added,
  onView,
  onAdd,
}: {
  product: ShopProduct;
  reason: string;
  confidence: 'high' | 'medium';
  added: boolean;
  onView: () => void;
  onAdd: () => void;
}) {
  return (
    <View style={styles.productCard}>
      <View style={styles.productTop}>
        <View style={styles.productIcon}>
          <Ionicons name={product.icon} size={24} color={COLORS.purple} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.matchRow}>
            <Ionicons name="sparkles" size={11} color={COLORS.success} />

            <Text style={styles.matchText}>
              {confidence === 'high' ? 'HIGH MATCH' : 'MATCH'}
            </Text>
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          <Text numberOfLines={1} style={styles.reason}>
            {reason}
          </Text>
        </View>

        <Text style={styles.productPrice}>
          {formatShopMoney(product.price)}
        </Text>
      </View>

      <View style={styles.productMeta}>
        <Text style={styles.metaText}>⭐ {product.rating}</Text>

        <Text style={styles.metaText}>{product.stock} in stock</Text>

        <Text style={styles.metaText}>
          {product.warrantyMonths
            ? `${product.warrantyMonths}m warranty`
            : 'Shop guarantee'}
        </Text>
      </View>

      <View style={styles.productActions}>
        <Pressable onPress={onView} style={styles.viewButton}>
          <Text style={styles.viewText}>View Product</Text>
        </Pressable>

        <Pressable
          onPress={onAdd}
          disabled={added}
          style={[styles.addButton, added && styles.addedButton]}
        >
          <Ionicons
            name={added ? 'checkmark' : 'cart-outline'}
            size={13}
            color="#FFFFFF"
          />

          <Text style={styles.addText}>{added ? 'Added' : 'Add to Cart'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function MessageBubble({
  message,
  customerName,
  workerName,
  addedProductIds,
  onViewProduct,
  onAddProduct,
}: {
  message: MarketplaceChatMessage;
  customerName: string;
  workerName: string;
  addedProductIds: string[];
  onViewProduct: (product: ShopProduct) => void;
  onAddProduct: (product: ShopProduct) => void;
}) {
  if (message.senderRole === 'system') {
    return (
      <View style={styles.systemMessage}>
        <Ionicons name="information-circle" size={17} color={COLORS.success} />

        <View style={{ flex: 1 }}>
          <Text style={styles.systemText}>{message.text}</Text>

          <Text style={styles.systemTime}>{message.time}</Text>
        </View>
      </View>
    );
  }

  const customer = message.senderRole === 'customer';

  const recommendations = (message.recommendations ?? [])
    .map(item => {
      const product = getProductById(item.productId);

      if (!product) {
        return null;
      }

      return {
        product,
        reason: item.reason,
        confidence: item.confidence,
      };
    })
    .filter(
      (
        item,
      ): item is {
        product: ShopProduct;
        reason: string;
        confidence: 'high' | 'medium';
      } => item !== null,
    );

  return (
    <View style={styles.messageGroup}>
      <View
        style={[
          styles.messageRow,
          customer ? styles.customerRow : styles.workerRow,
        ]}
      >
        {!customer && (
          <View style={styles.workerAvatar}>
            <Text style={styles.avatarText}>{initials(workerName)}</Text>
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            customer ? styles.customerBubble : styles.workerBubble,
          ]}
        >
          <Text
            style={[
              styles.senderName,
              {
                color: customer ? COLORS.orangeDark : '#DDD9FF',
              },
            ]}
          >
            {customer ? customerName : workerName}
          </Text>

          <Text
            style={[
              styles.messageText,
              {
                color: customer ? '#704324' : '#FFFFFF',
              },
            ]}
          >
            {message.text}
          </Text>

          {recommendations.length > 0 && (
            <View style={styles.matchIndicator}>
              <Ionicons
                name="sparkles"
                size={11}
                color={customer ? COLORS.orange : '#FFFFFF'}
              />

              <Text
                style={[
                  styles.matchIndicatorText,
                  {
                    color: customer ? COLORS.orangeDark : '#FFFFFF',
                  },
                ]}
              >
                {recommendations.length} product match
                {recommendations.length > 1 ? 'es' : ''}
              </Text>
            </View>
          )}

          <Text
            style={[
              styles.messageTime,
              {
                color: customer ? '#B56D38' : '#C8C4E9',
              },
            ]}
          >
            {message.time}
          </Text>
        </View>

        {customer && (
          <View style={styles.customerAvatar}>
            <Text style={styles.avatarText}>{initials(customerName)}</Text>
          </View>
        )}
      </View>

      {recommendations.length > 0 && (
        <View style={styles.recommendationPanel}>
          <View style={styles.recommendationHeader}>
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles" size={15} color="#FFFFFF" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.recommendationTitle}>
                ThiKorben Smart Product Match
              </Text>

              <Text style={styles.recommendationSub}>
                Products matched from the job conversation
              </Text>
            </View>
          </View>

          {recommendations.map(item => (
            <ProductCard
              key={item.product.id}
              product={item.product}
              reason={item.reason}
              confidence={item.confidence}
              added={addedProductIds.includes(item.product.id)}
              onView={() => onViewProduct(item.product)}
              onAdd={() => onAddProduct(item.product)}
            />
          ))}

          <Text style={styles.disclaimer}>
            Confirm product suitability before purchase.
          </Text>
        </View>
      )}
    </View>
  );
}

export default function JobChatScreen() {
  useMarketplaceVersion();

  const context = getActiveChatContext();

  const role = getDemoRole();

  const scrollRef = useRef<ScrollView>(null);

  const [draft, setDraft] = useState('');

  const [cartCount, setCartCount] = useState(getCartCount());

  const [addedProductIds, setAddedProductIds] = useState<string[]>([]);

  const pulse = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      setCartCount(getCartCount());
    }, []),
  );

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.35,
          duration: 800,
          useNativeDriver: true,
        }),

        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [pulse]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollToEnd({
        animated: true,
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [context?.thread.messages.length]);

  if (!context) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No active conversation</Text>

          <Pressable
            onPress={() => router.replace('/community')}
            style={styles.emptyButton}
          >
            <Text style={styles.emptyButtonText}>Open Community</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const { job, worker, thread, accepted, isAccepted } = context;

  const messages = thread.messages;

  const existingProductIds = new Set(
    messages.flatMap(message =>
      (message.recommendations ?? []).map(
        recommendation => recommendation.productId,
      ),
    ),
  );

  const addMessage = (customText?: string) => {
    const text = (customText ?? draft).trim();

    if (!text) {
      return;
    }

    let recommendations: MessageRecommendation[] | undefined;

    if (isAccepted) {
      const matches = recommendProductsFromMessage(text).filter(
        item => !existingProductIds.has(item.product.id),
      );

      if (matches.length > 0) {
        recommendations = matches.map(item => ({
          productId: item.product.id,

          reason: item.reason,

          confidence: item.confidence,
        }));
      }
    }

    sendChatMessage(text, role, recommendations);

    setDraft('');
  };

  const openProduct = (product: ShopProduct) => {
    router.push({
      pathname: '/product-details',
      params: {
        id: product.id,
      },
    });
  };

  const addProduct = (product: ShopProduct) => {
    if (addedProductIds.includes(product.id)) {
      return;
    }

    addToCart(product.id);

    setAddedProductIds(current => [...current, product.id]);

    setCartCount(getCartCount());
  };

  const workerQuickReplies = isAccepted
    ? [
        'I can arrive in 30 minutes.',
        'I will inspect it first.',
        'You may need a 1/2 inch PVC connector and Teflon tape.',
      ]
    : [
        'Could you share more details about the problem?',
        'I am available today.',
        'I can send you a proposal after checking the details.',
      ];

  const customerQuickReplies = [
    'Okay, thank you.',
    'When can you arrive?',
    'What will the labor cost be?',
  ];

  const quickReplies =
    role === 'worker' ? workerQuickReplies : customerQuickReplies;

  const partnerName = role === 'worker' ? job.customerName : worker.name;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.appShell}>
            <View style={styles.header}>
              <Pressable
                onPress={() => router.back()}
                style={styles.headerButton}
              >
                <Ionicons name="arrow-back" size={20} color={COLORS.text} />
              </Pressable>

              <View style={styles.partnerArea}>
                <View style={styles.partnerAvatar}>
                  <Text style={styles.avatarText}>{initials(partnerName)}</Text>

                  <View style={styles.onlineWrapper}>
                    <Animated.View
                      style={[
                        styles.onlinePulse,
                        {
                          transform: [
                            {
                              scale: pulse,
                            },
                          ],
                        },
                      ]}
                    />

                    <View style={styles.onlineDot} />
                  </View>
                </View>

                <View>
                  <Text style={styles.partnerName}>{partnerName}</Text>

                  <Text style={styles.partnerStatus}>
                    Online •{' '}
                    {role === 'worker' ? 'Customer' : worker.profession}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => router.push('/cart')}
                style={styles.cartButton}
              >
                <Ionicons name="cart-outline" size={18} color={COLORS.purple} />

                {cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>
                      {cartCount > 9 ? '9+' : cartCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            <View style={styles.jobContext}>
              <View style={styles.contextHeader}>
                <View
                  style={[
                    styles.contextIcon,
                    isAccepted
                      ? {
                          backgroundColor: COLORS.successSoft,
                        }
                      : undefined,
                  ]}
                >
                  <Ionicons
                    name={
                      isAccepted
                        ? 'checkmark-circle-outline'
                        : 'chatbubbles-outline'
                    }
                    size={18}
                    color={isAccepted ? COLORS.success : COLORS.purple}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.contextLabel,
                      {
                        color: isAccepted ? COLORS.success : COLORS.purple,
                      },
                    ]}
                  >
                    {isAccepted ? 'ACTIVE JOB CHAT' : 'PRIVATE JOB INQUIRY'}
                  </Text>

                  <Text numberOfLines={1} style={styles.contextTitle}>
                    {job.title}
                  </Text>
                </View>

                <Pressable
                  onPress={() => {
                    selectJob(job.id);

                    router.push({
                      pathname: '/job-board',
                      params: {
                        mode: 'detail',
                      },
                    });
                  }}
                  style={styles.detailsButton}
                >
                  <Text style={styles.detailsText}>Details</Text>
                </Pressable>
              </View>

              <View style={styles.contextStats}>
                <Text style={styles.contextStat}>
                  Budget {formatShopMoney(job.budget)}
                </Text>

                <Text style={styles.contextStat}>
                  {isAccepted
                    ? `Labor ${formatShopMoney(accepted?.price ?? 0)}`
                    : 'Worker not selected yet'}
                </Text>
              </View>
            </View>

            {!isAccepted && (
              <View style={styles.inquiryNotice}>
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color={COLORS.purple}
                />

                <Text style={styles.inquiryNoticeText}>
                  This is a private inquiry. Smart product purchase and final
                  billing activate after a proposal is accepted.
                </Text>
              </View>
            )}

            <View style={styles.roleArea}>
              <Text style={styles.roleAreaText}>Conversation as</Text>

              <View style={styles.roleSwitcher}>
                <Pressable
                  onPress={() => setDemoRole('customer')}
                  style={[
                    styles.roleOption,
                    role === 'customer' && styles.customerActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.roleText,
                      role === 'customer' && styles.activeRoleText,
                    ]}
                  >
                    Customer
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setDemoRole('worker')}
                  style={[
                    styles.roleOption,
                    role === 'worker' && styles.workerActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.roleText,
                      role === 'worker' && styles.activeRoleText,
                    ]}
                  >
                    Worker
                  </Text>
                </Pressable>
              </View>
            </View>

            <ScrollView
              ref={scrollRef}
              style={styles.messages}
              contentContainerStyle={styles.messagesContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {messages.map(message => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  customerName={job.customerName}
                  workerName={worker.name}
                  addedProductIds={addedProductIds}
                  onViewProduct={openProduct}
                  onAddProduct={addProduct}
                />
              ))}
            </ScrollView>

            <View style={styles.quickArea}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickContent}
              >
                {quickReplies.map(reply => (
                  <Pressable
                    key={reply}
                    onPress={() => addMessage(reply)}
                    style={styles.quickReply}
                  >
                    <Text style={styles.quickReplyText}>{reply}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.composer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder={`Message ${partnerName}...`}
                  placeholderTextColor="#A2A6B3"
                  multiline
                  returnKeyType="send"
                  submitBehavior="submit"
                  onSubmitEditing={() => addMessage()}
                  style={styles.input}
                />
              </View>

              <Pressable
                onPress={() => addMessage()}
                disabled={!draft.trim()}
                style={[
                  styles.sendButton,
                  !draft.trim() && styles.disabledButton,
                ]}
              >
                <Ionicons name="send" size={17} color="#FFFFFF" />
              </Pressable>
            </View>
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

  appShell: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: COLORS.background,
  },

  header: {
    height: 63,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },

  headerButton: {
    width: 37,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
  },

  partnerArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  partnerAvatar: {
    width: 39,
    height: 39,
    marginRight: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.purple,
  },

  avatarText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  onlineWrapper: {
    position: 'absolute',
    right: -3,
    bottom: -2,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  onlinePulse: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.25,
    backgroundColor: COLORS.success,
  },

  onlineDot: {
    width: 8,
    height: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },

  partnerName: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.text,
  },

  partnerStatus: {
    marginTop: 2,
    fontSize: 6.7,
    color: COLORS.success,
  },

  cartButton: {
    width: 37,
    height: 37,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: COLORS.orangeSoft,
  },

  cartBadge: {
    minWidth: 15,
    height: 15,
    position: 'absolute',
    top: -3,
    right: -3,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    backgroundColor: COLORS.orange,
  },

  cartBadgeText: {
    fontSize: 6,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  jobContext: {
    margin: 10,
    marginBottom: 0,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.card,
  },

  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  contextIcon: {
    width: 36,
    height: 36,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: COLORS.purpleSoft,
  },

  contextLabel: {
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  contextTitle: {
    marginTop: 2,
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  detailsButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.purpleSoft,
  },

  detailsText: {
    fontSize: 6.5,
    fontWeight: '900',
    color: COLORS.purple,
  },

  contextStats: {
    marginTop: 8,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  contextStat: {
    fontSize: 7,
    fontWeight: '800',
    color: COLORS.muted,
  },

  inquiryNotice: {
    marginHorizontal: 10,
    marginTop: 7,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    borderRadius: 11,
    backgroundColor: COLORS.purpleSoft,
  },

  inquiryNoticeText: {
    flex: 1,
    fontSize: 6.5,
    lineHeight: 10,
    color: '#66628D',
  },

  roleArea: {
    marginHorizontal: 10,
    marginTop: 7,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    backgroundColor: '#EBEDF2',
  },

  roleAreaText: {
    fontSize: 7,
    fontWeight: '800',
    color: COLORS.muted,
  },

  roleSwitcher: {
    padding: 2,
    flexDirection: 'row',
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },

  roleOption: {
    minHeight: 27,
    paddingHorizontal: 8,
    justifyContent: 'center',
    borderRadius: 7,
  },

  customerActive: {
    backgroundColor: COLORS.orange,
  },

  workerActive: {
    backgroundColor: COLORS.purple,
  },

  roleText: {
    fontSize: 6.5,
    fontWeight: '900',
    color: COLORS.muted,
  },

  activeRoleText: {
    color: '#FFFFFF',
  },

  messages: {
    flex: 1,
  },

  messagesContent: {
    padding: 11,
    paddingBottom: 10,
  },

  systemMessage: {
    marginBottom: 10,
    padding: 9,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    borderRadius: 11,
    backgroundColor: COLORS.successSoft,
  },

  systemText: {
    fontSize: 7.5,
    lineHeight: 11,
    color: '#417158',
  },

  systemTime: {
    marginTop: 3,
    fontSize: 5.8,
    color: '#799887',
  },

  messageGroup: {
    marginBottom: 10,
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  customerRow: {
    justifyContent: 'flex-end',
  },

  workerRow: {
    justifyContent: 'flex-start',
  },

  workerAvatar: {
    width: 27,
    height: 27,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: COLORS.purple,
  },

  customerAvatar: {
    width: 27,
    height: 27,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: COLORS.orange,
  },

  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
  },

  customerBubble: {
    borderBottomRightRadius: 4,
    backgroundColor: COLORS.orangeSoft,
  },

  workerBubble: {
    borderBottomLeftRadius: 4,
    backgroundColor: COLORS.purple,
  },

  senderName: {
    marginBottom: 3,
    fontSize: 6.5,
    fontWeight: '900',
  },

  messageText: {
    fontSize: 8.5,
    lineHeight: 13,
  },

  messageTime: {
    marginTop: 4,
    textAlign: 'right',
    fontSize: 5.8,
  },

  matchIndicator: {
    marginTop: 6,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  matchIndicatorText: {
    fontSize: 6,
    fontWeight: '900',
  },

  recommendationPanel: {
    marginTop: 7,
    marginLeft: 33,
    padding: 9,
    borderWidth: 1,
    borderColor: '#DCD9F0',
    borderRadius: 14,
    backgroundColor: '#FAF9FF',
  },

  recommendationHeader: {
    marginBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiIcon: {
    width: 31,
    height: 31,
    marginRight: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.purple,
  },

  recommendationTitle: {
    fontSize: 7.8,
    fontWeight: '900',
    color: COLORS.purpleDark,
  },

  recommendationSub: {
    marginTop: 1,
    fontSize: 5.8,
    color: COLORS.muted,
  },

  productCard: {
    marginTop: 7,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    backgroundColor: COLORS.card,
  },

  productTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  productIcon: {
    width: 44,
    height: 44,
    marginRight: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.purpleSoft,
  },

  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  matchText: {
    fontSize: 5.5,
    fontWeight: '900',
    color: COLORS.success,
  },

  productName: {
    marginTop: 3,
    fontSize: 7.8,
    fontWeight: '900',
    color: COLORS.text,
  },

  reason: {
    marginTop: 2,
    fontSize: 5.7,
    color: COLORS.muted,
  },

  productPrice: {
    marginLeft: 5,
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  productMeta: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 8,
  },

  metaText: {
    fontSize: 5.8,
    color: COLORS.muted,
  },

  productActions: {
    marginTop: 7,
    flexDirection: 'row',
    gap: 5,
  },

  viewButton: {
    flex: 1,
    minHeight: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.purpleSoft,
  },

  viewText: {
    fontSize: 6.5,
    fontWeight: '900',
    color: COLORS.purple,
  },

  addButton: {
    flex: 1,
    minHeight: 31,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 8,
    backgroundColor: COLORS.orange,
  },

  addedButton: {
    backgroundColor: COLORS.success,
  },

  addText: {
    fontSize: 6.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  disclaimer: {
    marginTop: 7,
    fontSize: 5.8,
    color: COLORS.muted,
  },

  quickArea: {
    minHeight: 41,
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },

  quickContent: {
    paddingHorizontal: 9,
    gap: 5,
  },

  quickReply: {
    minHeight: 29,
    maxWidth: 230,
    paddingHorizontal: 9,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: COLORS.purpleSoft,
  },

  quickReplyText: {
    fontSize: 6.5,
    fontWeight: '800',
    color: COLORS.purple,
  },

  composer: {
    minHeight: 61,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },

  inputWrapper: {
    flex: 1,
    minHeight: 40,
    maxHeight: 90,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: '#F8F8FB',
  },

  input: {
    maxHeight: 80,
    paddingVertical: 8,
    fontSize: 8.5,
    color: COLORS.text,
  },

  sendButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.orange,
  },

  disabledButton: {
    opacity: 0.35,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
  },

  emptyButton: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 11,
    backgroundColor: COLORS.purple,
  },

  emptyButtonText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
