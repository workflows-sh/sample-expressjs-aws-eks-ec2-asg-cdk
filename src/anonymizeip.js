module.exports = function (ipAddr) {
    const ipSegments = ipAddr.split('.')
    return `***.***.${ipSegments[2]}.${ipSegments[3]}`
}
