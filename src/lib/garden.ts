export const GARDEN = {
  name: '原生植物園區',
  south: 23.9237,
  north: 23.9245,
  west: 120.5475,
  east: 120.5484,
}

export function gardenPoint(lat: number, lng: number) {
  const x = (lng - GARDEN.west) / (GARDEN.east - GARDEN.west)
  const y = (GARDEN.north - lat) / (GARDEN.north - GARDEN.south)
  return {
    x: Math.min(1, Math.max(0, x)),
    y: Math.min(1, Math.max(0, y)),
  }
}

export function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const rad = Math.PI / 180
  const dLat = (lat2 - lat1) * rad
  const dLng = (lng2 - lng1) * rad
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
