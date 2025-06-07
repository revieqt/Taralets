import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

type TaraMapProps = {
  region: Region;
  showMarker?: boolean;
  markerTitle?: string;
  markerDescription?: string;
};

const TaraMap: React.FC<TaraMapProps> = ({
  region,
  showMarker = true,
  markerTitle = 'You are here',
  markerDescription = 'Current Location',
}) => {
  return (
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        customMapStyle={mapStyle}
      >
      </MapView>
  );
};

export default TaraMap;

// 🧭 Custom modern map styling (light gray theme)
const mapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#ebe3cd' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#523735' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#f5f1e6' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#c9b2a6' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#f5f1e6' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#f8c967' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#b9d3c2' }],
  },
];

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
