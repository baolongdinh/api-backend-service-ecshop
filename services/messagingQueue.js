const amqp = require('amqplib/callback_api');

const RabbitMQ_URI= 'amqp://localhost';

const messageQueue =  (queue, data) =>{

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
        // Step 4: Send message to queue
        channel.sendToQueue(queue, Buffer.from(data));
        console.log(`Message send ${queue}`);
    })

    })
}

module.exports = messageQueue
