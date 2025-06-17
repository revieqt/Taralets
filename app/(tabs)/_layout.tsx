import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, Text } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
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
      paddingTop: 3,
      paddingHorizontal: 8,
      height: 38,
      width: 38,
      marginTop: 8,
    }}>
      <AntDesign size={20} name={name} color={color} />
    </View>
  );
}

// Custom label to move the title down a bit
function TabBarLabel({ children, color }: { children: React.ReactNode, color: string }) {
  return (
    <Text style={{
      fontFamily: 'Roboto',
      fontSize: 11,
      color,
      marginTop: 5, // Move the label down
      textAlign: 'center',
    }}>
      {children}
    </Text>
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
        tabBarBackground: TabBarBackground,
        tabBarShowLabel: true,
        tabBarLabel: ({ children, color }) => <TabBarLabel color={color}>{children}</TabBarLabel>,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            paddingHorizontal: 24,
            paddingBottom: 12,
            paddingTop: 8,
            height: 60,
          },
          default: {
            paddingHorizontal: 10,
            paddingBottom: 12,
            height: 60,
          },
        }),
      }}>
      <Tabs.Screen  
        name="home"
        options={{
          title: "Home",
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
          title: "Groups",
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
          title: "Emergency",
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
          title: "Profile",
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