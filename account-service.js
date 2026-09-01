/* ============================================================
   花花日记本 MVP · CloudBase phone-first OTP account boundary
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

  function normalizePhone(phone) {
    const digits = String(phone || "").replace(/\D/g, "");
    const local = digits.startsWith("86") && digits.length === 13 ? digits.slice(2) : digits;
    return /^1\d{10}$/.test(local) ? `+86 ${local}` : local;
  }

  function isValidPhone(phone) {
    return /^\+86 1\d{10}$/.test(normalizePhone(phone));
  }

  function readableError(error, fallback) {
    const raw = String(error && (error.message || error.error_description || error.code) || "").toLowerCase();
    if (raw.includes("rate") || raw.includes("frequent") || raw.includes("too many")) return new Error("信寄得有点频繁，请稍等一会儿再试");
    if (raw.includes("expired")) return new Error("验证码已经失效，请重新获取");
    if (raw.includes("invalid") || raw.includes("token") || raw.includes("verification")) return new Error("验证码不对，再看看收到的六位数字");
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
    const phone = normalizePhone(
      user.phone_number || user.phoneNumber || user.phone ||
      (user.user_metadata && (user.user_metadata.phone_number || user.user_metadata.phone)) ||
      (Array.isArray(user.identities) && user.identities.find(identity => identity && identity.identity_data && identity.identity_data.phone_number)
        && user.identities.find(identity => identity && identity.identity_data && identity.identity_data.phone_number).identity_data.phone_number)
    );
    return {
      id,
      email,
      phone: isValidPhone(phone) ? phone : "",
      emailVerified: !!email,
      phoneVerified: isValidPhone(phone),
      onboarded: false,
    };
  }

  function sessionUser(result) {
    const data = result && result.data !== undefined ? result.data : result;
    const session = data && (data.session || data);
    return (data && data.user) ||
      (session && session.user) ||
      (result && result.session && result.session.user) ||
      (result && result.user) ||
      null;
  }

  async function accountFromResultOrSession(auth, result) {
    let user = sessionUser(result);
    if (!user) {
      const sessionResult = await auth.getSession();
      const sessionError = resultError(sessionResult);
      if (sessionError) throw sessionError;
      user = sessionUser(sessionResult);
    }
    return { account: accountFromUser(user), user };
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

  async function requestPhoneCode(rawPhone) {
    const phone = normalizePhone(rawPhone);
    if (!isValidPhone(phone)) throw new Error("请输入正确的 11 位手机号");
    try {
      const { auth } = window.HHCloud.get();
      const verificationInfo = await auth.getVerification({ phone_number: phone });
      const error = resultError(verificationInfo);
      if (error) throw error;
      pendingVerifications.set(`phone:${phone}`, verificationInfo);
      return { phone, verificationInfo, expiresIn: 600 };
    } catch (error) {
      throw readableError(error, "短信没有发出去，请稍后再试");
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
      const resolved = await accountFromResultOrSession(auth, result);
      currentAccount = resolved.account;
      if (!currentAccount) throw new Error("登录成功，但没有取得用户身份");
      pendingVerifications.delete(email);
      const user = resolved.user || {};
      const isNew = Boolean(user.created_at && (!user.last_sign_in_at || user.created_at === user.last_sign_in_at));
      return { account: currentAccount, isNew };
    } catch (error) {
      throw readableError(error, "验证码不对，再看看邮件里的六位数字");
    }
  }

  async function verifyPhoneCode(rawPhone, rawCode, verificationInfo) {
    const phone = normalizePhone(rawPhone);
    const code = String(rawCode || "").replace(/\D/g, "").slice(0, 6);
    if (!isValidPhone(phone)) throw new Error("请输入正确的 11 位手机号");
    if (code.length !== 6) throw new Error("请输入完整的 6 位验证码");
    const pending = pendingVerifications.get(`phone:${phone}`) || verificationInfo;
    if (!pending) throw new Error("请先获取短信验证码");
    try {
      const { auth } = window.HHCloud.get();
      const result = await auth.signInWithSms({
        verificationInfo: pending,
        verificationCode: code,
        phoneNum: phone,
      });
      const error = resultError(result);
      if (error) throw error;
      const resolved = await accountFromResultOrSession(auth, result);
      currentAccount = resolved.account;
      if (!currentAccount) throw new Error("登录成功，但没有取得用户身份");
      pendingVerifications.delete(`phone:${phone}`);
      const user = resolved.user || {};
      const isNew = Boolean(user.created_at && (!user.last_sign_in_at || user.created_at === user.last_sign_in_at));
      return { account: currentAccount, isNew };
    } catch (error) {
      throw readableError(error, "验证码不对，再看看短信里的六位数字");
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
    normalizePhone,
    isValidPhone,
    getCurrentAccount,
    restoreSession,
    requestEmailCode,
    verifyEmailCode,
    requestPhoneCode,
    verifyPhoneCode,
    markOnboarded,
    signOut,
  };
})();
