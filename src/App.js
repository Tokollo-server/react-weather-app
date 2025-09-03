// src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";



const API_KEY = "408bc4e1f6ec488098a111416250906";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState(
    () => JSON.parse(localStorage.getItem("favorites")) || []
  );
  const [unit, setUnit] = useState("C");

  const getWeather = async (location) => {
    try {
      const res = await axios.get(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=5&aqi=no&alerts=no`
      );
      setWeather(res.data);
      setForecast(res.data.forecast.forecastday);
      setError("");
    } catch (err) {
      setError("Could not fetch weather data. Try a different city.");
      setWeather(null);
      setForecast([]);
    }
  };

  const handleSearch = () => {
    if (city) getWeather(city);
  };

  const toggleFavorite = () => {
    if (!weather) return;
    const currentCity = weather.location.name;
    let updatedFavorites;
    if (favorites.includes(currentCity)) {
      updatedFavorites = favorites.filter((c) => c !== currentCity);
    } else {
      updatedFavorites = [...favorites, currentCity];
    }
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const handleUnitToggle = () => {
    setUnit(unit === "C" ? "F" : "C");
  };

  const convertTemp = (tempC) => {
    return unit === "C"
      ? `${tempC} °C`
      : `${((tempC * 9) / 5 + 32).toFixed(1)} °F`;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        getWeather(`${pos.coords.latitude},${pos.coords.longitude}`);
      });
    }
  }, []);

  const getBackgroundClass = () => {
    if (!weather) return "default-bg";
    const condition = weather.current.condition.text.toLowerCase();
    if (condition.includes("sunny")) return "sunny-bg";
    if (condition.includes("cloudy")) return "cloudy-bg";
    if (condition.includes("rain")) return "rainy-bg";
    if (condition.includes("snow")) return "snowy-bg";
    return "default-bg";
  };

  return (
    <div className={`app-container ${getBackgroundClass()}`}>
      <div className="container py-4">
        <h1 className="mb-4 text-center">React Weather App</h1>

        <div className="input-group mb-4 shadow">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button className="btn btn-primary btn-lg" onClick={handleSearch}>
            Search
          </button>
          <button
            className="btn btn-outline-light btn-lg"
            onClick={handleUnitToggle}
          >
            {unit === "C" ? "Show °F" : "Show °C"}
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {weather && (
          <div className="card mb-4 shadow-lg rounded-4 bg-dark text-white">
            <div className="card-body text-center">
              <h3>
                {weather.location.name}, {weather.location.country}
              </h3>
              <p>
                {convertTemp(weather.current.temp_c)} -{" "}
                {weather.current.condition.text}
              </p>
              <img src={weather.current.condition.icon} alt="weather" />
              <div className="mt-2">
                <button className="btn btn-warning" onClick={toggleFavorite}>
                  {favorites.includes(weather.location.name)
                    ? "Remove from Favorites"
                    : "Add to Favorites"}
                </button>
              </div>
            </div>
          </div>
        )}

        {forecast.length > 0 && (
          <div>
            <h4 className="text-white">5-Day Forecast</h4>
            <div className="row justify-content-center">
              {forecast.map((day) => (
                <div className="col-md-2 col-sm-4 col-6" key={day.date}>
                  <div className="card text-center mb-3 bg-secondary bg-opacity-75 text-white shadow-sm">
                    <div className="card-body">
                      <h6>{day.date}</h6>
                      <img src={day.day.condition.icon} alt="icon" />
                      <p className="mb-1">{convertTemp(day.day.avgtemp_c)}</p>
                      <small>{day.day.condition.text}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {favorites.length > 0 && (
          <div className="mt-4">
            <h4 className="text-white">Favorite Cities</h4>
            <ul className="list-group">
              {favorites.map((favCity) => (
                <li
                  key={favCity}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  {favCity}
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => getWeather(favCity)}
                  >
                    Check
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <footer
          className="text-center text-white py-3 mt-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <small>
            &copy; {new Date().getFullYear()} Weather App by Tokollo. All rights
            reserved.
          </small>
        </footer>
      </div>
    </div>
  );
}

export default App;
