import React from 'react';
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
  clearCart,
  getCartCount,
  getCartSubtotal,
  getDetailedCartItems,
  removeFromCart,
  updateCartQuantity,
} from '@/constants/shop-data';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCartUpdated?: () => void;
}

export function InChatCartModal({ visible, onClose, onCartUpdated }: Props) {
  const cartItems = getDetailedCartItems();
  const subtotal = getCartSubtotal();
  const totalCount = getCartCount();

  const handleUpdateQty = (productId: string, newQty: number) => {
    updateCartQuantity(productId, newQty);
    if (onCartUpdated) onCartUpdated();
  };

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
    if (onCartUpdated) onCartUpdated();
  };

  const handleClear = () => {
    clearCart();
    if (onCartUpdated) onCartUpdated();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          testID="in-chat-cart-modal"
          style={styles.cartCard}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.cartIconBadge}>
                <Ionicons name="cart" size={18} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.title}>In-Chat Demo Cart</Text>
                <Text style={styles.subtitle}>
                  {totalCount} approved item{totalCount === 1 ? '' : 's'} ready for job
                </Text>
              </View>
            </View>

            <TouchableOpacity
              testID="close-in-chat-cart-btn"
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Close cart"
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Cart Items List */}
          {cartItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cart-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>Your In-Chat Cart is Empty</Text>
              <Text style={styles.emptyText}>
                When a worker mentions required materials, approve the recommendations to add them directly to this demo cart.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollList}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {cartItems.map((item) => (
                <View
                  key={item.productId}
                  testID={`cart-item-${item.productId}`}
                  style={styles.itemRow}
                >
                  <View style={styles.itemIconBox}>
                    <Ionicons name={item.product.icon as any} size={22} color="#4338a8" />
                  </View>

                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.product.name}
                    </Text>
                    <Text style={styles.itemMeta}>
                      ৳{item.product.price.toLocaleString()} each • {item.product.categoryLabel}
                    </Text>

                    <View style={styles.itemQtyControls}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => handleUpdateQty(item.productId, item.quantity - 1)}
                        accessibilityLabel="Decrease quantity"
                      >
                        <Ionicons name="remove" size={13} color="#374151" />
                      </TouchableOpacity>

                      <Text style={styles.qtyText}>{item.quantity}</Text>

                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => handleUpdateQty(item.productId, item.quantity + 1)}
                        accessibilityLabel="Increase quantity"
                      >
                        <Ionicons name="add" size={13} color="#374151" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleRemove(item.productId)}
                        style={styles.removeBtn}
                        accessibilityLabel="Remove item"
                      >
                        <Ionicons name="trash-outline" size={14} color="#dc2626" />
                        <Text style={styles.removeText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.itemLineTotal}>
                    <Text style={styles.lineTotalText}>
                      ৳{item.lineTotal.toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Subtotal and Footer */}
          {cartItems.length > 0 && (
            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Materials Subtotal</Text>
                <Text testID="cart-subtotal-amount" style={styles.summaryValue}>
                  ৳{subtotal.toLocaleString()}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Worker Pickup & Delivery</Text>
                <Text style={styles.freeBadge}>FREE (Included in Job)</Text>
              </View>

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Estimated Total</Text>
                <Text style={styles.totalValue}>৳{subtotal.toLocaleString()}</Text>
              </View>

              <View style={styles.footerActions}>
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={handleClear}
                >
                  <Text style={styles.clearBtnText}>Clear Cart</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  testID="return-to-chat-btn"
                  style={styles.returnBtn}
                  onPress={onClose}
                >
                  <Ionicons name="chatbubble" size={15} color="#ffffff" />
                  <Text style={styles.returnBtnText}>Return to Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  cartCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '80%',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
  },
  closeBtn: {
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
  scrollList: {
    maxHeight: 280,
    marginVertical: 10,
  },
  listContent: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  itemMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  itemQtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  qtyBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    minWidth: 16,
    textAlign: 'center',
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 12,
  },
  removeText: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '600',
  },
  itemLineTotal: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  lineTotalText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#15157d',
  },
  summarySection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  freeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a760',
  },
  totalRow: {
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#7c3aed',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b91c1c',
  },
  returnBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#15157d',
    borderRadius: 10,
    paddingVertical: 10,
  },
  returnBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
  },
});
