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

function apiRequest(url) {

    return new Promise((resolve, reject) => {

        let coordsResponse = {}

        const geoipReq = http.get(url, (res) => {
            // console.log(`STATUS: ${res.statusCode}`)
            // console.log(`HEADERS: ${JSON.stringify(res.headers)}`)
            res.setEncoding('utf8')

            let responseData = '';
            res.on('data', (chunk) => {
                // console.log(`BODY: ${JSON.stringify(chunk)}`)
                responseData += chunk
            })

            res.on('end', () => {
                try {
                    coordsResponse = JSON.parse(responseData)

                    // Because this sample app is used in live demos, we want to
                    // anonymize the coordinates returned to the client side.
                    if ("lat" in coordsResponse && "lon" in coordsResponse) {
                        coordsResponse.lat = anonymizeCoordinate(coordsResponse.lat)
                        coordsResponse.lon = anonymizeCoordinate(coordsResponse.lon)
                    }

                    if (coordsResponse.status !== 'success') {
                        throw new Error('API request to `ip-api.com` failed.')
                    } else {
                        resolve(coordsResponse)
                    }
                } catch (e) {
                    console.error(e.message)
                    reject(e)
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

function requestCoordsFromIP(ipAddr) {

    // Validate input and throw an error if the input string isn't a valid IP address.
    if (!ipAddrRegex.test(ipAddr)) {
        throw new Error('Invalid IP address format')
    }

    const url = buildAPIRequest(ipAddr, 'status,country,regionName,city,lat,lon,timezone')
    return apiRequest(url)
}

function requestCityFromIP(ipAddr) {

    // Validate input and throw an error if the input string isn't a valid IP address.
    if (!ipAddrRegex.test(ipAddr)) {
        throw new Error('Invalid IP address format')
    }

    const url = buildAPIRequest(ipAddr, 'status,country,regionName,city')
    return apiRequest(url)
}



module.exports = {
    requestCityFromIP,
    requestCoordsFromIP,
}
