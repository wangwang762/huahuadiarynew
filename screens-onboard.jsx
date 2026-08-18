/* ============================================================
   花花日记本 · 新手引导 — 从空无一物，到第一篇日记
   welcome(空) → 手动选择品类 → 起名+性格 → 注入灵魂(动效) → 第一篇日记
   ============================================================ */
function Onboard({ onComplete, onSkip }) {
  const [step, setStep] = useState(0);
  const [runId] = useState(() => "ob-" + Date.now());
  const [sp, setSp] = useState(window.SPECIES[0]);
  const [name, setName] = useState("");
  const [traits, setTraits] = useState(window.SPECIES[0].traits.slice(0, 3));
  const [opener, setOpener] = useState("");

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
      selfCare: {
        say: `我是${name.trim() || "小绿"}。${sp.care}，照着这个节奏陪我慢慢长大就好。`,
        tips: [
          { icon: "drop", label: "浇水", text: "先摸摸盆土，确认需要时再浇透，别让盆底长期积水。" },
          { icon: "sun", label: "光照", text: "先放在明亮通风的位置，再根据叶片状态慢慢调整光线。" },
          { icon: "heart", label: "记住我", text: sp.care + "。" },
        ],
      },
      days: 1, mood: "初遇", stars: 5,
      status: "刚住进来", statusTone: "good", photoId: sp.photoId, born: "2026年6月7日",
      diary: [{
        id: runId + "-d1", day: "今天", date: "6月7日", weather: "🌧 小雨 22°",
        mood: "初遇", type: "born", photo: sp.photoId,
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
      {(step === 2 || step === 3) && (
        <div style={{ position: "absolute", top: 58, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 7, zIndex: 5 }}>
          {[2,3].map(i => (
            <span key={i} style={{ width: i === step ? 20 : 7, height: 7, borderRadius: 999,
              background: i === step ? sp.deep : "rgba(58,53,46,0.14)", transition: "all .3s" }}></span>
          ))}
        </div>
      )}
      {step === 0 && <ObWelcome sp={sp} onNext={() => setStep(2)} onSkip={onSkip} />}
      {step === 2 && <ObSpeciesPicker sp={sp} pickSpecies={pickSpecies} onNext={() => setStep(3)} />}
      {step === 3 && <ObName sp={sp} name={name} setName={setName} traits={traits} toggleTrait={toggleTrait} onNext={() => setStep(4)} />}
      {step === 4 && <ObGenerate sp={sp} name={name} traits={traits} setOpener={setOpener} onNext={() => setStep(5)} />}
      {step === 5 && <ObReveal sp={sp} name={name} opener={opener}
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
        从头像库里选出它的品类，<br />让它的灵魂，住进这本日记里。
      </div>

      <button onClick={onNext} className="btn-green" style={{ marginTop: 36, width: "100%", maxWidth: 300, height: 56,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontSize: 17 }}>
        <Icon name="leaf" size={22} color="#fff" /> 添加第一盆植物
      </button>
      <button onClick={onSkip} style={{ marginTop: 16, fontSize: 14, color: "var(--ink-faint)" }}>先随便逛逛</button>
    </div>
  );
}

/* ---------- 2 · choose a species from the authored avatar library ---------- */
function ObSpeciesPicker({ sp, pickSpecies, onNext }) {
  return (
    <div className="soft-fade" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "92px 20px 0" }}>
      <div style={{ textAlign: "center", flexShrink: 0 }}>
        <div className="kicker" style={{ color: sp.deep }}>选择植物品类</div>
        <div style={{ fontFamily: "var(--f-journal)", fontSize: 25, fontWeight: 600, color: "var(--ink)", marginTop: 7 }}>
          哪一盆最像它？
        </div>
        <div className="serif" style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 7 }}>
          先选品类，之后随时可以修改
        </div>
      </div>

      <div className="noscroll" style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 11, padding: "20px 2px 112px", alignContent: "start" }}>
        {window.SPECIES.map(s => {
          const on = s.id === sp.id;
          return (
            <button key={s.id} aria-label={`选择${s.species}`} aria-pressed={on} onClick={() => pickSpecies(s)}
              style={{ minHeight: 142, padding: "13px 8px 11px", borderRadius: 20, position: "relative",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
                background: on ? `linear-gradient(180deg, #fff, ${s.soft}cc)` : "rgba(255,255,255,0.58)",
                border: on ? `2px solid ${s.accent}` : "1px solid var(--hairline)",
                boxShadow: on ? `0 8px 18px ${s.accent}30` : "var(--sh-1)" }}>
              {on && <span style={{ position: "absolute", top: 9, right: 9, width: 22, height: 22, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center", background: s.deep }}>
                <Icon name="check" size={13} color="#fff" />
              </span>}
              <PlantAvatar plant={s} size={78} />
              <span style={{ fontFamily: "var(--f-journal)", fontSize: 15, fontWeight: on ? 700 : 600,
                color: on ? s.deep : "var(--ink)" }}>{s.species}</span>
            </button>
          );
        })}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "18px 30px 28px",
        background: "linear-gradient(180deg, rgba(247,242,232,0), var(--paper) 30%)" }}>
        <button onClick={onNext} className="btn-green" style={{ width: "100%", height: 54, fontSize: 16,
          background: `linear-gradient(180deg, ${sp.accent}, ${sp.deep})` }}>选好了，下一步</button>
      </div>
    </div>
  );
}

/* ---------- 3 · name + personality ---------- */
function ObName({ sp, name, setName, traits, toggleTrait, onNext }) {
  return (
    <div className="soft-fade noscroll" style={{ position: "absolute", inset: 0, overflowY: "auto", padding: "100px 30px 40px",
      display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ transform: "rotate(-3deg)" }}><PlantAvatar plant={sp} size={98} /></div>

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

    // The static MVP preview does not inject the production AI bridge.
    // Always resolve to the authored species line so onboarding can finish.
    const ai = Promise.resolve()
      .then(() => {
        if (!window.claude || typeof window.claude.complete !== "function") return fallback;
        return window.claude.complete({ messages: [{ role: "user", content: sys }] });
      })
      .then(r => (r || "").trim() || fallback)
      .catch(() => fallback);
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
function ObReveal({ sp, name, opener, onDone }) {
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
            <div style={{ width: 80, height: 96, borderRadius: 4, overflow: "hidden", background: sp.soft,
              display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <img src={window.photoFor(sp.photoId)} alt={sp.species}
                style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom", display: "block" }} />
            </div>
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
