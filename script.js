// DOM Elements
const searchInput = document.querySelector('.search-bar input');
const refreshBtn = document.querySelector('.refresh-btn');
const unitToggleBtns = document.querySelectorAll('.unit-toggle button');
const viewToggleBtns = document.querySelectorAll('.toggle-view button');

// Weather API configuration
const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// State
let currentUnit = 'C';
let currentCity = 'New York';

// Event Listeners
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        currentCity = searchInput.value;
        getWeatherData(currentCity);
    }
});

refreshBtn.addEventListener('click', () => {
    getWeatherData(currentCity);
});

unitToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        unitToggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentUnit = btn.textContent.replace('°', '');
        updateTemperatureDisplay();
    });
});

viewToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        viewToggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (btn.classList.contains('week')) {
            getWeeklyForecast(currentCity);
        } else {
            getDailyForecast(currentCity);
        }
    });
});

// API Calls
async function getWeatherData(city) {
    try {
        const response = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        updateCurrentWeather(data);
        getDailyForecast(city);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

async function getDailyForecast(city) {
    try {
        const response = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        updateForecast(data.list);
    } catch (error) {
        console.error('Error fetching forecast data:', error);
    }
}

// UI Updates
function updateCurrentWeather(data) {
    const temperature = document.querySelector('.temperature');
    const condition = document.querySelector('.condition');
    const date = document.querySelector('.date');
    const weatherIcon = document.querySelector('.weather-icon img');
    
    temperature.textContent = `${Math.round(data.main.temp)}°${currentUnit}`;
    condition.textContent = data.weather[0].description;
    date.textContent = new Date().toLocaleString('en-US', { 
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric'
    });
    
    // Update weather icon
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    
    // Update highlights
    updateHighlights(data);
}

function updateHighlights(data) {
    // UV Index (Note: OpenWeather API doesn't provide UV index in free tier)
    document.querySelector('.uv-value').textContent = '5';
    
    // Wind Status
    document.querySelector('.wind-speed').textContent = data.wind.speed.toFixed(2);
    document.querySelector('.wind-direction').textContent = getWindDirection(data.wind.deg);
    
    // Humidity
    document.querySelector('.humidity-value').textContent = `${data.main.humidity}%`;
    
    // Visibility
    document.querySelector('.visibility-value').textContent = (data.visibility / 1000).toFixed(1);
    
    // Air Quality (Note: Requires separate API call for accurate data)
    document.querySelector('.aqi-value').textContent = '105';
    
    // Sunrise & Sunset
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    document.querySelector('.sunrise span').textContent = sunrise.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
    document.querySelector('.sunset span').textContent = sunset.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
}

function updateForecast(forecastData) {
    const weeklyForecast = document.querySelector('.weekly-forecast');
    weeklyForecast.innerHTML = '';
    
    const dailyData = forecastData.filter((item, index) => index % 8 === 0).slice(0, 7);
    
    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const icon = day.weather[0].icon;
        
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.innerHTML = `
            <span>${dayName}</span>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="weather">
            <span>${temp}°${currentUnit}</span>
        `;
        
        weeklyForecast.appendChild(dayElement);
    });
}

function updateTemperatureDisplay() {
    const temperature = document.querySelector('.temperature');
    const currentTemp = parseInt(temperature.textContent);
    
    if (currentUnit === 'F') {
        temperature.textContent = `${Math.round(currentTemp * 9/5 + 32)}°F`;
    } else {
        temperature.textContent = `${Math.round((currentTemp - 32) * 5/9)}°C`;
    }
}

function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

// Initial load
getWeatherData(currentCity);
