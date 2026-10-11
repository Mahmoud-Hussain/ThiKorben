import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  DemoRole,
  ProductRecommendation,
} from '@/services/chat-sync-service';
import { SHOP_PRODUCTS, ShopProduct } from '@/constants/shop-data';

interface Props {
  recommendations: ProductRecommendation[];
  demoRole: DemoRole;
  onApprove: (recId: string) => void;
  onReject: (recId: string) => void;
  onChangeProduct: (recId: string, newProductId: string) => void;
  onAddToCart: (recId: string) => void;
  onQuantityChange: (recId: string, newQty: number) => void;
}

export function ChatProductRecommendationGroup({
  recommendations,
  demoRole,
  onApprove,
  onReject,
  onChangeProduct,
  onAddToCart,
  onQuantityChange,
}: Props) {
  const [detailsProduct, setDetailsProduct] = useState<ShopProduct | null>(null);
  const [alternativeRecId, setAlternativeRecId] = useState<string | null>(null);

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <View style={styles.groupContainer} testID="chat-recommendations-panel">
      <View style={styles.groupHeader}>
        <View style={styles.aiBadge}>
          <Ionicons name="sparkles" size={13} color="#4338a8" />
          <Text style={styles.aiBadgeText}>AI Component Recommendations</Text>
        </View>
        <Text style={styles.groupSub}>
          {recommendations.length} item{recommendations.length > 1 ? 's' : ''} detected from worker request
        </Text>
      </View>

      {recommendations.map((rec) => {
        const product = rec.product;
        const isCustomer = demoRole === 'customer';
        const isPending = rec.status === 'pending';
        const isApproved = rec.status === 'approved';
        const isRejected = rec.status === 'rejected';
        const isAddedToCart = rec.status === 'added_to_cart';
        const lineTotal = product.price * rec.quantity;

        return (
          <View
            key={rec.id}
            testID={`chat-rec-card-${rec.id}`}
            style={[
              styles.card,
              isApproved && styles.cardApproved,
              isRejected && styles.cardRejected,
              isAddedToCart && styles.cardCarted,
            ]}
          >
            {/* Top row: Status Badge & Match Note */}
            <View style={styles.cardTopRow}>
              <View
                style={[
                  styles.statusBadge,
                  isPending && styles.statusBadgePending,
                  isApproved && styles.statusBadgeApproved,
                  isRejected && styles.statusBadgeRejected,
                  isAddedToCart && styles.statusBadgeCarted,
                ]}
              >
                <Ionicons
                  name={
                    isApproved
                      ? 'checkmark-circle'
                      : isRejected
                      ? 'close-circle'
                      : isAddedToCart
                      ? 'cart'
                      : 'time'
                  }
                  size={12}
                  color={
                    isApproved
                      ? '#16a760'
                      : isRejected
                      ? '#d9485f'
                      : isAddedToCart
                      ? '#7c3aed'
                      : '#d97706'
                  }
                />
                <Text
                  testID={`rec-status-${rec.id}`}
                  style={[
                    styles.statusBadgeText,
                    isApproved && styles.statusTextApproved,
                    isRejected && styles.statusTextRejected,
                    isAddedToCart && styles.statusTextCarted,
                    isPending && styles.statusTextPending,
                  ]}
                >
                  {isApproved
                    ? 'Customer Approved'
                    : isRejected
                    ? 'Rejected by Customer'
                    : isAddedToCart
                    ? 'Added to Demo Cart'
                    : 'Pending Customer Review'}
                </Text>
              </View>

              <Text style={styles.stockStatus}>
                {product.stock > 0 ? `✓ In Stock (${product.stock})` : 'Out of Stock'}
              </Text>
            </View>

            {/* Product Info Row */}
            <View style={styles.productMainRow}>
              <View style={styles.productIconBox}>
                <Ionicons name={product.icon as any} size={28} color="#4338a8" />
              </View>

              <View style={styles.productDetailsCol}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.matchedReason}>
                  {rec.matchedReason}
                </Text>
                <View style={styles.specsRow}>
                  <Text style={styles.specPill}>{product.categoryLabel}</Text>
                  {product.warrantyMonths && (
                    <Text style={styles.specPill}>{product.warrantyMonths}m Warranty</Text>
                  )}
                  <Text style={styles.ratingText}>★ {product.rating} ({product.reviews})</Text>
                </View>
              </View>

              <View style={styles.priceCol}>
                <Text style={styles.unitPrice}>৳{product.price.toLocaleString()}</Text>
                {product.oldPrice && (
                  <Text style={styles.oldPrice}>৳{product.oldPrice.toLocaleString()}</Text>
                )}
                <Text style={styles.unitSub}>Unit Price</Text>
              </View>
            </View>

            {/* Quantity Selector & Line Total */}
            <View style={styles.qtyRow}>
              <View style={styles.qtyControls}>
                <Text style={styles.qtyLabel}>Quantity:</Text>
                <TouchableOpacity
                  disabled={!isCustomer || rec.quantity <= 1 || isRejected}
                  onPress={() => onQuantityChange(rec.id, rec.quantity - 1)}
                  style={[
                    styles.qtyBtn,
                    (!isCustomer || rec.quantity <= 1 || isRejected) && styles.qtyBtnDisabled,
                  ]}
                  accessibilityLabel="Decrease quantity"
                >
                  <Ionicons name="remove" size={14} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{rec.quantity}</Text>
                <TouchableOpacity
                  disabled={!isCustomer || rec.quantity >= product.stock || isRejected}
                  onPress={() => onQuantityChange(rec.id, rec.quantity + 1)}
                  style={[
                    styles.qtyBtn,
                    (!isCustomer || rec.quantity >= product.stock || isRejected) && styles.qtyBtnDisabled,
                  ]}
                  accessibilityLabel="Increase quantity"
                >
                  <Ionicons name="add" size={14} color="#374151" />
                </TouchableOpacity>
              </View>

              <View style={styles.lineTotalWrapper}>
                <Text style={styles.lineTotalLabel}>Subtotal:</Text>
                <Text style={styles.lineTotalValue}>৳{lineTotal.toLocaleString()}</Text>
              </View>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.actionsRow}>
              {/* Customer Actions */}
              {isCustomer ? (
                <>
                  {isPending && (
                    <>
                      <TouchableOpacity
                        testID={`rec-btn-approve-${rec.id}`}
                        style={[styles.btn, styles.btnApprove]}
                        onPress={() => onApprove(rec.id)}
                      >
                        <Ionicons name="checkmark-circle" size={15} color="#ffffff" />
                        <Text style={styles.btnApproveText}>Approve</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        testID={`rec-btn-reject-${rec.id}`}
                        style={[styles.btn, styles.btnReject]}
                        onPress={() => onReject(rec.id)}
                      >
                        <Ionicons name="close-circle" size={15} color="#b91c1c" />
                        <Text style={styles.btnRejectText}>Reject</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        testID={`rec-btn-change-${rec.id}`}
                        style={[styles.btn, styles.btnChange]}
                        onPress={() => setAlternativeRecId(rec.id)}
                      >
                        <Ionicons name="swap-horizontal" size={15} color="#4338a8" />
                        <Text style={styles.btnChangeText}>Change</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {isApproved && (
                    <>
                      <TouchableOpacity
                        testID={`rec-btn-add-cart-${rec.id}`}
                        style={[styles.btn, styles.btnAddToCart]}
                        onPress={() => onAddToCart(rec.id)}
                      >
                        <Ionicons name="cart" size={15} color="#ffffff" />
                        <Text style={styles.btnAddToCartText}>Add to Cart (৳{lineTotal.toLocaleString()})</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.btn, styles.btnChange]}
                        onPress={() => setAlternativeRecId(rec.id)}
                      >
                        <Ionicons name="swap-horizontal" size={14} color="#4338a8" />
                        <Text style={styles.btnChangeText}>Change</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {isAddedToCart && (
                    <View style={styles.cartedConfirmedBadge}>
                      <Ionicons name="checkmark-done-circle" size={16} color="#7c3aed" />
                      <Text style={styles.cartedConfirmedText}>In Demo Cart ({rec.quantity} pcs)</Text>
                    </View>
                  )}

                  {isRejected && (
                    <TouchableOpacity
                      style={[styles.btn, styles.btnChange]}
                      onPress={() => setAlternativeRecId(rec.id)}
                    >
                      <Ionicons name="refresh" size={14} color="#4338a8" />
                      <Text style={styles.btnChangeText}>Pick Alternative</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.btn, styles.btnDetails]}
                    onPress={() => setDetailsProduct(product)}
                  >
                    <Ionicons name="information-circle-outline" size={15} color="#6b7280" />
                    <Text style={styles.btnDetailsText}>Details</Text>
                  </TouchableOpacity>
                </>
              ) : (
                /* Worker View (Read-Only Status) */
                <View style={styles.workerNoticeRow}>
                  <Ionicons name="lock-closed" size={14} color="#6b7280" />
                  <Text style={styles.workerNoticeText}>
                    {isApproved
                      ? 'Customer accepted this item. Material will be prepared.'
                      : isRejected
                      ? 'Customer declined this recommendation.'
                      : isAddedToCart
                      ? 'Customer added this part to cart for purchase.'
                      : 'Awaiting customer decision. Worker cannot approve.'}
                  </Text>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnDetails, { marginLeft: 'auto' }]}
                    onPress={() => setDetailsProduct(product)}
                  >
                    <Ionicons name="information-circle-outline" size={15} color="#6b7280" />
                    <Text style={styles.btnDetailsText}>Specs</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        );
      })}

      {/* Product Details Modal */}
      <Modal
        visible={!!detailsProduct}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailsProduct(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setDetailsProduct(null)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {detailsProduct && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleRow}>
                    <Ionicons name={detailsProduct.icon as any} size={22} color="#4338a8" />
                    <Text style={styles.modalTitle}>{detailsProduct.name}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setDetailsProduct(null)}>
                    <Ionicons name="close" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <Text style={styles.modalPrice}>
                    ৳{detailsProduct.price.toLocaleString()}
                    {detailsProduct.oldPrice && (
                      <Text style={styles.modalOldPrice}> (Regular: ৳{detailsProduct.oldPrice.toLocaleString()})</Text>
                    )}
                  </Text>

                  <Text style={styles.modalDesc}>{detailsProduct.description}</Text>

                  <Text style={styles.modalSectionTitle}>Specifications & Features:</Text>
                  {detailsProduct.features.map((feat, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <Ionicons name="checkmark-sharp" size={14} color="#16a760" />
                      <Text style={styles.featureText}>{feat}</Text>
                    </View>
                  ))}

                  <View style={styles.modalMetaRow}>
                    <Text style={styles.metaLabel}>Category: <Text style={styles.metaVal}>{detailsProduct.categoryLabel}</Text></Text>
                    <Text style={styles.metaLabel}>Stock: <Text style={styles.metaVal}>{detailsProduct.stock} units</Text></Text>
                    <Text style={styles.metaLabel}>Warranty: <Text style={styles.metaVal}>{detailsProduct.warrantyMonths || 0} months</Text></Text>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setDetailsProduct(null)}
                >
                  <Text style={styles.modalCloseBtnText}>Close Details</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Alternative Products Picker Modal */}
      <Modal
        visible={!!alternativeRecId}
        transparent
        animationType="slide"
        onRequestClose={() => setAlternativeRecId(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setAlternativeRecId(null)}>
          <Pressable style={styles.modalCardWide} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Alternative Component</Text>
                <Text style={styles.modalSub}>Pick from verified hardware catalog</Text>
              </View>
              <TouchableOpacity onPress={() => setAlternativeRecId(null)}>
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollList}>
              {SHOP_PRODUCTS.map((prod) => (
                <TouchableOpacity
                  key={prod.id}
                  style={styles.altItemCard}
                  onPress={() => {
                    if (alternativeRecId) {
                      onChangeProduct(alternativeRecId, prod.id);
                      setAlternativeRecId(null);
                    }
                  }}
                >
                  <View style={styles.altItemIcon}>
                    <Ionicons name={prod.icon as any} size={22} color="#4338a8" />
                  </View>
                  <View style={styles.altItemInfo}>
                    <Text style={styles.altItemName}>{prod.name}</Text>
                    <Text style={styles.altItemCategory}>{prod.categoryLabel} • {prod.stock} in stock</Text>
                  </View>
                  <View style={styles.altItemPrice}>
                    <Text style={styles.altPriceText}>৳{prod.price.toLocaleString()}</Text>
                    <Text style={styles.selectAltLabel}>Select</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  groupContainer: {
    marginVertical: 8,
    marginHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e0e7ff',
    padding: 12,
    shadowColor: '#4338a8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  groupHeader: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 8,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiBadgeText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#4338a8',
    letterSpacing: 0.2,
  },
  groupSub: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 8,
  },
  cardApproved: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  cardRejected: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    opacity: 0.8,
  },
  cardCarted: {
    backgroundColor: '#faf5ff',
    borderColor: '#e9d5ff',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusBadgePending: {
    backgroundColor: '#fef3c7',
  },
  statusBadgeApproved: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeRejected: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeCarted: {
    backgroundColor: '#f3e8ff',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextPending: {
    color: '#b45309',
  },
  statusTextApproved: {
    color: '#15803d',
  },
  statusTextRejected: {
    color: '#b91c1c',
  },
  statusTextCarted: {
    color: '#6b21a8',
  },
  stockStatus: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16a760',
  },
  productMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  productIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productDetailsCol: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
  },
  matchedReason: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
    fontStyle: 'italic',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  specPill: {
    fontSize: 9.5,
    fontWeight: '700',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#475569',
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ea580c',
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  unitPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15157d',
  },
  oldPrice: {
    fontSize: 10,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  unitSub: {
    fontSize: 9,
    color: '#94a3b8',
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qtyLabel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: {
    opacity: 0.35,
  },
  qtyValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    minWidth: 18,
    textAlign: 'center',
  },
  lineTotalWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  lineTotalLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  lineTotalValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnApprove: {
    backgroundColor: '#16a760',
  },
  btnApproveText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '800',
  },
  btnReject: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  btnRejectText: {
    color: '#b91c1c',
    fontSize: 11.5,
    fontWeight: '700',
  },
  btnChange: {
    backgroundColor: '#eeedff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  btnChangeText: {
    color: '#4338a8',
    fontSize: 11,
    fontWeight: '700',
  },
  btnAddToCart: {
    backgroundColor: '#7c3aed',
    flex: 1,
    justifyContent: 'center',
  },
  btnAddToCartText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '800',
  },
  btnDetails: {
    backgroundColor: '#f1f5f9',
  },
  btnDetailsText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  cartedConfirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#f5f3ff',
    borderRadius: 8,
  },
  cartedConfirmedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c3aed',
  },
  workerNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  workerNoticeText: {
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    width: '100%',
    maxWidth: 440,
    maxHeight: '80%',
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  modalCardWide: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748b',
  },
  modalBody: {
    paddingVertical: 12,
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#15157d',
    marginBottom: 8,
  },
  modalOldPrice: {
    fontSize: 12,
    fontWeight: '400',
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  modalDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
    marginBottom: 12,
  },
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 11.5,
    color: '#334155',
  },
  modalMetaRow: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  metaVal: {
    fontWeight: '700',
    color: '#0f172a',
  },
  modalCloseBtn: {
    backgroundColor: '#15157d',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12.5,
  },
  modalScrollList: {
    maxHeight: 380,
    marginVertical: 10,
  },
  altItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 6,
  },
  altItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  altItemInfo: {
    flex: 1,
  },
  altItemName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  altItemCategory: {
    fontSize: 10,
    color: '#64748b',
  },
  altItemPrice: {
    alignItems: 'flex-end',
  },
  altPriceText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15157d',
  },
  selectAltLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4338a8',
  },
});
