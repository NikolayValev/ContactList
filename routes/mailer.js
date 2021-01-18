var express = require("express");
var router = express.Router();
var MapboxClient = require("mapbox");
var client = new MapboxClient(
  'pk.eyJ1Ijoibmlrb2xhaXZhbGV2IiwiYSI6ImNraTJocTBwdjMzYjQycnJtY2xta2lwNnYifQ.tjB9vKUl5Z2Dau8JfzNkUg'
);
var database = require("../database");

router.get("/", function (req, res) {
  res.render("mailer", {});
});
router.post("/mailer", function (req, res) {
  var post = getmessage(req.body);
  var address = post.street + ", " + post.city + ", " + post.state;
  database.addContact(post);
    res.render("submit_sucess", { post: post });
  /*client.geocodeForward(address, function (err, data, result) {
    if (data.features == undefined || data.features.length == 0){
      console.log("geocode did not find the address");
    }
    else {
      post.longitude = data.features[0].geometry.coordinates[0];
      post.latitude = data.features[0].geometry.coordinates[1];
      database.addContact(post);
      res.render("submit_sucess", { post: post });
    }

  });
  */
});
function getmessage(msg) {
  var body = {
    firstname: msg["firstname"],
    lastname: msg["lastname"],
    prefix: msg["prefix"],
    street: msg["street"],
    city: msg["city"],
    state: msg["state"],
    zip: msg["zip"],
    phone: msg["phone"],
    email: msg["email"],
  };

  if (msg["phonechk"] == "phone" || msg["any"] == "any") {
    body["contactbyphone"] = true;
  } else {
    body["contactbyphone"] = false;
  }

  if (msg["mailchk"] == "mail" || msg["any"] == "any") {
    body["contactbymail"] = true;
  } else {
    body["contactbymail"] = false;
  }

  if (msg["emailchk"] == "email" || msg["any"] == "any") {
    body["contactbyemail"] = true;
  } else {
    body["contactbyemail"] = false;
  }

  return body;
}
module.exports = router;