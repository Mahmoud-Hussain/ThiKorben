import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Category = 'plumbing' | 'electrical' | 'carpentry' | 'cleaning' | 'painting' | 'ac';

type Analysis = {
  category: Category;
  title: string;
  service: string;
  confidence: number;
  summary: string;
};

const C = {
  primary: '#15157d',
  orange: '#F7941D',
  green: '#16a34a',
  background: '#f8f7fc',
  surface: '#ffffff',
  text: '#1b1b21',
  muted: '#5b5a68',
  border: '#e6e3ee',
  primarySoft: '#ede9fe',
  orangeSoft: '#fff4e5',
  greenSoft: '#eaf8f0',
};

const WORKERS = [
  {
    id: 'rahim',
    name: 'Rahim Uddin',
    profession: 'Master Plumber',
    rating: '4.9',
    jobs: 128,
    distance: '1.2 km',
    price: 500,
    category: 'plumbing',
  },
  {
    id: 'karim',
    name: 'Karim Mollah',
    profession: 'Senior Electrician',
    rating: '4.8',
    jobs: 94,
    distance: '2.1 km',
    price: 450,
    category: 'electrical',
  },
  {
    id: 'kamal',
    name: 'Kamal Hossain',
    profession: 'Expert Carpenter',
    rating: '4.7',
    jobs: 76,
    distance: '3.4 km',
    price: 600,
    category: 'carpentry',
  },
];

function analyzeProblem(value: string): Analysis {
  const text = value.toLowerCase();

  if (
    text.includes('electric') ||
    text.includes('switch') ||
    text.includes('fan') ||
    text.includes('wire') ||
    text.includes('current')
  ) {
    return {
      category: 'electrical',
      title: 'Electrical repair needed',
      service: 'Electrician',
      confidence: 0.9,
      summary:
        'Your description suggests a household electrical repair. Avoid touching exposed wiring or energized equipment.',
    };
  }

  if (
    text.includes('door') ||
    text.includes('wood') ||
    text.includes('furniture') ||
    text.includes('carpenter')
  ) {
    return {
      category: 'carpentry',
      title: 'Carpentry service needed',
      service: 'Carpenter',
      confidence: 0.86,
      summary:
        'Your description looks related to door, furniture, or wood repair.',
    };
  }

  if (
    text.includes('ac') ||
    text.includes('air conditioner') ||
    text.includes('cool')
  ) {
    return {
      category: 'ac',
      title: 'AC technician needed',
      service: 'AC Technician',
      confidence: 0.88,
      summary:
        'The issue appears related to air-conditioning performance or repair.',
    };
  }

  return {
    category: 'plumbing',
    title: 'Possible water-line or sink leak',
    service: 'Plumber',
    confidence: 0.87,
    summary:
      'Your description is most consistent with a plumbing issue such as a pipe, hose, tap, or joint leak.',
  };
}

export default function AiAssistantScreen() {
  const router = useRouter();
  const [message, setMessage] = useState(
    'Kitchen sink er niche pani leak hocche. Pipe naki hose bujhtesi na.',
  );
  const [photoAttached, setPhotoAttached] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const workers = useMemo(() => {
    if (!analysis) return [];

    const exact = WORKERS.filter(worker => worker.category === analysis.category);
    const others = WORKERS.filter(worker => worker.category !== analysis.category);

    return [...exact, ...others].slice(0, 3);
  }, [analysis]);

  const runAnalysis = () => {
    setAnalysis(analyzeProblem(message));
  };

  const continueToRequest = () => {
    if (!analysis) return;

    router.push({
      pathname: '/job-board',
      params: {
        mode: 'create',
        title: analysis.title,
        category: analysis.category,
        description: message,
        budget: '800',
        schedule: 'As soon as possible',
      },
    } as Href);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </Pressable>

        <View style={styles.headerCenter}>
          <View style={styles.aiHeaderIcon}>
            <Ionicons name="sparkles" size={18} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>ThiKorben AI</Text>
            <Text style={styles.headerSubtitle}>Service assistant</Text>
          </View>
        </View>

        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.assistantBubble}>
          <View style={styles.botIcon}>
            <Ionicons name="sparkles" size={17} color={C.primary} />
          </View>
          <Text style={styles.assistantText}>
            Assalamu Alaikum. Apnar problem ta Bangla, Banglish, ba English-e
            bolun. Jodi possible hoy, ekta picture-o attach korun.
          </Text>
        </View>

        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={value => {
              setMessage(value);
              setAnalysis(null);
            }}
            multiline
            textAlignVertical="top"
            placeholder="Describe your problem..."
            placeholderTextColor={C.muted}
          />

          <View style={styles.inputActions}>
            <Pressable
              style={[
                styles.photoButton,
                photoAttached && styles.photoButtonActive,
              ]}
              onPress={() => setPhotoAttached(value => !value)}
            >
              <Ionicons
                name={photoAttached ? 'checkmark-circle' : 'camera-outline'}
                size={17}
                color={photoAttached ? C.green : C.primary}
              />
              <Text
                style={[
                  styles.photoText,
                  photoAttached && styles.photoTextActive,
                ]}
              >
                {photoAttached ? 'Photo attached' : 'Attach photo'}
              </Text>
            </Pressable>

            <Pressable style={styles.analyzeButton} onPress={runAnalysis}>
              <Ionicons name="sparkles" size={17} color="#ffffff" />
              <Text style={styles.analyzeText}>Analyze Problem</Text>
            </Pressable>
          </View>
        </View>

        {analysis ? (
          <>
            <View style={styles.analysisCard}>
              <View style={styles.analysisTop}>
                <View style={styles.analysisIcon}>
                  <MaterialCommunityIcons
                    name="clipboard-pulse-outline"
                    size={22}
                    color={C.primary}
                  />
                </View>

                <View style={styles.flex}>
                  <Text style={styles.analysisEyebrow}>LIKELY SERVICE</Text>
                  <Text style={styles.analysisTitle}>{analysis.service}</Text>
                </View>

                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>
                    {Math.round(analysis.confidence * 100)}%
                  </Text>
                </View>
              </View>

              <Text style={styles.analysisSummary}>{analysis.summary}</Text>

              <View style={styles.photoEvidence}>
                <Ionicons
                  name={photoAttached ? 'image' : 'image-outline'}
                  size={18}
                  color={photoAttached ? C.green : C.muted}
                />
                <Text style={styles.photoEvidenceText}>
                  {photoAttached
                    ? 'Photo evidence included in this assessment.'
                    : 'No photo attached. You can still continue with the text description.'}
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Suitable workers</Text>
                <Text style={styles.sectionSubtitle}>
                  Nearby profiles ranked for this service
                </Text>
              </View>
              <Ionicons name="location-outline" size={20} color={C.primary} />
            </View>

            {workers.map((worker, index) => (
              <Pressable
                key={worker.id}
                style={styles.workerCard}
                onPress={() => router.push('/worker-profile')}
              >
                <View style={styles.workerAvatar}>
                  <Text style={styles.workerInitial}>
                    {worker.name.charAt(0)}
                  </Text>
                </View>

                <View style={styles.flex}>
                  <View style={styles.workerTitleRow}>
                    <Text style={styles.workerName}>{worker.name}</Text>
                    {index === 0 ? (
                      <View style={styles.bestBadge}>
                        <Text style={styles.bestText}>BEST MATCH</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.workerProfession}>{worker.profession}</Text>
                  <Text style={styles.workerMeta}>
                    ★ {worker.rating} • {worker.jobs} jobs • {worker.distance}
                  </Text>
                </View>

                <View style={styles.workerPriceWrap}>
                  <Text style={styles.workerPrice}>৳{worker.price}</Text>
                  <Text style={styles.workerPriceSub}>visit</Text>
                </View>
              </Pressable>
            ))}

            <Pressable style={styles.publishButton} onPress={continueToRequest}>
              <Ionicons name="megaphone-outline" size={18} color="#ffffff" />
              <Text style={styles.publishText}>
                Review & Publish Service Request
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </Pressable>

            <View style={styles.controlNote}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={C.primary}
              />
              <Text style={styles.controlText}>
                The assistant only prepares the recommendation. You still
                review the request and choose the worker.
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: C.background },
  header: {
    minHeight: 64,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.surface,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiHeaderIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
  },
  headerTitle: { fontSize: 13.5, fontWeight: '900', color: C.text },
  headerSubtitle: { marginTop: 1, fontSize: 8.5, color: C.muted },
  content: { padding: 15, paddingBottom: 45, gap: 12 },
  assistantBubble: {
    maxWidth: '92%',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderRadius: 17,
    borderBottomLeftRadius: 5,
    backgroundColor: C.primarySoft,
  },
  botIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  assistantText: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: 16,
    color: C.text,
  },
  inputCard: {
    padding: 13,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 17,
    backgroundColor: C.surface,
  },
  input: {
    minHeight: 104,
    padding: 12,
    borderRadius: 13,
    backgroundColor: C.background,
    color: C.text,
    fontSize: 11,
    lineHeight: 17,
  },
  inputActions: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  photoButton: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#d0ccff',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  photoButtonActive: {
    borderColor: '#bfe5ce',
    backgroundColor: C.greenSoft,
  },
  photoText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: C.primary,
  },
  photoTextActive: { color: C.green },
  analyzeButton: {
    flex: 1.3,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 12,
    backgroundColor: C.orange,
  },
  analyzeText: { fontSize: 9.5, fontWeight: '900', color: '#ffffff' },
  analysisCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#d7d3ff',
    borderRadius: 18,
    backgroundColor: '#ffffff',
  },
  analysisTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  analysisIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primarySoft,
  },
  analysisEyebrow: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: C.muted,
  },
  analysisTitle: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '900',
    color: C.primary,
  },
  confidenceBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: C.greenSoft,
  },
  confidenceText: { fontSize: 9, fontWeight: '900', color: C.green },
  analysisSummary: {
    marginTop: 11,
    fontSize: 10.5,
    lineHeight: 16,
    color: C.muted,
  },
  photoEvidence: {
    marginTop: 10,
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 11,
    backgroundColor: C.background,
  },
  photoEvidenceText: { flex: 1, fontSize: 9, color: C.muted },
  sectionHeader: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: C.text },
  sectionSubtitle: { marginTop: 2, fontSize: 9, color: C.muted },
  workerCard: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    backgroundColor: '#ffffff',
  },
  workerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
  },
  workerInitial: { fontSize: 16, fontWeight: '900', color: '#ffffff' },
  workerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  workerName: { fontSize: 11.5, fontWeight: '900', color: C.text },
  bestBadge: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: C.greenSoft,
  },
  bestText: { fontSize: 6.5, fontWeight: '900', color: C.green },
  workerProfession: { marginTop: 1, fontSize: 9, color: C.primary },
  workerMeta: { marginTop: 3, fontSize: 8.5, color: C.muted },
  workerPriceWrap: { alignItems: 'flex-end' },
  workerPrice: { fontSize: 11.5, fontWeight: '900', color: C.orange },
  workerPriceSub: { marginTop: 1, fontSize: 7.5, color: C.muted },
  publishButton: {
    minHeight: 49,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  publishText: { fontSize: 10.5, fontWeight: '900', color: '#ffffff' },
  controlNote: {
    padding: 13,
    flexDirection: 'row',
    gap: 8,
    borderRadius: 14,
    backgroundColor: C.primarySoft,
  },
  controlText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 15,
    color: C.muted,
  },
});
