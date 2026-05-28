import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useSignal } from '../context/SignalContext';
import { formatCrisisType, toSeverityLevel } from '../api/mappers';
import GoogleMapWeb from './GoogleMapWeb';

function resolveWebMapsApiKey(): string {
  const fromEnv =
    typeof process !== 'undefined' && process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY
      ? String(process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY).trim()
      : '';
  if (fromEnv) return fromEnv;
  const ex = Constants.expoConfig as {
    android?: { config?: { googleMaps?: { apiKey?: string } } };
  } | null;
  const k = ex?.android?.config?.googleMaps?.apiKey;
  return typeof k === 'string' && k.length > 0 ? k : '';
}

/** Web: real Google Map (JS API). Native still uses react-native-maps. */
export default function MapScreenWeb() {
  const router = useRouter();
  const { uiCrisis, crisis, status } = useSignal();
  const mapsKey = Platform.OS === 'web' ? resolveWebMapsApiKey() : '';

  const classification = crisis?.classification ?? status?.detection?.classification;
  const severity = crisis?.severity ?? status?.detection?.severity;
  const title = uiCrisis?.title ?? formatCrisisType(classification?.crisis_type) ?? 'Crisis Zone';
  const locationLabel = classification?.location ?? uiCrisis?.location ?? 'G-10, Islamabad';
  const severityLabel = toSeverityLevel(severity);

  return (
    <View style={styles.container}>
      <View style={styles.topCard}>
        <Text style={styles.topCardTitle}>{title}</Text>
        <View style={styles.severityBadge}>
          <Text style={styles.severityText}>{severityLabel}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.mapArea}>
        <Text style={styles.location}>{locationLabel}</Text>

        {mapsKey ? (
          <GoogleMapWeb
            apiKey={mapsKey}
            title={title}
            locationLabel={locationLabel}
            severityLabel={severityLabel}
          />
        ) : (
          <View style={styles.fallbackBox}>
            <Text style={styles.fallbackTitle}>Maps API key needed for web</Text>
            <Text style={styles.fallbackBody}>
              Set EXPO_PUBLIC_GOOGLE_MAPS_KEY in your .env (Expo inlines it at bundle time). Use the same
              browser-restricted key as in Google Cloud Console — allow HTTP referrers such as{' '}
              http://localhost:8081/* and your LAN Expo URL. Alternatively rely on app.json android.config
              googleMaps.apiKey when present.
            </Text>
          </View>
        )}

        <View style={styles.legendContainer}>
          <Text style={styles.legendItem}>🔴 Blocked route</Text>
          <Text style={styles.legendItem}>🟢 Alternate route</Text>
          <Text style={styles.legendItem}>📍 Crisis zone</Text>
          <Text style={styles.legendItem}>🚑 Ambulance staging</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomOverlay}>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={() => router.push('/actions')}
        >
          <Text style={styles.actionButtonText}>View Actions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  topCard: {
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topCardTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', flex: 1 },
  severityBadge: { backgroundColor: '#ff4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  severityText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  mapArea: { padding: 20, paddingBottom: 120 },
  location: { color: '#64b5f6', marginBottom: 12 },
  fallbackBox: {
    padding: 16,
    backgroundColor: '#1a2332',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  fallbackTitle: { color: '#ff9800', fontWeight: '700', marginBottom: 8 },
  fallbackBody: { color: '#aaa', fontSize: 13, lineHeight: 20 },
  legendContainer: { gap: 8, marginTop: 12 },
  legendItem: { color: '#ccc', fontSize: 14 },
  bottomOverlay: { position: 'absolute', bottom: 24, left: 20, right: 20 },
  actionButton: {
    backgroundColor: '#f44336',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});
