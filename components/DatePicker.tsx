import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerProps {
  placeholder: string;
  value: Date | null;
  onChange: (date: Date) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isFocused?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  isFocused,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View
      style={[
        styles.inputWrapper,
        isFocused && styles.inputFocused, // Apply focus style conditionally
      ]}
    >
      <TextInput
        placeholder={placeholder}
        value={value ? value.toISOString().slice(0, 10) : ''}
        style={styles.input}
        placeholderTextColor="#aaa"
        editable={false} // Prevent manual editing
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => setShowPicker(true)}
      >
        <Ionicons name="calendar" size={20} color="#888" />
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()} // Prevent selecting future dates
        />
      )}
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
  iconButton: {
    marginLeft: 10,
  },
});

export default DatePicker;