const crypto = require("crypto");
const {fax_secret} = require("../config.json")
const argon2 = require("argon2");
const { validateEmail, validatePassword } = require("../utils/validatorUtils");
const ObjectId = require('mongodb').ObjectId;



module.exports = api => {
    api.post("/bosko/spend", (req, res, next) => {
        const spend = {
            gid: req.body.gid,
            price: req.body.price,
            prodname: req.body.prodname,
            retailer: req.body.retailer,
            manufacturer: req.body.manufacturer
        }
        api.mongo.db("finances").collection("spendings").insertOne(spend)
        res.status(200).json("success");

    })

    api.post("/bosko/earn", (req, res, next) => {
        const earn = {
            gid: req.body.gid,
            amount: req.body.amount
        }
        api.mongo.db("finances").collection("earnings").insertOne(earn)
        res.status(200).json("success");


    })

    api.post("/bosko/earnings", (req, res, next) => {
        const earnin = {
            gid: req.body.gid,
            name: req.body.name,
            amount: req.body.amount,
            day: req.body.day = 5
        }
        api.mongo.db("finances").collection("constantearnings").insertOne(earnin)
        res.status(200).json("success");
    })


    api.delete("/bosko/earnings", (req, res, next) => {
        api.delete("/bosko/spendings", (req, res, next) => {
            api.mongo.db("finances").collection("constantearnings").deleteMany({ _id: ObjectId(req.body.id) })
        })
    })

    api.put("/bosko/earnings", (req, res, next) => {
        const earning = {
        name: req.body.name,
        amount: req.body.amount,
        day: req.body.day
        }
        api.mongo.db("finances").collection("constantearnings").updateOne({ _id: ObjectId(req.body.id) }, { $set: earning }, (err, doc) => {
            if (doc) {
                res.status(200).json({ ...doc }) 
            } else {
                res.status(400).json("Error")
            }
        })
    })

    api.post("/bosko/spendings", (req, res, next) => {
        const spendin = {
            gid: req.body.gid,
            name: req.body.name,
            amount: req.body.amount,
            day: req.body.day
        }
        
        api.mongo.db("finances").collection("constantspendings").insertOne(spendin)
        res.status(200).json("success");

    })

    api.put("/bosko/spendings", (req, res, next) => {


        const spendin = {
            gid: req.body.gid,
            name: req.body.name = "",
            amount: req.body.amount = 0,
            day: req.body.day = 5
        }
    })

    api.post("bosko/dailyCheck", (req, res, next) => {
       
    })
    
}