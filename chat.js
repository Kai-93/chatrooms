/*
 * @Author: Kaiser
 * @Date: 2020-07-14 11:10:35
 * @Last Modified by: Kaiser
 * @Last Modified time: 2020-07-14 21:32:31
 * @Description:
 */
const EventEmitter = require('events');
const net = require('net');
const channel = new EventEmitter();

channel.clients = [];
channel.subscriptions = {};

channel.on('join', (id, client) => {
  channel.clients.push({
    client,
    id,
  });
});

channel.on('broadcast', (id, msg) => {
  channel.clients.forEach((item) => {
    if (id !== item.id) {
      item.client.write(`${id}: ${msg}`);
    }
  });
});

const server = net.createServer((client) => {
  const id = `${client.remoteAddress}:${client.remotePort}`;
  channel.emit('join', id, client);

  client.on('connect', () => {
    console.log('connect');
  });
  client.on('data', (data) => {
    channel.emit('broadcast', id, data.toString());
  });
});

server.listen(9000);
