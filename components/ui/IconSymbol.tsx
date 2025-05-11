import AntDesign from '@expo/vector-icons/AntDesign';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

export type IconSymbolName = React.ComponentProps<typeof AntDesign>['name'];

/**
 * An icon component that uses FontAwesome directly.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
}) {
  return <AntDesign color={color} size={size} name={name} style={style} />;
}