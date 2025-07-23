import { Application, Graphics, Sprite, Assets } from "pixi.js";

// UI Elements
const multiplierDisplay = document.getElementById("multiplier");
const betInput = document.getElementById("bet");
const startBtn = document.getElementById("start");
const cashoutBtn = document.getElementById("cashout");

// PIXI App
const app = new Application();
globalThis.__PIXI_APP__ = app;
await app.init({ resizeTo: window, background: "#111111" });
document.body.appendChild(app.canvas);

// === Background ===
const bgTexture = await Assets.load(
  "https://cdn.dribbble.com/userupload/12335909/file/original-66185e72722001cc894b7ade7fc5e04a.png"
);
const background = new Sprite(bgTexture);
background.width = app.screen.width;
background.height = app.screen.height;
app.stage.addChild(background);

// === Graphics for curve ===
const graphics = new Graphics();
app.stage.addChild(graphics);

// === Plane Sprite ===
const planeTexture = await Assets.load("/assets/airplane.png");
const plane = new Sprite(planeTexture);
plane.anchor.set(0.5);
plane.scale.set(0.1);
plane.visible = false;
app.stage.addChild(plane);

// === Plane Fire Sprite ===
const planeFireTexture = await Assets.load("/assets/air-accident.png");
const planeFire = new Sprite(planeFireTexture);
planeFire.anchor.set(0.5);
planeFire.scale.set(0.1);
planeFire.visible = false;
app.stage.addChild(planeFire);

// === Game State Variables ===
let state = "waiting";
let multiplier = 1;
let crashPoint = 0;
let startTime = 0;
let bet = 0;
let hasCashedOut = false;
let curvePoints = [];

// === Start Game ===
startBtn.onclick = () => {
  bet = parseFloat(betInput.value) || 0;
  if (bet <= 0 || state === "running") return;

  crashPoint = getCrashPoint();
  multiplier = 1;
  startTime = performance.now();
  hasCashedOut = false;
  state = "running";
  curvePoints = [{ x: 0, y: app.screen.height / 2 }];

  cashoutBtn.style.display = "inline-block";
  startBtn.disabled = true;
  betInput.disabled = true;
  plane.visible = true;
  planeFire.visible = false;

  console.log("🎯 Crash at:", crashPoint.toFixed(2), "x");
};

// === Cash Out ===
cashoutBtn.onclick = () => {
  if (state === "running") {
    state = "cashed";
    hasCashedOut = true;
    const winnings = bet * multiplier;
    multiplierDisplay.textContent = `💰 You cashed out at ${multiplier.toFixed(2)}x = ${winnings.toFixed(0)} $`;
    plane.visible = false;
    planeFire.visible = false;
    resetAfterDelay();
  }
};

// === Crash Point Generator ===
function getCrashPoint() {
  return Math.max(1.01, -Math.log(Math.random()) * 2); // 1.01–10x+
}

// === Multiplier Formula ===
function getMultiplier(t) {
  return Math.pow(1.0718, t * 10);
}

// === Game Loop ===
app.ticker.add(() => {
  if (state === "running") {
    const elapsed = (performance.now() - startTime) / 1000;
    multiplier = getMultiplier(elapsed);
    multiplierDisplay.textContent = `Multiplier: ${multiplier.toFixed(2)}x`;

    const last = curvePoints[curvePoints.length - 1];
    const newX = last.x + 2;
    const newY = app.screen.height / 2 - Math.pow(newX, 1.2) / 60;
    curvePoints.push({ x: newX, y: newY });

    if (multiplier >= crashPoint) {
      state = "crashed";
      multiplierDisplay.textContent = `💥 Crashed at ${multiplier.toFixed(2)}x!`;
      plane.visible = false;

      // Show fire plane
      const prev = curvePoints[curvePoints.length - 2] || last;
      const dx = last.x - prev.x;
      const dy = last.y - prev.y;
      planeFire.x = last.x;
      planeFire.y = last.y;
      planeFire.rotation = Math.atan2(dy, dx);
      planeFire.visible = true;

      resetAfterDelay();
    }

    drawCurve();
    updatePlane();
  }
});

// === Draw the curve ===
function drawCurve() {
  graphics.clear();
  graphics.lineStyle({ width: 1, color: 0x00ff00 });
  graphics.moveTo(curvePoints[0].x, curvePoints[0].y);
  for (let i = 1; i < curvePoints.length; i++) {
    graphics.lineTo(curvePoints[i].x, curvePoints[i].y);
  }

  const last = curvePoints[curvePoints.length - 1];
  graphics.beginFill(0xffff00);
  graphics.drawCircle(last.x, last.y, 10);
  graphics.endFill();
}

// === Update Plane Position ===
function updatePlane() {
  if (state === "running" && curvePoints.length > 1) {
    const last = curvePoints[curvePoints.length - 1];
    const prev = curvePoints[curvePoints.length - 2];

    plane.x = last.x;
    plane.y = last.y;

    const dx = last.x - prev.x;
    const dy = last.y - prev.y;
    plane.rotation = Math.atan2(dy, dx);
    plane.visible = true;
    planeFire.visible = false;
  }
}

// === Reset UI & State ===
function resetAfterDelay() {
  setTimeout(() => {
    state = "waiting";
    curvePoints = [];
    multiplier = 1;
    startBtn.disabled = false;
    betInput.disabled = false;
    cashoutBtn.style.display = "none";
    multiplierDisplay.textContent = "Multiplier: 1.00x";
    graphics.clear();
    plane.visible = false;
    planeFire.visible = false;
  }, 3000);
}
