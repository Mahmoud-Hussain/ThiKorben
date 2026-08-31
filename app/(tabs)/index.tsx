import React from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSession } from '@/contexts/session-context';

const COLORS = {
  primary: '#15157d',
  primaryFixed: '#e1e0ff',
  secondaryContainer: '#fd9923',
  background: '#fcf8ff',
  surface: '#ffffff',
  surfaceContainerLow: '#f5f2fb',
  surfaceContainerHigh: '#eae7f0',
  text: '#1b1b21',
  onSurfaceVariant: '#464652',
  outlineVariant: '#c7c5d4',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
};

export default function HomeScreen() {
  const router = useRouter();
  const { role, customerProfile, workerProfile, setLogoutModalVisible } = useSession();

  const screens = [
    {
      id: 'role-selection',
      title: '1. Role Selection',
      subtitle: "Choose between Customer and Worker account types",
      route: '/role-selection',
      icon: 'people' as const,
      color: COLORS.primary,
      bg: '#e1e0ff',
    },
    {
      id: 'customer-profile',
      title: '2. Customer Profile Setup',
      subtitle: 'Name, phone, location & emergency contact',
      route: '/customer-profile-setup',
      icon: 'person-outline' as const,
      color: '#fd9923',
      bg: '#fff4e5',
    },
    {
      id: 'worker-profile',
      title: '3. Worker Profile Setup',
      subtitle: 'Trade bento grid, experience, rate & service radius',
      route: '/worker-profile-setup',
      icon: 'engineering' as const,
      color: COLORS.primary,
      bg: '#ede9f5',
    },
    {
      id: 'logout-confirmation',
      title: '4. Logout Confirmation',
      subtitle: 'Destructive modal dialog with session clear',
      route: '/logout-confirmation',
      icon: 'logout' as const,
      color: COLORS.error,
      bg: '#ffdad6',
      isModalAction: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>ThiKorben</Text>
          <Text style={styles.appSubtitle}>
            Stitch Onboarding & Profile Demo (50% Update)
          </Text>
        </View>

        {/* Current Active Session Card */}
        <View style={styles.sessionCard}>
          <View style={styles.sessionHeaderRow}>
            <View style={styles.sessionStatusDot} />
            <Text style={styles.sessionStatusText}>In-Memory Local Session State</Text>
          </View>
          <View style={styles.sessionGrid}>
            <View style={styles.sessionItem}>
              <Text style={styles.sessionLabel}>Active Role:</Text>
              <Text style={styles.sessionValue}>{role ? role.toUpperCase() : 'None Selected'}</Text>
            </View>
            <View style={styles.sessionItem}>
              <Text style={styles.sessionLabel}>Customer:</Text>
              <Text style={styles.sessionValue}>{customerProfile.name}</Text>
            </View>
            <View style={styles.sessionItem}>
              <Text style={styles.sessionLabel}>Worker:</Text>
              <Text style={styles.sessionValue}>
                {workerProfile.name} ({workerProfile.trade})
              </Text>
            </View>
          </View>
        </View>

        {/* Screens Section */}
        <View style={styles.screensSection}>
          <Text style={styles.sectionTitle}>Stitch Screens Implemented</Text>
          <Text style={styles.sectionDesc}>
            Tap any screen below to view and interact with the converted React Native + Expo UI:
          </Text>

          <View style={styles.screenList}>
            {screens.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.screenCard}
                onPress={() => {
                  if (s.isModalAction) {
                    setLogoutModalVisible(true);
                  } else {
                    router.push(s.route as any);
                  }
                }}
                activeOpacity={0.85}>
                <View style={[styles.iconBox, { backgroundColor: s.bg }]}>
                  <MaterialIcons name={s.icon as any} size={24} color={s.color} />
                </View>
                <View style={styles.screenInfo}>
                  <Text style={styles.screenTitle}>{s.title}</Text>
                  <Text style={styles.screenSub}>{s.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.onSurfaceVariant} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Start Full Flow CTA */}
        <TouchableOpacity
          style={styles.startFlowBtn}
          onPress={() => router.push('/role-selection' as any)}
          activeOpacity={0.9}>
          <Text style={styles.startFlowText}>Start Full Role & Profile Flow</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
    gap: 20,
  },
  header: {
    gap: 6,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    lineHeight: 20,
  },
  sessionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    }),
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  sessionStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
    letterSpacing: 0.3,
  },
  sessionGrid: {
    gap: 6,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionLabel: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  sessionValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  screensSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionDesc: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    lineHeight: 18,
  },
  screenList: {
    gap: 12,
    marginTop: 4,
  },
  screenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4 },
      android: { elevation: 1 },
      web: { boxShadow: '0 2px 6px rgba(0,0,0,0.04)' },
    }),
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenInfo: {
    flex: 1,
    gap: 2,
  },
  screenTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.text,
  },
  screenSub: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  startFlowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
    ...Platform.select({
      ios: { shadowColor: COLORS.secondaryContainer, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 },
      android: { elevation: 3 },
      web: { boxShadow: '0 4px 12px rgba(253,153,35,0.25)' },
    }),
  },
  startFlowText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
