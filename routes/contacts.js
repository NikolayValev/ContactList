var express = require("express");
var router = express.Router();
var database = require("../database");
var MapboxClient = require("mapbox");
var client = new MapboxClient(
  "pk.eyJ1Ijoibmlrb2xhaXZhbGV2IiwiYSI6ImNraXl5ZndoeTE3bWgycnAzaG4zZTAwbWMifQ.8k-EYsjaTAj84xQboSoSuQ"
);
var is_user = function (req, res, next) {
  if (req.user) {
    return next();
  } else {
    console.log("Not logged in!");
    res.redirect("/login");
  }
};
router.get("/", is_user, function (req, res) {
  database.displayContacts(null, function (err, result) {
    if (err) console.log(err);
    else if (result == null) console.log("empty database");
    else res.render("contacts", { contacts: result });
  });
});
router.post("/read", is_user, function (req, res) {
  database.displayContacts(null, function (err, result) {
    if (err) console.log(err);
    else if (result == null) console.log("empty database");
    else {
      res.send(result);
    }
  });
});
router.post("/delete", is_user, function (req, res) {
  console.log(req.body.id);
  database.deleteContact(req.body.id, function (err, result) {
    if (err) console.log(err);
    else res.end();
  });
});

router.post("/update", is_user, function (req, res) {
  var post = getUpdateData(req.body);

  var address = post.street + ", " + post.city + ", " + post.state;
  console.log("geocoding address" + address);

  client.geocodeForward(address, function (err, data, resp) {
    post.longitude = data.features[0].geometry.coordinates[0];
    post.latitude = data.features[0].geometry.coordinates[1];

    database.updateContact(post, function (err, result) {
      if (err) console.log(err);
      else res.end(JSON.stringify({ result: "success" }));
    });
  });
});

function getUpdateData(data) {
  var details = {};
  details.prefix = data["formdata[prefix]"];
  details.firstname = data["formdata[firstname]"];
  details.lastname = data["formdata[lastname]"];
  details.street = data["formdata[street]"];
  details.city = data["formdata[city]"];
  details.state = data["formdata[state]"];
  details.zip = data["formdata[zip]"];
  details.phone = data["formdata[phone]"];
  details.email = data["formdata[email]"];
  details.id = data["formdata[id]"];
  details.latitude = data["formdata[latitude]"];
  details.longitude = data["formdata[longitude]"];

  if (data["formdata[any]"] == "any" || data["formdata[phonechk]"] == "phone") {
    details.contactbyphone = true;
  } else {
    details.contactbyphone = false;
  }

  if (data["formdata[any]"] == "any" || data["formdata[mailchk]"] == "mail") {
    details.contactbymail = true;
  } else details.contactbymail = false;

  if (data["formdata[any]"] == "any" || data["formdata[emailchk]"] == "email") {
    details.contactbyemail = true;
  } else details.contactbyemail = false;

  return details;
}

module.exports = router;