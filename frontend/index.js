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

let currentWeather = {
  cityName: "New York City",
  dateTime: "Thursday, October 31 2024 | 10:32 PM",
  temperature: 72,
  condition: "Partly Cloudy",
};

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

async function getWeatherData(query) {
  const config = await import("./config.js");
  const weatherUrl = `https://api.tomorrow.io/v4/weather/realtime?location=${query}&apikey=${config.tomorrow_api_key}`;
  const weatherData = await fetchApiData(weatherUrl);

  if (!weatherData.error && weatherData.data) {
    updateCurrentWeather(weatherData);
    updateWeatherDetails(weatherData.data.values);
    // You can add more updates here for other parts of the UI
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
  // This is a simplified mapping. You might want to expand this based on the weather codes provided by the API
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
      // Here you can update other parts of the UI with the new weather data
      // For example, you might want to update hourlyForecast and sevenDayForecast
      // Then call the respective render functions
    }
    searchInput.value = ""; // Clear the search input after performing the search
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".search-input");
  const searchButton = document.querySelector(".search-button");

  renderCurrentWeather();
  renderHourlyForecast();
  renderWeatherDetails();
  renderSevenDayForecast();

  searchButton.addEventListener("click", handleSearch);
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  });
});
