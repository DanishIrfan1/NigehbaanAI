import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';

type AgentType = 'Detector' | 'Analyzer' | 'Planner' | 'Executor';

interface LogEntry {
  id: string;
  timestamp: string;
  agent: AgentType;
  message: string;
}

const ALL_LOGS: LogEntry[] = [
  { id: '1', timestamp: '14:02:10', agent: 'Detector', message: 'Ingesting 45 signals from Twitter and PMD.' },
  { id: '2', timestamp: '14:02:11', agent: 'Detector', message: 'High confidence flooding detected in Sector G-10.' },
  { id: '3', timestamp: '14:02:13', agent: 'Analyzer', message: 'Analyzing impact: Multiple vehicles stranded.' },
  { id: '4', timestamp: '14:02:14', agent: 'Analyzer', message: 'Traffic blocked on Main Double Road.' },
  { id: '5', timestamp: '14:02:16', agent: 'Planner', message: 'Generating evacuation routes avoiding Main Double Road.' },
  { id: '6', timestamp: '14:02:17', agent: 'Planner', message: 'Drafting public safety alerts for G-10 residents.' },
  { id: '7', timestamp: '14:02:19', agent: 'Executor', message: 'Dispatching emergency response units to Sector G-10.' },
  { id: '8', timestamp: '14:02:20', agent: 'Executor', message: 'Alerts successfully broadcasted to nearby users.' },
];

const LiveIndicator = () => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.2, { duration: 600, easing: Easing.linear }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.liveContainer}>
      <Animated.View style={[styles.liveDot, animatedStyle]} />
      <Text style={styles.liveText}>LIVE</Text>
    </View>
  );
};

const AgentLogItem = ({ item }: { item: LogEntry }) => {
  const getAgentColor = (agent: AgentType) => {
    switch (agent) {
      case 'Detector': return '#64b5f6'; // Light Blue
      case 'Analyzer': return '#ffeb3b'; // Yellow
      case 'Planner': return '#ffb74d'; // Orange
      case 'Executor': return '#81c784'; // Green
      default: return '#ffffff';
    }
  };

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.logItemContainer}>
      <Text style={styles.logTimestamp}>[{item.timestamp}]</Text>
      <Text style={[styles.logAgent, { color: getAgentColor(item.agent) }]}>
        {item.agent}:
      </Text>
      <Text style={styles.logMessage}>{item.message}</Text>
    </Animated.View>
  );
};

export default function LogsScreen() {
  const router = useRouter();
  const [visibleLogs, setVisibleLogs] = useState<LogEntry[]>([]);
  const [isDone, setIsDone] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    let currentIndex = 0;
    
    // Show first log immediately
    if (ALL_LOGS.length > 0) {
      setVisibleLogs([ALL_LOGS[0]]);
      currentIndex++;
    }

    const intervalId = setInterval(() => {
      if (currentIndex < ALL_LOGS.length) {
        setVisibleLogs((prev) => [...prev, ALL_LOGS[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(intervalId);
        setIsDone(true);
      }
    }, 1500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Trace</Text>
        {!isDone && <LiveIndicator />}
      </View>

      <FlatList
        ref={flatListRef}
        data={visibleLogs}
        renderItem={({ item }) => <AgentLogItem item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {isDone && (
        <Animated.View entering={FadeIn.duration(800)} style={styles.footer}>
          <TouchableOpacity 
            style={styles.proceedButton} 
            onPress={() => router.push('/map')}
          >
            <Text style={styles.proceedButtonText}>Proceed to Map</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0A0E1A', // Dark terminal-style background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
    marginRight: 6,
  },
  liveText: {
    color: '#ff4444',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  logItemContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  logTimestamp: {
    color: '#8892B0',
    fontFamily: 'monospace',
    marginRight: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  logAgent: {
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginRight: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  logMessage: {
    color: '#CCD6F6',
    fontFamily: 'monospace',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  proceedButton: {
    backgroundColor: '#f44336', // Primary Red
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
