const express = require('express')
const app = express()

app.use(express.json()) // lets Express parse JSON request bodies

app.get('/', (req, res) => {
    res.status(200).send('Hello World!');
});

module.exports = app
