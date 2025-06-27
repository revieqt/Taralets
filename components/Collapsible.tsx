import { PropsWithChildren, useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
  View,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const animatedController = useRef(new Animated.Value(0)).current;
  const [bodySectionHeight, setBodySectionHeight] = useState(0);
  const theme = useColorScheme() ?? 'light';

  useEffect(() => {
    Animated.timing(animatedController, {
      duration: 300,
      toValue: isOpen ? 1 : 0,
      useNativeDriver: false,
      easing: Easing.ease,
    }).start();

    // Optional smooth layout change
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [isOpen]);

  const bodyHeight = animatedController.interpolate({
    inputRange: [0, 1],
    outputRange: [0, bodySectionHeight],
  });

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>

      {/* Animated container */}
      <Animated.View style={[styles.animatedContainer, { height: bodyHeight }]}>
        {/* Measure children height once */}
        <View
          style={styles.content}
          onLayout={(event) => setBodySectionHeight(event.nativeEvent.layout.height)}>
          {children}
        </View>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 15,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    padding: 10,
  },
  animatedContainer: {
    overflow: 'hidden',
  },
  content: {
    marginTop: 6,
    position: 'absolute', // absolute inside animated view for measurement
    width: '100%',
    paddingBottom: 13,
  },
});
