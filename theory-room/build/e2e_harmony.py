"""Harmony workshop, Finish-the-melody drills and rhythm reading.
   python3 build/e2e_harmony.py"""
import asyncio, os, subprocess, sys, time
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SHOTS = os.environ.get("SHOTS", "/tmp/tr-shots"); os.makedirs(SHOTS, exist_ok=True)
URL = "http://127.0.0.1:8805/"
problems = []
def bad(m): problems.append(m); print("FAIL", m)

GEN = r"""() => {
  const out = [];
  for (const id of Object.keys(PASSAGES)) for (let n = 0; n < 40; n++) {
    const X = TR_HARMONY.pickPassage(id), c = TR_HARMONY.checks(X.chords);
    c.filter(x => x[0] === "✗").forEach(x => out.push(id + " in " + keyName(X.k, X.mode) + ": " + x[1]));
  }
  for (const id of ["tr4-melend", "tr5-melend", "g6-melend"]) for (let n = 0; n < 150; n++) {
    const l = LESSON_BY[id]; let q; try { q = TGEN[l.gen](l.p, .5); } catch (e) { out.push(id + ": THROW " + e.message); continue; }
    if (q.options.length !== 4 || !q.options.some(o => o.k === "good")) out.push(id + ": bad options");
    if (new Set(q.options.map(o => o.html)).size !== 4) out.push(id + ": two endings look the same");
    if (/NaN|undefined/.test(JSON.stringify(q)) || /NaN/.test(q.options.map(o => o.html).join(""))) out.push(id + ": broken text");
    const m = /It uses ([A-G][♯♭]?), a note that doesn't belong to ([A-G][♯♭]?) (major|minor)/.exec(q.explain);
    if (m) { const ton = m[2], mode = m[3], L = "CDEFGAB", st = [0,2,4,5,7,9,11], pcx = s => (st[L.indexOf(s[0])] + (s[1] === "♯" ? 1 : s[1] === "♭" ? -1 : 0) + 12) % 12;
      const rel = (pcx(m[1]) - pcx(ton) + 12) % 12, ok = mode === "minor" ? [0,2,3,5,7,8,9,10,11] : [0,2,4,5,7,9,11];
      if (ok.includes(rel)) out.push(id + ": 'out of key' note " + m[1] + " is in " + ton + " " + mode); }
  }
  for (let g = 1; g <= 8; g++) for (let n = 0; n < 60; n++) {
    const q = TGEN.rread(LESSON_BY["g" + g + "-rread"].p);
    if (q.type !== "clap" || !q.onsets.length || /NaN/.test(q.visual)) out.push("rread g" + g + ": bad question");
  }
  return [...new Set(out)].slice(0, 30);
}"""

async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8805", "--bind", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch()
            pg = await b.new_page(viewport={"width": 1100, "height": 900}); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(URL + "privacy.html"); await pg.evaluate("() => localStorage.setItem('tr-preview','paid')")
            await pg.goto(URL + "rooms/aural.html?learner=hm1"); await pg.wait_for_timeout(1300)
            for x in await pg.evaluate(GEN): bad(x)
            await pg.click("nav.tabs [data-tab=theory]"); await pg.wait_for_timeout(200)
            await pg.click("[data-arg=hw-workshop]"); await pg.wait_for_selector("#hwbox")
            for s in range(5):
                await pg.click(f"[data-hw-step='{s}']"); await pg.wait_for_timeout(100)
                h = await pg.inner_html("#hwbox")
                if "NaN" in h or "undefined" in h or "§" in h: bad(f"workshop step {s}: broken")
                await pg.screenshot(path=f"{SHOTS}/workshop-{s}.png", full_page=True)
            await pg.select_option("#hwSel", "ger6"); await pg.click("[data-hw=key]"); await pg.click("[data-hw-step='1']")
            if "German" not in await pg.inner_text("#hwbox"): bad("ger6 explanation")
            # a melody lesson round
            await pg.evaluate("() => { VIEW.round = null; VIEW.lesson = 'g6-melend'; render(); }")
            await pg.click("[data-act=startLesson]"); await pg.wait_for_selector("#ex .opt")
            await pg.click("#ex .opt[data-arg=good]")
            if "Right." not in await pg.inner_text("#fb"): bad("melody explanation")
            await pg.screenshot(path=f"{SHOTS}/melend.png", full_page=True)
            # rhythm reading: count-in enables the pad, taps are scored
            await pg.evaluate("() => { VIEW.round = null; VIEW.lesson = 'g3-rread'; render(); }")
            if await pg.locator("[data-ws]").count(): bad("worksheet offered for rhythm reading")
            await pg.click("[data-act=startLesson]"); await pg.wait_for_selector("#pad")
            await pg.click("#ex [data-act=play]"); await pg.wait_for_selector("#pad:not([disabled])", timeout=6000)
            n = await pg.evaluate("() => VIEW.round.q.onsets.length")
            sp = await pg.evaluate("() => 60 / VIEW.round.q.bpm")
            ons = await pg.evaluate("() => VIEW.round.q.onsets")
            t0 = time.time()
            for o in ons:
                wait = o * sp - (time.time() - t0)
                if wait > 0: await asyncio.sleep(wait)
                await pg.click("#pad")
            await pg.click("#ex [data-act=clapDone]"); await pg.wait_for_selector("#fb.show")
            await pg.screenshot(path=f"{SHOTS}/rread.png", full_page=True)
            val = await pg.evaluate("() => VIEW.round.res[0]")
            if val is None or val < .5: bad(f"rhythm reading marked {val} for in-time taps")
            # the ABRSM Grade 1 list shows rhythm reading; mocks never ask it
            mk = await pg.evaluate("() => { VIEW.round = { i: 0, mockFrom: [] }; const out = []; for (let i = 0; i < 300; i++) { TGEN.mockmix(LESSON_BY['mock-abrsm-g3'].p); out.push(VIEW.round.mockFrom[0]); } VIEW.round = null; return out.filter(x => /rread|hw-/.test(x)).length; }")
            if mk: bad("mock asked a tap question")
            for e in errs: bad("page error: " + e)
            await b.close()
    finally:
        srv.terminate()
    print("problems:", len(problems)); sys.exit(1 if problems else 0)

asyncio.run(main())
