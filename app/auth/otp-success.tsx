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
  success: '#27AE60',
  surface: '#fcf8ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f5f2fb',
  outlineVariant: '#c7c5d4',
  onSurface: '#1b1b21',
  onSurfaceVariant: '#464652',
};

export default function OtpSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string; mode: string; name?: string }>();
  const name = params.name ?? 'User';
  const mode = params.mode ?? 'login';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Success icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={64} color={C.success} />
        </View>

        <Text style={styles.heading}>
          {mode === 'signup' ? `Welcome, ${name}!` : 'Verified!'}
        </Text>
        <Text style={styles.subheading}>
          {mode === 'signup'
            ? 'Your account has been verified successfully.'
            : 'You have been signed in successfully.'}
        </Text>

        <Text style={styles.placeholderNote}>
          🚧 Role Selection screen will be connected here by your teammate.
        </Text>

        {/* Placeholder CTA — routes to existing dashboard */}
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => router.replace('/')}
          activeOpacity={0.88}
        >
          <Text style={styles.continueBtnText}>Continue to App</Text>
          <Ionicons name="arrow-forward" size={18} color="#ffffff" />
        </TouchableOpacity>

        {/* Back to login for testing */}
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => router.replace('/auth/login')}
          activeOpacity={0.7}
        >
          <Text style={styles.backLinkText}>← Back to Login</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconCircle: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: C.onSurface,
    textAlign: 'center',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 15,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  placeholderNote: {
    fontSize: 13,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: C.outlineVariant,
    lineHeight: 20,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 56,
    backgroundColor: C.brandOrange,
    borderRadius: 9999,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: C.brandOrange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  continueBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.7,
  },
  backLink: { paddingVertical: 8 },
  backLinkText: {
    fontSize: 13,
    color: C.primaryContainer,
    fontWeight: '500',
  },
});
