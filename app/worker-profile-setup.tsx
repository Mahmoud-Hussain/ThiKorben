import React, { useState } from 'react';
import {
  Alert,
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
  secondary: '#8c4f00',
  secondaryContainer: '#fd9923',
  secondaryFixed: '#ffdcbf',
  tertiaryContainer: '#6c2a00',
  surfaceTint: '#4f54b4',
  background: '#fcf8ff',
  surface: '#fcf8ff',
  surfaceContainerLow: '#f5f2fb',
  surfaceContainer: '#f0ecf5',
  surfaceContainerHigh: '#eae7f0',
  surfaceContainerHighest: '#e4e1ea',
  surfaceContainerLowest: '#ffffff',
  outlineVariant: '#c7c5d4',
  outline: '#777683',
  onBackground: '#1b1b21',
  onSurface: '#1b1b21',
  onSurfaceVariant: '#464652',
};

const TRADES = [
  {
    id: 'Plumber',
    name: 'Plumber',
    icon: 'plumbing' as const,
    iconBg: 'rgba(253, 153, 35, 0.15)',
    iconColor: '#fd9923',
  },
  {
    id: 'Electrician',
    name: 'Electrician',
    icon: 'bolt' as const,
    iconBg: 'rgba(21, 21, 125, 0.1)',
    iconColor: '#15157d',
  },
  {
    id: 'Carpenter',
    name: 'Carpenter',
    icon: 'carpenter' as const,
    iconBg: 'rgba(108, 42, 0, 0.15)',
    iconColor: '#6c2a00',
  },
  {
    id: 'Cleaner',
    name: 'Cleaner',
    icon: 'cleaning-services' as const,
    iconBg: 'rgba(79, 84, 180, 0.15)',
    iconColor: '#4f54b4',
  },
  {
    id: 'Painter',
    name: 'Painter',
    icon: 'format-paint' as const,
    iconBg: 'rgba(22, 163, 74, 0.15)',
    iconColor: '#16a34a',
  },
  {
    id: 'AC Technician',
    name: 'AC Technician',
    icon: 'ac-unit' as const,
    iconBg: 'rgba(33, 150, 243, 0.15)',
    iconColor: '#2196f3',
  },
];

export default function WorkerProfileSetupScreen() {
  const router = useRouter();
  const { workerProfile, updateWorkerProfile, setRole } = useSession();

  const [name, setName] = useState(workerProfile.name || 'Rahim Uddin');
  const [phone, setPhone] = useState(workerProfile.phone || '01812345678');
  const [trade, setTrade] = useState(workerProfile.trade || 'Plumber');
  const [experience, setExperience] = useState(workerProfile.experience || '5');
  const [desiredRate, setDesiredRate] = useState(workerProfile.desiredRate || '500');
  const [radius, setRadius] = useState(workerProfile.serviceRadius || 5);
  const [hasPhoto, setHasPhoto] = useState(Boolean(workerProfile.avatar));

  const handleContinue = () => {
    setRole('worker');
    updateWorkerProfile({
      name: name.trim() || 'Rahim Uddin',
      phone: phone.trim() || '01812345678',
      trade,
      experience: experience.trim() || '5',
      desiredRate: desiredRate.trim() || '500',
      serviceRadius: radius,
      avatar: hasPhoto ? 'demo_avatar' : null,
    });
    router.replace('/worker-dashboard' as any);
  };

  const handleSkip = () => {
    setRole('worker');
    router.replace('/worker-dashboard' as any);
  };

  const togglePhoto = () => {
    setHasPhoto((prev) => !prev);
  };

  const handleHelp = () => {
    Alert.alert(
      'Worker Profile Help',
      'Set up your professional credentials, trade specialization, hourly/visit rate, and travel radius so customers in Dhaka can find and hire you.'
    );
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
          <View style={styles.flex} />
          <TouchableOpacity onPress={handleHelp} activeOpacity={0.7}>
            <Text style={styles.helpText}>Help</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>Set up your worker profile</Text>
            <Text style={styles.pageSubtitle}>Help customers understand your services.</Text>
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
                size={44}
                color={COLORS.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={togglePhoto} activeOpacity={0.7}>
              <Text style={styles.photoLabel}>
                {hasPhoto ? 'Photo Selected (Tap to remove)' : 'Upload Profile Photo'}
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
                  placeholder="+880 1XX XXX XXXX"
                  placeholderTextColor={COLORS.outline}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Primary Trade (Bento Grid) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Primary Trade/Service</Text>
              <View style={styles.tradeGrid}>
                {TRADES.map((item) => {
                  const isSelected = trade === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.tradeCard,
                        isSelected ? styles.tradeCardSelected : styles.tradeCardUnselected,
                      ]}
                      onPress={() => setTrade(item.id)}
                      activeOpacity={0.85}>
                      {/* Selection Radio Indicator */}
                      <View style={styles.radioIndicator}>
                        <View
                          style={[
                            styles.radioDot,
                            isSelected && styles.radioDotActive,
                          ]}
                        />
                      </View>

                      {/* Icon Circle */}
                      <View style={[styles.tradeIconBox, { backgroundColor: item.iconBg }]}>
                        <MaterialIcons name={item.icon} size={26} color={item.iconColor} />
                      </View>

                      <Text
                        style={[
                          styles.tradeName,
                          isSelected && styles.tradeNameSelected,
                        ]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Experience & Preferred Rate Row */}
            <View style={styles.row}>
              {/* Experience */}
              <View style={styles.rowCol}>
                <Text style={styles.fieldLabel}>Experience (Years)</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="work"
                    size={20}
                    color={COLORS.outline}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={experience}
                    onChangeText={setExperience}
                    placeholder="0"
                    placeholderTextColor={COLORS.outline}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Preferred Rate */}
              <View style={styles.rowCol}>
                <Text style={styles.fieldLabel}>Preferred Rate (৳)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencyPrefix}>৳</Text>
                  <TextInput
                    style={styles.textInput}
                    value={desiredRate}
                    onChangeText={setDesiredRate}
                    placeholder="500"
                    placeholderTextColor={COLORS.outline}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Service Area Radius */}
            <View style={styles.radiusSection}>
              <View style={styles.radiusHeader}>
                <Text style={styles.fieldLabel}>Service Area Radius</Text>
                <View style={styles.radiusBadge}>
                  <Text style={styles.radiusBadgeText}>{radius} km</Text>
                </View>
              </View>

              {/* Map Visual Indicator */}
              <View style={styles.mapVisualCard}>
                {/* Street Grid Lines Mock */}
                <View style={styles.mapGridLine1} />
                <View style={styles.mapGridLine2} />
                <View style={styles.mapGridLine3} />
                <View style={styles.mapGridLine4} />

                {/* Central Radius Indicator Circle */}
                <View
                  style={[
                    styles.radiusCircle,
                    {
                      width: 40 + radius * 5,
                      height: 40 + radius * 5,
                      borderRadius: (40 + radius * 5) / 2,
                    },
                  ]}>
                  <View style={styles.centerDot} />
                  <MaterialIcons
                    name="location-on"
                    size={26}
                    color={COLORS.primary}
                    style={styles.pinIcon}
                  />
                </View>

                {/* Location City Label */}
                <View style={styles.locationChip}>
                  <Text style={styles.locationChipText}>Dhaka Central Zone</Text>
                </View>
              </View>

              {/* Interactive Step Slider Controls */}
              <View style={styles.sliderControlContainer}>
                <View style={styles.radiusStepRow}>
                  {[1, 3, 5, 8, 10, 15, 20].map((step) => (
                    <TouchableOpacity
                      key={step}
                      style={[
                        styles.radiusStepBtn,
                        radius === step && styles.radiusStepBtnActive,
                      ]}
                      onPress={() => setRadius(step)}
                      activeOpacity={0.8}>
                      <Text
                        style={[
                          styles.radiusStepText,
                          radius === step && styles.radiusStepTextActive,
                        ]}>
                        {step}k
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.rangeLabels}>
                  <Text style={styles.rangeLabelText}>1 km</Text>
                  <Text style={styles.rangeLabelText}>20 km</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={handleContinue}
              activeOpacity={0.9}>
              <Text style={styles.continueBtnText}>Create Worker Profile</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
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
  helpText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
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
    gap: 24,
  },
  headerSection: {
    gap: 6,
    marginTop: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
  },
  photoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: COLORS.surfaceContainer,
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
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    paddingLeft: 2,
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
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.outline,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.onSurface,
    height: '100%',
  },
  tradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tradeCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    gap: 10,
  },
  tradeCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(225, 224, 255, 0.35)',
  },
  tradeCardUnselected: {
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
  },
  radioIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioDotActive: {
    backgroundColor: COLORS.primary,
  },
  tradeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  tradeNameSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowCol: {
    flex: 1,
    gap: 8,
  },
  radiusSection: {
    gap: 12,
    paddingTop: 4,
  },
  radiusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radiusBadge: {
    backgroundColor: COLORS.primaryFixed,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  radiusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  mapVisualCard: {
    width: '100%',
    height: 150,
    borderRadius: 24,
    backgroundColor: '#ede9f5',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapGridLine1: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(199, 197, 212, 0.4)',
  },
  mapGridLine2: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(199, 197, 212, 0.4)',
  },
  mapGridLine3: {
    position: 'absolute',
    left: 80,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(199, 197, 212, 0.4)',
  },
  mapGridLine4: {
    position: 'absolute',
    right: 80,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(199, 197, 212, 0.4)',
  },
  radiusCircle: {
    backgroundColor: 'rgba(21, 21, 125, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(21, 21, 125, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  pinIcon: {
    position: 'absolute',
    top: -14,
  },
  locationChip: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  locationChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  sliderControlContainer: {
    gap: 8,
    paddingTop: 4,
  },
  radiusStepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  radiusStepBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusStepBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  radiusStepText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  radiusStepTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  rangeLabelText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  actionSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHighest,
    gap: 12,
  },
  continueBtn: {
    width: '100%',
    height: 56,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 8px 20px rgba(21,21,125,0.2)',
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
