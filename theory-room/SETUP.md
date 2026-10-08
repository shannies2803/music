# The Theory Room: getting it live

The site works today in **preview mode**: open it and use the switch at the top to see it as a free family, a Family plan family, or a family with a Grade 5 pack. Nothing is saved to an account and nothing can be bought until steps 2–4 are done.

Plan on an unhurried morning for steps 1–4. You only edit one file, `config.js`, plus a few settings on three websites.

## What's in this folder

| Path | What it is |
|---|---|
| `index.html` | The home page: rooms, plans, teachers, questions |
| `app.html` | "My rooms": sign in, learners, rooms, buying a plan |
| `rooms/aural.html` | Aural tests (ABRSM and Trinity, Initial to Grade 8), sight-reading and quick theory drills |
| `rooms/theory-g1-5.html`, `rooms/theory-g6.html` | The guided theory courses (paid; checked on the server) |
| `rooms/composers.html` | The composer films (Room 4) |
| `teacher.html` | The class view for teachers |
| `repertoire/` | The ABRSM & Trinity repertoire guide |
| `config.js` | **The only file you edit**: your links, keys and prices |
| `tr.js`, `site.css` | Shared code and look (no need to touch) |
| `supabase/schema.sql` | Sets up the database (step 2) |
| `netlify/` | Two small server functions: payments and the course gate |
| `build/` | Scripts that make the rooms from the family versions, and the tests |

## 1. Domain and email

1. Buy the domain (for example `thetheoryroom.com`).
2. Make a mailbox on it (for example `hello@thetheoryroom.com`, with Zoho Mail or Google Workspace).
3. In `config.js`, fill in `siteUrl` and `contactEmail`.

## 2. Supabase (sign-in and saved progress)

1. Make a free account at supabase.com and **create a project**. Choose the Singapore region.
2. Open **SQL Editor → New query**, paste everything from `supabase/schema.sql`, and press **Run**.
3. **Authentication → URL Configuration**: set *Site URL* to your `siteUrl`, and add `https://YOURDOMAIN/app.html*` to *Redirect URLs*.
4. **Authentication → Emails**: edit the "Magic link" email so it says The Theory Room. Supabase's built-in email sender only sends a few emails an hour, so before launch connect your own sender under **Authentication → Emails → SMTP settings** (Zoho or Resend both work).
5. **Project Settings → API**: copy the *Project URL* and the *anon public* key into `config.js` (`supabaseUrl`, `supabaseAnonKey`). Also note the *service_role* key for step 4. **Never put the service_role key in `config.js`.**

## 3. Lemon Squeezy (payments)

Lemon Squeezy is the seller of record: it charges the card, adds the right sales tax for each country, and pays you out. Its fee is 5% + 50¢ per payment.

1. Make an account at lemonsqueezy.com and finish the store verification.
2. Create these products:
   - **Family plan**: a subscription with two variants, *Monthly* and *Yearly*.
   - **Grade pack, Grades 1–5**: a single payment. (The family picks the grade on your site; it travels with the order.)
   - **Grade pack, Grades 6–8**: a single payment.
   - **Teacher licence**: a yearly subscription.
3. For each product: **Share** → copy the checkout link into `config.js` → `checkout`. For the Family plan, use the Monthly variant's link for `monthly` and the Yearly variant's for `yearly`.
4. In each product's settings, set the *redirect after purchase* to `https://YOURDOMAIN/app.html?paid=1`.
5. **Settings → Webhooks → +**:
   - URL: `https://YOURDOMAIN/.netlify/functions/lemon-webhook`
   - Signing secret: make up a long random password and keep it for step 4
   - Events: `order_created`, `order_refunded`, and every `subscription_…` event
6. Note the **variant IDs** of the two grade packs, the yearly plan and the teacher licence (Products → the product → the variant's ⋯ menu → Copy ID).
7. Copy your customer portal link (**Settings → General**, "Customer portal") into `config.js` → `billingUrl`, so families can change or cancel.
8. Keep **Test mode** on until step 5 works.

## 4. Netlify (the website)

1. At netlify.com: **Add new site → Import an existing project → GitHub → shannies2803/music**.
2. **Base directory**: `theory-room`. Leave the build command empty. Deploy.
3. **Site configuration → Environment variables**, add:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | the Project URL from step 2 |
   | `SUPABASE_ANON_KEY` | the anon public key from step 2 |
   | `SUPABASE_SERVICE_KEY` | the service_role key from step 2 (secret) |
   | `LEMON_SIGNING_SECRET` | the webhook signing secret from step 3 |
   | `LS_VARIANT_PACK_LOW` | variant ID of the Grades 1–5 pack |
   | `LS_VARIANT_PACK_HIGH` | variant ID of the Grades 6–8 pack |
   | `LS_VARIANT_YEARLY` | variant ID of the yearly Family plan |
   | `LS_VARIANT_TEACHER` | variant ID of the teacher licence |
   | `LS_TEACHER_SEATS` | students per teacher licence (15 unless you change it) |

4. **Domain management**: add your domain and follow Netlify's instructions at your domain seller.
5. Commit your edited `config.js` to GitHub; Netlify redeploys by itself.

## 5. Try it yourself before launch

1. Open your site, **Sign in**, and tap the link in the email.
2. Add a learner, open the aural room: only Grade 1 should be open.
3. Buy the Family plan with Lemon Squeezy's test card (`4242 4242 4242 4242`, any future date, any CVC). Back on "My rooms" the plan should open within a few seconds.
4. Open both guided courses; open the aural room's Grade 6.
5. Cancel the test subscription in Lemon Squeezy: the plan should stay open until the end of the paid month.
6. Buy a test Grade 3 pack on a second account: Grade 3 aural and the Grades 1–5 course should open; Grade 6 should not.
7. Buy a test teacher licence on a third account, open **My rooms → Open your classes**, make a class, and join it from the first account with the code.
8. Turn Lemon Squeezy's Test mode off. You're live.

## The composer films

- They live in `rooms/composers.js`. Each film starts with `checked: false` and shows **Draft** until you've checked the facts and the music; then change it to `checked: true`.
- Which film is free: `freeComposers` in `config.js`.
- The exam-list numbers come from the repertoire data: run `python3 theory-room/build/make_composers.py` after the lists change.
- **Making videos for social media**: open `rooms/composers.html?studio=1` in Chrome on a computer, choose a composer, and press *Record 16:9* (YouTube) or *Record 9:16* (Shorts, Reels, TikTok). The film plays once and gives you a video file. Add your own voice-over in any video app.

## Changing things later

- **Prices**: edit `prices` in `config.js` and the prices in Lemon Squeezy, then commit.
- **The rooms**: they're made from the family versions in the repo root (`index.html`, `theory-faye.html`, `theory-philip.html`). After changing those, run `python3 theory-room/build/make_rooms.py` (it stops with a message if any family name or date would reach the public site), then `python3 theory-room/build/make_catalog.py`, which updates the list of tasks teachers can set as homework.
- **Tests**:
  - `node theory-room/build/test_backend.mjs`: payment rules and the course gate
  - `sh theory-room/build/test_db.sh`: the database set-up and who can see what (needs Postgres)
  - `python3 theory-room/build/e2e_preview.py`, `e2e_accounts.py`, `e2e_composers.py`, `e2e_boards.py`, `e2e_sightread.py`: every page in a browser, including sight-reading marked from a recording

## Not built yet

- More composer films, and instrument films.
- Trinity theory.
- Photo marking of the Grade 6 composition (the course offers self-marking with a checklist instead).
- The aural room limits grades inside the page. The guided courses are checked on the server, so they can't be opened without a plan.
