let hourlyForecast = [];
let weatherDetails = [];
let sevenDayForecast = [];
let currentWeather = {};

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

      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=auto&forecast_days=7`;
      const forecastData = await fetchApiData(forecastUrl);

      updateCurrentWeather(weatherData, query, forecastData, sunriseData);
      updateWeatherDetails(weatherData.data.values, sunriseData, forecastData);
      updateSevenDayForecast(forecastData, sunriseData);
      updateHourlyForecast(forecastData, sunriseData);

      return {
        weather: weatherData,
        sunriseSunset: sunriseData,
        forecast: forecastData,
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

function getWeatherCondition(weatherCode, time, sunrise, sunset) {
  const isDay = time > sunrise && time < sunset;

  if (isDay) {
    if ((weatherCode >= 2 && weatherCode <= 19) || weatherCode === 45) {
      return "Cloudy Sunny";
    } else if (
      (weatherCode >= 50 && weatherCode <= 69) ||
      (weatherCode >= 80 && weatherCode <= 94)
    ) {
      return "Rainy";
    } else if (weatherCode >= 70 && weatherCode <= 79) {
      return "Snowy";
    } else if (weatherCode >= 95 && weatherCode <= 99) {
      return "Thunderstorm";
    } else {
      return "Sunny";
    }
  } else {
    if ((weatherCode >= 2 && weatherCode <= 19) || weatherCode === 45) {
      return "Cloudy Night";
    } else if (
      (weatherCode >= 50 && weatherCode <= 69) ||
      (weatherCode >= 80 && weatherCode <= 94)
    ) {
      return "Rainy";
    } else if (weatherCode >= 70 && weatherCode <= 79) {
      return "Snowy";
    } else if (weatherCode >= 95 && weatherCode <= 99) {
      return "Thunderstorm";
    } else {
      return "Clear Sky";
    }
  }
}

function updateCurrentWeather(weatherData, query, forecastData, sunriseData) {
  const values = weatherData.data.values;
  const now = new Date();
  const currentHour = now.getHours();
  const sunrise = new Date(
    `${now.toDateString()} ${sunriseData.results.sunrise}`
  );
  const sunset = new Date(
    `${now.toDateString()} ${sunriseData.results.sunset}`
  );

  currentWeather = {
    cityName: query,
    dateTime: now.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }),
    temperature: Math.round(forecastData.hourly.temperature_2m[currentHour]),
    condition: getWeatherCondition(
      forecastData.hourly.weather_code[currentHour],
      now,
      sunrise,
      sunset
    ),
  };

  renderCurrentWeather();
}

function updateWeatherDetails(values, sunriseData, forecastData) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDate = now.toISOString().split("T")[0];

  const currentHourIndex = forecastData.hourly.time.findIndex(
    (time) =>
      time === `${currentDate}T${currentHour.toString().padStart(2, "0")}:00`
  );

  weatherDetails = [
    {
      label: "Real Feel",
      value: `${Math.round(
        forecastData.hourly.temperature_2m[currentHourIndex]
      )}°F`,
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
    {
      label: "Chance",
      value: `${forecastData.hourly.precipitation_probability[currentHourIndex]}%`,
    },
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

function updateSevenDayForecast(forecastData, sunriseData) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = new Date().getDay();
  const sunrise = new Date(
    `${new Date().toDateString()} ${sunriseData.results.sunrise}`
  );
  const sunset = new Date(
    `${new Date().toDateString()} ${sunriseData.results.sunset}`
  );

  sevenDayForecast = forecastData.daily.time.map((date, index) => {
    const dayIndex = (today + index) % 7;
    const day = index === 0 ? "Today" : days[dayIndex];
    const temp = `${Math.round(
      forecastData.daily.temperature_2m_max[index]
    )}/${Math.round(forecastData.daily.temperature_2m_min[index])}`;
    const condition = getWeatherCondition(
      forecastData.daily.weather_code[index],
      new Date(date + "T12:00:00"),
      sunrise,
      sunset
    );

    return { day, condition, temp };
  });

  renderSevenDayForecast();
}

function updateHourlyForecast(forecastData, sunriseData) {
  const now = new Date();
  const currentHour = now.getHours();
  const sunrise = new Date(
    `${now.toDateString()} ${sunriseData.results.sunrise}`
  );
  const sunset = new Date(
    `${now.toDateString()} ${sunriseData.results.sunset}`
  );

  hourlyForecast = forecastData.hourly.time
    .slice(currentHour, currentHour + 6)
    .map((time, index) => {
      const hour = new Date(time);
      const temp = Math.round(
        forecastData.hourly.temperature_2m[currentHour + index]
      );
      const condition = getWeatherCondition(
        forecastData.hourly.weather_code[currentHour + index],
        hour,
        sunrise,
        sunset
      );
      return {
        time: `${hour.getHours() % 12 || 12}:00 ${
          hour.getHours() < 12 ? "AM" : "PM"
        }`,
        temp: `${temp}°F`,
        condition: condition,
      };
    });

  renderHourlyForecast();
}

function renderCurrentWeather() {
  const container = document.querySelector(".current-weather");
  container.innerHTML = `
  <div class="current-info">
    <h1 class="city-name">${currentWeather.cityName}</h1>
    <div class="date-time">${currentWeather.dateTime}</div>
    <div class="temperature">
      <span class="temp-value">${currentWeather.temperature}</span>
      <div class="temperature-values">
        <span class="temp-unit">°F</span>
        <span class="condition">${currentWeather.condition}</span>
      </div>
    </div>
  </div>
  <img src="image/${getWeatherIcon(currentWeather.condition)}" alt="${
    currentWeather.condition
  }" class="current-icon">
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
          <div class="condition">${
            hour.condition.includes("Cloudy") ? "Cloudy" : hour.condition
          }</div>
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
                        <div class="detail-value">${detail.value}</div>
						<div class="detail-label">${detail.label}</div>
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
          <div class="condition-item">
          <img src="image/${getWeatherIcon(day.condition)}" alt="${
        day.condition
      }" class="icon">
          <div class="condition">${
            day.condition.includes("Cloudy") ? "Cloudy" : day.condition
          }</div>
          </div>
          <div class="temp">${day.temp}</div>
        </div>
      `
    )
    .join("");
}
function getWeatherIcon(condition) {
  const icons = {
    Sunny: "sun.svg",
    "Cloudy Sunny": "cloudy-day.svg",
    "Cloudy Night": "cloudy-night.svg",
    Rainy: "rain.svg",
    Snowy: "snowy.svg",
    Thunderstorm: "thunderstorm.svg",
    "Clear Sky": "crescent.svg",
  };
  return icons[condition] || "default.svg";
}

async function handleSearch() {
  const searchInput = document.querySelector(".search-input");
  const query = searchInput.value.trim();
  if (query) {
    const weatherData = await getWeatherData(query);
    if (weatherData) {
      console.log(weatherData);
    }
    searchInput.value = "";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const searchInput = document.querySelector(".search-input");
  const searchButton = document.querySelector(".search-button");

  await getWeatherData();

  searchButton.addEventListener("click", handleSearch);
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  });
});
