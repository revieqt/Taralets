import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import useUserLocation from './useUserLocation';

export function useTraceRoute() {
  const { userCoordinates, errorMessage } = useUserLocation();
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [heading, setHeading] = useState<number | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (location) => {
          const { latitude, longitude, heading: locHeading } = location.coords;
          setRouteCoords((prev) => {
            if (
              prev.length === 0 ||
              prev[prev.length - 1].latitude !== latitude ||
              prev[prev.length - 1].longitude !== longitude
            ) {
              const updated = [...prev, { latitude, longitude }];
              return updated;
            }
            return prev;
          });
          if (typeof locHeading === 'number' && !isNaN(locHeading)) {
            setHeading(locHeading);
          }
        }
      );
    };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCoordinates.lat, userCoordinates.lon]);

  return { routeCoords, heading, errorMessage };
}