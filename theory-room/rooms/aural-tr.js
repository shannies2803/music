/* The Theory Room rules inside the aural & drills room.
   Loaded after the app: decides which grades a family can open, shows what a plan adds,
   names the player after the learner, and opens the grade asked for in the link
   (the repertoire guide links here with ?board=…&grade=…). */
(function () {
  "use strict";
  if (!window.TR) return;
  var esc = TR.esc;
  var PLANS = "../app.html#plans";

  window.TR_FIRST_OPEN = function (p) { for (var g = 1; g <= 8; g++) if (gradeAuralOpen(p, g)) return g; return 1; };

  /* a grade opens only if the family's plan includes it (and the app's own rules agree) */
  var auralOpen0 = gradeAuralOpen;
  gradeAuralOpen = function (p, g) { return TR.can("aural", g) && auralOpen0(p, g); };
  var theoryOpen0 = gradeOpen;
  gradeOpen = function (p, g) { return TR.can("theory", g) && theoryOpen0(p, g); };

  function lockGradeButtons(html, act, room) {
    return html.replace(new RegExp('<button class="gbtn" data-act="' + act + '" data-arg="(\\d)" aria-pressed="false" disabled>Grade \\d · locked</button>', "g"), function (m, g) {
      if (TR.can(room, +g)) return m;
      return '<a class="gbtn tr-lock" href="' + PLANS + '" title="Comes with a plan">Grade ' + g + " 🔒</a>";
    });
  }
  function freeNote(what) {
    return TR.access.pro ? "" : TR.upsellHTML(what);
  }

  var auralHome0 = auralHome2;
  auralHome2 = function () {
    var html = auralHome0();
    if (VIEW.round) return html;
    html = lockGradeButtons(html, "agrade", "aural");
    html = html.replace(/Grade (\d) is open whenever you’re ready\./, function (m, n) { return TR.can("aural", +n) ? m : "Grade " + n + " comes with a plan."; });
    if (!TR.access.pro) {
      html = html.replace(/<details style="margin-top:22px"><summary[^>]*>Free practice — every skill, every level<\/summary>[\s\S]*<\/details>\s*$/,
        TR.upsellHTML("Free practice (every skill at every level) comes with the Family plan."));
      html = html.replace('<h2>Aural, grade by grade</h2>', '<h2>Aural, grade by grade</h2>' +
        freeNote(TR.isPaid() ? "Your grade pack opens Grade " + TR.packs().join(", ") + ". The Family plan opens every grade." : "Grade 1 is free. Every other grade, its mock exam and its extra ear training come with a plan."));
    }
    return html;
  };

  var theoryHome0 = theoryHome;
  theoryHome = function () {
    var html = lockGradeButtons(theoryHome0(), "grade", "theory");
    if (!TR.access.pro) html = html.replace('<h2 style="margin-top:26px">Quick drills</h2>', '<h2 style="margin-top:26px">Quick drills</h2>' +
      freeNote("Grade 1 drills are free. Other grades come with a plan."));
    return html;
  };

  coursesHTML = function () {
    var cards = COURSES.map(function (c) {
      var room = "course-" + c.id, open = TR.can(room);
      var need = c.id === "g6" ? "Grade 6 pack" : "Grade 1–5 pack";
      var inner = '<div class="kicker">' + esc(c.g) + (open ? "" : " · 🔒") + '</div><h3 style="margin:.2em 0 .3em">' + esc(c.t) + '</h3><span class="muted">' + esc(c.d) + "</span>" +
        (open ? "" : '<div style="margin-top:10px;font-weight:700;color:var(--teal)">Comes with the Family plan or a ' + need + " →</div>");
      return open
        ? '<button class="panel" data-act="course" data-arg="' + c.id + '" style="text-align:left;cursor:pointer">' + inner + "</button>"
        : '<a class="panel" href="' + PLANS + '" style="text-align:left;text-decoration:none;color:inherit;display:block">' + inner + "</a>";
    }).join("");
    return '<h2 style="margin-top:18px">Guided theory courses</h2><p class="muted" style="margin-top:0">Full courses with a day-by-day plan, picture lessons, practice papers, mock exams and a page for the grown-up.</p><div class="cols2">' + cards + "</div>";
  };

  /* the learner, not a family member, owns this progress */
  var css = document.createElement("style");
  css.textContent = "#players{display:none!important}a.gbtn.tr-lock{text-decoration:none;color:inherit;display:inline-flex;align-items:center;opacity:.75}";
  document.head.appendChild(css);

  function openFromLink() {
    var q = new URLSearchParams(location.search), g = +q.get("grade"), board = (q.get("board") || "").toLowerCase();
    if (q.get("tab") === "theory" || q.get("tab") === "progress") {
      VIEW.tab = q.get("tab");
      /* homework links can open one theory lesson */
      var lesson = q.get("lesson");
      if (lesson && typeof LESSON_BY !== "undefined" && LESSON_BY[lesson]) {
        /* a teacher set it, so only the plan matters, not how far the child has got */
        if (TR.can("theory", LESSON_BY[lesson].g)) { if (LESSON_BY[lesson].board === "trinity") { P().theoryBoard = "trinity"; P().trTheoryGrade = LESSON_BY[lesson].g; } VIEW.lesson = lesson; VIEW.round = null; VIEW.flash = null; }
        else setTimeout(function () { toast("That lesson's grade isn't in your plan yet."); }, 300);
      }
      return;
    }
    if (!(g >= 1 && g <= 8)) return;
    var p = P();
    if (gradeAuralOpen(p, g)) {
      p.auralGrade = g; VIEW.tab = "aural"; VIEW.round = null; VIEW.skill = null; VIEW.mock = null; save();
      /* homework links can open one test, or the grade's mock */
      if (q.get("mock")) { VIEW.mock = g; }
      else if (q.get("test")) { var arg = q.get("test"), id = arg.split(":")[0]; if (typeof AURAL_BY !== "undefined" && AURAL_BY[id]) setTimeout(function () { startGradeTest(arg, "test"); }, 0); }
    }
    else { VIEW.tab = "aural"; setTimeout(function () { toast("Grade " + g + " aural comes with a plan. Grade " + TR_FIRST_OPEN(p) + " is open now."); }, 300); }
    if (board === "trinity") setTimeout(function () { toast("Trinity's aural test asks you to describe one piece. These tests train the same listening."); }, 3200);
  }

  /* wait for the whole page too: later scripts (boards, sight-reading, Trinity theory) add lessons that links may point at */
  var pageReady = new Promise(function (res) { if (document.readyState !== "loading") res(); else document.addEventListener("DOMContentLoaded", res); });
  Promise.all([TR.ready, pageReady]).then(function () {
    var p = P();
    if (TR.learner && (p.name === "Learner" || p.id === "me")) p.name = TR.learner.name;
    var keyId = (function () { try { return localStorage.getItem("tr-learner") || "me"; } catch (e) { return "me"; } })();
    var reloaded = false; try { reloaded = !!sessionStorage.getItem("tr-aural-reloaded"); sessionStorage.setItem("tr-aural-reloaded", "1"); } catch (e) { reloaded = true; }
    if (TR.learner && KEY !== "tr-aural-v1-" + TR.learner.id && keyId === TR.learner.id && !reloaded) { location.reload(); return; }
    openFromLink();
    render();
  });
  TR.onChange(function () { try { render(); } catch (e) {} });
})();
