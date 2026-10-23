import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOWS, RADIUS, sp } from '../constants/theme';

export default function CartScreen({ navigation }) {
  const {
    cart, cartTotalCount, cartSubtotal, discountAmount,
    deliveryFee, cartFinalTotal, couponCode,
    applyCoupon, removeCoupon, incrementCartItem,
    decrementCartItem, removeFromCart, clearCart, user, switchUserRole,
  } = useApp();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 36) : 0);

  const isCustomer = user?.role === 'customer';
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState({ text: '', isError: false });
  const [checkoutModal, setCheckoutModal] = useState(false);

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) {
      setCouponMsg({ text: 'Please enter a coupon code (e.g. FRESH20)', isError: true });
      return;
    }
    const res = applyCoupon(couponInput);
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) setCouponInput('');
  };

  const confirmOrder = () => {
    setCheckoutModal(false);
    clearCart();
    Alert.alert(
      'Order Confirmed! 🎉',
      `Thank you, ${user.name}!\nDelivering to: ${user.address || 'RVS Campus, Sulur'}\nEstimated delivery: 25-30 mins.`,
      [{ text: 'Great!', onPress: () => navigation.navigate('HomeTab') }]
    );
  };

  // If Admin views Cart screen, show customer-only restriction
  if (!isCustomer) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <View style={[styles.header, { paddingTop: topPadding + 6 }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeTab'))}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.restrictedIconCircle}>
            <Ionicons name="shield-outline" size={48} color="#4F46E5" />
          </View>
          <Text style={styles.emptyTitle}>Customer Exclusive Access</Text>
          <Text style={styles.emptySub}>
            Shopping cart and checkout functions are strictly available for Customer accounts only.
            {'\n\n'}
            Currently logged in as Store Administrator.
          </Text>
          <TouchableOpacity
            style={styles.switchRoleBtn}
            onPress={() => switchUserRole('customer')}
          >
            <Ionicons name="swap-horizontal" size={16} color="#fff" />
            <Text style={styles.switchRoleBtnText}>Switch to Customer Mode</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => {
    const itemTotal = item.product.price * item.quantity;
    return (
      <View style={[styles.cartItemCard, SHADOWS.small]}>
        <Image source={{ uri: item.product.image }} style={styles.itemImg} resizeMode="cover" />

        <View style={styles.itemInfo}>
          <View style={styles.itemTopRow}>
            <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
            <TouchableOpacity onPress={() => removeFromCart(item.product.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.itemUnit}>{item.product.unit}</Text>

          <View style={styles.itemBottomRow}>
            <Text style={styles.itemTotal}>₹{itemTotal}</Text>

            {/* Stepper (Add or Subtract) */}
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => decrementCartItem(item.product.id)}
              >
                <Ionicons
                  name={item.quantity === 1 ? 'trash-outline' : 'remove'}
                  size={14}
                  color={item.quantity === 1 ? COLORS.danger : COLORS.text}
                />
              </TouchableOpacity>
              <Text style={styles.stepVal}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => incrementCartItem(item.product.id)}
              >
                <Ionicons name="add" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 6 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeTab'))}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => navigation.openDrawer()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="menu-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Cart</Text>
          {cartTotalCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{cartTotalCount} items</Text>
            </View>
          )}
        </View>

        {cart.length > 0 ? (
          <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.product.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          cart.length > 0 ? (
            <View style={styles.itemSummaryChip}>
              <Ionicons name="cart" size={14} color={COLORS.primary} />
              <Text style={styles.itemSummaryText}>
                {cartTotalCount} item{cartTotalCount !== 1 ? 's' : ''} in your cart
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          cart.length > 0 ? (
            <View style={{ gap: 12, marginTop: 4 }}>
              {/* Coupon section */}
              <View style={[styles.couponCard, SHADOWS.small]}>
                <View style={styles.couponHeader}>
                  <Ionicons name="pricetag-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.couponTitle}>Apply Discount Coupon</Text>
                </View>

                {couponCode ? (
                  <View style={styles.appliedRow}>
                    <View style={styles.appliedBadge}>
                      <Ionicons name="pricetag" size={12} color={COLORS.primary} />
                      <Text style={styles.appliedText}>{couponCode} applied — saving ₹{discountAmount}</Text>
                    </View>
                    <TouchableOpacity onPress={removeCoupon}>
                      <Ionicons name="close-circle" size={17} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View style={styles.couponInputRow}>
                      <TextInput
                        style={styles.couponInput}
                        placeholder='Try "FRESH20" or "FRESH10"'
                        placeholderTextColor={COLORS.textMuted}
                        autoCapitalize="characters"
                        value={couponInput}
                        onChangeText={setCouponInput}
                      />
                      <TouchableOpacity style={styles.couponApplyBtn} onPress={handleApplyCoupon}>
                        <Text style={styles.couponApplyText}>Apply</Text>
                      </TouchableOpacity>
                    </View>
                    {couponMsg.text ? (
                      <Text style={[styles.couponMsg, { color: couponMsg.isError ? COLORS.danger : COLORS.primary }]}>
                        {couponMsg.text}
                      </Text>
                    ) : null}
                  </>
                )}
              </View>

              {/* Bill summary in Rupees */}
              <View style={[styles.billCard, SHADOWS.small]}>
                <Text style={styles.billTitle}>Order Summary</Text>

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Subtotal</Text>
                  <Text style={styles.billVal}>₹{cartSubtotal}</Text>
                </View>

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Delivery Fee</Text>
                  <Text style={[styles.billVal, deliveryFee === 0 && { color: COLORS.primary }]}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </Text>
                </View>

                {discountAmount > 0 && (
                  <View style={styles.billRow}>
                    <Text style={[styles.billLabel, { color: COLORS.primary }]}>Coupon Discount</Text>
                    <Text style={[styles.billVal, { color: COLORS.primary }]}>-₹{discountAmount}</Text>
                  </View>
                )}

                {deliveryFee === 0 && (
                  <View style={styles.freeDeliveryChip}>
                    <Ionicons name="car-outline" size={12} color={COLORS.primary} />
                    <Text style={styles.freeDeliveryText}>Free delivery on orders over ₹500</Text>
                  </View>
                )}

                <View style={styles.billDivider} />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Grand Total</Text>
                  <Text style={styles.totalValue}>₹{cartFinalTotal}</Text>
                </View>
              </View>

              {/* Checkout button */}
              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() => setCheckoutModal(true)}
                activeOpacity={0.88}
              >
                <Text style={styles.checkoutBtnText}>
                  Proceed to Checkout — ₹{cartFinalTotal}
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cart-outline" size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptySub}>
              Browse through our fresh groceries and add items to your cart!
            </Text>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => navigation.navigate('HomeTab')}
            >
              <Ionicons name="basket-outline" size={16} color="#fff" />
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Checkout confirmation modal */}
      <Modal
        visible={checkoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setCheckoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, SHADOWS.large]}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="receipt-outline" size={30} color={COLORS.primary} />
            </View>

            <Text style={styles.modalTitle}>Confirm Your Order</Text>
            <Text style={styles.modalSub}>
              Delivering to:{'\n'}
              <Text style={{ fontWeight: '600', color: COLORS.text }}>
                {user.name} ({user.phone || '9876543210'})
              </Text>
              {'\n'}{user.address || 'RVS Campus, Sulur, Coimbatore'}
            </Text>

            <View style={styles.modalAmountBox}>
              <Text style={styles.modalAmtLabel}>Total to Pay</Text>
              <Text style={styles.modalAmtValue}>₹{cartFinalTotal}</Text>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setCheckoutModal(false)}>
                <Text style={styles.modalCancelText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmOrder}>
                <Text style={styles.modalConfirmText}>Place Order ✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 8 },
  headerTitle: { fontSize: sp(16), fontWeight: '700', color: COLORS.text },
  countBadge: {
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  countBadgeText: { fontSize: sp(10), fontWeight: '600', color: COLORS.primary },
  clearBtn: { paddingHorizontal: 6, paddingVertical: 4 },
  clearBtnText: { fontSize: sp(12), fontWeight: '600', color: COLORS.danger },
  listContent: { padding: 12, paddingBottom: 60 },
  itemSummaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryBg,
    borderRadius: RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemSummaryText: { fontSize: sp(12), fontWeight: '600', color: COLORS.primary },

  // Cart item
  cartItemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: 10,
    marginBottom: 8,
  },
  itemImg: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#F7F9F7' },
  itemInfo: { flex: 1, marginLeft: 10, justifyContent: 'space-between' },
  itemTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { fontSize: sp(13), fontWeight: '600', color: COLORS.text, flex: 1, paddingRight: 4 },
  itemUnit: { fontSize: sp(11), color: COLORS.textMuted },
  itemBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  itemTotal: { fontSize: sp(15), fontWeight: '700', color: COLORS.text },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  stepVal: {
    width: 26,
    textAlign: 'center',
    fontSize: sp(13),
    fontWeight: '700',
    color: COLORS.text,
  },

  // Coupon
  couponCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: 12,
  },
  couponHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  couponTitle: { fontSize: sp(13), fontWeight: '600', color: COLORS.text },
  couponInputRow: { flexDirection: 'row', gap: 6 },
  couponInput: {
    flex: 1,
    height: 38,
    backgroundColor: '#F9F9F9',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    fontSize: sp(12),
    color: COLORS.text,
  },
  couponApplyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponApplyText: { color: '#fff', fontWeight: '600', fontSize: sp(12) },
  couponMsg: { fontSize: sp(11), marginTop: 4, fontWeight: '500' },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryBg,
    borderRadius: RADIUS.md,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  appliedText: { fontSize: sp(11), fontWeight: '600', color: COLORS.primary },

  // Bill
  billCard: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 14 },
  billTitle: { fontSize: sp(14), fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  billLabel: { fontSize: sp(12), color: COLORS.textSec },
  billVal: { fontSize: sp(12), fontWeight: '600', color: COLORS.text },
  freeDeliveryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryBg,
    borderRadius: RADIUS.md,
    padding: 6,
    marginBottom: 4,
  },
  freeDeliveryText: { fontSize: sp(11), color: COLORS.primary, fontWeight: '500' },
  billDivider: { height: 1, backgroundColor: COLORS.divider, marginVertical: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: sp(14), fontWeight: '700', color: COLORS.text },
  totalValue: { fontSize: sp(18), fontWeight: '700', color: COLORS.primary },

  // Checkout button
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  checkoutBtnText: { color: '#fff', fontSize: sp(14), fontWeight: '600' },

  // Empty
  emptyContainer: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 24 },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: { fontSize: sp(16), fontWeight: '700', color: COLORS.text },
  emptySub: { fontSize: sp(12), color: COLORS.textMuted, textAlign: 'center', lineHeight: sp(18), marginTop: 4, marginBottom: 16 },
  shopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
  },
  shopBtnText: { color: '#fff', fontSize: sp(13), fontWeight: '600' },

  restrictedIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    marginTop: 10,
  },
  switchRoleBtnText: { color: '#fff', fontSize: sp(13), fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: 18, alignItems: 'center' },
  modalIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalTitle: { fontSize: sp(16), fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  modalSub: { fontSize: sp(12), color: COLORS.textSec, textAlign: 'center', lineHeight: sp(17), marginBottom: 14 },
  modalAmountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: COLORS.primaryBg,
    padding: 10,
    borderRadius: RADIUS.md,
    marginBottom: 14,
  },
  modalAmtLabel: { fontSize: sp(12), fontWeight: '600', color: COLORS.textSec },
  modalAmtValue: { fontSize: sp(17), fontWeight: '700', color: COLORS.primary },
  modalBtnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  modalCancelBtn: {
    flex: 1, paddingVertical: 10, borderRadius: RADIUS.md,
    backgroundColor: '#F3F4F6', alignItems: 'center',
  },
  modalCancelText: { fontSize: sp(13), fontWeight: '500', color: COLORS.textSec },
  modalConfirmBtn: {
    flex: 1, paddingVertical: 10, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary, alignItems: 'center',
  },
  modalConfirmText: { fontSize: sp(13), fontWeight: '600', color: '#fff' },
});
