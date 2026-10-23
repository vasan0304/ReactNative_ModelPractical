import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, SHADOWS, RADIUS, sp } from '../constants/theme';

export default function EditProfileScreen({ navigation }) {
  const { user, updateProfile } = useApp();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 36) : 0);
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim() || name.trim().length < 2)
      errs.name = 'Full name must be at least 2 characters';

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRx.test(email.trim()))
      errs.email = 'Please enter a valid email address';

    const phoneClean = (phone || '').replace(/\D/g, '');
    if (!phoneClean || phoneClean.length !== 10)
      errs.phone = 'Mobile number must be exactly 10 digits';

    if (!address.trim() || address.trim().length < 5)
      errs.address = 'Please enter a full delivery address';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
    Alert.alert('Saved!', 'Your profile was updated successfully.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const fields = [
    { label: 'Full Name', icon: 'person-outline', value: name, onChange: setName, placeholder: 'Your full name', key: 'name' },
    { label: 'Email Address', icon: 'mail-outline', value: email, onChange: setEmail, placeholder: 'name@rvscas.ac.in', key: 'email', keyboardType: 'email-address', autoCapitalize: 'none' },
    { label: 'Mobile Number', icon: 'call-outline', value: phone, onChange: setPhone, placeholder: '10-digit mobile number', key: 'phone', keyboardType: 'phone-pad' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 6 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('ProfileTab'))}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Icon banner */}
          <LinearGradient
            colors={[COLORS.primaryPale, '#fff']}
            style={styles.iconBanner}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="person" size={28} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.bannerTitle}>Update Your Details</Text>
              <Text style={styles.bannerSub}>Keep your delivery info up-to-date</Text>
            </View>
          </LinearGradient>

          {/* Form card */}
          <View style={[styles.formCard, SHADOWS.medium]}>
            {fields.map((field) => (
              <View key={field.key} style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <View style={[styles.inputWrap, errors[field.key] && styles.inputWrapError]}>
                  <Ionicons name={field.icon} size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.textInput}
                    placeholder={field.placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    value={field.value}
                    onChangeText={field.onChange}
                    keyboardType={field.keyboardType || 'default'}
                    autoCapitalize={field.autoCapitalize || 'sentences'}
                    maxLength={field.key === 'phone' ? 10 : undefined}
                  />
                </View>
                {errors[field.key] && (
                  <Text style={styles.errorMsg}>{errors[field.key]}</Text>
                )}
              </View>
            ))}

            {/* Address (multiline) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Delivery Address</Text>
              <View style={[styles.textAreaWrap, errors.address && styles.inputWrapError]}>
                <Ionicons name="location-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 8, marginTop: 12 }} />
                <TextInput
                  style={styles.textArea}
                  placeholder="Street, Block, City, PIN"
                  placeholderTextColor={COLORS.textMuted}
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
              {errors.address && <Text style={styles.errorMsg}>{errors.address}</Text>}
            </View>

            {/* Save button */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.88}>
              <LinearGradient
                colors={[COLORS.primaryLight, COLORS.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveGradient}
              >
                <Ionicons name="save-outline" size={18} color="#fff" />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelBtnText}>Discard & Go Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: sp(17), fontWeight: '800', color: COLORS.text, paddingLeft: 10 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  iconBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: RADIUS.xl,
    padding: 16,
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  bannerTitle: { fontSize: sp(15), fontWeight: '800', color: COLORS.text },
  bannerSub: { fontSize: sp(12), color: COLORS.textSec, marginTop: 2 },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xxl,
    padding: 20,
  },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: sp(13), fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: RADIUS.md,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 46,
  },
  textAreaWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9F9F9',
    borderRadius: RADIUS.md,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingBottom: 10,
    minHeight: 90,
  },
  inputWrapError: { borderColor: COLORS.danger, backgroundColor: '#FFF5F5' },
  textInput: { flex: 1, fontSize: sp(14), color: COLORS.text },
  textArea: { flex: 1, fontSize: sp(14), color: COLORS.text, paddingTop: 12 },
  errorMsg: { fontSize: sp(11), color: COLORS.danger, marginTop: 4 },
  saveBtn: { borderRadius: RADIUS.lg, overflow: 'hidden', marginTop: 8 },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  saveBtnText: { color: '#fff', fontSize: sp(15), fontWeight: '800' },
  cancelBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 6 },
  cancelBtnText: { fontSize: sp(13), fontWeight: '600', color: COLORS.textMuted },
});
