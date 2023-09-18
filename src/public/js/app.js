const messageList = document.querySelector('ul');
const messageForm = document.querySelector('form');

const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener('open', () => {
  console.log('Open');
});

socket.addEventListener('message', (message) => {
  console.log(message);
  console.log(`message : ${message.data}`);
});

socket.addEventListener('close', () => {
  console.log('close');
});

function handleSubmit(e) {
  e.preventDefault();
  const input = messageForm.querySelector('input');
  socket.send(input.value);
  input.value = '';
}

messageForm.addEventListener('submit', handleSubmit);
