const ALTERNATE_ROUTE_KEYPOINTS = [
  { latitude: 33.6650, longitude: 72.9900 },
  { latitude: 33.6600, longitude: 73.0000 },
  { latitude: 33.6620, longitude: 73.0100 },
  { latitude: 33.6700, longitude: 73.0200 },
  { latitude: 33.6800, longitude: 73.0150 }
];

const interpolatePoints = (p1, p2, steps) => {
  const points = [];
  for (let i = 1; i <= steps; i++) {
    points.push({
      latitude: p1.latitude + (p2.latitude - p1.latitude) * (i / steps),
      longitude: p1.longitude + (p2.longitude - p1.longitude) * (i / steps),
    });
  }
  return points;
};

const generateDenseRoute = (routeCoords, stepsPerSegment = 8) => {
  let denseRoute = [routeCoords[0]];
  for (let i = 0; i < routeCoords.length - 1; i++) {
    const interpolated = interpolatePoints(routeCoords[i], routeCoords[i+1], stepsPerSegment);
    denseRoute = denseRoute.concat(interpolated);
  }
  return denseRoute;
};

const DENSE = generateDenseRoute(ALTERNATE_ROUTE_KEYPOINTS, 8);
console.log(JSON.stringify(DENSE));
