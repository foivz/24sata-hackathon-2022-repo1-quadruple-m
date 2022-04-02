require('dotenv').config()
const express = require('express')
const https = require('https')
const http = require('http')
const fs = require("fs")
const axios = require("axios")
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const mongoInit = require("./mongoInit")
const bodyParser = require('body-parser');
const api = express();
const cors = require("cors")
const apiRoute = "api.misobarisic.com"

mongoInit.run(api)

api.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
api.use(bodyParser.json()); // application/json

api.enable("trust proxy");

// const apiLimiter = rateLimit({
//     windowMs:  15 * 1000, //
//     max: 2
// })
// api.use(apiLimiter);

const speedLimiter = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 10000,
    delayMs: 10
})
api.use(speedLimiter)

api.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('X-Content-Type-Options', 'nosniff')
    next();
})

api.use(function (req, res, next) {
    // if (!req.secure && req.get("host") !== "localhost") {
    //     return res.redirect("https://" + req.headers.host + req.url);
    // }
    console.log({date: new Date(), path: req.path, host: req.get("host"), origin: req.get("origin"), ip: req.ip})
    next();
})

const getCategory = input => input.slice(1, input.slice(1).indexOf("/") + 1);

api.use((req, res, next) => {
    const category = getCategory(req.originalUrl)

    if (category) {
        api.mongo.db("stats").collection("api").findOne({name: category}, (err, doc) => {
            if (doc) {
                api.mongo.db("stats").collection("api").updateOne(doc, {$inc: {usage: 1}})
            } else {
                api.mongo.db("stats").collection("api").insertOne({name: category, usage: 1})
            }
        })
    }

    if (process.env.CORS === "true") {
        const allowedOrigin = process.env.ALLOWED_ORIGIN
        const corsOptions = {
            origin: (origin, callback) => {
                if (!origin) origin = ""
                // console.log(origin,allowedOrigin)
                console.log("headers", req.headers)
                console.log("origin", origin)
                if (origin.includes(allowedOrigin)) {
                    callback(null, true)
                } else {
                    callback("CORS Error")
                }
            }
        }
        api.use(cors(corsOptions))
    }
    next()
})

function init() {
    const path = "./creators/"
    fs.readdir(path, (err, files) => {
        if (err) console.error(err);

        let jsFiles = files.filter(f => f.split(".").pop() === "js");
        if (jsFiles.length <= 0) {
            console.log("No command files found!");
            return;
        }

        console.log(`Loading ${jsFiles.length} creators!`);
        jsFiles.forEach((f, i) => {
            let props = require(`${path}${f}`);
            props(api)
            delete require.cache[require.resolve(`${path}${f}`)];
            console.log(`${i + 1}: ${f} loaded!`);
        });
    })
}
init()

const spotifyFetch = require("./utils/spotifyFetch")
setInterval(() => spotifyFetch(api), 30 * 1000)

// try {
//     https.createServer({
//         key: fs.readFileSync("/etc/letsencrypt/live/api.misobarisic.com/privkey.pem"),
//         cert: fs.readFileSync("/etc/letsencrypt/live/api.misobarisic.com/fullchain.pem")
//     }, api).listen(5252)
// } catch (e) {
//
// }

http.createServer(api).listen(5254)
