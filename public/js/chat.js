/*
 * @Author: Kaiser
 * @Date: 2020-07-05 19:26:58
 * @Last Modified by: Kaiser
 * @Last Modified time: 2020-07-13 12:01:38
 * @Description:
 */

function Chat(socket) {
  this.socket = socket;
}

Chat.prototype.sendMessage = function (room, text) {
  this.socket.emit('message', { room, text });
};

Chat.prototype.changeRoom = function (room) {
  this.socket.emit('join', { newRoom: room });
};

Chat.prototype.changeName = function (name) {
  this.socket.emit('changeName', name);
};

Chat.prototype.processCommand = function (command) {
  var words = command.split(' ');
  var command = words[0].substring(1, words[0].length).toLowerCase();
  var message = false;
  switch (command) {
    case 'join':
      words.shift();
      room = words.join(' ');
      this.changeRoom(room);
      break;
    case 'nick':
      words.shift();
      var name = words.join(' ');
      this.changeName(name);
      break;
    default:
      message = 'Unrecognized command.';
      break;
  }
  return message;
};

const socket = io.connect();

window.onload = function () {
  const chatApp = new Chat(socket);

  socket.on('nameResult', function (result) {
    let message;
    if (result.success) {
      message = `You are now know as ${result.name}.`;
    } else {
      message = result.message;
    }
    addMessages(divSystemContentElement(message));
  });

  socket.on('joinResult', function (result) {
    getDOM('#room').innerText = result.room;
    addMessages(divSystemContentElement('Room changed.'));
  });

  socket.on('message', function (message) {
    addMessages(divEscapedContentElement(message.text));
  });

  socket.on('rooms', function (rooms) {
    const domOfRoomList = getDOM('#room-list');
    domOfRoomList.innerHTML = '';
    rooms.forEach((room) => {
      if (room !== '') {
        const div = divEscapedContentElement(room);
        div.addEventListener('click', (event) => {
          chatApp.processCommand(`/join ${event.target.innerText}`);
          getDOM('#send-message').focus();
        });
        domOfRoomList.appendChild(div);
      }
    });
  });

  setInterval(() => {
    socket.emit('rooms');
  }, 1000);

  getDOM('#send-message').focus();

  getDOM('#send-button').addEventListener('click', (event) => {
    processUserInput(chatApp, socket);
    event.preventDefault();
  });
};
