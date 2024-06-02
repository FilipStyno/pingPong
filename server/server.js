const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let rooms = {}; // Room storage

function findAvailableRoom() {
  for (let room in rooms) {
    if (rooms[room].players.length < 2) {
      return room;
    }
  }
  const newRoom = `room-${Object.keys(rooms).length + 1}`;
  rooms[newRoom] = { players: [], ball: { x: 400, y: 300, radius: 10, speedX: 5, speedY: 5 } };
  return newRoom;
}

function updateBallPosition(ball) {
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  if (ball.y + ball.radius > 600 || ball.y - ball.radius < 0) {
    ball.speedY = -ball.speedY;
  }

  if (ball.x - ball.radius < 0 || ball.x + ball.radius > 800) {
    ball.speedX = -ball.speedX;
  }
}

io.on('connection', socket => {
  console.log('New player connected:', socket.id);

  const room = findAvailableRoom();
  socket.join(room);
  rooms[room].players.push(socket.id);

  console.log(`Player ${socket.id} joined ${room}`);

  socket.emit('roomJoined', { room });

  if (rooms[room].players.length === 2) {
    io.to(room).emit('startGame');

    // Start ball update interval for the room
    if (!rooms[room].intervalId) {
      rooms[room].intervalId = setInterval(() => {
        updateBallPosition(rooms[room].ball);
        io.to(room).emit('ballUpdate', rooms[room].ball);
      }, 1000 / 60);
    }
  } else {
    socket.emit('waitingForPlayer');
  }

  socket.on('move', data => {
    socket.to(room).emit('opponentMove', data);
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    rooms[room].players = rooms[room].players.filter(id => id !== socket.id);
    socket.to(room).emit('playerDisconnected');

    if (rooms[room].players.length === 0) {
      clearInterval(rooms[room].intervalId);
      delete rooms[room];
    }
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
