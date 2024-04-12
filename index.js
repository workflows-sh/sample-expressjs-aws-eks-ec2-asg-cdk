const express = require('express')
const weather = require('./src/weatherAPI.js')
const {requestCityFromIP, requestCoordsFromIP} = require('./src/geoipAPI.js')
const anonymizeip = require('./src/anonymizeip.js')
var path = require('path');

const PORT = process.env.PORT || 3000
const HOST = '0.0.0.0'

// !* Edit here for demos
const RELEASE_NO = 'DEMO-2'

const api = express()

api.set('views', path.join(__dirname, 'views'));
api.set('view engine', 'pug');

api.use(express.static(path.join(__dirname, 'public')));

// Define the main route for the sample app. When the homepage of the sample app
// is requested, the server will first determine the client's geolocation based
// on the client's IP address.
api.get('/', (req, res) => {

    const clientIP = req.ip
    const renderValues = {
        release_no: RELEASE_NO,
        ipAddr: anonymizeip(clientIP),
    }

    requestCityFromIP(clientIP).then((coords) => {
        console.log('Coords obj:', coords)

        if ("regionName" in coords && "city" in coords && "country" in coords) {
            renderValues.locationName = `${coords.city}, ${coords.regionName}, ${coords.country}`
        } else if ("country" in coords) {
            if ("city" in coords) {
                renderValues.locationName = `${coords.city}, ${coords.country}`
            } else if ("region" in coords) {
                renderValues.locationName = `${coords.regionName}, ${coords.country}`
            } else {
                renderValues.locationName = coords.country
            }
        } else if ("city" in coords) {
            renderValues.locationName = coords.city
        } else {
            renderValues.locationName = coords.regionName
        }

        // By default, display the weather in Toronto.
        return weather("43.7001", "-79.4163", "America/Toronto")
    }).then((weatherData) => {
        // renderValues.forecast = JSON.stringify(weatherData)
        renderValues.forecast = weatherData
        res.render('index', renderValues)
    })
})

api.get('/geolocate', (req, res) => {
    // If the geolocation permission is denied on the client side, the client
    // will send a request to `/geolocate` to get the estimated coordinates
    // of the client's IP address. This will then return the coordinates to the
    // client, which will use them to call the weather API as it normally would.
    geoip(req.ip).then((coords) => {
        res.json(coords)
    })
})

api.get('/weather', (req, res) => {
    const queryParams = req.query
    if (!queryParams.lat || !queryParams.lon || !queryParams.timezone) {
        res.status(400).send('Missing query parameters. All of the following are required: lat, lon, timezone')
    }

    weather(queryParams.lat, queryParams.lon, queryParams.timezone).then((weatherData) => {
        res.json(weatherData)
    })
})

api.listen(PORT, HOST)
console.log(`Running on http://${HOST}:${PORT}`)
