/* The Theory Room: mock exams.
   1. Timed on-screen mocks for ABRSM and Trinity Grades 1–8: 30 questions drawn from the grade's lessons
      (and some from earlier grades), a clock, instant marking, a topic-by-topic breakdown with links to
      the lessons to revisit, and a saved history.
   2. Printable written mock papers, new every time, with an answer key and marking guide:
      Trinity Grades 1–8 in sections (rhythm, pitch, keys and scales, intervals, chords, terms, analysis,
      and harmony from Grade 6); ABRSM Grades 1–5 short-answer papers; ABRSM Grades 6–8 papers with
      figured bass, completing a four-part passage, composition and score questions.
   Loaded last in the aural room. Everything here is "in the style of" the boards' papers, not official. */
(function () {
  "use strict";
  if (typeof TGEN === "undefined" || typeof LESSON_BY === "undefined") return;
  var N_Q = 30, LETTERS = "ABCDEFGH";
  var usable = function (l) { return l && !/mixed$|^c[78]-|^mock-|^hw-|^guide-/.test(l.id) && l.gen !== "mix" && l.gen !== "rread"; };
  function source(board) { return board === "trinity" ? (window.TRINITY_LESSONS || []) : LESSONS.filter(function (l) { return !l.board; }); }
  function pools(board, g) { var src = source(board).filter(usable); return { cur: src.filter(function (l) { return l.g === g; }), prev: src.filter(function (l) { return l.g < g; }) }; }

  /* ---------- 1. timed on-screen mocks ---------- */
  TGEN.mockmix = function (p) {
    /* pick a topic first, then a lesson in it, so no topic swamps the paper */
    var P0 = pools(p.board, p.g), list = P0.prev.length && Math.random() < .3 ? P0.prev : P0.cur, topics = {};
    list.forEach(function (x) { (topics[x.topic] = topics[x.topic] || []).push(x); });
    var l = pick(topics[pick(Object.keys(topics))]);
    var q = TGEN[l.gen](l.p, .6), R = VIEW.round;
    if (R) { R.mockFrom = R.mockFrom || []; R.mockFrom[R.i] = l.id; }
    q.prompt = '<span class="muted" style="font-size:.85em">' + esc(l.topic) + "</span><br>" + q.prompt;
    return q;
  };
  ["abrsm", "trinity"].forEach(function (b) {
    for (var g = 1; g <= 8; g++) {
      var id = "mock-" + b + "-g" + g;
      LESSON_BY[id] = { id: id, g: g, board: b === "trinity" ? "trinity" : undefined, mock: true, n: N_Q, mins: g <= 3 ? 30 : g <= 5 ? 40 : 50, topic: "Exam practice", t: (b === "trinity" ? "Trinity" : "ABRSM") + " Grade " + g + " timed mock", gen: "mockmix", p: { board: b, g: g },
        h: "<p><b>" + N_Q + " questions</b> from across the grade, with some from earlier grades, as in the real exam. Work without help, and aim to finish in about " + (g <= 3 ? 30 : g <= 5 ? 40 : 50) + " minutes. At the end you'll see your score, your time, and which topics to revise, with links straight to them.</p><p class=\"muted\">This is a practice test in the style of the exam, not an official paper. The board's syllabus sets out the real paper's layout and marks.</p>" };
    }
  });
  var sr0 = startRound;
  startRound = function (src, id, level) {
    sr0(src, id, level);
    var l = LESSON_BY[id], R = VIEW.round;
    if (src === "theory" && l && l.mock && R) { R.total = l.n; R.t0 = Date.now(); R.mockFrom = R.mockFrom || []; if (typeof paintRound === "function") paintRound(); }
  };
  function fmt(s) { s = Math.round(s); return Math.floor(s / 60) + " min " + (s % 60) + " s"; }
  var sum0 = summaryHTML;
  summaryHTML = function () {
    var R = VIEW.round, l = R && R.src === "theory" && LESSON_BY[R.id];
    if (!l || !l.mock) return sum0();
    var n = R.res.length, right = R.res.filter(function (x) { return x >= 1; }).length, pct = Math.round(100 * right / Math.max(1, n));
    if (!R.t1) R.t1 = Date.now();
    var secs = (R.t1 - R.t0) / 1000, p = P();
    if (!R.saved) { p.mockT = p.mockT || {}; (p.mockT[l.id] = p.mockT[l.id] || []).push({ d: new Date().toISOString().slice(0, 10), s: right, n: n, secs: Math.round(secs) }); save(); R.saved = true; }
    var by = {}, les = {};
    R.res.forEach(function (x, i) { var id = (R.mockFrom || [])[i], L2 = LESSON_BY[id]; if (!L2) return; var t = L2.topic; by[t] = by[t] || { a: 0, c: 0 }; by[t].a++; if (x >= 1) by[t].c++; les[id] = les[id] || { a: 0, c: 0 }; les[id].a++; if (x >= 1) les[id].c++; });
    var weak = Object.keys(les).filter(function (id) { return les[id].c < les[id].a; }).sort(function (a, b) { return (les[a].c / les[a].a) - (les[b].c / les[b].a); }).slice(0, 6);
    var verdict = pct >= 90 ? "Excellent: you're exam-ready on this evidence." : pct >= 80 ? "Strong. Tidy up the topics below and you'll be in great shape." : pct >= 66 ? "Getting there. Spend a few days on the topics below, then try another mock." : "Keep going: work through the lessons below, then try again.";
    var hist = (p.mockT[l.id] || []).slice(-5);
    return '<div class="panel ex"><div class="kicker">' + esc(l.t) + "</div><h2>" + right + " out of " + n + " · " + pct + "%</h2><p>" + verdict + "</p><p class=\"muted\">Time: " + fmt(secs) + " (guide: " + l.mins + " minutes).</p>" +
      '<h3 style="margin:14px 0 6px">By topic</h3><div style="display:grid;gap:6px">' + Object.keys(by).sort().map(function (t) { var b = by[t], w = Math.round(100 * b.c / b.a); return '<div style="display:grid;grid-template-columns:minmax(0,1fr) 120px 48px;gap:10px;align-items:center"><span>' + esc(t) + '</span><span style="height:10px;border-radius:6px;background:var(--line);overflow:hidden"><span style="display:block;height:100%;width:' + w + "%;background:" + (w >= 80 ? "var(--teal)" : w >= 50 ? "var(--brass, #b58a2a)" : "#c0504d") + '"></span></span><span class="muted">' + b.c + "/" + b.a + "</span></div>"; }).join("") + "</div>" +
      (weak.length ? '<h3 style="margin:16px 0 6px">Revise these next</h3><div class="lessons">' + weak.map(function (id) { var L2 = LESSON_BY[id]; return '<button class="lesson" data-act="lesson" data-arg="' + id + '"><span class="n">' + les[id].c + "/" + les[id].a + '</span><div><div style="font-weight:700">' + esc(L2.t) + '</div><div class="muted" style="font-size:.85rem">' + (L2.board === "trinity" ? "Trinity " : "") + "Grade " + L2.g + " · " + esc(L2.topic) + "</div></div></button>"; }).join("") + "</div>" : "") +
      (hist.length > 1 ? '<p class="muted" style="margin-top:12px">Your last ' + hist.length + " tries: " + hist.map(function (h) { return Math.round(100 * h.s / h.n) + "%"; }).join(" → ") + "</p>" : "") +
      '<div class="row" style="margin-top:14px"><button class="btn primary" data-act="startLesson">Another mock</button><button class="btn ghost" data-mockpaper="' + (l.board === "trinity" ? "trinity" : "abrsm") + ":" + l.g + '">Print a written paper</button></div></div>';
  };

  /* ---------- 2. printable written papers ---------- */
  var figStack = function (arr) { return arr.length ? '<span class="fig">' + arr.map(function (x) { return "<span>" + x + "</span>"; }).join("") + "</span>" : "5 3 (often left blank)"; };
  function mcHTML(q, num) {
    if (q.type === "barlines") return '<div class="qp">' + num + ". " + "Add the missing bar lines. The time signature is " + esc(q.sig) + ".</div><div class=\"notation\">" + rhythmSVG(q.events, { time: q.sig, prop: true, endBar: true }) + "</div>";
    return '<div class="qp">' + num + ". " + q.prompt + "</div>" + (q.visual ? '<div class="notation">' + q.visual + "</div>" : "") + '<ol class="ch">' + q.options.map(function (o, j) { return '<li><span class="lt">' + LETTERS[j] + '</span><span class="ot">' + o.html + "</span></li>"; }).join("") + "</ol>";
  }
  function mcAnswer(q) {
    if (q.type === "barlines") return '<div class="notation">' + rhythmSVG(q.events, { time: q.sig, prop: true, gaps: true, barsAt: q.correct, endBar: true }) + "</div>";
    var j = q.options.findIndex(function (o) { return o.k === q.answer; }); return "<b>" + LETTERS[j] + "</b> " + q.options[j].html + (q.explain ? '<div class="ex">' + q.explain + "</div>" : "");
  }
  function questionsFrom(lessons, k) {
    var out = [], seen = {};
    for (var t = 0; out.length < k && t < 60; t++) {
      var l = pick(lessons); if (!l) break; var q; try { q = TGEN[l.gen](l.p, .3 + Math.random() * .6); } catch (e) { continue; }
      if (!q || (q.type && q.type !== "mc" && q.type !== "barlines") || (q.type !== "barlines" && (!q.options || q.options.length < 2))) continue;
      var key = (q.prompt || "") + (q.visual || "").length + q.answer; if (seen[key]) continue; seen[key] = 1; out.push(q);
    }
    return out;
  }
  var blank = function (clef, k, w) { return '<div class="notation">' + staffSVG({ clef: clef, key: k || 0, events: [], minW: w || 560 }) + "</div>"; };
  function keysForGrade(board, g) {
    var l = source(board).filter(function (x) { return x.g === g && x.gen === "keySig"; })[0] || source(board).filter(function (x) { return x.g <= g && x.gen === "keySig"; }).slice(-1)[0];
    return l && l.p.keys ? l.p.keys : [-1, 0, 1];
  }
  function scaleTask(board, g) {
    var ks = keysForGrade(board, g).filter(function (k) { return Math.abs(k) <= 5; }), k = pick(ks), minor = g >= 2 && Math.random() < .5;
    var t = minor ? minorTonic(k) : majorTonic(k), type = minor ? (g >= 3 && Math.random() < .5 ? "melodic" : "harmonic") : "major";
    var sc = scaleOf(N(t.L, t.acc, 4), type).slice(0, 8);
    if (diaOf(sc[0]) > 32) sc = sc.map(function (n) { return N(n.L, n.acc, n.oct - 1); });
    var name = keyName(k, minor ? "minor" : "major") + (minor ? " (" + type + (type === "melodic" ? ", going up" : "") + ")" : "");
    return { q: "Write one octave of the scale of <b>" + esc(name) + "</b>, going up, in semibreves. Use the key signature" + (minor ? " and add any accidentals the scale needs." : "."), blank: blank("treble", 0),
      a: '<div class="notation">' + staffSVG({ clef: "treble", key: k, events: sc.map(function (n) { return { keys: [n], d: 4 }; }), prop: false, spacing: 44, minW: 520 }) + "</div>" };
  }
  function triadTask(board, g) {
    var k = pick(keysForGrade(board, g).filter(function (k) { return Math.abs(k) <= 4; })), minor = g >= 2 && Math.random() < .4, t = minor ? minorTonic(k) : majorTonic(k);
    var sc = scaleOf(N(t.L, t.acc, 4), minor ? "harmonic" : "major"), clef = Math.random() < .5 ? "treble" : "bass";
    var tri = [sc[0], sc[2], sc[4]].map(function (n) { return clef === "bass" ? N(n.L, n.acc, n.oct - 1) : n; });
    return { q: "Write the tonic triad of <b>" + esc(keyName(k, minor ? "minor" : "major")) + "</b> in root position, in the " + clef + " clef. Use the key signature.", blank: blank(clef, 0, 260),
      a: '<div class="notation">' + staffSVG({ clef: clef, key: k, events: [{ keys: tri, d: 4 }], prop: false, minW: 220 }) + "</div>" };
  }
  function analysisTask(board, g) {
    var inst = SIGHTREAD.instOf(pick(["violin", "flute"])), pc = SIGHTREAD.makePiece(Math.min(8, g), inst);
    var termPool = board === "trinity" ? ((window.TRINITY_TERMS || {})[Math.min(g, 8)] || []) : TERMS.filter(function (t) { return t[2] === Math.min(g, 5); });
    var term = pick(termPool) || ["andante", "at a walking pace"];
    var notes = pc.notes.filter(function (n) { return !n.rest; }), hi = notes.reduce(function (a, n) { return n.m > a.m ? n : a; }, notes[0]);
    var hiName = nm(fromMidiInKey(hi.m, pc.k, pc.mode)), hiBar = Math.floor(hi.t / pc.beats + 1e-6) + 1;
    var last = notes[notes.length - 1], lastName = nm(fromMidiInKey(last.m, pc.k, pc.mode));
    var qs = [
      ["In which key is this melody?", esc(keyName(pc.k, pc.mode))],
      ["What does the time signature tell you?", pc.beats + " crotchet beats in each bar (" + pc.beats + "/4)"],
      ["How many bars are there?", String(pc.bars)],
      ["Name the highest note, and give its bar number.", esc(hiName) + ", bar " + hiBar + (notes.filter(function (n) { return n.m === hi.m; }).length > 1 ? " (its first appearance)" : "")],
      ["Name the last note. What is its technical name in this key?", esc(lastName) + ": the tonic"],
      ["What does <i>" + esc(term[0]) + "</i> mean?", esc(term[1])]
    ];
    return { intro: 'Look at this melody for ' + esc(inst.name.toLowerCase()) + ', then answer the questions.<div style="margin:6px 0 2px;font-style:italic;font-weight:700">' + esc(term[0].replace(/ \(.*\)$/, "")) + "</div>" + SIGHTREAD.scoreSVG(pc, inst), qs: qs };
  }
  function passageFor(g, avoid) {
    var ids = Object.keys(window.PASSAGES || {}).filter(function (id) { return avoid.indexOf(id) < 0; });
    var g6 = ["cad64", "vi-ii", "rise", "ii7", "v7d", "phryg"], g7 = g6.concat(["vofv", "neap", "dim7", "minor-cad"]);
    ids = ids.filter(function (id) { return g >= 8 || (g === 7 ? g7 : g6).indexOf(id) >= 0; });
    var id = pick(ids); avoid.push(id); return { id: id, X: window.C78_TEST.passageIn(id, {}) };
  }
  var cadenceOf = function (X) { var n = X.labels.length, a = X.labels[n - 2], b = X.labels[n - 1]; return /^V/.test(a) && /^(I|i)$/.test(b) ? "perfect" : b === "V" && a === "ivb" ? "Phrygian" : b === "V" ? "imperfect" : /^(IV|iv)$/.test(a) ? "plagal" : "interrupted"; };
  function outerStaves(X, marks) {
    var tre = X.chords.map(function (c) { return { keys: [c[3]], d: 4 }; }), bas = X.chords.map(function (c, i) { return { keys: [c[0]], d: 4, label: marks ? marks[i] : null }; }), w = 120 + X.chords.length * 62;
    return '<div class="satb">' + staffSVG({ clef: "treble", key: X.k, events: tre, prop: false, spacing: 62, minW: w, aria: "melody" }) + staffSVG({ clef: "bass", key: X.k, events: bas, prop: false, spacing: 62, minW: w, aria: "bass" }) + "</div>";
  }
  function harmonySections(g, isTrinity) {
    var used = [], S = [];
    var A = passageFor(g, used), XA = A.X, n = XA.labels.length, picks = [];
    for (var i = 1; i < n && picks.length < 3; i++) picks.push(i);
    var marks = XA.labels.map(function (_, i) { var j = picks.indexOf(i); return j >= 0 ? "(" + "abc"[j] + ")" : ""; });
    S.push({ title: isTrinity ? "Harmony: figures and cadences" : "Figured bass", intro: "This passage is in " + esc(keyName(XA.k, XA.mode)) + ". The melody and bass are given.", body: '<div class="notation">' + outerStaves(XA, marks) + "</div>",
      qs: picks.map(function (i, j) { return ["Write figures under the bass at (" + "abc"[j] + "), to show the chord you'd use there.", figStack(XA.figs[i]) + " (chord " + esc(XA.labels[i]) + ")"]; }).concat([["Name the cadence at the end.", cadenceOf(XA)]]) });
    var B = passageFor(g, used), XB = B.X;
    S.push({ title: "Completing a four-part passage", intro: "Add alto and tenor parts to this passage in " + esc(keyName(XB.k, XB.mode)) + ", to make complete four-part harmony. Write the alto on the upper stave and the tenor on the lower stave.", body: '<div class="notation">' + outerStaves(XB) + "</div>",
      qs: [], answer: '<p>One good answer (others are possible: check for complete chords, smooth inner parts, and no consecutive 5ths or octaves):</p><div class="notation">' + satbSVG(XB.chords, XB.k, XB.labels) + "</div>" });
    if (!isTrinity) {
      var inst = SIGHTREAD.instOf(pick(["violin", "flute", "clarinet", "oboe"]) || "violin") || SIGHTREAD.instOf("violin"), pc = SIGHTREAD.makePiece(Math.min(8, g), inst);
      var open = { g: pc.g, beats: pc.beats, mode: pc.mode, k: pc.k, tonic: pc.tonic, tempo: pc.tempo, inst: pc.inst, bars: 3, notes: pc.notes.filter(function (x) { return x.t < 2 * pc.beats - 1e-6; }) };
      var len = g === 6 ? "8 bars" : "about 12 bars";
      S.push({ title: "Composition", intro: "Continue this opening for <b>" + esc(inst.name.toLowerCase()) + "</b> to make a complete melody of " + len + ". Modulate to a related key and come back, and add tempo, dynamics and phrasing.", body: SIGHTREAD.scoreSVG(open, inst) + blank(inst.clef || "treble", pc.k) + blank(inst.clef || "treble", pc.k),
        qs: [], answer: "<p>There is no single right answer. Mark it with this checklist (each point is worth about the same):</p><ul><li>It grows from the opening's rhythm and shape, and reuses them.</li><li>Clear phrases, each ending with a cadence.</li><li>A modulation to the dominant or relative key, with the new leading note, and a return home.</li><li>One clear high point.</li><li>Every bar has " + pc.beats + " crotchet beats.</li><li>It stays in the " + esc(inst.name.toLowerCase()) + "'s comfortable range.</li><li>Tempo, dynamics and phrasing marks throughout.</li></ul>" });
    }
    var C = passageFor(g, used), XC = C.X, nums = XC.labels.map(function (_, i) { return String(i + 1); });
    S.push({ title: isTrinity ? "Analysis" : "Score questions", intro: "Look at this passage. The chords are numbered.", body: '<div class="notation">' + satbSVG(XC.chords, XC.k, nums) + "</div>",
      qs: [["Name the key.", esc(keyName(XC.k, XC.mode))], ["Name chord 2, with its position (for example IIb).", esc(XC.labels[1])], ["Name chord 3, with its position.", esc(XC.labels[2])], ["Name the cadence at the end.", cadenceOf(XC)], ["Name the note sung by the alto in chord 1.", esc(nm(XC.chords[0][2]))]] });
    return S;
  }
  var TOPICS = {
    trinity: [["Rhythm", ["Rhythm"]], ["Pitch", ["Notes & clefs", "Transposition"]], ["Keys and scales", ["Keys & scales"]], ["Intervals", ["Intervals"]], ["Chords", ["Chords"]], ["Terms, signs and instruments", ["Terms & signs", "Instruments", "Form & style"]]],
    abrsm: [["Rhythm", ["Rhythm & time"]], ["Pitch", ["Notes & clefs", "Transposition"]], ["Keys and scales", ["Keys & scales"]], ["Intervals", ["Intervals"]], ["Chords and harmony", ["Chords", "Harmony", "Chromatic chords"]], ["Terms, signs, instruments and scores", ["Terms & signs", "Instruments", "Score reading"]]]
  };
  function paper(board, g) {
    var src = source(board).filter(usable), secs = [], isT = board === "trinity", num = 0;
    TOPICS[board].forEach(function (T) {
      var ls = src.filter(function (l) { return T[1].indexOf(l.topic) >= 0 && l.g === g; });
      if (ls.length < 1 && g <= 5) ls = src.filter(function (l) { return T[1].indexOf(l.topic) >= 0 && l.g < g; }).slice(-4);   /* from Grade 6, only the grade's own topics */
      if (!ls.length) return;
      var qs = questionsFrom(ls, g >= 6 ? 3 : 4), extra = [];
      if (T[0] === "Keys and scales" && (isT || g <= 5)) extra.push(scaleTask(board, g));
      if (/^Chords/.test(T[0]) && g <= 5) extra.push(triadTask(board, g));
      if (qs.length || extra.length) secs.push({ title: T[0], mc: qs, written: extra });
    });
    if (isT || g <= 5) { var A = analysisTask(board, g); secs.push({ title: isT ? "Music analysis" : "Looking at a melody", intro: A.intro, qs: A.qs }); }
    if (g >= 6) secs = (isT ? secs : []).concat(harmonySections(g, isT)).concat(isT ? [] : secs.filter(function (s) { return s.mc && s.mc.length; }).slice(0, 4).map(function (s) { s.title = "Short questions: " + s.title.toLowerCase(); return s; }));
    var paperHTML = "", ansHTML = "";
    secs.forEach(function (s, si) {
      var h = '<section class="sec"><h2>Section ' + (si + 1) + ": " + esc(s.title) + "</h2>" + (s.intro ? "<p>" + s.intro + "</p>" : "") + (s.body || "");
      var a = '<section class="sec"><h3>Section ' + (si + 1) + ": " + esc(s.title) + "</h3>";
      (s.mc || []).forEach(function (q) { num++; h += '<div class="q">' + mcHTML(q, num) + "</div>"; a += '<div class="a"><b>' + num + ".</b> " + mcAnswer(q) + "</div>"; });
      (s.written || []).forEach(function (w) { num++; h += '<div class="q"><div class="qp">' + num + ". " + w.q + "</div>" + w.blank + "</div>"; a += '<div class="a"><b>' + num + ".</b>" + w.a + "</div>"; });
      (s.qs || []).forEach(function (q) { num++; h += '<div class="q"><div class="qp">' + num + ". " + q[0] + '</div><div class="line"></div></div>'; a += '<div class="a"><b>' + num + ".</b> " + q[1] + "</div>"; });
      if (s.answer) a += '<div class="a">' + s.answer + "</div>";
      paperHTML += h + "</section>"; ansHTML += a + "</section>";
    });
    var styles = [].slice.call(document.querySelectorAll("style")).map(function (s) { return s.textContent; }).join("\n");
    var title = (isT ? "Trinity" : "ABRSM") + " Grade " + g + " theory: mock paper";
    var mins = isT ? (g === 1 ? 60 : g <= 4 ? 90 : g <= 6 ? 120 : 150) : (g <= 3 ? 90 : g <= 5 ? 120 : 180);
    return '<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(title) + "</title><style>" + styles +
      ":root{color-scheme:light}body{background:#fff!important;color:#111!important;margin:0;padding:24px;font-family:system-ui,-apple-system,Segoe UI,sans-serif}.sheet{max-width:820px;margin:0 auto}" +
      "header.w{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:12px}header.w h1{font-size:23px;margin:0}.kick{font:600 12px system-ui;letter-spacing:.08em;text-transform:uppercase;color:#555}" +
      ".lines{display:flex;gap:18px;font-size:14px}.lines span{display:inline-block;min-width:140px;border-bottom:1px solid #111}.sec{margin:18px 0;break-inside:auto}.sec h2{font-size:18px;margin:0 0 6px;border-bottom:1px solid #999;padding-bottom:3px}.sec h3{font-size:16px;margin:14px 0 4px}" +
      ".q{padding:10px 0;border-bottom:1px solid #e3e3e3;break-inside:avoid;page-break-inside:avoid}.qp{font-weight:600;margin-bottom:6px}.notation{background:#fff!important;border:0!important;padding:0!important;margin:4px 0;overflow:visible}.notation svg{max-width:100%;height:auto}" +
      ".ch{list-style:none;padding:0;margin:6px 0 0;display:flex;flex-wrap:wrap;gap:6px 22px}.ch li{display:flex;align-items:center;gap:6px}.lt{display:inline-flex;width:24px;height:24px;border:1.5px solid #111;border-radius:50%;align-items:center;justify-content:center;font-weight:700;font-size:13px}.ot svg{max-height:70px;width:auto}" +
      ".line{border-bottom:1px solid #999;height:28px;margin-top:4px}.answers{break-before:page;page-break-before:always;margin-top:28px}.a{margin:8px 0;break-inside:avoid}.ex{color:#444;font-size:14px}" +
      ".wsbar{display:flex;gap:10px;margin:0 auto 16px;max-width:820px;height:auto;background:none}.wsbar button{font:600 15px system-ui;padding:10px 16px;border-radius:10px;border:1.5px solid #111;background:#fff;cursor:pointer}.wsbar .go{background:#111;color:#fff}" +
      ".trscore{display:grid;gap:4px}.trbar{font-size:11px;color:#666}footer.f{margin-top:18px;font-size:12px;color:#666}@media print{.wsbar{display:none}body{padding:0}}</style></head><body>" +
      '<div class="wsbar"><button class="go" onclick="window.print()">Print or save as PDF</button><button onclick="(function(b){var t0=Date.now(),lim=' + mins + '*60;b.disabled=true;b.textContent=&quot;Clock running&quot;;setInterval(function(){var l=lim-Math.floor((Date.now()-t0)/1000),a=Math.abs(l);document.getElementById(&quot;clk&quot;).textContent=(l>=0?&quot;Time left &quot;:&quot;Over time &quot;)+Math.floor(a/60)+&quot;:&quot;+String(a%60).padStart(2,&quot;0&quot;);},500);})(this)">Start the clock</button><b id="clk" style="align-self:center;font:700 18px system-ui"></b><button onclick="window.close()">Close</button></div><div class="sheet">' +
      '<header class="w"><div><div class="kick">The Theory Room · mock paper in the style of the ' + (isT ? "Trinity" : "ABRSM") + " Grade " + g + " theory exam</div><h1>" + esc(title) + '</h1></div><div class="lines"><div>Name <span>&nbsp;</span></div><div>Date <span>&nbsp;</span></div></div></header>' +
      "<p><b>Time guide:</b> about " + (mins >= 120 ? mins / 60 + " hours" : mins + " minutes") + ". Answer every question in pencil. Work without help, then mark your paper with the answers at the end.</p>" +
      paperHTML + '<section class="answers"><header class="w"><div><div class="kick">Answers and marking guide</div><h1>' + esc(title) + "</h1></div></header>" + ansHTML + "</section>" +
      '<footer class="f">The Theory Room · a new paper every time. Written in the style of the board\'s paper, not an official paper: check the current syllabus for the exact layout and marks. Not affiliated with ABRSM or Trinity College London.</footer></div></body></html>';
  }
  window.TR_MOCKPAPER = paper;
  function openPaper(board, g) {
    if (window.TR && !TR.can("theory", g)) { toast("Grade " + g + " comes with a plan."); return; }
    var html; try { html = paper(board, g); } catch (e) { console.warn(e); toast("Couldn't make that paper. Try again."); return; }
    var w = window.open("", "_blank"); if (!w) { toast("Allow pop-ups for this site to print a paper."); return; }
    w.document.open(); w.document.write(html); w.document.close();
  }

  /* the lesson page for a mock: the right button, and no worksheet button */
  var lv0 = lessonView;
  lessonView = function () {
    var h = lv0(), l = LESSON_BY[VIEW.lesson];
    if (!l || !l.mock) return h;
    return h.replace(/Practise \(8 questions\)/, "Start the mock (" + l.n + " questions)").replace(/<button class="btn ghost" data-ws="[^"]*"[^>]*>[^<]*<\/button>/, '<button class="btn ghost" data-mockpaper="' + (l.board === "trinity" ? "trinity" : "abrsm") + ":" + l.g + '">Print a written paper instead</button>');
  };

  /* ---------- on the theory tab ---------- */
  function mockSection() {
    var p = P(), tr = p.theoryBoard === "trinity", board = tr ? "trinity" : "abrsm", can = function (g) { return !window.TR || TR.can("theory", g); };
    var grades = [1, 2, 3, 4, 5, 6, 7, 8];
    var best = function (g) { var h = ((p.mockT || {})["mock-" + board + "-g" + g] || []); if (!h.length) return ""; var b = Math.max.apply(null, h.map(function (x) { return Math.round(100 * x.s / x.n); })); return ' <span class="pill" style="font-size:.75rem">best ' + b + "%</span>"; };
    return '<h2 style="margin-top:22px">Mock exams</h2><p class="muted" style="margin-top:0">' + (tr ? "Trinity" : "ABRSM") + " Grades 1–8. A <b>timed mock</b> marks itself and shows which topics to revise; a <b>written paper</b> prints with staves to write on and an answer key" + (tr ? "" : " (Grades 6–8: figured bass, four-part harmony, composition and score questions)") + ". New questions every time.</p>" +
      '<div class="lessons">' + grades.map(function (g) {
        if (!can(g)) return '<a class="lesson" href="../app.html#plans" style="text-decoration:none;color:inherit"><span class="n">' + g + '</span><div><div style="font-weight:700">Grade ' + g + ' 🔒</div><div class="muted" style="font-size:.85rem">Comes with a plan</div></div></a>';
        return '<div class="lesson" style="cursor:default"><span class="n">' + g + '</span><div style="flex:1"><div style="font-weight:700">Grade ' + g + best(g) + '</div><div class="row" style="gap:6px;margin-top:6px"><button class="btn small primary" data-act="lesson" data-arg="mock-' + board + "-g" + g + '">Timed mock</button><button class="btn small ghost" data-mockpaper="' + board + ":" + g + '">Written paper</button></div></div></div>';
      }).join("") + "</div>";
  }
  var th0 = theoryHome;
  theoryHome = function () {
    var h = th0(), m = mockSection(), at = h.search(/<h2 style="margin-top:(26|18)px">Quick drills<\/h2>/);
    return at >= 0 ? h.slice(0, at) + m + h.slice(at) : h + m;
  };
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-mockpaper]"); if (!b) return;
    e.preventDefault(); e.stopPropagation(); var a = b.dataset.mockpaper.split(":"); openPaper(a[0], +a[1]);
  }, true);
  if (typeof render === "function") render();
})();
