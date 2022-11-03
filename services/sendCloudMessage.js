const FCM = require("fcm-node");
require("dotenv").config();

const sendCloudMessage = (title, body, time) => {
  var fcm = new FCM(process.env.SERVER_KEY);
  var message = {
    //this may vary according to the message type (single recipient, multicast, topic, et cetera)
    to: process.env.REGISTRATION_TOKEN,

    notification: {
      title: title,
      body: body,
    },

    data: {
      //you can send only notification or only data(or include both)
      time: time,
    },
  };

  fcm.send(message, function (err, response) {
    if (err) {
      console.log("Something has gone wrong!");
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
}

module.exports = sendCloudMessage


