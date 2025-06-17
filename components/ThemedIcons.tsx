import React from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';

// Import icon libraries
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type IconLibrary =
  | 'AntDesign'
  | 'MaterialIcons'
  | 'Ionicons'
  | 'FontAwesome'
  | 'Feather'
  | 'Entypo'
  | 'MaterialCommunityIcons';

type ThemedIconsProps = {
  library: IconLibrary;
  name: any;
  color?: string;
  size: number;
};

const iconLibraries = {
  AntDesign,
  MaterialIcons,
  Ionicons,
  FontAwesome,
  Feather,
  Entypo,
  MaterialCommunityIcons,
};

export const ThemedIcons: React.FC<ThemedIconsProps> = ({
  library,
  name,
  color,
  size,
}) => {
  const iconColor = useThemeColor(
    { light: undefined, dark: undefined },
    'icon'
  );

  const IconComponent = iconLibraries[library];

  return (
    <IconComponent
      name={name}
      size={size}
      color={color ?? iconColor}
    />
  );
};

export default ThemedIcons;