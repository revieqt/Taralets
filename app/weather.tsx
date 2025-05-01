import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Picker } from '@react-native-picker/picker'; // Import for Expo
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getWeather } from "@/services/weatherService"; // Import your existing weather functions
import useUserLocation from "@/hooks/useUserLocation"; // Ensure correct import
import useUserAddress from "@/utils/userAddress"; // Import useUserAddress hook

export default function TabTwoScreen() {
  const cities = [
    { name: "Manila, Metro Manila", lat: 14.5995, lon: 120.9842 },
    { name: "Cebu City, Cebu", lat: 10.3157, lon: 123.8854 },
    { name: "Davao City, Davao del Sur", lat: 7.1907, lon: 125.4553 },
    // Add more cities here with their coordinates...
  ];
  const { userCoordinates, errorMessage } = useUserLocation();
  const { address } = useUserAddress();
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const lat = userCoordinates.lat || selectedCity.lat;
      const lon = userCoordinates.lon || selectedCity.lon;

      const currentWeather = await getWeather.weatherType(4, 23, 2025, lat, lon);
      setWeatherData(currentWeather);
    };

    fetchWeather();
  }, [userCoordinates, selectedCity]);

  if (errorMessage) {
    return (
      <ThemedView>
        <ThemedText>Error: {errorMessage}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView>
      <ThemedText>Weather</ThemedText>

      {/* Display the user's current address (if available) */}
      {address.city ? (
        <Text>Your current city: {address.city}</Text>
      ) : (
        <Text>Loading your address...</Text>
      )}

      {/* Dropdown for selecting a city */}
      <Picker
        selectedValue={selectedCity.name}
        onValueChange={(itemValue) => {
          const city = cities.find((city) => city.name === itemValue);
          if (city) setSelectedCity(city);
        }}
      >
        {cities.map((city) => (
          <Picker.Item key={city.name} label={city.name} value={city.name} />
        ))}
      </Picker>

      {/* Display weather data */}
      {weatherData ? (
        <View style={styles.weatherInfo}>
          <Text>Weather Type: {weatherData}</Text> {/* Example: you can add more weather data here */}
          {/* Display other weather data like temperature, humidity, etc. */}
        </View>
      ) : (
        <Text>Loading weather data...</Text>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  weatherInfo: {
    marginTop: 20,
  },
});
