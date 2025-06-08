import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface OutlineButtonProps {
  title: string;
  onPress: () => void;
  buttonStyle?: ViewStyle| ViewStyle[];
  textStyle?: TextStyle| TextStyle[];
}

const OutlineButton: React.FC<OutlineButtonProps> = ({
  title,
  onPress,
  buttonStyle,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, buttonStyle]}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: '#205781',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  text: {
    color: '#205781',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default OutlineButton;