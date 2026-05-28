import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Text as PaperText, Banner } from 'react-native-paper';
import { API_HOST, checkHealth } from '../src/api/client';

export default function SettingsScreen() {
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setError(null);
    setHealthStatus(null);
    try {
      const res = await checkHealth();
      setHealthStatus(`${res.status} — ${res.service ?? 'nigehbaan-ai'} v${res.version ?? '?'}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Connection failed';
      setError(msg);
    } finally {
      setTesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <PaperText variant="titleMedium" style={styles.cardTitle}>
              API Configuration
            </PaperText>
            <PaperText variant="labelMedium" style={styles.label}>
              EXPO_PUBLIC_API_URL
            </PaperText>
            <PaperText variant="bodyMedium" style={styles.url}>
              {API_HOST}
            </PaperText>
            <PaperText variant="bodySmall" style={styles.hint}>
              Browser on this PC: open http://localhost:8081{'\n'}
              Phone on Wi‑Fi: use LAN IP (not localhost). Example:{'\n'}
              • Metro / Expo Go: exp://192.168.x.x:8081 (scan QR from terminal){'\n'}
              • API: http://192.168.x.x:8000{'\n'}
              Set REACT_NATIVE_PACKAGER_HOSTNAME and EXPO_PUBLIC_API_URL in repo .env, then restart
              Docker.
            </PaperText>
          </Card.Content>
        </Card>

        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <PaperText variant="titleMedium" style={styles.cardTitle}>
              Backend Health
            </PaperText>
            <Button mode="contained" onPress={testConnection} loading={testing} icon="heart-pulse">
              Test Connection
            </Button>
            {healthStatus ? (
              <PaperText style={styles.success}>✓ {healthStatus}</PaperText>
            ) : null}
          </Card.Content>
        </Card>

        {error ? (
          <Banner visible icon="alert-circle">
            {error}
          </Banner>
        ) : null}

        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <PaperText variant="titleMedium" style={styles.cardTitle}>
              Documentation
            </PaperText>
            <Button
              mode="text"
              icon="book-open-variant"
              onPress={() => Linking.openURL('https://github.com')}
            >
              See docs/README.md in repository
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  card: { marginBottom: 16, backgroundColor: '#1e1e1e' },
  cardTitle: { color: '#fff', marginBottom: 12 },
  label: { color: '#888', marginBottom: 4 },
  url: { color: '#64b5f6', fontFamily: 'monospace', marginBottom: 8 },
  hint: { color: '#888', lineHeight: 20 },
  success: { color: '#4caf50', marginTop: 12 },
});
