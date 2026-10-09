#!/usr/bin/env python3
"""Build The Theory Room's product rooms from the family versions in the repo root.

  python3 tools/make_theory_rooms.py

This script lives outside theory-room/ on purpose: it names the family, so it must never be
copied to the public site's own repository (shannies2803/musicexams).

Reads   index.html (Cadenza), theory-faye.html, theory-philip.html   (repo root)
Writes  theory-room/rooms/aural.html, theory-g1-5.html, theory-g6.html

Every change is an exact text replacement that must be found, so an edit to the
family versions that moves the text stops the build instead of silently shipping
the family's names. After building, the script fails if any family name, family
trip or personal storage key is left in the output.
"""
import os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "theory-room", "rooms")

TR_HEAD = ('<script>window.TR_ROOM = 1;</script><script src="../config.js"></script>'
           '<script src="../tr.js"></script>')
SHIM = ("<script>/* inside Cadenza: borrow the main page's account connection */\n"
        "(function(){ try { if (window.parent && window.parent !== window && !window.claude && window.parent.claude) "
        "window.claude = window.parent.claude; } catch(e){} })();</script>")


def rep(s, old, new, count=1, label=None):
    n = s.count(old)
    if count == "all":
        if n == 0:
            sys.exit(f"[{label}] not found: {old[:90]!r}")
        return s.replace(old, new)
    if n != count:
        sys.exit(f"[{label}] expected {count}, found {n}: {old[:90]!r}")
    return s.replace(old, new)


def rep_re(s, pat, new, label=None, min_n=1):
    out, n = re.subn(pat, new, s)
    if n < min_n:
        sys.exit(f"[{label}] pattern not found: {pat}")
    return out


# ----------------------------------------------------------------- guided courses
# words after "her" that show it is the object ("give her a…", "show her these…"); otherwise it is possessive
OBJ = {"chat", "these", "a", "an", "the", "and", "how", "to", "through", "incomplete", "going", "what", "if", "that"}


def her_to(m):
    nxt = (m.group(2) or "").lower()
    word = re.match(r"\s+([a-z'’]+)", nxt)
    poss = bool(word) and word.group(1) not in OBJ
    out = "their" if poss else "them"
    return (out.capitalize() if m.group(1)[0].isupper() else out) + m.group(2)


def course(src, dst, name, grades, she, her, his_or_her, herself, key, title):
    s = open(os.path.join(ROOT, src), encoding="utf-8").read()
    N, n = name, name.lower()
    L = f"course {grades}"

    # account + storage: the product's account code replaces the family's Claude connection
    s = rep(s, SHIM, TR_HEAD, label=L)
    s = rep(s, "<script>\n/* Notation engine", "<script>const TRNAME = () => (window.TR && TR.learner && TR.learner.name) || \"Learner\"; const TRLID = () => { try { return localStorage.getItem(\"tr-learner\") || \"me\"; } catch (e) { return \"me\"; } };</script>\n<script>\n/* Notation engine", label=L)
    s = rep(s, f"<title>{N}'s Theory Path</title>", f"<title>{title} | The Theory Room</title>", label=L)
    s = rep(s, f"{N}'s Theory Path", title, label=L)
    s = rep(s, f'"progress/{n}"', f'"progress/{key}"', label=L)
    s = rep(s, f'"{n}-', f'"tr-{key}-', count="all", label=L)
    s = rep_re(s, rf'const LS = "tr-{key}-theory-[a-z0-9]+";', lambda m: m.group(0)[:-1] + ' + "-" + TRLID();', label=L)
    s = rep(s, f"`{n}-theory-backup-", f"`{key}-backup-", count="all", label=L)
    s = rep(s, f'location.hash === "#{n}"', 'location.hash === "#kid"', label=L)

    # nothing from the family's own diary or progress
    s = rep_re(s, r'trips: \[\[.*?\]\] \}', 'trips: [] }', label=L)
    s = rep_re(s, r'let DATES = S\.map\(\(\) => "\d{4}-\d\d-\d\d"\);',
               'let DATES = S.map(() => new Date().toISOString().slice(0, 10));', label=L)
    s = rep(s, 'const DEFAULTS = () => ({ done: { s01: "2026-09-25" }, mastery: { scales: "y", rhythm: "y" },',
            'const DEFAULTS = () => ({ done: {}, mastery: {},', count=1 if n == "faye" else 0, label=L)

    # the learner's own name where it is printed for them
    s = rep(s, f"<h2 class=\"k-hi\">Hi {N}!</h2>", "<h2 class=\"k-hi\">Hi ${esc(TRNAME())}!</h2>", label=L)
    s = rep(s, f"<p class=\"cert-k\">Certificate of achievement</p><h2>{N}</h2>",
            "<p class=\"cert-k\">Certificate of achievement</p><h2>${esc(TRNAME())}</h2>", label=L)
    s = rep(s, "<div class=\"cert-sign\"><span>Mum</span>", "<div class=\"cert-sign\"><span>Parent or teacher</span>", label=L)

    # the grown-up is any parent or teacher, not Mum
    for old, new in [
        ("Answers (for Mum)", "Answers (for grown-ups)"),
        ("Marking key (for Mum)", "Marking key (for grown-ups)"),
        ("The parent plan is for Mum.", "The parent plan is for grown-ups."),
        ("✓ Your stars are saved to Mum's account.", "✓ Your stars are saved to your family account."),
        ("Ask Mum to open this page while signed in.", "Ask a grown-up to sign in."),
        ("That helps Mum plan", "That helps your grown-up plan"),
        ("Homework from Mum", "Homework for you"),
        ("is a Mum day: ask Mum to mark it done.", "is a grown-up day: ask a grown-up to mark it done."),
        ("Mum will mark Day", "A grown-up will mark Day"),
    ]:
        s = rep(s, old, new, count="all", label=L)
    s = rep_re(s, r"Beat Mum: you both answer five questions and (she|he) marks yours\.",
               "Beat the grown-up: you both answer five questions and your child marks yours.", label=L, min_n=0)
    s = s.replace("Beat Mum", "Beat the grown-up")
    s = s.replace("It shows Mum what you already know", "It shows your grown-up what you already know")
    if n == "philip":
        s = rep(s, "Photo feedback only works when this page is opened in Claude. For now, use <b>Mark it myself</b>, or ask Mum to send a photo of your melody to Claude.",
                "Photo feedback isn't available yet. For now, use <b>Mark it myself</b>.", label=L)
        s = rep(s, "for a 9-year-old student called Philip.", "for a student.", label=L)
        s = rep(s, "<li>His violin music:", "<li>Their own pieces:", label=L)
        s = rep(s, "<li>His Grade 5 theory already covers what", "<li>A Grade 5 theory pass already covers what", label=L)
    else:
        s = rep(s, "If her flute Grade 8 is with ABRSM, she needs", "If their practical exams are with ABRSM, your child needs", label=L)
        s = rep(s, "<li>Her own cello and flute music", "<li>Their own pieces", label=L)
        s = s.replace("from her corner", "from the Practice corner")

    # the child's corner and the child's things
    for old, new in [
        (f"<b>{N}'s corner</b>", "<b>Practice corner</b>"),
        (f"in {N}'s corner", "in the Practice corner"),
        (f"from {N}'s corner", "from the Practice corner"),
        (f"{N}'s corner", "Practice corner"),
        (f"{N}'s picture card", "picture card"),
        (f"{N}'s worksheet", "Worksheet"),
        (f"{N} does it on screen", "Do it on screen"),
        (f"Show {N} today's picture lesson", "Show today's picture lesson"),
        (f"Show {N} the picture lesson", "Show the picture lesson"),
        (f"{N}'s Grade 5 theory plan", "The Grade 5 theory plan"),
        (f"{N}'s Grade 6 theory plan", "The Grade 6 theory plan"),
        (f"{N}'s music theory: week to", "Music theory: week to"),
        (f"as {N}'s homework", "as homework"),
        (f"on {N}'s home screen", "on the home screen"),
        (f"{N}'s questions", "the questions"),
        (f"{N}'s view", "the learner view"),
        (f"The same questions {N} gets", "The same questions your child gets"),
        (f"a day {herself}", "a day on their own"),
    ]:
        s = s.replace(old, new)
    # anything left: "Faye ..." at a sentence start becomes "Your child", elsewhere "your child"
    s = re.sub(rf"(^|[.!?>\"`|]\s*|\n\s*){N}'s\b", r"\1Your child's", s)
    s = re.sub(rf"(^|[.!?>\"`|]\s*|\n\s*){N}\b", r"\1Your child", s)
    s = re.sub(rf"\b{N}'s\b", "your child's", s)
    s = re.sub(rf"\b{N}\b", "your child", s)

    for old, new in [
        (f"device {she}'ll use", "device your child will use"),
        (f"skipping trips, {she}'d finish", "skipping trips, your child would finish"),
        (f"So {she} plucks", "So the player plucks"),
        ("just like your cello music", "just like cello music"),
        ("play your flute and cello, and get", "play your instrument, and get"),
        ("rest, play your violin, sleep well", "rest, play your instrument, sleep well"),
    ]:
        s = s.replace(old, new)
    # pronouns for the child: she/he -> your child, her/his -> their, her/him -> them
    s = re.sub(rf"\b{she.capitalize()}\b", "Your child", s)
    s = re.sub(rf"\b{she}\b", "your child", s)
    s = re.sub(rf"\b{she}'s\b", "your child's", s)
    s = re.sub(rf"\b{herself}\b", "themselves", s)
    if her == "her":
        s = re.sub(r"\b([Hh]er)\b(\s*[A-Za-z'’]*)", her_to, s)
    else:
        s = re.sub(r"\bHis\b", "Their", s)
        s = re.sub(r"\bhis\b", "their", s)
        s = re.sub(r"\bhim\b", "them", s)
    s = s.replace("your child's corner", "the Practice corner")

    os.makedirs(OUT, exist_ok=True)
    s = re.sub(r"show(faye|philip)\b", "showhow", s)  # internal button names
    open(os.path.join(OUT, dst), "w", encoding="utf-8").write(s)
    return s


# ----------------------------------------------------------------- aural + drills (Cadenza)
def aural():
    s = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
    L = "aural"
    s = rep(s, "<title>Cadenza Ear Studio</title>", "<title>Aural & theory drills | The Theory Room</title>", label=L)
    s = rep(s, "<div><b>Cadenza</b><small>Ear &amp; theory studio, grade by grade</small></div>",
            "<div><b>The Theory Room</b><small>Aural &amp; theory drills, grade by grade</small></div>", label=L)
    s = rep(s, "<footer>Progress saves on this device, and syncs to your Claude account when opened in Claude. All sounds are made live in your browser — tap a button to hear them.</footer>",
            "<footer>Progress saves on this device and to your family account when you're signed in. All sounds are made live in your browser — tap a button to hear them. Not affiliated with ABRSM or Trinity College London.</footer>", label=L)
    s = rep(s, "open Cadenza from your own website to be marked automatically", "open this page in your phone or computer's browser to be marked automatically", label=L)
    s = rep(s, "Bowing two strings at once — Philip meets this a lot at Grade 8 violin!", "Bowing two strings at once — string players meet this a lot by Grade 8!", label=L)
    s = rep(s, 'const KEY = "cadenza-ear-studio-v1";', 'const KEY = "tr-aural-v1-" + TRLID();', label=L)
    s = rep(s, "<script>\n\"use strict\";", "<script>const TRLID = () => { try { return localStorage.getItem(\"tr-learner\") || \"me\"; } catch (e) { return \"me\"; } };</script>\n<script>\n\"use strict\";", label=L)
    s = rep(s, """function defaultState(){ return { v:1, t:0, cur:0, players:[
  mkPlayer("Philip", {id:"philip", inst:["violin","double bass"], theoryStart:5, auralStart:4, clef:"treble"}),
  mkPlayer("Faye", {id:"faye", inst:["flute","cello"], theoryStart:1, auralStart:3, clef:"treble"}) ] }; }""",
            """function defaultState(){ return { v:1, t:0, cur:0, players:[
  mkPlayer((window.TR && TR.learner && TR.learner.name) || "Learner", {id:"me", auralGrade:1}) ] }; }""", label=L)
    s = rep(s, """  {id:"faye", file:"theory-faye.html", t:"Faye’s Theory Path", g:"Grades 1–5",""",
            """  {id:"g1-5", file:"theory-g1-5.html", t:"Guided course: Grades 1–5", g:"Grades 1–5",""", label=L)
    s = rep(s, """  {id:"philip", file:"theory-philip.html", t:"Philip’s Theory Path", g:"Grade 6",""",
            """  {id:"g6", file:"theory-g6.html", t:"Guided course: Grade 6", g:"Grade 6",""", label=L)
    # a free family starts on a grade it can open
    s = rep(s, "let g = p.auralGrade || 5; if (!GRADES[g] || !gradeAuralOpen(p, g)) g = 5;",
            "let g = p.auralGrade || 5; if (!GRADES[g] || !gradeAuralOpen(p, g)) g = (window.TR_FIRST_OPEN ? TR_FIRST_OPEN(p) : 5);", label=L)
    s = rep(s, "const g = P().auralGrade || 5; const T = GRADES[g].tests.find",
            "let g = P().auralGrade || 5; if (!gradeAuralOpen(P(), g) && window.TR_FIRST_OPEN) g = TR_FIRST_OPEN(P()); const T = GRADES[g].tests.find", label=L)
    # product rules (plans, learner name, deep links) load after the app
    s = rep(s, "</body>", '<script src="aural-tr.js"></script>\n<script src="boards.js"></script>\n<script src="sightread.js"></script>\n<script src="trinity-theory.js"></script>\n<script src="course78.js"></script>\n</body>', label=L)
    i = s.find("<script>")
    s = s[:i] + TR_HEAD + "\n" + s[i:]
    open(os.path.join(OUT, "aural.html"), "w", encoding="utf-8").write(s)
    return s


def check(name, s):
    bad = []
    for pat in [r"(?i)faye", r"(?i)philip", r"\bMum\b", "Chongqing", "Chengdu",
                "London\"", "Vietnam\"", "2026-09-25", "2026-10-03", "theory-faye", "theory-philip", "window.parent.claude"]:
        for m in re.finditer(pat, s):
            bad.append(f"{pat}: …{s[max(0, m.start()-60):m.end()+40]!r}…")
    if bad:
        print(f"!! {name}: {len(bad)} personal leftovers"); print("\n".join(bad[:30])); sys.exit(1)
    print(f"ok  {name}  {len(s):,} bytes")


if __name__ == "__main__":
    check("theory-g1-5.html", course("theory-faye.html", "theory-g1-5.html", "Faye", "1-5", "she", "her", "her", "herself", "g1-5", "Guided theory course · Grades 1–5"))
    check("theory-g6.html", course("theory-philip.html", "theory-g6.html", "Philip", "6", "he", "his", "his", "himself", "g6", "Guided theory course · Grade 6"))
    check("aural.html", aural())
