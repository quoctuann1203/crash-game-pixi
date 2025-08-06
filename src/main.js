import {
  Application,
  Assets,
  Graphics,
  Sprite,
  Texture,
  AnimatedSprite,
  Container,
  ParticleContainer,
} from "pixi.js";

// UI
const multiplierDisplay = document.getElementById("multiplier");
// const betInput = document.getElementById("bet");
const cashoutBtn = document.getElementById("cashout");
// const autoCashOutInput = document.getElementById("auto-cashout");

const betDisplay = document.getElementById("bet-amount");
const autoCashOutToggle = document.getElementById("auto-cashout-toggle");
const autoPlayToggle = document.getElementById("auto-play-toggle");

const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const betUI = document.getElementById("bet-ui");
const betBtn = document.getElementById("place-bet");
cashoutBtn.style.display = "none"; // hide cashout by default

// Start Game Button
startBtn.onclick = () => {
  startScreen.style.display = "none";
  betUI.style.display = "flex"; // Show the bet UI
  startCountdown();
};

// Init PIXI App
const app = new Application();
globalThis.__PIXI_APP__ = app;
await app.init({
  resizeTo: document.getElementById("canvas-container"),
  background: "#111111",
});
document.getElementById("canvas-container").appendChild(app.canvas);

// Background
const bgTexture = await Assets.load("../public/assets/background-univer.jpg");
const background = new Sprite(bgTexture);
background.width = app.screen.width;
background.height = app.screen.height;
app.stage.addChild(background);

// Fighter Rocket Animation from spritesheet
await Assets.load("https://pixijs.com/assets/spritesheet/fighter.json");
const rocketFrames = [];
for (let i = 0; i < 30; i++) {
  const num = i < 10 ? `0${i}` : i;
  rocketFrames.push(Texture.from(`rollSequence00${num}.png`));
}
const rocket = new AnimatedSprite(rocketFrames);
rocket.anchor.set(0.5);
rocket.scale.set(0.5);
rocket.animationSpeed = 0.5;
rocket.visible = false;
app.stage.addChild(rocket);

// Load explosion spritesheet
await Assets.load("https://pixijs.com/assets/spritesheet/mc.json");

const explosionFrames = [];
for (let i = 0; i < 26; i++) {
  // assuming explosion has 26 frames
  const num = i < 10 ? `0${i}` : i;
  explosionFrames.push(Texture.from(`Explosion_Sequence_A ${i + 1}.png`));
}

const explosion = new AnimatedSprite(explosionFrames);
explosion.anchor.set(0.5);
explosion.scale.set(1.2);
explosion.animationSpeed = 0.4;
explosion.loop = false;
explosion.visible = false;
app.stage.addChild(explosion);

// Curve graphics
const graphics = new Graphics();
app.stage.addChild(graphics);

// Particle container for rocket trail particles
const particleContainer = new Container();
app.stage.addChild(particleContainer);

// State
let state = "waiting";
let multiplier = 1;
let crashPoint = 0;
let startTime = 0;
let bet = 15;
let curvePoints = [];
let countdown = 10;
let roundTimer = null;
let hasBetted = false;
let userBalance = 1000;
const userBalanceEl = document.getElementById("user-balance");

function updateBalanceDisplay() {
  userBalanceEl.textContent = `$${userBalance.toFixed(2)}`;
}

const multiplier3dEl = document
  .getElementById("multiplier-3d")
  .querySelector("p");

// update 3d multiplier text
multiplier3dEl.textContent = `${multiplier.toFixed(2)}x`;

document.getElementById("increase-bet").onclick = () => {
  bet += 1;
  betDisplay.textContent = `$${bet}`;
};

document.getElementById("decrease-bet").onclick = () => {
  bet = Math.max(0, bet - 1);
  betDisplay.textContent = `$${bet}`;
};

document.querySelectorAll("[data-preset]").forEach((btn) => {
  btn.onclick = () => {
    bet = parseInt(btn.dataset.preset);
    betDisplay.textContent = `$${bet}`;
  };
});

document.getElementById("place-bet").onclick = () => {
  // Optional: trigger start screen manually or auto
  startScreen.style.display = "none";
  startCountdown();
};

// Rocket trail particles array
const particles = [];

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

function setCashoutState(enabled) {
  cashoutBtn.disabled = !enabled;
  cashoutBtn.style.opacity = enabled ? "1" : "0.5";
  cashoutBtn.style.pointerEvents = enabled ? "auto" : "none"; // prevent clicks
}

function setBetButtonState(enabled, label = "Bet") {
  betBtn.disabled = !enabled;
  betBtn.style.opacity = enabled ? "1" : "0.5";
  betBtn.style.pointerEvents = enabled ? "auto" : "none";
  betBtn.textContent = label;
}

function generateCrashMultiplier() {
  const fairness = 3;
  const r = Math.random();
  const crash = Math.max(1.2, 1 + Math.pow(r, fairness) * 29);
  return crash;
}

function startRound() {
  state = "running";

  // Swap buttons
  betBtn.style.display = "none";
  cashoutBtn.style.display = "block";

  // Enable only if the user has placed a bet
  setCashoutState(hasBetted);

  document.getElementById("big-countdown").classList.add("hidden");
  document.getElementById("multiplier").classList.remove("hidden");

  multiplier = 1;
  crashPoint = generateCrashMultiplier();
  startTime = performance.now();
  curvePoints = [{ x: 0, y: app.screen.height }];
  graphics.clear();

  rocket.visible = true;
  rocket.x = 0;
  rocket.y = app.screen.height / 2;
  rocket.play();

  particles.length = 0;
  particleContainer.removeChildren();
}

function endRound() {
  setTimeout(() => {
    state = "waiting";
    multiplier = 1;
    curvePoints = [];
    rocket.visible = false;
    rocket.stop();
    graphics.clear();
    particles.length = 0;
    particleContainer.removeChildren();

    // Reset state
    hasBetted = false;

    // Restore Bet button to enabled & visible
    betBtn.style.display = "block";
    setBetButtonState(true, "Bet");

    // Hide Cash Out & reset style
    cashoutBtn.style.display = "none";
    cashoutBtn.style.opacity = "0.5";

    const isAutoPlay = autoPlayToggle.checked;
    if (isAutoPlay) {
      placeBet();
    } else {
      startCountdown();
    }
  }, 2000);
}

function placeBet() {
  hasBetted = true;
  userBalance -= bet;
  updateBalanceDisplay();
  console.log(`Bet placed: $${bet}`);

  // Disable Bet button (make it dimmed & unclickable)
  setBetButtonState(false, "Betted");

  // Ensure Cash Out is disabled until round starts
  setCashoutState(false);

  startScreen.style.display = "none";
  startCountdown();
}

document.getElementById("place-bet").onclick = placeBet;

cashoutBtn.onclick = () => {
  if (state !== "running") return;
  state = "cashed";

  const winnings = bet * multiplier;
  userBalance += winnings;
  updateBalanceDisplay();
  multiplierDisplay.textContent = `💰 Cashed at ${multiplier.toFixed(
    2
  )}x = $${winnings.toFixed(2)}`;

  multiplierDisplay.style.color = "#FFD700"; // Gold color
  multiplierDisplay.style.transform = "scale(1.5)";
  multiplierDisplay.style.transition = "transform 0.5s ease, color 0.5s ease";

  setTimeout(() => {
    multiplierDisplay.style.transform = "scale(1)";
    multiplierDisplay.style.color = "#ffffff";
  }, 800);

  rocket.visible = false;

  addMultiplierToHistory(multiplier);
  cashoutBtn.disabled = true;
  endRound();
};

function checkAutoCashOut() {
  const isAutoCashoutEnabled = autoCashOutToggle.checked;
  if (isAutoCashoutEnabled && multiplier >= 2.0 && state === "running") {
    cashoutBtn.click();
  }
}

function drawCurve() {
  graphics.clear();

  if (curvePoints.length === 0) return;

  // Start a new path explicitly
  graphics.lineStyle(4, 0x00ff00, 0.8);
  graphics.moveTo(curvePoints[0].x, curvePoints[0].y);

  graphics.beginFill(0x00ff00, 0); // color doesn't matter, alpha = 0 makes it invisible
  graphics.lineStyle(4, 0x00ff00, 0.8);
  graphics.moveTo(curvePoints[0].x, curvePoints[0].y);

  for (let i = 1; i < curvePoints.length; i++) {
    graphics.lineTo(curvePoints[i].x, curvePoints[i].y);
  }

  graphics.endFill(); // closes the path, but it's fully transparent
}

// Rocket trail particle system
function emitParticle() {
  const particle = new Graphics();
  const size = 3 + Math.random() * 2;
  particle.beginFill(0xffaa00, 0.7);
  particle.drawCircle(0, 0, size);
  particle.endFill();
  particle.x = rocket.x - rocket.width / 2; // behind rocket
  particle.y = rocket.y + (Math.random() * 10 - 5); // jitter Y a bit
  particle.alpha = 1;
  particle.scale.set(1);
  particleContainer.addChild(particle);

  particles.push({
    gfx: particle,
    life: 30 + Math.random() * 20, // frames
    vx: -1 - Math.random() * 1, // move left
    vy: (Math.random() - 0.5) * 0.5,
  });
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life--;
    if (p.life <= 0) {
      particleContainer.removeChild(p.gfx);
      particles.splice(i, 1);
      continue;
    }
    // Move particle
    p.gfx.x += p.vx;
    p.gfx.y += p.vy;
    // Fade out
    p.gfx.alpha = p.life / 50;
    // Shrink
    p.gfx.scale.set(p.gfx.alpha);
  }
}

function updateRocket() {
  const last = curvePoints[curvePoints.length - 1];
  const prev = curvePoints[curvePoints.length - 2] || last;

  rocket.x = last.x;
  rocket.y = last.y;
  rocket.rotation = Math.atan2(last.y - prev.y, last.x - prev.x);
}

function updateGameLoop() {
  if (state !== "running") return;

  const elapsed = (performance.now() - startTime) / 1000;
  multiplier = Math.min(30, Math.pow(1.03, elapsed * 6));
  multiplierDisplay.textContent = `Multiplier: ${multiplier.toFixed(2)}x`;

  const last = curvePoints[curvePoints.length - 1];
  const newX = last.x + 1;

  // Parabola mapped from bottom-left to top-right
  const progress = newX / app.screen.width; // 0 to 1
  // const newY = app.screen.height * (1 - Math.pow(progress, 4));
  const newY = app.screen.height - Math.pow(progress, 1.6) * app.screen.height;

  curvePoints.push({ x: newX, y: newY });

  if (multiplier >= crashPoint || newX > app.screen.width) {
    state = "crashed";
    multiplierDisplay.textContent = `💥 Crashed at ${multiplier.toFixed(2)}x!`;

    // Hide rocket & show explosion
    rocket.visible = false;
    explosion.x = rocket.x;
    explosion.y = rocket.y;
    explosion.visible = true;
    explosion.gotoAndPlay(0);

    // Hide explosion after it finishes
    explosion.onComplete = () => {
      explosion.visible = false;
    };

    addMultiplierToHistory(multiplier);
    endRound();
    return;
  }

  checkAutoCashOut();
  drawCurve();
  updateRocket();

  // Emit rocket trail particles each frame (limit rate)
  if (Math.random() < 0.6) {
    emitParticle();
  }
  updateParticles();
}

function startCountdown() {
  clearInterval(roundTimer);
  countdown = 5;

  // Show countdown big text, hide multiplier big text
  document.getElementById("big-countdown").classList.remove("hidden");
  document.getElementById("multiplier").classList.add("hidden");

  // Set initial countdown text
  document.getElementById("big-countdown").textContent = countdown;

  // Show Bet UI with animation
  // betUI.classList.remove("hidden", "disabled");

  roundTimer = setInterval(() => {
    countdown--;
    document.getElementById("big-countdown").textContent = countdown;
    if (countdown <= 0) {
      clearInterval(roundTimer);
      startRound();
    }
  }, 1000);
}

// Start game loop
app.ticker.add(updateGameLoop);
