"""Every lesson page renders, the fuller explanations are there, and the worked example works.
   python3 build/e2e_lessons.py"""
import asyncio, os, subprocess, sys, time
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SHOTS = os.environ.get("SHOTS", "/tmp/tr-shots"); os.makedirs(SHOTS, exist_ok=True)
URL = "http://127.0.0.1:8808/"
problems = []
def bad(m): problems.append(m); print("FAIL", m)
ALL = r"""() => {
  const out = [], ids = Object.keys(LESSON_BY);
  let wex = 0;
  for (const id of ids) {
    VIEW.tab = "theory"; VIEW.course = null; VIEW.round = null; VIEW.lesson = id; VIEW.wex = id;
    let h = ""; try { h = lessonView(); } catch (e) { out.push(id + ": THROW " + e.message); continue; }
    const txt = h.replace(/<[^>]+>/g, " ");
    if (/\bundefined\b|NaN|\[object/.test(txt)) out.push(id + ": broken text");
    if (h.includes("Worked example")) wex++;
  }
  const lacking = Object.values(LESSON_BY).filter(l => !l.mock && !l.review && !/^ms-|^hw-|^c[78]-|mixed$/.test(l.id) && l.gen !== "rread" && !/lplus/.test(l.h || "")).map(l => l.id);
  lacking.forEach(id => out.push(id + ": no steps/example/watch-out"));
  const guides = Object.keys(LESSON_BY).filter(id => /^guide-/.test(id));
  if (guides.length < 15) out.push("only " + guides.length + " topic guides");
  for (const id of guides) for (let n = 0; n < 20; n++) { VIEW.round = { i: 0, mockFrom: [] }; let q; try { q = TGEN.topicmix(LESSON_BY[id].p); } catch (e) { out.push(id + ": THROW " + e.message); break; } if (!q || !q.prompt) out.push(id + ": no question"); }
  VIEW.round = null;
  const plus = Object.keys(TR_LESSONS_PLUS).filter(id => LESSON_BY[id] && !LESSON_BY[id].h.includes("lplus"));
  plus.forEach(id => out.push(id + ": fuller explanation missing"));
  VIEW.lesson = null; VIEW.wex = null;
  return { out: out.slice(0, 30), n: ids.length, wex, plus: Object.keys(TR_LESSONS_PLUS).length };
}"""
async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8808", "--bind", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1100, "height": 900}); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(URL + "privacy.html"); await pg.evaluate("() => localStorage.setItem('tr-preview','paid')")
            await pg.goto(URL + "rooms/aural.html?learner=le1"); await pg.wait_for_timeout(1300)
            r = await pg.evaluate(ALL); print(r["n"], "lessons;", r["wex"], "with worked examples;", r["plus"], "fuller explanations")
            for x in r["out"]: bad(x)
            if r["wex"] < 150: bad("too few worked examples")
            await pg.click("nav.tabs [data-tab=theory]")
            await pg.evaluate("() => { VIEW.lesson = 'g4-intervals'; render(); }")
            await pg.click("[data-wex]"); await pg.wait_for_selector("#wexBox")
            await pg.screenshot(path=f"{SHOTS}/lesson-plus.png", full_page=True)
            await pg.evaluate("() => { VIEW.lesson = null; render(); }")
            await pg.click("[data-arg=guide-abrsm-intervals]"); await pg.wait_for_timeout(200)
            t = await pg.inner_text("#main")
            if "Grade 1" not in t or "Grade 5" not in t or "Mixed round" not in t: bad("intervals guide: " + t[:200])
            await pg.screenshot(path=f"{SHOTS}/guide.png", full_page=True)
            await pg.click("[data-act=startLesson]")
            for i in range(10):
                await pg.wait_for_selector("#ex .opt:not([disabled]), #ex [data-act=barCheck]", timeout=4000)
                if await pg.locator("#ex .opt:not([disabled])").count(): await pg.click("#ex .opt >> nth=0")
                else: await pg.click("#ex [data-act=barCheck]")
                await pg.click("#nextrow button")
            credited = await pg.evaluate("() => Object.keys(P().tl).filter(id => /intervals/.test(id) && P().tl[id].a > 0).length")
            if credited < 2: bad("guide round didn't credit the lessons: %d" % credited)
            for e in errs: bad("page error: " + e)
            await b.close()
    finally: srv.terminate()
    print("problems:", len(problems)); sys.exit(1 if problems else 0)
asyncio.run(main())
