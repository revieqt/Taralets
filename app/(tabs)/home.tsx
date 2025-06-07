import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TaraMap from '@/components/TaraMap';
import VerticalRule from '@/components/VerticalRule';
import NotificationModal from '@/components/modals/NotificationModal';
import { Octicons, MaterialIcons, MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useEffect, useRef, useState } from 'react';
import { getUserLocation } from '@/services/mapService';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// import { decode as decodePolyline } from '@mapbox/polyline';
import { useSession } from '@/context/SessionContext';
const GOOGLE_MAPS_APIKEY = 'AIzaSyDI_dL8xl7gnjcPps-CXgDJM9DtF3oZPVI';

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useSession();
  const [notifVisible, setNotifVisible] = useState(false);
  

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedView style={styles.header}>
        <Image
          source={require('@/assets/images/logo-complete.png')}
          style={{ width: 120, height: 50, marginTop: 5}}></Image>

        <TouchableOpacity style={styles.notificationButton} onPress={() => setNotifVisible(true)}>
          <MaterialIcons name="notifications-none" size={24} color="black" />
        </TouchableOpacity>
        <NotificationModal visible={notifVisible} onClose={() => setNotifVisible(false)} />
      </ThemedView>

      <View style={styles.mapContainer}>
        <ThemedView type='secondary' style={styles.expandButton}>
          <TouchableOpacity onPress={() => router.push('/map-view')}>
            <FontAwesome6 name="expand" size={20} color="black" />
          </TouchableOpacity>
        </ThemedView>

        <TaraMap
          region={{
            latitude: 14.5995,
            longitude: 120.9842,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        />
      </View>

      <ThemedView type='primary' style={styles.locationShadow}>
        <ThemedView type='primary' style={styles.locationContainer}>
          
          <ThemedText>
            You are currently in
          </ThemedText>
          <ThemedText type='subtitle'>
            San Pedro Rd, Minglanilla
          </ThemedText>
        </ThemedView>
      </ThemedView>
      
      <View>
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
      </View>

    </ThemedView>
    
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: 250,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  locationShadow: {
    width: '90%',
    height: 60,
    marginTop: -50,
    alignSelf: 'center',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'visible',
    marginBottom: 30,
    elevation: 10,
  },
  locationContainer:{
    width: '100%',
    height:  90,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 14,
    alignItems: 'center',
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
  header: {
    width: '100%',
    height: 80,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 16,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  notificationButton: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  expandButton: {
    width: 50,
    height: 50,
    position: 'absolute',
    right: 10,
    top: 10,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 10,
  }
});