import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Coordinates
const ISLAMABAD_CENTER = { latitude: 33.6844, longitude: 73.0479 };
const CRISIS_LOCATION = { latitude: 33.6730, longitude: 73.0039 }; // G-10

const BLOCKED_ROUTE = [
  { latitude: 33.6650, longitude: 72.9900 },
  { latitude: 33.6700, longitude: 72.9980 },
  CRISIS_LOCATION,
  { latitude: 33.6800, longitude: 73.0150 }
];

const ALTERNATE_ROUTE_KEYPOINTS = [
  { latitude: 33.6650, longitude: 72.9900 },
  { latitude: 33.6600, longitude: 73.0000 },
  { latitude: 33.6620, longitude: 73.0100 },
  { latitude: 33.6700, longitude: 73.0200 },
  { latitude: 33.6800, longitude: 73.0150 }
];

const interpolatePoints = (p1: any, p2: any, steps: number) => {
  const points = [];
  for (let i = 1; i <= steps; i++) {
    points.push({
      latitude: p1.latitude + (p2.latitude - p1.latitude) * (i / steps),
      longitude: p1.longitude + (p2.longitude - p1.longitude) * (i / steps),
    });
  }
  return points;
};

const generateDenseRoute = (routeCoords: any[], stepsPerSegment = 8) => {
  let denseRoute = [routeCoords[0]];
  for (let i = 0; i < routeCoords.length - 1; i++) {
    const interpolated = interpolatePoints(routeCoords[i], routeCoords[i+1], stepsPerSegment);
    denseRoute = denseRoute.concat(interpolated);
  }
  return denseRoute;
};

// Generate an array of coordinates for smooth animation
const DENSE_ALTERNATE_ROUTE = generateDenseRoute(ALTERNATE_ROUTE_KEYPOINTS, 8);

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [routeIndex, setRouteIndex] = useState(0);
  
  // Pulsing animation for Marker
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // 1. Start pulsing animation
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

    // 2. Center map on crisis location on mount
    setTimeout(() => {
      mapRef.current?.animateCamera({
        center: CRISIS_LOCATION,
        zoom: 14,
      }, { duration: 1500 });
    }, 800);

    // 3. Animate alternate route drawing (100ms each per requirement)
    const intervalId = setInterval(() => {
      setRouteIndex(prev => {
        if (prev < DENSE_ALTERNATE_ROUTE.length) {
          return prev + 1;
        } else {
          clearInterval(intervalId);
          return prev;
        }
      });
    }, 100); 
    
    return () => clearInterval(intervalId);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const currentAlternateRoute = DENSE_ALTERNATE_ROUTE.slice(0, routeIndex);
  
  // Sanitize arrays to prevent null object reference crashes in AIRMapPolyline
  const safeAlternateRoute = currentAlternateRoute.filter(
    (c) => c && typeof c.latitude === 'number' && typeof c.longitude === 'number' && !isNaN(c.latitude) && !isNaN(c.longitude)
  );
  
  const safeBlockedRoute = BLOCKED_ROUTE.filter(
    (c) => c && typeof c.latitude === 'number' && typeof c.longitude === 'number' && !isNaN(c.latitude) && !isNaN(c.longitude)
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
          zoom: 13
        }}
      >
        {/* Blocked Route */}
        {safeBlockedRoute.length > 1 && (
          <Polyline
            coordinates={safeBlockedRoute}
            strokeColor="#ff4444"
            strokeWidth={4}
            lineDashPattern={[10, 10]}
          />
        )}
        
        {/* Alternate Route (Animated) */}
        {safeAlternateRoute.length > 1 && (
          <Polyline
            coordinates={safeAlternateRoute}
            strokeColor="#00cc66"
            strokeWidth={4}
          />
        )}

        {/* Crisis Marker */}
        <Marker coordinate={CRISIS_LOCATION} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.markerContainer}>
            <Animated.View style={[styles.pulseRing, animatedStyle]} />
            <View style={styles.markerCore} />
          </View>
          <Callout tooltip>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutText}>Urban Flooding | G-10 | HIGH</Text>
            </View>
          </Callout>
        </Marker>
      </MapView>
      
      {/* Top Crisis Info Card Overlay */}
      <View style={styles.topCard}>
        <Text style={styles.topCardTitle}>G-10 Urban Flooding</Text>
        <View style={styles.severityBadge}>
          <Text style={styles.severityText}>HIGH</Text>
        </View>
      </View>

      {/* Bottom Overlay: Legend & Actions Button */}
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
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  map: { 
    width: width, 
    height: height 
  },
  markerContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  calloutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  topCard: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  topCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  severityBadge: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  severityText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a4a4a',
  },
  actionButton: {
    backgroundColor: '#1e1e1e',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
