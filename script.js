/* =========================================================
   BRMMONEY — REAL BRM FAN NETWORK
   Supabase + ONE BAND ONE SOUND
   ========================================================= */

const SUPABASE_URL = "https://ekkfgzisheokzrdaypef.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_QmjZOgMtIH9G9dpx-Setsw_zC6TORvI";

const TOTAL_FAN_GOAL = 1000000;
const VISIBLE_FANS = 850;
const FAN_TIMEOUT_SECONDS = 45;

/* Load Supabase */
const supabaseScript = document.createElement("script");
supabaseScript.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
document.head.appendChild(supabaseScript);

let supabase = null;
let fanSessionId = null;
let heartbeatTimer = null;
let fanCountTimer = null;
let running = false;

const botField = document.getElementById("botField");
const botCounter = document.getElementById("botCounter");
const stateName = document.getElementById("stateName");
const stateMessage = document.getElementById("stateMessage");
const startCelebration = document.getElementById("startCelebration");

const states = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming"
];

/* =========================================================
   VISUAL FAN FIELD
   ========================================================= */

let fans = [];

function randomPercent() {
  return Math.random() * 96 + 2;
}

function createFans() {
  if (!botField) return;

  botField.innerHTML = "";
  fans = [];

  for (let i = 0; i < VISIBLE_FANS; i++) {
    const fan = document.createElement("span");

    fan.className = "bot";

    fan.style.left = `${randomPercent()}%`;
    fan.style.top = `${randomPercent()}%`;

    fan.style.animationDelay =
      `${Math.random() * 2}s`;

    fan.style.animationDuration =
      `${1.3 + Math.random() * 2.2}s`;

    botField.appendChild(fan);
    fans.push(fan);
  }
}

function animateFans() {
  fans.forEach((fan) => {
    fan.style.left = `${randomPercent()}%`;
    fan.style.top = `${randomPercent()}%`;
  });
}

/* =========================================================
   REAL FAN SESSION
   ========================================================= */

function createSessionId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return "fan-" +
    Date.now() +
    "-" +
    Math.random().toString(36).slice(2);
}

async function startFanSession() {
  if (!supabase || fanSessionId) return;

  fanSessionId = createSessionId();

  const { error } = await supabase
    .from("brm_fan_sessions")
    .insert({
      session_id: fanSessionId,
      is_listening: true
    });

  if (error) {
    console.error("BRM FAN session error:", error);
    fanSessionId = null;
    return;
  }

  console.log("BRM FAN session started.");
}

async function heartbeat() {
  if (!supabase || !fanSessionId) return;

  const { error } = await supabase
    .from("brm_fan_sessions")
    .update({
      is_listening: true,
      last_seen_at: new Date().toISOString()
    })
    .eq("session_id", fanSessionId);

  if (error) {
    console.error("BRM FAN heartbeat error:", error);
  }
}

/* =========================================================
   REAL ACTIVE FAN COUNT
   ========================================================= */

async function updateRealFanCount() {
  if (!supabase || !botCounter) return;

  const cutoff = new Date(
    Date.now() -
    FAN_TIMEOUT_SECONDS * 1000
  ).toISOString();

  const { count, error } = await supabase
    .from("brm_fan_sessions")
    .select("*", {
      count: "exact",
      head: true
    })
    .eq("is_listening", true)
    .gte("last_seen_at", cutoff);

  if (error) {
    console.error("BRM FAN count error:", error);
    return;
  }

  const realCount = count || 0;

  botCounter.textContent =
    realCount.toLocaleString();

  if (stateName) {
    stateName.textContent =
      "BRM FAN NETWORK LIVE";
  }

  if (stateMessage) {
    stateMessage.textContent =
      `${realCount.toLocaleString()} real BRM FAN session${realCount === 1 ? "" : "s"} active right now.`;
  }
}

/* =========================================================
   START BRM FAN NETWORK
   ========================================================= */

async function startCelebrationNow() {
  if (running) return;

  running = true;

  document.body.classList.add("celebrating");

  if (startCelebration) {
    startCelebration.textContent =
      "BRM FAN NETWORK LIVE ✦";

    startCelebration.disabled = true;
  }

  await startFanSession();

  await updateRealFanCount();

  heartbeatTimer = setInterval(
    heartbeat,
    15000
  );

  fanCountTimer = setInterval(
    updateRealFanCount,
    5000
  );

  setInterval(
    animateFans,
    2200
  );
}

/* =========================================================
   CLEAN UP WHEN VISITOR LEAVES
   ========================================================= */

async function endFanSession() {
  if (!supabase || !fanSessionId) return;

  await supabase
    .from("brm_fan_sessions")
    .delete()
    .eq("session_id", fanSessionId);
}

window.addEventListener(
  "beforeunload",
  () => {
    if (supabase && fanSessionId) {
      navigator.sendBeacon(
        `${SUPABASE_URL}/rest/v1/brm_fan_sessions?session_id=eq.${encodeURIComponent(fanSessionId)}`,
        ""
      );
    }
  }
);

/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeBRMNetwork() {
  if (!window.supabase) {
    setTimeout(
      initializeBRMNetwork,
      100
    );
    return;
  }

  supabase =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

  console.log(
    "BRMMONEY FAN NETWORK connected."
  );
}

createFans();

if (startCelebration) {
  startCelebration.addEventListener(
    "click",
    startCelebrationNow
  );
}

supabaseScript.onload =
  initializeBRMNetwork;
