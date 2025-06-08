import metroCebuData from '../assets/address-metroCebu.json';

interface Barangay {
  name?: string; // Accept both "name" and "barangay" keys
  barangay?: string;
  lat: number;
  lon: number;
}

interface CityGroup {
  city: string;
  districts: Barangay[];
}

const toRad = (deg: number): number => deg * (Math.PI / 180);

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const offlineReverseGeocode = (lat: number, lon: number): string => {
  let nearestDistrict: string | null = null;
  let nearestCity: string | null = null;
  let minDistance = Infinity;

  for (const cityGroup of metroCebuData as CityGroup[]) {
    for (const district of cityGroup.districts) {
      // Support both "name" and "barangay" keys
      const districtName = district.name || district.barangay || '';
      const distance = haversineDistance(lat, lon, district.lat, district.lon);
      if (distance < minDistance) {
        minDistance = distance;
        nearestDistrict = districtName;
        nearestCity = cityGroup.city;
      }
    }
  }

  return nearestDistrict && nearestCity
    ? `${nearestDistrict}, ${nearestCity}`
    : 'Unknown location';
};

export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from online API');
    }

    const data = await response.json();

    if (data?.address) {
      const { suburb, city, town, village } = data.address;
      const name = [suburb, city || town || village].filter(Boolean).join(', ');
      return name || data.display_name || 'Unknown location';
    }

    return 'Unknown location';
  } catch (error) {
    console.warn('Online reverse geocoding failed. Using offline fallback.', error);
    return offlineReverseGeocode(lat, lon);
  }
};