// Weather Icon Mapping Function
function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "☀️";
  return icons.get(arr);
}

// Utility Functions
function getDayName(dateString, index) {
  if (index === 0) return "Today";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

// Api key

const apiKey = "bdf5ed7414a0438b816153327250609";

// Fetch matching cities/countries
async function searchLocation(query) {
  const res = await fetch(
    `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${query}`
  );
  const [data] = await res.json();
  console.log(data);
  getWeather(data.country);
  return data;
}

//  // Fetch weather for selected city
async function getWeather(location) {
  const res = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=7`
  );
  const data = await res.json();
  console.log(data);
  updateWeatherDisplay(data);
  return data;
}

// DOM Elements
const cityNameEl = document.getElementById("cityName");
const rainChanceEl = document.getElementById("rainChance");
const currentTempEl = document.getElementById("currentTemp");
const mainWeatherIconEl = document.getElementById("mainWeatherIcon");
const hourlyForecastEl = document.getElementById("hourlyForecast");
const realFeelEl = document.getElementById("realFeel");
const windSpeedEl = document.getElementById("windSpeed");
const rainChanceValueEl = document.getElementById("rainChanceValue");
const uvIndexEl = document.getElementById("uvIndex");
const weeklyForecastEl = document.getElementById("weeklyForecast");
const citySearchEl = document.getElementById("citySearch");

// Search functionality
citySearchEl.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const searchQuery = this.value.trim().toLowerCase();
    searchLocation(searchQuery);
    this.value = "";
  }
});

function updateWeatherDisplay(data) {
  // Update main weather info
  cityNameEl.textContent = data.location.name;
  const hours = data.forecast.forecastday[0].hour;
  const avgRainChance = Math.round(
    hours.reduce((sum, h) => sum + h.chance_of_rain, 0) / hours.length
  );

  rainChanceEl.textContent = `Chance of rain: ${avgRainChance}%`;

  currentTempEl.textContent = `${Math.round(data.current.temp_c)}°`;
  mainWeatherIconEl.textContent = getWeatherIcon(data.current.condition.code);
  // Update hourly forecast (every 3 hours)
  hourlyForecastEl.innerHTML = "";
  data.forecast.forecastday[0].hour.forEach((hour, index) => {
    if (index % 4 === 0) {
      const hourlyItem = document.createElement("div");
      hourlyItem.className = "hourly-item";

      // Format time with AM/PM
      const time = new Date(hour.time).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const iconUrl = `https:${hour.condition.icon}`;

      hourlyItem.innerHTML = `
      <div class="hourly-time">${time}</div>
      <div class="hourly-icon"><img src="${iconUrl}" alt="${
        hour.condition.text
      }" /></div>
      <div class="hourly-temp">${Math.round(hour.temp_c)}°</div>
    `;
      hourlyForecastEl.appendChild(hourlyItem);
    }
  });

  // Update air conditions
  realFeelEl.textContent = `${Math.round(data.current.feelslike_c)}°`;
  windSpeedEl.textContent = `${data.current.wind_kph} km/h`;
  rainChanceValueEl.textContent = `${avgRainChance}%`;
  uvIndexEl.textContent = data.current.uv;

  // Update weekly forecast
  weeklyForecastEl.innerHTML = "";
  data.forecast.forecastday.slice(0, 7).forEach((day, index) => {
    const forecastDay = document.createElement("div");
    forecastDay.className = "forecast-day";

    const iconUrl = `https:${day.day.condition.icon}`;

    forecastDay.innerHTML = `
    <div class="forecast-left">
      <span class="forecast-day-name">${getDayName(day.date, index)}</span>
      <span class="forecast-icon"><img src="${iconUrl}" alt="${
      day.day.condition.text
    }" /></span>
      <span class="forecast-condition">${day.day.condition.text}</span>
    </div>
    <div class="forecast-temps">${Math.round(day.day.maxtemp_c)}°/${Math.round(
      day.day.mintemp_c
    )}°</div>
  `;
    weeklyForecastEl.appendChild(forecastDay);
  });
}

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        // fetch weather with  latitude , longitude
        getWeather(`${lat},${lon}`);
      },
      (error) => {
        console.error("Error getting location:", error);
        // default weather
        getWeather("Cairo");
      }
    );
  } else {
    // default weather
    getWeather("Cairo");
  }
});

// Add some interactive effects
document.querySelectorAll(".weather-card").forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-2px)";
    this.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.3)";
  });

  card.addEventListener("mouseleave", function () {
    this.style.transform = "translateY(0)";
    this.style.boxShadow = "none";
  });
});
