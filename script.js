/* =========================================================
   BRMMONEY — REAL BRM FAN NETWORK
   ONE BAND ONE SOUND
   ========================================================= */

const SUPABASE_URL = "https://ekkfgzisheokzrdaypef.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_QmjZOgMtIH9G9dpx-Setsw_zC6TORvI";

const FAN_TIMEOUT_SECONDS = 45;
const VISIBLE_FANS = 850;

/* =========================================================
   PAGE ELEMENTS
   ========================================================= */

const botField = document.getElementById("botField");
const botCounter = document.getElementById("botCounter");
const stateName = document.getElementById("stateName");
const stateMessage = document.getElementById("stateMessage");
const playlistFrame = document.getElementById("brmPlaylist");

/* =========================================================
   STATE
   ========================================================= */

let supabase = null;
let fanSessionId = null;
let heartbeatTimer = null;
let fanCountTimer = null;
let visualTimer = null;
let youtubePlayer = null;
let fanIsListening = false;

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
   SESSION ID
   ========================================================= */

function createSessionId() {
  if (
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }

  return (
    "fan-" +
    Date.now() +
    "-" +
    Math.random().toString(36).slice(2)
  );
}

/* =========================================================
   START REAL FAN SESSION
   ========================================================= */

async function startFanSession() {
  if (!supabase) return;
  if (fanSessionId) return;

  fanSessionId = createSessionId();

  const { error } = await supabase
    .from("brm_fan_sessions")
    .insert({
      session_id: fanSessionId,
      is_listening: true,
      last_seen_at: new Date().toISOString()
    });

  if (error) {
    console.error(
      "BRM FAN session error:",
      error
    );

    fanSessionId = null;
    fanIsListening = false;
    return;
  }

  fanIsListening = true;

  console.log(
    "REAL BRM FAN session started."
  );
}

/* =========================================================
   MARK SESSION ACTIVE
   ========================================================= */

async function heartbeat() {
  if (!supabase) return;
  if (!fanSessionId) return;
  if (!fanIsListening) return;

  const { error } = await supabase
    .from("brm_fan_sessions")
    .update({
      is_listening: true,
      last_seen_at: new Date().toISOString()
    })
    .eq(
      "session_id",
      fanSessionId
    );

  if (error) {
    console.error(
      "BRM FAN heartbeat error:",
      error
    );
  }
}

/* =========================================================
   PAUSE SESSION
   ========================================================= */

async function pauseFanSession() {
  if (!supabase) return;
  if (!fanSessionId) return;

  fanIsListening = false;

  const { error } = await supabase
    .from("brm_fan_sessions")
    .update({
      is_listening: false,
      last_seen_at: new Date().toISOString()
    })
    .eq(
      "session_id",
      fanSessionId
    );

  if (error) {
    console.error(
      "BRM FAN pause error:",
      error
    );
  }
}

/* =========================================================
   REAL ACTIVE FAN COUNT
   ========================================================= */

async function updateRealFanCount() {
  if (!supabase) return;
  if (!botCounter) return;

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
    .eq(
      "is_listening",
      true
    )
    .gte(
      "last_seen_at",
      cutoff
    );

  if (error) {
    console.error(
      "BRM FAN count error:",
      error
    );

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
   YOUTUBE PLAYER
   ========================================================= */

function loadYouTubeAPI() {
  if (
    window.YT &&
    window.YT.Player
  ) {
    createYouTubePlayer();
    return;
  }

  window.onYouTubeIframeAPIReady =
    createYouTubePlayer;

  const existing =
    document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

  if (existing) return;

  const tag =
    document.createElement("script");

  tag.src =
    "https://www.youtube.com/iframe_api";

  document.head.appendChild(tag);
}

function createYouTubePlayer() {
  if (!playlistFrame) return;
  if (youtubePlayer) return;

  youtubePlayer =
    new YT.Player(
      "brmPlaylist",
      {
        events: {
          onReady:
            onYouTubeReady,

          onStateChange:
            onYouTubeStateChange,

          onError:
            onYouTubeError
        }
      }
    );
}

/* =========================================================
   YOUTUBE READY
   ========================================================= */

function onYouTubeReady() {
  console.log(
    "BRMMONEY YouTube player ready."
  );
}

/* =========================================================
   YOUTUBE PLAYBACK STATE
   ========================================================= */

async function onYouTubeStateChange(event) {
  if (!window.YT) return;

  const PLAYING =
    YT.PlayerState.PLAYING;

  const PAUSED =
    YT.PlayerState.PAUSED;

  const ENDED =
    YT.PlayerState.ENDED;

  const BUFFERING =
    YT.PlayerState.BUFFERING;

  if (event.data === PLAYING) {
    document.body.classList.add(
      "celebrating"
    );

    if (!fanSessionId) {
      await startFanSession();
    } else {
      fanIsListening = true;
      await heartbeat();
    }

    if (!visualTimer) {
      visualTimer =
        setInterval(
          animateFans,
          2200
        );
    }

    await updateRealFanCount();

    return;
  }

  if (
    event.data === PAUSED ||
    event.data === ENDED
  ) {
    document.body.classList.remove(
      "celebrating"
    );

    await pauseFanSession();

    await updateRealFanCount();

    return;
  }

  if (event.data === BUFFERING) {
    /*
      Keep the fan session alive during
      short YouTube buffering events.
    */

    if (fanSessionId) {
      fanIsListening = true;
    }
  }
}

/* =========================================================
   YOUTUBE ERRORS
   ========================================================= */

function onYouTubeError(event) {
  console.error(
    "BRMMONEY YouTube player error:",
    event.data
  );

  if (stateName) {
    stateName.textContent =
      "PLAYER ERROR";
  }

  if (stateMessage) {
    stateMessage.textContent =
      "The BRMMONEY player could not start this track.";
  }
}

/* =========================================================
   CLEANUP
   ========================================================= */

async function endFanSession() {
  if (!supabase) return;
  if (!fanSessionId) return;

  const sessionToDelete =
    fanSessionId;

  fanSessionId = null;
  fanIsListening = false;

  await supabase
    .from("brm_fan_sessions")
    .delete()
    .eq(
      "session_id",
      sessionToDelete
    );
}

/* =========================================================
   PAGE VISIBILITY
   ========================================================= */

document.addEventListener(
  "visibilitychange",
  async () => {
    if (
      document.visibilityState ===
      "hidden"
    ) {
      /*
        We do not immediately delete the
        session because the visitor may
        briefly switch tabs while music
        continues.
      */

      return;
    }

    if (
      document.visibilityState ===
      "visible"
    ) {
      if (
        youtubePlayer &&
        typeof youtubePlayer.getPlayerState ===
          "function"
      ) {
        const playerState =
          youtubePlayer.getPlayerState();

        if (
          playerState ===
          YT.PlayerState.PLAYING
        ) {
          fanIsListening = true;
          await heartbeat();
          await updateRealFanCount();
        }
      }
    }
  }
);

/* =========================================================
   BEFORE LEAVING
   ========================================================= */

window.addEventListener(
  "beforeunload",
  () => {
    /*
      The heartbeat timeout protects the
      count if the browser closes before
      a normal cleanup request completes.
    */
  }
);

/* =========================================================
   SUPABASE INITIALIZATION
   ========================================================= */

function initializeSupabase() {
  if (!window.supabase) {
    setTimeout(
      initializeSupabase,
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

  updateRealFanCount();
}

/* =========================================================
   HEARTBEAT TIMER
   ========================================================= */

function startHeartbeatTimer() {
  if (heartbeatTimer) return;

  heartbeatTimer =
    setInterval(
      heartbeat,
      15000
    );
}

/* =========================================================
   FAN COUNT TIMER
   ========================================================= */

function startFanCountTimer() {
  if (fanCountTimer) return;

  fanCountTimer =
    setInterval(
      updateRealFanCount,
      5000
    );
}

/* =========================================================
   INITIALIZE
   ========================================================= */

createFans();

startHeartbeatTimer();

startFanCountTimer();

loadYouTubeAPI();

const supabaseScript =
  document.createElement("script");

supabaseScript.src =
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

supabaseScript.onload =
  initializeSupabase;

document.head.appendChild(
  supabaseScript
);
