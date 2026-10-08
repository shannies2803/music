# Cadenza Ear Studio

Ear training and theory for ABRSM Grades 1–8, built for Faye and Philip.

- `index.html` — Cadenza: aural skills Grades 1–8, Grade 6–8 mock aural tests, Daily Ear Gym, progress
- `theory-faye.html` — Faye’s Theory Path (Grades 1–5)
- `theory-philip.html` — Philip’s Theory Path (Grade 6)

Everything is plain HTML with no build step; progress is saved in the browser.

## The Theory Room (`theory-room/`)

The paid, self-paced version for other families: theory, aural and the ABRSM & Trinity repertoire guide under one login, with free Grade 1, a Family plan and grade packs. The rooms are built from the files above by `theory-room/build/make_rooms.py`, which strips every family name and date. See `theory-room/SETUP.md` to put it online (Supabase, Lemon Squeezy, Netlify with base directory `theory-room`).
