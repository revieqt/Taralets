import { Dimensions, StyleSheet, TouchableOpacity, Text, View , Image} from 'react-native';
import Animated, { useAnimatedRef, useAnimatedStyle, useScrollViewOffset, useSharedValue, interpolate, withTiming } from 'react-native-reanimated';


import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useState, useEffect } from 'react';
import { ThemedText } from './ThemedText';
import userLocation from '@/utils/userLocationAddress';  // Assuming your location utility is imported
import { getUserLocation } from '@/utils/location';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const HEADER_HEIGHT = 250;
const FLOATING_VIEW_HEIGHT = 85;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.90;

type Props = PropsWithChildren<{}>;

export default function ParallaxScrollView({ children }: Props) {
  const [location, setLocation] = useState<{ street: string; city: string } | null>(null);
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
        const street = await userLocation.street(currentLocation.lat, currentLocation.long);
        const city = await userLocation.city(currentLocation.lat, currentLocation.long);
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
        contentContainerStyle={{ paddingBottom: bottom }}>
        
        {/* Expanding Header Container */}
        <Animated.View style={[styles.headerContainer, containerStyle]}>
          <ThemedView style={styles.header}>
            {!isExpanded && (
              <TouchableOpacity style={styles.expandButton} onPress={handleExpand}>
                <Text style={styles.buttonText}>Expand</Text>
              </TouchableOpacity>
            )}
            {isExpanded && (
              <TouchableOpacity style={styles.collapseButton} onPress={handleCollapse}>
                <Text style={styles.buttonText}>X</Text>
              </TouchableOpacity>
            )}
          </ThemedView>
        </Animated.View>

        <Animated.View style={floatingStyle}>
            <ThemedView style={styles.locationContainer}>
              <Image source={require('../assets/images/tara_readingmap.png')} style={styles.image} />
              

              {location ? (
                    <View style={styles.locationTextContainer}>
                      <ThemedText>
                        You are currently at:
                      </ThemedText>
                      <ThemedText type='subtitle'>
                        {`${location.street}, ${location.city}`}
                      </ThemedText>
                    </View>
              ) : (
                <View style={styles.locationTextContainer}>
                  <ThemedText>Loading location...</ThemedText>
                </View>
              )}
              
            </ThemedView>
            
          </Animated.View>
        

        {/* Scrollable Content */}
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
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandButton: {
    position: 'absolute',
    bottom: 50,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 4,
    zIndex: 20,
  },
  collapseButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 4,
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
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  image:{
    position: 'absolute',
    width: 100,
    resizeMode: 'contain',
    marginTop: -203,
    marginLeft: -2,
    borderRadius: 10,
  },
  locationTextContainer: {
    marginTop: 12,
    marginLeft: 90,
  },
});
