import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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

import { requestPhoneOtp } from '@/features/auth/auth.service';

const C = {
  primary: '#15157d',
  primaryContainer: '#2e3192',
  accentOrange: '#F7941D',
  secondaryContainer: '#fd9923',
  onSecondaryContainer: '#663800',
  error: '#ba1a1a',
  surface: '#fcf8ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f5f2fb',
  outlineVariant: '#c7c5d4',
  outline: '#777683',
  onSurface: '#1b1b21',
  onSurfaceVariant: '#464652',
  background: '#fcf8ff',
};

function getErrorMessage() {
  /*
   * Keep authentication errors intentionally generic.
   * This avoids leaking whether a specific phone number
   * already exists in the system.
   */
  return 'Unable to send a verification code. Please check the phone number and try again.';
}

export default function LoginScreen() {
  const router = useRouter();

  const [lang, setLang] = useState<'en' | 'bn'>('en');

  const [phone, setPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const normalizedPhone = await requestPhoneOtp({
        phone,
        mode: 'login',
      });

      router.push({
        pathname: '/auth/otp-verify',
        params: {
          phone: normalizedPhone,
          mode: 'login',
        },
      });
    } catch {
      setError(getErrorMessage());
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <View style={styles.brandingStrip}>
            <View style={styles.brandingContent}>
              <Text style={styles.brandTitle}>ThiKorben</Text>

              <Text style={styles.brandSubtitle}>
                Connecting skilled tradespeople with households across
                Bangladesh.
              </Text>
            </View>
          </View>

          <View style={styles.formArea}>
            <View style={styles.langToggleRow}>
              <View style={styles.langToggle}>
                <TouchableOpacity
                  style={[
                    styles.langBtn,
                    lang === 'bn' && styles.langBtnActive,
                  ]}
                  onPress={() => setLang('bn')}
                >
                  <Text
                    style={[
                      styles.langText,
                      lang === 'bn' && styles.langTextActive,
                    ]}
                  >
                    বাংলা
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.langBtn,
                    lang === 'en' && styles.langBtnActive,
                  ]}
                  onPress={() => setLang('en')}
                >
                  <Text
                    style={[
                      styles.langText,
                      lang === 'en' && styles.langTextActive,
                    ]}
                  >
                    English
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.headerBlock}>
              <Text style={styles.heading}>Welcome Back</Text>

              <Text style={styles.subheading}>
                Sign in securely using your mobile number.
              </Text>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Phone Number</Text>

              <View style={[styles.phoneInputRow, error && styles.inputError]}>
                <View style={styles.prefixBox}>
                  <Text style={styles.prefixText}>+880</Text>
                </View>

                <TextInput
                  style={styles.phoneInput}
                  placeholder="1XXXXXXXXX"
                  placeholderTextColor={C.outline}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={value => {
                    setPhone(value);
                    setError(null);
                  }}
                  autoComplete="tel"
                  editable={!isSubmitting}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    void handleContinue();
                  }}
                />
              </View>

              {error && (
                <View style={styles.errorRow}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={15}
                    color={C.error}
                  />

                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.continueBtn,
                isSubmitting && styles.disabledButton,
              ]}
              onPress={() => {
                void handleContinue();
              }}
              disabled={isSubmitting}
              activeOpacity={0.88}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.continueBtnText}>
                    Send Verification Code
                  </Text>

                  <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.securityNote}>
              <Ionicons
                name="shield-checkmark-outline"
                size={17}
                color={C.primaryContainer}
              />

              <Text style={styles.securityText}>
                We use a one-time verification code. No password is required.
              </Text>
            </View>

            <Text style={styles.footerText}>
              Don&apos;t have an account?{' '}
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
  flex: {
    flex: 1,
  },

  safe: {
    flex: 1,
    backgroundColor: C.background,
  },

  container: {
    flexGrow: 1,
  },

  brandingStrip: {
    backgroundColor: C.primaryContainer,
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignItems: 'center',
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
  },

  formArea: {
    flex: 1,
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
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: C.outlineVariant,
  },

  langBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
  },

  langBtnActive: {
    backgroundColor: C.primary,
  },

  langText: {
    fontSize: 12,
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
    fontSize: 24,
    fontWeight: '700',
    color: C.primary,
  },

  subheading: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    marginTop: 6,
    lineHeight: 20,
  },

  fieldBlock: {
    marginBottom: 20,
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.onSurface,
    marginBottom: 7,
  },

  phoneInputRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: C.outlineVariant,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: C.surfaceContainerLowest,
  },

  inputError: {
    borderColor: C.error,
  },

  prefixBox: {
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: C.outlineVariant,
  },

  prefixText: {
    fontSize: 16,
    color: C.onSurfaceVariant,
  },

  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: C.onSurface,
  },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    color: C.error,
    lineHeight: 17,
  },

  continueBtn: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: C.accentOrange,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    opacity: 0.65,
  },

  continueBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },

  securityNote: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: C.surfaceContainerLow,
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 24,
  },

  securityText: {
    flex: 1,
    fontSize: 12,
    color: C.onSurfaceVariant,
    lineHeight: 18,
  },

  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: C.onSurfaceVariant,
  },

  footerLink: {
    color: C.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
