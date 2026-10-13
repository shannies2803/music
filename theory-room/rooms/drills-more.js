/* The Theory Room: more drills in the Musicianship section.
   1. Grouping (beaming): which bar is beamed correctly for its time signature?
   2. Complete the bar: which single note finishes the bar?
   3. Ornaments: name the ornament, and choose how it's played.
   4. Which music did you hear? Hear a short melody, then pick the notation that matches it.
   Loaded after musicianship.js. */
(function () {
  "use strict";
  if (typeof TGEN === "undefined" || !window.SIGHTREAD) return;
  const FLUTE = SIGHTREAD.instOf("flute");

  /* ---------- 1. grouping ---------- */
  const GROUP = {
    "2/4": { ok: [[4], [2, 2]], bad: [[3, 1], [1, 3]], rule: "In 2/4, beam quavers in ones or twos within each crotchet beat, or all four together. Don't group them in threes." },
    "3/4": { ok: [[2, 2, 2], [6]], bad: [[3, 3], [4, 2]], rule: "In 3/4, beam quavers in twos (one crotchet beat each), or all six together. Groups of three make it look like 6/8." },
    "4/4": { ok: [[4, 4], [2, 2, 2, 2]], bad: [[2, 4, 2], [3, 3, 2], [8]], rule: "In 4/4, beam quavers by the beat, or in half bars of four. Never beam across the middle of the bar (between beats 2 and 3)." },
    "6/8": { ok: [[3, 3]], bad: [[2, 2, 2], [4, 2], [2, 4]], rule: "In 6/8, the beat is a dotted crotchet, so quavers go in groups of three: 3 + 3. Groups of two make it look like 3/4." },
    "9/8": { ok: [[3, 3, 3]], bad: [[2, 2, 2, 3], [4, 2, 3], [3, 6]], rule: "In 9/8, there are three dotted-crotchet beats, so quavers go in threes: 3 + 3 + 3." }
  };
  function groupSVG(sig, groups) {
    const ev = []; let id = 0;
    groups.forEach(n => { id++; for (let i = 0; i < n; i++) ev.push(n > 1 ? { keys: [parseN("B4")], d: .5, bm: id, stem: "down" } : { keys: [parseN("B4")], d: .5, stem: "down" }); });
    return '<div style="width:100%;max-width:340px">' + staffSVG({ clef: "treble", time: sig, events: ev.concat([{ bar: "end" }]), prop: false, spacing: 26, aria: "a bar of quavers" }).replace("<svg ", '<svg style="max-width:none!important;width:100%" ') + "</div>";
  }
  TGEN.grouping = function (p) {
    const sigs = Object.keys(GROUP).filter(s => p.g >= 3 || !/8$/.test(s)), sig = pick(sigs), G = GROUP[sig];
    const good = pick(G.ok), wrongs = shuffle(G.bad).slice(0, 3), all = shuffle([good].concat(wrongs));
    return { wide: true, prompt: "Which bar of " + sig + " is grouped (beamed) correctly?", options: all.map(g => Object.assign(opt(g.join("+"), groupSVG(sig, g)), { svg: true })), answer: good.join("+"),
      explain: G.rule + " The right answer groups them " + good.join(" + ") + "." };
  };

  /* ---------- 2. complete the bar ---------- */
  const DN = { .25: "semiquaver", .5: "quaver", .75: "dotted quaver", 1: "crotchet", 1.5: "dotted crotchet", 2: "minim", 3: "dotted minim", 4: "semibreve" };
  TGEN.complete = function (p) {
    let pc, bar, last; for (let t = 0; t < 40; t++) {
      pc = SIGHTREAD.makePiece(p.g, FLUTE); const b = 1 + rnd(Math.max(1, pc.bars - 2));
      bar = pc.notes.filter(n => n.t >= b * pc.beats - 1e-6 && n.t < (b + 1) * pc.beats - 1e-6); last = bar[bar.length - 1];
      if (bar.length >= 2 && last && !last.rest && DN[last.d]) break;
    }
    const ev = bar.slice(0, -1).map(n => n.rest ? { rest: true, d: n.d } : { keys: [fromMidiInKey(n.m, pc.k, pc.mode)], d: n.d }); autoBeam(ev, 1);
    const right = DN[last.d], pool = Object.values(DN).filter(x => x !== right && (p.g >= 3 || !/semi|dotted quaver/.test(x)));
    const have = bar.slice(0, -1).reduce((a, n) => a + n.d, 0);
    const opts = [right]; shuffle(pool).forEach(x => { if (opts.length < 4) opts.push(x); });
    return { prompt: "This bar of " + pc.beats + "/4 is one note short. Which single note completes it?", visual: '<div style="overflow-x:auto">' + staffSVG({ clef: "treble", key: pc.k, time: pc.beats + "/4", events: ev.concat([{ bar: "end" }]), prop: true, aria: "a bar with a note missing" }) + "</div>",
      options: shuffle(opts).map(x => opt(x)), answer: right,
      explain: "The bar has " + have + " of its " + pc.beats + " crotchet beats, so it needs " + last.d + " more: a <b>" + right + "</b>." };
  };

  /* ---------- 3. ornaments ---------- */
  const SYM = {
    trill: '<text x="4" y="28" font-style="italic" font-weight="700" font-size="22" font-family="Georgia,serif" fill="currentColor">tr</text><path d="M30 20 q4-8 8 0 t8 0 t8 0" stroke="currentColor" fill="none" stroke-width="2.2"/>',
    upper: '<path d="M8 26 l7-12 l7 12 l7-12 l7 12 l7-12 l7 12" stroke="currentColor" fill="none" stroke-width="2.4" stroke-linejoin="round"/>',
    lower: '<path d="M8 26 l7-12 l7 12 l7-12 l7 12 l7-12 l7 12" stroke="currentColor" fill="none" stroke-width="2.4" stroke-linejoin="round"/><line x1="32" y1="6" x2="32" y2="34" stroke="currentColor" stroke-width="2.2"/>',
    turn: '<path d="M14 26 C 6 26 6 14 14 14 C 22 14 26 26 34 26 C 42 26 42 14 34 14" stroke="currentColor" fill="none" stroke-width="2.6" stroke-linecap="round"/>',
    inv: '<path d="M14 26 C 6 26 6 14 14 14 C 22 14 26 26 34 26 C 42 26 42 14 34 14" stroke="currentColor" fill="none" stroke-width="2.6" stroke-linecap="round"/><line x1="24" y1="6" x2="24" y2="34" stroke="currentColor" stroke-width="2.2"/>'
  };
  const ORN = [
    { id: "upper", n: "upper mordent", r: ["D5", "E5", "D5"], d: [.25, .25, 1.5], t: "the written note, the note above, then the written note again" },
    { id: "lower", n: "lower mordent", r: ["D5", "C5", "D5"], d: [.25, .25, 1.5], t: "the written note, the note below, then the written note again" },
    { id: "turn", n: "turn", r: ["E5", "D5", "C5", "D5"], d: [.5, .5, .5, .5], t: "the note above, the written note, the note below, the written note" },
    { id: "inv", n: "inverted turn", r: ["C5", "D5", "E5", "D5"], d: [.5, .5, .5, .5], t: "the note below, the written note, the note above, the written note" },
    { id: "trill", n: "trill", r: ["E5", "D5", "E5", "D5", "E5", "D5", "E5", "D5"], d: [.25, .25, .25, .25, .25, .25, .25, .25], t: "a quick alternation with the note above (in Baroque music, starting on the note above)" }
  ];
  const glyph = id => '<svg viewBox="0 0 64 40" width="48" height="30" style="color:var(--ink);display:block;width:48px!important;height:30px!important;margin:0 0 -18px 58px" aria-hidden="true">' + SYM[id] + "</svg>";
  const real = o => { const ev = o.r.map((s, i) => ({ keys: [parseN(s)], d: o.d[i] })); autoBeam(ev, 1); return staffSVG({ clef: "treble", events: ev.concat([{ bar: "end" }]), prop: true, aria: "played as" }); };
  TGEN.ornament = function () {
    const o = pick(ORN), written = '<div style="display:inline-block;width:170px">' + glyph(o.id) + staffSVG({ clef: "treble", events: [{ keys: [parseN("D5")], d: 2 }, { bar: "end" }], prop: true, aria: "written note D" }) + "</div>";
    const sound = x => () => playEvents(x.r.map((s, i) => ({ m: midiOf(parseN(s)), t: x.d.slice(0, i).reduce((a, b) => a + b, 0), d: x.d[i], v: .8 })), 72);
    if (Math.random() < .5) return { prompt: "What is this ornament called?", visual: written, options: shuffle(ORN.map(x => opt(x.n))), answer: o.n, explain: "It's a <b>" + o.n + "</b>: play " + o.t + ".", play: sound(o), playLabel: "Hear it played" };
    const others = shuffle(ORN.filter(x => x !== o)).slice(0, 2), all = shuffle([o].concat(others));
    return { prompt: "How is this " + o.n + " played?", visual: written, options: all.map(x => Object.assign(opt(x.id, real(x)), { svg: true })), answer: o.id,
      explain: (/^[aeiou]/.test(o.n) ? "An " : "A ") + o.n + " is " + o.t + ".", play: sound(o), playLabel: "Hear it played", extra: all.map((x, i) => ({ label: "Hear " + "ABC"[i], fn: sound(x) })) };
  };

  /* ---------- 4. which music did you hear? ---------- */
  TGEN.hearmatch = function (p) {
    let pc, ns; for (let t = 0; t < 30; t++) { pc = SIGHTREAD.makePiece(p.g, FLUTE); ns = pc.notes.filter(n => n.t < 2 * pc.beats - 1e-6); if (ns.filter(n => !n.rest).length >= 4) break; }
    const kp = keyPcs(pcOf(pc.tonic), pc.mode), idxs = ns.map((n, i) => i).filter(i => !ns[i].rest && i > 0);
    const pitchV = () => { const c = ns.map(n => Object.assign({}, n)), i = pick(idxs); c[i].m = scaleStep(c[i].m, pick([-1, 1]) * (Math.random() < .5 ? 1 : 1), kp); if (Math.random() < .5) c[i].m = scaleStep(c[i].m, c[i].m > ns[i].m ? 1 : -1, kp); return { c, why: "a different note in " + (Math.floor(ns[i].t / pc.beats) + 1 === 1 ? "bar 1" : "bar 2") }; };
    const rhythmV = () => { const c = ns.map(n => Object.assign({}, n)); for (let i = 0; i < c.length - 1; i++) if (!c[i].rest && !c[i + 1].rest && c[i].d !== c[i + 1].d && Math.floor(c[i].t / pc.beats) === Math.floor(c[i + 1].t / pc.beats)) { const d = c[i].d; c[i].d = c[i + 1].d; c[i + 1].d = d; c[i + 1].t = c[i].t + c[i].d; return { c, why: "a different rhythm" }; } return null; };
    const vs = [pitchV(), rhythmV() || pitchV()].filter(v => JSON.stringify(v.c.map(n => [n.m, n.d])) !== JSON.stringify(ns.map(n => [n.m, n.d])));
    const all = shuffle([{ c: ns, why: null }].concat(vs)), L = "ABC";
    const svgOf = c => { const ev = []; let pos = 0; c.forEach(n => { ev.push(n.rest ? { rest: true, d: n.d } : { keys: [fromMidiInKey(n.m, pc.k, pc.mode)], d: n.d }); pos += n.d; if (Math.abs(pos / pc.beats - Math.round(pos / pc.beats)) < 1e-6) ev.push({ bar: pos >= 2 * pc.beats - 1e-6 ? "end" : true }); }); autoBeam(ev, 1); return staffSVG({ clef: "treble", key: pc.k, time: pc.beats + "/4", events: ev, prop: true, aria: "a melody" }); };
    const right = all.findIndex(x => !x.why);
    return { prompt: "Listen, then choose the music you heard.", options: all.map((x, i) => Object.assign(opt(L[i], '<b style="display:block;text-align:left">' + L[i] + "</b>" + svgOf(x.c)), { svg: true })), answer: L[right],
      play: () => { let t = 0; return playEvents(ns.filter(n => !n.rest).map(n => ({ m: n.m, t: n.t, d: n.d, v: .8 })), Math.min(pc.tempo, 80)); }, playLabel: "Play the melody",
      explain: all.map((x, i) => "<b>" + L[i] + ":</b> " + (x.why ? "has " + x.why + "." : "matches what you heard.")).join("<br>") + " Follow the shape (up or down, step or leap) and the long and short notes as you listen." };
  };

  /* wide options (whole bars) sit one per row */
  const pr0 = paintRound;
  paintRound = function () { pr0(); const R = VIEW.round, o = document.querySelector("#ex .opts"); if (R && R.q && R.q.wide && o) { o.style.gridTemplateColumns = "minmax(0,1fr)"; o.querySelectorAll(".opt").forEach(b => { b.style.maxWidth = "380px"; b.style.width = "100%"; }); } };

  /* ---------- lessons and the section ---------- */
  const add = l => { LESSON_BY[l.id] = l; };
  for (let g = 1; g <= 5; g++) add({ id: "ms-group-g" + g, g, topic: "Musicianship", t: "Grouping notes correctly", gen: "grouping", p: { g }, h: "<p>Notes are beamed (grouped) to show where the beats are, so a player can read the rhythm at a glance. Group by the <b>beat</b>: crotchet beats in simple time, dotted-crotchet beats in compound time. In 4/4 you may beam half a bar together, but never across the middle.</p>" });
  for (let g = 1; g <= 5; g++) add({ id: "ms-complete-g" + g, g, topic: "Musicianship", t: "Complete the bar", gen: "complete", p: { g }, h: "<p>Add up the beats already in the bar, take that from the number the time signature asks for, and choose the single note that fills the gap. A dot adds half the note's value again.</p>" });
  add({ id: "ms-ornaments", g: 5, topic: "Musicianship", t: "Ornaments", gen: "ornament", p: {}, h: "<p>Ornaments decorate a note. Learn the five common signs and how each is played: the <b>upper mordent</b> (note, above, note), the <b>lower mordent</b> (note, below, note), the <b>turn</b> (above, note, below, note), the <b>inverted turn</b> (below, note, above, note) and the <b>trill</b> (a quick shake with the note above). How exactly they're played depends on the period, so check your edition for your pieces.</p>" });
  for (let g = 1; g <= 5; g++) add({ id: "ms-hear-g" + g, g, topic: "Musicianship", t: "Which music did you hear?", gen: "hearmatch", p: { g }, h: "<p>Hear a short melody, then pick the notation that matches it. Follow the shape (up or down, by step or leap) and the rhythm. This links what you hear to what you read, the skill behind sight-singing, dictation and spotting changes in aural tests.</p>" });
  const can = g => !window.TR || TR.can("theory", g);
  const row = (pre, max) => Array.from({ length: max }, (_, i) => i + 1).map(g => can(g) ? '<button class="btn small ghost" style="min-width:44px;padding:0 8px" data-act="lesson" data-arg="' + pre + g + '" aria-label="Grade ' + g + '">' + g + "</button>" : '<a class="btn small ghost" style="min-width:44px;padding:0 8px;opacity:.6" href="../app.html#plans" aria-label="Grade ' + g + ' (comes with a plan)">' + g + "🔒</a>").join("");
  const card = (sym, t, d, inner) => '<div class="lesson" style="cursor:default"><span class="n">' + sym + '</span><div style="flex:1"><div style="font-weight:700">' + t + '</div><div class="muted" style="font-size:.85rem">' + d + '</div><div class="row" style="gap:4px;margin-top:6px">' + inner + "</div></div></div>";
  const extra = () => card("⌒", "Grouping notes correctly", "Which bar is beamed right? · choose a grade", row("ms-group-g", 5)) + card("+", "Complete the bar", "Which note fills the gap? · choose a grade", row("ms-complete-g", 5)) + card("👂", "Which music did you hear?", "Match a melody to its notation · choose a grade", row("ms-hear-g", 5)) +
    (can(5) ? '<button class="lesson" data-act="lesson" data-arg="ms-ornaments"><span class="n">~</span><div><div style="font-weight:700">Ornaments</div><div class="muted" style="font-size:.85rem">Name them and choose how they\'re played</div></div></button>' : '<a class="lesson" href="../app.html#plans" style="text-decoration:none;color:inherit"><span class="n">~</span><div><div style="font-weight:700">Ornaments 🔒</div><div class="muted" style="font-size:.85rem">Comes with a plan</div></div></a>');
  const th0 = theoryHome;
  theoryHome = function () {
    const h = th0(), at = h.indexOf('<h2 style="margin-top:22px">Mock exams</h2>');
    if (h.indexOf("<h2 style=\"margin-top:22px\">Musicianship</h2>") < 0 || at < 0) return h;
    const end = h.lastIndexOf("</div>", at);
    return h.slice(0, end) + extra() + h.slice(end);
  };
  if (typeof render === "function") render();
})();
