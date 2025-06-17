import React, { ReactNode, useEffect, useRef } from 'react';
import { StyleSheet, ViewStyle, StyleProp, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region, MapViewProps, Camera} from 'react-native-maps';
import TaraMarker from './TaraMarker';
import { useSession } from '@/context/SessionContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/useColorScheme';
import useUserLocation from '@/hooks/useUserLocation';

const mapLayoutLight = [
  {
    "featureType": "all",
    "elementType": "geometry.fill",
    "stylers": [{ "weight": "2.00" }]
  },
  {
    "featureType": "all",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#9c9c9c" }]
  },
  {
    "featureType": "all",
    "elementType": "labels.text",
    "stylers": [{ "visibility": "on" }]
  },
  {
    "featureType": "landscape",
    "elementType": "all",
    "stylers": [{ "color": "#f2f2f2" }]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "landscape.man_made",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "road",
    "elementType": "all",
    "stylers": [{ "saturation": -100 }, { "lightness": 45 }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#7b7b7b" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "all",
    "stylers": [{ "visibility": "simplified" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "transit",
    "elementType": "all",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "water",
    "elementType": "all",
    "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#b5dae1" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#070707" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#ffffff" }]
  }
];

const mapLayoutDark = [
  {
    "featureType": "all",
    "elementType": "geometry",
    "stylers": [{ "color": "#202c3e" }]
  },
  {
    "featureType": "all",
    "elementType": "labels.text.fill",
    "stylers": [
      { "gamma": 0.01 },
      { "lightness": 20 },
      { "weight": "1.39" },
      { "color": "#ffffff" }
    ]
  },
  {
    "featureType": "all",
    "elementType": "labels.text.stroke",
    "stylers": [
      { "weight": "0.96" },
      { "saturation": "9" },
      { "visibility": "on" },
      { "color": "#000000" }
    ]
  },
  {
    "featureType": "all",
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry",
    "stylers": [
      { "lightness": 30 },
      { "saturation": "9" },
      { "color": "#29446b" }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "saturation": 20 }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      { "lightness": 20 },
      { "saturation": -20 }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      { "lightness": 10 },
      { "saturation": -30 }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#193a55" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
      { "saturation": 25 },
      { "lightness": 25 },
      { "weight": "0.01" }
    ]
  },
  {
    "featureType": "water",
    "elementType": "all",
    "stylers": [{ "lightness": -20 }]
  }
];

type CameraProps = {
  center: { latitude: number; longitude: number };
  pitch?: number;
  heading?: number;
  zoom?: number;
  altitude?: number;
  animationDuration?: number;
};

type TaraMapProps = {
  region?: Region;
  showMarker?: boolean;
  markerTitle?: string;
  markerDescription?: string;
  mapStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
  cameraProps?: CameraProps; // <-- Accept cameraProps
};

const TaraMap: React.FC<TaraMapProps> = ({
  region,
  showMarker = true,
  markerTitle = 'You are here',
  markerDescription = 'Current Location',
  mapStyle,
  children,
  cameraProps,
}) => {
  const { session } = useSession();
  const colorScheme = useColorScheme();
  const { userCoordinates } = useUserLocation();
  const mapRef = useRef<MapView>(null);

  // Always center the map on the user's current location (unless using cameraProps)
  useEffect(() => {
    if (
      !cameraProps &&
      userCoordinates.lat !== 0 &&
      userCoordinates.lon !== 0 &&
      mapRef.current
    ) {
      mapRef.current.animateToRegion(
        {
          latitude: userCoordinates.lat,
          longitude: userCoordinates.lon,
          latitudeDelta: region?.latitudeDelta ?? 0.01,
          longitudeDelta: region?.longitudeDelta ?? 0.01,
        },
        500
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCoordinates.lat, userCoordinates.lon]);

  // Animate camera if cameraProps is provided
  useEffect(() => {
    if (cameraProps && mapRef.current) {
      const camera: Partial<Camera> = {
        center: cameraProps.center,
        pitch: cameraProps.pitch ?? 0,
        heading: cameraProps.heading ?? 0,
        zoom: cameraProps.zoom ?? 16,
        altitude: cameraProps.altitude,
      };
      mapRef.current.animateCamera(camera, { duration: cameraProps.animationDuration ?? 500 });
    }
  }, [cameraProps?.center?.latitude, cameraProps?.center?.longitude, cameraProps?.pitch, cameraProps?.heading, cameraProps?.zoom, cameraProps?.altitude, cameraProps?.animationDuration]);

  const customMapStyle = colorScheme === 'dark' ? mapLayoutDark : mapLayoutLight;

  // Use userCoordinates as region if region prop is not provided
  const initialRegion: Region = region ?? {
    latitude: userCoordinates.lat || 14.5995,
    longitude: userCoordinates.lon || 120.9842,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={[styles.map, mapStyle]}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        customMapStyle={customMapStyle}
      >
        {showMarker && session && userCoordinates.lat !== 0 && userCoordinates.lon !== 0 && (
          <TaraMarker
            coordinate={{
              latitude: userCoordinates.lat,
              longitude: userCoordinates.lon,
            }}
            color="#0065F8"
            icon={session.user?.profileImage}
          />
        )}
        {children}
      </MapView>
      <LinearGradient
        colors={['rgba(0, 255, 222, 0)','rgba(255,255,255,1)' ]}
        style={styles.bottomFade}
        pointerEvents="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '10%',
    zIndex: 10,
  },
});

export default TaraMap;