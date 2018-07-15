const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const nanoid = require('nanoid');

server.listen(8080);

app.use(express.static('dist'));

const activeSessions = [];

io.on('connection', socket => {
  socket.on('error', err => {
    console.log(err);
  });

  socket.on('getUrl', (signal, replyWith) => {
    const id = nanoid();
    activeSessions.push({ [id]: { signal, socket } });
    replyWith(id);
  });

  socket.on('getInitiatorSignal', (url, replyWith) => {
    const session = activeSessions.find(
      element => Object.keys(element)[0] === url
    );
    replyWith(session === undefined ? '' : session[url].signal);
  });

  socket.on('sendReceiverSignal', (signalUrl, replyWith) => {
    const signal = signalUrl[0];
    const url = signalUrl[1];
    const session = activeSessions.find(
      element => Object.keys(element)[0] === url
    );

    if (session) {
      replyWith(true);
      session[url].socket.emit('getReceiverSignal', signal);
      session[url].socket.disconnect();
      activeSessions.splice(
        activeSessions.findIndex(element => Object.keys(element)[0] === url),
        1
      );
    } else {
      replyWith(false);
    }
  });
});
