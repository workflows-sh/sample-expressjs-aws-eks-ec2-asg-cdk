const http = require('http')

const ipAddrRegex = /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/

function anonymizeCoordinate(coord) {

    // Randomly add or subtract a small value to the coordinate to anonymize it
    // by up to 0.5 degrees in either direction. This keeps the location within
    // the same city or region, but not at the exact location.
    const addOrSubtract = Math.random() > 0.5 ? 1 : -1
    const randomVariation = Math.random() * 0.5 * addOrSubtract

    // Return the anonymized coordinate as a string with two decimal places, as
    // reduced specificity adds to the anonymization effect.
    return (parseFloat(coord) + randomVariation).toFixed(2)
}

function buildAPIRequest(ipAddr, fieldsVal) {
    let queryIP = ''

    // If the IP address is a localhost address, we want to add a blank query
    // to our returned URL. The API call will geolocate the IP address that
    // queried the API endpoint, rather than attempting to geolocate localhost.
    if (!ipAddr.startsWith('127.')) {
        queryIP = ipAddr
    }

    return `http://ip-api.com/json/${queryIP}?fields=${fieldsVal}`

}

const defaultCoords = {
    status: 'success',
    country: 'Canada',
    regionName: 'Ontario',
    city: 'Toronto',
    lat: '43.7',
    lon: '-79.42',
    timezone: 'America/Toronto',
}

function apiRequest(url) {

    return new Promise((resolve, reject) => {

        let coordsResponse = {}

        const geoipReq = http.get(url, (res) => {
            res.setEncoding('utf8')

            if (res.statusCode !== 200) {
                console.error(`API request to 'ip-api.com' failed with status code ${res.statusCode}`)
                reject(defaultCoords)
            }

            let responseData = '';
            res.on('data', (chunk) => {
                // console.log(`BODY: ${JSON.stringify(chunk)}`)
                responseData += chunk
            })

            res.on('end', () => {
                try {
                    coordsResponse = JSON.parse(responseData)
                    // console.log("coordsResponse: ", coordsResponse)

                    let locationName = ''
                    if ("regionName" in coordsResponse && "city" in coordsResponse && "country" in coordsResponse) {
                        locationName = `${coordsResponse.city}, ${coordsResponse.regionName}, ${coordsResponse.country}`
                    } else if ("country" in coordsResponse) {
                        if ("city" in coordsResponse) {
                            locationName = `${coordsResponse.city}, ${coordsResponse.country}`
                        } else if ("regionName" in coordsResponse) {
                            locationName = `${coordsResponse.regionName}, ${coordsResponse.country}`
                        } else {
                            locationName = coordsResponse.country
                        }
                    } else if ("city" in coordsResponse) {
                        locationName = coordsResponse.city
                    } else {
                        locationName = coordsResponse.regionName
                    }

                    coordsResponse.locationName = locationName

                    // Because this sample app is used in live demos, we want to
                    // anonymize the coordinates returned to the client side.
                    if ("lat" in coordsResponse && "lon" in coordsResponse) {
                        coordsResponse.lat = anonymizeCoordinate(coordsResponse.lat)
                        coordsResponse.lon = anonymizeCoordinate(coordsResponse.lon)
                    }

                    if (coordsResponse.status !== 'success') {
                        // If our query to the geolocation API endpoint fails,
                        // return the default coordinates object, which has the
                        // coordinates and timezone for Toronto, Ontario, Canada.
                        console.error('API request to `ip-api.com` did not succeed. Rejecting with default coordinates object (Toronto).')
                        reject(defaultCoords)
                    } else {
                        resolve(coordsResponse)
                    }
                } catch (e) {
                    console.error(e.message)
                    reject(defaultCoords)
                }
            })
        })

        geoipReq.on('error', (e) => {
            console.error(`problem with request: ${e.message}`)
            reject(e)
        })

        geoipReq.end()
    })
}

function geolocateFromIP(ipAddr) {

    // Validate input and throw an error if the input string isn't a valid IP address.
    if (!ipAddrRegex.test(ipAddr)) {
        throw new Error('Invalid IP address format')
    }

    const url = buildAPIRequest(ipAddr, 'status,country,regionName,city,lat,lon,timezone')
    return apiRequest(url)
}



module.exports = {
    geolocateFromIP,
}
