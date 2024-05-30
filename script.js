const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentweatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "2271e5a84cb4d3e36b0ae181c118bd05";  //API KEY for OpenWeatherAPI

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {    //HTML for the main weather card
        return `<div class="details">
        <h2> ${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
        <h4> Temperature: ${(weatherItem.main.temp - 273 - 15).toFixed(2)}°C</h4>
        <h4>Wind:  ${weatherItem.wind.speed} M/S</h4>
        <h4>Humidity:${weatherItem.main.humidity}%</h4>
    </div>
    <div class="icon">
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
        <h4>${weatherItem.weather[0].description}</h4>
    </div>`;
    } else {    //HTML for the other five days forecast card
        return `<li class="card">
            <h3> (${weatherItem.dt_txt.split(" ")[0]})</h3>
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
            <h4>Temp: ${(weatherItem.main.temp - 273 - 15).toFixed(2)}°C</h4>
            <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
            <h4>Humidity: ${weatherItem.main.humidity}%</h4>
          </li>`;
    }
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_KEY = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_KEY).then(res => res.json()).then(data => {

        //Filter the forecasts to get only ine forecast per day
        const uniqueforecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueforecastDays.includes(forecastDate)) {
                return uniqueforecastDays.push(forecastDate);
            }
        });

        //clearing previous weather data 
        cityInput.value = "";
        currentweatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        //creating weather cards and adding then to the DOM
        //console.log(fiveDaysForecast);
        fiveDaysForecast.forEach((weatherItem, index) => {
            if (index === 0) {
                currentweatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
        });

    }).catch(() => {
        alert("an error occured while fetching the  another forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    const DEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&Limit=5&appid=${API_KEY}`;


    fetch(DEOCODING_API_URL).then(res => res.json()).then(data => {
        if (!data.length) return alert(`no location found for ${cityName}`);
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("an error occured while fetching the coordinates!");
    });
}


const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            //Get city name from coordinates usng reverse geocoding API
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                console.log(data);
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("an error occured while fetching the city!");
            });
            // console.log(position);
        },
        error => {    //Show alert if user denied the location permission
            //console.log(error);
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset your location and grant access again.")
            }
        }
    );
}
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates())