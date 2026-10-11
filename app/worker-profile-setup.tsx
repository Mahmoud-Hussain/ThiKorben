import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSession } from '@/contexts/session-context';

const TRADES = [
  ['plumber', 'Plumber', 'plumbing'],
  ['electrician', 'Electrician', 'electrical-services'],
  ['carpenter', 'Carpenter', 'carpenter'],
  ['cleaner', 'Cleaner', 'cleaning-services'],
  ['painter', 'Painter', 'format-paint'],
  ['ac_technician', 'AC Technician', 'ac-unit'],
] as const;

function messageFrom(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Could not save your worker profile.';
}

export default function WorkerProfileSetupScreen() {
  const router = useRouter();
  const { profile, user, workerProfile, saveWorkerProfile } = useSession();

  const [name, setName] = useState(profile?.display_name ?? '');
  const [trade, setTrade] = useState(workerProfile?.primary_trade ?? 'plumber');
  const [experience, setExperience] = useState(
    workerProfile ? String(workerProfile.experience_years) : '',
  );
  const [rate, setRate] = useState(
    workerProfile ? String(workerProfile.preferred_rate_bdt) : '',
  );
  const [radius, setRadius] = useState(
    workerProfile ? String(workerProfile.service_radius_km) : '5',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (saving) return;

    setError(null);
    setSaving(true);

    try {
      await saveWorkerProfile({
        displayName: name,
        primaryTrade: trade,
        experienceYears: Number(experience),
        preferredRateBdt: Number(rate),
        serviceRadiusKm: Number(radius),
      });

      router.replace('/worker-dashboard');
    } catch (saveError) {
      setError(messageFrom(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.back}
          onPress={() => router.back()}
          disabled={saving}
        >
          <MaterialIcons name="arrow-back" size={22} color="#1b1b21" />
        </TouchableOpacity>

        <View style={styles.icon}>
          <MaterialIcons name="engineering" size={30} color="#fff" />
        </View>

        <Text style={styles.title}>Build your worker profile</Text>
        <Text style={styles.subtitle}>
          Add real service information for matching and proposals.
          Verification is managed separately by ThiKorben.
        </Text>

        <Text style={styles.label}>Full name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          editable={!saving}
          placeholder="Your full name"
        />

        <Text style={styles.label}>Verified phone</Text>
        <View style={styles.readOnly}>
          <MaterialIcons name="verified" size={18} color="#198754" />
          <Text style={styles.readOnlyText}>{user?.phone ?? 'Verified'}</Text>
        </View>

        <Text style={styles.label}>Primary trade</Text>
        <View style={styles.trades}>
          {TRADES.map(([id, label, icon]) => {
            const selected = trade === id;

            return (
              <TouchableOpacity
                key={id}
                style={[styles.trade, selected && styles.tradeSelected]}
                onPress={() => setTrade(id)}
                disabled={saving}
              >
                <MaterialIcons
                  name={icon}
                  size={22}
                  color={selected ? '#15157d' : '#666676'}
                />
                <Text style={selected ? styles.tradeTextSelected : styles.tradeText}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Experience in years</Text>
        <TextInput
          style={styles.input}
          value={experience}
          onChangeText={setExperience}
          editable={!saving}
          keyboardType="number-pad"
          placeholder="e.g. 3"
        />

        <Text style={styles.label}>Preferred service rate (৳)</Text>
        <TextInput
          style={styles.input}
          value={rate}
          onChangeText={setRate}
          editable={!saving}
          keyboardType="numeric"
          placeholder="e.g. 500"
        />

        <Text style={styles.label}>Service radius (km)</Text>
        <TextInput
          style={styles.input}
          value={radius}
          onChangeText={setRadius}
          editable={!saving}
          keyboardType="number-pad"
          placeholder="1 to 50"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.save, saving && styles.disabled]}
          onPress={() => {
            void save();
          }}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save Worker Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f7fc' },
  content: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  back: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15157d',
  },
  title: {
    marginTop: 18,
    fontSize: 27,
    fontWeight: '800',
    color: '#1b1b21',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 21,
    color: '#666676',
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#1b1b21',
  },
  input: {
    minHeight: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#dedbe7',
    borderRadius: 14,
    backgroundColor: '#fff',
    color: '#1b1b21',
  },
  readOnly: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#dedbe7',
    borderRadius: 14,
    backgroundColor: '#f1f0f5',
  },
  readOnlyText: { color: '#666676' },
  trades: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  trade: {
    minWidth: '30%',
    flexGrow: 1,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#dedbe7',
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  tradeSelected: {
    borderColor: '#15157d',
    backgroundColor: '#eeedff',
  },
  tradeText: { fontSize: 12, fontWeight: '700', color: '#666676' },
  tradeTextSelected: { fontSize: 12, fontWeight: '700', color: '#15157d' },
  error: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff2f0',
    color: '#ba1a1a',
  },
  save: {
    minHeight: 54,
    marginTop: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#F7941D',
  },
  disabled: { opacity: 0.65 },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
