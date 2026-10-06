import { Ionicons, MaterialIcons } from '@expo/vector-icons';

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
import { PRESENTATION_MODE } from '@/lib/presentation-mode';

const C = {
  primary: '#15157d',
  primaryContainer: '#2e3192',
  primaryFixed: '#e1e0ff',

  accentOrange: '#F7941D',

  error: '#ba1a1a',

  success: '#27AE60',

  surface: '#fcf8ff',

  surfaceContainerLowest: '#ffffff',

  outlineVariant: '#c7c5d4',

  outline: '#777683',

  onSurface: '#1b1b21',

  onSurfaceVariant: '#464652',
};

type FieldState = 'idle' | 'valid' | 'error';

function getRequestErrorMessage() {
  return 'Unable to send a verification code right now. Please review your information and try again.';
}

export default function SignUpScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');

  const [phone, setPhone] = useState('');

  const [submitted, setSubmitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [requestError, setRequestError] = useState<string | null>(null);

  const nameValid =
    fullName.trim().length >= 2 && fullName.trim().length <= 100;

  /*
   * UI-level validation.
   *
   * The service layer remains authoritative
   * and also accepts other supported formats.
   */
  const phoneValid = PRESENTATION_MODE
    ? phone.trim().length > 0
    : /^01[3-9]\d{8}$/.test(phone.trim()) ||
      /^1[3-9]\d{8}$/.test(phone.trim());

  const nameState: FieldState = !submitted
    ? 'idle'
    : nameValid
      ? 'valid'
      : 'error';

  const phoneState: FieldState =
    phone.length === 0 ? 'idle' : phoneValid ? 'valid' : 'error';

  const handleCreateAccount = async () => {
    if (isSubmitting) {
      return;
    }

    setSubmitted(true);
    setRequestError(null);

    if (!nameValid || !phoneValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedPhone = await requestPhoneOtp({
        phone,
        mode: 'signup',
        fullName,
      });

      router.push({
        pathname: '/auth/otp-verify',

        params: {
          phone: normalizedPhone,

          mode: 'signup',

          name: fullName.trim(),
        },
      });
    } catch {
      setRequestError(getRequestErrorMessage());
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBorder = (state: FieldState) => {
    if (state === 'error') {
      return C.error;
    }

    if (state === 'valid') {
      return C.success;
    }

    return C.outlineVariant;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.appBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          disabled={isSubmitting}
        >
          <Ionicons name="arrow-back" size={24} color={C.onSurface} />
        </TouchableOpacity>

        <Text style={styles.appBarTitle}>ThiKorben</Text>

        <View style={styles.appBarSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBlob} />

          <View style={styles.headerBlock}>
            <Text style={styles.heading}>Create your account</Text>

            <Text style={styles.subheading}>
              Your phone number will be verified before the account becomes
              active.
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Full Name</Text>

            <View
              style={[
                styles.inputRow,

                {
                  borderColor: inputBorder(nameState),
                },
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
                placeholderTextColor={C.outline}
                value={fullName}
                onChangeText={value => {
                  setFullName(value);

                  setRequestError(null);
                }}
                autoCapitalize="words"
                editable={!isSubmitting}
                maxLength={100}
              />

              {nameState === 'valid' && (
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={C.success}
                  style={styles.trailingIcon}
                />
              )}
            </View>

            {nameState === 'error' && (
              <Text style={styles.errorText}>Enter a valid full name.</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Phone Number</Text>

            <View
              style={[
                styles.inputRow,

                {
                  borderColor: inputBorder(phoneState),
                },
              ]}
            >
              <Ionicons
                name="call-outline"
                size={20}
                color={C.outline}
                style={styles.inputIcon}
              />

              <Text style={styles.phonePrefix}>+880</Text>

              <TextInput
                style={[styles.textInput, styles.phoneInput]}
                placeholder="1XXXXXXXXX"
                placeholderTextColor={C.outline}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={value => {
                  setPhone(value);

                  setRequestError(null);
                }}
                editable={!isSubmitting}
                autoComplete="tel"
                returnKeyType="done"
                onSubmitEditing={() => {
                  void handleCreateAccount();
                }}
              />

              {phoneState === 'valid' && (
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={C.success}
                  style={styles.trailingIcon}
                />
              )}
            </View>

            {phoneState === 'error' && (
              <Text style={styles.errorText}>
                {PRESENTATION_MODE
                  ? 'Enter any phone number for the presentation.'
                  : 'Enter a valid Bangladeshi mobile number.'}
              </Text>
            )}
          </View>

          <View style={styles.securityCard}>
            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color={C.primaryContainer}
            />

            <View style={styles.flex}>
              <Text style={styles.securityTitle}>Passwordless account</Text>

              <Text style={styles.securityText}>
                ThiKorben verifies your phone using a secure one-time code. You
                do not need to create or remember a password.
              </Text>
            </View>
          </View>

          {requestError && (
            <View style={styles.requestError}>
              <Ionicons name="alert-circle-outline" size={17} color={C.error} />

              <Text style={styles.requestErrorText}>{requestError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.createBtn, isSubmitting && styles.disabledButton]}
            onPress={() => {
              void handleCreateAccount();
            }}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Text style={styles.createBtnText}>Continue</Text>

                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text
              style={styles.footerLink}
              onPress={() => router.push('/auth/login')}
            >
              Log In
            </Text>
          </Text>
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
    backgroundColor: C.surfaceContainerLowest,
  },

  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 64,
    backgroundColor: C.surface,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  appBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.primary,
  },

  appBarSpacer: {
    width: 40,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    flexGrow: 1,
  },

  topBlob: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 128,
    backgroundColor: C.primaryFixed,
    opacity: 0.3,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  headerBlock: {
    alignItems: 'center',
    marginBottom: 28,
    paddingTop: 20,
  },

  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: C.onSurface,
    marginBottom: 8,
  },

  subheading: {
    maxWidth: 320,
    fontSize: 14,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 21,
  },

  field: {
    marginBottom: 18,
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.onSurface,
    marginBottom: 7,
    marginLeft: 4,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: C.surfaceContainerLowest,
  },

  inputIcon: {
    marginLeft: 14,
    marginRight: 6,
  },

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

  phoneInput: {
    paddingLeft: 8,
  },

  trailingIcon: {
    marginRight: 14,
  },

  errorText: {
    marginTop: 6,
    marginLeft: 4,
    color: C.error,
    fontSize: 12,
  },

  securityCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#f5f2fb',
    borderRadius: 14,
    padding: 14,
    marginTop: 2,
    marginBottom: 18,
  },

  securityTitle: {
    color: C.onSurface,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 3,
  },

  securityText: {
    color: C.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
  },

  requestError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    marginBottom: 14,
    backgroundColor: '#fff5f4',
    padding: 12,
    borderRadius: 10,
  },

  requestErrorText: {
    flex: 1,
    color: C.error,
    fontSize: 12,
    lineHeight: 18,
  },

  createBtn: {
    backgroundColor: C.accentOrange,
    borderRadius: 999,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 18,
  },

  disabledButton: {
    opacity: 0.65,
  },

  createBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },

  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: C.onSurfaceVariant,
  },

  footerLink: {
    fontWeight: '700',
    color: C.primary,
    textDecorationLine: 'underline',
  },
});
