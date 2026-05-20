import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSignal } from '../context/SignalContext';
import { formatCrisisType, toSeverityLevel } from '../api/mappers';
import {
  BLOCKED_ROUTE,
  CRISIS_LOCATION,
  DENSE_ALTERNATE_ROUTE,
  ISLAMABAD_CENTER,
} from './mapRouteConstants';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const router = useRouter();
  const { uiCrisis, crisis, status } = useSignal();
  const mapRef = useRef<MapView>(null);
  const [routeIndex, setRouteIndex] = React.useState(0);
  const [ambulanceIndex, setAmbulanceIndex] = React.useState(0);

  const classification = crisis?.classification ?? status?.detection?.classification;
  const severity = crisis?.severity ?? status?.detection?.severity;
  const title = uiCrisis?.title ?? formatCrisisType(classification?.crisis_type) ?? 'Crisis Zone';
  const locationLabel = classification?.location ?? uiCrisis?.location ?? 'G-10';
  const severityLabel = toSeverityLevel(severity);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.5, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );

    setTimeout(() => {
      mapRef.current?.animateCamera({ center: CRISIS_LOCATION, zoom: 14 }, { duration: 1500 });
    }, 800);

    const intervalId = setInterval(() => {
      setRouteIndex((prev) => {
        if (prev < DENSE_ALTERNATE_ROUTE.length) return prev + 1;
        clearInterval(intervalId);
        return prev;
      });
    }, 100);

    const ambulanceId = setInterval(() => {
      setAmbulanceIndex((prev) => {
        if (prev < DENSE_ALTERNATE_ROUTE.length - 1) return prev + 1;
        clearInterval(ambulanceId);
        return prev;
      });
    }, 300);

    return () => {
      clearInterval(intervalId);
      clearInterval(ambulanceId);
    };
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const ambulanceCoord = DENSE_ALTERNATE_ROUTE[ambulanceIndex] ?? DENSE_ALTERNATE_ROUTE[0];
  const currentAlternateRoute = DENSE_ALTERNATE_ROUTE.slice(0, routeIndex);

  const safeAlternateRoute = currentAlternateRoute.filter(
    (c) =>
      c &&
      typeof c.latitude === 'number' &&
      typeof c.longitude === 'number' &&
      !Number.isNaN(c.latitude) &&
      !Number.isNaN(c.longitude)
  );

  const safeBlockedRoute = BLOCKED_ROUTE.filter(
    (c) =>
      c &&
      typeof c.latitude === 'number' &&
      typeof c.longitude === 'number' &&
      !Number.isNaN(c.latitude) &&
      !Number.isNaN(c.longitude)
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialCamera={{
          center: ISLAMABAD_CENTER,
          pitch: 0,
          heading: 0,
          altitude: 10000,
          zoom: 13,
        }}
      >
        {safeBlockedRoute.length > 1 && (
          <Polyline
            coordinates={safeBlockedRoute}
            strokeColor="#ff4444"
            strokeWidth={4}
            lineDashPattern={[10, 10]}
          />
        )}

        {safeAlternateRoute.length > 1 && (
          <Polyline coordinates={safeAlternateRoute} strokeColor="#00cc66" strokeWidth={4} />
        )}

        <Marker coordinate={ambulanceCoord} anchor={{ x: 0.5, y: 0.5 }}>
          <Text style={{ fontSize: 24 }}>🚑</Text>
        </Marker>

        <Marker coordinate={CRISIS_LOCATION} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.markerContainer}>
            <Animated.View style={[styles.pulseRing, animatedStyle]} />
            <View style={styles.markerCore} />
          </View>
          <Callout tooltip>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutText}>
                {title} | {locationLabel} | {severityLabel}
              </Text>
            </View>
          </Callout>
        </Marker>
      </MapView>

      <View style={styles.topCard}>
        <Text style={styles.topCardTitle}>{title}</Text>
        <View style={styles.severityBadge}>
          <Text style={styles.severityText}>{severityLabel}</Text>
        </View>
      </View>

      <View style={styles.bottomOverlay}>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>🔴</Text>
            <Text style={styles.legendText}>Blocked Route</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>🟢</Text>
            <Text style={styles.legendText}>Alternate Route</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>📍</Text>
            <Text style={styles.legendText}>Crisis Zone</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>🚑</Text>
            <Text style={styles.legendText}>Ambulance</Text>
          </View>
        </View>

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
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width, height },
  markerContainer: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
  pulseRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 68, 68, 0.4)',
  },
  markerCore: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff4444',
    borderWidth: 3,
    borderColor: '#fff',
  },
  calloutContainer: {
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  calloutText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  topCard: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topCardTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', flex: 1, marginRight: 8 },
  severityBadge: { backgroundColor: '#ff4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  severityText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  bottomOverlay: { position: 'absolute', bottom: 40, left: 20, right: 20 },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#1e1e1e',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  legendIcon: { fontSize: 10, marginRight: 4 },
  legendText: { fontSize: 11, fontWeight: '600', color: '#ffffff' },
  actionButton: {
    backgroundColor: '#f44336',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
});
