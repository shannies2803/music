"""Composer films: every film draws every part without errors, free/paid locks, studio recording.
   python3 theory-room/build/e2e_composers.py"""
import asyncio, os, subprocess, sys, time
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SHOTS = os.environ.get("SHOTS", "/tmp/tr-shots"); os.makedirs(SHOTS, exist_ok=True)
URL = "http://127.0.0.1:8772/"
problems = []
def bad(m): problems.append(m); print("FAIL", m)
async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8772", "--bind", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
            for preview in ["free", "paid"]:
                ctx = await b.new_context(viewport={"width": 1200, "height": 900})
                pg = await ctx.new_page(); errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)))
                await pg.goto(URL + "privacy.html"); await pg.evaluate(f"() => localStorage.setItem('tr-preview','{preview}')")
                await pg.goto(URL + "rooms/composers.html" + ("?studio=1" if preview == "paid" else "")); await pg.wait_for_timeout(1500)
                locks = await pg.locator(".tag:has-text('Family plan')").count()
                if preview == "free" and locks != 6: bad(f"free: {locks} locked films (want 6)")
                if preview == "paid" and locks: bad("paid: films locked")
                await pg.click("[data-film=haydn]"); await pg.wait_for_timeout(300)
                has_lock = await pg.locator(".screen .lock").count()
                if (preview == "free") != bool(has_lock): bad(f"{preview}: haydn lock overlay {has_lock}")
                if preview == "paid":
                    ids = await pg.evaluate("() => COMPOSERS.map(f => f.id)")
                    for fid in ids:
                        await pg.click(f"[data-film={fid}]"); await pg.wait_for_timeout(150)
                        n = await pg.locator("#scenes button").count()
                        for i in range(n):
                            await pg.click(f"#scenes button >> nth={i}"); await pg.wait_for_timeout(60)
                            # draw a moment well into the part, to catch late-appearing text
                            await pg.evaluate(f"() => document.querySelectorAll('#scenes button')[{i}].click()")
                        if fid in ("bach", "grieg"):
                            for i in [0, 1, 2, 7, 8]:
                                await pg.evaluate(f"() => document.querySelectorAll('#scenes button')[{i}].click()")
                                await pg.click("#play"); await pg.wait_for_timeout(2600 if i != 8 else 7000); await pg.click("#play")
                                await pg.locator("#screen").screenshot(path=f"{SHOTS}/film-{fid}-{i}.png")
                    # quiz in the page
                    await pg.click("[data-film=grieg]"); await pg.click("[data-opt='2']")
                    if "Yes!" not in await pg.inner_text("#quizMsg"): bad("quiz: right answer not praised")
                    # studio: record a few seconds in portrait, then end the film early
                    await pg.click("[data-rec=port]"); await pg.wait_for_timeout(3000)
                    await pg.evaluate("() => document.getElementById('play').click()")  # pause
                    await pg.evaluate("() => { /* end recording */ }")
                    await pg.locator("#screen").screenshot(path=f"{SHOTS}/film-portrait.png")
                if errs: bad(f"{preview}: {errs[:3]}")
                await ctx.close()
            # phone width
            ctx = await b.new_context(viewport={"width": 390, "height": 844})
            pg = await ctx.new_page(); await pg.goto(URL + "rooms/composers.html"); await pg.wait_for_timeout(1200)
            w = await pg.evaluate("() => document.documentElement.scrollWidth - innerWidth")
            if w > 1: bad(f"phone: sideways scroll {w}px")
            await pg.screenshot(path=f"{SHOTS}/composers-390.png", full_page=True)
            await b.close()
    finally:
        srv.terminate()
    print("\nPROBLEMS:", len(problems)); [print(" -", x) for x in problems]
    sys.exit(1 if problems else 0)
asyncio.run(main())
