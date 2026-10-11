import React from 'react';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary: '#15157d',
  primaryContainer: '#2e3192',
  brandOrange: '#F7941D',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  surface: '#fcf8ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f5f2fb',
  surfaceDim: '#dbd9e1',
  outlineVariant: '#c7c5d4',
  onSurface: '#1b1b21',
  onSurfaceVariant: '#464652',
};

export default function OtpErrorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    phone: string;
    mode: string;
    name?: string;
    wrongCode?: string;
  }>();

  const wrongCode = params.wrongCode ?? '????';
  const digits = wrongCode.padEnd(4, '?').slice(0, 4).split('');

  const handleTryAgain = () => {
    router.replace({
      pathname: '/auth/otp-verify',
      params: {
        phone: params.phone,
        mode: params.mode,
        name: params.name,
      },
    });
  };

  const handleResend = () => {
    // Same demo OTP 1234 — just return to OTP screen (no real SMS)
    router.replace({
      pathname: '/auth/otp-verify',
      params: {
        phone: params.phone,
        mode: params.mode,
        name: params.name,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Card */}
        <View style={styles.card}>
          {/* Header / icon */}
          <View style={styles.headerSection}>
            <View style={styles.errorIconCircle}>
              <Ionicons name="alert-circle" size={40} color={C.onErrorContainer} />
            </View>
            <Text style={styles.heading}>Incorrect code</Text>
            <Text style={styles.subheading}>Please check the code and try again.</Text>
          </View>

          {/* Wrong digits display */}
          <View style={styles.digitsSection}>
            <View style={styles.digitsRow}>
              {digits.map((d, i) => (
                <View key={i} style={styles.wrongDigitBox}>
                  <Text style={styles.wrongDigitText}>{d}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.errorMsg}>Invalid code entered.</Text>
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.tryAgainBtn}
              onPress={handleTryAgain}
              activeOpacity={0.88}
            >
              <Text style={styles.tryAgainBtnText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendBtn}
              onPress={handleResend}
              activeOpacity={0.88}
            >
              <Text style={styles.resendBtnText}>Resend Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.surface },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  card: {
    width: '100%',
    maxWidth: 448,
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.surfaceDim,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  // ── Header ──
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 0,
    alignItems: 'center',
  },
  errorIconCircle: {
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: C.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: C.onSurface,
    marginBottom: 6,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  // ── Wrong digits ──
  digitsSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  digitsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 12,
  },
  wrongDigitBox: {
    width: 48, height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.error,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrongDigitText: {
    fontSize: 22,
    fontWeight: '700',
    color: C.onSurface,
  },
  errorMsg: {
    fontSize: 12,
    fontWeight: '500',
    color: C.error,
    textAlign: 'center',
  },
  // ── Action buttons ──
  actionsSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  tryAgainBtn: {
    height: 56,
    backgroundColor: C.brandOrange,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  tryAgainBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.7,
  },
  resendBtn: {
    height: 56,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: C.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.primary,
    letterSpacing: 0.7,
  },
});
