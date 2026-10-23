import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOWS, RADIUS, sp, isTablet } from '../constants/theme';
import { StarRow } from '../components/SharedComponents';

const { width: SW, height: SH } = Dimensions.get('window');
const IMAGE_H = isTablet ? 320 : 250;

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const { isFavorite, toggleFavorite, addToCart, user } = useApp();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 36) : 0);

  const isCustomer = user?.role === 'customer';
  const scrollY = useRef(new Animated.Value(0)).current;
  const [quantity, setQuantity] = useState(1);
  const favorited = isFavorite(product.id);

  // Parallax
  const imageTranslate = scrollY.interpolate({
    inputRange: [-80, 0, IMAGE_H],
    outputRange: [-30, 0, IMAGE_H * 0.25],
    extrapolate: 'clamp',
  });
  const imageScale = scrollY.interpolate({
    inputRange: [-80, 0],
    outputRange: [1.12, 1],
    extrapolate: 'clamp',
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [IMAGE_H * 0.4, IMAGE_H * 0.7],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const totalPrice = product.price * quantity;

  const handleAdd = () => {
    if (!isCustomer) {
      Alert.alert('Notice', 'Only Customers can add products to cart.');
      return;
    }
    addToCart(product, quantity);
    Alert.alert(
      'Added to Cart! 🛒',
      `${quantity}× ${product.name} added to your basket.`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('CartTab') },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      {/* ── Sticky back/fav header (fades in on scroll) ── */}
      <Animated.View style={[styles.stickyHeader, { paddingTop: topPadding + 6, opacity: headerOpacity }]}>
        <TouchableOpacity style={styles.stickyBackBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.stickyTitle} numberOfLines={1}>{product.name}</Text>
        {isCustomer && (
          <TouchableOpacity style={styles.stickyFavBtn} onPress={() => toggleFavorite(product.id)}>
            <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={20} color={favorited ? COLORS.danger : COLORS.text} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* ── Floating action buttons (always visible) ── */}
      <View style={[styles.floatingBtns, { top: topPadding + 6 }]}>
        <TouchableOpacity style={styles.floatingBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        {isCustomer && (
          <TouchableOpacity
            style={[styles.floatingBtn, favorited && styles.floatingBtnFav]}
            onPress={() => toggleFavorite(product.id)}
          >
            <Ionicons
              name={favorited ? 'heart' : 'heart-outline'}
              size={19}
              color={favorited ? '#fff' : COLORS.text}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Parallax Hero Image ── */}
      <View style={[styles.imageContainer, { height: IMAGE_H }]}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [{ translateY: imageTranslate }, { scale: imageScale }],
            },
          ]}
        >
          <Image
            source={{ uri: product.image }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        </Animated.View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
          style={StyleSheet.absoluteFill}
        />

        {/* Badges */}
        <View style={styles.imageBadges}>
          {product.organic && (
            <View style={styles.organicBadge}>
              <Ionicons name="leaf" size={11} color="#fff" />
              <Text style={styles.organicBadgeText}>100% Organic</Text>
            </View>
          )}
          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>-{product.discount}% OFF</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Scrollable Detail Content ── */}
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: IMAGE_H - 20 }]}
      >
        <View style={[styles.detailCard, SHADOWS.medium]}>
          {/* Category & Rating */}
          <View style={styles.catRatingRow}>
            <View style={styles.catPill}>
              <Text style={styles.catPillText}>{product.category}</Text>
            </View>
            <StarRow rating={product.rating} reviews={product.reviews} size={13} />
          </View>

          {/* Title */}
          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.unitLabel}>{product.unit}</Text>

          {/* Price & Quantity Stepper */}
          <View style={styles.priceStepperRow}>
            <View>
              <Text style={styles.currentPrice}>₹{product.price}</Text>
              {product.oldPrice > 0 && (
                <Text style={styles.oldPrice}>₹{product.oldPrice}</Text>
              )}
            </View>

            {isCustomer ? (
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepBtn, quantity <= 1 && styles.stepBtnDim]}
                  onPress={() => quantity > 1 && setQuantity((q) => q - 1)}
                  disabled={quantity <= 1}
                >
                  <Ionicons name="remove" size={16} color={quantity <= 1 ? COLORS.border : COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.stepValue}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setQuantity((q) => q + 1)}
                >
                  <Ionicons name="add" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.adminRoleNotice}>
                <Ionicons name="shield-outline" size={13} color="#4F46E5" />
                <Text style={styles.adminRoleNoticeText}>Admin Catalog View</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.descHeading}>Product Description</Text>
          <Text style={styles.descText}>{product.description}</Text>

          {/* Highlights */}
          <View style={styles.highlightGrid}>
            {[
              { icon: 'flame-outline', label: 'Calories', value: product.calories || 'Rich in nutrients', color: '#F97316' },
              { icon: 'shield-checkmark-outline', label: 'Freshness', value: 'Harvested Today', color: COLORS.primary },
              { icon: 'car-outline', label: 'Delivery', value: 'Within 30 mins', color: '#0288D1' },
              { icon: 'star-outline', label: 'Grade', value: 'Premium Farm Fresh', color: COLORS.star },
            ].map((h) => (
              <View key={h.label} style={[styles.highlightCard, SHADOWS.tiny]}>
                <View style={[styles.highlightIconBox, { backgroundColor: `${h.color}15` }]}>
                  <Ionicons name={h.icon} size={18} color={h.color} />
                </View>
                <Text style={styles.highlightLabel}>{h.label}</Text>
                <Text style={styles.highlightValue} numberOfLines={2}>{h.value}</Text>
              </View>
            ))}
          </View>

          {/* Quality highlights list */}
          <View style={styles.benefitsList}>
            {[
              '100% Farm Fresh & Pure',
              'Sourced directly from local farmers',
              'Quality checked and hygienically packed',
              'Express delivery to your doorstep',
            ].map((b) => (
              <Text key={b} style={styles.benefitItem}>✓ {b}</Text>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      {/* ── Bottom Action Bar ── */}
      {isCustomer ? (
        <View style={[styles.bottomBar, SHADOWS.large]}>
          <View style={styles.bottomPriceCol}>
            <Text style={styles.bottomPriceLabel}>Total Amount</Text>
            <Text style={styles.bottomPriceValue}>₹{totalPrice}</Text>
            <Text style={styles.bottomPriceQty}>for {quantity} unit{quantity !== 1 ? 's' : ''}</Text>
          </View>

          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={handleAdd}
            activeOpacity={0.88}
          >
            <Ionicons name="cart" size={17} color="#fff" />
            <Text style={styles.addToCartBtnText}>Add to Basket</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.bottomBarAdmin, SHADOWS.large]}>
          <Ionicons name="information-circle-outline" size={16} color="#4F46E5" />
          <Text style={styles.adminBarText}>
            Logged in as Admin. Cart & checkout are exclusive to Customer accounts.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // Sticky header
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingTop: Platform.OS === 'android' ? 24 : 44,
  },
  stickyBackBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  stickyTitle: { flex: 1, fontSize: sp(14), fontWeight: '600', color: COLORS.text, paddingHorizontal: 8 },
  stickyFavBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },

  // Floating buttons
  floatingBtns: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 8 : 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
    zIndex: 90,
  },
  floatingBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  floatingBtnFav: { backgroundColor: COLORS.danger },

  // Image
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  imageBadges: {
    position: 'absolute',
    bottom: 30,
    left: 14,
    flexDirection: 'row',
    gap: 8,
  },
  organicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  organicBadgeText: { color: '#fff', fontSize: sp(10), fontWeight: '600' },
  discountBadge: {
    backgroundColor: COLORS.deal,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  discountBadgeText: { color: '#fff', fontSize: sp(10), fontWeight: '700' },

  // Scroll
  scrollContent: { paddingBottom: 110 },

  // Detail card
  detailCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },
  catRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  catPill: {
    backgroundColor: COLORS.primaryPale,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  catPillText: { color: COLORS.primary, fontSize: sp(10), fontWeight: '600' },
  productTitle: {
    fontSize: sp(20),
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  unitLabel: { fontSize: sp(12), color: COLORS.textMuted, marginBottom: 12 },
  priceStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryBg,
    borderRadius: RADIUS.lg,
    padding: 12,
    marginBottom: 6,
  },
  currentPrice: { fontSize: sp(20), fontWeight: '700', color: COLORS.text },
  oldPrice: { fontSize: sp(11), color: COLORS.textMuted, textDecorationLine: 'line-through' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  stepBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F9',
  },
  stepBtnDim: { opacity: 0.4 },
  stepValue: {
    width: 32,
    textAlign: 'center',
    fontSize: sp(14),
    fontWeight: '700',
    color: COLORS.text,
  },
  adminRoleNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  adminRoleNoticeText: {
    fontSize: sp(11),
    color: '#3730A3',
    fontWeight: '600',
  },
  divider: { height: 1, backgroundColor: COLORS.divider, marginVertical: 14 },
  descHeading: { fontSize: sp(14), fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  descText: { fontSize: sp(12), color: COLORS.textSec, lineHeight: sp(18) },
  highlightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    marginBottom: 14,
  },
  highlightCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  highlightIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  highlightLabel: { fontSize: sp(10), fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase' },
  highlightValue: { fontSize: sp(11), fontWeight: '600', color: COLORS.text, marginTop: 2 },
  benefitsList: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: RADIUS.md,
    padding: 12,
    gap: 4,
  },
  benefitItem: { fontSize: sp(12), color: COLORS.primary, fontWeight: '500' },

  // Bottom CTA
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'android' ? 12 : 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  bottomPriceCol: { flex: 0.4 },
  bottomPriceLabel: { fontSize: sp(10), color: COLORS.textMuted, fontWeight: '500' },
  bottomPriceValue: { fontSize: sp(20), fontWeight: '700', color: COLORS.text },
  bottomPriceQty: { fontSize: sp(10), color: COLORS.textMuted },
  addToCartBtn: {
    flex: 0.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  addToCartBtnText: { color: '#fff', fontSize: sp(14), fontWeight: '700' },

  bottomBarAdmin: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EEF2FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    paddingBottom: Platform.OS === 'android' ? 14 : 24,
    borderTopWidth: 1,
    borderTopColor: '#C7D2FE',
  },
  adminBarText: {
    fontSize: sp(11),
    color: '#3730A3',
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
});
