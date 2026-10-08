"""Sight-reading: pieces are well formed at every grade and for every instrument, the tab works,
   and a played performance (a synthesised recording fed in as the microphone) is marked right,
   while a performance with wrong notes is not.
   python3 theory-room/build/e2e_sightread.py"""
import asyncio, json, math, os, struct, subprocess, sys, tempfile, time, wave
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SHOTS = os.environ.get("SHOTS", "/tmp/tr-shots"); os.makedirs(SHOTS, exist_ok=True)
URL = "http://127.0.0.1:8784/"
problems = []
def bad(m): problems.append(m); print("FAIL", m)

CHECK = r"""() => {
  const out = [], SR = SIGHTREAD;
  for (const inst of SR.INST) for (let g = 1; g <= 8; g++) for (let n = 0; n < 25; n++) {
    const key = inst.id + " G" + g;
    try {
      const pc = SR.makePiece(g, inst), G = SR.GR[g];
      let t = 0; for (const x of pc.notes) { if (Math.abs(x.t - t) > 1e-6) { out.push(key + ": gap or overlap"); break; } t += x.d; }
      if (Math.abs(t - G.bars * pc.beats) > 1e-6) out.push(key + ": length " + t + " not " + G.bars * pc.beats);
      const ms = pc.notes.filter(x => !x.rest).map(x => x.m);
      if (ms.some(m => m < inst.low - 1)) out.push(key + ": below the instrument's range");
      if (Math.max(...ms) - Math.min(...ms) > G.span + 2) out.push(key + ": range too wide " + (Math.max(...ms) - Math.min(...ms)));
      if (pc.notes[pc.notes.length - 1].rest || (pc.notes[pc.notes.length - 1].m - pc.tonic) % 12) out.push(key + ": doesn't end on the tonic");
      for (let b = 0; b < G.bars; b++) { const inBar = pc.notes.filter(x => x.t >= b * pc.beats - 1e-6 && x.t < (b + 1) * pc.beats - 1e-6); const s = inBar.reduce((a, x) => a + x.d, 0); if (Math.abs(s - pc.beats) > 1e-6) { out.push(key + ": a note crosses a barline"); break; } }
      if (g <= 3 && pc.notes.some(x => x.rest)) out.push(key + ": rests before Grade 4");
      if (g <= 4 && pc.notes.some(x => x.d === .25)) out.push(key + ": semiquavers before Grade 5");
      const kp = keyPcs(((pc.tonic % 12) + 12) % 12, pc.mode); if (pc.notes.some(x => !x.rest && !kp.includes(((x.m % 12) + 12) % 12))) out.push(key + ": a note outside the key");
      const svg = SR.scoreSVG(pc, inst); if (/NaN|undefined/.test(svg)) out.push(key + ": bad notation");
      const T = SR.target(pc, inst); if (Math.abs(T.reduce((a, x) => a + x.d, 0) - t) > 1e-6 && !pc.notes[0].rest) out.push(key + ": target length");
    } catch (e) { out.push(key + ": THROW " + e.message + " " + (e.stack || "").split("\n")[1]); }
  }
  return [...new Set(out)].slice(0, 30);
}"""

def synth(path, notes, tempo, wrong=(), beats=4):
    """A plucked-string-ish tone for each note, at the piece's tempo, after the count-in bar."""
    sr = 44100; spb = 60 / tempo; frames = []
    total = notes[-1]["t"] + notes[-1]["d"]
    lead = beats * spb + 0.25  # the player starts after the one-bar count-in
    n = int((lead + total * spb + 2.5) * sr); buf = [0.0] * n
    for i, x in enumerate(notes):
        if x.get("rest"): continue
        m = x["m"] + (3 if i in wrong else 0); f = 440 * 2 ** ((m - 69) / 12)
        st = int((lead + x["t"] * spb) * sr); ln = int(x["d"] * spb * sr * 0.92)
        for k in range(ln):
            env = min(1, k / 300) * math.exp(-k / (sr * 1.2))
            v = env * (0.6 * math.sin(2 * math.pi * f * k / sr) + 0.25 * math.sin(4 * math.pi * f * k / sr) + 0.1 * math.sin(6 * math.pi * f * k / sr))
            if st + k < n: buf[st + k] += v * 0.5
    with wave.open(path, "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, v)) * 30000)) for v in buf))

async def mic_run(p, piece, wavpath):
    b = await p.chromium.launch(args=["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", f"--use-file-for-fake-audio-capture={wavpath}%noloop", "--autoplay-policy=no-user-gesture-required"])
    ctx = await b.new_context(); await ctx.grant_permissions(["microphone"], origin=URL.rstrip("/"))
    pg = await ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(URL + "privacy.html"); await pg.evaluate("() => localStorage.setItem('tr-preview','paid')")
    await pg.goto(URL + "rooms/aural.html?learner=l1"); await pg.wait_for_timeout(1200)
    await pg.click("[data-tab=read]"); await pg.wait_for_timeout(200)
    await pg.select_option("#rdInst", "flute"); await pg.wait_for_timeout(200)
    await pg.click("[data-rd-g='3']"); await pg.wait_for_timeout(200)
    await pg.evaluate(f"() => {{ SIGHTREAD.S.pc = {json.dumps(piece)}; SIGHTREAD.S.phase = 'ready'; render(); }}")
    await pg.click("[data-rd=play]")
    for _ in range(60):
        await pg.wait_for_timeout(500)
        if await pg.evaluate("() => SIGHTREAD.S.phase === 'done'"): break
    res = await pg.evaluate("() => SIGHTREAD.S.result && SIGHTREAD.S.result.val")
    txt = await pg.inner_text("#rdbox") if await pg.locator("#rdbox").count() else ""
    await b.close()
    return res, txt, errs

async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8784", "--bind", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch()
            for w, dark in [(1100, False), (390, True)]:
                ctx = await b.new_context(viewport={"width": w, "height": 900}, color_scheme="dark" if dark else "light"); pg = await ctx.new_page(); errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)))
                await pg.goto(URL + "privacy.html"); await pg.evaluate("() => localStorage.setItem('tr-preview','free')")
                await pg.goto(URL + "rooms/aural.html?learner=l1"); await pg.wait_for_timeout(1200)
                if w == 1100:
                    for x in await pg.evaluate(CHECK): bad(x)
                await pg.click("[data-tab=read]"); await pg.wait_for_timeout(300)
                t = await pg.inner_text("#main")
                if "Sight-reading" not in t or "grade 1 · violin" not in t.lower(): bad(f"tab {w}: {t[:120]!r}")
                if not await pg.locator("a.gbtn.tr-lock").count(): bad("free: higher grades not locked")
                await pg.select_option("#rdInst", "cello"); await pg.wait_for_timeout(200)
                if "Cello" not in await pg.inner_text("#main"): bad("instrument change")
                await pg.click("[data-rd=ready]"); await pg.click("[data-rd=self]"); await pg.click("[data-rd-self='1']"); await pg.wait_for_timeout(200)
                if "Well played" not in await pg.inner_text("#rdbox"): bad("self-mark")
                if await pg.evaluate("() => P().read[1].n") != 1: bad("self-mark not recorded")
                sw = await pg.evaluate("() => document.documentElement.scrollWidth - innerWidth")
                if sw > 1: bad(f"{w}: sideways scroll {sw}px")
                await pg.screenshot(path=f"{SHOTS}/sightread-{w}.png", full_page=True)
                if errs: bad(f"{w}: {errs[:3]}")
                await ctx.close()
            # make one Grade 3 flute piece to play into the microphone
            ctx = await b.new_context(); pg = await ctx.new_page()
            await pg.goto(URL + "rooms/aural.html"); await pg.wait_for_timeout(1200)
            piece = await pg.evaluate("() => { for (;;) { const pc = SIGHTREAD.makePiece(3, SIGHTREAD.instOf('flute')); if (pc.notes.filter(n => !n.rest).length >= 10) return pc; } }")
            await b.close()
            tmp = tempfile.mkdtemp()
            synth(os.path.join(tmp, "good.wav"), piece["notes"], piece["tempo"], beats=piece["beats"])
            notes_idx = [i for i, n in enumerate(piece["notes"]) if not n.get("rest")]
            synth(os.path.join(tmp, "wrong.wav"), piece["notes"], piece["tempo"], wrong=set(notes_idx[2:5]), beats=piece["beats"])
            val, txt, errs = await mic_run(p, piece, os.path.join(tmp, "good.wav"))
            print("good playing →", val, "|", txt[:160].replace("\n", " "))
            if val != 1: bad(f"good playing marked {val}")
            val2, txt2, errs2 = await mic_run(p, piece, os.path.join(tmp, "wrong.wav"))
            print("wrong notes →", val2, "|", txt2[:160].replace("\n", " "))
            if val2 is None or val2 >= 1: bad(f"wrong notes marked {val2}")
            if errs or errs2: bad(f"mic page errors: {(errs + errs2)[:3]}")
    finally:
        srv.terminate()
    print("\nPROBLEMS:", len(problems)); [print(" -", x) for x in problems]
    sys.exit(1 if problems else 0)
asyncio.run(main())
