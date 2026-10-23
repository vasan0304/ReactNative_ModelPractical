import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, RADIUS, sp } from '../constants/theme';

export default function CustomDrawerContent({ navigation, state }) {
  const { user, cartTotalCount, favorites, logout } = useApp();
  const currentRoute = state?.routes[state?.index]?.name || '';
  const isCustomer = user?.role === 'customer';

  const navItems = [
    { label: 'Home', route: 'HomeTabs', screen: 'HomeTab', icon: 'home-outline' },
    { label: 'All Categories', route: 'Categories', icon: 'grid-outline' },
    ...(isCustomer ? [
      {
        label: 'My Wishlist',
        route: 'HomeTabs',
        screen: 'FavoritesTab',
        icon: 'heart-outline',
        badge: favorites.length,
      },
      {
        label: 'Shopping Cart',
        route: 'HomeTabs',
        screen: 'CartTab',
        icon: 'cart-outline',
        badge: cartTotalCount,
      },
    ] : []),
    { label: 'My Profile', route: 'HomeTabs', screen: 'ProfileTab', icon: 'person-outline' },
  ];

  const handleNavigate = (item) => {
    navigation.closeDrawer();
    if (item.screen) {
      navigation.navigate(item.route, { screen: item.screen });
    } else {
      navigation.navigate(item.route);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Brand header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={styles.drawerHeader}
        >
          {/* Brand */}
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Ionicons name="basket" size={18} color="#fff" />
            </View>
            <View>
              <Text style={styles.brandTitle}>FreshCart</Text>
              <Text style={styles.brandSub}>Good Food. Happier You.</Text>
            </View>
          </View>

          {/* User info */}
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarChar}>
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName} numberOfLines={1}>
                {user.name}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user.email}
              </Text>
              <View style={styles.roleTag}>
                <Ionicons
                  name={user.role === 'admin' ? 'shield-checkmark' : 'person'}
                  size={10}
                  color="#fff"
                />
                <Text style={styles.roleTagText}>
                  {user.role === 'admin' ? 'Store Administrator' : 'Customer Account'}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Nav links */}
        <View style={styles.navSection}>
          <Text style={styles.navSectionLabel}>NAVIGATION MENU</Text>
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => handleNavigate(item)}
              >
                <Ionicons
                  name={isActive ? item.icon.replace('-outline', '') : item.icon}
                  size={18}
                  color={isActive ? COLORS.primary : COLORS.textSec}
                />
                <Text style={[styles.navItemLabel, isActive && styles.navItemLabelActive]}>
                  {item.label}
                </Text>
                {item.badge > 0 && (
                  <View style={[styles.navBadge, isActive && { backgroundColor: COLORS.primary }]}>
                    <Text style={styles.navBadgeText}>{item.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={16} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: { fontSize: sp(15), fontWeight: '700', color: '#fff' },
  brandSub: { fontSize: sp(9), color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: RADIUS.md,
    padding: 10,
    gap: 10,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarChar: { fontSize: sp(18), fontWeight: '700', color: '#fff' },
  userName: { fontSize: sp(13), fontWeight: '700', color: '#fff' },
  userEmail: { fontSize: sp(10), color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  roleTagText: { fontSize: sp(9), fontWeight: '600', color: '#fff' },
  navSection: { padding: 14 },
  navSectionLabel: {
    fontSize: sp(10),
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    marginBottom: 3,
    gap: 10,
  },
  navItemActive: { backgroundColor: COLORS.primaryBg },
  navItemLabel: { flex: 1, fontSize: sp(13), fontWeight: '500', color: COLORS.text },
  navItemLabelActive: { color: COLORS.primary, fontWeight: '700' },
  navBadge: {
    backgroundColor: COLORS.deal,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  navBadgeText: { color: '#fff', fontSize: sp(9), fontWeight: '700' },
  roleSwitcher: {
    marginHorizontal: 14,
    backgroundColor: '#EEF2FF',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 10,
  },
  roleSwitcherLabel: { fontSize: sp(11), fontWeight: '600', color: '#3730A3', marginBottom: 8 },
  roleSwitcherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#4F46E5',
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  roleSwitcherBtnText: { color: '#fff', fontSize: sp(12), fontWeight: '600' },
  examNote: {
    marginHorizontal: 14,
    backgroundColor: '#FFFBEB',
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  examNoteHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  examNoteTitle: { fontSize: sp(11), fontWeight: '700', color: '#B45309' },
  examNoteText: { fontSize: sp(10), color: '#92400E', lineHeight: sp(15) },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 14,
    marginBottom: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: { color: COLORS.danger, fontSize: sp(13), fontWeight: '600' },
});
