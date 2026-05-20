import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import {
  Text,
  TextInput,
  Switch,
  Button,
  Card,
  useTheme,
  ActivityIndicator,
  Divider,
  Chip,
  Banner,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSignal } from '../src/context/SignalContext';
import DegradedBanner from '../src/components/DegradedBanner';

export default function Dashboard() {
  const theme = useTheme();
  const router = useRouter();
  const {
    dashboardCrisis,
    traces,
    actions,
    outcomeStats,
    isPolling,
    error,
    degradedMode,
    simulatedLlmPipeline,
    warnings,
    signalId,
    startAnalysis,
    refresh,
    loadMultiCrisis,
    clearError,
  } = useSignal();

  const [textSignal, setTextSignal] = useState(
    'G-10 mein pani bhar gaya hai, gaariyan phans gayi hain'
  );
  const [useSocialMedia, setUseSocialMedia] = useState(true);
  const [useWeather, setUseWeather] = useState(true);
  const [useTraffic, setUseTraffic] = useState(true);
  const [useEmergencyCall, setUseEmergencyCall] = useState(false);

  const handleAnalyze = () => {
    clearError();
    startAnalysis({
      text: textSignal,
      useSocialMedia,
      useWeather,
      useTraffic,
      useEmergencyCall,
    });
  };

  const showDashboard = isPolling || Boolean(dashboardCrisis) || traces.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => refresh()}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <MaterialCommunityIcons name="shield-account-variant" size={40} color={theme.colors.primary} />
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
            Nigehbaan AI
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Crisis Intelligence & Response Orchestrator
          </Text>
        </View>

        <DegradedBanner
          degradedMode={degradedMode}
          warnings={warnings}
          simulatedLlmPipeline={simulatedLlmPipeline}
        />

        {error ? (
          <Banner
            visible
            actions={[
              { label: 'Retry', onPress: handleAnalyze },
              { label: 'Dismiss', onPress: clearError },
            ]}
            icon="alert-circle"
          >
            {error}
          </Banner>
        ) : null}

        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Incident Signal
            </Text>
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
              <Switch
                value={useEmergencyCall}
                onValueChange={setUseEmergencyCall}
                color={theme.colors.primary}
              />
            </View>
          </Card.Content>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleAnalyze}
              loading={isPolling}
              disabled={isPolling}
              icon="brain"
              buttonColor="#ff5252"
              style={styles.fullWidthButton}
            >
              Analyze Crisis
            </Button>
            <Button
              mode="outlined"
              onPress={loadMultiCrisis}
              disabled={isPolling}
              icon="layers-triple"
              style={[styles.fullWidthButton, { marginTop: 8 }]}
            >
              Multi-Crisis Demo
            </Button>
          </View>
        </Card>

        {signalId ? (
          <Text variant="labelSmall" style={styles.signalId}>
            Signal: {signalId.slice(0, 8)}…
          </Text>
        ) : null}

        {showDashboard && (
          <View style={styles.dashboardArea}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Intelligence Report
            </Text>

            {isPolling && !dashboardCrisis && (
              <ActivityIndicator animating style={{ marginVertical: 16 }} />
            )}

            {dashboardCrisis && (
              <TouchableOpacity onPress={() => router.push('/crisis')} activeOpacity={0.8}>
                <Card
                  style={[
                    styles.card,
                    {
                      borderLeftWidth: 4,
                      borderLeftColor:
                        dashboardCrisis.severity === 'HIGH' ? '#ff5252' : theme.colors.primary,
                    },
                  ]}
                  mode="elevated"
                >
                  <Card.Content>
                    <View style={styles.statusHeader}>
                      <View>
                        <Text variant="titleLarge">{dashboardCrisis.type}</Text>
                        <Text variant="bodyMedium">{dashboardCrisis.location}</Text>
                      </View>
                      <Chip icon="alert" textStyle={{ fontWeight: 'bold' }}>
                        {dashboardCrisis.severity}
                      </Chip>
                    </View>
                    <Divider style={styles.divider} />
                    <Text variant="bodyMedium">
                      Confidence: {dashboardCrisis.confidence ? `${dashboardCrisis.confidence}%` : '--%'}
                    </Text>
                    {dashboardCrisis.impact.length > 0 && (
                      <View style={{ marginTop: 8 }}>
                        <Text variant="labelMedium">Impact:</Text>
                        {dashboardCrisis.impact.slice(0, 3).map((imp, idx) => (
                          <Text key={idx} variant="bodySmall" style={{ marginLeft: 8 }}>
                            • {imp}
                          </Text>
                        ))}
                      </View>
                    )}
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            )}

            {actions.length > 0 && (
              <View>
                <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 16 }]}>
                  Coordinated Actions
                </Text>
                {actions.map((action) => (
                  <Card key={action.id} style={[styles.card, { marginVertical: 4 }]} mode="contained">
                    <Card.Title
                      title={action.title}
                      subtitle={action.description}
                      left={() => (
                        <MaterialCommunityIcons
                          name={action.status === 'DONE' ? 'check-circle' : 'clock-fast'}
                          size={24}
                          color={action.status === 'DONE' ? '#4caf50' : theme.colors.primary}
                        />
                      )}
                      right={() => <Chip style={{ marginRight: 16 }}>{action.status}</Chip>}
                    />
                    {action.result ? (
                      <Card.Content>
                        <Text variant="bodySmall" style={{ color: '#4caf50' }}>
                          {action.result}
                        </Text>
                      </Card.Content>
                    ) : null}
                  </Card>
                ))}
              </View>
            )}

            <Card style={[styles.card, { marginTop: 16 }]} mode="outlined">
              <Card.Title
                title="Agent Brain Trace"
                subtitle="Multi-Agent Execution Pipeline"
                left={(props) => (
                  <MaterialCommunityIcons name="console" size={24} color={props.color} />
                )}
              />
              <Card.Content style={styles.traceContainer}>
                {traces.length === 0 && <ActivityIndicator animating size="small" />}
                {traces.slice(-8).map((trace) => (
                  <View key={trace.id} style={styles.traceRow}>
                    <Text style={styles.traceTime}>{trace.timestamp}</Text>
                    <Text style={[styles.traceAgent, { color: theme.colors.primary }]}>
                      [{trace.agent}]
                    </Text>
                    <Text style={styles.traceMessage} numberOfLines={2}>
                      {trace.message}
                    </Text>
                  </View>
                ))}
                {traces.length > 0 && (
                  <Button mode="text" onPress={() => router.push('/logs')} compact>
                    View full trace →
                  </Button>
                )}
              </Card.Content>
            </Card>

            {outcomeStats.length > 0 && (
              <Card
                style={[styles.card, { marginTop: 16, backgroundColor: theme.colors.elevation.level2 }]}
                mode="elevated"
              >
                <Card.Content>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Expected Outcome Stats
                  </Text>
                  {outcomeStats.slice(0, 2).map((stat) => (
                    <View key={stat.label} style={{ marginTop: 8 }}>
                      <Text variant="labelMedium">{stat.label}</Text>
                      <Text variant="bodyMedium">
                        {stat.beforeStr} →{' '}
                        {stat.afterStrOverride ?? `${stat.afterNum ?? '--'}${stat.afterSuffix ?? ''}`}
                      </Text>
                    </View>
                  ))}
                  <Button mode="text" onPress={() => router.push('/outcome')} compact>
                    Full outcome report →
                  </Button>
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
  header: { alignItems: 'center', marginBottom: 16, marginTop: 8 },
  title: { fontWeight: 'bold', marginTop: 8 },
  card: { marginBottom: 16, borderRadius: 16 },
  cardTitle: { marginBottom: 16, fontWeight: 'bold' },
  input: { marginBottom: 16 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  buttonContainer: { padding: 16, paddingTop: 0 },
  fullWidthButton: { width: '100%', borderRadius: 8, paddingVertical: 6 },
  dashboardArea: { marginTop: 8 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 12 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  divider: { marginVertical: 12 },
  signalId: { color: '#888', marginBottom: 8, fontFamily: 'monospace' },
  traceContainer: { backgroundColor: '#1e1e1e', padding: 12, borderRadius: 8, minHeight: 80 },
  traceRow: { flexDirection: 'row', marginBottom: 6 },
  traceTime: { color: '#888', fontSize: 12, marginRight: 8, fontFamily: 'monospace' },
  traceAgent: { fontSize: 12, fontWeight: 'bold', marginRight: 8, fontFamily: 'monospace' },
  traceMessage: { color: '#ddd', fontSize: 12, flex: 1, fontFamily: 'monospace' },
});
