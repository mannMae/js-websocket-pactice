import http from 'http';
import WebSocket from 'ws';
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
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on('connection', (socket) => {
  sockets.push(socket);
  socket['nickname'] = '게스트';
  console.log('open');
  socket.on('close', () => console.log('close'));
  socket.on('message', (message) => {
    const parsedMsg = JSON.parse(message);
    if (parsedMsg.type === 'new_message') {
      sockets.forEach((s) =>
        s.send(`${socket.nickname}: ${parsedMsg.payload}`)
      );
    } else if (parsedMsg.type === 'nickname') {
      socket['nickname'] = parsedMsg.payload;
    }
  });
  socket.send('hello');
});

server.listen(3000, handleListen);
