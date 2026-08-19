/* ============================================================
   花花日记本 MVP · standard email OTP
   Two steps revealed behind a one-time garden gate entrance.
   ============================================================ */
function GardenGateScene({ settled = false }) {
  return (
    <div className={`garden-gate-world${settled ? " is-settled" : ""}`} aria-hidden="true">
      <div className="garden-atmosphere">
        <span className="garden-morning-orb"></span>
        <span className="garden-wall-shadow garden-wall-shadow-one"></span>
        <span className="garden-wall-shadow garden-wall-shadow-two"></span>
      </div>

      <div className="garden-midground">
        <div className="garden-plant garden-plant-left">
          <img src="assets/plants/final-v1/guibeizhu.png" alt="" />
        </div>
        <div className="garden-plant garden-plant-center">
          <img src="assets/plants/final-v1/hudielan.png" alt="" />
        </div>
        <div className="garden-plant garden-plant-right">
          <img src="assets/plants/final-v1/xiuqiuhua.png" alt="" />
        </div>
        <div className="garden-stone-shelf"></div>
      </div>

      <svg className="garden-foreground" viewBox="0 0 390 844" preserveAspectRatio="none">
        <g className="garden-foreground-left">
          <path d="M-42 487C22 438 80 443 112 494C52 514 2 512-42 487Z" fill="#294F3C" />
          <path d="M-26 571C21 513 85 510 124 552C70 584 19 592-26 571Z" fill="#375F48" />
          <path d="M-17 657C12 595 69 575 116 605C78 650 34 669-17 657Z" fill="#54745B" />
          <path d="M-6 844C1 697 32 577 90 472" fill="none" stroke="#244936" strokeWidth="10" strokeLinecap="round" />
        </g>
        <g className="garden-foreground-right">
          <path d="M432 463C378 426 324 437 294 482C346 502 392 497 432 463Z" fill="#315640" />
          <path d="M425 555C384 505 328 505 292 544C339 572 384 577 425 555Z" fill="#45694F" />
          <path d="M420 650C392 588 338 572 294 603C332 645 373 663 420 650Z" fill="#607B60" />
          <path d="M398 844C394 690 364 567 309 460" fill="none" stroke="#2C503B" strokeWidth="10" strokeLinecap="round" />
        </g>
      </svg>

      <div className="garden-gate-light"></div>
      <div className="garden-door-v2 garden-door-left-v2">
        <div className="garden-door-panel garden-door-panel-top"></div>
        <div className="garden-door-panel garden-door-panel-bottom"></div>
        <span className="garden-door-knob"></span>
      </div>
      <div className="garden-door-v2 garden-door-right-v2">
        <div className="garden-door-panel garden-door-panel-top"></div>
        <div className="garden-door-panel garden-door-panel-bottom"></div>
        <span className="garden-door-knob"></span>
      </div>
    </div>
  );
}

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
    <div className="garden-login-page soft-fade">
      <GardenGateScene settled={step === "code"} />
      <main className="garden-journal-sheet garden-paper-reveal">
        <div className="garden-paper-kicker">花园通行笺 · HUĀHUĀ</div>
        {step === "email" ? (
          <div className="soft-fade">
            <div className="garden-login-heading">
              <div className="garden-login-title">登录花花日记本</div>
              <p className="serif garden-login-helper">用邮箱保存并找回你的花园</p>
            </div>

            <form onSubmit={sendCode} noValidate className="garden-login-fields">
              <label htmlFor="mvp-email" style={{ display: "block", fontSize: 11.5, letterSpacing: "1.2px", fontWeight: 600,
                color: "var(--ink-faint)", margin: "0 0 8px 4px" }}>邮箱</label>
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
                {busy ? "正在发送…" : "获取验证码"}
                {!busy && <Icon name="arrowR" size={19} color="#fff" />}
              </button>
            </form>
          </div>
        ) : (
          <div className="soft-fade">
            <div className="garden-login-title">输入邮箱验证码</div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 7, color: "var(--ink-soft)", fontSize: 13 }}>
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
                {busy ? "正在登录…" : "进入我的花园"}
              </button>
            </form>

            <div style={{ marginTop: 14, textAlign: "center", fontSize: 12.5, color: "var(--ink-faint)" }}>
              {seconds > 0 ? `${seconds} 秒后可以重新发送` : <button onClick={() => sendCode()} disabled={busy} style={{ color: "var(--green)", fontWeight: 600 }}>没有收到？重新发送</button>}
            </div>
          </div>
        )}

        <div className="garden-login-privacy">验证码仅用于登录，不会发送营销邮件</div>
      </main>
    </div>
  );
}

function InlineEmailError({ error }) {
  return <div id="mvp-email-error" role="alert" style={{ minHeight: 22, padding: "6px 4px 0", fontSize: 12.5,
    color: error ? "var(--coral)" : "transparent" }}>{error || "\u00A0"}</div>;
}

window.EmailEntry = EmailEntry;
