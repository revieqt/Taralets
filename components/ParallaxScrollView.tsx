import React, { ReactNode } from 'react';
import { ScrollView, View, StyleSheet, useColorScheme } from 'react-native';

type ParallaxScrollViewProps = {
  headerImage: ReactNode;
  headerBackgroundColor?: { light: string; dark: string };
  children: ReactNode;
};

export default function ParallaxScrollView({
  headerImage,
  headerBackgroundColor = { light: '#fff', dark: '#000' },
  children,
}: ParallaxScrollViewProps) {
  const colorScheme = useColorScheme();
  const backgroundColor =
    colorScheme === 'dark'
      ? headerBackgroundColor.dark
      : headerBackgroundColor.light;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor }}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={styles.headerContainer}>{headerImage}</View>
      <View style={styles.contentContainer}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 0,
  },
});