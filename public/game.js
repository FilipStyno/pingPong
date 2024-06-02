const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

let paddleWidth = 10, paddleHeight = 100;
let playerPaddle = { x: 10, y: canvas.height / 2 - paddleHeight / 2 };
let opponentPaddle = { x: canvas.width - paddleWidth - 10, y: canvas.height / 2 - paddleHeight / 2 };
let ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 10, speedX: 5, speedY: 5 };

const socket = io();

function drawRect(x, y, w, h, color) {
  context.fillStyle = color;
  context.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, r, 0, Math.PI * 2, false);
  context.closePath();
  context.fill();
}

function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  drawRect(playerPaddle.x, playerPaddle.y, paddleWidth, paddleHeight, 'blue');
  drawRect(opponentPaddle.x, opponentPaddle.y, paddleWidth, paddleHeight, 'red');
  drawCircle(ball.x, ball.y, ball.radius, 'green');
}

function update() {
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.speedY = -ball.speedY;
  }

  if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
    ball.speedX = -ball.speedX;
  }
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousemove', event => {
  let rect = canvas.getBoundingClientRect();
  let root = document.documentElement;
  let mouseY = event.clientY - rect.top - root.scrollTop;
  playerPaddle.y = mouseY - paddleHeight / 2;

  socket.emit('move', { y: playerPaddle.y });
});

socket.on('opponentMove', data => {
  opponentPaddle.y = data.y;
});

socket.on('ballUpdate', data => {
  ball.x = data.x;
  ball.y = data.y;
});

gameLoop();
