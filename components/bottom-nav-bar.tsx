import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { type Href, usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/contexts/session-context';

export type NavTabKey =
  | 'home'
  | 'community'
  | 'shop'
  | 'cart'
  | 'jobs'
  | 'passport'
  | 'notifications'
  | 'profile';

interface BottomNavBarProps {
  activeTab?: NavTabKey;
}

type NavItem = {
  key: NavTabKey;
  label: string;
  icon: string;
  iconType: 'ionicons' | 'materialCommunity' | 'material';
  route: Href;
  badge?: string;
};

export function BottomNavBar({ activeTab }: BottomNavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { role } = useSession();

  const customerItems: NavItem[] = [
    {
      key: 'home',
      label: 'Home',
      icon: 'home',
      iconType: 'ionicons',
      route: '/customer-dashboard',
    },
    {
      key: 'community',
      label: 'Community',
      icon: 'people',
      iconType: 'ionicons',
      route: '/community',
    },
    {
      key: 'shop',
      label: 'Shop',
      icon: 'bag-handle',
      iconType: 'ionicons',
      route: '/shop',
    },
    {
      key: 'cart',
      label: 'Cart',
      icon: 'cart',
      iconType: 'ionicons',
      route: '/cart',
    },
    {
      key: 'notifications',
      label: 'Updates',
      icon: 'notifications',
      iconType: 'ionicons',
      route: '/notifications',
    },
  ];

  const workerItems: NavItem[] = [
    {
      key: 'home',
      label: 'Home',
      icon: 'home',
      iconType: 'ionicons',
      route: '/worker-dashboard',
    },
    {
      key: 'jobs',
      label: 'Jobs',
      icon: 'briefcase',
      iconType: 'materialCommunity',
      route: '/community',
    },
    {
      key: 'shop',
      label: 'Shop',
      icon: 'bag-handle',
      iconType: 'ionicons',
      route: '/shop',
    },
    {
      key: 'passport',
      label: 'Passport',
      icon: 'certificate-outline',
      iconType: 'materialCommunity',
      route: '/worker-skill-passport',
    },
    {
      key: 'notifications',
      label: 'Updates',
      icon: 'notifications',
      iconType: 'ionicons',
      route: '/notifications',
    },
  ];

  const navItems = role === 'worker' ? workerItems : customerItems;

  const inferredActive: NavTabKey =
    pathname === '/customer-dashboard' || pathname === '/worker-dashboard'
      ? 'home'
      : pathname === '/community' || pathname === '/job-board'
        ? role === 'worker'
          ? 'jobs'
          : 'community'
        : pathname === '/shop' || pathname === '/product-details'
          ? 'shop'
          : pathname === '/cart' || pathname === '/service-checkout'
            ? 'cart'
            : pathname === '/worker-skill-passport'
              ? 'passport'
              : pathname === '/notifications'
                ? 'notifications'
                : 'home';

  const currentActive = activeTab ?? inferredActive;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 10),
          height: 64 + Math.max(insets.bottom, 10),
        },
      ]}
    >
      {navItems.map(item => {
        const isActive = currentActive === item.key;

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.tabButton}
            onPress={() => {
              if (pathname !== item.route) {
                router.push(item.route);
              }
            }}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <View style={styles.iconContainer}>
              <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
                {item.iconType === 'ionicons' ? (
                  <Ionicons
                    name={
                      (isActive
                        ? item.icon
                        : `${item.icon}-outline`) as React.ComponentProps<
                        typeof Ionicons
                      >['name']
                    }
                    size={20}
                    color={isActive ? '#ffffff' : '#64748b'}
                  />
                ) : item.iconType === 'material' ? (
                  <MaterialIcons
                    name={
                      item.icon as React.ComponentProps<
                        typeof MaterialIcons
                      >['name']
                    }
                    size={20}
                    color={isActive ? '#ffffff' : '#64748b'}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={
                      item.icon as React.ComponentProps<
                        typeof MaterialCommunityIcons
                      >['name']
                    }
                    size={20}
                    color={isActive ? '#ffffff' : '#64748b'}
                  />
                )}
              </View>

              {item.badge && !isActive ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}
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
    width: 44,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#15157d',
  },
  tabLabel: {
    marginTop: 2,
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748b',
  },
  tabLabelActive: {
    color: '#15157d',
    fontWeight: '800',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: '#F7941D',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800',
  },
});
