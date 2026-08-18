const fs = require("fs");
const vm = require("vm");

const values = new Map();
const localStorage = {
  getItem: key => values.has(key) ? values.get(key) : null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: key => values.delete(key),
};
const window = { localStorage, crypto: { randomUUID: () => "test-user-id" } };
const context = { window, localStorage, crypto: window.crypto, Date, Math, Error, JSON, String, Promise, setTimeout };
vm.createContext(context);
vm.runInContext(fs.readFileSync("account-service.js", "utf8"), context);

(async () => {
  const api = window.HHAccount;
  if (api.isValidEmail("wrong")) throw new Error("invalid email accepted");

  let rejected = false;
  try { await api.requestEmailCode("wrong"); } catch (_) { rejected = true; }
  if (!rejected) throw new Error("invalid email request accepted");

  const sent = await api.requestEmailCode(" Flower.Owner@Example.com ");
  if (sent.email !== "flower.owner@example.com" || sent.devCode !== "123456") {
    throw new Error("send normalization failed");
  }

  rejected = false;
  try { await api.verifyEmailCode(sent.email, "000000", sent.verificationInfo); } catch (_) { rejected = true; }
  if (!rejected) throw new Error("wrong OTP accepted");

  const first = await api.verifyEmailCode(sent.email, "123456", sent.verificationInfo);
  if (!first.isNew || !first.account.emailVerified) throw new Error("verified account creation failed");
  if (api.getCurrentAccount().id !== "test-user-id") throw new Error("session restore failed");

  api.markOnboarded();
  api.signOut();
  if (api.getCurrentAccount() !== null) throw new Error("sign out failed");

  const resent = await api.requestEmailCode("flower.owner@example.com");
  const recovered = await api.verifyEmailCode(resent.email, "123456", resent.verificationInfo);
  if (recovered.isNew || !recovered.account.onboarded) throw new Error("same-email recovery failed");

  console.log("STANDARD_EMAIL_OTP_FLOW_OK");
})().catch(error => {
  console.error(error);
  process.exit(1);
});
