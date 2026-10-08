// Checks a family's plan on the server before sending the paid guided courses.
// The rest of the site is public; the aural room limits itself in the page.
// Needs Netlify environment variables SUPABASE_URL and SUPABASE_ANON_KEY.
// With neither set (preview), every page is served as normal.

export function canOpen(profile, need, now = new Date(), classes = [], learner = null) {
  const live = (d) => !!d && new Date(d) > now;
  // a learner in a teacher's class, while the teacher's licence lasts
  if (learner && classes.some((c) => c.learner_id === learner && live(c.until))) return true;
  if (!profile) return false;
  if (live(profile.pro_until) || live(profile.teacher_until)) return true;
  const packs = profile.packs || {};
  if (need === "course-g6") return live(packs.g6);
  return [1, 2, 3, 4, 5].some((g) => live(packs["g" + g]));
}

function cookie(request, name) {
  const all = request.headers.get("cookie") || "";
  const m = all.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : null;
}

export default async (request, context) => {
  const SUPA = (Netlify.env.get("SUPABASE_URL") || "").replace(/\/$/, "");
  const ANON = Netlify.env.get("SUPABASE_ANON_KEY");
  if (!SUPA || !ANON) return context.next();

  const url = new URL(request.url);
  const need = /theory-g6/.test(url.pathname) ? "course-g6" : "course-g1-5";
  const back = (why) => Response.redirect(new URL("/app.html?need=" + why + "&next=" + encodeURIComponent(url.pathname + url.search), url), 302);

  const token = cookie(request, "tr_at");
  if (!token) return back("login");
  const headers = { apikey: ANON, authorization: "Bearer " + token };
  const u = await fetch(SUPA + "/auth/v1/user", { headers });
  if (!u.ok) return back("login");
  const user = await u.json();
  const p = await fetch(SUPA + "/rest/v1/profiles?id=eq." + encodeURIComponent(user.id) + "&select=pro_until,packs,teacher_until", { headers });
  const rows = p.ok ? await p.json() : [];
  let classes = [];
  const learner = cookie(request, "tr_l");
  if (!canOpen(rows[0], need) && learner) {
    const r = await fetch(SUPA + "/rest/v1/rpc/my_classes", { method: "POST", headers: { ...headers, "content-type": "application/json" }, body: "{}" });
    classes = r.ok ? await r.json() : [];
  }
  if (!canOpen(rows[0], need, new Date(), classes, learner)) return back("plan");

  const res = await context.next();
  res.headers.set("cache-control", "private, no-store");
  return res;
};

export const config = { path: ["/rooms/theory-g1-5*", "/rooms/theory-g6*"] };
