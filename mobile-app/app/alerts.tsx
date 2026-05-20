import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Chip, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSignal } from '../src/context/SignalContext';

const AUDIENCE_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  public: 'bullhorn',
  emergency_services: 'ambulance',
  hospital: 'hospital-building',
  utility: 'flash',
  utility_company: 'flash',
  transport: 'bus',
  transport_authority: 'bus',
  media: 'newspaper',
  media_command_center: 'newspaper',
};

export default function AlertsScreen() {
  const router = useRouter();
  const { notifications, notificationCount, isPolling, signalId, refresh } = useSignal();

  const entries = Object.entries(notifications);

  if (!signalId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No alerts yet. Run crisis analysis first.</Text>
          <Button mode="contained" onPress={() => router.push('/')}>
            Dashboard
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Stakeholder Alerts</Text>
          <Chip icon="bell" style={styles.countChip}>
            {notificationCount || entries.length}
          </Chip>
        </View>

        {isPolling && entries.length === 0 ? (
          <ActivityIndicator animating style={{ marginVertical: 24 }} />
        ) : null}

        {entries.length === 0 && !isPolling ? (
          <Text style={styles.emptyText}>Notifications will appear after the notifier agent runs.</Text>
        ) : null}

        {entries.map(([audience, message]) => (
          <Card key={audience} style={styles.card} mode="elevated">
            <Card.Title
              title={audience.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              left={() => (
                <MaterialCommunityIcons
                  name={AUDIENCE_ICONS[audience] ?? 'email'}
                  size={24}
                  color="#64b5f6"
                />
              )}
            />
            <Card.Content>
              <Text style={styles.message}>{message}</Text>
              <Text style={styles.simTag}>[SIMULATED] delivery</Text>
            </Card.Content>
          </Card>
        ))}

        <Button mode="text" onPress={() => refresh()} style={{ marginTop: 16 }}>
          Refresh alerts
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 16, paddingBottom: 40 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { color: '#aaa', textAlign: 'center', marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  countChip: { backgroundColor: '#1e3a5f' },
  card: { marginBottom: 12, backgroundColor: '#1e1e1e' },
  message: { color: '#ddd', fontSize: 14, lineHeight: 22 },
  simTag: { color: '#888', fontSize: 11, marginTop: 8, fontStyle: 'italic' },
});
