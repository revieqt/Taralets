import React from 'react';
import { TouchableOpacity, StyleSheet, Text, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  gradientColors?: readonly [string, string, ...string[]];
  textStyle?: TextStyle;
  buttonStyle?: ViewStyle;
  disabled?: boolean; // <-- Add this line
  loading?: boolean;  // Optional: for loading state
}

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  gradientColors = ['#205781', '#7AB2D3'],
  textStyle,
  buttonStyle,
  disabled = false, // <-- Add this line
  loading = false,  // Optional: for loading state
}) => {
  return (
    <TouchableOpacity
      onPress={disabled || loading ? undefined : onPress}
      activeOpacity={0.85}
      style={[
        styles.button,
        buttonStyle,
        disabled ? { opacity: 0.5 } : null // Visually indicate disabled
      ]}
      disabled={disabled || loading}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={[styles.text, textStyle]}>
          {loading ? 'Loading...' : title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 50,
    overflow: 'hidden',
    borderRadius: 25,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default GradientButton;