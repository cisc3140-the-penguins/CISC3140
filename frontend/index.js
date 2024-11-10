let hourlyForecast = [
  { time: "10:00 PM", temp: "67°F", condition: "Clear Sky" },
  { time: "12:00 AM", temp: "66°F", condition: "Clear Sky" },
  { time: "2:00 AM", temp: "65°F", condition: "Clear Sky" },
  { time: "4:00 AM", temp: "65°F", condition: "Clear Sky" },
  { time: "6:00 AM", temp: "66°F", condition: "Clear Sky" },
  { time: "8:00 AM", temp: "67°F", condition: "Sunny" },
];

let weatherDetails = [
  { label: "Real Feel", value: "71°" },
  { label: "Wind Speed", value: "6 mph" },
  { label: "Cloud Cover", value: "44%" },
  { label: "Sunrise", value: "7:27 am" },
  { label: "Chance", value: "0%" },
  { label: "UV Index", value: "0" },
  { label: "Humidity", value: "69%" },
  { label: "Sunset", value: "5:51 pm" },
];

let sevenDayForecast = [
  { day: "Today", condition: "Sunny", temp: "74/63" },
  { day: "Friday", condition: "Sunny", temp: "71/69" },
  { day: "Saturday", condition: "Sunny", temp: "68/60" },
  { day: "Sunday", condition: "Cloudy", temp: "64/60" },
  { day: "Monday", condition: "Cloudy", temp: "66/63" },
  { day: "Tuesday", condition: "Rainy", temp: "61/58" },
  { day: "Wednesday", condition: "Thunderstorm", temp: "55/52" },
];

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

async function getWeatherData(query = "New York City") {
  const config = await import("./config.js");
  const weatherUrl = `https://api.tomorrow.io/v4/weather/realtime?location=${query}&apikey=${config.tomorrow_api_key}`;
  const weatherData = await fetchApiData(weatherUrl);

  if (!weatherData.error && weatherData.data) {
    const latitude = weatherData.location.lat;
    const longitude = weatherData.location.lon;

    if (latitude && longitude) {
      const sunriseUrl = `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}`;
      const sunriseData = await fetchApiData(sunriseUrl);

      const weatherConditionUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${config.openweather_api_key}`;
      const weatherConditionData = await fetchApiData(weatherConditionUrl);

      updateCurrentWeather(weatherData, query);
      updateWeatherDetails(
        weatherData.data.values,
        sunriseData,
        weatherConditionData
      );

      return {
        weather: weatherData,
        sunriseSunset: sunriseData,
        currentWeather: weatherConditionData,
      };
    } else {
      console.error(
        "Failed to extract latitude and longitude from weather data."
      );
      return null;
    }
  } else {
    console.error("Error fetching weather data:", weatherData.error);
    return null;
  }
}

function updateCurrentWeather(weatherData, query) {
  const values = weatherData.data.values;

  currentWeather = {
    cityName: query,
    dateTime: new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }),
    temperature: Math.round((values.temperature * 9) / 5 + 32),
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

function updateWeatherDetails(values, sunriseData, weatherConditionData) {
  weatherDetails = [
    {
      label: "Real Feel",
      value: `${((values.temperatureApparent * 9) / 5 + 32).toFixed(1)}°F`,
    },
    { label: "Wind Speed", value: `${values.windSpeed.toFixed(1)} mph` },
    { label: "Cloud Cover", value: `${values.cloudCover}%` },
    {
      label: "Sunrise",
      value: `${sunriseData.results.sunrise
        .split(":")
        .slice(0, 2)
        .join(":")} AM`,
    },
    { label: "Chance", value: `${values.precipitationProbability}%` },
    { label: "UV Index", value: values.uvIndex.toString() },
    { label: "Humidity", value: `${values.humidity}%` },
    {
      label: "Sunset",
      value: `${sunriseData.results.sunset
        .split(":")
        .slice(0, 2)
        .join(":")} PM`,
    },
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
