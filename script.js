const TOTAL_BOTS = 1000000;
const VISIBLE_BOTS = 850;

const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California",
  "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
  "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

const botField = document.getElementById("botField");
const botCount = document.getElementById("botCount");
const stateLabel = document.getElementById("stateLabel");
const startButton = document.getElementById("startButton");

let bots = [];
let running = false;
let stateIndex = 0;
let celebrationTimer = null;

function randomPercent() {
  return Math.random() * 96 + 2;
}

function createBots() {
  botField.innerHTML = "";
  bots = [];

  for (let i = 0; i < VISIBLE_BOTS; i++) {
    const bot = document.createElement("span");

    bot.className = "bot";
    bot.style.left = `${randomPercent()}%`;
    bot.style.top = `${randomPercent()}%`;
    bot.style.animationDelay = `${Math.random() * 2}s`;
    bot.style.animationDuration = `${1.3 + Math.random() * 2.2}s`;

    botField.appendChild(bot);
    bots.push(bot);
  }
}

function updateBots() {
  const base = Math.floor(Math.random() * TOTAL_BOTS);

  bots.forEach((bot, index) => {
    const virtualId = (base + index) % TOTAL_BOTS;

    bot.dataset.id = virtualId + 1;

    bot.style.left = `${randomPercent()}%`;
    bot.style.top = `${randomPercent()}%`;
  });

  const displayedCount = Math.min(
    TOTAL_BOTS,
    Math.floor(TOTAL_BOTS * (0.08 + Math.random() * 0.92))
  );

  botCount.textContent = displayedCount.toLocaleString();
}

function updateState() {
  stateLabel.textContent =
    `${states[stateIndex]} — bots are celebrating with you`;

  stateIndex = (stateIndex + 1) % states.length;
}

function startCelebration() {
  if (running) return;

  running = true;
  document.body.classList.add("celebrating");

  startButton.textContent = "CELEBRATION LIVE ✦";

  botCount.textContent = TOTAL_BOTS.toLocaleString();

  updateState();

  celebrationTimer = setInterval(() => {
    updateBots();
    updateState();
  }, 2200);
}

createBots();

startButton.addEventListener("click", startCelebration);
