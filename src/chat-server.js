import http from 'http';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';
import express from 'express';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const handleListen = () => console.log('Listening on http://localhost:3000');
// app.listen(3000, handleListen);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://admin.socket.io'],
    credentials: true,
  },
});

instrument(io, { auth: false });

function updatePublicRooms() {
  const sids = io.sockets.adapter.sids;
  const rooms = io.sockets.adapter.rooms;

  const publicRooms = [];

  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countUser(roomName) {
  return io.sockets.adapter.rooms.get(roomName)?.size;
}

io.on('connection', (socket) => {
  socket['nickname'] = 'Guest';
  socket.onAny((event) => {
    console.log(`Socket Event:${event}`);
  });

  socket.on('room', (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit('welcome', socket.nickname, countUser(roomName));
    io.sockets.emit('room_change', updatePublicRooms());
  });

  socket.on('disconnecting', () => {
    console.log('disconnecting!');
    socket.rooms.forEach((room) =>
      socket.to(room).emit('bye', socket.nickname, countUser(room) - 1)
    );
  });

  socket.on('disconnect', () => {
    io.sockets.emit('room_change', updatePublicRooms());
  });

  socket.on('new_message', (msg, room, done) => {
    socket.to(room).emit('new_message', `${socket.nickname}: ${msg}`);
    if (done) {
      done();
    }
  });

  socket.on('nickname', (nickname) => (socket['nickname'] = nickname));
});

// const wss = new WebSocket.Server({ server });

// const sockets = [];

// wss.on('connection', (socket) => {
//   sockets.push(socket);
//   socket['nickname'] = '게스트';
//   console.log('open');
//   socket.on('close', () => console.log('close'));
//   socket.on('message', (message) => {
//     const parsedMsg = JSON.parse(message);
//     console.log(parsedMsg);
//     if (parsedMsg.type === 'new_message') {
//       console.log(socket);
//       sockets.forEach((s) => {
//         if (s.nickname === socket.nickname) {
//           s.send(`YOU: ${parsedMsg.payload}`);
//         } else {
//           s.send(`${socket.nickname}: ${parsedMsg.payload}`);
//         }
//       });
//     } else if (parsedMsg.type === 'nickname') {
//       socket['nickname'] = parsedMsg.payload;
//     }
//   });
//   socket.send('hello');
// });

server.listen(3000, handleListen);
