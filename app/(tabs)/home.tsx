import { StyleSheet, View, TouchableOpacity, Image, Dimensions, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TaraMap from '@/components/TaraMap';
import VerticalRule from '@/components/VerticalRule';
import TextField from '@/components/TextField';
import NotificationModal from '@/components/modals/NotificationModal';
import FabMenu from '@/components/FabMenu';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { useReverseGeocoding } from '@/hooks/useReverseGeocoding';
import useUserLocation from '@/hooks/useUserLocation';
import { usePlaceInformation } from '@/hooks/usePlaceInformation';
import { Portal, Modal, PaperProvider } from 'react-native-paper';
import OutlineButton from '@/components/OutlineButton';
import { LinearGradient } from 'expo-linear-gradient';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { wikipediaService } from '@/services/wikipediaService';
import LiveTrackingMap from '@/components/maps/LiveTrackingMap';

const { height: screenHeight } = Dimensions.get('window');
const HEADER_HEIGHT_COLLAPSED = 450;
const HEADER_HEIGHT_EXPANDED = screenHeight + 80;

type TouristSpot = {
  title: string;
  image?: string | null;
};

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useSession();
  const [notifVisible, setNotifVisible] = useState(false);
  const { userCoordinates, errorMessage } = useUserLocation();
  const [search, setSearch] = useState('');
  const locationName = useReverseGeocoding(userCoordinates.lat, userCoordinates.lon);
  const town = locationName.split(',').pop()?.trim() || '';
  const { info: wikiInfo, image: wikiImage, loading: wikiLoading } = usePlaceInformation(town);

  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const INFO_PREVIEW_LENGTH = 220;
  const isLongInfo = wikiInfo && wikiInfo.length > INFO_PREVIEW_LENGTH;
  const infoPreview = isLongInfo ? wikiInfo?.slice(0, INFO_PREVIEW_LENGTH) + '...' : wikiInfo;

  const expanded = useSharedValue(false);
  const headerHeight = useSharedValue(HEADER_HEIGHT_COLLAPSED);
  const mapHeight = useSharedValue(HEADER_HEIGHT_COLLAPSED - 40);

  // React state for toggle button UI
  const [isExpanded, setIsExpanded] = useState(false);

  // 3D View toggle state
  const [is3DView, setIs3DView] = useState(false);

  // Tourist spots logic
  const [touristSpots, setTouristSpots] = useState<TouristSpot[]>([]);
  const [loadingSpots, setLoadingSpots] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchSpots() {
      if (!town) return;
      setLoadingSpots(true);
      try {
        const titles = await wikipediaService.getTouristSpots(town);
        // Fetch images for each spot in parallel (limit to 10 for performance)
        const spots: TouristSpot[] = await Promise.all(
          titles.slice(0, 10).map(async (title: string) => {
            const image = await wikipediaService.getImage(title);
            return { title, image };
          })
        );
        if (isMounted) setTouristSpots(spots);
      } catch {
        if (isMounted) setTouristSpots([]);
      } finally {
        if (isMounted) setLoadingSpots(false);
      }
    }
    fetchSpots();
    return () => { isMounted = false; };
  }, [town]);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    height: headerHeight.value,
  }));

  const animatedMapContainerStyle = useAnimatedStyle(() => ({
    height: mapHeight.value,
    width: '100%',
    alignSelf: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  }));

  // Toggle expand/collapse
  const handleExpandToggle = () => {
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded); // React state for UI
    expanded.value = nextExpanded; // Reanimated value for animation
    const nextHeaderHeight = nextExpanded ? HEADER_HEIGHT_EXPANDED : HEADER_HEIGHT_COLLAPSED;
    headerHeight.value = withTiming(nextHeaderHeight, { duration: 300 });
    mapHeight.value = withTiming(nextHeaderHeight - 80, { duration: 300 });
  };

  // --- CONDITIONAL MAP RENDERING ---
  const showLiveTracking = !!session?.activeRoute;
  console.log('Live tracking enabled:', session?.activeRoute);

  return (
    <PaperProvider>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#fff', dark: '#000' }}
        headerImage={
          <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
            <View style={styles.topBarContainer}>
              <View style={styles.textFieldWrapper}>
                <TextField
                  placeholder="Search"
                  value={search}
                  onChangeText={setSearch}
                  style={styles.translucentTextField}
                />
              </View>
              <TouchableOpacity
                style={styles.notifButton}
                onPress={() => setNotifVisible(true)}
                activeOpacity={0.7}
              >
                <AntDesign name="bells" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            <Animated.View style={[styles.mapContainer, animatedMapContainerStyle, { zIndex: 1 }]}>
              {showLiveTracking ? (
                <LiveTrackingMap routeId={session?.activeRoute?.routeID} is3D={is3DView} />
              ) : (
                <TaraMap
                  region={{
                    latitude: userCoordinates.lat || 14.5995,
                    longitude: userCoordinates.lon || 120.9842,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                  mapStyle={{ flex: 1 }}
                />
              )}
            </Animated.View>
            {/* Map options: Toggle buttons and Location container */}
            <View style={styles.mapOptions}>
              {/* Toggle buttons at the top of mapOptions */}
              <View style={styles.tabChooserContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    isExpanded && styles.toggleButtonActive
                  ]}
                  onPress={handleExpandToggle}
                  activeOpacity={0.8}
                >
                  <ThemedText style={[styles.toggleButtonText, isExpanded && styles.toggleButtonTextActive]}>
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    is3DView && styles.toggleButtonActive
                  ]}
                  onPress={() => setIs3DView((prev) => !prev)}
                  activeOpacity={0.8}
                >
                  <ThemedText style={[styles.toggleButtonText, is3DView && styles.toggleButtonTextActive]}>
                    3D View
                  </ThemedText>
                </TouchableOpacity>
              </View>
              <ThemedView type="primary" style={[styles.locationContainer, { zIndex: 2 }]}>
                <ThemedText style={{ color: "gray" }}>You are currently in</ThemedText>
                <ThemedText type='subtitle'>
                  {errorMessage ? errorMessage : locationName}
                </ThemedText>
                <View style={styles.menuContainer}>
                  <TouchableOpacity onPress={() => router.push('/routes/routes')} style={styles.menuButton}>
                    <AntDesign name="retweet" size={24} color="#4300FF" />
                    <ThemedText>Routes</ThemedText>
                  </TouchableOpacity>
                  <View style={styles.verticalRule}>
                    <VerticalRule height="50%" color="#aaa" thickness={1} />
                  </View>
                  <TouchableOpacity onPress={() => router.push('/itineraries/itineraries')} style={styles.menuButton}>
                    <AntDesign name="paperclip" size={24} color="#4300FF" />
                    <ThemedText>Itineraries</ThemedText>
                  </TouchableOpacity>
                  <View style={styles.verticalRule}>
                    <VerticalRule height="50%" color="#aaa" thickness={1} />
                  </View>
                  <TouchableOpacity onPress={() => router.push('/weather')} style={styles.menuButton}>
                    <AntDesign name="cloudo" size={24} color="#4300FF" />
                    <ThemedText>Weather</ThemedText>
                  </TouchableOpacity>
                </View>
              </ThemedView>
            </View>
          </Animated.View>
        }
      >
        <View style={{ paddingHorizontal: 20 }}>
          <ThemedView style={styles.optionsContainer}>
            <ThemedView type='complimentary1' style={styles.optionsButton}>
              <ThemedText style={{fontSize: 13, fontWeight: 'bold'}}>Chat with Tara!</ThemedText>
              <ThemedText style={{fontSize: 11}}>you AI Travel Companion</ThemedText>
            </ThemedView>
            <ThemedView type='complimentary2' style={styles.optionsButton}>
              <ThemedText style={{fontSize: 13, fontWeight: 'bold'}}>Travel History</ThemedText>
              <ThemedText style={{fontSize: 11}}>your past travels</ThemedText>
            </ThemedView>
            <ThemedView type='complimentary3' style={styles.optionsButton}>
              <ThemedText>Button ni soon</ThemedText>
            </ThemedView>
            <ThemedView type='complimentary4' style={styles.optionsButton}>
              <ThemedText>Button ni soon</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Tourist Attractions Horizontal FlatList */}
          <View style={styles.touristSpotsContainer}>
            <ThemedText type="subtitle" style={{ marginBottom: 8, fontSize: 18}}>
              Tourist Attractions near you
            </ThemedText>
            {loadingSpots ? (
              <ThemedText>Loading...</ThemedText>
            ) : (
              <FlatList
                data={touristSpots}
                keyExtractor={(item, idx) => item.title + idx}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.touristSpotsScroll}
                renderItem={({ item }) => (
                  <Animated.View style={styles.spotCard}>
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        style={styles.spotImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.spotImage, styles.spotImagePlaceholder]}>
                        <AntDesign name="picture" size={32} color="#ccc" />
                      </View>
                    )}
                    <ThemedText style={styles.spotTitle} numberOfLines={2}>
                      {item.title}
                    </ThemedText>
                  </Animated.View>
                )}
                ListEmptyComponent={
                  <ThemedText style={{ color: '#888' }}>No spots found.</ThemedText>
                }
              />
            )}
          </View>
        </View>
        <LinearGradient
          colors={['#0065F8', '#00FFDE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.infoContainer}
        >
          <ThemedText style={{ color: 'white' }}>About</ThemedText>
          <ThemedText type="subtitle" style={{ color: 'white', marginBottom: 8, fontWeight: 'bold', zIndex: 2 }}>
            {town}
          </ThemedText>
          <View style={{ maxHeight: 100, overflow: 'hidden', marginBottom: 4, zIndex: 2 }}>
            <ThemedText style={{ color: 'white', textAlign: 'justify' }}>
              {wikiLoading ? 'Loading information...' : infoPreview}
            </ThemedText>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 8, justifyContent: 'flex-start', gap: 8, zIndex: 2 }}>
            <OutlineButton
              title="Search for Tours"
              onPress={() => {}}
              buttonStyle={{ borderColor: 'white', height: 40, paddingHorizontal: 18, width: 'auto', backgroundColor: 'rgba(255,255,255,.7)' }}
              textStyle={{ fontSize: 14 }}
            />
            {isLongInfo && (
              <OutlineButton
                title="See More"
                onPress={() => setInfoModalVisible(true)}
                buttonStyle={{ borderColor: 'white', height: 40, paddingHorizontal: 18, width: 'auto', backgroundColor: 'rgba(255,255,255,.7)' }}
                textStyle={{ fontSize: 14 }}
              />
            )}
          </View>
        </LinearGradient>
        <Portal>
          <Modal
            visible={infoModalVisible}
            onDismiss={() => setInfoModalVisible(false)}
            contentContainerStyle={{ backgroundColor: 'white', margin: 24, borderRadius: 12, padding: 20, maxHeight: '80%' }}
          >
            <ThemedText type="subtitle" style={{ marginBottom: 8, fontWeight: 'bold', textAlign: 'center' }}>{town}</ThemedText>
            <ThemedText style={{ textAlign: 'center' }}>{wikiInfo}</ThemedText>
            <TouchableOpacity onPress={() => setInfoModalVisible(false)} style={{ marginTop: 16 }}>
              <ThemedText style={{ color: '#007aff', textAlign: 'center' }}>Close</ThemedText>
            </TouchableOpacity>
          </Modal>
        </Portal>
      </ParallaxScrollView>
      <FabMenu
        mainLabel="Create Route"
        mainIcon={<MaterialIcons name="add" size={32} color="#fff" />}
        mainOnPress={() => router.push('/routes/create')}
        actions={[
          {
            label: 'Create Itinerary',
            icon: <MaterialIcons name="playlist-add" size={20} color="#00FFDE" />,
            onPress: () => router.push('/itineraries/create'),
          },
        ]}
      />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  topBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 30,
    marginBottom: 6,
    zIndex: 100,
    position: 'absolute',
    justifyContent: 'center',
  },
  mapOptions: {
    alignSelf: 'center',
    justifyContent: 'flex-start',
    overflow: 'visible',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    zIndex: 20,
    width: '80%',
    alignItems: 'center',
    marginLeft: '10%',
    paddingTop: 0,
  },
  tabChooserContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 8,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  toggleButton: {
    minWidth: 80,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderColor: 'gray',
    borderWidth: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#00CAFF',
    borderColor: '#00CAFF',
  },
  toggleButtonText: {
    fontSize: 13,
    color: '#333',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  textFieldWrapper: {
    flex: 1,
    marginRight: 12,
  },
  translucentTextField: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderColor: 'gray',
    borderWidth: 1,
  },
  notifButton: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderColor: 'gray',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -15,
  },
  headerContainer: {
    width: '100%',
    overflow: 'visible',
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  mapContainer: {
    width: '90%',
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  expandButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  locationContainer: {
    paddingVertical: 16,
    borderRadius: 15,
    elevation: 5,
    alignSelf: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    width: '100%',
    alignItems: 'center',
  },
  menuContainer: {
    width: '100%',
    height: 75,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 2,
  },
  menuButton: {
    width: '24%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 222, .3)',
    borderRadius: 16,
    aspectRatio: 1,
  },
  verticalRule: {
    alignSelf: 'center',
  },
  optionsContainer: {
    width: '100%',
    minHeight: 100,
    borderRadius: 16,
    marginTop: 10,
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
  },
  optionsButton: {
    flexBasis: '47%',
    height: 70,
    borderRadius: 15,
    padding: 10,
    alignContent: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    width: '100%',
    padding: 16,
    marginTop: 16,
    overflow: 'hidden',
    height: 245,
  },
  touristSpotsContainer: {
    marginTop: 18,
  },
  touristSpotsScroll: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 4,
  },
  spotCard: {
    borderRadius: 16,
    minWidth: 120,
    maxWidth: 140,
    justifyContent: 'flex-start',
  },
  spotImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 5,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  spotImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotTitle: {
    fontWeight: 'bold',
    fontSize: 13,
  },
});