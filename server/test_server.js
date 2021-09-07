const express = require('express');
const handler = require('./src/app.js').handler;

const app = express();

app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use('/', handler);

app.listen(8787, function(){
    console.log("listening on port 8787");
});
