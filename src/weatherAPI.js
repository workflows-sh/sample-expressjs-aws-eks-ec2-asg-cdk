const http = require('http')

// These are the WMO Weather interpretation codes definitions referenced
// in the Open-Meteo API documentation.
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

// A 16-point compass rose, where each point is 22.5 degrees from the previous.
const compassPoints = [
    ['North', 'N'],
    ['North-Northeast', 'NNE'],
    ['Northeast', 'NE'],
    ['East-Northeast', 'ENE'],
    ['East', 'E'],
    ['East-Southeast', 'ESE'],
    ['Southeast', 'SE'],
    ['South-Southeast', 'SSE'],
    ['South', 'S'],
    ['South-Southwest', 'SSW'],
    ['Southwest', 'SW'],
    ['West-Southwest', 'WSW'],
    ['West', 'W'],
    ['West-Northwest', 'WNW'],
    ['Northwest', 'NW'],
    ['North-Northwest', 'NNW'],
]

// Example Open-Meteo API query showing how the parameters are used:
// https://api.open-meteo.com/v1/forecast?
// latitude=49.2497&
// longitude=-123.1193&
// current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&
// daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&
// timezone=America%2FLos_Angeles&
// forecast_days=3

const defaultQueryParams = {
    latitude: 49.24,
    longitude: -123.11,
    timezone: 'America/Los_Angeles',
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
    forecast_days: 3
}

// This function is currently unused, but kept because it may be usedful in the future.
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

    const windCompass = compassPoints[Math.round((rawConditions.wind_direction_10m - 11.25) / 22.5)]
    currentConditions['wind_compass'] = windCompass[0]
    currentConditions['wind_compass_short'] = windCompass[1]

    return currentConditions
}

/**
 * Parse the raw weather data retrieved from the Open-Meteo API into a format
 * that can be used more easily by the client-side code.
 * @param {Object} rawData - The raw weather data retrieved from the Open-Meteo API.
 * @param {Number} rawData.latitude - The latitude of the location.
 * @param {Number} rawData.longitude - The longitude of the location.
 * @param {String} rawData.timezone - The timezone of the location.
 * @param {Object} rawData.current - The current weather conditions.
 * @param {Object} rawData.current_units - The units for the current weather conditions.
 * @param {Object} rawData.daily - The daily weather forecast.
 * @param {Object} rawData.daily_units - The units for the daily weather forecast.
 * @param {string[]} rawData.daily.time - The timestamps for the daily forecast.
 * @param {number[]} rawData.daily.weather_code - The weather codes for the daily forecast.
 * @param {number[]} rawData.daily.temperature_2m_max - The maximum daily temperature.
 * @param {number[]} rawData.daily.temperature_2m_min - The minimum daily temperature.
 * @param {number[]} rawData.daily.precipitation_sum - The daily precipitation amount.
 * @param {number[]} rawData.daily.precipitation_probability_max - The maximum daily precipitation probability.
 */
function parseWeatherResponse(rawData) {
    console.log("Weather API raw response: ", rawData)

    // TODO: Throw an error if the `rawData` object
    // is missing the expected keys (i.e. `current`, `daily`)

    rawData.current.weather = weatherCodes[rawData.current['weather_code']]
    rawData.daily.weather = []
    rawData.daily.weather_code.forEach(day => {
        rawData.daily.weather.push(weatherCodes[day])
    })

    const parsedWeatherData = {
        current: generateCurrentConditions(rawData),
        daily_forecast: generateForecast(rawData)
    }

    return parsedWeatherData
}

/**
 * Fetch weather data from the Open-Meteo API based on the provided latitude,
 * longitude, and timezone. Returns a Promise that resolves with the parsed
 * weather data.
 * @returns {Promise<http.ClientRequest>} A Promise that resolves with the parsed weather data.
 * @param {string} lat - The latitude of the location.
 * @param {string} lon - The longitude of the location.
 * @param {string} timezone - The timezone of the location.
 */
function getWeather(lat, lon, timezone) {

    const queryParams = Object.assign({}, defaultQueryParams, {
        latitude: parseFloat(lat).toFixed(2),
        longitude: parseFloat(lon).toFixed(2),
        timezone: timezone
    })

    // Construct the query string from the `queryParams` object, after merging
    // the submitted values with the default values.
    const queryString = Object.keys(queryParams).map(key => key + '=' + queryParams[key]).join('&')

    const url = `http://api.open-meteo.com/v1/forecast?${queryString}`

    return new Promise((resolve, reject) => {
        let weatherResponse = {}

        // Make the request to the Open-Meteo API to get the weather data.
        const weatherReq = http.get(url, (res) => {
            res.setEncoding('utf8')

            // If the response status code is not 200, reject the Promise with an error.
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode} ${res.statusMessage}`))
            }

            // Create a variable to store the response data chunks as they come in.
            let responseData = ''
            res.on('data', (chunk) => {
                // console.log(`BODY: ${JSON.stringify(chunk)}`)
                responseData += chunk
            })

            // When the response has finished, parse the JSON data and resolve the Promise.
            res.on('end', () => {
                try {
                    resolve(parseWeatherResponse(JSON.parse(responseData)))
                } catch (e) {
                    console.error(e.message)
                    reject(e)
                }
            })
        })

        weatherReq.on('error', (e) => {
            console.error(`Problem retrieving weather: ${e.message}`)
            reject(e)
        })

        weatherReq.end()
    })
}

module.exports = getWeather;
