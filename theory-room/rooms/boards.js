/* The Theory Room: ABRSM Initial and Trinity College London aural tests, Initial to Grade 8.
   Loaded after the aural room's own code; uses its music engine (melodies, harmony, notation, sound).
   Trinity's aural test is one piece per grade with questions about it (no singing). The tasks follow
   Trinity's published aural test parameters. */
(function () {
  "use strict";
  if (typeof AGEN === "undefined") return;

  /* ---------- building a piece ---------- */
  const CADS = { perfect: [5, 1], imperfect: [null, 5], plagal: [4, 1], interrupted: [5, 6] };
  function trPiece(o) {
    const mode = o.mode || "major", ctx = mkCtx(mode, o.k != null ? o.k : rnd(5) - 2), bars = o.bars, beats = o.beats;
    const cad = o.cad || "perfect";
    let degs = walkProg(bars, 1);
    const C = CADS[cad]; degs[bars - 2] = C[0] == null ? pick([1, 4, 2]) : C[0]; degs[bars - 1] = C[1];
    let plan = planOf(degs, beats);
    if (o.modTo) {                                   // second half in the relative key
      const ctx2 = mkCtx(mode === "major" ? "minor" : "major", ctx.k), half = bars / 2;
      let d2 = walkProg(half, 1); const C2 = CADS[cad]; d2[half - 2] = C2[0] == null ? pick([1, 4]) : C2[0]; d2[half - 1] = C2[1];
      plan = plan.slice(0, half).concat(d2.map(d => ({ deg: d, b: beats, key: ctx2 })));
      plan[half - 1] = { deg: 5, b: beats };         // the first half ends on its dominant
    }
    const open = cad === "imperfect" || cad === "interrupted";
    const mel = melodyOver(plan, ctx, "classical", ctx.tm + 2, ctx.tm + 16, open).map(n => ({ m: n.m, t: n.t, d: n.d }));
    const acc = o.harm ? accomp(plan, ctx, "block").map(e => Object.assign({}, e, { v: .32 })) : [];
    return { ctx, mode, beats, bars, mel, acc, cad };
  }
  const evOf = (mel, v) => mel.map(n => ({ m: n.m, t: n.t, d: n.d, v: v || .8 }));
  const shift = (ev, by) => ev.map(e => Object.assign({}, e, { t: e.t + by }));
  const tempoFor = beats => beats === 3 ? 100 : 92;
  const barOf = (n, beats) => Math.floor(n.t / beats + 1e-6) + 1;

  /* the copy of the music Trinity hands the candidate from Grade 3 (four bars to a line) */
  function score(pc, mel) {
    const per = 4, out = [];
    for (let s = 0; s < pc.bars; s += per) {
      const line = (mel || pc.mel).filter(n => { const b = barOf(n, pc.beats); return b > s && b <= s + per; });
      out.push(`<div class="trsys"><span class="trbar">${s + 1}</span>${lineStaff(line, pc.ctx.k, pc.mode, "treble", pc.beats, s === 0 ? pc.beats + "/4" : null, "Bars " + (s + 1) + " to " + Math.min(pc.bars, s + per))}</div>`);
    }
    return `<div class="trscore">${out.join("")}</div>`;
  }

  /* ---------- changes for "spot the difference" ---------- */
  function changeNote(mel, bar, kind, pc) {
    const inBar = mel.map((n, i) => ({ n, i })).filter(x => barOf(x.n, pc.beats) === bar);
    const out = mel.map(n => Object.assign({}, n));
    if (kind === "pitch") {
      const c = inBar.filter(x => x.i > 0); if (!c.length) return null;
      const x = pick(c), dir = pick([-1, 1]); let m = scaleStep(out[x.i].m, dir, pc.ctx.kp);
      if (Math.random() < .4) m = scaleStep(m, dir, pc.ctx.kp);
      if (m === out[x.i].m) return null; out[x.i].m = m; return out;
    }
    /* rhythm: split a long note, join two short ones, or dot a pair, keeping the bar's length */
    const longs = inBar.filter(x => out[x.i].d >= 1 && out[x.i].d <= 2);
    const pairs = inBar.filter(x => x.i + 1 < out.length && barOf(out[x.i + 1], pc.beats) === bar && out[x.i].d === .5 && out[x.i + 1].d === .5);
    const evens = inBar.filter(x => x.i + 1 < out.length && barOf(out[x.i + 1], pc.beats) === bar && out[x.i].d === 1 && out[x.i + 1].d === 1);
    const ways = [];
    if (longs.length) ways.push("split"); if (pairs.length) ways.push("join"); if (evens.length) ways.push("dot");
    if (!ways.length) return null;
    const w = pick(ways);
    if (w === "split") { const x = pick(longs), n = out[x.i], h = n.d / 2; out.splice(x.i, 1, { m: n.m, t: n.t, d: h }, { m: n.m, t: n.t + h, d: h }); }
    if (w === "join") { const x = pick(pairs), n = out[x.i]; out.splice(x.i, 2, { m: n.m, t: n.t, d: 1 }); }
    if (w === "dot") { const x = pick(evens), a = out[x.i], b = out[x.i + 1]; out.splice(x.i, 2, { m: a.m, t: a.t, d: 1.5 }, { m: b.m, t: a.t + 1.5, d: .5 }); }
    return out;
  }
  function withChanges(pc, kinds) {
    for (let tries = 0; tries < 40; tries++) {
      const bars = shuffle(Array.from({ length: pc.bars - 1 }, (_, i) => i + 1)).slice(0, kinds.length).sort((a, b) => a - b);
      let mel = pc.mel, ok = true; const ch = [];
      const ks = shuffle(kinds.slice());
      bars.forEach((b, i) => { if (!ok) return; const m2 = changeNote(mel, b, ks[i], pc); if (!m2) { ok = false; return; } mel = m2; ch.push({ bar: b, kind: ks[i] }); });
      if (ok) return { mel, ch };
    }
    return null;
  }
  function playTwice(pc, mel2, bpm) {
    const len = pc.bars * pc.beats, gap = len + 2;
    const one = evOf(pc.mel).concat(pc.acc), two = shift(evOf(mel2).concat(pc.acc), gap);
    return {
      play: () => playEvents(one.concat(two), bpm),
      extra: [{ label: "First playing", fn: () => playEvents(one, bpm) }, { label: "Second playing", fn: () => playEvents(evOf(mel2).concat(pc.acc), bpm) }]
    };
  }
  const feat = (prompt, cats, play, extra, explain, visual) => ({ type: "feat", prompt, cats, play, extra, explain, visual, answer: cats.map(c => c.ans).join("|") });
  const cat = (c, lbl, pairs, ans) => ({ c, lbl, opts: pairs.map(p => ({ k: String(p[0]), lbl: p[1] })), ans: String(ans) });
  const barOpts = n => Array.from({ length: n }, (_, i) => [i + 1, String(i + 1)]);  /* short labels sit in one row */

  /* ---------- new skills ---------- */
  const NEW = [
    { id: "contour", name: "Higher or lower?", ds: "Which note is highest or lowest; is the end higher than the start", auto: true, levels: [
      { t: "Highest or lowest of three notes", g: "Trinity Initial" }, { t: "Last note against the first, two bars", g: "Trinity Gr 1" }, { t: "Last note against the first, whole tune", g: "Trinity Gr 2" }] },
    { id: "trchange", name: "Spot the differences", ds: "A tune played twice with changes: where, and rhythm or pitch?", auto: true, levels: [
      { t: "Beginning or end?", g: "Trinity Gr 1" }, { t: "Where, and rhythm or pitch?", g: "Trinity Gr 2" }, { t: "Which bar, with the music", g: "Trinity Gr 3" },
      { t: "A rhythm and a pitch change", g: "Trinity Gr 4" }, { t: "Eight bars, harmonised", g: "Trinity Gr 5" }, { t: "Two changes", g: "Trinity Gr 6" },
      { t: "Three changes", g: "Trinity Gr 7" }, { t: "Three changes, longer piece", g: "Trinity Gr 8" }] },
    { id: "trtonal", name: "Key and cadence", ds: "Major or minor, a change of key, and the final cadence", auto: true, levels: [
      { t: "Major or minor, perfect or imperfect", g: "Trinity Gr 4" }, { t: "Changing tonality, four cadences", g: "Trinity Gr 5" }] },
    { id: "trint", name: "Two-note intervals", ds: "The interval between two notes of a tune", auto: true, levels: [
      { t: "By number: 2nd to 6th", g: "Trinity Gr 3" }, { t: "Major and minor 2nds, 3rds, 6ths; perfect 4th, 5th", g: "Trinity Gr 4" }, { t: "Every interval to the octave", g: "Trinity Gr 5" }] }
  ];
  NEW.forEach(s => { if (!AURAL_BY[s.id]) { AURAL.push(s); AURAL_BY[s.id] = s; } });
  Object.assign(AURAL_NOTE, {
    contour: "Hum the notes back to yourself, then point up or down with your hand as you go.",
    trchange: "On the first playing, follow the music (or count the bars). On the second, put a finger on each bar as it goes by and stop at anything different.",
    trtonal: "Major sounds bright, minor darker. A perfect cadence sounds finished; imperfect stops on V and sounds like a comma.",
    trint: "Match each interval to the start of a tune you know, and count the letter names from the lower note."
  });

  AGEN.contour = (L) => {
    for (let k = 0; k < 60; k++) {
      const pc = trPiece({ bars: 4, beats: pick([2, 3, 4]), mode: "major" }), m = pc.mel, bpm = tempoFor(pc.beats);
      if (L === 1) {
        const three = m.slice(0, 3).map(n => n.m), hi = Math.max(...three), lo = Math.min(...three), askHi = Math.random() < .5;
        const target = askHi ? hi : lo; if (three.filter(x => x === target).length !== 1) continue;
        const ans = three.indexOf(target) + 1, ev = three.map((x, i) => ({ m: x, t: i, d: 1, v: .8 }));
        return { prompt: `Listen to three notes. Which was the <b>${askHi ? "highest" : "lowest"}</b>?`, play: () => playEvents(ev, 80),
          options: [opt("1", "The first"), opt("2", "The second"), opt("3", "The third")], answer: String(ans),
          explain: `The ${["first", "second", "third"][ans - 1]} note was the ${askHi ? "highest" : "lowest"}.` };
      }
      const part = L === 2 ? m.filter(n => barOf(n, pc.beats) <= 2) : m, a = part[0].m, z = part[part.length - 1].m;
      if (a === z) continue;
      const ev = evOf(part);
      return { prompt: `Listen to ${L === 2 ? "the first two bars" : "the melody"}. Is the <b>last</b> note higher or lower than the <b>first</b>?`, play: () => playEvents(ev, bpm),
        options: [opt("higher", "Higher"), opt("lower", "Lower")], answer: z > a ? "higher" : "lower",
        explain: `The last note was ${z > a ? "higher" : "lower"} than the first.` };
    }
  };

  AGEN.trchange = (L) => {
    const spec = [null,
      { bars: 4, harm: false, mode: "major", kinds: [pick(["rhythm", "pitch"])] },
      { bars: 4, harm: false, mode: pick(["major", "minor"]), kinds: [pick(["rhythm", "pitch"])] },
      { bars: 4, harm: false, mode: pick(["major", "minor"]), kinds: [pick(["rhythm", "pitch"])], score: true },
      { bars: 4, harm: true, mode: pick(["major", "minor"]), kinds: ["rhythm", "pitch"], score: true },
      { bars: 8, harm: true, mode: pick(["major", "minor"]), kinds: ["rhythm", "pitch"], score: true },
      { bars: 8, harm: true, mode: "major", kinds: [pick(["rhythm", "pitch"]), pick(["rhythm", "pitch"])], score: true },
      { bars: 8, harm: true, mode: pick(["major", "minor"]), kinds: shuffle(["rhythm", "pitch", pick(["rhythm", "pitch"])]), score: true },
      { bars: 12, harm: true, mode: pick(["major", "minor"]), kinds: shuffle(["rhythm", "pitch", pick(["rhythm", "pitch"])]), score: true }][L];
    let pc, w;
    for (let k = 0; k < 30 && !w; k++) { pc = trPiece({ bars: spec.bars, beats: pick([2, 3, 4]), mode: spec.mode, harm: spec.harm }); w = withChanges(pc, spec.kinds); }
    const bpm = tempoFor(pc.beats), tw = playTwice(pc, w.mel, bpm), ch = w.ch;
    const where = b => b <= pc.bars / 2 ? "beginning" : "end";
    const visual = spec.score ? score(pc) : undefined;
    const say = ch.map(c => `a ${c.kind} change in bar ${c.bar}`).join(", ");
    const expl = `There was ${say}.` + (ch.some(c => c.kind === "rhythm") ? " A rhythm change keeps the notes but changes how long they last." : "");
    if (L === 1) return Object.assign({ prompt: "The tune plays twice. The second time, something changes. Was the change near the <b>beginning</b> or the <b>end</b>?", options: [opt("beginning", "Near the beginning"), opt("end", "Near the end")], answer: where(ch[0].bar), explain: expl }, tw);
    if (L === 2) return feat("The tune plays twice, with one change. Where was it, and was it rhythm or pitch?",
      [cat("where", "Where", [["beginning", "Near the beginning"], ["end", "Near the end"]], where(ch[0].bar)), cat("kind", "What changed", [["rhythm", "Rhythm"], ["pitch", "Pitch"]], ch[0].kind)], tw.play, tw.extra, expl);
    if (L === 3) return feat("Follow the music. It plays as written, then with one change. Which bar, and was it rhythm or pitch?",
      [cat("bar", "Bar", barOpts(pc.bars), ch[0].bar), cat("kind", "What changed", [["rhythm", "Rhythm"], ["pitch", "Pitch"]], ch[0].kind)], tw.play, tw.extra, expl, visual);
    if (L === 4 || L === 5) {
      const r = ch.find(c => c.kind === "rhythm"), p = ch.find(c => c.kind === "pitch");
      return feat("Follow the music. The second playing has one rhythm change and one pitch change. Which bars?",
        [cat("rb", "Rhythm change in", barOpts(pc.bars - 1), r.bar), cat("pb", "Pitch change in", barOpts(pc.bars - 1), p.bar)], tw.play, tw.extra, expl, visual);
    }
    const names = ["First", "Second", "Third"];
    const cats = [];
    ch.forEach((c, i) => { cats.push(cat("b" + i, names[i] + " change: bar", barOpts(pc.bars - 1), c.bar)); cats.push(cat("k" + i, names[i] + " change: what", [["rhythm", "Rhythm"], ["pitch", "Pitch"]], c.kind)); });
    return feat(`Follow the music. The second playing has ${ch.length} changes in the melody. Find each one, in order.`, cats, tw.play, tw.extra, expl, visual);
  };

  AGEN.trtonal = (L) => {
    if (L === 1) {
      const mode = pick(["major", "minor"]), cad = pick(["perfect", "imperfect"]);
      const pc = trPiece({ bars: 4, beats: pick([2, 3, 4]), mode, harm: true, cad }), ev = evOf(pc.mel).concat(pc.acc), bpm = tempoFor(pc.beats);
      return feat("Listen to the piece (it plays twice in the exam). Is it major or minor, and is the last cadence perfect or imperfect?",
        [cat("tonal", "Tonality", [["major", "Major"], ["minor", "Minor"]], mode), cat("cad", "Final cadence", [["perfect", "Perfect (V–I, finished)"], ["imperfect", "Imperfect (ends on V)"]], cad)],
        () => playEvents(ev, bpm), [{ label: "Just the last two bars", fn: () => playEvents(shift(evOf(pc.mel.filter(n => barOf(n, pc.beats) >= 3)).concat(pc.acc.filter(e => e.t >= 2 * pc.beats)), -2 * pc.beats), bpm) }],
        `It's in a <b>${mode}</b> key and ends with ${cad === "perfect" ? "a <b>perfect</b> cadence (V–I)" : "an <b>imperfect</b> cadence (ending on V)"}.`);
    }
    const mode = pick(["major", "minor"]), change = Math.random() < .6, cad = pick(["perfect", "plagal", "imperfect", "interrupted"]);
    const pc = trPiece({ bars: 8, beats: pick([2, 3, 4]), mode, harm: true, cad, modTo: change }), ev = evOf(pc.mel).concat(pc.acc), bpm = tempoFor(pc.beats);
    const other = mode === "major" ? "minor" : "major", tonal = change ? mode + "-" + other : mode;
    const CADL = { perfect: "Perfect (V–I)", plagal: "Plagal (IV–I)", imperfect: "Imperfect (ends on V)", interrupted: "Interrupted (V–VI)" };
    return feat("Listen to the piece. Describe the tonality, and name the final cadence.",
      [cat("tonal", "Tonality", [["major", "Major all the way"], ["minor", "Minor all the way"], ["major-minor", "Starts major, ends minor"], ["minor-major", "Starts minor, ends major"]], tonal),
       cat("cad", "Final cadence", Object.keys(CADL).map(k => [k, CADL[k]]), cad)],
      () => playEvents(ev, bpm), [], `Tonality: <b>${tonal.replace("-", " then ")}</b>. Final cadence: <b>${CADL[cad]}</b>.`);
  };

  const INT = { 1: "minor 2nd", 2: "major 2nd", 3: "minor 3rd", 4: "major 3rd", 5: "perfect 4th", 7: "perfect 5th", 8: "minor 6th", 9: "major 6th", 10: "minor 7th", 11: "major 7th", 12: "octave" };
  const NUM = { 1: "2nd", 2: "2nd", 3: "3rd", 4: "3rd", 5: "4th", 7: "5th", 8: "6th", 9: "6th", 10: "7th", 11: "7th", 12: "octave" };
  AGEN.trint = (L) => {
    const pool = L === 1 ? [1, 2, 3, 4, 5, 7, 8, 9] : L === 2 ? [1, 2, 3, 4, 5, 7, 8, 9] : [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12];
    const semis = pick(pool), up = Math.random() < .7, a = 60 + rnd(8), b = up ? a + semis : a - semis;
    const ev = [{ m: a, t: 0, d: 1, v: .8 }, { m: b, t: 1, d: 1.5, v: .8 }];
    if (L === 1) {
      const names = ["2nd", "3rd", "4th", "5th", "6th"];
      return { prompt: "Two notes from a melody. What is the interval, by number?", play: () => playEvents(ev, 76), options: names.map(n => opt(n)), answer: NUM[semis], explain: `It was a <b>${NUM[semis]}</b> (${INT[semis]}), going ${up ? "up" : "down"}.` };
    }
    const names = pool.map(s => INT[s]);
    return { prompt: "Two notes from a melody. Name the interval.", play: () => playEvents(ev, 76), options: names.map(n => opt(n)), answer: INT[semis], explain: `It was a <b>${INT[semis]}</b>, going ${up ? "up" : "down"}.` };
  };

  /* ---------- the boards' grades ---------- */
  const T = (sec, t, id, L, d) => ({ sec, t, id, L, d });
  window.BOARD_GRADES = {
    A0: { board: "ABRSM", g: 0, name: "Initial", blurb: "Four short tests, all done with the examiner at the piano.", tests: [
      T("A", "Clap the pulse", "pulse", 1, "Clap the beat of a short piece, joining in as soon as you can."),
      T("B", "Clap echoes", "clap", 1, "Clap back short rhythms played by the examiner."),
      T("C", "Sing echoes", "echo", 1, "Sing back short phrases, one at a time."),
      T("D", "Dynamics or articulation", "features", 1, "Is it loud or quiet? Smooth or detached?")] },
    T0: { board: "Trinity", g: 0, name: "Initial", blurb: "A four-bar melody in a major key. No singing.", tests: [
      T("1", "Clap the pulse", "pulse", 1, "Listen three times; clap on the third, stressing the strong beats."),
      T("2", "Forte or piano? Legato or staccato?", "features", 1, "Listen once and say how loud, and how smooth, it was."),
      T("3", "Highest or lowest note", "contour", 1, "From the first three notes, pick the highest or the lowest.")] },
    T1: { board: "Trinity", g: 1, name: "Grade 1", blurb: "A four-bar melody in a major key.", tests: [
      T("1", "Clap the pulse", "pulse", 1, "Listen three times; clap on the third, stressing the strong beats."),
      T("2", "Dynamics and articulation", "features", 1, "Forte or piano; legato or staccato."),
      T("3", "Higher or lower at the end?", "contour", 2, "In the first two bars, is the last note higher or lower than the first?"),
      T("4", "Spot the change", "trchange", 1, "Played twice: was the change near the beginning or the end?")] },
    T2: { board: "Trinity", g: 2, name: "Grade 2", blurb: "A four-bar melody, major or minor.", tests: [
      T("1", "Clap the pulse", "pulse", 2, "Listen three times; clap on the third, stressing the strong beats."),
      T("2", "Dynamics and articulation", "features", 1, "Describe the dynamics, which may change, and the articulation."),
      T("3", "Higher or lower at the end?", "contour", 3, "Is the last note higher or lower than the first?"),
      T("4", "Spot the change", "trchange", 2, "Where was the change, and was it rhythm or pitch?")] },
    T3: { board: "Trinity", g: 3, name: "Grade 3", blurb: "A four-bar melody, major or minor. From Grade 3 you see the music for the last test.", tests: [
      T("1", "Clap the pulse", "pulse", 2, "Listen twice; clap on the second, stressing the strong beats."),
      T("2", "Major or minor?", "majmin", 3, "Listen once and name the tonality."),
      T("3", "Interval by number", "trint", 1, "The first two notes: a 2nd, 3rd, 4th, 5th or 6th?"),
      T("4", "Spot the change, with the music", "trchange", 3, "Which bar changed, and was it rhythm or pitch?")] },
    T4: { board: "Trinity", g: 4, name: "Grade 4", blurb: "A four-bar harmonised piece, major or minor.", tests: [
      T("1", "Clap the pulse", "pulse", 3, "Listen twice; clap on the second, stressing the strong beats."),
      T("2", "Tonality and cadence", "trtonal", 1, "Major or minor; perfect or imperfect cadence."),
      T("3", "Name the interval", "trint", 2, "Minor or major 2nd, 3rd or 6th; perfect 4th or 5th."),
      T("4", "Two changes, with the music", "trchange", 4, "One rhythm change and one pitch change: which bars?")] },
    T5: { board: "Trinity", g: 5, name: "Grade 5", blurb: "An eight-bar harmonised piece, major or minor.", tests: [
      T("1", "Pulse and time signature", "pulse", 3, "Clap the pulse on the second playing and name the time signature."),
      T("2", "Changing tonality and cadence", "trtonal", 2, "How the tonality changes; perfect, plagal, imperfect or interrupted."),
      T("3", "Name the interval", "trint", 3, "Any interval up to an octave, including 7ths."),
      T("4", "Two changes, with the music", "trchange", 5, "One rhythm change and one pitch change in the melody: which bars?")] },
    T6: { board: "Trinity", g: 6, name: "Grade 6", blurb: "An eight-bar harmonised piece in a major key.", tests: [
      T("1", "Time, dynamics, articulation", "features", 3, "Name the time signature and describe the dynamics and articulation."),
      T("2", "Two other characteristics", "style", 1, "Comment on two more features, such as texture or tempo."),
      T("3", "Where does it modulate?", "modulation", 2, "From the first four bars: subdominant, dominant or relative minor."),
      T("4", "Two changes, with the music", "trchange", 6, "Find two changes and say whether each is rhythm or pitch.")] },
    T7: { board: "Trinity", g: 7, name: "Grade 7", blurb: "An eight-bar harmonised piece, major or minor.", tests: [
      T("1", "Time, dynamics, articulation", "features", 4, "Name the time signature and describe the dynamics and articulation."),
      T("2", "Two other characteristics", "style", 3, "Comment on two more features, such as style or period."),
      T("3", "Where does it modulate?", "modulation", 3, "Subdominant, dominant or relative key."),
      T("4", "Three changes, with the music", "trchange", 7, "Find three changes and say whether each is rhythm or pitch.")] },
    T8: { board: "Trinity", g: 8, name: "Grade 8", blurb: "A harmonised piece of 12 to 16 bars, major or minor.", tests: [
      T("1", "Time, dynamics, articulation", "features", 4, "Heard once: time signature, dynamics and articulation."),
      T("2", "Three other characteristics", "style", 4, "Comment on three more features of the music."),
      T("3", "Three changes, with the music", "trchange", 8, "Find three changes and say whether each is rhythm or pitch.")] }
  };
  Object.keys(BOARD_GRADES).forEach(key => { const G = BOARD_GRADES[key]; MOCKS[key] = { t: (G.board === "Trinity" ? "Trinity " : "ABRSM ") + G.name, items: G.tests.map(x => [x.sec, x.t, x.id, x.L]) }; });

  /* ---------- the page: a board switch above the grades ---------- */
  const css = document.createElement("style");
  css.textContent = ".boardbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:4px 0 12px}.boardbar .lbl{font-weight:700;margin-right:4px}" +
    ".trscore{display:grid;gap:4px;margin:8px 0}.trsys{position:relative;overflow-x:auto}.trbar{position:absolute;left:2px;top:22px;font-size:11px;opacity:.6}" +
    ".gtests .gtest .tnote{font-size:.85rem;opacity:.75}";
  document.head.appendChild(css);
  const keyOf = p => p.auralBoard === "trinity" ? "T" + (p.trGrade != null ? p.trGrade : 1) : p.abrsmInitial ? "A0" : null;
  function boardBar(p) {
    const tr = p.auralBoard === "trinity";
    return `<div class="boardbar" role="group" aria-label="Exam board"><span class="lbl">Exam board</span><button class="gbtn" data-trb="abrsm" aria-pressed="${!tr}">ABRSM</button><button class="gbtn" data-trb="trinity" aria-pressed="${tr}">Trinity</button></div>`;
  }
  function gradeButtons(p, board) {
    if (board === "trinity") {
      const cur = p.trGrade != null ? p.trGrade : 1;
      return `<div class="gradebar" role="group" aria-label="Trinity grade">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(g => {
        const open = window.TR ? TR.can("aural", g) : true, lbl = g === 0 ? "Initial" : "Grade " + g;
        return open ? `<button class="gbtn" data-trg="${g}" aria-pressed="${g === cur}">${lbl}</button>` : `<a class="gbtn tr-lock" href="../app.html#plans">${lbl} 🔒</a>`;
      }).join("")}</div>`;
    }
    return "";
  }
  function boardView(p, key) {
    const G = BOARD_GRADES[key], mk = (p.mocks || {})[key];
    const tests = G.tests.map(t => {
      const st = lvlStars(p, t.id, t.L);
      return `<div class="gtest ${st ? "done" : ""}"><div class="gsec">${esc(t.sec)}</div><div style="min-width:0"><div class="nm">${esc(t.t)}</div><div class="ds">${esc(t.d)}</div>
        ${AURAL_NOTE[t.id] ? `<details class="tipbox"><summary>How to do it</summary>${esc(AURAL_NOTE[t.id])}</details>` : ""}</div>
        <div class="gact">${starStr(st)}<div class="row" style="gap:6px;justify-content:flex-end">${LEARN[t.id] ? `<button class="btn small ghost" data-act="learn" data-arg="${t.id}|${t.id}:${t.L}:${esc(t.sec)}">Learn it</button>` : ""}<button class="btn small ${st ? "ghost" : "primary"}" data-trtest="${t.id}:${t.L}:${esc(t.sec)}">${st ? "Practise again" : "Practise"}</button></div></div></div>`;
    }).join("");
    const head = G.board === "Trinity" ? `Trinity · ${esc(G.name)}` : `ABRSM · Initial`;
    return `<section class="panel"><div class="row" style="justify-content:space-between"><div><div class="kicker">${head}</div><h3 style="margin:.15em 0">${esc(G.name)} aural tests</h3></div></div>
      <p class="muted" style="margin:.2em 0 .6em">${esc(G.blurb)}${G.board === "Trinity" ? " Trinity candidates take aural or improvisation as a supporting test; from Grade 6, sight reading is compulsory too." : ""}</p><div class="gtests">${tests}</div>
      <div class="row" style="margin-top:14px;justify-content:space-between"><div><b>Ready to try the whole test?</b><div class="muted" style="font-size:.9rem">${mk ? `Best ${Math.round(mk.best * 100)}% · tried ${mk.n} time${mk.n === 1 ? "" : "s"}` : "All the questions in exam order, with fresh music every time."}</div></div>
      <button class="btn brass" data-trmock="${key}">${esc(G.name)} mock test</button></div></section>`;
  }

  const home0 = auralHome2;
  auralHome2 = function () {
    const p = P(), R = VIEW.round;
    if (R && VIEW.gctx) { const g = VIEW.gctx.g; let h = home0(); if (typeof g === "string") h = h.split("Grade " + g).join(g); return h; }
    const key = keyOf(p);
    if (!key) {
      let html = home0();
      html = html.replace('<h2>Aural, grade by grade</h2>', '<h2>Aural, grade by grade</h2>' + boardBar(p));
      html = html.replace('<div class="gradebar" role="group" aria-label="Aural grade">', '<div class="gradebar" role="group" aria-label="Aural grade"><button class="gbtn" data-tri="1" aria-pressed="false">Initial</button>');
      return html;
    }
    const bar = key === "A0" ? (home0().match(/<div class="gradebar" role="group" aria-label="Aural grade">[\s\S]*?<\/div>/) || [""])[0].replace('aria-pressed="true"', 'aria-pressed="false"').replace('<div class="gradebar" role="group" aria-label="Aural grade">', '<div class="gradebar" role="group" aria-label="Aural grade"><button class="gbtn" data-tri="1" aria-pressed="true">Initial</button>') : gradeButtons(p, "trinity");
    return heroHTML(p) + `<h2>Aural, grade by grade</h2>` + boardBar(p) + bar + boardView(p, key);
  };

  document.addEventListener("click", function (e) {
    const b = e.target.closest("[data-trb],[data-trg],[data-tri],[data-trtest],[data-trmock],[data-act=agrade]"); if (!b) return;
    const p = P();
    if (b.dataset.act === "agrade") { p.abrsmInitial = false; return; }   // an ABRSM grade button: leave Initial
    e.stopPropagation(); e.preventDefault();
    if (b.dataset.trb) { p.auralBoard = b.dataset.trb; if (b.dataset.trb === "abrsm") p.abrsmInitial = false; }
    if (b.dataset.trg) { p.trGrade = +b.dataset.trg; }
    if (b.dataset.tri) { p.abrsmInitial = true; }
    if (b.dataset.trtest) {
      const [id, L, sec] = b.dataset.trtest.split(":"), key = keyOf(p), G = BOARD_GRADES[key], t = G.tests.find(x => x.id === id && x.L === +L);
      VIEW.skill = null; VIEW.mock = null; VIEW.learn = null;
      VIEW.gctx = { g: (G.board === "Trinity" ? "Trinity " : "") + G.name, sec: t.sec, t: t.t, d: t.d };
      startRound("aural", id, +L); window.scrollTo({ top: 0 }); save(); return;
    }
    if (b.dataset.trmock) { stopAll(); VIEW.mock = b.dataset.trmock; VIEW.skill = null; VIEW.round = null; render(); window.scrollTo({ top: 0 }); return; }
    save(); render();
  }, true);

  /* the Grade label on the back button reads "← Grade Initial aural" otherwise */
  const mockView0 = mockView;
  mockView = function () {
    let html = mockView0();
    if (typeof VIEW.mock === "string") html = html.replace("The singing tests (A and B) are marked by you — be as strict as an examiner would be.", BOARD_GRADES[VIEW.mock].board === "Trinity" ? "Every question is marked for you." : "The singing and clapping tests are marked by you — be as strict as an examiner would be.");
    return html;
  };
  if (typeof render === "function") render();
})();
