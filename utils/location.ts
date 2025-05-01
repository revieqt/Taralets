// utils/location.ts
export type UserLocation = {
  lat: number;
  long: number;
};

export async function getUserLocation(): Promise<UserLocation | null> {
  try {
    // Simulate fetching location data (replace with actual logic to get lat/long)
    const lat = 12.345678; // Example latitude
    const long = 98.765432; // Example longitude

    return { lat, long };
  } catch (error) {
    console.error('Failed to get user location:', error);
    return null;
  }
}
