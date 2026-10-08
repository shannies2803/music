// Lemon Squeezy → Supabase: opens or closes a family's plan when they pay, renew, cancel or get a refund.
// Lemon Squeezy calls  https://<your site>/.netlify/functions/lemon-webhook
// Netlify environment variables needed (Site configuration → Environment variables):
//   LEMON_SIGNING_SECRET   the signing secret you typed when creating the webhook in Lemon Squeezy
//   SUPABASE_URL           e.g. https://abcdefgh.supabase.co
//   SUPABASE_SERVICE_KEY   Supabase → Project Settings → API → service_role key (keep secret)
//   LS_VARIANT_PACK_LOW    variant ID of the Grades 1–5 pack product
//   LS_VARIANT_PACK_HIGH   variant ID of the Grades 6–8 pack product
//   LS_VARIANT_YEARLY      variant ID of the yearly Family plan (optional; only for the label)
//   LS_VARIANT_TEACHER     variant ID of the teacher licence (a yearly subscription)
//   LS_TEACHER_SEATS       how many learners one teacher licence covers (default 15)
import crypto from "node:crypto";
import { decide } from "./decide.mjs";

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

async function db(path, opts = {}) {
  const url = process.env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/" + path;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const r = await fetch(url, { ...opts, headers: { apikey: key, authorization: "Bearer " + key, "content-type": "application/json", prefer: "return=representation", ...(opts.headers || {}) } });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

export function validSignature(raw, signature, secret) {
  if (!secret || !signature) return false;
  const digest = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(String(signature)), b = Buffer.from(digest);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const raw = await req.text();
  if (!validSignature(raw, req.headers.get("x-signature"), process.env.LEMON_SIGNING_SECRET)) return json(401, { error: "bad signature" });

  let body;
  try { body = JSON.parse(raw); } catch { return json(400, { error: "not JSON" }); }
  const event = body.meta && body.meta.event_name;
  const custom = (body.meta && body.meta.custom_data) || {};
  const attributes = (body.data && body.data.attributes) || {};

  // who paid: the user id we put in the checkout link, or else the email they paid with
  let rows = [];
  if (custom.user_id && /^[0-9a-f-]{36}$/i.test(custom.user_id)) rows = await db(`profiles?id=eq.${custom.user_id}&select=id,packs,ls_customer_id,ls_subscription_id`);
  if (!rows.length && attributes.user_email) rows = await db(`profiles?email=eq.${encodeURIComponent(attributes.user_email)}&select=id,packs,ls_customer_id,ls_subscription_id`);
  if (!rows.length) return json(202, { ok: false, note: "no account for this payment yet", event });
  const profile = rows[0];

  const env = { LS_VARIANT_PACK_LOW: process.env.LS_VARIANT_PACK_LOW, LS_VARIANT_PACK_HIGH: process.env.LS_VARIANT_PACK_HIGH, LS_VARIANT_YEARLY: process.env.LS_VARIANT_YEARLY,
    LS_VARIANT_TEACHER: process.env.LS_VARIANT_TEACHER, LS_TEACHER_SEATS: process.env.LS_TEACHER_SEATS };
  if (event && event.startsWith("subscription_")) custom.subscription_id = body.data && body.data.id;
  const patch = decide({ event, attributes, custom, profile, env });
  if (!patch) return json(200, { ok: true, event, changed: false });
  if (patch._problem) return json(200, { ok: false, event, note: patch._problem });

  await db(`profiles?id=eq.${profile.id}`, { method: "PATCH", body: JSON.stringify(patch) });
  return json(200, { ok: true, event, changed: Object.keys(patch) });
};
