import React, { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSession } from '@/contexts/session-context';

const COLORS = {
  primary: '#15157d',
  primaryFixed: '#e1e0ff',
  onPrimaryFixed: '#04006d',
  secondaryContainer: '#fd9923',
  onSecondary: '#ffffff',
  background: '#fcf8ff',
  surface: '#fcf8ff',
  surfaceContainerLow: '#f5f2fb',
  surfaceContainer: '#f0ecf5',
  surfaceContainerLowest: '#ffffff',
  outlineVariant: '#c7c5d4',
  outline: '#777683',
  onBackground: '#1b1b21',
  onSurface: '#1b1b21',
  onSurfaceVariant: '#464652',
};

type RoleOption = 'customer' | 'worker';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { role, setRole } = useSession();
  const [selected, setSelected] = useState<RoleOption>(role || 'customer');

  const handleContinue = () => {
    setRole(selected);
    if (selected === 'customer') {
      router.push('/customer-profile-setup' as any);
    } else {
      router.push('/worker-profile-setup' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>
            How will you use <Text style={styles.titleAccent}>ThiKorben</Text>?
          </Text>
          <Text style={styles.subtitle}>
            Select your account type to personalize your experience.
          </Text>
        </View>

        {/* Selection Cards */}
        <View style={styles.cardsContainer}>
          {/* Card 1: Customer */}
          <TouchableOpacity
            style={[
              styles.card,
              selected === 'customer' ? styles.cardSelected : styles.cardUnselected,
            ]}
            onPress={() => setSelected('customer')}
            activeOpacity={0.88}>
            {/* Selection Indicator */}
            <View style={styles.indicatorWrapper}>
              {selected === 'customer' ? (
                <MaterialIcons name="check-circle" size={28} color={COLORS.primary} />
              ) : (
                <MaterialIcons
                  name="radio-button-unchecked"
                  size={28}
                  color={COLORS.outlineVariant}
                />
              )}
            </View>

            {/* Icon Badge */}
            <View
              style={[
                styles.iconBadge,
                selected === 'customer'
                  ? styles.iconBadgeSelected
                  : styles.iconBadgeUnselected,
              ]}>
              <MaterialIcons
                name="home"
                size={32}
                color={selected === 'customer' ? COLORS.primary : COLORS.onSurfaceVariant}
              />
            </View>

            <Text style={styles.cardTitle}>I'm a Customer</Text>
            <Text style={styles.cardDesc}>Find trusted workers for your home.</Text>

            {/* Subtle background glow */}
            {selected === 'customer' && <View style={styles.cardDecor} />}
          </TouchableOpacity>

          {/* Card 2: Worker */}
          <TouchableOpacity
            style={[
              styles.card,
              selected === 'worker' ? styles.cardSelected : styles.cardUnselected,
            ]}
            onPress={() => setSelected('worker')}
            activeOpacity={0.88}>
            {/* Selection Indicator */}
            <View style={styles.indicatorWrapper}>
              {selected === 'worker' ? (
                <MaterialIcons name="check-circle" size={28} color={COLORS.primary} />
              ) : (
                <MaterialIcons
                  name="radio-button-unchecked"
                  size={28}
                  color={COLORS.outlineVariant}
                />
              )}
            </View>

            {/* Icon Badge */}
            <View
              style={[
                styles.iconBadge,
                selected === 'worker'
                  ? styles.iconBadgeSelected
                  : styles.iconBadgeUnselected,
              ]}>
              <MaterialIcons
                name="engineering"
                size={32}
                color={selected === 'worker' ? COLORS.primary : COLORS.onSurfaceVariant}
              />
            </View>

            <Text style={styles.cardTitle}>I'm a Worker</Text>
            <Text style={styles.cardDesc}>Find local jobs and grow your services.</Text>

            {selected === 'worker' && <View style={styles.cardDecor} />}
          </TouchableOpacity>
        </View>

        {/* Sticky Bottom CTA */}
        <View style={styles.ctaWrapper}>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleContinue}
            activeOpacity={0.9}>
            <Text style={styles.continueBtnText}>Continue</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginTop: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.onBackground,
    lineHeight: 40,
    letterSpacing: -0.6,
  },
  titleAccent: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: COLORS.onSurfaceVariant,
    marginTop: 8,
    lineHeight: 26,
  },
  cardsContainer: {
    flex: 1,
    gap: 16,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  cardSelected: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 8px 20px rgba(21,21,125,0.1)',
      },
    }),
  },
  cardUnselected: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      },
    }),
  },
  indicatorWrapper: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  iconBadgeSelected: {
    backgroundColor: COLORS.primaryFixed,
  },
  iconBadgeUnselected: {
    backgroundColor: COLORS.surfaceContainer,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 4,
    lineHeight: 28,
  },
  cardDesc: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.onSurfaceVariant,
    lineHeight: 24,
    paddingRight: 28,
  },
  cardDecor: {
    position: 'absolute',
    bottom: -32,
    right: -32,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: COLORS.primary,
    opacity: 0.04,
  },
  ctaWrapper: {
    marginTop: 'auto',
    paddingTop: 24,
    paddingBottom: 8,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 9999,
    backgroundColor: COLORS.secondaryContainer,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.secondaryContainer,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(253,153,35,0.3)',
      },
    }),
  },
  continueBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSecondary,
    letterSpacing: 0.5,
  },
});
