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

  console.log('open');
  socket.on('close', () => console.log('close'));
  socket.on('message', (message) => {
    sockets.forEach((s) => s.send(`${message}`));
    console.log(typeof message);
    console.log(Object.keys(message));
    console.log(Object.values(message));
    console.log(`message : ${message}`);
  });
  socket.send('hello');
});

server.listen(3000, handleListen);
