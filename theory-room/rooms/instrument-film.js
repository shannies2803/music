/* The Instruments room: a one-minute film for each instrument, drawn on a canvas, with its own sound.
   Same shape as the composer films. Add ?studio=1 to the address to record a 16:9 or 9:16 video file.
   Loaded before the page script; the page calls INSTRUMENT_FILM.mount(instrument) each time it shows one. */
(function () {
  "use strict";
  var studio = /studio/.test(location.search + location.hash);
  var COL = {
    Strings: { bg: "#2a1a14", ink: "#f6ead9", accent: "#e8a75c" }, Woodwind: { bg: "#12281f", ink: "#e9f6ef", accent: "#8fd6a8" },
    Brass: { bg: "#2b2410", ink: "#fbf3dc", accent: "#f2c14e" }, Keyboard: { bg: "#1b2443", ink: "#eef1fb", accent: "#a9b8ff" },
    Percussion: { bg: "#301818", ink: "#fbe9e9", accent: "#f29a8a" }, Voice: { bg: "#26193a", ink: "#f3ecfb", accent: "#c9a6ff" }
  };
  var R, inst, scenes = [], total = 0, cv, g, W = 1280, H = 720, mode = "land";
  var playing = false, startAt = 0, offset = 0, lastScene = -1, raf = 0, rec = null, recDest = null, notes = [];
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  function build(x) {
    var s = R.stats[x.id], lo = R.parse(x.low), hi = R.parse(x.high);
    notes = R.rangeMidis(x);
    var rangeSay = "Its written range runs from " + R.nameOf(lo) + " to " + R.nameOf(hi) + ". " + R.transposeText(x);
    scenes = [
      { id: "title", label: "Who", dur: 4.5, say: "The " + x.name.toLowerCase() + ". " + x.family + "." },
      { id: "how", label: "How it sounds", dur: 8, say: x.how + (x.strings ? " " + x.strings : "") },
      { id: "range", label: "Range", dur: notes.length * .5 + 3.6, say: rangeSay },
      { id: "fact", k: 0, label: "Fact 1", dur: 5.5, say: x.facts[0] }, { id: "fact", k: 1, label: "Fact 2", dur: 5.5, say: x.facts[1] }, { id: "fact", k: 2, label: "Fact 3", dur: 5.5, say: x.facts[2] },
      { id: "famous", label: "Famous music", dur: 6, say: "Famous music: " + x.famous.join(", ") + "." },
      { id: "exams", label: "In the exams", dur: 7, say: s ? "The " + x.name.toLowerCase() + " has " + s.n + " pieces on the ABRSM and Trinity lists, from " + s.lo + " to " + s.hi + "." : "" },
      { id: "quiz", label: "Quiz", dur: 9, say: x.quiz.q + " " + x.quiz.options.join(", or ") + "?" },
      { id: "end", label: "End", dur: 4.5, say: "Meet more instruments in the Theory Room." }
    ];
    var t = 0; scenes.forEach(function (sc) { sc.t0 = t; t += sc.dur; }); total = t;
  }

  /* ---------- drawing ---------- */
  var U = function () { return mode === "land" ? 1 : 1.18; }, PAD = function () { return mode === "land" ? 96 : 84; };
  function size() { W = mode === "land" ? 1280 : 1080; H = mode === "land" ? 720 : 1920; cv.width = W; cv.height = H; cv.parentNode.classList.toggle("portrait", mode !== "land"); }
  function font(px, w, fam) { g.font = (w || 400) + " " + Math.round(px * U()) + "px " + (fam === "mono" ? "'IBM Plex Mono', monospace" : fam === "body" ? "'Atkinson Hyperlegible', sans-serif" : "'Bricolage Grotesque', sans-serif"); }
  function wrap(str, maxW) { var words = String(str).split(" "), lines = [], line = ""; words.forEach(function (w) { var t = line ? line + " " + w : w; if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }); if (line) lines.push(line); return lines; }
  function text(str, x, y, max) { var lh = parseInt(g.font.match(/(\d+)px/)[1], 10) * 1.22, ls = wrap(str, max || (W - 2 * PAD())); ls.forEach(function (l, i) { g.fillText(l, x, y + i * lh); }); return y + ls.length * lh; }
  function ease(x) { x = Math.max(0, Math.min(1, x)); return 1 - Math.pow(1 - x, 3); }
  function fadeIn(lt, d) { var a = ease((lt - (d || 0)) / .6); g.globalAlpha = a; return (1 - a) * 18; }
  function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function kicker(s, y, c) { font(20, 500, "mono"); g.fillStyle = c.accent; g.fillText(s.toUpperCase(), PAD(), y); }
  function sceneAt(t) { for (var i = scenes.length - 1; i >= 0; i--) if (t >= scenes[i].t0) return i; return 0; }
  function backdrop(t, c) {
    g.save(); g.globalAlpha = .12; g.strokeStyle = c.ink; g.lineWidth = 2;
    var top = H * (mode === "land" ? .855 : .9), gap = mode === "land" ? 12 : 16, drift = (t * 18) % 400;
    for (var i = 0; i < 5; i++) { g.beginPath(); g.moveTo(0, top + i * gap); g.lineTo(W, top + i * gap); g.stroke(); }
    g.fillStyle = c.ink; for (var k = -1; k < 8; k++) { var x = k * 200 - drift + 100, y = top + ((k * 37) % 5) * gap / 2; g.beginPath(); g.ellipse(x, y, 11, 8, -.35, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  function draw(t) {
    var x0 = inst, c = COL[x0.family] || COL.Strings, i = sceneAt(t), sc = scenes[i], lt = t - sc.t0, s = R.stats[x0.id];
    var land = mode === "land", x = PAD(), maxW = W - 2 * PAD(), dy;
    g.globalAlpha = 1; g.fillStyle = c.bg; g.fillRect(0, 0, W, H); backdrop(t, c);
    g.textBaseline = "alphabetic"; g.textAlign = "left"; g.fillStyle = c.ink; g.save(); if (!land) g.translate(0, 200);
    if (sc.id === "title") {
      dy = fadeIn(lt, 0); kicker("The Theory Room · Instruments", (land ? 160 : 430) + dy, c);
      dy = fadeIn(lt, .3); g.fillStyle = c.ink; font(land ? 120 : 130, 700); var ye = text(x0.name, x, (land ? 300 : 640) + dy, maxW);
      dy = fadeIn(lt, .9); font(24, 500, "mono"); var fam = x0.family.toUpperCase(), fw = g.measureText(fam).width + 36;
      g.strokeStyle = c.accent; g.lineWidth = 2; rr(x, ye + 10 + dy, fw, 48 * U(), 24 * U()); g.stroke(); g.fillStyle = c.accent; g.fillText(fam, x + 18, ye + 10 + 33 * U() + dy);
    }
    if (sc.id === "how") {
      dy = fadeIn(lt, 0); kicker("How it makes its sound", (land ? 130 : 400) + dy, c);
      dy = fadeIn(lt, .3); g.fillStyle = c.ink; font(land ? 44 : 52, 650); var hy = text(x0.how, x, (land ? 220 : 520) + dy, maxW);
      if (x0.strings) { dy = fadeIn(lt, 1.6); font(land ? 32 : 40, 400, "body"); text(x0.strings, x, hy + 30 + dy, maxW); }
    }
    if (sc.id === "range") {
      dy = fadeIn(lt, 0); kicker("Hear the range", (land ? 110 : 330) + dy, c);
      var lo = R.parse(x0.low), hi = R.parse(x0.high);
      g.fillStyle = c.ink; font(land ? 40 : 46, 650); var ty = text(R.nameOf(lo) + " to " + R.nameOf(hi) + " (written)", x, (land ? 170 : 420) + dy, maxW);
      var rx = x, ry = Math.max(ty + 10, land ? 230 : 540), rw = maxW, rh = land ? 250 : 560, lom = notes[0], him = notes[notes.length - 1], span = Math.max(12, him - lom + 4);
      var step = .5, nowI = (lt - .8) / step;
      g.globalAlpha = ease(lt / .6) * .25; g.strokeStyle = c.ink; g.lineWidth = 1;
      for (var k = 0; k < 5; k++) { var sy = ry + rh * (k + 1) / 6; g.beginPath(); g.moveTo(rx, sy); g.lineTo(rx + rw, sy); g.stroke(); }
      notes.forEach(function (m, j) {
        var nx = rx + j / notes.length * rw, nw = rw / notes.length - 10, ny = ry + rh - (m - lom + 2) / span * rh, on = nowI >= j && nowI < j + 1, past = nowI >= j + 1;
        g.globalAlpha = ease(lt / .6) * (on ? 1 : past ? .6 : .3); g.fillStyle = on || past ? c.accent : c.ink; rr(nx, ny - 8 * U(), nw, 16 * U(), 8 * U()); g.fill();
        if (on) { font(22, 500, "mono"); g.globalAlpha = 1; g.fillText(R.nameOf(R.spell(m)), nx, ny - 18 * U()); }
      });
      dy = fadeIn(lt, 1.2); g.fillStyle = c.ink; font(land ? 28 : 36, 400, "body");
      text("Reads the " + x0.clefs.join(" and ") + " clef" + (x0.clefs.length > 1 ? "s" : "") + ". " + R.transposeText(x0), x, ry + rh + (land ? 56 : 110) + dy, maxW);
    }
    if (sc.id === "fact") {
      dy = fadeIn(lt, 0); kicker("Three things to know", (land ? 130 : 420) + dy, c);
      font(land ? 120 : 150, 700); g.fillStyle = c.accent; g.fillText((sc.k + 1) + "/3", x, (land ? 270 : 640) + dy);
      dy = fadeIn(lt, .4); g.fillStyle = c.ink; font(land ? 48 : 58, 650); text(x0.facts[sc.k], x, (land ? 380 : 820) + dy, maxW);
    }
    if (sc.id === "famous") {
      dy = fadeIn(lt, 0); kicker("Famous music", (land ? 140 : 440) + dy, c);
      x0.famous.forEach(function (p, k) { dy = fadeIn(lt, .4 + k * .7); var yy = (land ? 250 : 620) + k * (land ? 110 : 190) + dy; g.fillStyle = c.accent; g.fillRect(x, yy - 34 * U(), 10, 44 * U()); g.fillStyle = c.ink; font(land ? 46 : 56, 650); text(p, x + 34, yy, maxW - 34); });
    }
    if (sc.id === "exams" && s) {
      dy = fadeIn(lt, 0); kicker("In the exams", (land ? 120 : 400) + dy, c);
      g.fillStyle = c.accent; font(land ? 150 : 190, 700); g.fillText(Math.round(s.n * ease((lt - .2) / 1.4)).toLocaleString(), x, (land ? 270 : 640) + dy);
      g.fillStyle = c.ink; font(land ? 34 : 40, 400, "body"); var ey = text("pieces on the ABRSM and Trinity lists", x, (land ? 330 : 730) + dy, maxW);
      dy = fadeIn(lt, 1.6); font(land ? 26 : 32, 500, "mono"); ey = text("ABRSM " + s.abrsm + " · Trinity " + s.trinity + " · " + s.lo + " to " + s.hi, x, ey + 30 + dy, maxW);
      if (s.top && s.top.length) { dy = fadeIn(lt, 2.6); g.fillStyle = c.ink; font(land ? 28 : 34, 400, "body"); text("You'll often meet: " + s.top.slice(0, 3).join(", "), x, ey + 30 + dy, maxW); }
    }
    if (sc.id === "quiz") {
      dy = fadeIn(lt, 0); kicker("Quick quiz", (land ? 110 : 380) + dy, c);
      g.fillStyle = c.ink; font(land ? 44 : 54, 650); var qy = text(x0.quiz.q, x, (land ? 180 : 500) + dy, maxW), reveal = lt > 6;
      x0.quiz.options.forEach(function (o, k) {
        dy = fadeIn(lt, .5 + k * .4); var bh = 76 * U(), yy = qy + 30 + k * (bh + 18), right = k === x0.quiz.answer;
        g.lineWidth = 3; g.strokeStyle = reveal && right ? c.accent : c.ink; g.globalAlpha *= reveal && !right ? .35 : 1; rr(x, yy + dy, maxW, bh, 16); g.stroke();
        if (reveal && right) { g.fillStyle = c.accent; g.globalAlpha = .18; g.fill(); g.globalAlpha = 1; }
        g.fillStyle = reveal && right ? c.accent : c.ink; font(land ? 32 : 38, reveal && right ? 700 : 400, "body"); g.fillText(String.fromCharCode(65 + k) + "   " + o + (reveal && right ? "   ✓" : ""), x + 28, yy + bh * .64 + dy);
      });
      if (!reveal) { g.globalAlpha = .7; g.fillStyle = c.ink; font(24, 500, "mono"); g.fillText("ANSWER IN " + Math.ceil(6 - lt), x, H - (land ? 40 : 380)); }
    }
    if (sc.id === "end") {
      dy = fadeIn(lt, 0); g.fillStyle = c.ink; font(land ? 76 : 88, 700); g.fillText("The Theory Room", x, (land ? 300 : 820) + dy);
      dy = fadeIn(lt, .5); font(land ? 34 : 40, 400, "body"); text("Meet more instruments in Room 5, and find every " + x0.name.toLowerCase() + " exam piece in Room 3.", x, (land ? 380 : 940) + dy, maxW);
      dy = fadeIn(lt, 1); font(24, 500, "mono"); g.fillStyle = c.accent; g.fillText("INSTRUMENT FILMS · SEASON 1", x, (land ? 500 : 1160) + dy);
    }
    g.restore(); g.globalAlpha = 1;
    if (!x0.checked) { font(18, 500, "mono"); g.fillStyle = c.ink; g.globalAlpha = .55; g.textAlign = "right"; g.fillText("DRAFT · NOT YET CHECKED", W - 24, 36); g.textAlign = "left"; g.globalAlpha = 1; }
    g.fillStyle = c.accent; g.globalAlpha = .9; g.fillRect(0, H - 6, W * Math.min(1, t / total), 6); g.globalAlpha = 1;
  }

  /* ---------- playing ---------- */
  function say(str) {
    var box = document.getElementById("ifNarrate"); if (!box || !box.checked || !str || !window.speechSynthesis) return;
    try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(str), v = speechSynthesis.getVoices().filter(function (v) { return /^en(-|_)(GB|SG|AU|US)/i.test(v.lang); })[0]; if (v) u.voice = v; u.rate = .98; speechSynthesis.speak(u); } catch (e) {}
  }
  function playRange(delay) { var ctx = R.audio(), t0 = ctx.currentTime + Math.max(0, delay); notes.forEach(function (m, j) { R.tone(inst, m, t0 + j * .5, .47); }); }
  function now() { return playing ? (performance.now() - startAt) / 1000 + offset : offset; }
  function tick() {
    var t = now(); if (t >= total) { t = total - .001; stop(true); }
    var i = sceneAt(t);
    if (i !== lastScene) { lastScene = i; mark(i); if (playing) { say(scenes[i].say); if (scenes[i].id === "range" && t - scenes[i].t0 < .8) playRange(.8 - (t - scenes[i].t0)); } }
    draw(t); if (playing) raf = requestAnimationFrame(tick);
  }
  function start() { R.audio(); playing = true; startAt = performance.now(); lastScene = -1; label(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
  function stop(ended) {
    offset = ended ? 0 : now(); playing = false; R.hush(); try { speechSynthesis.cancel(); } catch (e) {} label(); cancelAnimationFrame(raf);
    if (ended) { offset = total - .001; draw(offset); offset = 0; lastScene = -1; if (rec) rec.stop(); }
  }
  function seek(t) { var was = playing; if (playing) stop(); offset = t; lastScene = -1; if (was) start(); else { mark(sceneAt(t)); draw(t); } }
  function label() { var b = document.getElementById("ifPlay"); if (b) b.textContent = playing ? "❚❚ Pause" : "▶ Watch the film"; }
  function mark(i) { document.querySelectorAll("#ifScenes button").forEach(function (b, k) { b.setAttribute("aria-current", String(k === i)); }); }

  function record(m) {
    var msg = function (h) { var el = document.getElementById("ifStudio"); if (el) el.innerHTML = h; };
    if (!window.MediaRecorder || !cv.captureStream) { msg("This browser can't record video. Try Chrome on a computer."); return; }
    if (playing) stop(); mode = m; size(); seek(0);
    var ctx = R.audio(); if (!recDest) { recDest = ctx.createMediaStreamDestination(); R.master().connect(recDest); }
    var stream = new MediaStream(cv.captureStream(30).getVideoTracks().concat(recDest.stream.getAudioTracks()));
    var type = ["video/mp4;codecs=avc1,mp4a", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"].filter(function (t) { return MediaRecorder.isTypeSupported(t); })[0];
    var chunks = []; rec = new MediaRecorder(stream, type ? { mimeType: type, videoBitsPerSecond: 6e6 } : undefined);
    rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
    rec.onstop = function () { var blob = new Blob(chunks, { type: rec.mimeType || "video/webm" }), ext = /mp4/.test(blob.type) ? "mp4" : "webm"; msg('Ready: <a href="' + URL.createObjectURL(blob) + '" download="' + inst.id + "-" + (m === "land" ? "16x9" : "9x16") + "." + ext + '">Download the video (' + ext + ")</a>. Add your own voice-over in any video app."); rec = null; };
    rec.start(500); msg("Recording… keep this tab open until the film ends (" + Math.round(total) + " seconds)."); start();
  }

  window.INSTRUMENT_FILM = {
    mount: function (x) {
      R = window.INSTRUMENTS_ROOM; if (!R) return;
      if (playing) stop(); inst = x; offset = 0; lastScene = -1; build(x);
      var box = document.getElementById("film"); if (!box) return;
      box.innerHTML = '<div style="display:grid;gap:10px"><div class="screen" id="ifScreen" style="position:relative;width:100%;aspect-ratio:16/9;background:#111;border-radius:var(--radius);overflow:hidden"><canvas id="ifCv" width="1280" height="720" style="width:100%;height:100%;display:block;cursor:pointer" aria-label="' + esc(x.name) + ' film"></canvas></div>' +
        '<div class="playrow" style="align-items:center"><button class="btn go small" id="ifPlay" type="button">▶ Watch the film</button><button class="btn small" id="ifRestart" type="button">Start again</button><label class="row" style="gap:6px;font-size:15px"><input type="checkbox" id="ifNarrate"> Read it aloud</label></div>' +
        '<div class="chips" id="ifScenes" role="group" aria-label="Jump to part">' + scenes.map(function (sc, i) { return '<button type="button" data-ifs="' + i + '" style="min-height:34px;font-size:13px">' + esc(sc.label) + "</button>"; }).join("") + "</div>" +
        (studio ? '<div style="border:1px dashed var(--brass);border-radius:var(--radius);padding:12px 14px;display:grid;gap:8px"><b>Studio: make a video for social media</b><div class="playrow"><button class="btn small" type="button" data-ifrec="land">Record 16:9 (YouTube)</button><button class="btn small" type="button" data-ifrec="port">Record 9:16 (Shorts, Reels, TikTok)</button></div><div id="ifStudio" class="muted"></div></div>' : "") + "</div>";
      cv = document.getElementById("ifCv"); g = cv.getContext("2d"); mode = "land"; size();
      document.getElementById("ifScreen").classList.remove("portrait");
      draw(0); mark(0);
      document.getElementById("ifPlay").onclick = function () { if (playing) stop(); else start(); };
      document.getElementById("ifRestart").onclick = function () { seek(0); if (!playing) start(); };
      cv.onclick = function () { if (playing) stop(); else start(); };
      document.getElementById("ifScenes").onclick = function (e) { var b = e.target.closest("[data-ifs]"); if (b) seek(scenes[+b.dataset.ifs].t0); };
      box.querySelectorAll("[data-ifrec]").forEach(function (b) { b.onclick = function () { record(b.dataset.ifrec); }; });
    },
    _state: function () { return { scenes: scenes.length, total: total, playing: playing }; }
  };
  var css = document.createElement("style"); css.textContent = "#ifScreen.portrait{aspect-ratio:9/16!important;max-width:420px;margin-inline:auto}#ifScenes button[aria-current=true]{border-color:var(--accent);background:var(--accent-soft);font-weight:700}";
  document.head.appendChild(css);
  if (document.fonts && document.fonts.load) Promise.all(["700 40px 'Bricolage Grotesque'", "650 40px 'Bricolage Grotesque'", "400 30px 'Atkinson Hyperlegible'", "500 20px 'IBM Plex Mono'"].map(function (f) { return document.fonts.load(f); }))
    .then(function () { if (inst && !playing && g) draw(offset); }).catch(function () {});
})();
