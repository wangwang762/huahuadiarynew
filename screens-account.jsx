/* 花花日记本 · 账号管理 */
function maskAccountPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  const local = digits.startsWith("86") && digits.length === 13 ? digits.slice(2) : digits;
  if (!/^1\d{10}$/.test(local)) return value || "";
  return `+86 ${local.slice(0, 3)}****${local.slice(-4)}`;
}

function AccountScreen({ go, account, plantCount = 0, onSignOut }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isGuest = !!(account && account.guest);
  const phone = account && account.phone || "";
  const maskedPhone = maskAccountPhone(phone);
  const email = account && account.email || "";
  const primaryIdentity = maskedPhone || email || "游客模式";

  async function leave() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await onSignOut();
    } catch (reason) {
      setError(reason && reason.message ? reason.message : "暂时没有退出成功，请再试一次");
      setBusy(false);
    }
  }

  return <div className="noscroll" style={{ position: "absolute", inset: 0, overflowY: "auto", paddingBottom: 38,
    background: "radial-gradient(circle at 82% 4%, rgba(186,205,166,.38), transparent 28%), var(--paper)" }}>
    <div style={{ position: "sticky", top: 0, zIndex: 4, minHeight: 94, padding: "54px 18px 8px", boxSizing: "border-box",
      display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(247,242,232,.88)",
      backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: "1px solid rgba(84,73,54,.07)" }}>
      <button onClick={() => go("back")} style={{ position: "absolute", left: 16, bottom: 9, display: "flex", alignItems: "center", color: "var(--ink-soft)" }}>
        <Icon name="chevL" size={25} color="var(--ink-soft)" /><span style={{ fontSize: 14 }}>返回</span>
      </button>
      <span style={{ fontFamily: "var(--f-journal)", fontSize: 18, fontWeight: 650, color: "var(--ink)" }}>账号管理</span>
    </div>

    <div style={{ padding: "30px 22px 0" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 82, height: 82, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(145deg, var(--green-soft), rgba(255,253,246,.94))", border: "1px solid rgba(30,70,50,.14)", boxShadow: "var(--sh-2)" }}>
          <Icon name="user" size={36} color="var(--green-deep)" stroke={1.5} />
        </div>
        <div style={{ marginTop: 14, fontFamily: "var(--f-journal)", fontSize: 22, fontWeight: 650, color: "var(--ink)" }}>
          {isGuest ? "花园访客" : "花园主人"}
        </div>
        <div style={{ marginTop: 5, fontSize: 13, color: "var(--ink-faint)" }}>{primaryIdentity}</div>
      </div>

      <div style={{ marginTop: 28, padding: "4px 18px", borderRadius: 20, background: "rgba(255,253,247,.72)",
        border: "1px solid rgba(84,73,54,.1)", boxShadow: "var(--sh-1)" }}>
        <div style={{ minHeight: 58, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--hairline)" }}>
          <span style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>我的花花</span>
          <span style={{ fontFamily: "var(--f-num)", fontSize: 15, fontWeight: 700, color: "var(--green-deep)" }}>{plantCount} 盆</span>
        </div>
        {!isGuest && <div style={{ minHeight: 58, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--hairline)" }}>
          <span style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>手机号</span>
          <span style={{ fontFamily: "var(--f-num)", fontSize: 12, letterSpacing: ".03em", color: phone ? "var(--green-deep)" : "var(--ink-faint)" }}>{maskedPhone || "未绑定"}</span>
        </div>}
        {!isGuest && <div style={{ minHeight: 58, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--hairline)" }}>
          <span style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>备用邮箱</span>
          <span style={{ maxWidth: 195, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12,
            color: email ? "var(--green-deep)" : "var(--ink-faint)" }}>{email || "未绑定"}</span>
        </div>}
        <div style={{ minHeight: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>数据保存</span>
          <span style={{ fontSize: 12, color: isGuest ? "var(--ink-faint)" : "var(--green-deep)" }}>{isGuest ? "仅保存在本机" : "已同步至云端"}</span>
        </div>
      </div>

      <div className="serif" style={{ margin: "16px 7px 0", fontSize: 12.5, lineHeight: 1.65, color: "var(--ink-faint)", textAlign: "center" }}>
        退出登录不会删除植物、照片和日记。手机号与邮箱只有完成绑定后，才会进入同一个花园账号。
      </div>
      <button onClick={() => setConfirming(true)} style={{ width: "100%", height: 49, marginTop: 26, borderRadius: 999,
        color: "var(--coral)", border: "1px solid rgba(191,91,67,.28)", background: "rgba(255,253,247,.55)", fontSize: 15, fontWeight: 600 }}>
        {isGuest ? "返回登录" : "退出登录"}
      </button>
    </div>

    {confirming && <div role="dialog" aria-modal="true" aria-labelledby="signout-title" style={{ position: "fixed", inset: 0, zIndex: 80,
      display: "flex", alignItems: "flex-end", padding: "20px 20px max(20px, env(safe-area-inset-bottom))", background: "rgba(28,31,25,.36)", backdropFilter: "blur(5px)" }}>
      <div style={{ width: "100%", padding: "24px 20px 18px", borderRadius: 24, background: "var(--paper)", boxShadow: "0 20px 55px rgba(28,31,25,.28)", textAlign: "center" }}>
        <div id="signout-title" style={{ fontFamily: "var(--f-journal)", fontSize: 21, fontWeight: 650, color: "var(--ink)" }}>确定退出吗？</div>
        <div style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-soft)" }}>你的云端花园会好好保存，下次登录还能继续照顾它们。</div>
        {error && <div role="alert" style={{ marginTop: 10, fontSize: 12.5, color: "var(--coral)" }}>{error}</div>}
        <button onClick={leave} disabled={busy} style={{ width: "100%", height: 48, marginTop: 18, borderRadius: 999,
          background: "var(--green-deep)", color: "#fff", fontSize: 15, fontWeight: 650, opacity: busy ? .65 : 1 }}>
          {busy ? "正在退出…" : "确认退出"}
        </button>
        <button onClick={() => setConfirming(false)} disabled={busy} style={{ width: "100%", height: 44, marginTop: 3, color: "var(--ink-soft)", fontSize: 14 }}>继续留在花园</button>
      </div>
    </div>}
  </div>;
}
window.AccountScreen = AccountScreen;
