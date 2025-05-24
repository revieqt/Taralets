import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Keyboard, Platform } from 'react-native';
import MapView, { Marker, Polyline, LatLng, Region } from 'react-native-maps';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import polyline from '@mapbox/polyline';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as Location from 'expo-location';
import TextField from '@/components/TextField';
import { Ionicons } from '@expo/vector-icons';
import { GooglePlacesAutocomplete, GooglePlaceData } from 'react-native-google-places-autocomplete';
import { useSession } from '@/context/SessionContext';
import userLocation from '@/utils/userLocationAddress'; // <-- Make sure this exists

const GOOGLE_MAPS_APIKEY = 'AIzaSyDI_dL8xl7gnjcPps-CXgDJM9DtF3oZPVI';

export default function CreateRouteScreen() {
  const [region, setRegion] = useState<Region | null>(null);
  const [userLocationState, setUserLocation] = useState<LatLng | null>(null);
  const [start, setStart] = useState<LatLng | null>(null);
  const [end, setEnd] = useState<LatLng | null>(null);
  const [waypoints, setWaypoints] = useState<LatLng[]>([]);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [step, setStep] = useState<'start' | 'end' | 'done'>('start');
  const [searchingStop, setSearchingStop] = useState(false);

  // For displaying address in TextField
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [waypointAddresses, setWaypointAddresses] = useState<string[]>([]);

  // For editing stops
  const [editingStopIdx, setEditingStopIdx] = useState<number | null>(null);

  const mapRef = useRef<MapView>(null);

  // Session context
  const { session, updateSession } = useSession();

  // Get user's current location on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required.');
        setRegion({
          latitude: 14.5995,
          longitude: 120.9842,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setRegion({
        ...coords,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      setUserLocation(coords);
    })();
  }, []);

  // Fetch route when start/end/waypoints change
  useEffect(() => {
    if (start && end) fetchRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end, waypoints]);

  // Helper to get directions from Google Directions API
  const fetchRoute = async () => {
    if (!start || !end) return;
    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}`;
    if (waypoints.length > 0) {
      const wp = waypoints.map(wp => `${wp.latitude},${wp.longitude}`).join('|');
      url += `&waypoints=${wp}`;
    }
    url += `&key=${GOOGLE_MAPS_APIKEY}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.routes && json.routes.length > 0) {
      const points = polyline.decode(json.routes[0].overview_polyline.points);
      const coords = points.map(([lat, lng]: [number, number]) => ({ latitude: lat, longitude: lng }));
      setRouteCoords(coords);
      if (coords.length > 0 && mapRef.current) {
        mapRef.current.fitToCoordinates(coords, { edgePadding: { top: 50, bottom: 200, left: 50, right: 50 } });
      }
    }
  };

  // Handle map press for selecting points
  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    if (step === 'start') {
      setStart({ latitude, longitude });
      setStartAddress('');
    } else if (step === 'end') {
      setEnd({ latitude, longitude });
      setEndAddress('');
    } else if (searchingStop) {
      setWaypoints([...waypoints, { latitude, longitude }]);
      setWaypointAddresses([...waypointAddresses, '']);
      setSearchingStop(false);
    }
  };

  // Helper to get location name using Nominatim or your utility
  const getLocationName = async (lat: number, lng: number) => {
    try {
      const street = await userLocation.street(lat, lng);
      const city = await userLocation.city(lat, lng);
      return `${street}, ${city}`;
    } catch {
      return '';
    }
  };

  // Save to Firestore and session
  const saveRoute = async (status: 'forLater' | 'active') => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in.');
      return;
    }
    if (!start || !end) {
      Alert.alert('Error', 'Please select both start and end points.');
      return;
    }
    // Prevent starting a route if there is already an activeRoute in session
    if (status === 'active' && session?.activeRoute) {
      Alert.alert('You already have an active route. Please finish it before starting a new one.');
      return;
    }
    const db = getFirestore();
    const locationArr = [
      start,
      ...waypoints,
      end,
    ];

    // Fetch location names for all points
    const locationsWithNames = await Promise.all(
      locationArr.map(async (loc, idx) => ({
        ...loc,
        locationName:
          (idx === 0 && startAddress) ||
          (idx === locationArr.length - 1 && endAddress) ||
          waypointAddresses[idx - 1] ||
          (await getLocationName(loc.latitude, loc.longitude)),
      }))
    );

    try {
      const docRef = await addDoc(collection(db, 'routes'), {
        createdOn: serverTimestamp(),
        location: locationsWithNames,
        userID: user.uid,
        status: status,
      });
      Alert.alert('Success', status === 'forLater' ? 'Route saved for later!' : 'Route started!');
      if (status === 'active') {
        // Save to session as activeRoute
        await updateSession({
          activeRoute: {
            userID: user.uid,
            location: locationsWithNames,
            status: 'active',
            createdOn: new Date(), // serverTimestamp is not available immediately
          }
        });
        router.replace('/(tabs)/home');
      } else {
        router.back();
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save route.');
    }
  };

  // Helper for GooglePlacesAutocomplete to set location
  const handlePlaceSelect = async (
    details: any,
    type: 'start' | 'end' | 'waypoint',
    idx?: number
  ) => {
    if (details === 'your_location' && userLocationState) {
      if (type === 'start') {
        setStart(userLocationState);
        setStartAddress('Your Location');
        setEditingStopIdx(null);
      }
      Keyboard.dismiss();
      return;
    }
    const { lat, lng } = details.geometry.location;
    if (type === 'start') {
      setStart({ latitude: lat, longitude: lng });
      setStartAddress(details.formatted_address);
      setEditingStopIdx(null);
    } else if (type === 'end') {
      setEnd({ latitude: lat, longitude: lng });
      setEndAddress(details.formatted_address);
      setEditingStopIdx(null);
    } else if (type === 'waypoint' && typeof idx === 'number') {
      const newWaypoints = [...waypoints];
      const newAddresses = [...waypointAddresses];
      newWaypoints[idx] = { latitude: lat, longitude: lng };
      newAddresses[idx] = details.formatted_address;
      setWaypoints(newWaypoints);
      setWaypointAddresses(newAddresses);
      setEditingStopIdx(null);
    } else if (type === 'waypoint') {
      setWaypoints([...waypoints, { latitude: lat, longitude: lng }]);
      setWaypointAddresses([...waypointAddresses, details.formatted_address]);
      setSearchingStop(false);
    }
    Keyboard.dismiss();
  };

  // Remove a stop
  const removeStop = (idx: number) => {
    const newWaypoints = [...waypoints];
    const newAddresses = [...waypointAddresses];
    newWaypoints.splice(idx, 1);
    newAddresses.splice(idx, 1);
    setWaypoints(newWaypoints);
    setWaypointAddresses(newAddresses);
    setEditingStopIdx(null);
  };

  // Fix for GooglePlacesAutocomplete predefinedPlaces type
  const predefinedPlaces = userLocationState
    ? [
        {
          description: 'Your Location',
          geometry: {
            location: {
              latitude: userLocationState.latitude,
              longitude: userLocationState.longitude,
            },
          },
        },
      ]
    : [];

  // Fix for renderRow type
  const renderRowWithYourLocation = (rowData: GooglePlaceData, index: number) => {
    if (typeof rowData === 'object' && rowData.description === 'Your Location') {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
          <Ionicons name="locate" size={18} color="#205781" style={{ marginRight: 8 }} />
          <ThemedText>Your Location</ThemedText>
        </View>
      );
    }
    // fallback to default rendering
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
        <ThemedText>{rowData.description}</ThemedText>
      </View>
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Step 1 & 2: Set Start and End */}
      <View style={styles.topPanel}>
        {step === 'start' && (
          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <GooglePlacesAutocomplete
                placeholder="Set Starting Location"
                fetchDetails
                onPress={(data, details = null) => {
                  if (data?.description === 'Your Location' && userLocationState) {
                    handlePlaceSelect('your_location', 'start');
                  } else if (details) {
                    handlePlaceSelect(details, 'start');
                  }
                }}
                query={{
                  key: GOOGLE_MAPS_APIKEY,
                  language: 'en',
                }}
                styles={{
                  textInput: styles.textInput,
                  container: { flex: 1 },
                  listView: { zIndex: 10 },
                }}
                enablePoweredByContainer={false}
                nearbyPlacesAPI="GooglePlacesSearch"
                debounce={200}
                onFail={() => {}}
                onNotFound={() => {}}
                textInputProps={{
                  value: startAddress,
                  onChangeText: (text: string) => setStartAddress(text),
                  autoCorrect: false,
                  autoCapitalize: 'none',
                }}
                predefinedPlaces={predefinedPlaces as any}
                renderRow={renderRowWithYourLocation}
                filterReverseGeocodingByTypes={[]}
                minLength={0}
              />
            </View>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => {
                if (start) setStep('end');
                else Alert.alert('Please select a starting location.');
              }}
            >
              <Ionicons name="arrow-forward" size={28} color="#205781" />
            </TouchableOpacity>
          </View>
        )}
        {step === 'end' && (
          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <GooglePlacesAutocomplete
                placeholder="Set End Location"
                fetchDetails
                onPress={(data, details = null) => {
                  if (details) {
                    handlePlaceSelect(details, 'end');
                  }
                }}
                query={{
                  key: GOOGLE_MAPS_APIKEY,
                  language: 'en',
                }}
                styles={{
                  textInput: styles.textInput,
                  container: { flex: 1 },
                  listView: { zIndex: 10 },
                }}
                enablePoweredByContainer={false}
                nearbyPlacesAPI="GooglePlacesSearch"
                debounce={200}
                onFail={() => {}}
                onNotFound={() => {}}
                textInputProps={{
                  value: endAddress,
                  onChangeText: (text: string) => setEndAddress(text),
                  autoCorrect: false,
                  autoCapitalize: 'none',
                }}
              />
            </View>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => {
                if (end) setStep('done');
                else Alert.alert('Please select an end location.');
              }}
            >
              <Ionicons name="checkmark" size={28} color="#205781" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Map */}
      {region && (
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={region}
          region={region}
          onPress={handleMapPress}
          showsUserLocation
        >
          {start && <Marker coordinate={start} pinColor="green" />}
          {end && <Marker coordinate={end} pinColor="red" />}
          {waypoints.map((wp, idx) => (
            <Marker key={idx} coordinate={wp} pinColor="orange" />
          ))}
          {routeCoords.length > 0 && (
            <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="#205781" />
          )}
        </MapView>
      )}

      {/* Step 3: After start & end are set */}
      {step === 'done' && (
        <View style={styles.bottomPanel}>
          {/* Start location editable with autocomplete */}
          <View style={styles.inputRow}>
            {editingStopIdx === -1 ? (
              <View style={{ flex: 1 }}>
                <GooglePlacesAutocomplete
                  placeholder="Starting Location"
                  fetchDetails
                  onPress={(data, details = null) => {
                    if (data?.description === 'Your Location' && userLocationState) {
                      handlePlaceSelect('your_location', 'start');
                    } else if (details) handlePlaceSelect(details, 'start');
                  }}
                  query={{
                    key: GOOGLE_MAPS_APIKEY,
                    language: 'en',
                  }}
                  styles={{
                    textInput: styles.textInput,
                    container: { flex: 1 },
                    listView: { zIndex: 10 },
                  }}
                  enablePoweredByContainer={false}
                  nearbyPlacesAPI="GooglePlacesSearch"
                  debounce={200}
                  textInputProps={{
                    value: startAddress,
                    onChangeText: (text: string) => setStartAddress(text),
                    autoCorrect: false,
                    autoCapitalize: 'none',
                  }}
                  predefinedPlaces={predefinedPlaces as any}
                  renderRow={renderRowWithYourLocation}
                  filterReverseGeocodingByTypes={[]}
                  minLength={0}
                />
              </View>
            ) : (
              <>
                <TextField
                  placeholder="Starting Location"
                  value={startAddress}
                  onChangeText={setStartAddress}
                  style={{ flex: 1, marginRight: 8 }}
                  onFocus={() => setEditingStopIdx(-1)}
                />
                <Ionicons name="ellipse" size={20} color="green" style={{ alignSelf: 'center' }} />
              </>
            )}
            {editingStopIdx === -1 && (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setEditingStopIdx(null)}
              >
                <Ionicons name="close" size={20} color="#205781" />
              </TouchableOpacity>
            )}
          </View>
          {/* End location editable with autocomplete */}
          <View style={styles.inputRow}>
            {editingStopIdx === -2 ? (
              <View style={{ flex: 1 }}>
                <GooglePlacesAutocomplete
                  placeholder="End Location"
                  fetchDetails
                  onPress={(data, details = null) => {
                    if (details) handlePlaceSelect(details, 'end');
                  }}
                  query={{
                    key: GOOGLE_MAPS_APIKEY,
                    language: 'en',
                  }}
                  styles={{
                    textInput: styles.textInput,
                    container: { flex: 1 },
                    listView: { zIndex: 10 },
                  }}
                  enablePoweredByContainer={false}
                  nearbyPlacesAPI="GooglePlacesSearch"
                  debounce={200}
                  textInputProps={{
                    value: endAddress,
                    onChangeText: (text: string) => setEndAddress(text),
                    autoCorrect: false,
                    autoCapitalize: 'none',
                  }}
                />
              </View>
            ) : (
              <>
                <TextField
                  placeholder="End Location"
                  value={endAddress}
                  onChangeText={setEndAddress}
                  style={{ flex: 1, marginRight: 8 }}
                  onFocus={() => setEditingStopIdx(-2)}
                />
                <Ionicons name="ellipse" size={20} color="red" style={{ alignSelf: 'center' }} />
              </>
            )}
            {editingStopIdx === -2 && (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setEditingStopIdx(null)}
              >
                <Ionicons name="close" size={20} color="#205781" />
              </TouchableOpacity>
            )}
          </View>
          {/* Waypoints with editable autocomplete and remove button */}
          {waypoints.map((wp, idx) => (
            <View style={styles.inputRow} key={idx}>
              {editingStopIdx === idx ? (
                <View style={{ flex: 1 }}>
                  <GooglePlacesAutocomplete
                    placeholder={`Stop ${idx + 1}`}
                    fetchDetails
                    onPress={(data, details = null) => {
                      if (details) handlePlaceSelect(details, 'waypoint', idx);
                    }}
                    query={{
                      key: GOOGLE_MAPS_APIKEY,
                      language: 'en',
                    }}
                    styles={{
                      textInput: styles.textInput,
                      container: { flex: 1 },
                      listView: { zIndex: 10 },
                    }}
                    enablePoweredByContainer={false}
                    nearbyPlacesAPI="GooglePlacesSearch"
                    debounce={200}
                    textInputProps={{
                      value: waypointAddresses[idx] || '',
                      onChangeText: (text: string) => {
                        const arr = [...waypointAddresses];
                        arr[idx] = text;
                        setWaypointAddresses(arr);
                      },
                      autoCorrect: false,
                      autoCapitalize: 'none',
                    }}
                  />
                </View>
              ) : (
                <>
                  <TextField
                    placeholder={`Stop ${idx + 1}`}
                    value={waypointAddresses[idx] || ''}
                    onChangeText={text => {
                      const arr = [...waypointAddresses];
                      arr[idx] = text;
                      setWaypointAddresses(arr);
                    }}
                    style={{ flex: 1, marginRight: 8 }}
                    onFocus={() => setEditingStopIdx(idx)}
                  />
                  <Ionicons name="ellipse" size={20} color="orange" style={{ alignSelf: 'center' }} />
                </>
              )}
              {/* Remove stop button */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => removeStop(idx)}
              >
                <Ionicons name="close" size={20} color="#d32f2f" />
              </TouchableOpacity>
            </View>
          ))}
          {/* Add a stop */}
          {!searchingStop && (
            <TouchableOpacity
              style={styles.addStopBtn}
              onPress={() => setSearchingStop(true)}
            >
              <ThemedText style={styles.addStopBtnText}>+ Add a stop</ThemedText>
            </TouchableOpacity>
          )}
          {/* Stop search field */}
          {searchingStop && (
            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <GooglePlacesAutocomplete
                  placeholder="Search for a stop"
                  fetchDetails
                  onPress={(data, details = null) => {
                    if (details) {
                      setWaypoints([...waypoints, {
                        latitude: details.geometry.location.lat,
                        longitude: details.geometry.location.lng,
                      }]);
                      setWaypointAddresses([...waypointAddresses, details.formatted_address]);
                      setSearchingStop(false);
                    }
                  }}
                  query={{
                    key: GOOGLE_MAPS_APIKEY,
                    language: 'en',
                  }}
                  styles={{
                    textInput: styles.textInput,
                    container: { flex: 1 },
                    listView: { zIndex: 10 },
                  }}
                  enablePoweredByContainer={false}
                  nearbyPlacesAPI="GooglePlacesSearch"
                  debounce={200}
                  onFail={() => {}}
                  onNotFound={() => {}}
                />
              </View>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setSearchingStop(false)}
              >
                <Ionicons name="close" size={24} color="#205781" />
              </TouchableOpacity>
            </View>
          )}
          {/* Save/Start buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.saveBtn,
                (!start || !end) && { backgroundColor: '#cccccc' }
              ]}
              disabled={!start || !end}
              onPress={() => saveRoute('forLater')}
            >
              <ThemedText style={styles.saveBtnText}>Save for Later</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.startBtn,
                (!start || !end || !!session?.activeRoute) && { backgroundColor: '#cccccc' }
              ]}
              disabled={!start || !end || !!session?.activeRoute}
              onPress={() => saveRoute('active')}
            >
              <ThemedText style={styles.startBtnText}>Start Route</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  topPanel: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 16,
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 20,
  },
  textInput: {
    height: 44,
    borderRadius: 25,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#205781',
  },
  iconBtn: {
    marginLeft: 8,
    backgroundColor: '#e6eef5',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    zIndex: 30,
  },
  addStopBtn: {
    backgroundColor: '#205781',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  addStopBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 16,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#7AB2D3',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 6,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  startBtn: {
    flex: 1,
    backgroundColor: '#205781',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 6,
  },
  startBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});