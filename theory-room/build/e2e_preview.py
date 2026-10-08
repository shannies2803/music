"""Browser check of the whole site in preview mode (no Supabase, no payments).
   python3 theory-room/build/e2e_preview.py   (serves theory-room/ on port 8770)"""
import asyncio, os, subprocess, sys, time, json
from playwright.async_api import async_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SHOTS = os.path.join(os.environ.get("SHOTS", "/tmp/tr-shots")); os.makedirs(SHOTS, exist_ok=True)
URL = "http://127.0.0.1:8770/"
problems = []

def bad(msg): problems.append(msg); print("FAIL", msg)

async def page_for(b, width=1200, dark=False, preview=None):
    ctx = await b.new_context(viewport={"width": width, "height": 900}, color_scheme="dark" if dark else "light")
    pg = await ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append("pageerror: " + str(e)))
    pg.on("console", lambda m: errs.append("console: " + m.text) if m.type == "error" and "favicon" not in m.text and "Failed to load resource" not in m.text else None)
    if preview:
        await pg.goto(URL + "privacy.html")
        await pg.evaluate(f"() => {{ localStorage.setItem('tr-preview', '{preview}'); }}")
    return ctx, pg, errs

async def overflow(pg, name):
    w = await pg.evaluate("() => document.documentElement.scrollWidth - window.innerWidth")
    if w > 1: bad(f"{name}: page scrolls sideways by {w}px")

async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8770", "--bind", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch()
            # home page, desktop light / phone dark
            for w, dark in [(1200, False), (390, True)]:
                ctx, pg, errs = await page_for(b, w, dark)
                await pg.goto(URL); await pg.wait_for_timeout(900)
                await pg.screenshot(path=f"{SHOTS}/home-{w}{'-dark' if dark else ''}.png", full_page=True)
                await overflow(pg, f"home {w}")
                if not await pg.locator("#tr-preview").count(): bad("home: no preview bar")
                if errs: bad(f"home {w}: {errs[:3]}")
                await ctx.close()

            # dashboard as a free family
            ctx, pg, errs = await page_for(b, 1200, preview="free")
            await pg.goto(URL + "app.html"); await pg.wait_for_timeout(700)
            txt = await pg.inner_text("main")
            for s in ["Practising today: Learner 1", "Free", "Guided course: Grades 1–5", "Family plan or a Grade 1–5 pack"]:
                if s not in txt: bad(f"dashboard free: missing {s!r}")
            await pg.click("details.manage summary")
            await pg.fill("#newName", "Ava"); await pg.click("#addForm button"); await pg.wait_for_timeout(200)
            if "Ava" not in await pg.inner_text(".learners"): bad("dashboard: learner not added")
            await pg.click("[data-learner]:has-text('Ava')"); await pg.wait_for_timeout(200)
            if "Practising today: Ava" not in await pg.inner_text("main"): bad("dashboard: learner switch")
            await pg.click("[data-pack='7']"); await pg.wait_for_timeout(100)
            if "Grade 7 pack · S$69" not in await pg.inner_text("#buyPack"): bad("dashboard: pack price for grade 7")
            await pg.click("#buyPack"); await pg.wait_for_timeout(100)
            if "Preview mode" not in await pg.inner_text("#buyMsg"): bad("dashboard: preview checkout message")
            await pg.screenshot(path=f"{SHOTS}/app-free.png", full_page=True)
            if errs: bad(f"dashboard: {errs[:3]}")
            await ctx.close()

            # phone dashboard, paid
            ctx, pg, errs = await page_for(b, 390, dark=True, preview="paid")
            await pg.goto(URL + "app.html"); await pg.wait_for_timeout(700)
            if "Family plan" not in await pg.inner_text("main"): bad("dashboard paid: plan label")
            await overflow(pg, "app 390"); await pg.screenshot(path=f"{SHOTS}/app-paid-390-dark.png", full_page=True)
            if errs: bad(f"dashboard paid: {errs[:3]}")
            await ctx.close()

            # aural room, free family: grade 2 locked, free practice hidden; deep link to grade 3 is refused
            ctx, pg, errs = await page_for(b, 1200, preview="free")
            await pg.goto(URL + "rooms/aural.html?learner=l1&board=abrsm&grade=3"); await pg.wait_for_timeout(1500)
            main = await pg.inner_text("#main")
            if "Grade 1 aural tests" not in main: bad("aural free: not on Grade 1")
            if not await pg.locator("a.gbtn.tr-lock").count(): bad("aural free: no locked grade links")
            if "Free practice — every skill" in main: bad("aural free: free practice visible")
            if not await pg.locator("#tr-roombar").count(): bad("aural: no room bar")
            await pg.screenshot(path=f"{SHOTS}/aural-free.png", full_page=True)
            await pg.click("[data-tab=theory]"); await pg.wait_for_timeout(300)
            th = await pg.inner_text("#main")
            if "Guided course: Grades 1–5" not in th or "Comes with the Family plan" not in th: bad("aural free: theory courses lock text")
            await pg.screenshot(path=f"{SHOTS}/theory-tab-free.png", full_page=True)
            if errs: bad(f"aural free: {errs[:3]}")
            await ctx.close()

            # aural room, paid: deep link opens Grade 6, free practice there
            ctx, pg, errs = await page_for(b, 390, preview="paid")
            await pg.goto(URL + "rooms/aural.html?learner=l1&board=trinity&grade=6"); await pg.wait_for_timeout(1500)
            main = await pg.inner_text("#main")
            if "Grade 6 aural tests" not in main: bad("aural paid: deep link didn't open Grade 6")
            if "Free practice" not in main: bad("aural paid: free practice missing")
            if await pg.locator("a.gbtn.tr-lock").count(): bad("aural paid: locked grades shown")
            await overflow(pg, "aural 390")
            await pg.click("[data-act=gtest] >> nth=0"); await pg.wait_for_timeout(500)
            if not await pg.locator("#ex").count(): bad("aural paid: test didn't start")
            await pg.screenshot(path=f"{SHOTS}/aural-paid-390.png", full_page=True)
            if errs: bad(f"aural paid: {errs[:3]}")
            name = await pg.evaluate("() => P().name")
            if name != "Learner 1": bad(f"aural: player name is {name!r}")
            await ctx.close()

            # guided courses
            for f, want in [("theory-g1-5.html", "Guided theory course · Grades 1–5"), ("theory-g6.html", "Guided theory course · Grade 6")]:
                ctx, pg, errs = await page_for(b, 1200, preview="paid")
                await pg.goto(URL + "rooms/" + f + "?learner=l1"); await pg.wait_for_timeout(1500)
                title = await pg.title()
                if want not in title: bad(f"{f}: title {title!r}")
                body = await pg.inner_text("body")
                for w in ["Faye", "Philip", "Mum"]:
                    if w in body: bad(f"{f}: shows {w!r}")
                await pg.screenshot(path=f"{SHOTS}/{f}.png")
                await pg.evaluate("() => { const b = [...document.querySelectorAll('button, a')].find(x => /Practice corner|Learner view|kid/i.test(x.textContent)); if (b) b.click(); }")
                await pg.wait_for_timeout(400)
                await pg.screenshot(path=f"{SHOTS}/{f}-kid.png")
                if errs: bad(f"{f}: {errs[:3]}")
                await ctx.close()

            # repertoire
            ctx, pg, errs = await page_for(b, 1200, preview="free")
            await pg.goto(URL + "repertoire/"); await pg.wait_for_timeout(2500)
            if not await pg.locator("#tr-roombar").count(): bad("repertoire: no room bar")
            href = await pg.evaluate("() => { const a = document.querySelector('.courses a'); return a ? a.getAttribute('href') : null; }")
            if not href or not href.startswith("../rooms/aural.html?board="): bad(f"repertoire: aural link {href!r}")
            await pg.screenshot(path=f"{SHOTS}/repertoire.png")
            if errs: bad(f"repertoire: {errs[:3]}")
            await ctx.close()

            # teacher: the class view with the example class
            ctx, pg, errs = await page_for(b, 1200, preview="teacher")
            await pg.goto(URL + "teacher.html"); await pg.wait_for_timeout(900)
            t = await pg.inner_text("main")
            for want in ["Example class", "DEMO42", "Example: Aisha", "Needs a nudge", "Grade 5 mock best 82%", "Last mini mock 63/75"]:
                if want not in t: bad(f"teacher: missing {want!r}")
            await pg.click("details.faq summary"); await pg.fill("#className", "Tuesday group"); await pg.click("#newClass button"); await pg.wait_for_timeout(300)
            if "Tuesday group" not in await pg.inner_text(".classes"): bad("teacher: new class not made")
            # set homework for the new class
            await pg.click("#hwBuilder summary"); await pg.fill("#hwTitle", "Week 2")
            await pg.select_option("#hwGrade", "2"); await pg.wait_for_timeout(100); await pg.click("#hwAdd"); await pg.wait_for_timeout(100)
            await pg.select_option("#hwType", "film"); await pg.wait_for_timeout(100); await pg.select_option("#hwItem", "3"); await pg.click("#hwAdd"); await pg.wait_for_timeout(100)
            await pg.select_option("#hwType", "course"); await pg.wait_for_timeout(100); await pg.fill("#hwDays", "12"); await pg.click("#hwAdd"); await pg.wait_for_timeout(100)
            if await pg.input_value("#hwTitle") != "Week 2": bad("homework: title lost while adding tasks")
            await pg.click("#hwForm button[type=submit]"); await pg.wait_for_timeout(300)
            hw = await pg.inner_text("main")
            for want in ["Week 2", "Grade 2 aural, test A: Clap the beat", "Watch the Mozart film", "Guided course (Grades 1–5): reach day 12"]:
                if want not in hw: bad(f"homework: missing {want!r}")
            await pg.click("[data-class=demo]"); await pg.wait_for_timeout(300)
            grid = await pg.inner_text(".hw .grid")
            if "Example: Aisha" not in grid or "3/3" not in grid: bad(f"homework grid for Aisha: {grid[:200]!r}")
            await pg.screenshot(path=f"{SHOTS}/teacher.png", full_page=True)
            if errs: bad(f"teacher: {errs[:3]}")
            await ctx.close()
            ctx, pg, errs = await page_for(b, 390, dark=True, preview="teacher")
            await pg.goto(URL + "teacher.html"); await pg.wait_for_timeout(900); await overflow(pg, "teacher 390")
            await pg.screenshot(path=f"{SHOTS}/teacher-390.png", full_page=True); await ctx.close()

            # family: join a class with its code, then every aural grade opens for that learner
            ctx, pg, errs = await page_for(b, 1200, preview="free")
            await pg.goto(URL + "app.html"); await pg.wait_for_timeout(700)
            await pg.click("summary:has-text(\"Join a teacher's class\")")
            await pg.fill("#classCode", "nope"); await pg.click("#joinForm button"); await pg.wait_for_timeout(200)
            if "No class has that code" not in await pg.inner_text("#joinMsg"): bad("join: wrong code message")
            await pg.fill("#classCode", "demo42"); await pg.click("#joinForm button"); await pg.wait_for_timeout(300)
            main = await pg.inner_text("main")
            if "Learner 1's class: Example class" not in main or "In Example class" not in main: bad("join: class not shown")
            if "Open: all grades, with your class" not in main: bad("join: rooms not opened by class")
            await pg.wait_for_timeout(400)
            main = await pg.inner_text("main")
            if "Homework for Learner 1" not in main or "Week 1" not in main or "0 of 3 done" not in main: bad("family: homework not shown")
            await pg.screenshot(path=f"{SHOTS}/app-homework.png", full_page=True)
            await pg.click(".hwcard a >> nth=0"); await pg.wait_for_timeout(1500)
            on = await pg.evaluate("() => !!(VIEW.round && VIEW.gctx && VIEW.gctx.t === 'Clap the beat')")
            if not on: bad("homework link didn't open the test")
            await pg.evaluate("() => { const s = P().sk.pulse || (P().sk.pulse = {a:0,c:0,diff:.3,lv:{},hist:[]}); s.lv[1] = 1; save(); }")
            await pg.goto(URL + "rooms/composers.html#beethoven"); await pg.wait_for_timeout(800)
            await pg.evaluate("() => document.querySelectorAll('#scenes button')[9].click()")
            await pg.click("#play"); await pg.wait_for_timeout(5200)
            await pg.goto(URL + "app.html"); await pg.wait_for_timeout(900)
            if "2 of 3 done" not in await pg.inner_text("main"): bad("family: homework ticks didn't follow progress")
            await pg.goto(URL + "rooms/aural.html?learner=l1&grade=7"); await pg.wait_for_timeout(1500)
            if "Grade 7 aural tests" not in await pg.inner_text("#main"): bad("class learner: Grade 7 not open")
            if errs: bad(f"join: {errs[:3]}")
            await ctx.close()

            for f in ["privacy.html", "terms.html"]:
                ctx, pg, errs = await page_for(b, 390)
                await pg.goto(URL + f); await pg.wait_for_timeout(400); await overflow(pg, f)
                if errs: bad(f"{f}: {errs[:3]}")
                await ctx.close()
            await b.close()
    finally:
        srv.terminate()
    print("\nPROBLEMS:", len(problems)); [print(" -", x) for x in problems]
    sys.exit(1 if problems else 0)

asyncio.run(main())
