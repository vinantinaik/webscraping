var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

//Scrapping
//var cheerio = require("cheerio");
//var axios = require("axios");

//Models
var db = require("./models");



//Port
var PORT =  process.env.Port || 3000;

//Initialize Express
var app = express();

//Logger
app.use(logger("dev"));

//Handle form submission
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static("public"));


mongoose.connect("mongodb://localhost/webscrapper");
require("./controllers/appController.js")(app,db);

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });