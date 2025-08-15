const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
let gameRunning = true;

const plane = {
  x: 80,
  y: canvas.height / 2,
  width: 50,
  height: 40,
  velocity: 0,
  gravity: 0.6,
  lift: -10
};

function drawPlane() {
  ctx.fillStyle = '#ff5733';
  ctx.fillRect(plane.x, plane.y, plane.width, plane.height);
}

function update() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  plane.velocity += plane.gravity;
  plane.y += plane.velocity;

  if (plane.y + plane.height > canvas.height || plane.y < 0) {
    gameOver();
    return;
  }

  drawPlane();

  score++;
  document.getElementById('score').textContent = 'Score: ' + Math.floor(score / 10);

  requestAnimationFrame(update);
}

function fly() {
  plane.velocity = plane.lift;
}

function gameOver() {
  gameRunning = false;
  setTimeout(() => {
    alert('Game Over! Your score: ' + Math.floor(score / 10));
  }, 100);
}

function restartGame() {
  plane.y = canvas.height / 2;
  plane.velocity = 0;
  score = 0;
  gameRunning = true;
  update();
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') fly();
});

update();
