import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
  Platform,
  Modal,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/groceryData';
import { COLORS, SHADOWS, RADIUS, sp, isTablet } from '../constants/theme';
import { ProductCard, CategoryChip } from '../components/SharedComponents';

const { width: SW } = Dimensions.get('window');

export default function ProductListScreen({ navigation, route }) {
  const { user, products, cartTotalCount, addToCart, addProduct } = useApp();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 36) : 0);

  const isCustomer = user?.role === 'customer';
  const scrollY = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    route?.params?.filterCategory || 'all'
  );
  const [sortBy, setSortBy] = useState('default');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState('');

  // Admin add product form state
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Fruits & Vegetables');
  const [newPrice, setNewPrice] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleAddToCart = (item) => {
    if (!isCustomer) {
      showToast('Cart access is for Customers only');
      return;
    }
    addToCart(item, 1);
  };

  // Filtered + sorted products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'priceLow') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'priceHigh') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'discount') list.sort((a, b) => b.discount - a.discount);

    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Validate and add product (Admin)
  const handleAddProduct = () => {
    const errs = {};
    if (!newName.trim() || newName.trim().length < 2) errs.name = 'Name required (min 2 chars)';
    if (!newPrice || isNaN(Number(newPrice)) || Number(newPrice) <= 0)
      errs.price = 'Enter a valid price > 0';
    if (!newUnit.trim()) errs.unit = 'Unit/weight is required (e.g. 1 kg, 500g)';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const pr = parseFloat(newPrice);
    addProduct({
      name: newName.trim(),
      category: newCat,
      price: pr,
      oldPrice: Math.round(pr * 1.25),
      unit: newUnit.trim(),
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      description: `Farm fresh ${newName.trim()} directly sourced for daily grocery shop catalog.`,
      calories: '45 kcal / 100g',
      organic: true,
      rating: 5.0,
      reviews: 1,
      discount: 20,
      isBestSeller: false,
      isDailyDeal: false,
    });

    setShowAddModal(false);
    setNewName(''); setNewPrice(''); setNewUnit(''); setFormErrors({});
    Alert.alert('Success', 'Product added to daily grocery inventory!');
  };

  const numColumns = isTablet ? 4 : 2;
  const cardW = isTablet ? (SW - 80) / 4 : (SW - 40) / 2;

  const sortLabels = {
    default: 'Relevance',
    priceLow: 'Price: Low → High',
    priceHigh: 'Price: High → Low',
    rating: 'Top Rated',
    discount: 'Best Discounts',
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Toast */}
      {!!toast && (
        <View style={[styles.toast, { top: topPadding + 60 }, SHADOWS.medium]}>
          <Ionicons name="information-circle" size={15} color="#fff" />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      {/* ── Top Header (with notch clearance & back button) ── */}
      <View style={[styles.header, { paddingTop: topPadding + 6 }]}>
        <View style={styles.headerTopRow}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeTab'))}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          {/* Menu Drawer Button */}
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => navigation.openDrawer()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="menu-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.searchInputWrap}>
            <Ionicons name="search-outline" size={15} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search groceries & produce..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={15} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Show Cart only if Customer */}
          {isCustomer ? (
            <TouchableOpacity
              style={styles.cartIconBtn}
              onPress={() => navigation.navigate('CartTab')}
            >
              <Ionicons name="cart-outline" size={22} color={COLORS.text} />
              {cartTotalCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartTotalCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={11} color="#fff" />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>

        {/* Category filter chips */}
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsList}
          renderItem={({ item }) => (
            <CategoryChip
              label={item.label === 'All Categories' ? 'All' : item.label.split(' ')[0]}
              isActive={selectedCategory === item.id}
              onPress={() => setSelectedCategory(item.id)}
            />
          )}
        />
      </View>

      {/* ── Product List ── */}
      <Animated.FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={numColumns}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        ListHeaderComponent={
          <View>
            {/* Admin panel strip */}
            {user.role === 'admin' && (
              <View style={[styles.adminStrip, SHADOWS.tiny]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adminStripTitle}>Administrator Console</Text>
                  <Text style={styles.adminStripSub}>
                    Manage product catalog and inventory
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.adminAddBtn}
                  onPress={() => setShowAddModal(true)}
                >
                  <Ionicons name="add-circle-outline" size={15} color="#fff" />
                  <Text style={styles.adminAddBtnText}>Add Product</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Results + Sort bar */}
            <View style={styles.resultsBar}>
              <Text style={styles.resultsText}>
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}{' '}
                {selectedCategory !== 'all' ? `in ${selectedCategory}` : 'available'}
              </Text>
              <TouchableOpacity
                style={styles.sortBtn}
                onPress={() => setShowSortModal(true)}
              >
                <Ionicons name="funnel-outline" size={13} color={COLORS.primary} />
                <Text style={styles.sortBtnText}>{sortLabels[sortBy]}</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            width={cardW}
            hideAdd={!isCustomer}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
            onAddToCart={handleAddToCart}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySub}>
              Try different keywords or reset the category filter.
            </Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            >
              <Text style={styles.resetBtnText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* ── Sort Modal ── */}
      <Modal visible={showSortModal} transparent animationType="slide" onRequestClose={() => setShowSortModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowSortModal(false)} />
        <View style={[styles.sortSheet, SHADOWS.large]}>
          <View style={styles.sortHandle} />
          <Text style={styles.sortSheetTitle}>Sort Products By</Text>
          {Object.entries(sortLabels).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.sortOption, sortBy === key && styles.sortOptionActive]}
              onPress={() => { setSortBy(key); setShowSortModal(false); }}
            >
              <Text style={[styles.sortOptionText, sortBy === key && styles.sortOptionTextActive]}>
                {label}
              </Text>
              {sortBy === key && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* ── Admin Add Product Modal ── */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.addModalOverlay}>
          <View style={[styles.addModalCard, SHADOWS.large]}>
            <View style={styles.addModalHeader}>
              <Text style={styles.addModalTitle}>Add New Grocery Item</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {[
              { label: 'Product Name *', value: newName, setter: setNewName, key: 'name', placeholder: 'e.g. Organic Carrots' },
              { label: 'Price (₹) *', value: newPrice, setter: setNewPrice, key: 'price', placeholder: 'e.g. 45', keyboardType: 'decimal-pad' },
              { label: 'Unit / Weight *', value: newUnit, setter: setNewUnit, key: 'unit', placeholder: 'e.g. 1 kg, 500g' },
            ].map((field) => (
              <View key={field.key} style={styles.addModalField}>
                <Text style={styles.addModalLabel}>{field.label}</Text>
                <TextInput
                  style={[styles.addModalInput, formErrors[field.key] && styles.addModalInputError]}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChangeText={field.setter}
                  keyboardType={field.keyboardType}
                />
                {formErrors[field.key] ? (
                  <Text style={styles.addModalError}>{formErrors[field.key]}</Text>
                ) : null}
              </View>
            ))}

            <View style={styles.addModalField}>
              <Text style={styles.addModalLabel}>Category</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={['Fruits & Vegetables', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery', 'Pantry & Staples', 'Beverages']}
                keyExtractor={(i) => i}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.catChipSmall, newCat === item && styles.catChipSmallActive]}
                    onPress={() => setNewCat(item)}
                  >
                    <Text style={[styles.catChipSmallText, newCat === item && styles.catChipSmallTextActive]}>
                      {item.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ gap: 6 }}
              />
            </View>

            <View style={styles.addModalBtns}>
              <TouchableOpacity style={styles.addModalCancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.addModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addModalConfirmBtn} onPress={handleAddProduct}>
                <Text style={styles.addModalConfirmText}>Add to Catalog</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  toast: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 999,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
  },
  toastText: { color: '#fff', fontSize: sp(12), fontWeight: '600' },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
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
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    height: 36,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: sp(12),
    color: COLORS.text,
  },
  cartIconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.deal,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: { color: '#fff', fontSize: sp(9), fontWeight: '700' },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    gap: 3,
  },
  adminBadgeText: {
    color: '#fff',
    fontSize: sp(10),
    fontWeight: '600',
  },
  chipsList: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    paddingTop: 2,
    gap: 6,
  },
  listContent: {
    padding: 12,
    paddingBottom: 40,
  },
  columnWrapper: {
    gap: 8,
    marginBottom: 4,
  },
  adminStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  adminStripTitle: { fontSize: sp(12), fontWeight: '600', color: '#3730A3' },
  adminStripSub: { fontSize: sp(11), color: COLORS.textMuted, marginTop: 1 },
  adminAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  adminAddBtnText: { color: '#fff', fontSize: sp(11), fontWeight: '600' },
  resultsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultsText: { fontSize: sp(12), fontWeight: '500', color: COLORS.textSec },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortBtnText: { fontSize: sp(11), fontWeight: '600', color: COLORS.primary },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  emptyTitle: { fontSize: sp(15), fontWeight: '600', color: COLORS.text, marginTop: 10 },
  emptySub: {
    fontSize: sp(12),
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: sp(17),
  },
  resetBtn: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  resetBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: sp(12) },
  // Sort modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sortSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    paddingBottom: 30,
  },
  sortHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginBottom: 12,
  },
  sortSheetTitle: { fontSize: sp(15), fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  sortOptionActive: { backgroundColor: COLORS.primaryPale, borderRadius: RADIUS.sm, paddingHorizontal: 8 },
  sortOptionText: { fontSize: sp(13), fontWeight: '500', color: COLORS.textSec },
  sortOptionTextActive: { color: COLORS.primary, fontWeight: '600' },
  // Add modal
  addModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  addModalCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: 18,
  },
  addModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  addModalTitle: { fontSize: sp(16), fontWeight: '700', color: COLORS.text },
  addModalField: { marginBottom: 10 },
  addModalLabel: { fontSize: sp(11), fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  addModalInput: {
    backgroundColor: '#F9F9F9',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 40,
    fontSize: sp(12),
    color: COLORS.text,
  },
  addModalInputError: { borderColor: COLORS.danger, backgroundColor: '#FFF5F5' },
  addModalError: { fontSize: sp(10), color: COLORS.danger, marginTop: 2 },
  catChipSmall: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primaryBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipSmallActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catChipSmallText: { fontSize: sp(10), fontWeight: '500', color: COLORS.textSec },
  catChipSmallTextActive: { color: '#fff', fontWeight: '600' },
  addModalBtns: { flexDirection: 'row', gap: 10, marginTop: 14 },
  addModalCancelBtn: {
    flex: 1, paddingVertical: 10, borderRadius: RADIUS.md,
    backgroundColor: '#F3F4F6', alignItems: 'center',
  },
  addModalCancelText: { fontSize: sp(12), fontWeight: '500', color: COLORS.textSec },
  addModalConfirmBtn: {
    flex: 1, paddingVertical: 10, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary, alignItems: 'center',
  },
  addModalConfirmText: { fontSize: sp(12), fontWeight: '600', color: '#fff' },
});
