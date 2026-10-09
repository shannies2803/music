/* The Theory Room: Trinity College London Theory of Music, Grades 1–8 (quick drills and mixed quizzes).
   Topics follow Trinity's Theory of Music syllabus grade by grade. Uses the theory room's own
   question makers where the topic is shared with ABRSM, and adds Trinity's own topics: scales and
   modes, chord symbols, cadences including Phrygian and tierce de Picardie, the 12-bar blues,
   tone rows, transposing instruments, form and style, and Trinity's terms for each grade. */
(function () {
  "use strict";
  if (typeof TGEN === "undefined" || typeof LESSON_BY === "undefined") return;

  /* ---------- scales and modes, spelled from the tonic ---------- */
  const SCALES = {
    "major": [[2, "M"], [3, "M"], [4, "P"], [5, "P"], [6, "M"], [7, "M"], [8, "P"]],
    "natural minor (Aeolian)": [[2, "M"], [3, "m"], [4, "P"], [5, "P"], [6, "m"], [7, "m"], [8, "P"]],
    "harmonic minor": [[2, "M"], [3, "m"], [4, "P"], [5, "P"], [6, "m"], [7, "M"], [8, "P"]],
    "melodic minor (going up)": [[2, "M"], [3, "m"], [4, "P"], [5, "P"], [6, "M"], [7, "M"], [8, "P"]],
    "Dorian mode": [[2, "M"], [3, "m"], [4, "P"], [5, "P"], [6, "M"], [7, "m"], [8, "P"]],
    "Mixolydian mode": [[2, "M"], [3, "M"], [4, "P"], [5, "P"], [6, "M"], [7, "m"], [8, "P"]],
    "pentatonic major": [[2, "M"], [3, "M"], [5, "P"], [6, "M"], [8, "P"]],
    "pentatonic minor": [[3, "m"], [4, "P"], [5, "P"], [7, "m"], [8, "P"]],
    "blues scale": [[3, "m"], [4, "P"], [5, "d"], [5, "P"], [7, "m"], [8, "P"]],
    "whole-tone": [[2, "M"], [3, "M"], [4, "A"], [5, "A"], [6, "A"], [8, "P"]],
    "chromatic": [[2, "m"], [2, "M"], [3, "m"], [3, "M"], [4, "P"], [4, "A"], [5, "P"], [6, "m"], [6, "M"], [7, "m"], [7, "M"], [8, "P"]]
  };
  const SCALE_WHY = {
    "major": "tones and semitones T T S T T T S.",
    "natural minor (Aeolian)": "the notes of the relative major, starting on its 6th: flattened 3rd, 6th and 7th.",
    "harmonic minor": "a minor scale with a raised 7th, which leaves a gap of three semitones between the 6th and 7th.",
    "melodic minor (going up)": "a minor 3rd, but a raised 6th and 7th on the way up.",
    "Dorian mode": "like natural minor but with a major 6th (the white notes from D to D).",
    "Mixolydian mode": "like a major scale with a flattened 7th (the white notes from G to G).",
    "pentatonic major": "five notes: degrees 1, 2, 3, 5 and 6 of the major scale, with no semitones.",
    "pentatonic minor": "five notes: 1, ♭3, 4, 5 and ♭7.",
    "blues scale": "the minor pentatonic with an added flattened 5th (the 'blue note').",
    "whole-tone": "six notes, each a whole tone apart, so there are no semitones at all.",
    "chromatic": "every semitone: twelve different notes."
  };
  const TONICS = ["C", "D", "E", "F", "G", "A"];
  function spellScale(type, tonicLetter) { const t = N(LET.indexOf(tonicLetter), 0, 4); return [t].concat(SCALES[type].map(([n, q]) => upBy(t, n, q))); }

  TGEN.tScale = (p) => {
    const type = pick(p.types), tl = pick(type === "chromatic" ? ["C", "D", "F", "G"] : TONICS);
    const notes = spellScale(type, tl);
    const pool = p.types.length >= 3 ? p.types : Object.keys(SCALES);
    const visual = staffSVG({ clef: "treble", key: 0, events: notes.map(n => ({ keys: [n], d: 1 })).concat([{ bar: "end" }]), prop: false, spacing: type === "chromatic" ? 30 : 40, minW: 260, aria: "scale" });
    return { prompt: "Which kind of scale is this?", visual, options: optsFrom(type, pool, Math.min(4, pool.length)), answer: type,
      explain: `It's ${/^[aeiou]/i.test(type) ? "an" : "a"} <b>${type}</b>${/scale|mode$/.test(type) ? "" : " scale"} on ${tl}: ${SCALE_WHY[type]}` };
  };

  /* ---------- chord symbols and Roman numerals (Trinity labels both ways) ---------- */
  const QUAL = { 1: "major", 2: "minor", 3: "minor", 4: "major", 5: "major", 6: "minor", 7: "diminished" };
  const roman = (deg, inv) => { const r = ROMAN[deg - 1]; const lab = QUAL[deg] === "major" ? r : r.toLowerCase() + (QUAL[deg] === "diminished" ? "°" : ""); return lab + ["", "b", "c"][inv]; };
  const symbol = (root, deg, inv, bass) => nm(root) + (QUAL[deg] === "minor" ? "m" : QUAL[deg] === "diminished" ? "dim" : "") + (inv ? "/" + nm(bass) : "");
  TGEN.tChordSym = (p) => {
    const k = pick(p.keys), deg = pick(p.degs), inv = pick(p.inv), t = majorTonic(k), sc = scaleOf(t, "major");
    const root = sc[deg - 1], tri = triadOf(root, QUAL[deg]);
    const order = [tri[inv], tri[(inv + 1) % 3], tri[(inv + 2) % 3]].map(n => N(n.L, n.acc, 4));
    for (let i = 1; i < 3; i++) while (diaOf(order[i]) <= diaOf(order[i - 1])) order[i].oct++;
    while (diaOf(order[0]) > 32) order.forEach(n => n.oct--);
    const asSym = Math.random() < .5;
    const ans = asSym ? symbol(root, deg, inv, tri[inv]) : roman(deg, inv);
    const pool = [];
    p.degs.forEach(d => [0, 1, 2].forEach(i => { if (p.inv.includes(i)) { const r = sc[d - 1], tr = triadOf(r, QUAL[d]); pool.push(asSym ? symbol(r, d, i, tr[i]) : roman(d, i)); } }));
    return { prompt: `This chord is in ${keyName(k, "major")}. ${asSym ? "Which chord symbol fits it?" : "Which Roman numeral fits it?"}`,
      visual: staffSVG({ clef: "treble", key: k, events: [{ keys: order, d: 4 }, { bar: "end" }], minW: 200, aria: "chord" }),
      options: optsFrom(ans, [...new Set(pool)], 4), answer: ans,
      explain: `The root is ${nm(root)} (chord ${roman(deg, 0)}) and the lowest note is ${nm(tri[inv])}, so it's ${["root position", "first inversion", "second inversion"][inv]}: <b>${esc(ans)}</b>.` };
  };

  /* ---------- cadences, including Trinity's Grade 7 extras ---------- */
  const CAD = {
    perfect: ["V", "I", "major", "The perfect cadence, V–I, sounds finished."],
    plagal: ["IV", "I", "major", "The plagal cadence, IV–I, is the 'Amen' at the end of a hymn."],
    imperfect: [() => pick(["I", "ii", "IV"]), "V", "major", "An imperfect cadence ends on V, so it sounds like a comma, not a full stop."],
    interrupted: ["V", "vi", "major", "The interrupted cadence goes V–vi when you expect V–I."],
    phrygian: ["ivb", "V", "minor", "The Phrygian cadence is ivb–V in a minor key: the bass falls a semitone to the dominant."],
    picardie: ["V", "I (major)", "minor", "A tierce de Picardie ends a minor piece on a major tonic chord."]
  };
  const CADNAME = { perfect: "perfect", plagal: "plagal", imperfect: "imperfect", interrupted: "interrupted", phrygian: "Phrygian", picardie: "tierce de Picardie" };
  TGEN.tCadence = (p) => {
    const type = pick(p.types), c = CAD[type], a = typeof c[0] === "function" ? c[0]() : c[0];
    const key = c[2] === "minor" ? pick(["A minor", "D minor", "E minor", "G minor"]) : pick(["C major", "G major", "F major", "D major"]);
    return { prompt: `In ${key}, a phrase ends with the chords <b>${a} → ${c[1]}</b>. Which cadence is it?`,
      options: p.types.map(x => opt(x, CADNAME[x])), answer: type, explain: `It's ${type === "imperfect" || type === "interrupted" ? "an" : "a"} <b>${CADNAME[type]}</b> cadence. ${c[3]}` };
  };

  /* ---------- the 12-bar blues ---------- */
  const BLUES = ["I", "I", "I", "I", "IV", "IV", "I", "I", "V", "IV", "I", "V"];
  TGEN.tBlues = () => {
    const keyL = pick(["C", "G", "F", "D", "A", "E", "B♭"]), k = { C: 0, G: 1, F: -1, D: 2, A: 3, E: 4, "B♭": -2 }[keyL];
    const sc = scaleOf(majorTonic(k), "major"), name = r => nm(sc[r === "I" ? 0 : r === "IV" ? 3 : 4]);
    if (Math.random() < .5) {
      const bar = 1 + rnd(12), r = BLUES[bar - 1];
      return { prompt: `A 12-bar blues in ${keyL}. Which chord is in bar ${bar}?`, options: ["I", "IV", "V"].map(x => opt(name(x) + " (" + x + ")")), answer: name(r) + " (" + r + ")",
        explain: `The 12-bar blues goes I I I I · IV IV I I · V IV I V. Bar ${bar} is <b>${r}</b>, which in ${keyL} is <b>${name(r)}</b>.` };
    }
    const right = "I I I I · IV IV I I · V IV I V", wrong = ["I I I I · V V I I · IV V I I", "I IV I V · I IV I V · I IV V I", "I I IV IV · I I V V · IV IV I I"];
    return { prompt: "Which is the 12-bar blues chord pattern?", options: shuffle([right, ...wrong]).map(x => opt(x)), answer: right, explain: `<b>${right}</b>: four bars of I, two of IV, two of I, then V, IV, I, V (the last bar turns back to the start).` };
  };

  /* ---------- tone rows (Grade 8) ---------- */
  const PCN = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];
  TGEN.tRow = () => {
    const row = shuffle(Array.from({ length: 12 }, (_, i) => i)), show = r => r.map(i => PCN[i]).join(" ");
    const retro = row.slice().reverse();
    if (Math.random() < .5) {
      const n = 1 + rnd(12);
      return { prompt: `Tone row: <b>${show(row)}</b>. What is note ${n} of its retrograde?`, options: optsFrom(PCN[retro[n - 1]], row.map(i => PCN[i]), 4), answer: PCN[retro[n - 1]],
        explain: `The retrograde is the row backwards: ${show(retro)}. Note ${n} is <b>${PCN[retro[n - 1]]}</b>.` };
    }
    const rot = row.slice(3).concat(row.slice(0, 3)), swap = retro.slice(); [swap[4], swap[5]] = [swap[5], swap[4]];
    const opts = [show(retro), show(row), show(rot), show(swap)];
    return { prompt: `Tone row: <b>${show(row)}</b>. Which is its retrograde?`, options: shuffle(opts).map(x => opt(x)), answer: show(retro), explain: `The retrograde is the same twelve notes in reverse order: <b>${show(retro)}</b>.` };
  };

  /* ---------- transposing instruments, by grade ---------- */
  const TI = [ // name, interval number, quality, "lower"/"higher", grade
    ["descant recorder", 8, "P", "higher", 4], ["French horn in F", 5, "P", "lower", 4], ["double bass", 8, "P", "lower", 4], ["classical guitar", 8, "P", "lower", 4],
    ["clarinet in B♭", 2, "M", "lower", 5], ["trumpet in B♭", 2, "M", "lower", 5], ["alto saxophone in E♭", 6, "M", "lower", 5],
    ["tenor saxophone in B♭", 9, "M", "lower", 6],
    ["clarinet in A", 3, "m", "lower", 7], ["soprano saxophone in B♭", 2, "M", "lower", 7], ["baritone saxophone in E♭", 13, "M", "lower", 7], ["tenor horn in E♭", 6, "M", "lower", 7],
    ["piccolo", 8, "P", "higher", 8], ["cor anglais", 5, "P", "lower", 8], ["cornet in B♭", 2, "M", "lower", 8], ["xylophone", 8, "P", "higher", 8], ["glockenspiel", 15, "P", "higher", 8]
  ];
  const ivName = (n, q) => n === 15 ? "two octaves" : n === 8 ? "an octave" : n === 9 ? "a major 9th (an octave and a major 2nd)" : n === 13 ? "an octave and a major 6th" : "a " + intName(n, q);
  TGEN.tTransInst = (p) => {
    const pool = TI.filter(x => x[4] <= p.g), x = pick(pool.filter(y => y[4] === p.g).length && Math.random() < .6 ? pool.filter(y => y[4] === p.g) : pool);
    const ans = `${ivName(x[1], x[2])} ${x[3]}`;
    if (x[1] <= 6 && Math.random() < .5) {
      const w = N(pick([0, 1, 4, 3]), 0, 5), s = x[3] === "lower" ? downBy(w, x[1], x[2]) : upBy(w, x[1], x[2]);
      const others = shuffle(["C", "D", "E", "F", "G", "A", "B", "B♭", "E♭", "F♯", "A♭"].filter(n => n !== nm(s))).slice(0, 3);
      return { prompt: `A ${x[0]} player reads a written <b>${nm(w)}</b>. Which note sounds?`, options: shuffle([nm(s), ...others]).map(n => opt(n)), answer: nm(s), explain: `The ${x[0]} sounds ${ans} than written, so a written ${nm(w)} sounds as <b>${nm(s)}</b>.` };
    }
    const wrongs = shuffle([...new Set(TI.map(y => `${ivName(y[1], y[2])} ${y[3]}`))].filter(v => v !== ans)).slice(0, 3);
    return { prompt: `How does the <b>${x[0]}</b> sound, compared with the written note?`, options: shuffle([ans, ...wrongs]).map(v => opt(v)), answer: ans, explain: `The ${x[0]} sounds <b>${ans}</b> than written.` };
  };

  /* ---------- instruments: families and clefs (Grades 3–4) ---------- */
  const TINST = [
    ["violin", "strings", "treble", 3], ["cello", "strings", "bass (with tenor and treble for high notes)", 3], ["flute", "woodwind", "treble", 3], ["bassoon", "woodwind", "bass (with tenor for high notes)", 3],
    ["French horn", "brass", "treble (sometimes bass)", 4], ["descant recorder", "woodwind", "treble", 4], ["oboe", "woodwind", "treble", 4], ["viola", "strings", "alto (with treble for high notes)", 4],
    ["double bass", "strings", "bass", 4], ["guitar", "strings (plucked)", "treble", 4]
  ];
  TGEN.tInst = (p) => {
    const x = pick(TINST.filter(y => y[3] <= p.g));
    if (Math.random() < .5) return { prompt: `Which family does the <b>${x[0]}</b> belong to?`, options: ["strings", "woodwind", "brass", "percussion"].map(f => opt(f)), answer: x[1].split(" ")[0], explain: `The ${x[0]} is in the <b>${x[1]}</b> family.` };
    const clefs = ["treble", "bass", "alto"], main = x[2].split(" ")[0];
    return { prompt: `Which clef does the <b>${x[0]}</b> mainly read?`, options: clefs.map(c => opt(c)), answer: main, explain: `The ${x[0]} reads <b>${x[2]}</b> clef.` };
  };

  /* ---------- form and style ---------- */
  const FORM = {
    5: [["A song where every verse is sung to the same music", "strophic", ["through-composed", "rondo", "ternary"]],
        ["Verses that alternate with a chorus that comes back each time", "verse and refrain", ["binary", "theme and variations", "strophic"]],
        ["Two sections, A and B, often each repeated", "binary form", ["ternary form", "rondo form", "strophic"]]],
    6: [["A slow, stately Baroque dance in triple time, often stressing the 2nd beat", "sarabande", ["gigue", "bourrée", "gavotte"]],
        ["A lively dance in compound time, often the last movement of a suite", "gigue", ["allemande", "sarabande", "minuet"]],
        ["A moderate dance in 4/4 that usually opens a Baroque suite", "allemande", ["gigue", "minuet", "gavotte"]],
        ["A dance in 2 that starts halfway through the bar", "gavotte", ["sarabande", "courante", "minuet"]],
        ["An elegant dance in 3/4, later paired with a trio", "minuet", ["bourrée", "gigue", "allemande"]],
        ["Melody with a chordal accompaniment", "homophonic", ["polyphonic", "imitative", "monophonic"]],
        ["Several independent melodies at once", "polyphonic", ["homophonic", "unison", "monophonic"]],
        ["Voices or parts copy each other in turn", "imitative", ["homophonic", "unison", "chordal"]],
        ["Roughly when was the Baroque period?", "c.1600–1750", ["c.1750–1830", "c.1830–1900", "c.1450–1600"]],
        ["A church sonata, usually slow–fast–slow–fast", "sonata da chiesa", ["sonata da camera", "concerto grosso", "suite"]]],
    7: [["The three main sections of sonata form", "exposition, development, recapitulation", ["introduction, theme, coda", "verse, chorus, bridge", "A, B, A"]],
        ["A form where the main theme keeps coming back: A B A C A", "rondo", ["binary", "sonata form", "strophic"]],
        ["The instruments of a string quartet", "two violins, viola, cello", ["violin, viola, cello, double bass", "two violins, two cellos", "violin, viola, cello, piano"]],
        ["Roughly when was the Classical period?", "c.1750–1830", ["c.1600–1750", "c.1830–1900", "c.1900–1950"]],
        ["A broken-chord accompaniment: lowest, highest, middle, highest", "Alberti bass", ["walking bass", "ground bass", "pedal"]],
        ["The extra ending section of a movement", "coda", ["bridge", "transition", "exposition"]],
        ["How many movements does a Classical symphony usually have?", "four", ["three", "two", "five"]],
        ["The fast third movement that replaced the minuet, from Beethoven onwards", "scherzo", ["rondo", "sarabande", "sonatina"]]],
    8: [["A showy solo passage near the end of a concerto movement, in an improvised style", "cadenza", ["coda", "étude", "ritornello"]],
        ["A piece written to practise one technique", "étude", ["nocturne", "prelude", "mazurka"]],
        ["A dreamy 'night piece' for piano, with a singing melody over broken chords", "nocturne", ["étude", "waltz", "mazurka"]],
        ["A German art song for voice and piano", "Lied", ["mazurka", "chorale", "aria"]],
        ["A Polish dance in triple time with accents on the 2nd or 3rd beat", "mazurka", ["waltz", "polonaise", "minuet"]],
        ["Roughly when was the Romantic period?", "c.1830–1900", ["c.1750–1830", "c.1600–1750", "c.1900–2000"]],
        ["Music built from an ordering of all twelve notes", "serial (a tone row)", ["pentatonic", "modal", "whole-tone"]],
        ["Mendelssohn's lyrical piano pieces", "songs without words", ["nocturnes", "études", "ballades"]]]
  };
  TGEN.tForm = (p) => { const x = pick(FORM[p.g]); return { prompt: /\?$/.test(x[0]) ? x[0] : x[0] + "?", options: shuffle([x[1], ...x[2]]).map(v => opt(v)), answer: x[1], explain: `The answer is <b>${esc(x[1])}</b>.` }; };

  /* ---------- Trinity's terms and signs, by grade ---------- */
  const TT = {
    1: [["pianissimo (pp)", "very quiet"], ["piano (p)", "quiet"], ["mezzo piano (mp)", "moderately quiet"], ["mezzo forte (mf)", "moderately loud"], ["forte (f)", "loud"], ["fortissimo (ff)", "very loud"],
        ["crescendo (cresc.)", "gradually getting louder"], ["diminuendo (dim.)", "gradually getting quieter"], ["accent (>)", "stress the note"], ["legato", "smoothly"], ["staccato", "short and detached"],
        ["andante", "at a walking pace"], ["allegro", "quick and lively"], ["moderato", "at a moderate speed"], ["ritenuto (rit.)", "held back (slower at once)"]],
    2: [["decrescendo", "gradually getting quieter"], ["tenuto", "held, given its full length"], ["adagio", "slow"], ["allegretto", "fairly quick"], ["cantabile", "in a singing style"], ["espressivo", "with expression"],
        ["grazioso", "gracefully"], ["molto", "very, much"], ["vivace", "lively and quick"], ["fermata (pause)", "hold the note longer than written"], ["8va", "play an octave higher"]],
    3: [["marcato", "marked, accented"], ["a tempo", "back to the original speed"], ["con", "with"], ["dolce", "sweetly"], ["leggiero", "lightly"], ["ma", "but"], ["marziale", "in a military style"],
        ["meno", "less"], ["mosso", "moving, with movement"], ["non", "not"], ["più", "more"], ["poco", "a little"], ["tranquillo", "calmly"], ["troppo", "too much"], ["vivo", "lively"],
        ["da capo al fine", "go back to the start and finish at Fine"]],
    4: [["fortepiano (fp)", "loud, then quiet at once"], ["sforzando (sf, sfz)", "with a sudden strong accent"], ["accelerando", "gradually getting faster"], ["animato", "lively, animated"], ["assai", "very"],
        ["con moto", "with movement"], ["con brio", "with vigour"], ["giocoso", "playfully, merrily"], ["largo", "slow and broad"], ["l'istesso tempo", "at the same speed"], ["maestoso", "majestically"],
        ["pesante", "heavily"], ["sempre", "always"], ["senza", "without"], ["simile", "carry on in the same way"], ["subito", "suddenly"], ["ma non troppo", "but not too much"]],
    5: [["sotto voce", "in an undertone, very quietly"], ["una corda", "use the soft (left) pedal"], ["agitato", "agitated"], ["arpeggiando", "spread the notes of the chord"], ["con forza", "with force"],
        ["energico", "energetically"], ["grave", "very slow and solemn"], ["larghetto", "rather slow"], ["appassionato", "passionately"], ["con fuoco", "with fire"], ["morendo", "dying away"],
        ["al niente", "fading to nothing"], ["quasi", "almost, as if"], ["risoluto", "boldly, resolutely"], ["rubato", "with some freedom of time"], ["scherzando", "playfully"],
        ["stringendo", "pressing on, getting faster"], ["tempo giusto", "in strict time"]],
    6: [["arco", "with the bow"], ["pizzicato (pizz.)", "pluck the strings"], ["con sordino", "with a mute"], ["double stopping", "playing two strings at once"], ["basso continuo", "a bass line with keyboard chords added above"],
        ["contrabasso", "double bass"], ["corno", "horn"], ["fagotto", "bassoon"], ["flauto", "flute"], ["flauto dolce", "recorder"], ["tromba", "trumpet"], ["violino", "violin"], ["violoncello", "cello"]],
    7: [["exposition", "the first section of sonata form, presenting the themes"], ["development", "the middle section of sonata form, where the themes are worked out"],
        ["recapitulation", "the return of the opening themes in the home key"], ["bridge passage", "a linking passage between themes"], ["transition", "a passage that moves to a new key or section"], ["coda", "an ending section"]],
    8: [["cadenza", "a solo passage in an improvised style"], ["étude", "a study piece"], ["nocturne", "a night piece"], ["Lied", "a German art song"], ["mazurka", "a Polish dance in triple time"],
        ["prelude", "an introductory piece"], ["waltz", "a dance in triple time"]]
  };
  window.TRINITY_TERMS = TT;
  TGEN.tTerms = (p) => {
    const pool = TT[p.g], t = pick(pool), meanings = [...new Set(pool.map(x => x[1]))].filter(m => m !== t[1]);
    if (Math.random() < .35) { const others = shuffle(pool.filter(x => x[1] !== t[1])).slice(0, 3);
      return { prompt: `Which means “${t[1]}”?`, options: shuffle([t, ...others]).map(x => opt(x[0], `<i>${esc(x[0])}</i>`)), answer: t[0], explain: `<i>${esc(t[0])}</i> means ${esc(t[1])}.` }; }
    return { prompt: `What does <i>${esc(t[0])}</i> mean?`, options: shuffle([t[1], ...shuffle(meanings).slice(0, 3)]).map(x => opt(x)), answer: t[1], explain: `<i>${esc(t[0])}</i> means <b>${esc(t[1])}</b>.` };
  };

  /* ---------- a mixed quiz across a grade's lessons ---------- */
  TGEN.mix = (p, diff) => {
    const l = LESSON_BY[pick(p.ids)], q = TGEN[l.gen](l.p, diff);
    q.prompt = `<span class="muted" style="font-size:.85em">${esc(l.t)}</span><br>` + q.prompt; return q;
  };

  /* ---------- the lessons, grade by grade ---------- */
  const K1 = [0, 1, -1], K3 = [-2, -1, 0, 1, 2], K4 = [-3, -2, -1, 0, 1, 2, 3], K5 = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5], KALL = [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7];
  const L = (g, id, t, topic, gen, p, h) => ({ id: "tr" + g + "-" + id, g, board: "trinity", t, topic, gen, p, h: "<p>" + h + "</p>" });
  const TL = [
    L(1, "treble", "Notes in the treble clef", "Notes & clefs", "noteName", { clefs: ["treble"], lo: "C4", hi: "A5" }, "Trinity Grade 1 uses notes up to one leger line above or below the stave."),
    L(1, "bass", "Notes in the bass clef", "Notes & clefs", "noteName", { clefs: ["bass"], lo: "E2", hi: "C4" }, "Bass clef notes up to one leger line above or below the stave."),
    L(1, "values", "Note values", "Rhythm", "noteValue", { set: [4, 3, 2, 1, .5] }, "Semibreve, dotted minim, minim, crotchet and quaver."),
    L(1, "rests", "Rests", "Rhythm", "restValue", { set: [4, 2, 1] }, "Semibreve, minim and crotchet rests. A semibreve rest fills a whole bar in any time signature."),
    L(1, "time", "2/4, 3/4 and 4/4", "Rhythm", "timeSigBar", { sigs: ["2/4", "3/4", "4/4"] }, "The top number counts the beats; 4 underneath means crotchet beats."),
    L(1, "tones", "Tones and semitones", "Notes & clefs", "toneSemi", {}, "A semitone is the smallest step on the keyboard; a tone is two semitones."),
    L(1, "keys", "C, G and F major", "Keys & scales", "keySig", { keys: K1, modes: ["major"], clefs: ["treble", "bass"] }, "G major has F♯; F major has B♭; C major has none."),
    L(1, "degrees", "Scale degrees 1–8", "Keys & scales", "scaleDeg", { keys: K1, modes: ["major"] }, "Number the notes of the scale from the tonic (1, doh)."),
    L(1, "intervals", "Intervals by number", "Intervals", "intNum", { keys: K1, modes: ["major"], clefs: ["treble", "bass"] }, "Count the letter names from the lower note, counting both notes."),
    L(1, "triads", "Tonic triads", "Chords", "tonicTriad", { keys: K1, modes: ["major"] }, "The tonic triad (I) is notes 1, 3 and 5 of the scale."),
    L(1, "terms", "Grade 1 terms and signs", "Terms & signs", "tTerms", { g: 1 }, "Dynamics, articulation and tempo words for Grade 1."),
    L(2, "ledger", "Two leger lines", "Notes & clefs", "noteName", { clefs: ["treble", "bass"], lo: { treble: "A3", bass: "C2" }, hi: { treble: "C6", bass: "E4" } }, "Notes up to two leger lines above or below the stave."),
    L(2, "values", "Dotted crotchets and semiquavers", "Rhythm", "noteValue", { set: [3, 2, 1.5, 1, .5, .25] }, "A dot adds half the note's value again."),
    L(2, "time", "2/2 and 3/2", "Rhythm", "timeSigBar", { sigs: ["2/4", "3/4", "4/4", "2/2", "3/2"] }, "2/2 and 3/2 count minim beats."),
    L(2, "keys", "A, D and E minor", "Keys & scales", "keySig", { keys: K1, modes: ["major", "minor"], clefs: ["treble", "bass"] }, "Each minor key shares its key signature with its relative major."),
    L(2, "scales", "Natural and harmonic minor", "Keys & scales", "tScale", { types: ["major", "natural minor (Aeolian)", "harmonic minor"] }, "The harmonic minor raises the 7th."),
    L(2, "intervals", "Intervals up to an octave", "Intervals", "intNum", { keys: K1, modes: ["major", "minor"], clefs: ["treble", "bass"] }, "Grade 2 adds major and minor 2nds and 3rds and perfect 4ths and 5ths."),
    L(2, "triads", "Major and minor tonic triads", "Chords", "tonicTriad", { keys: K1, modes: ["major", "minor"] }, "I in a major key, i in a minor key; Trinity also uses chord symbols such as Am."),
    L(2, "terms", "Grade 2 terms and signs", "Terms & signs", "tTerms", { g: 2 }, "More tempo and expression words."),
    L(3, "ledger", "Three leger lines", "Notes & clefs", "noteName", { clefs: ["treble", "bass"], lo: { treble: "F3", bass: "A1" }, hi: { treble: "E6", bass: "G4" }, acc: true }, "Notes up to three leger lines above or below the stave."),
    L(3, "compound", "Simple and compound time", "Rhythm", "timeClass", { sigs: ["2/4", "3/4", "4/4", "2/2", "3/2", "6/8", "9/8", "12/8"] }, "Compound time has dotted beats: 6/8, 9/8 and 12/8."),
    L(3, "barlines", "Bars in compound time", "Rhythm", "barlines", { sigs: ["6/8", "9/8", "12/8"], lv: 3 }, "Group quavers in threes in compound time."),
    L(3, "triplets", "Triplets", "Rhythm", "triplets", {}, "A triplet fits three notes into the time of two."),
    L(3, "keys", "B♭ and D major; G and B minor", "Keys & scales", "keySig", { keys: K3, modes: ["major", "minor"], clefs: ["treble", "bass"] }, "Keys up to two sharps and two flats."),
    L(3, "scales", "Minor scales: natural, harmonic, melodic", "Keys & scales", "tScale", { types: ["major", "natural minor (Aeolian)", "harmonic minor", "melodic minor (going up)"] }, "The melodic minor raises the 6th and 7th on the way up."),
    L(3, "intervals", "6ths and 7ths", "Intervals", "intFull", { keys: K3, modes: ["major", "minor"] }, "Grade 3 adds major and minor 6ths and 7ths."),
    L(3, "chords", "I and V, with chord symbols", "Chords", "tChordSym", { keys: K3, degs: [1, 5], inv: [0, 1, 2] }, "Label chords with Roman numerals (I, V) or chord symbols (C, G/B)."),
    L(3, "instruments", "Violin, cello, flute and bassoon", "Instruments", "tInst", { g: 3 }, "Families and clefs of the Grade 3 instruments."),
    L(3, "octave", "Transposing at the octave", "Transposition", "octaveClef", {}, "Move a tune up or down an octave, sometimes into the other clef."),
    L(3, "terms", "Grade 3 terms and signs", "Terms & signs", "tTerms", { g: 3 }, "Italian words for mood and movement."),
    L(4, "alto", "The alto clef", "Notes & clefs", "noteName", { clefs: ["alto"], lo: "B2", hi: "D5", acc: true }, "Middle C is on the middle line of the alto clef."),
    L(4, "time", "5/4 and 7/4", "Rhythm", "timeClass", { sigs: ["5/4", "7/4", "3/4", "4/4", "6/8", "9/8"] }, "Irregular time signatures group as 2+3, 3+2 and so on."),
    L(4, "keys", "E♭ and A major; C and F♯ minor", "Keys & scales", "keySig", { keys: K4, modes: ["major", "minor"], clefs: ["treble", "bass", "alto"] }, "Keys up to three sharps and three flats."),
    L(4, "scales", "Chromatic scales", "Keys & scales", "tScale", { types: ["chromatic", "major", "harmonic minor", "melodic minor (going up)"] }, "A chromatic scale uses every semitone."),
    L(4, "enharmonic", "Enharmonic equivalents", "Notes & clefs", "enharmonic", {}, "The same sound, different names: F♯ and G♭."),
    L(4, "intervals", "Augmented 4ths and diminished 5ths", "Intervals", "intAny", { maxNum: 8 }, "The tritone: three whole tones."),
    L(4, "chords", "I, IV and V in all positions", "Chords", "tChordSym", { keys: K4, degs: [1, 4, 5], inv: [0, 1, 2] }, "Ib and C/E mean the same chord in first inversion."),
    L(4, "cadences", "Perfect and plagal cadences", "Chords", "tCadence", { types: ["perfect", "plagal", "imperfect"] }, "V–I is perfect; IV–I is plagal."),
    L(4, "transpose", "Transposing instruments", "Transposition", "tTransInst", { g: 4 }, "Horn in F, descant recorder, double bass and guitar."),
    L(4, "instruments", "Brass, woodwind and strings", "Instruments", "tInst", { g: 4 }, "Families and clefs of the Grade 4 instruments."),
    L(4, "terms", "Grade 4 terms and signs", "Terms & signs", "tTerms", { g: 4 }, "Accents, tempo changes and moods."),
    L(5, "tenor", "The tenor clef", "Notes & clefs", "noteName", { clefs: ["tenor"], lo: "B2", hi: "C5", acc: true }, "Middle C is on the fourth line of the tenor clef."),
    L(5, "keys", "Keys up to five sharps and flats", "Keys & scales", "keySig", { keys: K5, modes: ["major", "minor"], clefs: ["treble", "bass", "alto", "tenor"] }, "A♭, D♭, E and B major; F, B♭, C♯ and G♯ minor."),
    L(5, "pentatonic", "Pentatonic scales", "Keys & scales", "tScale", { types: ["pentatonic major", "major", "natural minor (Aeolian)", "chromatic"] }, "Five notes, no semitones."),
    L(5, "intervals", "Interval names and inversions", "Intervals", "intAny", { maxNum: 8 }, "Inverting an interval: the numbers add up to 9."),
    L(5, "chords", "Chords I, ii, IV and V", "Chords", "tChordSym", { keys: K5, degs: [1, 2, 4, 5], inv: [0, 1, 2] }, "ii is a minor chord in a major key."),
    L(5, "cadences", "Imperfect cadences", "Chords", "tCadence", { types: ["perfect", "plagal", "imperfect"] }, "An imperfect cadence ends on V."),
    L(5, "modulation", "Modulation", "Keys & scales", "modKey", {}, "New accidentals show where the music is heading: to the dominant or the relative key."),
    L(5, "ornaments", "Ornaments", "Notes & clefs", "ornament", {}, "Trills, mordents, acciaccaturas and appoggiaturas."),
    L(5, "transpose", "Transposing instruments", "Transposition", "tTransInst", { g: 5 }, "Clarinet and trumpet in B♭, alto saxophone in E♭."),
    L(5, "form", "Strophic, refrain and binary forms", "Form & style", "tForm", { g: 5 }, "How songs and short pieces are built."),
    L(5, "terms", "Grade 5 terms and signs", "Terms & signs", "tTerms", { g: 5 }, "Pedal marks, moods and tempo words."),
    L(6, "keys", "All keys", "Keys & scales", "keySig", { keys: KALL, modes: ["major", "minor"], clefs: ["treble", "bass", "alto", "tenor"] }, "Every major and minor key signature."),
    L(6, "scales", "Pentatonic, blues and Aeolian", "Keys & scales", "tScale", { types: ["pentatonic major", "pentatonic minor", "blues scale", "natural minor (Aeolian)", "harmonic minor"] }, "Grade 6 adds blues scales and the Aeolian mode."),
    L(6, "dim7", "The diminished 7th", "Chords", "chromatic", { types: ["dim7"], extra: ["v7"], ask: "mix" }, "A stack of minor 3rds on the leading note."),
    L(6, "figures", "Figured bass", "Chords", "chordFig", { degs: [1, 2, 3, 4, 5, 6, 7], ask: "both" }, "5/3 is root position, 6/3 first inversion, 6/4 second inversion."),
    L(6, "cadences", "All four cadences", "Chords", "tCadence", { types: ["perfect", "plagal", "imperfect", "interrupted"] }, "Perfect, plagal, imperfect and interrupted."),
    L(6, "transpose", "Transposing instruments", "Transposition", "tTransInst", { g: 6 }, "Adds the tenor saxophone."),
    L(6, "form", "Baroque dances and textures", "Form & style", "tForm", { g: 6 }, "Suites, sonatas, and the textures of Baroque music."),
    L(6, "terms", "Grade 6 terms: strings and Italian names", "Terms & signs", "tTerms", { g: 6 }, "Bowing terms and the Italian names for instruments."),
    L(7, "scales", "Dorian and whole-tone", "Keys & scales", "tScale", { types: ["Dorian mode", "whole-tone", "pentatonic minor", "blues scale", "natural minor (Aeolian)"] }, "The Dorian mode has a minor 3rd and a major 6th."),
    L(7, "blues", "The 12-bar blues", "Chords", "tBlues", {}, "I I I I · IV IV I I · V IV I V."),
    L(7, "sevenths", "Secondary 7ths", "Chords", "chordFig", { degs: [2, 5], sev: true, ask: "both" }, "7th chords on degrees other than V, such as ii7."),
    L(7, "cadences", "Phrygian and tierce de Picardie", "Chords", "tCadence", { types: ["perfect", "plagal", "imperfect", "interrupted", "phrygian", "picardie"] }, "ivb–V in a minor key is a Phrygian cadence."),
    L(7, "modulation", "Pivot chords and modulation", "Keys & scales", "modKey", {}, "A pivot chord belongs to both keys."),
    L(7, "transpose", "More transposing instruments", "Transposition", "tTransInst", { g: 7 }, "Clarinet in A, soprano and baritone saxophones, tenor horn."),
    L(7, "form", "Classical forms", "Form & style", "tForm", { g: 7 }, "Sonata form, rondo, and the Classical string quartet and symphony."),
    L(7, "terms", "Grade 7 terms", "Terms & signs", "tTerms", { g: 7 }, "The sections of sonata form."),
    L(8, "scales", "Modes and whole-tone scales", "Keys & scales", "tScale", { types: ["Mixolydian mode", "Dorian mode", "whole-tone", "natural minor (Aeolian)", "blues scale"] }, "The Mixolydian mode is major with a flattened 7th."),
    L(8, "rows", "Tone rows and retrogrades", "Keys & scales", "tRow", {}, "A tone row uses all twelve notes once; the retrograde plays it backwards."),
    L(8, "chromatic", "Chromatic chords", "Chords", "chromatic", { types: ["neap", "it6", "fr6", "ger6", "v7v"], ask: "mix" }, "Neapolitan 6th, augmented 6ths and secondary dominants."),
    L(8, "figures", "Figures for any chord", "Chords", "chordFig", { degs: [1, 2, 3, 4, 5, 6, 7], sev: "mix", ask: "both" }, "Including 7th chords and their inversions."),
    L(8, "modulation", "Modulations to related keys", "Keys & scales", "modKey", { all: true }, "Pivot chords into any related key."),
    L(8, "transpose", "All transposing instruments", "Transposition", "tTransInst", { g: 8 }, "Adds piccolo, cor anglais, cornet, xylophone and glockenspiel."),
    L(8, "form", "Romantic forms and serialism", "Form & style", "tForm", { g: 8 }, "Concertos, character pieces, and tone rows."),
    L(8, "terms", "Grade 8 terms", "Terms & signs", "tTerms", { g: 8 }, "Romantic genres and forms.")
  ];
  for (let g = 1; g <= 8; g++) {
    const ids = TL.filter(l => l.g === g).map(l => l.id);
    TL.push({ id: "tr" + g + "-mixed", g, board: "trinity", t: "Mixed quiz", topic: "Exam practice", gen: "mix", p: { ids }, h: "<p>Questions from every Grade " + g + " lesson, like the multiple-choice section of the paper.</p>" });
  }
  TL.forEach(l => { LESSON_BY[l.id] = l; });
  window.TRINITY_LESSONS = TL;

  /* ---------- the theory tab: an exam-board switch ---------- */
  const css = document.createElement("style");
  css.textContent = ".boardbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:4px 0 12px}.boardbar .lbl{font-weight:700;margin-right:4px}";
  document.head.appendChild(css);
  function boardBar(p) {
    const tr = p.theoryBoard === "trinity";
    return `<div class="boardbar" role="group" aria-label="Exam board"><span class="lbl">Exam board</span><button class="gbtn" data-ttb="abrsm" aria-pressed="${!tr}">ABRSM</button><button class="gbtn" data-ttb="trinity" aria-pressed="${tr}">Trinity</button></div>`;
  }
  function trinityHome(p) {
    const g = p.trTheoryGrade || 1, ls = TL.filter(l => l.g === g);
    const can = n => !window.TR || TR.can("theory", n);
    const grades = [1, 2, 3, 4, 5, 6, 7, 8].map(n => can(n) ? `<button class="gbtn" data-ttg="${n}" aria-pressed="${n === g}">Grade ${n}</button>` : `<a class="gbtn tr-lock" href="../app.html#plans">Grade ${n} 🔒</a>`).join("");
    const done = ls.filter(l => (p.tl[l.id] || {}).stars >= 1).length;
    return `<h2 style="margin-top:18px">Quick drills</h2><p class="muted" style="margin-top:0">Trinity College London Theory of Music, Grades 1–8: short lessons with endless fresh questions. The guided courses above follow ABRSM.</p>` + boardBar(p) +
      `<div class="gradebar" role="group" aria-label="Trinity grade">${grades}</div>` +
      (can(g) ? `<div class="row" style="justify-content:space-between"><h3 style="margin:0">Trinity Grade ${g}</h3><span class="pill">${done}/${ls.length} lessons starred</span></div>
      <div class="lessons">${ls.map((l, i) => { const t = p.tl[l.id] || {}; return `<button class="lesson ${t.stars ? "done" : ""}" data-act="lesson" data-arg="${l.id}"><span class="n">${i + 1}</span><div><div style="font-weight:700">${esc(l.t)}</div><div class="muted" style="font-size:.85rem">${esc(l.topic)}${t.a ? ` · ${Math.round(100 * t.c / t.a)}% of ${t.a}` : ""}</div></div>${starStr(t.stars || 0)}</button>`; }).join("")}</div>
      <p class="muted" style="font-size:.85rem;margin-top:12px">The written parts of the Trinity paper (melody writing, SATB chords, transposing a tune, analysis) need pen and paper: these drills build the knowledge behind them.</p>` : (window.TR ? TR.upsellHTML("Trinity Grade " + g + " comes with a plan.") : ""));
  }
  const home0 = theoryHome;
  theoryHome = function () {
    const p = P(); let html = home0();
    if (p.theoryBoard === "trinity") { const i = html.indexOf('<h2 style="margin-top:26px">Quick drills</h2>'); return (i >= 0 ? html.slice(0, i) : "") + trinityHome(p); }
    return html.replace('<h2 style="margin-top:26px">Quick drills</h2>', '<h2 style="margin-top:26px">Quick drills</h2>' + boardBar(p));
  };
  /* the lesson page's back button says "Grade N lessons": add the board for Trinity */
  const lessonView0 = lessonView;
  lessonView = function () { const l = LESSON_BY[VIEW.lesson]; let h = lessonView0(); if (l && l.board === "trinity") h = h.replace(`← Grade ${l.g} lessons`, `← Trinity Grade ${l.g} lessons`).replace(`Grade ${l.g} · `, `Trinity Grade ${l.g} · `); return h; };

  document.addEventListener("click", function (e) {
    const b = e.target.closest("[data-ttb],[data-ttg]"); if (!b) return;
    e.stopPropagation(); e.preventDefault();
    const p = P();
    if (b.dataset.ttb) p.theoryBoard = b.dataset.ttb;
    if (b.dataset.ttg) p.trTheoryGrade = +b.dataset.ttg;
    save(); render();
  }, true);
  if (typeof render === "function") render();
})();
