import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSession } from '@/contexts/session-context';

const COLORS = {
  primaryContainer: '#2e3192',
  onSurface: '#1b1b21',
  onSurfaceVariant: '#464652',
  outlineVariant: '#c7c5d4',
  surfaceContainerLowest: '#ffffff',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
};

interface LogoutModalProps {
  visible?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}

export function LogoutModal({ visible, onClose, onLogout }: LogoutModalProps) {
  const router = useRouter();
  const { clearSession, isLogoutModalVisible, setLogoutModalVisible } = useSession();

  const isVisible = visible !== undefined ? visible : isLogoutModalVisible;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setLogoutModalVisible(false);
    }
  };

  const handleConfirmLogout = () => {
    clearSession();
    handleClose();
    if (onLogout) {
      onLogout();
    } else {
      router.replace('/' as any);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}>
      <Pressable style={styles.scrim} onPress={handleClose}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          {/* Header Icon + Title */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="logout" size={24} color={COLORS.error} />
            </View>
            <Text style={styles.title}>Log out of ThiKorben?</Text>
            <Text style={styles.subtitle}>
              You will need to enter your credentials again to access your account.
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {/* Primary Action (Destructive) */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleConfirmLogout}
              activeOpacity={0.9}>
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>

            {/* Secondary Action (Cancel) */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              activeOpacity={0.85}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(27, 27, 33, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  header: {
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 218, 214, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  actions: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 8,
  },
  logoutButton: {
    width: '100%',
    height: 56,
    borderRadius: 9999,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.error,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 6px rgba(186, 26, 26, 0.2)',
      },
    }),
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: COLORS.onError,
  },
  cancelButton: {
    width: '100%',
    height: 56,
    borderRadius: 9999,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: COLORS.primaryContainer,
  },
});
