import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>ThiKorben</Text>
          <Text style={styles.appTagline}>{'Connecting local households & skilled workers'}</Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          style={styles.profileBadge}>
          <MaterialCommunityIcons name="account-circle-outline" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <View style={styles.welcomeBanner}>
          <MaterialCommunityIcons name="briefcase-check-outline" size={32} color="#ffffff" />
          <View style={styles.welcomeTextCol}>
            <Text style={styles.welcomeTitle}>New Job Request Available!</Text>
            <Text style={styles.welcomeSub}>
              A customer nearby requested plumbing service.
            </Text>
          </View>
        </View>

        {/* Featured Job Card */}
        <Text style={styles.sectionTitle}>Active Job Request</Text>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/job-details')}
          style={styles.jobCard}>
          <View style={styles.jobCardHeader}>
            <View style={styles.jobIconBox}>
              <MaterialCommunityIcons name="pipe-wrench" size={24} color={Colors.primary} />
            </View>

            <View style={styles.jobMetaInfo}>
              <Text style={styles.jobCardTitle}>Kitchen sink pipe leaking</Text>
              <Text style={styles.customerNameText}>Customer: Nusrat Ahmed</Text>
            </View>

            <View style={styles.urgentBadge}>
              <Text style={styles.urgentBadgeText}>Urgent</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.jobCardFooter}>
            <View style={styles.footerInfoItem}>
              <MaterialIcons name="location-on" size={16} color={Colors.outline} />
              <Text style={styles.footerInfoText}>1.2 km away</Text>
            </View>

            <View style={styles.footerInfoItem}>
              <MaterialIcons name="payments" size={18} color={Colors.secondary} />
              <Text style={styles.priceTagText}>৳500</Text>
            </View>

            <View style={styles.openDetailBtn}>
              <Text style={styles.openDetailBtnText}>View Details</Text>
              <MaterialIcons name="arrow-forward" size={16} color="#ffffff" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Features Overview */}
        <Text style={styles.sectionTitle}>Platform Features</Text>
        <View style={styles.featuresGrid}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: '#e1e0ff' }]}>
              <MaterialIcons name="location-searching" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.featureTitle}>Nearby Discovery</Text>
            <Text style={styles.featureDesc}>Find service jobs around your location</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: '#ffdcbf' }]}>
              <MaterialCommunityIcons name="handshake-outline" size={22} color={Colors.secondary} />
            </View>
            <Text style={styles.featureTitle}>Price Negotiation</Text>
            <Text style={styles.featureDesc}>Propose rates directly with customers</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: '#e2f0d9' }]}>
              <MaterialIcons name="map" size={22} color="#2e7d32" />
            </View>
            <Text style={styles.featureTitle}>Live OSM Maps</Text>
            <Text style={styles.featureDesc}>Interactive Leaflet navigation</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: '#fce4ec' }]}>
              <MaterialIcons name="timeline" size={22} color="#c2185b" />
            </View>
            <Text style={styles.featureTitle}>Job Status Tracking</Text>
            <Text style={styles.featureDesc}>Track progress from acceptance to finish</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  appTagline: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  profileBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },

  // Welcome Banner
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryContainer,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  welcomeTextCol: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  welcomeSub: {
    fontSize: 13,
    color: Colors.onPrimaryContainer,
    marginTop: 2,
  },

  // Section Header
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
    marginTop: 4,
  },

  // Job Card
  jobCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  jobCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  jobIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobMetaInfo: {
    flex: 1,
  },
  jobCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  customerNameText: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  urgentBadge: {
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
  },
  urgentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSecondaryContainer,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    marginVertical: 12,
  },
  jobCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerInfoText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  priceTagText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.secondary,
  },
  openDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentOrange,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  openDetailBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Features Grid
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    width: '48%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
  },
  featureIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 3,
    lineHeight: 16,
  },
});
