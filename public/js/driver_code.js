var mapClient;
var mypins = [];

$(function() {
  init_map();
  setupnavbar();
  showRead();
});
/*---------------add and remove buttons on the nav bar for ajax calls------------*/
function setupnavbar() {
  $("#main-contact-btn").remove();

  $("#main-form-btn").remove();

  $("#main-nav").append(
    '<li class = "nav-item"/> <a class = "nav-link" id = "read" href="contacts"> Contacts List'
  );

  $("#main-nav").append(
    "<li class = 'nav-item'/> <a class = 'nav-link' id = 'mailer' href='mailer'> New Record"
  );

  $("#main-nav").append(
    "<li class = 'nav-item'/> <a class = 'nav-link' id = 'logout' href='logout'> Logout"
  );
}

/*---------------table row update button handler------------*/
$("tbody").on("click", "#update", function () {
  var data = $(this).parent();
  data = data.parent();
  data = data.data("details");
  setUpdateFields(data);
  showUpdate();
});

/*------------update form submit button handler-------------*/
$("#update_page button").click(function () {
  var myform = $("#update-form").serializeArray();
  var formdata = getFormData(myform);

  var jax = $.post("contacts/update", { formdata: formdata });
  jax.done(function (data) {
    console.log("done updating in database.");
    showRead();
  });
});

/*--------------table row on click response---------------*/
$("tbody").on("click", "#delete", function () {
  var data = $(this).parent();
  data = data.parent();
  data = data.data("details");
  var id = data._id;

  // make ajax call to delete and show read page
  var j = $.post("contacts/delete", { id: id });
  j.done(function () {
    console.log("done deleting!");
    showRead();
  });
});

/*-----------nav bar create button handler----------------*/
$("#main-nav").on("click", "#create", function () {
  mask(true, false, false);
});

/*-----------nav bar contacts button handler--------------*/
$("#main-nav").on("click", "#read", function () {
  showRead();
});

/*-----------search by name-------------- */
$("#search_name").keyup(function () {
  var val = this.value.split(" ");
  var rows = $("#contactbody").find("tr");

  if (this.value == "") {
    rows.show();
    return;
  }

  //first hide the table body
  rows.hide();
  //show the filtered data
  rows.filter(function (i, v) {
      var $obj = $(this);
      for (var j = 0; j < val.length; ++j) {
        if ($obj.text().toLowerCase().indexOf(val[j]) > -1) {
          return true;
        }
      }
      return false;
    })
    .show();
});

/*---------------initialize map------------------- */
function init_map() {
  mapClient = L.map("contactmap").setView([51.505, 0], 2);
  L.tileLayer(
    'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution:
        'Map data & copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      accessToken:
        "pk.eyJ1Ijoibmlrb2xhaXZhbGV2IiwiYSI6ImNraXl5ZndoeTE3bWgycnAzaG4zZTAwbWMifQ.8k-EYsjaTAj84xQboSoSuQ",
    }
  ).addTo(mapClient);
}

/*-----------------plots markers------------------- */
function plot(data) {
  var lat = data.Latitude;
  var lon = data.Longitude;
  var dat = data.FirstName + " " + data.LastName;
  var pin = L.marker([lon, lat]);
  pin.bindPopup(dat).addTo(mapClient);
  mypins.push(pin);
}

/*get the form data from update and mailer forms*/
function getFormData(data) {
  var dat = {};
  for (each of data) {
    dat[each.name] = each.value;
  }

  //set deselects the 'contact by' radio buttons
  var temp = $("#update-form input:checkbox:not(:checked)").each(function () {
    var name = $(this).attr("name");
    dat[name] = false;
    console.log($(this).attr("name"));
  });

  return dat;
}
/*-----------------fill up input fields in the update page-------------------*/
function setUpdateFields(data) {
  $("#update_page input[name=firstname]").val(data.FirstName);
  $("#update_page input[name=lastname").val(data.LastName);
  $("#update_page input[name=street]").val(data.Street);
  $("#update_page input[name=city]").val(data.City);
  $("#update_page input[name=state]").val(data.State);
  $("#update_page input[name=zip]").val(data.Zip);
  $("#update_page input[name=phone]").val(data.Phone);
  $("#update_page input[name=email]").val(data.Email);
  $("#update_page input[name=id]").val(data._id);

  if (data.Prefix == "Mr")
    $('#update_page input[value="Mr"]').attr("checked", "checked");
  if (data.Prefix == "Mrs")
    $('#update_page input[value="Mrs"]').attr("checked", "checked");
  if (data.Prefix == "Ms")
    $('#update_page input[value="Ms"]').attr("checked", "checked");
  if (data.Prefix == "Dr")
    $('#update_page input[value="Dr"]').attr("checked", "checked");

  if (data.State == "NJ")
    $('.selState option[value="NJ"]').attr("selected", "selected");
  if (data.State == "NY")
    $('.selState option[value="NY"]').attr("selected", "selected");
  if (data.State == "PA")
    $('.selState option[value="PA"]').attr("selected", "selected");
  if (data.State == "CT")
    $('.selState option[value="CT"]').attr("selected", "selected");

  if (data.ContactbyMail) $("input[name=mailchk]").attr("checked", "checked");
  if (data.ContactbyPhone) $("input[name=phonechk]").attr("checked", "checked");
  if (data.ContactbyEmail) $("input[name=emailchk]").attr("checked", "checked");
}

function showRead() {
  var jax = $.post("contacts/read", {});
  jax.done(function (data) {
    //remove the earlier table rows
    $("#contactbody tr").remove();

    //add the most recent data to the table rows
    for (i in data) {
      var row = $("<tr>").addClass("tabledata");

      var address = data[i].Street +", " + data[i].City + ", " +
        data[i].State + ", " + data[i].Zip;
      var phone = data[i].Phone;
      var email = data[i].Email;

      var delbtn = $("<button>")
        .attr("id", "delete")
        .addClass("btn btn-danger")
        .text("delete");
      var upbtn = $("<button>")
        .attr("id", "update")
        .addClass("btn btn-info")
        .text("update");
      var tddel = $("<td>").append(delbtn);
      var tdup = $("<td>").append(upbtn);

      row.attr("data-details", JSON.stringify(data[i]));
      //name
      row.append($("<td>").text(
         data[i].Prefix + ". " + data[i].FirstName + " " + data[i].LastName
        ));
      row.append($("<td>").text(address));
      row.append($("<td>").text(phone));
      row.append($("<td>").text(email));
      row.append(tddel);
      row.append(tdup);

      $("#contactbody").append(row);
    }

    //show the read section
    mask(false, true, false);

    //unplot the earlier markers
    for (i in mypins) {
      console.log("removing mypins[i]");
      mypins[i].unbindPopup();
      mapClient.removeLayer(mypins[i]);
    }

    //reset mypopus
    mypins = [];
    console.log("popups reset successful!!");

    //plot the updated map
    $(".tabledata").each(function () {
      plot($(this).data("details"));
    });

    //assign on click function to each table row
    $(".tabledata").click(function () {
      var lat = $(this).data("details").Latitude;
      var lon = $(this).data("details").Longitude;
      console.log(lat + ", " + lon);
      var ll = L.latLng(lat, lon);
      mapClient.flyTo(ll, 12);
    });
  });
}

function showUpdate() {
  mask(false, false, true);
}
//hide or display the sections from contacts.pug
function mask(create, read, updated) {
  //debugger
  create ? $("#create_page").show() : $("#create_page").hide();
  read ? $("#read_page").show() : $("#read_page").hide();
  updated ? $("#update_page").show() : $("#update_page").hide();
}
