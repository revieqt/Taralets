import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import TaraMap from './TaraMap';
import TaraMarker from './TaraMarker';
import { Polyline, Marker } from 'react-native-maps';
import { useSession } from '@/context/SessionContext';
import { getRouteById } from '@/services/firestore/routeDbService';
import { useTraceRoute } from '@/hooks/useTraceRoute';
import { useSnappedPolyline } from '@/hooks/useSnappedPolyline';
import { DeviceMotion } from 'expo-sensors';

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
  const { routeCoords: liveCoords, heading } = useTraceRoute();
  const liveCoord = liveCoords.length > 0 ? liveCoords[liveCoords.length - 1] : null;

  // Device orientation state
  const [devicePitch, setDevicePitch] = useState(85); // default to max tilt
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);

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

  // Listen to device orientation when in 3D mode
  useEffect(() => {
    let subscription: any;
    if (is3D) {
      subscription = DeviceMotion.addListener((motion) => {
        // For horizontal-only movement, ignore device pitch and use max tilt
        setDevicePitch(85);

        // Yaw (alpha/z) is compass heading in radians, convert to degrees
        const yaw = motion.rotation?.alpha ?? 0;
        let headingDeg = yaw * (180 / Math.PI);
        if (headingDeg < 0) headingDeg += 360;
        setDeviceHeading(headingDeg);
      });
      DeviceMotion.setUpdateInterval(200);
    }
    return () => {
      if (subscription) subscription.remove();
    };
  }, [is3D]);

  // Camera settings for 3D and 2D
  const cameraProps = liveCoord
    ? is3D
      ? {
          center: {
            latitude: liveCoord.latitude,
            longitude: liveCoord.longitude,
          },
          pitch: 85, // always max tilt for first-person, ignore devicePitch for vertical
          heading: deviceHeading ?? heading ?? 0, // use device heading or fallback to GPS heading
          zoom: 21, // zoom in more on the user
          altitude: 100,
          animationDuration: 200,
        }
      : {
          center: {
            latitude: liveCoord.latitude,
            longitude: liveCoord.longitude,
          },
          pitch: 0,
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
          latitudeDelta: 0.0005, // smaller delta for tighter zoom
          longitudeDelta: 0.0005,
        }
      : region;

  // Arrow marker for 3D guidance
  let arrowMarker = null;
  if (is3D && liveCoord && snappedCoords.length > 1) {
    // Find the closest point ahead on the route
    const userLat = liveCoord.latitude;
    const userLon = liveCoord.longitude;

    // Find the next point on the snapped route that is not the user's current location
    let nextPoint = null;
    for (let i = 0; i < snappedCoords.length; i++) {
      const pt = snappedCoords[i];
      if (
        Math.abs(pt.latitude - userLat) > 0.00005 ||
        Math.abs(pt.longitude - userLon) > 0.00005
      ) {
        nextPoint = pt;
        break;
      }
    }

    // If found, calculate bearing from user to next point
    if (nextPoint) {
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const toDeg = (rad: number) => (rad * 180) / Math.PI;
      const dLon = toRad(nextPoint.longitude - userLon);
      const lat1 = toRad(userLat);
      const lat2 = toRad(nextPoint.latitude);

      const y = Math.sin(dLon) * Math.cos(lat2);
      const x =
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
      let bearing = toDeg(Math.atan2(y, x));
      bearing = (bearing + 360) % 360;

      // Place an arrow marker a few meters ahead of the user
      const arrowLat =
        userLat + (nextPoint.latitude - userLat) * 0.05;
      const arrowLon =
        userLon + (nextPoint.longitude - userLon) * 0.05;

      arrowMarker = (
        <Marker
          coordinate={{ latitude: arrowLat, longitude: arrowLon }}
          anchor={{ x: 0.5, y: 0.5 }}
          flat
          rotation={bearing}
          tracksViewChanges={false}
        >
          <View style={{
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent'
          }}>
            <View style={{
              width: 0,
              height: 0,
              borderLeftWidth: 10,
              borderRightWidth: 10,
              borderBottomWidth: 24,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: '#00CAFF',
              opacity: 0.85,
              transform: [{ rotate: '180deg' }]
            }} />
          </View>
        </Marker>
      );
    }
  }

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

        {/* Arrow marker for 3D first-person guidance */}
        {arrowMarker}
      </TaraMap>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});