// utils/userAddress.js
import { useState, useEffect } from 'react';
import { useUserLocation } from '../hooks/useUserLocation';

const useUserAddress = () => {
  const { userCoordinates, errorMessage } = useUserLocation();
  const [address, setAddress] = useState({
    street: null,
    district: null,
    city: null,
    province: null,
    country: null,
  });

  useEffect(() => {
    const getAddress = async (lat, lon) => {
      if (!lat || !lon) return;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const data = await response.json();
        const { address } = data;

        setAddress({
          street: address.road || null,
          district: address.suburb || address.neighbourhood || null,
          city: address.city || address.town || address.village || null,
          province: address.state || null,
          country: address.country || null,
        });
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    };

    if (userCoordinates.lat && userCoordinates.lon) {
      getAddress(userCoordinates.lat, userCoordinates.lon);
    }
  }, [userCoordinates]);

  return { address, errorMessage };
};

export default useUserAddress; // Ensure it's exported as default
