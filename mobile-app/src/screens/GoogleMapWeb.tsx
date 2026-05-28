/**
 * Interactive Google Map for Expo web only (Maps JavaScript API).
 * Loads https://maps.googleapis.com/maps/api/js once per page session.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import {
  BLOCKED_ROUTE,
  CRISIS_LOCATION,
  DENSE_ALTERNATE_ROUTE,
  ISLAMABAD_CENTER,
  toGoogleMapsPath,
} from './mapRouteConstants';

let mapsScriptPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return Promise.resolve();
  }
  const w = globalThis as unknown as { google?: { maps?: unknown } };
  if (w.google?.maps) return Promise.resolve();
  if (mapsScriptPromise) return mapsScriptPromise;

  mapsScriptPromise = new Promise((resolve, reject) => {
    const id = 'nigehbaan-maps-js';
    const existing = document.getElementById(id);
    if (existing) {
      if (w.google?.maps) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Google Maps script failed')), {
        once: true,
      });
      return;
    }
    const script = document.createElement('script');
    script.id = id;
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps JavaScript API'));
    document.head.appendChild(script);
  });
  return mapsScriptPromise;
}

type Props = {
  apiKey: string;
  title: string;
  locationLabel: string;
  severityLabel: string;
};

export default function GoogleMapWeb({ apiKey, title, locationLabel, severityLabel }: Props) {
  const hostRef = useRef<View | null>(null);
  const mapReadyRef = useRef(false);
  const metaRef = useRef({ title, locationLabel, severityLabel });
  metaRef.current = { title, locationLabel, severityLabel };

  const [loadError, setLoadError] = React.useState<string | null>(null);

  useEffect(() => {
    if (!apiKey.trim()) {
      setLoadError('Missing Maps API key');
      return;
    }
    let cancelled = false;
    setLoadError(null);

    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (cancelled) return;
        requestAnimationFrame(() => {
          if (cancelled || mapReadyRef.current) return;
          const google = (globalThis as unknown as { google?: { maps: GMapsCtor } }).google;
          const node = hostRef.current as unknown as HTMLElement | null;
          if (!node || !google?.maps) return;

          const G = google.maps;
          const { title: t, locationLabel: loc, severityLabel: sev } = metaRef.current;

          const map = new G.Map(node, {
            center: { lat: ISLAMABAD_CENTER.latitude, lng: ISLAMABAD_CENTER.longitude },
            zoom: 13,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
          });

          new G.Polyline({
            path: toGoogleMapsPath(BLOCKED_ROUTE),
            strokeColor: '#ff4444',
            strokeOpacity: 0.95,
            strokeWeight: 4,
            map,
            icons: [
              {
                icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
                offset: '0',
                repeat: '16px',
              },
            ],
          });

          new G.Polyline({
            path: toGoogleMapsPath(DENSE_ALTERNATE_ROUTE),
            strokeColor: '#00cc66',
            strokeOpacity: 0.95,
            strokeWeight: 4,
            map,
          });

          new G.Marker({
            position: { lat: CRISIS_LOCATION.latitude, lng: CRISIS_LOCATION.longitude },
            map,
            title: `${t} — ${loc}`,
          });

          const start = DENSE_ALTERNATE_ROUTE[0];
          if (start) {
            new G.Marker({
              position: { lat: start.latitude, lng: start.longitude },
              map,
              title: '🚑 Ambulance (alternate route)',
            });
          }

          const bounds = new G.LatLngBounds();
          [...BLOCKED_ROUTE, ...DENSE_ALTERNATE_ROUTE].forEach((p) =>
            bounds.extend({ lat: p.latitude, lng: p.longitude })
          );
          map.fitBounds(bounds, 48);

          const info = new G.InfoWindow({
            content: `<div style="color:#111;padding:4px 8px;max-width:220px"><strong>${escapeHtml(
              t
            )}</strong><br/>${escapeHtml(loc)}<br/><span style="color:#c62828">${escapeHtml(sev)}</span></div>`,
          });
          info.setPosition({ lat: CRISIS_LOCATION.latitude, lng: CRISIS_LOCATION.longitude });
          info.open({ map });

          mapReadyRef.current = true;
        });
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message ?? 'Map load failed');
      });

    return () => {
      cancelled = true;
      const node = hostRef.current as unknown as HTMLElement | null;
      if (node) node.innerHTML = '';
      mapReadyRef.current = false;
    };
  }, [apiKey]);

  return (
    <View style={styles.wrap}>
      {loadError ? (
        <Text style={styles.errorText}>{loadError}</Text>
      ) : (
        <Text style={styles.hint}>Pan and zoom — same routes as native (G-10 corridor).</Text>
      )}
      <View ref={hostRef} style={styles.mapHost} collapsable={false} />
    </View>
  );
}

/** Minimal surface used here (avoids @types/google.maps). */
type GMapsCtor = {
  Map: new (el: HTMLElement, opts: Record<string, unknown>) => GMapInstance;
  Polyline: new (opts: Record<string, unknown>) => void;
  Marker: new (opts: Record<string, unknown>) => void;
  LatLngBounds: new () => { extend: (p: { lat: number; lng: number }) => void };
  InfoWindow: new (opts: { content: string }) => {
    setPosition: (p: { lat: number; lng: number }) => void;
    open: (o: { map: GMapInstance }) => void;
  };
};

type GMapInstance = { fitBounds: (b: { extend: (p: { lat: number; lng: number }) => void }, padding?: number) => void };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  mapHost: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a2332',
  },
  hint: { color: '#888', fontSize: 12, marginBottom: 8, fontStyle: 'italic' },
  errorText: { color: '#ff9800', marginBottom: 8, fontSize: 13 },
});
