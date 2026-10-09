"""The ABRSM Grade 7 and 8 guided courses: the new questions are sound, every day opens cleanly,
   drills started from a day come back to it, days and checklists are saved, locks hold, and links work.
   python3 theory-room/build/e2e_course78.py"""
import asyncio, os, subprocess, sys, time
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SHOTS = os.environ.get("SHOTS", "/tmp/tr-shots"); os.makedirs(SHOTS, exist_ok=True)
URL = "http://127.0.0.1:8789/"
problems = []
def bad(m): problems.append(m); print("FAIL", m)

SWEEP = r"""() => {
  const out = [];
  for (const id of ["g7-sus", "g7-figbass", "g8-sus", "g8-figbass", "g7-passage", "g8-passage"]) {
    const l = LESSON_BY[id]; if (!l) { out.push(id + ": missing"); continue; }
    if (!LESSONS.includes(l)) out.push(id + ": not in the drill list");
    for (let n = 0; n < 400; n++) {
      try {
        const q = TGEN[l.gen](l.p, Math.random()), txt = JSON.stringify(q);
        if (/NaN|undefined|\[object/.test(txt)) { out.push(id + ": bad text " + txt.slice(0, 140)); continue; }
        const ks = q.options.map(o => o.k), hs = q.options.map(o => o.html);
        if (!ks.includes(q.answer)) out.push(id + ": answer not offered");
        if (new Set(ks).size !== ks.length || new Set(hs).size !== hs.length) out.push(id + ": duplicate options " + hs.join(" | "));
        if (ks.length < 3) out.push(id + ": only " + ks.length + " options");
      } catch (e) { out.push(id + ": THROW " + e.message); }
    }
  }
  return [...new Set(out)].slice(0, 30);
}"""

PASS = r"""() => {
  const out = [], T = C78_TEST;
  for (const id of Object.keys(PASSAGES)) for (let n = 0; n < 60; n++) {
    const X = T.passageIn(id, {}), P0 = PASSAGES[id];
    P0.chords.forEach((c, i) => c.forEach((nm0, v) => {
      const a = parseN(nm0), b = X.chords[i][v], a0 = parseN(P0.chords[0][0]), b0 = X.chords[0][0];
      if (Math.abs(b.acc) > 2) out.push(id + ": triple accidental in " + keyName(X.k, X.mode));
      if ((midiOf(a) - midiOf(a0)) !== (midiOf(b) - midiOf(b0)) || (a.oct * 7 + a.L - a0.oct * 7 - a0.L) !== (b.oct * 7 + b.L - b0.oct * 7 - b0.L)) out.push(id + ": intervals changed in " + keyName(X.k, X.mode));
    }));
    if (X.chords.flat().some(x => midiOf(x) < 38 || midiOf(x) > 81)) out.push(id + ": out of range in " + keyName(X.k, X.mode));
    if (JSON.stringify(X.figs).includes("undefined")) out.push(id + ": bad figures");
  }
  const want = (id, kk, i, f) => { for (let t = 0; t < 400; t++) { const X = T.passageIn(id, {}); if (X.k === kk) { if (X.figs[i].join("/") !== f) out.push(`${id} in ${keyName(X.k, X.mode)} chord ${i}: ${X.figs[i].join("/")} not ${f}`); return; } } out.push(id + ": key " + kk + " never chosen"); };
  want("ger6", 0, 1, "♯6/5"); want("ger6", -4, 1, "♮6/5"); want("neap", 0, 1, "♭6"); want("neap", 1, 1, "♮6");
  want("phryg", 0, 3, "♯"); want("phryg", -4, 3, "♮"); want("cad64", 0, 2, "6/4"); want("vofv", 0, 2, "6/5"); want("dim7", 0, 2, "♯6/5"); want("it6", -1, 2, "♯6");
  return [...new Set(out)].slice(0, 30);
}"""

DATA = r"""(g) => {
  const D = C78_DATA[g], out = [], days = D.weeks.flatMap(w => w.days);
  days.forEach((d, i) => d.items.forEach(it => {
    if ((it.k === "drill" || it.k === "quiz") && !LESSON_BY[it.id]) out.push(g + " day " + (i + 1) + ": no lesson " + it.id);
    if (it.k === "quiz" && LESSON_BY[it.id] && LESSON_BY[it.id].p.ids.length < 4) out.push(g + " " + it.id + ": too few lessons");
  }));
  Object.values(D.quizzes).forEach(q => q.ids.forEach(x => { if (!LESSON_BY[x]) out.push(g + " quiz: no lesson " + x); }));
  D.weakFrom.forEach(x => { if (!LESSON_BY[x]) out.push(g + " weak list: no lesson " + x); });
  return { out, n: days.length };
}"""

async def answer_round(pg):
    for _ in range(12):
        btn = pg.locator("#ex button.opt:not([disabled])").first
        if await btn.count(): await btn.click(); await pg.wait_for_timeout(120)
        nxt = pg.locator("#ex [data-act=next]")
        if await nxt.count() and await nxt.first.is_visible(): await nxt.first.click(); await pg.wait_for_timeout(120)

async def page(b, plan, w=1100, dark=False, path="rooms/aural.html?learner=l1"):
    ctx = await b.new_context(viewport={"width": w, "height": 900}, color_scheme="dark" if dark else "light")
    pg = await ctx.new_page(); errs = []; reqs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("request", lambda r: reqs.append(r.url))
    await pg.goto(URL + "privacy.html"); await pg.evaluate(f"() => localStorage.setItem('tr-preview','{plan}')")
    await pg.goto(URL + path); await pg.wait_for_timeout(1300)
    return ctx, pg, errs, reqs

async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8789", "--bind", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch()
            # ---- family plan, desktop ----
            ctx, pg, errs, reqs = await page(b, "paid")
            for x in await pg.evaluate(SWEEP): bad(x)
            for x in await pg.evaluate(PASS): bad(x)
            await pg.evaluate("() => { VIEW.tab = 'theory'; VIEW.lesson = 'g8-passage'; render(); }"); await pg.wait_for_timeout(200)
            await pg.click("[data-act=startLesson]"); await pg.wait_for_timeout(400)
            await pg.screenshot(path=f"{SHOTS}/passage-question.png", full_page=True)
            ptxt = await pg.inner_text("#ex .prompt")
            if "<b>" in ptxt or "</" in ptxt: bad(f"question shows raw tags: {ptxt[:100]!r}")
            if not await pg.locator("#ex [data-act=play]").count(): bad("passage question has no Play button")
            await pg.evaluate("() => { VIEW.lesson = null; VIEW.round = null; render(); }")
            await pg.click("[data-tab=theory]"); await pg.wait_for_timeout(300)
            t = await pg.inner_text("#main")
            for c in ["Guided course: Grade 7", "Guided course: Grade 8"]:
                if c not in t: bad("card missing: " + c)
            for g in ["g7", "g8"]:
                await pg.evaluate("() => { VIEW.course = null; VIEW.lesson = null; render(); }")
                await pg.click("[data-tab=theory]"); await pg.wait_for_timeout(200)
                await pg.click(f"[data-act=course][data-arg={g}]"); await pg.wait_for_timeout(700)
                t = await pg.inner_text("#main")
                if f"Grade {g[1]} in 30 days" not in t: bad(f"{g}: course home didn't open: {t[:160]!r}"); continue
                r = await pg.evaluate(DATA, g)
                for x in r["out"]: bad(x)
                if r["n"] != 30: bad(f"{g}: {r['n']} days")
                await pg.screenshot(path=f"{SHOTS}/course-{g}-home.png", full_page=True)
                # every day opens cleanly
                for d in range(1, r["n"] + 1):
                    await pg.evaluate(f"() => {{ VIEW.c78day = {d}; render(); }}")
                    html = await pg.inner_html("#main")
                    if "NaN" in html or "undefined" in html: bad(f"{g} day {d}: NaN/undefined on the page")
                    if f"day {d} of 30" not in (await pg.inner_text("#main")).lower(): bad(f"{g} day {d}: didn't render")
                await pg.evaluate("() => { VIEW.c78day = 0; render(); }")
            # walk through Grade 7 day 1 properly
            await pg.evaluate("() => { VIEW.course = null; render(); }"); await pg.click("[data-tab=theory]"); await pg.click("[data-act=course][data-arg=g7]"); await pg.wait_for_timeout(300)
            await pg.click("[data-c78=day][data-arg='1']"); await pg.wait_for_timeout(200)
            await pg.locator("[data-c78=go]").first.click(); await pg.wait_for_timeout(300)
            t = await pg.inner_text("#main")
            if "← Day 1" not in t: bad(f"drill from a day: back button {t[:120]!r}")
            await pg.click("[data-act=startLesson]"); await pg.wait_for_timeout(300)
            await answer_round(pg)
            await pg.click("[data-c78=ret]"); await pg.wait_for_timeout(300)
            t = await pg.inner_text("#main")
            if "day 1 of 30" not in t.lower(): bad(f"didn't return to day 1: {t[:120]!r}")
            await pg.click("[data-c78=finish]"); await pg.wait_for_timeout(300)
            if "day 2 of 30" not in (await pg.inner_text("#main")).lower(): bad("finish didn't move on to day 2")
            if not await pg.evaluate("() => !!P().c78.g7.done[1]"): bad("day 1 not saved as done")
            # a written-task day: ticks are saved, the example draws and plays
            await pg.evaluate("() => { VIEW.c78day = 5; render(); }")
            boxes = pg.locator("[data-c78chk]")
            n = await boxes.count()
            if n < 3: bad(f"day 5 checklist has {n} items")
            for i in range(n): await boxes.nth(i).check()
            await pg.wait_for_timeout(200)
            if await pg.evaluate("() => Object.values(P().c78.g7.chk.figure1 || {}).filter(Boolean).length") != n: bad("checklist not saved")
            t5 = await pg.inner_text("#main")
            if "All done" not in t5 and "1 thing left" not in t5: bad("ticking the checklist didn't leave just the drill")
            if not await pg.locator("#main .satb svg").count(): bad("worked example not drawn")
            await pg.click("[data-c78=play]"); await pg.wait_for_timeout(300)
            await pg.screenshot(path=f"{SHOTS}/course-g7-day5.png", full_page=True)
            # the course progress counts as homework
            hw = await pg.evaluate("""() => { const it = { type: "course", which: "g7", days: 1 };
                return [TR.hw.label(it), TR.hw.link(it, "l1"), TR.hw.done(it, { player: P() }), TR.hw.done({ type: "course", which: "g7", days: 2 }, { player: P() })]; }""")
            if hw[0] != "Guided course (Grade 7): reach day 1" or "course=g7" not in hw[1] or hw[2] is not True or hw[3] is not False: bad(f"homework helpers: {hw}")
            if errs: bad(f"family desktop: {errs[:3]}")
            await ctx.close()

            # ---- links open a course directly; phone width, dark ----
            ctx, pg, errs, reqs = await page(b, "paid", 390, True, "rooms/aural.html?learner=l1&tab=theory&course=g8")
            await pg.wait_for_timeout(500)
            if "Grade 8 in 30 days" not in await pg.inner_text("#main"): bad("link with course=g8 didn't open the course")
            await pg.evaluate("() => { VIEW.c78day = 4; render(); }"); await pg.wait_for_timeout(200)
            sw = await pg.evaluate("() => document.documentElement.scrollWidth - innerWidth")
            if sw > 1: bad(f"phone: sideways scroll {sw}px on a day with an example")
            await pg.screenshot(path=f"{SHOTS}/course-g8-day4-390.png", full_page=True)
            if errs: bad(f"phone: {errs[:3]}")
            await ctx.close()

            # ---- free and Grade 5 pack: locked, and the course files are never fetched ----
            for plan in ["free", "pack5"]:
                ctx, pg, errs, reqs = await page(b, plan, path="rooms/aural.html?learner=l1&tab=theory&course=g7")
                t = await pg.inner_text("#main")
                if "comes with" not in t.lower(): bad(f"{plan}: no upsell on the locked course: {t[:160]!r}")
                if any("course-g7.js" in u or "course-g8.js" in u for u in reqs): bad(f"{plan}: course file was fetched")
                await pg.click("[data-act=theoryHome]"); await pg.wait_for_timeout(200)
                if not await pg.locator('a.panel[href*="plans"]:has-text("Grade 7")').count(): bad(f"{plan}: Grade 7 card isn't a locked link")
                if errs: bad(f"{plan}: {errs[:3]}")
                await ctx.close()

            # ---- the dashboard shows the new courses ----
            ctx, pg, errs, reqs = await page(b, "paid", path="app.html")
            t = await pg.inner_text("body")
            for c in ["Guided course: Grade 7", "Guided course: Grade 8"]:
                if c not in t: bad("dashboard: missing " + c)
            href = await pg.evaluate("""() => { const a = [...document.querySelectorAll('a')].find(x => /course=g7/.test(x.href)); return a ? a.getAttribute('href') : ''; }""")
            if "tab=theory&course=g7" not in href: bad(f"dashboard link: {href!r}")
            if errs: bad(f"dashboard: {errs[:3]}")
            await ctx.close()
            await b.close()
    finally:
        srv.terminate()
    print("\nPROBLEMS:", len(problems)); [print(" -", x) for x in problems]
    sys.exit(1 if problems else 0)
asyncio.run(main())
