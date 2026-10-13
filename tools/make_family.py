"""Build the family edition of The Theory Room: every room open, no plans, prices, locks or preview bar,
   progress kept on the device. Output: a folder ready to publish as a private page.
   python3 tools/make_family.py [out_dir]"""
import os, re, shutil, sys
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "theory-room")
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "family-edition")
SKIP = {"build", "netlify", "supabase", "SETUP.md", "README.md", "netlify.toml", "index.html", "teacher.html", "404.html", "robots.txt"}
if os.path.exists(OUT): shutil.rmtree(OUT)
os.makedirs(OUT)
for name in os.listdir(SRC):
    if name in SKIP or name.startswith("."): continue
    s, d = os.path.join(SRC, name), os.path.join(OUT, name)
    shutil.copytree(s, d) if os.path.isdir(s) else shutil.copy2(s, d)

cfg = open(os.path.join(OUT, "config.js"), encoding="utf-8").read()
cfg = cfg.replace('siteName: "The Theory Room",', 'siteName: "The Theory Room",\n  familyEdition: true,         // everything open, no plans or prices, progress on this device\n  maxLearners: 6,', 1)
assert "familyEdition: true" in cfg
open(os.path.join(OUT, "config.js"), "w", encoding="utf-8").write(cfg)

FAM = os.path.join(os.path.dirname(os.path.abspath(__file__)), "family")
# the kids' home, the grown-ups page and their shared code replace the plan-based dashboard
for name in ("app.html", "parent.html", "family.js"):
    shutil.copy2(os.path.join(FAM, name), os.path.join(OUT, name))
app = open(os.path.join(OUT, "app.html"), encoding="utf-8").read()
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(app)   # a home page for static hosts
# the room notes each day's Ear Gym and review (for stickers) and opens the tab a link asks for
shutil.copy2(os.path.join(FAM, "family-room.js"), os.path.join(OUT, "rooms", "family-room.js"))
au = open(os.path.join(OUT, "rooms", "aural.html"), encoding="utf-8").read()
assert "</body>" in au
au = au.replace("</body>", '<script src="family-room.js"></script>\n</body>', 1)
open(os.path.join(OUT, "rooms", "aural.html"), "w", encoding="utf-8").write(au)

# the page to publish: the kids' home, without the document wrapper (the host adds its own)
entry = re.sub(r'^<!doctype html>\s*<html[^>]*>\s*<head>\s*<meta charset="utf-8">\s*<meta name="viewport"[^>]*>\s*', "", app, flags=re.I)
entry = entry.replace("</head>", "").replace("<body>", "")
entry = re.sub(r"</body>\s*</html>\s*$", "", entry)
open(os.path.join(OUT, "music-room.html"), "w", encoding="utf-8").write(entry)

# nothing private goes in
words = [w.strip() for w in open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "private-words.txt"), encoding="utf-8") if w.strip()]
hits = []
for root, _, files in os.walk(OUT):
    for f in files:
        if "/repertoire" in root or f in ("instruments-stats.js",): continue
        t = open(os.path.join(root, f), encoding="utf-8", errors="ignore").read()
        for w in words:
            if re.search(r"\b" + re.escape(w) + r"\b", t): hits.append((f, w))
print("family edition ->", os.path.abspath(OUT), "| private words found:", hits or "none")
