import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { LogoutModal } from '@/components/logout-modal';
import { SessionProvider, useSession } from '@/contexts/session-context';

const PUBLIC_PATHS = new Set([
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/otp-verify',
  '/auth/otp-success',
  '/auth/account-exists',
  '/auth/otp-error',
]);

function AppNavigator() {
  const pathname = usePathname();
  const router = useRouter();

  const {
    status,
    isAuthenticated,
    role,
    customerProfile,
    workerProfile,
  } = useSession();

  const redirectTarget = useMemo(() => {
    if (status === 'loading') {
      return null;
    }

    const isPublic = PUBLIC_PATHS.has(pathname);

    if (!isAuthenticated) {
      return isPublic ? null : '/';
    }

    if (isPublic || pathname === '/role-selection') {
      return null;
    }

    if (role === 'worker' && !workerProfile) {
      return pathname === '/worker-profile-setup' ||
        pathname === '/logout-confirmation'
        ? null
        : '/worker-profile-setup';
    }

    if (role === 'customer' && !customerProfile) {
      return pathname === '/customer-profile-setup' ||
        pathname === '/logout-confirmation'
        ? null
        : '/customer-profile-setup';
    }

    /*
     * After onboarding is complete, authenticated users may navigate
     * across the application. Authorization for data mutations remains
     * enforced by Supabase RLS and controlled RPCs.
     */
    return null;
  }, [
    customerProfile,
    isAuthenticated,
    pathname,
    role,
    status,
    workerProfile,
  ]);

  useEffect(() => {
    if (redirectTarget && redirectTarget !== pathname) {
      router.replace(redirectTarget);
    }
  }, [pathname, redirectTarget, router]);

  const shouldHoldProtectedRender =
    status === 'loading' && !PUBLIC_PATHS.has(pathname);

  if (shouldHoldProtectedRender || redirectTarget) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#15157d" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <LogoutModal />
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <AppNavigator />
    </SessionProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f7fc',
  },
});
