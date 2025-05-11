import * as Location from 'expo-location';

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export async function getUserLocation(): Promise<UserLocation | null> {
  try {
    // Ask for permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
    // Get current position
    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Returns the OpenStreetMap tile URL for a given x, y, z (zoom) tile.
 */
export function getOSMTileUrl(x: number, y: number, z: number): string {
  return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
}