import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type NavTabKey = 'home' | 'pros' | 'jobs' | 'track' | 'worker';

interface BottomNavBarProps {
  activeTab?: NavTabKey;
}

export function BottomNavBar({ activeTab }: BottomNavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const currentActive =
    activeTab ||
    (pathname === '/' || pathname === '/customer-dashboard' || pathname === '/welcome'
      ? 'home'
      : pathname === '/worker-profile'
      ? 'pros'
      : pathname === '/job-details'
      ? 'jobs'
      : pathname === '/track-worker'
      ? 'track'
      : pathname === '/worker-dashboard'
      ? 'worker'
      : 'home');

  const navItems = [
    {
      key: 'home' as NavTabKey,
      label: 'Home',
      icon: 'home',
      iconType: 'ionicons' as const,
      route: '/',
    },
    {
      key: 'pros' as NavTabKey,
      label: 'Pros',
      icon: 'account-group',
      iconType: 'materialCommunity' as const,
      route: '/worker-profile',
    },
    {
      key: 'jobs' as NavTabKey,
      label: 'Job Flow',
      icon: 'clipboard-list',
      iconType: 'materialCommunity' as const,
      route: '/job-details',
    },
    {
      key: 'track' as NavTabKey,
      label: 'Track',
      icon: 'map-marker-path',
      iconType: 'materialCommunity' as const,
      route: '/track-worker',
      badge: 'Live',
    },
    {
      key: 'worker' as NavTabKey,
      label: 'Worker',
      icon: 'engineering',
      iconType: 'material' as const,
      route: '/worker-dashboard',
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 10),
          height: 64 + Math.max(insets.bottom, 10),
        },
      ]}>
      {navItems.map((item) => {
        const isActive = currentActive === item.key;

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.tabButton}
            onPress={() => {
              if (pathname !== item.route) {
                // @ts-ignore
                router.push(item.route);
              }
            }}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={item.label}>
            <View style={styles.iconContainer}>
              <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
                {item.iconType === 'ionicons' ? (
                  <Ionicons
                    name={isActive ? (item.icon as any) : `${item.icon}-outline` as any}
                    size={20}
                    color={isActive ? '#ffffff' : '#64748b'}
                  />
                ) : item.iconType === 'material' ? (
                  <MaterialIcons
                    name={item.icon as any}
                    size={20}
                    color={isActive ? '#ffffff' : '#64748b'}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={20}
                    color={isActive ? '#ffffff' : '#64748b'}
                  />
                )}
              </View>
              {item.badge && !isActive && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#eae7f0',
    paddingTop: 8,
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  iconBox: {
    width: 38,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: {
    backgroundColor: '#15157d',
    width: 44,
    height: 30,
    borderRadius: 15,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#15157d',
    fontWeight: '800',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -8,
    backgroundColor: '#F7941D',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800',
  },
});
