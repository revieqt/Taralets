import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeColor } from '@/hooks/useThemeColor';

interface DatePickerProps {
  placeholder: string;
  value: Date | null;
  onChange: (date: Date) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isFocused?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  isFocused: isFocusedProp,
  minimumDate,
  maximumDate,
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'tint');

  const [showPicker, setShowPicker] = useState(false);
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
    setShowPicker(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur && onBlur();
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowPicker(false);
    handleBlur();
    if (selectedDate) {
      onChange(selectedDate);
    }
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
        value={value ? value.toISOString().slice(0, 10) : ''}
        style={[
          styles.input,
          { color: textColor, textAlignVertical: 'center', paddingTop: 0, paddingBottom: 0 },
        ]}
        placeholder={focused ? '' : placeholder}
        placeholderTextColor={useThemeColor({ light: '#aaa', dark: '#888' }, 'icon')}
        editable={false}
        onFocus={handleFocus}
        onBlur={handleBlur}
        pointerEvents="none"
      />
      <TouchableOpacity
        style={styles.iconButton}
        onPress={handleFocus}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar" size={20} color={useThemeColor({ light: '#888', dark: '#aaa' }, 'icon')} />
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
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
  iconButton: {
    marginLeft: 10,
  },
});

export default DatePicker;