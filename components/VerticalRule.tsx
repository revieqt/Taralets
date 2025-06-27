import React from 'react';
import { View, ViewStyle } from 'react-native';

type VerticalRuleProps = {
  height?: number | `${number}%`;
  color?: string;
  thickness?: number;
  marginHorizontal?: number;
};

const VerticalRule: React.FC<VerticalRuleProps> = ({
  height = '100%',
  color = '#ccc',
  thickness = 1,
  marginHorizontal = 8,
}) => {
  const style: ViewStyle = {
    height,
    backgroundColor: color,
    width: thickness,
    marginHorizontal,
    alignSelf: 'stretch',
  };

  return <View style={style} />;
};

export default VerticalRule;
