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
  return { AVATARS: AVATARS, COLOURS: COLOURS, STICKERS: STICKERS, TASKS: TASKS, esc: esc, day: day, addDays: addDays, prof: prof, setProf: setProf, reward: reward, setReward: setReward,
    player: player, info: info, streak: streak, stickerDays: stickerDays, weekDays: weekDays, lessonTitle: lessonTitle, weekSummary: weekSummary, link: link };
})();
