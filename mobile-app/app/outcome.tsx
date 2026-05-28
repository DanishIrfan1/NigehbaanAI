import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, ActivityIndicator, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSignal } from '../src/context/SignalContext';
import type { UIOutcomeStat } from '../src/api/types';

const AnimatedNumber = ({
  endValue,
  suffix = '',
  duration = 1500,
}: {
  endValue: number;
  suffix?: string;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * endValue));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [endValue, duration]);

  return (
    <Text style={styles.afterValue}>
      {count}
      {suffix}
    </Text>
  );
};

const StatCard = ({
  label,
  beforeStr,
  afterNum,
  afterSuffix,
  afterStrOverride,
  changeStr,
  delay,
}: UIOutcomeStat & { delay: number }) => (
  <Animated.View entering={FadeInDown.delay(delay).duration(500)}>
    <Card style={styles.statCard} mode="outlined">
      <Card.Content>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Text style={styles.beforeLabel}>Before</Text>
            <Text style={styles.beforeValue}>{beforeStr}</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={24} color="#aaaaaa" style={{ marginHorizontal: 12 }} />
          <View style={styles.statCol}>
            <Text style={styles.afterLabel}>After</Text>
            {afterStrOverride ? (
              <Text style={styles.afterValue}>{afterStrOverride}</Text>
            ) : (
              <AnimatedNumber endValue={afterNum ?? 0} suffix={afterSuffix} />
            )}
          </View>
          {changeStr ? (
            <View style={styles.changeBadge}>
              <Text style={styles.changeText}>{changeStr}</Text>
            </View>
          ) : null}
        </View>
      </Card.Content>
    </Card>
  </Animated.View>
);

export default function OutcomeScreen() {
  const { outcomeStats, isPolling, signalId, refresh } = useSignal();

  if (!signalId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No outcome data. Run analysis first.</Text>
          <Button mode="contained" onPress={() => router.push('/')}>
            Dashboard
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (outcomeStats.length === 0 && isPolling) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator animating size="large" style={{ marginTop: 48 }} />
        <Text style={styles.emptyText}>Computing impact assessment...</Text>
      </SafeAreaView>
    );
  }

  const managed = outcomeStats.some(
    (s) => s.label === 'Crisis Status' && s.afterStrOverride === 'MANAGED'
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Response Outcome</Text>
        <Text style={styles.subtitle}>Impact analysis of automated actions</Text>

        <View style={styles.statsContainer}>
          {outcomeStats.map((stat, idx) => (
            <StatCard key={stat.label} {...stat} delay={100 + idx * 200} />
          ))}
        </View>

        {outcomeStats.length === 0 ? (
          <Text style={styles.emptyText}>Outcome not ready yet.</Text>
        ) : null}

        {managed && (
          <Animated.View entering={ZoomIn.delay(600).duration(600)} style={styles.bannerContainer}>
            <MaterialCommunityIcons name="shield-check" size={48} color="#4caf50" />
            <Text style={styles.bannerText}>CRISIS MANAGED</Text>
            <Text style={styles.bannerSub}>System returning to normal operations</Text>
          </Animated.View>
        )}

        <Button mode="text" onPress={() => refresh()} style={{ marginTop: 16 }}>
          Refresh outcome
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 16, paddingBottom: 60 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { color: '#aaa', textAlign: 'center', marginTop: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginTop: 8 },
  subtitle: { fontSize: 14, color: '#aaaaaa', marginBottom: 24, marginTop: 4 },
  statsContainer: { gap: 12 },
  statCard: { backgroundColor: '#1e1e1e', borderColor: '#333333', borderRadius: 12 },
  statLabel: { color: '#dddddd', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  statCol: { alignItems: 'flex-start', minWidth: 60 },
  beforeLabel: { fontSize: 12, color: '#888888', marginBottom: 4 },
  afterLabel: { fontSize: 12, color: '#888888', marginBottom: 4 },
  beforeValue: { fontSize: 18, fontWeight: 'bold', color: '#ff4444' },
  afterValue: { fontSize: 18, fontWeight: 'bold', color: '#4caf50' },
  changeBadge: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeText: { color: '#4caf50', fontWeight: 'bold', fontSize: 14 },
  bannerContainer: {
    marginTop: 48,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 2,
    borderColor: '#4caf50',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  bannerText: { color: '#4caf50', fontSize: 28, fontWeight: '900', letterSpacing: 2, marginTop: 12 },
  bannerSub: { color: '#888888', fontSize: 14, marginTop: 8 },
});
