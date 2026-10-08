/* The Theory Room: sight-reading for the practical exam, Grades 1–8.
   A fresh piece each time at the grade's level, written for the learner's instrument (clef and,
   for transposing instruments, the written key). Thirty seconds to look, a count-in, then play:
   the microphone marks pitch and rhythm with the same listener the aural room uses for singing.
   Without a microphone, learners mark themselves and can hear how it goes. */
(function () {
  "use strict";
  if (typeof staffSVG === "undefined" || typeof micListen === "undefined") return;

  /* instruments: clef, written range for the top grade, and transposition (sounding = written + tr) */
  const INST = [
    ["violin", "Violin", "treble", 55, 0], ["viola", "Viola", "alto", 48, 0], ["cello", "Cello", "bass", 36, 0], ["double bass", "Double bass", "bass", 40, -12],
    ["flute", "Flute", "treble", 60, 0], ["oboe", "Oboe", "treble", 59, 0], ["clarinet", "Clarinet in B♭", "treble", 55, -2], ["bassoon", "Bassoon", "bass", 34, 0],
    ["recorder", "Recorder (descant)", "treble", 60, 12], ["alto sax", "Alto saxophone", "treble", 58, -9], ["trumpet", "Trumpet in B♭", "treble", 55, -2],
    ["horn", "Horn in F", "treble", 55, -7], ["trombone", "Trombone", "bass", 40, 0], ["piano", "Piano (right hand)", "treble", 57, 0], ["voice", "Voice", "treble", 57, 0]
  ].map(a => ({ id: a[0], name: a[1], clef: a[2], low: a[3], tr: a[4] }));
  const instOf = id => INST.find(i => i.id === id) || INST[0];

  /* what each grade can use (a general guide: boards differ by instrument, so check your syllabus) */
  const GR = {
    1: { bars: 4, times: [2, 3, 4], keys: [["major", 0], ["major", 1], ["major", -1]], span: 5, leap: 2, rh: ["q", "h", "dh", "w"] },
    2: { bars: 4, times: [2, 3, 4], keys: [["major", 0], ["major", 1], ["major", -1], ["major", 2], ["minor", 0]], span: 7, leap: 3, rh: ["q", "h", "dh", "w", "ee"] },
    3: { bars: 6, times: [2, 3, 4], keys: [["major", 0], ["major", 1], ["major", -1], ["major", 2], ["major", -2], ["minor", 0], ["minor", 1], ["minor", -1]], span: 8, leap: 4, rh: ["q", "h", "dh", "ee", "dqe"] },
    4: { bars: 8, times: [2, 3, 4], keys: "upto2", span: 9, leap: 4, rh: ["q", "h", "dh", "ee", "dqe", "rest"] },
    5: { bars: 8, times: [2, 3, 4], keys: "upto3", span: 10, leap: 5, rh: ["q", "h", "ee", "dqe", "ssss", "rest"] },
    6: { bars: 8, times: [2, 3, 4], keys: "upto4", span: 12, leap: 6, rh: ["q", "h", "ee", "dqe", "ssss", "ess", "rest"] },
    7: { bars: 12, times: [2, 3, 4], keys: "upto5", span: 13, leap: 7, rh: ["q", "h", "ee", "dqe", "ssss", "ess", "sse", "rest"] },
    8: { bars: 12, times: [2, 3, 4], keys: "upto6", span: 15, leap: 8, rh: ["q", "h", "ee", "dqe", "ssss", "ess", "sse", "dees", "rest"] }
  };
  const CELLS = { q: [1], h: [2], dh: [3], w: [4], ee: [.5, .5], dqe: [1.5, .5], ssss: [.25, .25, .25, .25], ess: [.5, .25, .25], sse: [.25, .25, .5], dees: [.75, .25], rest: ["r1"] };
  function keysFor(g) {
    const s = GR[g].keys; if (Array.isArray(s)) return s;
    const n = +s.replace("upto", ""), out = [];
    for (let k = -n; k <= n; k++) { out.push(["major", k]); out.push(["minor", k]); }
    return out;
  }
  function barRhythm(beats, g) {
    for (let tries = 0; tries < 50; tries++) {
      const out = []; let left = beats;
      while (left > 1e-6) {
        const opts = GR[g].rh.filter(c => { const len = c === "rest" ? 1 : CELLS[c].reduce((a, b) => a + b, 0); return len <= left + 1e-6 && !(c === "w" && beats !== 4) && !(c === "dh" && left < 3); });
        if (!opts.length) break;
        const c = pick(opts);
        if (c === "rest") { if (out.length && out[out.length - 1] === "r1") continue; out.push("r1"); left -= 1; continue; }
        if (c === "dqe" && Math.abs((beats - left) % 1) > 1e-6) continue;   // dotted pairs start on a beat
        CELLS[c].forEach(d => out.push(d)); left -= CELLS[c].reduce((a, b) => a + b, 0);
      }
      if (Math.abs(left) < 1e-6 && out.some(x => x !== "r1")) return out;
    }
    return Array.from({ length: beats }, () => 1);
  }

  function makePiece(g, inst) {
    const G = GR[g], beats = pick(G.times);
    const [mode, k] = pick(keysFor(g));
    const kp = keyPcs(((mode === "minor" ? midiOf(minorTonic(k)) : midiOf(majorTonic(k))) % 12 + 12) % 12, mode);
    // the tonic in the learner's written range
    const lo = inst.low + (g <= 2 ? 3 : 0), hi = inst.low + 12 + Math.min(G.span, 15);
    let tonic = (mode === "minor" ? midiOf(minorTonic(k)) : midiOf(majorTonic(k)));
    while (tonic < lo) tonic += 12; while (tonic - 12 >= lo && tonic > lo + 7) tonic -= 12;
    if (tonic + 7 > hi) tonic -= 12; if (tonic < inst.low) tonic += 12;
    const bottom = Math.max(inst.low, tonic - (g >= 4 ? 5 : 0)), top = Math.min(hi, bottom + G.span);
    const notes = []; let m = tonic, t = 0;
    for (let b = 0; b < G.bars; b++) {
      const last = b === G.bars - 1, rh = last ? [beats === 4 && g >= 2 && Math.random() < .5 ? 2 : beats, ...(beats === 4 && g >= 2 && Math.random() < .5 ? [] : [])] : barRhythm(beats, g);
      if (last && rh[0] < beats) rh.push(beats - rh[0]);
      rh.forEach((d, i) => {
        if (d === "r1") { notes.push({ rest: true, d: 1, t }); t += 1; return; }
        if (!(b === 0 && i === 0)) {
          const steps = Math.random() < .7 ? pick([-1, 1]) : pick([-1, 1]) * (2 + rnd(Math.max(1, G.leap - 1)));
          let nm = m, dir = Math.sign(steps); for (let s = 0; s < Math.abs(steps); s++) nm = scaleStep(nm, dir, kp);
          if (nm > top || nm < bottom) { nm = m; for (let s = 0; s < Math.abs(steps); s++) nm = scaleStep(nm, -dir, kp); }
          m = nm > top || nm < bottom ? nearestPc(kp, Math.max(bottom, Math.min(top, nm)), bottom, top) : nm;   /* stay in the key and the range */
        }
        if (last && i === rh.length - 1) m = nearestPc([tonic % 12], m, bottom, top);
        notes.push({ m, d, t }); t += d;
      });
    }
    const tempo = [0, 76, 80, 84, 88, 92, 96, 100, 104][g];
    return { g, beats, mode, k, notes, tonic, tempo, inst: inst.id, bars: G.bars };
  }

  function scoreSVG(pc, inst) {
    const per = 4, out = [];
    for (let s = 0; s < pc.bars; s += per) {
      const ev = []; let pos = 0;
      pc.notes.filter(n => n.t >= s * pc.beats - 1e-6 && n.t < (s + per) * pc.beats - 1e-6).forEach(n => {
        ev.push(n.rest ? { rest: true, d: n.d } : { keys: [fromMidiInKey(n.m, pc.k, pc.mode)], d: n.d });
        pos += n.d; if (Math.abs(pos / pc.beats - Math.round(pos / pc.beats)) < 1e-6) ev.push({ bar: (s + Math.round(pos / pc.beats)) >= pc.bars ? "end" : true });
      });
      autoBeam(ev, 1);
      out.push(`<div class="trsys"><span class="trbar">${s + 1}</span>${staffSVG({ clef: inst.clef, key: pc.k, time: s === 0 ? pc.beats + "/4" : null, events: ev, prop: true, aria: "Bars " + (s + 1) + " to " + Math.min(pc.bars, s + per) })}</div>`);
    }
    return `<div class="trscore">${out.join("")}</div>`;
  }
  /* what the microphone should hear: sounding pitches, rests folded into the note before */
  function target(pc, inst) {
    const T = [];
    pc.notes.forEach(n => { if (n.rest) { if (T.length) T[T.length - 1].d += n.d; return; } T.push({ m: n.m + inst.tr, d: n.d }); });
    return T;
  }
  const soundEv = (pc, inst) => pc.notes.filter(n => !n.rest).map(n => ({ m: n.m + inst.tr, t: n.t, d: n.d, v: .8 }));

  /* ---------- the tab ---------- */
  const S = { pc: null, phase: "look", left: 30, timer: 0, result: null, msg: "" };
  function prog(p) { return p.read = p.read || {}; }
  function view() {
    const p = P(), inst = instOf(p.readInst || (p.inst && p.inst[0]) || "violin"), g = p.readGrade || 1;
    const can = gg => !window.TR || TR.can("aural", gg);
    if (!S.pc || S.pc.g !== g || S.pc.inst !== inst.id) { S.pc = can(g) ? makePiece(g, inst) : null; S.phase = "look"; S.result = null; S.left = 30; }
    const grades = [1, 2, 3, 4, 5, 6, 7, 8].map(n => can(n) ? `<button class="gbtn" data-rd-g="${n}" aria-pressed="${n === g}">Grade ${n}</button>` : `<a class="gbtn tr-lock" href="../app.html#plans">Grade ${n} 🔒</a>`).join("");
    const rec = prog(p)[g];
    let body = "";
    if (!S.pc) body = window.TR ? TR.upsellHTML("Sight-reading for this grade comes with a plan.") : "";
    else {
      const pc = S.pc, keyLbl = keyName(pc.k, pc.mode);
      body = `<section class="panel"><div class="row" style="justify-content:space-between"><div><div class="kicker">Grade ${g} · ${esc(inst.name)}</div><h3 style="margin:.15em 0">${esc(keyLbl)}, ${pc.beats}/4 · ♩ = ${pc.tempo}</h3></div>${rec ? `<span class="pill">${rec.good}/${rec.n} played well</span>` : ""}</div>
        <div class="notation" style="margin:10px 0">${scoreSVG(pc, inst)}</div>
        <div id="rdbox">${phaseHTML()}</div>
        <div class="row" style="margin-top:12px;justify-content:space-between"><button class="btn small ghost" data-rd="new">New piece</button><span class="muted" style="font-size:.88rem">${inst.tr ? "Written for a transposing instrument: play it as written and the microphone allows for it." : ""}</span></div></section>`;
    }
    const opts = INST.map(i => `<option value="${esc(i.id)}"${i.id === inst.id ? " selected" : ""}>${esc(i.name)}</option>`).join("");
    return `<h2>Sight-reading</h2><p class="muted" style="margin-top:0">A new piece every time, at your grade, for your instrument. In the exam you get about 30 seconds to look at it first. Use them here too.</p>
      <div class="row" style="gap:10px;margin:6px 0 10px"><label for="rdInst" style="font-weight:700">Instrument</label><select id="rdInst" style="font:inherit;min-height:40px;border-radius:10px;padding:4px 10px">${opts}</select></div>
      <div class="gradebar" role="group" aria-label="Sight-reading grade">${grades}</div>${body}
      <p class="muted" style="font-size:.85rem;margin-top:14px">These pieces follow the usual pattern of keys, time signatures and rhythms by grade. Each board and instrument has its own sight-reading list, so check the details in your syllabus.</p>`;
  }
  function phaseHTML() {
    if (S.phase === "look") return `<div class="row"><button class="btn primary" data-rd="look">Start 30 seconds to look</button><button class="btn ghost" data-rd="ready">I'm ready to play</button></div>
      <p class="muted" style="margin:.5em 0 0;font-size:.9rem">While you look: find the key and time signature, the highest and lowest notes, and any tricky rhythms. Tap the pulse.</p>`;
    if (S.phase === "looking") return `<div class="row"><b style="font-size:1.4rem;font-variant-numeric:tabular-nums" id="rdleft">${S.left}</b><span class="muted">seconds to look</span><button class="btn ghost small" data-rd="ready">Ready now</button></div>`;
    if (S.phase === "ready") return `<div class="row"><button class="btn primary" data-rd="play">🎤 Count me in, then play</button><button class="btn ghost" data-rd="self">Mark it myself</button></div>
      <p class="muted" style="margin:.5em 0 0;font-size:.9rem">You'll hear one bar of clicks, then play. Keep going if you slip: in the exam, keeping the pulse matters more than stopping to fix a note.</p>`;
    if (S.phase === "count") return `<div class="singlive" role="status"><b>Counting in…</b></div>`;
    if (S.phase === "listen") return `<div class="singlive" role="status"><div class="row" style="justify-content:space-between"><b>Listening… play now</b><span class="muted" id="singstat">0.0 s</span></div>
      <div class="singnote" id="singnote">Play now</div><div class="singscale" aria-hidden="true"><i class="flat">flat</i><i class="mid"></i><i class="sharp">sharp</i><span id="singneedle"></span></div>
      <div class="row" style="margin-top:8px"><button class="btn small" data-rd="stop">I've finished</button><span class="muted" style="font-size:.85rem">It stops by itself when you go quiet.</span></div></div>`;
    if (S.phase === "self") return `<p style="margin:0 0 8px"><b>How did it go?</b></p><div class="row"><button class="btn" data-rd-self="1">Kept going, nearly every note right</button><button class="btn" data-rd-self=".5">A few slips</button><button class="btn" data-rd-self="0">Not yet</button></div>`;
    if (S.phase === "done") {
      const r = S.result || {}, v = r.val;
      const head = v >= 1 ? "Well played!" : v > 0 ? "Nearly there." : "Keep practising this kind of piece.";
      return `<div class="feedback show ${v >= 1 ? "good" : v > 0 ? "info" : "bad"}" style="margin:0"><b>${head}</b> ${r.html || ""}</div>
        <div class="row" style="margin-top:10px"><button class="btn ghost small" data-rd="hear">▶ Hear how it goes</button><button class="btn primary small" data-rd="new">Next piece</button></div>`;
    }
    return "";
  }
  function paint() { const box = document.getElementById("rdbox"); if (box) box.innerHTML = phaseHTML(); else if (VIEW.tab === "read") render(); }
  function record(val) {
    const p = P(), g = p.readGrade || 1, r = prog(p)[g] = prog(p)[g] || { n: 0, good: 0 };
    r.n++; if (val >= 1) r.good++; r.last = todayStr ? todayStr() : null; save();
  }
  function playedHTML(gr) {
    return singResultHTML(gr).replace("I didn’t hear any singing. Check the microphone, move a little closer and sing on “la”.", "I didn't hear you play. Check the microphone and move a little closer.")
      .replace("Dark line = your voice.", "Dark line = what you played.").replace("Notes in tune", "Notes right").replace("Any octave counts; within a quarter-tone counts as in tune.", "Any octave counts.").split("you sang").join("you played");
  }

  const render0 = render;
  render = function () {
    render0();
    if (VIEW.tab === "read") {
      $$(".tab").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === "read")));
      $("#main").innerHTML = view();
    }
  };
  /* the tab itself */
  const nav = document.querySelector("nav.tabs");
  if (nav && !nav.querySelector("[data-tab=read]")) {
    const b = document.createElement("button"); b.className = "tab"; b.setAttribute("role", "tab"); b.dataset.tab = "read"; b.textContent = "Sight-reading";
    nav.insertBefore(b, nav.querySelector("[data-tab=gym]")); b.addEventListener("click", () => setTab("read"));
    const css = document.createElement("style");
    css.textContent = "nav.tabs{grid-template-columns:repeat(5,minmax(0,1fr))!important}@media (max-width:560px){nav.tabs .tab{font-size:.82rem;padding-inline:2px}}";
    document.head.appendChild(css);
  }

  document.addEventListener("change", e => {
    if (e.target.id === "rdInst") { P().readInst = e.target.value; save(); S.pc = null; render(); }
  });
  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-rd],[data-rd-g],[data-rd-self]"); if (!b || VIEW.tab !== "read") return;
    const p = P(), inst = instOf(p.readInst || "violin");
    if (b.dataset.rdG) { p.readGrade = +b.dataset.rdG; save(); S.pc = null; render(); return; }
    if (b.dataset.rdSelf != null) { const v = +b.dataset.rdSelf; record(v); S.result = { val: v, html: v >= 1 ? "Keeping the pulse through the whole piece is what examiners listen for." : "Look again at the bars that tripped you, then try a new piece." }; S.phase = "done"; paint(); return; }
    const act = b.dataset.rd;
    if (act === "new") { clearInterval(S.timer); try { micClose(); } catch (err) {} S.pc = null; render(); return; }
    if (act === "look") { S.phase = "looking"; S.left = 30; paint(); clearInterval(S.timer); S.timer = setInterval(() => { S.left--; const el = document.getElementById("rdleft"); if (el) el.textContent = S.left; if (S.left <= 0) { clearInterval(S.timer); S.phase = "ready"; paint(); } }, 1000); return; }
    if (act === "ready") { clearInterval(S.timer); S.phase = "ready"; paint(); return; }
    if (act === "self") { S.phase = "self"; paint(); return; }
    if (act === "hear") { playEvents(soundEv(S.pc, inst), S.pc.tempo); return; }
    if (act === "stop") { if (MIC.finish) MIC.finish("done"); return; }
    if (act === "play") {
      S.phase = "count"; paint();
      const ok = await micOpen();
      if (!ok) { S.phase = "self"; paint(); const box = document.getElementById("rdbox"); if (box) box.insertAdjacentHTML("afterbegin", `<div class="feedback show info" style="margin:0 0 8px">${MIC.err === "NotAllowedError" || MIC.err === "SecurityError" ? "The microphone was blocked." : "This browser can't use the microphone."} Mark it yourself instead.</div>`); return; }
      const pc = S.pc, spb = 60 / pc.tempo;
      playEvents(Array.from({ length: pc.beats }, (_, i) => ({ click: true, accent: i === 0, t: i })), pc.tempo);
      setTimeout(() => {
        if (S.pc !== pc) return;
        S.phase = "listen"; paint();
        micListen({ target: target(pc, inst) }, (gr) => {
          if (S.pc !== pc) return;
          const val = gr.heard ? gr.val : 0; if (gr.heard) record(val);
          S.result = { val, html: playedHTML(gr) }; S.phase = "done"; paint();
        });
      }, pc.beats * spb * 1000 - 60);
    }
  });
  window.SIGHTREAD = { makePiece, target, INST, GR, instOf, S, scoreSVG };
})();
