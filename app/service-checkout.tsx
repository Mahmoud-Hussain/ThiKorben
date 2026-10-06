import { Ionicons } from '@expo/vector-icons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  getServiceRequest,
  getServiceRequestProposals,
} from '@/features/community/community.service';
import type {
  CommunityProposal,
  CommunityRequest,
} from '@/features/community/types';
import {
  getCatalog,
  getJobMaterials,
} from '@/features/materials/materials.service';
import type {
  JobMaterialRequest,
  ServiceProduct,
} from '@/features/materials/types';
import {
  loadServiceOrder,
  placeServiceOrder,
} from '@/features/orders/order.service';
import type {
  PaymentMethod,
  ServiceOrderRecord,
} from '@/features/orders/types';

const C = {
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
  warningSoft: '#FFF8E7',
};

const PAYMENT_METHODS: {
  id: PaymentMethod;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
  {
    id: 'bkash',
    title: 'bKash',
    subtitle: 'Presentation payment choice',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'card',
    title: 'Card',
    subtitle: 'Presentation payment choice',
    icon: 'card-outline',
  },
  {
    id: 'cash',
    title: 'Cash',
    subtitle: 'Pay after service',
    icon: 'cash-outline',
  },
];

function money(value: number) {
  return `৳${Number(value).toLocaleString()}`;
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

export default function ServiceCheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ requestId?: string }>();

  const [request, setRequest] = useState<CommunityRequest | null>(null);
  const [accepted, setAccepted] = useState<CommunityProposal | null>(null);
  const [materials, setMaterials] = useState<JobMaterialRequest[]>([]);
  const [products, setProducts] = useState<ServiceProduct[]>([]);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('bkash');
  const [existingOrder, setExistingOrder] =
    useState<ServiceOrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hydrate = useCallback(async () => {
    await Promise.resolve();

    if (!params.requestId) {
      setError('Open checkout from an assigned service request.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextRequest = await getServiceRequest(params.requestId);
      const [nextProposals, nextMaterials, nextProducts, order] =
        await Promise.all([
          getServiceRequestProposals(params.requestId),
          getJobMaterials(params.requestId),
          getCatalog(nextRequest.category),
          loadServiceOrder(params.requestId),
        ]);

      setRequest(nextRequest);
      setAccepted(
        nextProposals.find(item => item.status === 'accepted') ?? null,
      );
      setMaterials(nextMaterials);
      setProducts(nextProducts);
      setExistingOrder(order);
    } catch (loadError) {
      setError(errorText(loadError));
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

  const productMap = useMemo(
    () => new Map(products.map(item => [item.id, item])),
    [products],
  );

  const approvedMaterials = useMemo(
    () => materials.filter(item => item.status === 'approved'),
    [materials],
  );

  const preview = useMemo(() => {
    const labor = Number(accepted?.price_amount ?? 0);
    const materialSubtotal = approvedMaterials.reduce(
      (sum, item) =>
        sum + Number(item.unit_price_snapshot) * item.quantity,
      0,
    );
    const deliveryFee =
      materialSubtotal === 0
        ? 0
        : materialSubtotal >= 1500
          ? 0
          : 80;
    const shopFee = materialSubtotal > 0 ? 20 : 0;
    const serviceFee = accepted ? 35 : 0;

    return {
      labor,
      materialSubtotal,
      deliveryFee,
      shopFee,
      serviceFee,
      grandTotal:
        labor +
        materialSubtotal +
        deliveryFee +
        shopFee +
        serviceFee,
    };
  }, [accepted, approvedMaterials]);

  const order = existingOrder;

  const submit = async () => {
    if (!request || !accepted || processing) {
      return;
    }

    setProcessing(true);

    try {
      const created = await placeServiceOrder({
        serviceRequestId: request.id,
        paymentMethod,
      });

      setExistingOrder(created);
    } catch (submitError) {
      Alert.alert('Checkout failed', errorText(submitError));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.purple} />
          <Text style={styles.centerText}>Preparing service checkout…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !request || !accepted) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="person-add-outline"
              size={34}
              color={C.purple}
            />
          </View>
          <Text style={styles.centerTitle}>Checkout not ready</Text>
          <Text style={styles.centerText}>
            {error ??
              'Accept a worker proposal before opening final checkout.'}
          </Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => router.replace('/community')}
          >
            <Text style={styles.retryText}>Return to Community</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (order) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.appShell}>
          <View style={styles.successScreen}>
            <View style={styles.successIconOuter}>
              <View style={styles.successIconInner}>
                <Ionicons name="checkmark" size={42} color="#fff" />
              </View>
            </View>

            <Text style={styles.successTitle}>Service Order Confirmed</Text>
            <Text style={styles.orderId}>
              TK-{order.id.slice(0, 8).toUpperCase()}
            </Text>
            <Text style={styles.successText}>
              The customer, assigned worker, approved materials, and job
              progress are now connected to one service order.
            </Text>

            <View style={styles.orderSummaryCard}>
              <Text style={styles.orderJobTitle}>{request.title}</Text>
              <Text style={styles.orderWorker}>
                Accepted labor: {money(order.labor_cost)}
              </Text>

              <View style={styles.summaryDivider} />

              <SummaryRow label="Worker Labor" value={order.labor_cost} />
              <SummaryRow
                label="Approved Materials"
                value={order.material_subtotal}
              />
              <SummaryRow label="Delivery" value={order.delivery_fee} />
              <SummaryRow
                label="Shop Fee"
                value={order.shop_platform_fee}
              />
              <SummaryRow
                label="Service Fee"
                value={order.service_platform_fee}
              />

              <View style={styles.summaryDivider} />

              <View style={styles.finalTotalRow}>
                <Text style={styles.finalTotalLabel}>Grand Total</Text>
                <Text style={styles.finalTotalValue}>
                  {money(order.grand_total)}
                </Text>
              </View>
            </View>

            <View style={styles.demoNotice}>
              <Ionicons
                name="information-circle-outline"
                size={17}
                color={C.purple}
              />
              <Text style={styles.demoNoticeText}>
                The order record is real and shared through Supabase. No real
                financial transaction is processed in presentation mode.
              </Text>
            </View>

            <Pressable
              style={styles.primarySuccessButton}
              onPress={() =>
                router.replace({
                  pathname: '/track-worker',
                  params: { requestId: request.id },
                } as Href)
              }
            >
              <Ionicons name="navigate" size={17} color="#fff" />
              <Text style={styles.primarySuccessText}>
                Track Service Progress
              </Text>
            </Pressable>

            <Pressable
              style={styles.secondarySuccessButton}
              onPress={() =>
                router.replace({
                  pathname: '/job-chat',
                  params: { requestId: request.id },
                })
              }
            >
              <Text style={styles.secondarySuccessText}>Open Job Chat</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.appShell}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={20} color={C.text} />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Final Checkout</Text>
            <Text style={styles.headerSubtitle}>Full service billing</Text>
          </View>

          <View style={styles.secureHeader}>
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={C.success}
            />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>COMPLETE SERVICE TOTAL</Text>
            <Text style={styles.heroTitle}>{request.title}</Text>

            <View style={styles.heroBottom}>
              <View>
                <Text style={styles.heroWorker}>Assigned worker</Text>
                <Text style={styles.heroWorkerSub}>
                  Accepted proposal
                </Text>
              </View>

              <Text style={styles.heroTotal}>
                {money(preview.grandTotal)}
              </Text>
            </View>
          </View>

          <SectionTitle
            title="Approved Materials"
            right={`${approvedMaterials.length} items`}
          />

          {approvedMaterials.length === 0 ? (
            <View style={styles.emptyMaterials}>
              <Text style={styles.emptyMaterialsText}>
                No approved worker materials for this job.
              </Text>
            </View>
          ) : (
            <View style={styles.materialCard}>
              {approvedMaterials.map(item => (
                <View key={item.id} style={styles.materialRow}>
                  <View style={styles.materialIcon}>
                    <Ionicons
                      name="cube-outline"
                      size={20}
                      color={C.purple}
                    />
                  </View>

                  <View style={styles.flex}>
                    <Text style={styles.materialName}>
                      {productMap.get(item.product_id)?.name ??
                        'Approved material'}
                    </Text>
                    <Text style={styles.materialQty}>
                      Qty {item.quantity}
                    </Text>
                  </View>

                  <Text style={styles.materialPrice}>
                    {money(
                      Number(item.unit_price_snapshot) * item.quantity,
                    )}
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
              value={preview.labor}
            />
            <CostRow
              icon="cube-outline"
              label="Materials"
              subtitle="Customer-approved only"
              value={preview.materialSubtotal}
            />
            <CostRow
              icon="car-outline"
              label="Material Delivery"
              subtitle="Shop delivery"
              value={preview.deliveryFee}
              free={preview.deliveryFee === 0}
            />
            <CostRow
              icon="bag-handle-outline"
              label="Shop Processing Fee"
              subtitle="Product support"
              value={preview.shopFee}
            />
            <CostRow
              icon="shield-checkmark-outline"
              label="Service Platform Fee"
              subtitle="Booking support"
              value={preview.serviceFee}
            />

            <View style={styles.summaryDivider} />

            <View style={styles.finalTotalRow}>
              <Text style={styles.finalTotalLabel}>Grand Total</Text>
              <Text style={styles.finalTotalValue}>
                {money(preview.grandTotal)}
              </Text>
            </View>
          </View>

          <SectionTitle title="Payment Method" right="Presentation" />

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
                      selected && styles.paymentIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={19}
                      color={selected ? '#fff' : C.purple}
                    />
                  </View>

                  <View style={styles.flex}>
                    <Text style={styles.paymentTitle}>{item.title}</Text>
                    <Text style={styles.paymentSub}>{item.subtitle}</Text>
                  </View>

                  <Ionicons
                    name={
                      selected
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    size={20}
                    color={selected ? C.purple : '#C3C6D0'}
                  />
                </Pressable>
              );
            })}
          </View>

          <View style={styles.safeCard}>
            <Ionicons name="eye-outline" size={18} color={C.success} />
            <Text style={styles.safeText}>
              The backend recalculates labor and approved-material totals when
              you confirm. Client values are never trusted for the final order.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomLabel}>Final Total</Text>
            <Text style={styles.bottomTotal}>
              {money(preview.grandTotal)}
            </Text>
          </View>

          <Pressable
            onPress={() => void submit()}
            disabled={processing}
            style={[
              styles.placeOrderButton,
              processing && styles.disabled,
            ]}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name="checkmark-circle-outline"
                size={17}
                color="#fff"
              />
            )}

            <Text style={styles.placeOrderText}>
              {processing ? 'Confirming…' : 'Confirm Service Order'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function SectionTitle({
  title,
  right,
}: {
  title: string;
  right: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionRight}>{right}</Text>
    </View>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <View style={styles.simpleRow}>
      <Text style={styles.simpleLabel}>{label}</Text>
      <Text style={styles.simpleValue}>{money(value)}</Text>
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
        <Ionicons name={icon} size={15} color={C.purple} />
      </View>

      <View style={styles.flex}>
        <Text style={styles.costLabel}>{label}</Text>
        <Text style={styles.costSubtitle}>{subtitle}</Text>
      </View>

      <Text
        style={[
          styles.costValue,
          free && styles.freeValue,
        ]}
      >
        {free ? 'FREE' : money(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: '#E9ECF3' },
  appShell: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: C.background,
  },
  header: {
    height: 62,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.card,
  },
  headerButton: {
    width: 39,
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 12, fontWeight: '900', color: C.text },
  headerSubtitle: { marginTop: 2, fontSize: 7, color: C.muted },
  secureHeader: {
    width: 39,
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: C.successSoft,
  },
  scrollContent: { padding: 13, paddingBottom: 110 },
  heroCard: {
    padding: 14,
    borderRadius: 17,
    backgroundColor: C.purple,
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
    color: '#fff',
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
  heroWorker: { fontSize: 8.5, fontWeight: '900', color: '#fff' },
  heroWorkerSub: { marginTop: 2, fontSize: 6, color: '#C9C5E8' },
  heroTotal: { fontSize: 23, fontWeight: '900', color: '#fff' },
  sectionHeading: {
    marginTop: 17,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: C.text },
  sectionRight: { fontSize: 6.8, color: C.muted },
  emptyMaterials: {
    padding: 13,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    backgroundColor: C.card,
  },
  emptyMaterialsText: { fontSize: 9, color: C.muted },
  materialCard: {
    padding: 10,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    backgroundColor: C.card,
  },
  materialRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  materialIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.purpleSoft,
  },
  materialName: { fontSize: 9.5, fontWeight: '800', color: C.text },
  materialQty: { marginTop: 2, fontSize: 7.5, color: C.muted },
  materialPrice: { fontSize: 9.5, fontWeight: '900', color: C.orange },
  costCard: {
    padding: 10,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    backgroundColor: C.card,
  },
  costRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  costIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.purpleSoft,
  },
  costLabel: { fontSize: 9.5, fontWeight: '800', color: C.text },
  costSubtitle: { marginTop: 1, fontSize: 7, color: C.muted },
  costValue: { fontSize: 9.5, fontWeight: '900', color: C.text },
  freeValue: { color: C.success },
  summaryDivider: {
    height: 1,
    marginVertical: 8,
    backgroundColor: C.border,
  },
  finalTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  finalTotalLabel: { fontSize: 11, fontWeight: '900', color: C.text },
  finalTotalValue: { fontSize: 15, fontWeight: '900', color: C.orange },
  paymentList: { gap: 8 },
  paymentOption: {
    minHeight: 58,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    backgroundColor: C.card,
  },
  paymentSelected: {
    borderColor: C.purple,
    backgroundColor: '#FAF9FF',
  },
  paymentIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.purpleSoft,
  },
  paymentIconSelected: { backgroundColor: C.purple },
  paymentTitle: { fontSize: 9.5, fontWeight: '900', color: C.text },
  paymentSub: { marginTop: 2, fontSize: 7.3, color: C.muted },
  safeCard: {
    marginTop: 13,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    borderRadius: 13,
    backgroundColor: C.successSoft,
  },
  safeText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 12,
    color: '#648A75',
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
    borderTopColor: C.border,
    backgroundColor: C.card,
  },
  bottomLabel: { fontSize: 7, color: C.muted },
  bottomTotal: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: '900',
    color: C.text,
  },
  placeOrderButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: C.orange,
  },
  placeOrderText: { fontSize: 9.5, fontWeight: '900', color: '#fff' },
  disabled: { opacity: 0.6 },
  center: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: { marginTop: 10, fontSize: 15, fontWeight: '900', color: C.text },
  centerText: {
    marginTop: 7,
    maxWidth: 330,
    textAlign: 'center',
    fontSize: 10.5,
    lineHeight: 16,
    color: C.muted,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.purpleSoft,
  },
  retryButton: {
    marginTop: 14,
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.purple,
  },
  retryText: { fontSize: 10, fontWeight: '900', color: '#fff' },
  successScreen: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconOuter: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.successSoft,
  },
  successIconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.success,
  },
  successTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '900',
    color: C.text,
  },
  orderId: {
    marginTop: 5,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: C.purple,
  },
  successText: {
    marginTop: 8,
    maxWidth: 360,
    textAlign: 'center',
    fontSize: 10.5,
    lineHeight: 16,
    color: C.muted,
  },
  orderSummaryCard: {
    width: '100%',
    marginTop: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    backgroundColor: C.card,
  },
  orderJobTitle: { fontSize: 11.5, fontWeight: '900', color: C.text },
  orderWorker: { marginTop: 3, fontSize: 8.5, color: C.muted },
  simpleRow: {
    minHeight: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  simpleLabel: { fontSize: 8.5, color: C.muted },
  simpleValue: { fontSize: 8.5, fontWeight: '900', color: C.text },
  demoNotice: {
    width: '100%',
    marginTop: 12,
    padding: 11,
    flexDirection: 'row',
    gap: 7,
    borderRadius: 13,
    backgroundColor: C.warningSoft,
  },
  demoNoticeText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 12,
    color: C.muted,
  },
  primarySuccessButton: {
    width: '100%',
    minHeight: 46,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: C.orange,
  },
  primarySuccessText: { fontSize: 10, fontWeight: '900', color: '#fff' },
  secondarySuccessButton: {
    width: '100%',
    minHeight: 44,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: C.purpleSoft,
  },
  secondarySuccessText: {
    fontSize: 10,
    fontWeight: '900',
    color: C.purple,
  },
});
