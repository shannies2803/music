/* The Theory Room: guided courses for ABRSM Grades 7 and 8, inside the theory tab.
   This file is public: the course engine, two new kinds of question (suspensions; from a bass and its
   figures to the chord) and their drill lessons. The day-by-day courses themselves are in
   course-g7.js and course-g8.js, which the server only sends to families whose plan includes them.
   Loaded after the app, aural-tr.js and trinity-theory.js. */
(function () {
  "use strict";
  if (typeof TGEN === "undefined" || typeof LESSON_BY === "undefined") return;

  /* ---------- new questions ---------- */
  const keyIn = (k, mode) => { const t = mode === "minor" ? minorTonic(k) : majorTonic(k); return scaleOf(N(t.L, t.acc, 4), mode === "minor" ? "harmonic" : "major"); };
  const SUS_FACTS = [
    ["What are the three stages of a suspension, in order?", "preparation, suspension, resolution", ["suspension, preparation, resolution", "resolution, preparation, suspension", "preparation, resolution, suspension"], "The note is <b>prepared</b> as a consonance in one chord, <b>held</b> (suspended) while the harmony changes under it, then <b>resolves</b>."],
    ["On which kind of beat does the suspended (clashing) note usually fall?", "a strong beat", ["a weak beat", "the last quaver of the bar", "any beat, it doesn't matter"], "The clash lands on a <b>strong beat</b>; the resolution comes on a weaker one. That's what gives a suspension its ache."],
    ["How does a suspension in an upper part normally resolve?", "down by step", ["up by step", "down by a 3rd", "it stays where it is"], "Upper-part suspensions resolve <b>down by step</b> (an ‘upward resolution’ is called a retardation and is much rarer)."],
    ["What do the figures 4 3 under a bass note mean?", "the 4th above the bass falls to the 3rd", ["the 3rd above the bass rises to the 4th", "play chord IV then chord III", "a 4th and a 3rd sound together"], "Figures read left to right in time: the <b>4th</b> above the bass is held, then falls to the <b>3rd</b>."],
    ["What do the figures 7 6 under a bass note usually show?", "a suspension over a first-inversion chord", ["a dominant 7th in first inversion", "a suspension over a root-position chord", "chord VII then chord VI"], "In 7–6 the clash resolves to a <b>6th above the bass</b>, so the chord it lands on is in <b>first inversion</b>."],
    ["Which suspension needs care so it isn't heard as two octaves in a row?", "9–8", ["4–3", "7–6", "2–3"], "In <b>9–8</b> the resolution makes an octave with the bass, so the note it resolves to must not already be doubled above, and the resolution mustn't be approached in octaves."]
  ];
  const SUS_FACTS8 = [
    ["In a bass suspension (figured 2 3 or 4 2 → 6), which part is held over?", "the bass", ["the soprano", "the alto", "the tenor"], "In a <b>bass suspension</b> the bass is held while the upper parts move; then the bass falls a step, turning the 2nd into a 3rd."],
    ["A chain of suspensions over a falling bass, figured 7 6 7 6 7 6, is most typical of…", "Baroque sequences", ["twelve-bar blues", "serial music", "a march trio"], "Chains of 7–6 (or 4–3) suspensions over a stepwise bass are a classic <b>Baroque sequence</b>, very useful in a trio-sonata continuation."],
    ["What does the figure ♯ on its own under a bass note mean?", "sharpen the 3rd above the bass", ["sharpen the bass note", "sharpen every note in the chord", "play the chord a semitone higher"], "An accidental on its own refers to the <b>3rd above the bass</b>."]
  ];
  TGEN.c78sus = (p) => {
    const r = Math.random();
    if (r < 0.3) {
      const x = pick(p.g >= 8 ? SUS_FACTS.concat(SUS_FACTS8) : SUS_FACTS);
      return { prompt: x[0], options: shuffle([x[1], ...x[2]]).map(v => opt(v)), answer: x[1], explain: x[3] };
    }
    if (r < 0.5) {
      const T = [["4–3", "a 4th above the bass and falls to a 3rd"], ["7–6", "a 7th above the bass and falls to a 6th"], ["9–8", "a 9th above the bass and falls to an octave"]].concat(p.g >= 8 ? [["2–3", "held in the bass, which falls a step so a 2nd above it becomes a 3rd"]] : []);
      const x = pick(T);
      return { prompt: `The suspended note is ${x[1]}. Which suspension is it?`, options: shuffle(T.map(t => t[0]).concat(p.g >= 8 ? [] : ["2–3"])).map(v => opt(v)), answer: x[0],
        explain: `That's a <b>${x[0]}</b> suspension: the figures name the clash and then its resolution.` };
    }
    const mode = Math.random() < 0.35 ? "minor" : "major", k = rnd(7) - 3, sc = keyIn(k, mode);
    const type = pick(["4–3", "4–3", "9–8", "7–6"]);
    const deg = pick(mode === "minor" ? [1, 4, 5] : [1, 4, 5, 6]);
    const at = i => sc[((i % 7) + 7) % 7];
    let bass, susp, res, chord;
    if (type === "4–3") { bass = at(deg - 1); susp = at(deg + 2); res = at(deg + 1); chord = ROMAN[deg - 1]; }
    else if (type === "9–8") { bass = at(deg - 1); susp = at(deg); res = at(deg - 1); chord = ROMAN[deg - 1]; }
    else { bass = at(deg + 1); susp = at(deg); res = at(deg - 1); chord = ROMAN[deg - 1] + "b"; }
    const right = nm(susp) + " → " + nm(res);
    const wrong = [nm(res) + " → " + nm(susp), nm(at(deg + 2)) + " → " + nm(at(deg + 3)), nm(at(deg)) + " → " + nm(at(deg + 1)), nm(at(deg + 3)) + " → " + nm(at(deg + 2)), nm(at(deg - 2)) + " → " + nm(at(deg - 1))];
    const options = [right].concat(shuffle([...new Set(wrong)].filter(w => w !== right)).slice(0, 3));
    return { prompt: `In ${keyName(k, mode)}, chord <b>${chord}</b> has a <b>${type}</b> suspension over the bass note ${nm(bass)}. Which note is suspended, and where does it go?`,
      options: shuffle(options).map(v => opt(v)), answer: right,
      explain: `Count up from the bass ${nm(bass)}: the ${type.split("–")[0] === "9" ? "9th" : type.split("–")[0] === "7" ? "7th" : "4th"} is <b>${nm(susp)}</b>, which falls by step to <b>${nm(res)}</b>, a note of chord ${chord}. ${nm(susp)} must be in the chord before, so it can be prepared.` };
  };

  TGEN.c78fig = (p) => {
    const mode = Math.random() < 0.35 ? "minor" : "major", k = rnd(9) - 4, sc = keyIn(k, mode), key = keyName(k, mode);
    /* in a minor key, what goes under the dominant to raise the leading note */
    if (mode === "minor" && p.acc && Math.random() < 0.3) {
      const lt = sc[6], inSig = keyIn(k, "major").find(n => n.L === lt.L), sym = lt.acc - inSig.acc === 1 && lt.acc === 0 ? "♮" : "♯";
      const sev = Math.random() < 0.5, ans = sev ? figHTML(["7", sym]) : `<span class="fig"><span>${sym}</span><span>&nbsp;</span></span>`;
      const other = sym === "♯" ? "♮" : "♯";
      const opts = sev ? [["a", figHTML(["7", sym])], ["b", figHTML(["7", ""])], ["c", figHTML(["7", other])], ["d", figHTML(["6", sym])]]
                       : [["a", `<span class="fig"><span>${sym}</span><span>&nbsp;</span></span>`], ["b", `<span class="fig"><span>${other}</span><span>&nbsp;</span></span>`], ["c", figHTML(["6", ""])], ["d", `<span class="fig"><span>♭</span><span>&nbsp;</span></span>`]];
      return { prompt: `In ${key}, the bass is ${nm(sc[4])} and the chord is <b>V${sev ? "7" : ""}</b> in root position. The leading note ${nm(lt)} isn't in the key signature. What goes under the bass?`,
        options: shuffle(opts).map(o => opt(o[0], o[1])), answer: "a",
        explain: `An accidental on its own (or beside a figure) means the <b>3rd above the bass</b>. ${nm(lt)} needs a ${sym}, so you write ${ans}.` };
    }
    const sev = p.sev === "mix" ? Math.random() < 0.45 : p.sev === "v" ? Math.random() < 0.4 : false;
    const degs = sev && p.sev === "v" ? [2, 5] : p.degs.filter(d => !(mode === "minor" && d === 3));
    const deg = pick(degs), invs = sev ? ["a", "b", "c", "d"] : ["a", "b", "c"], inv = pick(invs), bi = invs.indexOf(inv);
    const bass = sc[(deg - 1 + 2 * bi) % 7];
    const name = ROMAN[deg - 1] + (sev ? "7" : "") + (inv === "a" ? "" : inv), fig = FIG[sev ? inv + "7" : inv];
    if (Math.random() < 0.55) {
      const pool = []; degs.forEach(d => (sev ? ["", "b", "c", "d"] : ["", "b", "c"]).forEach(i => pool.push(ROMAN[d - 1] + (sev ? "7" : "") + i)));
      const sameBass = []; degs.forEach(d => invs.forEach((iv, j) => { if ((d - 1 + 2 * j) % 7 === (deg - 1 + 2 * bi) % 7) sameBass.push(ROMAN[d - 1] + (sev ? "7" : "") + (iv === "a" ? "" : iv)); }));
      const others = shuffle([...new Set(sameBass.concat(shuffle(pool)))].filter(x => x !== name)).slice(0, 4);
      return { prompt: `In ${key}, the bass note is <b>${nm(bass)}</b> with the figures ${figHTML(fig)}. Which chord is it?`, options: shuffle([name, ...others]).map(v => opt(v)), answer: name,
        explain: `Count up from ${nm(bass)}: the figures ${figHTML(fig)} put the ${["root", "3rd", "5th", "7th"][bi]} of the chord in the bass, so the root is <b>${nm(sc[deg - 1])}</b>: chord <b>${name}</b>.` };
    }
    const fo = sev ? ["a7", "b7", "c7", "d7", "b"] : ["a", "b", "c", "b7", "c7"];
    return { prompt: `In ${key}, which figures go under the bass for chord <b>${name}</b>? (The bass note is ${nm(bass)}.)`, options: shuffle(fo).map(x => opt(x, figHTML(FIG[x]))), answer: sev ? inv + "7" : inv,
      explain: `${name}: the bass ${nm(bass)} is the ${["root", "3rd", "5th", "7th"][bi]} of the chord, so the figures are ${figHTML(fig)}${!sev && inv === "a" ? " (usually left blank)" : !sev && inv === "b" ? " (usually just 6)" : sev && inv === "b" ? " (6 5)" : ""}.` };
  };
  /* ---------- figure the passage: real four-part passages, in any key ---------- */
  const figStack = arr => arr.length ? `<span class="fig">${arr.map(x => `<span>${x}</span>`).join("")}</span>` : `<span class="muted">none (5 3)</span>`;
  const figKey = arr => arr.join("/") || "53";
  const ACC_SYM = { "-2": "♭♭", "-1": "♭", "0": "♮", "1": "♯", "2": "×" };
  const dia = n => n.oct * 7 + n.L;
  function transposeTo(name, dL, semis) {
    const n = parseN(name), tot = n.L + dL, L2 = ((tot % 7) + 7) % 7, oct2 = n.oct + Math.floor(tot / 7);
    return N(L2, midiOf(n) + semis - (12 * (oct2 + 1) + STEP[L2]), oct2);
  }
  /* the figures for a chord, with the accidentals this key needs */
  function figsFor(chord, base, k) {
    const sig = scaleOf(majorTonic(k), "major"), sigAcc = L => sig.find(x => x.L === L).acc;
    const bass = chord[0], marks = {};
    chord.slice(1).forEach(n => { let g = ((dia(n) - dia(bass)) % 7) + 1; if (g === 1) return; if (n.acc !== sigAcc(n.L)) marks[g] = ACC_SYM[n.acc]; });
    const out = base.slice().sort((a, b) => b - a).map(x => (marks[x] || "") + x);
    if (marks[3] && base.indexOf(3) < 0) out.push(marks[3]);
    return out;
  }
  function passageIn(id, p) {
    const P0 = PASSAGES[id], minor = P0.key === "minor";
    const k = minor ? pick([-4, -3, -2, -1, 0, 1, 2, 3]) : pick([-3, -2, -1, 0, 1, 2, 3, 4]);
    const t = minor ? minorTonic(k) : majorTonic(k), base = minor ? { L: 5, s: 9 } : { L: 0, s: 0 };
    let dL = t.L - base.L, semis = STEP[t.L] + t.acc - base.s;
    if (semis > 6) { semis -= 12; dL -= 7; } else if (semis < -5) { semis += 12; dL += 7; }
    /* move a whole octave if that keeps every part in its range */
    const make = (d, s) => P0.chords.map(c => c.map(nm0 => transposeTo(nm0, d, s)));
    const fits = ch => { const ms = ch.flat().map(midiOf); return Math.min(...ms) >= 38 && Math.max(...ms) <= 81; };
    let chords = make(dL, semis);
    if (!fits(chords)) for (const o of [12, -12]) { const c2 = make(dL + (o > 0 ? 7 : -7), semis + o); if (fits(c2)) { chords = c2; break; } }
    return { k, mode: P0.key, chords, labels: P0.labels, figs: P0.chords.map((c, i) => figsFor(chords[i], P0.figs[i], k)) };
  }
  window.C78_TEST = { passageIn, figsFor };
  const COMMON_FIGS = [[], ["6"], ["6", "4"], ["7"], ["6", "5"], ["4", "3"], ["4", "2"]];
  const CHORD_POOL = { major: ["I", "Ib", "Ic", "II", "IIb", "II7b", "IV", "IVb", "V", "Vb", "V7", "V7b", "V7c", "V7d", "VI", "V7b of V"],
    minor: ["i", "ib", "ic", "iib°", "iv", "ivb", "V", "Vb", "V7", "V7b", "V7d", "VI", "vii°7", "vii°7b", "N6", "Ger6", "It6", "Fr6"] };
  TGEN.c78pass = (p) => {
    const ids = Object.keys(window.PASSAGES || {}).filter(id => !p.only || p.only.indexOf(id) >= 0);
    const id = pick(ids), X = passageIn(id, p), n = X.chords.length;
    const i = 1 + rnd(n - 1), key = keyName(X.k, X.mode);
    const marks = X.labels.map((_, j) => j === i ? "*" : "");
    const visual = `<div style="overflow-x:auto">${satbSVG(X.chords, X.k, marks)}</div>`;
    const ask = Math.random();
    if (ask < 0.5) {
      const right = X.figs[i], seen = new Set([figKey(right)]), opts = [opt(figKey(right), figStack(right))];
      shuffle(X.figs.concat(COMMON_FIGS)).forEach(f => { const kk = figKey(f); if (opts.length < 4 && !seen.has(kk)) { seen.add(kk); opts.push(opt(kk, figStack(f))); } });
      return { prompt: `This passage is in ${key}. Which figures go under the bass at the chord marked <b>*</b>?`, visual, options: shuffle(opts), answer: figKey(right),
        explain: `The chord at * is <b>${esc(X.labels[i])}</b>, so the figures are ${figStack(right)}. ${right.some(x => /[♯♭♮×]/.test(x)) ? "The accidental shows a note that isn't in the key signature." : "Count each note up from the bass."}` };
    }
    if (ask < 0.85) {
      const right = X.labels[i];
      const pool = shuffle([...new Set(X.labels.concat(CHORD_POOL[X.mode]))].filter(c => c !== right)).slice(0, 3);
      const row = X.figs.map((f, j) => j === i ? `<b>*</b>${figStack(f)}` : figStack(f)).join(" &nbsp; ");
      return { prompt: `This passage is in ${key}. The figures are shown under it. Which chord is marked <b>*</b>?`, visual: visual + `<p style="margin:6px 0 0">Figures: ${row}</p>`, options: shuffle([right, ...pool]).map(v => opt(v)), answer: right,
        explain: `Count up from the bass with the figures ${figStack(X.figs[i])}: it's <b>${esc(right)}</b>.` };
    }
    const a = X.labels[n - 2], b = X.labels[n - 1];
    const cad = /^V/.test(a) && /^(I|i)$/.test(b) ? "perfect" : b === "V" && a === "ivb" ? "Phrygian" : b === "V" ? "imperfect" : /^(IV|iv)$/.test(a) ? "plagal" : "interrupted";
    const opts = cad === "Phrygian" ? ["perfect", "imperfect", "Phrygian", "plagal"] : ["perfect", "imperfect", "plagal", "interrupted"];
    return { prompt: `This passage is in ${key}. Which cadence ends it?`, visual: `<div style="overflow-x:auto">${satbSVG(X.chords, X.k)}</div>`, options: opts.map(v => opt(v)), answer: cad,
      explain: `The last two chords are <b>${esc(a)}–${esc(b)}</b>: a ${cad} cadence.` };
  };

  if (!TGEN.mix) TGEN.mix = (p, diff) => { const l = LESSON_BY[pick(p.ids)], q = TGEN[l.gen](l.p, diff); q.prompt = `<span class="muted" style="font-size:.85em">${esc(l.t)}</span><br>` + q.prompt; return q; };

  /* the new drills join the Grade 7 and 8 lists for everyone */
  const NEW = [
    { id: "g7-sus", g: 7, topic: "Harmony", t: "Suspensions", gen: "c78sus", p: { g: 7 }, h: "<p>A <b>suspension</b> is a note held over from one chord into the next, where it clashes, then falls a step to a note of the new chord. It happens in three stages: <b>preparation</b> (the note belongs to the first chord), <b>suspension</b> (it's held on a strong beat while the bass moves) and <b>resolution</b> (it falls a step). The figures name the clash and its resolution: <b>4 3</b>, <b>7 6</b> and <b>9 8</b> are the ones you'll meet most.</p>" },
    { id: "g7-figbass", g: 7, topic: "Harmony", t: "From a bass and figures to a chord", gen: "c78fig", p: { degs: [1, 2, 4, 5, 6], sev: "v", acc: true }, h: "<p>To find a chord from a bass and its figures, count up from the bass: <b>5 3</b> (or nothing) means root position, <b>6</b> means the bass is the 3rd, <b>6 4</b> means it's the 5th. For sevenths: <b>7</b>, <b>6 5</b>, <b>4 3</b> and <b>4 2</b>. In a minor key a ♯ or ♮ on its own means ‘raise the 3rd above the bass’, which is how the leading note is shown over the dominant.</p>" },
    { id: "g8-sus", g: 8, topic: "Harmony", t: "Suspensions, chains and the bass suspension", gen: "c78sus", p: { g: 8 }, h: "<p>Everything from Grade 7, plus the <b>bass suspension</b> (the bass is held and falls a step: figured 2 3, or 4 2 then 6) and <b>chains</b> of suspensions over a sequence, which are the backbone of many Baroque trio sonatas.</p>" },
    { id: "g7-passage", g: 7, topic: "Harmony", t: "Figure the passage", gen: "c78pass", p: { only: ["cad64", "vi-ii", "rise", "ii7", "vofv", "v7d", "phryg", "neap", "dim7", "minor-cad"] }, h: "<p>A short passage in four parts, in a new key each time. Find the chord marked *, then its figures: count each upper note up from the bass, and add an accidental for any note that isn't in the key signature. An accidental on its own means the 3rd above the bass. Some questions show you the figures and ask for the chord; some ask which cadence ends the passage.</p>" },
    { id: "g8-passage", g: 8, topic: "Harmony", t: "Figure the passage, chromatic chords too", gen: "c78pass", p: {}, h: "<p>The same as Grade 7, now with augmented 6ths as well. Remember: in an augmented 6th the flattened 6th is in the bass and the sharpened 4th is the 6th above it, so the figure is ♯6 (or ♮6 in flat keys).</p>" },
    { id: "g8-figbass", g: 8, topic: "Harmony", t: "Any chord from its bass and figures", gen: "c78fig", p: { degs: [1, 2, 3, 4, 5, 6, 7], sev: "mix", acc: true }, h: "<p>Any triad or 7th chord on any degree, from its bass note and figures. Count up from the bass, find the root, then name the chord and its position.</p>" }
  ];
  NEW.forEach(l => { if (LESSON_BY[l.id]) return; const last = LESSONS.map(x => x.g).lastIndexOf(l.g); LESSONS.splice(last + 1, 0, l); LESSON_BY[l.id] = l; });

  /* ---------- the courses ---------- */
  const C78 = window.C78 = { data: window.C78_DATA || (window.C78_DATA = {}), failed: {}, loading: {} };
  if (!COURSES.some(c => c.id === "g7")) COURSES.push(
    { id: "g7", native: true, t: "Guided course: Grade 7", g: "Grade 7", d: "The ABRSM Grade 7 paper, day by day: figures and suspensions, chromatic chords, completing a passage, composing a melody and score questions, with practice papers." },
    { id: "g8", native: true, t: "Guided course: Grade 8", g: "Grade 8", d: "The ABRSM Grade 8 paper, day by day: Baroque trio sonata, Romantic keyboard writing, composition and orchestral score analysis, with practice papers." });

  const can = id => !window.TR || TR.can("course-" + id);
  function load(id) {
    if (C78.data[id] || C78.loading[id] || C78.failed[id]) return;
    C78.loading[id] = true;
    const s = document.createElement("script"); s.src = "course-" + id + ".js";
    s.onload = () => { C78.loading[id] = false; if (!C78.data[id]) C78.failed[id] = true; if (VIEW.course === id) render(); };
    s.onerror = () => { C78.loading[id] = false; C78.failed[id] = true; if (VIEW.course === id) render(); };
    document.head.appendChild(s);
  }
  C78.loaded = id => { C78.loading[id] = false; if (VIEW.course === id) render(); };

  const st = id => { const p = P(); p.c78 = p.c78 || {}; return p.c78[id] = p.c78[id] || { done: {}, chk: {} }; };
  const allDays = D => D.weeks.reduce((a, w) => a.concat(w.days), []);
  const starOf = id => ((P().tl[id] || {}).stars || 0);
  function itemDone(id, day, it, i) {
    const s = st(id);
    if (it.k === "drill" || it.k === "quiz") return starOf(it.id) >= 1;
    if (it.k === "task") { const T = C78.data[id].tasks[it.id]; return T.check.every((_, j) => (s.chk[it.id] || {})[j]); }
    return true;
  }
  const quizId = (id, qid) => "c" + id.slice(1) + "-" + qid;
  function ensureQuizzes(id) {
    const D = C78.data[id]; if (!D || D._q) return; D._q = true;
    Object.keys(D.quizzes || {}).forEach(q => { const x = D.quizzes[q]; LESSON_BY[quizId(id, q)] = { id: quizId(id, q), g: +id.slice(1), topic: "Exam practice", t: x.t, gen: "mix", p: { ids: x.ids.filter(i => LESSON_BY[i]) }, h: "<p>" + x.h + "</p>", course: id }; });
  }
  function todayN(id) { const D = C78.data[id], s = st(id), days = allDays(D); for (let i = 0; i < days.length; i++) if (!s.done[i + 1]) return i + 1; return days.length; }

  function homeView(c, D) {
    const id = c.id, s = st(id), days = allDays(D), n = Object.keys(s.done).length, today = todayN(id);
    let k = 0;
    const weeks = D.weeks.map(w => `<h3 style="margin:18px 0 6px">${esc(w.t)}</h3><div class="lessons">${w.days.map(d => { k++; const dn = k; const done = s.done[dn];
      return `<button class="lesson ${done ? "done" : ""}" data-c78="day" data-arg="${dn}"><span class="n">${dn}</span><div><div style="font-weight:700">${esc(d.t)}</div><div class="muted" style="font-size:.85rem">${d.mins || 20} min${dn === today && !done ? " · <b>today</b>" : ""}</div></div>${done ? '<span class="pill">Done ✓</span>' : ""}</button>`; }).join("")}</div>`).join("");
    return `<button class="back" data-act="theoryHome">← Theory</button>
      <div class="kicker">ABRSM ${esc(c.g)} · guided course</div><h2>${esc(D.title)}</h2>
      <div class="panel"><p style="margin-top:0">${D.intro}</p>
        <div class="row" style="justify-content:space-between;align-items:center"><span class="pill">${n} of ${days.length} days done</span><button class="btn primary" data-c78="day" data-arg="${today}">${n ? "Carry on: day " + today : "Start day 1"}</button></div>
        <div style="height:8px;border-radius:8px;background:var(--line);margin-top:12px;overflow:hidden"><div style="height:100%;width:${Math.round(100 * n / days.length)}%;background:var(--teal)"></div></div></div>
      <details class="panel" style="margin-top:12px"><summary style="cursor:pointer;font-weight:700;min-height:40px;display:flex;align-items:center">What's on the paper</summary>${D.exam}</details>
      <details class="panel" style="margin-top:12px"><summary style="cursor:pointer;font-weight:700;min-height:40px;display:flex;align-items:center">For the grown-up</summary>${D.grownup}</details>
      ${weeks}`;
  }
  function exampleHTML(ex, key) {
    if (!ex) return "";
    const chords = ex.chords.map(c => c.map(parseN));
    C78.ex = C78.ex || {}; C78.ex[key] = chords;
    return `<div class="panel" style="margin-top:10px"><div class="row" style="justify-content:space-between;align-items:center"><b>${esc(ex.t)}</b><button class="btn small" data-c78="play" data-arg="${key}">▶ Play</button></div>
      <div class="notation" style="overflow-x:auto">${satbSVG(chords, ex.k || 0, ex.labels)}</div>${ex.figs ? `<p style="margin:6px 0 0">Figures: ${ex.figs.map(f => f ? figHTML(f) : "—").join(" &nbsp; ")}</p>` : ""}${ex.note ? `<p class="muted" style="margin:6px 0 0">${ex.note}</p>` : ""}</div>`;
  }
  function itemHTML(id, dn, it, i) {
    const D = C78.data[id], s = st(id);
    if (it.k === "read") return `<div class="panel explain">${it.h}</div>`;
    if (it.k === "drill" || it.k === "quiz") {
      const l = LESSON_BY[it.id]; if (!l) return "";
      const t = P().tl[l.id] || {};
      return `<div class="panel"><div class="row" style="justify-content:space-between;align-items:center"><div><div class="kicker">${it.k === "quiz" ? "Quiz" : "Drill"} · ${esc(l.topic)}</div><b>${esc(l.t)}</b>${it.note ? `<div class="muted" style="font-size:.9rem">${it.note}</div>` : ""}</div>
        <div class="row" style="align-items:center">${starStr(t.stars || 0)}<button class="btn ${t.stars ? "" : "primary"} small" data-c78="go" data-arg="${l.id}">${t.stars ? "Again" : "Start"}</button></div></div></div>`;
    }
    if (it.k === "task") {
      const T = D.tasks[it.id], ck = s.chk[it.id] || {};
      return `<div class="panel"><div class="kicker">Written task · pencil and manuscript paper</div><h3 style="margin:.2em 0 .4em">${esc(T.t)}</h3>${T.why ? `<p style="margin-top:0">${T.why}</p>` : ""}
        <ol style="padding-left:1.3em">${T.steps.map(x => `<li style="margin:6px 0">${x}</li>`).join("")}</ol>
        ${T.example ? exampleHTML(T.example, id + "-" + it.id) : ""}
        <h4 style="margin:14px 0 6px">Check your work</h4>
        <div style="display:grid;gap:6px">${T.check.map((x, j) => `<label style="display:flex;gap:10px;align-items:flex-start;min-height:36px;cursor:pointer"><input type="checkbox" data-c78chk="${it.id}" data-j="${j}" ${ck[j] ? "checked" : ""} style="margin-top:4px;width:20px;height:20px;flex:0 0 auto"><span>${x}</span></label>`).join("")}</div></div>`;
    }
    if (it.k === "weak") {
      const pool = D.weakFrom.filter(x => LESSON_BY[x]).map(x => { const t = P().tl[x] || {}; return { x, acc: t.a ? t.c / t.a : -1 }; }).filter(o => o.acc >= 0).sort((a, b) => a.acc - b.acc).slice(0, 3);
      if (!pool.length) return `<div class="panel"><b>Your weakest drills</b><p class="muted">Do a few drills first, and this list will pick the three you find hardest.</p></div>`;
      return `<div class="panel"><b>Your three weakest drills so far</b><div class="lessons" style="margin-top:8px">${pool.map(o => { const l = LESSON_BY[o.x]; return `<button class="lesson" data-c78="go" data-arg="${l.id}"><span class="n">${Math.round(100 * o.acc)}%</span><div><div style="font-weight:700">${esc(l.t)}</div><div class="muted" style="font-size:.85rem">${esc(l.topic)}</div></div>${starStr((P().tl[l.id] || {}).stars || 0)}</button>`; }).join("")}</div></div>`;
    }
    return "";
  }
  function dayView(c, D, dn) {
    const id = c.id, days = allDays(D), d = days[dn - 1], s = st(id);
    const left = d.items.map((it, i) => itemDone(id, dn, it, i)).filter(x => !x).length;
    return `<button class="back" data-c78="home">← ${esc(c.t)}</button>
      <div class="kicker">${esc(c.g)} · day ${dn} of ${days.length} · about ${d.mins || 20} minutes</div><h2>${esc(d.t)}</h2>
      <div style="display:grid;gap:12px">${d.items.map((it, i) => itemHTML(id, dn, it, i)).join("")}</div>
      <div class="row" style="margin-top:16px;justify-content:space-between;align-items:center">
        ${dn > 1 ? `<button class="btn" data-c78="day" data-arg="${dn - 1}">← Day ${dn - 1}</button>` : "<span></span>"}
        <span class="muted">${s.done[dn] ? "Day done ✓" : left ? left + " thing" + (left > 1 ? "s" : "") + " left today" : "All done!"}</span>
        ${s.done[dn] ? (dn < days.length ? `<button class="btn primary" data-c78="day" data-arg="${dn + 1}">Day ${dn + 1} →</button>` : "<span></span>") : `<button class="btn primary" data-c78="finish" data-arg="${dn}">Finish day ${dn}${dn < days.length ? " →" : ""}</button>`}</div>`;
  }
  function c78View(c) {
    if (!can(c.id)) return `<button class="back" data-act="theoryHome">← Theory</button><h2>${esc(c.t)}</h2><p>${esc(c.d)}</p>` + (window.TR ? TR.upsellHTML(c.t + " comes with the Family plan or a " + c.g + " pack.") : "");
    const D = C78.data[c.id];
    if (!D) { if (C78.failed[c.id]) return `<button class="back" data-act="theoryHome">← Theory</button><h2>${esc(c.t)}</h2><div class="panel"><p>The course couldn't be opened just now. Check your connection, or sign in again from <a href="../app.html" target="_top">My rooms</a>, then come back.</p><button class="btn primary" data-c78="retry">Try again</button></div>`;
      load(c.id); return `<button class="back" data-act="theoryHome">← Theory</button><h2>${esc(c.t)}</h2><p class="muted">Opening the course…</p>`; }
    ensureQuizzes(c.id);
    const dn = VIEW.c78day; const days = allDays(D);
    return dn && dn >= 1 && dn <= days.length ? dayView(c, D, dn) : homeView(c, D);
  }
  const courseView0 = courseView;
  courseView = function () { const c = COURSES.find(x => x.id === VIEW.course); return c && c.native ? c78View(c) : courseView0(); };

  /* a drill opened from a course day comes back to that day */
  const lessonView1 = lessonView;
  lessonView = function () {
    let h = lessonView1(); const r = VIEW.c78ret;
    if (r) h = h.replace(/<button class="back" data-act="theoryHome">[^<]*<\/button>/, `<button class="back" data-c78="ret">← ${esc(r.label)}</button>`);
    return h;
  };

  document.addEventListener("click", function (e) {
    const b = e.target.closest("[data-c78]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const a = b.dataset.c78, arg = b.dataset.arg, id = VIEW.course;
    if (a === "day") { VIEW.c78day = +arg; render(); window.scrollTo({ top: 0 }); return; }
    if (a === "home") { VIEW.c78day = 0; render(); window.scrollTo({ top: 0 }); return; }
    if (a === "retry") { C78.failed[id] = false; render(); return; }
    if (a === "finish") { const s = st(id); s.done[+arg] = new Date().toISOString().slice(0, 10); save(); const days = allDays(C78.data[id]); VIEW.c78day = +arg < days.length ? +arg + 1 : 0; render(); window.scrollTo({ top: 0 }); if (!VIEW.c78day) toast("Course finished. Well done!"); return; }
    if (a === "go") { const c = COURSES.find(x => x.id === id); VIEW.c78ret = { course: id, day: VIEW.c78day || 0, label: VIEW.c78day ? "Day " + VIEW.c78day : c.t }; VIEW.course = null; VIEW.lesson = arg; VIEW.round = null; VIEW.flash = null; render(); window.scrollTo({ top: 0 }); return; }
    if (a === "ret") { const r = VIEW.c78ret; stopAll(); VIEW.c78ret = null; VIEW.lesson = null; VIEW.round = null; VIEW.flash = null; VIEW.course = r.course; VIEW.c78day = r.day; render(); window.scrollTo({ top: 0 }); return; }
    if (a === "play") { const ch = (C78.ex || {})[arg]; if (ch) playEvents(ch.map((c, i) => ({ m: c.map(midiOf), t: i * 1.5, d: 1.5 })), 66); return; }
  }, true);
  /* leaving the course or the lesson another way forgets where we came from */
  document.addEventListener("click", function (e) {
    const b = e.target.closest('[data-act="theoryHome"],[data-tab],[data-act="course"]'); if (!b) return;
    VIEW.c78ret = null; VIEW.c78day = 0;
  }, true);
  document.addEventListener("change", function (e) {
    const x = e.target.closest("[data-c78chk]"); if (!x) return;
    const s = st(VIEW.course), t = x.dataset.c78chk; s.chk[t] = s.chk[t] || {}; s.chk[t][x.dataset.j] = x.checked; save();
    const D = C78.data[VIEW.course], dn = VIEW.c78day;
    if (D && dn) { const d = allDays(D)[dn - 1], left = d.items.filter((it, i) => !itemDone(VIEW.course, dn, it, i)).length; const m = document.querySelector("#main .row:last-child .muted"); if (m && !st(VIEW.course).done[dn]) m.textContent = left ? left + " thing" + (left > 1 ? "s" : "") + " left today" : "All done!"; }
  });
  if (typeof render === "function") render();
})();
