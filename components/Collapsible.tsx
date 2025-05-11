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
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
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
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <IconSymbol
          name="right"
          size={18}
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />
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
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  animatedContainer: {
    overflow: 'hidden',
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
    position: 'absolute', // absolute inside animated view for measurement
    width: '100%',
  },
});
