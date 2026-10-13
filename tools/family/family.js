/* Family edition: shared bits for the kids' home and the grown-ups page.
   Reads each player's progress from this device (TR.progressFor), and keeps avatars, colours and
   weekly rewards on the device too. Today's 15 minutes = a theory review + 5 minutes of Ear Gym +
   10 minutes of instrument practice; a day with all three earns a sticker. */
window.FAM = (function () {
  "use strict";
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var json = function (k, d) { try { var v = JSON.parse(store.get(k) || "null"); return v == null ? d : v; } catch (e) { return d; } };
  var AVATARS = ["🦊", "🐼", "🐯", "🦄", "🐳", "🐸", "🐧", "🦉", "🐙", "🦁", "🐨", "🐝", "🐶", "🐱", "🦖", "🐢"];
  var COLOURS = ["#ff6b6b", "#ff922b", "#f59f00", "#40c057", "#15aabf", "#4dabf7", "#7950f2", "#e64980"];
  var STICKERS = ["🌟", "🎵", "🎹", "🎻", "🎺", "🥁", "🎷", "🎸", "🌈", "🍩", "🦋", "🚀", "🍉", "🧁", "🐬", "🌻", "🪁", "🍭", "🎈", "🏆", "🐞", "🍀", "🎨", "👑", "🦩", "🍓", "🪐", "🐠", "🎠", "🍦"];
  var hash = function (s) { var h = 0; String(s).split("").forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) >>> 0; }); return h; };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  function day(d) { d = d || new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function prof(id) { var all = json("tr-fam-prof", {}); var h = hash(id); return Object.assign({ a: AVATARS[h % AVATARS.length], c: COLOURS[h % COLOURS.length] }, all[id] || {}); }
  function setProf(id, o) { var all = json("tr-fam-prof", {}); all[id] = Object.assign(prof(id), o); store.set("tr-fam-prof", JSON.stringify(all)); }
  function reward(id) { return Object.assign({ text: "", target: 5 }, json("tr-fam-reward", {})[id] || {}); }
  function setReward(id, o) { var all = json("tr-fam-reward", {}); all[id] = Object.assign(reward(id), o); store.set("tr-fam-reward", JSON.stringify(all)); }
  async function player(lid) { try { return TR.readProgress(await TR.progressFor(lid)).player || {}; } catch (e) { return {}; } }
  function info(p, d) {
    var dd = (p.days || {})[d] || {}, f = (p.fam || {})[d] || {}, pr = (p.prac || {})[d] || {};
    var prac = Object.keys(pr).reduce(function (a, k) { return a + (+pr[k] || 0); }, 0);
    var t = { rev: !!f.rev, gym: !!f.gym, prac: prac >= 10 };
    return { q: dd.q || 0, c: dd.c || 0, prac: prac, tasks: t, done: (t.rev ? 1 : 0) + (t.gym ? 1 : 0) + (t.prac ? 1 : 0), sticker: t.rev && t.gym && t.prac, active: (dd.q || 0) > 0 || prac > 0 };
  }
  function streak(p) { var n = 0, d = new Date(); if (!info(p, day(d)).active) d = addDays(d, -1); while (info(p, day(d)).active) { n++; d = addDays(d, -1); } return n; }
  function stickerDays(p) {
    var ds = {}; Object.keys(p.days || {}).concat(Object.keys(p.fam || {}), Object.keys(p.prac || {})).forEach(function (d) { ds[d] = 1; });
    return Object.keys(ds).sort().filter(function (d) { return info(p, d).sticker; });
  }
  function weekDays() { var now = new Date(), mon = addDays(now, -((now.getDay() + 6) % 7)), out = []; for (var i = 0; i < 7; i++) out.push(day(addDays(mon, i))); return out; }
  function lessonTitle(id) {
    var C = window.TR_CATALOG || {}, L = C.lessons || {}; for (var g in L) for (var i = 0; i < L[g].length; i++) if (L[g][i].id === id) return L[g][i].t + " (Grade " + g + ")";
    var m = /^tr(\d)-(.*)$/.exec(id); if (m) return "Trinity Grade " + m[1] + ": " + m[2].replace(/-/g, " ");
    var a = /^g(\d)-(.*)$/.exec(id); if (a) return "Grade " + a[1] + ": " + a[2].replace(/-/g, " ");
    return id;
  }
  function weekSummary(p) {
    var wk = weekDays(), s = { active: 0, stickers: 0, q: 0, c: 0, prac: 0, mocks: [] };
    wk.forEach(function (d) { var x = info(p, d); if (x.active) s.active++; if (x.sticker) s.stickers++; s.q += x.q; s.c += x.c; s.prac += x.prac; });
    Object.keys(p.mockT || {}).forEach(function (id) { (p.mockT[id] || []).forEach(function (m) { if (wk.indexOf(m.d) >= 0) s.mocks.push({ id: id, pct: Math.round(100 * m.s / m.n), d: m.d }); }); });
    var tl = p.tl || {}, weak = Object.keys(tl).filter(function (id) { return !/^(review|mock|guide|hw)-/.test(id) && tl[id].a >= 4; }).map(function (id) { return { id: id, acc: tl[id].c / tl[id].a }; }).sort(function (a, b) { return a.acc - b.acc; });
    s.weak = weak.slice(0, 2).filter(function (w) { return w.acc < .8; });
    s.starred = Object.keys(tl).filter(function (id) { return (tl[id].stars || 0) >= 1 && !/^(review|mock|guide)-/.test(id); }).length;
    s.miss = Object.values(p.missN || {}).reduce(function (a, b) { return a + b; }, 0);
    s.scales = Object.values(p.scl || {}).filter(function (r) { return r.h && r.h.length >= 2 && r.h.slice(-2).every(function (v) { return v >= 1; }); }).length;
    s.plan = p.plan || null; s.xp = p.xp || 0;
    s.auralMocks = Object.keys(p.mocks || {}).map(function (g) { return "Grade " + g + ": " + Math.round(100 * p.mocks[g].best) + "%"; });
    return s;
  }
  function link(lid, q) { return "rooms/aural.html?learner=" + encodeURIComponent(lid) + "&" + q; }
  var TASKS = [
    { k: "rev", icon: "📝", t: "Theory warm-up", d: "Today's review: 10 questions", q: "tab=theory&lesson=review-today", col: "#7950f2" },
    { k: "gym", icon: "👂", t: "Ear Gym", d: "5 minutes of listening games", q: "tab=gym", col: "#15aabf" },
    { k: "prac", icon: "🎶", t: "Play your instrument", d: "10 minutes, then log it in the diary", q: "tab=prac&mode=diary", col: "#f76707" }
  ];

  var FACTS = [
    "A piano has 88 keys: 52 white and 36 black.", "“Piano” is short for “pianoforte”, Italian for soft-loud, because it can play both.",
    "Mozart was writing his own little pieces when he was about five.", "Beethoven kept composing after he became deaf. He could hardly hear at all when he finished his Ninth Symphony.",
    "A violin has four strings: G, D, A and E.", "Flutes made from bird bone more than 35,000 years old have been found: some of the oldest instruments we know.",
    "Johann Sebastian Bach had 20 children, and several became composers.", "Before a concert the orchestra tunes to the note A, usually played by the oboe.",
    "The tuba is the lowest brass instrument in the orchestra.", "“Piccolo” means small in Italian. It's the highest woodwind instrument in the orchestra.",
    "Vivaldi's The Four Seasons is four violin concertos, one for each season.", "The Dance of the Sugar Plum Fairy in The Nutcracker uses the celesta, which sounds like tiny bells.",
    "Handel wrote Messiah in about three and a half weeks.", "Clara Schumann was one of the most famous pianists of her time, and a composer too.",
    "The treble clef is also called the G clef: it curls round the line for G.", "♩ = 60 means one beat every second.",
    "A concert harp has about 47 strings. The C strings are coloured red so the harpist can find their place.", "The double bass is the biggest and lowest member of the string family.",
    "The saxophone was invented by Adolphe Sax in the 1840s.", "Haydn wrote 104 symphonies. He's often called the Father of the Symphony.",
    "Chopin wrote nearly all his music for the piano.", "“Orchestra” comes from ancient Greek: it was the space in front of the stage where the chorus danced.",
    "Timpani can be tuned to different notes with a foot pedal.", "A trumpet has just three valves. Players change notes with the valves and by how they buzz their lips.",
    "The A above middle C vibrates 440 times a second.", "The same letter name comes back every eight notes: that distance is an octave.",
    "In Saint-Saëns's The Carnival of the Animals you can hear lions, elephants, kangaroos and a swan.", "In Prokofiev's Peter and the Wolf, the bird is the flute, the duck is the oboe and the cat is the clarinet.",
    "Some violins made by Antonio Stradivari more than 300 years ago are still played today.", "A conductor's stick is called a baton.",
    "“A cappella” means singing without instruments.", "Debussy's Clair de lune means moonlight.",
    "Fanny Mendelssohn, Felix's sister, wrote more than 450 pieces of music.", "A guitar's six strings are tuned E A D G B E.",
    "Brass players make their sound by buzzing their lips into a mouthpiece.", "The oboe and bassoon use a double reed; the clarinet and saxophone use a single reed.",
    "The flute has no reed at all: you blow across a hole, like blowing across a bottle.", "A pentatonic scale has just five notes. Try the black keys of a piano: that's one.",
    "Large church organs can have thousands of pipes.", "Practising slowly really is the quickest way to learn a hard passage.",
    "The cello is played sitting down, with its spike resting on the floor.", "The word “tempo” is Italian for time.",
    "A string quartet is two violins, a viola and a cello."
  ];
  var dayIndex = function (n) { var d = new Date(); return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5)) % n; };
  function factToday() { return FACTS[dayIndex(FACTS.length)]; }
  function wordToday() { var T = window.HANDBOOK_TERMS || {}, all = (T.abrsm || []).concat(T.trinity || []).filter(function (t) { return t[0] && t[1] && t[0].length < 28; }); if (!all.length) return null; var t = all[(dayIndex(all.length) * 7919) % all.length]; return { t: t[0], m: t[1] }; }
  function allDays(p) { var ds = {}; Object.keys(p.days || {}).concat(Object.keys(p.fam || {}), Object.keys(p.prac || {})).forEach(function (d) { ds[d] = 1; }); return Object.keys(ds).sort(); }
  function longestStreak(p) { var best = 0, run = 0, prev = null; allDays(p).filter(function (d) { return info(p, d).active; }).forEach(function (d) { if (prev && day(addDays(new Date(prev + "T12:00:00"), 1)) === d) run++; else run = 1; best = Math.max(best, run); prev = d; }); return best; }
  function totalPrac(p) { return allDays(p).reduce(function (a, d) { return a + info(p, d).prac; }, 0); }
  function fullWeek(p) { var st = stickerDays(p); return st.some(function (d) { var s0 = new Date(d + "T12:00:00"); for (var i = 1; i < 7; i++) if (st.indexOf(day(addDays(s0, i))) < 0) return false; return true; }); }
  function trophies(p) {
    var st = stickerDays(p).length, ls = longestStreak(p), q = (p.total || {}).a || 0, pm = totalPrac(p), mocks = Object.keys(p.mockT || {}).length + Object.keys(p.mocks || {}).length;
    var scales = Object.values(p.scl || {}).filter(function (r) { return r.h && r.h.length >= 2 && r.h.slice(-2).every(function (v) { return v >= 1; }); }).length;
    return [
      ["🌟", "First sticker", "Do all three tasks in a day", st >= 1], ["🎖️", "Five stickers", "Five full days", st >= 5], ["🏅", "Ten stickers", "Ten full days", st >= 10], ["🏆", "Sticker champion", "25 full days", st >= 25],
      ["🔥", "On a roll", "Practise 3 days in a row", ls >= 3], ["⚡", "Week warrior", "Practise 7 days in a row", ls >= 7], ["🚀", "Unstoppable", "Practise 30 days in a row", ls >= 30], ["🗓️", "Perfect week", "A sticker every day for a week", fullWeek(p)],
      ["🧠", "Hundred club", "Answer 100 questions", q >= 100], ["🎓", "Question master", "Answer 1,000 questions", q >= 1000],
      ["⏱️", "First hour", "60 minutes on your instrument", pm >= 60], ["🎻", "Practice hero", "10 hours on your instrument", pm >= 600],
      ["📝", "Brave tester", "Try a mock exam", mocks >= 1], ["🎹", "Scale star", "Five scales secure", scales >= 5]
    ];
  }

  return { FACTS: FACTS, factToday: factToday, wordToday: wordToday, trophies: trophies, longestStreak: longestStreak, totalPrac: totalPrac, dayIndex: dayIndex, AVATARS: AVATARS, COLOURS: COLOURS, STICKERS: STICKERS, TASKS: TASKS, esc: esc, day: day, addDays: addDays, prof: prof, setProf: setProf, reward: reward, setReward: setReward,
    player: player, info: info, streak: streak, stickerDays: stickerDays, weekDays: weekDays, lessonTitle: lessonTitle, weekSummary: weekSummary, link: link };
})();
