/* The Theory Room: topic guides.
   For each topic (intervals, keys and scales, chords…), one page that follows it from Grade 1 to
   Grade 8 for the chosen board: what each grade adds, in a sentence, with your progress and a link to
   each lesson, plus a ten-question round mixing every grade you have open. */
(function () {
  "use strict";
  if (typeof TGEN === "undefined" || typeof LESSON_BY === "undefined") return;
  const can = g => !window.TR || TR.can("theory", g);
  const slug = s => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const skip = l => !l || /mixed$|^c[78]-|^mock-|^review-|^hw-|^guide-|^ms-/.test(l.id) || l.gen === "mix" || l.gen === "rread" || l.mock || /Exam practice|Revision|Musicianship/.test(l.topic);
  const first = h => { const t = String(h || "").replace(/<div class="lplus">[\s\S]*$/, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/\s+([.,;:!?])/g, "$1").trim(); const m = /^(.{20,200}?[.!?])(\s|$)/.exec(t); return m ? m[1] : t.slice(0, 160); };
  function lessonsOf(board) { return (board === "trinity" ? (window.TRINITY_LESSONS || []) : LESSONS.filter(l => !l.board)).filter(l => !skip(l)); }
  function topicsOf(board) { const out = []; lessonsOf(board).forEach(l => { if (out.indexOf(l.topic) < 0) out.push(l.topic); }); return out; }
  function build(board) {
    topicsOf(board).forEach(tp => {
      const ls = lessonsOf(board).filter(l => l.topic === tp).sort((a, b) => a.g - b.g), id = "guide-" + board + "-" + slug(tp);
      const L = { id, g: ls[0].g, board: board === "trinity" ? "trinity" : undefined, topic: "Topic guide", t: tp + ": Grades " + ls[0].g + "–" + ls[ls.length - 1].g, gen: "topicmix", p: { ids: ls.map(l => l.id) }, review: true, guide: true, n: 10 };
      Object.defineProperty(L, "h", { get: () => guideHTML(board, tp, ls) });
      LESSON_BY[id] = L;
    });
  }
  function guideHTML(board, tp, ls) {
    const p = P(), byG = {};
    ls.forEach(l => (byG[l.g] = byG[l.g] || []).push(l));
    return "<p>How <b>" + esc(tp.toLowerCase()) + "</b> builds up through the grades" + (board === "trinity" ? " for Trinity" : " for ABRSM") + ". Each grade adds to the one before, so revise from the start of the topic. The round below mixes questions from every grade you have open.</p>" +
      Object.keys(byG).sort((a, b) => a - b).map(g => '<h4 style="margin:14px 0 6px">Grade ' + g + '</h4><div class="lessons">' + byG[g].map(l => {
        const t = p.tl[l.id] || {}, acc = t.a ? Math.round(100 * t.c / t.a) + "% of " + t.a : "not tried yet";
        return can(l.g) ? '<button class="lesson ' + (t.stars ? "done" : "") + '" data-act="lesson" data-arg="' + l.id + '"><span class="n">' + l.g + '</span><div><div style="font-weight:700">' + esc(l.t) + '</div><div class="muted" style="font-size:.85rem">' + esc(first(l.h)) + " · " + acc + "</div></div>" + starStr(t.stars || 0) + "</button>"
          : '<a class="lesson" href="../app.html#plans" style="text-decoration:none;color:inherit"><span class="n">' + l.g + '</span><div><div style="font-weight:700">' + esc(l.t) + ' 🔒</div><div class="muted" style="font-size:.85rem">' + esc(first(l.h)) + "</div></div></a>";
      }).join("") + "</div>").join("");
  }
  TGEN.topicmix = function (prm) {
    const R = VIEW.round, ids = prm.ids.filter(id => can(LESSON_BY[id].g));
    const id = pick(ids.length ? ids : prm.ids), l = LESSON_BY[id];
    const q = TGEN[l.gen](l.p, Math.max(.35, ((P().tl[id] || {}).diff) || .5));
    if (R) { R.mockFrom = R.mockFrom || []; R.mockFrom[R.i] = id; }
    q.prompt = '<span class="muted" style="font-size:.85em">Grade ' + l.g + " · " + esc(l.t) + "</span><br>" + q.prompt;
    return q;
  };
  build("abrsm"); build("trinity");

  const lv0 = lessonView;
  lessonView = function () {
    const h = lv0(), l = LESSON_BY[VIEW.lesson];
    if (!l || !l.guide) return h;
    return h.replace(/<div class="kicker">[^<]*<\/div>/, '<div class="kicker">' + (l.board === "trinity" ? "Trinity" : "ABRSM") + " · Topic guide</div>").replace(/← (Trinity )?Grade \d+ lessons/, "← Theory").replace(/Start \(10 questions\)|Practise \(8 questions\)/, "Mixed round (10 questions)");
  };
  function section() {
    const p = P(), board = p.theoryBoard === "trinity" ? "trinity" : "abrsm";
    return '<h2 style="margin-top:22px">Topic guides</h2><p class="muted" style="margin-top:0">Follow one topic through every grade: what each grade adds, your progress, and a mixed round.</p><div class="row" style="gap:6px;flex-wrap:wrap">' +
      topicsOf(board).map(tp => '<button class="btn small ghost" data-act="lesson" data-arg="guide-' + board + "-" + slug(tp) + '">' + esc(tp) + "</button>").join("") + "</div>";
  }
  const th0 = theoryHome;
  theoryHome = function () {
    const h = th0(), at = h.indexOf('<h2 style="margin-top:22px">Mock exams</h2>');
    return at >= 0 ? h.slice(0, at) + section() + h.slice(at) : h + section();
  };
  window.TR_TOPICS = { topicsOf, lessonsOf };
  if (typeof render === "function") render();
})();
