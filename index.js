const app = require("./app");

const http = require("http");

const server = http.createServer(app);
server.listen(5115, () => {
  console.log("server started at port 5115");
});

module.exports = server;
