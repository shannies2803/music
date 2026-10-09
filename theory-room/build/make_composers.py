#!/usr/bin/env python3
"""Count each composer's places on the ABRSM and Trinity lists, from the repertoire guide's data.
   python3 theory-room/build/make_composers.py   →  theory-room/rooms/composers-stats.js
Run it again whenever the repertoire data changes."""
import glob, json, os, collections

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WANT = {  # film id → full name as the repertoire data spells it
    "bach": "Johann Sebastian Bach", "mozart": "Wolfgang Amadeus Mozart", "beethoven": "Ludwig van Beethoven",
    "haydn": "Joseph Haydn", "vivaldi": "Antonio Vivaldi", "brahms": "Johannes Brahms", "grieg": "Edvard Grieg",
    "pachelbel": "Johann Pachelbel", "dvorak": "Antonín Dvořák", "tchaikovsky": "Pyotr Ilyich Tchaikovsky",
    "mussorgsky": "Modest Mussorgsky", "satie": "Erik Satie", "chopin": "Frédéric Chopin",
}
ORDER = ["G0", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "L4", "L6", "L7"]
NAME = {"G0": "Initial", "L4": "diploma", "L6": "diploma", "L7": "diploma"}

by = {k: {"n": 0, "boards": collections.Counter(), "insts": set(), "lvls": set(), "pieces": []} for k in WANT}
full_to_id = {v: k for k, v in WANT.items()}
for f in sorted(glob.glob(os.path.join(ROOT, "repertoire", "data", "*.json"))):
    d = json.load(open(f, encoding="utf-8"))
    C = d.get("C", {})
    for ex in d["exams"]:
        for li, L in enumerate(ex["lists"]):
            for p in L[2]:
                full = (C.get(p[0]) or [p[0]])[0]
                cid = full_to_id.get(full)
                if not cid: continue
                s = by[cid]
                s["n"] += 1; s["boards"][ex["board"]] += 1; s["insts"].add(ex["inst"]); s["lvls"].add(ex["lvl"])
                s["pieces"].append({"t": p[1], "inst": ex["inst"], "lvl": ex["lvl"], "board": ex["board"], "list": L[0]})

out = {}
for cid, s in by.items():
    lv = sorted(s["lvls"], key=ORDER.index)
    lo, hi = lv[0], lv[-1]
    # a spread of examples: different instruments, low to high, both boards
    picks, seen_inst = [], set()
    pieces = sorted(s["pieces"], key=lambda p: (ORDER.index(p["lvl"]), p["inst"]))
    for target in [lo, "G3", "G5", "G8", hi]:
        cands = [p for p in pieces if p["lvl"] == target and p["inst"] not in seen_inst and len(p["t"]) < 70]
        if not cands: cands = [p for p in pieces if p["lvl"] == target and len(p["t"]) < 70]
        if cands:
            want_board = "Trinity" if len(picks) % 2 else "ABRSM"
            c = next((p for p in cands if p["board"] == want_board), cands[0])
            if c not in picks: picks.append(c); seen_inst.add(c["inst"])
    out[cid] = {
        "n": s["n"], "abrsm": s["boards"]["ABRSM"], "trinity": s["boards"]["Trinity"],
        "insts": len(s["insts"]), "lo": NAME.get(lo, "Grade " + lo[1:]), "hi": NAME.get(hi, "Grade " + hi[1:]),
        "examples": picks[:4],
    }
    print(f"{cid:10s} {s['n']:4d} places · {len(s['insts'])} instruments · {out[cid]['lo']} to {out[cid]['hi']}")

dst = os.path.join(ROOT, "rooms", "composers-stats.js")
open(dst, "w", encoding="utf-8").write("/* Made by build/make_composers.py from the repertoire data. Don't edit by hand. */\nwindow.COMPOSER_STATS = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n")
print("wrote", dst)
