import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import TaraMap from '../TaraMap';
import TaraMarker from '../TaraMarker';
import { Polyline } from 'react-native-maps';
import { useSession } from '@/context/SessionContext';
import { getRouteById } from '@/services/firestore/routeDbService';
import { useTraceRoute } from '@/hooks/useTraceRoute';
import { useSnappedPolyline } from '@/hooks/useSnappedPolyline';

type LiveTrackingMapProps = {
  routeId?: string;
  is3D?: boolean;
};

const DEFAULT_REGION = {
  latitude: 14.5995,
  longitude: 120.9842,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function LiveTrackingMap({ routeId, is3D = false }: LiveTrackingMapProps) {
  const { session } = useSession();
  const [stops, setStops] = useState<{ latitude: number; longitude: number; locationName: string }[]>([]);
  const [region, setRegion] = useState(DEFAULT_REGION);

  // For live user tracking
  const { routeCoords: liveCoords } = useTraceRoute();
  const liveCoord = liveCoords.length > 0 ? liveCoords[liveCoords.length - 1] : null;

  // Get snapped polyline coordinates from Google Directions API
  const { snappedCoords } = useSnappedPolyline(stops);

  useEffect(() => {
    if (!routeId) return;
    getRouteById(routeId).then((route) => {
      if (route && route.location && route.location.length > 0) {
        setStops(route.location);
        setRegion({
          latitude: route.location[0].latitude,
          longitude: route.location[0].longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    });
  }, [routeId]);

  // Camera settings for 3D and 2D
  const cameraProps = liveCoord
    ? is3D
      ? {
          center: {
            latitude: liveCoord.latitude,
            longitude: liveCoord.longitude,
          },
          pitch: 85, // max tilt for 3D effect
          heading: 0,
          zoom: 19,
          altitude: 100,
          animationDuration: 500,
        }
      : {
          center: {
            latitude: liveCoord.latitude,
            longitude: liveCoord.longitude,
          },
          pitch: 0, // flat for 2D
          heading: 0,
          zoom: 16,
          altitude: 300,
          animationDuration: 500,
        }
    : undefined;

  // Region for 3D and 2D
  const mapRegion =
    is3D && liveCoord
      ? {
          latitude: liveCoord.latitude,
          longitude: liveCoord.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        }
      : region;

  return (
    <View style={styles.container}>
      <TaraMap
        region={mapRegion}
        showMarker={false}
        mapStyle={styles.map}
        cameraProps={cameraProps}
      >
        {/* Polyline for route (snapped to roads) */}
        {snappedCoords.length > 1 && (
          <Polyline
            coordinates={snappedCoords}
            strokeColor="#0065F8"
            strokeWidth={4}
          />
        )}

        {/* Markers for each stop */}
        {stops.map((stop, idx) => (
          <TaraMarker
            key={idx}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            color="#0065F8"
            label={`${idx + 1}`}
          />
        ))}

        {/* Live user marker (always follows you) */}
        {liveCoord && session?.user && (
          <TaraMarker
            coordinate={liveCoord}
            color="#0065F8"
            icon={session.user.profileImage}
            label={session.user.fname}
          />
        )}
      </TaraMap>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});