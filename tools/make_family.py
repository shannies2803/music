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

app = open(os.path.join(OUT, "app.html"), encoding="utf-8").read()
for a, b in [("Saving and checking programmes comes with the Family plan.", "Save and check exam programmes."),
             ("Open: free for everyone →", "Open →"), ('"Preview: not signed in"', '"Everything is open. Progress is saved on this device, for each player."'), ('href: "repertoire/"', 'href: "repertoire/index.html"')]:
    app = app.replace(a, b)
open(os.path.join(OUT, "app.html"), "w", encoding="utf-8").write(app)

# the page to publish: the rooms list, without the document wrapper (the host adds its own)
entry = re.sub(r'^<!doctype html>\s*<html[^>]*>\s*<head>\s*<meta charset="utf-8">\s*<meta name="viewport"[^>]*>\s*', "", app, flags=re.I)
entry = entry.replace("</head>", "").replace("<body>", "")
entry = re.sub(r"</body>\s*</html>\s*$", "", entry)
entry = re.sub(r"<title>[^<]*</title>", "<title>Family Music Room</title>", entry, count=1)
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
