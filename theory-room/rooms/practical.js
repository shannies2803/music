/* The Theory Room: the Practical tab, for the practical exam.
   1. Scales and arpeggios coach: any scale, arpeggio or broken chord in any key, written out for the
      learner's instrument (clef and transposition), played back, and checked note by note with the
      microphone.
   2. Examiner mode: the app asks for scales from the set you choose, as an examiner would, without
      showing the music. You play from memory and mark it (or let the microphone mark it). The app
      keeps a record of which scales are secure.
   3. Practice diary: a practice timer by category (pieces, scales, sight-reading, aural, theory),
      a seven-day chart, a streak and a daily goal, plus a suggested plan for a session.
   Free for everyone. Loaded after sightread.js. */
(function () {
  "use strict";
  if (typeof staffSVG === "undefined" || typeof scaleOf === "undefined" || !window.SIGHTREAD) return;
  const INST = SIGHTREAD.INST, instOf = SIGHTREAD.instOf;

  /* ---------- the scales ---------- */
  const TYPES = [
    { id: "major", t: "Major scale", mode: "major", fam: "Scales" },
    { id: "harmonic", t: "Harmonic minor scale", mode: "minor", fam: "Scales" },
    { id: "melodic", t: "Melodic minor scale", mode: "minor", fam: "Scales" },
    { id: "natural", t: "Natural minor scale", mode: "minor", fam: "Scales" },
    { id: "chromatic", t: "Chromatic scale", mode: "note", fam: "Scales" },
    { id: "arpmaj", t: "Major arpeggio", mode: "major", fam: "Arpeggios" },
    { id: "arpmin", t: "Minor arpeggio", mode: "minor", fam: "Arpeggios" },
    { id: "dom7", t: "Dominant 7th", mode: "major", fam: "Sevenths" },
    { id: "dim7", t: "Diminished 7th", mode: "note", fam: "Sevenths" }
  ];
  const TYPE = Object.fromEntries(TYPES.map(t => [t.id, t]));
  const NOTE_STARTS = ["C", "C#", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  const accCount = k => Math.abs(k);
  function keysFor(mode, maxAcc) {
    if (mode === "note") return NOTE_STARTS.map(s => ({ v: s, t: s.replace("#", "♯").replace("b", "♭"), acc: s.length - 1 }));
    const out = []; for (let k = -7; k <= 7; k++) { if (accCount(k) > maxAcc) continue; const n = mode === "major" ? majorTonic(k) : minorTonic(k); out.push({ v: String(k), t: nm(n), k, acc: accCount(k) }); }
    return out.sort((a, b) => a.acc - b.acc || a.k - b.k);
  }
  const octWord = n => ["", "one octave", "two octaves", "three octaves"][n];
  function label(sc) {
    const T = TYPE[sc.type];
    if (T.mode === "note") return (T.id === "chromatic" ? "Chromatic scale" : "Diminished 7th") + " starting on " + sc.v.replace("#", "♯").replace("b", "♭");
    const k = +sc.v, ton = nm(T.mode === "major" ? majorTonic(k) : minorTonic(k));
    return { major: ton + " major scale", harmonic: ton + " harmonic minor scale", melodic: ton + " melodic minor scale", natural: ton + " natural minor scale",
      arpmaj: ton + " major arpeggio", arpmin: ton + " minor arpeggio", dom7: "Dominant 7th in the key of " + ton + " major" }[T.id];
  }
  const SH = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"], FL = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  function spell(m, flats) { const s = (flats ? FL : SH)[((m % 12) + 12) % 12]; return parseN(s + (Math.floor(m / 12) - 1)); }
  function startNote(sc) {
    const T = TYPE[sc.type];
    if (T.mode === "note") return parseN(sc.v + "4");
    const k = +sc.v, t = T.mode === "major" ? majorTonic(k) : minorTonic(k);
    return T.id === "dom7" ? upBy(t, 5, "P") : t;
  }
  /* written notes, ascending then descending, starting in the lowest octave the instrument can play */
  function notesOf(sc, inst) {
    const T = TYPE[sc.type], oct = sc.oct;
    let s = startNote(sc);
    while (midiOf(s) - 12 >= inst.low) s = N(s.L, s.acc, s.oct - 1);
    while (midiOf(s) < inst.low) s = N(s.L, s.acc, s.oct + 1);
    const up8 = n => N(n.L, n.acc, n.oct + 1);
    let cell, down = null;
    if (T.id === "chromatic") {
      const m0 = midiOf(s), flats = s.acc < 0, up = [s];
      for (let i = 1; i <= 12 * oct; i++) up.push(i % 12 === 0 ? N(s.L, s.acc, s.oct + i / 12) : spell(m0 + i, flats));
      const dn = []; for (let i = 12 * oct - 1; i >= 0; i--) dn.push(i % 12 === 0 ? N(s.L, s.acc, s.oct + i / 12) : spell(m0 + i, true));
      return up.concat(dn);
    }
    if (["major", "harmonic", "melodic", "natural"].includes(T.id)) { cell = scaleOf(s, T.id).slice(0, 7); if (T.id === "melodic") down = scaleOf(s, "natural").slice(0, 7); }
    else if (T.id === "arpmaj") cell = [s, upBy(s, 3, "M"), upBy(s, 5, "P")];
    else if (T.id === "arpmin") cell = [s, upBy(s, 3, "m"), upBy(s, 5, "P")];
    else if (T.id === "dom7") cell = [s, upBy(s, 3, "M"), upBy(s, 5, "P"), upBy(s, 7, "m")];
    else if (T.id === "dim7") cell = [s, upBy(s, 3, "m"), upBy(s, 5, "d"), upBy(s, 7, "d")];
    const build = c => { const out = []; for (let o = 0; o < oct; o++) c.forEach(n => out.push(N(n.L, n.acc, n.oct + o))); return out; };
    const up = build(cell).concat([N(s.L, s.acc, s.oct + oct)]);
    const dn = (down ? build(down).concat([N(s.L, s.acc, s.oct + oct)]) : up).slice().reverse().slice(1);
    let all = up.concat(dn);
    if (T.id === "dom7") { const ton = T.mode === "major" ? majorTonic(+sc.v) : null; if (ton) { let r = N(ton.L, ton.acc, s.oct - 1); while (midiOf(r) <= midiOf(s)) r = up8(r); all.push(r); } }
    return all;
  }
  function keyOfScale(sc) { return TYPE[sc.type].mode === "note" ? 0 : +sc.v; }
  function svgOf(sc, inst) {
    const notes = notesOf(sc, inst), k = keyOfScale(sc), state = {};
    const events = notes.map(n => {
      const ka = keyAcc(k, n.L), cur = n.L in state ? state[n.L] : ka, shown = n.acc !== cur; state[n.L] = n.acc;
      return { keys: [n], d: .5, cautious: shown && n.acc === ka };
    });
    return staffSVG({ clef: inst.clef, key: k, events: events.concat([{ bar: "end" }]), spacing: notes.length > 30 ? 22 : 26 });
  }
  const sounding = (sc, inst) => notesOf(sc, inst).map(n => midiOf(n) + inst.tr);
  const scKey = sc => sc.type + "|" + sc.v + "|" + sc.oct;
  const scFrom = key => { const a = key.split("|"); return { type: a[0], v: a[1], oct: +a[2] }; };

  /* ---------- state ---------- */
  const S = { mode: "coach", sc: { type: "major", v: "0", oct: 1 }, tempo: 80, phase: "idle", res: null, ask: null, shown: false,
    tm: { on: false, t0: 0, acc: 0, cat: "pieces", tick: 0 } };
  const prog = p => p.scl = p.scl || {};
  const set = p => p.sclSet = p.sclSet || { types: ["major", "harmonic", "melodic", "arpmaj", "arpmin"], acc: 2, oct: 1 };
  function recordScale(sc, val) {
    const p = P(), r = prog(p)[scKey(sc)] = prog(p)[scKey(sc)] || { n: 0, good: 0, h: [] };
    r.n++; if (val >= 1) r.good++; r.h = (r.h || []).concat([val]).slice(-5); r.last = todayStr(); save();
    logMinutes("scales", .5);
  }
  const secure = r => r && r.h && r.h.length >= 2 && r.h.slice(-2).every(v => v >= 1);

  /* ---------- practice diary ---------- */
  const CATS = [["pieces", "Pieces", "var(--teal)"], ["scales", "Scales & technical", "var(--brass-strong)"], ["sight", "Sight-reading", "var(--rose)"], ["aural", "Aural", "#6a7fdb"], ["theory", "Theory", "#7a9a4a"], ["other", "Other", "var(--muted)"]];
  const pr = p => p.prac = p.prac || {};
  function logMinutes(cat, mins) { const p = P(), d = pr(p)[todayStr()] = pr(p)[todayStr()] || {}; d[cat] = Math.round(((d[cat] || 0) + mins) * 10) / 10; save(); }
  const dayTotal = d => Object.values(d || {}).reduce((a, b) => a + b, 0);
  function pracStreak(p) { let n = 0; const d = new Date(); if (dayTotal(pr(p)[todayStr(d)]) < 1) d.setDate(d.getDate() - 1); while (dayTotal(pr(p)[todayStr(d)]) >= 1) { n++; d.setDate(d.getDate() - 1); } return n; }
  function weekChart(p) {
    const goal = p.pracGoal || 20, days = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push([todayStr(d), d]); }
    const mx = Math.max(goal * 1.25, ...days.map(d => dayTotal(pr(p)[d[0]])));
    let s = `<svg viewBox="0 0 420 150" style="width:100%;max-width:560px" role="img" aria-label="Minutes practised, last 7 days">`;
    const y = v => 112 - 96 * v / mx;
    s += `<line x1="0" x2="420" y1="${y(goal)}" y2="${y(goal)}" stroke="var(--brass-strong)" stroke-dasharray="4 4"/><text x="418" y="${y(goal) - 4}" text-anchor="end" class="sf" font-size="10">goal ${goal} min</text>`;
    days.forEach(([k, d], i) => {
      const rec = pr(p)[k] || {}; let acc = 0; const x = i * 60 + 12;
      CATS.forEach(([c, , col]) => { const v = rec[c] || 0; if (!v) return; s += `<rect x="${x}" y="${y(acc + v)}" width="36" height="${y(acc) - y(acc + v)}" fill="${col}"><title>${k}: ${esc(c)} ${Math.round(v)} min</title></rect>`; acc += v; });
      s += `<text x="${x + 18}" y="130" text-anchor="middle" class="sf" font-size="11">${"SMTWTFS"[d.getDay()]}</text><text x="${x + 18}" y="145" text-anchor="middle" class="sf" font-size="10">${acc ? Math.round(acc) : ""}</text>`;
    });
    return s + "</svg>";
  }
  const fmt = ms => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const elapsed = () => S.tm.acc + (S.tm.on ? Date.now() - S.tm.t0 : 0);
  function planFor(mins) {
    const parts = [["Warm up, then scales and arpeggios", .2], ["Pieces: the hardest bars first, slowly, then run-throughs", .5], ["Sight-reading: one new piece", .15], ["Aural: a test or two", .15]];
    return `<ol style="margin:.4em 0 0;padding-left:1.2em">${parts.map(([t, f]) => `<li><b>${Math.max(2, Math.round(mins * f))} min</b> · ${t}</li>`).join("")}</ol>`;
  }

  /* ---------- views ---------- */
  function instSelect(p, inst) { return `<label for="pcInst" style="font-weight:700">Instrument</label><select id="pcInst" style="font:inherit;min-height:40px;border-radius:10px;padding:4px 10px">${INST.map(i => `<option value="${esc(i.id)}"${i.id === inst.id ? " selected" : ""}>${esc(i.name)}</option>`).join("")}</select>`; }
  function playRow() {
    if (S.phase === "listen") return `<div class="singlive" role="status"><div class="row" style="justify-content:space-between"><b>Listening… play now</b><span class="muted" id="singstat">0.0 s</span></div>
      <div class="singnote" id="singnote">Play now</div><div class="singscale" aria-hidden="true"><i class="flat">flat</i><i class="mid"></i><i class="sharp">sharp</i><span id="singneedle"></span></div>
      <div class="row" style="margin-top:8px"><button class="btn small" data-pc="stop">I've finished</button><span class="muted" style="font-size:.85rem">It stops by itself when you go quiet.</span></div></div>`;
    if (S.phase === "self") return `<p style="margin:0 0 8px"><b>How did it go?</b></p><div class="row"><button class="btn" data-pc-self="1">Secure: even and every note right</button><button class="btn" data-pc-self=".5">Hesitant or a slip</button><button class="btn" data-pc-self="0">Not yet</button></div>`;
    if (S.phase === "done" && S.res) return `<div class="feedback show ${S.res.val >= 1 ? "good" : S.res.val > 0 ? "info" : "bad"}" style="margin:0"><b>${S.res.val >= 1 ? "Secure!" : S.res.val > 0 ? "Nearly." : "Not yet."}</b> ${S.res.html || ""}</div>`;
    return "";
  }
  function coach(p, inst) {
    const sc = S.sc, T = TYPE[sc.type], ks = keysFor(T.mode, 7);
    if (!ks.some(k => k.v === sc.v)) sc.v = ks[0].v;
    const r = prog(p)[scKey(sc)];
    return `<section class="panel">
      <div class="row" style="gap:8px;flex-wrap:wrap"><label for="pcType" style="font-weight:700">Play</label>
       <select id="pcType" style="font:inherit;min-height:40px;border-radius:10px;padding:4px 10px">${["Scales", "Arpeggios", "Sevenths"].map(f => `<optgroup label="${f}">${TYPES.filter(t => t.fam === f).map(t => `<option value="${t.id}"${t.id === sc.type ? " selected" : ""}>${t.t}</option>`).join("")}</optgroup>`).join("")}</select>
       <label for="pcKey" style="font-weight:700">${T.mode === "note" ? "Starting on" : T.id === "dom7" ? "In the key of" : "Key"}</label>
       <select id="pcKey" style="font:inherit;min-height:40px;border-radius:10px;padding:4px 10px">${ks.map(k => `<option value="${k.v}"${k.v === sc.v ? " selected" : ""}>${esc(k.t)}${T.mode === "minor" ? " minor" : T.mode === "major" ? " major" : ""}</option>`).join("")}</select>
       ${[1, 2, 3].map(o => `<button class="gbtn" data-pc-oct="${o}" aria-pressed="${o === sc.oct}">${o} oct</button>`).join("")}</div>
      <div class="row" style="justify-content:space-between;margin-top:10px"><h3 style="margin:0">${esc(label(sc))}, ${octWord(sc.oct)}</h3>${r ? `<span class="pill">${r.good}/${r.n} secure${secure(r) ? " ✓" : ""}</span>` : ""}</div>
      <div class="notation" style="margin:10px 0;overflow-x:auto">${svgOf(sc, inst)}</div>
      <div class="row" style="gap:8px"><button class="btn ghost" data-pc="hear">▶ Hear it</button>${[60, 80, 100, 120].map(t => `<button class="gbtn" data-pc-tempo="${t}" aria-pressed="${t === S.tempo}" style="min-width:0">♪ = ${t * 2}</button>`).join("")}</div>
      <div class="row" style="gap:8px;margin-top:10px"><button class="btn primary" data-pc="mic">🎤 Play it: check my notes</button><button class="btn ghost" data-pc="selfmark">Mark it myself</button></div>
      <div id="pcbox" style="margin-top:10px">${playRow()}</div>
      <p class="muted" style="font-size:.88rem;margin:.6em 0 0">${tip(sc)}</p></section>`;
  }
  function tip(sc) {
    const T = TYPE[sc.type];
    return {
      major: "Major scales follow tone, tone, semitone, tone, tone, tone, semitone. Keep the semitones (3–4 and 7–8) close and even.",
      harmonic: "The harmonic minor raises the 7th note, going up and coming down. Mind the wide step (an augmented 2nd) between the 6th and 7th.",
      melodic: "The melodic minor raises the 6th and 7th going up, then uses the key signature coming down. Think: up bright, down dark.",
      natural: "The natural minor uses just the key signature: the same notes as its relative major.",
      chromatic: "Every semitone in turn. Examiners listen for evenness: count the notes in groups of four to keep them steady.",
      arpmaj: "Root, 3rd and 5th of the major chord. Aim for smooth shifts between the notes and a steady pulse.",
      arpmin: "Root, 3rd and 5th of the minor chord: the 3rd is a semitone lower than in the major arpeggio.",
      dom7: "Starts on the dominant (the 5th note of the key) and adds the minor 7th; it falls home to the tonic at the end.",
      dim7: "A stack of minor 3rds. Each note is three semitones above the last."
    }[T.id] + " Boards set different lists for each instrument and grade, so check your syllabus for the exact requirements (range, articulation and speed).";
  }
  function examiner(p, inst) {
    const st = set(p), all = setList(p), done = all.filter(k => secure(prog(p)[k])).length;
    const head = `<section class="panel"><h3 style="margin-top:0">Your scale set</h3>
      <div class="chips" role="group" aria-label="Scale types">${TYPES.map(t => `<button class="gbtn" data-pc-st="${t.id}" aria-pressed="${st.types.includes(t.id)}" style="min-height:40px">${t.t.replace(" scale", "")}</button>`).join("")}</div>
      <div class="row" style="margin-top:10px;gap:8px"><span style="font-weight:700">Keys up to</span>${[0, 1, 2, 3, 4, 5, 6, 7].map(a => `<button class="gbtn" data-pc-sacc="${a}" aria-pressed="${a === st.acc}" style="min-width:44px">${a}</button>`).join("")}<span class="muted">sharps or flats</span></div>
      <div class="row" style="margin-top:8px;gap:8px"><span style="font-weight:700">Range</span>${[1, 2, 3].map(o => `<button class="gbtn" data-pc-soct="${o}" aria-pressed="${o === st.oct}">${octWord(o)}</button>`).join("")}</div>
      <p class="muted" style="margin:.6em 0 0">${all.length} scales and arpeggios in this set · <b>${done}</b> secure (right twice in a row).</p></section>`;
    let ask = "";
    if (S.ask) {
      const sc = S.ask;
      ask = `<section class="panel" style="margin-top:14px;border:2px solid var(--teal)"><div class="kicker">The examiner asks</div><h2 style="margin:.2em 0">${esc(label(sc))}, ${octWord(sc.oct)}</h2>
        ${S.shown ? `<div class="notation" style="margin:10px 0;overflow-x:auto">${svgOf(sc, inst)}</div>` : `<p class="muted" style="margin:.2em 0 .6em">Play it from memory, as in the exam. Take a breath, think of the key, then start.</p>`}
        <div class="row" style="gap:8px"><button class="btn primary" data-pc="mic">🎤 Listen to me</button><button class="btn ghost" data-pc="selfmark">Mark it myself</button>${S.shown ? `<button class="btn ghost" data-pc="hear">▶ Hear it</button>` : `<button class="btn ghost" data-pc="show">Show me the notes</button>`}</div>
        <div id="pcbox" style="margin-top:10px">${playRow()}</div>
        ${S.phase === "done" ? `<div class="row" style="margin-top:10px"><button class="btn primary" data-pc="ask">Next scale</button>${S.shown ? "" : `<button class="btn ghost small" data-pc="show">Show the notes</button>`}</div>` : ""}</section>`;
    } else ask = `<div class="row" style="margin-top:14px"><button class="btn primary" data-pc="ask" ${all.length ? "" : "disabled"}>Ask me a scale</button><span class="muted">Scales you find hard come up more often.</span></div>`;
    const rows = all.map(k => [k, prog(p)[k]]).filter(x => x[1]).sort((a, b) => (a[1].good / a[1].n) - (b[1].good / b[1].n)).slice(0, 12);
    const table = rows.length ? `<section class="panel" style="margin-top:14px"><h3 style="margin-top:0">How your set is going</h3>${rows.map(([k, r]) => `<div class="barrow"><span>${esc(label(scFrom(k)))}</span><div class="bar"><i class="${r.good / r.n < .6 ? "lo" : r.good / r.n < .8 ? "mid" : ""}" style="width:${Math.round(100 * r.good / r.n)}%"></i></div><span class="muted" style="font-size:.85rem">${secure(r) ? "✓ " : ""}${r.good}/${r.n}</span></div>`).join("")}</section>` : "";
    return head + ask + table;
  }
  function setList(p) {
    const st = set(p), out = [];
    st.types.forEach(id => keysFor(TYPE[id].mode, st.acc).forEach(k => { if (TYPE[id].mode === "note" && k.acc > 0 && st.acc < 2) return; out.push(scKey({ type: id, v: k.v, oct: st.oct })); }));
    return out;
  }
  function askNext(p) {
    const all = setList(p); if (!all.length) return;
    const w = all.map(k => { const r = prog(p)[k]; return [k, !r ? 1.2 : secure(r) ? .3 : 1.6 - r.good / r.n]; }).filter(x => !S.ask || x[0] !== scKey(S.ask));
    let x = Math.random() * w.reduce((a, b) => a + b[1], 0); for (const [k, v] of w) { x -= v; if (x <= 0) { S.ask = scFrom(k); break; } }
    if (!S.ask || (w.length && x > 0)) S.ask = scFrom(w[0][0]);
    S.shown = false; S.phase = "idle"; S.res = null;
  }
  function diary(p) {
    const goal = p.pracGoal || 20, today = pr(p)[todayStr()] || {}, tot = dayTotal(today);
    let week = 0; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); week += dayTotal(pr(p)[todayStr(d)]); }
    return `<div class="statgrid"><div class="stat"><b>${Math.round(tot)}</b><span>minutes today</span></div><div class="stat"><b>${Math.round(week)}</b><span>minutes this week</span></div><div class="stat"><b>${pracStreak(p)}</b><span>day practice streak</span></div><div class="stat"><b>${goal}</b><span>minute daily goal</span></div></div>
      <section class="panel"><h3 style="margin-top:0">Practice timer</h3>
       <div class="chips" role="group" aria-label="What are you practising?">${CATS.map(([c, t]) => `<button class="gbtn" data-pc-cat="${c}" aria-pressed="${S.tm.cat === c}" style="min-height:40px">${t}</button>`).join("")}</div>
       <div class="row" style="margin-top:12px;gap:12px"><b id="pctime" style="font-size:2.2rem;font-variant-numeric:tabular-nums">${fmt(elapsed())}</b>
        ${S.tm.on ? `<button class="btn" data-pc="pause">Pause</button>` : `<button class="btn primary" data-pc="start">${S.tm.acc ? "Carry on" : "Start"}</button>`}${S.tm.on || elapsed() >= 1000 ? `<button class="btn ghost" data-pc="saveTime">Stop and save</button>` : ""}</div>
       <div class="row" style="margin-top:10px;gap:8px"><label for="pcMins">Or add minutes you've done:</label><input id="pcMins" type="number" min="1" max="240" style="width:80px;font:inherit;min-height:40px;border-radius:10px;padding:4px 8px" aria-label="Minutes"><button class="btn small" data-pc="addMins">Add</button></div></section>
      <section class="panel" style="margin-top:14px"><h3 style="margin-top:0">The last seven days</h3>${weekChart(p)}
       <div class="chips">${CATS.map(([c, t, col]) => `<span class="chip" style="border-left:10px solid ${col}">${t}</span>`).join("")}</div>
       <div class="row" style="margin-top:10px;gap:8px"><span style="font-weight:700">Daily goal</span>${[10, 20, 30, 45, 60].map(g => `<button class="gbtn" data-pc-goal="${g}" aria-pressed="${g === goal}" style="min-width:52px">${g}</button>`).join("")}<span class="muted">minutes</span></div></section>
      <section class="panel" style="margin-top:14px"><h3 style="margin-top:0">A ${goal}-minute session</h3>${planFor(goal)}
       <p class="muted" style="margin:.6em 0 0;font-size:.9rem">Short and often beats long and rare. In the last month before a practical exam, play your pieces through to someone once a week, as if it were the exam.</p></section>`;
  }
  function view() {
    const p = P(), inst = instOf(p.readInst || (p.inst && p.inst[0]) || "violin");
    const tabs = [["coach", "Scales coach"], ["exam", "Examiner mode"], ["diary", "Practice diary"]];
    return `<h2>Practical exam</h2><p class="muted" style="margin-top:0">Scales and arpeggios for your instrument, an examiner who asks for them, and a practice diary. Sight-reading and aural have their own tabs.</p>
      <div class="gradebar" role="tablist" aria-label="Practical">${tabs.map(([id, t]) => `<button class="gbtn" data-pc-mode="${id}" aria-pressed="${S.mode === id}">${t}</button>`).join("")}</div>
      ${S.mode !== "diary" ? `<div class="row" style="gap:10px;margin:0 0 10px">${instSelect(p, inst)}</div>` : ""}
      ${S.mode === "coach" ? coach(p, inst) : S.mode === "exam" ? examiner(p, inst) : diary(p)}`;
  }

  /* ---------- the tab ---------- */
  const render0 = render;
  render = function () {
    render0();
    if (VIEW.tab === "prac") { $$(".tab").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === "prac"))); $("#main").innerHTML = view(); }
  };
  const nav = document.querySelector("nav.tabs");
  if (nav && !nav.querySelector("[data-tab=prac]")) {
    const b = document.createElement("button"); b.className = "tab"; b.setAttribute("role", "tab"); b.dataset.tab = "prac"; b.textContent = "Practical";
    nav.insertBefore(b, nav.querySelector("[data-tab=gym]")); b.addEventListener("click", () => setTab("prac"));
    const css = document.createElement("style");
    css.textContent = "nav.tabs{grid-template-columns:repeat(6,minmax(0,1fr))!important}@media (max-width:620px){nav.tabs .tab{font-size:.74rem;padding-inline:1px}}";
    document.head.appendChild(css);
  }
  const cur = () => S.mode === "exam" ? S.ask : S.sc;
  function paintBox() { const b = document.getElementById("pcbox"); if (b) b.innerHTML = playRow(); }
  setInterval(() => { if (!S.tm.on) return; const el = document.getElementById("pctime"); if (el) el.textContent = fmt(elapsed()); }, 500);

  document.addEventListener("change", e => {
    if (VIEW.tab !== "prac") return; const p = P();
    if (e.target.id === "pcInst") { p.readInst = e.target.value; save(); render(); }
    if (e.target.id === "pcType") { S.sc.type = e.target.value; S.phase = "idle"; S.res = null; render(); }
    if (e.target.id === "pcKey") { S.sc.v = e.target.value; S.phase = "idle"; S.res = null; render(); }
  });
  document.addEventListener("click", async e => {
    if (VIEW.tab !== "prac") return;
    const b = e.target.closest("[data-pc],[data-pc-mode],[data-pc-oct],[data-pc-tempo],[data-pc-self],[data-pc-st],[data-pc-sacc],[data-pc-soct],[data-pc-cat],[data-pc-goal]"); if (!b) return;
    const p = P(), inst = instOf(p.readInst || (p.inst && p.inst[0]) || "violin"), d = b.dataset;
    if (d.pcMode) { S.mode = d.pcMode; S.phase = "idle"; S.res = null; try { micClose(); } catch (err) {} render(); return; }
    if (d.pcOct) { S.sc.oct = +d.pcOct; S.phase = "idle"; S.res = null; render(); return; }
    if (d.pcTempo) { S.tempo = +d.pcTempo; render(); return; }
    if (d.pcSt) { const st = set(p), i = st.types.indexOf(d.pcSt); if (i >= 0) st.types.splice(i, 1); else st.types.push(d.pcSt); S.ask = null; save(); render(); return; }
    if (d.pcSacc) { set(p).acc = +d.pcSacc; S.ask = null; save(); render(); return; }
    if (d.pcSoct) { set(p).oct = +d.pcSoct; S.ask = null; save(); render(); return; }
    if (d.pcCat) { if (S.tm.on && elapsed() >= 1000) { logMinutes(S.tm.cat, elapsed() / 60000); S.tm.acc = 0; S.tm.t0 = Date.now(); } S.tm.cat = d.pcCat; render(); return; }
    if (d.pcGoal) { p.pracGoal = +d.pcGoal; save(); render(); return; }
    if (d.pcSelf != null) { const v = +d.pcSelf; recordScale(cur(), v); S.res = { val: v, html: v >= 1 ? "Two secure tries in a row marks it as secure in your set." : "Play it slowly three times, then try it at speed." }; S.phase = "done"; S.mode === "exam" ? render() : paintBox(); return; }
    const act = d.pc;
    if (act === "hear") { const ms = sounding(cur(), inst); playEvents(ms.map((m, i) => ({ m, t: i * .5, d: .5, v: .75 })), S.tempo); return; }
    if (act === "selfmark") { S.phase = "self"; paintBox(); return; }
    if (act === "show") { S.shown = true; render(); return; }
    if (act === "ask") { askNext(p); render(); return; }
    if (act === "stop") { if (MIC.finish) MIC.finish("done"); return; }
    if (act === "mic") {
      const sc = cur(); if (!sc) return;
      const ok = await micOpen();
      if (!ok) { S.phase = "self"; paintBox(); const box = document.getElementById("pcbox"); if (box) box.insertAdjacentHTML("afterbegin", `<div class="feedback show info" style="margin:0 0 8px">${MIC.err === "NotAllowedError" || MIC.err === "SecurityError" ? "The microphone was blocked." : "This browser can't use the microphone."} Mark it yourself instead.</div>`); return; }
      S.phase = "listen"; paintBox();
      const target = sounding(sc, inst).map(m => ({ m, d: .5 }));
      micListen({ target }, gr => {
        if (cur() !== sc) return;
        const val = gr.heard ? gr.val : 0; if (gr.heard) recordScale(sc, val);
        const html = singResultHTML(gr).replace("I didn’t hear any singing. Check the microphone, move a little closer and sing on “la”.", "I didn't hear you play. Check the microphone and move a little closer.")
          .replace("Dark line = your voice.", "Dark line = what you played.").replace("Notes in tune", "Notes right").split("you sang").join("you played");
        S.res = { val, html }; S.phase = "done"; S.mode === "exam" ? render() : paintBox();
      });
      return;
    }
    if (act === "start") { S.tm.on = true; S.tm.t0 = Date.now(); render(); return; }
    if (act === "pause") { S.tm.acc = elapsed(); S.tm.on = false; render(); return; }
    if (act === "saveTime") { const m = elapsed() / 60000; S.tm = { on: false, t0: 0, acc: 0, cat: S.tm.cat }; if (m >= .05) { logMinutes(S.tm.cat, m); toast(`Saved ${Math.max(1, Math.round(m))} minute${Math.round(m) === 1 ? "" : "s"} of ${CATS.find(c => c[0] === S.tm.cat)[1].toLowerCase()}.`); } render(); return; }
    if (act === "addMins") { const v = +(document.getElementById("pcMins") || {}).value; if (!(v > 0 && v <= 240)) { toast("Type the minutes first (1 to 240)."); return; } logMinutes(S.tm.cat, v); toast("Added."); render(); return; }
  });
  if (new URLSearchParams(location.search).get("tab") === "prac") Promise.resolve(window.TR && TR.ready).then(() => setTimeout(() => setTab("prac"), 30));
  window.PRACTICAL = { notesOf, label, TYPES, keysFor, setList, S, logMinutes, pracStreak, dayTotal, secure };
})();
