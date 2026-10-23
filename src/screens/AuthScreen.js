import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOWS, RADIUS, sp } from '../constants/theme';

const FIXED_CREDENTIALS = {
  customer: {
    email: 'customer@freshcart.com',
    password: 'customer123',
    role: 'customer',
    name: 'Keerthivasan',
  },
  admin: {
    email: 'admin@freshcart.com',
    password: 'admin123',
    role: 'admin',
    name: 'Store Administrator',
  },
};

export default function AuthScreen() {
  const { login } = useApp();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 36) : 0);

  const [isSignIn, setIsSignIn] = useState(true);
  const [role, setRole] = useState('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};

    if (isSignIn) {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      if (!cleanEmail) {
        errs.email = 'Username / Email is required';
      }
      if (!cleanPass) {
        errs.password = 'Password is required';
      }

      if (cleanEmail && cleanPass) {
        const isCustomerMatch =
          (cleanEmail === 'customer@freshcart.com' ||
            cleanEmail === 'customer' ||
            cleanEmail === 'keerthi.customer@rvscas.ac.in') &&
          cleanPass === 'customer123';

        const isAdminMatch =
          (cleanEmail === 'admin@freshcart.com' ||
            cleanEmail === 'admin' ||
            cleanEmail === 'admin@groceryshop.com') &&
          cleanPass === 'admin123';

        if (!isCustomerMatch && !isAdminMatch) {
          errs.general =
            'Invalid username or password!\nPlease use fixed credentials:\n• Customer: customer@freshcart.com / customer123\n• Admin: admin@freshcart.com / admin123';
        }
      }
    } else {
      if (!name.trim() || name.trim().length < 2)
        errs.name = 'Full name is required (min 2 chars)';

      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRx.test(email.trim()))
        errs.email = 'Please enter a valid email address';

      if (!password || password.length < 6)
        errs.password = 'Password must be at least 6 characters';

      if (role === 'customer') {
        const phoneClean = (phone || '').replace(/\D/g, '');
        if (phoneClean.length !== 10)
          errs.phone = 'Enter a valid 10-digit mobile number';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (isSignIn) {
      const cleanEmail = email.trim().toLowerCase();
      const isAdmin =
        cleanEmail === 'admin@freshcart.com' ||
        cleanEmail === 'admin' ||
        cleanEmail === 'admin@groceryshop.com';

      if (isAdmin) {
        login(
          FIXED_CREDENTIALS.admin.email,
          FIXED_CREDENTIALS.admin.password,
          'admin',
          FIXED_CREDENTIALS.admin.name
        );
      } else {
        login(
          FIXED_CREDENTIALS.customer.email,
          FIXED_CREDENTIALS.customer.password,
          'customer',
          FIXED_CREDENTIALS.customer.name
        );
      }
    } else {
      login(email.trim(), password, role, name.trim());
    }
  };

  const handleFillCredentials = (targetRole) => {
    const cred = FIXED_CREDENTIALS[targetRole];
    setEmail(cred.email);
    setPassword(cred.password);
    setRole(cred.role);
    setErrors({});
  };

  const InputField = ({
    label,
    icon,
    value,
    onChange,
    placeholder,
    keyboardType,
    secureTextEntry,
    rightEl,
    errorKey,
  }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrap, errors[errorKey] && styles.inputWrapError]}>
        <Ionicons name={icon} size={17} color={COLORS.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={(txt) => {
            onChange(txt);
            if (errors[errorKey] || errors.general) {
              setErrors((prev) => ({ ...prev, [errorKey]: undefined, general: undefined }));
            }
          }}
          keyboardType={keyboardType || 'default'}
          secureTextEntry={secureTextEntry}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        />
        {rightEl}
      </View>
      {errors[errorKey] && <Text style={styles.errorMsg}>{errors[errorKey]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Hero gradient header */}
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight, '#4CAF50']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroGradient, { paddingTop: topPadding + 20 }]}
          >
            <View style={styles.heroBrand}>
              <View style={styles.heroBrandIcon}>
                <Ionicons name="basket" size={24} color="#fff" />
              </View>
              <View>
                <Text style={styles.heroBrandTitle}>FreshCart</Text>
                <Text style={styles.heroBrandSub}>Daily Fresh Grocery Shop</Text>
              </View>
            </View>

            <Text style={styles.heroWelcome}>
              {isSignIn ? 'Welcome Back!' : 'Create Customer Account'}
            </Text>
            <Text style={styles.heroDesc}>
              {isSignIn
                ? 'Sign in with fixed credentials to continue'
                : 'Sign up to shop farm-fresh groceries online'}
            </Text>
          </LinearGradient>

          {/* Form card */}
          <View style={[styles.formCard, SHADOWS.large]}>
            {/* Fixed Credentials Helper Box */}
            {isSignIn && (
              <View style={styles.fixedCredBox}>
                <View style={styles.fixedCredHeader}>
                  <Ionicons name="key-outline" size={15} color={COLORS.primary} />
                  <Text style={styles.fixedCredTitle}>Fixed Login Credentials (No DB)</Text>
                </View>

                {/* Customer Pill */}
                <TouchableOpacity
                  style={[styles.fixedCredRow, role === 'customer' && styles.fixedCredRowSelected]}
                  onPress={() => handleFillCredentials('customer')}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fixedCredRole}>👤 Customer Account:</Text>
                    <Text style={styles.fixedCredDetails}>
                      User: <Text style={styles.codeText}>customer@freshcart.com</Text> | Pass: <Text style={styles.codeText}>customer123</Text>
                    </Text>
                  </View>
                  <View style={styles.quickFillBtn}>
                    <Text style={styles.quickFillBtnText}>Auto Fill</Text>
                  </View>
                </TouchableOpacity>

                {/* Admin Pill */}
                <TouchableOpacity
                  style={[styles.fixedCredRow, role === 'admin' && styles.fixedCredRowSelected]}
                  onPress={() => handleFillCredentials('admin')}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fixedCredRoleAdmin}>🛡️ Administrator Account:</Text>
                    <Text style={styles.fixedCredDetails}>
                      User: <Text style={styles.codeText}>admin@freshcart.com</Text> | Pass: <Text style={styles.codeText}>admin123</Text>
                    </Text>
                  </View>
                  <View style={[styles.quickFillBtn, { backgroundColor: '#4F46E5' }]}>
                    <Text style={styles.quickFillBtnText}>Auto Fill</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* General Error Banner */}
            {!!errors.general && (
              <View style={styles.generalErrorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            {/* Sign in / Sign up toggle */}
            <View style={styles.toggle}>
              {['Sign In', 'Sign Up'].map((label, i) => {
                const active = i === 0 ? isSignIn : !isSignIn;
                return (
                  <TouchableOpacity
                    key={label}
                    style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                    onPress={() => {
                      setIsSignIn(i === 0);
                      setErrors({});
                    }}
                  >
                    <Text style={[styles.toggleBtnText, active && styles.toggleBtnTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Role selector */}
            <View style={styles.roleRow}>
              {[
                { key: 'customer', label: 'Customer', icon: 'person-outline' },
                { key: 'admin', label: 'Admin', icon: 'shield-outline' },
              ].map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.roleChip, role === r.key && styles.roleChipActive]}
                  onPress={() => {
                    setRole(r.key);
                    handleFillCredentials(r.key);
                  }}
                >
                  <Ionicons name={r.icon} size={15} color={role === r.key ? COLORS.primary : COLORS.textMuted} />
                  <Text style={[styles.roleChipText, role === r.key && styles.roleChipTextActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Form fields */}
            {!isSignIn && (
              <InputField
                label="Full Name"
                icon="person-outline"
                value={name}
                onChange={setName}
                placeholder="e.g. Keerthivasan"
                errorKey="name"
              />
            )}

            <InputField
              label="Username / Email Address"
              icon="mail-outline"
              value={email}
              onChange={setEmail}
              placeholder={role === 'admin' ? 'admin@freshcart.com' : 'customer@freshcart.com'}
              keyboardType="email-address"
              errorKey="email"
            />

            {!isSignIn && role === 'customer' && (
              <InputField
                label="Mobile Number"
                icon="call-outline"
                value={phone}
                onChange={setPhone}
                placeholder="10-digit number"
                keyboardType="phone-pad"
                errorKey="phone"
              />
            )}

            <InputField
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChange={setPassword}
              placeholder="e.g. customer123 or admin123"
              secureTextEntry={!showPass}
              errorKey="password"
              rightEl={
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              }
            />

            {/* Submit */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.88}>
              <Text style={styles.submitBtnText}>
                {isSignIn ? `Sign In as ${role === 'admin' ? 'Admin' : 'Customer'}` : 'Create Customer Account'}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>

          {/* Feature trust pills below card */}
          <View style={styles.featureRow}>
            {['100% Fresh Guarantee', 'Fast 30-min Delivery', 'Secure UPI & Cash'].map((f) => (
              <View key={f} style={styles.featurePill}>
                <Text style={styles.featurePillText}>✓ {f}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 40 },
  heroGradient: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 44,
  },
  heroBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroBrandIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  heroBrandTitle: {
    fontSize: sp(20),
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  heroBrandSub: {
    fontSize: sp(11),
    color: '#E8F5E9',
    fontWeight: '500',
  },
  heroWelcome: {
    fontSize: sp(22),
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  heroDesc: {
    fontSize: sp(13),
    color: '#E8F5E9',
  },
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: RADIUS.xl,
    padding: 18,
    gap: 12,
  },
  fixedCredBox: {
    backgroundColor: '#F0F9F0',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: RADIUS.md,
    padding: 10,
    gap: 8,
  },
  fixedCredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fixedCredTitle: {
    fontSize: sp(12),
    fontWeight: '700',
    color: COLORS.primary,
  },
  fixedCredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#E0E8E0',
    gap: 8,
  },
  fixedCredRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F1F8F1',
  },
  fixedCredRole: {
    fontSize: sp(11),
    fontWeight: '700',
    color: COLORS.primary,
  },
  fixedCredRoleAdmin: {
    fontSize: sp(11),
    fontWeight: '700',
    color: '#4F46E5',
  },
  fixedCredDetails: {
    fontSize: sp(10),
    color: COLORS.text,
    marginTop: 2,
  },
  codeText: {
    fontWeight: '700',
    color: '#1B2E1F',
  },
  quickFillBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  quickFillBtnText: {
    color: '#ffffff',
    fontSize: sp(10),
    fontWeight: '700',
  },
  generalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    padding: 10,
    borderRadius: RADIUS.md,
  },
  generalErrorText: {
    color: COLORS.danger,
    fontSize: sp(11),
    fontWeight: '600',
    flex: 1,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.pill,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.pill,
  },
  toggleBtnActive: {
    backgroundColor: '#fff',
    ...SHADOWS.tiny,
  },
  toggleBtnText: {
    fontSize: sp(12),
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  toggleBtnTextActive: {
    color: COLORS.text,
    fontWeight: '700',
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  roleChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryBg,
  },
  roleChipText: {
    fontSize: sp(11),
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  roleChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: sp(11),
    fontWeight: '600',
    color: COLORS.text,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    height: 42,
  },
  inputWrapError: {
    borderColor: COLORS.danger,
  },
  textInput: {
    flex: 1,
    fontSize: sp(12),
    color: COLORS.text,
    paddingVertical: 0,
  },
  errorMsg: {
    fontSize: sp(10),
    color: COLORS.danger,
    marginTop: 2,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
    marginTop: 4,
    ...SHADOWS.small,
  },
  submitBtnText: {
    fontSize: sp(13),
    fontWeight: '700',
    color: '#fff',
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 16,
  },
  featurePill: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featurePillText: {
    fontSize: sp(10),
    color: COLORS.textSec,
    fontWeight: '500',
  },
});
