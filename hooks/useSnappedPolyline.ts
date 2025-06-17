import { useEffect, useState } from 'react';
import { decode as decodePolyline } from '@mapbox/polyline';

const GOOGLE_MAPS_APIKEY = 'AIzaSyDI_dL8xl7gnjcPps-CXgDJM9DtF3oZPVI';

type Stop = { latitude: number; longitude: number; locationName?: string };

/**
 * Hook to fetch and decode a snapped polyline from Google Directions API.
 * @param stops Array of stops (at least 2) with latitude and longitude.
 * @returns Array of { latitude, longitude } for the snapped polyline.
 */
export function useSnappedPolyline(stops: Stop[]) {
  const [snappedCoords, setSnappedCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!stops || stops.length < 2) {
      setSnappedCoords([]);
      return;
    }

    const fetchPolyline = async () => {
      setLoading(true);
      const origin = `${stops[0].latitude},${stops[0].longitude}`;
      const destination = `${stops[stops.length - 1].latitude},${stops[stops.length - 1].longitude}`;
      const waypoints =
        stops.length > 2
          ? stops.slice(1, stops.length - 1).map((pt) => `${pt.latitude},${pt.longitude}`).join('|')
          : '';

      let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_APIKEY}`;
      if (waypoints) url += `&waypoints=${waypoints}`;

      try {
        const res = await fetch(url);
        const json = await res.json();
        if (json.routes && json.routes.length > 0) {
          const points = decodePolyline(json.routes[0].overview_polyline.points);
          setSnappedCoords(
            points.map(([latitude, longitude]: [number, number]) => ({
              latitude,
              longitude,
            }))
          );
        } else {
          // fallback to straight lines
          setSnappedCoords(stops.map((pt) => ({ latitude: pt.latitude, longitude: pt.longitude })));
        }
      } catch {
        setSnappedCoords(stops.map((pt) => ({ latitude: pt.latitude, longitude: pt.longitude })));
      } finally {
        setLoading(false);
      }
    };

    fetchPolyline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(stops)]);

  return { snappedCoords, loading };
}