/* The Theory Room: musicianship drills on the Theory tab.
   1. Questions on a piece (Grades 1–8): a new short piece each time, with the questions both boards
      ask about music on the page: key, time, bars, highest and lowest notes, intervals, the last note.
   2. Spot the mistake (Grades 1–5): four bars, one with the wrong number of beats.
   3. Periods and styles: Baroque, Classical, Romantic and 20th-century features and composers.
   4. Form and structure: binary, ternary, rondo, variations, minuet and trio, sonata form and more.
   Loaded last. Data for 3 and 4 is shared with the Handbook (window.TR_STYLE). */
(function () {
  "use strict";
  const STYLE = window.TR_STYLE = window.TR_STYLE || {};
  STYLE.PERIODS = [
    { n: "Baroque", d: "about 1600–1750", c: ["Bach", "Handel", "Vivaldi", "Purcell", "Telemann", "Corelli"], f: ["the harpsichord and basso continuo", "terraced dynamics: sudden changes between loud and soft", "lots of ornaments", "one mood kept through a whole movement", "counterpoint and fugues", "melodies built from sequences"] },
    { n: "Classical", d: "about 1750–1820", c: ["Haydn", "Mozart", "Clementi", "early Beethoven"], f: ["balanced, regular phrases, often four bars long", "an Alberti bass in the left hand", "a clear melody over a simple accompaniment", "gradual crescendos and diminuendos", "sonata form", "the piano taking over from the harpsichord"] },
    { n: "Romantic", d: "about 1820–1900", c: ["Chopin", "Schumann", "Brahms", "Tchaikovsky", "Liszt", "Grieg"], f: ["rubato and expressive changes of tempo", "rich, chromatic harmony", "a very wide range of dynamics", "long, singing melodies", "programme music and short character pieces", "a large orchestra"] },
    { n: "20th century", d: "from about 1900", c: ["Debussy", "Bartók", "Stravinsky", "Shostakovich", "Prokofiev", "Gershwin"], f: ["whole-tone and modal scales", "dissonance used freely", "irregular and changing time signatures", "jazz and folk-music influences", "new sounds and unusual textures", "sharp, percussive rhythms"] }
  ];
  STYLE.FORMS = [
    ["Binary", "AB", "Two sections, each usually repeated. A moves away from the home key and B finds its way back. Common in Baroque dances."],
    ["Ternary", "ABA", "A first section, a contrasting middle section, then the first section again."],
    ["Rondo", "ABACA", "A main theme that keeps coming back, with contrasting episodes in between."],
    ["Theme and variations", "A A¹ A² A³ …", "A theme, then the same theme changed each time: its rhythm, harmony, key, speed or decoration."],
    ["Minuet and trio", "Minuet – Trio – Minuet", "A dance in 3/4 time. The trio is a second, contrasting minuet; then the first returns, usually without its repeats."],
    ["Sonata form", "Exposition – Development – Recapitulation", "Two main themes in different keys are set out, worked through and changed in the development, then both return in the home key."],
    ["Strophic", "A A A …", "A song with the same music for every verse."],
    ["Through-composed", "A B C D …", "New music all the way through, following the words or the story."]
  ];
  if (typeof TGEN === "undefined" || !window.SIGHTREAD) return;
  const FLUTE = SIGHTREAD.instOf("flute"), P_ = STYLE.PERIODS, F_ = STYLE.FORMS;
  const four = (right, pool) => { const o = [right]; shuffle(pool).forEach(x => { if (o.length < 4 && o.indexOf(x) < 0) o.push(x); }); return shuffle(o).map(x => opt(x)); };

  /* ---------- periods and styles ---------- */
  TGEN.period = function () {
    const P = pick(P_), others = P_.filter(x => x !== P), kind = rnd(4);
    if (kind === 0) { const f = pick(P.f); return { prompt: "Which period of music is known for " + f + "?", options: P_.map(x => opt(x.n)), answer: P.n, explain: "<b>" + P.n + "</b> (" + P.d + "): " + P.f.slice(0, 3).join("; ") + "." }; }
    if (kind === 1) { const c = pick(P.c); return { prompt: "Which period does " + c + " belong to?", options: P_.map(x => opt(x.n)), answer: P.n, explain: c + " is a <b>" + P.n + "</b> composer, like " + P.c.filter(x => x !== c).slice(0, 3).join(", ") + "." }; }
    if (kind === 2) return { prompt: "Roughly when was the " + P.n + " period?", options: shuffle(P_.map(x => opt(x.d))), answer: P.d, explain: "The " + P.n + " period: <b>" + P.d + "</b>. Dates are only a guide: styles overlap." };
    const NOT = { "Baroque": ["rubato and expressive changes of tempo", "an Alberti bass in the left hand", "irregular and changing time signatures", "jazz influences"],
      "Classical": ["a basso continuo part throughout", "irregular and changing time signatures", "whole-tone scales", "jazz influences"],
      "Romantic": ["a basso continuo part throughout", "terraced dynamics only, with no gradual changes", "jazz influences", "music with no key at all"],
      "20th century": ["a basso continuo part throughout", "strictly balanced four-bar phrases everywhere"] };
    const wrong = pick(NOT[P.n]);
    return { prompt: "Which of these is <b>not</b> typical of " + P.n + " music?", options: shuffle(shuffle(P.f).slice(0, 3).concat([wrong])).map(x => opt(x)), answer: wrong, explain: "“" + wrong + "” isn't typical of " + P.n + " music. Typical: " + P.f.slice(0, 3).join("; ") + "." };
  };
  /* ---------- form ---------- */
  TGEN.form = function () {
    const F = pick(F_), names = F_.map(x => x[0]), kind = rnd(3);
    if (kind === 0) return { prompt: F[2].replace(F[0], "This form") + " Which form is this?", options: four(F[0], names), answer: F[0], explain: "<b>" + F[0] + "</b>: " + F[1] + "." };
    if (kind === 1) return { prompt: "Which form is shown by the plan <b>" + F[1] + "</b>?", options: four(F[0], names), answer: F[0], explain: "<b>" + F[0] + "</b>: " + F[2] };
    return { prompt: "What is the plan of " + F[0].toLowerCase() + " form?", options: four(F[1], F_.map(x => x[1])), answer: F[1], explain: "<b>" + F[0] + "</b>: " + F[2] };
  };

  /* ---------- questions on a piece ---------- */
  const ORDN = ["", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];
  TGEN.pieceq = function (p) {
    const pc = SIGHTREAD.makePiece(p.g, FLUTE), ns = pc.notes.filter(n => !n.rest), sp = n => fromMidiInKey(n.m, pc.k, pc.mode);
    const visual = SIGHTREAD.scoreSVG(pc, FLUTE), key = keyName(pc.k, pc.mode);
    const okInt = ns.some((n, i) => i && n.m !== ns[i - 1].m && Math.abs(n.m - ns[i - 1].m) <= 12);
    const kinds = ["key", "beats", "bars", "high", "low", "last"].concat(p.g >= 3 && okInt ? ["int", "int"] : []), kind = pick(kinds);
    const base = { visual, play: () => playEvents(ns.map(n => ({ m: n.m, t: n.t, d: n.d, v: .8 })), pc.tempo), playLabel: "Hear the piece" };
    if (kind === "key") {
      const rel = pc.mode === "major" ? keyName(pc.k, "minor") : keyName(pc.k, "major"), near = [pc.k + 1, pc.k - 1, pc.k + 2].filter(x => Math.abs(x) <= 7).map(x => keyName(x, pc.mode));
      return Object.assign(base, { prompt: "Which key is this piece in?", options: four(key, [rel].concat(near)), answer: key,
        explain: "The key signature fits " + key + " and " + rel + ". The piece " + (pc.mode === "minor" && ns.some(n => nm(sp(n)) === nm(upBy(minorTonic(pc.k), 7, "M"))) ? "uses the raised 7th and " : "") + "ends on " + nm(sp(ns[ns.length - 1])) + ", so it's <b>" + key + "</b>." });
    }
    if (kind === "beats") return Object.assign(base, { prompt: "The time signature is " + pc.beats + "/4. What does it mean?", options: four(pc.beats + " crotchet beats in a bar", [pc.beats + " minim beats in a bar", (pc.beats === 3 ? 4 : 3) + " crotchet beats in a bar", pc.beats + " quaver beats in a bar"]), answer: pc.beats + " crotchet beats in a bar", explain: "The top number counts the beats; the 4 underneath means each beat is a crotchet." });
    if (kind === "bars") return Object.assign(base, { prompt: "How many bars long is this piece?", options: four(String(pc.bars), [pc.bars - 1, pc.bars + 1, pc.bars * 2, pc.bars + 2].map(String)), answer: String(pc.bars), explain: "Count the bar numbers or the barlines: <b>" + pc.bars + "</b> bars." });
    if (kind === "high" || kind === "low") {
      const ms = ns.map(n => n.m), m = kind === "high" ? Math.max(...ms) : Math.min(...ms), n0 = sp(ns.find(n => n.m === m)), right = nm(n0);
      const pool = [...new Set(ns.map(n => nm(sp(n))))].filter(x => x !== right);
      return Object.assign(base, { prompt: "What is the " + (kind === "high" ? "highest" : "lowest") + " note in the piece?", options: four(right, pool.length >= 3 ? pool : pool.concat(["C", "D", "E", "F", "G", "A", "B"].filter(x => x !== right))), answer: right, explain: "The " + (kind === "high" ? "highest" : "lowest") + " note is <b>" + right + "</b>." });
    }
    if (kind === "last") return Object.assign(base, { prompt: "The piece ends on which degree of the scale?", options: four("the tonic (1st)", ["the dominant (5th)", "the mediant (3rd)", "the leading note (7th)", "the subdominant (4th)"]), answer: "the tonic (1st)", explain: "It ends on " + nm(sp(ns[ns.length - 1])) + ", the keynote of " + key + ": the <b>tonic</b>." });
    /* an interval between two neighbouring notes */
    let i = 1; const pairs = []; for (; i < ns.length; i++) if (ns[i].m !== ns[i - 1].m && Math.abs(ns[i].m - ns[i - 1].m) <= 12) pairs.push(i);
    const j = pick(pairs), a = sp(ns[j - 1]), b = sp(ns[j]), lo = midiOf(a) <= midiOf(b) ? a : b, hi = lo === a ? b : a, iv = intervalOf(lo, hi);
    const right = intName(iv.num, iv.q), barNo = Math.floor(ns[j].t / pc.beats) + 1;
    const pool = ["major 2nd", "minor 2nd", "major 3rd", "minor 3rd", "perfect 4th", "perfect 5th", "major 6th", "minor 6th", "minor 7th", "perfect octave", "augmented 4th"];
    return Object.assign(base, { prompt: "Name the interval between the notes " + nm(a) + " and " + nm(b) + " (bar " + barNo + ").", options: four(right, pool.filter(x => x !== right)), answer: right, explain: "From " + nm(lo) + " up to " + nm(hi) + " is a <b>" + right + "</b>: count the letters for the number, then the semitones (" + iv.semis + ") for the type." });
  };

  /* ---------- spot the mistake ---------- */
  TGEN.spotbar = function (p) {
    let pc; for (let t = 0; t < 20; t++) { pc = SIGHTREAD.makePiece(p.g, FLUTE); if (pc.bars >= 4) break; }
    const beats = pc.beats, bars = [0, 1, 2, 3].map(b => pc.notes.filter(n => n.t >= b * beats - 1e-6 && n.t < (b + 1) * beats - 1e-6).map(n => Object.assign({}, n)));
    const bad = rnd(4), bar = bars[bad], idx = bar.map((n, i) => i).filter(i => !bar[i].rest), k = pick(idx.length ? idx : [0]), d0 = bar[k].d;
    const choices = [[1, 2], [2, 1], [2, 3], [1, 1.5], [.5, 1], [3, 2], [4, 3], [1.5, 1]].filter(c => c[0] === d0);
    bar[k].d = choices.length ? pick(choices)[1] : d0 + 1;
    const total = bar.reduce((a, n) => a + n.d, 0);
    const ev = []; bars.forEach((b, bi) => { b.forEach(n => ev.push(n.rest ? { rest: true, d: n.d } : { keys: [fromMidiInKey(n.m, pc.k, pc.mode)], d: n.d })); ev.push({ bar: bi === 3 ? "end" : true }); });
    try { autoBeam(ev, 1); } catch (e) {}
    const word = x => x === 1 ? "1 beat" : (Number.isInteger(x) ? x : x.toString().replace(".5", "½")) + " beats";
    return { prompt: "One bar has the wrong number of beats for " + beats + "/4. Which bar?", visual: '<div style="overflow-x:auto">' + staffSVG({ clef: "treble", key: pc.k, time: beats + "/4", events: ev, prop: true, aria: "four bars" }) + "</div>",
      options: [1, 2, 3, 4].map(n => opt(String(n), "Bar " + n)), answer: String(bad + 1),
      explain: "Bar " + (bad + 1) + " adds up to <b>" + word(total) + "</b> instead of " + word(beats) + ". Count every bar of your answers in the exam, the same way." };
  };


  /* ---------- major or relative minor? ---------- */
  TGEN.keymm = function (p) {
    const want = Math.random() < .5 ? "minor" : "major"; let pc; for (let i = 0; i < 40; i++) { pc = SIGHTREAD.makePiece(p.g, FLUTE); if (pc.mode === want) break; }
    const ns = pc.notes.filter(n => !n.rest), sp = n => fromMidiInKey(n.m, pc.k, pc.mode), maj = keyName(pc.k, "major"), min = keyName(pc.k, "minor");
    const right = pc.mode === "minor" ? min : maj, last = nm(sp(ns[ns.length - 1]));
    const lt = pc.mode === "minor" ? nm(upBy(minorTonic(pc.k), 7, "M")) : null, hasLT = lt && ns.some(n => nm(sp(n)) === lt);
    return { prompt: "The key signature fits " + maj + " and " + min + ". Which key is this piece in?", visual: SIGHTREAD.scoreSVG(pc, FLUTE),
      options: [opt(maj), opt(min)], answer: right,
      play: () => playEvents(ns.map(n => ({ m: n.m, t: n.t, d: n.d, v: .8 })), pc.tempo), playLabel: "Hear it",
      explain: "It ends on <b>" + last + "</b>" + (pc.mode === "minor" ? (hasLT ? ", and the raised 7th (" + lt + ") appears as an accidental" : "") + ": " + min + "." : ", the keynote of " + maj + ".") + " Check the last note, and look for the minor key's raised 7th." };
  };

  /* ---------- lessons ---------- */
  const L = [
    { id: "ms-periods", g: 5, topic: "Musicianship", t: "Periods and styles", gen: "period", p: {}, h: "<p>Knowing the periods helps with the aural test about style, the questions on a score and choosing how to play your pieces.</p>" + P_.map(x => "<p><b>" + x.n + "</b> (" + x.d + "). " + x.c.join(", ") + ".<br>" + x.f.join(" · ") + ".</p>").join("") },
    { id: "ms-form", g: 5, topic: "Musicianship", t: "Form and structure", gen: "form", p: {}, h: "<p>Form is the plan of a piece: which sections there are and which come back. Letters stand for sections, so <b>ABA</b> means a section, a different one, then the first again.</p><ul>" + F_.map(f => "<li><b>" + f[0] + "</b> (" + f[1] + "): " + f[2] + "</li>").join("") + "</ul>" }
  ];
  for (let g = 1; g <= 8; g++) L.push({ id: "ms-piece-g" + g, g, topic: "Musicianship", t: "Questions on a piece", gen: "pieceq", p: { g }, h: "<p>A new short piece each time, with the kind of questions both boards ask about music on the page: the key, the time signature, the number of bars, the highest and lowest notes, intervals and the last note. Look carefully before you answer, and play or sing it if you can.</p>" });
  for (let g = 1; g <= 5; g++) L.push({ id: "ms-spot-g" + g, g, topic: "Musicianship", t: "Spot the mistake", gen: "spotbar", p: { g }, h: "<p>Exam papers often ask you to find or correct a mistake. Count the beats in every bar: one bar here has too many or too few. Tap the beat as you count, and remember that a dot adds half the note's value.</p>" });
  for (let g = 2; g <= 5; g++) L.push({ id: "ms-keymm-g" + g, g, topic: "Musicianship", t: "Major or relative minor?", gen: "keymm", p: { g }, h: "<p>Every key signature belongs to a major key and its relative minor. To tell which one a piece is in: look at the <b>last note</b> (usually the keynote), and look for the minor key's <b>raised 7th</b>, written as an accidental (G♯ in A minor, C♯ in D minor). Hear it too: minor keys often sound darker.</p>" });
  L.forEach(l => { LESSON_BY[l.id] = l; });

  const can = g => !window.TR || TR.can("theory", g);
  const row = (pre, max) => Array.from({ length: max }, (_, i) => i + 1).map(g => can(g) ? '<button class="btn small ghost" style="min-width:44px;padding:0 8px" data-act="lesson" data-arg="' + pre + g + '" aria-label="Grade ' + g + '">' + g + "</button>" : '<a class="btn small ghost" style="min-width:44px;padding:0 8px;opacity:.6" href="../app.html#plans" aria-label="Grade ' + g + ' (comes with a plan)">' + g + "🔒</a>").join("");
  function section() {
    const card = (id, n, t, d) => can(LESSON_BY[id].g) ? '<button class="lesson" data-act="lesson" data-arg="' + id + '"><span class="n">' + n + '</span><div><div style="font-weight:700">' + t + '</div><div class="muted" style="font-size:.85rem">' + d + "</div></div></button>" : '<a class="lesson" href="../app.html#plans" style="text-decoration:none;color:inherit"><span class="n">' + n + '</span><div><div style="font-weight:700">' + t + ' 🔒</div><div class="muted" style="font-size:.85rem">Comes with a plan</div></div></a>';
    return '<h2 style="margin-top:22px">Musicianship</h2><p class="muted" style="margin-top:0">For the questions about music on the page, the style questions in aural tests and Trinity\'s musical knowledge test.</p><div class="lessons">' +
      '<div class="lesson" style="cursor:default"><span class="n">?</span><div style="flex:1"><div style="font-weight:700">Questions on a piece</div><div class="muted" style="font-size:.85rem">A new piece each time · choose a grade</div><div class="row" style="gap:4px;margin-top:6px">' + row("ms-piece-g", 8) + "</div></div></div>" +
      '<div class="lesson" style="cursor:default"><span class="n">♭</span><div style="flex:1"><div style="font-weight:700">Major or relative minor?</div><div class="muted" style="font-size:.85rem">Find the key of a piece · choose a grade</div><div class="row" style="gap:4px;margin-top:6px">' + row("ms-keymm-g", 5).replace(/<(button|a)[^>]*>1(🔒)?<\/(button|a)>/, "") + "</div></div></div>" +
      '<div class="lesson" style="cursor:default"><span class="n">✗</span><div style="flex:1"><div style="font-weight:700">Spot the mistake</div><div class="muted" style="font-size:.85rem">Find the bar with the wrong beats · choose a grade</div><div class="row" style="gap:4px;margin-top:6px">' + row("ms-spot-g", 5) + "</div></div></div>" +
      card("ms-periods", "♪", "Periods and styles", "Baroque, Classical, Romantic, 20th century") + card("ms-form", "§", "Form and structure", "Binary, ternary, rondo, variations, sonata form") + "</div>";
  }
  const th0 = theoryHome;
  theoryHome = function () {
    const h = th0(), at = h.indexOf('<h2 style="margin-top:22px">Mock exams</h2>');
    return at >= 0 ? h.slice(0, at) + section() + h.slice(at) : h + section();
  };
  if (typeof render === "function") render();
})();
