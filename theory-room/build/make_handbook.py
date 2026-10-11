#!/usr/bin/env python3
"""Collect every ABRSM and Trinity term from the theory room for the Handbook's dictionary.
   python3 build/make_handbook.py  →  rooms/handbook-terms.js   (needs Playwright; run after the rooms change)"""
import asyncio, json, os, subprocess, sys, time
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8798", "--bind", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(); pg = await b.new_page()
            await pg.goto("http://127.0.0.1:8798/rooms/aural.html"); await pg.wait_for_timeout(1300)
            data = await pg.evaluate("() => ({ abrsm: TERMS.map(t => [t[0], t[1], t[2], t[3]]), trinity: Object.entries(window.TRINITY_TERMS || {}).flatMap(([g, l]) => l.map(t => [t[0], t[1], +g])) })")
            await b.close()
    finally:
        srv.terminate()
    out = os.path.join(ROOT, "rooms", "handbook-terms.js")
    open(out, "w", encoding="utf-8").write("/* Made by build/make_handbook.py from the theory room. Don't edit by hand. */\nwindow.HANDBOOK_TERMS = " + json.dumps(data, ensure_ascii=False) + ";\n")
    print("ABRSM terms:", len(data["abrsm"]), "· Trinity terms:", len(data["trinity"]), "→", out)
asyncio.run(main())
