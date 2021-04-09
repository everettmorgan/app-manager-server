const mongoose = require('mongoose');

const user = process.env.MONGO_USER;
const pass = process.env.MONGO_PASS;
const host = process.env.MONGO_HOST;
const port = process.env.MONGO_PORT;
const db = process.env.MONGO_DEF_DB;
const authDb = process.env.MONGO_AUTH_DB;

const uri = `mongodb://${user}:${pass}@${host}:${port}/${db}?authSource=${authDb}`;

mongoose.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}, function(error) {
    if (error) throw error;
    console.log(`connected to ${host}/${db}`);
});

module.exports = mongoose;