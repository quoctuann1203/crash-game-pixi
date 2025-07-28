import { Application, Graphics, Sprite, Assets } from "pixi.js";

// UI Elements
const multiplierDisplay = document.getElementById("multiplier");
const betInput = document.getElementById("bet");
const nicknameInput = document.getElementById("nickname");
const countdownEl = document.getElementById("countdown");
const leaderboardList = document.getElementById("leaderboard-list");
const cashoutBtn = document.getElementById("cashout");
const autoCashOutInput = document.getElementById("auto-cashout");

const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");

startBtn.addEventListener("click", () => {
  startScreen.style.display = "none"; // Hide start screen
  startCountdown(); // Start the game countdown
});

// PIXI App
const app = new Application();
await app.init({
  resizeTo: document.getElementById("canvas-container"),
  background: "#111111",
});
document.getElementById("canvas-container").appendChild(app.canvas);

// === Load Background ===
const bgTexture = await Assets.load(
  "https://cdn.dribbble.com/userupload/12335909/file/original-66185e72722001cc894b7ade7fc5e04a.png"
);
const background = new Sprite(bgTexture);
background.width = app.screen.width;
background.height = app.screen.height;
app.stage.addChild(background);

// === Load Plane ===
const planeTexture = await Assets.load("https://pixijs.com/assets/bunny.png"); // replace with plane image
const plane = new Sprite(planeTexture);
plane.anchor.set(0.5);
plane.scale.set(0.1);
plane.visible = false;
app.stage.addChild(plane);

// === Load Plane Explosion ===
const fireTexture = await Assets.load("https://pixijs.com/assets/bunny.png"); // replace with explosion image
const planeFire = new Sprite(fireTexture);
planeFire.anchor.set(0.5);
planeFire.scale.set(0.1);
planeFire.visible = false;
app.stage.addChild(planeFire);

// === Draw Curve
const graphics = new Graphics();
app.stage.addChild(graphics);

// Game State Variables
let state = "waiting";
let multiplier = 1;
let crashPoint = 0;
let startTime = 0;
let bet = 0;
let curvePoints = [];
let leaderboard = [];
let countdown = 10;
let roundTimer;

function getRandomAvatarUrl() {
  const id = Math.floor(Math.random() * 70) + 1;
  return `https://i.pravatar.cc/40?img=${id}`;
}

function startRound() {
  if (!nicknameInput.value) {
    countdownEl.textContent = "⚠️ Please enter your nickname!";
    return;
  }

  bet = parseFloat(betInput.value) || 0;
  if (bet <= 0) {
    countdownEl.textContent = "⚠️ Bet must be > 0!";
    return;
  }

  state = "running";
  cashoutBtn.disabled = false;
  multiplier = 1;
  crashPoint = Math.min(30, Math.max(1.01, -Math.log(Math.random()) * 2));
  startTime = performance.now();
  curvePoints = [{ x: 0, y: app.screen.height / 2 }];

  graphics.clear();
  plane.visible = true;
  planeFire.visible = false;

  console.log("🎮 Game started. Crash at:", crashPoint.toFixed(2));
}

function endRound() {
  setTimeout(() => {
    state = "waiting";
    multiplier = 1;
    curvePoints = [];
    plane.visible = false;
    planeFire.visible = false;
    graphics.clear();

    startCountdown(); // Start next round countdown
  }, 2000);
}

function updateLeaderboard() {
  leaderboardList.innerHTML = leaderboard
    .slice(0, 10)
    .map(
      (entry, index) =>
        `<li class="flex items-center gap-2">
          <img src="${entry.avatar}" class="w-6 h-6 rounded-full" />
          <span>${entry.name}</span>
          <span class="ml-auto font-bold text-yellow-300">$${entry.score.toFixed(0)}</span>
        </li>`
    )
    .join("");
}

function addMultiplierToHistory(mult) {
  const historyEl = document.getElementById("history");
  const div = document.createElement("div");
  div.className = `px-2 py-1 rounded-full text-xs font-bold ${
    mult < 2 ? "bg-red-500" : mult < 10 ? "bg-yellow-400" : "bg-green-500"
  }`;
  div.textContent = `${mult.toFixed(2)}x`;
  historyEl.prepend(div);
  if (historyEl.children.length > 10)
    historyEl.removeChild(historyEl.lastChild);
}

cashoutBtn.onclick = () => {
  if (state !== "running") return;

  state = "cashed";
  const winnings = bet * multiplier;

  multiplierDisplay.textContent = `💰 Cashed out at ${multiplier.toFixed(2)}x = $${winnings.toFixed(2)}`;

  plane.visible = false;
  planeFire.visible = false;

  leaderboard.push({
    name: nicknameInput.value,
    avatar: getRandomAvatarUrl(),
    score: winnings,
  });
  leaderboard.sort((a, b) => b.score - a.score);
  updateLeaderboard();
  addMultiplierToHistory(multiplier);
  cashoutBtn.disabled = true;
  endRound();
};

function updatePlane() {
  if (state !== "running") return;

  const last = curvePoints[curvePoints.length - 1];
  const prev = curvePoints[curvePoints.length - 2] || last;

  plane.x = last.x;
  plane.y = last.y;
  plane.rotation = Math.atan2(last.y - prev.y, last.x - prev.x);
}

function drawCurve() {
  graphics.clear();
  graphics.lineStyle({ width: 2, color: 0x00ff00 });
  graphics.moveTo(curvePoints[0].x, curvePoints[0].y);
  for (let i = 1; i < curvePoints.length; i++) {
    graphics.lineTo(curvePoints[i].x, curvePoints[i].y);
  }

  const last = curvePoints[curvePoints.length - 1];
  graphics.beginFill(0xffff00);
  graphics.drawCircle(last.x, last.y, 8);
  graphics.endFill();
}

function checkAutoCashOut() {
  const autoValue = parseFloat(autoCashOutInput.value);
  if (!isNaN(autoValue) && multiplier >= autoValue && state === "running") {
    cashoutBtn.click();
  }
}

function updateGameLoop() {
  if (state === "running") {
    const elapsed = (performance.now() - startTime) / 1000;
    multiplier = Math.min(30, Math.pow(1.03, elapsed * 10));
    multiplierDisplay.textContent = `Multiplier: ${multiplier.toFixed(2)}x`;

    const last = curvePoints[curvePoints.length - 1];
    const newX = last.x + 2;
    const newY = app.screen.height / 2 - Math.pow(newX, 1.2) / 60;
    curvePoints.push({ x: newX, y: newY });

    if (multiplier >= crashPoint || newX > app.screen.width) {
      state = "crashed";
      multiplierDisplay.textContent = `💥 Crashed at ${multiplier.toFixed(2)}x!`;

      plane.visible = false;
      planeFire.visible = true;
      planeFire.x = plane.x;
      planeFire.y = plane.y;

      leaderboard.push({
        name: nicknameInput.value,
        avatar: getRandomAvatarUrl(),
        score: 0,
      });
      updateLeaderboard();
      addMultiplierToHistory(multiplier);

      endRound();
      return;
    }

    checkAutoCashOut();
    drawCurve();
    updatePlane();
  }
}

function startCountdown() {
  clearInterval(roundTimer);
  countdown = 10;
  countdownEl.textContent = `⏳ Next round in: ${countdown}s`;

  roundTimer = setInterval(() => {
    countdown--;
    countdownEl.textContent = `⏳ Next round in: ${countdown}s`;

    if (countdown <= 0) {
      clearInterval(roundTimer);
      startRound();
    }
  }, 1000);
}

app.ticker.add(updateGameLoop);
startCountdown();
