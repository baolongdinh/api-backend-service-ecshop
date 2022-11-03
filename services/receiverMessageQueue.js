const amqp = require("amqplib/callback_api");
const sendCloudMessage = require("./sendCloudMessage")
var dateTime = require('node-datetime');
require('dotenv').config()
const RabbitMQ_URI = process.env.RabbitMQ_URI;

const receiveMessageQueue = (queue) => {
  amqp.connect(RabbitMQ_URI, (connError, connection) => {
    if (connError) {
      throw connError;
    }
    // Step 2: Create Channel
    connection.createChannel((channelError, channel) => {
      if (channelError) {
        throw channelError;
      }
      
      channel.assertQueue(queue);
      // Step 4: Receive Messages
      channel.consume(
        queue,
        (msg) => {
          console.log(`Message received: ${msg.content.toString()}`);
          var dt = dateTime.create();
          var dateTimeFormatted = dt.format('Y-m-d H:M:S');
          sendCloudMessage('Update Successfully', msg.content.toString(), dateTimeFormatted)
        },
        {
          noAck: true,
        }
      );
    });
  });
};

module.exports = receiveMessageQueue;
