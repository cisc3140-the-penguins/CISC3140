let hourlyForecast = [];
let weatherDetails = [];
let sevenDayForecast = [];
let currentWeather = {};

function renderCurrentWeather() {
  const container = document.querySelector(".current-weather");
  container.innerHTML = `
    <h1 class="city-name">${currentWeather.cityName}</h1>
    <div class="date-time">${currentWeather.dateTime}</div>
    <div class="temperature">${currentWeather.temperature}<span class="temp-unit">°F</span></div>
    <div class="condition">${currentWeather.condition}</div>
  `;
}

function renderHourlyForecast() {
  const container = document.getElementById("hourly-forecast");
  container.innerHTML = hourlyForecast
    .map(
      (hour) => `
        <div class="hour-item">
          <div class="time">${hour.time}</div>
          <img src="image/${getWeatherIcon(hour.condition)}" alt="${
        hour.condition
      }" class="icon">
          <div class="temp">${hour.temp}</div>
          <div class="condition">${hour.condition}</div>
        </div>
      `
    )
    .join("");
}

function renderWeatherDetails() {
  const container = document.getElementById("weather-details");
  container.innerHTML = weatherDetails
    .map(
      (detail) => `
        <div class="detail-item">
          <img src="image/${getSVGFileName(detail.label)}" alt="${
        detail.label
      }" class="icon">
          <div>
            <div class="detail-label">${detail.label}</div>
            <div class="detail-value">${detail.value}</div>
          </div>
        </div>
      `
    )
    .join("");
}

function getSVGFileName(label) {
  const fileNames = {
    "Real Feel": "real feel.svg",
    "Wind Speed": "wind.svg",
    "Cloud Cover": "cloud cover.svg",
    Sunrise: "sunrise.svg",
    Chance: "rain chance.svg",
    "UV Index": "uv index.svg",
    Humidity: "humidity.svg",
    Sunset: "sunset.svg",
  };
  return fileNames[label] || "default.svg";
}

function renderSevenDayForecast() {
  const container = document.getElementById("seven-day-forecast");
  container.innerHTML = sevenDayForecast
    .map(
      (day) => `
        <div class="day-item">
          <div class="day">${day.day}</div>
          <img src="image/${getWeatherIcon(day.condition)}" alt="${
        day.condition
      }" class="icon">
          <div class="condition">${day.condition}</div>
          <div class="temp">${day.temp}</div>
        </div>
      `
    )
    .join("");
}

function getWeatherIcon(condition) {
  const icons = {
    Sunny: "sun.svg",
    Cloudy: "cloudy.svg",
    "Partly Cloudy": "partly cloudy.svg",
    Rainy: "rain.svg",
    Thunderstorm: "thunderstorm.svg",
    "Clear Sky": "crescent.svg",
  };
  return icons[condition] || "default.svg";
}

async function fetchApiData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: `Fetch Error: ${error.message}` };
  }
}
// query = "New York City"
async function getWeatherData() {
  const config = await import("./config.js");
  const weatherUrl = `https://api.tomorrow.io/v4/weather/realtime?location=${query}&apikey=${config.tomorrow_api_key}`;
  const weatherData = await fetchApiData(weatherUrl);

  if (!weatherData.error && weatherData.data) {
    updateCurrentWeather(weatherData);
    updateWeatherDetails(weatherData.data.values);
    // You would typically update hourlyForecast and sevenDayForecast here as well
    // but the current API response doesn't include this data
    return weatherData;
  } else {
    console.error("Error fetching weather data:", weatherData.error);
    return null;
  }
}

function updateCurrentWeather(weatherData) {
  const values = weatherData.data.values;
  const location = weatherData.location;

  currentWeather = {
    cityName: location.name,
    dateTime: new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }),
    temperature: Math.round(values.temperature),
    condition: getWeatherCondition(values.weatherCode),
  };

  renderCurrentWeather();
}

function getWeatherCondition(weatherCode) {
  const weatherConditions = {
    1000: "Clear",
    1100: "Mostly Clear",
    1101: "Partly Cloudy",
    1102: "Mostly Cloudy",
    1001: "Cloudy",
    4000: "Rainy",
    4001: "Light Rain",
    4200: "Light Rain",
    4201: "Heavy Rain",
    5000: "Snow",
    5001: "Flurries",
    5100: "Light Snow",
    5101: "Heavy Snow",
    8000: "Thunderstorm",
  };
  return weatherConditions[weatherCode] || "Unknown";
}

function updateWeatherDetails(values) {
  weatherDetails = [
    { label: "Real Feel", value: `${values.temperatureApparent.toFixed(1)}°` },
    { label: "Wind Speed", value: `${values.windSpeed.toFixed(1)} mph` },
    { label: "Cloud Cover", value: `${values.cloudCover}%` },
    { label: "Sunrise", value: "Placeholder" },
    { label: "Chance", value: `${values.precipitationProbability}%` },
    { label: "UV Index", value: values.uvIndex.toString() },
    { label: "Humidity", value: `${values.humidity}%` },
    { label: "Sunset", value: "Placeholder" },
  ];
  renderWeatherDetails();
}

async function handleSearch() {
  const searchInput = document.querySelector(".search-input");
  const query = searchInput.value.trim();
  if (query) {
    const weatherData = await getWeatherData(query);
    if (weatherData) {
      console.log(weatherData);
    }
    searchInput.value = ""; // Clear the search input after performing the search
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const searchInput = document.querySelector(".search-input");
  const searchButton = document.querySelector(".search-button");

  // Fetch weather data for New York City by default
  await getWeatherData();

  renderHourlyForecast();
  renderSevenDayForecast();

  searchButton.addEventListener("click", handleSearch);
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  });
});
