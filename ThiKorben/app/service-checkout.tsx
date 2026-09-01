import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatShopMoney, getDetailedCartItems } from '@/constants/shop-data';

import {
  getServiceCostSummary,
  ServiceCostSummary,
} from '@/constants/service-cost';

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

  softGray: '#F1F2F6',
};

type PaymentMethod = 'bkash' | 'card' | 'cash';

type PaymentOption = {
  id: PaymentMethod;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'bkash',
    title: 'bKash',
    subtitle: 'Mobile payment',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'card',
    title: 'Card',
    subtitle: 'Debit or credit card',
    icon: 'card-outline',
  },
  {
    id: 'cash',
    title: 'Cash',
    subtitle: 'Pay after service',
    icon: 'cash-outline',
  },
];

export default function ServiceCheckoutScreen() {
  const [items, setItems] = useState(getDetailedCartItems());

  const [cost, setCost] = useState<ServiceCostSummary>(getServiceCostSummary());

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');

  const [completed, setCompleted] = useState(false);

  const [processing, setProcessing] = useState(false);

  const successScale = useRef(new Animated.Value(0.7)).current;

  const successOpacity = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      setItems(getDetailedCartItems());
      setCost(getServiceCostSummary());
    }, []),
  );

  const confirmService = () => {
    if (processing) {
      return;
    }

    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      setCompleted(true);

      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),

        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    }, 700);
  };

  if (completed) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <SafeAreaView style={styles.screen}>
          <View style={styles.appShell}>
            <Animated.View
              style={[
                styles.successScreen,
                {
                  opacity: successOpacity,
                  transform: [
                    {
                      scale: successScale,
                    },
                  ],
                },
              ]}
            >
              <View style={styles.successIconOuter}>
                <View style={styles.successIconInner}>
                  <Ionicons name="checkmark" size={45} color="#FFFFFF" />
                </View>
              </View>

              <Text style={styles.successTitle}>Service Confirmed</Text>

              <Text style={styles.successDescription}>
                Your ThiKorben service cost has been confirmed successfully.
              </Text>

              <View style={styles.successTotalCard}>
                <Text style={styles.successTotalLabel}>
                  Final Service Total
                </Text>

                <Text style={styles.successTotal}>
                  {formatShopMoney(cost.grandTotal)}
                </Text>

                <View style={styles.successStatusBadge}>
                  <Ionicons
                    name="shield-checkmark"
                    size={13}
                    color={COLORS.success}
                  />

                  <Text style={styles.successStatusText}>
                    Cost breakdown verified
                  </Text>
                </View>
              </View>

              <View style={styles.successJobSummary}>
                <View style={styles.successWorker}>
                  <View style={styles.successWorkerAvatar}>
                    <Text style={styles.successAvatarText}>RA</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.successWorkerName}>Rahim Ahmed</Text>

                    <Text style={styles.successWorkerRole}>Expert Plumber</Text>
                  </View>

                  <Ionicons
                    name="checkmark-circle"
                    size={19}
                    color={COLORS.orange}
                  />
                </View>

                <Text style={styles.successJobTitle}>
                  Kitchen Sink Pipe Leakage
                </Text>

                <Text style={styles.successLocation}>Dhanmondi 8/A, Dhaka</Text>
              </View>

              <View style={styles.demoNotice}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={COLORS.purple}
                />

                <Text style={styles.demoNoticeText}>
                  Prototype payment complete. No real financial transaction has
                  been processed.
                </Text>
              </View>

              <Pressable
                onPress={() => router.replace('/job-chat')}
                style={styles.successPrimaryButton}
              >
                <Ionicons name="chatbubble-outline" size={17} color="#FFFFFF" />

                <Text style={styles.successPrimaryText}>Back to Job Chat</Text>
              </Pressable>

              <Pressable
                onPress={() => router.replace('/job-board')}
                style={styles.successSecondaryButton}
              >
                <Text style={styles.successSecondaryText}>
                  View Job Marketplace
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color={COLORS.purple}
                />
              </Pressable>
            </Animated.View>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

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
              <Text style={styles.headerTitle}>Service Checkout</Text>

              <Text style={styles.headerSubtitle}>Complete cost breakdown</Text>
            </View>

            <View style={styles.secureHeader}>
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={COLORS.success}
              />
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.heroIcon}>
                  <Ionicons name="receipt-outline" size={25} color="#FFFFFF" />
                </View>

                <View style={styles.heroContent}>
                  <Text style={styles.heroLabel}>FINAL SERVICE COST</Text>

                  <Text style={styles.heroTitle}>
                    Everything in one transparent bill.
                  </Text>
                </View>
              </View>

              <View style={styles.heroTotalRow}>
                <View>
                  <Text style={styles.heroTotalLabel}>Grand Total</Text>

                  <Text style={styles.heroHint}>Labor + materials + fees</Text>
                </View>

                <Text style={styles.heroTotal}>
                  {formatShopMoney(cost.grandTotal)}
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Service & Worker</Text>

              <View style={styles.confirmedBadge}>
                <View style={styles.confirmedDot} />

                <Text style={styles.confirmedBadgeText}>CONFIRMED</Text>
              </View>
            </View>

            <View style={styles.jobCard}>
              <View style={styles.workerRow}>
                <View style={styles.workerAvatar}>
                  <Text style={styles.workerAvatarText}>RA</Text>
                </View>

                <View style={styles.workerInfo}>
                  <View style={styles.workerNameRow}>
                    <Text style={styles.workerName}>Rahim Ahmed</Text>

                    <Ionicons
                      name="checkmark-circle"
                      size={15}
                      color={COLORS.orange}
                    />
                  </View>

                  <Text style={styles.workerRole}>Expert Plumber</Text>
                </View>

                <View style={styles.workerRating}>
                  <Ionicons name="star" size={12} color={COLORS.warning} />

                  <Text style={styles.workerRatingText}>4.9</Text>
                </View>
              </View>

              <View style={styles.jobDivider} />

              <View style={styles.jobInfoRow}>
                <View style={styles.jobInfoIcon}>
                  <Ionicons
                    name="water-outline"
                    size={17}
                    color={COLORS.orange}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.jobInfoLabel}>Job</Text>

                  <Text style={styles.jobInfoValue}>
                    Kitchen Sink Pipe Leakage
                  </Text>
                </View>
              </View>

              <View style={styles.jobInfoRow}>
                <View style={styles.jobInfoIcon}>
                  <Ionicons
                    name="location-outline"
                    size={17}
                    color={COLORS.purple}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.jobInfoLabel}>Service location</Text>

                  <Text style={styles.jobInfoValue}>Dhanmondi 8/A, Dhaka</Text>
                </View>
              </View>

              <View style={styles.jobInfoRow}>
                <View style={styles.jobInfoIcon}>
                  <Ionicons
                    name="calendar-outline"
                    size={17}
                    color={COLORS.purple}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.jobInfoLabel}>Schedule</Text>

                  <Text style={styles.jobInfoValue}>Today, 6:00 PM</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Purchased Materials</Text>

              <Text style={styles.sectionCount}>
                {items.length} product
                {items.length === 1 ? '' : 's'}
              </Text>
            </View>

            {items.length > 0 ? (
              <View style={styles.materialCard}>
                {items.map((item, index) => (
                  <View key={item.productId}>
                    <View style={styles.materialRow}>
                      <View style={styles.materialIcon}>
                        <Ionicons
                          name={item.product.icon}
                          size={22}
                          color={COLORS.purple}
                        />
                      </View>

                      <View style={styles.materialInfo}>
                        <Text numberOfLines={1} style={styles.materialName}>
                          {item.product.name}
                        </Text>

                        <Text style={styles.materialQuantity}>
                          Qty {item.quantity} ×{' '}
                          {formatShopMoney(item.product.price)}
                        </Text>

                        {item.product.warrantyMonths ? (
                          <View style={styles.materialWarranty}>
                            <Ionicons
                              name="shield-checkmark-outline"
                              size={10}
                              color={COLORS.success}
                            />

                            <Text style={styles.materialWarrantyText}>
                              {item.product.warrantyMonths} month warranty
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.materialGuarantee}>
                            Standard shop guarantee
                          </Text>
                        )}
                      </View>

                      <Text style={styles.materialTotal}>
                        {formatShopMoney(item.lineTotal)}
                      </Text>
                    </View>

                    {index < items.length - 1 && (
                      <View style={styles.materialDivider} />
                    )}
                  </View>
                ))}

                <Pressable
                  onPress={() => router.push('/cart')}
                  style={styles.editMaterialsButton}
                >
                  <Ionicons
                    name="create-outline"
                    size={14}
                    color={COLORS.purple}
                  />

                  <Text style={styles.editMaterialsText}>
                    Edit materials in cart
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.noMaterialsCard}>
                <Ionicons name="cube-outline" size={24} color={COLORS.muted} />

                <View style={styles.noMaterialsContent}>
                  <Text style={styles.noMaterialsTitle}>
                    No purchased materials
                  </Text>

                  <Text style={styles.noMaterialsText}>
                    This checkout currently contains labor and service charges
                    only.
                  </Text>
                </View>

                <Pressable onPress={() => router.push('/shop')}>
                  <Text style={styles.addMaterialsText}>Add</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Full Cost Breakdown</Text>

              <View style={styles.transparentBadge}>
                <Ionicons name="eye-outline" size={11} color={COLORS.success} />

                <Text style={styles.transparentBadgeText}>TRANSPARENT</Text>
              </View>
            </View>

            <View style={styles.costCard}>
              <View style={styles.costRow}>
                <View style={styles.costLabelRow}>
                  <View style={[styles.costIcon, styles.laborCostIcon]}>
                    <Ionicons
                      name="construct-outline"
                      size={15}
                      color={COLORS.orange}
                    />
                  </View>

                  <View>
                    <Text style={styles.costLabel}>Worker labor</Text>

                    <Text style={styles.costDescription}>
                      Accepted proposal
                    </Text>
                  </View>
                </View>

                <Text style={styles.costValue}>
                  {formatShopMoney(cost.laborCost)}
                </Text>
              </View>

              <View style={styles.costRow}>
                <View style={styles.costLabelRow}>
                  <View style={styles.costIcon}>
                    <Ionicons
                      name="cube-outline"
                      size={15}
                      color={COLORS.purple}
                    />
                  </View>

                  <View>
                    <Text style={styles.costLabel}>Materials</Text>

                    <Text style={styles.costDescription}>
                      ThiKorben Shop products
                    </Text>
                  </View>
                </View>

                <Text style={styles.costValue}>
                  {formatShopMoney(cost.materialSubtotal)}
                </Text>
              </View>

              <View style={styles.costRow}>
                <View style={styles.costLabelRow}>
                  <View style={styles.costIcon}>
                    <Ionicons
                      name="car-outline"
                      size={15}
                      color={COLORS.success}
                    />
                  </View>

                  <View>
                    <Text style={styles.costLabel}>Material delivery</Text>

                    <Text style={styles.costDescription}>
                      Shop order delivery
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.costValue,
                    cost.deliveryFee === 0 && styles.freeCost,
                  ]}
                >
                  {cost.deliveryFee === 0
                    ? 'FREE'
                    : formatShopMoney(cost.deliveryFee)}
                </Text>
              </View>

              <View style={styles.costRow}>
                <View style={styles.costLabelRow}>
                  <View style={styles.costIcon}>
                    <Ionicons
                      name="bag-handle-outline"
                      size={15}
                      color={COLORS.purple}
                    />
                  </View>

                  <View>
                    <Text style={styles.costLabel}>Shop processing fee</Text>

                    <Text style={styles.costDescription}>
                      Product order support
                    </Text>
                  </View>
                </View>

                <Text style={styles.costValue}>
                  {formatShopMoney(cost.shopPlatformFee)}
                </Text>
              </View>

              <View style={styles.costRow}>
                <View style={styles.costLabelRow}>
                  <View style={styles.costIcon}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={15}
                      color={COLORS.purple}
                    />
                  </View>

                  <View>
                    <Text style={styles.costLabel}>Service platform fee</Text>

                    <Text style={styles.costDescription}>
                      Booking and service support
                    </Text>
                  </View>
                </View>

                <Text style={styles.costValue}>
                  {formatShopMoney(cost.servicePlatformFee)}
                </Text>
              </View>

              <View style={styles.totalDivider} />

              <View style={styles.grandTotalRow}>
                <View>
                  <Text style={styles.grandTotalLabel}>Grand Total</Text>

                  <Text style={styles.grandTotalHint}>
                    Final estimated service cost
                  </Text>
                </View>

                <Text style={styles.grandTotalValue}>
                  {formatShopMoney(cost.grandTotal)}
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Payment Method</Text>

              <Text style={styles.sectionCount}>Demo selection</Text>
            </View>

            <View style={styles.paymentList}>
              {PAYMENT_OPTIONS.map(option => {
                const selected = paymentMethod === option.id;

                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setPaymentMethod(option.id)}
                    style={[
                      styles.paymentOption,
                      selected && styles.paymentOptionSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.paymentIcon,
                        selected && styles.paymentIconSelected,
                      ]}
                    >
                      <Ionicons
                        name={option.icon}
                        size={20}
                        color={selected ? '#FFFFFF' : COLORS.purple}
                      />
                    </View>

                    <View style={styles.paymentContent}>
                      <Text style={styles.paymentTitle}>{option.title}</Text>

                      <Text style={styles.paymentSubtitle}>
                        {option.subtitle}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.radioOuter,
                        selected && styles.radioOuterSelected,
                      ]}
                    >
                      {selected && <View style={styles.radioInner} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.transparencyCard}>
              <View style={styles.transparencyIcon}>
                <Ionicons
                  name="shield-checkmark"
                  size={22}
                  color={COLORS.success}
                />
              </View>

              <View style={styles.transparencyContent}>
                <Text style={styles.transparencyTitle}>No hidden charges</Text>

                <Text style={styles.transparencyText}>
                  Labor, products, delivery and platform fees are separated so
                  both customer and worker can see exactly how the total is
                  formed.
                </Text>
              </View>
            </View>

            <View style={styles.prototypeNotice}>
              <Ionicons
                name="information-circle-outline"
                size={17}
                color={COLORS.purple}
              />

              <Text style={styles.prototypeNoticeText}>
                Prototype checkout only. Payment gateway and real transactions
                will be connected during backend integration.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.bottomTotalLabel}>Final Total</Text>

              <Text style={styles.bottomTotal}>
                {formatShopMoney(cost.grandTotal)}
              </Text>
            </View>

            <Pressable
              onPress={confirmService}
              disabled={processing}
              style={[
                styles.confirmButton,
                processing && styles.confirmButtonDisabled,
              ]}
            >
              {processing ? (
                <>
                  <Ionicons
                    name="hourglass-outline"
                    size={17}
                    color="#FFFFFF"
                  />

                  <Text style={styles.confirmButtonText}>Processing...</Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={17}
                    color="#FFFFFF"
                  />

                  <Text style={styles.confirmButtonText}>Confirm Service</Text>
                </>
              )}
            </Pressable>
          </View>
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

  secureHeader: {
    width: 39,
    height: 39,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: COLORS.successSoft,
  },

  scrollContent: {
    paddingHorizontal: 13,
    paddingTop: 12,
    paddingBottom: 115,
  },

  heroCard: {
    padding: 15,

    borderRadius: 18,

    backgroundColor: COLORS.purple,
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroIcon: {
    width: 45,
    height: 45,
    marginRight: 10,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 14,

    backgroundColor: 'rgba(255,255,255,0.14)',
  },

  heroContent: {
    flex: 1,
  },

  heroLabel: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.7,

    color: '#DCD9FF',
  },

  heroTitle: {
    maxWidth: 290,
    marginTop: 3,

    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',

    color: '#FFFFFF',
  },

  heroTotalRow: {
    marginTop: 15,
    paddingTop: 12,

    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',

    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },

  heroTotalLabel: {
    fontSize: 8,
    color: '#DDD9FF',
  },

  heroHint: {
    marginTop: 2,
    fontSize: 6.5,
    color: '#BBB7E4',
  },

  heroTotal: {
    fontSize: 25,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  sectionHeading: {
    marginTop: 17,
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
    fontSize: 7.5,
    color: COLORS.muted,
  },

  confirmedBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,

    borderRadius: 999,

    backgroundColor: COLORS.successSoft,
  },

  confirmedDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: COLORS.success,
  },

  confirmedBadgeText: {
    fontSize: 6.5,
    fontWeight: '900',
    color: COLORS.success,
  },

  jobCard: {
    padding: 12,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,

    backgroundColor: COLORS.card,
  },

  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  workerAvatar: {
    width: 45,
    height: 45,
    marginRight: 9,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 14,

    backgroundColor: COLORS.purple,
  },

  workerAvatarText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  workerInfo: {
    flex: 1,
  },

  workerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  workerName: {
    fontSize: 10.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  workerRole: {
    marginTop: 2,
    fontSize: 8,
    color: COLORS.muted,
  },

  workerRating: {
    paddingHorizontal: 7,
    paddingVertical: 5,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 3,

    borderRadius: 999,

    backgroundColor: COLORS.warningSoft,
  },

  workerRatingText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#8D6500',
  },

  jobDivider: {
    height: 1,
    marginVertical: 11,

    backgroundColor: COLORS.border,
  },

  jobInfoRow: {
    marginTop: 8,

    flexDirection: 'row',
    alignItems: 'center',
  },

  jobInfoIcon: {
    width: 32,
    height: 32,
    marginRight: 8,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 10,

    backgroundColor: COLORS.softGray,
  },

  jobInfoLabel: {
    fontSize: 6.5,
    color: COLORS.muted,
  },

  jobInfoValue: {
    marginTop: 2,

    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.text,
  },

  materialCard: {
    padding: 11,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,

    backgroundColor: COLORS.card,
  },

  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  materialIcon: {
    width: 44,
    height: 44,
    marginRight: 8,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 13,

    backgroundColor: COLORS.purpleSoft,
  },

  materialInfo: {
    flex: 1,
  },

  materialName: {
    fontSize: 8.8,
    fontWeight: '900',
    color: COLORS.text,
  },

  materialQuantity: {
    marginTop: 2,

    fontSize: 7,
    color: COLORS.muted,
  },

  materialWarranty: {
    marginTop: 3,

    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  materialWarrantyText: {
    fontSize: 6.2,
    color: COLORS.success,
  },

  materialGuarantee: {
    marginTop: 3,
    fontSize: 6.2,
    color: COLORS.muted,
  },

  materialTotal: {
    marginLeft: 7,

    fontSize: 9,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  materialDivider: {
    height: 1,
    marginVertical: 9,

    backgroundColor: COLORS.border,
  },

  editMaterialsButton: {
    minHeight: 36,
    marginTop: 10,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 5,

    borderRadius: 10,

    backgroundColor: COLORS.purpleSoft,
  },

  editMaterialsText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: COLORS.purple,
  },

  noMaterialsCard: {
    padding: 12,

    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,

    backgroundColor: COLORS.card,
  },

  noMaterialsContent: {
    flex: 1,
    marginHorizontal: 9,
  },

  noMaterialsTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.text,
  },

  noMaterialsText: {
    marginTop: 2,

    fontSize: 7,
    lineHeight: 11,
    color: COLORS.muted,
  },

  addMaterialsText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  transparentBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 3,

    borderRadius: 999,

    backgroundColor: COLORS.successSoft,
  },

  transparentBadgeText: {
    fontSize: 6.2,
    fontWeight: '900',
    color: COLORS.success,
  },

  costCard: {
    padding: 13,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,

    backgroundColor: COLORS.card,
  },

  costRow: {
    minHeight: 51,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  costLabelRow: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',
  },

  costIcon: {
    width: 33,
    height: 33,
    marginRight: 8,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 10,

    backgroundColor: COLORS.purpleSoft,
  },

  laborCostIcon: {
    backgroundColor: COLORS.orangeSoft,
  },

  costLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.text,
  },

  costDescription: {
    marginTop: 2,
    fontSize: 6.5,
    color: COLORS.muted,
  },

  costValue: {
    marginLeft: 8,

    fontSize: 9,
    fontWeight: '900',
    color: COLORS.text,
  },

  freeCost: {
    color: COLORS.success,
  },

  totalDivider: {
    height: 1,
    marginVertical: 9,

    backgroundColor: COLORS.border,
  },

  grandTotalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  grandTotalLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.text,
  },

  grandTotalHint: {
    marginTop: 2,
    fontSize: 6.5,
    color: COLORS.muted,
  },

  grandTotalValue: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  paymentList: {
    gap: 7,
  },

  paymentOption: {
    minHeight: 65,
    padding: 10,

    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,

    backgroundColor: COLORS.card,
  },

  paymentOptionSelected: {
    borderColor: COLORS.purple,
    backgroundColor: '#FBFAFF',
  },

  paymentIcon: {
    width: 40,
    height: 40,
    marginRight: 9,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: COLORS.purpleSoft,
  },

  paymentIconSelected: {
    backgroundColor: COLORS.purple,
  },

  paymentContent: {
    flex: 1,
  },

  paymentTitle: {
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  paymentSubtitle: {
    marginTop: 2,
    fontSize: 7,
    color: COLORS.muted,
  },

  radioOuter: {
    width: 20,
    height: 20,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 2,
    borderColor: '#C8CBD5',
    borderRadius: 10,
  },

  radioOuterSelected: {
    borderColor: COLORS.purple,
  },

  radioInner: {
    width: 10,
    height: 10,

    borderRadius: 5,

    backgroundColor: COLORS.purple,
  },

  transparencyCard: {
    marginTop: 14,
    padding: 11,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 14,

    backgroundColor: COLORS.successSoft,
  },

  transparencyIcon: {
    width: 40,
    height: 40,
    marginRight: 8,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: '#FFFFFF',
  },

  transparencyContent: {
    flex: 1,
  },

  transparencyTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#19744B',
  },

  transparencyText: {
    marginTop: 2,

    fontSize: 7,
    lineHeight: 11,

    color: '#648A75',
  },

  prototypeNotice: {
    marginTop: 10,
    padding: 10,

    flexDirection: 'row',
    alignItems: 'flex-start',

    gap: 6,

    borderRadius: 12,

    backgroundColor: COLORS.purpleSoft,
  },

  prototypeNoticeText: {
    flex: 1,

    fontSize: 6.8,
    lineHeight: 11,

    color: '#69658D',
  },

  bottomBar: {
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
    fontSize: 7,
    color: COLORS.muted,
  },

  bottomTotal: {
    marginTop: 2,

    fontSize: 17,
    fontWeight: '900',
    color: COLORS.text,
  },

  confirmButton: {
    minWidth: 170,
    minHeight: 47,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,

    borderRadius: 13,

    backgroundColor: COLORS.orange,
  },

  confirmButtonDisabled: {
    opacity: 0.65,
  },

  confirmButtonText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  successScreen: {
    flex: 1,
    paddingHorizontal: 24,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: COLORS.background,
  },

  successIconOuter: {
    width: 112,
    height: 112,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 40,

    backgroundColor: COLORS.successSoft,
  },

  successIconInner: {
    width: 73,
    height: 73,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 25,

    backgroundColor: COLORS.success,
  },

  successTitle: {
    marginTop: 18,

    fontSize: 21,
    fontWeight: '900',
    color: COLORS.text,
  },

  successDescription: {
    maxWidth: 300,
    marginTop: 6,

    textAlign: 'center',

    fontSize: 9,
    lineHeight: 14,

    color: COLORS.muted,
  },

  successTotalCard: {
    width: '100%',
    marginTop: 18,
    padding: 16,

    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#B9E4CE',
    borderRadius: 17,

    backgroundColor: COLORS.card,
  },

  successTotalLabel: {
    fontSize: 8,
    color: COLORS.muted,
  },

  successTotal: {
    marginTop: 4,

    fontSize: 28,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  successStatusBadge: {
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,

    borderRadius: 999,

    backgroundColor: COLORS.successSoft,
  },

  successStatusText: {
    fontSize: 6.5,
    fontWeight: '900',
    color: COLORS.success,
  },

  successJobSummary: {
    width: '100%',
    marginTop: 11,
    padding: 13,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,

    backgroundColor: COLORS.card,
  },

  successWorker: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  successWorkerAvatar: {
    width: 39,
    height: 39,
    marginRight: 8,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: COLORS.purple,
  },

  successAvatarText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  successWorkerName: {
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  successWorkerRole: {
    marginTop: 2,
    fontSize: 7,
    color: COLORS.muted,
  },

  successJobTitle: {
    marginTop: 10,

    fontSize: 9,
    fontWeight: '900',
    color: COLORS.text,
  },

  successLocation: {
    marginTop: 3,
    fontSize: 7,
    color: COLORS.muted,
  },

  demoNotice: {
    width: '100%',
    marginTop: 11,
    padding: 10,

    flexDirection: 'row',
    alignItems: 'flex-start',

    gap: 6,

    borderRadius: 12,

    backgroundColor: COLORS.warningSoft,
  },

  demoNoticeText: {
    flex: 1,

    fontSize: 6.8,
    lineHeight: 11,

    color: '#7D704F',
  },

  successPrimaryButton: {
    width: '100%',
    minHeight: 48,
    marginTop: 14,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,

    borderRadius: 13,

    backgroundColor: COLORS.purple,
  },

  successPrimaryText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  successSecondaryButton: {
    width: '100%',
    minHeight: 44,
    marginTop: 8,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 5,

    borderWidth: 1,
    borderColor: '#D8D5F2',
    borderRadius: 13,

    backgroundColor: COLORS.purpleSoft,
  },

  successSecondaryText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: COLORS.purple,
  },
});
