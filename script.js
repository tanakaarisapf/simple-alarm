const clockEl = document.getElementById("clock");
const secEl = document.getElementById("sec");
const meridianEl = document.getElementById("meridian");
const dateEl = document.getElementById("date");
const setterEl = document.getElementById("setter");
const timeInput = document.getElementById("time-input");
const alarmsEl = document.getElementById("alarms");
const countEl = document.getElementById("count");
const ringingEl = document.getElementById("ringing");
const ringTimeEl = document.getElementById("ring-time");
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
  if (alarms.includes(value)) {
    flashTimeField();
    return;
  }
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

  clockEl.firstChild.nodeValue = `${hh}:${mm}`;
  secEl.textContent = ss;
  meridianEl.textContent = now.getHours() < 12 ? "MORNING" : "AFTERNOON";
  dateEl.textContent = formatDate(now);

  if (ss === "00") {
    const current = `${hh}:${mm}`;
    if (alarms.includes(current) && ringingEl.hidden) {
      startRinging(current);
    }
  }
}

function formatDate(d) {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${days[d.getDay()]} · ${d.getFullYear()}.${m}.${day}`;
}

function renderAlarms() {
  alarmsEl.innerHTML = "";
  countEl.textContent = String(alarms.length);
  for (const t of alarms) {
    const li = document.createElement("li");

    const left = document.createElement("div");
    left.className = "left";

    const indicator = document.createElement("span");
    indicator.className = "indicator";

    const meta = document.createElement("div");
    meta.className = "meta";

    const time = document.createElement("span");
    time.className = "time";
    time.textContent = t;

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = relativeLabel(t);

    meta.appendChild(time);
    meta.appendChild(label);

    left.appendChild(indicator);
    left.appendChild(meta);

    const btn = document.createElement("button");
    btn.className = "remove";
    btn.type = "button";
    btn.title = "削除";
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
    btn.addEventListener("click", () => removeAlarm(t));

    li.appendChild(left);
    li.appendChild(btn);
    alarmsEl.appendChild(li);
  }
}

function relativeLabel(t) {
  const [h, m] = t.split(":").map(Number);
  const now = new Date();
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const diffMin = Math.round((target - now) / 60000);
  if (diffMin < 60) return `あと ${diffMin} 分`;
  const hrs = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  if (hrs < 24) return mins ? `あと ${hrs} 時間 ${mins} 分` : `あと ${hrs} 時間`;
  return "あす";
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

function startRinging(time) {
  ringTimeEl.textContent = time;
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

function flashTimeField() {
  const field = document.querySelector(".time-field");
  if (!field) return;
  field.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-4px)" },
      { transform: "translateX(4px)" },
      { transform: "translateX(0)" },
    ],
    { duration: 240, iterations: 1 }
  );
}

setInterval(() => {
  if (alarms.length) renderAlarms();
}, 60_000);
