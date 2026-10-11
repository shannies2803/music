"""Practical tab (scales coach, examiner mode, practice diary) and revision tools (mistakes notebook,
   today's review, mock answer review, exam countdown plan, revision books, readiness on Progress).
   python3 build/e2e_revision.py"""
import asyncio, os, subprocess, sys, time
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SHOTS = os.environ.get("SHOTS", "/tmp/tr-shots"); os.makedirs(SHOTS, exist_ok=True)
URL = "http://127.0.0.1:8802/"
problems = []
def bad(m): problems.append(m); print("FAIL", m)

SCALES = r"""() => {
  const out = [], X = PRACTICAL, names = n => n.map(x => nm(x)).join(" ");
  const ex = (type, v, oct, inst) => names(X.notesOf({type, v, oct}, SIGHTREAD.instOf(inst || "violin")));
  const want = {
    "major|0|1": "C D E F G A B C B A G F E D C",
    "melodic|0|1": "A B C D E F♯ G♯ A G F E D C B A",
    "harmonic|-2|1": "G A B♭ C D E♭ F♯ G F♯ E♭ D C B♭ A G",
    "dom7|0|1": "G B D F G F D B G C",
    "dim7|C|1": "C E♭ G♭ B♭♭ C B♭♭ G♭ E♭ C",
    "arpmin|3|1": "F♯ A C♯ F♯ C♯ A F♯",
    "chromatic|D|1": "D D♯ E F F♯ G G♯ A A♯ B C C♯ D D♭ C B B♭ A A♭ G G♭ F E E♭ D"
  };
  for (const k in want) { const [t, v, o] = k.split("|"); const got = ex(t, v, +o); if (got !== want[k]) out.push(k + ": " + got); }
  for (const inst of SIGHTREAD.INST) for (const T of X.TYPES) for (const key of X.keysFor(T.mode, 7)) for (const oct of [1, 2, 3]) {
    const I = SIGHTREAD.instOf(inst.id), sc = {type: T.id, v: key.v, oct}, ns = X.notesOf(sc, I), ms = ns.map(midiOf);
    if (ms[0] < I.low) out.push(inst.id + " " + X.label(sc) + ": below range");
    const top = ms.indexOf(Math.max(...ms));
    for (let i = 1; i <= top; i++) if (ms[i] <= ms[i - 1]) { out.push(inst.id + " " + X.label(sc) + ": not rising"); break; }
    if (ms[top] - ms[0] !== 12 * oct) out.push(inst.id + " " + X.label(sc) + ": span " + (ms[top] - ms[0]));
    if (/undefined|NaN/.test(X.label(sc))) out.push("bad label " + T.id + key.v);
  }
  return [...new Set(out)].slice(0, 30);
}"""

async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8802", "--bind", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch()
            ctx = await b.new_context(viewport={"width": 1100, "height": 900}); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(URL + "privacy.html"); await pg.evaluate("() => localStorage.setItem('tr-preview','paid')")
            await pg.goto(URL + "rooms/aural.html?learner=rv1"); await pg.wait_for_timeout(1300)
            await pg.evaluate("() => { window.open = () => null; }")
            for x in await pg.evaluate(SCALES): bad(x)

            # --- Practical tab ---
            await pg.click("nav.tabs [data-tab=prac]"); await pg.wait_for_timeout(200)
            if await pg.locator("#main .notation svg").count() != 1: bad("coach: no stave")
            await pg.select_option("#pcType", "melodic"); await pg.select_option("#pcKey", "1")
            h = await pg.inner_text("#main h3")
            if "E melodic minor scale" not in h: bad("coach heading: " + h)
            await pg.click("[data-pc-oct='2']"); await pg.click("[data-pc=selfmark]"); await pg.click("[data-pc-self='1']")
            if "Secure" not in await pg.inner_text("#pcbox"): bad("coach self-mark")
            await pg.screenshot(path=SHOTS + "/prac-coach.png", full_page=True)
            await pg.click("[data-pc-mode=exam]"); await pg.click("[data-pc=ask]")
            ask = await pg.inner_text("#main h2 >> nth=1")
            if "octave" not in ask: bad("examiner ask: " + ask)
            if await pg.locator("#main .notation").count(): bad("examiner shows music before asked")
            await pg.click("[data-pc=selfmark]"); await pg.click("[data-pc-self='1']"); await pg.click("[data-pc=ask]")
            await pg.click("[data-pc=show]")
            if await pg.locator("#main .notation svg").count() != 1: bad("examiner: show notes")
            await pg.screenshot(path=SHOTS + "/prac-exam.png", full_page=True)
            await pg.click("[data-pc-mode=diary]"); await pg.click("[data-pc-cat=pieces]")
            await pg.fill("#pcMins", "25"); await pg.click("[data-pc=addMins]"); await pg.wait_for_timeout(100)
            t = await pg.inner_text("#main .statgrid")
            if int(t.split()[0]) < 25: bad("diary minutes: " + t)
            await pg.click("[data-pc=start]"); await pg.wait_for_timeout(1300); await pg.click("[data-pc=saveTime]")
            await pg.screenshot(path=SHOTS + "/prac-diary.png", full_page=True)

            # --- a lesson with mistakes, then the notebook ---
            await pg.click("nav.tabs [data-tab=theory]"); await pg.wait_for_timeout(200)
            if await pg.locator("text=Today's review").count() < 1: bad("theory: no revision section")
            await pg.evaluate("() => { VIEW.lesson = 'g1-notes-treble' in LESSON_BY ? 'g1-notes-treble' : LESSONS.find(l => l.g === 1).id; render(); }")
            await pg.click("[data-act=startLesson]")
            for i in range(8):
                await pg.wait_for_selector("#ex .opt:not([disabled])", timeout=4000)
                ok = await pg.evaluate("() => String(VIEW.round.q.answer)")
                wrong = await pg.evaluate("(a) => [...document.querySelectorAll('#ex .opt')].map(b => b.dataset.arg).find(x => x !== a)", ok)
                await pg.click(f"#ex .opt[data-arg='{wrong if i < 3 else ok}']")
                await pg.click("#nextrow button")
            st = await pg.evaluate("() => ({ miss: (P().miss || []).length, n: Object.values(P().missN || {}).reduce((a, b) => a + b, 0) })")
            if st["miss"] != 3 or st["n"] < 3: bad("mistakes not noted: " + str(st))
            await pg.evaluate("() => { VIEW.round = null; VIEW.lesson = 'review-miss'; render(); }")
            if "Mistakes notebook" not in await pg.inner_text("#main"): bad("notebook missing")
            await pg.click("[data-act=startLesson]")
            for i in range(10):
                await pg.wait_for_selector("#ex .opt:not([disabled]), #ex [data-act=barCheck]", timeout=4000)
                if await pg.locator("#ex .opt:not([disabled])").count():
                    ok = await pg.evaluate("() => String(VIEW.round.q.answer)"); await pg.click(f"#ex .opt[data-arg='{ok}']")
                else:
                    await pg.evaluate("() => { VIEW.round.sel = new Set(VIEW.round.q.correct); }"); await pg.click("#ex [data-act=barCheck]")
                await pg.click("#nextrow button")
            left = await pg.evaluate("() => Object.values(P().missN).reduce((a, b) => a + b, 0)")
            if left != 0: bad("fix round didn't clear mistakes: " + str(left))
            dues = await pg.evaluate("() => TR_REVISION.dueList(P()).length")
            if dues < 1: bad("today's review has nothing due")

            # --- timed mock with the answer review ---
            await pg.evaluate("() => { VIEW.round = null; VIEW.lesson = 'mock-abrsm-g2'; render(); }")
            await pg.click("[data-act=startLesson]")
            for i in range(30):
                await pg.wait_for_selector("#ex .opt:not([disabled]), #ex [data-act=barCheck]", timeout=4000)
                if await pg.locator("#ex .opt:not([disabled])").count(): await pg.click("#ex .opt >> nth=0")
                else: await pg.click("#ex [data-act=barCheck]")
                await pg.click("#nextrow button")
            await pg.wait_for_selector(".rvbox")
            n = await pg.locator(".rvq").count()
            if n != 30: bad("mock review has %d questions" % n)
            await pg.click(".rvbox summary"); await pg.click("[data-rvonly='1']")
            await pg.screenshot(path=SHOTS + "/mock-review.png", full_page=True)

            # --- exam plan ---
            await pg.evaluate("() => { VIEW.round = null; VIEW.lesson = null; render(); }")
            await pg.select_option("#plB", "trinity"); await pg.select_option("#plG", "3")
            await pg.evaluate("() => { const d = new Date(); d.setDate(d.getDate() + 60); document.getElementById('plD').value = todayStr(d); }")
            await pg.click("[data-plan=make]"); await pg.wait_for_selector("#plancard")
            sch = await pg.evaluate("() => { const W = TR_REVISION.schedule(P().plan); return { w: W.length, ls: W.reduce((a, x) => a + x.lessons.length, 0), all: TRINITY_LESSONS.filter(l => l.g === 3).length, mocks: W.slice(-2).every(x => x.tasks.some(t => t[0] === 'mock')) }; }")
            if sch["ls"] < sch["all"] - 2 or not sch["mocks"] or sch["w"] < 8: bad("plan schedule: " + str(sch))
            await pg.screenshot(path=SHOTS + "/plan.png", full_page=True)

            # --- revision books ---
            books = await pg.evaluate(r"""() => { const out = [];
              for (const b of ["abrsm", "trinity"]) for (let g = 1; g <= 8; g++) {
                const h = TR_REVBOOK(b, g), d = new DOMParser().parseFromString(h, "text/html");
                const n = d.querySelectorAll(".lb").length, want = (b === "trinity" ? TRINITY_LESSONS : LESSONS.filter(l => !l.board)).filter(l => l.g === g && !/mixed$|^c[78]-|^mock-|^review-/.test(l.id) && l.gen !== "mix").length;
                if (n !== want) out.push(b + g + ": " + n + " of " + want + " lessons");
                if (/NaN|undefined|\[object/.test(d.body.textContent)) out.push(b + g + ": broken text");
                if (d.querySelectorAll(".answers .a").length < n * .7) out.push(b + g + ": few answers");
              } return out; }""")
            for x in books: bad("book " + x)

            # --- progress tab ---
            await pg.click("nav.tabs [data-tab=progress]"); await pg.wait_for_timeout(200)
            if await pg.locator("#readiness").count() != 1: bad("no readiness panel")
            txt = await pg.inner_text("#readiness")
            if "Grade" not in txt or "scales secure" not in txt: bad("readiness text")
            await pg.click("[data-rdb=trinity]")
            await pg.screenshot(path=SHOTS + "/readiness.png", full_page=True)
            steps = await pg.locator("#readiness [data-totheory]").count()
            if steps:
                await pg.click("#readiness [data-totheory] >> nth=0"); await pg.wait_for_timeout(200)
                if await pg.evaluate("() => VIEW.tab") != "theory": bad("next step didn't open theory")

            # phone width
            await pg.set_viewport_size({"width": 380, "height": 800}); await pg.click("nav.tabs [data-tab=prac]"); await pg.wait_for_timeout(200)
            sw = await pg.evaluate("() => document.documentElement.scrollWidth")
            if sw > 382: bad("practical tab scrolls sideways on a phone: %d" % sw)
            await pg.screenshot(path=SHOTS + "/prac-phone.png", full_page=True)
            for e in errs: bad("page error: " + e)
            await b.close()
    finally:
        srv.terminate()
    print("problems:", len(problems))
    sys.exit(1 if problems else 0)

asyncio.run(main())
