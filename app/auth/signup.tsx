import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary: '#15157d',
  primaryContainer: '#2e3192',
  primaryFixed: '#e1e0ff',
  accentOrange: '#F7941D',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  success: '#27AE60',
  surface: '#fcf8ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f5f2fb',
  outlineVariant: '#c7c5d4',
  outline: '#777683',
  onSurface: '#1b1b21',
  onSurfaceVariant: '#464652',
  onPrimary: '#ffffff',
};

// ─── Demo data ────────────────────────────────────────────────────────────────
const EXISTING_PHONE = '01812345678';

type FieldState = 'idle' | 'valid' | 'error';

export default function SignUpScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Validation
  const nameValid = fullName.trim().length >= 2;
  const phoneValid = /^01[3-9]\d{8}$/.test(phone.trim());
  const passwordValid = password.length >= 6;
  const confirmValid = confirmPassword === password && confirmPassword.length > 0;

  const nameState: FieldState = !submitted ? 'idle' : nameValid ? 'valid' : 'error';
  const phoneState: FieldState = phone.length === 0 ? 'idle' : phoneValid ? 'valid' : 'error';

  const handleCreateAccount = () => {
    setSubmitted(true);
    if (!nameValid || !phoneValid || !passwordValid || !confirmValid) return;

    if (phone.trim() === EXISTING_PHONE) {
      router.push('/auth/account-exists');
      return;
    }

    router.push({
      pathname: '/auth/otp-verify',
      params: { phone: phone.trim(), mode: 'signup', name: fullName.trim() },
    });
  };

  const inputBorder = (state: FieldState) => {
    if (state === 'error') return C.error;
    if (state === 'valid') return C.success;
    return C.outlineVariant;
  };

  const inputBg = (state: FieldState) => {
    if (state === 'error') return '#ffdad620';
    return C.surfaceContainerLowest;
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={C.onSurface} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>ThiKorben</Text>
        <View style={styles.appBarSpacer} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Decorative top gradient blob */}
          <View style={styles.topBlob} />

          {/* Header */}
          <View style={styles.headerBlock}>
            <Text style={styles.heading}>Create your account</Text>
            <Text style={styles.subheading}>
              Join ThiKorben and connect with trusted local services.
            </Text>
          </View>

          {/* ── Full Name ── */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <View
              style={[
                styles.inputRow,
                { borderColor: inputBorder(nameState), backgroundColor: inputBg(nameState) },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={nameState === 'error' ? C.error : C.outline}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Karim Rahman"
                placeholderTextColor={C.outlineVariant}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
            {nameState === 'error' && (
              <View style={styles.fieldMsg}>
                <Ionicons name="alert-circle" size={13} color={C.error} />
                <Text style={[styles.fieldMsgText, { color: C.error }]}>
                  Please enter your full name.
                </Text>
              </View>
            )}
          </View>

          {/* ── Phone Number ── */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View
              style={[
                styles.inputRow,
                { borderColor: inputBorder(phoneState), backgroundColor: C.surfaceContainerLowest },
              ]}
            >
              <Ionicons name="call-outline" size={20} color={C.outline} style={styles.inputIcon} />
              <Text style={styles.phonePrefix}>+880</Text>
              <TextInput
                style={[styles.textInput, { paddingLeft: 8 }]}
                placeholder="1XXXXXXXXX"
                placeholderTextColor={C.outlineVariant}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={11}
              />
              {phoneState === 'valid' && (
                <MaterialIcons name="check-circle" size={20} color={C.success} style={styles.trailingIcon} />
              )}
            </View>
            {phoneState === 'valid' && (
              <View style={styles.fieldMsg}>
                <Ionicons name="checkmark" size={13} color={C.success} />
                <Text style={[styles.fieldMsgText, { color: C.success }]}>Valid phone number</Text>
              </View>
            )}
            {phoneState === 'error' && (
              <View style={styles.fieldMsg}>
                <Ionicons name="alert-circle" size={13} color={C.error} />
                <Text style={[styles.fieldMsgText, { color: C.error }]}>
                  Enter a valid Bangladeshi phone number.
                </Text>
              </View>
            )}
          </View>

          {/* ── Password ── */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={[styles.inputRow, { borderColor: C.outlineVariant }]}>
              <Ionicons name="lock-closed-outline" size={20} color={C.outline} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor={C.outlineVariant}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.trailingIcon}
                onPress={() => setShowPassword(v => !v)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={C.outline}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Confirm Password ── */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Confirm Password</Text>
            <View
              style={[
                styles.inputRow,
                {
                  borderColor:
                    confirmPassword.length > 0 && !confirmValid ? C.error : C.outlineVariant,
                },
              ]}
            >
              <Ionicons name="lock-open-outline" size={20} color={C.outline} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor={C.outlineVariant}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={styles.trailingIcon}
                onPress={() => setShowConfirmPassword(v => !v)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={C.outline}
                />
              </TouchableOpacity>
            </View>
            {submitted && !confirmValid && (
              <View style={styles.fieldMsg}>
                <Ionicons name="alert-circle" size={13} color={C.error} />
                <Text style={[styles.fieldMsgText, { color: C.error }]}>Passwords do not match.</Text>
              </View>
            )}
          </View>

          {/* ── Create Account CTA ── */}
          <TouchableOpacity
            style={styles.createBtn}
            onPress={handleCreateAccount}
            activeOpacity={0.88}
          >
            <Text style={styles.createBtnText}>Create Account</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>

          {/* Demo hint */}
          <TouchableOpacity
            style={styles.demoHint}
            onPress={() => {
              setFullName('Rahim Uddin');
              setPhone('01812345678');
              setPassword('12345678');
              setConfirmPassword('12345678');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle-outline" size={14} color={C.primaryContainer} />
            <Text style={styles.demoHintText}>Demo: tap to fill demo data</Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text style={styles.footerLink} onPress={() => router.push('/auth/login')}>
              Log In
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.surfaceContainerLowest },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 64,
    backgroundColor: C.surface,
    borderBottomWidth: 0,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.primary,
  },
  appBarSpacer: { width: 40 },
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    flexGrow: 1,
  },
  topBlob: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 128,
    backgroundColor: C.primaryFixed,
    opacity: 0.3,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: C.onSurface,
    lineHeight: 28,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  field: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.onSurface,
    marginBottom: 6,
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: C.surfaceContainerLowest,
    overflow: 'hidden',
  },
  inputIcon: { marginLeft: 14, marginRight: 4 },
  phonePrefix: {
    fontSize: 16,
    color: C.onSurfaceVariant,
    borderRightWidth: 1,
    borderRightColor: C.outlineVariant,
    paddingRight: 8,
    paddingVertical: 14,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: C.onSurface,
  },
  trailingIcon: { paddingHorizontal: 14 },
  fieldMsg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginLeft: 4,
  },
  fieldMsgText: { fontSize: 12, fontWeight: '500' },
  createBtn: {
    backgroundColor: C.accentOrange,
    borderRadius: 9999,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
    ...Platform.select({
      ios: { shadowColor: C.accentOrange, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16 },
      android: { elevation: 4 },
    }),
  },
  createBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.7,
  },
  demoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 16,
  },
  demoHintText: { fontSize: 11, color: C.primaryContainer, fontWeight: '500' },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: C.onSurfaceVariant,
    lineHeight: 22,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: C.primary,
  },
});
