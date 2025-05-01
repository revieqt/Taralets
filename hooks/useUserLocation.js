// useUserLocation.js
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

const useUserLocation = () => {
  const [userCoordinates, setUserCoordinates] = useState({ lat: null, lon: null });
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        // Request permission to access location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMessage('Permission to access location was denied');
          return;
        }

        // Get current location
        let location = await Location.getCurrentPositionAsync({});
        setUserCoordinates({
          lat: location.coords.latitude,
          lon: location.coords.longitude,
        });
      } catch (error) {
        setErrorMessage('Failed to fetch location');
      }
    };

    getUserLocation();
  }, []);

  return { userCoordinates, errorMessage };
};

export default useUserLocation;
