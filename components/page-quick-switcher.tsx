import React, { useState } from 'react';
import {
  Modal,
  Pressable,
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

  const pages = [
    {
      title: 'Customer Dashboard',
      subtitle: 'Browse services, nearby map & workers',
      route: '/',
      icon: 'home-outline' as const,
      color: '#15157d',
      bg: '#edeaff',
    },
    {
      title: 'Worker Dashboard',
      subtitle: 'Active jobs, earnings & toggle availability',
      route: '/worker-dashboard',
      icon: 'hammer-wrench' as const,
      color: '#fd9923',
      bg: '#fff4e5',
    },
    {
      title: 'Worker Profile',
      subtitle: 'Rahim Plumber • 4.9 ★ • Rates & reviews',
      route: '/worker-profile',
      icon: 'account-badge' as const,
      color: '#059669',
      bg: '#e6f7f0',
    },
    {
      title: 'Job Details',
      subtitle: 'Customer request, map & status workflow',
      route: '/job-details',
      icon: 'clipboard-text-clock' as const,
      color: '#6366f1',
      bg: '#eef2ff',
    },
    {
      title: 'Track Worker',
      subtitle: 'Live map tracking with 12 min ETA',
      route: '/track-worker',
      icon: 'map-marker-path' as const,
      color: '#ea580c',
      bg: '#fff2eb',
    },
    {
      title: 'Welcome & Language',
      subtitle: 'Onboarding & English / Bengali switch',
      route: '/welcome',
      icon: 'sparkles' as const,
      color: '#7c3aed',
      bg: '#f5f0ff',
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
        <MaterialIcons name="grid-view" size={20} color="#ffffff" />
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
                <Text style={styles.modalSubtitle}>Jump to any page instantly</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsOpen(false)}
                activeOpacity={0.7}>
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.listContainer}>
              {pages.map((p) => {
                const isActive =
                  pathname === p.route ||
                  (p.route === '/' && pathname === '/customer-dashboard');

                return (
                  <TouchableOpacity
                    key={p.route}
                    style={[styles.pageItem, isActive && styles.pageItemActive]}
                    onPress={() => navigateTo(p.route)}
                    activeOpacity={0.75}>
                    <View style={[styles.iconBox, { backgroundColor: p.bg }]}>
                      {p.icon === 'home-outline' ? (
                        <Ionicons name="home-outline" size={20} color={p.color} />
                      ) : (
                        <MaterialCommunityIcons
                          name={p.icon as any}
                          size={20}
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
                    <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                  </TouchableOpacity>
                );
              })}
            </View>
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
    inset: 0,
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
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
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
    paddingBottom: 14,
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
  listContainer: {
    marginTop: 12,
    gap: 8,
  },
  pageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#f0f0f4',
  },
  pageItemActive: {
    backgroundColor: '#f0efff',
    borderColor: '#d0ccff',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
    fontSize: 14,
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
});
