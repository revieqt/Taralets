import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform, TouchableOpacity, Alert, View, KeyboardAvoidingView, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TextField from '@/components/TextField';
import DatePicker from '@/components/DatePicker';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter, useLocalSearchParams } from "expo-router";
import { db } from '../../services/firestore/config'; // Adjust the import path as necessary
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

function getDatesBetween(start: Date, end: Date) {
  const dates = [];
  let current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

type LocationItem = {
  location: string;
  note: string;
  latitude?: number;
  longitude?: number;
};

export default function CreateItinerary() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [name, setName] = useState(params.name ?? '');
  const [startOn, setStartOn] = useState<Date | null>(params.startOn ? new Date(params.startOn as string) : null);
  const [endOn, setEndOn] = useState<Date | null>(params.endOn ? new Date(params.endOn as string) : null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Radio button state
  const [planDaily, setPlanDaily] = useState(params.planDaily === 'true' ? true : false);

  // For non-daily plan
  const [locations, setLocations] = useState<LocationItem[]>(params.locations ? JSON.parse(params.locations as string) : []);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [tempLocation, setTempLocation] = useState(params.tempLocation ?? '');
  const [tempNote, setTempNote] = useState(params.tempNote ?? '');
  const [tempLatLng, setTempLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [editingLocIdx, setEditingLocIdx] = useState<number | null>(null);
  const [editLocValue, setEditLocValue] = useState('');
  const [editNoteValue, setEditNoteValue] = useState('');
  const [editLatLng, setEditLatLng] = useState<{ lat: number; lng: number } | null>(null);

  // For daily plan
  const [dailyLocations, setDailyLocations] = useState<
    { date: Date; locations: LocationItem[] }[]
  >(params.dailyLocations ? JSON.parse(params.dailyLocations as string, (key, value) => {
    if (key === 'date') return new Date(value);
    return value;
  }) : []);

  // Handle params from mapPicker for non-daily
  useEffect(() => {
    if (
      params.pickedLatitude &&
      params.pickedLongitude &&
      params.mapPickerFor
    ) {
      const lat = Number(params.pickedLatitude);
      const lng = Number(params.pickedLongitude);

      if (params.mapPickerFor === 'add') {
        setTempLocation(`${lat}, ${lng}`);
        setTempLatLng({ lat, lng });
        if (params.tempNote) setTempNote(params.tempNote as string);
      } else if (typeof params.mapPickerFor === 'string' && params.mapPickerFor.startsWith('edit-')) {
        setEditLocValue(`${lat}, ${lng}`);
        setEditLatLng({ lat, lng });
      }
      // No need to handle daily here, handled in child
      router.setParams({
        pickedLatitude: undefined,
        pickedLongitude: undefined,
        mapPickerFor: undefined,
      });
    }
  }, [params.pickedLatitude, params.pickedLongitude, params.mapPickerFor]);

  // Add location for non-daily
  const handleAddLocation = () => {
    if (tempLocation.trim() !== '') {
      setLocations([...locations, {
        location: tempLocation,
        note: tempNote,
        latitude: tempLatLng?.lat,
        longitude: tempLatLng?.lng,
      }]);
      setTempLocation('');
      setTempNote('');
      setTempLatLng(null);
      setShowLocationInput(false);
    }
  };

  // Edit location for non-daily
  const handleEditLocation = (idx: number) => {
    setEditingLocIdx(idx);
    setEditLocValue(locations[idx].location);
    setEditNoteValue(locations[idx].note);
    setEditLatLng({
      lat: locations[idx].latitude ?? 0,
      lng: locations[idx].longitude ?? 0,
    });
  };

  const handleSaveEditLocation = (idx: number) => {
    if (editLocValue.trim() !== '') {
      setLocations(prev => {
        const updated = [...prev];
        updated[idx] = {
          location: editLocValue,
          note: editNoteValue,
          latitude: editLatLng?.lat,
          longitude: editLatLng?.lng,
        };
        return updated;
      });
      setEditingLocIdx(null);
      setEditLocValue('');
      setEditNoteValue('');
      setEditLatLng(null);
    }
  };

  const handleCancelEditLocation = () => {
    setEditingLocIdx(null);
    setEditLocValue('');
    setEditNoteValue('');
    setEditLatLng(null);
  };

  // Add location for daily
  const handleAddDailyLocation = (dateIdx: number, location: string, note: string, lat?: number, lng?: number) => {
    setDailyLocations(prev => {
      const updated = [...prev];
      updated[dateIdx].locations.push({ location, note, latitude: lat, longitude: lng });
      return updated;
    });
  };

  useEffect(() => {
    if (planDaily && startOn && endOn) {
      const days = getDatesBetween(startOn, endOn);
      setDailyLocations(
        days.map(date => ({
          date,
          locations: [],
        }))
      );
    }
  }, [planDaily, startOn, endOn]);

  const handleCreate = async () => {
    setErrorMsg('');
    if (!name || !startOn || !endOn) {
      setErrorMsg('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setErrorMsg('User not authenticated.');
        setLoading(false);
        return;
      }
      await addDoc(collection(db, 'itineraries'), {
        name,
        startOn: Timestamp.fromDate(startOn),
        endOn: Timestamp.fromDate(endOn),
        status: 'Active',
        createdOn: Timestamp.now(),
        planDaily,
        locations: planDaily
          ? dailyLocations.map(day => ({
              date: day.date,
              locations: day.locations.map(loc => ({
                location: loc.location,
                note: loc.note,
                latitude: loc.latitude,
                longitude: loc.longitude,
              })),
            }))
          : locations.map(loc => ({
              location: loc.location,
              note: loc.note,
              latitude: loc.latitude,
              longitude: loc.longitude,
            })),
        userID: user.uid,
      });
      Alert.alert('Success', 'Itinerary created!');
      setName('');
      setStartOn(null);
      setEndOn(null);
      setLocations([]);
      setDailyLocations([]);
      router.replace('/itineraries/itineraries');
    } catch (e) {
      setErrorMsg('Failed to create itinerary. Please try again.');
    }
    setLoading(false);
  };

  const canShowPlanning = !!startOn && !!endOn;

  // Helper to serialize state for navigation
  const getNavParams = () => ({
    name,
    startOn: startOn ? startOn.toISOString() : '',
    endOn: endOn ? endOn.toISOString() : '',
    planDaily: planDaily ? 'true' : 'false',
    locations: JSON.stringify(locations),
    dailyLocations: JSON.stringify(dailyLocations),
    tempLocation,
    tempNote,
    tempLatLng: tempLatLng ? JSON.stringify(tempLatLng) : '',
  });

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1, width: '100%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={styles.titleContainer}>
            <TouchableOpacity
              onPress={() => router.replace("/itineraries/itineraries")}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <AntDesign size={24} name="left" color={"#cccccc"} />
            </TouchableOpacity>
            <ThemedText type='subtitle'>Create New Itinerary</ThemedText>
          </ThemedView>

          {errorMsg ? (
            <ThemedText style={styles.errorMsg}>{errorMsg}</ThemedText>
          ) : null}

          <TextField
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <DatePicker
                placeholder="Start On"
                value={startOn}
                onChange={setStartOn}
                minimumDate={new Date()}
              />
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              <DatePicker
                placeholder="End On"
                value={endOn}
                onChange={setEndOn}
                minimumDate={new Date()}
              />
            </View>
          </View>

          {canShowPlanning && (
            <>
              <TouchableOpacity
                style={styles.radioRow}
                onPress={() => setPlanDaily(!planDaily)}
                activeOpacity={0.7}
              >
                <View style={[styles.radioOuter, planDaily && styles.radioOuterActive]}>
                  {planDaily && <View style={styles.radioInner} />}
                </View>
                <ThemedText style={styles.radioLabel}>Plan Daily Activities</ThemedText>
              </TouchableOpacity>

              {!planDaily ? (
                <View>
                  {locations.map((loc, idx) =>
                    editingLocIdx === idx ? (
                      <View key={idx} style={styles.locationItem}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <TextField
                            placeholder="Location"
                            value={editLocValue}
                            onChangeText={setEditLocValue}
                            style={{ flex: 1 }}
                          />
                          <TouchableOpacity
                            style={styles.mapBtn}
                            onPress={() => {
                              router.push({
                                pathname: '/map-picker',
                                params: {
                                  ...getNavParams(),
                                  mapPickerFor: `edit-${idx}`,
                                },
                              });
                            }}
                          >
                            <Ionicons name="map" size={22} color="#205781" />
                          </TouchableOpacity>
                        </View>
                        <TextField
                          placeholder="Note"
                          value={editNoteValue}
                          onChangeText={setEditNoteValue}
                        />
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TouchableOpacity
                            style={styles.addLoc1}
                            onPress={() => handleSaveEditLocation(idx)}
                          >
                            <ThemedText style={styles.addLoc1Text}>Save</ThemedText>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.addLoc1, { backgroundColor: '#aaa' }]}
                            onPress={handleCancelEditLocation}
                          >
                            <ThemedText style={styles.addLoc1Text}>Cancel</ThemedText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        key={idx}
                        style={styles.locationItem}
                        onPress={() => handleEditLocation(idx)}
                        activeOpacity={0.7}
                      >
                        <ThemedText style={styles.locationText}>{loc.location}</ThemedText>
                        <ThemedText style={styles.noteText}>{loc.note}</ThemedText>
                      </TouchableOpacity>
                    )
                  )}
                  {showLocationInput ? (
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextField
                          placeholder="Location"
                          value={tempLocation}
                          onChangeText={setTempLocation}
                          style={{ flex: 1 }}
                        />
                        <TouchableOpacity
                          style={styles.mapBtn}
                          onPress={() => {
                            router.push({
                              pathname: '/map-picker',
                              params: {
                                ...getNavParams(),
                                mapPickerFor: 'add',
                              },
                            });
                          }}
                        >
                          <Ionicons name="map" size={22} color="#205781" />
                        </TouchableOpacity>
                      </View>
                      <TextField
                        placeholder="Note"
                        value={tempNote}
                        onChangeText={setTempNote}
                      />
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity style={styles.addLoc1} onPress={handleAddLocation}>
                          <ThemedText style={styles.addLoc1Text}>Add</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.addLoc1, { backgroundColor: '#aaa' }]}
                          onPress={() => {
                            setShowLocationInput(false);
                            setTempLocation('');
                            setTempNote('');
                            setTempLatLng(null);
                          }}
                        >
                          <ThemedText style={styles.addLoc1Text}>Cancel</ThemedText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addLocBtn}
                      onPress={() => setShowLocationInput(true)}
                    >
                      <ThemedText style={styles.addLocBtnText}>Add New Location</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View>
                  {dailyLocations.map((day, idx) => (
                    <View key={idx} style={styles.daySection}>
                      <ThemedText style={styles.dayLabel}>
                        Day {idx + 1} - {day.date.toLocaleDateString()}
                      </ThemedText>
                      {day.locations.map((loc, lidx) => (
                        <EditableDailyLocation
                          key={lidx}
                          location={loc.location}
                          note={loc.note}
                          latitude={loc.latitude}
                          longitude={loc.longitude}
                          onSave={(newLocation, newNote, lat, lng) => {
                            setDailyLocations(prev => {
                              const updated = [...prev];
                              updated[idx].locations[lidx] = { location: newLocation, note: newNote, latitude: lat, longitude: lng };
                              return updated;
                            });
                          }}
                          dayIdx={idx}
                          locIdx={lidx}
                          router={router}
                        />
                      ))}
                      <DailyLocationInputToggle
                        onAdd={(location, note, lat, lng) => handleAddDailyLocation(idx, location, note, lat, lng)}
                        dayIdx={idx}
                        router={router}
                      />
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreate}
                disabled={loading}
              >
                <ThemedText style={styles.createButtonText}>
                  {loading ? 'Creating...' : 'Create Itinerary'}
                </ThemedText>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

function EditableDailyLocation({
  location,
  note,
  latitude,
  longitude,
  onSave,
  dayIdx,
  locIdx,
  router,
}: {
  location: string;
  note: string;
  latitude?: number;
  longitude?: number;
  onSave: (location: string, note: string, lat?: number, lng?: number) => void;
  dayIdx?: number;
  locIdx?: number;
  router?: any;
}) {
  const [editing, setEditing] = useState(false);
  const [editLocation, setEditLocation] = useState(location);
  const [editNote, setEditNote] = useState(note);
  const [editLatLng, setEditLatLng] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );

  const params = useLocalSearchParams();
  useEffect(() => {
    if (
      params.pickedLatitude &&
      params.pickedLongitude &&
      params.mapPickerFor === `daily-edit-${dayIdx}-${locIdx}`
    ) {
      const lat = Number(params.pickedLatitude);
      const lng = Number(params.pickedLongitude);
      setEditLatLng({ lat, lng });
      setEditLocation(`${lat}, ${lng}`);
      if (router) {
        router.setParams({
          pickedLatitude: undefined,
          pickedLongitude: undefined,
          mapPickerFor: undefined,
        });
      }
    }
  }, [params.pickedLatitude, params.pickedLongitude, params.mapPickerFor]);

  if (editing) {
    return (
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextField
            placeholder="Location"
            value={editLocation}
            onChangeText={setEditLocation}
            style={{ flex: 1 }}
          />
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => {
              if (router && dayIdx !== undefined && locIdx !== undefined) {
                router.push({
                  pathname: '/map-picker',
                  params: {
                    mapPickerFor: `daily-edit-${dayIdx}-${locIdx}`,
                  },
                });
              }
            }}
          >
            <Ionicons name="map" size={22} color="#205781" />
          </TouchableOpacity>
        </View>
        <TextField
          placeholder="Note"
          value={editNote}
          onChangeText={setEditNote}
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={styles.addLoc1}
            onPress={() => {
              if (editLocation.trim() !== '') {
                onSave(editLocation, editNote, editLatLng?.lat, editLatLng?.lng);
                setEditing(false);
              }
            }}
          >
            <ThemedText style={styles.addLoc1Text}>Save</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addLoc1, { backgroundColor: '#aaa' }]}
            onPress={() => {
              setEditLocation(location);
              setEditNote(note);
              setEditLatLng(latitude && longitude ? { lat: latitude, lng: longitude } : null);
              setEditing(false);
            }}
          >
            <ThemedText style={styles.addLoc1Text}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => setEditing(true)}
      activeOpacity={0.7}
    >
      <ThemedText style={styles.locationText}>{location}</ThemedText>
      <ThemedText style={styles.noteText}>{note}</ThemedText>
    </TouchableOpacity>
  );
}

function DailyLocationInputToggle({
  onAdd,
  dayIdx,
  router,
}: {
  onAdd: (location: string, note: string, lat?: number, lng?: number) => void;
  dayIdx?: number;
  router?: any;
}) {
  const [showInput, setShowInput] = useState(false);
  return showInput ? (
    <DailyLocationInput
      onAdd={(location, note, lat, lng) => {
        onAdd(location, note, lat, lng);
        setShowInput(false);
      }}
      onCancel={() => setShowInput(false)}
      dayIdx={dayIdx}
      router={router}
    />
  ) : (
    <TouchableOpacity style={styles.addLocBtn} onPress={() => setShowInput(true)}>
      <ThemedText style={styles.addLocBtnText}>Add New Location</ThemedText>
    </TouchableOpacity>
  );
}

function DailyLocationInput({
  onAdd,
  onCancel,
  dayIdx,
  router,
}: {
  onAdd: (location: string, note: string, lat?: number, lng?: number) => void;
  onCancel?: () => void;
  dayIdx?: number;
  router?: any;
}) {
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(null);

  const params = useLocalSearchParams();
  useEffect(() => {
    if (
      params.pickedLatitude &&
      params.pickedLongitude &&
      params.mapPickerFor === `daily-add-${dayIdx}`
    ) {
      const lat = Number(params.pickedLatitude);
      const lng = Number(params.pickedLongitude);
      setLatLng({ lat, lng });
      setLocation(`${lat}, ${lng}`);
      if (router) {
        router.setParams({
          pickedLatitude: undefined,
          pickedLongitude: undefined,
          mapPickerFor: undefined,
        });
      }
    }
  }, [params.pickedLatitude, params.pickedLongitude, params.mapPickerFor]);

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextField
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
          style={{ flex: 1 }}
        />
        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => {
            if (router && dayIdx !== undefined) {
              router.push({
                pathname: '/map-picker',
                params: {
                  mapPickerFor: `daily-add-${dayIdx}`,
                },
              });
            }
          }}
        >
          <Ionicons name="map" size={22} color="#205781" />
        </TouchableOpacity>
      </View>
      <TextField
        placeholder="Note"
        value={note}
        onChangeText={setNote}
      />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          style={styles.addLoc1}
          onPress={() => {
            if (location.trim() !== '') {
              onAdd(location, note, latLng?.lat, latLng?.lng);
              setLocation('');
              setNote('');
              setLatLng(null);
            }
          }}
        >
          <ThemedText style={styles.addLoc1Text}>Add</ThemedText>
        </TouchableOpacity>
        {onCancel && (
          <TouchableOpacity
            style={[styles.addLoc1, { backgroundColor: '#aaa' }]}
            onPress={onCancel}
          >
            <ThemedText style={styles.addLoc1Text}>Cancel</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  errorMsg: {
    color: '#d32f2f',
    backgroundColor: '#fdecea',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    textAlign: 'center',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#205781',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  radioOuterActive: {
    borderColor: '#205781',
    backgroundColor: '#e6eef6',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#205781',
  },
  radioLabel: {
    fontSize: 16,
    color: '#205781',
    fontWeight: 'bold',
  },
  addLocBtn: {
    backgroundColor: '#cccccc',
    opacity: 0.5,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'stretch',
    width: '100%',
  },
  addLocBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  addLoc1: {
    backgroundColor: '#205781',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  addLoc1Text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  mapBtn: {
    padding: 8,
    backgroundColor: '#e6eef6',
    borderRadius: 8,
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapBtnTop: {
    alignSelf: 'flex-start',
    marginBottom: 6,
    padding: 8,
    backgroundColor: '#e6eef6',
    borderRadius: 8,
  },
  locationItem: {
    backgroundColor: '#f1f3f6',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
  },
  locationText: {
    fontWeight: 'bold',
    color: '#205781',
    fontSize: 15,
  },
  noteText: {
    color: '#666',
    fontSize: 14,
  },
  daySection: {
    marginBottom: 18,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e6eef6',
  },
  dayLabel: {
    fontWeight: 'bold',
    color: '#205781',
    fontSize: 16,
    marginBottom: 6,
  },
  createButton: {
    backgroundColor: '#205781',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});