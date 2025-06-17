import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import useUserLocation from './useUserLocation';

export function useTraceRoute() {
  const { userCoordinates, errorMessage } = useUserLocation();
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);

  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // update more frequently for testing
          distanceInterval: 5, // update on every meter for testing
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          setRouteCoords((prev) => {
            if (
              prev.length === 0 ||
              prev[prev.length - 1].latitude !== latitude ||
              prev[prev.length - 1].longitude !== longitude
            ) {
              const updated = [...prev, { latitude, longitude }];
              console.log('TraceRoute:', updated);
              return updated;
            }
            return prev;
          });
        }
      );
    };

    // Add the initial location only once if available and not already set
    if (
      userCoordinates.lat !== 0 &&
      userCoordinates.lon !== 0 &&
      routeCoords.length === 0
    ) {
      setRouteCoords([{ latitude: userCoordinates.lat, longitude: userCoordinates.lon }]);
    }

    startTracking();

    return () => {
      subscription?.remove();
    };
    // Only run on mount and when userCoordinates changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCoordinates.lat, userCoordinates.lon]);

  return { routeCoords, errorMessage };
}