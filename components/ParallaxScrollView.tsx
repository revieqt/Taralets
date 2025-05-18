import { Dimensions, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
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

const SCREEN_HEIGHT = Dimensions.get('window').height;
const HEADER_HEIGHT = 250;
const FLOATING_VIEW_HEIGHT = 85;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.9;

type Props = React.PropsWithChildren<{
  header?: (height: number) => React.ReactNode;
}>;

export default function ParallaxScrollView({ children, header }: Props) {
  const [location, setLocation] = useState<{ street: string; city: string } | null>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();

  const animatedHeight = useSharedValue(HEADER_HEIGHT);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch user location once on component mount
  useEffect(() => {
    const fetchLocation = async () => {
      const currentLocation = await getUserLocation();
      if (currentLocation) {
        setUserCoords({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        });
        const street = await userLocation.street(currentLocation.latitude, currentLocation.longitude);
        const city = await userLocation.city(currentLocation.latitude, currentLocation.longitude);
        setLocation({ street, city });
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
            {!isExpanded && (
              <TouchableOpacity style={styles.expandButton} onPress={handleExpand}>
                <Text style={styles.buttonText}>Expand</Text>
              </TouchableOpacity>
            )}
            {isExpanded && (
              <TouchableOpacity style={styles.collapseButton} onPress={handleCollapse}>
                <Text style={styles.buttonText}>Collapse</Text>
              </TouchableOpacity>
            )}
          </ThemedView>
        </Animated.View>

        <Animated.View style={floatingStyle}>
          <ThemedView style={styles.locationContainer}>
            {location ? (
              <View style={styles.locationTextContainer}>
                <ThemedText>You are currently at:</ThemedText>
                <ThemedText type="subtitle">{`${location.street}, ${location.city}`}</ThemedText>
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
  map: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    width: '100%',
    height: '100%',
  },
  expandButton: {
    position: 'absolute',
    bottom: 55,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
    zIndex: 20,
  },
  collapseButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
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
});