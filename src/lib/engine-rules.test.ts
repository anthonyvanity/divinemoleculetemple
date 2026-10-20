import assert from "node:assert/strict";
import test from "node:test";
import { archiveSlug, assertOwner, canComplete, tierAllows, withUnlock } from "./engine-rules.ts";

test("a visitor reads the public record and nothing sealed", () => {
  const visitor = { signedIn: false, paid: false, role: "member" };
  assert.equal(tierAllows("public", visitor), true);
  assert.equal(tierAllows("seeker", visitor), false);
  assert.equal(tierAllows("initiate", visitor), false);
});

test("a seeker does not open a paid gate", () => {
  const seeker = { signedIn: true, paid: false, role: "member" };
  assert.equal(tierAllows("seeker", seeker), true);
  assert.equal(tierAllows("initiate", seeker), false);
});

test("step 3 stays locked until step 2 is sealed", () => {
  assert.equal(canComplete(1, new Set()), true);
  assert.equal(canComplete(2, new Set()), false);
  assert.equal(canComplete(3, new Set([1])), false);
  assert.equal(canComplete(3, new Set([1, 2])), true);
  assert.equal(canComplete(2, new Set([1, 2])), false);
});

test("a sequence of 100 steps unlocks only the next open record", () => {
  const steps = Array.from({ length: 100 }, (_, i) => ({ stepNumber: i + 1, title: `S${i + 1}` }));
  const done = new Set([1, 2, 3]);
  const state = withUnlock(steps, done);
  assert.equal(state.length, 100);
  assert.equal(state[0]?.unlocked && state[0]?.completed, true);
  assert.equal(state[3]?.unlocked, true);
  assert.equal(state[3]?.completed, false);
  assert.equal(state[4]?.unlocked, false);
  assert.equal(state[99]?.unlocked, false);
});

test("one member cannot claim another member's record", () => {
  assert.doesNotThrow(() => assertOwner("a", "a"));
  assert.throws(() => assertOwner("a", "b"), /Not yours/);
});

test("a chip on the COS page keeps a stable archive address", () => {
  assert.equal(archiveSlug("/implantation & interference"), "implantation-interference");
  assert.equal(archiveSlug("The Cosmic Operating System"), "the-cosmic-operating-system");
  assert.equal(archiveSlug("/the flame core"), "the-flame-core");
});
