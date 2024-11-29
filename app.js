const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.json());

const router = require("./router/wa");

app.use('/', router);

app.listen(port, () => {
    console.log('Server Running In Port : ' + port);
    
})