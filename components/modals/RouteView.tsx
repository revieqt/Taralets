import React, { useEffect, useState } from 'react';
import { Modal, View, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { db } from '../../services/firestore/config'; // Adjust the import path as necessary
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ThemedText } from '@/components/ThemedText';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { decode as decodePolyline } from '@mapbox/polyline';
import { Ionicons } from '@expo/vector-icons';
import OutlineButton from '@/components/OutlineButton';
import GradientButton from '@/components/GradientButton';
import { useSession } from '@/context/SessionContext';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const GOOGLE_MAPS_APIKEY = 'AIzaSyDI_dL8xl7gnjcPps-CXgDJM9DtF3oZPVI';

export default function RouteView({ id, visible, onClose }: { id: string, visible: boolean, onClose: () => void }) {
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [polylineCoords, setPolylineCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const { session, updateSession } = useSession();
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!id || !visible) return;
    setLoading(true);
    const fetchRoute = async () => {
      try {
        const docRef = doc(db, 'routes', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) setRoute({ id: snap.id, ...snap.data() });
        else setRoute(null);
      } catch {
        setRoute(null);
      }
      setLoading(false);
    };
    fetchRoute();
  }, [id, visible]);

  // Fetch road-following polyline when route is loaded
  useEffect(() => {
    const fetchPolyline = async () => {
      if (route && Array.isArray(route.location) && route.location.length > 1) {
        const locs = route.location;
        const origin = `${locs[0].latitude},${locs[0].longitude}`;
        const destination = `${locs[locs.length - 1].latitude},${locs[locs.length - 1].longitude}`;
        const waypoints = locs.length > 2
          ? locs.slice(1, locs.length - 1).map((pt: any) => `${pt.latitude},${pt.longitude}`).join('|')
          : '';

        let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_APIKEY}`;
        if (waypoints) url += `&waypoints=${waypoints}`;

        try {
          const res = await fetch(url);
          const json = await res.json();
          if (json.routes && json.routes.length > 0) {
            const points = decodePolyline(json.routes[0].overview_polyline.points);
            const coords = points.map(([latitude, longitude]: [number, number]) => ({
              latitude,
              longitude,
            }));
            setPolylineCoords(coords);
          } else {
            setPolylineCoords(locs.map((pt: any) => ({ latitude: pt.latitude, longitude: pt.longitude })));
          }
        } catch {
          setPolylineCoords(locs.map((pt: any) => ({ latitude: pt.latitude, longitude: pt.longitude })));
        }
      } else {
        setPolylineCoords([]);
      }
    };
    fetchPolyline();
  }, [route]);

  // Helper to get region for map
  const getMapRegion = (locations: any[]) => {
    if (!locations || locations.length === 0) {
      return {
        latitude: 14.5995,
        longitude: 120.9842,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
    const lats = locations.map((l: any) => l.latitude);
    const lngs = locations.map((l: any) => l.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(0.01, (maxLat - minLat) * 1.5),
      longitudeDelta: Math.max(0.01, (maxLng - minLng) * 1.5),
    };
  };

  // Archive (delete) route
  const handleArchive = async () => {
    Alert.alert(
      "Archive Route",
      "Are you sure you want to archive this route?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'routes', id), { status: 'archived' });
              Alert.alert("Route archived.");
              onClose();
            } catch {
              Alert.alert("Failed to archive route.");
            }
          }
        }
      ]
    );
  };

  // Start route
  const handleStartRoute = async () => {
    if (!route) return;
    if (session?.activeRoute) {
      Alert.alert('You already have an active route. Please finish it before starting a new one.');
      return;
    }
    setStarting(true);
    try {
      await updateDoc(doc(db, 'routes', id), { status: 'active' });
      await updateSession({
        activeRoute: {
          userID: route.userID,
          location: route.location,
          status: 'active',
          createdOn: new Date(),
        }
      });
      Alert.alert('Route started!');
      onClose();
      router.replace('/(tabs)/home');
    } catch {
      Alert.alert('Failed to start route.');
    }
    setStarting(false);
  };

  // End route
  const handleEndRoute = async () => {
    if (!route) return;
    setStarting(true);
    try {
      await updateDoc(doc(db, 'routes', id), { status: 'completed' });
      await updateSession({
        activeRoute: undefined
      });
      Alert.alert('Route ended!');
      onClose();
      router.replace('/(tabs)/home');
    } catch {
      Alert.alert('Failed to end route.');
    }
    setStarting(false);
  };

  // Determine if this is the active route for the session
  const isActiveRoute =
    route?.status === 'active' &&
    session?.activeRoute &&
    session.activeRoute.userID === route.userID &&
    JSON.stringify(session.activeRoute.location) === JSON.stringify(route.location);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.content}>
          {/* Arrow back button */}
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Ionicons name="arrow-back" size={28} color="#205781" />
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 40 }} />
          ) : !route ? (
            <ThemedText>No route found.</ThemedText>
          ) : (
            <ScrollView>
              {/* Map at the top */}
              {Array.isArray(route.location) && route.location.length > 0 && (
                <View style={styles.map}>
                <MapView
                  style={StyleSheet.absoluteFillObject}
                  region={getMapRegion(route.location)}
                  pointerEvents="none"
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  {polylineCoords.length > 1 && (
                    <Polyline
                      coordinates={polylineCoords}
                      strokeWidth={4}
                      strokeColor="#205781"
                    />
                  )}
                  {route.location.map((loc: any, idx: number) => (
                    <Marker
                      key={idx}
                      coordinate={{
                        latitude: loc.latitude,
                        longitude: loc.longitude,
                      }}
                      title={loc.locationName}
                      pinColor={
                        idx === 0
                          ? 'green'
                          : idx === route.location.length - 1
                          ? 'red'
                          : 'orange'
                      }
                    />
                  ))}
                </MapView>
                </View>
              )}

              {/* Start > End */}
              <ThemedText style={styles.routeTitle}>
                {route.location && route.location.length > 0
                  ? `${route.location[0]?.locationName || 'Start'} > ${route.location[route.location.length - 1]?.locationName || 'End'}`
                  : ''}
              </ThemedText>

              {/* Stops */}
              <ThemedText style={styles.stopsLabel}>Stops:</ThemedText>
              {route.location && route.location.slice(1, -1).length > 0 ? (
                route.location.slice(1, -1).map((loc: any, idx: number) => (
                  <ThemedText key={idx} style={styles.stopName}>
                    {loc.locationName}
                  </ThemedText>
                ))
              ) : (
                <ThemedText style={styles.noStops}>None</ThemedText>
              )}

              {/* Created On */}
              <ThemedText style={styles.createdOn}>
                <ThemedText style={{ fontWeight: 'bold' }}>Created On: </ThemedText>
                {route.createdOn && route.createdOn.toDate
                  ? route.createdOn.toDate().toLocaleDateString()
                  : ''}
              </ThemedText>
            </ScrollView>
          )}

          {/* Bottom Buttons */}
          {!loading && route && (
            <View style={styles.buttonRow}>
              <OutlineButton
                title="Delete Route"
                onPress={handleArchive}
                buttonStyle={{ flex: 1, marginRight: 8 }}
              />
              {route.status === 'active' && isActiveRoute ? (
                <GradientButton
                  title="End Route"
                  onPress={handleEndRoute}
                  buttonStyle={{ flex: 1, marginLeft: 8 }}
                  disabled={starting}
                  loading={starting}
                />
              ) : (
                <GradientButton
                  title="Start Route"
                  onPress={handleStartRoute}
                  buttonStyle={{ flex: 1, marginLeft: 8 }}
                  disabled={!!session?.activeRoute || route.status === 'active'}
                  loading={starting}
                />
              )}
            </View>
          )}
        </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 0,
    overflow: 'hidden',
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    elevation: 2,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius:20,
    marginBottom: 10,
    alignSelf: 'center',
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#205781',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  stopsLabel: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
    fontSize: 16,
    color: '#205781',
  },
  stopName: {
    color: '#205781',
    marginBottom: 2,
    fontSize: 15,
  },
  noStops: {
    color: '#888',
    marginBottom: 8,
    fontSize: 15,
  },
  createdOn: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 15,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 20,
    marginTop: 8,
    gap: 5,
    paddingHorizontal: 16,
  },
});