/*
 * @Author: Kaiser
 * @Date: 2020-07-06 06:30:16
 * @Last Modified by: Kaiser
 * @Last Modified time: 2020-07-13 14:16:38
 * @Description: socket
 */

let io;
let guestNumber = 1;
const nickNames = {};
const namesUsed = [];
const currentRoom = {};
const rooms = [];

exports.listen = function (server) {
  io = require('socket.io')(server);

  io.on('connection', function (socket) {
    // 访客姓名创建
    guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);

    // 加入聊天室
    joinRoom(socket, 'Lobby');
    // 处理用户信息
    handleMessageBroadcasting(socket, nickNames);
    // 处理名字变更
    handleNameChange(socket, nickNames, namesUsed);
    // 处理聊天室的变更
    handleRoomJoining(socket);

    // 监听rooms事件
    socket.on('rooms', function () {
      socket.emit('rooms', rooms);
    });

    // 断开连接之后的清理逻辑
    handleClientDisconnection(socket, nickNames, namesUsed);
  });
};

/**
 * 创建访客姓名
 * @param {*} socket
 * @param {*} guestNumber
 * @param {*} nickNames
 * @param {*} namesUsed
 */
function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
  const name = `Guest${guestNumber}`;
  nickNames[socket.id] = name;
  socket.emit('nameResult', { success: true, name });
  namesUsed.push(name);
  return guestNumber + 1;
}

/**
 * 加入房间
 * @param {*} socket
 * @param {*} room
 */
function joinRoom(socket, room) {
  socket.join(room);
  if (!rooms.includes(room)) {
    rooms.push(room);
  }
  currentRoom[socket.id] = room;
  socket.emit('joinResult', { room });
  // 广播这个房间中的其他用户, 有新用户加入
  socket.broadcast
    .to(room)
    .emit('message', { text: `${nickNames[socket.id]} has joined ${room}.` });
  io.sockets.in(room).clients((error, usersInRoom) => {
    if (error) throw error;
    if (usersInRoom.length > 1) {
      let usersInRoomSummary = `Users currently in ${room}: `;
      for (let index in usersInRoom) {
        var userSocketId = usersInRoom[index];
        if (userSocketId !== socket.id) {
          if (Number(index) > 0) {
            usersInRoomSummary += ', ';
          }
          usersInRoomSummary += nickNames[userSocketId];
        }
      }
      usersInRoomSummary += '.';
      socket.emit('message', { text: usersInRoomSummary });
    }
  });
}

/**
 * 处理昵称修改
 * @param {*} socket
 * @param {*} nicknames
 * @param {*} namesUsed
 */
function handleNameChange(socket, nickNames, namesUsed) {
  socket.on('changeName', function (name) {
    if (name.includes('Guest')) {
      socket.emit('nameResult', {
        success: false,
        message: 'Names cannot begin with "Guest".',
      });
      return;
    }
    if (namesUsed.includes(name)) {
      socket.emit('nameResult', {
        success: false,
        message: 'That name is already in use',
      });
      return;
    }
    const preiviewName = nickNames[socket.id];
    const previewNameIndex = namesUsed.indexOf(preiviewName);
    namesUsed.push(name);
    nickNames[socket.id] = name;
    delete namesUsed[previewNameIndex];
    socket.emit('nameResult', { success: true, name });
  });
}

/**
 * 当收到消息时分发消息
 * @param {*} socket
 */
function handleMessageBroadcasting(socket) {
  socket.on('message', function (message) {
    const { room } = message;
    // 往同一个房间中的用户发送消息
    // socket.broadcast.to(room).emit('message', {
    socket.to(room).emit('message', {
      text: `${nickNames[socket.id]}: ${message.text}`,
    });
  });
}

/**
 * 加入聊天室
 * 从已加入的聊天室中离开,再加入新的聊天室
 */
function handleRoomJoining(socket) {
  socket.on('join', (room) => {
    socket.leave(currentRoom[socket.id]);
    process.nextTick(() => {
      joinRoom(socket, room.newRoom);
    });
  });
}

function handleClientDisconnection(socket) {
  socket.on('discount', () => {
    const id = socket;
    const nameIndex = namesUsed.indexOf(nickNames[id]);
    namesUsed.splice(nameIndex, 1);
    delete nickNames[id];
  });
}
