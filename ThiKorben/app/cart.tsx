import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  clearCart,
  formatShopMoney,
  getCartCount,
  getCartSubtotal,
  getDetailedCartItems,
  removeFromCart,
  updateCartQuantity,
} from '@/constants/shop-data';

const COLORS = {
  orange: '#FF7315',
  orangeDark: '#E85D04',

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
  dangerSoft: '#FFF0F2',

  softOrange: '#FFF4EA',
};

export default function CartScreen() {
  const [items, setItems] = useState(getDetailedCartItems());

  const refresh = useCallback(() => {
    setItems(getDetailedCartItems());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const updateQuantity = (productId: string, quantity: number) => {
    updateCartQuantity(productId, quantity);
    refresh();
  };

  const removeItem = (productId: string) => {
    removeFromCart(productId);
    refresh();
  };

  const handleClearCart = () => {
    Alert.alert('Clear cart?', 'All products will be removed from your cart.', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          clearCart();
          refresh();
        },
      },
    ]);
  };

  const subtotal = getCartSubtotal();
  const deliveryFee = items.length === 0 ? 0 : subtotal >= 1500 ? 0 : 80;
  const platformFee = items.length === 0 ? 0 : 20;
  const total = subtotal + deliveryFee + platformFee;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.appShell}>
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.text} />
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Shopping Cart</Text>

              <Text style={styles.headerSubtitle}>
                {getCartCount()} item{getCartCount() === 1 ? '' : 's'}
              </Text>
            </View>

            {items.length > 0 ? (
              <Pressable onPress={handleClearCart} style={styles.clearButton}>
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={COLORS.danger}
                />
              </Pressable>
            ) : (
              <View style={styles.headerButton} />
            )}
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconOuter}>
                <View style={styles.emptyIconInner}>
                  <Ionicons
                    name="cart-outline"
                    size={43}
                    color={COLORS.purple}
                  />
                </View>
              </View>

              <Text style={styles.emptyTitle}>Your cart is empty</Text>

              <Text style={styles.emptyText}>
                Add repair materials from ThiKorben Shop and they will appear
                here.
              </Text>

              <Pressable
                onPress={() => router.replace('/shop')}
                style={styles.shopButton}
              >
                <Ionicons name="bag-handle-outline" size={17} color="#FFFFFF" />

                <Text style={styles.shopButtonText}>Browse Shop</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.deliveryBanner}>
                  <View style={styles.deliveryIcon}>
                    <Ionicons
                      name="car-outline"
                      size={20}
                      color={COLORS.success}
                    />
                  </View>

                  <View style={styles.deliveryContent}>
                    <Text style={styles.deliveryTitle}>
                      {subtotal >= 1500
                        ? 'Free delivery unlocked'
                        : `${formatShopMoney(1500 - subtotal)} away from free delivery`}
                    </Text>

                    <Text style={styles.deliveryText}>
                      Dhaka delivery • Estimated 1-2 business days
                    </Text>
                  </View>
                </View>

                <View style={styles.sectionHeading}>
                  <Text style={styles.sectionTitle}>Your Products</Text>

                  <Text style={styles.sectionCount}>
                    {getCartCount()} items
                  </Text>
                </View>

                <View style={styles.itemList}>
                  {items.map(item => (
                    <View key={item.productId} style={styles.cartItem}>
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: '/product-details',
                            params: {
                              id: item.product.id,
                            },
                          })
                        }
                        style={styles.productIcon}
                      >
                        <Ionicons
                          name={item.product.icon}
                          size={28}
                          color={COLORS.purple}
                        />
                      </Pressable>

                      <View style={styles.productInfo}>
                        <Text style={styles.productCategory}>
                          {item.product.categoryLabel}
                        </Text>

                        <Text numberOfLines={2} style={styles.productName}>
                          {item.product.name}
                        </Text>

                        {item.product.warrantyMonths ? (
                          <View style={styles.warrantyRow}>
                            <Ionicons
                              name="shield-checkmark-outline"
                              size={11}
                              color={COLORS.success}
                            />

                            <Text style={styles.warrantyText}>
                              {item.product.warrantyMonths} month warranty
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.standardGuarantee}>
                            Standard shop guarantee
                          </Text>
                        )}

                        <View style={styles.itemBottomRow}>
                          <Text style={styles.productPrice}>
                            {formatShopMoney(item.product.price)}
                          </Text>

                          <View style={styles.quantitySelector}>
                            <Pressable
                              onPress={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity - 1,
                                )
                              }
                              style={styles.quantityButton}
                            >
                              <Ionicons
                                name="remove"
                                size={14}
                                color={COLORS.purple}
                              />
                            </Pressable>

                            <Text style={styles.quantityValue}>
                              {item.quantity}
                            </Text>

                            <Pressable
                              onPress={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1,
                                )
                              }
                              style={styles.quantityButton}
                            >
                              <Ionicons
                                name="add"
                                size={14}
                                color={COLORS.purple}
                              />
                            </Pressable>
                          </View>
                        </View>
                      </View>

                      <View style={styles.itemRight}>
                        <Pressable
                          onPress={() => removeItem(item.productId)}
                          style={styles.removeButton}
                        >
                          <Ionicons
                            name="close"
                            size={15}
                            color={COLORS.danger}
                          />
                        </Pressable>

                        <Text style={styles.lineTotal}>
                          {formatShopMoney(item.lineTotal)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <Pressable
                  onPress={() => router.push('/shop')}
                  style={styles.continueShoppingButton}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={17}
                    color={COLORS.purple}
                  />

                  <Text style={styles.continueShoppingText}>
                    Add More Products
                  </Text>
                </Pressable>

                <View style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <View style={styles.summaryIcon}>
                      <Ionicons
                        name="receipt-outline"
                        size={21}
                        color={COLORS.purple}
                      />
                    </View>

                    <View>
                      <Text style={styles.summaryTitle}>Order Summary</Text>

                      <Text style={styles.summarySubtitle}>
                        Transparent product charges
                      </Text>
                    </View>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Product subtotal</Text>

                    <Text style={styles.summaryValue}>
                      {formatShopMoney(subtotal)}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery</Text>

                    <Text
                      style={[
                        styles.summaryValue,
                        deliveryFee === 0 && styles.freeText,
                      ]}
                    >
                      {deliveryFee === 0
                        ? 'FREE'
                        : formatShopMoney(deliveryFee)}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <View>
                      <Text style={styles.summaryLabel}>Shop platform fee</Text>

                      <Text style={styles.feeHint}>
                        Order processing and support
                      </Text>
                    </View>

                    <Text style={styles.summaryValue}>
                      {formatShopMoney(platformFee)}
                    </Text>
                  </View>

                  <View style={styles.summaryDivider} />

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Shop Total</Text>

                    <Text style={styles.totalValue}>
                      {formatShopMoney(total)}
                    </Text>
                  </View>
                </View>

                <View style={styles.secureCard}>
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color={COLORS.success}
                  />

                  <View style={styles.secureContent}>
                    <Text style={styles.secureTitle}>
                      Secure ThiKorben purchase
                    </Text>

                    <Text style={styles.secureText}>
                      Product charges will later be included with the complete
                      job service cost breakdown.
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.bottomCheckout}>
                <View>
                  <Text style={styles.bottomTotalLabel}>Shop Total</Text>

                  <Text style={styles.bottomTotal}>
                    {formatShopMoney(total)}
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    Alert.alert(
                      'Checkout - Next Milestone',
                      `Current shop total: ${formatShopMoney(
                        total,
                      )}\n\nThe final workflow will combine labor cost, products, delivery and platform fees into the complete ThiKorben service checkout.`,
                    )
                  }
                  style={styles.checkoutButton}
                >
                  <Text style={styles.checkoutText}>Continue</Text>

                  <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
                </Pressable>
              </View>
            </>
          )}
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
    height: 62,
    paddingHorizontal: 11,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,

    backgroundColor: COLORS.card,
  },

  headerButton: {
    width: 39,
    height: 39,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,
  },

  headerCenter: {
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text,
  },

  headerSubtitle: {
    marginTop: 1,

    fontSize: 7.5,
    color: COLORS.muted,
  },

  clearButton: {
    width: 39,
    height: 39,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: COLORS.dangerSoft,
  },

  scrollContent: {
    paddingHorizontal: 13,
    paddingTop: 12,
    paddingBottom: 115,
  },

  deliveryBanner: {
    padding: 11,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 14,

    backgroundColor: COLORS.successSoft,
  },

  deliveryIcon: {
    width: 39,
    height: 39,
    marginRight: 9,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: '#FFFFFF',
  },

  deliveryContent: {
    flex: 1,
  },

  deliveryTitle: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#19744B',
  },

  deliveryText: {
    marginTop: 2,

    fontSize: 7.5,
    color: '#648A75',
  },

  sectionHeading: {
    marginTop: 16,
    marginBottom: 9,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.text,
  },

  sectionCount: {
    fontSize: 8,
    color: COLORS.muted,
  },

  itemList: {
    gap: 9,
  },

  cartItem: {
    minHeight: 129,
    padding: 10,

    flexDirection: 'row',

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,

    backgroundColor: COLORS.card,
  },

  productIcon: {
    width: 75,
    height: 75,
    marginRight: 10,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 14,

    backgroundColor: COLORS.purpleSoft,
  },

  productInfo: {
    flex: 1,
  },

  productCategory: {
    fontSize: 6.5,
    fontWeight: '900',
    textTransform: 'uppercase',

    color: COLORS.orangeDark,
  },

  productName: {
    marginTop: 3,

    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: '900',

    color: COLORS.text,
  },

  warrantyRow: {
    marginTop: 5,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 3,
  },

  warrantyText: {
    fontSize: 6.5,
    color: COLORS.success,
  },

  standardGuarantee: {
    marginTop: 5,

    fontSize: 6.5,
    color: COLORS.muted,
  },

  itemBottomRow: {
    marginTop: 9,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  productPrice: {
    fontSize: 10.5,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 9,

    backgroundColor: COLORS.purpleSoft,
  },

  quantityButton: {
    width: 27,
    height: 27,

    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityValue: {
    minWidth: 22,

    textAlign: 'center',

    fontSize: 8.5,
    fontWeight: '900',

    color: COLORS.purple,
  },

  itemRight: {
    width: 64,

    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  removeButton: {
    width: 27,
    height: 27,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 9,

    backgroundColor: COLORS.dangerSoft,
  },

  lineTotal: {
    marginBottom: 4,

    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  continueShoppingButton: {
    minHeight: 43,
    marginTop: 10,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 5,

    borderWidth: 1,
    borderColor: '#D9D6F3',
    borderRadius: 12,

    backgroundColor: COLORS.purpleSoft,
  },

  continueShoppingText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: COLORS.purple,
  },

  summaryCard: {
    marginTop: 17,
    padding: 13,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,

    backgroundColor: COLORS.card,
  },

  summaryHeader: {
    marginBottom: 13,

    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryIcon: {
    width: 39,
    height: 39,
    marginRight: 8,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: COLORS.purpleSoft,
  },

  summaryTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.text,
  },

  summarySubtitle: {
    marginTop: 2,

    fontSize: 7.5,
    color: COLORS.muted,
  },

  summaryRow: {
    minHeight: 31,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryLabel: {
    fontSize: 8.5,
    color: COLORS.muted,
  },

  summaryValue: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.text,
  },

  feeHint: {
    marginTop: 1,

    fontSize: 6.5,
    color: '#A0A4AE',
  },

  freeText: {
    color: COLORS.success,
  },

  summaryDivider: {
    height: 1,
    marginVertical: 8,

    backgroundColor: COLORS.border,
  },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  totalLabel: {
    fontSize: 10.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  secureCard: {
    marginTop: 11,
    padding: 11,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 14,

    backgroundColor: COLORS.successSoft,
  },

  secureContent: {
    flex: 1,
    marginLeft: 8,
  },

  secureTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#19744B',
  },

  secureText: {
    marginTop: 2,

    fontSize: 7.5,
    lineHeight: 11,

    color: '#648A75',
  },

  bottomCheckout: {
    minHeight: 80,
    paddingHorizontal: 14,
    paddingVertical: 10,

    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderTopWidth: 1,
    borderTopColor: COLORS.border,

    backgroundColor: COLORS.card,
  },

  bottomTotalLabel: {
    fontSize: 7.5,
    color: COLORS.muted,
  },

  bottomTotal: {
    marginTop: 2,

    fontSize: 17,
    fontWeight: '900',
    color: COLORS.text,
  },

  checkoutButton: {
    minWidth: 152,
    minHeight: 46,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,

    borderRadius: 13,

    backgroundColor: COLORS.orange,
  },

  checkoutText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  emptyState: {
    flex: 1,
    paddingHorizontal: 30,

    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIconOuter: {
    width: 112,
    height: 112,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 38,

    backgroundColor: COLORS.purpleSoft,
  },

  emptyIconInner: {
    width: 73,
    height: 73,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 24,

    backgroundColor: COLORS.card,
  },

  emptyTitle: {
    marginTop: 17,

    fontSize: 17,
    fontWeight: '900',
    color: COLORS.text,
  },

  emptyText: {
    maxWidth: 290,
    marginTop: 6,

    textAlign: 'center',

    fontSize: 9,
    lineHeight: 14,

    color: COLORS.muted,
  },

  shopButton: {
    minHeight: 46,
    marginTop: 17,
    paddingHorizontal: 20,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,

    borderRadius: 13,

    backgroundColor: COLORS.purple,
  },

  shopButtonText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
