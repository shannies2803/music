"""ABRSM Initial and Trinity aural: every new question type at every level, the board views and a mock.
   python3 theory-room/build/e2e_boards.py"""
import asyncio, json, os, subprocess, sys, time
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SHOTS = os.environ.get("SHOTS", "/tmp/tr-shots"); os.makedirs(SHOTS, exist_ok=True)
URL = "http://127.0.0.1:8783/"
problems = []
def bad(m): problems.append(m); print("FAIL", m)

CHECK = r"""() => {
  const out = []; let captured = null; const real = playEvents;
  playEvents = (ev, bpm) => { captured = {ev, bpm}; return 1; };
  const jobs = [["contour", [1,2,3]], ["trchange", [1,2,3,4,5,6,7,8]], ["trtonal", [1,2]], ["trint", [1,2,3]]];
  for (const [id, levels] of jobs) for (const L of levels) for (let n = 0; n < 120; n++) {
    const key = id + "/" + L;
    try {
      const q = AGEN[id](L, Math.random(), P());
      if (!q) { out.push(key + ": no question"); continue; }
      for (const f of [q.play, ...(q.extra || []).map(x => x.fn)]) {
        captured = null; f(); if (!captured) { out.push(key + ": a button played nothing"); continue; }
        for (const e of captured.ev) { const ms = Array.isArray(e.m) ? e.m : [e.m];
          if (ms.some(m => !Number.isFinite(m) || m < 21 || m > 108) || !Number.isFinite(e.t) || !(e.d > 0)) { out.push(key + ": bad note " + JSON.stringify(e)); break; } }
      }
      if (q.type === "feat") q.cats.forEach(c => { if (!c.opts.some(o => o.k === c.ans)) out.push(key + ": answer " + c.ans + " not offered for " + c.c); });
      else if (!q.options.some(o => o.k === String(q.answer))) out.push(key + ": answer not offered");
      if (/undefined|NaN/.test((q.prompt || "") + (q.explain || "") + (q.visual || ""))) out.push(key + ": undefined/NaN in text");
      if (id === "trchange" && L >= 3 && !q.visual) out.push(key + ": no music shown");
      if (id === "trchange" && L >= 6) { const bars = q.cats.filter(c => /bar$/.test(c.lbl)).map(c => +c.ans); if (bars.some((b, i) => i && b <= bars[i-1])) out.push(key + ": changes not in order"); }
    } catch (e) { out.push(key + ": THROW " + e.message + " " + (e.stack || "").split("\n")[1]); }
  }
  playEvents = real;
  return [...new Set(out)].slice(0, 30);
}"""

async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8783", "--bind", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch()
            ctx = await b.new_context(viewport={"width": 1100, "height": 900}); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(URL + "privacy.html"); await pg.evaluate("() => localStorage.setItem('tr-preview','paid')")
            await pg.goto(URL + "rooms/aural.html?learner=l1"); await pg.wait_for_timeout(1500)
            for x in await pg.evaluate(CHECK): bad(x)
            # ABRSM Initial
            await pg.click("[data-tri]"); await pg.wait_for_timeout(200)
            t = await pg.inner_text("#main")
            for want in ["Initial aural tests", "Clap echoes", "Sing echoes"]:
                if want not in t: bad(f"ABRSM Initial: missing {want!r}")
            await pg.click("[data-act=agrade][data-arg='3']"); await pg.wait_for_timeout(200)
            if "Grade 3 aural tests" not in await pg.inner_text("#main"): bad("back to ABRSM Grade 3 failed")
            # Trinity, every grade
            await pg.click("[data-trb=trinity]"); await pg.wait_for_timeout(200)
            for g in range(0, 9):
                await pg.click(f"[data-trg='{g}']"); await pg.wait_for_timeout(120)
                t = await pg.inner_text("#main")
                if ("Initial" if g == 0 else f"Grade {g}") + " aural tests" not in t: bad(f"Trinity {g}: view missing")
                n = await pg.locator("[data-trtest]").count()
                for i in range(n):
                    await pg.click(f"[data-trtest] >> nth={i}"); await pg.wait_for_timeout(250)
                    if not await pg.evaluate("() => !!(VIEW.round && VIEW.round.q)"): bad(f"Trinity {g} test {i+1} didn't start")
                    if g in (5, 7) and i == n - 1: await pg.screenshot(path=f"{SHOTS}/trinity-g{g}-change.png", full_page=True)
                    back = await pg.inner_text(".back") if await pg.locator(".back").count() else ""
                    if "Grade Trinity" in back: bad(f"Trinity {g}: back label {back!r}")
                    await pg.click("[data-act=gback]"); await pg.wait_for_timeout(120)
            await pg.screenshot(path=f"{SHOTS}/trinity-g8.png", full_page=True)
            # a Trinity mock, answered right then saved
            await pg.click("[data-trg='4']"); await pg.click("[data-trmock]"); await pg.wait_for_timeout(200)
            if "Trinity Grade 4 mock aural test" not in await pg.inner_text("#main"): bad("Trinity mock intro")
            await pg.click("[data-act=startMock]")
            for i in range(4):
                await pg.wait_for_timeout(250)
                await pg.evaluate("""() => { const q = VIEW.round.q; if (q.type === 'feat') { q.cats.forEach(c => { const el = document.querySelector(`#ex input[name=f_${c.c}][value="${c.ans}"]`); if (el) el.checked = true; }); checkFeat(); } else if (q.type === 'self') { document.querySelector('#ex [data-act=self]').click(); } else answerMC(String(q.answer)); }""")
                await pg.wait_for_timeout(150); await pg.click("#nextrow button")
            await pg.wait_for_timeout(300)
            m = await pg.evaluate("() => JSON.stringify(P().mocks.T4 || null)")
            if '"best":1' not in m: bad(f"Trinity mock not saved as full marks: {m}")
            await pg.screenshot(path=f"{SHOTS}/trinity-mock-summary.png", full_page=True)
            if errs: bad(f"page errors: {errs[:3]}")
            await ctx.close()
            # a free family: Trinity Initial and Grade 1 open, Grade 2 locked
            ctx = await b.new_context(viewport={"width": 390, "height": 844}); pg = await ctx.new_page()
            await pg.goto(URL + "privacy.html"); await pg.evaluate("() => localStorage.setItem('tr-preview','free')")
            await pg.goto(URL + "rooms/aural.html?learner=l1"); await pg.wait_for_timeout(1500)
            await pg.click("[data-trb=trinity]"); await pg.wait_for_timeout(200)
            locked = await pg.evaluate("() => [...document.querySelectorAll('a.gbtn.tr-lock')].map(a => a.textContent.trim())")
            if any("Initial" in x or x.startswith("Grade 1") for x in locked) or not any(x.startswith("Grade 2") for x in locked): bad(f"free Trinity locks: {locked}")
            w = await pg.evaluate("() => document.documentElement.scrollWidth - innerWidth")
            if w > 1: bad(f"phone: sideways scroll {w}px")
            await pg.screenshot(path=f"{SHOTS}/trinity-free-390.png", full_page=True)
            await b.close()
    finally:
        srv.terminate()
    print("\nPROBLEMS:", len(problems)); [print(" -", x) for x in problems]
    sys.exit(1 if problems else 0)
asyncio.run(main())
