import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { CATEGORIES, CATEGORY_IMAGES } from '../data/groceryData';
import { COLORS, SHADOWS, RADIUS, sp, isTablet } from '../constants/theme';
import {
  ProductCard,
  BestSellerRow,
  SectionHeader,
  FeatureBadge,
} from '../components/SharedComponents';

const { width: SW } = Dimensions.get('window');
const HERO_H = isTablet ? 260 : 200;

export default function HomeScreen({ navigation }) {
  const { user, products, cartTotalCount, addToCart } = useApp();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 36) : 0);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [toastMsg, setToastMsg] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  const isCustomer = user?.role === 'customer';

  // Parallax calculations
  const heroTranslate = scrollY.interpolate({
    inputRange: [-80, 0, HERO_H],
    outputRange: [25, 0, -HERO_H * 0.25],
    extrapolate: 'clamp',
  });
  const heroScale = scrollY.interpolate({
    inputRange: [-80, 0],
    outputRange: [1.1, 1],
    extrapolate: 'clamp',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleAddToCart = useCallback((item) => {
    if (!isCustomer) {
      showToast('Cart access is for Customers only');
      return;
    }
    addToCart(item, 1);
  }, [addToCart, isCustomer]);

  const handleNavigateToProduct = useCallback((item) => {
    navigation.navigate('ProductDetail', { product: item });
  }, [navigation]);

  // Data slices
  const dailyDeals = products.filter((p) => p.isDailyDeal).slice(0, 6);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const recommended = products.slice(0, 6);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Toast notification ─────────────────────── */}
      {!!toastMsg && (
        <View style={[styles.toast, { top: topPadding + 60 }, SHADOWS.medium]}>
          <Ionicons name="information-circle" size={16} color="#fff" />
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

      {/* ── Top Announcement Bar (with status bar & notch clearance) ── */}
      <View style={[styles.topBar, { paddingTop: topPadding + 6 }]}>
        <View style={styles.topBarLeft}>
          <Ionicons name="checkmark-circle" size={13} color="#C8E6C9" />
          <Text style={styles.topBarText} numberOfLines={1}>
            Fresh Groceries! Free delivery on orders over ₹500
          </Text>
        </View>
        <View style={styles.topBarRight}>
          <Text style={styles.topBarLink}>Help</Text>
        </View>
      </View>

      {/* ── Main Navigation Bar ───────────────────── */}
      <View style={styles.navbar}>
        {/* Slidebar Drawer Button */}
        <TouchableOpacity
          style={styles.drawerToggleBtn}
          onPress={() => navigation.openDrawer()}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="menu" size={23} color={COLORS.text} />
        </TouchableOpacity>

        {/* Logo and Drawer Menu */}
        <TouchableOpacity
          style={styles.logoWrap}
          onPress={() => navigation.openDrawer()}
          activeOpacity={0.8}
        >
          <View style={styles.logoIcon}>
            <Ionicons name="basket" size={17} color="#fff" />
          </View>
          <View>
            <Text style={styles.logoText}>FreshCart</Text>
            <Text style={styles.logoSub}>Good Food. Happier You</Text>
          </View>
        </TouchableOpacity>

        {/* Search Bar Button */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('ProductsTab')}
          activeOpacity={0.85}
        >
          <Ionicons name="search-outline" size={15} color={COLORS.textMuted} />
          <Text style={styles.searchPlaceholder} numberOfLines={1}>
            Search fruits, vegetables, dairy...
          </Text>
        </TouchableOpacity>

        {/* Customer Cart / Admin Role Badge */}
        {isCustomer ? (
          <TouchableOpacity
            style={styles.cartBtn}
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
            <Ionicons name="shield-checkmark" size={12} color="#fff" />
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        )}
      </View>

      {/* ── Category Quick Bar ────────────────────── */}
      <View style={styles.catNavBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catNavScroll}>
          <TouchableOpacity
            style={styles.catNavItem}
            onPress={() => navigation.navigate('Categories')}
          >
            <Ionicons name="grid-outline" size={14} color={COLORS.primary} />
            <Text style={[styles.catNavLabel, { color: COLORS.primary, fontWeight: '600' }]}>All Categories</Text>
          </TouchableOpacity>

          {['Fruits & Vegetables', 'Dairy & Eggs', 'Bakery', 'Meat & Seafood', 'Pantry & Staples', 'Beverages'].map((cat) => {
            const shortName = cat === 'Fruits & Vegetables' ? 'Fruits & Veg'
              : cat === 'Dairy & Eggs' ? 'Dairy'
              : cat === 'Meat & Seafood' ? 'Meat'
              : cat === 'Pantry & Staples' ? 'Pantry'
              : cat;
            const isActive = activeCat === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catNavItem, isActive && styles.catNavItemActive]}
                onPress={() => {
                  setActiveCat(cat);
                  navigation.navigate('ProductsTab', { filterCategory: cat });
                }}
              >
                <Text style={[styles.catNavLabel, isActive && styles.catNavLabelActive]}>
                  {shortName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Scrollable Body Content ───────────────── */}
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ────────── HERO BANNER WITH SMOOTH PARALLAX ────────── */}
        <View style={[styles.heroCard, { height: HERO_H }]}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                transform: [
                  { translateY: heroTranslate },
                  { scale: heroScale },
                ],
              },
            ]}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&auto=format&fit=crop&q=80' }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          </Animated.View>

          {/* Clean gradient overlay */}
          <LinearGradient
            colors={['rgba(27,67,31,0.85)', 'rgba(27,67,31,0.5)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.9, y: 0 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroContent}>
            <View style={styles.freshBadge}>
              <Text style={styles.freshBadgeText}>FARM FRESH</Text>
            </View>
            <Text style={styles.heroHeading}>Freshness{'\n'}Delivered Daily</Text>
            <Text style={styles.heroSubText}>
              Farm-fresh groceries for a healthier, happier you.
            </Text>

            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => navigation.navigate('ProductsTab')}
              activeOpacity={0.85}
            >
              <Text style={styles.heroBtnText}>Shop Fresh Now</Text>
              <Ionicons name="arrow-forward" size={13} color="#fff" />
            </TouchableOpacity>

            <View style={styles.heroPills}>
              {['Fresh Quality', 'Great Prices', 'Fast Delivery'].map((t) => (
                <View key={t} style={styles.heroPill}>
                  <Text style={styles.heroPillText}>✓ {t}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ────────── SHOP BY CATEGORY ────────── */}
        <View style={styles.section}>
          <SectionHeader
            title="Shop by Category"
            onViewAll={() => navigation.navigate('Categories')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catScrollContent}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.catCard}
                onPress={() => navigation.navigate('ProductsTab', { filterCategory: cat.id })}
                activeOpacity={0.85}
              >
                <View style={styles.catImageBox}>
                  <Image
                    source={{ uri: CATEGORY_IMAGES[cat.id] || CATEGORY_IMAGES['All'] }}
                    style={styles.catImage}
                    resizeMode="cover"
                  />
                </View>
                <Text style={styles.catCardLabel} numberOfLines={2}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ────────── SEASON'S BEST BANNER ────────── */}
        <View style={styles.bannerRow}>
          <View style={[styles.promoBanner, { flex: 0.58, backgroundColor: '#2E7D32' }]}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80' }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(20,60,20,0.85)', 'rgba(20,60,20,0.5)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.promoBannerContent}>
              <Text style={styles.promoBannerLabel}>Season's Best</Text>
              <Text style={styles.promoBannerTitle}>Fresh & Healthy</Text>
              <Text style={styles.promoBannerSub}>Farm to your home</Text>
              <TouchableOpacity
                style={styles.promoBannerBtn}
                onPress={() => navigation.navigate('ProductsTab', { filterCategory: 'Fruits & Vegetables' })}
              >
                <Text style={styles.promoBannerBtnText}>Shop Seasonal →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.discountCircle}>
              <Text style={styles.discountCircleUp}>UP TO</Text>
              <Text style={styles.discountCircleNum}>30%</Text>
              <Text style={styles.discountCircleOff}>OFF</Text>
            </View>
          </View>

          <View style={[styles.promoBanner, { flex: 0.42, backgroundColor: '#FFF3E0' }]}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=300&auto=format&fit=crop&q=80' }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(255,243,224,0.92)', 'rgba(255,243,224,0.6)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.promoBannerContent}>
              <Text style={[styles.promoBannerLabel, { color: COLORS.accent }]}>
                Healthy Choices
              </Text>
              <Text style={[styles.promoBannerTitle, { color: COLORS.text, fontSize: sp(14) }]}>
                Happier{'\n'}Families
              </Text>
            </View>
          </View>
        </View>

        {/* ────────── DAILY DEALS ────────── */}
        {dailyDeals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.dealsHeaderRow}>
              <Text style={styles.sectionTitleText}>Daily Deals</Text>
              <View style={styles.timerBadge}>
                <Ionicons name="time-outline" size={12} color={COLORS.deal} />
                <Text style={styles.timerText}>Ends in 12h : 34m</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalCardScroll}
            >
              {dailyDeals.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  width={isTablet ? 180 : 145}
                  hideAdd={!isCustomer}
                  onPress={() => handleNavigateToProduct(item)}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ────────── FRUIT & VEG DUAL PROMO ────────── */}
        <View style={styles.bannerRow}>
          <TouchableOpacity
            style={[styles.promoBanner, { flex: 0.5, backgroundColor: '#FFF8E1' }]}
            onPress={() => navigation.navigate('ProductsTab', { filterCategory: 'Fruits & Vegetables' })}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&auto=format&fit=crop&q=80' }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(255,248,225,0.88)', 'rgba(255,248,225,0.45)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.promoBannerContent}>
              <Text style={[styles.promoBannerTitle, { color: COLORS.text, fontSize: sp(13) }]}>
                Fresh Fruits{'\n'}Special
              </Text>
              <View style={[styles.promoBannerBtn, { backgroundColor: COLORS.accent }]}>
                <Text style={styles.promoBannerBtnText}>Shop Fruits →</Text>
              </View>
            </View>
            <View style={styles.discountCircleSmall}>
              <Text style={styles.discountCircleNumSmall}>25%</Text>
              <Text style={styles.discountCircleOffSmall}>OFF</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.promoBanner, { flex: 0.5, backgroundColor: '#E8F5E9' }]}
            onPress={() => navigation.navigate('ProductsTab', { filterCategory: 'Fruits & Vegetables' })}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80' }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(232,245,233,0.9)', 'rgba(232,245,233,0.45)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.promoBannerContent}>
              <Text style={[styles.promoBannerTitle, { color: COLORS.text, fontSize: sp(13) }]}>
                Fresh Veggies{'\n'}Organic
              </Text>
              <View style={styles.promoBannerBtn}>
                <Text style={styles.promoBannerBtnText}>Shop Veggies →</Text>
              </View>
            </View>
            <View style={styles.discountCircleSmall}>
              <Text style={styles.discountCircleNumSmall}>30%</Text>
              <Text style={styles.discountCircleOffSmall}>OFF</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ────────── RECOMMENDED PRODUCTS ────────── */}
        <View style={styles.section}>
          <SectionHeader
            title="Recommended for You"
            onViewAll={() => navigation.navigate('ProductsTab')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalCardScroll}
          >
            {recommended.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                width={isTablet ? 180 : 145}
                hideAdd={!isCustomer}
                onPress={() => handleNavigateToProduct(item)}
                onAddToCart={handleAddToCart}
              />
            ))}
          </ScrollView>
        </View>

        {/* ────────── BEST SELLERS ────────── */}
        <View style={styles.section}>
          <SectionHeader title="Best Sellers" />
          <View style={{ paddingHorizontal: 16 }}>
            {bestSellers.map((item, idx) => (
              <BestSellerRow
                key={item.id}
                rank={idx + 1}
                item={item}
                hideAdd={!isCustomer}
                onPress={() => handleNavigateToProduct(item)}
                onAddToCart={handleAddToCart}
              />
            ))}
          </View>
        </View>

        {/* ────────── TRUST FEATURES STRIP ────────── */}
        <View style={[styles.featureStrip, SHADOWS.tiny]}>
          {[
            { icon: 'car-outline', label: 'Fast & Reliable\nDelivery' },
            { icon: 'ribbon-outline', label: '100% Fresh\nGuarantee' },
            { icon: 'lock-closed-outline', label: 'Secure\nPayments' },
            { icon: 'refresh-outline', label: 'Easy\nReturns' },
          ].map((f) => (
            <FeatureBadge key={f.label} icon={f.icon} label={f.label} />
          ))}
        </View>

        {/* ────────── FOOTER ────────── */}
        <View style={styles.footer}>
          <View style={styles.footerBrand}>
            <View style={styles.footerLogo}>
              <Ionicons name="basket" size={13} color="#fff" />
            </View>
            <View>
              <Text style={styles.footerBrandTitle}>FreshCart Grocery</Text>
              <Text style={styles.footerBrandSub}>Good Food. Happier You</Text>
            </View>
          </View>
          <Text style={styles.footerDesc}>
            Daily fresh groceries delivered directly from certified local farms.
          </Text>

          <View style={styles.footerLinks}>
            {['Privacy Policy', 'Terms of Service', 'Support'].map((l) => (
              <Text key={l} style={styles.footerLink}>{l}</Text>
            ))}
          </View>
          <Text style={styles.footerCopy}>© 2026 FreshCart. All rights reserved.</Text>
        </View>
      </Animated.ScrollView>
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
  toastText: {
    color: '#fff',
    fontSize: sp(12),
    fontWeight: '600',
  },
  // Top Announcement Bar
  topBar: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  topBarText: {
    color: '#E8F5E9',
    fontSize: sp(11),
    fontWeight: '500',
    flex: 1,
  },
  topBarRight: {
    paddingLeft: 8,
  },
  topBarLink: {
    color: '#C8E6C9',
    fontSize: sp(11),
    fontWeight: '600',
  },
  // Navbar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  drawerToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryBg,
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: sp(14),
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.3,
  },
  logoSub: {
    fontSize: sp(9),
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    height: 34,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchPlaceholder: {
    fontSize: sp(11),
    color: COLORS.textMuted,
    flex: 1,
  },
  cartBtn: {
    width: 34,
    height: 34,
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
  cartBadgeText: {
    color: '#fff',
    fontSize: sp(9),
    fontWeight: '700',
  },
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
  // Category Quick Bar
  catNavBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  catNavScroll: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  catNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  catNavItemActive: {
    backgroundColor: COLORS.primaryPale,
  },
  catNavLabel: {
    fontSize: sp(11),
    fontWeight: '500',
    color: COLORS.textSec,
  },
  catNavLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  // Scrollable container
  scrollContent: {
    paddingBottom: 40,
  },
  // Hero Card
  heroCard: {
    margin: 12,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  heroContent: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  freshBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    marginBottom: 6,
  },
  freshBadgeText: {
    color: '#fff',
    fontSize: sp(10),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroHeading: {
    fontSize: sp(22),
    fontWeight: '700',
    color: '#fff',
    lineHeight: sp(28),
  },
  heroSubText: {
    fontSize: sp(11),
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    marginBottom: 10,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  heroBtnText: {
    color: '#fff',
    fontSize: sp(11),
    fontWeight: '600',
  },
  heroPills: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  heroPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  heroPillText: {
    color: '#fff',
    fontSize: sp(9),
    fontWeight: '500',
  },
  // Sections
  section: {
    marginTop: 14,
  },
  sectionTitleText: {
    fontSize: sp(15),
    fontWeight: '700',
    color: COLORS.text,
  },
  dealsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.dealLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  timerText: {
    fontSize: sp(11),
    fontWeight: '600',
    color: COLORS.deal,
  },
  horizontalCardScroll: {
    paddingHorizontal: 14,
    gap: 10,
    paddingBottom: 4,
  },
  // Category circles
  catScrollContent: {
    paddingHorizontal: 14,
    gap: 10,
    paddingBottom: 4,
  },
  catCard: {
    alignItems: 'center',
    width: 76,
  },
  catImageBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryBg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 4,
  },
  catImage: {
    width: '100%',
    height: '100%',
  },
  catCardLabel: {
    fontSize: sp(10),
    fontWeight: '500',
    color: COLORS.textSec,
    textAlign: 'center',
    lineHeight: sp(13),
  },
  // Banners
  bannerRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 14,
    marginTop: 14,
    height: 120,
  },
  promoBanner: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    padding: 12,
  },
  promoBannerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  promoBannerLabel: {
    color: '#C8E6C9',
    fontSize: sp(9),
    fontWeight: '600',
    marginBottom: 2,
  },
  promoBannerTitle: {
    color: '#fff',
    fontSize: sp(15),
    fontWeight: '700',
    lineHeight: sp(19),
    marginBottom: 4,
  },
  promoBannerSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: sp(10),
    marginBottom: 6,
  },
  promoBannerBtn: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  promoBannerBtnText: {
    color: '#fff',
    fontSize: sp(9),
    fontWeight: '600',
  },
  discountCircle: {
    position: 'absolute',
    right: 8,
    bottom: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  discountCircleUp: { fontSize: sp(7), fontWeight: '600', color: COLORS.text },
  discountCircleNum: { fontSize: sp(13), fontWeight: '700', color: COLORS.deal, lineHeight: sp(15) },
  discountCircleOff: { fontSize: sp(7), fontWeight: '600', color: COLORS.text },
  discountCircleSmall: {
    position: 'absolute',
    right: 6,
    top: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountCircleNumSmall: { fontSize: sp(11), fontWeight: '700', color: COLORS.deal },
  discountCircleOffSmall: { fontSize: sp(6), fontWeight: '600', color: COLORS.text },
  // Features
  featureStrip: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 14,
    marginTop: 18,
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
  },
  // Footer
  footer: {
    backgroundColor: '#1E3A24',
    marginTop: 20,
    padding: 16,
    borderRadius: RADIUS.lg,
    marginHorizontal: 14,
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  footerLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBrandTitle: {
    fontSize: sp(13),
    fontWeight: '700',
    color: '#fff',
  },
  footerBrandSub: {
    fontSize: sp(9),
    color: '#A5D6A7',
  },
  footerDesc: {
    fontSize: sp(11),
    color: 'rgba(255,255,255,0.7)',
    lineHeight: sp(16),
    marginBottom: 10,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  footerLink: {
    fontSize: sp(10),
    color: '#A5D6A7',
    fontWeight: '500',
  },
  footerCopy: {
    fontSize: sp(9),
    color: 'rgba(255,255,255,0.4)',
  },
});
