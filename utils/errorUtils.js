module.exports.acceptHeadersNotAllowed = (res, allowed) => {
    res.status(406).send(`Invalid accept headers. Make sure to use ${allowed}.`)
}
module.exports.unauthorized = res => {
    res.status(401).send("You are not authorized. Make sure to check the authorization header.")
}
module.exports.forbidden = res => {
    res.status(403).send("Forbidden. Make sure you have the corresponding permissions.")
}
module.exports.invalidLink = res => {
    res.status(404).send("Invalid link")
}
