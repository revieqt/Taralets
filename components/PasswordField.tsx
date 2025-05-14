import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  isFocused,
}) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  return (
    <View
      style={[
        styles.inputWrapper,
        isFocused && styles.inputFocused, // Apply focus style conditionally
      ]}
    >
      <TextInput
        placeholder={placeholder}
        secureTextEntry={!isPasswordVisible}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#aaa"
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <TouchableOpacity
        style={styles.eyeButton}
        onPress={() => setPasswordVisible(!isPasswordVisible)}
      >
        <Ionicons
          name={isPasswordVisible ? 'eye-off' : 'eye'}
          size={20}
          color="#888"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f6',
    padding: 3,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 25,
    marginBottom: 10,
    borderWidth: 0, // Ensure no border by default
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  inputFocused: {
    borderWidth: 2, // Add border when focused
    borderColor: '#000',
    backgroundColor: '#f1f3f6', // Keep the same background color
  },
  eyeButton: {
    marginLeft: 10,
  },
});

export default PasswordField;