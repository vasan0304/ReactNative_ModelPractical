import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS, sp } from '../constants/theme';

const { width: SW } = Dimensions.get('window');
const isTablet = SW >= 768;

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
export const ProductCard = ({ item, onPress, onAddToCart, width, compact, hideAdd }) => {
  const cardW = width || (isTablet ? (SW - 80) / 4 : (SW - 44) / 2);

  return (
    <TouchableOpacity
      style={[styles.productCard, { width: cardW }, SHADOWS.small]}
      onPress={onPress}
      activeOpacity={0.93}
    >
      {/* Discount badge */}
      {item.discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountBadgeText}>-{item.discount}%</Text>
        </View>
      )}

      {/* Product image */}
      <View style={styles.imageBox}>
        <Image
          source={{ uri: item.image }}
          style={[styles.productImage, compact && styles.productImageCompact]}
          resizeMode="cover"
        />
      </View>

      {/* Info */}
      <View style={styles.productInfo}>
        <View style={styles.productTitleWrap}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.productUnit} numberOfLines={1}>
            {item.unit}
          </Text>
        </View>

        {/* Price row */}
        <View style={styles.priceRow}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={styles.currentPrice}>
              ₹{item.price}
            </Text>
            {item.oldPrice > 0 && (
              <Text style={styles.oldPrice}>₹{item.oldPrice}</Text>
            )}
          </View>

          {!hideAdd && onAddToCart && (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => onAddToCart(item)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="cart-outline" size={13} color="#fff" />
              <Text style={styles.addBtnText}> Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── BEST SELLER ROW ITEM ─────────────────────────────────────────────────────
export const BestSellerRow = ({ rank, item, onPress, onAddToCart, hideAdd }) => (
  <TouchableOpacity
    style={[styles.bsRow, SHADOWS.tiny]}
    onPress={onPress}
    activeOpacity={0.93}
  >
    <Text style={styles.bsRank}>{rank}</Text>
    <Image source={{ uri: item.image }} style={styles.bsImage} resizeMode="cover" />
    <View style={{ flex: 1, marginLeft: 10 }}>
      <Text style={styles.bsName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.bsUnit}>{item.unit}</Text>
      <Text style={styles.bsPrice}>₹{item.price}</Text>
    </View>
    {!hideAdd && onAddToCart && (
      <TouchableOpacity style={styles.bsAddBtn} onPress={() => onAddToCart(item)}>
        <Ionicons name="cart-outline" size={16} color={COLORS.primary} />
      </TouchableOpacity>
    )}
  </TouchableOpacity>
);

// ─── CATEGORY CHIP ─────────────────────────────────────────────────────────
export const CategoryChip = ({ label, icon, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.chip, isActive && styles.chipActive]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    {icon && (
      <Ionicons
        name={icon}
        size={13}
        color={isActive ? '#fff' : COLORS.textSec}
        style={{ marginRight: 4 }}
      />
    )}
    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ─── SECTION HEADER ─────────────────────────────────────────────────────────
export const SectionHeader = ({ title, onViewAll }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onViewAll && (
      <TouchableOpacity onPress={onViewAll} style={styles.viewAllBtn}>
        <Text style={styles.viewAllText}>View All</Text>
        <Ionicons name="arrow-forward" size={13} color={COLORS.primary} />
      </TouchableOpacity>
    )}
  </View>
);

// ─── FEATURE BADGE ─────────────────────────────────────────────────────────
export const FeatureBadge = ({ icon, label }) => (
  <View style={styles.featureBadge}>
    <View style={styles.featureIconCircle}>
      <Ionicons name={icon} size={18} color={COLORS.primary} />
    </View>
    <Text style={styles.featureLabel}>{label}</Text>
  </View>
);

// ─── STAR ROW ─────────────────────────────────────────────────────────
export const StarRow = ({ rating, reviews, size = 12 }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Ionicons
        key={i}
        name={i <= Math.round(rating) ? 'star' : 'star-outline'}
        size={size}
        color={COLORS.star}
      />
    ))}
    {reviews !== undefined && (
      <Text style={[styles.reviewsText, { fontSize: size }]}>
        {' '}({reviews})
      </Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  // Product Card
  productCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: 10,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    backgroundColor: COLORS.deal,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: sp(10),
    fontWeight: '600',
  },
  imageBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F7F9F7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImageCompact: {
    height: 90,
  },
  productInfo: {
    padding: 10,
    minHeight: 96,
    justifyContent: 'space-between',
  },
  productTitleWrap: {
    height: 42,
    justifyContent: 'flex-start',
  },
  productName: {
    fontSize: sp(13),
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 18,
  },
  productUnit: {
    fontSize: sp(11),
    color: COLORS.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 34,
  },
  currentPrice: {
    fontSize: sp(14),
    fontWeight: '700',
    color: COLORS.text,
  },
  oldPrice: {
    fontSize: sp(10),
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  addBtnText: {
    color: '#fff',
    fontSize: sp(11),
    fontWeight: '600',
  },

  // Best Seller Row
  bsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: 8,
  },
  bsRank: {
    fontSize: sp(16),
    fontWeight: '700',
    color: COLORS.border,
    width: 24,
    textAlign: 'center',
  },
  bsImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F7F9F7',
  },
  bsName: {
    fontSize: sp(13),
    fontWeight: '600',
    color: COLORS.text,
  },
  bsUnit: {
    fontSize: sp(11),
    color: COLORS.textMuted,
  },
  bsPrice: {
    fontSize: sp(13),
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  bsAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  // Chip
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primaryBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: sp(12),
    fontWeight: '500',
    color: COLORS.textSec,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: sp(15),
    fontWeight: '700',
    color: COLORS.text,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: sp(12),
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Feature badge
  featureBadge: {
    alignItems: 'center',
    flex: 1,
  },
  featureIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  featureLabel: {
    fontSize: sp(10),
    fontWeight: '500',
    color: COLORS.textSec,
    textAlign: 'center',
  },

  // Stars
  reviewsText: {
    color: COLORS.textMuted,
  },
});
