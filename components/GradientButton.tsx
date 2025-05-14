import React from 'react';
import { TouchableOpacity, StyleSheet, Text, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  gradientColors?: readonly [string, string, ...string[]]; // Updated to tuple type
  textStyle?: TextStyle;
  buttonStyle?: ViewStyle;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  gradientColors = ['#205781', '#7AB2D3'], // Default gradient colors
  textStyle,
  buttonStyle,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.button, buttonStyle]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%', // Hardcoded width
    height: 50, // Hardcoded height
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