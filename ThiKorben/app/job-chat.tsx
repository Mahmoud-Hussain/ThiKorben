import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

import {
  addToCart,
  formatShopMoney,
  getCartCount,
  getProductById,
  ShopProduct,
} from '@/constants/shop-data';

import { recommendProductsFromMessage } from '@/constants/product-recommendation';

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

  danger: '#D9485F',
  softGray: '#F1F2F6',
};

type Role = 'customer' | 'worker';

type Sender = Role | 'system';

type MessageRecommendation = {
  productId: string;
  reason: string;
  confidence: 'high' | 'medium';
};

type ChatMessage = {
  id: string;
  sender: Sender;
  text: string;
  time: string;
  recommendations?: MessageRecommendation[];
};

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

type ProductRecommendationCardProps = {
  product: ShopProduct;
  reason: string;
  confidence: 'high' | 'medium';
  added: boolean;
  onView: () => void;
  onAdd: () => void;
};

function ProductRecommendationCard({
  product,
  reason,
  confidence,
  added,
  onView,
  onAdd,
}: ProductRecommendationCardProps) {
  return (
    <View style={styles.recommendationProductCard}>
      <View style={styles.recommendationProductTop}>
        <View style={styles.recommendationProductIcon}>
          <Ionicons name={product.icon} size={25} color={COLORS.purple} />
        </View>

        <View style={styles.recommendationProductInfo}>
          <View style={styles.matchRow}>
            <View
              style={[
                styles.matchBadge,
                confidence === 'high'
                  ? styles.highMatchBadge
                  : styles.mediumMatchBadge,
              ]}
            >
              <Ionicons
                name="sparkles"
                size={9}
                color={confidence === 'high' ? COLORS.success : COLORS.warning}
              />

              <Text
                style={[
                  styles.matchBadgeText,
                  {
                    color: confidence === 'high' ? COLORS.success : '#9A6B00',
                  },
                ]}
              >
                {confidence === 'high' ? 'HIGH MATCH' : 'MATCH'}
              </Text>
            </View>

            <Text style={styles.productStock}>{product.stock} in stock</Text>
          </View>

          <Text numberOfLines={2} style={styles.recommendationProductName}>
            {product.name}
          </Text>

          <Text numberOfLines={1} style={styles.matchReason}>
            {reason}
          </Text>
        </View>

        <View style={styles.productPriceArea}>
          <Text style={styles.productPrice}>
            {formatShopMoney(product.price)}
          </Text>

          {product.oldPrice && (
            <Text style={styles.productOldPrice}>
              {formatShopMoney(product.oldPrice)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.productMetaRow}>
        <View style={styles.productMeta}>
          <Ionicons name="star" size={11} color={COLORS.warning} />

          <Text style={styles.productMetaText}>{product.rating}</Text>
        </View>

        <View style={styles.productMeta}>
          <Ionicons
            name="shield-checkmark-outline"
            size={11}
            color={product.warrantyMonths ? COLORS.success : COLORS.muted}
          />

          <Text
            style={[
              styles.productMetaText,
              product.warrantyMonths ? { color: COLORS.success } : undefined,
            ]}
          >
            {product.warrantyMonths
              ? `${product.warrantyMonths} month warranty`
              : 'Standard guarantee'}
          </Text>
        </View>
      </View>

      <View style={styles.recommendationActions}>
        <Pressable onPress={onView} style={styles.viewProductButton}>
          <Ionicons name="open-outline" size={13} color={COLORS.purple} />

          <Text style={styles.viewProductText}>View Product</Text>
        </Pressable>

        <Pressable
          onPress={onAdd}
          disabled={added}
          style={[styles.inlineAddButton, added && styles.inlineAddButtonAdded]}
        >
          <Ionicons
            name={added ? 'checkmark-circle' : 'cart-outline'}
            size={13}
            color="#FFFFFF"
          />

          <Text style={styles.inlineAddText}>
            {added ? 'Added' : 'Add to Cart'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

type MessageBubbleProps = {
  message: ChatMessage;
  addedProductIds: string[];
  onViewProduct: (product: ShopProduct) => void;
  onAddProduct: (product: ShopProduct) => void;
};

function MessageBubble({
  message,
  addedProductIds,
  onViewProduct,
  onAddProduct,
}: MessageBubbleProps) {
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

  const recommendationProducts = (message.recommendations ?? [])
    .map(recommendation => {
      const product = getProductById(recommendation.productId);

      if (!product) {
        return null;
      }

      return {
        product,
        reason: recommendation.reason,
        confidence: recommendation.confidence,
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
              isCustomer
                ? styles.customerMessageText
                : styles.workerMessageText,
            ]}
          >
            {message.text}
          </Text>

          {recommendationProducts.length > 0 && (
            <View
              style={[
                styles.detectionChip,
                isCustomer
                  ? styles.customerDetectionChip
                  : styles.workerDetectionChip,
              ]}
            >
              <Ionicons
                name="sparkles"
                size={12}
                color={isCustomer ? COLORS.orangeDark : '#FFFFFF'}
              />

              <Text
                style={[
                  styles.detectionChipText,
                  {
                    color: isCustomer ? COLORS.orangeDark : '#FFFFFF',
                  },
                ]}
              >
                {recommendationProducts.length} shop product
                {recommendationProducts.length > 1 ? 's' : ''} matched
              </Text>
            </View>
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

      {recommendationProducts.length > 0 && (
        <View style={styles.recommendationPanel}>
          <View style={styles.recommendationPanelHeader}>
            <View style={styles.recommendationAIIcon}>
              <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            </View>

            <View style={styles.recommendationHeaderContent}>
              <Text style={styles.recommendationTitle}>
                ThiKorben Smart Product Match
              </Text>

              <Text style={styles.recommendationSubtitle}>
                Matching products found from the worker conversation
              </Text>
            </View>

            <View style={styles.prototypeBadge}>
              <Text style={styles.prototypeBadgeText}>SMART</Text>
            </View>
          </View>

          {recommendationProducts.map(({ product, reason, confidence }) => (
            <ProductRecommendationCard
              key={product.id}
              product={product}
              reason={reason}
              confidence={confidence}
              added={addedProductIds.includes(product.id)}
              onView={() => onViewProduct(product)}
              onAdd={() => onAddProduct(product)}
            />
          ))}

          <View style={styles.recommendationDisclaimer}>
            <Ionicons
              name="information-circle-outline"
              size={13}
              color={COLORS.muted}
            />

            <Text style={styles.recommendationDisclaimerText}>
              Suggestions are based on product terms in the conversation.
              Confirm suitability before purchase.
            </Text>
          </View>
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

  const [detectedProductIds, setDetectedProductIds] = useState<string[]>([]);

  const [addedProductIds, setAddedProductIds] = useState<string[]>([]);

  const [cartCount, setCartCount] = useState(getCartCount());

  const entranceOpacity = useRef(new Animated.Value(0)).current;

  const entranceTranslate = useRef(new Animated.Value(15)).current;

  const onlinePulse = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      setCartCount(getCartCount());
    }, []),
  );

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

    const productMatches = recommendProductsFromMessage(text).filter(
      recommendation => !detectedProductIds.includes(recommendation.product.id),
    );

    const recommendations: MessageRecommendation[] | undefined =
      productMatches.length > 0
        ? productMatches.map(recommendation => ({
            productId: recommendation.product.id,
            reason: recommendation.reason,
            confidence: recommendation.confidence,
          }))
        : undefined;

    const message: ChatMessage = {
      id: `${Date.now()}`,
      sender: role,
      text,
      time: getCurrentTime(),
      recommendations,
    };

    setMessages(current => [...current, message]);

    if (productMatches.length > 0) {
      setDetectedProductIds(current => [
        ...new Set([
          ...current,
          ...productMatches.map(recommendation => recommendation.product.id),
        ]),
      ]);
    }

    setDraft('');
  };

  const quickReplies =
    role === 'customer' ? CUSTOMER_QUICK_REPLIES : WORKER_QUICK_REPLIES;

  const openProduct = (product: ShopProduct) => {
    router.push({
      pathname: '/product-details',
      params: {
        id: product.id,
      },
    });
  };

  const addProductFromChat = (product: ShopProduct) => {
    if (addedProductIds.includes(product.id)) {
      return;
    }

    addToCart(product.id);

    setAddedProductIds(current => [...current, product.id]);

    setCartCount(getCartCount());
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

              <View style={styles.headerActions}>
                <Pressable
                  onPress={() =>
                    Alert.alert('Call Worker', 'Calling Rahim Ahmed...')
                  }
                  style={styles.callButton}
                >
                  <Ionicons
                    name="call-outline"
                    size={17}
                    color={COLORS.purple}
                  />
                </Pressable>

                <Pressable
                  onPress={() => router.push('/cart')}
                  style={styles.cartButton}
                >
                  <Ionicons
                    name="cart-outline"
                    size={18}
                    color={COLORS.purple}
                  />

                  {cartCount > 0 && (
                    <View style={styles.cartCountBadge}>
                      <Text style={styles.cartCountText}>
                        {cartCount > 9 ? '9+' : cartCount}
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
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

              <View style={styles.demoArea}>
                <View>
                  <Text style={styles.demoLabel}>Demo conversation as</Text>

                  <Text style={styles.demoHint}>
                    Switch sides to test both users
                  </Text>
                </View>

                <RoleSwitcher role={role} onChange={setRole} />
              </View>

              {detectedProductIds.length > 0 && (
                <View style={styles.aiDetectionCard}>
                  <View style={styles.aiIcon}>
                    <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                  </View>

                  <View style={styles.aiContent}>
                    <Text style={styles.aiTitle}>
                      Smart product matches ready
                    </Text>

                    <Text style={styles.aiDescription}>
                      {detectedProductIds.length} unique shop product
                      {detectedProductIds.length > 1 ? 's' : ''} detected from
                      this chat
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => router.push('/shop')}
                    style={styles.shopMiniButton}
                  >
                    <Ionicons
                      name="bag-handle-outline"
                      size={13}
                      color="#FFFFFF"
                    />

                    <Text style={styles.shopMiniButtonText}>Shop</Text>
                  </Pressable>
                </View>
              )}

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
                    addedProductIds={addedProductIds}
                    onViewProduct={openProduct}
                    onAddProduct={addProductFromChat}
                  />
                ))}
              </ScrollView>

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
    paddingHorizontal: 9,

    flexDirection: 'row',
    alignItems: 'center',

    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,

    backgroundColor: COLORS.card,
  },

  headerButton: {
    width: 35,
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
    width: 38,
    height: 38,
    marginRight: 8,

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
    fontSize: 10.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  workerStatus: {
    marginTop: 2,

    fontSize: 7.8,
    color: COLORS.success,
  },

  headerActions: {
    flexDirection: 'row',

    gap: 5,
  },

  callButton: {
    width: 35,
    height: 35,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 11,

    backgroundColor: COLORS.purpleSoft,
  },

  cartButton: {
    width: 35,
    height: 35,

    position: 'relative',

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 11,

    backgroundColor: COLORS.orangeSoft,
  },

  cartCountBadge: {
    minWidth: 15,
    height: 15,

    position: 'absolute',
    right: -3,
    top: -3,

    paddingHorizontal: 2,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 2,
    borderColor: COLORS.card,
    borderRadius: 8,

    backgroundColor: COLORS.orange,
  },

  cartCountText: {
    fontSize: 6,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  content: {
    flex: 1,
  },

  jobContext: {
    marginHorizontal: 12,
    marginTop: 9,

    padding: 10,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,

    backgroundColor: COLORS.card,
  },

  jobContextTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  jobContextIcon: {
    width: 36,
    height: 36,
    marginRight: 8,

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

    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.6,

    color: COLORS.success,
  },

  jobContextTitle: {
    fontSize: 10,
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
    fontSize: 7.5,
    fontWeight: '900',
    color: COLORS.purple,
  },

  jobContextStats: {
    marginTop: 9,
    paddingTop: 8,

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
    fontSize: 7,
    color: COLORS.muted,
  },

  contextStatValue: {
    marginTop: 1,

    fontSize: 8.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  contextDivider: {
    width: 1,
    height: 25,
    marginHorizontal: 10,

    backgroundColor: COLORS.border,
  },

  demoArea: {
    marginHorizontal: 12,
    marginTop: 7,

    padding: 7,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderRadius: 12,

    backgroundColor: '#EEF0F5',
  },

  demoLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.text,
  },

  demoHint: {
    marginTop: 1,

    fontSize: 6.5,
    color: COLORS.muted,
  },

  roleSwitcher: {
    padding: 3,

    flexDirection: 'row',

    borderRadius: 10,

    backgroundColor: '#FFFFFF',
  },

  roleOption: {
    minHeight: 29,
    paddingHorizontal: 8,

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
    fontSize: 7.5,
    fontWeight: '800',
    color: COLORS.muted,
  },

  roleTextActive: {
    color: '#FFFFFF',
  },

  aiDetectionCard: {
    marginHorizontal: 12,
    marginTop: 7,
    padding: 8,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 13,

    backgroundColor: COLORS.purple,
  },

  aiIcon: {
    width: 31,
    height: 31,
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
    fontSize: 8.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  aiDescription: {
    marginTop: 2,

    fontSize: 6.8,
    color: '#DDD9FF',
  },

  shopMiniButton: {
    minHeight: 29,
    paddingHorizontal: 8,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,

    borderRadius: 9,

    backgroundColor: COLORS.orange,
  },

  shopMiniButtonText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  messages: {
    flex: 1,
    marginTop: 4,
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

  messageGroup: {
    marginBottom: 10,
  },

  messageRow: {
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

  detectionChip: {
    marginTop: 7,
    paddingHorizontal: 7,
    paddingVertical: 5,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,

    borderRadius: 8,
  },

  customerDetectionChip: {
    backgroundColor: '#FFFFFF',
  },

  workerDetectionChip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  detectionChipText: {
    fontSize: 6.7,
    fontWeight: '900',
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

  recommendationPanel: {
    marginTop: 7,
    marginLeft: 33,

    padding: 9,

    borderWidth: 1,
    borderColor: '#DDD9F3',
    borderRadius: 15,

    backgroundColor: '#FAF9FF',
  },

  recommendationPanelHeader: {
    marginBottom: 8,

    flexDirection: 'row',
    alignItems: 'center',
  },

  recommendationAIIcon: {
    width: 31,
    height: 31,
    marginRight: 7,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 10,

    backgroundColor: COLORS.purple,
  },

  recommendationHeaderContent: {
    flex: 1,
  },

  recommendationTitle: {
    fontSize: 8.5,
    fontWeight: '900',
    color: COLORS.purpleDark,
  },

  recommendationSubtitle: {
    marginTop: 1,

    fontSize: 6.5,
    color: COLORS.muted,
  },

  prototypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,

    borderRadius: 999,

    backgroundColor: COLORS.orangeSoft,
  },

  prototypeBadgeText: {
    fontSize: 6,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  recommendationProductCard: {
    marginTop: 7,
    padding: 9,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,

    backgroundColor: COLORS.card,
  },

  recommendationProductTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  recommendationProductIcon: {
    width: 47,
    height: 47,
    marginRight: 8,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 13,

    backgroundColor: COLORS.purpleSoft,
  },

  recommendationProductInfo: {
    flex: 1,
  },

  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 5,
  },

  matchBadge: {
    paddingHorizontal: 5,
    paddingVertical: 3,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 2,

    borderRadius: 999,
  },

  highMatchBadge: {
    backgroundColor: COLORS.successSoft,
  },

  mediumMatchBadge: {
    backgroundColor: COLORS.warningSoft,
  },

  matchBadgeText: {
    fontSize: 5.8,
    fontWeight: '900',
  },

  productStock: {
    fontSize: 6,
    color: COLORS.success,
  },

  recommendationProductName: {
    marginTop: 4,

    fontSize: 8.7,
    lineHeight: 12,
    fontWeight: '900',

    color: COLORS.text,
  },

  matchReason: {
    marginTop: 2,

    fontSize: 6.2,
    color: COLORS.muted,
  },

  productPriceArea: {
    marginLeft: 6,

    alignItems: 'flex-end',
  },

  productPrice: {
    fontSize: 10.5,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  productOldPrice: {
    marginTop: 2,

    fontSize: 6,
    textDecorationLine: 'line-through',

    color: '#A0A4AE',
  },

  productMetaRow: {
    marginTop: 7,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 10,
  },

  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 3,
  },

  productMetaText: {
    fontSize: 6.5,
    color: COLORS.muted,
  },

  recommendationActions: {
    marginTop: 8,

    flexDirection: 'row',

    gap: 6,
  },

  viewProductButton: {
    flex: 1,
    minHeight: 32,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 4,

    borderWidth: 1,
    borderColor: '#D8D5F2',
    borderRadius: 9,

    backgroundColor: COLORS.purpleSoft,
  },

  viewProductText: {
    fontSize: 7,
    fontWeight: '900',
    color: COLORS.purple,
  },

  inlineAddButton: {
    flex: 1,
    minHeight: 32,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 4,

    borderRadius: 9,

    backgroundColor: COLORS.orange,
  },

  inlineAddButtonAdded: {
    backgroundColor: COLORS.success,
  },

  inlineAddText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  recommendationDisclaimer: {
    marginTop: 8,
    paddingTop: 7,

    flexDirection: 'row',
    alignItems: 'flex-start',

    gap: 5,

    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  recommendationDisclaimerText: {
    flex: 1,

    fontSize: 6.2,
    lineHeight: 9,

    color: COLORS.muted,
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
    maxWidth: 220,
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
    maxWidth: 185,

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
