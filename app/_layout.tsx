import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-get-random-values';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// Import your SessionProvider here
import { SessionProvider } from '@/context/SessionContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
    PoppinsSemiBold: require('../assets/fonts/Poppins-SemiBold.ttf'),
    PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
    Roboto: require('../assets/fonts/Roboto-VariableFont_wdth,wght.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SessionProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="routes/routes" options={{ headerShown: false }} />
          <Stack.Screen name="routes/create" options={{ headerShown: false }} />
          <Stack.Screen name="routes/settings" options={{ headerShown: false }} />
          <Stack.Screen name="home/aiChat" options={{ headerShown: false }} />
          <Stack.Screen name="home/notifications" options={{ headerShown: false }} />
          <Stack.Screen name="itineraries/itineraries" options={{ headerShown: false}} />
          <Stack.Screen name="itineraries/create" options={{ headerShown: false}} />
          <Stack.Screen name="groups/create" options={{ headerShown: false}} />
          <Stack.Screen name="groups/chat" options={{ headerShown: false}} />
          <Stack.Screen name="groups/view" options={{ headerShown: false}} />
          <Stack.Screen name="weather" options={{ headerShown: false}} />
          <Stack.Screen name="tourGuideApplication" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="map-picker" options={{ headerShown: false }} />
          <Stack.Screen name="map-view" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }}/>
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SessionProvider>
  );
}
