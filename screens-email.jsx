/* ============================================================
   花花日记本 MVP · email entry
   A journal flyleaf, not a generic account form.
   ============================================================ */
function EmailEntry({ onEnter }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const valid = window.HHAccount.isValidEmail(email);

  function submit(event) {
    event.preventDefault();
    setError("");
    if (!valid) {
      setError("再检查一下邮箱格式，好像少了点什么");
      return;
    }
    setBusy(true);
    try {
      const result = window.HHAccount.enterWithEmail(email);
      onEnter(result);
    } catch (err) {
      setError(err && err.message ? err.message : "花园门口有点拥挤，请再试一次");
      setBusy(false);
    }
  }

  return (
    <div className="soft-fade" style={{ position: "absolute", inset: 0, overflow: "hidden",
      background: "radial-gradient(120% 62% at 50% -4%, #FCF6EA 0%, #F2EBDD 48%, #E7E1D0 100%)" }}>
      <div style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", right: -116, top: -70,
        border: "1px dashed rgba(44,97,71,.18)" }}></div>
      <div style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", left: -92, bottom: 62,
        border: "1px dashed rgba(44,97,71,.14)" }}></div>

      <div style={{ position: "absolute", top: 54, left: 26, right: 26, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="kicker">HUĀHUĀ · MVP</span>
        <span style={{ fontFamily: "var(--f-script)", fontSize: 18, color: "var(--green)" }}>初次见面</span>
      </div>

      <main style={{ position: "absolute", inset: "102px 24px 30px", display: "flex", flexDirection: "column" }}>
        <div style={{ position: "relative", height: 148, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: 124, height: 124, borderRadius: "50%", background: "rgba(219,229,210,.72)",
            boxShadow: "inset 0 0 0 1px rgba(44,97,71,.08)" }}></div>
          <svg width="126" height="126" viewBox="0 0 126 126" style={{ position: "relative", overflow: "visible" }} aria-hidden="true">
            <path d="M63 91C60 65 66 43 87 24" fill="none" stroke="#315F47" strokeWidth="3" strokeLinecap="round"/>
            <path d="M68 69C83 69 96 60 99 45 84 43 72 51 68 69Z" fill="#6F8D68"/>
            <path d="M63 77C50 75 39 66 37 53 50 52 61 60 63 77Z" fill="#88A17A"/>
            <path d="M57 100h28l-4 16H61Z" fill="#A9794E"/>
            <path d="M55 97h32" stroke="#755334" strokeWidth="4" strokeLinecap="round"/>
            <path d="M65 101c4 0 6 5 5 12" fill="none" stroke="#C99B68" strokeWidth="4" strokeLinecap="round" opacity=".7"/>
            <path d="M90 27c8-7 16-5 19 0-5 6-13 8-19 0Z" fill="#D2A267" transform="rotate(-14 90 27)"/>
          </svg>
          <span style={{ position: "absolute", right: 38, top: 12, fontFamily: "var(--f-script)", fontSize: 20,
            color: "var(--ink-faint)", transform: "rotate(7deg)" }}>留个地址吧</span>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: "var(--f-journal)", fontSize: 29, lineHeight: 1.38, fontWeight: 700, letterSpacing: "-.5px" }}>
            给你的花园，<br/><span className="hl">留一扇回来的门</span>
          </div>
          <p className="serif" style={{ margin: "13px 0 0", color: "var(--ink-soft)", fontSize: 14.5, lineHeight: 1.75 }}>
            填一个常用邮箱。以后换了设备，<br/>再写下它，就能找到原来的花花们。
          </p>
        </div>

        <form onSubmit={submit} noValidate style={{ marginTop: 26 }}>
          <label htmlFor="mvp-email" style={{ display: "block", fontSize: 11.5, letterSpacing: "1.2px", fontWeight: 600,
            color: "var(--ink-faint)", margin: "0 0 8px 4px" }}>你的邮箱</label>
          <div style={{ position: "relative" }}>
            <Icon name="mail" size={19} color={error ? "var(--coral)" : "var(--green)"}
              style={{ position: "absolute", left: 16, top: 17, pointerEvents: "none" }} />
            <input id="mvp-email" type="email" inputMode="email" autoComplete="email" value={email}
              onChange={e => { setEmail(e.target.value); if (error) setError(""); }}
              placeholder="name@example.com" aria-invalid={!!error} aria-describedby="mvp-email-error"
              style={{ width: "100%", height: 54, borderRadius: 13, border: `1.5px solid ${error ? "var(--coral-soft)" : valid ? "rgba(44,97,71,.48)" : "var(--hairline)"}`,
                background: "rgba(251,246,235,.9)", padding: "0 44px", outline: "none", color: "var(--ink)", fontSize: 15.5,
                boxShadow: valid ? "0 5px 16px rgba(44,97,71,.08)" : "var(--sh-1)", transition: "all .18s ease" }} />
            {valid && <Icon name="check" size={17} color="var(--green)" style={{ position: "absolute", right: 16, top: 18 }} />}
          </div>
          <div id="mvp-email-error" role="alert" style={{ minHeight: 22, padding: "6px 4px 0", fontSize: 12.5,
            color: error ? "var(--coral)" : "transparent" }}>{error || "占位"}</div>

          <button type="submit" disabled={busy} className="btn-green" style={{ width: "100%", height: 54, marginTop: 8,
            fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: busy ? .7 : 1 }}>
            {busy ? "正在推开花园的门…" : "进入我的花园"}
            {!busy && <Icon name="arrowR" size={19} color="#fff" />}
          </button>
        </form>

        <div style={{ marginTop: "auto", borderTop: "1px solid var(--hairline)", paddingTop: 14, display: "flex", gap: 9, alignItems: "flex-start" }}>
          <span style={{ flexShrink: 0, padding: "3px 7px", borderRadius: 999, background: "var(--lime-soft)", color: "var(--ink)",
            fontSize: 10.5, fontWeight: 700 }}>测试版</span>
          <span style={{ fontSize: 11.5, lineHeight: 1.55, color: "var(--ink-faint)" }}>目前不验证邮箱，请不要在日记里保存隐私或敏感信息。</span>
        </div>
      </main>
    </div>
  );
}
window.EmailEntry = EmailEntry;
