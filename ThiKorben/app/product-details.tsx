import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  addToCart,
  formatShopMoney,
  getCartCount,
  getProductById,
  SHOP_PRODUCTS,
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

  warning: '#F5A300',
  warningSoft: '#FFF8E7',

  softOrange: '#FFF4EA',
};

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const productId = Array.isArray(params.id) ? params.id[0] : params.id;

  const product = getProductById(productId);

  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(getCartCount());
  const [added, setAdded] = useState(false);

  const addScale = useRef(new Animated.Value(1)).current;

  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return SHOP_PRODUCTS.filter(
      item => item.category === product.category && item.id !== product.id,
    ).slice(0, 3);
  }, [product]);

  if (!product) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />

        <SafeAreaView style={styles.screen}>
          <View style={styles.notFound}>
            <Ionicons name="cube-outline" size={42} color={COLORS.purple} />

            <Text style={styles.notFoundTitle}>Product not found</Text>

            <Pressable
              onPress={() => router.replace('/shop')}
              style={styles.backShopButton}
            >
              <Text style={styles.backShopText}>Back to Shop</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const changeQuantity = (amount: number) => {
    setQuantity(current =>
      Math.max(1, Math.min(product.stock, current + amount)),
    );
  };

  const handleAdd = () => {
    Animated.sequence([
      Animated.spring(addScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.spring(addScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    addToCart(product.id, quantity);

    setCartCount(getCartCount());
    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

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

            <Text style={styles.headerTitle}>Product Details</Text>

            <Pressable
              onPress={() => router.push('/cart')}
              style={styles.cartButton}
            >
              <Ionicons name="cart-outline" size={21} color={COLORS.purple} />

              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.productVisual}>
              <View style={styles.visualCircleLarge}>
                <View style={styles.visualCircleSmall}>
                  <Ionicons
                    name={product.icon}
                    size={61}
                    color={COLORS.purple}
                  />
                </View>
              </View>

              <View style={styles.verifiedProductBadge}>
                <Ionicons
                  name="shield-checkmark"
                  size={13}
                  color={COLORS.success}
                />

                <Text style={styles.verifiedProductText}>
                  ThiKorben Verified
                </Text>
              </View>
            </View>

            <View style={styles.productInfo}>
              <Text style={styles.category}>
                {product.categoryLabel.toUpperCase()}
              </Text>

              <Text style={styles.productName}>{product.name}</Text>

              <View style={styles.ratingStockRow}>
                <View style={styles.ratingGroup}>
                  <Ionicons name="star" size={14} color={COLORS.warning} />

                  <Text style={styles.rating}>{product.rating}</Text>

                  <Text style={styles.reviews}>
                    ({product.reviews} reviews)
                  </Text>
                </View>

                <View style={styles.stockBadge}>
                  <View style={styles.stockDot} />

                  <Text style={styles.stockText}>{product.stock} in stock</Text>
                </View>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.price}>
                  {formatShopMoney(product.price)}
                </Text>

                {product.oldPrice && (
                  <Text style={styles.oldPrice}>
                    {formatShopMoney(product.oldPrice)}
                  </Text>
                )}
              </View>

              <Text style={styles.description}>{product.description}</Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color={
                      product.warrantyMonths ? COLORS.success : COLORS.purple
                    }
                  />
                </View>

                <Text style={styles.infoLabel}>Warranty</Text>

                <Text style={styles.infoValue}>
                  {product.warrantyMonths
                    ? `${product.warrantyMonths} months`
                    : 'Standard guarantee'}
                </Text>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="car-outline"
                    size={20}
                    color={COLORS.orange}
                  />
                </View>

                <Text style={styles.infoLabel}>Delivery</Text>

                <Text style={styles.infoValue}>Inside Dhaka</Text>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="refresh-outline"
                    size={20}
                    color={COLORS.purple}
                  />
                </View>

                <Text style={styles.infoLabel}>Return</Text>

                <Text style={styles.infoValue}>7-day policy</Text>
              </View>
            </View>

            <View style={styles.featuresCard}>
              <Text style={styles.sectionTitle}>Product Features</Text>

              {product.features.map(feature => (
                <View key={feature} style={styles.featureRow}>
                  <View style={styles.featureCheck}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>

                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <View style={styles.quantityCard}>
              <View>
                <Text style={styles.quantityTitle}>Quantity</Text>

                <Text style={styles.quantityHint}>Select required amount</Text>
              </View>

              <View style={styles.quantitySelector}>
                <Pressable
                  onPress={() => changeQuantity(-1)}
                  style={styles.quantityButton}
                >
                  <Ionicons name="remove" size={17} color={COLORS.purple} />
                </Pressable>

                <Text style={styles.quantityValue}>{quantity}</Text>

                <Pressable
                  onPress={() => changeQuantity(1)}
                  style={styles.quantityButton}
                >
                  <Ionicons name="add" size={17} color={COLORS.purple} />
                </Pressable>
              </View>
            </View>

            <View style={styles.orderTotal}>
              <Text style={styles.orderTotalLabel}>Product total</Text>

              <Text style={styles.orderTotalValue}>
                {formatShopMoney(product.price * quantity)}
              </Text>
            </View>

            <Animated.View
              style={{
                transform: [{ scale: addScale }],
              }}
            >
              <Pressable onPress={handleAdd} style={styles.addToCartButton}>
                <Ionicons
                  name={added ? 'checkmark-circle' : 'cart'}
                  size={19}
                  color="#FFFFFF"
                />

                <Text style={styles.addToCartText}>
                  {added ? 'Added to Cart' : 'Add to Cart'}
                </Text>
              </Pressable>
            </Animated.View>

            <Pressable
              onPress={() => router.push('/cart')}
              style={styles.viewCartButton}
            >
              <Text style={styles.viewCartText}>View Shopping Cart</Text>

              <Ionicons name="arrow-forward" size={16} color={COLORS.purple} />
            </Pressable>

            {relatedProducts.length > 0 && (
              <>
                <View style={styles.relatedHeading}>
                  <Text style={styles.sectionTitle}>Related Products</Text>

                  <Pressable onPress={() => router.push('/shop')}>
                    <Text style={styles.seeAllText}>See all</Text>
                  </Pressable>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.relatedList}
                >
                  {relatedProducts.map(item => (
                    <Pressable
                      key={item.id}
                      onPress={() =>
                        router.replace({
                          pathname: '/product-details',
                          params: {
                            id: item.id,
                          },
                        })
                      }
                      style={styles.relatedCard}
                    >
                      <View style={styles.relatedIcon}>
                        <Ionicons
                          name={item.icon}
                          size={25}
                          color={COLORS.purple}
                        />
                      </View>

                      <Text numberOfLines={2} style={styles.relatedName}>
                        {item.name}
                      </Text>

                      <Text style={styles.relatedPrice}>
                        {formatShopMoney(item.price)}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}

            <View style={styles.helpCard}>
              <Ionicons
                name="information-circle-outline"
                size={21}
                color={COLORS.purple}
              />

              <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>Not sure what to buy?</Text>

                <Text style={styles.helpText}>
                  ThiKorben AI product recommendations will connect worker
                  conversations with matching shop products in the next
                  milestone.
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  Alert.alert(
                    'AI Recommendation',
                    'This product matching workflow will be connected to private job chat in Milestone 4.',
                  )
                }
              >
                <Ionicons name="sparkles" size={20} color={COLORS.orange} />
              </Pressable>
            </View>
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

  headerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text,
  },

  cartButton: {
    width: 39,
    height: 39,

    position: 'relative',

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: COLORS.purpleSoft,
  },

  cartBadge: {
    minWidth: 17,
    height: 17,

    position: 'absolute',
    top: -3,
    right: -3,

    paddingHorizontal: 3,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 2,
    borderColor: COLORS.card,
    borderRadius: 9,

    backgroundColor: COLORS.orange,
  },

  cartBadgeText: {
    fontSize: 6.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  scrollContent: {
    paddingBottom: 45,
  },

  productVisual: {
    height: 270,

    position: 'relative',

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#F0EEFF',
  },

  visualCircleLarge: {
    width: 180,
    height: 180,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 60,

    backgroundColor: 'rgba(67,56,168,0.08)',
  },

  visualCircleSmall: {
    width: 124,
    height: 124,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 40,

    backgroundColor: '#FFFFFF',
  },

  verifiedProductBadge: {
    position: 'absolute',
    bottom: 15,

    paddingHorizontal: 9,
    paddingVertical: 6,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,

    borderRadius: 999,

    backgroundColor: '#FFFFFF',
  },

  verifiedProductText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: COLORS.success,
  },

  productInfo: {
    paddingHorizontal: 15,
    paddingTop: 16,
  },

  category: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: COLORS.orangeDark,
  },

  productName: {
    marginTop: 4,

    fontSize: 21,
    lineHeight: 27,
    fontWeight: '900',

    color: COLORS.text,
  },

  ratingStockRow: {
    marginTop: 9,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  ratingGroup: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,
  },

  rating: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.text,
  },

  reviews: {
    fontSize: 8,
    color: COLORS.muted,
  },

  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,

    borderRadius: 999,

    backgroundColor: COLORS.successSoft,
  },

  stockDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: COLORS.success,
  },

  stockText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: COLORS.success,
  },

  priceRow: {
    marginTop: 13,

    flexDirection: 'row',
    alignItems: 'flex-end',

    gap: 8,
  },

  price: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  oldPrice: {
    marginBottom: 3,

    fontSize: 9,
    textDecorationLine: 'line-through',

    color: '#A0A4AE',
  },

  description: {
    marginTop: 11,

    fontSize: 10,
    lineHeight: 16,

    color: '#666B79',
  },

  infoGrid: {
    marginHorizontal: 15,
    marginTop: 15,

    flexDirection: 'row',

    gap: 7,
  },

  infoCard: {
    flex: 1,
    minHeight: 100,

    padding: 9,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,

    backgroundColor: COLORS.card,
  },

  infoIcon: {
    width: 34,
    height: 34,
    marginBottom: 7,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 10,

    backgroundColor: COLORS.purpleSoft,
  },

  infoLabel: {
    fontSize: 7,
    color: COLORS.muted,
  },

  infoValue: {
    marginTop: 2,

    fontSize: 8.5,
    lineHeight: 12,
    fontWeight: '900',

    color: COLORS.text,
  },

  featuresCard: {
    marginHorizontal: 15,
    marginTop: 13,
    padding: 13,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,

    backgroundColor: COLORS.card,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text,
  },

  featureRow: {
    marginTop: 10,

    flexDirection: 'row',
    alignItems: 'center',
  },

  featureCheck: {
    width: 20,
    height: 20,
    marginRight: 8,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 7,

    backgroundColor: COLORS.success,
  },

  featureText: {
    flex: 1,

    fontSize: 9,
    color: '#646978',
  },

  quantityCard: {
    marginHorizontal: 15,
    marginTop: 13,
    padding: 12,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,

    backgroundColor: COLORS.card,
  },

  quantityTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.text,
  },

  quantityHint: {
    marginTop: 2,

    fontSize: 7.5,
    color: COLORS.muted,
  },

  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 11,

    backgroundColor: COLORS.purpleSoft,
  },

  quantityButton: {
    width: 36,
    height: 36,

    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityValue: {
    minWidth: 28,

    textAlign: 'center',

    fontSize: 11,
    fontWeight: '900',

    color: COLORS.purple,
  },

  orderTotal: {
    marginHorizontal: 15,
    marginTop: 12,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  orderTotalLabel: {
    fontSize: 9,
    color: COLORS.muted,
  },

  orderTotalValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
  },

  addToCartButton: {
    minHeight: 50,
    marginHorizontal: 15,
    marginTop: 12,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 7,

    borderRadius: 14,

    backgroundColor: COLORS.orange,
  },

  addToCartText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  viewCartButton: {
    minHeight: 44,
    marginHorizontal: 15,
    marginTop: 8,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,

    borderWidth: 1,
    borderColor: '#D9D6F3',
    borderRadius: 13,

    backgroundColor: COLORS.purpleSoft,
  },

  viewCartText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.purple,
  },

  relatedHeading: {
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 9,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  seeAllText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  relatedList: {
    paddingHorizontal: 15,
    paddingRight: 25,

    gap: 8,
  },

  relatedCard: {
    width: 125,
    padding: 9,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,

    backgroundColor: COLORS.card,
  },

  relatedIcon: {
    height: 70,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 11,

    backgroundColor: COLORS.purpleSoft,
  },

  relatedName: {
    minHeight: 30,
    marginTop: 7,

    fontSize: 8.5,
    lineHeight: 12,
    fontWeight: '900',

    color: COLORS.text,
  },

  relatedPrice: {
    marginTop: 3,

    fontSize: 9,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  helpCard: {
    marginHorizontal: 15,
    marginTop: 18,
    padding: 12,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 15,

    backgroundColor: COLORS.warningSoft,
  },

  helpContent: {
    flex: 1,
    marginHorizontal: 9,
  },

  helpTitle: {
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  helpText: {
    marginTop: 2,

    fontSize: 7.5,
    lineHeight: 12,

    color: '#7A6D50',
  },

  notFound: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: COLORS.background,
  },

  notFoundTitle: {
    marginTop: 10,

    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
  },

  backShopButton: {
    marginTop: 14,
    paddingHorizontal: 17,
    paddingVertical: 10,

    borderRadius: 11,

    backgroundColor: COLORS.purple,
  },

  backShopText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
