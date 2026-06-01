/** Mở Google Maps chỉ đường tới địa chỉ (mobile mở app nếu có). */
export function mapsDirectionsUrl(address: string) {
  const q = encodeURIComponent(address.trim());
  return `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=driving`;
}
