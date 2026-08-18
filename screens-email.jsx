/* ============================================================
   花花日记本 MVP · standard email OTP
   Two steps on one journal flyleaf: address → six-digit code.
   ============================================================ */
function EmailEntry({ onEnter }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verificationInfo, setVerificationInfo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const codeInput = useRef(null);
  const valid = window.HHAccount.isValidEmail(email);

  useEffect(() => {
    if (step !== "code" || seconds <= 0) return;
    const timer = setTimeout(() => setSeconds(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, seconds]);

  useEffect(() => {
    if (step === "code") setTimeout(() => codeInput.current && codeInput.current.focus(), 120);
  }, [step]);

  useEffect(() => {
    if (step === "code" && code.length === 6) verifyCode();
  }, [code]);

  async function sendCode(event) {
    if (event) event.preventDefault();
    setError("");
    if (!valid) {
      setError("再检查一下邮箱格式，好像少了点什么");
      return;
    }
    setBusy(true);
    try {
      const result = await window.HHAccount.requestEmailCode(email);
      setEmail(result.email);
      setVerificationInfo(result.verificationInfo);
      setCode("");
      setSeconds(60);
      setStep("code");
    } catch (err) {
      setError(err && err.message ? err.message : "这封信没寄出去，请再试一次");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event) {
    if (event) event.preventDefault();
    if (busy) return;
    setError("");
    if (code.length !== 6) {
      setError("请输入完整的 6 位验证码");
      return;
    }
    setBusy(true);
    try {
      const result = await window.HHAccount.verifyEmailCode(email, code, verificationInfo);
      await onEnter(result);
    } catch (err) {
      setError(err && err.message ? err.message : "花园门口有点拥挤，请再试一次");
      setBusy(false);
      setTimeout(() => codeInput.current && codeInput.current.focus(), 80);
    }
  }

  function editEmail() {
    setStep("email");
    setCode("");
    setVerificationInfo(null);
    setSeconds(0);
    setError("");
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
        <span style={{ fontFamily: "var(--f-script)", fontSize: 18, color: "var(--green)" }}>{step === "email" ? "初次见面" : "信已寄出"}</span>
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
            <g transform={step === "email" ? "translate(0 0)" : "translate(-2 2) rotate(-5 98 29)"}>
              <path d="M90 27c8-7 16-5 19 0-5 6-13 8-19 0Z" fill="#D2A267"/>
              {step === "code" && <><rect x="87" y="17" width="27" height="19" rx="3" fill="#FBF6EB" stroke="#315F47" strokeWidth="1.5"/><path d="m89 20 11.5 8L112 20" fill="none" stroke="#6F8D68" strokeWidth="1.4"/></>}
            </g>
          </svg>
          <span style={{ position: "absolute", right: 38, top: 12, fontFamily: "var(--f-script)", fontSize: 20,
            color: "var(--ink-faint)", transform: "rotate(7deg)" }}>{step === "email" ? "留个地址吧" : "去邮箱看看"}</span>
        </div>

        {step === "email" ? (
          <div className="soft-fade">
            <div style={{ marginTop: 12 }}>
              <div style={{ fontFamily: "var(--f-journal)", fontSize: 29, lineHeight: 1.38, fontWeight: 700, letterSpacing: "-.5px" }}>
                给你的花园，<br/><span className="hl">留一扇回来的门</span>
              </div>
              <p className="serif" style={{ margin: "13px 0 0", color: "var(--ink-soft)", fontSize: 14.5, lineHeight: 1.75 }}>
                填一个常用邮箱，我们会寄去一封<br/>只装着六个数字的短短信笺。
              </p>
            </div>

            <form onSubmit={sendCode} noValidate style={{ marginTop: 26 }}>
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
              <InlineEmailError error={error} />
              <button type="submit" disabled={busy} className="btn-green" style={{ width: "100%", height: 54, marginTop: 8,
                fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: busy ? .7 : 1 }}>
                {busy ? "正在寄出…" : "寄一封回花园的信"}
                {!busy && <Icon name="arrowR" size={19} color="#fff" />}
              </button>
            </form>
          </div>
        ) : (
          <div className="soft-fade" style={{ marginTop: 12 }}>
            <div style={{ fontFamily: "var(--f-journal)", fontSize: 28, lineHeight: 1.38, fontWeight: 700, letterSpacing: "-.5px" }}>
              信已经寄到了，<br/><span className="hl">抄下里面的六个数字</span>
            </div>
            <div style={{ marginTop: 11, display: "flex", alignItems: "center", gap: 7, color: "var(--ink-soft)", fontSize: 13 }}>
              <Icon name="mail" size={15} color="var(--green)" />
              <span style={{ maxWidth: 245, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</span>
              <button onClick={editEmail} style={{ color: "var(--green)", fontWeight: 600, flexShrink: 0 }}>换一个</button>
            </div>

            <form onSubmit={verifyCode} style={{ marginTop: 24 }}>
              <div onClick={() => codeInput.current && codeInput.current.focus()} style={{ position: "relative", display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)", gap: 7 }}>
                {[0,1,2,3,4,5].map(index => (
                  <div key={index} style={{ height: 52, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(251,246,235,.92)", border: `1.5px solid ${error ? "rgba(200,85,60,.38)" : code.length === index ? "var(--green)" : "var(--hairline)"}`,
                    boxShadow: code.length === index ? "0 5px 14px rgba(44,97,71,.10)" : "var(--sh-1)",
                    fontFamily: "var(--f-num)", fontSize: 23, fontWeight: 700, color: "var(--ink)" }}>
                    {code[index] || ""}
                  </div>
                ))}
                <input ref={codeInput} value={code} inputMode="numeric" autoComplete="one-time-code" aria-label="六位邮箱验证码"
                  onChange={e => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); if (error) setError(""); }}
                  style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "text" }} />
              </div>
              <InlineEmailError error={error} />

              <button type="submit" disabled={busy || code.length !== 6} className="btn-green" style={{ width: "100%", height: 52, marginTop: 14,
                fontSize: 16, opacity: busy || code.length !== 6 ? .48 : 1 }}>
                {busy ? "正在确认…" : "打开我的花园"}
              </button>
            </form>

            <div style={{ marginTop: 14, textAlign: "center", fontSize: 12.5, color: "var(--ink-faint)" }}>
              {seconds > 0 ? `${seconds} 秒后可以重新发送` : <button onClick={() => sendCode()} disabled={busy} style={{ color: "var(--green)", fontWeight: 600 }}>没有收到？重新发送</button>}
            </div>
          </div>
        )}

        <div style={{ marginTop: "auto", borderTop: "1px solid var(--hairline)", paddingTop: 14, display: "flex", gap: 9, alignItems: "flex-start" }}>
          <Icon name="leaf" size={15} color="var(--green)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 11.5, lineHeight: 1.55, color: "var(--ink-faint)" }}>验证码只用于登录花花日记本，我们不会发送营销邮件。</span>
        </div>
      </main>
    </div>
  );
}

function InlineEmailError({ error }) {
  return <div id="mvp-email-error" role="alert" style={{ minHeight: 22, padding: "6px 4px 0", fontSize: 12.5,
    color: error ? "var(--coral)" : "transparent" }}>{error || "占位"}</div>;
}

window.EmailEntry = EmailEntry;
