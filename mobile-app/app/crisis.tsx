import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { TextInput, Button, Card, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CrisisCard from '../components/CrisisCard';
import { useSignal } from '../src/context/SignalContext';
import DegradedBanner from '../src/components/DegradedBanner';
import { hasEmergencyCallSignal } from '../src/api/mappers';

const CrisisScreen = () => {
  const router = useRouter();
  const {
    uiCrisis,
    crisis,
    status,
    isPolling,
    isVerifying,
    verification,
    degradedMode,
    simulatedLlmPipeline,
    warnings,
    lastEmergencyCallEnabled,
    submitVerification,
    signalId,
  } = useSignal();

  const [fieldReport, setFieldReport] = useState(
    'Field team confirms water main burst only — not widespread flooding.'
  );

  const showEmergency =
    lastEmergencyCallEnabled || hasEmergencyCallSignal(status ?? undefined, crisis ?? undefined);

  if (!signalId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Submit a signal from Dashboard first.</Text>
          <Button mode="contained" onPress={() => router.push('/')}>
            Go to Dashboard
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!uiCrisis && isPolling) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator animating size="large" style={{ marginTop: 48 }} />
        <Text style={styles.loadingText}>Detecting crisis...</Text>
      </SafeAreaView>
    );
  }

  const data = uiCrisis ?? {
    title: 'Detecting...',
    location: 'Unknown',
    situationType: 'Pending',
    confidence: 0,
    severity: 'MEDIUM' as const,
    impacts: ['Analysis in progress...'],
    sourceSignals: [],
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Crisis Overview</Text>

        <DegradedBanner
          degradedMode={degradedMode}
          warnings={warnings}
          simulatedLlmPipeline={simulatedLlmPipeline}
        />

        {showEmergency && (
          <Card style={styles.emergencyCard} mode="contained">
            <Card.Content style={styles.emergencyRow}>
              <MaterialCommunityIcons name="phone-alert" size={28} color="#ff5252" />
              <View style={styles.emergencyText}>
                <Text style={styles.emergencyTitle}>Emergency Call Signal</Text>
                <Text style={styles.emergencySub}>
                  1122 distress call ingested and fused with other sources.
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        <CrisisCard
          title={data.title}
          location={data.location}
          situationType={data.situationType}
          confidence={data.confidence}
          severity={data.severity}
          impacts={data.impacts}
        />

        {verification && (
          <Card style={styles.verifyResultCard} mode="outlined">
            <Card.Content>
              <Text style={styles.verifyTitle}>
                Verification: {verification.verification_status ?? 'updated'}
              </Text>
              {verification.correction_reason ? (
                <Text style={styles.verifySub}>{verification.correction_reason}</Text>
              ) : null}
              {verification.is_retraction_needed ? (
                <Text style={styles.retraction}>Alerts retracted — false alarm corrected.</Text>
              ) : null}
            </Card.Content>
          </Card>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => router.push('/map')}
          >
            <Text style={styles.primaryButtonText}>See Response Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push('/logs')}
          >
            <Text style={styles.secondaryButtonText}>View Agent Reasoning</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.sectionTitle}>Source Signals</Text>
          {data.sourceSignals.map((signal) => (
            <View key={signal} style={styles.signalRow}>
              <Text style={styles.signalDot}>•</Text>
              <Text style={styles.signalText}>{signal}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.sectionTitle}>Field Report / Correction</Text>
          <TextInput
            mode="outlined"
            label="Field verification report"
            value={fieldReport}
            onChangeText={setFieldReport}
            multiline
            numberOfLines={3}
            style={{ marginBottom: 12, backgroundColor: '#1e1e1e' }}
          />
          <Button
            mode="contained"
            icon="shield-check"
            loading={isVerifying}
            disabled={isVerifying || !fieldReport.trim()}
            onPress={() => submitVerification(fieldReport)}
            buttonColor="#ff9800"
          >
            Submit Correction
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 16, paddingBottom: 40 },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    marginTop: 8,
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { color: '#aaa', marginBottom: 16, textAlign: 'center' },
  loadingText: { color: '#aaa', textAlign: 'center', marginTop: 16 },
  emergencyCard: { marginBottom: 12, backgroundColor: '#2a1515', borderColor: '#ff5252' },
  emergencyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emergencyText: { flex: 1 },
  emergencyTitle: { color: '#ff5252', fontWeight: 'bold', fontSize: 15 },
  emergencySub: { color: '#ccc', fontSize: 13, marginTop: 4 },
  verifyResultCard: { marginTop: 12, backgroundColor: '#1a2a1a', borderColor: '#4caf50' },
  verifyTitle: { color: '#4caf50', fontWeight: 'bold' },
  verifySub: { color: '#ccc', marginTop: 6 },
  retraction: { color: '#ff9800', marginTop: 8, fontWeight: '600' },
  buttonContainer: { marginTop: 20, gap: 12 },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: { backgroundColor: '#f44336' },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
  },
  secondaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  footerSection: {
    marginTop: 24,
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  signalRow: { flexDirection: 'row', marginTop: 4 },
  signalDot: { fontSize: 14, color: '#aaaaaa', marginRight: 8 },
  signalText: { fontSize: 14, color: '#dddddd', flex: 1 },
});

export default CrisisScreen;
