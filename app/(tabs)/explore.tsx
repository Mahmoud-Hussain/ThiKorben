import React from 'react';
import { StyleSheet, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Collapsible } from '@/components/ui/collapsible';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThiKorbenTheme } from '@/constants/theme';

export default function ExploreScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#15157d', dark: '#10104a' }}
      headerImage={
        <View style={styles.headerIconContainer}>
          <MaterialIcons
            name="explore"
            size={160}
            color="rgba(255, 255, 255, 0.25)"
            style={styles.headerIcon}
          />
        </View>
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore ThiKorben</ThemedText>
      </ThemedView>

      <ThemedText style={styles.introText}>
        Discover local household services and skilled service workers near you.
      </ThemedText>

      <Collapsible title="🔧 Service Categories">
        <ThemedText style={styles.sectionBody}>
          ThiKorben connects households with verified local professionals across multiple trades:
        </ThemedText>
        <ThemedText style={styles.listItem}>• <ThemedText type="defaultSemiBold">Plumbing:</ThemedText> Pipe leak fixes, tap repair, drainage, tank cleaning.</ThemedText>
        <ThemedText style={styles.listItem}>• <ThemedText type="defaultSemiBold">Electrical Work:</ThemedText> Wiring, appliance setup, switches, short circuit repair.</ThemedText>
        <ThemedText style={styles.listItem}>• <ThemedText type="defaultSemiBold">Carpentry:</ThemedText> Furniture repair, door fitting, custom woodwork, repairs.</ThemedText>
        <ThemedText style={styles.listItem}>• <ThemedText type="defaultSemiBold">Cleaning:</ThemedText> Home deep cleaning, kitchen, bathroom, and office cleaning.</ThemedText>
      </Collapsible>

      <Collapsible title="🛡️ Trust & Verification">
        <ThemedText style={styles.sectionBody}>
          Every worker on ThiKorben completes profile verification, including identity check, skill badges, and real community ratings to ensure safety and quality work.
        </ThemedText>
      </Collapsible>

      <Collapsible title="📍 Location-Based Service Discovery">
        <ThemedText style={styles.sectionBody}>
          Find nearby workers on an interactive map, view estimated arrival times, and connect directly with professionals operating in your neighborhood.
        </ThemedText>
      </Collapsible>

      <Collapsible title="💼 Worker Earnings & Opportunities">
        <ThemedText style={styles.sectionBody}>
          For service workers, ThiKorben provides a simple platform to set custom rates, manage schedule availability, and build a local reputation.
        </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerIconContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    bottom: -10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  introText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
    color: ThiKorbenTheme.onSurfaceVariant,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 22,
    marginLeft: 8,
    marginBottom: 4,
  },
});

