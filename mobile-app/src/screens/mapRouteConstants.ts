/** Shared crisis zone + routes for Map.native and Map.web (Google Maps JS). */

export type LatLng = { latitude: number; longitude: number };

export const ISLAMABAD_CENTER: LatLng = { latitude: 33.6844, longitude: 73.0479 };
export const CRISIS_LOCATION: LatLng = { latitude: 33.673, longitude: 73.0039 };

export const BLOCKED_ROUTE: LatLng[] = [
  { latitude: 33.665, longitude: 72.99 },
  { latitude: 33.67, longitude: 72.998 },
  CRISIS_LOCATION,
  { latitude: 33.68, longitude: 73.015 },
];

export const ALTERNATE_ROUTE_KEYPOINTS: LatLng[] = [
  { latitude: 33.665, longitude: 72.99 },
  { latitude: 33.66, longitude: 73 },
  { latitude: 33.662, longitude: 73.01 },
  { latitude: 33.67, longitude: 73.02 },
  { latitude: 33.68, longitude: 73.015 },
];

const interpolatePoints = (p1: LatLng, p2: LatLng, steps: number): LatLng[] => {
  const points: LatLng[] = [];
  for (let i = 1; i <= steps; i++) {
    points.push({
      latitude: p1.latitude + (p2.latitude - p1.latitude) * (i / steps),
      longitude: p1.longitude + (p2.longitude - p1.longitude) * (i / steps),
    });
  }
  return points;
};

const generateDenseRoute = (routeCoords: LatLng[], stepsPerSegment = 8): LatLng[] => {
  let denseRoute: LatLng[] = [routeCoords[0]];
  for (let i = 0; i < routeCoords.length - 1; i++) {
    denseRoute = denseRoute.concat(interpolatePoints(routeCoords[i], routeCoords[i + 1], stepsPerSegment));
  }
  return denseRoute;
};

export const DENSE_ALTERNATE_ROUTE = generateDenseRoute(ALTERNATE_ROUTE_KEYPOINTS, 8);

export type GoogleLatLngLiteral = { lat: number; lng: number };

export function toGoogleMapsPath(points: LatLng[]): GoogleLatLngLiteral[] {
  return points.map((p) => ({ lat: p.latitude, lng: p.longitude }));
}
