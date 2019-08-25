const express = require('express');
const redirect = require('./src/app.js').redirect;

const app = express();

app.use('/', redirect);

app.listen(8787, function(){
    console.log("listening on port 8787");
});
