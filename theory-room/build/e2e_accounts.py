"""Browser check of the signed-in path, with a stand-in for Supabase (no real servers).
   python3 theory-room/build/e2e_accounts.py"""
import asyncio, os, subprocess, sys, time
from playwright.async_api import async_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
URL = "http://127.0.0.1:8771/"
problems = []
def bad(m): problems.append(m); print("FAIL", m)

# A tiny in-memory Supabase: enough of the client for tr.js and the repertoire guide. Tables live in localStorage.
FAKE = r"""
const KEY = "fake-db";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
const saveDb = d => localStorage.setItem(KEY, JSON.stringify(d));
const USER = { id: "11111111-1111-1111-1111-111111111111", email: "parent@example.com" };
function q(table) {
  let rows = () => (load()[table] || []), filters = [], op = "select", payload = null, single = false, maybe = false;
  const b = {
    select() { return b; }, order() { return b; },
    eq(c, v) { filters.push(r => r[c] === v); return b; },
    like(c, v) { const p = v.replace(/%$/, ""); filters.push(r => String(r[c]).startsWith(p)); return b; },
    insert(o) { op = "insert"; payload = o; return b; }, update(o) { op = "update"; payload = o; return b; },
    upsert(o) { op = "upsert"; payload = o; return b; }, delete() { op = "delete"; return b; },
    single() { single = true; return b; }, maybeSingle() { maybe = true; return b; },
    then(res, rej) { return Promise.resolve(run()).then(res, rej); }
  };
  function run() {
    const d = load(); d[table] = d[table] || [];
    if (op === "insert") { const r = Object.assign({ id: crypto.randomUUID(), created_at: new Date().toISOString() }, payload); d[table].push(r); saveDb(d); return { data: single ? r : [r], error: null }; }
    if (op === "upsert") { const key = table === "progress" ? r => r.learner_id === payload.learner_id && r.path === payload.path : r => r.user_id === payload.user_id;
      const i = d[table].findIndex(key); if (i >= 0) d[table][i] = Object.assign(d[table][i], payload); else d[table].push(payload); saveDb(d); return { data: null, error: null }; }
    const hit = d[table].filter(r => filters.every(f => f(r)));
    if (op === "update") { hit.forEach(r => Object.assign(r, payload)); saveDb(d); return { data: null, error: null }; }
    if (op === "delete") { d[table] = d[table].filter(r => !hit.includes(r)); saveDb(d); return { data: null, error: null }; }
    if (maybe || single) return { data: hit[0] || null, error: null };
    return { data: hit, error: null };
  }
  return b;
}
export function createClient() {
  const d = load(); d.profiles = d.profiles || [{ id: USER.id, email: USER.email, pro_until: null, packs: {} }]; saveDb(d);
  return {
    auth: {
      getSession: async () => ({ data: { session: localStorage.getItem("fake-out") ? null : { user: USER, access_token: "tok", expires_in: 3600 } } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithOtp: async () => ({ error: null }), signOut: async () => { localStorage.setItem("fake-out", "1"); return { error: null }; }
    },
    from: q,
    rpc: async (name) => ({ data: name === "my_classes" || name === "teacher_classes" ? [] : null, error: null })
  };
}
"""

async def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8771", "--bind", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch()
            ctx = await b.new_context(viewport={"width": 1200, "height": 900})
            async def fake_sb(route): await route.fulfill(status=200, content_type="text/javascript", body=FAKE)
            await ctx.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm", fake_sb)
            async def cfg(route):
                r = await route.fetch(); body = await r.text()
                body = body.replace('supabaseUrl: "",', 'supabaseUrl: "https://fake.supabase.co",', 1).replace('supabaseAnonKey: "",', 'supabaseAnonKey: "anon",', 1)
                await route.fulfill(status=200, content_type="text/javascript", body=body)
            await ctx.route("**/config.js", cfg)
            pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))

            await pg.goto(URL + "app.html"); await pg.wait_for_timeout(1200)
            main = await pg.inner_text("main")
            if "parent@example.com" not in main: bad("app: email not shown")
            if "Practising today: Learner 1" not in main: bad("app: first learner not made")
            if await pg.locator("#tr-preview").count(): bad("app: preview bar shown when configured")
            if "Payments aren't switched on yet" not in main: bad("app: missing payments-not-set note")
            cookie = await pg.evaluate("() => document.cookie")
            if "tr_at=tok" not in cookie: bad(f"app: gate cookie not set ({cookie!r})")

            # rename, add, then use the second learner in the aural room
            await pg.click("details.manage summary")
            await pg.fill("#rename", "Mei"); await pg.click("#renameForm button[type=submit]"); await pg.wait_for_timeout(200)
            await pg.fill("#newName", "Kai"); await pg.click("#addForm button"); await pg.wait_for_timeout(300)
            names = await pg.inner_text(".learners")
            if "Mei" not in names or "Kai" not in names: bad(f"app: learners {names!r}")
            kai = await pg.evaluate("() => TR.learners.find(l => l.name === 'Kai').id")

            await pg.goto(URL + f"rooms/aural.html?learner={kai}"); await pg.wait_for_timeout(2000)
            name = await pg.evaluate("() => P().name")
            if name != "Kai": bad(f"aural: player is {name!r}")
            await pg.evaluate("() => { P().xp = 42; save(); }"); await pg.wait_for_timeout(2200)
            prog = await pg.evaluate("() => (JSON.parse(localStorage.getItem('fake-db')).progress || [])")
            row = [r for r in prog if r["learner_id"] == kai]
            if not row or '"xp":42' not in (row[0]["data"] or {}).get("j", ""): bad(f"aural: progress not saved for Kai ({prog[:1]})")

            # the course saves into the learner's own row
            await ctx.close()
            ctx = await b.new_context(viewport={"width": 1200, "height": 900})
            await ctx.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm", fake_sb)
            await ctx.route("**/config.js", cfg)
            pg = await ctx.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(URL + "app.html"); await pg.wait_for_timeout(1000)
            await pg.evaluate("() => { const d = JSON.parse(localStorage.getItem('fake-db')); d.profiles[0].packs = { g4: '2099-01-01' }; localStorage.setItem('fake-db', JSON.stringify(d)); }")
            await pg.reload(); await pg.wait_for_timeout(1000)
            if "Grade pack: Grade 4" not in await pg.inner_text("main"): bad("app: pack label")
            lid = await pg.evaluate("() => TR.learner.id")
            await pg.goto(URL + f"rooms/theory-g1-5.html?learner={lid}"); await pg.wait_for_timeout(2000)
            sync = await pg.evaluate("() => (document.getElementById('sync')||{}).textContent || ''")
            await pg.evaluate("() => { state.notes = { test: 'hello' }; save(); }"); await pg.wait_for_timeout(800)
            prog = await pg.evaluate("() => (JSON.parse(localStorage.getItem('fake-db')).progress || [])")
            if not any(r["learner_id"] == lid and r["path"] == "progress/g1-5" and (r["data"] or {}).get("notes", {}).get("test") == "hello" for r in prog):
                bad(f"course: progress not saved (sync text {sync!r})")
            await pg.goto(URL + "rooms/aural.html"); await pg.wait_for_timeout(1500)
            locked = await pg.evaluate("() => [...document.querySelectorAll('a.gbtn.tr-lock')].map(a => a.textContent)")
            if any("Grade 4" in x for x in locked) or not any("Grade 5" in x for x in locked): bad(f"aural with Grade 4 pack: locked {locked}")
            if errs: bad(f"page errors: {errs[:3]}")
            await b.close()
    finally:
        srv.terminate()
    print("\nPROBLEMS:", len(problems)); [print(" -", x) for x in problems]
    sys.exit(1 if problems else 0)

asyncio.run(main())
