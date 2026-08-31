import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { useLocalSearchParams, useRouter } from 'expo-router';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary: '#15157d',
  primaryContainer: '#2e3192',
  brandOrange: '#F7941D',
  brandOrangeHover: '#e68a1a',
  error: '#ba1a1a',
  surface: '#fcf8ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f5f2fb',
  outlineVariant: '#c7c5d4',
  outline: '#777683',
  onSurface: '#1b1b21',
  onSurfaceVariant: '#464652',
  onPrimary: '#ffffff',
  background: '#F8F9FA',
};

// ─── Demo OTP ─────────────────────────────────────────────────────────────────
const DEMO_OTP = '1234';
const OTP_LENGTH = 4;
const RESEND_COUNTDOWN = 30;

export default function OtpVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string; mode: string; name?: string }>();
  const phone = params.phone ?? '';
  const mode = params.mode ?? 'login';
  const name = params.name ?? '';

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  // ── Countdown timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const resetTimer = useCallback(() => {
    setDigits(['', '', '', '']);
    setCountdown(RESEND_COUNTDOWN);
    setCanResend(false);
    inputRefs.current[0]?.focus();
  }, []);

  // ── Digit input handler ──────────────────────────────────────────────────
  const handleDigitChange = useCallback((text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(-1);
    setDigits(prev => {
      const next = [...prev];
      next[index] = cleaned;
      return next;
    });
    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyPress = useCallback((key: string, index: number) => {
    if (key === 'Backspace' && digits[index] === '' && index > 0) {
      setDigits(prev => {
        const next = [...prev];
        next[index - 1] = '';
        return next;
      });
      inputRefs.current[index - 1]?.focus();
    }
  }, [digits]);

  // ── Verify ───────────────────────────────────────────────────────────────
  const handleVerify = useCallback(() => {
    const code = digits.join('');
    if (code.length < OTP_LENGTH) {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
      return;
    }

    setIsVerifying(true);
    // Simulate a tiny "loading" delay for realism
    setTimeout(() => {
      setIsVerifying(false);
      if (code === DEMO_OTP) {
        // Success — route to role-select (placeholder for teammate's screen)
        router.replace({
          pathname: '/auth/otp-success',
          params: { phone, mode, name },
        });
      } else {
        // Wrong OTP — show error state
        router.push({
          pathname: '/auth/otp-error',
          params: { phone, mode, name, wrongCode: code },
        });
      }
    }, 800);
  }, [digits, phone, mode, name, router]);

  const maskedPhone = phone
    ? `+880 ${phone.slice(0, 2)}XXXXXXXX`
    : '+880 1XXXXXXXXX';

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
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color={C.onSurface} />
          </TouchableOpacity>

          {/* Card */}
          <View style={styles.card}>
            {/* Lock icon */}
            <View style={styles.iconCircle}>
              <Ionicons name="lock-closed" size={32} color={C.primaryContainer} />
            </View>

            {/* Header text */}
            <Text style={styles.heading}>Verify your phone number</Text>
            <Text style={styles.subheading}>
              We sent a verification code to{' '}
              <Text style={styles.phoneHighlight}>{maskedPhone}</Text>
            </Text>

            {/* OTP boxes */}
            <View style={[styles.otpRow, shakeError && styles.shake]}>
              {digits.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={ref => { inputRefs.current[i] = ref; }}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : {},
                    shakeError && styles.otpBoxError,
                  ]}
                  value={digit}
                  onChangeText={text => handleDigitChange(text, i)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                  autoFocus={i === 0}
                />
              ))}
            </View>

            {/* Demo hint */}
            <TouchableOpacity
              style={styles.demoHint}
              onPress={() => {
                setDigits(['1', '2', '3', '4']);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="information-circle-outline" size={13} color={C.primaryContainer} />
              <Text style={styles.demoHintText}>Demo OTP: tap to fill 1234</Text>
            </TouchableOpacity>

            {/* Verify button */}
            <TouchableOpacity
              style={[styles.verifyBtn, isVerifying && styles.verifyBtnLoading]}
              onPress={handleVerify}
              activeOpacity={0.88}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.verifyBtnText}>Verify</Text>
              )}
            </TouchableOpacity>

            {/* Resend section */}
            <View style={styles.resendRow}>
              <Text style={styles.resendLabel}>Didn't receive the code? </Text>
              {canResend ? (
                <TouchableOpacity onPress={resetTimer} activeOpacity={0.7}>
                  <Text style={styles.resendLink}>Resend Code</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.countdownText}>
                  Resend in <Text style={styles.countdownNum}>{countdown}s</Text>
                </Text>
              )}
            </View>

            {/* Change number */}
            <TouchableOpacity
              style={styles.changeNumber}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.changeNumberText}>Change phone number</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'stretch',
  },
  backBtn: {
    width: 48, height: 48,
    borderRadius: 24,
    backgroundColor: C.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  card: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'flex-start',
    ...Platform.select({
      ios: { shadowColor: '#2e3192', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20 },
      android: { elevation: 3 },
    }),
  },
  iconCircle: {
    width: 64, height: 64,
    borderRadius: 32,
    backgroundColor: C.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: C.onSurface,
    lineHeight: 28,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: 28,
  },
  phoneHighlight: {
    fontWeight: '700',
    color: C.onSurface,
  },
  // OTP boxes
  otpRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  },
  otpBox: {
    flex: 1,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: C.surfaceContainerLowest,
    fontSize: 24,
    fontWeight: '700',
    color: C.onSurface,
    textAlign: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10 },
      android: { elevation: 1 },
    }),
  },
  otpBoxFilled: {
    borderColor: C.primaryContainer,
    borderWidth: 2,
    ...Platform.select({
      ios: { shadowColor: C.primaryContainer, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16 },
      android: { elevation: 2 },
    }),
  },
  otpBoxError: {
    borderColor: C.error,
    borderWidth: 2,
  },
  shake: {
    // Shake is achieved via borderColor change — native animation kept minimal
  },
  demoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 24,
    marginTop: 8,
  },
  demoHintText: { fontSize: 11, color: C.primaryContainer, fontWeight: '500' },
  // Verify button
  verifyBtn: {
    width: '100%',
    height: 56,
    backgroundColor: C.brandOrange,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: C.brandOrange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  verifyBtnLoading: { opacity: 0.8 },
  verifyBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.7,
  },
  // Resend
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  resendLabel: { fontSize: 14, color: C.onSurfaceVariant },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
    color: C.primaryContainer,
    textDecorationLine: 'underline',
  },
  countdownText: { fontSize: 14, color: C.onSurfaceVariant },
  countdownNum: { fontWeight: '700', color: C.primaryContainer },
  changeNumber: { alignSelf: 'center', marginTop: 4 },
  changeNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.outline,
    letterSpacing: 0.7,
  },
});
