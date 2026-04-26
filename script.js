const clockEl = document.getElementById("clock");
const setterEl = document.getElementById("setter");
const timeInput = document.getElementById("time-input");
const alarmsEl = document.getElementById("alarms");
const ringingEl = document.getElementById("ringing");
const stopBtn = document.getElementById("stop-btn");

const STORAGE_KEY = "simple-alarm:alarms";
let alarms = loadAlarms();
let audioCtx = null;
let ringingTimer = null;

renderAlarms();
tickClock();
setInterval(tickClock, 1000);

setterEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = timeInput.value;
  if (!value) return;
  if (alarms.includes(value)) return;
  alarms.push(value);
  alarms.sort();
  saveAlarms();
  renderAlarms();
  timeInput.value = "";
});

stopBtn.addEventListener("click", stopRinging);

function tickClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  clockEl.textContent = `${hh}:${mm}:${ss}`;

  if (ss === "00") {
    const current = `${hh}:${mm}`;
    if (alarms.includes(current) && ringingEl.hidden) {
      startRinging();
    }
  }
}

function renderAlarms() {
  alarmsEl.innerHTML = "";
  for (const t of alarms) {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.className = "time";
    span.textContent = t;
    const btn = document.createElement("button");
    btn.className = "remove";
    btn.type = "button";
    btn.textContent = "削除";
    btn.addEventListener("click", () => removeAlarm(t));
    li.appendChild(span);
    li.appendChild(btn);
    alarmsEl.appendChild(li);
  }
}

function removeAlarm(t) {
  alarms = alarms.filter((x) => x !== t);
  saveAlarms();
  renderAlarms();
}

function loadAlarms() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAlarms() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
}

function startRinging() {
  ringingEl.hidden = false;
  playBeep();
  ringingTimer = setInterval(playBeep, 900);
}

function stopRinging() {
  ringingEl.hidden = true;
  if (ringingTimer) {
    clearInterval(ringingTimer);
    ringingTimer = null;
  }
}

function playBeep() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } catch {
    // audio unavailable — silent fail
  }
}
