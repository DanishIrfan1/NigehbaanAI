import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Avatar, Chip, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSignal } from '../src/context/SignalContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { signalId, status, isPolling, degradedMode } = useSignal();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar.Icon size={72} icon="shield-account" style={styles.avatar} />
          <Text style={styles.name}>CIRO Operator</Text>
          <Text style={styles.role}>Crisis Intelligence & Response Orchestrator</Text>
        </View>

        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text style={styles.cardTitle}>Session</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Active signal</Text>
              <Text style={styles.value} numberOfLines={1}>
                {signalId ?? 'None'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Pipeline status</Text>
              <Chip compact style={styles.chip}>
                {isPolling ? 'RUNNING' : status?.status ?? 'IDLE'}
              </Chip>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Degraded mode</Text>
              <Chip compact style={degradedMode ? styles.warnChip : styles.okChip}>
                {degradedMode ? 'YES' : 'NO'}
              </Chip>
            </View>
            {status?.completed_at ? (
              <View style={styles.row}>
                <Text style={styles.label}>Completed</Text>
                <Text style={styles.valueSmall}>{status.completed_at}</Text>
              </View>
            ) : null}
          </Card.Content>
        </Card>

        <Button mode="contained" icon="view-dashboard" onPress={() => router.push('/')} style={{ marginTop: 8 }}>
          Open Dashboard
        </Button>
        <Button mode="outlined" icon="cog" onPress={() => router.push('/settings')} style={{ marginTop: 8 }}>
          Settings
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: { backgroundColor: '#1e3a5f' },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 12 },
  role: { color: '#888', fontSize: 13, textAlign: 'center', marginTop: 4 },
  card: { backgroundColor: '#1e1e1e' },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  label: { color: '#888', fontSize: 13 },
  value: { color: '#64b5f6', fontSize: 12, fontFamily: 'monospace', maxWidth: '55%' },
  valueSmall: { color: '#aaa', fontSize: 11, maxWidth: '55%' },
  chip: { backgroundColor: '#333' },
  warnChip: { backgroundColor: '#5d4037' },
  okChip: { backgroundColor: '#1b5e20' },
});
