import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface PasswordFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isFocused?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  onFocus,
  onBlur,
  isFocused: isFocusedProp,
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'tint');

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const focused = isFocusedProp !== undefined ? isFocusedProp : isFocused;

  // Animated value for floating label
  const [animated] = useState(new Animated.Value(value ? 1 : 0));

  React.useEffect(() => {
    Animated.timing(animated, {
      toValue: focused || value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus && onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur && onBlur();
  };

  const labelStyle = {
    position: 'absolute' as const,
    left: 20,
    top: animated.interpolate({
      inputRange: [-0.3, 1],
      outputRange: [18, -10],
    }),
    fontSize: animated.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animated.interpolate({
      inputRange: [0, 1],
      outputRange: ['#aaa', borderColor],
    }),
    backgroundColor: backgroundColor,
    zIndex: 2,
  };

  return (
    <View
      style={[
        styles.inputWrapper,
        { backgroundColor },
        { borderColor: focused ? borderColor : '#cccccc', borderWidth: 1 },
      ]}
    >
      <Animated.Text style={labelStyle}>{placeholder}</Animated.Text>
      <TextInput
        secureTextEntry={!isPasswordVisible}
        style={[
          styles.input,
          { color: textColor, textAlignVertical: 'center', paddingTop: 0, paddingBottom: 0 },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={focused ? '' : placeholder}
        placeholderTextColor={useThemeColor({ light: '#aaa', dark: '#888' }, 'icon')}
        onFocus={handleFocus}
        onBlur={handleBlur}
        underlineColorAndroid="transparent"
      />
      <TouchableOpacity
        style={styles.eyeButton}
        onPress={() => setPasswordVisible(!isPasswordVisible)}
      >
        <Ionicons
          name={isPasswordVisible ? 'eye-off' : 'eye'}
          size={20}
          color={useThemeColor({ light: '#888', dark: '#aaa' }, 'icon')}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 25,
    marginBottom: 15,
    borderWidth: 1,
    position: 'relative',
    minHeight: 48,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: 48,
    backgroundColor: 'transparent',
  },
  eyeButton: {
    marginLeft: 10,
  },
});

export default PasswordField;