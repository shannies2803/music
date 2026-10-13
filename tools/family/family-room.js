/* Family edition, inside the aural & theory room: note each day's Ear Gym and theory review
   (for Today's 15 minutes and the sticker book), and open the tab a link asks for. */
(function () {
  "use strict";
  if (!window.TR || !TR.C || !TR.C.familyEdition || TR.configured || typeof endRound !== "function") return;
  var end0 = endRound;
  endRound = function () {
    var R = VIEW.round; end0();
    try {
      if (!R) return;
      var p = P(), d = todayStr(); p.fam = p.fam || {}; var f = p.fam[d] = p.fam[d] || {};
      if (R.src === "gym" && R.res.length) f.gym = 1;
      if (R.src === "theory" && /^review-/.test(R.id) && R.res.length >= 5) f.rev = 1;
      save();
    } catch (e) {}
  };
  var q = new URLSearchParams(location.search), tab = q.get("tab");
  Promise.resolve(TR.ready).then(function () {
    setTimeout(function () {
      if (tab === "gym" || tab === "read" || tab === "aural") setTab(tab);
      if (tab === "prac" && q.get("mode") && window.PRACTICAL) { PRACTICAL.S.mode = q.get("mode"); render(); }
    }, 80);
  });
})();
