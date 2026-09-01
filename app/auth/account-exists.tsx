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
import { useRouter } from 'expo-router';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary: '#15157d',
  primaryContainer: '#2e3192',
  brandOrange: '#F7941D',
  surface: '#fcf8ff',
  surfaceContainerHigh: '#eae7f0',
  outlineVariant: '#c7c5d4',
  onSurface: '#1b1b21',
  onSurfaceVariant: '#464652',
  background: '#fcf8ff',
};

export default function AccountExistsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Icon */}
        <View style={styles.iconWrap}>
          <View style={styles.iconCircle}>
            <Ionicons name="alert-circle" size={48} color={C.primary} />
          </View>
        </View>

        {/* Text content */}
        <View style={styles.textBlock}>
          <Text style={styles.heading}>An account already exists</Text>
          <Text style={styles.subheading}>
            You already have a ThiKorben account with this phone number.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {/* Primary — Log In */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.replace('/auth/login')}
            activeOpacity={0.88}
          >
            <Text style={styles.loginBtnText}>Log In</Text>
          </TouchableOpacity>

          {/* Secondary — Use Another Number */}
          <TouchableOpacity
            style={styles.anotherBtn}
            onPress={() => router.replace('/auth/signup')}
            activeOpacity={0.88}
          >
            <Text style={styles.anotherBtnText}>Use Another Number</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
    maxWidth: 448,
    alignSelf: 'center',
    width: '100%',
  },
  iconWrap: { marginBottom: 20 },
  iconCircle: {
    width: 96, height: 96,
    borderRadius: 48,
    backgroundColor: C.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  textBlock: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: C.onSurface,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  loginBtn: {
    height: 56,
    backgroundColor: C.brandOrange,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.7,
  },
  anotherBtn: {
    height: 56,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.outlineVariant,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anotherBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.primary,
    letterSpacing: 0.7,
  },
});
