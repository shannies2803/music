/* The Theory Room: shared account code (sign-in, plan, learners, saved progress).
   Loaded by every page after config.js. Rooms set window.TR_ROOM = 1 first, which also
   gives them a storage adapter shaped like the one they were written for. */
(function () {
  "use strict";
  var C = window.TR_CONFIG || {};
  var me = document.currentScript;
  var BASE = me && me.src ? me.src.replace(/tr\.js(\?.*)?$/, "") : "./";
  var configured = !!(C.supabaseUrl && C.supabaseAnonKey);
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  /* rooms keep progress on the device under the learner's id, so note a learner chosen in the link straight away */
  try { var urlLearner = new URLSearchParams(location.search).get("learner"); if (urlLearner) store.set("tr-learner", urlLearner); } catch (e) {}
  var readyRes;
  var TR = window.TR = {
    C: C, base: BASE, configured: configured, sb: null, user: null,
    access: { pro: false, until: null, packs: {}, plan: null },
    learners: [], learner: null, classes: [], preview: null, error: null, listeners: []
  };
  TR.ready = new Promise(function (r) { readyRes = r; });
  TR.onChange = function (fn) { TR.listeners.push(fn); };
  function emit() { TR.listeners.forEach(function (f) { try { f(TR); } catch (e) {} }); }
  TR.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  /* ---------- what this family can open ---------- */
  function future(d) { return !!(d && new Date(d) > new Date()); }
  TR.hasPack = function (g) { return future((TR.access.packs || {})["g" + g]); };
  TR.packs = function () { var out = []; for (var g = 1; g <= 8; g++) if (TR.hasPack(g)) out.push(g); return out; };
  TR.isPaid = function () { return TR.access.pro || TR.packs().length > 0 || (TR.learner && TR.inClass(TR.learner.id)); };
  /* a learner whose teacher has an active licence gets the theory and aural rooms */
  TR.classesFor = function (lid) { return (TR.classes || []).filter(function (c) { return c.learner_id === lid; }); };
  TR.inClass = function (lid) { return TR.classesFor(lid).some(function (c) { return future(c.until); }); };
  TR.can = function (room, g) {
    if (TR.access.pro) return true;
    if (TR.learner && TR.inClass(TR.learner.id) && (room === "aural" || room === "theory" || /^course-/.test(room))) return true;
    if (room === "aural" || room === "theory") return (C.freeGrades || [1]).indexOf(+g) >= 0 || TR.hasPack(+g);
    if (room === "course-g1-5") return [1, 2, 3, 4, 5].some(TR.hasPack);
    if (room === "course-g6") return TR.hasPack(6);
    return false; // repertoire saving, composers, free practice: family plan only
  };
  TR.planLabel = function () {
    if (TR.access.teacher) return "Teacher licence" + (TR.access.seats ? " · " + TR.access.seats + " student places" : "");
    if (!TR.access.pro && TR.learner && TR.inClass(TR.learner.id)) return "In " + TR.classesFor(TR.learner.id)[0].class_name;
    if (TR.access.pro) return "Family plan" + (TR.access.until && !TR.preview ? " · open until " + new Date(TR.access.until).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "");
    var p = TR.packs(); if (p.length) return "Grade pack" + (p.length > 1 ? "s" : "") + ": Grade " + p.join(", ");
    return "Free";
  };
  TR.upsellHTML = function (what) {
    return '<div class="tr-up"><b>' + TR.esc(what || "This part comes with a plan.") + '</b> <a href="' + BASE + 'app.html#plans" target="_top">See plans</a></div>';
  };

  /* ---------- checkout (Lemon Squeezy) ---------- */
  TR.checkoutUrl = function (kind, pack) {
    if (!configured) return "#preview";
    var base = (C.checkout || {})[kind]; if (!base || !TR.user) return "";
    var q = "checkout[email]=" + encodeURIComponent(TR.user.email || "") + "&checkout[custom][user_id]=" + encodeURIComponent(TR.user.id);
    if (pack) q += "&checkout[custom][pack]=g" + encodeURIComponent(pack);
    return base + (base.indexOf("?") >= 0 ? "&" : "?") + q;
  };

  /* ---------- learners (up to 3 per family) ---------- */
  function pickLearner() {
    var want = new URLSearchParams(location.search).get("learner") || store.get("tr-learner");
    TR.learner = TR.learners.filter(function (l) { return l.id === want; })[0] || TR.learners[0] || null;
    if (TR.learner) store.set("tr-learner", TR.learner.id);
    /* the server's course check reads this to see a learner's class */
    var secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = TR.learner ? "tr_l=" + encodeURIComponent(TR.learner.id) + "; Path=/; Max-Age=31536000; SameSite=Lax" + secure : "tr_l=; Path=/; Max-Age=0" + secure;
  }
  TR.setLearner = function (id) { store.set("tr-learner", id); pickLearner(); emit(); };
  function savePreviewLearners() { store.set("tr-preview-learners", JSON.stringify(TR.learners)); }
  TR.addLearner = async function (name) {
    name = String(name || "").trim().slice(0, 40); if (!name) return;
    if (TR.learners.length >= (C.maxLearners || 3)) throw new Error("A family plan has room for " + (C.maxLearners || 3) + " learners.");
    if (!configured) { TR.learners.push({ id: "l" + Date.now().toString(36), name: name }); savePreviewLearners(); }
    else { var r = await TR.sb.from("learners").insert({ user_id: TR.user.id, name: name }).select("id,name,created_at").single(); if (r.error) throw r.error; TR.learners.push(r.data); }
    emit();
  };
  TR.renameLearner = async function (id, name) {
    name = String(name || "").trim().slice(0, 40); if (!name) return;
    if (configured) { var r = await TR.sb.from("learners").update({ name: name }).eq("id", id); if (r.error) throw r.error; }
    TR.learners.forEach(function (l) { if (l.id === id) l.name = name; }); if (!configured) savePreviewLearners(); emit();
  };
  TR.removeLearner = async function (id) {
    if (TR.learners.length <= 1) return;
    if (configured) { var r = await TR.sb.from("learners").delete().eq("id", id); if (r.error) throw r.error; }
    TR.learners = TR.learners.filter(function (l) { return l.id !== id; }); if (!configured) savePreviewLearners();
    pickLearner(); emit();
  };

  /* ---------- sign-in (email link, no passwords) ---------- */
  TR.signIn = async function (email, next) {
    var to = (C.siteUrl || location.origin) + "/app.html" + (next ? "?next=" + encodeURIComponent(next) : "");
    var r = await TR.sb.auth.signInWithOtp({ email: email, options: { emailRedirectTo: to } });
    if (r.error) throw r.error;
  };
  TR.signOut = async function () {
    if (TR.sb) await TR.sb.auth.signOut();
    setCookie(null); TR.user = null; TR.learners = []; TR.learner = null; TR.access = { pro: false, until: null, packs: {}, plan: null }; emit();
  };
  TR.refreshAccess = async function () { if (TR.sb && TR.user) { await loadAccess(); await loadClasses(); emit(); } };

  /* ---------- classes: families join with a code; teachers make classes and see progress ---------- */
  function rpc(name, args) {
    return TR.sb.rpc(name, args || {}).then(function (r) { if (r.error) throw new Error(r.error.message || "Something went wrong."); return r.data; });
  }
  function pv(key, d) { try { return JSON.parse(store.get(key) || "null") || d; } catch (e) { return d; } }
  async function loadClasses() { TR.classes = configured ? (await rpc("my_classes")) || [] : pv("tr-preview-joined", []); }
  TR.joinClass = async function (code, lid) {
    code = String(code || "").trim().toUpperCase(); if (!code) throw new Error("Type the class code your teacher gave you.");
    if (!configured) {
      var cls = pv("tr-preview-classes", []).filter(function (c) { return c.code === code; })[0] || (code === "DEMO42" ? { id: "demo", name: "Example class", code: code } : null);
      if (!cls) throw new Error("No class has that code. In preview, try DEMO42.");
      var j = pv("tr-preview-joined", []).filter(function (x) { return !(x.class_id === cls.id && x.learner_id === lid); });
      j.push({ learner_id: lid, class_id: cls.id, class_name: cls.name, until: "2099-01-01" }); store.set("tr-preview-joined", JSON.stringify(j));
      await loadClasses(); emit(); return cls.name;
    }
    var name = await rpc("join_class", { p_code: code, p_learner: lid }); await loadClasses(); emit(); return name;
  };
  TR.leaveClass = async function (cid, lid) {
    if (!configured) store.set("tr-preview-joined", JSON.stringify(pv("tr-preview-joined", []).filter(function (x) { return !(x.class_id === cid && x.learner_id === lid); })));
    else await rpc("leave_class", { p_class: cid, p_learner: lid });
    await loadClasses(); emit();
  };
  TR.teacherClasses = async function () {
    if (configured) return (await rpc("teacher_classes")) || [];
    var cs = pv("tr-preview-classes", null);
    if (!cs) { cs = [{ id: "demo", name: "Example class", code: "DEMO42" }]; store.set("tr-preview-classes", JSON.stringify(cs)); }
    return cs.map(function (c) { return Object.assign({ members: c.id === "demo" ? 3 : 0, seats_used: 3, seats: 15, until: "2099-01-01" }, c); });
  };
  TR.createClass = async function (name) {
    name = String(name || "").trim().slice(0, 60); if (!name) throw new Error("Give the class a name.");
    if (configured) return rpc("create_class", { p_name: name });
    var cs = pv("tr-preview-classes", []), c = { id: "c" + Date.now().toString(36), name: name, code: Math.random().toString(16).slice(2, 8).toUpperCase() };
    cs.push(c); store.set("tr-preview-classes", JSON.stringify(cs)); return c;
  };
  TR.classRoster = async function (cid) {
    if (configured) return (await rpc("class_roster", { p_class: cid })) || [];
    return cid === "demo" ? previewRoster() : [];
  };
  TR.removeFromClass = function (cid, lid) { return configured ? rpc("leave_class", { p_class: cid, p_learner: lid }) : Promise.resolve(); };
  /* example pupils for the preview only, so the class view has something to show */
  function previewRoster() {
    var day = function (n) { return new Date(Date.now() - n * 864e5).toISOString().slice(0, 10); };
    function aural(grade, q, mocks, starred) {
      var days = {}; [0, 1, 3, 4, 6].slice(0, q).forEach(function (n, i) { days[day(n)] = { q: 12 + i * 3, c: 9 + i * 2 }; });
      var sk = {}; starred.forEach(function (id) { sk[id] = { lv: { 1: 2, 2: 1 } }; });
      return { path: "data/users/x/state", updated_at: day(0), data: { j: JSON.stringify({ players: [{ auralGrade: grade, days: days, mocks: mocks, sk: sk, tl: { a: { stars: 2 }, b: { stars: 1 } } }] }), t: 1 } };
    }
    function course(done, mocks, last) {
      var d = {}; for (var i = 1; i <= done; i++) d["s" + (i < 10 ? "0" + i : i)] = day(done - i);
      var days = {}; days[day(last)] = [10, 8];
      return { path: "progress/g1-5", updated_at: day(last), data: { done: d, mocks: mocks, days: days } };
    }
    return [
      { learner_id: "ex1", name: "Example: Aisha", joined_at: day(20), progress: [aural(5, 5, { 5: { best: .82, n: 2 } }, ["intervals", "cadences", "sight"]), course(31, [{ date: day(2), marks: 63 }], 0)] },
      { learner_id: "ex2", name: "Example: Ben", joined_at: day(18), progress: [aural(3, 0, {}, ["echo"]), course(12, [], 9)] },
      { learner_id: "ex3", name: "Example: Chloe", joined_at: day(5), progress: [] }
    ];
  }

  /* The paid rooms are checked on the server (netlify/edge-functions/gate.js), which reads this cookie. */
  function setCookie(s) {
    var secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = s && s.access_token
      ? "tr_at=" + s.access_token + "; Path=/; Max-Age=" + (s.expires_in || 3600) + "; SameSite=Lax" + secure
      : "tr_at=; Path=/; Max-Age=0; SameSite=Lax" + secure;
  }
  async function loadAccess() {
    var r = await TR.sb.from("profiles").select("pro_until,packs,plan,teacher_until,teacher_seats").eq("id", TR.user.id).maybeSingle();
    var d = r.data || {};
    var teacher = future(d.teacher_until);
    TR.access = { pro: future(d.pro_until) || teacher, family: future(d.pro_until), until: d.pro_until || null, packs: d.packs || {}, plan: d.plan || null,
      teacher: teacher, teacherUntil: d.teacher_until || null, seats: d.teacher_seats || null };
  }
  async function loadLearners() {
    var r = await TR.sb.from("learners").select("id,name,created_at").order("created_at");
    TR.learners = r.data || [];
    if (!TR.learners.length) {
      var ins = await TR.sb.from("learners").insert({ user_id: TR.user.id, name: "Learner 1" }).select("id,name,created_at").single();
      if (ins.data) TR.learners = [ins.data];
    }
    pickLearner();
  }
  async function onSession(s) {
    setCookie(s);
    TR.user = s ? s.user : null; TR.learners = []; TR.learner = null; TR.access = { pro: false, until: null, packs: {}, plan: null };
    if (TR.user) { try { await loadAccess(); await loadLearners(); await loadClasses(); } catch (e) { TR.error = e; } }
  }
  async function initSupabase() {
    var mod = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm");
    TR.sb = mod.createClient(C.supabaseUrl, C.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    var r = await TR.sb.auth.getSession();
    await onSession(r.data && r.data.session);
    TR.sb.auth.onAuthStateChange(function (ev, s) {
      setCookie(s);
      if ((s && s.user && s.user.id) !== (TR.user && TR.user.id)) onSession(s).then(emit);
    });
  }

  /* ---------- preview mode (no Supabase yet): look at the site as different families ---------- */
  var PREVIEWS = {
    free: { label: "Free", pro: false, packs: {} },
    paid: { label: "Family plan", pro: true, packs: {} },
    pack5: { label: "Grade 5 pack", pro: false, packs: { g5: "2099-01-01" } },
    teacher: { label: "Teacher", pro: true, teacher: true, packs: {} }
  };
  function initPreview() {
    TR.preview = PREVIEWS[store.get("tr-preview")] ? store.get("tr-preview") : "free";
    var a = PREVIEWS[TR.preview];
    TR.user = { id: "preview", email: "preview@example.com" };
    TR.access = { pro: a.pro, family: a.pro && !a.teacher, until: a.pro ? "2099-01-01" : null, packs: Object.assign({}, a.packs), plan: a.pro && !a.teacher ? "monthly" : null,
      teacher: !!a.teacher, teacherUntil: a.teacher ? "2099-01-01" : null, seats: a.teacher ? 15 : null };
    TR.classes = pv("tr-preview-joined", []);
    try { TR.learners = JSON.parse(store.get("tr-preview-learners") || "null"); } catch (e) { TR.learners = null; }
    if (!Array.isArray(TR.learners) || !TR.learners.length) TR.learners = [{ id: "l1", name: "Learner 1" }];
    pickLearner();
  }
  TR.setPreview = function (k) { store.set("tr-preview", k); location.reload(); };
  function previewBar() {
    if (configured || window.self !== window.top || document.getElementById("tr-preview")) return;
    var b = document.createElement("div"); b.id = "tr-preview";
    b.setAttribute("role", "region"); b.setAttribute("aria-label", "Preview mode");
    b.innerHTML = "<span><b>Preview mode</b>: no logins or payments yet. View as:</span>" +
      Object.keys(PREVIEWS).map(function (k) { return '<button type="button" data-pv="' + k + '" aria-pressed="' + (k === TR.preview) + '">' + PREVIEWS[k].label + "</button>"; }).join("");
    b.addEventListener("click", function (e) { var k = e.target.getAttribute && e.target.getAttribute("data-pv"); if (k) TR.setPreview(k); });
    document.body.insertBefore(b, document.body.firstChild);
  }

  /* ---------- rooms: a storage adapter shaped like the one the rooms were written for ---------- */
  function makeDb() {
    var uid = TR.user.id, lid = TR.learner.id;
    function doc(path) {
      return {
        id: path.split("/").pop(),
        set: async function (data) {
          var r = await TR.sb.from("progress").upsert({ user_id: uid, learner_id: lid, path: path, data: data, updated_at: new Date().toISOString() });
          if (r.error) throw r.error;
        },
        get: async function () {
          var r = await TR.sb.from("progress").select("data").eq("learner_id", lid).eq("path", path).maybeSingle();
          if (r.error) throw r.error;
          var d = r.data ? r.data.data : null;
          return { exists: !!r.data, id: path.split("/").pop(), data: function () { return d; }, metadata: {} };
        },
        onSnapshot: function (cb, err) { this.get().then(cb, err || function () {}); return function () {}; }
      };
    }
    return {
      doc: doc,
      collection: function (p) {
        return {
          doc: function (id) { return doc(p + "/" + id); },
          get: async function () {
            var r = await TR.sb.from("progress").select("path,data").eq("learner_id", lid).like("path", p + "/%");
            if (r.error) throw r.error;
            return { docs: (r.data || []).map(function (x) { return { id: x.path.split("/").pop(), data: function () { return x.data; } }; }) };
          }
        };
      }
    };
  }
  if (window.TR_ROOM) {
    window.claude = {
      use: async function (name) {
        await TR.ready;
        if (name === "downloads") return { save: async function (o) { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([o.data], { type: "application/json" })); a.download = o.filename; document.body.appendChild(a); a.click(); a.remove(); } };
        if (!TR.sb || !TR.user || !TR.learner) return null;
        if (name === "user") return { id: async function () { return TR.user.id; } };
        if (name === "db") return makeDb();
        return null;
      }
    };
  }
  function roomBar() {
    if (!window.TR_ROOM || window.self !== window.top || document.getElementById("tr-roombar")) return;
    var b = document.createElement("div"); b.id = "tr-roombar";
    b.innerHTML = '<a href="' + BASE + 'app.html">← ' + TR.esc(C.siteName || "The Theory Room") + "</a>" +
      (TR.learner ? "<span>Practising: <b>" + TR.esc(TR.learner.name) + "</b></span>" : "") +
      "<span>" + TR.esc(TR.planLabel()) + "</span>";
    document.body.insertBefore(b, document.body.firstChild);
  }

  /* shared bits of styling for the bars and upsell notes the rooms show */
  var css = document.createElement("style");
  css.textContent =
    "#tr-preview,#tr-roombar{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;padding:8px 16px;font:14px/1.4 system-ui,-apple-system,'Segoe UI',sans-serif;background:#1d2330;color:#f6f3ee}" +
    "#tr-preview{background:#5a3a12}#tr-preview button{font:inherit;font-size:13px;border:1px solid rgba(255,255,255,.4);background:transparent;color:inherit;border-radius:999px;padding:3px 12px;cursor:pointer;min-height:32px}" +
    "#tr-preview button[aria-pressed=true]{background:#f6f3ee;color:#5a3a12;font-weight:700}" +
    "#tr-roombar a{color:#f6c995;font-weight:700;text-decoration:none;margin-right:auto}#tr-roombar span{opacity:.9}" +
    ".tr-up{border:1px dashed #a3541c;background:rgba(163,84,28,.08);border-radius:12px;padding:12px 14px;margin:12px 0;line-height:1.5}.tr-up a{color:#a3541c;font-weight:700;margin-left:6px}";
  (document.head || document.documentElement).appendChild(css);

  async function start() {
    try { if (configured) await initSupabase(); else initPreview(); }
    catch (e) { TR.error = e; }
    var mount = function () { previewBar(); roomBar(); };
    if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
    readyRes(TR); emit();
  }
  start();
})();
