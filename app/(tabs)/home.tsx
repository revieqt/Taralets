import { StyleSheet, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TaraMap from '@/components/TaraMap';
import VerticalRule from '@/components/VerticalRule';
import NotificationModal from '@/components/modals/NotificationModal';
import { Octicons, MaterialIcons, MaterialCommunityIcons, FontAwesome6, AntDesign } from '@expo/vector-icons';
import { useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { useReverseGeocoding } from '@/hooks/useReverseGeocoding';
import useUserLocation from '@/hooks/useUserLocation';
import { usePlaceInformation } from '@/hooks/usePlaceInformation';
import { Portal, Modal, PaperProvider } from 'react-native-paper';
import OutlineButton from '@/components/OutlineButton';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useSession();
  const [notifVisible, setNotifVisible] = useState(false);
  const { userCoordinates, errorMessage } = useUserLocation();
  const locationName = useReverseGeocoding(userCoordinates.lat, userCoordinates.lon);

  const town = locationName.split(',').pop()?.trim() || '';
  const { info: wikiInfo, image: wikiImage, loading: wikiLoading } = usePlaceInformation(town);

  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const INFO_PREVIEW_LENGTH = 220;
  const isLongInfo = wikiInfo && wikiInfo.length > INFO_PREVIEW_LENGTH;
  const infoPreview = isLongInfo ? wikiInfo?.slice(0, INFO_PREVIEW_LENGTH) + '...' : wikiInfo;

  return (
    <PaperProvider>
      <ThemedView style={{ flex: 1}}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[
            'rgb(0,101,248)',   // Top: solid blue
            'rgb(0,255,222)',   // Middle: solid teal
            'rgb(255,255,255)',   // Middle: solid teal
          ]}
          locations={[0,0.66,1]}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 350,

            zIndex: -100,
          }}
        />
        
        <View style={styles.header}>
          <View>
            <ThemedText type='subtitle' style={{ color: 'white', fontSize: 17, marginTop: 5 }}>
              Hello {session?.user?.fname} {session?.user?.lname}!
            </ThemedText>
            <ThemedText style={{ color: 'white', fontSize: 14 }}>
              Welcome to TaraG
            </ThemedText>
          </View>
          
          <TouchableOpacity style={styles.notificationButton} onPress={() => setNotifVisible(true)}>
            <MaterialIcons name="notifications-none" size={24} color="white" />
          </TouchableOpacity>
          <NotificationModal visible={notifVisible} onClose={() => setNotifVisible(false)} />
        </View>

        <View style={styles.mapContainer}>
            <ThemedView type='secondary' style={styles.expandButton}>
              <TouchableOpacity onPress={() => router.push('/map-view')}>
                <AntDesign name="arrowsalt" size={20} color="white" />
              </TouchableOpacity>
            </ThemedView>

            <TaraMap
              region={{
                latitude: userCoordinates.lat || 14.5995,
                longitude: userCoordinates.lon || 120.9842,
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
              {errorMessage ? errorMessage : locationName}
            </ThemedText>
          </ThemedView>
        </ThemedView>

          
        <View>
          <View style={styles.menuContainer}>
            <TouchableOpacity onPress={() => router.push('/routes/routes')} style={styles.menuButton}>
              <AntDesign name="retweet" size={24} color="black" />
              <ThemedText>Routes</ThemedText>
            </TouchableOpacity>

            <View style={styles.verticalRule}>
              <VerticalRule height="50%" color="#aaa" thickness={1} />
            </View>

            <TouchableOpacity onPress={() => router.push('/itineraries/itineraries')} style={styles.menuButton}>
              <AntDesign name="paperclip" size={24} color="black" />
              <ThemedText>Itineraries</ThemedText>
            </TouchableOpacity>

            <View style={styles.verticalRule}>
              <VerticalRule height="50%" color="#aaa" thickness={1} />
            </View>

            <TouchableOpacity onPress={() => router.push('/weather')} style={styles.menuButton}>
              <AntDesign name="cloudo" size={24} color="black" />
              <ThemedText>Weather</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <ThemedView style={styles.taraContainer}>
          <ThemedText>dsa</ThemedText>
        </ThemedView>

        <View style={styles.infoContainer}>
          {wikiImage && (
            <Image
              source={{ uri: wikiImage }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              blurRadius={2}
            />
          )}
          <LinearGradient
          colors={[
        'rgba(0,0,0,0.5)',    // Top: transparent black
        'rgba(128,128,128,0.4)', // Middle: semi-transparent gray
            'rgba(255,255,255,1)', // Bottom: solid white
            
            
          ]}
          locations={[0, 0.66, 1]}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}
        />
        <ThemedText type="subtitle" style={{ marginBottom: 8, fontWeight: 'bold', zIndex: 2, color: '#00CAFF' }}>
          {town}
        </ThemedText>
        <View style={{ maxHeight: 100, overflow: 'hidden', marginBottom: 4, zIndex: 2 }}>
          <ThemedText style={{color: 'white' }}>
            {wikiLoading
              ? 'Loading information...'
              : infoPreview
            }
          </ThemedText>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 8, justifyContent: 'flex-start', gap: 8, zIndex: 2 }}>
          <OutlineButton
            title="Search for Tours"
            onPress={() => {}}
            buttonStyle={{ height: 40, paddingHorizontal: 18, minWidth: 0, width: 'auto', backgroundColor: 'rgba(255,255,255,.7)' }}
            textStyle={{ fontSize: 14 }}
          />
          {isLongInfo && (
            <OutlineButton
              title="See More"
              onPress={() => setInfoModalVisible(true)}
              buttonStyle={{ height: 40, paddingHorizontal: 18, minWidth: 0, width: 'auto',  backgroundColor: 'rgba(255,255,255,.7)'}}
              textStyle={{ fontSize: 14 }}
            />
          )}
        </View>
      </View>

        <Portal>
          <Modal
            visible={infoModalVisible}
            onDismiss={() => setInfoModalVisible(false)}
            contentContainerStyle={{
              backgroundColor: 'white',
              margin: 24,
              borderRadius: 12,
              padding: 20,
              maxHeight: '80%',
            }}
          >
            <ThemedText type="subtitle" style={{ marginBottom: 8, fontWeight: 'bold', textAlign: 'center' }}>
              {town}
            </ThemedText>
            <ThemedText style={{ textAlign: 'center' }}>
              {wikiInfo}
            </ThemedText>
            <TouchableOpacity onPress={() => setInfoModalVisible(false)} style={{ marginTop: 16 }}>
              <ThemedText style={{ color: '#007aff', textAlign: 'center' }}>Close</ThemedText>
            </TouchableOpacity>
          </Modal>
        </Portal>
        </ScrollView>
      </ThemedView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: 238,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  locationShadow: {
    width: '90%',
    height: 70,
    marginTop: -50,
    alignSelf: 'center',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'visible',
    marginBottom: 20,
    elevation: 10,
  },
  locationContainer: {
    width: '100%',
    height: 90,
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
    width: '26%',
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
    marginBottom: 10,
    paddingTop: 20,
  },
  notificationButton: {
    width: 40
    ,
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
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    overflow: 'hidden',
    height: 210,
    elevation: 10,
  },
  taraContainer: {
    width: '100%',
    height: 100,
    borderRadius: 16,
    marginTop: 10,
    padding: 16,
    elevation: 5,
  },
});