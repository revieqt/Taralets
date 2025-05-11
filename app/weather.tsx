import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ThemedView } from "@/components/ThemedView";
import { getWeather, getHourlyWeather } from "@/services/weatherService";
import LineGraph from "@/components/LineGraph";

export default function WeatherScreen() {
  const cities = [
    { name: "Cebu City", lat: 10.3157, lon: 123.8854 },
    { name: "Carcar City", lat: 10.1065, lon: 123.6406 },
    { name: "Danao City", lat: 10.5286, lon: 124.0289 },
  ];

  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // For hourly graph
  const [selectedGraph, setSelectedGraph] = useState<'temperature' | 'precipitation' | 'humidity' | 'windSpeed'>('temperature');
  const [hourlyData, setHourlyData] = useState<number[]>([]);
  const [hourlyLoading, setHourlyLoading] = useState(false);

  // Labels for 24 hours
  const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const year = today.getFullYear();

        // Fetch all weather values in parallel
        const [temperature, precipitation, humidity, windSpeed, weatherType] = await Promise.all([
          getWeather.temperature(month, day, year, selectedCity.lat, selectedCity.lon),
          getWeather.precipitation(month, day, year, selectedCity.lat, selectedCity.lon),
          getWeather.humidity(month, day, year, selectedCity.lat, selectedCity.lon),
          getWeather.windSpeed(month, day, year, selectedCity.lat, selectedCity.lon),
          getWeather.weatherType(month, day, year, selectedCity.lat, selectedCity.lon),
        ]);

        setWeatherData({
          temperature,
          precipitation,
          humidity,
          windSpeed,
          weatherType,
        });
      } catch (error) {
        setErrorMessage("Failed to fetch weather.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [selectedCity]);

  // Fetch hourly data for the selected graph type
  useEffect(() => {
    const fetchHourly = async () => {
      setHourlyLoading(true);
      try {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const year = today.getFullYear();
        const lat = selectedCity.lat;
        const lon = selectedCity.lon;

        let fetchFn;
        switch (selectedGraph) {
          case "temperature":
            fetchFn = getHourlyWeather.temperature;
            break;
          case "precipitation":
            fetchFn = getHourlyWeather.precipitation;
            break;
          case "humidity":
            fetchFn = getHourlyWeather.humidity;
            break;
          case "windSpeed":
            fetchFn = getHourlyWeather.windSpeed;
            break;
        }

        // Fetch all 24 hours in parallel
        const data = await Promise.all(
          Array.from({ length: 24 }, (_, hour) =>
            fetchFn(hour, day, month, year, lat, lon)
          )
        );
        setHourlyData(data.map(val => (val !== null && val !== undefined ? Number(val) : 0)));
      } catch (e) {
        setHourlyData([]);
      } finally {
        setHourlyLoading(false);
      }
    };

    fetchHourly();
  }, [selectedCity, selectedGraph]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={selectedCity.name}
          onValueChange={(itemValue) => {
            const city = cities.find((c) => c.name === itemValue);
            if (city) setSelectedCity(city);
          }}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          {cities.map((city) => (
            <Picker.Item key={city.name} label={city.name} value={city.name} />
          ))}
        </Picker>
      </View>

      <View style={styles.weatherCard}>
        {loading ? (
          <ActivityIndicator size="large" color="#205781" />
        ) : errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : weatherData ? (
          <>
            <Text style={styles.temperatureText}>
              {weatherData.temperature !== undefined && weatherData.temperature !== null
                ? `${weatherData.temperature}°C`
                : "--"}
            </Text>
            <Text style={styles.weatherDescText}>
              {weatherData.weatherType || "--"}
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Precipitation: </Text>
              <Text style={styles.infoValue}>
                {weatherData.precipitation !== undefined && weatherData.precipitation !== null
                  ? `${weatherData.precipitation} mm`
                  : "--"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Humidity: </Text>
              <Text style={styles.infoValue}>
                {weatherData.humidity !== undefined && weatherData.humidity !== null
                  ? `${weatherData.humidity}%`
                  : "--"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Wind Speed: </Text>
              <Text style={styles.infoValue}>
                {weatherData.windSpeed !== undefined && weatherData.windSpeed !== null
                  ? `${weatherData.windSpeed} m/s`
                  : "--"}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.loadingText}>Loading weather data...</Text>
        )}
      </View>

      {/* Hourly Line Graph Section */}
      <View style={styles.graphCard}>
        <View style={styles.graphChoices}>
          <TouchableOpacity onPress={() => setSelectedGraph('temperature')}>
            <Text style={selectedGraph === 'temperature' ? styles.activeGraphChoice : styles.graphChoice}>
              Temperature
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedGraph('precipitation')}>
            <Text style={selectedGraph === 'precipitation' ? styles.activeGraphChoice : styles.graphChoice}>
              Precipitation
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedGraph('humidity')}>
            <Text style={selectedGraph === 'humidity' ? styles.activeGraphChoice : styles.graphChoice}>
              Humidity
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedGraph('windSpeed')}>
            <Text style={selectedGraph === 'windSpeed' ? styles.activeGraphChoice : styles.graphChoice}>
              Wind Speed
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ minHeight: 240 }}>
          {hourlyLoading ? (
            <ActivityIndicator size="large" color="#205781" style={{ marginTop: 30 }} />
          ) : (
            <LineGraph
              title=""
              labels={hourLabels}
              data={hourlyData}
              color="#205781"
              style={{ marginTop: 10 }}
            />
          )}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8fa",
    padding: 0,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  dropdownContainer: {
    width: "90%",
    marginTop: 40,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 18,
    elevation: 2,
    shadowColor: "#205781",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    alignSelf: "center",
  },
  picker: {
    width: "100%",
    height: 50,
  },
  pickerItem: {
    fontSize: 18,
  },
  weatherCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#205781",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 20,
  },
  temperatureText: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#205781",
    marginBottom: 8,
  },
  weatherDescText: {
    fontSize: 22,
    color: "#205781",
    marginBottom: 18,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  infoRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: "#888",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#205781",
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginTop: 20,
  },
  graphCard: {
    width: "95%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginTop: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#205781",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",
  },
  graphChoices: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
    gap: 8,
  },
  graphChoice: {
    fontSize: 16,
    color: "#555",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#f1f3f6",
    overflow: "hidden",
    fontWeight: "500",
  },
  activeGraphChoice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#205781",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    overflow: "hidden",
    shadowColor: "#205781",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});