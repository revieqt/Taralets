import { Dimensions, StyleSheet, TouchableOpacity, Text, View, Alert } from 'react-native';
import Animated, {
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
  useSharedValue,
  interpolate,
  withTiming,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useState, useEffect } from 'react';
import { ThemedText } from './ThemedText';
import userLocation from '@/utils/userLocationAddress';
import { getUserLocation } from '@/services/mapService';
import { useSession } from '@/context/SessionContext';
import haversine from 'haversine-distance';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const HEADER_HEIGHT = 250;
const FLOATING_VIEW_HEIGHT = 85;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.9;

type Props = React.PropsWithChildren<{
  header?: (height: number) => React.ReactNode;
}>;

export default function ParallaxScrollView({ children, header }: Props) {
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();

  const animatedHeight = useSharedValue(HEADER_HEIGHT);
  const [isExpanded, setIsExpanded] = useState(false);

  // Session context for ActiveRoute
  const { session, updateSession } = useSession();

  // Fetch user location and place name using Nominatim (userLocation utility)
  useEffect(() => {
    const fetchLocation = async () => {
      const currentLocation = await getUserLocation();
      if (currentLocation) {
        setUserCoords({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        });

        // Use your Nominatim utility for reverse geocoding
        try {
          const street = await userLocation.street(currentLocation.latitude, currentLocation.longitude);
          const city = await userLocation.city(currentLocation.latitude, currentLocation.longitude);
          setPlaceName(`${street}, ${city}`);
        } catch (e) {
          setPlaceName('Unknown location');
        }
      }
    };

    fetchLocation();
  }, []);

  // Animated header container style
  const containerStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    transform: [
      {
        translateY: interpolate(
          scrollOffset.value,
          [-animatedHeight.value, 0, animatedHeight.value],
          [-animatedHeight.value / 2, 0, animatedHeight.value * 0.3]
        ),
      },
    ],
  }));

  // Floating ThemedView style
  const floatingStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    height: FLOATING_VIEW_HEIGHT,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  }));

  const handleExpand = () => {
    animatedHeight.value = withTiming(EXPANDED_HEIGHT, { duration: 300 });
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    animatedHeight.value = withTiming(HEADER_HEIGHT, { duration: 300 });
    setIsExpanded(false);
  };

  // --- Live Route Card Logic ---
  // Calculate total remaining distance from user to end point via all waypoints
  const [remainingDistance, setRemainingDistance] = useState<number>(0);
  useEffect(() => {
    if (
      isExpanded &&
      session?.activeRoute &&
      userCoords &&
      Array.isArray(session.activeRoute.location)
    ) {
      const locs = session.activeRoute.location;
      let total = 0;
      let prev = userCoords;
      for (let i = 0; i < locs.length; i++) {
        total += haversine(prev, locs[i]);
        prev = locs[i];
      }
      setRemainingDistance(total);
    } else {
      setRemainingDistance(0);
    }
  }, [isExpanded, session?.activeRoute, userCoords]);

  // End Route Handler (fix: update all active routes for user, remove session)
  const handleEndRoute = async () => {
    if (!session?.activeRoute) return;
    try {
      const db = getFirestore();
      // Find all active routes for this user
      const q = query(
        collection(db, 'routes'),
        where('userID', '==', session.activeRoute.userID),
        where('status', '==', 'active')
      );
      const snap = await getDocs(q);
      // Update all found routes to completed
      for (const routeDoc of snap.docs) {
        await updateDoc(doc(db, 'routes', routeDoc.id), { status: 'completed' });
      }
      // Remove activeRoute from session (ensure it's cleared)
      await updateSession({ activeRoute: undefined });
      // Alert the user
      Alert.alert('Route Ended', 'Your route has been successfully ended.');
    } catch (err) {
      console.error('Failed to end route:', err);
      Alert.alert('Error', 'Failed to end route. Please try again.');
    }
  };

  // --- Live Route Card UI ---
  const LiveRouteCard = () => {
    if (
      !isExpanded ||
      !session?.activeRoute ||
      !userCoords ||
      !Array.isArray(session.activeRoute.location) ||
      session.activeRoute.location.length === 0
    ) {
      return null;
    }
    return (
      <View style={styles.liveRouteCardFullWidth}>
        <ThemedText style={styles.liveRouteTitle}>Remaining Distance</ThemedText>
        <View style={styles.liveRouteDistances}>
          <ThemedText style={styles.liveRouteLabel}>
            <ThemedText style={styles.liveRouteValue}>
              {(remainingDistance / 1000).toFixed(2)} km
            </ThemedText>
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.endRouteBtn} onPress={handleEndRoute}>
          <ThemedText style={styles.endRouteBtnText}>End Route</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}
      >
        <Animated.View style={[styles.headerContainer, containerStyle]}>
          <ThemedView style={styles.header}>
            <View style={StyleSheet.absoluteFill}>
              {header && header(animatedHeight.value)}
            </View>
            <View style={styles.headerTopRowFullWidth}>
              {isExpanded && session?.activeRoute && (
                <>
                  <LiveRouteCard />
                  {/* Collapse button outside, bottom right of the card */}
                  <View style={styles.collapseButtonCardWrapper}>
                    <TouchableOpacity style={styles.collapseButtonCard} onPress={handleCollapse}>
                      <Text style={styles.buttonText}>Collapse</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
              {isExpanded && !session?.activeRoute && (
                <View style={styles.collapseButtonTopRightContainer}>
                  <TouchableOpacity style={styles.collapseButton} onPress={handleCollapse}>
                    <Text style={styles.buttonText}>Collapse</Text>
                  </TouchableOpacity>
                </View>
              )}
              {!isExpanded && (
                <TouchableOpacity style={styles.expandButton} onPress={handleExpand}>
                  <Text style={styles.buttonText}>Expand</Text>
                </TouchableOpacity>
              )}
            </View>
          </ThemedView>
        </Animated.View>

        <Animated.View style={floatingStyle}>
          <ThemedView style={styles.locationContainer}>
            {placeName ? (
              <View style={styles.locationTextContainer}>
                <ThemedText>You are currently at:</ThemedText>
                <ThemedText type="subtitle">{placeName}</ThemedText>
              </View>
            ) : (
              <View style={styles.locationTextContainer}>
                <ThemedText>Loading location...</ThemedText>
              </View>
            )}
          </ThemedView>
        </Animated.View>

        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    width: '100%',
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'visible',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTopRow: {
    position: 'absolute',
    top: 50,
    right: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    zIndex: 10,
    gap: 10,
  },
  headerTopRowFullWidth: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 10,
    gap: 10,
    width: '100%',
  },
  collapseButtonTopRightContainer: {
    position: 'absolute',
    top: 0,
    right: 16,
    zIndex: 20,
    alignItems: 'flex-end',
    width: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    width: '100%',
    height: '100%',
  },
  expandButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
    zIndex: 20,
    marginLeft: 'auto',
  },
  collapseButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
    marginLeft: 10,
    alignSelf: 'flex-end',
  },
  // Wrapper for collapse button outside the card
  collapseButtonCardWrapper: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: -8, // Pull up so it's visually outside the card
  },
  collapseButtonCard: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
    zIndex: 20,
    marginRight: 0,
  },
  content: {
    paddingTop: 50,
    paddingHorizontal: 24,
    gap: 16,
  },
  locationContainer: {
    height: 80,
    width: '100%',
    borderRadius: 30,
    borderColor: '#ccc',
    // Modern shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    // Modern shadow for Android
    elevation: 5,
  },
  locationTextContainer: {
    marginTop: 13,
    marginLeft: 20,
    overflow: 'hidden',
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  liveRouteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    minWidth: '70%',
    marginRight: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  liveRouteCardFullWidth: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    width: '90%',
    alignSelf: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 4,
  },
  liveRouteTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#205781',
  },
  liveRouteDistances: {
    marginBottom: 6,
  },
  liveRouteLabel: {
    fontSize: 14,
    color: '#205781',
  },
  liveRouteValue: {
    fontWeight: 'bold',
    color: '#205781',
    fontSize: 14,
  },
  endRouteBtn: {
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  endRouteBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});