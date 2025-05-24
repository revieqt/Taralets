import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import VerticalRule from '@/components/VerticalRule';
import { Octicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useEffect, useRef, useState } from 'react';
import { getUserLocation } from '@/services/mapService';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { decode as decodePolyline } from '@mapbox/polyline';
import { useSession } from '@/context/SessionContext';
const GOOGLE_MAPS_APIKEY = 'AIzaSyDI_dL8xl7gnjcPps-CXgDJM9DtF3oZPVI';

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useSession();
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [activeRoute, setActiveRoute] = useState<any>(null);
  const [routePolyline, setRoutePolyline] = useState<{ latitude: number; longitude: number }[]>([]);
  const [region, setRegion] = useState<any>(null);
  const mapRef = useRef<MapView>(null);

  // Use profileImage from session user
  const profileImage = session?.user?.profileImage || null;

  // Only set region on first load or when userCoords changes for the first time
  useEffect(() => {
    let initialized = false;
    const fetchLocation = async () => {
      const loc = await getUserLocation();
      if (loc) {
        setUserCoords(loc);
        if (!initialized) {
          setRegion({
            latitude: loc.latitude,
            longitude: loc.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          initialized = true;
        }
      }
    };
    fetchLocation();
    const interval = setInterval(fetchLocation, 5000);
    return () => clearInterval(interval);
  }, []);

  // Use activeRoute from session if available, else fetch from Firestore
  useEffect(() => {
    if (session?.activeRoute) {
      setActiveRoute(session.activeRoute);
    } else {
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
          setActiveRoute(route);
        } else {
          setActiveRoute(null);
          setRoutePolyline([]);
        }
      };
      fetchActiveRoute();
    }
  }, [session?.activeRoute]);

  // Polyline: connect user to route points using Google Directions API
  useEffect(() => {
    const fetchPolyline = async () => {
      if (
        userCoords &&
        activeRoute &&
        Array.isArray(activeRoute.location) &&
        activeRoute.location.length > 0
      ) {
        // Build waypoints string for Directions API
        const waypoints = activeRoute.location
          .slice(1, activeRoute.location.length - 1)
          .map((pt: any) => `${pt.latitude},${pt.longitude}`)
          .join('|');

        const origin = `${userCoords.latitude},${userCoords.longitude}`;
        const destination = `${activeRoute.location[activeRoute.location.length - 1].latitude},${activeRoute.location[activeRoute.location.length - 1].longitude}`;

        let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_APIKEY}`;
        if (waypoints) {
          url += `&waypoints=${waypoints}`;
        }

        try {
          const res = await fetch(url);
          const json = await res.json();
          if (json.routes && json.routes.length > 0) {
            const points = decodePolyline(json.routes[0].overview_polyline.points);
            const coords = points.map(([latitude, longitude]: [number, number]) => ({
              latitude,
              longitude,
            }));
            setRoutePolyline(coords);
            // Fit map to route
            if (mapRef.current && coords.length > 0) {
              mapRef.current.fitToCoordinates(coords, {
                edgePadding: { top: 50, bottom: 200, left: 50, right: 50 },
                animated: true,
              });
            }
          } else {
            setRoutePolyline([userCoords, ...activeRoute.location]);
          }
        } catch (e) {
          setRoutePolyline([userCoords, ...activeRoute.location]);
        }
      } else {
        setRoutePolyline([]);
      }
    };
    fetchPolyline();
    // Only rerun when userCoords or activeRoute.location changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCoords, activeRoute?.location]);

  const mapHeader = (height: number) => {
    if (activeRoute && routePolyline.length > 1 && userCoords) {
      return (
        <View style={{ flex: 1, width: '100%', height, borderRadius: 16, overflow: 'hidden' }}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            region={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation={false}
            followsUserLocation={false}
            scrollEnabled={true}
            zoomEnabled={true}
          >
            {/* Polyline: user -> route points */}
            <Polyline
              coordinates={routePolyline}
              strokeWidth={4}
              strokeColor="#205781"
            />
            {/* Route markers */}
            {activeRoute.location.map((point: any, idx: number) => (
              <Marker key={idx} coordinate={point} />
            ))}
            {/* User marker with profile image from session */}
            {userCoords && (
              <Marker coordinate={userCoords}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#205781' }}
                  />
                ) : (
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#205781', alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialIcons name="person" size={24} color="#fff" />
                  </View>
                )}
              </Marker>
            )}
          </MapView>
        </View>
      );
    } else if (userCoords) {
      return (
        <View style={{ flex: 1, width: '100%', height, borderRadius: 16, overflow: 'hidden' }}>
          <MapView
            style={StyleSheet.absoluteFill}
            region={region}
            onRegionChangeComplete={setRegion}
          >
            <Marker coordinate={userCoords}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#205781' }}
                />
              ) : (
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#205781', alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialIcons name="person" size={24} color="#fff" />
                </View>
              )}
            </Marker>
          </MapView>
        </View>
      );
    } else {
      return (
        <View style={[styles.map, { height, justifyContent: 'center', alignItems: 'center' }]}>
          <ThemedText>Loading map...</ThemedText>
        </View>
      );
    }
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