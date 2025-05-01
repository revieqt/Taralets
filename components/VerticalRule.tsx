import React from 'react';
import { View, ViewStyle } from 'react-native';

type VerticalRuleProps = {
  height?: number | `${number}%`;  // Correct typing for height (number or percentage)
  color?: string;
  thickness?: number;
  marginHorizontal?: number;
};

const VerticalRule: React.FC<VerticalRuleProps> = ({
  height = '100%',  // Default value
  color = '#ccc',
  thickness = 1,
  marginHorizontal = 8,
}) => {
  // Define style for the vertical line with height, width, and other properties
  const style: ViewStyle = {
    height,
    backgroundColor: color,
    width: thickness,
    marginHorizontal,
    alignSelf: 'stretch',  // Make sure it stretches across available space
  };

  return <View style={style} />;
};

export default VerticalRule;
