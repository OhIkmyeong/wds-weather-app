import {WeatherAPI, WeatherApp } from "./weather.js";
(async function (){
    const API = new WeatherAPI();
    const APP = new WeatherApp();
    const timeZone = API.get_time_zone();
    const data = await API.get_weather(52.52, 13.41, timeZone);
    APP.init(data);
})()