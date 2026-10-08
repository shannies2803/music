// What a Lemon Squeezy event means for a family's plan. Pure, so it can be tested on its own.
// Returns the columns to change on the profile, or null if the event changes nothing.

const DAY = 86400e3;
const GRACE_DAYS = 3; // keep the plan open a few days past a renewal date while payment retries

export function decide({ event, attributes = {}, custom = {}, profile = {}, env = {}, now = new Date() }) {
  const a = attributes;

  if (event && event.startsWith("subscription_") && !event.startsWith("subscription_payment")) {
    let until;
    const status = a.status;
    if (["active", "on_trial", "past_due"].includes(status)) {
      const renew = a.renews_at ? new Date(a.renews_at) : null;
      until = renew ? new Date(renew.getTime() + GRACE_DAYS * DAY) : new Date(now.getTime() + 31 * DAY);
    } else if (status === "cancelled") {
      until = a.ends_at ? new Date(a.ends_at) : now;
    } else if (["expired", "unpaid", "paused"].includes(status)) {
      until = now;
    } else {
      return null;
    }
    const yearly = env.LS_VARIANT_YEARLY && String(a.variant_id) === String(env.LS_VARIANT_YEARLY);
    return {
      pro_until: until.toISOString(),
      plan: until > now ? (yearly ? "yearly" : "monthly") : null,
      ls_customer_id: a.customer_id != null ? String(a.customer_id) : profile.ls_customer_id || null,
      ls_subscription_id: custom.subscription_id || (a.first_subscription_item && a.first_subscription_item.subscription_id) || profile.ls_subscription_id || null
    };
  }

  if (event === "order_created" || event === "order_refunded") {
    const item = a.first_order_item || {};
    const variant = String(item.variant_id || "");
    const low = env.LS_VARIANT_PACK_LOW && variant === String(env.LS_VARIANT_PACK_LOW);
    const high = env.LS_VARIANT_PACK_HIGH && variant === String(env.LS_VARIANT_PACK_HIGH);
    if (!low && !high) return null; // a subscription's own order, or another product
    const g = Number(String(custom.pack || "").replace(/^g/, ""));
    const fits = low ? g >= 1 && g <= 5 : g >= 6 && g <= 8;
    if (!fits) return { _problem: `pack "${custom.pack}" doesn't match the ${low ? "Grades 1–5" : "Grades 6–8"} product` };
    const packs = Object.assign({}, profile.packs || {});
    if (event === "order_refunded" || a.refunded) { delete packs["g" + g]; return { packs }; }
    if (a.status && a.status !== "paid") return null;
    const from = packs["g" + g] && new Date(packs["g" + g]) > now ? new Date(packs["g" + g]) : now;
    packs["g" + g] = new Date(from.getTime() + 365 * DAY).toISOString();
    return { packs, ls_customer_id: a.customer_id != null ? String(a.customer_id) : profile.ls_customer_id || null };
  }

  return null;
}
