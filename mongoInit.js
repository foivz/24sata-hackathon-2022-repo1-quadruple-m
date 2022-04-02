const {MongoClient} = require("mongodb");
// Connection URI
const uri = require("./config.json").mongo
// Create a new MongoClient
const client = new MongoClient(uri);

const run = async api => {
    try {
        // Connect the client to the server
        await client.connect();
        // Establish and verify connection
        await client.db("main").command({ping: 1});
        console.log("Connected successfully to mongodb");
        api.mongo = client
    } catch (e) {
        console.log(e)
    }
}

module.exports = {run}
