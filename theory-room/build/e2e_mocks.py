"""Mock exams: every timed mock makes sound questions and runs to a marked result with a topic breakdown;
   every printable paper (Trinity 1-8, ABRSM 1-8) builds with questions and matching answers.
   python3 build/e2e_mocks.py"""
import asyncio, os, subprocess, sys, time
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SHOTS = os.environ.get("SHOTS", "/tmp/tr-shots"); os.makedirs(SHOTS, exist_ok=True)
URL = "http://127.0.0.1:8801/"
problems = []
def bad(m): problems.append(m); print("FAIL", m)

GEN = r"""() => {
  const out = [];
  for (const b of ["abrsm", "trinity"]) for (let g = 1; g <= 8; g++) {
    const id = "mock-" + b + "-g" + g, l = LESSON_BY[id]; if (!l) { out.push(id + ": missing"); continue; }
    VIEW.round = { i: 0, mockFrom: [] };
    for (let n = 0; n < 60; n++) {
      try { const q = TGEN.mockmix(l.p); const txt = JSON.stringify(q);
        if (/NaN|undefined/.test(txt)) out.push(id + ": bad text " + txt.slice(0, 120));
        if (!q.type || q.type === "mc") { if (!q.options || !q.options.some(o => o.k === q.answer)) out.push(id + ": answer not offered"); }
        const from = LESSON_BY[VIEW.round.mockFrom[0]];
        if (!from || from.g > g || (b === "trinity") !== (from.board === "trinity")) out.push(id + ": question from the wrong place " + (from && from.id));
      } catch (e) { out.push(id + ": THROW " + e.message); }
    }
    VIEW.round = null;
  }
  return [...new Set(out)].slice(0, 30);
}"""
PAPERS = r"""() => {
  const out = [], counts = {};
  for (const b of ["abrsm", "trinity"]) for (let g = 1; g <= 8; g++) for (let n = 0; n < 4; n++) {
    let h; try { h = TR_MOCKPAPER(b, g); } catch (e) { out.push(b + g + ": THROW " + e.message + " " + (e.stack || "").split("\n")[1]); continue; }
    const d = new DOMParser().parseFromString(h, "text/html"), body = d.body.textContent;
    if (/NaN|undefined|\[object/.test(body)) out.push(b + g + ": broken text");
    const nq = d.querySelectorAll(".sheet > section:not(.answers) .q").length, na = d.querySelectorAll(".answers .a b").length;
    if (nq < 12) out.push(b + g + ": only " + nq + " questions");
    if (na < nq) out.push(b + g + ": " + nq + " questions but " + na + " numbered answers");
    if (g >= 6 && b === "abrsm" && !/Figured bass/.test(body)) out.push(b + g + ": no figured bass section");
    if (g >= 6 && !/Completing a four-part passage/.test(body)) out.push(b + g + ": no four-part completion");
    if ((b === "trinity" || g <= 5) && !/melody/i.test(body)) out.push(b + g + ": no melody analysis");
    counts[b + g] = nq;
  }
  return { out: [...new Set(out)].slice(0, 30), counts };
}"""

async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8801", "--bind", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch()
            ctx = await b.new_context(viewport={"width": 1100, "height": 900}); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(URL + "privacy.html"); await pg.evaluate("() => localStorage.setItem('tr-preview','paid')")
            await pg.goto(URL + "rooms/aural.html?learner=l1"); await pg.wait_for_timeout(1300)
            for x in await pg.evaluate(GEN): bad(x)
            r = await pg.evaluate(PAPERS)
            print("questions per paper:", r["counts"])
            for x in r["out"]: bad(x)
            # the theory tab shows the mock section, for both boards
            await pg.click("[data-tab=theory]"); await pg.wait_for_timeout(300)
            if "Mock exams" not in await pg.inner_text("#main"): bad("no mock section on the theory tab")
            # sit a whole timed mock
            await pg.click("[data-act=lesson][data-arg=mock-abrsm-g3]"); await pg.wait_for_timeout(300)
            t = await pg.inner_text("#main")
            if "Start the mock (30 questions)" not in t: bad(f"mock lesson page: {t[:200]!r}")
            await pg.click("[data-act=startLesson]"); await pg.wait_for_timeout(300)
            for i in range(80):
                if await pg.locator("#ex [data-act=next]").count() and await pg.locator("#ex [data-act=next]").first.is_visible():
                    await pg.click("#ex [data-act=next]"); await pg.wait_for_timeout(60); continue
                opt = pg.locator("#ex button.opt:not([disabled])")
                if await opt.count(): await opt.first.click(); await pg.wait_for_timeout(60); continue
                chk = pg.locator("#ex [data-act=barCheck]")
                if await chk.count(): await chk.first.click(); await pg.wait_for_timeout(60); continue
                if "By topic" in await pg.inner_text("#ex"): break
                await pg.wait_for_timeout(100)
            t = await pg.inner_text("#ex")
            if "out of 30" not in t or "By topic" not in t: bad(f"mock result: {t[:300]!r}")
            await pg.screenshot(path=f"{SHOTS}/mock-result.png", full_page=True)
            if not await pg.evaluate("() => (P().mockT || {})['mock-abrsm-g3'] && P().mockT['mock-abrsm-g3'].length === 1"): bad("mock result not saved")
            # print a paper from the button
            for key, name in [("trinity:3", "paper-trinity3"), ("abrsm:7", "paper-abrsm7")]:
                async with ctx.expect_page() as info:
                    await pg.evaluate(f"() => {{ const b = document.createElement('button'); b.dataset.mockpaper = '{key}'; document.body.appendChild(b); b.click(); }}")
                w = await info.value; await w.wait_for_load_state(); await w.wait_for_timeout(400)
                await w.screenshot(path=f"{SHOTS}/{name}.png", full_page=True); await w.close()
            if errs: bad(f"page errors: {errs[:3]}")
            await b.close()
    finally:
        srv.terminate()
    print("\nPROBLEMS:", len(problems)); [print(" -", x) for x in problems]
    sys.exit(1 if problems else 0)
asyncio.run(main())
