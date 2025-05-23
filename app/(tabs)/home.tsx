import { StyleSheet, View, TouchableOpacity } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import VerticalRule from '@/components/VerticalRule';
import { Octicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useEffect, useState } from 'react';
import { getUserLocation } from '@/services/mapService';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function HomeScreen() {
  const router = useRouter();
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [activeRoute, setActiveRoute] = useState<any>(null);

  // Fetch user location
  useEffect(() => {
    const fetchLocation = async () => {
      const loc = await getUserLocation();
      if (loc) setUserCoords(loc);
    };
    fetchLocation();
  }, []);

  // Fetch active route from Firestore
  useEffect(() => {
    const fetchActiveRoute = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      const db = getFirestore();
      const q = query(
        collection(db, 'routes'),
        where('userID', '==', user.uid),
        where('status', '==', 'active')
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const route = snap.docs[0].data();
        // Ensure location is an array of {latitude, longitude}
        setActiveRoute(route);
      } else {
        setActiveRoute(null);
      }
    };
    fetchActiveRoute();
  }, []);

  const mapHeader = (height: number) => {
  // Defensive conversion
  const routeCoords = Array.isArray(activeRoute?.location)
    ? activeRoute.location.map((pt: any) =>
        pt.latitude !== undefined && pt.longitude !== undefined
          ? { latitude: pt.latitude, longitude: pt.longitude }
          : Array.isArray(pt)
          ? { latitude: pt[0], longitude: pt[1] }
          : null
      ).filter(Boolean)
    : [];

  return routeCoords.length > 0 ? (
    <View style={{ flex: 1, width: '100%', height, borderRadius: 16, overflow: 'hidden' }}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: routeCoords[0].latitude,
          longitude: routeCoords[0].longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Polyline
          coordinates={routeCoords}
          strokeWidth={4}
          strokeColor="#205781"
        />
        {routeCoords.map((point, idx) => (
          <Marker key={idx} coordinate={point} />
        ))}
      </MapView>
      <View style={{ position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 8, padding: 8 }}>
        <ThemedText type="subtitle">Live Route Tracking</ThemedText>
      </View>
    </View>
  ) : userCoords ? (
    <View style={{ flex: 1, width: '100%', height, borderRadius: 16, overflow: 'hidden' }}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: userCoords.latitude,
          longitude: userCoords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
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
};

  return (
    <ParallaxScrollView header={mapHeader}>
      <View style={styles.menuContainer}>
        <TouchableOpacity onPress={() => router.push('/routes/routes')} style={styles.menuButton}>
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