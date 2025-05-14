import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface TextFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isFocused?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const TextField: React.FC<TextFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  onFocus,
  onBlur,
  isFocused,
  keyboardType = 'default',
  autoCapitalize = 'none',
}) => {
  return (
    <View
      style={[
        styles.inputWrapper,
        isFocused && styles.inputFocused, // Apply focus style conditionally
      ]}
    >
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        placeholderTextColor="#aaa"
        onFocus={onFocus}
        onBlur={onBlur}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
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
});

export default TextField;