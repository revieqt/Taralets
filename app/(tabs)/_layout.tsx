import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarShowLabel: false, // Hide tab labels
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            paddingHorizontal: 24, // Add horizontal padding
            paddingBottom: 12,     // Add bottom padding
            paddingTop: 8,         // Optional: add top padding
          },
          default: {
            paddingHorizontal: 10,
            paddingBottom: 12,
            paddingTop: 8,
          },
        }),
      }}>
      <Tabs.Screen  
        name="home"
        options={{
          tabBarIcon: ({ color }) => <AntDesign size={22} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          tabBarIcon: ({ color }) => <AntDesign size={22} name="team" color={color} />,
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          tabBarIcon: ({ color }) => <AntDesign size={22} name="exclamationcircleo" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <AntDesign size={22} name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}