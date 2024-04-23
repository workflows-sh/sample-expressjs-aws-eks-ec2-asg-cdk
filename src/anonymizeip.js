
// Extremely basic regex for validating the vague shape of an IP address.
const ipAddrRegex = /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/

// Take an IP address as a string and return an anonymized version of it (with
// the first two segments replaced by asterisks)
module.exports = function (ipAddr) {
    // Attempt to anonymize the IP address, and return a default value if the
    // anonymization fails at any point.
    try {
        if (typeof ipAddr !== 'string') {
            throw new Error('Invalid input type')
        }
        if (!ipAddr || !ipAddrRegex.test(ipAddr)) {
            throw new Error('Invalid IP address format')
        }

        const ipSegments = ipAddr.split('.')

        // Replace the first two segments of the IP address with asterisks,
        // leaving the final two segments as-is.
        return `***.***.${ipSegments[2]}.${ipSegments[3]}`
    } catch (e) {
        console.error(e.message)

        // If the IP address cannot be anonymized, return a default value.
        return '***.***.***.***'
    }
}
