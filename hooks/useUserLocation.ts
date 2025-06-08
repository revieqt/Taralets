import { useState, useEffect } from "react";
import * as Location from 'expo-location';

const useUserLocation = () => {
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number, lon: number }>({ lat: 0, lon: 0 });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage('Permission to access location was denied');
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setUserCoordinates({
          lat: location.coords.latitude,
          lon: location.coords.longitude,
        });
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    })();
  }, []);

  return { userCoordinates, errorMessage };
};

export default useUserLocation;