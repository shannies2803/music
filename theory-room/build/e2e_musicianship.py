"""Musicianship drills: questions on a piece, spot the mistake, periods, form.
   python3 build/e2e_musicianship.py"""
import asyncio, os, subprocess, sys, time
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SHOTS = os.environ.get("SHOTS", "/tmp/tr-shots"); os.makedirs(SHOTS, exist_ok=True)
URL = "http://127.0.0.1:8806/"
problems = []
def bad(m): problems.append(m); print("FAIL", m)
GEN = r"""() => {
  const out = [];
  const ids = Object.keys(LESSON_BY).filter(id => /^ms-/.test(id));
  for (const id of ids) for (let n = 0; n < 200; n++) {
    const l = LESSON_BY[id]; let q; try { q = TGEN[l.gen](l.p, .5); } catch (e) { out.push(id + ": THROW " + e.message); continue; }
    const ks = q.options.map(o => o.k);
    if (!ks.includes(String(q.answer))) out.push(id + ": answer not offered");
    if (new Set(ks).size !== ks.length) out.push(id + ": repeated option " + ks.join("|"));
    if (ks.length < (l.gen === "keymm" ? 2 : 3)) out.push(id + ": only " + ks.length + " options");
    if (new Set(q.options.map(o => o.html)).size !== ks.length) out.push(id + ": two options look the same");
    if (/NaN|undefined|\[object/.test(q.prompt + q.explain + (q.visual || "") + q.options.map(o => o.html).join(""))) out.push(id + ": broken text");
    if (l.gen === "spotbar") { const m = /adds up to <b>([^<]+)<\/b> instead of (\d+)/.exec(q.explain); if (!m || m[1] === m[2] + " beats") out.push(id + ": bad mistake " + q.explain.slice(0, 80)); }
  }
  return { out: [...new Set(out)].slice(0, 30), n: ids.length };
}"""
async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8806", "--bind", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1100, "height": 900}); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(URL + "privacy.html"); await pg.evaluate("() => localStorage.setItem('tr-preview','paid')")
            await pg.goto(URL + "rooms/aural.html?learner=ms1"); await pg.wait_for_timeout(1300)
            r = await pg.evaluate(GEN); print(r["n"], "lessons checked")
            for x in r["out"]: bad(x)
            await pg.click("nav.tabs [data-tab=theory]"); await pg.wait_for_timeout(200)
            if "Musicianship" not in await pg.inner_text("#main"): bad("no musicianship section")
            for lid in ["ms-piece-g5", "ms-spot-g2", "ms-periods", "ms-form", "ms-group-g4", "ms-complete-g3", "ms-ornaments", "ms-hear-g2", "ms-score", "ms-keymm-g4"]:
                await pg.click(f"[data-arg={lid}]"); await pg.click("[data-act=startLesson]"); await pg.wait_for_selector("#ex .opt")
                await pg.click("#ex .opt >> nth=0"); await pg.wait_for_selector("#fb.show")
                await pg.screenshot(path=f"{SHOTS}/{lid}.png", full_page=True)
                await pg.click("[data-act=quit]"); await pg.click("[data-act=theoryHome] >> nth=0"); await pg.wait_for_timeout(150)
            # practical: my pieces
            await pg.click("nav.tabs [data-tab=prac]"); await pg.click("[data-pc-mode=pieces]")
            await pg.fill("#pcNewT", "Minuet in G (test)"); await pg.select_option("#pcNewL", "A"); await pg.click("[data-pc=addPiece]")
            await pg.click("[data-pc-stage='0:2']"); await pg.click("[data-pc-play='0']")
            await pg.fill("#pcTricky0", "bars 9-12"); await pg.press("#pcTricky0", "Tab")
            st = await pg.evaluate("() => P().pieces[0]")
            if st.get("stage") != 2 or not st.get("days") or st.get("tricky") != "bars 9-12": bad("pieces tracker: " + str(st))
            await pg.screenshot(path=f"{SHOTS}/pieces.png", full_page=True)
            # metronome and tuner
            await pg.click("[data-pc-mode=metro]"); await pg.click("[data-mt-b='3']"); await pg.click("[data-mt-d='5']")
            if "85" not in await pg.inner_text("#mtBpm"): bad("metronome +5")
            await pg.click("[data-pc=mtStart]"); await pg.wait_for_timeout(1600)
            lit = await pg.evaluate("() => [...document.querySelectorAll('#mtDots [data-dot]')].filter(d => d.style.background && !/line/.test(d.style.background)).length")
            if lit != 1: bad("metronome beat light: %d" % lit)
            await pg.click("[data-pc=mtStop]")
            await pg.click("[data-pc-mode=tuner]")
            if "Tuner" not in await pg.inner_text("#main"): bad("tuner view")
            # questions on my piece
            await pg.click("[data-pc-mode=know]"); await pg.click("[data-pc-kg='3']"); await pg.click("[data-pc=kAsk]"); await pg.click("[data-pc=kShow]")
            if "A good answer includes" not in await pg.inner_text("#main"): bad("knowledge cards")
            await pg.screenshot(path=f"{SHOTS}/know.png", full_page=True)
            # improvise: every key and pattern names real chords; the backing plays and highlights bars
            ch = await pg.evaluate("""() => { const out = []; document.querySelectorAll('#ivKey option').length; return out; }""")
            await pg.click("[data-pc-mode=improv]")
            for ki in range(8):
                await pg.select_option("#ivKey", str(ki))
                n = await pg.locator("#ivProg option").count()
                for pi in range(n):
                    await pg.select_option("#ivProg", str(pi))
                    t = await pg.inner_text("#main")
                    if "undefined" in t or "NaN" in t: bad(f"improv key {ki} prog {pi}: broken")
            await pg.select_option("#ivKey", "0"); await pg.select_option("#ivStyle", "1")
            await pg.click("[data-pc=ivPlay]"); await pg.wait_for_timeout(2600)
            lit = await pg.evaluate("() => [...document.querySelectorAll('[id^=ivBar]')].filter(e => e.style.outline).length")
            if lit != 1: bad(f"improv highlight: {lit}")
            names = await pg.evaluate("() => [...document.querySelectorAll('[id^=ivBar] b')].map(b => b.textContent).join(' ')")
            print("C major chords:", names)
            await pg.screenshot(path=f"{SHOTS}/improv.png", full_page=True)
            await pg.click("[data-pc=ivStop]")
            await pg.goto(URL + "rooms/handbook.html#style"); await pg.wait_for_timeout(600)
            t = await pg.inner_text("#view")
            if "Baroque" not in t or "Rondo" not in t: bad("handbook form & style")
            await pg.click("[data-tab=score]"); await pg.wait_for_timeout(300)
            if "Fagotto" not in await pg.inner_text("#view"): bad("handbook scores tab")
            for e in errs: bad("page error: " + e)
            await b.close()
    finally: srv.terminate()
    print("problems:", len(problems)); sys.exit(1 if problems else 0)
asyncio.run(main())
