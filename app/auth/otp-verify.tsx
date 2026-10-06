import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '@/contexts/session-context';
import { useCallback, useEffect, useRef, useState } from 'react';

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

import {
  isPresentationAuthEnabled,
  PRESENTATION_OTP,
  resendPhoneOtp,
  verifyPhoneOtp,
} from '@/features/auth/auth.service';

import type { PhoneOtpMode } from '@/features/auth/types';

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 60;

const C = {
  primary: '#15157d',
  primaryContainer: '#2e3192',
  brandOrange: '#F7941D',
  error: '#ba1a1a',

  surface: '#fcf8ff',

  surfaceContainerLowest: '#ffffff',

  surfaceContainerLow: '#f5f2fb',

  outline: '#777683',

  onSurface: '#1b1b21',

  onSurfaceVariant: '#464652',

  background: '#F8F9FA',
};

function getReadableError(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('expired')) {
      return 'This verification code has expired. Please request a new code.';
    }

    if (message.includes('invalid')) {
      return 'The verification code is incorrect. Please try again.';
    }

    if (message.includes('rate')) {
      return 'Please wait before requesting another verification code.';
    }
  }

  return 'We could not verify this code. Please try again.';
}

export default function OtpVerifyScreen() {
  const router = useRouter();
  const { refreshAuth } = useSession();

  const params = useLocalSearchParams<{
    phone?: string;
    mode?: string;
    name?: string;
  }>();

  const phone = params.phone ?? '';

  const mode: PhoneOtpMode = params.mode === 'signup' ? 'signup' : 'login';

  const name = params.name ?? '';
  const presentationMode = isPresentationAuthEnabled();

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));

  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);

  const [isVerifying, setIsVerifying] = useState(false);

  const [isResending, setIsResending] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(current => current - 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [countdown]);

  const handleDigitChange = useCallback((text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(-1);

    setDigits(current => {
      const next = [...current];

      next[index] = cleaned;

      return next;
    });

    setError(null);

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === 'Backspace' && digits[index] === '' && index > 0) {
        setDigits(current => {
          const next = [...current];

          next[index - 1] = '';

          return next;
        });

        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits],
  );

  const handleVerify = async () => {
    if (isVerifying) {
      return;
    }

    const token = digits.join('');

    if (token.length !== OTP_LENGTH) {
      setError('Enter the complete 6-digit verification code.');

      return;
    }

    setError(null);
    setIsVerifying(true);

    try {
      await verifyPhoneOtp({
        phone,
        token,
        fullName: name,
      });
      await refreshAuth();

      /*
       * SessionProvider receives Supabase's
       * SIGNED_IN event automatically.
       *
       * Signup users continue through role
       * selection/onboarding.
       *
       * Existing users can also choose their
       * active role before entering the app.
       */
      router.replace({
        pathname: '/auth/otp-success',

        params: {
          phone,
          mode,
          name,
        },
      });
    } catch (verifyError) {
      setError(getReadableError(verifyError));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) {
      return;
    }

    setError(null);
    setIsResending(true);

    try {
      await resendPhoneOtp({
        phone,
        mode,

        ...(mode === 'signup'
          ? {
              fullName: name,
            }
          : {}),
      });

      setDigits(Array(OTP_LENGTH).fill(''));

      setCountdown(RESEND_COUNTDOWN);

      inputRefs.current[0]?.focus();
    } catch (resendError) {
      setError(getReadableError(resendError));
    } finally {
      setIsResending(false);
    }
  };

  const maskedPhone = phone.startsWith('+880')
    ? `${phone.slice(0, 7)}XXXXXXX`
    : phone;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            disabled={isVerifying || isResending}
          >
            <Ionicons name="arrow-back" size={22} color={C.onSurface} />
          </TouchableOpacity>

          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="lock-closed"
                size={32}
                color={C.primaryContainer}
              />
            </View>

            <Text style={styles.heading}>Verify your phone number</Text>

            <Text style={styles.subheading}>
              Enter the 6-digit code sent to{' '}
              <Text style={styles.phoneHighlight}>{maskedPhone}</Text>
            </Text>

            {presentationMode ? (
              <View style={styles.presentationNotice}>
                <View style={styles.presentationNoticeIcon}>
                  <Ionicons
                    name="notifications"
                    size={20}
                    color={C.brandOrange}
                  />
                </View>
                <View style={styles.presentationNoticeText}>
                  <Text style={styles.presentationNoticeTitle}>
                    ThiKorben verification code
                  </Text>
                  <Text style={styles.presentationNoticeBody}>
                    Presentation mode is active. Enter{' '}
                    <Text style={styles.presentationCode}>
                      {PRESENTATION_OTP}
                    </Text>
                    {' '}to continue.
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.otpRow}>
              {digits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpBox,

                    digit ? styles.otpBoxFilled : null,

                    error ? styles.otpBoxError : null,
                  ]}
                  value={digit}
                  onChangeText={text => handleDigitChange(text, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                  autoFocus={index === 0}
                  editable={!isVerifying}
                />
              ))}
            </View>

            {error && (
              <View style={styles.errorRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color={C.error}
                />

                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.verifyBtn, isVerifying && styles.disabledButton]}
              onPress={() => {
                void handleVerify();
              }}
              disabled={isVerifying || isResending}
              activeOpacity={0.88}
            >
              {isVerifying ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.verifyBtnText}>Verify</Text>
              )}
            </TouchableOpacity>

            <View style={styles.resendRow}>
              <Text style={styles.resendLabel}>
                Didn&apos;t receive the code?{' '}
              </Text>

              {countdown > 0 ? (
                <Text style={styles.countdownText}>
                  Resend in{' '}
                  <Text style={styles.countdownNumber}>{countdown}s</Text>
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    void handleResend();
                  }}
                  disabled={isResending}
                >
                  {isResending ? (
                    <ActivityIndicator size="small" color={C.primary} />
                  ) : (
                    <Text style={styles.resendLink}>Resend Code</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              disabled={isVerifying || isResending}
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
  flex: {
    flex: 1,
  },

  safe: {
    flex: 1,
    backgroundColor: C.background,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,

    ...Platform.select({
      android: {
        elevation: 2,
      },
    }),
  },

  card: {
    backgroundColor: C.surfaceContainerLowest,

    borderRadius: 32,

    paddingHorizontal: 24,
    paddingVertical: 32,

    alignItems: 'center',

    ...Platform.select({
      android: {
        elevation: 3,
      },
    }),
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,

    backgroundColor: C.surfaceContainerLow,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 20,
  },

  heading: {
    fontSize: 23,
    fontWeight: '700',
    color: C.onSurface,
    textAlign: 'center',
    marginBottom: 8,
  },

  subheading: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
  },

  phoneHighlight: {
    fontWeight: '700',
    color: C.onSurface,
  },

  presentationNotice: {
    width: '100%',
    marginBottom: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#f3d2ab',
    borderRadius: 13,
    backgroundColor: '#fff7ed',
  },

  presentationNoticeIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },

  presentationNoticeText: {
    flex: 1,
  },

  presentationNoticeTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: C.onSurface,
  },

  presentationNoticeBody: {
    marginTop: 2,
    fontSize: 10.5,
    lineHeight: 16,
    color: C.onSurfaceVariant,
  },

  presentationCode: {
    fontWeight: '900',
    color: C.brandOrange,
    letterSpacing: 1,
  },

  otpRow: {
    flexDirection: 'row',
    gap: 7,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 12,
  },

  otpBox: {
    flex: 1,
    maxWidth: 50,
    height: 60,

    borderRadius: 14,
    borderWidth: 1,

    borderColor: '#eeeeee',

    backgroundColor: C.surfaceContainerLowest,

    fontSize: 23,
    fontWeight: '700',
    color: C.onSurface,
  },

  otpBoxFilled: {
    borderColor: C.primaryContainer,
    borderWidth: 2,
  },

  otpBoxError: {
    borderColor: C.error,
  },

  errorRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    backgroundColor: '#fff5f4',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },

  errorText: {
    flex: 1,
    color: C.error,
    fontSize: 12,
    lineHeight: 18,
  },

  verifyBtn: {
    width: '100%',
    height: 56,

    borderRadius: 28,

    backgroundColor: C.brandOrange,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 8,
    marginBottom: 22,
  },

  disabledButton: {
    opacity: 0.65,
  },

  verifyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },

  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  resendLabel: {
    fontSize: 13,
    color: C.onSurfaceVariant,
  },

  countdownText: {
    fontSize: 13,
    color: C.onSurfaceVariant,
  },

  countdownNumber: {
    fontWeight: '700',
    color: C.primaryContainer,
  },

  resendLink: {
    fontSize: 13,
    fontWeight: '700',
    color: C.primary,
    textDecorationLine: 'underline',
  },

  changeNumberText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.outline,
  },
});
