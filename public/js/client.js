function anonymizeCoordinate(coord) {
    const addOrSubtract = Math.random() > 0.5 ? 1 : -1
    const randomVariation = Math.random() * 0.5 * addOrSubtract
    return (parseFloat(coord) + randomVariation).toFixed(2)
}

function getLocalTimezone() {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone
}

async function getGeolocationFromIP() {
    const response = await fetch('/geolocate')
    return response.json()
}

function updateLocationText(lat, lon) {
    const latString = `${Math.abs(lat)}° ${lat > 0 ? 'N' : 'S'}`;
    const lonString = `${Math.abs(lon)}° ${lon > 0 ? 'E' : 'W'}`;
    document.querySelector('#coords').innerHTML = `Location: ${latString}, ${lonString}`
}

// function updateWeatherData

function geolocate() {

    console.log(`Timezone: ${localTimezone}`)
    const coordsOutput = document.querySelector('#coords')

    function success(position) {
        console.log('Device geolocation successful')
        const lat = anonymizeCoordinate(position.coords.latitude)
        const lon = anonymizeCoordinate(position.coords.longitude)
        updateLocationText(lat, lon)
    }

    function deviceGeolocationUnavailable() {
        console.log('Device geolocation failed')
        getGeolocationFromIP().then((coords) => {
            updateLocationText(anonymizeCoordinate(coords.lat), anonymizeCoordinate(coords.lon))
        })
    }

    if (navigator.geolocation) {
        coordsOutput.innerHTML = 'Retrieving your location...'
        navigator.geolocation.getCurrentPosition(success, deviceGeolocationUnavailable);
    } else {
        deviceGeolocationUnavailable()
    }
}

const localTimezone = getLocalTimezone()
document.querySelector('#geolocate').addEventListener('click', geolocate)
