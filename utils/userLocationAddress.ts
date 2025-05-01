import axios from 'axios';

interface LocationData {
  street: string;
  city: string;
  district: string;
  province: string;
  country: string;
}

const userLocation = {
  async street(lat: number, lon: number): Promise<string> {
    const address = await getAddress(lat, lon);
    return address.street;
  },

  async city(lat: number, lon: number): Promise<string> {
    const address = await getAddress(lat, lon);
    return address.city;
  },

  async district(lat: number, lon: number): Promise<string> {
    const address = await getAddress(lat, lon);
    return address.district;
  },

  async province(lat: number, lon: number): Promise<string> {
    const address = await getAddress(lat, lon);
    return address.province;
  },

  async country(lat: number, lon: number): Promise<string> {
    const address = await getAddress(lat, lon);
    return address.country;
  },
};

async function getAddress(lat: number, lon: number): Promise<LocationData> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'TaraApp/1.0 (your-email@example.com)', // Replace with real contact email
      },
    });

    const address = response.data.address;
    console.log('Nominatim address response:', address); // DEBUG LOG

    return {
      street:
        address.road ||
        address.residential ||
        address.pedestrian ||
        address.footway ||
        address.path ||
        address.neighbourhood ||
        'Unknown street',
      city:
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        'Unknown city',
      district: address.suburb || address.city_district || address.district || 'Unknown district',
      province: address.state || 'Unknown province',
      country: address.country || 'Unknown country',
    };
  } catch (error) {
    console.error('Error fetching address from Nominatim:', error);
    return {
      street: 'Unknown street',
      city: 'Unknown city',
      district: 'Unknown district',
      province: 'Unknown province',
      country: 'Unknown country',
    };
  }
}

export default userLocation;
