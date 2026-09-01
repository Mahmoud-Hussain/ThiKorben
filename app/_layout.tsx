import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SessionProvider } from '@/contexts/session-context';
import { LogoutModal } from '@/components/logout-modal';

export default function RootLayout() {
  return (
    <SessionProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <LogoutModal />
      <StatusBar style="auto" />
    </SessionProvider>
  );
}
