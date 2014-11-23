(function() {


'use strict';

var nodemailer = require("nodemailer");
var mail = require('../private-mail.json');

var transporter = nodemailer.createTransport({ 
   host: mail.host,
   // secure: true,

   auth: {
       user: mail.user,
       pass: mail.password
   }
});

var mailOptions = {
   from: mail.from, // sender address
   to: mail.to, // comma separated list of receivers
   subject: "Hello Test", // Subject line
   text: "Hello world" // plaintext body
};

// transporter.sendMail(mailOptions, function(error, info) {
//    if (error) {
//        console.log(error);
//    }
//    else {
//        console.log("Message sent: " + info.response);
//    }
// });
function waitSeconds(seconds) {
  var currentDate = new Date();
  var targetDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    currentDate.getHours(),
    currentDate.getMinutes(),
    currentDate.getSeconds() - ((currentDate.getSeconds() % seconds)) + seconds,
    0,
    0
  );
  console.log('currentDate   = ' + currentDate);
  console.log('targetDate = ' + targetDate);
  console.log(targetDate - currentDate);
  var diff = targetDate - currentDate;
  setTimeout(function () {
    waitSeconds(seconds);
  }, diff);
}

function huhu() {
  console.log(new Date());
}

function waitMinutes(minutes, callback) {
  var currentDate = new Date();
  var targetDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    currentDate.getHours(),
    currentDate.getMinutes() - ((currentDate.getMinutes() % minutes)) + minutes,
    0,
    0,
    0
  );
  console.log('currentDate   = ' + currentDate);
  // console.log('targetDate = ' + targetDate);
  console.log(targetDate - currentDate);
  var diff = targetDate - currentDate;
  setTimeout(function () {
    // waitMinutes(minutes);
    callback();
    setInterval(callback, 120000);
  }, diff);
}

function waitHours(hours, callback) {
  var currentDate = new Date();
  var targetDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    currentDate.getHours() - ((currentDate.getHours() % hours)) + hours,
    0,
    0,
    0,
    0
  );
  console.log('currentDate   = ' + currentDate);
  // console.log('targetDate = ' + targetDate);
  console.log(targetDate - currentDate);
  var diff = targetDate - currentDate;
  setTimeout(function () {
    // waitMinutes(minutes);
    callback();
    setInterval(callback, 3600000);
  }, diff);
}

waitHours(1, huhu);


})();