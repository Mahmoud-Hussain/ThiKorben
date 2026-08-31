import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
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
  ProductCategory,
  SHOP_PRODUCTS,
  ShopProduct,
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

  softOrange: '#FFF4EA',
};

type CategoryFilter = 'all' | ProductCategory;

const CATEGORIES: {
  id: CategoryFilter;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
  {
    id: 'all',
    label: 'All',
    icon: 'grid-outline',
  },
  {
    id: 'plumbing',
    label: 'Plumbing',
    icon: 'water-outline',
  },
  {
    id: 'electrical',
    label: 'Electrical',
    icon: 'flash-outline',
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: 'hammer-outline',
  },
  {
    id: 'cleaning',
    label: 'Cleaning',
    icon: 'sparkles-outline',
  },
];

type ProductCardProps = {
  product: ShopProduct;
  onAdd: () => void;
  onOpen: () => void;
};

function ProductCard({ product, onAdd, onOpen }: ProductCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100,
        )
      : 0;

  return (
    <Animated.View
      style={[
        styles.productCard,
        {
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable onPress={onOpen} onPressIn={pressIn} onPressOut={pressOut}>
        <View style={styles.productVisual}>
          <View style={styles.productIcon}>
            <Ionicons name={product.icon} size={31} color={COLORS.purple} />
          </View>

          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}

          {product.recommended && (
            <View style={styles.recommendedBadge}>
              <Ionicons name="sparkles" size={10} color={COLORS.orange} />

              <Text style={styles.recommendedText}>Recommended</Text>
            </View>
          )}
        </View>

        <Text style={styles.productCategory}>{product.categoryLabel}</Text>

        <Text numberOfLines={2} style={styles.productName}>
          {product.name}
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={COLORS.warning} />

          <Text style={styles.ratingText}>
            {product.rating} ({product.reviews})
          </Text>
        </View>

        {product.warrantyMonths ? (
          <View style={styles.warrantyRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={12}
              color={COLORS.success}
            />

            <Text style={styles.warrantyText}>
              {product.warrantyMonths} month warranty
            </Text>
          </View>
        ) : (
          <View style={styles.warrantyRow}>
            <Ionicons name="cube-outline" size={12} color={COLORS.muted} />

            <Text style={styles.noWarrantyText}>Standard shop guarantee</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.productFooter}>
        <View>
          <Text style={styles.price}>{formatShopMoney(product.price)}</Text>

          {product.oldPrice && (
            <Text style={styles.oldPrice}>
              {formatShopMoney(product.oldPrice)}
            </Text>
          )}
        </View>

        <Pressable onPress={onAdd} style={styles.addButton}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

export default function ShopScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');

  const [cartCount, setCartCount] = useState(getCartCount());

  const pageOpacity = useRef(new Animated.Value(0)).current;
  const pageTranslate = useRef(new Animated.Value(14)).current;

  useFocusEffect(
    useCallback(() => {
      setCartCount(getCartCount());

      Animated.parallel([
        Animated.timing(pageOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),

        Animated.spring(pageTranslate, {
          toValue: 0,
          friction: 7,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();
    }, [pageOpacity, pageTranslate]),
  );

  const products = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    return SHOP_PRODUCTS.filter(product => {
      const matchesCategory =
        category === 'all' || product.category === category;

      const matchesSearch =
        !cleanSearch ||
        product.name.toLowerCase().includes(cleanSearch) ||
        product.shortName.toLowerCase().includes(cleanSearch) ||
        product.categoryLabel.toLowerCase().includes(cleanSearch);

      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  const addProduct = (product: ShopProduct) => {
    addToCart(product.id);
    setCartCount(getCartCount());
  };

  const openProduct = (product: ShopProduct) => {
    router.push({
      pathname: '/product-details',
      params: {
        id: product.id,
      },
    });
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

            <View style={styles.brandArea}>
              <View style={styles.logo}>
                <Ionicons name="bag-handle" size={18} color="#FFFFFF" />
              </View>

              <View>
                <Text style={styles.brand}>
                  Thi<Text style={styles.brandAccent}>Korben</Text> Shop
                </Text>

                <Text style={styles.brandSubtitle}>
                  Repair materials you can trust
                </Text>
              </View>
            </View>

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

          <Animated.View
            style={[
              styles.content,
              {
                opacity: pageOpacity,
                transform: [{ translateY: pageTranslate }],
              },
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.hero}>
                <View style={styles.heroContent}>
                  <View style={styles.heroBadge}>
                    <Ionicons
                      name="shield-checkmark"
                      size={12}
                      color={COLORS.orange}
                    />

                    <Text style={styles.heroBadgeText}>VERIFIED MATERIALS</Text>
                  </View>

                  <Text style={styles.heroTitle}>
                    Everything your repair job needs.
                  </Text>

                  <Text style={styles.heroText}>
                    Shop products recommended for ThiKorben service jobs with
                    transparent prices and warranty information.
                  </Text>
                </View>

                <View style={styles.heroIconArea}>
                  <View style={styles.heroIcon}>
                    <Ionicons name="construct" size={38} color="#FFFFFF" />
                  </View>
                </View>
              </View>

              <View style={styles.searchWrapper}>
                <Ionicons
                  name="search-outline"
                  size={19}
                  color={COLORS.muted}
                />

                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search connector, tape, valve..."
                  placeholderTextColor="#A2A6B3"
                  style={styles.searchInput}
                />

                {search.length > 0 && (
                  <Pressable onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={18} color="#B2B5C0" />
                  </Pressable>
                )}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
              >
                {CATEGORIES.map(item => {
                  const selected = category === item.id;

                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setCategory(item.id)}
                      style={[
                        styles.categoryChip,
                        selected && styles.categoryChipSelected,
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={15}
                        color={selected ? '#FFFFFF' : COLORS.purple}
                      />

                      <Text
                        style={[
                          styles.categoryText,
                          selected && styles.categoryTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.sectionHeading}>
                <View>
                  <Text style={styles.sectionTitle}>
                    {category === 'all'
                      ? 'Popular Products'
                      : `${CATEGORIES.find(item => item.id === category)?.label} Products`}
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    {products.length} item{products.length === 1 ? '' : 's'}{' '}
                    available
                  </Text>
                </View>

                <View style={styles.stockBadge}>
                  <View style={styles.stockDot} />

                  <Text style={styles.stockBadgeText}>In stock</Text>
                </View>
              </View>

              {products.length > 0 ? (
                <View style={styles.productGrid}>
                  {products.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpen={() => openProduct(product)}
                      onAdd={() => addProduct(product)}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <Ionicons
                      name="search-outline"
                      size={28}
                      color={COLORS.purple}
                    />
                  </View>

                  <Text style={styles.emptyTitle}>No products found</Text>

                  <Text style={styles.emptyText}>
                    Try another product name or select a different category.
                  </Text>
                </View>
              )}

              <View style={styles.guaranteeCard}>
                <View style={styles.guaranteeIcon}>
                  <Ionicons
                    name="shield-checkmark"
                    size={23}
                    color={COLORS.success}
                  />
                </View>

                <View style={styles.guaranteeContent}>
                  <Text style={styles.guaranteeTitle}>
                    ThiKorben Product Promise
                  </Text>

                  <Text style={styles.guaranteeText}>
                    Product prices, stock and applicable warranty are clearly
                    shown before purchase.
                  </Text>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
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
    height: 64,
    paddingHorizontal: 12,

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

  brandArea: {
    flex: 1,
    marginLeft: 4,

    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 37,
    height: 37,
    marginRight: 8,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: COLORS.purple,
  },

  brand: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.text,
  },

  brandAccent: {
    color: COLORS.orange,
  },

  brandSubtitle: {
    marginTop: 1,

    fontSize: 7.5,
    color: COLORS.muted,
  },

  cartButton: {
    width: 40,
    height: 40,

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
    right: -3,
    top: -3,

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

  content: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 13,
    paddingTop: 13,
    paddingBottom: 45,
  },

  hero: {
    minHeight: 156,
    padding: 16,

    flexDirection: 'row',

    overflow: 'hidden',

    borderRadius: 19,

    backgroundColor: COLORS.purple,
  },

  heroContent: {
    flex: 1,
    zIndex: 2,
  },

  heroBadge: {
    alignSelf: 'flex-start',

    paddingHorizontal: 8,
    paddingVertical: 5,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,

    borderRadius: 999,

    backgroundColor: '#FFFFFF',
  },

  heroBadgeText: {
    fontSize: 6.5,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  heroTitle: {
    maxWidth: 265,
    marginTop: 11,

    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',

    color: '#FFFFFF',
  },

  heroText: {
    maxWidth: 275,
    marginTop: 7,

    fontSize: 8.5,
    lineHeight: 13,

    color: '#DDD9FF',
  },

  heroIconArea: {
    width: 85,

    alignItems: 'center',
    justifyContent: 'center',
  },

  heroIcon: {
    width: 74,
    height: 74,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 24,

    backgroundColor: 'rgba(255,255,255,0.13)',
  },

  searchWrapper: {
    minHeight: 48,
    marginTop: 13,
    paddingHorizontal: 12,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 8,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,

    backgroundColor: COLORS.card,
  },

  searchInput: {
    flex: 1,
    minHeight: 46,

    fontSize: 10.5,
    color: COLORS.text,
  },

  categoryList: {
    paddingVertical: 12,
    paddingRight: 10,

    gap: 7,
  },

  categoryChip: {
    minHeight: 37,
    paddingHorizontal: 11,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 5,

    borderWidth: 1,
    borderColor: '#DDD9F1',
    borderRadius: 11,

    backgroundColor: COLORS.card,
  },

  categoryChipSelected: {
    borderColor: COLORS.purple,

    backgroundColor: COLORS.purple,
  },

  categoryText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.purple,
  },

  categoryTextSelected: {
    color: '#FFFFFF',
  },

  sectionHeading: {
    marginTop: 2,
    marginBottom: 11,

    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 2,

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

  stockBadgeText: {
    fontSize: 7,
    fontWeight: '900',
    color: COLORS.success,
  },

  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'space-between',

    rowGap: 10,
  },

  productCard: {
    width: '48.6%',
    padding: 10,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,

    backgroundColor: COLORS.card,
  },

  productVisual: {
    height: 106,

    position: 'relative',

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 13,

    backgroundColor: '#F4F2FF',
  },

  productIcon: {
    width: 58,
    height: 58,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 19,

    backgroundColor: '#FFFFFF',
  },

  discountBadge: {
    position: 'absolute',
    top: 7,
    left: 7,

    paddingHorizontal: 6,
    paddingVertical: 4,

    borderRadius: 999,

    backgroundColor: COLORS.orange,
  },

  discountText: {
    fontSize: 6.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  recommendedBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,

    paddingHorizontal: 5,
    paddingVertical: 3,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 2,

    borderRadius: 999,

    backgroundColor: '#FFFFFF',
  },

  recommendedText: {
    fontSize: 5.8,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  productCategory: {
    marginTop: 8,

    fontSize: 6.5,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,

    color: COLORS.orangeDark,
  },

  productName: {
    minHeight: 29,
    marginTop: 3,

    fontSize: 9.7,
    lineHeight: 14,
    fontWeight: '900',

    color: COLORS.text,
  },

  ratingRow: {
    marginTop: 5,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 3,
  },

  ratingText: {
    fontSize: 7.5,
    color: COLORS.muted,
  },

  warrantyRow: {
    minHeight: 18,
    marginTop: 4,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 3,
  },

  warrantyText: {
    flex: 1,

    fontSize: 6.5,
    color: COLORS.success,
  },

  noWarrantyText: {
    flex: 1,

    fontSize: 6.5,
    color: COLORS.muted,
  },

  productFooter: {
    marginTop: 7,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  price: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  oldPrice: {
    marginTop: 1,

    fontSize: 6.5,
    textDecorationLine: 'line-through',

    color: '#9DA1AD',
  },

  addButton: {
    width: 32,
    height: 32,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 10,

    backgroundColor: COLORS.purple,
  },

  emptyState: {
    paddingVertical: 45,

    alignItems: 'center',

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,

    backgroundColor: COLORS.card,
  },

  emptyIcon: {
    width: 55,
    height: 55,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 18,

    backgroundColor: COLORS.purpleSoft,
  },

  emptyTitle: {
    marginTop: 11,

    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text,
  },

  emptyText: {
    maxWidth: 260,
    marginTop: 4,

    textAlign: 'center',

    fontSize: 8.5,
    lineHeight: 13,

    color: COLORS.muted,
  },

  guaranteeCard: {
    marginTop: 17,
    padding: 12,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 15,

    backgroundColor: COLORS.successSoft,
  },

  guaranteeIcon: {
    width: 42,
    height: 42,
    marginRight: 9,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 13,

    backgroundColor: '#FFFFFF',
  },

  guaranteeContent: {
    flex: 1,
  },

  guaranteeTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#19734B',
  },

  guaranteeText: {
    marginTop: 2,

    fontSize: 8,
    lineHeight: 12,

    color: '#5C856F',
  },
});
