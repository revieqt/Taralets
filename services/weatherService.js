// weatherService.js

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

const weatherCodes = {
  0: "Clear Skies",
  1: "Mainly Clear",
  2: "Partly Cloudy",
  3: "Cloudy",
  45: "Fog",
  48: "Depositing Rime Fog",
  51: "Light Drizzle",
  53: "Moderate Drizzle",
  55: "Dense Drizzle",
  61: "Slight Rain",
  63: "Moderate Rain",
  65: "Heavy Rain",
  80: "Rain Showers",
  95: "Thunderstorm",
};

async function fetchWeatherData(start, end, lat, lon) {
  const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&start_date=${start}&end_date=${end}&daily=temperature_2m_max,precipitation_sum,weathercode,windspeed_10m_max,relative_humidity_2m_max&timezone=auto`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.daily) {
      console.error("⚠️ Unexpected API response structure:", data);
      return null;
    }

    return data.daily;
  } catch (error) {
    console.error("❌ Fetch error:", error.message);
    return null;
  }
}

const getWeather = {
  async temperature(month, day, year, lat, lon) {
    const date = formatDate(year, month, day);
    const data = await fetchWeatherData(date, date, lat, lon);
    return data?.temperature_2m_max?.[0] ?? null;
  },

  async precipitation(month, day, year, lat, lon) {
    const date = formatDate(year, month, day);
    const data = await fetchWeatherData(date, date, lat, lon);
    return data?.precipitation_sum?.[0] ?? null;
  },

  async humidity(month, day, year, lat, lon) {
    const date = formatDate(year, month, day);
    const data = await fetchWeatherData(date, date, lat, lon);
    return data?.relative_humidity_2m_max?.[0] ?? null;
  },

  async windSpeed(month, day, year, lat, lon) {
    const date = formatDate(year, month, day);
    const data = await fetchWeatherData(date, date, lat, lon);
    return data?.windspeed_10m_max?.[0] ?? null;
  },

  async weatherType(month, day, year, lat, lon) {
    const date = formatDate(year, month, day);
    const data = await fetchWeatherData(date, date, lat, lon);
    const code = data?.weathercode?.[0];
    return weatherCodes[code] ?? "Unknown";
  },
};

const getMonthPrediction = {
  async temperature(month, year, lat, lon) {
    const { start, end } = getMonthRange(year, month);
    const data = await fetchWeatherData(start, end, lat, lon);
    return average(data?.temperature_2m_max ?? []);
  },

  async precipitation(month, year, lat, lon) {
    const { start, end } = getMonthRange(year, month);
    const data = await fetchWeatherData(start, end, lat, lon);
    return average(data?.precipitation_sum ?? []);
  },

  async humidity(month, year, lat, lon) {
    const { start, end } = getMonthRange(year, month);
    const data = await fetchWeatherData(start, end, lat, lon);
    return average(data?.relative_humidity_2m_max ?? []);
  },

  async windSpeed(month, year, lat, lon) {
    const { start, end } = getMonthRange(year, month);
    const data = await fetchWeatherData(start, end, lat, lon);
    return average(data?.windspeed_10m_max ?? []);
  },

  async weatherType(month, year, lat, lon) {
    const { start, end } = getMonthRange(year, month);
    const data = await fetchWeatherData(start, end, lat, lon);
    if (!data || !data.weathercode) return "Unknown";

    const counts = {};
    for (const code of data.weathercode) {
      counts[code] = (counts[code] || 0) + 1;
    }

    const mostCommonCode = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    return weatherCodes[Number(mostCommonCode)] ?? "Unknown";
  },
};

const getHourlyWeather = {
  temperature: async (hour, day, month, year, lat, lon) => {
    const date = formatDate(year, month, day);
    const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&hourly=temperature_2m&timezone=auto`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const index = data?.hourly?.time.indexOf(`${date}T${pad(hour)}:00`);
      return index !== -1 ? data.hourly.temperature_2m[index] : null;
    } catch (error) {
      console.error("❌ Error (temperature):", error.message);
      return null;
    }
  },

  precipitation: async (hour, day, month, year, lat, lon) => {
    const date = formatDate(year, month, day);
    const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&hourly=precipitation&timezone=auto`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const index = data?.hourly?.time.indexOf(`${date}T${pad(hour)}:00`);
      return index !== -1 ? data.hourly.precipitation[index] : null;
    } catch (error) {
      console.error("❌ Error (precipitation):", error.message);
      return null;
    }
  },

  humidity: async (hour, day, month, year, lat, lon) => {
    const date = formatDate(year, month, day);
    const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&hourly=relative_humidity_2m&timezone=auto`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const index = data?.hourly?.time.indexOf(`${date}T${pad(hour)}:00`);
      return index !== -1 ? data.hourly.relative_humidity_2m[index] : null;
    } catch (error) {
      console.error("❌ Error (humidity):", error.message);
      return null;
    }
  },

  windSpeed: async (hour, day, month, year, lat, lon) => {
    const date = formatDate(year, month, day);
    const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&hourly=windspeed_10m&timezone=auto`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const index = data?.hourly?.time.indexOf(`${date}T${pad(hour)}:00`);
      return index !== -1 ? data.hourly.windspeed_10m[index] : null;
    } catch (error) {
      console.error("❌ Error (windSpeed):", error.message);
      return null;
    }
  },

  weatherType: async (hour, day, month, year, lat, lon) => {
    const date = formatDate(year, month, day);
    const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&hourly=weathercode&timezone=auto`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const index = data?.hourly?.time.indexOf(`${date}T${pad(hour)}:00`);
      const code = index !== -1 ? data.hourly.weathercode[index] : null;
      return weatherCodes[code] ?? "Unknown";
    } catch (error) {
      console.error("❌ Error (weatherType):", error.message);
      return null;
    }
  },
};

// Helper functions

function formatDate(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function getMonthRange(year, month) {
  const start = formatDate(year, month, 1);
  const endDate = new Date(year, month, 0).getDate(); // last day of the month
  const end = formatDate(year, month, endDate);
  return { start, end };
}

function pad(n) {
  return n.toString().padStart(2, "0");
}

function average(arr) {
  if (!arr.length) return null;
  const sum = arr.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / arr.length) * 10) / 10;
}

module.exports = { getWeather, getMonthPrediction ,getHourlyWeather};
