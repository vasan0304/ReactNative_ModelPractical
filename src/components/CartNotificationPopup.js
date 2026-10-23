import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOWS, RADIUS } from '../constants/theme';

export default function CartNotificationPopup({ navigation }) {
  const { cartNotification, hideCartNotification } = useApp();
  const insets = useSafeAreaInsets();
  const topOffset = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 36) : 0) + (Platform.OS === 'web' ? 16 : 10);
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (cartNotification?.visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 9,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        dismiss();
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [cartNotification]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideCartNotification();
    });
  };

  const handleViewCart = () => {
    dismiss();
    if (navigation) {
      try {
        navigation.navigate('MainDrawer', {
          screen: 'HomeTabs',
          params: { screen: 'CartTab' },
        });
      } catch (e) {
        try {
          navigation.navigate('CartTab');
        } catch (err) {}
      }
    }
  };

  if (!cartNotification?.visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        SHADOWS.large,
        {
          top: topOffset,
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.card}>
        {/* Success Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={26} color="#ffffff" />
        </View>

        {/* Text */}
        <View style={styles.textWrap}>
          <Text style={styles.title}>Item added to cart! 🛒</Text>
          <Text style={styles.subtext} numberOfLines={1}>
            {cartNotification.subMessage || cartNotification.product?.name || 'Added successfully'}
          </Text>
        </View>

        {/* View Cart Action */}
        <TouchableOpacity style={styles.viewCartBtn} onPress={handleViewCart} activeOpacity={0.85}>
          <Text style={styles.viewCartText}>View Cart</Text>
          <Ionicons name="chevron-forward" size={13} color="#ffffff" />
        </TouchableOpacity>

        {/* Close Button */}
        <TouchableOpacity style={styles.closeBtn} onPress={dismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={16} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 16 : 48,
    left: 16,
    right: 16,
    zIndex: 99999,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1E4620',
    width: '100%',
    maxWidth: 500,
    borderRadius: RADIUS.lg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  subtext: {
    color: '#D5E8D4',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  viewCartBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewCartText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 2,
    marginLeft: 2,
  },
});

