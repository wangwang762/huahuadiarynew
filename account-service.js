/* ============================================================
   花花日记本 MVP · standard email OTP account boundary
   Development adapter now; CloudBase will replace these async methods.
   ============================================================ */
(function () {
  const ACCOUNTS_KEY = "hh-mvp-accounts-v2";
  const SESSION_KEY = "hh-mvp-session-v2";
  const DEV_CODE = "123456";

  function readAccounts() {
    try {
      return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}") || {};
    } catch (_) {
      return {};
    }
  }

  function writeAccounts(accounts) {
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (_) {
      throw new Error("浏览器暂时无法保存，请关闭无痕模式后再试");
    }
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(email));
  }

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return "hh_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  function getCurrentAccount() {
    const email = normalizeEmail(localStorage.getItem(SESSION_KEY));
    if (!email) return null;
    return readAccounts()[email] || null;
  }

  async function requestEmailCode(rawEmail) {
    const email = normalizeEmail(rawEmail);
    if (!isValidEmail(email)) throw new Error("再检查一下邮箱格式，好像少了点什么");

    // Development adapter: CloudBase Auth.getVerification replaces this block.
    await new Promise(resolve => setTimeout(resolve, 420));
    return {
      email,
      verificationInfo: { id: makeId(), issuedAt: Date.now() },
      expiresIn: 600,
      devCode: DEV_CODE,
    };
  }

  async function verifyEmailCode(rawEmail, rawCode, verificationInfo) {
    const email = normalizeEmail(rawEmail);
    const code = String(rawCode || "").replace(/\D/g, "").slice(0, 6);
    if (!verificationInfo || !verificationInfo.id) throw new Error("这封信已经失效，请重新获取验证码");
    if (code.length !== 6) throw new Error("请输入完整的 6 位验证码");

    // Development adapter: CloudBase Auth.signInWithEmail replaces this check.
    await new Promise(resolve => setTimeout(resolve, 360));
    if (code !== DEV_CODE) throw new Error("验证码不对，再看看邮件里的六位数字");

    const accounts = readAccounts();
    let account = accounts[email];
    const isNew = !account;
    if (!account) {
      const isLegacyGarden = Object.keys(accounts).length === 0 && localStorage.getItem("hh-onboarded") === "1";
      account = {
        id: makeId(),
        email,
        onboarded: isLegacyGarden,
        createdAt: new Date().toISOString(),
      };
    }
    account = { ...account, emailVerified: true, lastEnteredAt: new Date().toISOString() };
    accounts[email] = account;
    writeAccounts(accounts);
    localStorage.setItem(SESSION_KEY, email);
    return { account, isNew };
  }

  function markOnboarded() {
    const current = getCurrentAccount();
    if (!current) return null;
    const accounts = readAccounts();
    const updated = { ...current, onboarded: true, onboardedAt: new Date().toISOString() };
    accounts[current.email] = updated;
    writeAccounts(accounts);
    localStorage.setItem("hh-onboarded", "1");
    return updated;
  }

  function signOut() {
    localStorage.removeItem(SESSION_KEY);
  }

  window.HHAccount = {
    mode: "development",
    normalizeEmail,
    isValidEmail,
    getCurrentAccount,
    requestEmailCode,
    verifyEmailCode,
    markOnboarded,
    signOut,
  };
})();
