import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

// Animated Counter Component
const AnimatedNumber = ({ endValue, suffix = '', duration = 1500 }: { endValue: number, suffix?: string, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * endValue));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [endValue, duration]);

  return <Text style={styles.afterValue}>{count}{suffix}</Text>;
};

const StatCard = ({ label, beforeStr, afterNum, afterSuffix, afterStrOverride, changeStr, delay }: any) => {
  return (
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
                <AnimatedNumber endValue={afterNum} suffix={afterSuffix} />
              )}
            </View>
            {changeStr && (
              <View style={styles.changeBadge}>
                <Text style={styles.changeText}>{changeStr}</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

export default function OutcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Response Outcome</Text>
        <Text style={styles.subtitle}>Impact analysis of automated actions</Text>

        <View style={styles.statsContainer}>
          <StatCard 
            label="Traffic Congestion" 
            beforeStr="87%" 
            afterNum={23} 
            afterSuffix="%" 
            changeStr="-64%" 
            delay={100} 
          />
          <StatCard 
            label="Response Time" 
            beforeStr="N/A" 
            afterNum={8} 
            afterSuffix=" min" 
            delay={300} 
          />
          <StatCard
            label="Citizens Alerted"
            beforeStr="0"
            afterNum={4200}
            delay={500}
          />
          <StatCard
            label="Ambulance ETA"
            beforeStr="25 min"
            afterNum={12}
            afterSuffix=" min"
            changeStr="-13 min"
            delay={600}
          />
          <StatCard
            label="Crisis Status"
            beforeStr="ACTIVE"
            afterStrOverride="MANAGED"
            delay={800}
          />
        </View>

        <Animated.View entering={ZoomIn.delay(1000).duration(600)} style={styles.bannerContainer}>
          <MaterialCommunityIcons name="shield-check" size={48} color="#4caf50" />
          <Text style={styles.bannerText}>CRISIS MANAGED</Text>
          <Text style={styles.bannerSub}>System returning to normal operations</Text>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#121212' 
  },
  content: { 
    padding: 16, 
    paddingBottom: 60 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#ffffff',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaaaaa',
    marginBottom: 24,
    marginTop: 4,
  },
  statsContainer: {
    gap: 12,
  },
  statCard: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333333',
    borderRadius: 12,
  },
  statLabel: {
    color: '#dddddd',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  statCol: {
    alignItems: 'flex-start',
    minWidth: 60,
  },
  beforeLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  afterLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  beforeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4444', // Red for before
  },
  afterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50', // Green for after
  },
  changeBadge: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeText: {
    color: '#4caf50',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bannerContainer: {
    marginTop: 48,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 2,
    borderColor: '#4caf50',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    color: '#4caf50',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 12,
  },
  bannerSub: {
    color: '#888888',
    fontSize: 14,
    marginTop: 8,
  }
});
