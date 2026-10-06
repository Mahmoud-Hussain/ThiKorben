import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useState } from 'react';

import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getAuthIdentity } from '@/features/auth/auth.service';

const C = {
  primary: '#15157d',
  primaryContainer: '#2e3192',
  brandOrange: '#F7941D',
  success: '#27AE60',
  error: '#ba1a1a',

  surface: '#fcf8ff',

  surfaceContainerLowest: '#ffffff',

  surfaceContainerLow: '#f5f2fb',

  outlineVariant: '#c7c5d4',

  onSurface: '#1b1b21',

  onSurfaceVariant: '#464652',
};

export default function OtpSuccessScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    phone?: string;
    mode?: string;
    name?: string;
  }>();

  const mode = params.mode === 'signup' ? 'signup' : 'login';

  const name = params.name?.trim() || 'User';

  const [isContinuing, setIsContinuing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (isContinuing) {
      return;
    }

    setError(null);
    setIsContinuing(true);

    try {
      const identity = await getAuthIdentity();

      if (!identity) {
        throw new Error('Authenticated session was not found.');
      }

      /*
       * New users choose how they want
       * to use ThiKorben before profile setup.
       */
      if (mode === 'signup') {
        router.replace('/role-selection');

        return;
      }

      /*
       * Existing users return directly
       * to their last active application role.
       */
      if (identity.profile.active_role === 'worker') {
        router.replace('/worker-dashboard');

        return;
      }

      router.replace('/customer-dashboard');
    } catch {
      setError(
        'Your phone was verified, but we could not load your account. Please try again.',
      );
    } finally {
      setIsContinuing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={72} color={C.success} />
        </View>

        <Text style={styles.heading}>
          {mode === 'signup' ? `Welcome, ${name}!` : 'Verified successfully'}
        </Text>

        <Text style={styles.subheading}>
          {mode === 'signup'
            ? 'Your ThiKorben account is verified. Choose how you want to use the platform.'
            : 'Your identity has been verified. Continue securely to your account.'}
        </Text>

        <View style={styles.securityCard}>
          <Ionicons
            name="shield-checkmark-outline"
            size={22}
            color={C.primaryContainer}
          />

          <Text style={styles.securityText}>
            Your authenticated session is securely managed by ThiKorben.
          </Text>
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={17} color={C.error} />

            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.continueBtn, isContinuing && styles.disabledButton]}
          onPress={() => {
            void handleContinue();
          }}
          disabled={isContinuing}
          activeOpacity={0.88}
        >
          {isContinuing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text style={styles.continueBtnText}>
                {mode === 'signup' ? 'Choose Account Type' : 'Continue to App'}
              </Text>

              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.surface,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },

  iconCircle: {
    marginBottom: 24,
  },

  heading: {
    fontSize: 27,
    fontWeight: '700',
    color: C.onSurface,
    textAlign: 'center',
    marginBottom: 10,
  },

  subheading: {
    maxWidth: 360,
    fontSize: 15,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 24,
  },

  securityCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,

    backgroundColor: C.surfaceContainerLow,

    borderRadius: 14,

    paddingHorizontal: 16,
    paddingVertical: 14,

    marginBottom: 20,

    borderWidth: 1,

    borderColor: C.outlineVariant,
  },

  securityText: {
    flex: 1,
    fontSize: 12,
    color: C.onSurfaceVariant,
    lineHeight: 18,
  },

  errorCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,

    backgroundColor: '#fff5f4',

    padding: 12,
    borderRadius: 12,

    marginBottom: 16,
  },

  errorText: {
    flex: 1,
    color: C.error,
    fontSize: 12,
    lineHeight: 18,
  },

  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    width: '100%',
    height: 56,

    backgroundColor: C.brandOrange,

    borderRadius: 999,

    ...Platform.select({
      android: {
        elevation: 4,
      },
    }),
  },

  disabledButton: {
    opacity: 0.65,
  },

  continueBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
