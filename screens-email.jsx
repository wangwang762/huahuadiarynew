/* ============================================================
   花花日记本 MVP · standard email OTP
   Two steps revealed behind a one-time garden gate entrance.
   ============================================================ */
function GardenGateScene({ settled = false }) {
  return (
    <div className={`garden-gate-scene${settled ? " is-settled" : ""}`} aria-hidden="true">
      <div className="garden-sunwash"></div>
      <svg className="garden-landscape" viewBox="0 0 390 276" preserveAspectRatio="xMidYMax meet">
        <defs>
          <linearGradient id="gardenHillBack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#DDE5D5" />
            <stop offset="1" stopColor="#CAD7C4" />
          </linearGradient>
          <linearGradient id="gardenHillFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#B7C9AE" />
            <stop offset="1" stopColor="#91A68B" />
          </linearGradient>
          <linearGradient id="petalClay" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#D6A17F" />
            <stop offset="1" stopColor="#B97C68" />
          </linearGradient>
        </defs>

        <circle cx="201" cy="72" r="38" fill="#F1D8A8" opacity=".42" />
        <path d="M0 177C63 139 112 157 160 174C218 194 275 127 390 159V276H0Z" fill="url(#gardenHillBack)" />
        <path d="M0 211C75 176 126 207 190 214C259 221 310 174 390 191V276H0Z" fill="url(#gardenHillFront)" />

        <g className="garden-stem-sway garden-stem-sway-left">
          <path d="M57 269C61 218 56 171 36 119" fill="none" stroke="#55745C" strokeWidth="4" strokeLinecap="round" />
          <path d="M57 221C39 202 25 200 12 206C27 221 41 228 57 221Z" fill="#718B70" />
          <path d="M48 177C66 159 82 157 96 165C82 180 66 188 48 177Z" fill="#829879" />
          <g transform="translate(36 115)">
            <ellipse cx="0" cy="-10" rx="10" ry="18" fill="url(#petalClay)" />
            <ellipse cx="13" cy="0" rx="10" ry="18" transform="rotate(70 13 0)" fill="#C58A73" />
            <ellipse cx="-13" cy="0" rx="10" ry="18" transform="rotate(-70 -13 0)" fill="#D2A080" />
            <ellipse cx="7" cy="13" rx="10" ry="17" transform="rotate(145 7 13)" fill="#B97C68" />
            <ellipse cx="-8" cy="13" rx="10" ry="17" transform="rotate(-145 -8 13)" fill="#C98E75" />
            <circle cx="0" cy="2" r="7" fill="#8D634A" />
          </g>
        </g>

        <g className="garden-stem-sway garden-stem-sway-mid">
          <path d="M297 276C295 220 307 164 334 107" fill="none" stroke="#496B52" strokeWidth="4" strokeLinecap="round" />
          <path d="M302 219C322 199 338 198 352 207C336 222 320 228 302 219Z" fill="#667F64" />
          <path d="M315 170C294 154 278 155 265 165C282 177 299 182 315 170Z" fill="#7C9273" />
          <g transform="translate(336 102)">
            <ellipse cx="0" cy="-11" rx="11" ry="19" fill="#E1C28F" />
            <ellipse cx="14" cy="0" rx="11" ry="19" transform="rotate(70 14 0)" fill="#D5B27B" />
            <ellipse cx="-14" cy="0" rx="11" ry="19" transform="rotate(-70 -14 0)" fill="#E5CC9D" />
            <ellipse cx="8" cy="14" rx="11" ry="18" transform="rotate(145 8 14)" fill="#CDA970" />
            <ellipse cx="-8" cy="14" rx="11" ry="18" transform="rotate(-145 -8 14)" fill="#DBC08C" />
            <circle cx="0" cy="2" r="7" fill="#8A714B" />
          </g>
        </g>

        <g className="garden-stem-sway garden-stem-sway-right">
          <path d="M361 276C357 236 361 205 376 172" fill="none" stroke="#57775B" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M363 228C346 215 334 216 324 224C338 233 350 237 363 228Z" fill="#6D876B" />
          <path d="M371 196C382 183 390 182 397 185V207C389 209 380 207 371 196Z" fill="#819578" />
          <circle cx="377" cy="166" r="10" fill="#B87E75" />
          <circle cx="367" cy="168" r="8" fill="#CC9486" />
          <circle cx="384" cy="174" r="8" fill="#D5A28F" />
          <circle cx="376" cy="174" r="4" fill="#7E654C" />
        </g>

        <g opacity=".9">
          <path d="M93 276C91 246 97 221 111 197" fill="none" stroke="#5C785E" strokeWidth="3" />
          <ellipse cx="114" cy="194" rx="9" ry="15" fill="#C99A87" />
          <path d="M144 276C145 247 139 227 129 211" fill="none" stroke="#607B60" strokeWidth="3" />
          <circle cx="127" cy="207" r="9" fill="#D9BC91" />
          <path d="M236 276C238 247 231 224 218 204" fill="none" stroke="#557159" strokeWidth="3" />
          <ellipse cx="216" cy="199" rx="9" ry="14" fill="#B98376" />
        </g>
      </svg>

      <span className="garden-petal garden-petal-one"></span>
      <span className="garden-petal garden-petal-two"></span>
      <div className="garden-door garden-door-left"><span></span></div>
      <div className="garden-door garden-door-right"><span></span></div>
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
      <main className="garden-login-form">
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
