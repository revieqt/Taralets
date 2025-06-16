import { View, Animated, type ViewProps } from 'react-native';
import { useEffect, useRef } from 'react';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'primary' | 'secondary' | 'accent'| 'complimentary1'| 'complimentary2' | 'complimentary3'| 'complimentary4';
};

export function ThemedView({ style, lightColor, darkColor, type, ...otherProps }: ThemedViewProps) {
  // Determine which color to use based on the "type" prop
  let colorKey: 'background' | 'primary' | 'secondary' | 'accent'| 'complimentary1'| 'complimentary2' | 'complimentary3'| 'complimentary4' = 'background';
  if (type === 'primary') colorKey = 'primary';
  else if (type === 'secondary') colorKey = 'secondary';
  else if (type === 'accent') colorKey = 'accent';
  else if (type === 'complimentary1') colorKey = 'complimentary1';
  else if (type === 'complimentary2') colorKey = 'complimentary2';
  else if (type === 'complimentary3') colorKey = 'complimentary3';
  else if (type === 'complimentary4') colorKey = 'complimentary4';

  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, colorKey);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[{ backgroundColor, opacity: fadeAnim }, style]} {...otherProps} />
  );
}