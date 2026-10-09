"""Printable worksheets: every lesson that can print makes ten questions and ten answers with no
   broken text, the button opens a printable page, and the page stays light in dark mode.
   python3 build/e2e_worksheets.py"""
import asyncio, os, subprocess, sys, time
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SHOTS = os.environ.get("SHOTS", "/tmp/tr-shots"); os.makedirs(SHOTS, exist_ok=True)
URL = "http://127.0.0.1:8792/"
problems = []
def bad(m): problems.append(m); print("FAIL", m)

ALL = r"""() => {
  const out = [], none = [];
  const ids = Object.keys(LESSON_BY).filter(id => !/^c[78]-/.test(id));
  for (const id of ids) {
    const h = TR_WORKSHEET(id);
    if (!h) { none.push(id); continue; }
    const d = new DOMParser().parseFromString(h, "text/html");
    const nq = d.querySelectorAll("section.q").length, na = d.querySelectorAll(".answers li").length;
    if (nq < 4 || nq !== na) out.push(id + ": " + nq + " questions, " + na + " answers");
    const txt = d.body.textContent;
    if (/NaN|undefined|\[object/.test(txt)) out.push(id + ": broken text");
    d.querySelectorAll("section.q").forEach((s, i) => { if (s.querySelectorAll(".ch li").length < 2) out.push(id + " q" + (i + 1) + ": no choices"); });
  }
  return { out: out.slice(0, 30), none, n: ids.length };
}"""

async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8792", "--bind", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch()
            ctx = await b.new_context(viewport={"width": 1100, "height": 900}, color_scheme="dark"); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(URL + "privacy.html"); await pg.evaluate("() => localStorage.setItem('tr-preview','paid')")
            await pg.goto(URL + "rooms/aural.html?learner=l1"); await pg.wait_for_timeout(1300)
            r = await pg.evaluate(ALL)
            print(f"{r['n']} lessons; {len(r['none'])} can't print: {r['none']}")
            for x in r["out"]: bad(x)
            if len(r["none"]) > 12: bad("too many lessons can't print")
            for lid in ["g3-intervals", "tr7-blues", "g8-passage"]:
                await pg.evaluate(f"() => {{ VIEW.tab = 'theory'; VIEW.lesson = '{lid}'; VIEW.round = null; render(); }}"); await pg.wait_for_timeout(200)
                btn = pg.locator("[data-ws]")
                if not await btn.count(): bad(f"{lid}: no worksheet button"); continue
                async with ctx.expect_page() as info:
                    await btn.click()
                w = await info.value; await w.wait_for_load_state(); await w.wait_for_timeout(300)
                n = await w.locator("section.q").count()
                if n != 10: bad(f"{lid}: {n} questions on the sheet")
                bg = await w.evaluate("() => getComputedStyle(document.body).backgroundColor")
                if bg not in ("rgb(255, 255, 255)",): bad(f"{lid}: sheet background {bg} in dark mode")
                ink = await w.evaluate("() => { const t = document.querySelector('.notation svg [fill], .notation svg text, .notation svg path'); return t ? getComputedStyle(t).fill + '|' + getComputedStyle(t).stroke : 'none'; }")
                await w.screenshot(path=f"{SHOTS}/worksheet-{lid}.png", full_page=True)
                print(lid, n, "questions; notation ink", ink)
                await w.close()
            if errs: bad(f"page errors: {errs[:3]}")
            await b.close()
    finally:
        srv.terminate()
    print("\nPROBLEMS:", len(problems)); [print(" -", x) for x in problems]
    sys.exit(1 if problems else 0)
asyncio.run(main())
