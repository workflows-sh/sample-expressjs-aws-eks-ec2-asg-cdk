const http = require('node:http')
const { parse } = require('node:path')
// https://api.open-meteo.com/v1/forecast?
// latitude=49.2497&
// longitude=-123.1193&
// current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&
// daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&
// timezone=America%2FLos_Angeles&
// forecast_days=3

const weatherCodes = {
    0: 'Clear',
    1: 'Mostly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Fog',
    51: 'Light Drizzle',
    53: 'Moderate Drizzle',
    55: 'Heavy Drizzle',
    56: 'Freezing Drizzle',
    57: 'Freezing Drizzle',
    61: 'Light Rain',
    63: 'Rain',
    65: 'Heavy Rain',
    66: 'Freezing Rain',
    67: 'Freezing Rain',
    71: 'Light Snow',
    73: 'Snow',
    75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Light Showers',
    81: 'Showers',
    82: 'Violent Showers',
    85: 'Light Snow Showers',
    86: 'Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm',
    99: 'Thunderstorm',
}

// A 32-point compass rose
const compassPoints = [
    ['North', 'N'],
    ['North by East', 'NbE'],
    ['North-Northeast', 'NNE'],
    ['Northeast by North', 'NEbN'],
    ['Northeast', 'NE'],
    ['Northeast by East', 'NEbE'],
    ['East-Northeast', 'ENE'],
    ['East by North', 'EbN'],
    ['East', 'E'],
    ['East by South', 'EbS'],
    ['East-Southeast', 'ESE'],
    ['Southeast by East', 'SEbE'],
    ['Southeast', 'SE'],
    ['Southeast by South', 'SEbS'],
    ['South-Southeast', 'SSE'],
    ['South by East', 'SbE'],
    ['South', 'S'],
    ['South by West', 'SbW'],
    ['South-Southwest', 'SSW'],
    ['Southwest by South', 'SWbS'],
    ['Southwest', 'SW'],
    ['Southwest by West', 'SWbW'],
    ['West-Southwest', 'WSW'],
    ['West by South', 'WbS'],
    ['West', 'W'],
    ['West by North', 'WbN'],
    ['West-Northwest', 'WNW'],
    ['Northwest by West', 'NWbW'],
    ['Northwest', 'NW'],
    ['Northwest by North', 'NWbN'],
    ['North-Northwest', 'NNW'],
    ['North by West', 'NbW']
]

const defaultQueryParams = {
    latitude: 49.24,
    longitude: -123.11,
    timezone: 'America/Los_Angeles',
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
    forecast_days: 3
}

// function requestCityFromCoords(lat, lon) {
//     const baseApiQuery = "http://api.geonames.org/findNearbyPlaceName?username=ctoai_n3a7&cities=cities15000"
//     const requestURL = `${baseApiQuery}&lat=${lat}&lng=${lon}`

//     return new Promise((resolve, reject) => {

//         const geocodeReq = http.get(requestURL, (res) => {
//             // console.log(`STATUS: ${res.statusCode}`)
//             // console.log(`HEADERS: ${JSON.stringify(res.headers)}`)
//             res.setEncoding('utf8')

//             let responseData = '';
//             res.on('data', (chunk) => {
//                 // console.log(`BODY: ${JSON.stringify(chunk)}`)
//                 responseData += chunk
//             })

//             res.on('end', () => {
//                 try {
//                     const cityResponse = JSON.parse(responseData)
//                     const city = {
//                         city: cityResponse.geonames[0].name,
//                         regionName: cityResponse.geonames[0].adminName1,
//                         country: cityResponse.geonames[0].countryName
//                     }

//                     resolve(city)
//                 } catch (e) {
//                     console.error(e.message)
//                     reject(e)
//                 }
//             })
//         })

//         geocodeReq.on('error', (e) => {
//             console.error(`problem with request: ${e.message}`)
//         })

//         geocodeReq.end()
//     })
// }

function generateForecast(weatherData) {
    const dailyForecasts = {}

    const forecastElements = Object.entries(weatherData.daily)
    weatherData.daily.time.forEach((day, index) => {
        const singleDayForecast = {
            time: day,
            weather: weatherData.daily.weather[index]
        }

        forecastElements.forEach(([key, value]) => {
            if (!['time', 'weather_code', 'weather'].includes(key)) {
                singleDayForecast[key] = [value[index], weatherData.daily_units[key]]
            }
        })

        dailyForecasts[day] = singleDayForecast
    })

    console.log(dailyForecasts)
    return dailyForecasts
}

function generateCurrentConditions(weatherData) {
    const rawConditions = weatherData.current
    const rawUnits = weatherData.current_units

    const currentConditions = {}

    Object.entries(rawConditions).forEach(([key, value]) => {
        if (key === 'weather') {
            currentConditions['description'] = value
        } else if (key === 'apparent_temperature') {
            currentConditions['feels_like'] = [value, rawUnits[key]]
        } else if (['time', 'interval', 'weather_code'].includes(key)) {
            // Do nothing
        } else {
            currentConditions[key] = [value, rawUnits[key]]
        }
    })

    const windCompass = compassPoints[Math.round(rawConditions.wind_direction_10m / 11.25)]
    currentConditions['wind_compass'] = windCompass[0]
    currentConditions['wind_compass_short'] = windCompass[1]

    return currentConditions
}

function getWeather(lat, lon, timezone) {

    const queryParams = Object.assign({}, defaultQueryParams, {
        latitude: parseFloat(lat).toFixed(2),
        longitude: parseFloat(lon).toFixed(2),
        timezone: timezone
    })

    console.log('------------------------------\nQuery parameters:')
    console.log(queryParams)

    const queryString = Object.keys(queryParams).map(key => key + '=' + queryParams[key]).join('&')

    const url = `http://api.open-meteo.com/v1/forecast?${queryString}`

    return new Promise((resolve, reject) => {
        let weatherResponse = {}
        const weatherReq = http.get(url, (res) => {
            // console.log(`STATUS: ${res.statusCode}`)
            // console.log(`HEADERS: ${JSON.stringify(res.headers)}`)
            res.setEncoding('utf8')

            let responseData = ''
            res.on('data', (chunk) => {
                // console.log(`BODY: ${JSON.stringify(chunk)}`)
                responseData += chunk
            })

            res.on('end', () => {
                try {
                    weatherResponse = JSON.parse(responseData)
                    weatherResponse.current.weather = weatherCodes[weatherResponse.current['weather_code']]
                    weatherResponse.daily.weather = []
                    weatherResponse.daily.weather_code.forEach(day => {
                        weatherResponse.daily.weather.push(weatherCodes[day])
                    })
                    // console.log('------------------------------\nWeather response:')
                    // console.log(weatherResponse)
                    // console.log('------------------------------')

                    const parsedWeatherData = {
                        current: generateCurrentConditions(weatherResponse),
                        daily_forecast: generateForecast(weatherResponse)
                    }

                    resolve(parsedWeatherData)
                } catch (e) {
                    console.error(e.message)
                    reject(e)
                }
            })
        })

        weatherReq.on('error', (e) => {
            console.error(`problem with request: ${e.message}`)
        })

        weatherReq.end()
    })
}

module.exports = getWeather;