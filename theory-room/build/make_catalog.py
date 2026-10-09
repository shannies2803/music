#!/usr/bin/env python3
"""List what a teacher can set as homework (aural tests, mocks, theory drills, films), read from the rooms themselves.
   python3 theory-room/build/make_catalog.py   →  theory-room/rooms/catalog.js   (needs Playwright)
Run whenever the rooms change."""
import asyncio, json, os, subprocess, sys, time
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

DUMP = """() => {
  const aural = {}, lessons = {};
  for (let g = 1; g <= 8; g++) {
    aural[g] = GRADES[g].tests.map(t => ({ id: t.id, L: t.L, sec: t.sec, t: t.t }));
    lessons[g] = LESSONS.filter(l => l.g === g).map(l => ({ id: l.id, t: l.t, topic: l.topic }))
      .concat((window.TRINITY_LESSONS || []).filter(l => l.g === g).map(l => ({ id: l.id, t: "Trinity: " + l.t, topic: l.topic })));
  }
  return { aural, lessons };
}"""

async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8779", "--bind", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(); pg = await b.new_page()
            await pg.goto("http://127.0.0.1:8779/rooms/aural.html"); await pg.wait_for_timeout(1200)
            cat = await pg.evaluate(DUMP)
            await pg.goto("http://127.0.0.1:8779/rooms/composers.html"); await pg.wait_for_timeout(600)
            cat["films"] = await pg.evaluate("() => COMPOSERS.map(f => ({ id: f.id, t: f.short }))")
            await b.close()
    finally:
        srv.terminate()
    out = os.path.join(ROOT, "rooms", "catalog.js")
    open(out, "w", encoding="utf-8").write("/* Made by build/make_catalog.py. Don't edit by hand. */\nwindow.TR_CATALOG = " + json.dumps(cat, ensure_ascii=False) + ";\n")
    print("aural tests:", sum(len(v) for v in cat["aural"].values()), "· lessons:", sum(len(v) for v in cat["lessons"].values()), "· films:", len(cat["films"]), "→", out)

asyncio.run(main())
