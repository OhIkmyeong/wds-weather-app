import {WeatherAPI, WeatherApp } from "./weather.js";
// (async function (){
    // const API = new WeatherAPI();
    // const APP = new WeatherApp();
    // const timeZone = API.get_time_zone();
    // const data = await API.get_weather(52.52, 13.41, timeZone); //여기 베를린 독일이라는데..ㅋㅋ
    // APP.init(data);
// })()
(async function (){
    const API = new WeatherAPI();
    await API.init();
})()