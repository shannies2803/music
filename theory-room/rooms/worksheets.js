/* The Theory Room: printable worksheets.
   Every theory lesson page (ABRSM, Trinity, and the Grade 7–8 drills) gets a "Print a worksheet" button:
   ten fresh questions from the same question maker, with lettered choices, then an answer page with
   explanations. Each click makes a new sheet. Loaded last in the aural room. */
(function () {
  "use strict";
  if (typeof lessonView !== "function" || typeof TGEN === "undefined") return;
  const N_Q = 10, LETTERS = "ABCDEFGH";

  function makeQuestions(l) {
    const out = [], seen = new Set();
    for (let tries = 0; out.length < N_Q && tries < 200; tries++) {
      let q; try { q = TGEN[l.gen](l.p, 0.3 + Math.random() * 0.6); } catch (e) { continue; }
      if (!q || q.type && q.type !== "mc" || !q.options || q.options.length < 2) continue;  // only multiple choice prints well
      const key = (q.prompt || "") + "|" + q.answer + "|" + (q.visual || "").length;
      if (seen.has(key)) continue; seen.add(key); out.push(q);
    }
    return out;
  }
  const okCache = {};
  const printable = l => (l.id in okCache) ? okCache[l.id] : (okCache[l.id] = makeQuestions(l).length >= 4);

  function sheetHTML(l, qs, who) {
    const styles = [...document.querySelectorAll("style")].map(s => s.textContent).join("\n");
    const board = l.board === "trinity" ? "Trinity" : "ABRSM";
    const qHTML = qs.map((q, i) => `<section class="q"><div class="qn">${i + 1}</div><div class="qb">
        <div class="qp">${q.prompt}</div>${q.visual ? `<div class="notation">${q.visual}</div>` : ""}
        <ol class="ch">${q.options.map((o, j) => `<li><span class="lt">${LETTERS[j]}</span><span class="ot">${o.html}</span></li>`).join("")}</ol></div></section>`).join("");
    const aHTML = qs.map((q, i) => { const j = q.options.findIndex(o => o.k === q.answer); return `<li><b>${LETTERS[j]}</b> <span class="ot">${q.options[j].html}</span><div class="ex">${q.explain || ""}</div></li>`; }).join("");
    return `<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Worksheet: ${esc(l.t)}</title><style>${styles}
      :root{color-scheme:light}
      body{background:#fff!important;color:#111!important;margin:0;padding:24px;font-family:system-ui,-apple-system,Segoe UI,sans-serif}
      .sheet{max-width:780px;margin:0 auto}
      header.w{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:14px;gap:16px;flex-wrap:wrap}
      header.w h1{font-size:22px;margin:0}.kick{font:600 12px/1.3 system-ui;letter-spacing:.08em;text-transform:uppercase;color:#555}
      .lines{display:flex;gap:20px;font-size:14px}.lines span{display:inline-block;min-width:150px;border-bottom:1px solid #111}
      .q{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #ddd;break-inside:avoid;page-break-inside:avoid}
      .qn{font-weight:800;font-size:18px;min-width:26px}.qb{flex:1}.qp{font-weight:600;margin-bottom:6px}
      .notation{background:#fff!important;border:0!important;padding:0!important;margin:4px 0;overflow:visible}
      .notation svg{max-width:100%;height:auto}
      .ch{list-style:none;padding:0;margin:6px 0 0;display:flex;flex-wrap:wrap;gap:6px 22px}
      .ch li{display:flex;align-items:center;gap:6px}.lt{display:inline-flex;width:24px;height:24px;border:1.5px solid #111;border-radius:50%;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex:0 0 auto}
      .ot svg{max-height:70px;width:auto}
      .answers{break-before:page;page-break-before:always;margin-top:28px}.answers ol{padding-left:22px}.answers li{margin:8px 0}.ex{color:#444;font-size:14px;margin-top:2px}
      .wsbar{display:flex;gap:10px;margin:0 auto 16px;max-width:780px;height:auto;background:none}.wsbar button{font:600 15px system-ui;padding:10px 16px;border-radius:10px;border:1.5px solid #111;background:#fff;cursor:pointer}.wsbar .go{background:#111;color:#fff}
      footer.f{margin-top:18px;font-size:12px;color:#666}
      @media print{.wsbar{display:none}body{padding:0}}
      </style></head><body>
      <div class="wsbar"><button class="go" onclick="window.print()">Print or save as PDF</button><button onclick="window.close()">Close</button></div>
      <div class="sheet"><header class="w"><div><div class="kick">${board} Grade ${l.g} · ${esc(l.topic)}</div><h1>${esc(l.t)}</h1></div>
      <div class="lines"><div>Name <span>${who ? esc(who) : "&nbsp;"}</span></div><div>Date <span>&nbsp;</span></div><div>Score <span style="min-width:60px">&nbsp;/ ${qs.length}</span></div></div></header>
      <p style="margin:0 0 6px">Circle the letter of the right answer.</p>${qHTML}
      <section class="answers"><header class="w"><div><div class="kick">Answers</div><h1>${esc(l.t)}</h1></div></header><ol>${aHTML}</ol></section>
      <footer class="f">The Theory Room · a fresh worksheet every time. Not affiliated with ABRSM or Trinity College London.</footer></div></body></html>`;
  }

  window.TR_WORKSHEET = function (id) {
    const l = LESSON_BY[id]; if (!l) return null;
    const qs = makeQuestions(l); if (qs.length < 4) return null;
    const name = (window.TR && TR.learner && TR.learner.name) || "";
    return sheetHTML(l, qs, /^Learner/.test(name) ? "" : name);
  };

  const lessonView2 = lessonView;
  lessonView = function () {
    let h = lessonView2(); const l = LESSON_BY[VIEW.lesson];
    if (!l || VIEW.round || !printable(l)) return h;
    return h.replace(/(<button class="btn primary" data-act="startLesson">[^<]*<\/button>)/, `$1<button class="btn ghost" data-ws="${esc(l.id)}" title="Ten new questions and an answer page">Print a worksheet</button>`);
  };
  document.addEventListener("click", function (e) {
    const b = e.target.closest("[data-ws]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const html = window.TR_WORKSHEET(b.dataset.ws); if (!html) { toast("This lesson's questions don't print well. Try the drill instead."); return; }
    const w = window.open("", "_blank");
    if (!w) { toast("Allow pop-ups for this site to print a worksheet."); return; }
    w.document.open(); w.document.write(html); w.document.close();
  }, true);
  if (typeof render === "function") render();
})();
