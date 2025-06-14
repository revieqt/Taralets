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

const { height: screenHeight } = Dimensions.get('window');
const HEADER_HEIGHT_COLLAPSED = 350;
const HEADER_HEIGHT_EXPANDED = screenHeight * 0.95;

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

  // mapContainer height is always headerHeight - 50
  const mapHeight = useSharedValue(HEADER_HEIGHT_COLLAPSED - 40);

  const toggleExpand = () => {
    expanded.value = !expanded.value;
    const nextHeaderHeight = expanded.value ? HEADER_HEIGHT_EXPANDED : HEADER_HEIGHT_COLLAPSED;
    headerHeight.value = withTiming(nextHeaderHeight, { duration: 300 });
    mapHeight.value = withTiming(nextHeaderHeight - 40, { duration: 300 });
  };

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

            <Animated.View style={[styles.mapContainer, animatedMapContainerStyle]}>
              <TouchableOpacity
                onPress={toggleExpand}
                activeOpacity={0.8}
                style={{ flex: 1 }}
              >
                <TaraMap
                  region={{
                    latitude: userCoordinates.lat || 14.5995,
                    longitude: userCoordinates.lon || 120.9842,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                  mapStyle={{ flex: 1 }}
                />
              </TouchableOpacity>
            </Animated.View>
            <ThemedView type="primary" style={styles.locationShadow}>
              <ThemedView type='primary' style={styles.locationContainer}>
                <ThemedText>You are currently in</ThemedText>
                <ThemedText type='subtitle'>
                  {errorMessage ? errorMessage : locationName}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </Animated.View>
        }
      >
        <View style={{ paddingHorizontal: 20 }}>
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

          <View style={styles.infoContainer}>
            <ThemedText>About</ThemedText>
            <ThemedText type="subtitle" style={{ marginBottom: 8, fontWeight: 'bold', zIndex: 2 }}>
              {town}
            </ThemedText>
            <View style={{ maxHeight: 100, overflow: 'hidden', marginBottom: 4, zIndex: 2 }}>
              <ThemedText>
                {wikiLoading ? 'Loading information...' : infoPreview}
              </ThemedText>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 8, justifyContent: 'flex-start', gap: 8, zIndex: 2 }}>
              <OutlineButton
                title="Search for Tours"
                onPress={() => {}}
                buttonStyle={{ height: 40, paddingHorizontal: 18, width: 'auto', backgroundColor: 'rgba(255,255,255,.7)' }}
                textStyle={{ fontSize: 14 }}
              />
              {isLongInfo && (
                <OutlineButton
                  title="See More"
                  onPress={() => setInfoModalVisible(true)}
                  buttonStyle={{ height: 40, paddingHorizontal: 18, width: 'auto', backgroundColor: 'rgba(255,255,255,.7)' }}
                  textStyle={{ fontSize: 14 }}
                />
              )}
            </View>
          </View>

          {/* Tourist Attractions Horizontal FlatList */}
          <View style={styles.touristSpotsContainer}>
            <ThemedText type="subtitle" style={{ marginBottom: 8, fontWeight: 'bold' }}>
              Tourist Attractions
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
                  <View style={styles.spotCard}>
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
                  </View>
                )}
                ListEmptyComponent={
                  <ThemedText style={{ color: '#888' }}>No spots found.</ThemedText>
                }
              />
            )}
          </View>
        </View>

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
  textFieldWrapper: {
    flex: 1,
    marginRight: 12,
  },
  translucentTextField: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  notifButton: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderColor: '#ccc',
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
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
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
  locationShadow: {
    height: 50,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    elevation: 10,
    alignSelf: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center',
    overflow: 'visible',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    zIndex: 20,
    width: '80%',
    alignItems: 'center',
    marginLeft: '10%',
  },
  locationContainer: {
    width: '100%',
    height: 90,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  menuContainer: {
    width: '100%',
    height: 80,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 2,
  },
  menuButton: {
    width: '26%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  verticalRule: {
    alignSelf: 'center',
  },
  taraContainer: {
    width: '100%',
    height: 100,
    borderRadius: 16,
    marginTop: 10,
    padding: 16,
    elevation: 5,
  },
  infoContainer: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    overflow: 'hidden',
    height: 245,
  },
  touristSpotsContainer: {
    marginTop: 18,
    marginBottom: 8,
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