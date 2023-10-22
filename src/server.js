import http from 'http';
import SocketIO from 'socket.io';
import express from 'express';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/'));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

let users = {};

wsServer.on('connection', (socket) => {
  socket.on('join_room', (roomName) => {
    if (users.roomName >= 1) {
      roomName = roomName + Number(users?.roomName / 2);
      socket.join(roomName);
      socket.to(roomName).emit('welcome');
    } else {
      console.log(roomName);
      socket.join(roomName);
      socket.to(roomName).emit('welcome');
    }
    users.roomName = users?.roomName === undefined ? 0 : 1;
  });
  socket.on('offer', (offer, roomName) => {
    socket.to(roomName).emit('offer', offer);
  });
  socket.on('answer', (answer, roomName) => {
    socket.to(roomName).emit('answer', answer);
  });
  socket.on('ice', (ice, roomName) => {
    socket.to(roomName).emit('ice', ice);
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
