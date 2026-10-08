// node theory-room/build/test_backend.mjs  — checks the plan rules without any servers.
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { decide } from "../netlify/functions/lemon-webhook/decide.mjs";

globalThis.Netlify = { env: { get: () => "" } };
const { canOpen } = await import("../netlify/edge-functions/gate.js");
const { validSignature } = await import("../netlify/functions/lemon-webhook/lemon-webhook.mjs");

const now = new Date("2027-01-10T00:00:00Z");
const env = { LS_VARIANT_PACK_LOW: "111", LS_VARIANT_PACK_HIGH: "222", LS_VARIANT_YEARLY: "999" };
let n = 0; const t = (name, fn) => { fn(); n++; console.log("ok ", name); };

t("new monthly subscription opens the plan to renewal + 3 days", () => {
  const p = decide({ event: "subscription_created", attributes: { status: "active", renews_at: "2027-02-10T00:00:00Z", variant_id: 555, customer_id: 42 }, env, now });
  assert.equal(p.pro_until, "2027-02-13T00:00:00.000Z"); assert.equal(p.plan, "monthly"); assert.equal(p.ls_customer_id, "42");
});
t("yearly variant is labelled yearly", () => {
  const p = decide({ event: "subscription_updated", attributes: { status: "active", renews_at: "2028-01-10T00:00:00Z", variant_id: 999 }, env, now });
  assert.equal(p.plan, "yearly");
});
t("cancelled stays open to the end of the paid period", () => {
  const p = decide({ event: "subscription_cancelled", attributes: { status: "cancelled", ends_at: "2027-02-10T00:00:00Z" }, env, now });
  assert.equal(p.pro_until, "2027-02-10T00:00:00.000Z"); assert.equal(p.plan, "monthly");
});
t("expired closes the plan now", () => {
  const p = decide({ event: "subscription_expired", attributes: { status: "expired" }, env, now });
  assert.equal(p.pro_until, now.toISOString()); assert.equal(p.plan, null);
});
t("subscription invoices are ignored (the update event carries the dates)", () => {
  assert.equal(decide({ event: "subscription_payment_success", attributes: { status: "paid" }, env, now }), null);
});
t("Grade 5 pack opens Grade 5 for a year", () => {
  const p = decide({ event: "order_created", attributes: { status: "paid", first_order_item: { variant_id: 111 } }, custom: { pack: "g5" }, profile: { packs: {} }, env, now });
  assert.equal(p.packs.g5, "2028-01-10T00:00:00.000Z");
});
t("buying the same pack again extends it", () => {
  const p = decide({ event: "order_created", attributes: { status: "paid", first_order_item: { variant_id: 111 } }, custom: { pack: "g5" }, profile: { packs: { g5: "2027-06-01T00:00:00.000Z" } }, env, now });
  assert.equal(p.packs.g5, "2028-05-31T00:00:00.000Z");
});
t("a cheap pack can't be used for Grade 8", () => {
  const p = decide({ event: "order_created", attributes: { status: "paid", first_order_item: { variant_id: 111 } }, custom: { pack: "g8" }, profile: {}, env, now });
  assert.ok(p._problem);
});
t("Grade 7 pack on the Grades 6–8 product works and keeps other packs", () => {
  const p = decide({ event: "order_created", attributes: { status: "paid", first_order_item: { variant_id: 222 } }, custom: { pack: "g7" }, profile: { packs: { g3: "2027-03-01T00:00:00.000Z" } }, env, now });
  assert.ok(p.packs.g7 && p.packs.g3);
});
t("refund removes the pack", () => {
  const p = decide({ event: "order_refunded", attributes: { first_order_item: { variant_id: 111 } }, custom: { pack: "g2" }, profile: { packs: { g2: "2027-12-01T00:00:00.000Z", g3: "2027-12-01T00:00:00.000Z" } }, env, now });
  assert.deepEqual(Object.keys(p.packs), ["g3"]);
});
t("subscription's own order is ignored", () => {
  assert.equal(decide({ event: "order_created", attributes: { status: "paid", first_order_item: { variant_id: 555 } }, env, now }), null);
});
t("gate: plan, packs and nothing", () => {
  assert.equal(canOpen({ pro_until: "2027-02-01" }, "course-g6", now), true);
  assert.equal(canOpen({ pro_until: "2026-12-01" }, "course-g6", now), false);
  assert.equal(canOpen({ packs: { g4: "2027-05-01" } }, "course-g1-5", now), true);
  assert.equal(canOpen({ packs: { g4: "2027-05-01" } }, "course-g6", now), false);
  assert.equal(canOpen({ packs: { g6: "2027-05-01" } }, "course-g6", now), true);
  assert.equal(canOpen(null, "course-g1-5", now), false);
});
t("webhook signature check", () => {
  const raw = '{"meta":{"event_name":"order_created"}}';
  const sig = crypto.createHmac("sha256", "s3cret").update(raw).digest("hex");
  assert.equal(validSignature(raw, sig, "s3cret"), true);
  assert.equal(validSignature(raw, sig, "other"), false);
  assert.equal(validSignature(raw, "", "s3cret"), false);
  assert.equal(validSignature(raw + " ", sig, "s3cret"), false);
});
t("teacher licence sets teacher dates and seats, not the family plan", () => {
  const p = decide({ event: "subscription_created", attributes: { status: "active", renews_at: "2028-01-10T00:00:00Z", variant_id: 777 }, env: { ...env, LS_VARIANT_TEACHER: "777", LS_TEACHER_SEATS: "20" }, now });
  assert.equal(p.teacher_until, "2028-01-13T00:00:00.000Z"); assert.equal(p.teacher_seats, 20); assert.equal(p.pro_until, undefined);
});
t("gate: teacher's own access and a learner in a class", () => {
  assert.equal(canOpen({ teacher_until: "2027-06-01" }, "course-g6", now), true);
  const classes = [{ learner_id: "L1", until: "2027-06-01" }, { learner_id: "L2", until: "2026-06-01" }];
  assert.equal(canOpen({}, "course-g1-5", now, classes, "L1"), true);
  assert.equal(canOpen({}, "course-g1-5", now, classes, "L2"), false);
  assert.equal(canOpen(null, "course-g6", now, classes, "L1"), true);
});
console.log(`\n${n} checks passed`);
