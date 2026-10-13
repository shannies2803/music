/* The Theory Room: reading an orchestral score.
   Instrument names in Italian, German and French, the usual abbreviations, score order, families
   and transposing instruments, as asked in score questions at higher grades. The data is shared
   with the Handbook (window.TR_SCORE). */
(function () {
  "use strict";
  /* [English, Italian, German, French, abbreviation, family, written-vs-sounding] */
  const ORCH = window.TR_SCORE = [
    ["Piccolo", "Ottavino", "Kleine Flöte", "Petite flûte", "Picc.", "Woodwind", "sounds an octave higher than written"],
    ["Flute", "Flauto", "Flöte", "Flûte", "Fl.", "Woodwind", "sounds as written"],
    ["Oboe", "Oboe", "Oboe", "Hautbois", "Ob.", "Woodwind", "sounds as written"],
    ["Cor anglais", "Corno inglese", "Englischhorn", "Cor anglais", "C. ing.", "Woodwind", "in F: sounds a perfect 5th lower than written"],
    ["Clarinet", "Clarinetto", "Klarinette", "Clarinette", "Cl.", "Woodwind", "in B♭: sounds a major 2nd lower than written (in A: a minor 3rd lower)"],
    ["Bassoon", "Fagotto", "Fagott", "Basson", "Fg.", "Woodwind", "sounds as written"],
    ["Horn", "Corno", "Horn", "Cor", "Cor.", "Brass", "in F: sounds a perfect 5th lower than written"],
    ["Trumpet", "Tromba", "Trompete", "Trompette", "Tr.", "Brass", "in B♭: sounds a major 2nd lower than written (in C: as written)"],
    ["Trombone", "Trombone", "Posaune", "Trombone", "Trb.", "Brass", "sounds as written"],
    ["Tuba", "Tuba", "Tuba", "Tuba", "Tb.", "Brass", "sounds as written"],
    ["Timpani", "Timpani", "Pauken", "Timbales", "Timp.", "Percussion", "sounds as written"],
    ["Harp", "Arpa", "Harfe", "Harpe", "Arp.", "Strings", "sounds as written"],
    ["Violin", "Violino", "Violine (Geige)", "Violon", "Vl.", "Strings", "sounds as written"],
    ["Viola", "Viola", "Bratsche", "Alto", "Va.", "Strings", "sounds as written"],
    ["Cello", "Violoncello", "Violoncello", "Violoncelle", "Vc.", "Strings", "sounds as written"],
    ["Double bass", "Contrabbasso", "Kontrabass", "Contrebasse", "Cb.", "Strings", "sounds an octave lower than written"]
  ];
  const ORDER = ["Piccolo", "Flute", "Oboe", "Cor anglais", "Clarinet", "Bassoon", "Horn", "Trumpet", "Trombone", "Tuba", "Timpani", "Harp", "Violin", "Viola", "Cello", "Double bass"];
  if (typeof TGEN === "undefined") return;
  const LANG = ["Italian", "German", "French"];
  const four = (right, pool) => { const o = [right]; shuffle(pool).forEach(x => { if (o.length < 4 && o.indexOf(x) < 0) o.push(x); }); return shuffle(o).map(x => opt(x)); };
  TGEN.scoreq = function () {
    const I = pick(ORCH), kind = rnd(6), en = ORCH.map(x => x[0]);
    if (kind <= 1) { const li = rnd(3), name = I[1 + li];
      const same = ORCH.filter(x => x[1 + li] === name).map(x => x[0]); if (same.length > 1 || name === I[0]) return TGEN.scoreq();
      return { prompt: "In a score, which instrument is <i>" + esc(name) + "</i> (" + LANG[li] + ")?", options: four(I[0], en), answer: I[0], explain: "<i>" + esc(name) + "</i> is the " + LANG[li] + " for <b>" + I[0].toLowerCase() + "</b>. Italian " + I[1] + ", German " + I[2] + ", French " + I[3] + "." }; }
    if (kind === 2) return { prompt: "Which instrument is shown by the abbreviation <b>" + I[4] + "</b> in a score?", options: four(I[0], en), answer: I[0], explain: "<b>" + I[4] + "</b> = " + I[1] + " (" + I[0].toLowerCase() + ")." };
    if (kind === 3) return { prompt: "Which section of the orchestra does the " + I[0].toLowerCase() + " belong to?", options: ["Woodwind", "Brass", "Percussion", "Strings"].map(x => opt(x)), answer: I[5], explain: "The " + I[0].toLowerCase() + " is in the <b>" + I[5].toLowerCase() + "</b> section." + (I[0] === "Harp" ? " In a score, the harp sits just above the strings." : "") };
    if (kind === 4) { const T = pick(ORCH.filter(x => !/as written$/.test(x[6]))); const right = T[6].replace(/ \(.*\)$/, "");
      const pool = ["sounds as written", "sounds an octave higher than written", "sounds an octave lower than written", "in B♭: sounds a major 2nd lower than written", "in F: sounds a perfect 5th lower than written", "in E♭: sounds a major 6th lower than written"];
      return { prompt: "How does the " + T[0].toLowerCase() + " sound compared with the written notes?", options: four(right, pool.filter(x => x !== right)), answer: right, explain: "The " + T[0].toLowerCase() + " " + T[6] + ". To find the sounding pitch, move the written note by that interval." }; }
    const a = shuffle(ORCH.slice()).slice(0, 4), first = a.slice().sort((x, y) => ORDER.indexOf(x[0]) - ORDER.indexOf(y[0]))[0];
    return { prompt: "In a full score, which of these instruments is printed highest on the page?", options: a.map(x => opt(x[0])), answer: first[0], explain: "Score order, top to bottom: woodwind (piccolo, flutes, oboes, cor anglais, clarinets, bassoons), brass (horns, trumpets, trombones, tuba), percussion (timpani), harp, then strings (violins I and II, violas, cellos, double basses). So the <b>" + first[0].toLowerCase() + "</b> comes first here." };
  };
  LESSON_BY["ms-score"] = { id: "ms-score", g: 5, topic: "Musicianship", t: "Reading a score", gen: "scoreq", p: {},
    h: "<p>Score questions ask which instrument plays a part, what its name means, and how a transposing instrument sounds. Learn the <b>score order</b> (woodwind, brass, percussion, then strings, each section from high to low), the <b>Italian names</b> most scores use, and the usual abbreviations. The full table is in the Handbook under <i>Instruments in scores</i>.</p>" };
  const can = g => !window.TR || TR.can("theory", g);
  const th0 = theoryHome;
  theoryHome = function () {
    const h = th0(), at = h.indexOf('<h2 style="margin-top:22px">Mock exams</h2>');
    if (h.indexOf('<h2 style="margin-top:22px">Musicianship</h2>') < 0 || at < 0) return h;
    const end = h.lastIndexOf("</div>", at);
    const c = can(5) ? '<button class="lesson" data-act="lesson" data-arg="ms-score"><span class="n">𝄞</span><div><div style="font-weight:700">Reading a score</div><div class="muted" style="font-size:.85rem">Instrument names, abbreviations, score order, transposing instruments</div></div></button>'
      : '<a class="lesson" href="../app.html#plans" style="text-decoration:none;color:inherit"><span class="n">𝄞</span><div><div style="font-weight:700">Reading a score 🔒</div><div class="muted" style="font-size:.85rem">Comes with a plan</div></div></a>';
    return h.slice(0, end) + c + h.slice(end);
  };
  if (typeof render === "function") render();
})();
