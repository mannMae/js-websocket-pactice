// const messageList = document.querySelector('ul');
// const nickForm = document.querySelector('#nick');
// const messageForm = document.querySelector('#message');

// const socket = new WebSocket(`ws://${window.location.host}`);

// function makeMessage(type, payload) {
//   const msg = { type, payload };
//   return JSON.stringify(msg);
// }

// socket.addEventListener('open', () => {
//   console.log('Open');
// });

// socket.addEventListener('message', (message) => {
//   console.log(message);
//   const li = document.createElement('li');
//   li.innerText = message.data;
//   messageList.append(li);
// });

// socket.addEventListener('close', () => {
//   console.log('close');
// });

// function handleSubmit(e) {
//   e.preventDefault();
//   const input = messageForm.querySelector('input');
//   socket.send(makeMessage('new_message', input.value));
//   // const li = document.createElement('li');
//   // li.innerText = `You: ${input.value}`;
//   // messageList.append(li);
//   // input.value = '';
// }

// function handleNickSubmit(e) {
//   e.preventDefault();
//   const input = nickForm.querySelector('input');
//   socket.send(makeMessage('nickname', input.value));
//   input.value = '';
// }

// messageForm.addEventListener('submit', handleSubmit);
// nickForm.addEventListener('submit', handleNickSubmit);

const socket = io();

const welcome = document.getElementById('welcome');
const form = welcome.querySelector('form');
const room = document.getElementById('room');

room.hidden = true;

let roomName;

const addMessage = (message) => {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = message;
  ul.appendChild(li);
};

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector('h3');
  h3.innerText = `room : ${roomName}`;
  const msgForm = room.querySelector('#msg');
  const nameForm = room.querySelector('#name');
  msgForm.addEventListener('submit', handleMessageSubmit);
  nameForm.addEventListener('submit', handleNicknameSubmit);
};

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector('input');
  socket.emit('room', input.value, showRoom);
  roomName = input.value;
  input.value = '';
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#msg input');
  const value = input.value;
  socket.emit('new_message', value, roomName, addMessage(`You: ${value}`));
  input.value = '';
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#name input');
  const value = input.value;
  socket.emit('nickname', value);
  input.value = '';
}

form.addEventListener('submit', handleRoomSubmit);

socket.on('welcome', (name, userCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName} (${userCount})`;
  addMessage(`Someone joined! ${name}`);
});

socket.on('bye', (name, userCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName} (${userCount})`;
  addMessage(`someone left... ${name}`);
});

socket.on('new_message', addMessage);

socket.on('room_change', (rooms) => {
  const roomList = welcome.querySelector('ul');
  roomList.innerHTML = '';
  rooms.forEach((room) => {
    const li = document.createElement('li');
    li.innerText = room;
    roomList.append(li);
  });
});
