module.exports.validateAcceptHeaders = (req, res, allowedAcceptHeaders, callbackFn) => {
    const {acceptHeadersNotAllowed} = require("../utils/errorUtils")
    if (!req.headers.accept) return acceptHeadersNotAllowed(res, {notAllowed: ["Empty"], allowed: allowedAcceptHeaders})

    // Grant access if array is empty
    if (allowedAcceptHeaders.length === 0) return callbackFn()

    // Grant access if headers match
    if (!allowedAcceptHeaders.some(header => req.headers.accept.includes(header)) || !req.headers.accept.includes("*") || !req.headers.accept.includes("*/*")) {
        acceptHeadersNotAllowed(res, allowedAcceptHeaders)
    } else {
        callbackFn()
    }
}
module.exports.validateAuthHeader = (req, res, expected, callbackFn) => {
    const {forbidden, unauthorized} = require("../utils/errorUtils")

    // Grant access if expected token is ""
    if (!expected) {
        expected = "nj"
        req.headers.authorization = expected
    }

    // Return if no auth header
    if (!req.headers.authorization) return unauthorized(res)

    // Get bearer token
    if (req.headers.authorization.slice("Bearer ".length) === expected || req.headers.authorization === expected) {
        callbackFn()
    } else {
        forbidden(res)
    }
}

module.exports.validateEmail = email => {
    const res = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return res.test(String(email).toLowerCase());
}

module.exports.validatePassword = pass => {
    return pass.length > 2;
}