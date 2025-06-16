import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';

interface TaraMarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  color?: string; // default = #0065F8
  icon?: string; // optional URL or local path to profile photo
  label?: string; // optional label
}

const TaraMarker: React.FC<TaraMarkerProps> = ({ coordinate, color = '#0065F8', icon, label }) => {
  return (
    <Marker coordinate={coordinate}>
      <View style={[styles.markerContainer, { borderColor: color }]}>
        {icon ? (
          <Image source={{ uri: icon }} style={styles.icon} />
        ) : (
          <View style={[styles.dot, { backgroundColor: color }]} />
        )}
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
    </Marker>
  );
};

export default TaraMarker;

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 1,
    borderWidth: 2,
    borderRadius: 30,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  icon: {
    width: 30,
    height: 30,
    borderRadius: 30,
  },
  label: {
    marginTop: 2,
    fontSize: 10,
    color: '#333',
    fontWeight: '600',
  },
});
