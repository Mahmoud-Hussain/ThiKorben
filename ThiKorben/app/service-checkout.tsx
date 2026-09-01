import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
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

import { formatShopMoney, getDetailedCartItems } from '@/constants/shop-data';

import {
  getServiceCostSummary,
  ServiceCostSummary,
} from '@/constants/service-cost';

import {
  getAcceptedProposal,
  getSelectedJob,
  ServiceOrder,
  submitServiceOrder,
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

type PaymentMethod = 'bkash' | 'card' | 'cash';

const PAYMENT_METHODS: {
  id: PaymentMethod;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
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
  useMarketplaceVersion();

  const job = getSelectedJob();

  const accepted = job ? getAcceptedProposal(job.id) : undefined;

  const [items, setItems] = useState(getDetailedCartItems());

  const [cost, setCost] = useState<ServiceCostSummary>(getServiceCostSummary());

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');

  const [processing, setProcessing] = useState(false);

  const [order, setOrder] = useState<ServiceOrder | undefined>();

  const successScale = useRef(new Animated.Value(0.7)).current;

  const successOpacity = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      setItems(getDetailedCartItems());

      setCost(getServiceCostSummary());
    }, []),
  );

  const placeOrder = () => {
    if (!job || !accepted) {
      Alert.alert(
        'Worker required',
        'Please accept a worker proposal before placing the final service order.',
      );

      return;
    }

    if (processing) {
      return;
    }

    setProcessing(true);

    setTimeout(() => {
      const newOrder = submitServiceOrder({
        paymentMethod,

        laborCost: cost.laborCost,

        materialSubtotal: cost.materialSubtotal,

        deliveryFee: cost.deliveryFee,

        shopPlatformFee: cost.shopPlatformFee,

        servicePlatformFee: cost.servicePlatformFee,

        grandTotal: cost.grandTotal,
      });

      setProcessing(false);

      if (!newOrder) {
        return;
      }

      setOrder(newOrder);

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
    }, 650);
  };

  if (order) {
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
                  <Ionicons name="checkmark" size={43} color="#FFFFFF" />
                </View>
              </View>

              <Text style={styles.successTitle}>Order Submitted</Text>

              <Text style={styles.orderId}>{order.id}</Text>

              <Text style={styles.successText}>
                Your worker, service and required materials are now connected to
                one ThiKorben order.
              </Text>

              <View style={styles.orderSummaryCard}>
                <Text style={styles.orderJobTitle}>{order.jobTitle}</Text>

                <Text style={styles.orderWorker}>
                  Worker: {order.workerName}
                </Text>

                <View style={styles.summaryDivider} />

                <SummaryRow label="Worker Labor" value={order.laborCost} />

                <SummaryRow label="Materials" value={order.materialSubtotal} />

                <SummaryRow label="Delivery" value={order.deliveryFee} />

                <SummaryRow label="Shop Fee" value={order.shopPlatformFee} />

                <SummaryRow
                  label="Service Fee"
                  value={order.servicePlatformFee}
                />

                <View style={styles.summaryDivider} />

                <View style={styles.finalTotalRow}>
                  <Text style={styles.finalTotalLabel}>Grand Total</Text>

                  <Text style={styles.finalTotalValue}>
                    {formatShopMoney(order.grandTotal)}
                  </Text>
                </View>
              </View>

              <View style={styles.statusCard}>
                <StatusLine text="Worker Assigned" />

                <StatusLine text="Products Ordered" />

                <StatusLine text="Service Scheduled" />
              </View>

              <View style={styles.demoNotice}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={COLORS.purple}
                />

                <Text style={styles.demoNoticeText}>
                  Prototype order submission. No real financial transaction is
                  processed.
                </Text>
              </View>

              <Pressable
                onPress={() => router.replace('/community')}
                style={styles.primarySuccessButton}
              >
                <Ionicons name="people-outline" size={17} color="#FFFFFF" />

                <Text style={styles.primarySuccessText}>Back to Community</Text>
              </Pressable>

              <Pressable
                onPress={() => router.replace('/job-chat')}
                style={styles.secondarySuccessButton}
              >
                <Text style={styles.secondarySuccessText}>Open Job Chat</Text>
              </Pressable>
            </Animated.View>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!job || !accepted) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <SafeAreaView style={styles.screen}>
          <View style={styles.appShell}>
            <View style={styles.notReadyScreen}>
              <View style={styles.notReadyIcon}>
                <Ionicons
                  name="person-add-outline"
                  size={34}
                  color={COLORS.purple}
                />
              </View>

              <Text style={styles.notReadyTitle}>Select a Worker First</Text>

              <Text style={styles.notReadyText}>
                Final billing requires an accepted worker proposal so ThiKorben
                can combine labor and material costs.
              </Text>

              <Pressable
                onPress={() => router.replace('/community')}
                style={styles.notReadyButton}
              >
                <Text style={styles.notReadyButtonText}>
                  Return to Community
                </Text>
              </Pressable>
            </View>
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
              <Text style={styles.headerTitle}>Final Checkout</Text>

              <Text style={styles.headerSubtitle}>Full service billing</Text>
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
              <Text style={styles.heroLabel}>COMPLETE SERVICE TOTAL</Text>

              <Text style={styles.heroTitle}>{job.title}</Text>

              <View style={styles.heroBottom}>
                <View>
                  <Text style={styles.heroWorker}>{accepted.workerName}</Text>

                  <Text style={styles.heroWorkerSub}>Assigned worker</Text>
                </View>

                <Text style={styles.heroTotal}>
                  {formatShopMoney(cost.grandTotal)}
                </Text>
              </View>
            </View>

            <SectionTitle
              title="Purchased Materials"
              right={`${items.length} products`}
            />

            {items.length === 0 ? (
              <View style={styles.emptyMaterials}>
                <Text style={styles.emptyMaterialsText}>
                  No products added.
                </Text>

                <Pressable onPress={() => router.push('/shop')}>
                  <Text style={styles.shopLink}>Open Shop</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.materialCard}>
                {items.map(item => (
                  <View key={item.productId} style={styles.materialRow}>
                    <View style={styles.materialIcon}>
                      <Ionicons
                        name={item.product.icon}
                        size={20}
                        color={COLORS.purple}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.materialName}>
                        {item.product.name}
                      </Text>

                      <Text style={styles.materialQty}>
                        Qty {item.quantity}
                      </Text>
                    </View>

                    <Text style={styles.materialPrice}>
                      {formatShopMoney(item.lineTotal)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <SectionTitle title="Full Cost Breakdown" right="Transparent" />

            <View style={styles.costCard}>
              <CostRow
                icon="construct-outline"
                label="Worker Labor"
                subtitle="Accepted proposal"
                value={cost.laborCost}
              />

              <CostRow
                icon="cube-outline"
                label="Materials"
                subtitle="ThiKorben Shop"
                value={cost.materialSubtotal}
              />

              <CostRow
                icon="car-outline"
                label="Material Delivery"
                subtitle="Shop delivery"
                value={cost.deliveryFee}
                free={cost.deliveryFee === 0}
              />

              <CostRow
                icon="bag-handle-outline"
                label="Shop Processing Fee"
                subtitle="Product support"
                value={cost.shopPlatformFee}
              />

              <CostRow
                icon="shield-checkmark-outline"
                label="Service Platform Fee"
                subtitle="Booking support"
                value={cost.servicePlatformFee}
              />

              <View style={styles.summaryDivider} />

              <View style={styles.finalTotalRow}>
                <Text style={styles.finalTotalLabel}>Grand Total</Text>

                <Text style={styles.finalTotalValue}>
                  {formatShopMoney(cost.grandTotal)}
                </Text>
              </View>
            </View>

            <SectionTitle title="Payment Method" right="Demo" />

            <View style={styles.paymentList}>
              {PAYMENT_METHODS.map(item => {
                const selected = paymentMethod === item.id;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setPaymentMethod(item.id)}
                    style={[
                      styles.paymentOption,
                      selected && styles.paymentSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.paymentIcon,
                        selected && {
                          backgroundColor: COLORS.purple,
                        },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={19}
                        color={selected ? '#FFFFFF' : COLORS.purple}
                      />
                    </View>

                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <Text style={styles.paymentTitle}>{item.title}</Text>

                      <Text style={styles.paymentSub}>{item.subtitle}</Text>
                    </View>

                    <Ionicons
                      name={selected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={selected ? COLORS.purple : '#C3C6D0'}
                    />
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.safeCard}>
              <Ionicons name="eye-outline" size={18} color={COLORS.success} />

              <Text style={styles.safeText}>
                No hidden charges. Labor, products, delivery and platform fees
                are shown separately.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.bottomLabel}>Final Total</Text>

              <Text style={styles.bottomTotal}>
                {formatShopMoney(cost.grandTotal)}
              </Text>
            </View>

            <Pressable
              onPress={placeOrder}
              disabled={processing}
              style={[
                styles.placeOrderButton,
                processing && {
                  opacity: 0.65,
                },
              ]}
            >
              <Ionicons
                name={
                  processing ? 'hourglass-outline' : 'checkmark-circle-outline'
                }
                size={17}
                color="#FFFFFF"
              />

              <Text style={styles.placeOrderText}>
                {processing ? 'Submitting...' : 'Place Service Order'}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

function SectionTitle({ title, right }: { title: string; right: string }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <Text style={styles.sectionRight}>{right}</Text>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.simpleRow}>
      <Text style={styles.simpleLabel}>{label}</Text>

      <Text style={styles.simpleValue}>{formatShopMoney(value)}</Text>
    </View>
  );
}

function StatusLine({ text }: { text: string }) {
  return (
    <View style={styles.statusLine}>
      <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />

      <Text style={styles.statusLineText}>{text}</Text>
    </View>
  );
}

function CostRow({
  icon,
  label,
  subtitle,
  value,
  free,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  subtitle: string;
  value: number;
  free?: boolean;
}) {
  return (
    <View style={styles.costRow}>
      <View style={styles.costIcon}>
        <Ionicons name={icon} size={15} color={COLORS.purple} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.costLabel}>{label}</Text>

        <Text style={styles.costSubtitle}>{subtitle}</Text>
      </View>

      <Text
        style={[
          styles.costValue,
          free && {
            color: COLORS.success,
          },
        ]}
      >
        {free ? 'FREE' : formatShopMoney(value)}
      </Text>
    </View>
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
    marginTop: 2,
    fontSize: 7,
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
    padding: 13,
    paddingBottom: 110,
  },

  heroCard: {
    padding: 14,
    borderRadius: 17,
    backgroundColor: COLORS.purple,
  },

  heroLabel: {
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: 0.7,
    color: '#DCD9FF',
  },

  heroTitle: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  heroBottom: {
    marginTop: 14,
    paddingTop: 11,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.17)',
  },

  heroWorker: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  heroWorkerSub: {
    marginTop: 2,
    fontSize: 6,
    color: '#C9C5E8',
  },

  heroTotal: {
    fontSize: 23,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  sectionHeading: {
    marginTop: 17,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text,
  },

  sectionRight: {
    fontSize: 6.8,
    color: COLORS.muted,
  },

  materialCard: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    backgroundColor: COLORS.card,
  },

  materialRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
  },

  materialIcon: {
    width: 40,
    height: 40,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: COLORS.purpleSoft,
  },

  materialName: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.text,
  },

  materialQty: {
    marginTop: 2,
    fontSize: 6.5,
    color: COLORS.muted,
  },

  materialPrice: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  emptyMaterials: {
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor: COLORS.card,
  },

  emptyMaterialsText: {
    fontSize: 8,
    color: COLORS.muted,
  },

  shopLink: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.purple,
  },

  costCard: {
    padding: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    backgroundColor: COLORS.card,
  },

  costRow: {
    minHeight: 50,
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

  costLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.text,
  },

  costSubtitle: {
    marginTop: 2,
    fontSize: 6,
    color: COLORS.muted,
  },

  costValue: {
    fontSize: 8.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  summaryDivider: {
    height: 1,
    marginVertical: 8,
    backgroundColor: COLORS.border,
  },

  finalTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  finalTotalLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.text,
  },

  finalTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },

  paymentList: {
    gap: 7,
  },

  paymentOption: {
    minHeight: 61,
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor: COLORS.card,
  },

  paymentSelected: {
    borderColor: COLORS.purple,
  },

  paymentIcon: {
    width: 38,
    height: 38,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: COLORS.purpleSoft,
  },

  paymentTitle: {
    fontSize: 8.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  paymentSub: {
    marginTop: 2,
    fontSize: 6.5,
    color: COLORS.muted,
  },

  safeCard: {
    marginTop: 13,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 13,
    backgroundColor: COLORS.successSoft,
  },

  safeText: {
    flex: 1,
    fontSize: 6.8,
    lineHeight: 10,
    color: '#648A75',
  },

  bottomBar: {
    minHeight: 80,
    paddingHorizontal: 13,
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

  bottomLabel: {
    fontSize: 6.5,
    color: COLORS.muted,
  },

  bottomTotal: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
  },

  placeOrderButton: {
    minWidth: 175,
    minHeight: 46,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 12,
    backgroundColor: COLORS.orange,
  },

  placeOrderText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  successScreen: {
    flex: 1,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  successIconOuter: {
    width: 105,
    height: 105,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: COLORS.successSoft,
  },

  successIconInner: {
    width: 69,
    height: 69,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: COLORS.success,
  },

  successTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },

  orderId: {
    marginTop: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 7,
    fontWeight: '900',
    color: COLORS.purple,
    backgroundColor: COLORS.purpleSoft,
  },

  successText: {
    maxWidth: 300,
    marginTop: 7,
    textAlign: 'center',
    fontSize: 8,
    lineHeight: 12,
    color: COLORS.muted,
  },

  orderSummaryCard: {
    width: '100%',
    marginTop: 15,
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    backgroundColor: COLORS.card,
  },

  orderJobTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.text,
  },

  orderWorker: {
    marginTop: 3,
    fontSize: 7,
    color: COLORS.muted,
  },

  simpleRow: {
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  simpleLabel: {
    fontSize: 7,
    color: COLORS.muted,
  },

  simpleValue: {
    fontSize: 7.5,
    fontWeight: '900',
    color: COLORS.text,
  },

  statusCard: {
    width: '100%',
    marginTop: 10,
    padding: 10,
    gap: 7,
    borderRadius: 13,
    backgroundColor: COLORS.successSoft,
  },

  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  statusLineText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#39705A',
  },

  demoNotice: {
    width: '100%',
    marginTop: 9,
    padding: 9,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    borderRadius: 11,
    backgroundColor: COLORS.warningSoft,
  },

  demoNoticeText: {
    flex: 1,
    fontSize: 6.3,
    lineHeight: 10,
    color: '#75694C',
  },

  primarySuccessButton: {
    width: '100%',
    minHeight: 46,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    backgroundColor: COLORS.purple,
  },

  primarySuccessText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  secondarySuccessButton: {
    width: '100%',
    minHeight: 42,
    marginTop: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.purpleSoft,
  },

  secondarySuccessText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.purple,
  },

  notReadyScreen: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notReadyIcon: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    backgroundColor: COLORS.purpleSoft,
  },

  notReadyTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
  },

  notReadyText: {
    maxWidth: 300,
    marginTop: 6,
    textAlign: 'center',
    fontSize: 8,
    lineHeight: 12,
    color: COLORS.muted,
  },

  notReadyButton: {
    minHeight: 44,
    marginTop: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.purple,
  },

  notReadyButtonText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
