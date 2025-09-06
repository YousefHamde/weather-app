// --------------------
// Weather Emoji Function
// --------------------
function getWeatherEmoji(code, isDay) {
  const map = {
    1000: isDay ? "☀️" : "🌙",
    1003: isDay ? "🌤" : "☁️🌙",
    1006: "☁️",
    1009: "☁️☁️",
    1030: "🌫",
    1135: "🌫",
    1147: "🌫❄️",
    1063: isDay ? "🌦" : "🌧🌙",
    1066: isDay ? "🌨" : "🌨🌙",
    1087: isDay ? "⛈" : "⛈🌙",
    1273: isDay ? "⛈🌦" : "⛈🌧🌙",
    1276: isDay ? "⛈🌧" : "⛈🌧🌙",
    1279: isDay ? "⛈🌨" : "⛈🌨🌙",
    1282: isDay ? "⛈❄️" : "⛈❄️🌙",
  };
  return map[code] || "❓";
}

function getRainEmoji(chance) {
  if (chance === 0) return "☀️"; // لا أمطار
  if (chance <= 30) return "🌦"; // أمطار خفيفة
  if (chance <= 60) return "🌧"; // أمطار متوسطة
  return "⛈"; // أمطار قوية
}

// --------------------
// DOM Elements
// --------------------
const loadingEl = document.getElementById("loading");
const weatherAppEl = document.getElementById("weatherApp");
const cityNameEl = document.getElementById("cityName");
const currentTempEl = document.getElementById("currentTemp");
const mainWeatherIconEl = document.getElementById("mainWeatherIcon");
const hourlyForecastEl = document.getElementById("hourlyForecast");
const weeklyForecastEl = document.getElementById("weeklyForecast");
const citySearchEl = document.getElementById("citySearch");
const rainChanceEl = document.getElementById("rainChance");
const rainChanceValueEl = document.getElementById("rainChanceValue");
const realFeelEl = document.getElementById("realFeel");
const windSpeedEl = document.getElementById("windSpeed");
const uvIndexEl = document.getElementById("uvIndex");

const apiKey = "bdf5ed7414a0438b816153327250609";

// --------------------
// Show/Hide Loading
// --------------------
function ShowLoading() {
  loadingEl.style.display = "flex";
  weatherAppEl.style.display = "none";
}
function HideLoading() {
  loadingEl.style.display = "none";
  weatherAppEl.style.display = "block";
}

// --------------------
// Fetch Weather Data
// --------------------
async function getWeather(location) {
  try {
    ShowLoading();
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=7&aqi=no&alerts=no`
    );
    const data = await res.json();
    HideLoading();

    // display weather
    updateCurrentWeather(data);
    console.log(data);

    // 2️⃣ جلب التنبؤات بالساعة والأيام بعد ثواني قليلة (lazy)
    setTimeout(() => {
      updateHourlyForecast(data);
      updateWeeklyForecast(data);
      updateAirCondition(data);
    }, 100); // يمكن تغيير الوقت حسب السرعة المطلوبة
  } catch (error) {
    console.error("Error fetching weather:", error);
    loadingEl.innerHTML = `<div class="loading-text">❌ Failed to load data</div>`;
  }
}

// --------------------
// Update rain
// --------------------
function getAvgRainText(hourlyData) {
  // حساب متوسط فرصة الأمطار
  const avgChance = Math.round(
    hourlyData.reduce((sum, h) => sum + h.chance_of_rain, 0) / hourlyData.length
  );
  return avgChance;
}

// --------------------
// Update Current Weather
// --------------------
function updateCurrentWeather(data) {
  cityNameEl.textContent = data.location.name;
  currentTempEl.textContent = `${Math.round(data.current.temp_c)}°`;
  mainWeatherIconEl.textContent = getWeatherEmoji(
    data.current.condition.code,
    data.current.is_day
  );

  // حساب متوسط الأمطار للعرض
  const avgRainChance = getAvgRainText(data.forecast.forecastday[0].hour);
  rainChanceEl.textContent = `Chance of rain: ${avgRainChance}% ${getRainEmoji(
    avgRainChance
  )}`;
}
// --------------------
// Update air conditions
// --------------------

function updateAirCondition(data) {
  realFeelEl.textContent = `${Math.round(data.current.feelslike_c)}°`;
  windSpeedEl.textContent = `${data.current.wind_kph} km/h`;
  const avgRainChance = getAvgRainText(data.forecast.forecastday[0].hour);
  rainChanceValueEl.textContent = `${avgRainChance}%`;
  uvIndexEl.textContent = data.current.uv;
}

// --------------------
// Update Hourly Forecast
// --------------------
function updateHourlyForecast(data) {
  hourlyForecastEl.innerHTML = "";
  data.forecast.forecastday[0].hour.forEach((hour, index) => {
    if (index % 4 === 0) {
      const time = new Date(hour.time).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const emoji = getWeatherEmoji(hour.condition.code, hour.is_day);
      const hourlyItem = document.createElement("div");
      hourlyItem.className = "hourly-item";
      hourlyItem.innerHTML = `
        <div class="hourly-time">${time}</div>
        <div class="hourly-icon">${emoji}</div>
        <div class="hourly-temp">${Math.round(hour.temp_c)}°</div>
      `;
      hourlyForecastEl.appendChild(hourlyItem);
    }
  });
}

// --------------------
// Update Weekly Forecast
// --------------------
function updateWeeklyForecast(data) {
  weeklyForecastEl.innerHTML = "";
  data.forecast.forecastday.forEach((day, index) => {
    const emoji = getWeatherEmoji(day.day.condition.code, 1); // النهار
    const forecastDay = document.createElement("div");
    forecastDay.className = "forecast-day";
    forecastDay.innerHTML = `
      <div class="forecast-left">
        <span class="forecast-day-name">${getDayName(day.date, index)}</span>
        <span class="forecast-icon">${emoji}</span>
        <span class="forecast-condition">${day.day.condition.text}</span>
      </div>
      <div class="forecast-temps">${Math.round(
        day.day.maxtemp_c
      )}°/${Math.round(day.day.mintemp_c)}°</div>
    `;
    weeklyForecastEl.appendChild(forecastDay);
  });
}

// --------------------
// Utility: Day Name
// --------------------
function getDayName(dateString, index) {
  if (index === 0) return "Today";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

// --------------------
// Search
// --------------------
citySearchEl.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const searchQuery = this.value.trim();
    getWeather(searchQuery);
    this.value = "";
  }
});

// --------------------
// Initialize App
// --------------------
document.addEventListener("DOMContentLoaded", function () {
  ShowLoading();

  // جلب الطقس الافتراضي أولاً (Cairo)
  getWeather("Cairo");

  // جلب الموقع الفعلي إذا ممكن
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => getWeather(`${pos.coords.latitude},${pos.coords.longitude}`),
      (err) => console.warn("Location error:", err)
    );
  }
});
