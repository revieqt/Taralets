import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, TextStyle } from 'react-native';
import OutlineButton from './OutlineButton';

interface TabChooserProps {
  tabs: string[];
  onTabChange?: (index: number) => void;
  containerStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  activeButtonStyle?: ViewStyle;
  activeTextStyle?: TextStyle;
  initialIndex?: number;
}

const TabChooser: React.FC<TabChooserProps> = ({
  tabs,
  onTabChange,
  containerStyle,
  buttonStyle,
  textStyle,
  activeButtonStyle,
  activeTextStyle,
  initialIndex = 0,
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const handlePress = (index: number) => {
    setActiveIndex(index);
    if (onTabChange) onTabChange(index);
  };

  return (
    <View style={[containerStyle]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {tabs.map((tab, idx) => (
          <OutlineButton
            key={tab}
            title={tab}
            onPress={() => handlePress(idx)}
            buttonStyle={
                [
                styles.button,
                buttonStyle,
                activeIndex === idx && styles.activeButton,
                activeIndex === idx && activeButtonStyle,
                ].filter(Boolean) as ViewStyle[]
            }
            textStyle={
                [
                styles.text,
                textStyle,
                activeIndex === idx && styles.activeText,
                activeIndex === idx && activeTextStyle,
                ].filter(Boolean) as TextStyle[]
            }
            />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  button: {
    backgroundColor: 'transparent',
    borderColor: '#ccc',
    borderWidth: 2,
  },
  activeButton: {
    backgroundColor: '#205781',
    borderColor: '#205781',
  },
  text: {
    color: '#205781',
  },
  activeText: {
    color: '#fff',
  },
});

export default TabChooser;