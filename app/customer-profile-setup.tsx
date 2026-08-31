import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSession } from '@/contexts/session-context';

const COLORS = {
  primary: '#15157d',
  primaryContainer: '#2e3192',
  primaryFixed: '#e1e0ff',
  onPrimaryFixed: '#04006d',
  accentOrange: '#F7941D',
  secondaryContainer: '#fd9923',
  background: '#fcf8ff',
  surface: '#fcf8ff',
  surfaceContainerLow: '#f5f2fb',
  surfaceContainerHigh: '#eae7f0',
  surfaceContainerHighest: '#e4e1ea',
  surfaceContainerLowest: '#ffffff',
  outlineVariant: '#c7c5d4',
  outline: '#777683',
  onBackground: '#1b1b21',
  onSurface: '#1b1b21',
  onSurfaceVariant: '#464652',
};

export default function CustomerProfileSetupScreen() {
  const router = useRouter();
  const { customerProfile, updateCustomerProfile, setRole } = useSession();

  const [name, setName] = useState(customerProfile.name || 'Nusrat Ahmed');
  const [phone, setPhone] = useState(customerProfile.phone || '01812345678');
  const [location, setLocation] = useState(customerProfile.location || 'Dhanmondi, Dhaka');
  const [emergencyContact, setEmergencyContact] = useState(
    customerProfile.emergencyContact || '01898765432'
  );
  const [hasPhoto, setHasPhoto] = useState(Boolean(customerProfile.avatar));

  const handleContinue = () => {
    setRole('customer');
    updateCustomerProfile({
      name: name.trim() || 'Nusrat Ahmed',
      phone: phone.trim() || '01812345678',
      location: location.trim() || 'Dhanmondi, Dhaka',
      emergencyContact: emergencyContact.trim(),
      avatar: hasPhoto ? 'demo_avatar' : null,
    });
    router.replace('/customer-dashboard' as any);
  };

  const handleSkip = () => {
    setRole('customer');
    router.replace('/customer-dashboard' as any);
  };

  const togglePhoto = () => {
    setHasPhoto((prev) => !prev);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Top App Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityLabel="Go back">
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={styles.brandTitle}>ThiKorben</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Header Title */}
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>Set up your profile</Text>
            <Text style={styles.pageSubtitle}>Tell us a little about yourself.</Text>
          </View>

          {/* Profile Photo Upload */}
          <View style={styles.photoContainer}>
            <TouchableOpacity
              style={[
                styles.photoCircle,
                hasPhoto && styles.photoCircleActive,
              ]}
              onPress={togglePhoto}
              activeOpacity={0.8}>
              <MaterialIcons
                name={hasPhoto ? 'account-circle' : 'add-a-photo'}
                size={48}
                color={COLORS.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={togglePhoto} activeOpacity={0.7}>
              <Text style={styles.photoLabel}>
                {hasPhoto ? 'Photo Selected (Tap to remove)' : 'Upload Photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="person"
                  size={20}
                  color={COLORS.outline}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Rahim Uddin"
                  placeholderTextColor={COLORS.outline}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="call"
                  size={20}
                  color={COLORS.outline}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="e.g. 01XXXXXXXXX"
                  placeholderTextColor={COLORS.outline}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Home Location */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Home Location</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="location-on"
                  size={20}
                  color={COLORS.outline}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Search for your address"
                  placeholderTextColor={COLORS.outline}
                />
              </View>
            </View>

            {/* Emergency Contact */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Emergency Contact</Text>
                <Text style={styles.optionalBadge}>Optional</Text>
              </View>
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="contact-phone"
                  size={20}
                  color={COLORS.outline}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={emergencyContact}
                  onChangeText={setEmergencyContact}
                  placeholder="e.g. 01XXXXXXXXX"
                  placeholderTextColor={COLORS.outline}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={handleContinue}
              activeOpacity={0.9}>
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={handleSkip}
              activeOpacity={0.7}>
              <Text style={styles.skipBtnText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  spacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
    gap: 28,
  },
  headerSection: {
    gap: 6,
    marginTop: 8,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.onBackground,
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
  },
  photoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 4,
  },
  photoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCircleActive: {
    backgroundColor: COLORS.primaryFixed,
    borderColor: COLORS.primary,
    borderStyle: 'solid',
  },
  photoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  formContainer: {
    gap: 20,
  },
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onBackground,
    paddingLeft: 4,
  },
  optionalBadge: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.outline,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.onBackground,
    height: '100%',
  },
  actionSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
    gap: 12,
  },
  continueBtn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.accentOrange,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.accentOrange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 12px rgba(247,148,29,0.3)',
      },
    }),
  },
  continueBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  skipBtn: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
