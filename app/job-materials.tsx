import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useSession } from '@/contexts/session-context';
import { getServiceRequest } from '@/features/community/community.service';
import type { CommunityRequest } from '@/features/community/types';
import {
  createMaterialRequest,
  decideMaterialRequest,
  getCatalog,
  getJobMaterials,
} from '@/features/materials/materials.service';
import type {
  JobMaterialRequest,
  ServiceProduct,
} from '@/features/materials/types';
import { SHOP_PRODUCTS } from '@/constants/shop-data';
import { getDemoRole, setDemoRole, DemoRole } from '@/services/chat-sync-service';

const COLORS = {
  primary: '#15157d',
  primarySoft: '#eeedff',
  orange: '#F7941D',
  orangeSoft: '#fff4e7',
  green: '#178c4f',
  greenSoft: '#eaf8f0',
  red: '#c43d39',
  redSoft: '#fff0ef',
  bg: '#f7f6fb',
  card: '#fff',
  text: '#181820',
  muted: '#6b6b78',
  border: '#e5e2eb',
};

const FALLBACK_DEMO_REQUEST: CommunityRequest = {
  id: 'req-demo-plumbing-1',
  customer_id: 'customer-demo-1',
  accepted_proposal_id: 'prop-demo-1',
  title: 'Plumbing Leak Fix & Basin Joint Repair (Dhanmondi 27)',
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

const FALLBACK_CATALOG: ServiceProduct[] = SHOP_PRODUCTS.map(p => ({
  id: p.id,
  name: p.name,
  slug: p.id,
  category: p.category,
  description: p.description,
  unit_price: p.price,
  currency: 'BDT',
  active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

const INITIAL_DEMO_MATERIALS: JobMaterialRequest[] = [
  {
    id: 'mat-demo-1',
    service_request_id: 'req-demo-plumbing-1',
    product_id: 'pvc-connector-half',
    worker_id: 'worker-demo-1',
    quantity: 2,
    unit_price_snapshot: 120,
    currency: 'BDT',
    reason: 'Cracked connection pipe leaking behind the cabinet.',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    resolved_at: null,
  },
  {
    id: 'mat-demo-2',
    service_request_id: 'req-demo-plumbing-1',
    product_id: 'teflon-tape',
    worker_id: 'worker-demo-1',
    quantity: 1,
    unit_price_snapshot: 45,
    currency: 'BDT',
    reason: 'Thread seal needed for non-drip fitting.',
    status: 'approved',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    resolved_at: new Date(Date.now() - 3000000).toISOString(),
  },
];

function money(value: number, currency: string) {
  return `${currency === 'BDT' ? '৳' : currency + ' '}${Number(value).toLocaleString()}`;
}

export default function JobMaterialsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ requestId?: string }>();
  const { role: sessionRole } = useSession();
  const [demoRole, setDemoRoleState] = useState<DemoRole>(getDemoRole);

  const activeRole = demoRole || sessionRole || 'customer';

  const [request, setRequest] = useState<CommunityRequest | null>(null);
  const [products, setProducts] = useState<ServiceProduct[]>([]);
  const [materials, setMaterials] = useState<JobMaterialRequest[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productMap = useMemo(
    () => new Map(products.map(item => [item.id, item])),
    [products],
  );

  const approvedTotal = useMemo(
    () =>
      materials
        .filter(item => item.status === 'approved')
        .reduce(
          (sum, item) =>
            sum + Number(item.unit_price_snapshot) * item.quantity,
          0,
        ),
    [materials],
  );

  const hydrate = useCallback(async () => {
    setLoading(true);
    setError(null);

    let nextRequest: CommunityRequest | null = null;
    let nextProducts: ServiceProduct[] = [];
    let nextMaterials: JobMaterialRequest[] = [];

    if (params.requestId) {
      try {
        const timeoutReq = new Promise<null>(resolve =>
          setTimeout(() => resolve(null), 1500),
        );
        nextRequest = await Promise.race([
          getServiceRequest(params.requestId),
          timeoutReq,
        ]);
      } catch (err) {
        console.warn('Could not fetch request by ID, falling back to demo', err);
      }
    }

    if (!nextRequest) {
      nextRequest = FALLBACK_DEMO_REQUEST;
      const matching = FALLBACK_CATALOG.filter(
        p => p.category === FALLBACK_DEMO_REQUEST.category,
      );
      nextProducts = matching.length > 0 ? matching : FALLBACK_CATALOG;
      nextMaterials = INITIAL_DEMO_MATERIALS;
    } else {
      try {
        const timeoutProd = new Promise<ServiceProduct[]>(resolve =>
          setTimeout(() => resolve([]), 1500),
        );
        nextProducts = await Promise.race([
          getCatalog(nextRequest.category),
          timeoutProd,
        ]);
      } catch {}

      if (!nextProducts || nextProducts.length === 0) {
        const matching = FALLBACK_CATALOG.filter(
          p => p.category === nextRequest?.category,
        );
        nextProducts = matching.length > 0 ? matching : FALLBACK_CATALOG;
      }

      try {
        const timeoutMat = new Promise<JobMaterialRequest[]>(resolve =>
          setTimeout(() => resolve([]), 1500),
        );
        nextMaterials = await Promise.race([
          getJobMaterials(nextRequest.id),
          timeoutMat,
        ]);
      } catch {}

      if (!nextMaterials || nextMaterials.length === 0) {
        nextMaterials = INITIAL_DEMO_MATERIALS;
      }
    }

    setRequest(nextRequest);
    setProducts(nextProducts);
    setMaterials(nextMaterials);
    setSelectedProductId(current => current ?? nextProducts[0]?.id ?? null);
    setLoading(false);
  }, [params.requestId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void hydrate();
    }, 0);

    return () => clearTimeout(timer);
  }, [hydrate]);

  const requestMaterial = async () => {
    if (!request || !selectedProductId || saving) {
      return;
    }

    const numericQuantity = Number(quantity);
    if (!numericQuantity || numericQuantity <= 0) {
      Alert.alert('Invalid quantity', 'Please enter a valid quantity.');
      return;
    }

    if (!reason || reason.trim().length < 5) {
      Alert.alert('Reason required', 'Please explain why this material is required (at least 5 characters).');
      return;
    }

    setSaving(true);
    const selectedProd = products.find(p => p.id === selectedProductId);

    try {
      await createMaterialRequest({
        serviceRequestId: request.id,
        productId: selectedProductId,
        quantity: numericQuantity,
        reason: reason.trim(),
      });
      setReason('');
      setQuantity('1');
      await hydrate();
    } catch {
      // Local fallback simulation for demo requests
      const localMat: JobMaterialRequest = {
        id: `mat-${Date.now()}`,
        service_request_id: request.id,
        product_id: selectedProductId,
        worker_id: 'worker-demo-1',
        quantity: numericQuantity,
        unit_price_snapshot: selectedProd?.unit_price ?? 120,
        currency: selectedProd?.currency ?? 'BDT',
        reason: reason.trim(),
        status: 'pending',
        created_at: new Date().toISOString(),
        resolved_at: null,
      };
      setMaterials(prev => [localMat, ...prev]);
      setReason('');
      setQuantity('1');
    } finally {
      setSaving(false);
    }
  };

  const decide = async (
    materialRequestId: string,
    status: 'approved' | 'rejected',
  ) => {
    if (saving) {
      return;
    }

    setSaving(true);

    try {
      await decideMaterialRequest({
        materialRequestId,
        status,
      });

      await hydrate();
    } catch {
      // Local fallback simulation for demo requests
      setMaterials(prev =>
        prev.map(m =>
          m.id === materialRequestId
            ? { ...m, status, resolved_at: new Date().toISOString() }
            : m,
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.centerText}>Loading material workflow…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={36} color={COLORS.red} />
          <Text style={styles.centerTitle}>Materials unavailable</Text>
          <Text style={styles.centerText}>{error ?? 'Request not found.'}</Text>
          <Pressable style={styles.retry} onPress={() => void hydrate()}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Job Materials</Text>
          <Text style={styles.headerSubtitle}>{request.title}</Text>
        </View>

        <Pressable
          style={styles.headerButton}
          onPress={() => router.push('/chat')}
          accessibilityLabel="Open Chat"
        >
          <Ionicons name="chatbubbles-outline" size={20} color={COLORS.primary} />
        </Pressable>

        <Pressable style={styles.headerButton} onPress={() => void hydrate()}>
          <Ionicons name="refresh" size={20} color={COLORS.primary} />
        </Pressable>
      </View>

      <View style={styles.roleToggleBar}>
        <Pressable
          style={[
            styles.roleToggleTab,
            activeRole === 'customer' && styles.roleToggleTabActive,
          ]}
          onPress={() => {
            setDemoRoleState('customer');
            setDemoRole('customer');
          }}
        >
          <Ionicons
            name="person"
            size={13}
            color={activeRole === 'customer' ? '#fff' : COLORS.muted}
          />
          <Text
            style={[
              styles.roleToggleText,
              activeRole === 'customer' && styles.roleToggleTextActive,
            ]}
          >
            Customer View
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.roleToggleTab,
            activeRole === 'worker' && styles.roleToggleTabActive,
          ]}
          onPress={() => {
            setDemoRoleState('worker');
            setDemoRole('worker');
          }}
        >
          <Ionicons
            name="construct"
            size={13}
            color={activeRole === 'worker' ? '#fff' : COLORS.muted}
          />
          <Text
            style={[
              styles.roleToggleText,
              activeRole === 'worker' && styles.roleToggleTextActive,
            ]}
          >
            Worker View
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summary}>
          <View style={styles.summaryIcon}>
            <Ionicons name="cart-outline" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.summaryTitle}>Customer-controlled material approval</Text>
            <Text style={styles.summaryText}>
              Workers can request catalog items with a reason. Customers approve or reject each request before purchase.
            </Text>
          </View>
        </View>

        {activeRole === 'worker' ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Request a material</Text>
            <Text style={styles.sectionText}>
              Choose a real catalog item and explain why this job needs it.
            </Text>

            {products.length === 0 ? (
              <Text style={styles.emptyText}>
                No active catalog items are available for {request.category}.
              </Text>
            ) : (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.productRow}
                >
                  {products.map(product => {
                    const selected = product.id === selectedProductId;

                    return (
                      <Pressable
                        key={product.id}
                        style={[
                          styles.productChip,
                          selected && styles.productChipActive,
                        ]}
                        onPress={() => setSelectedProductId(product.id)}
                      >
                        <Text
                          style={[
                            styles.productChipName,
                            selected && styles.productChipNameActive,
                          ]}
                        >
                          {product.name}
                        </Text>
                        <Text
                          style={[
                            styles.productChipPrice,
                            selected && styles.productChipPriceActive,
                          ]}
                        >
                          {money(product.unit_price, product.currency)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="number-pad"
                  placeholder="1"
                />

                <Text style={styles.label}>Why is this needed?</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  textAlignVertical="top"
                  placeholder="Explain how this material relates to the repair."
                  placeholderTextColor={COLORS.muted}
                  maxLength={1000}
                />

                <Pressable
                  style={[styles.primaryButton, saving && styles.disabled]}
                  disabled={saving}
                  onPress={() => void requestMaterial()}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="paper-plane" size={17} color="#fff" />
                      <Text style={styles.primaryButtonText}>Send for Approval</Text>
                    </>
                  )}
                </Pressable>
              </>
            )}
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Material requests</Text>
            <Text style={styles.sectionText}>
              {materials.length} request{materials.length === 1 ? '' : 's'}
            </Text>
          </View>

          <View style={styles.totalBadge}>
            <Text style={styles.totalLabel}>Approved total</Text>
            <Text style={styles.totalValue}>৳{approvedTotal.toLocaleString()}</Text>
          </View>
        </View>

        {materials.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="cube-outline" size={32} color={COLORS.muted} />
            <Text style={styles.emptyTitle}>No materials requested</Text>
            <Text style={styles.emptyText}>
              The assigned worker can request catalog items after reviewing the job.
            </Text>
          </View>
        ) : (
          materials.map(item => {
            const product = productMap.get(item.product_id);
            const lineTotal = Number(item.unit_price_snapshot) * item.quantity;

            return (
              <View key={item.id} style={styles.materialCard}>
                <View style={styles.materialTop}>
                  <View style={styles.materialIcon}>
                    <Ionicons name="cube-outline" size={20} color={COLORS.primary} />
                  </View>

                  <View style={styles.flex}>
                    <Text style={styles.materialName}>
                      {product?.name ?? 'Catalog material'}
                    </Text>
                    <Text style={styles.materialMeta}>
                      Qty {item.quantity} • {money(item.unit_price_snapshot, item.currency)} each
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.status,
                      item.status === 'approved'
                        ? styles.statusApproved
                        : item.status === 'rejected'
                          ? styles.statusRejected
                          : styles.statusPending,
                    ]}
                  >
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                  </View>
                </View>

                <Text style={styles.reason}>{item.reason}</Text>

                <View style={styles.lineTotalRow}>
                  <Text style={styles.lineTotalLabel}>Line total</Text>
                  <Text style={styles.lineTotalValue}>
                    {money(lineTotal, item.currency)}
                  </Text>
                </View>

                {activeRole === 'customer' && item.status === 'pending' ? (
                  <View style={styles.actions}>
                    <Pressable
                      style={[styles.rejectButton, saving && styles.disabled]}
                      disabled={saving}
                      onPress={() => void decide(item.id, 'rejected')}
                    >
                      <Ionicons name="close" size={16} color={COLORS.red} />
                      <Text style={styles.rejectText}>Reject</Text>
                    </Pressable>

                    <Pressable
                      style={[styles.approveButton, saving && styles.disabled]}
                      disabled={saving}
                      onPress={() => void decide(item.id, 'approved')}
                    >
                      <Ionicons name="checkmark" size={16} color="#fff" />
                      <Text style={styles.approveText}>Approve</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: COLORS.bg },
  roleToggleBar: {
    flexDirection: 'row',
    padding: 3,
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#e7e5f1',
    borderRadius: 12,
    maxWidth: 720,
    alignSelf: 'center',
    width: '92%',
  },
  roleToggleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: 9,
  },
  roleToggleTabActive: {
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  roleToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted,
  },
  roleToggleTextActive: {
    color: '#fff',
    fontWeight: '900',
  },
  header: {
    minHeight: 66,
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
  headerText: { flex: 1 },
  headerTitle: { fontSize: 14, fontWeight: '900', color: COLORS.text },
  headerSubtitle: { marginTop: 2, fontSize: 9.5, color: COLORS.muted },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 15,
    paddingBottom: 50,
    gap: 12,
  },
  summary: {
    padding: 15,
    flexDirection: 'row',
    gap: 10,
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
  },
  summaryIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  summaryTitle: { fontSize: 12.5, fontWeight: '900', color: COLORS.primary },
  summaryText: { marginTop: 3, fontSize: 10, lineHeight: 15, color: COLORS.muted },
  card: {
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: COLORS.text },
  sectionText: { marginTop: 3, fontSize: 9.5, color: COLORS.muted },
  productRow: { marginTop: 14, gap: 8 },
  productChip: {
    width: 190,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.bg,
  },
  productChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  productChipName: { fontSize: 10.5, fontWeight: '900', color: COLORS.text },
  productChipNameActive: { color: '#fff' },
  productChipPrice: { marginTop: 4, fontSize: 10, fontWeight: '800', color: COLORS.orange },
  productChipPriceActive: { color: '#ffd9b5' },
  label: { marginTop: 15, marginBottom: 7, fontSize: 10.5, fontWeight: '900', color: COLORS.text },
  input: {
    minHeight: 48,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    fontSize: 11,
  },
  textArea: { minHeight: 95, paddingTop: 11 },
  primaryButton: {
    minHeight: 48,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  disabled: { opacity: 0.5 },
  totalBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 11,
    backgroundColor: COLORS.orangeSoft,
  },
  totalLabel: { fontSize: 8.5, color: COLORS.muted },
  totalValue: { marginTop: 1, fontSize: 11.5, fontWeight: '900', color: COLORS.orange },
  emptyCard: {
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    backgroundColor: '#fff',
  },
  emptyTitle: { marginTop: 8, fontSize: 12, fontWeight: '900', color: COLORS.text },
  emptyText: {
    marginTop: 4,
    maxWidth: 330,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    color: COLORS.muted,
  },
  materialCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    backgroundColor: '#fff',
  },
  materialTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  materialIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
  },
  materialName: { fontSize: 11.5, fontWeight: '900', color: COLORS.text },
  materialMeta: { marginTop: 2, fontSize: 9.5, color: COLORS.muted },
  status: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 999 },
  statusPending: { backgroundColor: COLORS.orangeSoft },
  statusApproved: { backgroundColor: COLORS.greenSoft },
  statusRejected: { backgroundColor: COLORS.redSoft },
  statusText: { fontSize: 7.5, fontWeight: '900', color: COLORS.text },
  reason: { marginTop: 11, fontSize: 10.5, lineHeight: 16, color: COLORS.muted },
  lineTotalRow: {
    marginTop: 11,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  lineTotalLabel: { fontSize: 10, color: COLORS.muted },
  lineTotalValue: { fontSize: 11, fontWeight: '900', color: COLORS.text },
  actions: { marginTop: 11, flexDirection: 'row', gap: 8 },
  rejectButton: {
    flex: 1,
    minHeight: 41,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#f0c2c0',
    borderRadius: 11,
    backgroundColor: COLORS.redSoft,
  },
  rejectText: { fontSize: 10, fontWeight: '900', color: COLORS.red },
  approveButton: {
    flex: 1,
    minHeight: 41,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 11,
    backgroundColor: COLORS.green,
  },
  approveText: { fontSize: 10, fontWeight: '900', color: '#fff' },
  center: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  centerTitle: { marginTop: 10, fontSize: 15, fontWeight: '900', color: COLORS.text },
  centerText: {
    marginTop: 7,
    maxWidth: 330,
    fontSize: 10.5,
    lineHeight: 16,
    textAlign: 'center',
    color: COLORS.muted,
  },
  retry: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
  },
  retryText: { fontSize: 10.5, fontWeight: '900', color: '#fff' },
});
