import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import Fontisto from "@expo/vector-icons/Fontisto";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getWeather } from "../services/weatherService";

export default function WeatherScreen() {
  const cities = [
    { name: "Cebu City", lat: 10.3157, lon: 123.8854 },
    { name: "Carcar City", lat: 10.1065, lon: 123.6406 },
    { name: "Danao City", lat: 10.5286, lon: 124.0289 },
  ];

  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null); // Reference for the ScrollView
  let color = "#fff";

  const getBackgroundImage = () => {
    const weatherCode = weatherData?.weatherCode;
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 18 || currentHour < 6;

    if (isNight) {
      return require("../assets/images/weather/night.png");
      color = "#000";
    }

    if ([0, 1, 2, 3].includes(weatherCode)) {
      return require("../assets/images/weather/sunny.png");
    }

    if (
      [
        51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82,
      ].includes(weatherCode)
    ) {
      return require("../assets/images/weather/rainy.png");
    }

    if ([95, 96, 99].includes(weatherCode)) {
      return require("../assets/images/weather/thunderstorm.png");
    }

    return require("../assets/images/weather/sunny.png");
  };

  const scrollLeft = () => {
    scrollViewRef.current?.scrollTo({ x: 0, animated: true });
  };

  const scrollRight = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        // Fetch current weather data
        const [temperature, precipitation, humidity, windSpeed, weatherType] =
          await Promise.all([
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

        // Fetch weekly weather data
        const weeklyDataPromises = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(today.getDate() + i);
          const weekDay = date.toLocaleDateString("en-US", { weekday: "long" });
          const weekMonth = date.getMonth() + 1;
          const weekDayNum = date.getDate();
          const weekYear = date.getFullYear();

          weeklyDataPromises.push(
            Promise.all([
              getWeather.temperature(weekMonth, weekDayNum, weekYear, selectedCity.lat, selectedCity.lon),
              getWeather.precipitation(weekMonth, weekDayNum, weekYear, selectedCity.lat, selectedCity.lon),
              getWeather.humidity(weekMonth, weekDayNum, weekYear, selectedCity.lat, selectedCity.lon),
              getWeather.windSpeed(weekMonth, weekDayNum, weekYear, selectedCity.lat, selectedCity.lon),
            ]).then(([temperature, precipitation, humidity, windSpeed]) => ({
              day: weekDay,
              temperature,
              precipitation,
              humidity,
              windSpeed,
            }))
          );
        }

        const weeklyDataResults = await Promise.all(weeklyDataPromises);
        setWeeklyData(weeklyDataResults);
      } catch (error) {
        setErrorMessage("Failed to fetch weather data.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [selectedCity]);

  const renderWeatherIcon = () => {
    const weatherCode = weatherData?.weatherCode;
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 18 || currentHour < 6;

    if ([0, 1, 2, 3].includes(weatherCode)) {
      return isNight ? (
        <Feather name="moon" size={50} color={color} />
      ) : (
        <Fontisto name="day-sunny" size={50} color={color} />
      );
    }

    if ([45, 48].includes(weatherCode)) {
      return <Feather name="cloud" size={50} color={color} />;
    }

    if ([51, 53, 55, 56, 57].includes(weatherCode)) {
      return <Feather name="cloud-drizzle" size={50} color={color} />;
    }

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
      return <Feather name="cloud-rain" size={50} color={color} />;
    }

    if ([95, 96, 99].includes(weatherCode)) {
      return <Feather name="cloud-lightning" size={50} color={color} />;
    }

    return <Fontisto name="day-sunny" size={50} color={color} />;
  };

  return (
    <ImageBackground
      source={getBackgroundImage()}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <TouchableOpacity
        onPress={() => router.replace("/home")}
        style={{
          padding: 20,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <AntDesign color={color} size={24} name={"left"} />
        <Text style={{ color, fontSize: 15 }}>Back</Text>
      </TouchableOpacity>

      <View style={styles.topContainer}>
        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={selectedCity.name}
            onValueChange={(itemValue) => {
              const city = cities.find((c) => c.name === itemValue);
              if (city) setSelectedCity(city);
            }}
            style={[styles.picker, { color: color }]}
            itemStyle={styles.pickerItem}
          >
            {cities.map((city) => (
              <Picker.Item key={city.name} label={city.name} value={city.name} />
            ))}
          </Picker>
        </View>

        <View>
          {loading ? (
            <Image
              source={require("../assets/images/loading.gif")}
              style={styles.loadinggif}
            />
          ) : errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : weatherData ? (
            <>
              {/* Weather Icon */}
              <View style={{ alignItems: "center", marginBottom: 10 }}>
                {renderWeatherIcon()}
              </View>

              {/* Temperature */}
              <Text
                style={{
                  color: color,
                  fontSize: 35,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {weatherData.temperature !== undefined &&
                weatherData.temperature !== null
                  ? `${weatherData.temperature}°C`
                  : "--"}
              </Text>
              <Text
                style={{
                  color: color,
                  fontSize: 18,
                  textAlign: "center",
                }}
              >
                {weatherData.weatherType || "--"}
              </Text>

              <View style={styles.subtypeContainer}>
                <View style={styles.subtypeInfo}>
                  <Feather color={color} size={24} name={"cloud-rain"} />
                  <Text
                    style={{
                      color: color,
                      fontWeight: "bold",
                      fontSize: 18,
                      marginTop: 5,
                    }}
                  >
                    {weatherData.precipitation !== undefined &&
                    weatherData.precipitation !== null
                      ? `${weatherData.precipitation}`
                      : "--"}
                  </Text>
                  <Text style={{ color: color, marginTop: 3 }}>
                    Precipitation
                  </Text>
                </View>

                <View style={styles.subtypeInfo}>
                  <Ionicons color={color} size={24} name={"water-outline"} />
                  <Text
                    style={{
                      color: color,
                      fontWeight: "bold",
                      fontSize: 18,
                      marginTop: 5,
                    }}
                  >
                    {weatherData.humidity !== undefined &&
                    weatherData.humidity !== null
                      ? `${weatherData.humidity}`
                      : "--"}
                  </Text>
                  <Text style={{ color: color, marginTop: 3 }}>Humidity</Text>
                </View>

                <View style={styles.subtypeInfo}>
                  <Feather color={color} size={24} name={"wind"} />
                  <Text
                    style={{
                      color: color,
                      fontWeight: "bold",
                      fontSize: 18,
                      marginTop: 5,
                    }}
                  >
                    {weatherData.windSpeed !== undefined &&
                    weatherData.windSpeed !== null
                      ? `${weatherData.windSpeed}`
                      : "--"}
                  </Text>
                  <Text style={{ color: color, marginTop: 3 }}>Wind Speed</Text>
                </View>
              </View>

              <View style={{backgroundColor: "rgba(255, 255, 255, 0.3)", borderRadius: 18, padding: 15,borderColor:color, borderWidth: 1, marginTop: 20, backdropFilter: "blur(10px)"}}>
              <Text
                style={{
                  color: color,
                  fontSize: 18,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >Forecast for the Week</Text>
              <View style={styles.arrowContainer}>
                <TouchableOpacity onPress={scrollLeft} style={styles.arrowButton}>
                  <AntDesign name="left" size={24} color="#000" />
                </TouchableOpacity>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ref={scrollViewRef} // Attach the ref to the ScrollView
                  style={styles.scrollView}
                >
                  {weeklyData.map((day: any, index: number) => (
                    <View key={index} style={styles.dayContainer}>
                      <Text style={styles.dayText}>{day.day}</Text>
                      <Text style={styles.dataText}>
                        T: {day.temperature}°C
                      </Text>
                      <Text style={styles.dataText}>
                        P: {day.precipitation}%
                      </Text>
                      <Text style={styles.dataText}>
                        H: {day.humidity}%
                      </Text>
                      <Text style={styles.dataText}>
                        W: {day.windSpeed} km/h
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                <TouchableOpacity onPress={scrollRight} style={styles.arrowButton}>
                  <AntDesign name="right" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              </View>
            </>
          ) : (
            <Text style={styles.loadingText}>Loading weather data...</Text>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    paddingTop: 30,
  },
  topContainer: {
    marginLeft: "auto",
    marginRight: "auto",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  dropdownContainer: {
    marginBottom: 20,
    backgroundColor: "transparent",
    borderRadius: 18,
    elevation: 2,
    shadowColor: "#205781",
    borderColor: "#cccccc",
    borderWidth: 1,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    alignSelf: "center",
  },
  picker: {
    width: 100,
    height: 30,
    borderColor: "#cccccc",
    borderWidth: 1,
    borderRadius: 18,
    textAlign: "center",
  },
  pickerItem: {
    fontSize: 18,
  },
  weatherCard: {
    width: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 18,
    padding: 20,
    marginTop: 20,
    elevation: 2,
    shadowColor: "#205781",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  arrowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  arrowButton: {
    padding: 10,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
    marginHorizontal: 10,
    borderRadius: 12,
  },
  dayContainer: {
    width: 80,
    height: 120,
    alignItems: "center",
    marginRight: 10,
    padding: 5,
    backgroundColor: "#f9f9f9",
    borderRadius: 25,
    elevation: 1,
  },
  dayText: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
  },
  dataText: {
    fontSize: 12,
    color: "#555",
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
  loadinggif: {
    width: 100,
    height: 100,
  },
  subtypeContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  subtypeInfo: {
    width: "30%",
    fontSize: 16,
    color: "#fff",
    alignItems: "center",
  },
});