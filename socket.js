/*
 * @Author: Kaiser
 * @Date: 2020-07-14 11:10:35
 * @Last Modified by: Kaiser
 * @Last Modified time: 2020-07-14 11:12:37
 * @Description:
 */

const net = require('net');

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    socket.write(data);
  });
});

server.listen(9000);
