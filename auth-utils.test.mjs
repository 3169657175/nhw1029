import assert from "node:assert/strict";
import { createHash } from "node:crypto";
const {
  authenticateRequest,
  generateJWT,
  getJwtSecret,
  hashPassword,
  verifyJWT,
  verifyPassword
} = await import("./functions/api/auth/_utils.js");

const password = "correct horse battery staple";
const stored = await hashPassword(password);
assert.match(stored, /^pbkdf2-sha256\$100000\$/);
assert.equal((await verifyPassword(password, stored)).valid, true);
assert.equal((await verifyPassword("wrong", stored)).valid, false);
assert.ok(!stored.includes(password));

const legacy = createHash("sha256").update(password).digest("hex");
assert.deepEqual(await verifyPassword(password, legacy), {
  valid: true,
  needsRehash: true
});

const secret = "test-only-secret-that-is-longer-than-32-characters";
const token = await generateJWT({ username: "tester", role: "user" }, secret);
assert.equal((await verifyJWT(token, secret)).username, "tester");
assert.equal(await verifyJWT(token + "x", secret), null);
assert.equal(await verifyJWT(token, secret + "x"), null);

const request = new Request("https://example.test/api", {
  headers: { Authorization: `Bearer ${token}` }
});
assert.equal((await authenticateRequest(request, secret)).role, "user");
assert.throws(() => getJwtSecret({}), /JWT_SECRET/);
assert.throws(() => getJwtSecret({ JWT_SECRET: "too-short" }), /JWT_SECRET/);

console.log("auth utils tests passed");
