"""The Handbook: every scale in every key has the right steps, key signatures sit on the right lines,
   the dictionary searches and its flashcards work, every tab draws, and it fits a phone.
   python3 build/e2e_handbook.py"""
import asyncio, os, subprocess, sys, time
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SHOTS = os.environ.get("SHOTS", "/tmp/tr-shots"); os.makedirs(SHOTS, exist_ok=True)
URL = "http://127.0.0.1:8799/"
problems = []
def bad(m): problems.append(m); print("FAIL", m)

CHECK = r"""() => {
  const out = [], H = HANDBOOK;
  const steps = s => s.slice(1).map((n, i) => H.midi(n) - H.midi(s[i])).join("");
  for (let k = -7; k <= 7; k++) {
    if (steps(H.scale(k, "major")) !== "2212221") out.push("major k=" + k + ": " + steps(H.scale(k, "major")));
    if (steps(H.scale(k, "minor", "natural")) !== "2122122") out.push("natural minor k=" + k);
    if (steps(H.scale(k, "minor", "harmonic")) !== "2122131") out.push("harmonic minor k=" + k);
    if (steps(H.scale(k, "minor", "melodic")) !== "2122221") out.push("melodic minor k=" + k);
    for (const sc of [H.scale(k, "major"), H.scale(k, "minor", "harmonic")]) { const L = sc.slice(0, 7).map(n => n.L).sort().join(""); if (L !== "0123456") out.push("letters k=" + k); }
  }
  // known spellings
  const sp = (k, m, kind) => H.scale(k, m, kind).map(H.nm).join(" ");
  if (sp(1, "major") !== "G A B C D E F♯ G") out.push("G major: " + sp(1, "major"));
  if (sp(-4, "minor", "harmonic") !== "F G A♭ B♭ C D♭ E F") out.push("F harmonic minor: " + sp(-4, "minor", "harmonic"));
  if (sp(5, "minor", "harmonic") !== "G♯ A♯ B C♯ D♯ E F× G♯") out.push("G♯ harmonic minor: " + sp(5, "minor", "harmonic"));
  if (H.entries.length < 400) out.push("only " + H.entries.length + " dictionary entries");
  if (H.entries.some(e => !e.t || !e.m)) out.push("empty dictionary entry");
  return out;
}"""

async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8799", "--bind", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
            for w, dark in [(1100, False), (390, True)]:
                ctx = await b.new_context(viewport={"width": w, "height": 900}, color_scheme="dark" if dark else "light"); pg = await ctx.new_page(); errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)))
                await pg.goto(URL + "rooms/handbook.html"); await pg.wait_for_timeout(1300)
                if w == 1100:
                    for x in await pg.evaluate(CHECK): bad(x)
                    await pg.fill("#dq", "slowing"); await pg.wait_for_timeout(200)
                    t = await pg.inner_text("#dlist")
                    if "rallentando" not in t.lower() and "ritardando" not in t.lower(): bad(f"search 'slowing': {t[:200]!r}")
                    await pg.fill("#dq", ""); await pg.click("[data-db=Trinity]"); await pg.select_option("#dg", "4"); await pg.wait_for_timeout(200)
                    if "Trinity Grade 4" not in await pg.inner_text("#dlist") or "ABRSM" in await pg.inner_text("#dlist"): bad("Trinity Grade 4 filter")
                    await pg.click("[data-d=flash]")
                    for _ in range(10):
                        await pg.click("[data-d=show]"); await pg.click("[data-d=yes]")
                    if "You knew 10 of 10" not in await pg.inner_text("#view"): bad("flashcards")
                    await pg.click("[data-db=Instruments]"); await pg.fill("#dq", "col legno"); await pg.wait_for_timeout(200)
                    if "wood of the bow" not in await pg.inner_text("#dlist"): bad("instrument directions in the dictionary")
                for t in ["dict", "keys", "intervals", "values", "clefs", "chords", "ornaments"]:
                    await pg.click(f"[data-tab={t}]"); await pg.wait_for_timeout(150)
                    h = await pg.inner_html("#view")
                    if "NaN" in h or "undefined" in h: bad(f"{t}: broken text")
                    if t == "keys" and w == 1100:
                        await pg.click(".seg[data-k='-3'][data-mode=minor]"); await pg.wait_for_timeout(150)
                        kt = await pg.inner_text("#view")
                        if "C minor" not in kt or "B♭ E♭ A♭" not in kt or "E♭ major" not in kt: bad(f"C minor panel: {kt[:200]!r}")
                        await pg.click("[data-scale='1']")
                    await pg.screenshot(path=f"{SHOTS}/handbook-{t}-{w}.png", full_page=True)
                # speed games: every question is answerable, and a round runs and scores
                chk = await pg.evaluate("""() => { const out = []; for (const id of ["keys", "notes", "ivs"]) for (let i = 0; i < 300; i++) { const q = HANDBOOK.makeQ(id); if (!q.opts.includes(q.right)) out.push(id + ": answer not offered"); if (/NaN|undefined/.test(q.svg + q.right)) out.push(id + ": broken"); } return [...new Set(out)]; }""")
                for x in chk: bad("games " + x)
                await pg.click("[data-tab=games]"); await pg.click("[data-game=ivs]")
                for _ in range(5):
                    await pg.click("[data-ga] >> nth=0")
                if "right" not in await pg.inner_text("#gamebox"): bad("game round")
                await pg.screenshot(path=f"{SHOTS}/handbook-games-{w}.png", full_page=True)
                sw = await pg.evaluate("() => document.documentElement.scrollWidth - innerWidth")
                if sw > 1: bad(f"{w}: sideways scroll {sw}px")
                if errs: bad(f"{w}: {errs[:3]}")
                await ctx.close()
            await b.close()
    finally:
        srv.terminate()
    print("\nPROBLEMS:", len(problems)); [print(" -", x) for x in problems]
    sys.exit(1 if problems else 0)
asyncio.run(main())
