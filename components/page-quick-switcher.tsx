import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';

export function PageQuickSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const sections = [
    {
      category: 'Core Service Flow',
      items: [
        {
          title: 'Welcome & Role Select',
          subtitle: 'Bilingual onboarding & entry portal',
          route: '/',
          icon: 'sparkles',
          iconType: 'mci',
          color: '#7c3aed',
          bg: '#f5f0ff',
        },
        {
          title: 'Customer Dashboard',
          subtitle: 'Browse services, nearby map & top workers',
          route: '/customer-dashboard',
          icon: 'home-outline',
          iconType: 'ion',
          color: '#15157d',
          bg: '#edeaff',
        },
        {
          title: 'Worker Dashboard',
          subtitle: 'Active jobs, earnings & toggle availability',
          route: '/worker-dashboard',
          icon: 'hammer-wrench',
          iconType: 'mci',
          color: '#fd9923',
          bg: '#fff4e5',
        },
        {
          title: 'Worker Profile',
          subtitle: 'Rahim Plumber • 4.9 ★ • Rates & reviews',
          route: '/worker-profile',
          icon: 'account-badge',
          iconType: 'mci',
          color: '#059669',
          bg: '#e6f7f0',
        },
        {
          title: 'Job Details & Negotiation',
          subtitle: 'Customer request, map & status workflow',
          route: '/job-details',
          icon: 'clipboard-text-clock',
          iconType: 'mci',
          color: '#6366f1',
          bg: '#eef2ff',
        },
        {
          title: 'Track Worker',
          subtitle: 'Live map tracking with 12 min ETA',
          route: '/track-worker',
          icon: 'map-marker-path',
          iconType: 'mci',
          color: '#ea580c',
          bg: '#fff2eb',
        },
      ],
    },
    {
      category: 'Community, Marketplace & Chat',
      items: [
        {
          title: 'Community Feed',
          subtitle: 'Local posts, advice & neighborhood buzz',
          route: '/community',
          icon: 'forum-outline',
          iconType: 'mci',
          color: '#0284c7',
          bg: '#e0f2fe',
        },
        {
          title: 'Job Board & Proposals',
          subtitle: 'Post requests, worker bids & comments',
          route: '/job-board',
          icon: 'briefcase-search-outline',
          iconType: 'mci',
          color: '#d97706',
          bg: '#fef3c7',
        },
        {
          title: 'Private Job Chat',
          subtitle: 'Messaging & smart product recommendations',
          route: '/job-chat',
          icon: 'chat-processing-outline',
          iconType: 'mci',
          color: '#8b5cf6',
          bg: '#ede9fe',
        },
        {
          title: 'Service Checkout',
          subtitle: 'Cost breakdown, materials & bill summary',
          route: '/service-checkout',
          icon: 'receipt-text-outline',
          iconType: 'mci',
          color: '#10b981',
          bg: '#ecfdf5',
        },
      ],
    },
    {
      category: 'ThiKorben Shop',
      items: [
        {
          title: 'Shop Catalog',
          subtitle: 'Sanitary, electrical & hardware supplies',
          route: '/shop',
          icon: 'store-outline',
          iconType: 'mci',
          color: '#e11d48',
          bg: '#ffe4e6',
        },
        {
          title: 'Product Details',
          subtitle: 'Specs, reviews & direct add to cart',
          route: '/product-details',
          icon: 'cube-outline',
          iconType: 'mci',
          color: '#9333ea',
          bg: '#faf5ff',
        },
        {
          title: 'Cart & Delivery',
          subtitle: 'Order review & express delivery checkout',
          route: '/cart',
          icon: 'cart-outline',
          iconType: 'ion',
          color: '#f59e0b',
          bg: '#fef3c7',
        },
      ],
    },
    {
      category: 'Auth & Profile Setup',
      items: [
        {
          title: 'Login',
          subtitle: 'Phone OTP sign-in flow',
          route: '/auth/login',
          icon: 'login',
          iconType: 'mci',
          color: '#15157d',
          bg: '#edeaff',
        },
        {
          title: 'Signup',
          subtitle: 'New user registration',
          route: '/auth/signup',
          icon: 'account-plus-outline',
          iconType: 'mci',
          color: '#fd9923',
          bg: '#fff4e5',
        },
        {
          title: 'Customer Profile Setup',
          subtitle: 'Saved locations & household info',
          route: '/customer-profile-setup',
          icon: 'account-cog-outline',
          iconType: 'mci',
          color: '#059669',
          bg: '#e6f7f0',
        },
        {
          title: 'Worker Profile Setup',
          subtitle: 'Trade skills, rate & service radius',
          route: '/worker-profile-setup',
          icon: 'shield-account-outline',
          iconType: 'mci',
          color: '#4f46e5',
          bg: '#eef2ff',
        },
      ],
    },
  ];

  const navigateTo = (route: string) => {
    setIsOpen(false);
    // @ts-ignore
    router.push(route);
  };

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.85}
        accessibilityLabel="Open Quick Page Switcher">
        <View style={styles.fabGlow} />
        <MaterialIcons name="grid-view" size={18} color="#ffffff" />
        <Text style={styles.fabText}>Pages</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={isOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setIsOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>ThiKorben Navigation</Text>
                <Text style={styles.modalSubtitle}>Explore all {sections.reduce((a, c) => a + c.items.length, 0)} screens</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsOpen(false)}
                activeOpacity={0.7}>
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}>
              {sections.map((sec) => (
                <View key={sec.category} style={styles.sectionBlock}>
                  <Text style={styles.sectionTitle}>{sec.category}</Text>
                  <View style={styles.sectionItems}>
                    {sec.items.map((p) => {
                      const isActive =
                        pathname === p.route ||
                        (p.route === '/' && (pathname === '/' || pathname === ''));

                      return (
                        <TouchableOpacity
                          key={p.route}
                          style={[styles.pageItem, isActive && styles.pageItemActive]}
                          onPress={() => navigateTo(p.route)}
                          activeOpacity={0.75}>
                          <View style={[styles.iconBox, { backgroundColor: p.bg }]}>
                            {p.iconType === 'ion' ? (
                              <Ionicons name={p.icon as any} size={18} color={p.color} />
                            ) : (
                              <MaterialCommunityIcons
                                name={p.icon as any}
                                size={18}
                                color={p.color}
                              />
                            )}
                          </View>
                          <View style={styles.pageTextCol}>
                            <View style={styles.titleRow}>
                              <Text style={[styles.pageTitle, isActive && styles.pageTitleActive]}>
                                {p.title}
                              </Text>
                              {isActive && (
                                <View style={styles.currentBadge}>
                                  <Text style={styles.currentBadgeText}>Current</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.pageSubtitle}>{p.subtitle}</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 84,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#15157d',
    shadowColor: '#15157d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  fabText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#15157d',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollList: {
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 12,
  },
  sectionBlock: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginLeft: 4,
  },
  sectionItems: {
    gap: 6,
  },
  pageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 9,
    borderRadius: 13,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#f0f0f4',
  },
  pageItemActive: {
    backgroundColor: '#f0efff',
    borderColor: '#d0ccff',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pageTextCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  pageTitleActive: {
    color: '#15157d',
  },
  pageSubtitle: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 1,
  },
  currentBadge: {
    backgroundColor: '#15157d',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  currentBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
});
