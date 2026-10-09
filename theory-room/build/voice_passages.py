#!/usr/bin/env python3
"""Voice the four-part passages used by the Grade 7-8 'figure the passage' drills.
   Each passage is written in C major or A minor as chord spellings over a given bass; this
   searches every voicing and keeps the smoothest one that breaks none of the rules below.
   python3 build/voice_passages.py > /tmp/p.js, then put it after the comment line in rooms/passages.js
Rules: parts in range and not crossing; no gap over an octave between upper parts; no consecutive
5ths, octaves or unisons; no hidden 5ths/octaves in the outer parts unless the soprano steps;
leading note never doubled and rising to the tonic in the soprano; 7ths (and the ♭2 of the
Neapolitan) falling by step; augmented 6ths opening outward by semitone; chords complete
(the 5th may go in V7 and I/i after V7); no leap bigger than a 6th in an upper part."""
import itertools, json, sys

LET = "CDEFGAB"; STEP = [0, 2, 4, 5, 7, 9, 11]
def parse(s):
    L = LET.index(s[0]); acc = s.count("#") - s.count("b"); return L, acc
def midi(name):  # "G#3"
    L, acc = parse(name[:-1]); o = int(name[-1]); return 12 * (o + 1) + STEP[L] + acc
def names_in_range(pc_name, lo, hi):
    return [pc_name + str(o) for o in range(1, 7) if lo <= midi(pc_name + str(o)) <= hi]

RANGE = {"S": (60, 79), "A": (55, 74), "T": (48, 67)}

# chord: (label, base figures, bass note, chord tones root-first, flags)
P = {
 "cad64": ("major", [("I", [], "C3", "C E G"), ("IIb", [6], "F2", "D F A"), ("Ic", [6, 4], "G2", "C E G"), ("V7", [7], "G2", "G B D F"), ("I", [], "C3", "C E G")]),
 "vi-ii": ("major", [("I", [], "C3", "C E G"), ("VI", [], "A2", "A C E"), ("IIb", [6], "F2", "D F A"), ("V", [], "G2", "G B D"), ("I", [], "C3", "C E G")]),
 "rise": ("major", [("I", [], "C3", "C E G"), ("Ib", [6], "E3", "C E G"), ("IV", [], "F3", "F A C"), ("V7", [7], "G3", "G B D F"), ("I", [], "C3", "C E G")]),
 "ii7": ("major", [("I", [], "C3", "C E G"), ("IV", [], "F2", "F A C"), ("II7b", [6, 5], "F2", "D F A C"), ("V", [], "G2", "G B D"), ("I", [], "C3", "C E G")]),
 "vofv": ("major", [("I", [], "C3", "C E G"), ("VI", [], "A2", "A C E"), ("V7b of V", [6, 5], "F#2", "D F# A C"), ("V", [], "G2", "G B D")]),
 "v7d": ("major", [("I", [], "C3", "C E G"), ("V", [], "G2", "G B D"), ("V7d", [4, 2], "F2", "G B D F"), ("Ib", [6], "E2", "C E G"), ("IV", [], "F2", "F A C"), ("V", [], "G2", "G B D"), ("I", [], "C3", "C E G")]),
 "phryg": ("minor", [("i", [], "A2", "A C E"), ("iv", [], "D3", "D F A"), ("ivb", [6], "F2", "D F A"), ("V", [], "E2", "E G# B")]),
 "neap": ("minor", [("i", [], "A2", "A C E"), ("N6", [6], "D3", "Bb D F"), ("Ic", [6, 4], "E3", "A C E"), ("V", [], "E3", "E G# B"), ("i", [], "A2", "A C E")]),
 "dim7": ("minor", [("i", [], "A2", "A C E"), ("iv", [], "D3", "D F A"), ("vii°7b", [6, 5], "B2", "G# B D F"), ("ib", [6], "C3", "A C E"), ("V", [], "E3", "E G# B"), ("i", [], "A2", "A C E")]),
 "ger6": ("minor", [("i", [], "A2", "A C E"), ("Ger6", [6, 5], "F2", "F A C D#"), ("Ic", [6, 4], "E2", "A C E"), ("V", [], "E2", "E G# B"), ("i", [], "A2", "A C E")]),
 "it6": ("minor", [("i", [], "A2", "A C E"), ("ib", [6], "C3", "A C E"), ("It6", [6], "F2", "F A D#"), ("V", [], "E2", "E G# B"), ("i", [], "A2", "A C E")]),
 "minor-cad": ("minor", [("i", [], "A2", "A C E"), ("iib°", [6], "D3", "B D F"), ("Ic", [6, 4], "E3", "A C E"), ("V7", [7], "E3", "E G# B D"), ("i", [], "A2", "A C E")]),
}

def interval_class(a, b):  # semitones mod 12 between two midis
    return abs(a - b) % 12

def ok_chord(label, bass, tones, v, key):
    S, A, T = v; ms = [midi(bass), midi(T), midi(A), midi(S)]
    if not (ms[0] < ms[1] < ms[2] < ms[3]): return False
    if ms[3] - ms[2] > 12 or ms[2] - ms[1] > 12: return False
    if ms[1] - ms[0] > 24: return False
    pcs = [bass[:-1], T[:-1], A[:-1], S[:-1]]
    lt = "B" if key == "major" else "G#"
    if pcs.count(lt) > 1: return False
    need = set(tones)
    if label in ("V7", "I", "i") or label.startswith("V7"):
        need.discard(tones[2])  # the 5th may be left out
    if not need <= set(pcs): return False
    if set(pcs) - set(tones): return False
    # augmented 6ths and N6: don't double the special notes
    for special in ("D#", "Bb", "F#"):
        if pcs.count(special) > 1: return False
    if label == "Ic" and pcs.count(bass[:-1]) < 2: return False  # double the bass in a 6-4
    if label in ("iib°", "VII", "viib") and pcs.count(bass[:-1]) < 2: return False  # diminished triads: double the bass (the 3rd)
    return True

def letters(n): L, acc = parse(n[:-1]); return int(n[-1]) * 7 + L
GOOD = {0: {0}, 1: {1, 2}, 2: {3, 4}, 3: {5}, 4: {7}, 5: {8, 9}, 7: {12}}
def melodic_ok(a, b):  # no augmented or diminished leaps or steps in a part
    g = abs(letters(b) - letters(a)); d = abs(midi(b) - midi(a))
    return g in GOOD and d in GOOD[g]

def ok_move(prev, cur, pl, cl, key):
    names = ["B", "T", "A", "S"]
    pm = [midi(x) for x in prev]; cm = [midi(x) for x in cur]
    for i, j in itertools.combinations(range(4), 2):
        a0, b0, a1, b1 = pm[i], pm[j], cm[i], cm[j]
        if a0 == a1 and b0 == b1: continue
        for perfect in (7, 0):
            if interval_class(a0, b0) == perfect and interval_class(a1, b1) == perfect and (a0 != a1 or b0 != b1):
                if (a1 - a0) * (b1 - b0) > 0 or (perfect == 0 and a0 != a1 and b0 != b1): return False
    # hidden 5ths/8ves in outer parts
    if (cm[0] - pm[0]) * (cm[3] - pm[3]) > 0 and interval_class(cm[0], cm[3]) in (0, 7) and abs(cm[3] - pm[3]) > 2: return False
    for k in (0, 1, 2, 3):
        if not melodic_ok(prev[k], cur[k]): return False
    for k in (1, 2, 3):
        if abs(cm[k] - pm[k]) > 9: return False
        if abs(cm[k] - pm[k]) in (6,) : return False  # no tritone leaps
    lt = "B" if key == "major" else "G#"
    tonic = "C" if key == "major" else "A"
    for k in (1, 2, 3):
        p = prev[k][:-1]; c = cur[k][:-1]; d = cm[k] - pm[k]
        if p == lt and pl.startswith("V") and cl in ("I", "i") and k == 3 and not (c == tonic and d == 1): return False
        if p == lt and pl.startswith("vii") and not (c == tonic and d == 1): return False
        # sevenths fall by step
        sev = {"V7": "F" if key == "major" else "D", "V7d": "F", "II7b": "C", "vii°7": "F", "vii°7b": "F", "V7b of V": "C"}.get(pl)
        if sev and p == sev and not (-2 <= d <= -1) and cl not in ("Ic",): return False
        if pl == "N6" and p == "Bb" and not (d < 0): return False
        if pl in ("Ger6", "It6"):
            if p == "D#" and d != 1: return False
            if p == "F" and d != -1: return False
    return True

def voicings(label, bass, tones, key):
    out = []
    S_ = [n for t in tones for n in names_in_range(t, *RANGE["S"])]
    A_ = [n for t in tones for n in names_in_range(t, *RANGE["A"])]
    T_ = [n for t in tones for n in names_in_range(t, *RANGE["T"])]
    for S in S_:
        for A in A_:
            for T in T_:
                if ok_chord(label, bass, tones, (S, A, T), key): out.append((bass, T, A, S))
    return out

def solve(key, chords):
    layers = [voicings(l, b, t.split(), key) for (l, f, b, t) in chords]
    best = {v: (0.35 * (abs(midi(v[3]) - 71) + abs(midi(v[2]) - 64) + abs(midi(v[1]) - 57)), [v]) for v in layers[0]}
    for i in range(1, len(chords)):
        nxt = {}
        for v in layers[i]:
            cands = []
            for u, (c, path) in best.items():
                if not ok_move(u, v, chords[i - 1][0], chords[i][0], key): continue
                cost = c + sum(abs(midi(a) - midi(b)) for a, b in zip(u[1:], v[1:])) + 3 * (abs(midi(u[3]) - midi(v[3])) > 2)
                cost += 0.35 * (abs(midi(v[3]) - 71) + abs(midi(v[2]) - 64) + abs(midi(v[1]) - 57))  # keep the parts in their middle register
                cands.append((cost, path + [v]))
            if cands: nxt[v] = min(cands)
        best = nxt
        if not best: return None
    return min(best.values())[1]

out = {}
for pid, (key, chords) in P.items():
    path = solve(key, chords)
    if not path: print("NO SOLUTION:", pid, file=sys.stderr); sys.exit(1)
    out[pid] = {"key": key, "labels": [c[0] for c in chords], "figs": [c[1] for c in chords], "chords": [list(v) for v in path]}
print("window.PASSAGES = " + json.dumps(out, ensure_ascii=False) + ";")
