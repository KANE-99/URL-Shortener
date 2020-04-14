"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var request = require("request");

const dns = require("dns");

var cors = require("cors");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

// mongoose.connect(process.env.DB_URI);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

var endpoint = "https://jsonbox.io/box_309a93ffb821dd9b6864";

function getrandom() {
  var random_string =
    Math.random()
      .toString(32)
      .substring(2, 5) +
    Math.random()
      .toString(32)
      .substring(2, 5);
  return random_string;
}

app.post("/api/shorturl/new", (req, res) => {
  // var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  // var regex = new RegExp(expression);
  let url;
  try {
    url = new URL(req.body.url);
    let hash = getrandom();

    console.log("hash ready", hash);

    var options = {
      uri: endpoint + "/" + hash,
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      json: {
        url: url
      }
    };
    request(options, (error, response, body) => {
      if (error) {
        console.err(error.message);
      }
      if (response.statusCode !== 200) {
        // console.log(response);
        return res.json({ msg: "some error in making request" });
      }
      res.json({ original_url: url, short_url: hash });
    });
  } catch (err) {
    console.log("Problem here ", err);
    return res.json({ error: "invalid URL" });
  }

  // dns.lookup(url.hostname, err => {
  //   console.log("fake website");
  //   return res.json({ error: "invalid URL" });
  // });
});

app.get("/api/shorturl/:short_url", (req, res) => {
  var options = {
    uri: endpoint + "/" + req.params.short_url,
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  };
  request(options, (error, response, body) => {
    if (error) {
      return res.json({ msg: "Some Error" });
    }
    console.log("body ", JSON.parse(body)[0].url);
    return res.redirect('http://www.google.com');
  });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
