/* ============================================================
   花花日记本 MVP · account boundary
   Local adapter for now; keep the public API when CloudBase replaces it.
   ============================================================ */
(function () {
  const ACCOUNTS_KEY = "hh-mvp-accounts-v1";
  const SESSION_KEY = "hh-mvp-session-v1";

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

  function enterWithEmail(rawEmail) {
    const email = normalizeEmail(rawEmail);
    if (!isValidEmail(email)) throw new Error("再检查一下邮箱格式，好像少了点什么");

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
        lastEnteredAt: new Date().toISOString(),
      };
    } else {
      account = { ...account, lastEnteredAt: new Date().toISOString() };
    }

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
    normalizeEmail,
    isValidEmail,
    getCurrentAccount,
    enterWithEmail,
    markOnboarded,
    signOut,
  };
})();
