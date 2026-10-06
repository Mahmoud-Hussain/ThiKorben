import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const C = {
  primary: '#15157d',
  primarySoft: '#eeedff',
  orange: '#F7941D',
  orangeSoft: '#fff4e7',
  green: '#178c4f',
  greenSoft: '#eaf8f0',
  red: '#c93c37',
  redSoft: '#fff0ef',
  text: '#171722',
  muted: '#656575',
  border: '#e4e1eb',
  bg: '#f7f6fb',
  card: '#ffffff',
  purple: '#6d5bd0',
};

const STEPS = [
  'Problem',
  'AI Analysis',
  'Service Request',
  'Matching',
  'Outreach',
  'Private Chat',
  'Materials',
  'Approval',
  'Tracking',
  'Skill Passport',
] as const;

const WORKERS = [
  {
    name: 'Rahim Uddin',
    role: 'Plumbing Specialist',
    distance: '1.2 km',
    rating: '4.9',
    jobs: '128 jobs',
    availability: 'Available now',
    reason: 'Best fit: nearby, available, and strong leak-repair history.',
  },
  {
    name: 'Kamal Hossain',
    role: 'Plumber',
    distance: '2.4 km',
    rating: '4.8',
    jobs: '96 jobs',
    availability: 'Available in 20 min',
    reason: 'Good fit: strong sanitary and basin repair experience.',
  },
  {
    name: 'Shuvo Mia',
    role: 'Home Service Technician',
    distance: '3.1 km',
    rating: '4.7',
    jobs: '74 jobs',
    availability: 'Available now',
    reason: 'Backup fit: broader home-maintenance experience.',
  },
];

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionIcon}>{icon}</View>
      <View style={styles.flex}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function Pill({
  text,
  tone = 'default',
}: {
  text: string;
  tone?: 'default' | 'green' | 'orange' | 'red' | 'purple';
}) {
  const toneStyle =
    tone === 'green'
      ? styles.pillGreen
      : tone === 'orange'
        ? styles.pillOrange
        : tone === 'red'
          ? styles.pillRed
          : tone === 'purple'
            ? styles.pillPurple
            : styles.pillDefault;

  return (
    <View style={[styles.pill, toneStyle]}>
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, accent && styles.metricValueAccent]}>
        {value}
      </Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export default function ShowcaseScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [problem, setProblem] = useState(
    'Kitchen sink er niche pani leak hocche. Pipe naki hose bujhtesi na. Chobi dilam.',
  );
  const [source, setSource] = useState<'text' | 'voice' | 'photo'>('photo');
  const [selectedWorker, setSelectedWorker] = useState(0);
  const [materialApproved, setMaterialApproved] = useState(false);

  const nextLabel = useMemo(() => {
    if (step === 0) return 'Analyze with ThiKorben AI';
    if (step === 1) return 'Create Structured Request';
    if (step === 2) return 'Find Suitable Workers';
    if (step === 3) return 'Contact Selected Workers';
    if (step === 4) return 'Open Private Job Chat';
    if (step === 5) return 'Review Material Request';
    if (step === 6) return materialApproved ? 'Continue to Cost Summary' : 'Approve Materials';
    if (step === 7) return 'Track Service';
    if (step === 8) return 'Complete Job';
    return 'Restart Journey';
  }, [materialApproved, step]);

  const handleNext = () => {
    if (step === 6 && !materialApproved) {
      setMaterialApproved(true);
      return;
    }

    if (step === STEPS.length - 1) {
      setStep(0);
      setMaterialApproved(false);
      return;
    }

    setStep(current => current + 1);
  };

  const renderProblem = () => (
    <>
      <SectionTitle
        icon={<Ionicons name="sparkles" size={22} color={C.primary} />}
        title="Tell ThiKorben what happened"
        subtitle="The customer does not need to know the service category or technical name."
      />

      <View style={styles.card}>
        <Text style={styles.label}>Describe the problem in Bangla, Banglish, or English</Text>
        <TextInput
          value={problem}
          onChangeText={setProblem}
          multiline
          style={styles.problemInput}
          placeholder="Describe the issue..."
          placeholderTextColor={C.muted}
        />

        <View style={styles.sourceRow}>
          <TouchableOpacity
            style={[styles.sourceButton, source === 'text' && styles.sourceButtonActive]}
            onPress={() => setSource('text')}
          >
            <Ionicons name="text" size={18} color={source === 'text' ? '#fff' : C.primary} />
            <Text style={[styles.sourceText, source === 'text' && styles.sourceTextActive]}>
              Text
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sourceButton, source === 'voice' && styles.sourceButtonActive]}
            onPress={() => setSource('voice')}
          >
            <Ionicons name="mic" size={18} color={source === 'voice' ? '#fff' : C.primary} />
            <Text style={[styles.sourceText, source === 'voice' && styles.sourceTextActive]}>
              Voice
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sourceButton, source === 'photo' && styles.sourceButtonActive]}
            onPress={() => setSource('photo')}
          >
            <Ionicons name="camera" size={18} color={source === 'photo' ? '#fff' : C.primary} />
            <Text style={[styles.sourceText, source === 'photo' && styles.sourceTextActive]}>
              Photo
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.photoMock}>
          <View style={styles.photoPipe}>
            <MaterialCommunityIcons name="pipe-leak" size={56} color={C.primary} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.photoTitle}>IMG_2048.jpg</Text>
            <Text style={styles.photoSubtitle}>Customer evidence attached • Kitchen sink</Text>
          </View>
          <MaterialIcons name="check-circle" size={22} color={C.green} />
        </View>
      </View>

      <View style={styles.principleCard}>
        <Ionicons name="shield-checkmark" size={20} color={C.primary} />
        <Text style={styles.principleText}>
          AI can analyze automatically. Publishing, worker outreach, address sharing, materials, and payment stay under human control.
        </Text>
      </View>
    </>
  );

  const renderAnalysis = () => (
    <>
      <SectionTitle
        icon={<Ionicons name="analytics" size={22} color={C.primary} />}
        title="AI understands the service need"
        subtitle="ThiKorben converts unstructured evidence into a safe, explainable service hypothesis."
      />

      <View style={styles.analysisHero}>
        <View style={styles.analysisIcon}>
          <MaterialCommunityIcons name="pipe-leak" size={34} color="#fff" />
        </View>
        <View style={styles.flex}>
          <Text style={styles.eyebrow}>LIKELY SERVICE</Text>
          <Text style={styles.analysisTitle}>Plumbing • Kitchen Leak</Text>
          <Text style={styles.analysisSubtitle}>
            Possible flexible hose or sink joint leakage.
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <Metric label="AI confidence" value="87%" accent />
        <Metric label="Urgency" value="Urgent" />
        <Metric label="Safety risk" value="Low" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeading}>AI reasoning summary</Text>
        <View style={styles.reasonRow}>
          <MaterialIcons name="image-search" size={20} color={C.primary} />
          <Text style={styles.reasonText}>Visible moisture appears near the basin connection.</Text>
        </View>
        <View style={styles.reasonRow}>
          <MaterialIcons name="translate" size={20} color={C.primary} />
          <Text style={styles.reasonText}>Banglish description mentions continuous leaking below the sink.</Text>
        </View>
        <View style={styles.reasonRow}>
          <MaterialIcons name="rule" size={20} color={C.primary} />
          <Text style={styles.reasonText}>No fire, gas, electrical spark, or structural hazard detected.</Text>
        </View>
      </View>

      <View style={styles.followup}>
        <Text style={styles.followupLabel}>Smart follow-up</Text>
        <Text style={styles.followupQuestion}>
          “Leak ta ki tap use korlei beshi hoy, naki shobshomoy hocche?”
        </Text>
        <Text style={styles.followupAnswer}>Customer: “Shobshomoy halka leak hocche.”</Text>
      </View>
    </>
  );

  const renderRequest = () => (
    <>
      <SectionTitle
        icon={<MaterialIcons name="assignment" size={22} color={C.primary} />}
        title="Structured service request"
        subtitle="AI drafts the job. The customer reviews before publishing."
      />

      <View style={styles.card}>
        <View style={styles.requestHeader}>
          <View style={styles.requestIcon}>
            <MaterialCommunityIcons name="pipe-wrench" size={24} color={C.primary} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.requestTitle}>Kitchen sink leakage repair</Text>
            <Text style={styles.requestMeta}>Plumbing • Dhanmondi • Today</Text>
          </View>
          <Pill text="Draft" tone="orange" />
        </View>

        <Text style={styles.cardHeading}>Problem summary</Text>
        <Text style={styles.bodyText}>
          Water is continuously leaking beneath the kitchen sink. Photo evidence suggests a flexible hose or pipe-joint issue.
        </Text>

        <View style={styles.chips}>
          <Pill text="Photo attached" />
          <Pill text="Urgent" tone="red" />
          <Pill text="Budget ৳500–900" tone="green" />
          <Pill text="Exact address private" tone="purple" />
        </View>
      </View>

      <View style={styles.permissionCard}>
        <MaterialIcons name="verified-user" size={22} color={C.green} />
        <View style={styles.flex}>
          <Text style={styles.permissionTitle}>Customer permission checkpoint</Text>
          <Text style={styles.permissionText}>
            Publish this request to eligible nearby plumbing workers. Exact address stays hidden until a worker is accepted.
          </Text>
        </View>
        <MaterialIcons name="check-circle" size={24} color={C.green} />
      </View>
    </>
  );

  const renderMatching = () => (
    <>
      <SectionTitle
        icon={<MaterialIcons name="location-searching" size={22} color={C.primary} />}
        title="Explainable worker matching"
        subtitle="Ranking combines relevance, distance, availability, reputation, and service history."
      />

      <View style={styles.chips}>
        <Pill text="Plumbing match" tone="purple" />
        <Pill text="Within 4 km" />
        <Pill text="Available today" tone="green" />
        <Pill text="Strong ratings" tone="orange" />
      </View>

      {WORKERS.map((worker, index) => {
        const active = selectedWorker === index;

        return (
          <TouchableOpacity
            key={worker.name}
            style={[styles.workerCard, active && styles.workerCardActive]}
            onPress={() => setSelectedWorker(index)}
            activeOpacity={0.85}
          >
            <View style={styles.workerAvatar}>
              <Text style={styles.workerInitial}>{worker.name.charAt(0)}</Text>
            </View>
            <View style={styles.flex}>
              <View style={styles.workerTopRow}>
                <Text style={styles.workerName}>{worker.name}</Text>
                {index === 0 ? <Pill text="Best match" tone="green" /> : null}
              </View>
              <Text style={styles.workerRole}>{worker.role}</Text>
              <Text style={styles.workerMeta}>
                ★ {worker.rating} • {worker.jobs} • {worker.distance}
              </Text>
              <Text style={styles.workerAvailability}>{worker.availability}</Text>
              <Text style={styles.workerReason}>{worker.reason}</Text>
            </View>
            <MaterialIcons
              name={active ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={23}
              color={active ? C.primary : C.border}
            />
          </TouchableOpacity>
        );
      })}
    </>
  );

  const renderOutreach = () => (
    <>
      <SectionTitle
        icon={<Ionicons name="send" size={22} color={C.primary} />}
        title="Permission-based worker outreach"
        subtitle="ThiKorben can contact suitable workers, but only after the customer approves outreach."
      />

      <View style={styles.card}>
        <Text style={styles.cardHeading}>Worker invitation status</Text>

        <View style={styles.timelineRow}>
          <View style={[styles.timelineDot, { backgroundColor: C.green }]} />
          <View style={styles.flex}>
            <Text style={styles.timelineTitle}>Rahim Uddin</Text>
            <Text style={styles.timelineSub}>Accepted • 15 seconds ago</Text>
          </View>
          <Pill text="Accepted" tone="green" />
        </View>

        <View style={styles.timelineRow}>
          <View style={[styles.timelineDot, { backgroundColor: C.orange }]} />
          <View style={styles.flex}>
            <Text style={styles.timelineTitle}>Kamal Hossain</Text>
            <Text style={styles.timelineSub}>Invitation delivered</Text>
          </View>
          <Pill text="Pending" tone="orange" />
        </View>

        <View style={styles.timelineRow}>
          <View style={[styles.timelineDot, { backgroundColor: C.border }]} />
          <View style={styles.flex}>
            <Text style={styles.timelineTitle}>Shuvo Mia</Text>
            <Text style={styles.timelineSub}>Invitation delivered</Text>
          </View>
          <Pill text="Pending" />
        </View>
      </View>

      <View style={styles.successBanner}>
        <MaterialIcons name="handshake" size={24} color={C.green} />
        <View style={styles.flex}>
          <Text style={styles.successTitle}>Rahim accepted the service request</Text>
          <Text style={styles.successText}>
            A private job channel is now available. Exact service location can be shared with customer consent.
          </Text>
        </View>
      </View>
    </>
  );

  const renderChat = () => (
    <>
      <SectionTitle
        icon={<Ionicons name="chatbubbles" size={22} color={C.primary} />}
        title="Private job chat with context memory"
        subtitle="The conversation stays attached to the job so AI can assist without inventing context."
      />

      <View style={styles.chatCard}>
        <View style={styles.chatHeader}>
          <View style={styles.workerAvatarSmall}>
            <Text style={styles.workerInitialSmall}>R</Text>
          </View>
          <View className="flex">
            <Text style={styles.chatName}>Rahim Uddin</Text>
            <Text style={styles.chatStatus}>Accepted worker • Plumbing</Text>
          </View>
        </View>

        <View style={styles.bubbleCustomer}>
          <Text style={styles.bubbleTextDark}>
            Bhai, sink er niche thekei leak hocche. Chobi ta dekhechen?
          </Text>
        </View>

        <View style={styles.bubbleWorker}>
          <Text style={styles.bubbleTextLight}>
            Ji. Chobi dekhe mone hocche flexible hose ba joint change korte hote pare. Ami check kore confirm korbo.
          </Text>
        </View>

        <View style={styles.aiInline}>
          <Ionicons name="sparkles" size={17} color={C.primary} />
          <Text style={styles.aiInlineText}>
            AI context: possible hose/joint issue • worker has not yet confirmed exact material.
          </Text>
        </View>

        <View style={styles.bubbleWorker}>
          <Text style={styles.bubbleTextLight}>
            Likely 1 ta flexible hose ar PTFE seal tape lagbe.
          </Text>
        </View>
      </View>
    </>
  );

  const renderMaterials = () => (
    <>
      <SectionTitle
        icon={<MaterialCommunityIcons name="shopping-outline" size={22} color={C.primary} />}
        title="Context-aware material recommendation"
        subtitle="Catalog retrieval comes first. AI only ranks and explains real items."
      />

      <View style={styles.productCard}>
        <View style={styles.productIcon}>
          <MaterialCommunityIcons name="pipe-wrench" size={28} color={C.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.productName}>Braided Flexible Basin Hose • 18 inch</Text>
          <Text style={styles.productMeta}>ThiKorben catalog • In stock</Text>
          <Text style={styles.productReason}>
            Supported by current job context: worker mentioned flexible hose after inspecting leak evidence.
          </Text>
        </View>
        <Text style={styles.productPrice}>৳350</Text>
      </View>

      <View style={styles.productCard}>
        <View style={styles.productIcon}>
          <MaterialCommunityIcons name="tape-measure" size={28} color={C.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.productName}>PTFE Thread Seal Tape</Text>
          <Text style={styles.productMeta}>ThiKorben catalog • In stock</Text>
          <Text style={styles.productReason}>
            Supported by context: commonly used to seal threaded plumbing connections.
          </Text>
        </View>
        <Text style={styles.productPrice}>৳60</Text>
      </View>

      <View style={styles.warningCard}>
        <MaterialIcons name="help-outline" size={23} color={C.orange} />
        <View style={styles.flex}>
          <Text style={styles.warningTitle}>Adjustable wrench not auto-approved</Text>
          <Text style={styles.warningText}>
            The item was not clearly supported by current context. Worker justification is required before customer approval.
          </Text>
          <Text style={styles.workerJustification}>
            Worker: “Amar wrench ta damaged, joint safely open korar jonno replacement lagbe.”
          </Text>
        </View>
      </View>
    </>
  );

  const renderApproval = () => (
    <>
      <SectionTitle
        icon={<MaterialIcons name="fact-check" size={22} color={C.primary} />}
        title="Customer approval and transparent cost"
        subtitle="Workers cannot silently add products to the customer cart."
      />

      <View style={styles.card}>
        <Text style={styles.cardHeading}>Approved service materials</Text>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Flexible basin hose</Text>
          <Text style={styles.costValue}>৳350</Text>
        </View>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>PTFE seal tape</Text>
          <Text style={styles.costValue}>৳60</Text>
        </View>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Service charge</Text>
          <Text style={styles.costValue}>৳500</Text>
        </View>
        <View style={styles.costDivider} />
        <View style={styles.costRow}>
          <Text style={styles.totalLabel}>Estimated total</Text>
          <Text style={styles.totalValue}>৳910</Text>
        </View>
      </View>

      <View style={styles.approvalGrid}>
        <View style={styles.approvalCard}>
          <MaterialIcons name="check-circle" size={28} color={C.green} />
          <Text style={styles.approvalTitle}>Customer approved</Text>
          <Text style={styles.approvalText}>2 materials • ৳410</Text>
        </View>
        <View style={styles.approvalCard}>
          <MaterialIcons name="lock" size={28} color={C.primary} />
          <Text style={styles.approvalTitle}>Atomic confirmation</Text>
          <Text style={styles.approvalText}>Approval recorded with job context</Text>
        </View>
      </View>
    </>
  );

  const renderTracking = () => (
    <>
      <SectionTitle
        icon={<Ionicons name="navigate" size={22} color={C.primary} />}
        title="Service progress and worker tracking"
        subtitle="Customer sees clear status without losing control of private location information."
      />

      <View style={styles.mapMock}>
        <View style={styles.mapRoadOne} />
        <View style={styles.mapRoadTwo} />
        <View style={styles.customerPin}>
          <Ionicons name="home" size={18} color="#fff" />
        </View>
        <View style={styles.workerPin}>
          <MaterialCommunityIcons name="motorbike" size={19} color="#fff" />
        </View>
        <View style={styles.mapEta}>
          <Text style={styles.mapEtaTitle}>Rahim is on the way</Text>
          <Text style={styles.mapEtaSub}>ETA 12 min • 1.2 km away</Text>
        </View>
      </View>

      <View style={styles.card}>
        {[
          ['Request accepted', '09:42 AM', true],
          ['Worker en route', '09:49 AM', true],
          ['Arrived at service location', 'Expected 10:01 AM', false],
          ['Work completed', 'Pending', false],
        ].map(([title, time, done], index) => (
          <View key={String(title)} style={styles.statusRow}>
            <View style={[styles.statusNode, done ? styles.statusDone : styles.statusPending]}>
              {done ? <Ionicons name="checkmark" size={13} color="#fff" /> : <Text style={styles.statusIndex}>{index + 1}</Text>}
            </View>
            <View style={styles.flex}>
              <Text style={styles.statusTitle}>{title}</Text>
              <Text style={styles.statusTime}>{time}</Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );

  const renderPassport = () => (
    <>
      <SectionTitle
        icon={<MaterialCommunityIcons name="badge-account" size={22} color={C.primary} />}
        title="Job completion builds a Worker Skill Passport"
        subtitle="Verified work outcomes can become portable evidence of skill and reliability."
      />

      <View style={styles.passportHero}>
        <View style={styles.passportAvatar}>
          <Text style={styles.passportInitial}>R</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.passportName}>Rahim Uddin</Text>
          <Text style={styles.passportRole}>Plumbing Specialist</Text>
          <View style={styles.chips}>
            <Pill text="Identity verified" tone="green" />
            <Pill text="12 completed jobs" tone="purple" />
          </View>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <Metric label="Customer rating" value="4.9 ★" accent />
        <Metric label="Completion rate" value="98%" />
        <Metric label="On-time" value="96%" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeading}>Evidence-backed skills</Text>
        {[
          'Kitchen sink leak diagnosis',
          'Flexible hose replacement',
          'Thread seal and joint repair',
          'Customer communication',
        ].map(skill => (
          <View key={skill} style={styles.skillRow}>
            <MaterialIcons name="verified" size={20} color={C.green} />
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>

      <View style={styles.finalCard}>
        <Text style={styles.finalEyebrow}>THIKORBEN</Text>
        <Text style={styles.finalTitle}>From everyday problems to trusted skilled work.</Text>
        <Text style={styles.finalSubtitle}>AI assists. People decide.</Text>
      </View>
    </>
  );

  const renderStep = () => {
    if (step === 0) return renderProblem();
    if (step === 1) return renderAnalysis();
    if (step === 2) return renderRequest();
    if (step === 3) return renderMatching();
    if (step === 4) return renderOutreach();
    if (step === 5) return renderChat();
    if (step === 6) return renderMaterials();
    if (step === 7) return renderApproval();
    if (step === 8) return renderTracking();
    return renderPassport();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>

        <View style={styles.headerBrand}>
          <View style={styles.logo}>
            <MaterialIcons name="handyman" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.brandName}>ThiKorben</Text>
            <Text style={styles.brandSub}>Complete AI Service Journey</Text>
          </View>
        </View>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>{step + 1}/{STEPS.length}</Text>
        </View>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stepNames}
        >
          {STEPS.map((name, index) => (
            <TouchableOpacity
              key={name}
              onPress={() => setStep(index)}
              style={[styles.stepName, index === step && styles.stepNameActive]}
            >
              <Text style={[styles.stepNameText, index === step && styles.stepNameTextActive]}>
                {name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.secondaryButton, step === 0 && styles.secondaryButtonDisabled]}
          disabled={step === 0}
          onPress={() => setStep(current => Math.max(0, current - 1))}
        >
          <Ionicons name="arrow-back" size={18} color={step === 0 ? '#aaa7b5' : C.primary} />
          <Text style={[styles.secondaryButtonText, step === 0 && styles.secondaryButtonTextDisabled]}>
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>{nextLabel}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  header: {
    minHeight: 66,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bg,
  },
  headerBrand: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
  },
  brandName: { fontSize: 16, fontWeight: '900', color: C.primary },
  brandSub: { fontSize: 11, color: C.muted },
  stepBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: C.primarySoft,
  },
  stepBadgeText: { fontSize: 12, fontWeight: '800', color: C.primary },
  progressWrap: {
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: '#fff',
  },
  progressTrack: {
    height: 4,
    marginHorizontal: 18,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: C.border,
  },
  progressFill: { height: 4, backgroundColor: C.orange },
  stepNames: { paddingHorizontal: 14, paddingVertical: 10, gap: 6 },
  stepName: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  stepNameActive: { backgroundColor: C.primarySoft },
  stepNameText: { fontSize: 10, fontWeight: '700', color: C.muted },
  stepNameTextActive: { color: C.primary },
  scroll: { flex: 1, backgroundColor: C.bg },
  content: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 36,
    gap: 14,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 2 },
  sectionIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primarySoft,
  },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: C.text },
  sectionSubtitle: { marginTop: 3, fontSize: 13, lineHeight: 19, color: C.muted },
  card: {
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    backgroundColor: C.card,
    gap: 12,
  },
  label: { fontSize: 12, fontWeight: '800', color: C.text },
  problemInput: {
    minHeight: 105,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    backgroundColor: C.bg,
    fontSize: 14,
    lineHeight: 21,
    color: C.text,
    textAlignVertical: 'top',
  },
  sourceRow: { flexDirection: 'row', gap: 8 },
  sourceButton: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.primary,
    borderRadius: 13,
    backgroundColor: '#fff',
  },
  sourceButtonActive: { backgroundColor: C.primary },
  sourceText: { fontSize: 12, fontWeight: '800', color: C.primary },
  sourceTextActive: { color: '#fff' },
  photoMock: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    backgroundColor: C.primarySoft,
  },
  photoPipe: {
    width: 64,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  photoTitle: { fontSize: 13, fontWeight: '800', color: C.text },
  photoSubtitle: { marginTop: 2, fontSize: 11, color: C.muted },
  principleCard: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 16,
    backgroundColor: C.primarySoft,
  },
  principleText: { flex: 1, fontSize: 12, lineHeight: 18, color: '#49476c' },
  analysisHero: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    backgroundColor: C.primary,
  },
  analysisIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1, color: '#c9c8ff' },
  analysisTitle: { marginTop: 3, fontSize: 20, fontWeight: '900', color: '#fff' },
  analysisSubtitle: { marginTop: 3, fontSize: 12, color: '#d9d8ff' },
  metricsRow: { flexDirection: 'row', gap: 9 },
  metric: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  metricValue: { fontSize: 18, fontWeight: '900', color: C.text },
  metricValueAccent: { color: C.orange },
  metricLabel: { marginTop: 3, fontSize: 10, fontWeight: '700', color: C.muted },
  cardHeading: { fontSize: 14, fontWeight: '900', color: C.text },
  reasonRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  reasonText: { flex: 1, fontSize: 12, lineHeight: 18, color: C.muted },
  followup: {
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: C.orange,
    borderRadius: 14,
    backgroundColor: C.orangeSoft,
  },
  followupLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8, color: '#9a5b10' },
  followupQuestion: { marginTop: 6, fontSize: 14, fontWeight: '800', color: C.text },
  followupAnswer: { marginTop: 8, fontSize: 12, color: C.muted },
  requestHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  requestIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primarySoft,
  },
  requestTitle: { fontSize: 16, fontWeight: '900', color: C.text },
  requestMeta: { marginTop: 2, fontSize: 11, color: C.muted },
  bodyText: { fontSize: 12, lineHeight: 19, color: C.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  pill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  pillDefault: { backgroundColor: C.bg },
  pillGreen: { backgroundColor: C.greenSoft },
  pillOrange: { backgroundColor: C.orangeSoft },
  pillRed: { backgroundColor: C.redSoft },
  pillPurple: { backgroundColor: C.primarySoft },
  pillText: { fontSize: 10, fontWeight: '800', color: C.text },
  permissionCard: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#bfe6cf',
    borderRadius: 18,
    backgroundColor: C.greenSoft,
  },
  permissionTitle: { fontSize: 13, fontWeight: '900', color: C.text },
  permissionText: { marginTop: 3, fontSize: 11, lineHeight: 17, color: C.muted },
  workerCard: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  workerCardActive: { borderColor: C.primary, backgroundColor: '#faf9ff' },
  workerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
  },
  workerInitial: { fontSize: 20, fontWeight: '900', color: '#fff' },
  workerTopRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  workerName: { fontSize: 14, fontWeight: '900', color: C.text },
  workerRole: { marginTop: 2, fontSize: 11, color: C.muted },
  workerMeta: { marginTop: 5, fontSize: 11, fontWeight: '700', color: C.text },
  workerAvailability: { marginTop: 3, fontSize: 10, fontWeight: '800', color: C.green },
  workerReason: { marginTop: 5, fontSize: 10, lineHeight: 15, color: C.muted },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
  timelineTitle: { fontSize: 13, fontWeight: '800', color: C.text },
  timelineSub: { marginTop: 2, fontSize: 10, color: C.muted },
  successBanner: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 18,
    backgroundColor: C.greenSoft,
  },
  successTitle: { fontSize: 13, fontWeight: '900', color: C.green },
  successText: { marginTop: 4, fontSize: 11, lineHeight: 17, color: C.muted },
  chatCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    backgroundColor: '#fff',
    gap: 12,
  },
  chatHeader: {
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  workerAvatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
  },
  workerInitialSmall: { fontSize: 15, fontWeight: '900', color: '#fff' },
  chatName: { fontSize: 13, fontWeight: '900', color: C.text },
  chatStatus: { fontSize: 10, color: C.green },
  bubbleCustomer: {
    maxWidth: '82%',
    alignSelf: 'flex-end',
    padding: 12,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    backgroundColor: C.primarySoft,
  },
  bubbleWorker: {
    maxWidth: '82%',
    alignSelf: 'flex-start',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    backgroundColor: C.primary,
  },
  bubbleTextDark: { fontSize: 12, lineHeight: 18, color: C.text },
  bubbleTextLight: { fontSize: 12, lineHeight: 18, color: '#fff' },
  aiInline: {
    padding: 10,
    flexDirection: 'row',
    gap: 8,
    borderRadius: 12,
    backgroundColor: C.bg,
  },
  aiInlineText: { flex: 1, fontSize: 10, lineHeight: 15, color: C.muted },
  productCard: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primarySoft,
  },
  productName: { fontSize: 13, fontWeight: '900', color: C.text },
  productMeta: { marginTop: 2, fontSize: 10, color: C.green },
  productReason: { marginTop: 5, fontSize: 10, lineHeight: 15, color: C.muted },
  productPrice: { fontSize: 14, fontWeight: '900', color: C.primary },
  warningCard: {
    padding: 15,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: '#f1d2a8',
    borderRadius: 18,
    backgroundColor: C.orangeSoft,
  },
  warningTitle: { fontSize: 13, fontWeight: '900', color: C.text },
  warningText: { marginTop: 3, fontSize: 10, lineHeight: 15, color: C.muted },
  workerJustification: { marginTop: 8, fontSize: 11, fontWeight: '700', color: '#765018' },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  costLabel: { fontSize: 12, color: C.muted },
  costValue: { fontSize: 12, fontWeight: '800', color: C.text },
  costDivider: { height: 1, backgroundColor: C.border },
  totalLabel: { fontSize: 14, fontWeight: '900', color: C.text },
  totalValue: { fontSize: 17, fontWeight: '900', color: C.orange },
  approvalGrid: { flexDirection: 'row', gap: 10 },
  approvalCard: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  approvalTitle: { marginTop: 8, fontSize: 12, fontWeight: '900', color: C.text },
  approvalText: { marginTop: 3, fontSize: 10, lineHeight: 15, color: C.muted },
  mapMock: {
    height: 235,
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: '#ebeaf0',
    position: 'relative',
  },
  mapRoadOne: {
    position: 'absolute',
    width: '140%',
    height: 22,
    top: 94,
    left: -50,
    transform: [{ rotate: '-12deg' }],
    backgroundColor: '#fff',
  },
  mapRoadTwo: {
    position: 'absolute',
    width: 24,
    height: '130%',
    left: '62%',
    top: -20,
    transform: [{ rotate: '16deg' }],
    backgroundColor: '#fff',
  },
  customerPin: {
    position: 'absolute',
    right: 60,
    bottom: 55,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
  },
  workerPin: {
    position: 'absolute',
    left: 82,
    top: 68,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.orange,
  },
  mapEta: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  mapEtaTitle: { fontSize: 13, fontWeight: '900', color: C.text },
  mapEtaSub: { marginTop: 2, fontSize: 10, color: C.muted },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDone: { backgroundColor: C.green },
  statusPending: { backgroundColor: C.bg },
  statusIndex: { fontSize: 10, fontWeight: '900', color: C.muted },
  statusTitle: { fontSize: 12, fontWeight: '800', color: C.text },
  statusTime: { marginTop: 2, fontSize: 10, color: C.muted },
  passportHero: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    backgroundColor: C.primary,
  },
  passportAvatar: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  passportInitial: { fontSize: 25, fontWeight: '900', color: C.primary },
  passportName: { fontSize: 19, fontWeight: '900', color: '#fff' },
  passportRole: { marginTop: 2, fontSize: 11, color: '#d6d5ff' },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  skillText: { fontSize: 12, color: C.text },
  finalCard: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: C.orange,
  },
  finalEyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 2, color: '#fff6e9' },
  finalTitle: {
    marginTop: 7,
    maxWidth: 420,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '900',
    textAlign: 'center',
    color: '#fff',
  },
  finalSubtitle: { marginTop: 8, fontSize: 13, fontWeight: '800', color: '#fff8ef' },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: '#fff',
  },
  secondaryButton: {
    minWidth: 94,
    minHeight: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
  },
  secondaryButtonDisabled: { backgroundColor: '#f6f5f8' },
  secondaryButtonText: { fontSize: 12, fontWeight: '800', color: C.primary },
  secondaryButtonTextDisabled: { color: '#aaa7b5' },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 15,
    backgroundColor: C.primary,
  },
  primaryButtonText: { fontSize: 12, fontWeight: '900', color: '#fff' },
});
