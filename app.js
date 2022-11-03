const express = require("express");
const app = express();
const receiveMessageQueue = require("./services/receiverMessageQueue")

require('dotenv').config()

const QUEUE = 'admin_notify'

receiveMessageQueue(QUEUE)






module.exports = app;