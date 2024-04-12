const http = require('node:http')

function anonymizeCoordinate(coord) {
    const addOrSubtract = Math.random() > 0.5 ? 1 : -1
    const randomVariation = Math.random() * 0.5 * addOrSubtract
    return (parseFloat(coord) + randomVariation).toFixed(2)
}

function buildAPIRequest(ipAddr, fieldsVal) {
    let queryIP = ''

    if (!ipAddr.startsWith('127.')) {
        queryIP = ipAddr
    }

    return `http://ip-api.com/json/${queryIP}?fields=${fieldsVal}`

}

function apiRequest(url) {

    const requestURL = url

    return new Promise((resolve, reject) => {

        let coordsResponse = {}

        const geoipReq = http.get(requestURL, (res) => {
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
        })

        geoipReq.end()
    })
}

function requestCoordsFromIP(ipAddr) {
    const url = buildAPIRequest(ipAddr, 'status,country,regionName,city,lat,lon,timezone')
    return apiRequest(url)
}

function requestCityFromIP(ipAddr) {
    const url = buildAPIRequest(ipAddr, 'status,country,regionName,city')
    return apiRequest(url)
}



module.exports = {
    requestCityFromIP,
    requestCoordsFromIP,
}
