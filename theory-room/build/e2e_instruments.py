"""The Instruments room: every instrument's page renders cleanly, its range notes land on the right
   stave positions, sound and quizzes work, and the page fits a phone.
   python3 build/e2e_instruments.py"""
import asyncio, os, subprocess, sys, time
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SHOTS = os.environ.get("SHOTS", "/tmp/tr-shots"); os.makedirs(SHOTS, exist_ok=True)
URL = "http://127.0.0.1:8793/"
problems = []
def bad(m): problems.append(m); print("FAIL", m)

DATA = r"""() => {
  const out = [], R = INSTRUMENTS_ROOM;
  for (const x of INSTRUMENTS) {
    for (const k of ["id", "name", "family", "exam", "clefs", "low", "high", "how", "facts", "famous", "quiz"]) if (x[k] == null) out.push(x.id + ": no " + k);
    const lo = R.parse(x.low), hi = R.parse(x.high);
    if (12 * (lo.oct + 1) >= 12 * (hi.oct + 1) + 11) out.push(x.id + ": low above high");
    if (!(x.quiz.answer >= 0 && x.quiz.answer < x.quiz.options.length)) out.push(x.id + ": quiz answer");
    if (!INSTRUMENT_STATS[x.id] || !INSTRUMENT_STATS[x.id].n) out.push(x.id + ": no exam stats");
    const m = (window.INSTRUMENTS_MORE || {})[x.id];
    if (!m) out.push(x.id + ": no in-depth sections"); else for (const k of ["history", "parts", "tech", "orchestra", "relatives", "tips"]) if (!m[k] || !m[k].length) out.push(x.id + ": no " + k);
    for (const n of [x.low, x.high]) { const s = R.staffSVG(R.parse(n), x.clefs); if (/NaN|undefined/.test(s)) out.push(x.id + " " + n + ": bad stave"); }
  }
  // known stave positions: middle C has one leger line in treble; G3 two leger lines below the treble stave
  const lines = s => (s.match(/<line/g) || []).length - 5;
  if (lines(R.staffSVG(R.parse("C4"), ["treble"])) !== 1) out.push("middle C should have 1 leger line");
  if (lines(R.staffSVG(R.parse("G3"), ["treble"])) !== 2) out.push("G3 should have 2 leger lines in treble");
  if (lines(R.staffSVG(R.parse("C4"), ["alto"])) !== 0) out.push("middle C in the alto clef is on the stave");
  if (!/8vb/.test(R.staffSVG(R.parse("A0"), ["treble", "bass"]))) out.push("A0 should use 8vb");
  for (let i = 0; i < 200; i++) { const q = R.gameQ(); if (!q.opts.includes(q.right) || new Set(q.opts).size !== q.opts.length || q.opts.length < 3) { out.push("game question: " + JSON.stringify(q)); break; } }
  return out;
}"""

async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8793", "--bind", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
            for w, dark in [(1100, False), (390, True)]:
                ctx = await b.new_context(viewport={"width": w, "height": 900}, color_scheme="dark" if dark else "light"); pg = await ctx.new_page(); errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)))
                await pg.goto(URL + "rooms/instruments.html"); await pg.wait_for_timeout(1200)
                if w == 1100:
                    for x in await pg.evaluate(DATA): bad(x)
                    ids = await pg.evaluate("() => INSTRUMENTS.map(x => x.id)")
                    for i in ids:
                        await pg.click(f"[data-inst={i}]"); await pg.wait_for_timeout(60)
                        h = await pg.inner_html("#detail")
                        if "NaN" in h or "undefined" in h: bad(f"{i}: NaN/undefined on the page")
                        if "pieces on the lists" not in h: bad(f"{i}: no exam numbers")
                        if "In depth" not in h or "Words you" not in h: bad(f"{i}: no in-depth sections")
                    await pg.click("[data-inst=clarinet]"); await pg.wait_for_timeout(100)
                    t = await pg.inner_text("#detail")
                    if "major 2nd" not in t or "sounds D3" not in t.replace("♭", "b"): bad(f"clarinet transposition text: {t[:300]!r}")
                    await pg.click("[data-play=range]"); await pg.wait_for_timeout(300)
                    await pg.click("[data-q1='1']"); await pg.wait_for_timeout(100)
                    if "right" not in await pg.inner_text("#q1fb"): bad("clarinet quiz")
                    await pg.click("[data-fam=Brass]"); await pg.wait_for_timeout(100)
                    if await pg.locator("[data-inst=violin]").count(): bad("family filter")
                    await pg.click("[data-game=start]")
                    for _ in range(10):
                        await pg.locator("#game [data-g]").first.click(); await pg.wait_for_timeout(40)
                        await pg.click("#game [data-game=next]"); await pg.wait_for_timeout(40)
                    if "out of 10" not in await pg.inner_text("#game"): bad("game didn't finish")
                    # films: every instrument's film builds; one plays, and each scene draws without errors
                    for i in ids:
                        await pg.click(f"[data-fam=All]") if i == ids[0] else None
                        await pg.click(f"[data-inst={i}]"); await pg.wait_for_timeout(40)
                        st = await pg.evaluate("() => INSTRUMENT_FILM._state()")
                        if st["scenes"] != 10 or not (30 < st["total"] < 120): bad(f"{i}: film {st}")
                    await pg.click("[data-inst=trumpet]"); await pg.wait_for_timeout(100)
                    await pg.click("#ifPlay"); await pg.wait_for_timeout(1200)
                    if not (await pg.evaluate("() => INSTRUMENT_FILM._state()"))["playing"]: bad("film didn't start")
                    n = await pg.locator("#ifScenes button").count()
                    for k in range(n):
                        await pg.click(f"[data-ifs='{k}']"); await pg.wait_for_timeout(700)
                        if k == 2: await pg.locator("#ifScreen").screenshot(path=f"{SHOTS}/instrument-film-range.png")
                        if k == 0: await pg.locator("#ifScreen").screenshot(path=f"{SHOTS}/instrument-film-title.png")
                    await pg.click("#ifPlay")
                    await pg.goto(URL + "rooms/instruments.html#horn"); await pg.wait_for_timeout(800)
                    if "Horn" not in await pg.inner_text("#detail h2"): bad("#horn link")
                    await pg.screenshot(path=f"{SHOTS}/instruments-horn.png", full_page=True)
                else:
                    await pg.click("[data-inst=piano]"); await pg.wait_for_timeout(300)
                    await pg.screenshot(path=f"{SHOTS}/instruments-390.png", full_page=True)
                sw = await pg.evaluate("() => document.documentElement.scrollWidth - innerWidth")
                if sw > 1: bad(f"{w}: sideways scroll {sw}px")
                if errs: bad(f"{w}: {errs[:3]}")
                await ctx.close()
            # the printable card game
            ctx = await b.new_context(viewport={"width": 1100, "height": 1400}); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(URL + "rooms/cards.html"); await pg.wait_for_timeout(1200)
            n = await pg.locator(".card").count()
            if n != 54: bad(f"cards: {n} cards (want 22 instruments + 5 rules + 18 questions + 9 backs)")
            over = await pg.evaluate("() => [...document.querySelectorAll('.card .in')].filter(e => e.scrollHeight > e.clientHeight + 1).length")
            if over: bad(f"cards: {over} cards overflow")
            t = await pg.inner_text("#deck")
            if "NaN" in t or "undefined" in t: bad("cards: broken text")
            if "B♭3" not in t: bad("cards: the oboe's lowest note should read B♭3")
            if "Question card 1" not in t.title() and "QUESTION CARD 1" not in t.upper(): bad("cards: question numbering")
            await pg.click("#optQ"); await pg.wait_for_timeout(100)
            if await pg.locator(".qcard").count(): bad("cards: question cards didn't hide")
            if errs: bad(f"cards: {errs[:3]}")
            await b.close()
    finally:
        srv.terminate()
    print("\nPROBLEMS:", len(problems)); [print(" -", x) for x in problems]
    sys.exit(1 if problems else 0)
asyncio.run(main())
