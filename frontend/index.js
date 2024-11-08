const hourlyForecast = [
  { time: "10:00 PM", temp: "67°F", condition: "Clear Sky" },
  { time: "12:00 AM", temp: "66°F", condition: "Clear Sky" },
  { time: "2:00 AM", temp: "65°F", condition: "Clear Sky" },
  { time: "4:00 AM", temp: "65°F", condition: "Clear Sky" },
  { time: "6:00 AM", temp: "66°F", condition: "Clear Sky" },
  { time: "8:00 AM", temp: "67°F", condition: "Sunny" },
];

const weatherDetails = [
  { label: "Real Feel", value: "71°" },
  { label: "Wind Speed", value: "6 mph" },
  { label: "Cloud Cover", value: "44%" },
  { label: "Sunrise", value: "7:27 am" },
  { label: "Chance", value: "0%" },
  { label: "UV Index", value: "0" },
  { label: "Humidity", value: "69%" },
  { label: "Sunset", value: "5:51 pm" },
];

const sevenDayForecast = [
  { day: "Today", condition: "Sunny", temp: "74/63" },
  { day: "Friday", condition: "Sunny", temp: "71/69" },
  { day: "Saturday", condition: "Sunny", temp: "68/60" },
  { day: "Sunday", condition: "Cloudy", temp: "64/60" },
  { day: "Monday", condition: "Cloudy", temp: "66/63" },
  { day: "Tuesday", condition: "Rainy", temp: "61/58" },
  { day: "Wednesday", condition: "Thunderstorm", temp: "55/52" },
];

function renderHourlyForecast() {
  const container = document.getElementById("hourly-forecast");
  container.innerHTML = hourlyForecast
    .map(
      (hour) => `
                    <div class="hour-item">
                        <div class="time">${hour.time}</div>
                        <img src="image/${getWeatherIcon(
                          hour.condition
                        )}" alt="${hour.condition}" class="icon">
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
                        <img src="image/${getWeatherIcon(
                          day.condition
                        )}" alt="${day.condition}" class="icon">
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

document.addEventListener("DOMContentLoaded", () => {
  renderHourlyForecast();
  renderWeatherDetails();
  renderSevenDayForecast();
});
