/* ============================================================
   花花日记本 · 新手引导 — 从空无一物，到第一篇日记
   welcome(空) → 手动选择品类 → 起名+性格 → 注入灵魂(动效) → 第一篇日记
   ============================================================ */
function Onboard({ onComplete, onSkip, startAtSpecies = false }) {
  const [step, setStep] = useState(startAtSpecies ? 2 : 0);
  const [sp, setSp] = useState(null);
  const [name, setName] = useState("");
  const [traits, setTraits] = useState([]);
  const [opener, setOpener] = useState("");
  const [firstPhoto, setFirstPhoto] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const themeSp = sp || window.SPECIES[0];

  function pickSpecies(s) {
    setSp(s);
    setTraits([]);
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
      diary: [],
    };
    return p;
  }

  async function completeOnboarding(photoOverride = "") {
    if (saving) return;
    setSaving(true);
    setSaveError("");
    try {
      const candidate = typeof photoOverride === "string" ? photoOverride : firstPhoto;
      const validPhoto = /^data:image\/(?:jpeg|png|webp|heic|heif);base64,/i.test(candidate) ? candidate : "";
      await onComplete(buildPlant(opener), validPhoto);
    } catch (error) {
      setSaveError(error && error.message ? error.message : "这篇日记暂时没有写进去，请再试一次");
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden",
      background: `radial-gradient(140% 70% at 50% -8%, #FBF4E8 0%, var(--paper) 44%, ${themeSp.soft}55 100%)` }}>
      {/* progress dots */}
      {(step === 2 || step === 3) && (
        <div style={{ position: "absolute", top: 58, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 7, zIndex: 5 }}>
          {[2,3].map(i => (
            <span key={i} style={{ width: i === step ? 20 : 7, height: 7, borderRadius: 999,
              background: i === step ? "var(--green-deep)" : "rgba(58,53,46,0.14)", transition: "all .3s" }}></span>
          ))}
        </div>
      )}
      {step === 0 && <ObWelcome sp={themeSp} onNext={() => setStep(2)} onSkip={onSkip} />}
      {step === 2 && <ObSpeciesPicker sp={sp} pickSpecies={pickSpecies} onNext={() => sp && setStep(3)} />}
      {step === 3 && <ObName sp={sp} name={name} setName={setName} traits={traits} toggleTrait={toggleTrait}
        onBack={() => setStep(2)} onNext={() => setStep(4)} />}
      {step === 4 && <ObGenerate sp={sp} name={name} traits={traits} setOpener={setOpener} onNext={() => setStep(5)} />}
      {step === 5 && <ObReveal sp={sp} name={name} opener={opener}
        firstPhoto={firstPhoto} onPhoto={setFirstPhoto}
        onDone={completeOnboarding} saving={saving} saveError={saveError} />}
    </div>
  );
}
window.Onboard = Onboard;

/* ---------- 0 · welcome / empty state ---------- */
function ObWelcome({ sp, onNext, onSkip }) {
  return (
    <div className="soft-fade" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", padding: "max(76px, calc(env(safe-area-inset-top) + 42px)) 24px 30px", textAlign: "center",
      background: "radial-gradient(circle at 18% 12%, rgba(255,255,255,.68), transparent 28%), radial-gradient(circle at 86% 78%, rgba(189,204,164,.18), transparent 31%)" }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: "9% 7% 12%", pointerEvents: "none", opacity: .34,
        backgroundImage: "linear-gradient(rgba(87,107,76,.08) 1px, transparent 1px)", backgroundSize: "100% 29px",
        maskImage: "linear-gradient(transparent, #000 18%, #000 76%, transparent)", WebkitMaskImage: "linear-gradient(transparent, #000 18%, #000 76%, transparent)" }} />

      {/* a quiet first page from a botanical field notebook */}
      <div style={{ width: "100%", maxWidth: 310, position: "relative", padding: "22px 23px 25px", boxSizing: "border-box",
        background: "rgba(255,253,247,.82)", border: "1px solid rgba(112,104,84,.15)", borderRadius: "4px 18px 6px 5px",
        boxShadow: "0 18px 44px rgba(73,66,48,.12), 0 2px 0 rgba(255,255,255,.72) inset", transform: "rotate(-1deg)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--ink-faint)",
          fontSize: 10.5, letterSpacing: ".16em" }}>
          <span>PLANT NOTES</span><span style={{ fontFamily: "var(--f-num)", letterSpacing: ".08em" }}>NO. 001</span>
        </div>
        <div style={{ height: 1, marginTop: 11, background: "linear-gradient(90deg, var(--green-deep), rgba(30,70,50,.08))" }} />

        <div style={{ height: 156, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="116" height="126" viewBox="0 0 116 126" fill="none">
            <ellipse cx="58" cy="108" rx="35" ry="6" fill="rgba(41,65,48,.09)" />
            <path d="M36 67h44l-5.5 39h-33L36 67Z" fill="#DDBE89" fillOpacity=".42" stroke="#756B56" strokeWidth="1.3" />
            <path d="M31 66.5h54" stroke="#756B56" strokeWidth="2" strokeLinecap="round" />
            <path d="M58 67V37" stroke="#285A45" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M58 49c-13-1-21-8-23-20 13-1 22 6 23 20Z" fill="#B8CBA5" stroke="#285A45" strokeWidth="1.4" />
            <path d="M58 40c8-12 17-15 27-10-3 12-12 18-27 18" fill="#D8E2C8" stroke="#285A45" strokeWidth="1.4" />
            <path d="M58 34c-2-10 1-18 9-24 7 9 5 18-9 29" fill="#89A471" stroke="#285A45" strokeWidth="1.4" />
            <path d="M58 57c10-5 19-4 27 3-7 9-17 10-27 4" fill="#A8BC91" stroke="#285A45" strokeWidth="1.4" />
          </svg>
          <svg width="76" height="108" viewBox="0 0 76 108" style={{ position: "absolute", right: -13, top: 16, opacity: .28, transform: "rotate(13deg)" }}>
            <path d="M36 103C31 75 35 42 55 6" fill="none" stroke="#446348" strokeWidth="1.2" />
            {[18,34,51,68].map((y, index) => <g key={y}>
              <ellipse cx={index % 2 ? 48 : 27} cy={y} rx="13" ry="5.5" fill="#80966C" transform={`rotate(${index % 2 ? -35 : 34} ${index % 2 ? 48 : 27} ${y})`} />
            </g>)}
          </svg>
          <span style={{ position: "absolute", left: 2, bottom: 14, fontFamily: "var(--f-script)", fontSize: 17,
            color: "var(--green-deep)", transform: "rotate(-7deg)" }}>等待相遇</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--ink-faint)", fontSize: 10.5 }}>
          <span>DATE</span><span style={{ flex: 1, borderBottom: "1px solid rgba(112,104,84,.26)" }} />
          <span>NAME</span><span style={{ width: 48, borderBottom: "1px solid rgba(112,104,84,.26)" }} />
        </div>
      </div>

      <div style={{ marginTop: 28, fontFamily: "var(--f-script)", fontSize: 17, color: "var(--green-deep)", letterSpacing: ".08em" }}>你的花花日记本</div>
      <div style={{ fontFamily: "var(--f-journal)", fontSize: 27, fontWeight: 600, color: "var(--ink)", marginTop: 6, lineHeight: 1.35 }}>
        第一篇，留给新来的它
      </div>
      <div className="serif" style={{ maxWidth: 270, marginTop: 9, fontSize: 13, lineHeight: 1.65, color: "var(--ink-soft)" }}>
        从一张照片开始，慢慢记下<br />它发芽、舒展和长大的日子。
      </div>
      <button onClick={onNext} className="btn-green" style={{ marginTop: 25, width: "100%", maxWidth: 286, height: 52,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontSize: 16.5 }}>
        <Icon name="leaf" size={22} color="#fff" /> 添加第一盆植物
      </button>
      <button onClick={onSkip} style={{ marginTop: 13, padding: "8px 14px", fontSize: 13, color: "var(--ink-faint)" }}>先随便逛逛</button>
    </div>
  );
}

/* ---------- 2 · choose a species from the authored avatar library ---------- */
function ObSpeciesPicker({ sp, pickSpecies, onNext }) {
  return (
    <div className="soft-fade" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "92px 20px 0" }}>
      <div style={{ textAlign: "center", flexShrink: 0 }}>
        <div className="kicker" style={{ color: "var(--green-deep)" }}>选择植物品类</div>
        <div style={{ fontFamily: "var(--f-journal)", fontSize: 25, fontWeight: 600, color: "var(--ink)", marginTop: 7 }}>
          哪一盆最像它？
        </div>
        <div className="serif" style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 7 }}>
          先选品类，之后随时可以修改
        </div>
      </div>

      <div className="noscroll" style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 8, padding: "18px 0 112px", alignContent: "start" }}>
        {window.SPECIES.map(s => {
          const on = Boolean(sp && s.id === sp.id);
          return (
            <button key={s.id} data-picker-card="cover" aria-label={`选择${s.species}`} aria-pressed={on} onClick={() => pickSpecies(s)}
              style={{ minHeight: 122, padding: 6, borderRadius: 15, position: "relative",
                display: "flex", flexDirection: "column", alignItems: "stretch", gap: 6,
                background: on ? `linear-gradient(180deg, #fff, ${s.soft}88)` : "rgba(255,255,255,0.5)",
                border: on ? `2px solid ${s.accent}` : "1px solid var(--hairline)",
                boxShadow: on ? `0 7px 15px ${s.accent}28` : "var(--sh-1)" }}>
              {on && <span style={{ position: "absolute", top: 6, right: 6, width: 19, height: 19, borderRadius: "50%", zIndex: 3,
                display: "flex", alignItems: "center", justifyContent: "center", background: s.deep, boxShadow: "0 2px 5px rgba(0,0,0,.12)" }}>
                <Icon name="check" size={11} color="#fff" />
              </span>}
              <div style={{ height: 78, borderRadius: 10, overflow: "hidden", position: "relative",
                background: `linear-gradient(180deg, #FBF7EF 0%, ${s.soft}66 76%, ${s.soft}aa 100%)`,
                display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                <image-slot id={`picker-${s.photoId}`} shape="rounded" radius="3" transparent-frame=""
                  src={window.cutFor ? window.cutFor(s.photoId) : window.photoFor(s.photoId)} fit="contain" position="50% 100%"
                  style={{ width: "100%", height: "75px", display: "block", position: "relative",
                    top: window.coverOffsetY ? window.coverOffsetY(s.photoId) : 0,
                    transform: `scale(${window.coverScale ? window.coverScale(s.photoId) : 1})`, transformOrigin: "bottom center" }}
                  placeholder=" "></image-slot>
              </div>
              <span style={{ minHeight: 28, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
                fontFamily: "var(--f-journal)", fontSize: 12, lineHeight: 1.2, fontWeight: on ? 700 : 600,
                color: on ? s.deep : "var(--ink)", overflowWrap: "anywhere" }}>{s.species}</span>
            </button>
          );
        })}
      </div>

      <div className="bottom-action-bar" style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "18px 30px 0",
        background: "linear-gradient(180deg, rgba(247,242,232,0), var(--paper) 30%)" }}>
        <button onClick={onNext} disabled={!sp} className="btn-green" style={{ width: "100%", height: 54, fontSize: 16 }}>
          选好了，下一步
        </button>
      </div>
    </div>
  );
}

/* ---------- 3 · name + personality ---------- */
function ObName({ sp, name, setName, traits, toggleTrait, onBack, onNext }) {
  return (
    <div className="soft-fade noscroll" style={{ position: "absolute", inset: 0, overflowY: "auto", padding: "100px 30px 40px",
      display: "flex", flexDirection: "column", alignItems: "center" }}>
      <button onClick={onBack} aria-label="返回选择植物" style={{ position: "absolute", top: 54, left: 18,
        width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-soft)" }}>
        <Icon name="chevL" size={25} color="var(--ink-soft)" />
      </button>
      <div style={{ transform: "rotate(-3deg)" }}><PlantAvatar plant={sp} size={98} /></div>

      <div style={{ fontFamily: "var(--f-journal)", fontSize: 23, fontWeight: 600, color: "var(--ink)", marginTop: 20 }}>给它起个名字吧</div>
      <div className="serif" style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 7, textAlign: "center" }}>
        它会记住你为它取的名字，<br />也会记住你们在一起的每一天。
      </div>

      <input value={name} onChange={e => setName(e.target.value)} maxLength={8}
        placeholder="比如「小刺」"
        style={{ marginTop: 22, width: "100%", maxWidth: 300, height: 56, borderRadius: 16, border: "1.5px solid rgba(30,70,50,.18)",
          background: "var(--glass-strong)", textAlign: "center", fontSize: 20, fontFamily: "var(--f-journal)",
          color: "var(--ink)", outline: "none", boxShadow: "var(--sh-1)" }} />

      {/* personality */}
      <div style={{ width: "100%", maxWidth: 320, marginTop: 26 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--f-journal)", fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>它是什么性格？</span>
          <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>选 2–4 个</span>
        </div>
        <div className="serif" style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 4 }}>性格决定了它跟你说话的方式。</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 9, marginTop: 14 }}>
          {sp.traits.map(t => {
            const on = traits.includes(t);
            return (
              <button key={t} onClick={() => toggleTrait(t)} className="badge" aria-pressed={on}
                style={{ minWidth: 0, height: 42, fontSize: 13.5, padding: "0 8px",
                  background: on ? "var(--green-grad)" : "rgba(58,53,46,0.05)",
                  color: on ? "#fff" : "var(--ink-faint)", border: on ? "none" : "1px dashed var(--hairline)",
                  boxShadow: on ? "0 5px 12px rgba(30,70,50,.18)" : "none",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                <span aria-hidden="true" style={{ width: 15, height: 15, borderRadius: "50%", display: "inline-flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                  border: on ? "none" : "1.6px solid rgba(30,70,50,.42)",
                  background: "transparent" }}>
                  {on && <Icon name="check" size={14} color="#fff" stroke={3} />}
                </span>{t}
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={onNext} disabled={traits.length < 1} className="btn-green"
        style={{ marginTop: 32, width: "100%", maxWidth: 300, height: 56, fontSize: 17, opacity: traits.length < 1 ? 0.5 : 1,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Icon name="leaf" size={20} color="#fff" /> 让它活过来
      </button>
    </div>
  );
}

/* ---------- 4 · soul generation animation ---------- */
function ObGenerate({ sp, name, traits, setOpener, onNext }) {
  const lines = ["正在写下相遇的第一天……", "从今天起，它住进你的日记里了"];
  const [li, setLi] = useState(0);

  useEffect(() => {
    const phaseTimer = setTimeout(() => setLi(1), 1750);

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
      onNext();
    });
    return () => clearTimeout(phaseTimer);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "22px 28px 30px",
      background: `radial-gradient(circle at 50% 42%, ${sp.soft}80 0%, transparent 47%)` }}>
      <div data-motion-stage="diary-birth-sheet" className="diary-birth-sheet" style={{
        position: "relative", width: "100%", maxWidth: 300, height: 354, borderRadius: 24, overflow: "hidden",
        background: "linear-gradient(145deg, rgba(255,253,247,.98), rgba(248,241,227,.98))",
        border: "1px solid rgba(114,91,57,.14)", boxShadow: "0 22px 48px rgba(70,55,36,.14), 0 2px 8px rgba(70,55,36,.06)" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: "19px 18px 18px",
          background: "repeating-linear-gradient(180deg, transparent 0, transparent 35px, rgba(101,85,61,.075) 36px, transparent 37px)",
          maskImage: "linear-gradient(180deg, transparent, #000 14%, #000 90%, transparent)" }}></div>
        <div style={{ position: "absolute", top: 24, left: 25, right: 25, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="diary-write-in" style={{ fontFamily: "var(--f-script)", fontSize: 15, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>
            第 1 天 · 今天
          </span>
          <span data-motion-stage="diary-leaf-stamp" className="diary-leaf-stamp" style={{
            display: "inline-flex", alignItems: "center", gap: 3, padding: "4px 7px", borderRadius: 10,
            border: `1px solid ${sp.deep}88`, color: sp.deep, fontFamily: "var(--f-journal)", fontSize: 10,
            transform: "rotate(-7deg)" }}>
            <Icon name="leaf" size={11} color={sp.deep} /> 住进来
          </span>
        </div>

        <div className="diary-write-in diary-name-write" style={{ position: "absolute", top: 61, left: 25, right: 25,
          fontFamily: "var(--f-journal)", fontSize: 25, fontWeight: 650, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden" }}>
          <span style={{ color: sp.deep }}>{name.trim() || "它"}</span>
          <span style={{ marginLeft: 7, fontSize: 13, fontWeight: 400, color: "var(--ink-faint)" }}>{sp.species}</span>
        </div>
        <div data-motion-stage="diary-ink-line" className="diary-ink-line" style={{ position: "absolute", top: 103, left: 25, right: 25,
          height: 1.5, borderRadius: 2, background: `linear-gradient(90deg, ${sp.deep}, ${sp.accent}88 78%, transparent)` }}></div>

        <div data-motion-stage="diary-plant-reveal" className="diary-plant-reveal" style={{
          position: "absolute", left: 28, right: 28, top: 112, bottom: 36, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ position: "absolute", left: "9%", right: "9%", bottom: 3, height: 20, borderRadius: "50%",
            background: `radial-gradient(ellipse, ${sp.soft}cc 0%, transparent 72%)`, filter: "blur(4px)" }}></div>
          <image-slot id={`birth-${sp.photoId}`} shape="rounded" radius="3" transparent-frame=""
            src={window.cutFor ? window.cutFor(sp.photoId) : window.photoFor(sp.photoId)} fit="contain" position="50% 100%"
            style={{ width: "100%", height: 205, display: "block", position: "relative", zIndex: 1,
              top: window.coverOffsetY ? window.coverOffsetY(sp.photoId) : 0,
              transform: `scale(${window.coverScale ? window.coverScale(sp.photoId) : 1})`, transformOrigin: "bottom center" }}
            placeholder=" "></image-slot>
        </div>

        {[{ left: "17%", bottom: 92, mx: "12px", d: ".35s" }, { left: "76%", bottom: 126, mx: "-9px", d: ".75s" }, { left: "69%", bottom: 63, mx: "7px", d: "1.05s" }].map((m, i) => (
          <span key={i} className="diary-mote" aria-hidden="true" style={{ position: "absolute", left: m.left, bottom: m.bottom,
            width: i === 1 ? 4 : 3, height: i === 1 ? 4 : 3, borderRadius: "50%", background: sp.accent,
            boxShadow: `0 0 8px ${sp.accent}99`, "--mote-x": m.mx, "--mote-delay": m.d }}></span>
        ))}

        <div style={{ position: "absolute", left: 25, right: 25, bottom: 18, display: "flex", alignItems: "center", gap: 8,
          color: "var(--ink-faint)", fontFamily: "var(--f-script)", fontSize: 11 }}>
          <span style={{ flex: 1, height: 1, background: "rgba(103,84,57,.12)" }}></span>
          花花日记本
          <span style={{ flex: 1, height: 1, background: "rgba(103,84,57,.12)" }}></span>
        </div>
      </div>

      <div key={li} className="soft-fade" style={{ marginTop: 22, fontFamily: "var(--f-journal)", fontSize: 16,
        color: "var(--ink-soft)", textAlign: "center", minHeight: 24 }}>
        {lines[li]}
      </div>
    </div>
  );
}

/* ---------- 5 · first diary entry reveal ---------- */
function ObReveal({ sp, name, opener, firstPhoto, onPhoto, onDone, saving, saveError }) {
  const photoInputRef = useRef(null);
  const [photoError, setPhotoError] = useState("");

  function readFirstPhoto(event) {
    const input = event.currentTarget;
    const file = input.files && input.files[0];
    if (!file) return;
    if (!String(file.type || "").startsWith("image/")) {
      setPhotoError("请选择一张植物照片");
      input.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = typeof reader.result === "string" ? reader.result : "";
      input.value = "";
      if (!image.startsWith("data:image/")) {
        setPhotoError("这张照片没有读取成功，请重新拍一张");
        return;
      }
      setPhotoError("");
      onPhoto(image);
      onDone(image);
    };
    reader.onerror = () => {
      input.value = "";
      setPhotoError("这张照片没有读取成功，请重新拍一张");
    };
    reader.readAsDataURL(file);
  }

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
            <span className="badge" style={{ background: "var(--green-soft)", color: "var(--green-deep)" }}>{sp.species}</span>
            <span className="badge" style={{ background: "rgba(58,53,46,0.05)", color: "var(--ink-soft)" }}>第一篇日记</span>
          </div>

          <div className="snap" style={{ position: "absolute", top: -20, right: -8, width: 92, transform: "rotate(7deg)" }}>
            <div style={{ width: 80, height: 96, borderRadius: 4, overflow: "hidden", background: sp.soft,
              display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <image-slot id={`reveal-${sp.photoId}`} shape="rounded" radius="2" transparent-frame=""
                src={firstPhoto || (window.cutFor ? window.cutFor(sp.photoId) : window.photoFor(sp.photoId))} fit={firstPhoto ? "cover" : "contain"} position="50% 100%"
                style={{ width: "100%", height: "100%", display: "block", position: "relative",
                  top: window.coverOffsetY ? window.coverOffsetY(sp.photoId) : 0,
                  transform: `scale(${window.coverScale ? window.coverScale(sp.photoId) : 1})`, transformOrigin: "bottom center" }}
                placeholder=" "></image-slot>
            </div>
          </div>
        </div>
      </div>

      <input ref={photoInputRef} type="file" accept="image/*" capture="environment"
        onChange={readFirstPhoto} tabIndex={-1} aria-hidden="true" style={{ display: "none" }} />
      {!firstPhoto ? (
        <button onClick={() => photoInputRef.current && photoInputRef.current.click()} className="btn-green"
          style={{ marginTop: 30, width: "100%", maxWidth: 300, height: 56, fontSize: 17,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="camera" size={20} color="#fff" /> 拍下第一张照片
        </button>
      ) : null}
      {photoError && <div role="alert" style={{ marginTop: 9, maxWidth: 300, fontSize: 12.5, color: "var(--coral)", textAlign: "center" }}>{photoError}</div>}
      {saveError && <div role="alert" style={{ marginTop: 18, maxWidth: 300, fontSize: 12.5, lineHeight: 1.5, color: "var(--coral)", textAlign: "center" }}>{saveError}</div>}
      {saving && <div aria-live="polite" style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 9,
        color: "var(--green-deep)", fontFamily: "var(--f-journal)", fontSize: 14.5 }}>
        <span style={{ display: "inline-flex", gap: 4 }}><i className="dot"></i><i className="dot"></i><i className="dot"></i></span>
        正在看看它今天的状态…
      </div>}
      {firstPhoto && saveError && <button onClick={() => onDone(firstPhoto)} disabled={saving} className="btn-green"
        style={{ marginTop: 14, width: "100%", maxWidth: 300, height: 52, fontSize: 16 }}>
        重新分析
      </button>}
      {!firstPhoto && <button onClick={() => onDone("")} disabled={saving}
        style={{ marginTop: 16, color: "var(--ink-soft)", fontFamily: "var(--f-journal)", fontSize: 14, padding: "8px 18px" }}>
        {saving ? "正在进入……" : "暂时跳过"}
      </button>}
    </div>
  );
}
