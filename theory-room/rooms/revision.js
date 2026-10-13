/* The Theory Room: revision tools on the Theory and Progress tabs.
   1. Mock answer review: after a timed mock, go through every question with your answer, the right
      answer and why.
   2. Mistakes notebook: every theory question you get wrong is noted, and "Fix my mistakes" brings
      back questions on those topics until you've put them right.
   3. Today's review: ten questions picked from the lessons you've done, weighted towards the ones
      you find hardest and the ones you haven't seen for a while (spaced revision).
   4. Exam countdown plan: pick a board, grade and exam date, and get a week-by-week plan through the
      grade's lessons, then mocks and review in the final weeks. It ticks itself off as you go.
   5. Revision book: every lesson for a grade in one printable booklet, with a worked example each.
   6. Exam readiness on the Progress tab: for each grade, lessons starred, accuracy, best mock and a
      readiness verdict, plus practical-exam progress and your next three steps.
   Loaded after mockpapers.js. */
(function () {
  "use strict";
  if (typeof TGEN === "undefined" || typeof LESSON_BY === "undefined") return;
  const strip = h => String(h == null ? "" : h).replace(/<svg[\s\S]*?<\/svg>/g, " [music] ").replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
  const real = l => l && !/mixed$|^c[78]-|^mock-|^review-|^hw-|^guide-/.test(l.id) && l.gen !== "rread" && l.gen !== "topicmix" && l.gen !== "mix" && l.gen !== "mockmix" && l.gen !== "revmix" && !l.mock;
  const boardOf = l => l.board === "trinity" ? "trinity" : "abrsm";
  const lessonsOf = (board, g) => (board === "trinity" ? (window.TRINITY_LESSONS || []) : LESSONS.filter(l => !l.board)).filter(l => l.g === g && real(l));
  const can = g => !window.TR || TR.can("theory", g);
  const day = s => new Date(s + "T12:00:00");
  const daysBetween = (a, b) => Math.round((day(b) - day(a)) / 864e5);
  const addDays = (s, n) => { const d = day(s); d.setDate(d.getDate() + n); return todayStr(d); };
  const BOARD = b => b === "trinity" ? "Trinity" : "ABRSM";

  /* ---------- question sources for the review rounds ---------- */
  function dueList(p) {
    const T = todayStr(), out = [];
    Object.keys(p.tl || {}).forEach(id => {
      const l = LESSON_BY[id], t = p.tl[id]; if (!real(l) || !t.a || !can(l.g)) return;
      const acc = t.c / t.a, ago = t.last ? Math.min(21, daysBetween(t.last, T)) : 7;
      out.push({ id, w: (1 - acc) * 2 + ago / 7 + ((t.stars || 0) < 2 ? .5 : 0) + .1, acc, ago });
    });
    return out.sort((a, b) => b.w - a.w);
  }
  function missList(p) { const m = p.missN || {}; return Object.keys(m).filter(id => m[id] > 0 && real(LESSON_BY[id]) && can(LESSON_BY[id].g)).map(id => ({ id, w: m[id] })).sort((a, b) => b.w - a.w); }
  function weighted(list) { let x = Math.random() * list.reduce((a, b) => a + b.w, 0); for (const it of list) { x -= it.w; if (x <= 0) return it.id; } return list[0].id; }
  TGEN.revmix = function (prm) {
    const p = P(), R = VIEW.round;
    let list = prm.kind === "miss" ? missList(p) : []; if (!list.length) list = dueList(p).slice(0, 12);
    if (!list.length) { const g = p.plan ? p.plan.g : 1, b = p.plan ? p.plan.board : (p.theoryBoard === "trinity" ? "trinity" : "abrsm"); list = lessonsOf(b, g).filter(l => can(l.g)).map(l => ({ id: l.id, w: 1 })); }
    if (R && R.mockFrom && R.i > 0 && list.length > 2) { const prev = R.mockFrom[R.i - 1]; list = list.filter(x => x.id !== prev); }
    const id = weighted(list), l = LESSON_BY[id];
    const q = TGEN[l.gen](l.p, Math.max(.35, (p.tl[id] || {}).diff || .5));
    if (R) { R.mockFrom = R.mockFrom || []; R.mockFrom[R.i] = id; }
    q.prompt = '<span class="muted" style="font-size:.85em">' + (l.board === "trinity" ? "Trinity " : "") + "Grade " + l.g + " · " + esc(l.t) + "</span><br>" + q.prompt;
    return q;
  };
  const mk = (id, t, kind, h) => { LESSON_BY[id] = { id, g: 0, topic: "Revision", t, gen: "revmix", p: { kind }, n: 10, review: true }; Object.defineProperty(LESSON_BY[id], "h", { get: h }); };
  mk("review-today", "Today's review", "today", () => {
    const p = P(), d = dueList(p).slice(0, 8);
    return "<p>Ten questions from the lessons you've already done. The ones you find hardest, and the ones you haven't practised for a while, come up most. A few minutes of this each day keeps everything fresh for the exam.</p>" +
      (d.length ? "<p><b>Coming up most today:</b></p><ul>" + d.map(x => { const l = LESSON_BY[x.id]; return "<li>" + (l.board === "trinity" ? "Trinity " : "") + "Grade " + l.g + ": " + esc(l.t) + ' <span class="muted">(' + Math.round(100 * x.acc) + "%" + (x.ago >= 2 ? ", " + x.ago + " days ago" : "") + ")</span></li>"; }).join("") + "</ul>"
        : '<p class="muted">You haven\'t done any lessons yet, so this starts with your current grade.</p>');
  });
  mk("review-miss", "Fix my mistakes", "miss", () => {
    const p = P(), m = missList(p), notes = (p.miss || []).slice().reverse().slice(0, 25);
    return "<p>Every theory question you get wrong goes into your mistakes notebook. This round brings back new questions on those topics. Each one you get right crosses off one mistake.</p>" +
      (m.length ? '<p><b>Waiting to be fixed:</b> ' + m.map(x => esc(LESSON_BY[x.id].t) + " (" + x.w + ")").join(" · ") + "</p>" : '<p class="muted">Nothing waiting: well done. New mistakes will appear here.</p>') +
      (notes.length ? '<details style="margin-top:8px"><summary style="cursor:pointer;min-height:44px;display:flex;align-items:center;font-weight:700">Mistakes notebook: your last ' + notes.length + '</summary><div style="display:grid;gap:8px;margin-top:6px">' +
        notes.map(n => { const l = LESSON_BY[n.id]; return '<div style="border-left:4px solid var(--rose);padding:6px 10px;background:var(--paper);border-radius:8px"><div class="muted" style="font-size:.8rem">' + esc(n.d) + " · " + (l ? (l.board === "trinity" ? "Trinity " : "") + "Grade " + l.g + " · " + esc(l.t) : "") + "</div><div>" + esc(n.q) + "</div>" + (n.a ? '<div><b>Answer:</b> ' + esc(n.a) + "</div>" : "") + (n.x ? '<div class="muted" style="font-size:.9rem">' + esc(n.x) + "</div>" : "") + "</div>"; }).join("") + "</div></details>" : "");
  });

  /* ---------- hooks: remember answers ---------- */
  const amc0 = answerMC;
  answerMC = function (k) { const R = VIEW.round; if (R && !R.answered) R.lastK = k; return amc0(k); };
  const sf0 = showFeedback;
  showFeedback = function (val, html) {
    const R = VIEW.round, q = R && R.q;
    sf0(val, html);
    if (!R || R.src !== "theory" || !q) return;
    const L = LESSON_BY[R.id], p = P(), pseudo = L && (L.mock || L.review), realId = pseudo ? (R.mockFrom || [])[R.i] : R.id;
    if (L && L.mock) { R.review = R.review || []; R.review[R.i] = { q: q.prompt, v: q.visual || "", o: q.type === "mc" ? q.options : null, a: q.answer, k: R.lastK, x: q.explain || "", val }; }
    if (!real(LESSON_BY[realId])) return;
    if (pseudo) { const t = tl(p, realId); t.a++; t.c += val; t.diff = Math.max(0, Math.min(1, t.diff + (val >= 1 ? .05 : -.08))); t.last = todayStr(); }
    p.missN = p.missN || {};
    if (val < 1) {
      const opt = (q.options || []).find(o => String(o.k) === String(q.answer));
      p.miss = (p.miss || []).concat([{ id: realId, d: todayStr(), q: strip(String(q.prompt).replace(/^<span class="muted"[^>]*>[\s\S]*?<\/span><br>/, "")).slice(0, 200), a: opt ? strip(opt.html).slice(0, 80) : "", x: strip(q.explain).slice(0, 260) }]).slice(-60);
      p.missN[realId] = Math.min(5, (p.missN[realId] || 0) + 1);
    } else if (L && L.review && p.missN[realId] > 0) p.missN[realId]--;
    save();
  };
  const rec0 = record;
  record = function (kind, id, val, meta) { rec0(kind, id, val, meta); if (kind === "t") { const t = P().tl[id]; if (t) t.last = todayStr(); } };
  const sr0 = startRound;
  startRound = function (src, id, level) {
    sr0(src, id, level);
    const l = LESSON_BY[id], R = VIEW.round;
    if (src === "theory" && l && l.review && R) { R.total = l.n; R.mockFrom = []; if (typeof paintRound === "function") paintRound(); }
  };
  const lv0 = lessonView;
  lessonView = function () {
    const h = lv0(), l = LESSON_BY[VIEW.lesson];
    if (!l || !l.review) return h;
    return h.replace(/← Grade 0 lessons/, "← Theory").replace(/Grade 0 · /, "").replace(/Practise \(8 questions\)/, "Start (" + l.n + " questions)").replace(/<button class="btn ghost" data-ws="[^"]*"[^>]*>[^<]*<\/button>/, "");
  };

  /* ---------- mock review on the results page ---------- */
  const sum0 = summaryHTML;
  summaryHTML = function () {
    const h = sum0(), R = VIEW.round, l = R && R.src === "theory" && LESSON_BY[R.id];
    if (!l || !l.mock || !R.review || !R.review.length) return h;
    const wrong = R.review.filter(x => x && x.val < 1).length;
    const items = R.review.map((x, i) => {
      if (!x) return "";
      const opts = x.o ? '<div class="opts" style="margin-top:6px">' + x.o.map(o => { const right = String(o.k) === String(x.a), mine = String(o.k) === String(x.k); return '<div class="opt' + (right ? " right" : mine ? " wrong" : "") + '" style="cursor:default">' + o.html + (right ? " ✓" : mine ? " ✗ your answer" : "") + "</div>"; }).join("") + "</div>" : "";
      return '<div class="rvq" data-ok="' + (x.val >= 1 ? 1 : 0) + '" style="border-top:1px solid var(--line);padding:12px 0"><div class="kicker">Question ' + (i + 1) + (x.val >= 1 ? " · right" : " · " + (x.val > 0 ? "nearly" : "wrong")) + '</div><div class="prompt" style="font-size:1rem">' + x.q + "</div>" + (x.v ? '<div class="notation">' + x.v + "</div>" : "") + opts + (x.x ? '<p class="muted" style="margin:.4em 0 0">' + x.x + "</p>" : "") + "</div>";
    }).join("");
    const box = '<details class="rvbox" style="margin-top:14px"' + (wrong ? "" : "") + '><summary style="cursor:pointer;min-height:44px;display:flex;align-items:center;font-weight:700">Go through every answer (' + wrong + " to learn from)</summary>" +
      '<div class="row" style="margin:6px 0"><button class="btn small ghost" data-rvonly="1">Show only the ones I got wrong</button><button class="btn small ghost" data-rvonly="0">Show all</button></div>' + items + "</details>";
    const at = h.lastIndexOf('<div class="row" style="margin-top:14px">');
    return at >= 0 ? h.slice(0, at) + box + h.slice(at) : h + box;
  };

  /* ---------- exam countdown plan ---------- */
  function schedule(plan) {
    const ls = lessonsOf(plan.board, plan.g), days = Math.max(1, daysBetween(plan.start, plan.date)), weeks = Math.max(1, Math.ceil(days / 7));
    const fin = weeks >= 9 ? 3 : weeks >= 5 ? 2 : weeks >= 2 ? 1 : 0, lw = Math.max(1, weeks - fin), W = [];
    for (let w = 0; w < weeks; w++) W.push({ from: addDays(plan.start, 7 * w), to: addDays(plan.start, Math.min(days, 7 * w + 6)), lessons: [], tasks: [] });
    ls.forEach((l, i) => W[Math.min(lw - 1, Math.floor(i * lw / ls.length))].lessons.push(l.id));
    const mid = Math.floor(lw / 2);
    W.forEach((w, i) => {
      if (i < lw) { w.tasks.push(["review", "Today's review, three times this week"]); if (lw > 2 && i === mid) w.tasks.push(["mock", "A timed mock, to see where you are"]); }
      else { w.tasks.push(["mock", "Two timed mocks"], ["paper", "One written paper, marked with the answer key"], ["miss", "Fix my mistakes until the list is empty"]); }
    });
    if (!fin) W[W.length - 1].tasks.push(["mock", "A timed mock before the exam"]);
    return W;
  }
  function weekDone(p, plan, w) {
    const ls = w.lessons.map(id => !!((p.tl[id] || {}).stars)), mocks = ((p.mockT || {})["mock-" + plan.board + "-g" + plan.g] || []).filter(x => x.d >= w.from && x.d <= w.to).length;
    return { ls, mocks };
  }
  function planHTML(p) {
    const plan = p.plan, T = todayStr();
    if (!plan || VIEW.planEdit) {
      const b0 = plan ? plan.board : (p.theoryBoard === "trinity" ? "trinity" : "abrsm"), g0 = plan ? plan.g : (p.trTheoryGrade || 1), d0 = plan ? plan.date : addDays(T, 70);
      return '<div class="panel" id="planform"><h3 style="margin-top:0">Exam countdown plan</h3><p class="muted" style="margin-top:0">Tell us when the theory exam is. You\'ll get a week-by-week plan through every lesson for the grade, then mocks and revision in the final weeks.</p>' +
        '<div class="row" style="gap:8px;flex-wrap:wrap"><select id="plB" aria-label="Board" style="font:inherit;min-height:44px;border-radius:10px;padding:4px 10px"><option value="abrsm"' + (b0 === "abrsm" ? " selected" : "") + '>ABRSM</option><option value="trinity"' + (b0 === "trinity" ? " selected" : "") + ">Trinity</option></select>" +
        '<select id="plG" aria-label="Grade" style="font:inherit;min-height:44px;border-radius:10px;padding:4px 10px">' + [1, 2, 3, 4, 5, 6, 7, 8].map(g => '<option value="' + g + '"' + (g === g0 ? " selected" : "") + ">Grade " + g + "</option>").join("") + "</select>" +
        '<label for="plD" style="font-weight:700">Exam date</label><input id="plD" type="date" value="' + d0 + '" min="' + addDays(T, 1) + '" style="font:inherit;min-height:44px;border-radius:10px;padding:4px 10px">' +
        '<button class="btn primary" data-plan="make">Make my plan</button>' + (plan ? '<button class="btn ghost" data-plan="cancel">Cancel</button>' : "") + "</div></div>";
    }
    if (!can(plan.g)) return '<div class="panel"><h3 style="margin-top:0">Exam countdown plan</h3><p>Your plan is for ' + BOARD(plan.board) + " Grade " + plan.g + ", which comes with a plan. <a href=\"../app.html#plans\">See plans</a>.</p><button class=\"btn small ghost\" data-plan=\"edit\">Change</button></div>";
    const W = schedule(plan), left = daysBetween(T, plan.date), wi = Math.max(0, Math.min(W.length - 1, Math.floor(daysBetween(plan.start, T) / 7)));
    if (left < 0) return '<div class="panel"><h3 style="margin-top:0">Exam countdown plan</h3><p>Your ' + BOARD(plan.board) + " Grade " + plan.g + " exam date has passed. Good luck with the result! Ready for the next one?</p><button class=\"btn small primary\" data-plan=\"edit\">Plan the next exam</button></div>";
    const w = W[wi], st = weekDone(p, plan, w), all = W.reduce((a, x) => a + x.lessons.length, 0), done = W.reduce((a, x) => a + x.lessons.filter(id => (p.tl[id] || {}).stars).length, 0);
    const behind = W.slice(0, wi).reduce((a, x) => a.concat(x.lessons.filter(id => !(p.tl[id] || {}).stars)), []);
    const task = t => { const [kind, txt] = t, ok = kind === "mock" ? st.mocks >= (/Two/.test(txt) ? 2 : 1) : kind === "miss" ? !missList(p).length : false;
      const act = kind === "mock" ? 'data-act="lesson" data-arg="mock-' + plan.board + "-g" + plan.g + '"' : kind === "paper" ? 'data-mockpaper="' + plan.board + ":" + plan.g + '"' : kind === "miss" ? 'data-act="lesson" data-arg="review-miss"' : 'data-act="lesson" data-arg="review-today"';
      return '<button class="lesson' + (ok ? " done" : "") + '" ' + act + '><span class="n">' + (ok ? "✓" : "•") + '</span><div><div style="font-weight:700">' + esc(txt) + "</div></div></button>"; };
    return '<div class="panel" id="plancard"><div class="row" style="justify-content:space-between"><div><div class="kicker">' + BOARD(plan.board) + " Grade " + plan.g + " · exam " + esc(plan.date) + '</div><h3 style="margin:.2em 0">' + (left === 0 ? "It's exam day. Good luck!" : left + " day" + (left === 1 ? "" : "s") + " to go · week " + (wi + 1) + " of " + W.length) + '</h3></div><span class="pill">' + done + "/" + all + " lessons starred</span></div>" +
      (behind.length ? '<p class="muted" style="margin:.3em 0">Catch up: ' + behind.length + " lesson" + (behind.length === 1 ? "" : "s") + " from earlier weeks (" + behind.slice(0, 3).map(id => esc(LESSON_BY[id].t)).join(", ") + (behind.length > 3 ? "…" : "") + ").</p>" : "") +
      '<div class="lessons" style="margin-top:8px">' + w.lessons.map(id => { const l = LESSON_BY[id], s = (p.tl[id] || {}).stars || 0; return '<button class="lesson' + (s ? " done" : "") + '" data-act="lesson" data-arg="' + id + '"><span class="n">' + (s ? "✓" : "♪") + '</span><div><div style="font-weight:700">' + esc(l.t) + '</div><div class="muted" style="font-size:.85rem">' + esc(l.topic) + "</div></div>" + starStr(s) + "</button>"; }).join("") + (w.tasks || []).map(task).join("") + "</div>" +
      '<div class="row" style="margin-top:10px"><button class="btn small ghost" data-plan="print">Print the whole plan</button><button class="btn small ghost" data-plan="edit">Change the date or grade</button><button class="btn small ghost" data-plan="clear">Remove plan</button></div></div>';
  }
  function printPlan(p) {
    const plan = p.plan, W = schedule(plan);
    const rows = W.map((w, i) => "<tr><td><b>Week " + (i + 1) + "</b><br><small>" + esc(w.from) + " to " + esc(w.to) + "</small></td><td>" + w.lessons.map(id => "☐ " + esc(LESSON_BY[id].t)).join("<br>") + (w.lessons.length && w.tasks.length ? "<br>" : "") + w.tasks.map(t => "☐ " + esc(t[1])).join("<br>") + "</td></tr>").join("");
    openDoc(BOARD(plan.board) + " Grade " + plan.g + " theory: exam plan", '<p>Exam date: <b>' + esc(plan.date) + "</b>. Tick each line when it's done. Lessons, mocks and review are in The Theory Room's Theory tab.</p><table class=\"pl\"><tr><th>Week</th><th>To do</th></tr>" + rows + "</table>", "");
  }

  /* ---------- revision book ---------- */
  function bookHTML(board, g) {
    const ls = lessonsOf(board, g), ans = [];
    const body = ls.map((l, i) => {
      let ex = "";
      try { const q = TGEN[l.gen](l.p, .6); if (q && (!q.type || q.type === "mc") && q.options) { const right = q.options.find(o => String(o.k) === String(q.answer)); ex = '<div class="q"><div class="qp">Try it: ' + q.prompt + "</div>" + (q.visual ? '<div class="notation">' + q.visual + "</div>" : "") + '<ul class="ch">' + q.options.map((o, j) => '<li><span class="lt">' + "ABCDEFGH"[j] + '</span><span class="ot">' + o.html + "</span></li>").join("") + "</ul></div>"; ans.push("<div class=\"a\"><b>" + (i + 1) + ". " + esc(l.t) + ":</b> " + "ABCDEFGH"[q.options.indexOf(right)] + (q.explain ? ' <span class="ex">' + q.explain + "</span>" : "") + "</div>"); } } catch (e) {}
      const demo = l.demo && typeof staffSVG === "function" ? '<div class="notation">' + staffSVG({ clef: l.demo.clef, events: l.demo.notes.map(s => ({ keys: [parseN(s)], d: 4, label: s.replace(/\d/, "") })), noKeyAcc: true, prop: false, spacing: 46 }) + "</div>" : "";
      const terms = l.gen === "terms" && board !== "trinity" ? '<div class="tm">' + TERMS.filter(t => t[2] === l.p.g).map(t => "<div><i>" + esc(t[0]) + "</i>: " + esc(t[1]) + "</div>").join("") + "</div>" : "";
      return '<section class="sec lb"><h2>' + (i + 1) + ". " + esc(l.t) + ' <small class="muted">' + esc(l.topic) + "</small></h2>" + (l.h || "") + demo + terms + ex + "</section>";
    }).join("");
    const toc = "<ol class=\"toc\">" + ls.map(l => "<li>" + esc(l.t) + "</li>").join("") + "</ol>";
    return openDoc(BOARD(board) + " Grade " + g + " theory: revision book", "<p>Every lesson for the grade in one place, each with a question to try. The answers are at the back.</p>" + toc + body, '<section class="answers"><h2>Answers to the “Try it” questions</h2>' + ans.join("") + "</section>");
  }
  function openDoc(title, body, tail) {
    const styles = [].slice.call(document.querySelectorAll("style")).map(s => s.textContent).join("\n");
    const html = '<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(title) + "</title><style>" + styles +
      ":root{color-scheme:light}body{background:#fff!important;color:#111!important;margin:0;padding:24px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;line-height:1.5}.sheet{max-width:820px;margin:0 auto}h1{font-size:24px;margin:0 0 6px;border-bottom:2px solid #111;padding-bottom:6px}" +
      ".sec{margin:18px 0}.sec h2{font-size:19px;margin:0 0 6px;border-bottom:1px solid #999;padding-bottom:3px}.sec h2 small{font-weight:400;font-size:13px;color:#666}.lb{break-before:auto}.notation{background:#fff!important;border:0!important;padding:0!important;margin:6px 0;overflow:visible}.notation svg{max-width:100%;height:auto}" +
      ".q{padding:8px 12px;border:1px dashed #999;border-radius:8px;margin-top:10px;break-inside:avoid}.qp{font-weight:600}.ch{list-style:none;padding:0;margin:6px 0 0;display:flex;flex-wrap:wrap;gap:6px 22px}.ch li{display:flex;align-items:center;gap:6px}.lt{display:inline-flex;width:24px;height:24px;border:1.5px solid #111;border-radius:50%;align-items:center;justify-content:center;font-weight:700;font-size:13px}.ot svg{max-height:70px;width:auto}" +
      ".tm{columns:2;font-size:14px;margin-top:6px}.toc{columns:2;font-size:14px}.answers{break-before:page;page-break-before:always}.a{margin:6px 0;break-inside:avoid}.ex{color:#444;font-size:14px}table.pl{border-collapse:collapse;width:100%}table.pl td,table.pl th{border:1px solid #999;padding:6px 8px;vertical-align:top;text-align:left}" +
      ".wsbar{display:flex;gap:10px;margin:0 auto 16px;max-width:820px;height:auto;background:none}.wsbar button{font:600 15px system-ui;padding:10px 16px;border-radius:10px;border:1.5px solid #111;background:#fff;cursor:pointer}.wsbar .go{background:#111;color:#fff}footer.f{margin-top:18px;font-size:12px;color:#666}@media print{.wsbar{display:none}body{padding:0}}</style></head><body>" +
      '<div class="wsbar"><button class="go" onclick="window.print()">Print or save as PDF</button><button onclick="window.close()">Close</button></div><div class="sheet"><h1>' + esc(title) + "</h1>" + body + (tail || "") +
      '<footer class="f">The Theory Room. Written to help you prepare for the exam; not an official ABRSM or Trinity College London publication. Check the current syllabus for exact requirements.</footer></div></body></html>';
    const w = window.open("", "_blank"); if (!w) { toast("Allow pop-ups for this site to open it."); return html; }
    w.document.open(); w.document.write(html); w.document.close(); return html;
  }
  window.TR_REVBOOK = (b, g) => bookHTML(b, g);
  window.TR_OPENDOC = openDoc;

  /* ---------- the Revision section on the Theory tab ---------- */
  function section() {
    const p = P(), board = p.theoryBoard === "trinity" ? "trinity" : "abrsm", m = missList(p).reduce((a, x) => a + x.w, 0), due = dueList(p).length;
    return '<h2 style="margin-top:22px">Revision</h2><p class="muted" style="margin-top:0">A little every day: review what you\'ve learned, fix your mistakes, and follow a plan to the exam.</p>' +
      '<div class="lessons"><button class="lesson" data-act="lesson" data-arg="review-today"><span class="n">↻</span><div><div style="font-weight:700">Today\'s review</div><div class="muted" style="font-size:.85rem">10 questions from ' + (due ? due + " lesson" + (due === 1 ? "" : "s") + " you've done" : "your current grade") + "</div></div></button>" +
      '<button class="lesson" data-act="lesson" data-arg="review-miss"><span class="n">✎</span><div><div style="font-weight:700">Fix my mistakes</div><div class="muted" style="font-size:.85rem">' + (m ? m + " mistake" + (m === 1 ? "" : "s") + " to put right" : "Nothing waiting. Your notebook is here") + "</div></div></button>" +
      '<div class="lesson" style="cursor:default"><span class="n">📖</span><div style="flex:1"><div style="font-weight:700">' + BOARD(board) + ' revision book</div><div class="muted" style="font-size:.85rem">Every lesson for a grade, ready to print</div><div class="row" style="gap:4px;margin-top:6px">' +
      [1, 2, 3, 4, 5, 6, 7, 8].map(g => can(g) ? '<button class="btn small ghost" style="min-width:44px;padding:0 8px" data-book="' + board + ":" + g + '" aria-label="Grade ' + g + ' revision book">' + g + "</button>" : '<a class="btn small ghost" style="min-width:44px;padding:0 8px;opacity:.6" href="../app.html#plans" aria-label="Grade ' + g + ' (comes with a plan)">' + g + "🔒</a>").join("") + "</div></div></div></div>" +
      '<div style="margin-top:12px">' + planHTML(p) + "</div>";
  }
  const th0 = theoryHome;
  theoryHome = function () {
    const h = th0(), s = section(), at = h.indexOf('<h2 style="margin-top:22px">Mock exams</h2>');
    return at >= 0 ? h.slice(0, at) + s + h.slice(at) : h + s;
  };

  /* ---------- exam readiness on the Progress tab ---------- */
  function readiness(p, board) {
    return [1, 2, 3, 4, 5, 6, 7, 8].map(g => {
      const ls = lessonsOf(board, g), st = ls.filter(l => (p.tl[l.id] || {}).stars).length, tried = ls.filter(l => (p.tl[l.id] || {}).a);
      const acc = tried.length ? tried.reduce((a, l) => a + p.tl[l.id].c / p.tl[l.id].a, 0) / tried.length : null;
      const mh = ((p.mockT || {})["mock-" + board + "-g" + g] || []), best = mh.length ? Math.max(...mh.map(x => x.s / x.n)) : null;
      const f = ls.length ? st / ls.length : 0;
      const v = best != null && best >= .85 && f >= .8 ? ["Ready", "var(--teal)"] : (best != null && best >= .66) || f >= .6 ? ["Nearly", "var(--brass-strong)"] : tried.length || best != null ? ["Building", "var(--muted)"] : ["Not started", "var(--line)"];
      return { g, n: ls.length, st, acc, best, v, tried: tried.length };
    });
  }
  function nextSteps(p) {
    const out = [], board = p.plan ? p.plan.board : (p.theoryBoard === "trinity" ? "trinity" : "abrsm");
    const R = readiness(p, board), cur = p.plan ? p.plan.g : (R.slice().reverse().find(r => r.tried) || R[0]).g;
    const ls = lessonsOf(board, cur), nxt = ls.find(l => !(p.tl[l.id] || {}).stars && can(l.g));
    if (nxt) out.push(['data-act="lesson" data-arg="' + nxt.id + '"', "Next lesson: " + nxt.t, BOARD(board) + " Grade " + cur]);
    const weak = dueList(p).filter(x => p.tl[x.id].a >= 4 && x.acc < .75)[0];
    if (weak) out.push(['data-act="lesson" data-arg="' + weak.id + '"', "Strengthen: " + LESSON_BY[weak.id].t, Math.round(100 * weak.acc) + "% so far"]);
    const mh = ((p.mockT || {})["mock-" + board + "-g" + cur] || []), last = mh.length ? mh[mh.length - 1].d : null;
    if (can(cur) && (!last || daysBetween(last, todayStr()) > 13)) out.push(['data-act="lesson" data-arg="mock-' + board + "-g" + cur + '"', "Take a Grade " + cur + " timed mock", last ? "Last one " + daysBetween(last, todayStr()) + " days ago" : "You haven't tried one yet"]);
    if (missList(p).length) out.push(['data-act="lesson" data-arg="review-miss"', "Fix my mistakes", missList(p).length + " topic" + (missList(p).length === 1 ? "" : "s") + " waiting"]);
    return out.slice(0, 3);
  }
  function readinessHTML(p) {
    const board = VIEW.rdBoard || (p.theoryBoard === "trinity" ? "trinity" : "abrsm"), R = readiness(p, board);
    const pct = x => x == null ? "—" : Math.round(100 * x) + "%";
    let week = 0; const pr = p.prac || {}; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); week += Object.values(pr[todayStr(d)] || {}).reduce((a, b) => a + b, 0); }
    const scl = p.scl || {}, secure = Object.values(scl).filter(r => r.h && r.h.length >= 2 && r.h.slice(-2).every(v => v >= 1)).length;
    const read = Object.values(p.read || {}).reduce((a, r) => ({ n: a.n + r.n, good: a.good + r.good }), { n: 0, good: 0 });
    const steps = nextSteps(p);
    return '<div class="panel" style="margin-top:16px" id="readiness"><div class="row" style="justify-content:space-between"><h3 style="margin:0">Exam readiness: theory</h3><div class="row" style="gap:6px">' +
      ["abrsm", "trinity"].map(b => '<button class="gbtn" data-rdb="' + b + '" aria-pressed="' + (b === board) + '" style="min-height:40px">' + BOARD(b) + "</button>").join("") + "</div></div>" +
      '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:.92rem"><tr style="text-align:left"><th style="padding:6px">Grade</th><th>Lessons starred</th><th>Accuracy</th><th>Best timed mock</th><th>Verdict</th></tr>' +
      R.map(r => '<tr style="border-top:1px solid var(--line)"><td style="padding:6px"><b>' + r.g + "</b></td><td>" + r.st + "/" + r.n + "</td><td>" + pct(r.acc) + "</td><td>" + pct(r.best) + '</td><td><span class="pill" style="background:none;border:2px solid ' + r.v[1] + '">' + r.v[0] + "</span></td></tr>").join("") + "</table></div>" +
      '<p class="muted" style="font-size:.85rem;margin:.5em 0 0">"Ready" means a timed mock of 85% or more and most lessons starred. The pass mark is around two-thirds; aim well above it so a hard question on the day doesn\'t matter.</p>' +
      '<h3 style="margin:16px 0 6px">Practical exam</h3><div class="statgrid" style="margin:6px 0"><div class="stat"><b>' + secure + '</b><span>scales secure</span></div><div class="stat"><b>' + read.good + "/" + read.n + '</b><span>sight-reading played well</span></div><div class="stat"><b>' + Math.round(week) + '</b><span>practice minutes this week</span></div><div class="stat"><b>' + Object.keys(p.mocks || {}).length + '</b><span>aural mocks tried</span></div></div>' +
      '<div class="row" style="margin-top:12px"><button class="btn small ghost" data-report="1">Weekly report for a parent or teacher</button></div>' +
      (steps.length ? '<h3 style="margin:16px 0 6px">Your next three steps</h3><div class="lessons">' + steps.map((s, i) => '<button class="lesson" ' + s[0] + ' data-totheory="1"><span class="n">' + (i + 1) + '</span><div><div style="font-weight:700">' + esc(s[1]) + '</div><div class="muted" style="font-size:.85rem">' + esc(s[2]) + "</div></div></button>").join("") + "</div>" : "") + "</div>";
  }
  const pv0 = progressView;
  progressView = function () {
    const h = pv0(), at = h.indexOf('<div class="panel"><h3>Last 14 days</h3>');
    const s = readinessHTML(P());
    return at >= 0 ? h.slice(0, at) + s.replace('style="margin-top:16px" id', 'style="margin-bottom:16px" id') + h.slice(at) : h + s;
  };


  /* ---------- weekly report ---------- */
  function weekly(p) {
    const T = todayStr(), from = addDays(T, -6), inWeek = d => d && d >= from && d <= T;
    let q = 0, c = 0; for (let i = 0; i < 7; i++) { const d = p.days[addDays(T, -i)]; if (d) { q += d.q; c += d.c; } }
    const lessons = Object.keys(p.tl || {}).filter(id => real(LESSON_BY[id]) && inWeek(p.tl[id].last)).map(id => LESSON_BY[id]);
    const mocks = []; Object.keys(p.mockT || {}).forEach(id => (p.mockT[id] || []).filter(x => inWeek(x.d)).forEach(x => mocks.push([LESSON_BY[id] ? LESSON_BY[id].t : id, x])));
    const pr = p.prac || {}, mins = {}; for (let i = 0; i < 7; i++) Object.entries(pr[addDays(T, -i)] || {}).forEach(([k, v]) => { mins[k] = (mins[k] || 0) + v; });
    const CAT = { pieces: "Pieces", scales: "Scales & technical", sight: "Sight-reading", aural: "Aural", theory: "Theory", other: "Other" };
    const totalMin = Object.values(mins).reduce((a, b) => a + b, 0), wrongWeek = (p.miss || []).filter(m => inWeek(m.d)).length, waiting = missList(p).reduce((a, x) => a + x.w, 0);
    const steps = nextSteps(p), plan = p.plan;
    const body = '<p><b>' + esc(p.name) + "</b> · the week from " + esc(from) + " to " + esc(T) + "</p>" +
      '<table class="pl"><tr><th>Theory and aural questions answered</th><td>' + q + (q ? " (" + Math.round(100 * c / q) + "% right)" : "") + "</td></tr>" +
      "<tr><th>Lessons practised</th><td>" + (lessons.length ? lessons.map(l => esc((l.board === "trinity" ? "Trinity " : "") + "Grade " + l.g + ": " + l.t)).join("<br>") : "None this week") + "</td></tr>" +
      "<tr><th>Timed mocks</th><td>" + (mocks.length ? mocks.map(([t, x]) => esc(t) + ": " + Math.round(100 * x.s / x.n) + "% (" + esc(x.d) + ")").join("<br>") : "None this week") + "</td></tr>" +
      "<tr><th>Practice diary</th><td>" + (totalMin ? Math.round(totalMin) + " minutes: " + Object.entries(mins).map(([k, v]) => esc(CAT[k] || k) + " " + Math.round(v)).join(", ") : "Nothing logged") + "</td></tr>" +
      "<tr><th>Mistakes</th><td>" + wrongWeek + " new this week · " + waiting + " still to fix</td></tr>" +
      (plan ? "<tr><th>Exam plan</th><td>" + BOARD(plan.board) + " Grade " + plan.g + " on " + esc(plan.date) + " (" + Math.max(0, daysBetween(T, plan.date)) + " days to go)</td></tr>" : "") +
      "</table><h2 style=\"font-size:18px;margin-top:18px\">Next steps</h2><ol>" + (steps.length ? steps.map(s => "<li>" + esc(s[1]) + " <span style=\"color:#666\">(" + esc(s[2]) + ")</span></li>").join("") : "<li>Keep going with today's review.</li>") + "</ol>";
    return openDoc("The Theory Room: weekly report", body, "");
  }
  window.TR_WEEKLY = () => weekly(P());

  /* ---------- events ---------- */
  document.addEventListener("click", function (e) {
    const t = e.target;
    let b = t.closest("[data-totheory]");
    if (b) { VIEW.tab = "theory"; VIEW.course = null; }   /* the lesson action below then opens it */
    if ((b = t.closest("[data-report]"))) { weekly(P()); return; }
    if ((b = t.closest("[data-rdb]"))) { VIEW.rdBoard = b.dataset.rdb; render(); return; }
    if ((b = t.closest("[data-rvonly]"))) { const only = b.dataset.rvonly === "1"; document.querySelectorAll(".rvq").forEach(x => { x.style.display = only && x.dataset.ok === "1" ? "none" : ""; }); return; }
    if ((b = t.closest("[data-book]"))) { e.preventDefault(); const a = b.dataset.book.split(":"); if (!can(+a[1])) { toast("Grade " + a[1] + " comes with a plan."); return; } bookHTML(a[0], +a[1]); return; }
    if ((b = t.closest("[data-plan]"))) {
      const p = P(), a = b.dataset.plan;
      if (a === "make") { const B = document.getElementById("plB").value, G = +document.getElementById("plG").value, D = document.getElementById("plD").value; if (!D || D <= todayStr()) { toast("Pick an exam date in the future."); return; } p.plan = { board: B, g: G, date: D, start: todayStr() }; p.theoryBoard = B; if (B === "trinity") p.trTheoryGrade = G; VIEW.planEdit = false; save(); render(); toast("Plan made. Week 1 is ready."); return; }
      if (a === "edit") { VIEW.planEdit = true; render(); const f = document.getElementById("planform"); f && f.scrollIntoView({ block: "center" }); return; }
      if (a === "cancel") { VIEW.planEdit = false; render(); return; }
      if (a === "clear") { modal("Remove your plan?", "<p>Your lessons and scores stay. Only the week-by-week plan goes.</p>", [["Keep it", "ghost"], ["Remove", "primary", () => { delete p.plan; save(); render(); }]]); return; }
      if (a === "print") { printPlan(p); return; }
    }
  }, true);
  window.TR_REVISION = { dueList, missList, schedule, readiness, bookHTML, strip };
  if (typeof render === "function") render();
})();
