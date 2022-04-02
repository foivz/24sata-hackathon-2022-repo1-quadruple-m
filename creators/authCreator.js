const crypto = require("crypto");
const {fax_secret} = require("../config.json")
const argon2 = require("argon2");
const {validateEmail, validatePassword} = require("../utils/validatorUtils");

function generateToken(input) {
    let current_date = (new Date()).valueOf().toString();
    let random = Math.random().toString();
    return crypto.createHash('sha1').update(current_date + random + input).digest('hex');
}

function minimalUser(user) {
    const {firstName,lastName,email} = user
    return {firstName,lastName,email}
}

module.exports = api => {
    const {validateAcceptHeaders, validateAuthHeader} = require("../utils/validatorUtils")
    const {invalidLink} = require("../utils/errorUtils")

    api.get("/bosko/auth", (req, res, next) => {
        api.mongo.db("fax").collection("token").findOne({token: req.headers.authorization}).then((doc, err) => {
            if (doc) {
                api.mongo.db("fax").collection("user").findOne({email: doc.email}).then((user, err) => {
                    res.status(200).json({
                        isValid: true,
                        user: minimalUser(user)
                    })
                })
            } else {
                res.status(200).json({isValid: false})
            }

        })
    })

    api.post("/bosko/login", (req, res, next) => {
        const {email} = req.body
        api.mongo.db("fax").collection("user").findOne({email}).then((usr, err) => {
            if (!usr) return res.status(200).json({isValid: false})

            const token = generateToken(email)
            api.mongo.db("fax").collection("token").insertOne({email, token})

            const {hash, salt} = usr
            const pass = req.headers.authorization
            argon2.verify(hash, `${pass}${salt}`).then(r => {
                r ? res.status(200).json({isValid: true, token: token}) : res.status(200).json({isValid: false})
            })
        })
    })

    api.post("/bosko/detokenize", (req, res, next) => {
        const {token} = req.body
        api.mongo.db("fax").collection("token").deleteOne({token}).then((tkn, err) => {
            if (!tkn) return res.status(200).json({isValid: false})

            res.status(200).json("Token delete")
        })
    })

    api.post("/bosko/register", (req, res, next) => {
        const {email, firstName, lastName, pass} = req.body
        api.mongo.db("fax").collection("user").findOne({email}).then((usr, doc) => {
            if (!usr) {

                if (!validateEmail(email)) {
                    return res.status(200).json({isValid: false, error: "Invalid email"})
                }

                if (!validatePassword(pass)) {
                    return res.status(200).json({isValid: false, error: "Invalid password"})
                }

                if (!email || !firstName || !lastName) {
                    return res.status(200).json({isValid: false, error: ""})
                }

                const salt = generateToken(firstName)
                argon2.hash(`${pass}${salt}`).then(hash => {
                    api.mongo.db("fax").collection("user").insertOne({
                        email,
                        firstName,
                        lastName,
                        hash,
                        imageUrl: "https://misobarisic.com/miso.webp",
                        salt
                    })

                    const token = generateToken()
                    api.mongo.db("fax").collection("token").insertOne({email, token})

                    res.status(200).json({isValid: true, token})
                })

            } else {
                res.status(200).json({isValid: false, error: "Email se već koristi!"})
            }
        })
    })
}

