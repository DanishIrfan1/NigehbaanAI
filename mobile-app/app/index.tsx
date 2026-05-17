import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Text,
  TextInput,
  Switch,
  Button,
  Card,
  useTheme,
  ActivityIndicator,
  Divider,
  Chip
} from 'react-native-paper';
import { triggerAnalyze, getCrisisStatus, getAgentsTrace, getActions, getOutcome } from '../src/api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30000;

const applySettledValue = <T,>(
  result: PromiseSettledResult<T>,
  onValue: (value: T) => void
) => {
  if (result.status === 'fulfilled' && result.value) {
    onValue(result.value);
  }
};

const areActionsDone = (actions: any[]) =>
  actions.length > 0 && actions.every((action) => action.status === 'DONE');

const getActionKey = (action: any) =>
  action.id ?? action.step ?? action.action ?? action.title ?? action.type ?? JSON.stringify(action);

const getTraceKey = (trace: any) =>
  trace.id ?? trace.ts ?? trace.time ?? JSON.stringify(trace);

const ActionSummaryCard = ({ action, accentColor }: { action: any; accentColor: string }) => {
  const status = action.status ?? 'PENDING';
  const statusColor = status === 'DONE' ? '#4caf50' : accentColor;
  const statusIcon = status === 'DONE' ? 'check-circle' : 'clock-fast';
  const title = action.title ?? action.action ?? 'Action';
  const subtitle = action.description ?? action.type ?? '';

  return (
    <Card style={[styles.card, { marginVertical: 4 }]} mode="contained">
      <Card.Content>
        <View style={styles.actionHeader}>
          <MaterialCommunityIcons name={statusIcon} size={24} color={statusColor} />
          <View style={styles.actionText}>
            <Text variant="titleSmall">{title}</Text>
            {!!subtitle && <Text variant="bodySmall">{subtitle}</Text>}
          </View>
          <Chip style={styles.actionChip} textStyle={{ color: statusColor }}>
            {status}
          </Chip>
        </View>
        {action.result && (
          <Text variant="bodySmall" style={{ color: '#4caf50', marginTop: 6 }}>
            {action.result}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

export default function Dashboard() {
  const theme = useTheme();
  const router = useRouter();
  
  // Input states
  const [textSignal, setTextSignal] = useState('G-10 mein pani bhar gaya hai, gaariyan phans gayi hain');
  const [useSocialMedia, setUseSocialMedia] = useState(true);
  const [useWeather, setUseWeather] = useState(true);
  const [useTraffic, setUseTraffic] = useState(true);
  const [useEmergencyCall, setUseEmergencyCall] = useState(false);
  
  // App state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // Dashboard Data
  const [crisisStatus, setCrisisStatus] = useState<any>(null);
  const [agentTraces, setAgentTraces] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [outcome, setOutcome] = useState<any>(null);

  const stopPolling = (interval: NodeJS.Timeout | null) => {
    if (interval) clearInterval(interval);
    setPollInterval(null);
    setIsAnalyzing(false);
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    // Reset states
    setCrisisStatus(null);
    setAgentTraces([]);
    setActions([]);
    setOutcome(null);

    try {
      await triggerAnalyze({ text: textSignal, socialMedia: useSocialMedia, weather: useWeather, traffic: useTraffic, emergencyCall: useEmergencyCall });
      // Start polling
      const interval = setInterval(fetchDashboardData, 2000);
      setPollInterval(interval);
      
      // Stop polling after 30 seconds for safety
      setTimeout(() => {
        clearInterval(interval);
        setIsAnalyzing(false);
      }, 30000);
    } catch (e) {
      console.error("Failed to start analysis", e);
      setIsAnalyzing(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [statusRes, tracesRes, actionsRes, outcomeRes] = await Promise.allSettled([
        getCrisisStatus(),
        getAgentsTrace(),
        getActions(),
        getOutcome()
      ]);

      if (statusRes.status === 'fulfilled' && statusRes.value) {
        setCrisisStatus(statusRes.value);
      }
      if (tracesRes.status === 'fulfilled' && tracesRes.value) {
        setAgentTraces(tracesRes.value);
      }
      if (actionsRes.status === 'fulfilled' && actionsRes.value) {
        setActions(actionsRes.value);
      }
      if (outcomeRes.status === 'fulfilled' && outcomeRes.value) {
        setOutcome(outcomeRes.value);
      }
      
      // If we see actions are done, stop polling
      if (actionsRes.status === 'fulfilled' && actionsRes.value?.length > 0) {
        const allDone = actionsRes.value.every((a: any) => a.status === 'DONE');
        if (allDone && isAnalyzing) {
          if (pollInterval) clearInterval(pollInterval);
          setIsAnalyzing(false);
        }
      }

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [pollInterval]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="shield-account-variant" size={40} color={theme.colors.primary} />
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
            Nigehbaan AI
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Crisis Intelligence & Response Orchestrator
          </Text>
        </View>

        {/* Input Card */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Incident Signal</Text>
            <TextInput
              mode="outlined"
              label="Raw Text Signal (Urdu/English)"
              value={textSignal}
              onChangeText={setTextSignal}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            <View style={styles.switchRow}>
              <Text>Social Media Signal</Text>
              <Switch value={useSocialMedia} onValueChange={setUseSocialMedia} color={theme.colors.primary} />
            </View>
            <View style={styles.switchRow}>
              <Text>Weather Alert</Text>
              <Switch value={useWeather} onValueChange={setUseWeather} color={theme.colors.primary} />
            </View>
            <View style={styles.switchRow}>
              <Text>Traffic Spike</Text>
              <Switch value={useTraffic} onValueChange={setUseTraffic} color={theme.colors.primary} />
            </View>
            <View style={styles.switchRow}>
              <Text>📞 Emergency Call</Text>
              <Switch value={useEmergencyCall} onValueChange={setUseEmergencyCall} color={theme.colors.primary} />
            </View>
          </Card.Content>
          <View style={styles.buttonContainer}>
            <Button 
              mode="contained" 
              onPress={startAnalysis} 
              loading={isAnalyzing}
              disabled={isAnalyzing}
              icon="brain"
              buttonColor="#ff5252"
              style={styles.fullWidthButton}
            >
              Analyze Crisis
            </Button>
          </View>
        </Card>

        {/* Dynamic Dashboard - shown once processing starts or data exists */}
        {(isAnalyzing || agentTraces.length > 0) && (
          <View style={styles.dashboardArea}>
            
            <Text variant="titleLarge" style={styles.sectionTitle}>Intelligence Report</Text>

            {/* Crisis Status */}
            {crisisStatus && (
              <TouchableOpacity onPress={() => router.push('/crisis')} activeOpacity={0.8}>
                <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: crisisStatus.severity === 'HIGH' ? '#ff5252' : theme.colors.primary }]} mode="elevated">
                  <Card.Content>
                    <View style={styles.statusHeader}>
                      <View>
                        <Text variant="titleLarge">{crisisStatus.type || 'Detecting...'}</Text>
                      <Text variant="bodyMedium">{crisisStatus.location || 'Unknown Location'}</Text>
                    </View>
                    <Chip icon="alert" textStyle={{ fontWeight: 'bold' }}>
                      {crisisStatus.severity || 'PENDING'}
                    </Chip>
                  </View>
                  <Divider style={styles.divider} />
                  <Text variant="bodyMedium">Confidence: {crisisStatus.confidence ? `${crisisStatus.confidence}%` : '--%'}</Text>
                  {crisisStatus.impact && crisisStatus.impact.length > 0 && (
                    <View style={{ marginTop: 8 }}>
                      <Text variant="labelMedium">Impact:</Text>
                      {crisisStatus.impact.map((imp: string, idx: number) => (
                        <Text key={idx} variant="bodySmall" style={{ marginLeft: 8 }}>• {imp}</Text>
                      ))}
                    </View>
                  )}
                </Card.Content>
              </Card>
            </TouchableOpacity>
            )}

            {/* Response Actions */}
            {actions.length > 0 && (
              <View>
                <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 16 }]}>Coordinated Actions</Text>
                {actions.map((action, idx) => (
                  <Card key={idx} style={[styles.card, { marginVertical: 4 }]} mode="contained">
                    <Card.Title 
                      title={action.title} 
                      subtitle={action.description || action.type}
                      left={(props) => <MaterialCommunityIcons name={action.status === 'DONE' ? 'check-circle' : 'clock-fast'} size={24} color={action.status === 'DONE' ? '#4caf50' : theme.colors.primary} />}
                      right={(props) => <Chip style={{ marginRight: 16 }}>{action.status}</Chip>}
                    />
                    {action.result && (
                      <Card.Content>
                         <Text variant="bodySmall" style={{ color: '#4caf50' }}>{action.result}</Text>
                      </Card.Content>
                    )}
                  </Card>
                ))}
              </View>
            )}

            {/* Agent Trace Logs */}
            <Card style={[styles.card, { marginTop: 16 }]} mode="outlined">
              <Card.Title title="Agent Brain Trace" subtitle="Multi-Agent Execution Pipeline" left={(props) => <MaterialCommunityIcons name="console" size={24} color={props.color} />} />
              <Card.Content style={styles.traceContainer}>
                {agentTraces.length === 0 && <ActivityIndicator animating size="small" />}
                {agentTraces.map((trace, idx) => (
                  <View key={idx} style={styles.traceRow}>
                    <Text style={styles.traceTime}>{trace.time}</Text>
                    <Text style={[styles.traceAgent, { color: theme.colors.primary }]}>[{trace.agent}]</Text>
                    <Text style={styles.traceMessage} numberOfLines={2}>{trace.message}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>

            {/* Outcomes / Stats */}
            {outcome && (
              <Card style={[styles.card, { marginTop: 16, backgroundColor: theme.colors.elevation.level2 }]} mode="elevated">
                <Card.Content>
                  <Text variant="titleMedium" style={styles.sectionTitle}>Expected Outcome Stats</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>Before Response</Text>
                      <Text variant="bodyMedium" style={{ marginTop: 4 }}>{outcome.beforeStats}</Text>
                    </View>
                    <Divider style={{ width: 1, height: '100%', marginHorizontal: 16 }} />
                    <View style={{ flex: 1 }}>
                      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>After Response</Text>
                      <Text variant="bodyMedium" style={{ marginTop: 4 }}>{outcome.afterStats}</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            )}

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  title: { fontWeight: 'bold', marginTop: 8 },
  card: { marginBottom: 16, borderRadius: 16 },
  cardTitle: { marginBottom: 16, fontWeight: 'bold' },
  input: { marginBottom: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  buttonContainer: { padding: 16, paddingTop: 0 },
  fullWidthButton: { width: '100%', borderRadius: 8, paddingVertical: 6 },
  dashboardArea: { marginTop: 16 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 12 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  divider: { marginVertical: 12 },
  traceContainer: { backgroundColor: '#1e1e1e', padding: 12, borderRadius: 8, minHeight: 100 },
  traceRow: { flexDirection: 'row', marginBottom: 6 },
  traceTime: { color: '#888', fontSize: 12, marginRight: 8, fontFamily: 'monospace' },
  traceAgent: { fontSize: 12, fontWeight: 'bold', marginRight: 8, fontFamily: 'monospace' },
  traceMessage: { color: '#ddd', fontSize: 12, flex: 1, fontFamily: 'monospace' }
});
