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

transporter.sendMail(mailOptions, function(error, info) {
   if (error) {
       console.log(error);
   }
   else {
       console.log("Message sent: " + info.response);
   }
});

})();