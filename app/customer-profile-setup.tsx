import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSession } from '@/contexts/session-context';

const COLORS = {
  primary: '#15157d',
  orange: '#F7941D',
  background: '#f8f7fc',
  surface: '#ffffff',
  text: '#1b1b21',
  muted: '#666676',
  border: '#dedbe7',
  error: '#ba1a1a',
};

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Could not save your profile. Please try again.';
}

export default function CustomerProfileSetupScreen() {
  const router = useRouter();
  const { profile, user, customerProfile, saveCustomerProfile } = useSession();

  const [name, setName] = useState(profile?.display_name ?? '');
  const [location, setLocation] = useState(customerProfile?.home_location ?? '');
  const [emergencyContact, setEmergencyContact] = useState(
    customerProfile?.emergency_contact ?? '',
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (isSaving) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await saveCustomerProfile({
        displayName: name,
        homeLocation: location,
        emergencyContact,
      });

      router.replace('/customer-dashboard');
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={isSaving}
          >
            <MaterialIcons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.brandIcon}>
            <MaterialIcons name="person" size={28} color="#ffffff" />
          </View>

          <Text style={styles.title}>Complete your customer profile</Text>
          <Text style={styles.subtitle}>
            Add the minimum information ThiKorben needs to support real service
            requests. Your verified phone remains managed by secure
            authentication.
          </Text>

          <Text style={styles.label}>Full name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            editable={!isSaving}
            placeholder="Your full name"
            placeholderTextColor={COLORS.muted}
            autoCapitalize="words"
            style={styles.input}
          />

          <Text style={styles.label}>Verified phone</Text>
          <View style={styles.readOnlyField}>
            <MaterialIcons name="verified" size={18} color="#198754" />
            <Text style={styles.readOnlyText}>{user?.phone ?? 'Verified'}</Text>
          </View>

          <Text style={styles.label}>Home location</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            editable={!isSaving}
            placeholder="e.g. Dhanmondi, Dhaka"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            maxLength={160}
          />

          <View style={styles.labelRow}>
            <Text style={styles.label}>Emergency contact</Text>
            <Text style={styles.optional}>Optional</Text>
          </View>
          <TextInput
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            editable={!isSaving}
            placeholder="01XXXXXXXXX"
            placeholderTextColor={COLORS.muted}
            keyboardType="phone-pad"
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, isSaving && styles.disabledButton]}
            onPress={() => {
              void handleContinue();
            }}
            disabled={isSaving}
            activeOpacity={0.88}
          >
            {isSaving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Save and Continue</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 48,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginBottom: 18,
  },
  title: { fontSize: 27, fontWeight: '800', color: COLORS.text },
  subtitle: {
    marginTop: 8,
    marginBottom: 28,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.muted,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  optional: { marginTop: 16, fontSize: 11, color: COLORS.muted },
  input: {
    minHeight: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    fontSize: 15,
  },
  readOnlyField: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: '#f1f0f5',
  },
  readOnlyText: { fontSize: 14, color: COLORS.muted },
  error: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff2f0',
    color: COLORS.error,
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    minHeight: 54,
    marginTop: 28,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    backgroundColor: COLORS.orange,
  },
  disabledButton: { opacity: 0.65 },
  primaryButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
});
