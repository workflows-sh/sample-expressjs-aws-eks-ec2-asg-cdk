const express = require('express')
const weather = require('./src/weatherAPI.js')
const {geolocateFromIP} = require('./src/geoipAPI.js')
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

    const weatherResp = geolocateFromIP(clientIP).then((coords) => {
        // If the geolocation is successful, format the name of the returned location,
        // then call the weather API with the coordinates and timezone.

        if ("regionName" in coords && "city" in coords && "country" in coords) {
            renderValues.locationName = `${coords.city}, ${coords.regionName}, ${coords.country}`
        } else if ("country" in coords) {
            if ("city" in coords) {
                renderValues.locationName = `${coords.city}, ${coords.country}`
            } else if ("regionName" in coords) {
                renderValues.locationName = `${coords.regionName}, ${coords.country}`
            } else {
                renderValues.locationName = coords.country
            }
        } else if ("city" in coords) {
            renderValues.locationName = coords.city
        } else {
            renderValues.locationName = coords.regionName
        }

        return weather(coords.lat, coords.lon, coords.timezone)
    }).catch(() => {
        // If the geolocation fails, default to Toronto, Ontario, Canada, then call
        // the weather API with the coordinates and timezone.

        renderValues.locationName = "Toronto, Ontario, Canada"
        return weather("43.7", "-79.42", "America/Toronto")
    })

    weatherResp.then((weatherData) => {
        // Once the weather API call is successful, render the index page with the
        // template values specified in `renderValues`.

        renderValues.forecast = weatherData
        return res.render('index', renderValues, function (err, html) {
            if (err) {
                console.error("Error rendering index page:", err)
                return res.status(500).send('An error occurred while rendering the page.')
            } else {
                return res.send(html)
            }
        })
    }).catch((e) => {
        // If the weather API call fails, render the index page with the template
        // and the limited values that are available.

        console.error("Error in main route:", e)
        res.render('index', renderValues, function (err, html) {
            if (err) {
                console.error("Error rendering index page:", err)
                return res.status(500).send('An error occurred while rendering the page.')
            } else {
                return res.send(html)
            }

        })
    })
})

api.get('/geolocate', (req, res) => {
    // If the geolocation permission is denied on the client side, the client
    // will send a request to `/geolocate` to get the estimated coordinates
    // of the client's IP address. This will then return the coordinates to the
    // client, which will use them to call the weather API as it normally would.
    geolocateFromIP(req.ip).then((coords) => {
        res.json(coords)
    }).catch((e) => {
        res.json({status: 'error', code: 500, message: e.message})
    })
})

api.get('/weather', (req, res) => {
    const queryParams = req.query
    if (!queryParams.lat || !queryParams.lon || !queryParams.timezone) {
        res.status(400).send('Missing query parameters. All of the following are required: lat, lon, timezone')
        return
    }

    weather(queryParams.lat, queryParams.lon, queryParams.timezone).then((weatherData) => {
        res.json(weatherData)
    }).catch((e) => {
        res.json({status: 'error', code: 500, message: e.message})
    })
})

api.listen(PORT, HOST)
console.log(`Running on http://${HOST}:${PORT}`)
