import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOWS, RADIUS, sp } from '../constants/theme';

export default function ProfileScreen({ navigation }) {
  const { user, favorites, cartTotalCount, products, logout } = useApp();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 36) : 0);
  const isCustomer = user?.role === 'customer';

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of FreshCart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const stats = isCustomer ? [
    { icon: 'heart', color: COLORS.danger, label: 'Wishlist', val: favorites.length, tab: 'FavoritesTab' },
    { icon: 'cart', color: COLORS.primary, label: 'Cart Items', val: cartTotalCount, tab: 'CartTab' },
    { icon: 'storefront-outline', color: COLORS.accent, label: 'Catalog', val: products.length, tab: 'ProductsTab' },
  ] : [
    { icon: 'storefront-outline', color: COLORS.accent, label: 'Products', val: products.length, tab: 'ProductsTab' },
    { icon: 'grid-outline', color: COLORS.primary, label: 'Categories', val: 7, tab: 'Categories' },
  ];

  const menuItems = [
    { icon: 'create-outline', label: 'Edit Profile & Address', onPress: () => navigation.navigate('EditProfile'), color: COLORS.primary },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {}, color: '#0288D1' },
    { icon: 'log-out-outline', label: 'Sign Out', onPress: handleLogout, color: COLORS.danger },
  ];

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
        <Text style={styles.headerTitle}>User Profile</Text>
        <TouchableOpacity
          style={styles.editIconBtn}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="create-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile hero card */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarLetter}>
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </Text>
            <View style={styles.roleIconBadge}>
              <Ionicons
                name={user.role === 'admin' ? 'shield-checkmark' : 'person'}
                size={11}
                color="#fff"
              />
            </View>
          </View>

          <Text style={styles.heroName}>{user.name}</Text>
          <Text style={styles.heroEmail}>{user.email}</Text>

          <View style={styles.heroRoleTag}>
            <Text style={styles.heroRoleTagText}>
              {user.role === 'admin' ? '🛡️ STORE ADMINISTRATOR' : '👤 VERIFIED CUSTOMER'}
            </Text>
          </View>

          {/* Edit profile button */}
          <TouchableOpacity
            style={styles.editHeroBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="pencil" size={13} color={COLORS.primary} />
            <Text style={styles.editHeroBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <TouchableOpacity
              key={s.label}
              style={[styles.statCard, SHADOWS.small]}
              onPress={() => navigation.navigate(s.tab)}
            >
              <View style={[styles.statIconCircle, { backgroundColor: `${s.color}15` }]}>
                <Ionicons name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info card */}
        <View style={[styles.infoCard, SHADOWS.small]}>
          <Text style={styles.infoCardTitle}>Account & Delivery Details</Text>

          {[
            { icon: 'call-outline', label: 'Mobile Phone', val: user.phone || '9876543210' },
            { icon: 'location-outline', label: 'Default Address', val: user.address || 'RVS Campus, Sulur, Coimbatore' },
            { icon: 'card-outline', label: 'Payment Options', val: 'UPI / Cash on Delivery' },
          ].map((row) => (
            <View key={row.label} style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name={row.icon} size={16} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoVal}>{row.val}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Menu items */}
        <View style={[styles.menuCard, SHADOWS.small]}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, idx < menuItems.length - 1 && styles.menuItemBorder]}
              onPress={item.onPress}
            >
              <View style={[styles.menuIconBox, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon} size={16} color={item.color} />
              </View>
              <Text style={[styles.menuItemLabel, item.label === 'Sign Out' && { color: COLORS.danger }]}>
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={15} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  headerTitle: { flex: 1, fontSize: sp(16), fontWeight: '700', color: COLORS.text, paddingLeft: 8 },
  editIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { padding: 14, paddingBottom: 60, gap: 12 },
  heroCard: {
    borderRadius: RADIUS.xl,
    padding: 18,
    alignItems: 'center',
  },
  avatarWrap: { position: 'relative', marginBottom: 10 },
  avatarLetter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    lineHeight: 64,
    fontSize: sp(26),
    fontWeight: '700',
    color: '#fff',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  roleIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  heroName: { fontSize: sp(18), fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
  heroEmail: { fontSize: sp(11), color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  heroRoleTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroRoleTagText: { fontSize: sp(9), fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  editHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    marginTop: 12,
  },
  editHeroBtnText: { fontSize: sp(12), fontWeight: '600', color: COLORS.primary },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: 12,
    alignItems: 'center',
    gap: 3,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statVal: { fontSize: sp(16), fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: sp(10), color: COLORS.textMuted, fontWeight: '500', textAlign: 'center' },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: 14,
  },
  infoCardTitle: { fontSize: sp(13), fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  infoIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: { fontSize: sp(10), fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase' },
  infoVal: { fontSize: sp(12), fontWeight: '500', color: COLORS.text, marginTop: 1 },
  menuCard: { backgroundColor: '#fff', borderRadius: RADIUS.lg, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  menuIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: { flex: 1, fontSize: sp(13), fontWeight: '500', color: COLORS.text },
});
