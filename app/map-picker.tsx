import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function MapPickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [location, setLocation] = useState({ latitude: 14.5995, longitude: 120.9842 });

  const handleMapPress = (e: MapPressEvent) => {
    setLocation(e.nativeEvent.coordinate);
  };

  const handleSetLocation = () => {
  router.replace({
    pathname: '/itineraries/create',
    params: {
      ...params, // pass back all previous params
      pickedLatitude: location.latitude,
      pickedLongitude: location.longitude,
      mapPickerFor: params.mapPickerFor,
    },
  });
};

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        onPress={handleMapPress}
        initialRegion={{
          ...location,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={location} />
      </MapView>
      <Button title="Set Location" onPress={handleSetLocation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});