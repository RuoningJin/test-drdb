const http = require("http");
const app = require("./app");
require("dotenv").config();

const port = process.env.port || 3000;

const server = http.createServer(app);

const Server = server.listen(port, function () {
  console.log("Listening to port " + port);
});

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

let connections = [];

Server.on('connection', connection => {
  connections.push(connection);
  connection.on('close', () => connections = connections.filter(curr => curr !== connection));
});

function shutDown() {
  console.log('Received kill signal, shutting down gracefully');
  Server.close(() => {
    console.log('Closed out remaining connections');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);

  connections.forEach(curr => curr.end());
  setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
}

// to track the list of families that has been contacted.
var familyList = [];
var clientList = [];

// Send reminder emails to parents the day before their appointment
var cron = require('node-cron');

const ReminderController = require("./api/controllers/reminder");

cron.schedule('0 18 * * *', async (req, res) => {

  ReminderController.reminderEmail();

  // console.log(resonse);

});

const FamilyController = require("./api/controllers/family");

cron.schedule('0 9 * * *', async (req, res) => {

  FamilyController.releaseFamily();

});


const ChildController = require("./api/controllers/child");

cron.schedule('5 0 * * *', async (req, res) => {

  ChildController.updateAge();
  familyList = [];

});

var familyList = [];
var clientList = [];
const io = require("socket.io")(server);

io.on("connection", (socket) => {

  console.log(socket.id + '  connected!')
  clientList.push(socket.id)

  socket.emit('familyList update', familyList)

  socket.on('add family', familyId => {

    if (!familyList.includes(familyId)) {
      familyList.push(familyId)
      io.emit('familyList update', familyList)
    }

  })

  socket.on('remove family', familyId => {

    if (familyList.includes(familyId)) {
      const index = familyList.indexOf(familyId)
      familyList.splice(index, 1)
      io.emit('familyList update', familyList)
    }

  })

  socket.on("disconnect", () => {
    console.log(socket.id + "user disconnected");
    const index = clientList.indexOf(socket.id)
    clientList.splice(index, 1)
    if (clientList.length == 0) {
      console.log('no body left.')
      familyList = [];
    }
  });
});
