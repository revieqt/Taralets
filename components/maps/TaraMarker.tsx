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
  label?: string; // optional label or number
}

const TaraMarker: React.FC<TaraMarkerProps> = ({ coordinate, color = '#0065F8', icon, label }) => {
  return (
    <Marker coordinate={coordinate}>
      <View style={styles.container}>
        <View style={[styles.circle, { borderColor: color }]}>
          {icon ? (
            <Image source={{ uri: icon }} style={styles.icon} />
          ) : (
            <Text style={[styles.label, { color }]}>{label}</Text>
          )}
        </View>
        <View style={[styles.pin, { backgroundColor: color }]} />
      </View>
    </Marker>
  );
};

export default TaraMarker;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  icon: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  pin: {
    width: 4,
    height: 14,
    borderRadius: 2,
    marginTop: -2,
    zIndex: 1,
  },
});