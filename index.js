const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const users = require("./app/controllers/db.controller");
const port = 3000;

var corsOptions = {
  origin: "http://localhost:3000",
  origin: "https://ufinity-express.herokuapp.com"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./app/models");
db.sequelize.sync();

// simple route
app.get('/', function (req, res) {
    res.status(200).send({"message": "Welcome to Student Management API!"});
});

app.post('/api/register', users.create);

app.get('/api/commonstudents', users.commonStudents);

app.post('/api/suspend', users.suspend);

app.post('/api/retrievefornotifications', users.notification);

app.listen(port, () => console.log(`App listening on port ${port}!`))