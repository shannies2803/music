#!/usr/bin/env python3
"""Count each instrument's pieces on the ABRSM and Trinity lists, for the Instruments room.
   python3 build/make_instruments.py  →  rooms/instruments-stats.js"""
import collections, glob, json, os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ORDER = ["G0", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "L4", "L6", "L7"]
NAME = {"G0": "Initial", "L4": "diploma", "L6": "diploma", "L7": "diploma"}
src = open(os.path.join(ROOT, "rooms", "instruments.js"), encoding="utf-8").read()
want = dict(re.findall(r'id: "([a-z]+)", name: "[^"]+", family: "[^"]+", exam: "([^"]+)"', src))
by = {k: {"n": 0, "abrsm": 0, "trinity": 0, "lv": set(), "composers": collections.Counter()} for k in want}
inst_to = collections.defaultdict(list)
for k, v in want.items(): inst_to[v].append(k)
for f in sorted(glob.glob(os.path.join(ROOT, "repertoire", "data", "*.json"))):
    d = json.load(open(f, encoding="utf-8")); C = d.get("C", {})
    for ex in d["exams"]:
        for k in inst_to.get(ex["inst"], []):
            s = by[k]
            for L in ex["lists"]:
                for p in L[2]:
                    s["n"] += 1; s["abrsm" if ex["board"] == "ABRSM" else "trinity"] += 1; s["lv"].add(ex["lvl"])
                    full = (C.get(p[0]) or [p[0]])[0]
                    if full and not full.startswith("Trad") and "arr." not in full and len(full) < 40: s["composers"][full] += 1
out = {}
for k, s in by.items():
    lv = sorted(s["lv"], key=ORDER.index)
    out[k] = {"n": s["n"], "abrsm": s["abrsm"], "trinity": s["trinity"],
              "lo": NAME.get(lv[0], "Grade " + lv[0][1:]) if lv else "", "hi": NAME.get(lv[-1], "Grade " + lv[-1][1:]) if lv else "",
              "top": [c for c, _ in s["composers"].most_common(5)]}
    print(f"{k:12s} {s['n']:5d} pieces · {out[k]['lo']} to {out[k]['hi']} · {', '.join(out[k]['top'][:3])}")
dst = os.path.join(ROOT, "rooms", "instruments-stats.js")
open(dst, "w", encoding="utf-8").write("/* Made by build/make_instruments.py from the repertoire data. Don't edit by hand. */\nwindow.INSTRUMENT_STATS = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n")
print("wrote", dst)
