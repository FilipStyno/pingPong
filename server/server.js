const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let ball = { x: 400, y: 300, radius: 10, speedX: 5, speedY: 5 };

io.on('connection', socket => {
  console.log('New player connected:', socket.id);

  socket.on('move', data => {
    socket.broadcast.emit('opponentMove', data);
  });

  setInterval(() => {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    if (ball.y + ball.radius > 600 || ball.y - ball.radius < 0) {
      ball.speedY = -ball.speedY;
    }

    if (ball.x - ball.radius < 0 || ball.x + ball.radius > 800) {
      ball.speedX = -ball.speedX;
    }

    io.emit('ballUpdate', ball);
  }, 1000 / 60);
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
