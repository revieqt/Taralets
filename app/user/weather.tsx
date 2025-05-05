import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator, PermissionsAndroid, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getWeather } from "@/services/weatherService";
import useUserAddress from "@/utils/userAddress"; // You can keep this if needed

export default function TabTwoScreen() {
  const cities = [
    { name: "Manila, Metro Manila", lat: 14.5995, lon: 120.9842 },
    { name: "Cebu City, Cebu", lat: 10.3157, lon: 123.8854 },
    { name: "Davao City, Davao del Sur", lat: 7.1907, lon: 125.4553 },
  ];

  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const { address } = useUserAddress();

  useEffect(() => {
    const requestLocation = async () => {
      try {
        if (Platform.OS === "android") {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            setErrorMessage("Location permission denied.");
            return;
          }
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
          },
          (error) => setErrorMessage(error.message),
          { enableHighAccuracy: true }
        );
      } catch (error) {
        setErrorMessage("Failed to get location.");
      }
    };

    requestLocation();
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const lat = userLocation?.lat ?? selectedCity.lat;
        const lon = userLocation?.lon ?? selectedCity.lon;

        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const year = today.getFullYear();

        const currentWeather = await getWeather.weatherType(month, day, year, lat, lon);
        setWeatherData(currentWeather);
      } catch (error) {
        setErrorMessage("Failed to fetch weather.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [selectedCity, userLocation]);

  if (errorMessage) {
    return (
      <ThemedView>
        <ThemedText>Error: {errorMessage}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView>
      <ThemedText style={styles.title}>Weather</ThemedText>

      {address.city ? (
        <Text>Your current city: {address.city}</Text>
      ) : (
        <Text>Loading your address...</Text>
      )}

      <Picker
        selectedValue={selectedCity.name}
        onValueChange={(itemValue) => {
          const city = cities.find((c) => c.name === itemValue);
          if (city) setSelectedCity(city);
        }}
      >
        {cities.map((city) => (
          <Picker.Item key={city.name} label={city.name} value={city.name} />
        ))}
      </Picker>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : weatherData ? (
        <View style={styles.weatherInfo}>
          <Text>Weather Type: {weatherData.weatherType}</Text>
          {/* Extend here with temperature, humidity, etc. */}
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
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
});
