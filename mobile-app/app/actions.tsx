import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Button, Card } from 'react-native-paper';
import ActionCard from '../components/ActionCard';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSignal } from '../src/context/SignalContext';

function LiveActionCard({
  title,
  description,
  icon,
  status,
  delayMs,
  onDone,
}: {
  title: string;
  description: string;
  icon: string;
  status: string;
  delayMs: number;
  onDone?: () => void;
}) {
  if (status === 'DONE' || status === 'FAILED') {
    return (
      <Card style={styles.doneCard} mode="contained">
        <Card.Title
          title={title}
          subtitle={description}
          left={() => (
            <Text style={{ fontSize: 20 }}>{status === 'DONE' ? '✅' : '❌'}</Text>
          )}
          right={() => <Text style={styles.statusChip}>{status}</Text>}
        />
      </Card>
    );
  }

  return (
    <ActionCard
      title={title}
      description={description}
      icon={icon}
      delayMs={delayMs}
      onDone={onDone}
    />
  );
}

export default function ActionsScreen() {
  const router = useRouter();
  const { actions, rawActions, isPolling, signalId, refresh } = useSignal();
  const [completedCount, setCompletedCount] = React.useState(0);

  const allDone = actions.length > 0 && actions.every((a) => a.status === 'DONE' || a.status === 'FAILED');

  if (!signalId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No actions yet. Submit a signal first.</Text>
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
        <Text style={styles.headerTitle}>Response Execution</Text>
        <Text style={styles.subtitle}>
          {isPolling ? 'Automated actions running...' : 'Pipeline actions from backend'}
        </Text>

        {rawActions?.plan_rationale ? (
          <Card style={styles.rationaleCard} mode="outlined">
            <Card.Content>
              <Text style={styles.rationaleTitle}>Plan Rationale</Text>
              <Text style={styles.rationaleText}>{rawActions.plan_rationale}</Text>
              {rawActions.multi_crisis_tradeoffs ? (
                <Text style={[styles.rationaleText, { marginTop: 8, color: '#ff9800' }]}>
                  Trade-offs: {rawActions.multi_crisis_tradeoffs}
                </Text>
              ) : null}
            </Card.Content>
          </Card>
        ) : null}

        {actions.length === 0 && isPolling ? (
          <ActivityIndicator animating style={{ marginVertical: 24 }} />
        ) : null}

        <View style={styles.cardsContainer}>
          {actions.map((action, idx) => (
            <LiveActionCard
              key={action.id}
              title={action.title}
              description={action.description || action.result || ''}
              icon={action.icon}
              status={action.status}
              delayMs={500 + idx * 400}
              onDone={() => setCompletedCount((c) => c + 1)}
            />
          ))}
        </View>

        {(allDone || completedCount >= actions.length) && actions.length > 0 && (
          <Animated.View entering={FadeInUp.duration(600)} style={styles.footer}>
            <TouchableOpacity style={styles.outcomeButton} onPress={() => router.push('/outcome')}>
              <Text style={styles.outcomeButtonText}>View Outcome Report</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <Button mode="text" onPress={() => refresh()} style={{ marginTop: 16 }}>
          Refresh actions
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 16, paddingBottom: 40 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { color: '#aaa', marginBottom: 16, textAlign: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginTop: 8 },
  subtitle: { fontSize: 14, color: '#aaaaaa', marginBottom: 16, marginTop: 4 },
  rationaleCard: { marginBottom: 16, backgroundColor: '#1e1e1e', borderColor: '#333' },
  rationaleTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 6 },
  rationaleText: { color: '#ccc', fontSize: 13, lineHeight: 20 },
  cardsContainer: { gap: 4 },
  doneCard: { marginVertical: 6, backgroundColor: '#1e1e1e' },
  statusChip: { color: '#4caf50', marginRight: 16, fontWeight: 'bold' },
  footer: { marginTop: 40, alignItems: 'center' },
  outcomeButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  outcomeButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
});
