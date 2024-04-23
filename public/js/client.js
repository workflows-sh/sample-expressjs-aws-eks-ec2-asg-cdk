/** Take a decimal coordinate (representing either latitude or longitude) and
  * return an anonymized version of it, as this app exists to be used for demos,
  * rather than for production purposes.
  * @returns {String} The anonymized coordinate, truncated to two decimal places.
  * @param {Number} coord The coordinate value to anonymize.
  */
function anonymizeCoordinate(coord) {

    // We want to randomly add or substract a small value to the coordinate to
    // anonymize it. To decide whether to add or subtract, we generate a random
    // number, and if it is greater than 0.5, we add; otherwise, we subtract.
    const addOrSubtract = Math.random() > 0.5 ? 1 : -1

    // The actual random variation is a value between 0 and 0.5, which will be
    // multiplied by the `addOrSubtract` value to determine the direction of the
    // variation.
    const randomVariation = Math.random() * 0.5 * addOrSubtract

    // Return the anonymized coordinate as a string with two decimal places,
    // which reduces the specificity of the coordinate and adds to the
    // anonymization effect.
    const anonymizedCoord = (parseFloat(coord) + randomVariation).toFixed(2)
    return anonymizedCoord
}

/** Utility function to get the local timezone of the user's browser.
  * @returns {String} The local timezone of the user's browser.
  * */
function getLocalTimezone() {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Fetch the user's geolocation based on their IP address.
 *
 * This function calls the `/geolocate` endpoint on the server, which will
 * call a third-party API to get the user's geolocation based on their IP address.
 * @returns {Object} An object containing the user's geolocation data.
 */
async function getGeolocationFromIP() {
    try {
        const response = await fetch('/geolocate')
        return response.json()
    } catch (e) {
        console.error('Error getting geolocation from IP:', e)
    }
}

/** Update the text on the page to show the user's location in a human-readable
  * format.
  *
  * This is done by updating the inner HTML of the `#coords` element on the page.
  * @param {string} lat - The latitude of the user's location.
  * @param {string} lon - The longitude of the user's location.
  * */
function updateLocationText(lat, lon) {

    // Format the latitude and longitude values to two decimal places, and add
    // the appropriate compass direction (N, S, E, W) based on the sign of the
    // coordinate.
    const latString = `${parseFloat(Math.abs(lat)).toFixed(2)}° ${lat > 0 ? 'N' : 'S'}`;
    const lonString = `${parseFloat(Math.abs(lon)).toFixed(2)}° ${lon > 0 ? 'E' : 'W'}`;

    // Update the text on the page to show the user's location in a human-readable
    // format, with compass directions and degree symbols.
    document.querySelector('#coords').innerHTML = `Location: ${latString}, ${lonString}`
}

/**
 * Attempt to geolocate the user using the browser's geolocation API after they
 * click the "Geolocate" button on the page. If the browser does not support
 * geolocation, or if the user denies the request, the function will fall back
 * to getting the location from the user's IP address.
 */
function geolocate() {

    // Create a constant to reference the `#coords` element on the page, which
    // will be updated to display the user's location.
    const coordsOutput = document.querySelector('#coords')

    /**
     * Callback function for when the browser successfully retrieves the user's
     * geolocation.
     * @param {GeolocationPosition} position - The geolocation data returned by the browser.
     */
    function success(position) {
        console.log('Device geolocation successful!')
        const lat = anonymizeCoordinate(position.coords.latitude)
        const lon = anonymizeCoordinate(position.coords.longitude)
        updateLocationText(lat, lon)
    }

    /**
     * Callback function for when the browser fails to retrieve the user's
     * geolocation. This function will attempt to get the user's location from
     * their IP address instead.
     */
    function deviceGeolocationUnavailable() {
        console.log('Device geolocation failed; getting location from IP address.')
        getGeolocationFromIP().then((coords) => {
            console.log('Geolocation from IP address successful!')
            updateLocationText(anonymizeCoordinate(coords.lat), anonymizeCoordinate(coords.lon))
        })
    }

    // First, attempt to get the user's location using the browser's geolocation
    // API. If the browser does not support geolocation, or if the user denies
    // the request, the `deviceGeolocationUnavailable` function will be called
    // instead to retrieve an approximate location based on the user's IP address.
    if (navigator.geolocation) {
        coordsOutput.innerHTML = 'Retrieving your location...'

        // If device geolocation is successful, the `success` function will be
        // called with the `GeolocationPosition` object returned by
        // `getCurrentPosition`. If the device geolocation fails, then call
        // `deviceGeolocationUnavailable` instead, which takes no arguments.
        navigator.geolocation.getCurrentPosition(success, deviceGeolocationUnavailable);
    } else {
        // If the browser simply does not support geolocation capabilities, don't
        // even attempt to use it. Instead, get the location from the IP address.
        deviceGeolocationUnavailable()
    }
}

// Get the local timezone of the user's browser, and store it as a global variable
// for use in later calls to the weather API, which require a timezone for accurately
// dating the forecast data.
const localTimezone = getLocalTimezone()

// The script will run when the page is loaded, and will set up the event
// listener for the geolocation button, starting here. The geolocate button
// is a default button in the index.pug template.
document.querySelector('#geolocate').addEventListener('click', geolocate)
