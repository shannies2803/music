/* The Theory Room: site settings.
   This is the only file the owner needs to edit. See SETUP.md, step by step.
   Leave supabaseUrl empty to run the site in PREVIEW MODE (no logins, no payments;
   a switch at the top lets you look at the site as a free or a paying family). */
window.TR_CONFIG = {
  siteName: "The Theory Room",
  siteUrl: "",                 // e.g. "https://thetheoryroom.com" (no slash at the end)
  contactEmail: "",            // e.g. "hello@thetheoryroom.com"

  // Supabase (logins + saved progress). From Supabase: Project Settings → API.
  supabaseUrl: "",             // e.g. "https://abcdefgh.supabase.co"
  supabaseAnonKey: "",         // the "anon public" key (safe to publish)

  // Lemon Squeezy checkout links (Store → Products → Share). One per plan.
  checkout: {
    monthly: "",               // Family plan, monthly subscription
    yearly: "",                // Family plan, yearly subscription
    packLow: "",               // Grade pack, Grades 1–5 (one-off, 12 months)
    packHigh: "",              // Grade pack, Grades 6–8 (one-off, 12 months)
    teacher: ""                // Teacher licence, yearly subscription
  },
  billingUrl: "",              // Lemon Squeezy customer portal, e.g. "https://yourstore.lemonsqueezy.com/billing"

  // Prices shown on the site. Change them here when you test new prices.
  prices: {
    monthly: "S$15",
    yearly: "S$129",
    packLow: "S$49",
    packHigh: "S$69",
    teacher: "S$99"
  },

  maxLearners: 3,
  freeComposers: ["beethoven"],  // composer films anyone can watch
  freeGrades: [1]              // grades open without a plan (theory drills and aural)
};

/* The repertoire guide reads its own settings from RH_CONFIG. Keep these in step with the above. */
window.RH_CONFIG = Object.assign(window.RH_CONFIG || {}, {
  supabaseUrl: window.TR_CONFIG.supabaseUrl,
  supabaseAnonKey: window.TR_CONFIG.supabaseAnonKey,
  checkoutUrl: window.TR_CONFIG.checkout.monthly,
  siteUrl: window.TR_CONFIG.siteUrl ? window.TR_CONFIG.siteUrl + "/repertoire/" : "",
  aural: { url: "../rooms/aural.html", name: "The Theory Room aural room" },
  theory: { url: "../rooms/theory-g1-5.html", name: "Guided Grades 1–5 theory course" }
});
