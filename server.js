/*
 * @Author: Kaiser
 * @Date: 2020-07-05 11:34:44
 * @Last Modified by: Kaiser
 * @Last Modified time: 2020-07-08 16:17:18
 * @Description: 服务器启动文件
 */

const http = require('http');
const mime = require('mime');
const fs = require('fs');

const chatServer = require('./lib/chat_server');

const port = 9000;

const rootPathOfStaticResource = './public';

const server = http.createServer((req, res) => {
  const { url } = req;
  let absoluteFilePath = `${rootPathOfStaticResource}/index.html`;
  if (url !== '/') {
    absoluteFilePath = `${rootPathOfStaticResource}${url}`;
  }
  staticResourceService(res, absoluteFilePath);
});

chatServer.listen(server);

server.listen(port, () => {
  console.log(`Server is Running on ${port}!`);
});

const cache = {};
/**
 * 通过绝对路径获取静态文件缓存
 */
function getFile(absoluteFilePath) {
  if (!absoluteFilePath.startsWith(rootPathOfStaticResource)) {
    absoluteFilePath = `${rootPathOfStaticResource}${absoluteFilePath}`;
  }
  console.log('文件路径: ', absoluteFilePath);
  return new Promise((resolve, reject) => {
    if (!absoluteFilePath) {
      reject({ msg: 'Wrong file path' });
      return;
    }
    let fileContent = cache[absoluteFilePath];
    if (cache[absoluteFilePath]) {
      resolve(fileContent);
      return;
    }
    fs.readFile(absoluteFilePath, (err, fileContent) => {
      if (err) {
        reject(err);
        return;
      }
      const file = { fileContent, contentType: mime.getType(absoluteFilePath) };
      saveFileCache(absoluteFilePath, file);
      resolve(file);
    });
  });
}

/**
 * 通过绝对路径保存静态文件缓存
 */
function saveFileCache(absoluteFilePath, { fileContent, contentType }) {
  process.nextTick(() => {
    cache[absoluteFilePath] = { fileContent, contentType };
  });
}
/**
 * 静态资源服务
 */
function staticResourceService(res, absoluteFilePath) {
  // 若文件存在
  if (fs.existsSync(absoluteFilePath)) {
    getFile(absoluteFilePath).then(
      ({ contentType, fileContent }) => {
        res.writeHead(200, { 'Content-Type': `${contentType};charset=utf-8` });
        res.end(fileContent);
      },
      (err) => {
        console.log(err);
        getFile('/500.html').then(({ contentType, fileContent }) => {
          res.writeHead(500, {
            'Content-Type': `${contentType};charset=utf-8`,
          });
          res.end(fileContent);
        });
      }
    );
    return;
  }
  send404(res);
}

function send404(res) {
  getFile('/404.html').then(({ contentType, fileContent }) => {
    res.writeHead(404, {
      'Content-Type': `${contentType};charset=utf-8`,
    });
    res.end(fileContent);
  });
}
