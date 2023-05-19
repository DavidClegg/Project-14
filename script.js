let exampleWeather;
fetch("./data/exampleWeather.json")
    .then(response => response.json())
    .then(json => exampleWeather = json)
    .then(()=>
        detailRoot.render(<Details weather={exampleWeather}/>));

let degrees = "°"
let icon = new Map([
    ["cloudy","☁"],
    ["rainStorm","⛈"],
    ["mostlySunny","🌤"],
    ["mostlyCloudy","🌥"],
    ["mostlyCloudyWithRain","🌦"],
    ["rain","🌧"],
    ["snow","🌨"],
    ["thunder","🌩"],
    ["twister","🌪"],
    ["fog","🌫"],
    ["sun","☀"],
    ["frost","❄"],
])

// for( let [key,value] of icon){document.querySelector(".icons").innerHTML += `${key}: ${value} | ` }//

// let coords = [51.5, -0.1];
let coords = [51.6543, -3.7829]
/*  Zoom level for width; Magnitude:
Z: 8; 1/1: London to Colchester horizontally, Birmingham vertically; The distance between major cities.
Z: 12; 1/10: London center to Wood Green vertically, Wimbledon horizontally; Distance between buroughs.
Z: 15; 1/100: City Center distance
Z: 18; 1/1000: The distance of 3 or 4 blocks
Z: 22; 1/10000: The distance of a house

*/
const map = L.map('map').setView(coords, 13)
const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
           maxZoom: 100,
           attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

    let range = n => new Array(n).fill(0);
    let magnitude = 100;// Division. n/magnitude;
    for(let i in range(2)){
        console.log(i)
        let topRight = coords.map(v => v+parseInt(i)/magnitude);
        let bottomLeft = coords.map(v => v-parseInt(i)/magnitude);
        L.rectangle([topRight, bottomLeft], {color: "#f005", weight: 1}).addTo(map);
        // var marker = L.marker(newCoords).addTo(map);
    }
    map.setView([coords[0] - 0.016, coords[1] - 0.03], 13)
    map.on("click", e=>console.log(e.latlng))


    
/**
 * // Rendering a component on the page:
    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);
    root.render(<MyApp />);
 */

/**May 16, 08:57pm
 * Neath, GB
 * 
 * <icon> 12*C
 * Feels like 11*C. Clear sky. Light Breeze
 * | 3.2m/s NNW  0 1028hPa
 * | Humidity: 70%  Dew point: 7*C
 * | Visibility: 10.0km
 * 
 * ---
 * Date.Now()
 * name, sys.country
 * weather.icon main.temp(in C)
 * main.feels_like. weather.description.  wind speed  
 * | wind.speed main.pressure
 * | main.humidity ?? UV ??
 * | ?? dew ?? visibility
 * 
 * 
 * name
 * visibility
 * sys      .country
 * weather  .icon
 *          .description
 * main     .humidity
 *          .pressure
 *          .temp
 *          .feels_like
 * wind     .speed
 *          .deg
 */

const beaufortScale = speed => {
    // The Beaufort Scale is for describing wind based on what you can see. It's a really interesting measure of the effect of wind.  
    return speed > 119 ? "Hurricane" :
    speed > 103 ? "Storm" :
    speed > 89 ? "Whole Gale" :
    speed > 75 ? "Strong Gale" :
    speed > 62 ? "Fresh Gale" :
    speed > 50 ? "Moderate Gale" :
    speed > 39 ? "Strong Breeze" :
    speed > 29 ? "Fresh Breeze" :
    speed > 20 ? "Moderate Breeze" :
    speed > 12 ? "Gentle Breeze" :
    speed > 6 ? "Light Breeze" :
    speed > 1 ? "Light Winds" : "Calm and Still";
}

const iconUrl = icon => `https://openweathermap.org/img/wn/${icon}@2x.png`; 

const dateEnd = dateNumber =>{
    // There's probably a better way to do this, but this is simple and easy
    return dateNumber + (
        dateNumber == 1?  "st" : 
        dateNumber == 21? "st" :
        dateNumber == 31? "st" :
        dateNumber == 2?  "nd" : 
        dateNumber == 22? "nd" :
        dateNumber == 32? "nd" :
        dateNumber == 3?  "rd" : 
        dateNumber == 23? "rd" :
        "th"
    );
}

const DateWidget = props => (<div className="date">{new Intl.DateTimeFormat(props.locale, {month: "long"}).format(props.date)} {dateEnd(new Intl.DateTimeFormat(props.locale, {day: "numeric"}).format(props.date))}, {new Intl.DateTimeFormat(props.locale, {hour:"numeric", minute:"numeric", dayPeriod: "short"}).format(props.date)}</div>);
const LocationWidget = ({name, country}) => (<div className="location"> {name}, {country}</div>);

const Description = props => (<div className="description">{props.feels + degrees + props.format}. {props.clouds}. {props.wind}.</div>);
const Weather = props => (<div className="weather">
    <div>{props.wind}</div>
    <div>{props.pressure}</div>
    <div>{props.humidity}</div>
    <div>{props.uv}</div>
    <div>{props.dew}</div>
    <div>{props.visibility}</div>
</div>);

const Tempurature = props => (<div className="tempurature" onClick={props.onTempClick}><img src={props.icon}/>{props.tempurature + degrees + props.format}</div>
    );
    
let format = "C";
function Details(props){
    // breaking down the object into variables to make it easier
    const {name, visibility} = props.weather;
    const {country} = props.weather.sys;
    const {icon, description} = props.weather.weather[0]; // weather is a list of "weathers".
    const {humidity, pressure, temp, feels_like} = props.weather.main;
    const {speed, deg} = props.weather.wind;
    console.log({name, visibility, country, icon, description, humidity, pressure
    , temp, feels_like, speed,deg})


    function changeTempFormat (oldFormat){
        format = {
            "C" : "F",
            "F" : "K",
            "K" : "C"
        }[oldFormat]
        console.log(format)
        setTemp(formatTempurature(temp));
        setFeels(formatTempurature(feels_like));
        return;
    };
    const formatTempurature = k => {
        let t = k * 100;
        let newT = format == "C" ? parseFloat(t) -27515 :
        format == "F" ? ((parseFloat(t) -27515) * 1.8) + 3200 : t;
        return parseInt(newT) / 100;
    }

    let [newTemp, setTemp] = React.useState(formatTempurature(temp));
    let [newFeels, setFeels] = React.useState(formatTempurature(feels_like));
    
    return <>
        <DateWidget now={new Date} locale={country}/>
        <LocationWidget name={name} country={country}/>
        <Tempurature icon={iconUrl(icon)} tempurature={newTemp} onTempClick={()=>changeTempFormat(format)} format={format}/>
        <Description feels={newFeels} format={format} clouds={description} wind={beaufortScale(speed)}/>
        <Weather wind={speed} pressure={pressure} humidity={humidity} uv={"uv"} dew={"dew"} visibility={visibility}/>
    </>
}

const detailElement = document.querySelector("#info .details");
const detailRoot = ReactDOM.createRoot(detailElement);
// detailRoot.render(<Details weather={exampleWeather}/>);