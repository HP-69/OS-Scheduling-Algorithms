let processes = [];
let counter = 1;
const $ = (id) => document.getElementById(id);

const PALETTE = ["#2f7d4f", "#c96512", "#3b7ea1", "#b5483a", "#7a5c99", "#a67c00", "#5b7f3a", "#8a5a3c"];
const colorOf = (pid) => PALETTE[(parseInt(pid.slice(1)) - 1) % PALETTE.length];

/* ---------- Input handling ---------- */
function renderInput() {
  const body = $("inputTable").tBodies[0];
  if (!processes.length) {
    body.innerHTML = `<tr><td colspan="5" class="empty">No processes yet. Add one above or load sample data.</td></tr>`;
    return;
  }
  body.innerHTML = processes.map((p, i) => `
    <tr>
      <td class="pid"><span class="dot" style="background:${colorOf(p.pid)}"></span>${p.pid}</td>
      <td><input class="cell" type="number" min="0" value="${p.at}" onchange="editProcess(${i}, 'at', this)"></td>
      <td><input class="cell" type="number" min="1" value="${p.bt}" onchange="editProcess(${i}, 'bt', this)"></td>
      <td class="pri"><input class="cell" type="number" min="1" value="${p.pr}" onchange="editProcess(${i}, 'pr', this)"></td>
      <td><button class="btn small" onclick="removeProcess(${i})">Remove</button></td>
    </tr>`).join("");
}

function addProcess(at, bt, pr) {
  processes.push({ pid: "P" + counter++, at, bt, pr });
  renderInput();
}

function editProcess(i, field, el) {
  const names = { at: "Arrival time", bt: "Burst time", pr: "Priority" };
  const min = field === "at" ? 0 : 1;
  const v = parseInt(el.value);
  if (isNaN(v) || v < min) {
    el.value = processes[i][field];
    return showMsg(names[field] + " must be at least " + min + ".");
  }
  processes[i][field] = v;
  showMsg("");
  $("results").hidden = true; // old output is out of date, run again
}

function removeProcess(i) {
  processes.splice(i, 1);
  renderInput();
  $("results").hidden = true;
}

$("addBtn").onclick = () => {
  const at = parseInt($("arrival").value), bt = parseInt($("burst").value), pr = parseInt($("priority").value);
  if (isNaN(at) || at < 0) return showMsg("Arrival time must be 0 or more.");
  if (isNaN(bt) || bt < 1) return showMsg("Burst time must be at least 1.");
  const usePri = $("usePri").checked;
  if (usePri && (isNaN(pr) || pr < 1)) return showMsg("Priority must be at least 1.");
  showMsg("");
  addProcess(at, bt, usePri ? pr : 1);
};

$("sampleBtn").onclick = () => {
  processes = []; counter = 1;
  [[0, 5, 2], [1, 3, 1], [2, 8, 4], [3, 6, 3], [4, 2, 5]].forEach(([a, b, p]) => addProcess(a, b, p));
  showMsg("");
};

$("clearBtn").onclick = () => {
  processes = []; counter = 1;
  renderInput();
  $("results").hidden = true;
};

function showMsg(t) { $("msg").textContent = t; }

const INFO = {
  fcfs: "Runs processes strictly in order of arrival. Simple and non-preemptive, but short jobs can wait behind long ones.",
  sjf: "Picks the ready process with the shortest burst time. Non-preemptive, with a low average waiting time.",
  srtn: "Preemptive SJF: when a process arrives, the one with the least remaining time gets the CPU.",
  rr: "Each process runs for one time quantum, then moves to the back of the queue. Fair and preemptive.",
  pnp: "Runs the highest-priority ready process to completion. A running process is never interrupted.",
  pp: "The highest-priority ready process always runs. A newly arrived higher-priority process preempts the current one."
};

function onAlgo() {
  const a = $("algo").value;
  $("quantumBox").hidden = a !== "rr";
  $("info").textContent = INFO[a];
}
$("algo").onchange = onAlgo;

function applyPriority() {
  const on = $("usePri").checked;
  document.body.classList.toggle("no-pri", !on);
  document.querySelectorAll(".pri-opt").forEach((o) => { o.disabled = !on; o.hidden = !on; });
  if (!on && ["pnp", "pp"].includes($("algo").value)) $("algo").value = "fcfs";
  onAlgo();
}
$("usePri").onchange = applyPriority;

/* ---------- Scheduling algorithms ---------- */
// Adds a slice to the timeline, merging it with the previous one if same process
function pushSeg(segs, pid, start, end) {
  const last = segs[segs.length - 1];
  if (last && last.pid === pid && last.end === start) last.end = end;
  else segs.push({ pid, start, end });
}

// Adds a context-switch block when the CPU moves straight from one process to another
function withCS(segs, pid, t, cs) {
  const last = segs[segs.length - 1];
  if (cs > 0 && last && last.pid !== null && last.pid !== "CS" && last.pid !== pid && last.end === t) {
    segs.push({ pid: "CS", start: t, end: t + cs });
    return t + cs;
  }
  return t;
}

function nonPreemptive(list, keyFn, cs) {
  const segs = [], done = new Set();
  let t = 0;
  while (done.size < list.length) {
    const ready = list.filter((p) => !done.has(p.pid) && p.at <= t);
    if (!ready.length) {
      const next = Math.min(...list.filter((p) => !done.has(p.pid)).map((p) => p.at));
      pushSeg(segs, null, t, next);
      t = next;
      continue;
    }
    ready.sort((a, b) => keyFn(a) - keyFn(b) || a.at - b.at);
    const p = ready[0];
    t = withCS(segs, p.pid, t, cs);
    pushSeg(segs, p.pid, t, t + p.bt);
    t += p.bt;
    done.add(p.pid);
  }
  return segs;
}

// Checks every time unit, so a newly arrived process can take over the CPU
function preemptive(list, keyFn, cs) {
  const segs = [], rem = {};
  list.forEach((p) => (rem[p.pid] = p.bt));
  let t = 0, left = list.length;
  while (left > 0) {
    const ready = list.filter((p) => rem[p.pid] > 0 && p.at <= t);
    if (!ready.length) { pushSeg(segs, null, t, t + 1); t++; continue; }
    ready.sort((a, b) => keyFn(a, rem) - keyFn(b, rem) || a.at - b.at);
    const p = ready[0];
    t = withCS(segs, p.pid, t, cs);
    pushSeg(segs, p.pid, t, t + 1);
    rem[p.pid]--;
    t++;
    if (rem[p.pid] === 0) left--;
  }
  return segs;
}

function roundRobin(list, q, cs) {
  const segs = [], rem = {};
  list.forEach((p) => (rem[p.pid] = p.bt));
  const sorted = [...list].sort((a, b) => a.at - b.at);
  const queue = [];
  let t = 0, i = 0, left = list.length;
  const admit = () => { while (i < sorted.length && sorted[i].at <= t) queue.push(sorted[i++]); };
  admit();
  while (left > 0) {
    if (!queue.length) {
      const next = sorted[i].at;
      pushSeg(segs, null, t, next);
      t = next;
      admit();
      continue;
    }
    const p = queue.shift();
    t = withCS(segs, p.pid, t, cs);
    admit();
    const run = Math.min(q, rem[p.pid]);
    pushSeg(segs, p.pid, t, t + run);
    t += run;
    rem[p.pid] -= run;
    admit();                      // new arrivals join before the preempted process
    if (rem[p.pid] > 0) queue.push(p);
    else left--;
  }
  return segs;
}

function schedule(algo, list, opts) {
  switch (algo) {
    case "fcfs": return nonPreemptive(list, (p) => p.at, opts.cs);
    case "sjf": return nonPreemptive(list, (p) => p.bt, opts.cs);
    case "srtn": return preemptive(list, (p, rem) => rem[p.pid], opts.cs);
    case "rr": return roundRobin(list, opts.quantum, opts.cs);
    case "pnp": return nonPreemptive(list, (p) => p.pr, opts.cs);
    case "pp": return preemptive(list, (p) => p.pr, opts.cs);
  }
}

/* ---------- Metrics ---------- */
function computeMetrics(list, segs) {
  return list.map((p) => {
    const mine = segs.filter((s) => s.pid === p.pid);
    const ct = Math.max(...mine.map((s) => s.end));
    const first = Math.min(...mine.map((s) => s.start));
    const tat = ct - p.at;
    return { ...p, ct, tat, wt: tat - p.bt, rt: first - p.at };
  });
}

/* ---------- Rendering ---------- */
const UNIT = 42; // pixels per time unit

function renderGantt(segs) {
  const g = $("gantt");
  g.innerHTML = segs.map((s, i) => {
    const w = (s.end - s.start) * UNIT;
    const idle = s.pid === null, cs = s.pid === "CS";
    const end = i === segs.length - 1 ? `<span class="t end">${s.end}</span>` : "";
    return `<div class="block ${idle ? "idle" : cs ? "cs" : ""}" style="width:${w}px;animation-delay:${i * 0.12}s;${idle || cs ? "" : "background:" + colorOf(s.pid)}">
      ${idle ? "Idle" : s.pid}<span class="t">${s.start}</span>${end}</div>`;
  }).join("");
}

function renderResults(rows, segs, useCS) {
  const avg = (k) => (rows.reduce((a, r) => a + r[k], 0) / rows.length).toFixed(2);
  $("resultTable").tBodies[0].innerHTML = rows.map((r) => `
    <tr>
      <td class="pid"><span class="dot" style="background:${colorOf(r.pid)}"></span>${r.pid}</td>
      <td>${r.at}</td><td>${r.bt}</td><td class="pri">${r.pr}</td>
      <td>${r.ct}</td><td>${r.tat}</td><td>${r.wt}</td><td>${r.rt}</td>
    </tr>`).join("");
  const total = Math.max(...rows.map((r) => r.ct));
  const busy = rows.reduce((a, r) => a + r.bt, 0);
  const sw = segs.filter((s) => s.pid === "CS");
  const extra = useCS
    ? `<div class="stat"><span>Context switches</span><b>${sw.length}</b></div>
       <div class="stat"><span>Time lost to switching</span><b>${sw.reduce((a, s) => a + s.end - s.start, 0)}</b></div>`
    : "";
  $("stats").innerHTML = `
    <div class="stat"><span>Average turnaround time</span><b>${avg("tat")}</b></div>
    <div class="stat"><span>Average waiting time</span><b>${avg("wt")}</b></div>
    <div class="stat"><span>Average response time</span><b>${avg("rt")}</b></div>
    <div class="stat"><span>CPU utilization</span><b>${((busy / total) * 100).toFixed(1)}%</b></div>
    <div class="stat"><span>Throughput</span><b>${(rows.length / total).toFixed(2)} / unit</b></div>${extra}`;
}

$("runBtn").onclick = () => {
  if (!processes.length) return showMsg("Add at least one process before running.");
  const algo = $("algo").value;
  const quantum = parseInt($("quantum").value);
  if (algo === "rr" && (isNaN(quantum) || quantum < 1)) return showMsg("Time quantum must be at least 1.");
  showMsg("");
  const useCS = $("useCS").checked;
  const cs = useCS ? parseInt($("csTime").value) : 0;
  if (useCS && (isNaN(cs) || cs < 1)) return showMsg("Context switch time must be at least 1.");
  const segs = schedule(algo, processes, { quantum, cs });
  renderGantt(segs);
  renderResults(computeMetrics(processes, segs), segs, useCS);
  $("algoTag").textContent = $("algo").selectedOptions[0].text;
  $("results").hidden = false;
  $("results").scrollIntoView({ behavior: "smooth" });
};

$("useCS").onchange = () => { $("csBox").hidden = !$("useCS").checked; };
renderInput();
applyPriority();
