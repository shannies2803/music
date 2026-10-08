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
    learners: [], learner: null, preview: null, error: null, listeners: []
  };
  TR.ready = new Promise(function (r) { readyRes = r; });
  TR.onChange = function (fn) { TR.listeners.push(fn); };
  function emit() { TR.listeners.forEach(function (f) { try { f(TR); } catch (e) {} }); }
  TR.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  /* ---------- what this family can open ---------- */
  function future(d) { return !!(d && new Date(d) > new Date()); }
  TR.hasPack = function (g) { return future((TR.access.packs || {})["g" + g]); };
  TR.packs = function () { var out = []; for (var g = 1; g <= 8; g++) if (TR.hasPack(g)) out.push(g); return out; };
  TR.isPaid = function () { return TR.access.pro || TR.packs().length > 0; };
  TR.can = function (room, g) {
    if (TR.access.pro) return true;
    if (room === "aural" || room === "theory") return (C.freeGrades || [1]).indexOf(+g) >= 0 || TR.hasPack(+g);
    if (room === "course-g1-5") return [1, 2, 3, 4, 5].some(TR.hasPack);
    if (room === "course-g6") return TR.hasPack(6);
    return false; // repertoire saving, composers, free practice: family plan only
  };
  TR.planLabel = function () {
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
  TR.refreshAccess = async function () { if (TR.sb && TR.user) { await loadAccess(); emit(); } };

  /* The paid rooms are checked on the server (netlify/edge-functions/gate.js), which reads this cookie. */
  function setCookie(s) {
    var secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = s && s.access_token
      ? "tr_at=" + s.access_token + "; Path=/; Max-Age=" + (s.expires_in || 3600) + "; SameSite=Lax" + secure
      : "tr_at=; Path=/; Max-Age=0; SameSite=Lax" + secure;
  }
  async function loadAccess() {
    var r = await TR.sb.from("profiles").select("pro_until,packs,plan").eq("id", TR.user.id).maybeSingle();
    var d = r.data || {};
    TR.access = { pro: future(d.pro_until), until: d.pro_until || null, packs: d.packs || {}, plan: d.plan || null };
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
    if (TR.user) { try { await loadAccess(); await loadLearners(); } catch (e) { TR.error = e; } }
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
    pack5: { label: "Grade 5 pack", pro: false, packs: { g5: "2099-01-01" } }
  };
  function initPreview() {
    TR.preview = PREVIEWS[store.get("tr-preview")] ? store.get("tr-preview") : "free";
    var a = PREVIEWS[TR.preview];
    TR.user = { id: "preview", email: "preview@example.com" };
    TR.access = { pro: a.pro, until: a.pro ? "2099-01-01" : null, packs: Object.assign({}, a.packs), plan: a.pro ? "monthly" : null };
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
