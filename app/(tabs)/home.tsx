import { StyleSheet, View, TouchableOpacity } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import VerticalRule from '@/components/VerticalRule';
import { Octicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useEffect, useState } from 'react';
import { getUserLocation } from '@/services/mapService';

export default function HomeScreen() {
  const router = useRouter();
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      const loc = await getUserLocation();
      if (loc) setUserCoords(loc);
    };
    fetchLocation();
  }, []);

  // The header is now a function that receives the animated height
  const mapHeader = (height: number) =>
    userCoords ? (
      <View style={{ flex: 1, width: '100%', height, borderRadius: 16, overflow: 'hidden' }}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: userCoords.latitude,
            longitude: userCoords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={userCoords} />
        </MapView>
      </View>
    ) : (
      <View style={[styles.map, { height, justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText>Loading map...</ThemedText>
      </View>
    );

  return (
    <ParallaxScrollView header={mapHeader}>
      <View style={styles.menuContainer}>
        <TouchableOpacity onPress={() => router.push('/routes')} style={styles.menuButton}>
          <MaterialIcons name="route" size={24} color="black" />
          <ThemedText>Routes</ThemedText>
        </TouchableOpacity>

        <View style={styles.verticalRule}>
          <VerticalRule height="50%" color="#aaa" thickness={1} />
        </View>

        <TouchableOpacity onPress={() => router.push('/itineraries/itineraries')} style={styles.menuButton}>
          <Octicons name="paper-airplane" size={24} color="black" />
          <ThemedText>Itineraries</ThemedText>
        </TouchableOpacity>

        <View style={styles.verticalRule}>
          <VerticalRule height="50%" color="#aaa" thickness={1} />
        </View>

        <TouchableOpacity onPress={() => router.push('/weather')} style={styles.menuButton}>
          <MaterialCommunityIcons name="weather-sunset" size={24} color="black" />
          <ThemedText>Weather</ThemedText>
        </TouchableOpacity>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuContainer: {
    width: '100%',
    height: 80,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
  },
  menuButton: {
    width: '28%',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    gap: 5,
  },
  verticalRule: {
    alignSelf: 'center',
  },
});