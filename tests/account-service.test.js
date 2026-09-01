const fs = require("fs");
const vm = require("vm");

let session = null;
let loginCount = 0;
let phoneLoginCount = 0;
let emptyVerifyResponse = false;
const auth = {
  async getSession() { return { data: { session }, error: null }; },
  async signInWithOtp({ email }) {
    return {
      data: {
        messageId: `mail-${loginCount + 1}`,
        verifyOtp: async ({ token }) => {
          if (token !== "654321") return { data: null, error: { message: "invalid verification token" } };
          loginCount += 1;
          const user = {
            id: "cloud-user-id",
            email,
            created_at: "2026-08-18T08:00:00.000Z",
            last_sign_in_at: loginCount === 1 ? "2026-08-18T08:00:00.000Z" : "2026-08-18T09:00:00.000Z",
          };
          session = { user, access_token: "test-token" };
          if (emptyVerifyResponse) return { data: {}, error: null };
          return { data: { user, session }, error: null };
        },
      },
      error: null,
    };
  },
  async getVerification({ phone_number }) {
    return { verification_id: `sms-${phone_number}`, is_user: phoneLoginCount > 0 };
  },
  async signInWithSms({ verificationInfo, verificationCode, phoneNum }) {
    if (!verificationInfo || verificationCode !== "123456") {
      return { data: null, error: { message: "invalid verification token" } };
    }
    phoneLoginCount += 1;
    const user = {
      id: "phone-user-id",
      phone_number: phoneNum,
      created_at: "2026-08-31T08:00:00.000Z",
      last_sign_in_at: phoneLoginCount === 1 ? "2026-08-31T08:00:00.000Z" : "2026-08-31T09:00:00.000Z",
    };
    session = { user, access_token: "phone-token" };
    return { data: { user, session }, error: null };
  },
  async verifyOtp() { throw new Error("fallback verifier should not be used"); },
  async signOut() { session = null; return { error: null }; },
};

const window = {
  HHCloud: { demo: false, get: () => ({ auth, db: {} }) },
};
const context = { window, Date, Math, Error, JSON, String, Promise, Map, setTimeout };
vm.createContext(context);
vm.runInContext(fs.readFileSync("account-service.js", "utf8"), context);

(async () => {
  const api = window.HHAccount;
  if (api.mode !== "cloudbase") throw new Error("CloudBase mode is not active");
  if (api.isValidEmail("wrong")) throw new Error("invalid email accepted");
  if (api.isValidPhone("123") || !api.isValidPhone("138 0000 0000")) throw new Error("phone validation failed");
  if (api.normalizePhone("+86 138-0000-0000") !== "+86 13800000000") throw new Error("phone normalization failed");

  auth.getSession = async () => { throw new Error("credentials not found"); };
  if (await api.restoreSession() !== null) throw new Error("missing credentials should mean signed out");
  auth.getSession = async () => ({ data: { session }, error: null });

  let rejected = false;
  try { await api.requestEmailCode("wrong"); } catch (_) { rejected = true; }
  if (!rejected) throw new Error("invalid email request accepted");

  const sent = await api.requestEmailCode(" Flower.Owner@Example.com ");
  if (sent.email !== "flower.owner@example.com" || sent.devCode) throw new Error("send normalization failed");

  rejected = false;
  try { await api.verifyEmailCode(sent.email, "000000", sent.verificationInfo); } catch (_) { rejected = true; }
  if (!rejected) throw new Error("wrong OTP accepted");

  const first = await api.verifyEmailCode(sent.email, "654321", sent.verificationInfo);
  if (!first.isNew || first.account.id !== "cloud-user-id") throw new Error("verified account creation failed");
  if ((await api.restoreSession()).id !== "cloud-user-id") throw new Error("session restore failed");

  api.markOnboarded();
  await api.signOut();
  if (api.getCurrentAccount() !== null) throw new Error("sign out failed");

  const resent = await api.requestEmailCode("flower.owner@example.com");
  const recovered = await api.verifyEmailCode(resent.email, "654321", resent.verificationInfo);
  if (recovered.isNew) throw new Error("returning account marked as new");

  emptyVerifyResponse = true;
  const delayed = await api.requestEmailCode("delayed@example.com");
  const delayedResult = await api.verifyEmailCode(delayed.email, "654321", delayed.verificationInfo);
  if (delayedResult.account.id !== "cloud-user-id") throw new Error("session fallback did not recover account");

  await api.signOut();
  rejected = false;
  try { await api.requestPhoneCode("123"); } catch (_) { rejected = true; }
  if (!rejected) throw new Error("invalid phone request accepted");
  const phoneSent = await api.requestPhoneCode("138 0000 0000");
  if (phoneSent.phone !== "+86 13800000000" || !phoneSent.verificationInfo.verification_id) throw new Error("phone send failed");
  rejected = false;
  try { await api.verifyPhoneCode(phoneSent.phone, "000000", phoneSent.verificationInfo); } catch (_) { rejected = true; }
  if (!rejected) throw new Error("wrong phone OTP accepted");
  const phoneLogin = await api.verifyPhoneCode(phoneSent.phone, "123456", phoneSent.verificationInfo);
  if (!phoneLogin.isNew || phoneLogin.account.id !== "phone-user-id" || phoneLogin.account.phone !== "+86 13800000000") {
    throw new Error("phone OTP login failed");
  }

  console.log("PHONE_PRIMARY_OTP_FLOW_OK");
})().catch(error => {
  console.error(error);
  process.exit(1);
});
