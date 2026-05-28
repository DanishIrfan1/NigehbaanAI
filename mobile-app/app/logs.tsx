import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Button } from 'react-native-paper';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSignal } from '../src/context/SignalContext';
import type { UILogEntry } from '../src/api/types';

const LiveIndicator = () => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.2, { duration: 600, easing: Easing.linear }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.liveContainer}>
      <Animated.View style={[styles.liveDot, animatedStyle]} />
      <Text style={styles.liveText}>LIVE</Text>
    </View>
  );
};

const AgentLogItem = ({ item }: { item: UILogEntry }) => (
  <Animated.View entering={FadeInDown.duration(400)} style={styles.logItemContainer}>
    <Text style={styles.logTimestamp}>[{item.timestamp}]</Text>
    <Text style={[styles.logAgent, { color: '#64b5f6' }]}>{item.agent}:</Text>
    <Text style={styles.logMessage}>{item.message}</Text>
  </Animated.View>
);

export default function LogsScreen() {
  const router = useRouter();
  const { traces, isPolling, signalId, refresh } = useSignal();
  const [visibleLogs, setVisibleLogs] = useState<UILogEntry[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const streamIndexRef = useRef(0);

  useEffect(() => {
    streamIndexRef.current = 0;
    setVisibleLogs([]);
  }, [signalId]);

  useEffect(() => {
    if (traces.length === 0) return;

    if (!isPolling) {
      setVisibleLogs(traces);
      return;
    }

    const intervalId = setInterval(() => {
      const idx = streamIndexRef.current;
      if (idx < traces.length) {
        setVisibleLogs((prev) => {
          const next = traces[idx];
          if (prev.some((p) => p.id === next.id)) return prev;
          return [...prev, next];
        });
        streamIndexRef.current = idx + 1;
      }
    }, 800);

    return () => clearInterval(intervalId);
  }, [traces, isPolling]);

  useEffect(() => {
    if (!isPolling && traces.length > 0) {
      setVisibleLogs(traces);
    }
  }, [isPolling, traces]);

  const isDone = !isPolling && visibleLogs.length > 0;

  if (!signalId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No active signal. Run analysis from Dashboard.</Text>
          <Button mode="contained" onPress={() => router.push('/')}>
            Dashboard
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Trace</Text>
        {isPolling ? <LiveIndicator /> : null}
        <Button mode="text" compact onPress={() => refresh()}>
          Refresh
        </Button>
      </View>

      {visibleLogs.length === 0 && isPolling ? (
        <ActivityIndicator animating style={{ marginTop: 32 }} />
      ) : null}

      <FlatList
        ref={flatListRef}
        data={visibleLogs}
        renderItem={({ item }) => <AgentLogItem item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Waiting for agent traces...</Text>
        }
      />

      {isDone && (
        <Animated.View entering={FadeIn.duration(800)} style={styles.footer}>
          <TouchableOpacity style={styles.proceedButton} onPress={() => router.push('/map')}>
            <Text style={styles.proceedButtonText}>Proceed to Map</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', fontFamily: 'monospace', flex: 1 },
  liveContainer: { flexDirection: 'row', alignItems: 'center' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff4444', marginRight: 6 },
  liveText: { color: '#ff4444', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  listContent: { padding: 16, paddingBottom: 40 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { color: '#8892B0', textAlign: 'center', margin: 24, fontFamily: 'monospace' },
  logItemContainer: { flexDirection: 'row', marginBottom: 12, flexWrap: 'wrap' },
  logTimestamp: { color: '#8892B0', fontFamily: 'monospace', marginRight: 8, fontSize: 14, lineHeight: 20 },
  logAgent: { fontWeight: 'bold', fontFamily: 'monospace', marginRight: 8, fontSize: 14, lineHeight: 20 },
  logMessage: { color: '#CCD6F6', fontFamily: 'monospace', flex: 1, fontSize: 14, lineHeight: 20 },
  footer: { padding: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: '#1E293B' },
  proceedButton: {
    backgroundColor: '#f44336',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});
