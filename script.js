// ===== 基础配置 =====
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");
const statusEl = document.getElementById("status");

// 每个格子的像素大小
const cellSize = 21;
// 棋盘行列数（420 / 21 = 20）
const gridCount = canvas.width / cellSize;

// 游戏速度（毫秒），数值越小越快
const speed = 120;

// 从本地存储读取最高分
let bestScore = Number(localStorage.getItem("snake_best_score") || 0);
bestScoreEl.textContent = bestScore;

// ===== 游戏状态 =====
let snake;
let direction;
let nextDirection;
let food;
let score;
let timer = null;
let isRunning = false;
let isGameOver = false;

// 初始化或重置游戏
function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  food = randomFood();
  score = 0;
  isGameOver = false;
  scoreEl.textContent = score;
  statusEl.textContent = "按空格键开始游戏";
  draw();
}

// 生成不与蛇身重叠的食物
function randomFood() {
  while (true) {
    const point = {
      x: Math.floor(Math.random() * gridCount),
      y: Math.floor(Math.random() * gridCount),
    };

    const overlap = snake?.some((part) => part.x === point.x && part.y === point.y);
    if (!overlap) return point;
  }
}

// 开始游戏循环
function startGame() {
  if (isRunning) return;

  if (isGameOver) {
    resetGame();
  }

  isRunning = true;
  statusEl.textContent = "游戏进行中...";
  timer = setInterval(tick, speed);
}

// 游戏结束
function gameOver() {
  isRunning = false;
  isGameOver = true;
  clearInterval(timer);
  timer = null;
  statusEl.textContent = "游戏结束！按空格键重新开始";
}

// 每一帧更新逻辑
function tick() {
  direction = nextDirection;

  const head = snake[0];
  const newHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };

  // 撞墙检测
  if (newHead.x < 0 || newHead.x >= gridCount || newHead.y < 0 || newHead.y >= gridCount) {
    gameOver();
    draw();
    return;
  }

  // 撞到自己检测
  const hitSelf = snake.some((part) => part.x === newHead.x && part.y === newHead.y);
  if (hitSelf) {
    gameOver();
    draw();
    return;
  }

  snake.unshift(newHead);

  // 吃到食物
  if (newHead.x === food.x && newHead.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    food = randomFood();

    // 更新最高分
    if (score > bestScore) {
      bestScore = score;
      bestScoreEl.textContent = bestScore;
      localStorage.setItem("snake_best_score", String(bestScore));
    }
  } else {
    // 没吃到则移除尾巴，保持长度
    snake.pop();
  }

  draw();
}

// 绘制棋盘、蛇和食物
function draw() {
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制背景网格
  ctx.fillStyle = "#0b1020";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = 1;

  for (let i = 0; i <= gridCount; i++) {
    const p = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(canvas.width, p);
    ctx.stroke();
  }

  // 绘制食物
  ctx.fillStyle = "#f97316";
  roundRect(food.x * cellSize + 2, food.y * cellSize + 2, cellSize - 4, cellSize - 4, 6);
  ctx.fill();

  // 绘制蛇
  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? "#22c55e" : "#16a34a";
    roundRect(part.x * cellSize + 1.5, part.y * cellSize + 1.5, cellSize - 3, cellSize - 3, 6);
    ctx.fill();
  });
}

// 绘制圆角矩形路径
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// 键盘控制
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  // 空格：开始或重开
  if (key === " ") {
    event.preventDefault();
    startGame();
    return;
  }

  // 方向映射
  const map = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
  };

  const newDir = map[key];
  if (!newDir) return;

  // 防止在同一帧直接反向（例如向右时不能立刻向左）
  const reverse = direction.x + newDir.x === 0 && direction.y + newDir.y === 0;
  if (!reverse) {
    nextDirection = newDir;
  }

  // 方向键按下也可自动开始
  if (!isRunning && !isGameOver) {
    startGame();
  }
});

resetGame();
