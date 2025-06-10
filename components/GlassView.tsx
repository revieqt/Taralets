import React from 'react';
import { StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const GlassView: React.FC<GlassViewProps> = ({
  intensity = 80,
  tint = 'light',
  style,
  children,
}) => {
  return (
    <BlurView intensity={intensity} tint={tint} style={[styles.glass, style]}>
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  glass: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
});

export default GlassView;
