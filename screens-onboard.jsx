/* ============================================================
   花花日记本 · 新手引导 — 从空无一物，到第一篇日记
   welcome(空) → 拍照 → AI识别 → 起名+性格 → 注入灵魂(动效) → 第一篇日记
   ============================================================ */
function Onboard({ onComplete, onSkip }) {
  const [step, setStep] = useState(0);
  const [runId] = useState(() => "ob-" + Date.now());
  const [sp, setSp] = useState(window.SPECIES[0]);  // recognised species preset
  const [name, setName] = useState("");
  const [traits, setTraits] = useState(window.SPECIES[0].traits.slice(0, 3));
  const [opener, setOpener] = useState("");
  const photoId = runId + "-photo";

  function pickSpecies(s) {
    setSp(s);
    setTraits(s.traits.slice(0, 3));
  }
  function toggleTrait(t) {
    setTraits(ts => ts.includes(t) ? ts.filter(x => x !== t) : (ts.length >= 4 ? ts : [...ts, t]));
  }

  function buildPlant(firstLine) {
    const p = {
      id: "u" + Date.now(), name: name.trim() || "小绿", species: sp.species, shape: sp.shape,
      accent: sp.accent, deep: sp.deep, bubble: sp.bubble, soft: sp.soft, pot: sp.pot,
      tagsOn: traits, tagsOff: sp.traits.filter(t => !traits.includes(t)),
      custom: sp.care, style: traits.join("、") + "。",
      voice: firstLine, opener: firstLine,
      days: 1, mood: "初遇", stars: 5,
      status: "刚住进来", statusTone: "good", photoId, born: "2026年6月7日",
      diary: [{
        id: runId + "-d1", day: "今天", date: "6月7日", weather: "🌧 小雨 22°",
        mood: "初遇", type: "born", photo: photoId,
        quote: ["第一次见面。它说它叫", { hl: name.trim() || "小绿" }, "，", { grn: "我们的故事从今天开始" }, "。"],
        voice: firstLine, stars: 5,
      }],
    };
    return p;
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden",
      background: `radial-gradient(140% 70% at 50% -8%, #FBF4E8 0%, var(--paper) 44%, ${sp.soft}55 100%)` }}>
      {/* progress dots */}
      {step < 4 && (
        <div style={{ position: "absolute", top: 58, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 7, zIndex: 5 }}>
          {[0,1,2,3].map(i => (
            <span key={i} style={{ width: i === step ? 20 : 7, height: 7, borderRadius: 999,
              background: i === step ? sp.deep : "rgba(58,53,46,0.14)", transition: "all .3s" }}></span>
          ))}
        </div>
      )}
      {step === 0 && <ObWelcome sp={sp} onNext={() => setStep(1)} onSkip={onSkip} />}
      {step === 1 && <ObCapture sp={sp} photoId={photoId} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <ObDetect sp={sp} photoId={photoId} pickSpecies={pickSpecies} onNext={() => setStep(3)} />}
      {step === 3 && <ObName sp={sp} photoId={photoId} name={name} setName={setName} traits={traits} toggleTrait={toggleTrait} onNext={() => setStep(4)} />}
      {step === 4 && <ObGenerate sp={sp} name={name} traits={traits} setOpener={setOpener} onNext={() => setStep(5)} />}
      {step === 5 && <ObReveal sp={sp} name={name} photoId={photoId} opener={opener}
        onDone={() => onComplete(buildPlant(opener))} />}
    </div>
  );
}
window.Onboard = Onboard;

/* ---------- 0 · welcome / empty state ---------- */
function ObWelcome({ sp, onNext, onSkip }) {
  return (
    <div className="soft-fade" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "0 36px", textAlign: "center" }}>
      {/* empty pot illustration */}
      <div style={{ position: "relative", marginBottom: 30 }}>
        <div style={{ width: 150, height: 150, borderRadius: "50%", border: "1.5px dashed var(--hairline)",
          display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 18 }}>
          <svg width="64" height="50" viewBox="0 0 64 50">
            <path d="M14 6h36l-5 38H19z" fill="none" stroke="var(--ink-faint)" strokeWidth="1.6" strokeLinejoin="round" strokeDasharray="3 4"/>
            <path d="M10 4h44" stroke="var(--ink-faint)" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="3 4"/>
            <path d="M32 32v-8" stroke="var(--green)" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M32 27c-3-1-5 0-6 2 2 1 5 1 6-2Z" fill="var(--green-soft)" stroke="var(--green)" strokeWidth="1.2"/>
          </svg>
        </div>
        <div style={{ position: "absolute", top: -6, right: -10, fontFamily: "var(--f-script)", fontSize: 20, color: "var(--ink-faint)",
          transform: "rotate(8deg)" }}>空空的…</div>
      </div>

      <div style={{ fontFamily: "var(--f-script)", fontSize: 19, color: "var(--ink-faint)" }}>你的花花日记本</div>
      <div style={{ fontFamily: "var(--f-journal)", fontSize: 27, fontWeight: 600, color: "var(--ink)", marginTop: 6, lineHeight: 1.4 }}>
        还空着一页，<br />等一盆花住进来
      </div>
      <div className="serif" style={{ fontSize: 15.5, color: "var(--ink-soft)", marginTop: 16, lineHeight: 1.7, maxWidth: 270 }}>
        拍下你正在养的那盆植物，<br />让它的灵魂，住进这本日记里。
      </div>

      <button onClick={onNext} className="btn-green" style={{ marginTop: 36, width: "100%", maxWidth: 300, height: 56,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontSize: 17 }}>
        <Icon name="camera" size={22} color="#fff" /> 拍下第一张照片
      </button>
      <button onClick={onSkip} style={{ marginTop: 16, fontSize: 14, color: "var(--ink-faint)" }}>先随便逛逛</button>
    </div>
  );
}

/* ---------- 1 · capture photo ---------- */
function ObCapture({ sp, photoId, onNext, onBack }) {
  return (
    <div className="soft-fade" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", padding: "108px 30px 40px" }}>
      <div style={{ fontFamily: "var(--f-journal)", fontSize: 22, fontWeight: 600, color: "var(--ink)" }}>把整盆花放进取景框</div>
      <div className="serif" style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 8, textAlign: "center", lineHeight: 1.6 }}>
        拍清楚叶子和盆，<br />我才能认出它是谁。
      </div>

      {/* viewfinder */}
      <div style={{ position: "relative", width: 270, height: 340, marginTop: 28, borderRadius: 24, overflow: "hidden",
        background: "#EFE7DA", boxShadow: "var(--sh-2)" }}>
        <image-slot id={photoId} shape="rect"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
          placeholder="把照片拖进来 / 点击上传"></image-slot>
        {/* corner brackets */}
        {[["6px","6px","",""],["6px","","6px",""],["","6px","","6px"],["","","6px","6px"]].map((c, i) => (
          <div key={i} style={{ position: "absolute", top: c[0] || "auto", left: c[1] || "auto", bottom: c[2] || "auto", right: c[3] || "auto",
            width: 26, height: 26,
            borderTop: c[0] ? `2.5px solid ${sp.accent}` : "none", borderLeft: c[1] ? `2.5px solid ${sp.accent}` : "none",
            borderBottom: c[2] ? `2.5px solid ${sp.accent}` : "none", borderRight: c[3] ? `2.5px solid ${sp.accent}` : "none",
            borderTopLeftRadius: c[0] && c[1] ? 10 : 0, borderTopRightRadius: c[0] && c[3] ? 10 : 0,
            borderBottomLeftRadius: c[2] && c[1] ? 10 : 0, borderBottomRightRadius: c[2] && c[3] ? 10 : 0,
            pointerEvents: "none" }}></div>
        ))}
      </div>

      <div style={{ flex: 1 }}></div>

      {/* shutter */}
      <button onClick={onNext} style={{ width: 74, height: 74, borderRadius: "50%", background: "#fff",
        boxShadow: "var(--sh-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ width: 58, height: 58, borderRadius: "50%", background: `linear-gradient(180deg, ${sp.accent}, ${sp.deep})` }}></span>
      </button>
      <button onClick={onBack} style={{ marginTop: 14, fontSize: 13.5, color: "var(--ink-faint)" }}>返回</button>
    </div>
  );
}

/* ---------- 2 · AI recognises species ---------- */
function ObDetect({ sp, photoId, pickSpecies, onNext }) {
  const [phase, setPhase] = useState("scan"); // scan | result
  useEffect(() => {
    const t = setTimeout(() => setPhase("result"), 2100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="soft-fade" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", padding: "104px 30px 40px" }}>
      {/* photo with scan */}
      <div style={{ position: "relative", width: 200, height: 250, borderRadius: 20, overflow: "hidden",
        background: "#EFE7DA", boxShadow: "var(--sh-2)", transform: "rotate(-2deg)" }}>
        <image-slot id={photoId} shape="rect"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
          placeholder="你的花"></image-slot>
        {phase === "scan" && (
          <>
            <div style={{ position: "absolute", left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${sp.accent}, transparent)`,
              boxShadow: `0 0 16px ${sp.accent}`, animation: "scanMove 1.1s ease-in-out infinite alternate" }}></div>
            <div style={{ position: "absolute", inset: 0, background: `${sp.accent}11` }}></div>
          </>
        )}
      </div>

      {phase === "scan" ? (
        <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 8 }}>
          <span className="dot" style={{ background: sp.accent }}></span>
          <span className="dot" style={{ background: sp.accent }}></span>
          <span className="dot" style={{ background: sp.accent }}></span>
          <span className="serif" style={{ fontSize: 16, color: "var(--ink-soft)", marginLeft: 4 }}>正在看看它是谁…</span>
        </div>
      ) : (
        <div className="soft-fade" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: sp.deep, fontWeight: 600 }}>
            <Icon name="check" size={16} color={sp.deep} /> AI 识别完成 · 置信度 92%
          </div>
          <div style={{ fontFamily: "var(--f-journal)", fontSize: 24, fontWeight: 600, color: "var(--ink)", marginTop: 10 }}>
            我认得它 —— 这是一盆<span style={{ color: sp.deep }}>「{sp.species}」</span>
          </div>
          <div className="serif" style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 8 }}>{sp.care} · 认错了？换一个：</div>

          {/* species chips to correct */}
          <div className="noscroll" style={{ display: "flex", gap: 8, marginTop: 14, overflowX: "auto", width: "100%", paddingBottom: 4, justifyContent: "center", flexWrap: "wrap" }}>
            {window.SPECIES.map(s => {
              const on = s.species === sp.species;
              return (
                <button key={s.species} onClick={() => pickSpecies(s)} style={{ display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 13px", borderRadius: 999, flexShrink: 0,
                  background: on ? `linear-gradient(180deg, ${s.accent}, ${s.deep})` : "rgba(255,255,255,0.7)",
                  border: on ? "none" : "1px solid var(--hairline)",
                  color: on ? "#fff" : "var(--ink-soft)", fontSize: 14, fontFamily: "var(--f-journal)",
                  boxShadow: on ? `0 5px 12px ${s.accent}40` : "none" }}>
                  <PlantSprite shape={s.shape} color={on ? "#fff" : s.deep} pot={on ? "rgba(255,255,255,0.5)" : s.pot} h={20} />
                  {s.species}
                </button>
              );
            })}
          </div>

          <button onClick={onNext} className="btn-green" style={{ marginTop: 30, width: "100%", maxWidth: 300, height: 54,
            fontSize: 16, background: `linear-gradient(180deg, ${sp.accent}, ${sp.deep})` }}>就是它，下一步</button>
        </div>
      )}
    </div>
  );
}

/* ---------- 3 · name + personality ---------- */
function ObName({ sp, photoId, name, setName, traits, toggleTrait, onNext }) {
  return (
    <div className="soft-fade noscroll" style={{ position: "absolute", inset: 0, overflowY: "auto", padding: "100px 30px 40px",
      display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* avatar from photo */}
      <div className="snap" style={{ width: 96, transform: "rotate(-3deg)", padding: 5 }}>
        <image-slot id={photoId} shape="rounded" radius="4"
          style={{ width: "86px", height: "100px", display: "block" }} placeholder={sp.species}></image-slot>
      </div>

      <div style={{ fontFamily: "var(--f-journal)", fontSize: 23, fontWeight: 600, color: "var(--ink)", marginTop: 20 }}>给它起个名字吧</div>
      <div className="serif" style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 7, textAlign: "center" }}>
        它会记住你为它取的名字，<br />也会记住你们在一起的每一天。
      </div>

      <input value={name} onChange={e => setName(e.target.value)} maxLength={8}
        placeholder="比如「小刺」"
        style={{ marginTop: 22, width: "100%", maxWidth: 300, height: 56, borderRadius: 16, border: `1.5px solid ${sp.accent}40`,
          background: "var(--glass-strong)", textAlign: "center", fontSize: 20, fontFamily: "var(--f-journal)",
          color: "var(--ink)", outline: "none", boxShadow: "var(--sh-1)" }} />

      {/* personality */}
      <div style={{ width: "100%", maxWidth: 320, marginTop: 26 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--f-journal)", fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>它是什么性格？</span>
          <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>选 2–4 个</span>
        </div>
        <div className="serif" style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 4 }}>性格决定了它跟你说话的方式。</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 14 }}>
          {sp.traits.map(t => {
            const on = traits.includes(t);
            return (
              <button key={t} onClick={() => toggleTrait(t)} className="badge"
                style={{ fontSize: 14, padding: "9px 15px",
                  background: on ? `linear-gradient(180deg, ${sp.accent}, ${sp.deep})` : "rgba(58,53,46,0.05)",
                  color: on ? "#fff" : "var(--ink-faint)", border: on ? "none" : "1px dashed var(--hairline)",
                  boxShadow: on ? `0 5px 12px ${sp.accent}33` : "none" }}>
                {on && <Icon name="check" size={13} color="#fff" />}{t}
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={onNext} disabled={traits.length < 1} className="btn-green"
        style={{ marginTop: 32, width: "100%", maxWidth: 300, height: 56, fontSize: 17, opacity: traits.length < 1 ? 0.5 : 1,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          background: `linear-gradient(180deg, ${sp.accent}, ${sp.deep})` }}>
        <Icon name="leaf" size={20} color="#fff" /> 让它活过来
      </button>
    </div>
  );
}

/* ---------- 4 · soul generation animation ---------- */
function ObGenerate({ sp, name, traits, setOpener, onNext }) {
  const lines = ["正在为它注入灵魂…", "它第一次睁开眼睛…", `它认出了你 —— 它的主人…`, "它好像，想跟你说点什么…"];
  const [li, setLi] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setLi(i => (i + 1) % lines.length), 1100);

    const sys = `你是一盆名叫「${name.trim() || "小绿"}」的${sp.species}，是主人新养的一盆真实植物的灵魂，性格：${traits.join("、")}。${sp.care}。现在你和主人第一次见面。用中文说一句简短、符合你性格的开场白，像第一次打招呼，1～2 句，不超过 35 字，不要解释、不要引号。`;
    const fallback = window.firstLineFallback[sp.species] || "你好呀，第一次见面，请多关照～";

    const ai = window.claude.complete({ messages: [{ role: "user", content: sys }] })
      .then(r => (r || "").trim() || fallback).catch(() => fallback);
    const wait = new Promise(res => setTimeout(res, 3400));

    Promise.all([ai, wait]).then(([line]) => {
      setOpener(line);
      clearInterval(iv);
      onNext();
    });
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "0 36px" }}>
      <div style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* aura */}
        <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%",
          background: `radial-gradient(circle, ${sp.accent}55, transparent 70%)`, animation: "auraPulse 2s ease-in-out infinite" }}></div>
        {/* rings */}
        {[0, 0.6, 1.2].map((d, i) => (
          <div key={i} style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%",
            border: `1.5px solid ${sp.accent}`, animation: `ringExpand 1.8s ease-out ${d}s infinite` }}></div>
        ))}
        {/* particles */}
        {[...Array(8)].map((_, i) => (
          <span key={i} style={{ position: "absolute", bottom: 70, left: `${22 + i * 7}%`, width: 6, height: 6, borderRadius: "50%",
            background: sp.accent, animation: `floatUp 2.4s ease-in ${i * 0.28}s infinite` }}></span>
        ))}
        {/* the sprite emerging */}
        <div style={{ position: "relative", zIndex: 2, animation: "spriteEmerge 1.1s cubic-bezier(.2,.7,.3,1) both" }}>
          <div style={{ animation: "breathe 2.4s ease-in-out 1.1s infinite" }}>
            <PlantSprite shape={sp.shape} color={sp.deep} pot={sp.pot} h={104} />
          </div>
        </div>
      </div>

      <div key={li} className="soft-fade" style={{ marginTop: 26, fontFamily: "var(--f-journal)", fontSize: 18,
        color: "var(--ink)", textAlign: "center", minHeight: 26 }}>
        {lines[li]}
      </div>
      <div style={{ marginTop: 8, fontFamily: "var(--f-script)", fontSize: 17, color: sp.deep }}>{name.trim() || "它"}，{sp.species}</div>
    </div>
  );
}

/* ---------- 5 · first diary entry reveal ---------- */
function ObReveal({ sp, name, photoId, opener, onDone }) {
  return (
    <div className="soft-fade" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "0 30px" }}>
      <div style={{ fontFamily: "var(--f-script)", fontSize: 20, color: "var(--ink-soft)" }}>第 1 天 · 今天</div>
      <div style={{ fontFamily: "var(--f-journal)", fontSize: 25, fontWeight: 600, color: "var(--ink)", marginTop: 6 }}>
        <span style={{ color: sp.deep }}>{name.trim() || "它"}</span> 住进来了
      </div>

      {/* first journal card */}
      <div style={{ position: "relative", width: "100%", maxWidth: 320, marginTop: 24 }}>
        <div style={{ position: "absolute", inset: "8px -5px -8px 8px", background: "rgba(255,255,255,0.4)",
          borderRadius: "var(--r-2xl)", transform: "rotate(2.4deg)" }}></div>
        <div className="rise" style={{ position: "relative", background: "#FBF6EE", borderRadius: "var(--r-2xl)",
          padding: "32px 26px 24px", boxShadow: "var(--sh-3)" }}>
          <div style={{ fontFamily: "var(--f-serif)", fontSize: 58, lineHeight: 0.5, color: sp.accent, height: 26 }}>“</div>
          <div className="serif" style={{ fontSize: 19, marginTop: 14, color: "var(--ink)", lineHeight: 1.6 }}>{opener}</div>
          <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Stars n={5} size={16} />
            <div className="sig" style={{ fontSize: 28, lineHeight: 1 }}>{name.trim() || "它"}</div>
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed var(--hairline)", display: "flex", gap: 7, flexWrap: "wrap" }}>
            <span className="badge" style={{ background: sp.bubble, color: sp.deep }}>{sp.species}</span>
            <span className="badge" style={{ background: "rgba(58,53,46,0.05)", color: "var(--ink-soft)" }}>第一篇日记</span>
          </div>

          <div className="snap" style={{ position: "absolute", top: -20, right: -8, width: 92, transform: "rotate(7deg)" }}>
            <image-slot id={photoId} shape="rounded" radius="4"
              style={{ width: "80px", height: "96px", display: "block" }} placeholder={name.trim() || sp.species}></image-slot>
          </div>
        </div>
      </div>

      <button onClick={onDone} className="btn-green" style={{ marginTop: 34, width: "100%", maxWidth: 300, height: 56, fontSize: 17,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        background: `linear-gradient(180deg, ${sp.accent}, ${sp.deep})` }}>
        <Icon name="book" size={20} color="#fff" /> 打开我们的日记本
      </button>
    </div>
  );
}
