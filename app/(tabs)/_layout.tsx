import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Custom tabBarIcon wrapper to add top border when focused
function TabBarIconWithTopBorder({ name, color, focused, activeColor }: { name: any, color: string, focused: boolean, activeColor: string }) {
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      borderTopWidth: 3,
      borderTopColor: focused ? activeColor : 'transparent',
      paddingTop: 8,
      paddingHorizontal: 8,
      height: 38, // adjust for your tab bar height
      width: 38, // adjust for your tab bar width
      marginTop: 8,
    }}>
      <AntDesign size={22} name={name} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarShowLabel: false,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            paddingHorizontal: 24,
            paddingBottom: 12,
            paddingTop: 8,
          },
          default: {
            paddingHorizontal: 10,
            paddingBottom: 12,
            height: 55,
          },
        }),
      }}>
      <Tabs.Screen  
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIconWithTopBorder
              name="home"
              color={color}
              focused={focused}
              activeColor={activeColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIconWithTopBorder
              name="team"
              color={color}
              focused={focused}
              activeColor={activeColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIconWithTopBorder
              name="exclamationcircleo"
              color={color}
              focused={focused}
              activeColor={activeColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIconWithTopBorder
              name="user"
              color={color}
              focused={focused}
              activeColor={activeColor}
            />
          ),
        }}
      />
    </Tabs>
  );
}