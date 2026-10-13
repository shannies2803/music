/* The Theory Room: writing-music workshop and rhythm reading.
   1. Harmony workshop (Grades 6–8): twelve worked examples, built up step by step in any key:
      the bass and figures, naming the chords, the melody, the inner parts, then a check of the
      rules (worked out from the notes on the page, not written in advance). Each chord is explained.
   2. "Finish the melody" drills: choose the best final bar for a melody, with the reason each
      other ending doesn't work (Trinity Grades 4–5, ABRSM Grade 6).
   3. Rhythm reading, Grades 1–8: see a rhythm, get a count-in, tap it on the pad at sight. Marked
      for timing, like the clap-back tests.
   Loaded after course78.js and passages.js. */
(function () {
  "use strict";
  if (typeof TGEN === "undefined" || !window.SIGHTREAD) return;
  const FLUTE = SIGHTREAD.instOf("flute");

  /* ---------- 1. harmony workshop ---------- */
  const TITLES = {
    "cad64": "The cadential 6/4: I–IIb–Ic–V7–I", "vi-ii": "I–VI–IIb–V–I", "rise": "A rising bass: I–Ib–IV–V7–I", "ii7": "The supertonic 7th: II7b",
    "vofv": "A secondary dominant: V7b of V", "v7d": "The dominant 7th in last inversion: V7d to Ib", "phryg": "The Phrygian cadence: ivb–V",
    "neap": "The Neapolitan 6th", "dim7": "The diminished 7th", "ger6": "The German 6th", "it6": "The Italian 6th", "minor-cad": "A minor-key cadence: iib°–Ic–V7–i"
  };
  const NOTES = [
    [/^(I|i)$/, "the tonic chord in root position: home."],
    [/^(I|i)b$/, "the tonic chord in first inversion (the 3rd in the bass, figured 6). Lighter than root position, so good in the middle of a phrase."],
    [/^(I|i)c$/, "the tonic chord in second inversion (figured 6 4). Here it's a <b>cadential 6/4</b>: on a strong beat, it sounds like V with two notes leaning on it, and resolves at once to V (6 4 falling to 5 3)."],
    [/^II$/, "the supertonic chord, which leads strongly to V."],
    [/^IIb$/, "the supertonic in first inversion (figured 6), with the subdominant in the bass. It prepares V or Ic."],
    [/^iib°$/, "the supertonic in first inversion (figured 6). In a minor key this chord is diminished, so it's almost always used in first inversion. It prepares V or Ic."],
    [/^II7b$/, "the supertonic 7th in first inversion (figured 6 5): the subdominant in the bass with the supertonic chord above, and the 7th. The 7th falls a step to resolve."],
    [/^(IV|iv)$/, "the subdominant chord: it moves away from home, often towards V or a plagal cadence."],
    [/^ivb$/, "the subdominant in first inversion. Falling a semitone in the bass to V, it makes a <b>Phrygian cadence</b>, a kind of imperfect cadence in a minor key."],
    [/^V$/, "the dominant chord. It contains the leading note, which wants to rise to the tonic."],
    [/^V7$/, "the dominant 7th in root position (figured 7): the dominant chord plus a minor 7th above the root. The 7th falls a step and the leading note rises."],
    [/^V7d$/, "the dominant 7th in last inversion (figured 4 2): the 7th is in the bass, so the bass must fall a step, here to Ib."],
    [/^VI$/, "the submediant chord. After V it makes an <b>interrupted cadence</b>; earlier in a phrase it's a gentle step away from I."],
    [/of V/, "a <b>secondary dominant</b>: the dominant 7th of the dominant key, figured 6 5 with a raised note. That sharpened note acts as a leading note to the dominant, so it rises to V."],
    [/^N6$/, "the <b>Neapolitan 6th</b>: a major chord on the flattened supertonic, in first inversion. It leads to Ic or V; the flattened note falls."],
    [/^vii°7b?$/, "the <b>diminished 7th</b> on the leading note: a stack of minor 3rds. Every note leans towards a note of the tonic chord."],
    [/^Ger6$/, "the <b>German augmented 6th</b>: flattened 6th in the bass, with the major 3rd, perfect 5th and augmented 6th above. The augmented 6th opens out to an octave on the dominant; it usually goes to Ic first to avoid consecutive 5ths."],
    [/^It6$/, "the <b>Italian augmented 6th</b>: flattened 6th in the bass, the major 3rd and the augmented 6th. The bass falls a semitone and the sharpened note rises a semitone, opening out to the octave on V."],
    [/^V7?b$/, "the dominant (7th) in first inversion: the leading note is in the bass, so it rises to the tonic."]
  ];
  const noteOf = lbl => { for (const [re, t] of NOTES) if (re.test(lbl)) return t; return "a chord of the key."; };
  const RANGE = [[58, 81, "soprano"], [53, 76, "alto"], [46, 69, "tenor"], [38, 62, "bass"]];   /* the Handbook ranges, a tone either way */
  function checks(chords) {
    const ms = chords.map(c => c.map(midiOf).slice().reverse()), out = [];   /* S A T B */
    let cons = [];
    for (let i = 1; i < ms.length; i++) for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) {
      const p = ((ms[i - 1][a] - ms[i - 1][b]) % 12 + 12) % 12, q = ((ms[i][a] - ms[i][b]) % 12 + 12) % 12;
      if (p === q && (p === 7 || p === 0) && ms[i - 1][a] !== ms[i][a]) cons.push((p ? "5ths" : "octaves") + " between " + RANGE[a][2] + " and " + RANGE[b][2] + ", chords " + i + "–" + (i + 1));
    }
    out.push(cons.length ? ["✗", "Consecutive " + cons.join("; ")] : ["✓", "No consecutive 5ths or octaves between any two parts."]);
    const sp = ms.filter(c => c[0] - c[1] > 12 || c[1] - c[2] > 12).length;
    out.push(sp ? ["✗", sp + " chord(s) with a gap of more than an octave between the upper parts."] : ["✓", "Spacing: no more than an octave between soprano and alto, or alto and tenor."]);
    const cross = ms.filter(c => c[0] < c[1] || c[1] < c[2] || c[2] < c[3]).length;
    out.push(cross ? ["✗", "Parts cross in " + cross + " chord(s)."] : ["✓", "No parts cross."]);
    const rng = []; ms.forEach(c => c.forEach((m, v) => { if (m < RANGE[v][0] || m > RANGE[v][1]) rng.push(RANGE[v][2]); }));
    out.push(rng.length ? ["✗", "Out of the usual range: " + [...new Set(rng)].join(", ") + "."] : ["✓", "Every part stays in its usual range."]);
    let big = 0; for (let i = 1; i < ms.length; i++) for (let v = 1; v < 3; v++) if (Math.abs(ms[i][v] - ms[i - 1][v]) > 5) big++;
    out.push(big ? ["•", "Alto and tenor leap more than a 4th " + big + " time(s). Inner parts usually move by step or stay still."] : ["✓", "Alto and tenor move by step, by small leaps or stay on common notes."]);
    return out;
  }
  function figSVG(svg, figs) {
    return svg.replace(/<text x="([\d.]+)" y="([\d.]+)"([^>]*)>§(\d+)<\/text>/g, (m, x, y, rest, i) => {
      const f = figs[+i] || []; if (!f.length) return "";
      return f.map((t, j) => `<text x="${x}" y="${+y - 14 + j * 13}"${rest.replace(/font-size="\d+"/, 'font-size="12"')}>${esc(t)}</text>`).join("");
    });
  }
  /* a key where the example also sits comfortably in every part's range */
  function pickPassage(id) { let X; for (let i = 0; i < 12; i++) { X = C78_TEST.passageIn(id, {}); if (checks(X.chords).every(c => c[0] !== "✗")) break; } return Object.assign(X, { id }); }
  const STEPS = ["The bass and figures", "Name the chords", "Add the melody", "Fill in alto and tenor", "Check and listen"];
  function staves(X, step) {
    const show = { S: step >= 2, A: step >= 3, T: step >= 3 }, n = X.chords.length, w = 120 + n * 66;
    const tre = X.chords.map((c, i) => { const keys = [show.A ? c[2] : null, show.S ? c[3] : null].filter(Boolean); return keys.length ? { keys, d: 4, label: step >= 1 ? X.labels[i] : null } : { rest: true, d: 4 }; });
    const bas = X.chords.map((c, i) => ({ keys: [c[0]].concat(show.T ? [c[1]] : []), d: 4, label: "§" + i }));
    const bassSvg = figSVG(staffSVG({ clef: "bass", key: X.k, events: bas, prop: false, spacing: 66, minW: w, aria: "bass and tenor" }), X.figs);
    return `<div class="satb" style="overflow-x:auto">${staffSVG({ clef: "treble", key: X.k, events: tre, prop: false, spacing: 66, minW: w, aria: "soprano and alto" })}${bassSvg}</div>`;
  }
  function stepText(X, step) {
    const nmN = n => nm(n);
    if (step === 0) return "<p>Start from the bass. Each figure counts up from the bass note within the key: nothing (or 5 3) is root position, <b>6</b> means first inversion, <b>6 4</b> second inversion, and 7, 6 5, 4 3, 4 2 are 7th chords and their inversions (most often the dominant 7th). An accidental beside a figure changes that note.</p>";
    if (step === 1) return "<p>Work out each chord from its bass and figures:</p><ol>" + X.labels.map((l, i) => "<li><b>" + esc(l) + "</b> (bass " + nmN(X.chords[i][0]) + (X.figs[i].length ? ", figures " + X.figs[i].join(" ") : "") + "): " + noteOf(l) + "</li>").join("") + "</ol>";
    if (step === 2) return "<p>The melody moves mostly by step and has a clear shape to the cadence. Notice the last two soprano notes: " + nmN(X.chords[X.chords.length - 2][3]) + " to " + nmN(X.chords[X.chords.length - 1][3]) + ". Choose the soprano first, then the inner parts fit between it and the bass.</p>";
    if (step === 3) return "<p>Now the alto and tenor. Keep notes that two chords share in the same part, move the others by the smallest step, and double the root of a major or minor chord where you can. Never double the leading note, and let a 7th fall by step.</p>";
    return "<p>Check the finished passage, then listen to it.</p><ul style=\"list-style:none;padding-left:0\">" + checks(X.chords).map(c => "<li><b>" + c[0] + "</b> " + c[1] + "</li>").join("") + "</ul>";
  }
  function workshopHTML() {
    const ids = Object.keys(window.PASSAGES || {}); if (!ids.length) return "";
    const W = VIEW.hw = VIEW.hw || { id: ids[0], step: 0 };
    if (!W.X || W.X.id !== W.id) W.X = pickPassage(W.id);
    const X = W.X, s = W.step;
    return '<div class="panel" id="hwbox" style="margin-top:10px"><div class="row" style="gap:8px;flex-wrap:wrap"><label for="hwSel" style="font-weight:700">Example</label><select id="hwSel" style="font:inherit;min-height:44px;border-radius:10px;padding:4px 10px;max-width:100%;min-width:0">' +
      ids.map(id => '<option value="' + id + '"' + (id === W.id ? " selected" : "") + ">" + esc(TITLES[id] || id) + "</option>").join("") + '</select><button class="btn small ghost" data-hw="key">Another key</button></div>' +
      '<p class="kicker" style="margin:12px 0 4px">' + esc(keyName(X.k, X.mode)) + " · step " + (s + 1) + " of 5: " + STEPS[s] + "</p>" + staves(X, s) +
      '<div class="row" style="gap:6px;margin-top:8px">' + STEPS.map((t, i) => '<button class="gbtn" data-hw-step="' + i + '" aria-pressed="' + (i === s) + '" style="min-height:40px;min-width:44px" aria-label="Step ' + (i + 1) + ": " + t + '">' + (i + 1) + "</button>").join("") +
      '' + (s >= 4 ? '<button class="btn small" data-hw="nextEx">Next example →</button>' : '<button class="btn small" data-hw="next">Next step →</button>') + "<button class=\"btn small ghost\" data-hw=\"play\">▶ Hear " + (s >= 3 ? "it" : "what's there") + "</button></div>" +
      '<div style="margin-top:8px">' + stepText(X, s) + "</div></div>";
  }
  const hw = { id: "hw-workshop", g: 7, topic: "Harmony", t: "Harmony workshop: worked examples", gen: "c78pass", p: {}, workshop: true };
  Object.defineProperty(hw, "h", { get: () => "<p>Twelve short passages, built up one step at a time, the way you'd write them in the exam: the bass and figures, the chords, the melody, the inner parts, then a check. Change the key as often as you like.</p>" + workshopHTML() });
  LESSON_BY[hw.id] = hw;

  /* ---------- 2. finish the melody ---------- */
  function given(pc) { return pc.notes.filter(n => n.t < 3 * pc.beats - 1e-6); }
  function barEv(pc, notes, withBars) {
    const ev = []; let pos = 0;
    notes.forEach(n => { ev.push(n.rest ? { rest: true, d: n.d } : { keys: [n.sp || fromMidiInKey(n.m, pc.k, pc.mode)], d: n.d }); pos += n.d; if (withBars && Math.abs(pos / pc.beats - Math.round(pos / pc.beats)) < 1e-6) ev.push({ bar: true }); });
    autoBeam(ev, 1); return ev;
  }
  TGEN.melend = function (p) {
    let pc; for (let i = 0; i < 20; i++) { pc = SIGHTREAD.makePiece(p.g, FLUTE); if (pc.bars >= 4 && given(pc).some(n => !n.rest)) break; }
    const G = given(pc), tpc = pcOf(pc.tonic), kp = keyPcs(tpc, pc.mode), last = G.filter(n => !n.rest).pop().m;
    const T = nearestPc([tpc], last, last - 7, last + 7), dir = Math.random() < .5 ? 1 : -1, pre = scaleStep(T, dir, kp);
    /* rising to the tonic in a minor key, use the raised 6th (melodic minor), not the augmented 2nd */
    const first = pc.mode === "minor" && dir < 0 ? pre - 2 : scaleStep(pre, dir, kp);
    const rh = pc.beats === 4 ? [1, 1, 2] : pc.beats === 3 ? [1, 2] : [1, 1];
    const mk = (ms, durs) => ms.map((m, i) => ({ m, d: (durs || rh)[i] }));
    const good = rh.length === 3 ? [first, pre, T] : [pre, T];
    const nameOf = m => nm(fromMidiInKey(m, pc.k, pc.mode)), tn = nameOf(T);
    const dom = nearestPc([(tpc + 7) % 12], pre, pre - 6, pre + 6);
    /* a note outside every form of the scale (for minor keys: natural, harmonic and melodic), spelled as a chromatic change of the right note */
    const allPcs = pc.mode === "minor" ? [0, 2, 3, 5, 7, 8, 9, 10, 11].map(x => (tpc + x) % 12) : kp;
    const preN = fromMidiInKey(pre, pc.k, pc.mode);
    let ch = [1, -1].map(d => ({ m: pre + d, sp: N(preN.L, preN.acc + d, preN.oct) })).find(c => !allPcs.includes(pcOf(c.m)) && Math.abs(c.sp.acc) <= 1);
    if (!ch && rh.length === 3) { const fN = fromMidiInKey(first, pc.k, pc.mode); ch = [1, -1].map(d => ({ m: first + d, sp: N(fN.L, fN.acc + d, fN.oct), onFirst: true })).find(c => !allPcs.includes(pcOf(c.m)) && Math.abs(c.sp.acc) <= 1); }
    const leapPre = [11, 10].map(s => T - dir * s).find(m => kp.includes(pcOf(m))) || T - dir * 10;   /* a 7th away, on the far side, so the last step is a leap of a 7th */
    const endings = [
      { k: "good", n: mk(good), why: "Right. It moves by step to the tonic, " + tn + ", and ends on a long note, so the melody sounds finished." },
      { k: "dom", n: mk(good.slice(0, -1).concat([dom])), why: "This ends on " + nameOf(dom) + ", the dominant: it sounds like a question, not an ending." },
      { k: "leap", n: mk((good.length === 3 ? [first, leapPre] : [leapPre]).concat([T])), why: "It reaches the tonic, but with an awkward leap of a 7th just before the end." },
      ch && { k: "chrom", n: (ch.onFirst ? [{ m: ch.m, sp: ch.sp }, { m: pre }, { m: T }] : (good.length === 3 ? [{ m: first }, { m: ch.m, sp: ch.sp }, { m: T }] : [{ m: ch.m, sp: ch.sp }, { m: T }])).map((x, i, a) => Object.assign(x, { d: rh[rh.length - a.length + i] })), why: "It uses " + nm(ch.sp) + ", a note that doesn't belong to " + keyName(pc.k, pc.mode) + "." },
      { k: "rh", n: mk(good, rh.map((d, i) => i === rh.length - 1 ? d + 1 : d)), why: "The notes are fine, but the bar has " + (pc.beats + 1) + " beats instead of " + pc.beats + "." }
    ];
    const chosen = [endings[0]].concat(shuffle(endings.slice(1).filter(Boolean)).slice(0, 3));
    const order = shuffle(chosen), letters = "ABCD";
    const svgOf = e => staffSVG({ clef: "treble", key: pc.k, events: barEv(pc, e.n, false).concat([{ bar: "end" }]), prop: true, aria: "an ending" });
    const head = staffSVG({ clef: "treble", key: pc.k, time: pc.beats + "/4", events: barEv(pc, G, true), prop: true, aria: "the first three bars" });
    const sound = (ns, from) => { let t = 0; return ns.map(n => { const e = n.rest ? null : { m: n.m, t: from + t, d: n.d, v: .8 }; t += n.d; return e; }).filter(Boolean); };
    const opening = sound(G, 0);
    return {
      prompt: "Here are the first three bars of a melody in " + keyName(pc.k, pc.mode) + ". Which is the best final bar?",
      visual: '<div style="overflow-x:auto">' + head + "</div>",
      options: order.map((e, i) => Object.assign(opt(e.k, '<b style="display:block;text-align:left">' + letters[i] + "</b>" + svgOf(e)), { svg: true })),
      answer: "good",
      explain: order.map((e, i) => "<b>" + letters[i] + ":</b> " + e.why).join("<br>"),
      play: () => playEvents(opening, pc.tempo), playLabel: "Hear the opening",
      extra: order.map((e, i) => ({ label: "Hear with " + letters[i], fn: () => playEvents(opening.concat(sound(e.n, 3 * pc.beats)), pc.tempo) }))
    };
  };
  const MEL_H = "<p>A good melody ending: <b>moves by step to the tonic</b> (from the note above or the leading note below), <b>lands on a strong beat</b> with a <b>longer note</b>, stays <b>in the key</b>, and has the <b>right number of beats</b>. Endings on the dominant sound unfinished, like a question. Sing or play each ending after the opening before you choose.</p>";
  const melLessons = [
    { id: "tr4-melend", g: 4, board: "trinity", topic: "Writing music", t: "Finish the melody", gen: "melend", p: { g: 4 }, h: MEL_H },
    { id: "tr5-melend", g: 5, board: "trinity", topic: "Writing music", t: "Finish the melody", gen: "melend", p: { g: 5 }, h: MEL_H },
    { id: "g6-melend", g: 6, topic: "Composition", t: "Finish the melody", gen: "melend", p: { g: 6 }, h: MEL_H + "<p>At Grade 6 you'll write the whole continuation yourself; choosing between endings trains your ear for what works.</p>" }
  ];
  melLessons.forEach(l => { LESSON_BY[l.id] = l; if (l.board === "trinity") { if (window.TRINITY_LESSONS) TRINITY_LESSONS.push(l); } else LESSONS.push(l); });

  /* ---------- 3. rhythm reading ---------- */
  TGEN.rread = function (p) {
    const pc = SIGHTREAD.makePiece(p.g, FLUTE), bars = Math.min(pc.bars, p.g <= 3 ? 2 : 4), ns = pc.notes.filter(n => n.t < bars * pc.beats - 1e-6);
    const ev = []; let pos = 0;
    ns.forEach(n => { ev.push(n.rest ? { rest: true, d: n.d } : { d: n.d }); pos += n.d; if (Math.abs(pos / pc.beats - Math.round(pos / pc.beats)) < 1e-6 && pos < bars * pc.beats - 1e-6) ev.push({ bar: true }); });
    autoBeam(ev, 1);
    const onsets = ns.filter(n => !n.rest).map(n => n.t), bpm = 66 + 3 * p.g, spb = 60 / bpm, m = pc.beats + "/4";
    const svg = rhythmSVG(ev, { time: m, prop: true, endBar: true });
    return {
      type: "clap", prompt: "Read this rhythm. Press “Count me in”, then tap it on the pad in time, at sight.", visual: svg, notation: svg, bpm, onsets, meter: m,
      play: () => { const c = []; for (let i = 0; i < pc.beats; i++) c.push({ click: true, accent: i === 0, t: i }); playEvents(c, bpm); return (pc.beats - 1) * spb; }, playLabel: "Count me in",
      extra: [{ label: "Hear it (if you're stuck)", fn: () => playEvents(ns.filter(n => !n.rest).map(n => ({ m: 72, t: n.t, d: n.d, v: .8, art: .7 })), bpm) }],
      answer: "ok", explain: "Count the beats in your head as you tap, and keep going through any slip."
    };
  };
  const RR_H = "<p>Rhythm reading is the heart of sight-reading. Look at the rhythm first: find the beats, spot the dotted notes and rests. Press <b>Count me in</b>, then tap the rhythm on the pad (or press the space bar) while counting. You're marked on timing.</p>";
  for (let g = 1; g <= 8; g++) { const l = { id: "g" + g + "-rread", g, topic: "Rhythm & time", t: "Rhythm reading: tap it at sight", gen: "rread", p: { g }, h: RR_H, tap: true }; LESSON_BY[l.id] = l; LESSONS.push(l); }

  /* ---------- the workshop entry on the theory tab, and its controls ---------- */
  const th0 = theoryHome;
  theoryHome = function () {
    const h = th0(), card = '<div class="lessons" style="margin-top:10px"><button class="lesson" data-act="lesson" data-arg="hw-workshop"><span class="n">♫</span><div><div style="font-weight:700">Harmony workshop</div><div class="muted" style="font-size:.85rem">Grades 6–8: twelve worked examples, step by step, in any key</div></div></button></div>';
    const at = h.indexOf('<h2 style="margin-top:22px">Mock exams</h2>');
    return at >= 0 ? h.slice(0, at) + card + h.slice(at) : h + card;
  };
  const lv0 = lessonView;
  lessonView = function () { const h = lv0(), l = LESSON_BY[VIEW.lesson]; return l && l.tap ? h.replace(/<button class="btn ghost" data-ws="[^"]*"[^>]*>[^<]*<\/button>/, "") : h; };
  document.addEventListener("change", e => { if (e.target.id === "hwSel") { VIEW.hw = { id: e.target.value, step: 0 }; render(); } });
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-hw],[data-hw-step]"); if (!b || !VIEW.hw) return;
    const W = VIEW.hw;
    if (b.dataset.hwStep) { W.step = +b.dataset.hwStep; render(); return; }
    const a = b.dataset.hw;
    if (a === "next") { W.step = Math.min(4, W.step + 1); render(); }
    if (a === "key") { W.X = null; render(); }
    if (a === "nextEx") { const ids = Object.keys(window.PASSAGES || {}); VIEW.hw = { id: ids[(ids.indexOf(W.id) + 1) % ids.length], step: 0 }; render(); }
    if (a === "play") { audioInit(); const s = W.step; playEvents(W.X.chords.map((c, j) => ({ m: c.filter((_, v) => v === 0 || (v === 3 && s >= 2) || ((v === 1 || v === 2) && s >= 3)).map(midiOf), t: j * 1.5, d: 1.5 })), 66); }
    const box = document.getElementById("hwbox"); if (box && a !== "play") box.scrollIntoView({ block: "nearest" });
  });
  window.TR_HARMONY = { checks, workshopHTML, pickPassage };
  if (typeof render === "function") render();
})();
