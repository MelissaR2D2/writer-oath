const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static('../public'));

const mongoose = require('mongoose');

// connect to the database
mongoose.connect('mongodb://localhost:27017/projects', {
  useNewUrlParser: true
});

const cookieParser = require("cookie-parser");
app.use(cookieParser());

//const tickets = require("./tickets.js");
//app.use("/api/projects", tickets);

const users = require("./users.js");
app.use("/api/users", users);

app.listen(3000, () => console.log('Server listening on port 3000!'));
