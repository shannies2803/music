/* The Theory Room: a drill on the playing directions written in instrument parts (pizz., con sord., col legno…),
   made from the Instruments room's data, so the two always agree. Loaded after instruments.js and instruments-more.js. */
(function () {
  "use strict";
  if (typeof TGEN === "undefined" || !window.INSTRUMENTS || !window.INSTRUMENTS_MORE) return;
  var MORE = window.INSTRUMENTS_MORE, INST = window.INSTRUMENTS;
  var ALL = []; INST.forEach(function (x) { (MORE[x.id] ? MORE[x.id].tech : []).forEach(function (t) { ALL.push({ inst: x, t: t[0], m: t[1] }); }); });
  TGEN.instDir = function (p) {
    var pool = ALL.filter(function (e) { return !p.families || p.families.indexOf(e.inst.family) >= 0; });
    var e = pick(pool), others = [];
    shuffle(ALL).forEach(function (o) { if (others.length < 3 && o.m !== e.m && others.indexOf(o.m) < 0) others.push(o.m); });
    if (Math.random() < .3) {
      var wrongT = []; shuffle(ALL).forEach(function (o) { if (wrongT.length < 3 && o.t !== e.t && o.m !== e.m && wrongT.indexOf(o.t) < 0) wrongT.push(o.t); });
      return { prompt: "Which direction in a " + e.inst.name.toLowerCase() + " part means “" + e.m + "”?", options: shuffle([e.t].concat(wrongT)).map(function (x) { return opt(x, "<i>" + esc(x) + "</i>"); }), answer: e.t,
        explain: "<i>" + esc(e.t) + "</i> = " + esc(e.m) + ". You'll find more " + esc(e.inst.name.toLowerCase()) + " directions in the Instruments room." };
    }
    return { prompt: "In a " + e.inst.name.toLowerCase() + " part, what does “" + e.t + "” mean?", options: shuffle([e.m].concat(others)).map(function (x) { return opt(x); }), answer: e.m,
      explain: "<i>" + esc(e.t) + "</i> = <b>" + esc(e.m) + "</b>." };
  };
  var H = "<p>Instrument parts are full of short directions: <i>pizz.</i> (pluck), <i>arco</i> (with the bow), <i>con sord.</i> (with a mute), <i>sul ponticello</i> (bow near the bridge), a + over a horn note (stopped). Theory papers ask what they mean, and score questions often hang on them.</p><p>Every instrument's full list is in the Instruments room: open it from My rooms.</p>";
  var NEW = [
    { id: "g5-directions", g: 5, topic: "Instruments", t: "Playing directions for instruments", gen: "instDir", p: {}, h: H },
    { id: "g6-directions", g: 6, topic: "Score reading", t: "Directions in orchestral parts", gen: "instDir", p: { families: ["Strings", "Brass", "Woodwind", "Percussion"] }, h: H }
  ];
  NEW.forEach(function (l) { if (LESSON_BY[l.id]) return; var last = LESSONS.map(function (x) { return x.g; }).lastIndexOf(l.g); LESSONS.splice(last + 1, 0, l); LESSON_BY[l.id] = l; });
  if (window.TRINITY_LESSONS) {
    var tl = { id: "tr6-directions", g: 6, board: "trinity", topic: "Terms & signs", t: "Playing directions for instruments", gen: "instDir", p: {}, h: H };
    if (!LESSON_BY[tl.id]) { var at = window.TRINITY_LESSONS.map(function (x) { return x.g; }).lastIndexOf(6); window.TRINITY_LESSONS.splice(at, 0, tl); LESSON_BY[tl.id] = tl; }
  }
})();
