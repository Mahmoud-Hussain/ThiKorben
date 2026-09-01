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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ─── Design tokens (from Stitch HTML) ───────────────────────────────────────
const C = {
  primary: '#15157d',
  primaryContainer: '#2e3192',
  accentOrange: '#F7941D',
  secondaryContainer: '#fd9923',
  onSecondaryContainer: '#663800',
  surface: '#fcf8ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f5f2fb',
  surfaceContainer: '#f0ecf5',
  surfaceContainerHigh: '#eae7f0',
  outlineVariant: '#c7c5d4',
  outline: '#777683',
  onSurface: '#1b1b21',
  onSurfaceVariant: '#464652',
  onPrimary: '#ffffff',
  background: '#fcf8ff',
};

// ─── Demo data ───────────────────────────────────────────────────────────────
const DEMO_PHONE = '01812345678';

export default function LoginScreen() {
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [phone, setPhone] = useState('');

  const handleContinue = () => {
    if (phone.trim().length === 0) return;
    router.push({
      pathname: '/auth/otp-verify',
      params: { phone: phone.trim(), mode: 'login' },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Top branding strip ── */}
          <View style={styles.brandingStrip}>
            <View style={styles.brandingContent}>
              <Text style={styles.brandTitle}>ThiKorben</Text>
              <Text style={styles.brandSubtitle}>
                Connecting skilled tradespeople with households across Bangladesh.
                Trust, reliability, and local accessibility.
              </Text>
            </View>
          </View>

          {/* ── Form area ── */}
          <View style={styles.formArea}>
            {/* Language toggle */}
            <View style={styles.langToggleRow}>
              <View style={styles.langToggle}>
                <TouchableOpacity
                  style={[styles.langBtn, lang === 'bn' && styles.langBtnActive]}
                  onPress={() => setLang('bn')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.langText, lang === 'bn' && styles.langTextActive]}>
                    বাংলা
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}
                  onPress={() => setLang('en')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>
                    English
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Header */}
            <View style={styles.headerBlock}>
              <Text style={styles.heading}>Welcome Back</Text>
              <Text style={styles.subheading}>Sign in to continue using ThiKorben.</Text>
            </View>

            {/* Phone input */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.prefixBox}>
                  <Text style={styles.prefixText}>+880</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="1XXXXXXXXX"
                  placeholderTextColor={C.outline}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={11}
                  autoComplete="tel"
                />
              </View>
            </View>

            {/* Continue button */}
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={handleContinue}
              activeOpacity={0.88}
            >
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>

            {/* Demo hint */}
            <TouchableOpacity
              style={styles.demoHint}
              onPress={() => setPhone(DEMO_PHONE)}
              activeOpacity={0.7}
            >
              <Ionicons name="information-circle-outline" size={14} color={C.primaryContainer} />
              <Text style={styles.demoHintText}>Demo: tap to fill {DEMO_PHONE}</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Secondary buttons */}
            <View style={styles.secondaryBtns}>
              <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.8}>
                <Ionicons name="person-outline" size={18} color={C.primaryContainer} />
                <Text style={styles.outlineBtnText}>Continue as Customer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} activeOpacity={0.8}>
                <Ionicons name="construct-outline" size={18} color={C.onSurface} />
                <Text style={styles.ghostBtnText}>Continue as Worker</Text>
              </TouchableOpacity>
            </View>

            {/* Footer link */}
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text
                style={styles.footerLink}
                onPress={() => router.push('/auth/signup')}
              >
                Create Account
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  container: {
    flexGrow: 1,
  },
  // ── Branding strip ──
  brandingStrip: {
    backgroundColor: C.primaryContainer,
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandingContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#9da1ff',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 15,
    color: '#c0c1ff',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
  // ── Form area ──
  formArea: {
    flex: 1,
    backgroundColor: C.surface,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  langToggleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 9999,
    padding: 4,
    borderWidth: 1,
    borderColor: C.outlineVariant,
  },
  langBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  langBtnActive: {
    backgroundColor: C.primary,
  },
  langText: {
    fontSize: 12,
    fontWeight: '500',
    color: C.onSurfaceVariant,
  },
  langTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  headerBlock: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: C.primary,
    lineHeight: 28,
  },
  subheading: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 20,
  },
  // ── Phone field ──
  fieldBlock: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: C.onSurface,
    marginBottom: 6,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.outlineVariant,
    borderRadius: 12,
    backgroundColor: C.surfaceContainerLowest,
    overflow: 'hidden',
  },
  prefixBox: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: C.outlineVariant,
    backgroundColor: C.surfaceContainerLowest,
  },
  prefixText: {
    fontSize: 16,
    color: C.onSurfaceVariant,
    fontWeight: '400',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: C.onSurface,
  },
  // ── Buttons ──
  continueBtn: {
    backgroundColor: C.secondaryContainer,
    borderRadius: 16,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  continueBtnText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.05 * 14,
    color: C.onSecondaryContainer,
  },
  demoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 16,
  },
  demoHintText: {
    fontSize: 11,
    color: C.primaryContainer,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.outlineVariant,
    opacity: 0.5,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
    color: C.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  secondaryBtns: {
    gap: 12,
    marginBottom: 24,
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: C.primaryContainer,
    borderRadius: 16,
    minHeight: 56,
    backgroundColor: 'transparent',
  },
  outlineBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.primaryContainer,
    letterSpacing: 0.05 * 14,
  },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.surfaceContainer,
    borderRadius: 16,
    minHeight: 56,
  },
  ghostBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.onSurface,
    letterSpacing: 0.05 * 14,
  },
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
    textDecorationLine: 'underline',
  },
});
