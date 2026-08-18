/* ============================================================
   花花日记本 MVP · CloudBase email OTP account boundary
   ============================================================ */
(function () {
  let currentAccount = null;
  const pendingVerifications = new Map();

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(email));
  }

  function readableError(error, fallback) {
    const raw = String(error && (error.message || error.error_description || error.code) || "").toLowerCase();
    if (raw.includes("rate") || raw.includes("frequent") || raw.includes("too many")) return new Error("信寄得有点频繁，请稍等一会儿再试");
    if (raw.includes("expired")) return new Error("这封信已经失效，请重新获取验证码");
    if (raw.includes("invalid") || raw.includes("token") || raw.includes("verification")) return new Error("验证码不对，再看看邮件里的六位数字");
    if (raw.includes("network") || raw.includes("fetch") || raw.includes("timeout")) return new Error("花园门口的网络有点拥挤，请稍后再试");
    return new Error(fallback || "花园暂时没有连上，请稍后再试");
  }

  function resultError(result) {
    return result && (result.error || (result.data && result.data.error));
  }

  function accountFromUser(user) {
    if (!user) return null;
    const email = normalizeEmail(
      user.email ||
      (user.user_metadata && user.user_metadata.email) ||
      (Array.isArray(user.identities) && user.identities[0] && user.identities[0].identity_data && user.identities[0].identity_data.email)
    );
    const id = user.id || user.uid || user._id || user.sub;
    if (!id) return null;
    return { id, email, emailVerified: true, onboarded: false };
  }

  function sessionUser(result) {
    const data = result && result.data !== undefined ? result.data : result;
    const session = data && (data.session || data);
    return (data && data.user) || (session && session.user) || null;
  }

  function getCurrentAccount() {
    return currentAccount;
  }

  async function restoreSession() {
    if (window.HHCloud.demo) {
      currentAccount = { id: "demo-user", email: "demo@huahua.local", emailVerified: true, onboarded: true, demo: true };
      return currentAccount;
    }
    try {
      const { auth } = window.HHCloud.get();
      const result = await auth.getSession();
      const error = resultError(result);
      if (error) throw error;
      currentAccount = accountFromUser(sessionUser(result));
      return currentAccount;
    } catch (error) {
      const raw = String(error && (error.message || error.code) || "").toLowerCase();
      if (
        (raw.includes("session") && (raw.includes("missing") || raw.includes("not found"))) ||
        raw.includes("credentials not found")
      ) {
        currentAccount = null;
        return null;
      }
      console.warn("[花花日记本] 恢复 CloudBase 会话失败", error);
      throw readableError(error, "花园暂时没有连上，请检查网络后重试");
    }
  }

  async function requestEmailCode(rawEmail) {
    const email = normalizeEmail(rawEmail);
    if (!isValidEmail(email)) throw new Error("再检查一下邮箱格式，好像少了点什么");
    try {
      const { auth } = window.HHCloud.get();
      const result = await auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
      const error = resultError(result);
      if (error) throw error;
      const data = result && result.data || {};
      const messageId = data.messageId || data.message_id || null;
      pendingVerifications.set(email, { verifyOtp: data.verifyOtp, messageId });
      return { email, verificationInfo: { messageId }, expiresIn: 600 };
    } catch (error) {
      throw readableError(error, "这封信没寄出去，请稍后再试");
    }
  }

  async function verifyEmailCode(rawEmail, rawCode, verificationInfo) {
    const email = normalizeEmail(rawEmail);
    const code = String(rawCode || "").replace(/\D/g, "").slice(0, 6);
    if (code.length !== 6) throw new Error("请输入完整的 6 位验证码");
    const pending = pendingVerifications.get(email) || {};
    const messageId = (verificationInfo && verificationInfo.messageId) || pending.messageId;
    try {
      const { auth } = window.HHCloud.get();
      const result = typeof pending.verifyOtp === "function"
        ? await pending.verifyOtp({ token: code, messageId })
        : await auth.verifyOtp({ email, token: code, messageId });
      const error = resultError(result);
      if (error) throw error;
      currentAccount = accountFromUser(sessionUser(result));
      if (!currentAccount) throw new Error("登录成功，但没有取得用户身份");
      pendingVerifications.delete(email);
      const user = sessionUser(result) || {};
      const isNew = Boolean(user.created_at && (!user.last_sign_in_at || user.created_at === user.last_sign_in_at));
      return { account: currentAccount, isNew };
    } catch (error) {
      throw readableError(error, "验证码不对，再看看邮件里的六位数字");
    }
  }

  function markOnboarded() {
    if (!currentAccount) return null;
    currentAccount = { ...currentAccount, onboarded: true };
    return currentAccount;
  }

  async function signOut() {
    if (!window.HHCloud.demo) {
      try {
        const { auth } = window.HHCloud.get();
        if (typeof auth.signOut === "function") await auth.signOut();
      } finally {
        currentAccount = null;
      }
    } else {
      currentAccount = null;
    }
  }

  window.HHAccount = {
    mode: "cloudbase",
    normalizeEmail,
    isValidEmail,
    getCurrentAccount,
    restoreSession,
    requestEmailCode,
    verifyEmailCode,
    markOnboarded,
    signOut,
  };
})();
