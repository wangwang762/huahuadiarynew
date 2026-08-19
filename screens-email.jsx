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

      <div className="garden-light-rays">
        <span className="garden-light-ray garden-light-ray-one"></span>
        <span className="garden-light-ray garden-light-ray-two"></span>
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
          <path d="M4 844C9 728 23 647 52 588" fill="none" stroke="#294C39" strokeWidth="5" strokeLinecap="round" />
          <path d="M17 726C28 676 54 648 83 651C72 688 49 714 17 726Z" fill="#42674E" />
          <path d="M30 665C31 619 49 588 75 581C75 619 60 650 30 665Z" fill="#57775B" />
          <path d="M8 783C21 746 43 729 66 737C55 766 35 783 8 783Z" fill="#315A42" />
        </g>
        <g className="garden-foreground-right">
          <path d="M386 844C382 727 367 648 337 590" fill="none" stroke="#2C503B" strokeWidth="5" strokeLinecap="round" />
          <path d="M373 724C362 677 337 648 308 652C319 689 341 714 373 724Z" fill="#4B6C52" />
          <path d="M359 661C359 619 341 588 315 581C316 619 331 648 359 661Z" fill="#687F60" />
          <path d="M382 782C369 747 348 730 325 738C336 766 355 783 382 782Z" fill="#385F46" />
        </g>
      </svg>

      <div className="garden-dust">
        <span></span><span></span><span></span>
      </div>

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

  return (
    <div className="garden-login-page soft-fade">
      <GardenGateScene settled={step === "code"} />
      <svg className="garden-leaf-shadow" viewBox="0 0 390 844" preserveAspectRatio="none" aria-hidden="true">
        <g>
          <path d="M286 382C326 402 352 437 362 485" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="318" cy="411" rx="13" ry="31" transform="rotate(-47 318 411)" />
          <ellipse cx="347" cy="448" rx="12" ry="29" transform="rotate(-34 347 448)" />
          <ellipse cx="296" cy="393" rx="11" ry="27" transform="rotate(-64 296 393)" />
        </g>
      </svg>
      <main className="garden-journal-sheet garden-paper-reveal">
        <div className="garden-paper-meta">
          <div className="garden-paper-kicker">花园通行笺 · HUĀHUĀ</div>
          <div className="garden-paper-date">{paperDate}</div>
        </div>
        {step === "email" ? (
          <div className="soft-fade">
            <div className="garden-login-heading">
              <div className="garden-login-title">登录花花日记本</div>
              <p className="serif garden-login-helper">用邮箱保存并找回你的花园</p>
            </div>

            <form onSubmit={sendCode} noValidate className="garden-login-fields">
              <label htmlFor="mvp-email" className="garden-field-label">邮箱地址</label>
              <div className={`garden-line-field${error ? " has-error" : valid ? " is-valid" : ""}`}>
                <Icon name="mail" size={19} color={error ? "var(--coral)" : "var(--green)"}
                  style={{ pointerEvents: "none" }} />
                <input id="mvp-email" type="email" inputMode="email" autoComplete="email" value={email}
                  onChange={e => { setEmail(e.target.value); if (error) setError(""); }}
                  placeholder="name@example.com" aria-invalid={!!error} aria-describedby="mvp-email-error"
                  className="garden-line-input" />
                {valid && <Icon name="check" size={17} color="var(--green)" />}
              </div>
              <InlineEmailError error={error} />
              <button type="submit" disabled={busy} className="garden-ink-button" style={{ opacity: busy ? .7 : 1 }}>
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
              <div className="garden-otp-lines" onClick={() => codeInput.current && codeInput.current.focus()}>
                {[0,1,2,3,4,5].map(index => (
                  <div key={index} className={`garden-otp-line${error ? " has-error" : code.length === index ? " is-active" : ""}`}>
                    {code[index] || ""}
                  </div>
                ))}
                <input ref={codeInput} value={code} inputMode="numeric" autoComplete="one-time-code" aria-label="六位邮箱验证码"
                  onChange={e => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); if (error) setError(""); }}
                  style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "text" }} />
              </div>
              <InlineEmailError error={error} />

              <button type="submit" disabled={busy || code.length !== 6} className="garden-ink-button" style={{ opacity: busy || code.length !== 6 ? .48 : 1 }}>
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
