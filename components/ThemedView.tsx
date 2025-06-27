import { Animated, type ViewProps, StyleSheet} from 'react-native';
import { useEffect, useRef } from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'complimentary1' | 'complimentary2' | 'complimentary3' | 'complimentary4';
  shadow?: 'soft' | 'default';
  border?: 'thin-gray' | 'thin-black' | 'thin-white';
  opacity?: number;
  roundness?: number; // <-- added prop
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  color,
  shadow,
  border,
  opacity,
  roundness, // <-- added prop
  ...otherProps
}: ThemedViewProps) {
  let colorKey:
    | 'background'
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'complimentary1'
    | 'complimentary2'
    | 'complimentary3'
    | 'complimentary4' = 'background';
  if (color === 'primary') colorKey = 'primary';
  else if (color === 'secondary') colorKey = 'secondary';
  else if (color === 'accent') colorKey = 'accent';
  else if (color === 'complimentary1') colorKey = 'complimentary1';
  else if (color === 'complimentary2') colorKey = 'complimentary2';
  else if (color === 'complimentary3') colorKey = 'complimentary3';
  else if (color === 'complimentary4') colorKey = 'complimentary4';

  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, colorKey);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  let shadowStyle = {};
  if (shadow === 'soft') {
    shadowStyle = {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 30,
      elevation: 8,
    };
  } else if (shadow === 'default') {
    shadowStyle = {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    };
  }

  let borderStyle = {};
  if (border === 'thin-gray') {
    borderStyle = { borderWidth: 1, borderColor: 'gray' };
  } else if (border === 'thin-black') {
    borderStyle = { borderWidth: 1, borderColor: 'black' };
  } else if (border === 'thin-white') {
    borderStyle = { borderWidth: 1, borderColor: 'white' };
  }
  const viewOpacity = typeof opacity === 'number' ? opacity : fadeAnim;

  // Add roundness if provided
  const roundnessStyle = typeof roundness === 'number' ? { borderRadius: roundness } : {};

  return (
    <Animated.View
      style={[
        { backgroundColor, opacity: viewOpacity },
        shadowStyle,
        borderStyle,
        roundnessStyle,
        style,
      ]}
      {...otherProps}
    />
  );
}