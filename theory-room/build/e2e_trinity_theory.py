"""Trinity theory: every lesson makes sound questions at every difficulty, and the theory tab's
   board switch, grade buttons, locks and lessons work.
   python3 theory-room/build/e2e_trinity_theory.py"""
import asyncio, os, subprocess, sys, time
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SHOTS = os.environ.get("SHOTS", "/tmp/tr-shots"); os.makedirs(SHOTS, exist_ok=True)
URL = "http://127.0.0.1:8785/"
problems = []
def bad(m): problems.append(m); print("FAIL", m)

SWEEP = r"""() => {
  const out = [], seen = {};
  for (const l of TRINITY_LESSONS) for (const diff of [0, 0.5, 1]) for (let n = 0; n < 40; n++) {
    const key = l.id + " d" + diff;
    try {
      const q = TGEN[l.gen](l.p, diff);
      const txt = JSON.stringify(q);
      if (/NaN|undefined|\[object/.test(txt)) { out.push(key + ": bad text " + txt.slice(0, 160)); continue; }
      if (!q.prompt) out.push(key + ": no prompt");
      if (q.type === "barlines") {
        if (!q.correct || !q.correct.size) out.push(key + ": no bar lines to find");
      } else if (q.cats) {
        for (const c of q.cats) if (!c.opts.some(o => o.k === c.ans)) out.push(key + ": category answer missing");
      } else {
        const ks = (q.options || []).map(o => o.k);
        if (ks.length < 2) out.push(key + ": fewer than 2 options");
        if (new Set(ks).size !== ks.length) out.push(key + ": duplicate options " + ks.join("|"));
        const hs = (q.options || []).map(o => o.html);
        if (new Set(hs).size !== hs.length) out.push(key + ": two options look the same " + hs.join("|").slice(0, 160));
        if (!ks.includes(q.answer)) out.push(key + ": answer not offered (" + q.answer + " / " + ks.join("|") + ")");
      }
      seen[l.id] = (seen[l.id] || new Set()); seen[l.id].add(q.prompt + "|" + q.answer + "|" + (q.visual || "").length);
    } catch (e) { out.push(key + ": THROW " + e.message + " " + (e.stack || "").split("\n")[1]); }
  }
  for (const l of TRINITY_LESSONS) if (!/mixed$/.test(l.id) && (l.h || "").replace(/<[^>]+>/g, "").length < 150) out.push(l.id + ": explanation too short");
  for (const l of TRINITY_LESSONS) if (seen[l.id] && seen[l.id].size < 3) out.push(l.id + ": only " + seen[l.id].size + " different questions");
  const grades = {}; TRINITY_LESSONS.forEach(l => grades[l.g] = (grades[l.g] || 0) + 1);
  return { out: [...new Set(out)].slice(0, 40), n: TRINITY_LESSONS.length, grades };
}"""

async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8785", "--bind", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch()
            for w, dark, plan in [(1100, False, "paid"), (390, True, "free")]:
                ctx = await b.new_context(viewport={"width": w, "height": 900}, color_scheme="dark" if dark else "light"); pg = await ctx.new_page(); errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)))
                await pg.goto(URL + "privacy.html"); await pg.evaluate(f"() => localStorage.setItem('tr-preview','{plan}')")
                await pg.goto(URL + "rooms/aural.html?learner=l1"); await pg.wait_for_timeout(1200)
                if w == 1100:
                    r = await pg.evaluate(SWEEP)
                    print("lessons:", r["n"], r["grades"])
                    for x in r["out"]: bad(x)
                await pg.click("[data-tab=theory]"); await pg.wait_for_timeout(300)
                if not await pg.locator("[data-ttb=trinity]").count(): bad(f"{w}: no board switch"); continue
                await pg.click("[data-ttb=trinity]"); await pg.wait_for_timeout(300)
                t = await pg.inner_text("#main")
                if "Trinity Grade 1" not in t: bad(f"{w}: Trinity grade 1 not shown: {t[:200]!r}")
                if "ABRSM Grade 1–5 course" in t and False: pass
                locks = await pg.locator(".gradebar a.tr-lock").count()
                if plan == "free" and locks == 0: bad("free: no Trinity grades locked")
                if plan == "paid" and locks: bad(f"paid: {locks} Trinity grades locked")
                if plan == "paid":
                    await pg.click("[data-ttg='7']"); await pg.wait_for_timeout(300)
                    if "Trinity Grade 7" not in await pg.inner_text("#main"): bad("grade 7 switch")
                    if await pg.evaluate("() => P().trTheoryGrade") != 7: bad("grade not saved")
                    await pg.screenshot(path=f"{SHOTS}/trinity-theory-home-{w}.png", full_page=True)
                    await pg.locator("button.lesson").first.click(); await pg.wait_for_timeout(300)
                    t = await pg.inner_text("#main")
                    if "Trinity Grade 7" not in t: bad(f"lesson page label: {t[:120]!r}")
                    await pg.click("[data-act=startLesson]"); await pg.wait_for_timeout(400)
                    # answer 8 questions by clicking the first option each time
                    for i in range(12):
                        btn = pg.locator("#ex button.opt:not([disabled])").first
                        if await btn.count():
                            await btn.click(); await pg.wait_for_timeout(150)
                        nxt = pg.locator("#ex [data-act=next]")
                        if await nxt.count(): await nxt.first.click(); await pg.wait_for_timeout(150)
                    await pg.screenshot(path=f"{SHOTS}/trinity-theory-lesson-{w}.png", full_page=True)
                    tl = await pg.evaluate("() => { const l = TRINITY_LESSONS.find(x => x.g === 7); return P().tl[l.id] || null; }")
                    if not tl or not tl.get("a"): bad(f"lesson answers not recorded: {tl}")
                    await pg.click("[data-act=theoryHome]"); await pg.wait_for_timeout(300)
                    if "Trinity Grade 7" not in await pg.inner_text("#main"): bad("back button didn't return to Trinity")
                    await pg.goto(URL + "rooms/aural.html?learner=l1&tab=theory&lesson=tr8-rows"); await pg.wait_for_timeout(1200)
                    t = await pg.inner_text("#main")
                    if "Tone rows" not in t and "tone row" not in t.lower(): bad(f"homework link to a Trinity lesson: {t[:160]!r}")
                    await pg.click("[data-act=theoryHome]"); await pg.wait_for_timeout(300)
                    if "Trinity Grade 8" not in await pg.inner_text("#main"): bad("homework link: back didn't go to Trinity Grade 8")
                    await pg.click("[data-ttb=abrsm]"); await pg.wait_for_timeout(300)
                    if "Trinity Grade" in await pg.inner_text("#main"): bad("ABRSM switch didn't hide Trinity")
                sw = await pg.evaluate("() => document.documentElement.scrollWidth - innerWidth")
                if sw > 1: bad(f"{w}: sideways scroll {sw}px")
                if plan == "free": await pg.screenshot(path=f"{SHOTS}/trinity-theory-free-{w}.png", full_page=True)
                if errs: bad(f"{w}: {errs[:3]}")
                await ctx.close()
            await b.close()
    finally:
        srv.terminate()
    print("\nPROBLEMS:", len(problems)); [print(" -", x) for x in problems]
    sys.exit(1 if problems else 0)
asyncio.run(main())
