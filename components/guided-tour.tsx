import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type TourStep = {
  title: string;
  body: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

const TOURS: Record<string, TourStep[]> = {
  '/customer-dashboard': [
    {
      title: 'Your customer home',
      body: 'Start from your problem, find professionals, follow active work, and open the shop from the same mobile experience.',
      icon: 'home-outline',
    },
    {
      title: 'Choose how ThiKorben helps',
      body: 'You can post the problem yourself or ask the AI assistant to guide you from the problem to the right worker.',
      icon: 'sparkles-outline',
    },
    {
      title: 'Human decisions stay with you',
      body: 'You choose the worker, approve requested materials, and confirm the service flow.',
      icon: 'shield-checkmark-outline',
    },
  ],
  '/worker-dashboard': [
    {
      title: 'Your worker workspace',
      body: 'Find nearby service requests, respond with a proposal, and manage accepted work.',
      icon: 'construct-outline',
    },
    {
      title: 'Private work conversation',
      body: 'After a customer accepts your proposal, the job gets a private customer-worker chat.',
      icon: 'chatbubbles-outline',
    },
    {
      title: 'Request materials safely',
      body: 'Mention or request a product, but the customer must approve it before it can enter the customer purchase flow.',
      icon: 'cart-outline',
    },
  ],
  '/community': [
    {
      title: 'Community marketplace',
      body: 'Customers publish service needs. Workers browse the same shared Supabase-backed feed.',
      icon: 'people-outline',
    },
    {
      title: 'Open a request',
      body: 'Read the full job, ask a public question, or submit a worker proposal when you are in worker mode.',
      icon: 'document-text-outline',
    },
  ],
  '/job-board': [
    {
      title: 'One service request',
      body: 'This page keeps the problem, budget, public discussion, and worker proposals together.',
      icon: 'briefcase-outline',
    },
    {
      title: 'Customer selects the worker',
      body: 'Only the customer can accept a proposal. Acceptance opens the private job workflow.',
      icon: 'checkmark-circle-outline',
    },
  ],
  '/job-chat': [
    {
      title: 'Private job chat',
      body: 'Only the accepted customer and worker can access this conversation.',
      icon: 'lock-closed-outline',
    },
    {
      title: 'Product-aware conversation',
      body: 'When a repair product is mentioned, ThiKorben can surface matching shop items without inventing products.',
      icon: 'sparkles-outline',
    },
    {
      title: 'Worker requests need approval',
      body: 'A worker can recommend a material, but the customer decides whether it is approved.',
      icon: 'shield-checkmark-outline',
    },
  ],
  '/shop': [
    {
      title: 'ThiKorben Shop',
      body: 'Browse repair materials already connected to service conversations and cart actions.',
      icon: 'bag-handle-outline',
    },
    {
      title: 'Open product details',
      body: 'Review price, stock, warranty, and product information before adding an item.',
      icon: 'information-circle-outline',
    },
  ],
  '/cart': [
    {
      title: 'Your cart',
      body: 'Customer-approved products can be reviewed here before checkout.',
      icon: 'cart-outline',
    },
  ],
  '/service-checkout': [
    {
      title: 'Service checkout',
      body: 'Review service and approved material costs before confirmation.',
      icon: 'card-outline',
    },
  ],
  '/track-worker': [
    {
      title: 'Track service progress',
      body: 'Follow the assigned worker and the service lifecycle from accepted to completed.',
      icon: 'navigate-outline',
    },
  ],
  '/worker-skill-passport': [
    {
      title: 'Worker Skill Passport',
      body: 'Completed ThiKorben jobs become evidence of real service experience.',
      icon: 'ribbon-outline',
    },
  ],
};

export function GuidedTour({ enabled = true }: { enabled?: boolean }) {
  const pathname = usePathname();
  const steps = useMemo(() => TOURS[pathname] ?? [], [pathname]);

  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let active = true;

    if (!enabled || steps.length === 0) {
      return () => {
        active = false;
      };
    }

    const key = `thikorben:tour:${pathname}:v1`;

    void AsyncStorage.getItem(key).then(value => {
      if (active && value !== 'seen') {
        setIndex(0);
        setVisible(true);
      }
    });

    return () => {
      active = false;
    };
  }, [enabled, pathname, steps.length]);

  if (!enabled || steps.length === 0) {
    return null;
  }

  const current = steps[index];

  const close = () => {
    setVisible(false);
    void AsyncStorage.setItem(`thikorben:tour:${pathname}:v1`, 'seen');
  };

  const next = () => {
    if (index >= steps.length - 1) {
      close();
      return;
    }

    setIndex(value => value + 1);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Show page tour"
        onPress={() => {
          setIndex(0);
          setVisible(true);
        }}
        style={styles.demoButton}
      >
        <Ionicons name="play-circle" size={17} color="#ffffff" />
        <Text style={styles.demoText}>Demo</Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <View style={styles.topRow}>
              <View style={styles.icon}>
                <Ionicons name={current.icon} size={24} color="#15157d" />
              </View>

              <Text style={styles.counter}>
                {index + 1}/{steps.length}
              </Text>
            </View>

            <Text style={styles.title}>{current.title}</Text>
            <Text style={styles.body}>{current.body}</Text>

            <View style={styles.dots}>
              {steps.map((_, stepIndex) => (
                <View
                  key={stepIndex}
                  style={[
                    styles.dot,
                    stepIndex === index && styles.dotActive,
                  ]}
                />
              ))}
            </View>

            <View style={styles.actions}>
              <Pressable onPress={close} style={styles.skipButton}>
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>

              <Pressable onPress={next} style={styles.nextButton}>
                <Text style={styles.nextText}>
                  {index === steps.length - 1 ? 'Done' : 'Next'}
                </Text>
                <Ionicons
                  name={
                    index === steps.length - 1
                      ? 'checkmark'
                      : 'arrow-forward'
                  }
                  size={16}
                  color="#ffffff"
                />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  demoButton: {
    position: 'absolute',
    right: 14,
    bottom: 82,
    zIndex: 500,
    minHeight: 38,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    backgroundColor: '#F7941D',
  },
  demoText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  backdrop: {
    flex: 1,
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 19, 31, 0.48)',
  },
  card: {
    width: '100%',
    maxWidth: 390,
    padding: 20,
    borderRadius: 22,
    backgroundColor: '#ffffff',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eeedff',
  },
  counter: {
    fontSize: 10,
    fontWeight: '800',
    color: '#777683',
  },
  title: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '900',
    color: '#1b1b21',
  },
  body: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
    color: '#5b5a68',
  },
  dots: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#dedbe7',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#15157d',
  },
  actions: {
    marginTop: 22,
    flexDirection: 'row',
    gap: 9,
  },
  skipButton: {
    flex: 1,
    minHeight: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#f3f1f7',
  },
  skipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5b5a68',
  },
  nextButton: {
    flex: 1.5,
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 13,
    backgroundColor: '#15157d',
  },
  nextText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
  },
});
