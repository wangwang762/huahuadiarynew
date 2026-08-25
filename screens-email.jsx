/* ============================================================
   花花日记本 MVP · standard email OTP
   Two steps revealed behind a one-time field-journal cover.
   ============================================================ */
function MinimalJournalScene({ settled = false }) {
  return (
    <div className={`collage-login-stage${settled ? " is-settled" : ""}`} aria-hidden="true">
      <div className="collage-corkboard"></div>
      <div className="collage-field-sheet-back"></div>
      <div className="collage-field-sheet">
        <div className="journal-botanical-sticker" aria-hidden="true">
          <span className="journal-sticker-pin"></span>
          <svg viewBox="0 0 38 48" fill="none">
            <path d="M20 43C20 31 19 20 16 8" />
            <path d="M17 17C10 16 7 12 6 7C12 7 16 10 17 17Z" />
            <path d="M19 25C27 23 31 19 32 13C25 13 20 17 19 25Z" />
            <path d="M19 34C12 33 8 29 7 24C13 24 18 27 19 34Z" />
          </svg>
          <span className="journal-sticker-copy">GROW SLOWLY</span>
        </div>
        <figure className="collage-polaroid minimal-journal-photo">
          <div><img src="assets/plants/final-v1/guibeizhu.png" alt="" /></div>
          <figcaption>MONSTERA · 03</figcaption>
        </figure>
        <span className="collage-tape minimal-journal-tape"></span>
      </div>

      <div className="collage-cover collage-cover-left">
        <span className="collage-cover-edge"></span>
        <div className="collage-cover-copy">
          <span>PLANT OBSERVATION</span>
          <strong>花花<br />日记本</strong>
          <small>FIELD NOTES · 2026</small>
        </div>
      </div>
      <div className="collage-cover collage-cover-right">
        <span className="collage-cover-edge"></span>
        <span className="collage-cover-label">NO. 0826</span>
        <span className="collage-cover-flower">✿</span>
      </div>
    </div>
  );
}

function EmailEntry({ onEnter, onSkip }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verificationInfo, setVerificationInfo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const codeInput = useRef(null);
  const valid = window.HHAccount.isValidEmail(email);
  const paperDate = new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" })
    .format(new Date()).replace("/", " / ");

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

  async function skipLogin() {
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      await onSkip();
    } catch (err) {
      setError(err && err.message ? err.message : "本地花园没有打开，请再试一次");
      setBusy(false);
    }
  }

  return (
    <div className="collage-login-page soft-fade">
      <MinimalJournalScene settled={step === "code"} />
      <main className="collage-login-form collage-form-reveal">
        <div className="collage-form-meta">
          <span>HUĀHUĀ FIELD NOTES</span>
          <span>{paperDate}</span>
        </div>
        {step === "email" ? (
          <div className="soft-fade">
            <div className="collage-login-heading">
              <div className="collage-login-title">登录花花日记本</div>
            </div>

            <form onSubmit={sendCode} noValidate className="collage-login-fields">
              <label htmlFor="mvp-email" className="collage-field-label">邮箱</label>
              <div className={`collage-email-note${error ? " has-error" : valid ? " is-valid" : ""}`}>
                <Icon name="mail" size={19} color={error ? "var(--coral)" : "var(--green)"}
                  style={{ pointerEvents: "none" }} />
                <input id="mvp-email" type="email" inputMode="email" autoComplete="email" value={email}
                  onChange={e => { setEmail(e.target.value); if (error) setError(""); }}
                  placeholder="name@example.com" aria-invalid={!!error} aria-describedby="mvp-email-error"
                  className="collage-email-input" />
                {valid && <Icon name="check" size={17} color="var(--green)" />}
              </div>
              <InlineEmailError error={error} />
              <button type="submit" disabled={busy} className="collage-paper-button" style={{ opacity: busy ? .7 : 1 }}>
                {busy ? "正在发送…" : "获取验证码"}
                {!busy && <Icon name="arrowR" size={19} color="#fff" />}
              </button>
              <button type="button" className="collage-guest-skip" onClick={skipLogin} disabled={busy}>
                跳过登录
              </button>
            </form>
          </div>
        ) : (
          <div className="soft-fade">
            <div className="collage-login-title">输入邮箱验证码</div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 7, color: "var(--ink-soft)", fontSize: 13 }}>
              <Icon name="mail" size={15} color="var(--green)" />
              <span style={{ maxWidth: 245, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</span>
              <button onClick={editEmail} style={{ color: "var(--green)", fontWeight: 600, flexShrink: 0 }}>换一个</button>
            </div>

            <form onSubmit={verifyCode} style={{ marginTop: 24 }}>
              <div className="collage-otp-row" onClick={() => codeInput.current && codeInput.current.focus()}>
                {[0,1,2,3,4,5].map(index => (
                  <div key={index} className={`collage-otp-stamp${error ? " has-error" : code.length === index ? " is-active" : ""}`}>
                    {code[index] || ""}
                  </div>
                ))}
                <input ref={codeInput} value={code} inputMode="numeric" autoComplete="one-time-code" aria-label="六位邮箱验证码"
                  onChange={e => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); if (error) setError(""); }}
                  style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "text" }} />
              </div>
              <InlineEmailError error={error} />

              <button type="submit" disabled={busy || code.length !== 6} className="collage-paper-button" style={{ opacity: busy || code.length !== 6 ? .48 : 1 }}>
                {busy ? "正在登录…" : "进入我的花园"}
              </button>
            </form>

            <div style={{ marginTop: 14, textAlign: "center", fontSize: 12.5, color: "var(--ink-faint)" }}>
              {seconds > 0 ? `${seconds} 秒后可以重新发送` : <button onClick={() => sendCode()} disabled={busy} style={{ color: "var(--green)", fontWeight: 600 }}>没有收到？重新发送</button>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function InlineEmailError({ error }) {
  return <div id="mvp-email-error" role="alert" style={{ minHeight: 22, padding: "6px 4px 0", fontSize: 12.5,
    color: error ? "var(--coral)" : "transparent" }}>{error || "\u00A0"}</div>;
}

window.EmailEntry = EmailEntry;
