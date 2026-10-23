import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { CATEGORIES, CATEGORY_IMAGES } from '../data/groceryData';
import { COLORS, SHADOWS, RADIUS, sp, isTablet } from '../constants/theme';

const { width: SW } = Dimensions.get('window');
const CARD_W = isTablet ? (SW - 64) / 3 : (SW - 48) / 2;

const CAT_COLORS = {
  all: COLORS.primary,
  'Fruits & Vegetables': '#22C55E',
  'Dairy & Eggs': '#3B82F6',
  'Bakery': '#EAB308',
  'Meat & Seafood': '#EF4444',
  'Pantry & Staples': '#F97316',
  'Snacks & Chocolates': '#8B5CF6',
  'Beverages': '#06B6D4',
  'Household Essentials': '#6B7280',
};

export default function CategoriesScreen({ navigation }) {
  const { products } = useApp();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 36) : 0);

  const getCount = (catId) =>
    catId === 'all' ? products.length : products.filter((p) => p.category === catId).length;

  const handleSelect = (catId) => {
    navigation.navigate('HomeTabs', {
      screen: 'ProductsTab',
      params: { filterCategory: catId },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={[styles.header, { paddingTop: topPadding + 6 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeTabs', { screen: 'HomeTab' }))}
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
        <Text style={styles.headerTitle}>Shop by Category</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        numColumns={isTablet ? 3 : 2}
        key={isTablet ? 3 : 2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const color = CAT_COLORS[item.id] || COLORS.primary;
          const count = getCount(item.id);
          const imageUri = CATEGORY_IMAGES[item.id] || CATEGORY_IMAGES['All'];

          return (
            <TouchableOpacity
              style={[styles.catCard, SHADOWS.small, { width: CARD_W }]}
              onPress={() => handleSelect(item.id)}
              activeOpacity={0.88}
            >
              <View style={styles.catImageBox}>
                <Image source={{ uri: imageUri }} style={styles.catImage} resizeMode="cover" />
                <LinearGradient
                  colors={['transparent', `${color}CC`]}
                  start={{ x: 0, y: 0.4 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />

                {/* Icon badge */}
                <View style={[styles.iconBadge, { backgroundColor: color }]}>
                  <Ionicons name={item.icon} size={16} color="#fff" />
                </View>
              </View>

              <View style={styles.catInfo}>
                <Text style={styles.catLabel} numberOfLines={2}>{item.label}</Text>
                <Text style={styles.catCount}>{count} products</Text>
              </View>

              <View style={[styles.catArrow, { backgroundColor: `${color}18` }]}>
                <Ionicons name="arrow-forward" size={14} color={color} />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  columnWrapper: { gap: 8, marginBottom: 8 },
  catCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  catImageBox: {
    width: '100%',
    height: isTablet ? 110 : 90,
    position: 'relative',
  },
  catImage: { width: '100%', height: '100%' },
  iconBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catInfo: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 2,
  },
  catLabel: { fontSize: sp(12), fontWeight: '600', color: COLORS.text, lineHeight: sp(16) },
  catCount: { fontSize: sp(10), color: COLORS.textMuted, marginTop: 1 },
  catArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 8,
    paddingTop: 2,
  },
});
