export type GeoPoint = { lat: number; lng: number; label: string };

export const geoHubs: Record<string, GeoPoint> = {
  "Hà Nội": { lat: 21.0285, lng: 105.8542, label: "HN" },
  "Hải Phòng": { lat: 20.8449, lng: 106.6881, label: "HP" },
  "Bắc Ninh": { lat: 21.1861, lng: 106.0763, label: "BN" },
  "Đà Nẵng": { lat: 16.0544, lng: 108.2022, label: "DN" },
  "TP.HCM": { lat: 10.8231, lng: 106.6297, label: "HCM" },
  "Bình Dương": { lat: 11.3254, lng: 106.477, label: "BD" },
  "Đồng Nai": { lat: 10.9574, lng: 106.8427, label: "ĐN" },
  "Cần Thơ": { lat: 10.0452, lng: 105.7469, label: "CT" }
};

/** Default Bắc → Nam route for tracking demo */
export const defaultRoute: GeoPoint[] = [
  geoHubs["Hải Phòng"],
  geoHubs["Đà Nẵng"],
  geoHubs["Bình Dương"],
  geoHubs["TP.HCM"]
];

export function interpolateRoute(points: GeoPoint[], progress: number): GeoPoint {
  const t = Math.max(0, Math.min(1, progress));
  const segments = points.length - 1;
  const pos = t * segments;
  const idx = Math.min(Math.floor(pos), segments - 1);
  const frac = pos - idx;
  const a = points[idx];
  const b = points[idx + 1] ?? points[idx];
  return {
    lat: a.lat + (b.lat - a.lat) * frac,
    lng: a.lng + (b.lng - a.lng) * frac,
    label: "XE"
  };
}
