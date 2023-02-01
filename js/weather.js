import { ICON_MAP } from "./iconMap.js";

export class WeatherAPI {
    constructor() {
        this.urlFull = 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&timeformat=unixtime&timezone=Asia%2FTokyo';
    }//constructor

    /** get time zone
     * @returns {String} ex: Asia/Seoul
     */
    get_time_zone() {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }//get_time_zone

    /**
     * get weather data
     * @param {Number} lat 
     * @param {Number} lon 
     * @param {String} timezone 
     * @returns {Object}parsed json data
     */
    get_weather(lat, lon, timezone) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&timeformat=unixtime&timezone=${timezone}`;
        return fetch(url)
            .then(res => res.json())
            .then(data => {
                console.log('full data', data);
                return {
                    current: this.parse_curr_weather(data),
                    daily: this.parse_daily_weather(data),
                    hourly: this.parse_hourly_weather(data),
                }
            });
    }//get_weather

    /**
     * parse curr data
     * @param {Object} data 
     * @returns {Object}
     */
    parse_curr_weather({ current_weather, daily }) {
        const {
            temperature: currentTemp,
            weathercode: iconCode,
            windspeed: windSpeed
        } = current_weather;

        const {
            temperature_2m_max: [maxTemp],
            temperature_2m_min: [minTemp],
            apparent_temperature_max: [maxFeelsLike],
            apparent_temperature_min: [minFeelsLike],
            precipitation_sum: [precip]
        } = daily; //각 array의 첫번째 값만 필요하거든

        return {
            currentTemp: String(Math.round(currentTemp)).padStart(2, "0"),
            highTemp: maxTemp,
            lowTemp: minTemp,
            highFeelsLike: maxFeelsLike,
            lowFeelsLike: minFeelsLike,
            windSpeed,
            precip: precip,
            iconCode
        }
    }//parse_curr_weather

    /**
     * parse daily data
     * @param {Object} data      
     * @returns {Object}
     */
    parse_daily_weather({ daily }) {
        const { time, weathercode, temperature_2m_max } = daily;
        return time.map((t, idx) => {
            return {
                timestamp: t * 1000,
                iconCode: weathercode[idx],
                maxTemp: Math.round(temperature_2m_max[idx])
            }
        });
    }//parse_daily_weather

    /**
     * parse hourly data
     * @param {Object} data 
     * @returns {Object}
     */
    parse_hourly_weather({ hourly, current_weather }) {
        const { time, weathercode, temperature_2m, apparent_temperature, windspeed_10m, precipitation } = hourly;

        const { time: currTime } = current_weather;

        return time
            .filter(t => t >= currTime)
            .map((t, idx) => {
                return {
                    timestamp: t * 1000,
                    iconCode: weathercode[idx],
                    temp: Math.round(temperature_2m[idx]),
                    feelsLike: Math.round(apparent_temperature[idx]),
                    windSpeed: Math.round(windspeed_10m[idx]),
                    precip: Math.round((precipitation[idx] * 100) / 100),
                }
            });
    }//parse_hourly_weather
}//WeatherAPI

/* ====================================== */
export class WeatherApp {
    /**
     * 실제로 화면을 그리기 시작함
    */
    constructor() {
    }//constructor

    /** 
     * 화면을 그리기 시작합니다 
     * @param {Object} data 
     * */
    init(data) {
        const { current, daily, hourly } = data;
        this.render_curr(current);
        this.render_daily(daily);
        this.render_hourly(hourly);

        document.body.classList.remove('blur');
    }//init

    /** 해당 dom에 textContent를 변경해준다
     * @param {String}selector
     * @param {String}value
     * @param {DOM}parent
     */
    set_value(selector,value,{parent=document} = {}){
        const $dom = parent.querySelector(`[data-${selector}`); 
        $dom.textContent = value;
        return $dom;
    }//set_value

    /**
     * iconCode에 맞춰 맞는 svg이미지 url을 가져옴
     * @param {Number}iconCode
     */
    get_icon_url(iconCode){
        return `./img/${ICON_MAP.get(iconCode)}.svg`;
    }//get_icon_url

    /** 
     * timestamp를 요일로 바꿔준다
     * @param {Number} timestamp
     * @url https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
     */
    day_formatter(timestamp){
        return new Intl.DateTimeFormat("en-US", {weekday : "long"}).format(timestamp);
    }//day_formatter

    /**
     * 현재 날씨
     * @param {Object}data
     */
    render_curr(data) {
        console.log(data);
        const $wrap = document.getElementById('wrap-curr');
        const $img = $wrap.querySelector('.ic');

        const {currentTemp,highFeelsLike,highTemp,iconCode,lowFeelsLike,lowTemp,precip,windSpeed} = data;

        this.set_value('curr-temp',currentTemp);
        this.set_value('curr-high',highTemp);
        this.set_value('curr-high-fl',highFeelsLike);
        this.set_value('curr-wind',windSpeed);
        this.set_value('curr-low',lowTemp);
        this.set_value('curr-low-fl',lowFeelsLike);
        this.set_value('curr-prcp',precip);
        $img.src = this.get_icon_url(iconCode);

        const $$val = $wrap.querySelectorAll('[class ^= "val-"]');
        $$val.forEach(this.add_unit);
    }//render_curr

    /**
     * 주간 날씨
     * @param {Object}data
     */
    render_daily(data) { 
        const $wrap = document.getElementById('wrap-days');
        const $temp = $wrap.querySelector('template');
        const $frag = document.createDocumentFragment();

        data.forEach(daily =>{
            const {timestamp,iconCode,maxTemp} = daily;
            const $clone = $temp.content.cloneNode(true);

            const $img = $clone.querySelector('[data-days-ic]');
            $img.src = this.get_icon_url(iconCode);
            
            this.set_value('days-day',this.day_formatter(timestamp),{parent:$clone});
            
            const $tempDaily = this.set_value('days-temp',maxTemp,{parent:$clone});
            this.add_unit($tempDaily);

            $frag.appendChild($clone);
        });
        
        $wrap.innerHTML = '';
        $wrap.appendChild($frag);
        console.log(data);
    }//render_daily

    /**
     * 시간별 날씨
     * @param {Object}data
     */
    render_hourly(data) { }//render_hourly

    /**
     * @param {DOM} $dom
     */
    add_unit($dom){
        const type = $dom.classList[0].split('-')[1];
        const $sup = document.createElement('SPAN');
        $sup.classList.add('val-unit');

        switch(type){
            case "temp" :
                // $sup.innerHTML =  '&deg;'; //Farenheit
                $sup.innerHTML =  '°C';
                break;
            case "wind" : 
                $sup.innerHTML = 'km/h';
                break;
            case "inch" :
                $sup.innerHTML = 'inch';
                break;
            default : break;
        }
        $dom.appendChild($sup);
    }//add_unit
}//WeatherApp