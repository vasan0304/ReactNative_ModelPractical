import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOWS, RADIUS, sp } from '../constants/theme';

export default function FavoritesScreen({ navigation }) {
  const { products, favorites, toggleFavorite, addToCart, addMultipleToCart, user } = useApp();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 36) : 0);
  const [toast, setToast] = useState('');

  const isCustomer = user?.role === 'customer';
  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleAdd = (product) => {
    if (!isCustomer) {
      showToast('Cart access is for Customers only');
      return;
    }
    const res = addToCart(product, 1);
    if (res?.message) {
      showToast(res.message);
    } else {
      showToast(`Added ${product.name} to cart`);
    }
  };

  const handleAddAll = () => {
    if (!isCustomer) {
      showToast('Cart access is for Customers only');
      return;
    }
    if (favoriteProducts.length === 0) return;
    addMultipleToCart(favoriteProducts);
    Alert.alert(
      'All Added! 🛒',
      `${favoriteProducts.length} items added to your cart.`,
      [
        { text: 'Keep Browsing', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('CartTab') },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={[styles.itemCard, SHADOWS.small]}>
      <TouchableOpacity
        style={styles.imageWrap}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
        {item.discount > 0 && (
          <View style={styles.discBadge}>
            <Text style={styles.discBadgeText}>-{item.discount}%</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.itemInfo}>
        <View style={styles.itemTopRow}>
          <View style={styles.catPill}>
            <Text style={styles.catPillText}>{item.category.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
            <Ionicons name="heart" size={18} color={COLORS.danger} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { product: item })}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemUnit}>{item.unit}</Text>
        </TouchableOpacity>

        <View style={styles.itemPriceRow}>
          <View>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
            {item.oldPrice > 0 && (
              <Text style={styles.itemOldPrice}>₹{item.oldPrice}</Text>
            )}
          </View>

          {isCustomer && (
            <TouchableOpacity style={styles.addBtn} onPress={() => handleAdd(item)}>
              <Ionicons name="cart-outline" size={13} color="#fff" />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      {/* Toast */}
      {!!toast && (
        <View style={[styles.toast, { top: topPadding + 60 }, SHADOWS.medium]}>
          <Ionicons name="checkmark-circle" size={14} color="#fff" />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

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
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={favoriteProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          favoriteProducts.length > 0 ? (
            <View style={styles.listHeaderRow}>
              <Text style={styles.listCount}>
                {favoriteProducts.length} saved item{favoriteProducts.length !== 1 ? 's' : ''}
              </Text>
              {isCustomer && (
                <TouchableOpacity style={styles.addAllBtn} onPress={handleAddAll}>
                  <Ionicons name="cart-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.addAllBtnText}>Add All to Cart</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-outline" size={44} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptySub}>
              Tap the heart icon on any product to save it to your wishlist
            </Text>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => navigation.navigate('HomeTab')}
            >
              <Ionicons name="basket-outline" size={16} color="#fff" />
              <Text style={styles.shopBtnText}>Explore Groceries</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  toast: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 999,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
  },
  toastText: { color: '#fff', fontSize: sp(12), fontWeight: '600' },
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
  headerTitle: { flex: 1, fontSize: sp(16), fontWeight: '700', color: COLORS.text, paddingLeft: 8 },
  listContent: { padding: 12, paddingBottom: 60 },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  listCount: { fontSize: sp(12), fontWeight: '600', color: COLORS.textSec },
  addAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addAllBtnText: { fontSize: sp(11), fontWeight: '600', color: COLORS.primary },

  // Item card
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: 10,
    marginBottom: 8,
  },
  imageWrap: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: '#F7F9F7',
    position: 'relative',
  },
  itemImage: { width: '100%', height: '100%' },
  discBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: COLORS.deal,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discBadgeText: { color: '#fff', fontSize: sp(8), fontWeight: '700' },
  itemInfo: { flex: 1, marginLeft: 10, justifyContent: 'space-between' },
  itemTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  catPill: {
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  catPillText: { fontSize: sp(9), fontWeight: '600', color: COLORS.primary },
  itemName: { fontSize: sp(13), fontWeight: '600', color: COLORS.text, marginTop: 2 },
  itemUnit: { fontSize: sp(11), color: COLORS.textMuted },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  itemPrice: { fontSize: sp(14), fontWeight: '700', color: COLORS.text },
  itemOldPrice: { fontSize: sp(10), color: COLORS.textMuted, textDecorationLine: 'line-through' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  addBtnText: { color: '#fff', fontSize: sp(11), fontWeight: '600' },

  // Empty
  emptyContainer: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 24 },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { fontSize: sp(16), fontWeight: '700', color: COLORS.text },
  emptySub: {
    fontSize: sp(12),
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: sp(18),
    marginTop: 4,
    marginBottom: 16,
  },
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
});
