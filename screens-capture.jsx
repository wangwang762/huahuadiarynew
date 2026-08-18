/* ============================================================
   花花日记本 · 拍照记录 → AI 分诊
   主人主动拍照 → AI 判断：状态好（情绪文案记录）/ 需诊断（指路花大夫）
   ============================================================ */
function CaptureFlow({ go, plant, intake = false, onSaveEntry }) {
  const p = plant;
  const [step, setStep] = useState("shoot"); // shoot | analyzing | identify | good | abnormal
  const [voice, setVoice] = useState("");
  const [saveError, setSaveError] = useState("");
  const needsDoctor = p.statusTone === "warn";

  // (demo: a vision model reads the photo and returns a species guess.)
  const detectedSpecies = "多肉";
  const sameSpecies = window.PLANTS.filter(pp => pp.species.includes(detectedSpecies));

  async function analyze() {
    setStep("analyzing");
    // clinic walk-in: AI must first work out WHICH plant this is
    if (intake) {
      setTimeout(() => setStep("identify"), 1900);
      return;
    }
    // (production: a vision model reads the photo — soil & leaves — to triage.)
    let line = "";
    if (!needsDoctor) {
      try {
        line = await window.claude.complete({ messages: [{
          role: "user",
          content: window.systemPromptFor(p) +
            "\n\n主人刚刚给你拍了张照片，你今天状态很好、被认真记录着。用你的口吻说一句此刻的话（口语、1 句、可在括号里补一句真心话）。只输出这一句话。",
        }] });
      } catch (e) { line = p.voice; }
      setVoice((line || p.voice).trim());
    }
    setTimeout(() => setStep(needsDoctor ? "abnormal" : "good"), needsDoctor ? 1700 : 1900);
  }

  async function saveRecord(concern) {
    const entry = concern
      ? window.makeEntry("record", p, {
          mood: "留心", voice: p.voice,
          quote: ["今天给", { hl: p.name }, "拍了张照，", { hl: "花花说好像有点小状况" }, "，先记下了。"],
          concern: "花花观测到叶片有点蔫、颜色偏暗，暂未诊断",
          photo: p.photoId, stars: 3,
        })
      : window.makeEntry("record", p, {
          mood: p.mood, voice: voice || p.voice,
          quote: ["今天给", { hl: p.name }, "拍了张照，", { hl: "状态正好" }, "。"],
          photo: p.photoId,
        });
    setSaveError("");
    try {
      await onSaveEntry(p, entry);
      go("plantDiary", p);
    } catch (error) {
      setSaveError(error && error.message ? error.message : "这篇记录没有保存成功，请再试一次");
    }
  }

  function pickExisting(pp) { go("doctorChat", pp); }
  function pickNewFriend() {
    const sp = window.SPECIES.find(s => s.species === detectedSpecies) || window.SPECIES[0];
    go("doctorChat", window.makeDraftPlant(sp));
  }

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      background: `linear-gradient(180deg, ${p.soft}aa 0%, var(--paper) 32%)` }}>
      {/* nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "54px 16px 6px" }}>
        <button onClick={() => go("back")} style={{ display: "flex", alignItems: "center", gap: 2, color: "var(--ink-soft)" }}>
          <Icon name="chevL" size={26} color="var(--ink-soft)" />
          <span style={{ fontSize: 15, fontFamily: "var(--f-journal)" }}>返回</span>
        </button>
        <span style={{ fontFamily: "var(--f-journal)", fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>{intake ? "带花来看诊" : `记录 ${p.name}`}</span>
        <span style={{ width: 44 }}></span>
      </div>

      <div className="noscroll" style={{ flex: 1, overflowY: "auto", padding: "10px 24px 30px",
        display: "flex", flexDirection: "column", alignItems: "center" }}>
        {saveError && <div role="alert" style={{ width: "100%", marginBottom: 8, padding: "9px 12px", borderRadius: 10,
          background: "rgba(200,85,60,.08)", color: "var(--coral)", fontSize: 12.5, textAlign: "center" }}>{saveError}</div>}

        {/* ---- the photo ---- */}
        <div style={{ position: "relative", marginTop: 8 }}>
          <div className="snap" style={{ padding: 8, transform: "rotate(-1.5deg)", borderRadius: 8 }}>
            <image-slot id={`capture-${p.photoId}`} shape="rounded" radius="5" src={window.photoFor(p.photoId)}
              style={{ width: "210px", height: "250px", display: "block" }} placeholder={`拍下 ${p.name} 现在的样子`}></image-slot>
            <div style={{ textAlign: "center", fontFamily: "var(--f-script)", fontSize: 18, color: "var(--ink-soft)", paddingTop: 4 }}>
              {intake ? "今天 · 6月8日" : `第 ${p.days} 天 · 6月8日`}
            </div>
          </div>
          {/* scanning overlay while analyzing */}
          {step === "analyzing" && (
            <div style={{ position: "absolute", inset: 8, borderRadius: 5, overflow: "hidden", pointerEvents: "none" }}>
              <div style={{ position: "absolute", left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${p.accent}, transparent)`,
                boxShadow: `0 0 12px ${p.accent}`, animation: "scanMove 1.4s ease-in-out infinite" }}></div>
            </div>
          )}
        </div>

        {/* ---- step content ---- */}
        {step === "shoot" && (
          <div className="soft-fade" style={{ marginTop: 26, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p className="serif" style={{ fontSize: 15, color: "var(--ink-soft)", textAlign: "center", lineHeight: 1.6, maxWidth: 250 }}>
              {intake
                ? <>拍一张它现在的样子，<br />花花先认认它是谁、瞧瞧哪儿不舒服。</>
                : <>拖入或拍一张{p.name}此刻的照片，<br />花花会看看它今天的状态。</>}
            </p>
            <button onClick={analyze} className="btn-green"
              style={{ marginTop: 22, width: "100%", maxWidth: 300, height: 54, fontSize: 16, display: "flex",
                alignItems: "center", justifyContent: "center", gap: 9,
                background: `linear-gradient(180deg, ${p.accent}, ${p.deep})`, boxShadow: `0 8px 20px ${p.accent}4d` }}>
              <Icon name="leaf" size={20} color="#fff" /> {intake ? "让花花认认它" : "让花花看看"}
            </button>
          </div>
        )}

        {step === "analyzing" && (
          <div className="soft-fade" style={{ marginTop: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", gap: 6 }}><span className="dot"></span><span className="dot"></span><span className="dot"></span></div>
            <div style={{ fontFamily: "var(--f-journal)", fontSize: 16, color: "var(--ink-soft)" }}>{intake ? "正在认一认这盆花…" : `正在看看 ${p.name} 的样子…`}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>{intake ? "先认出它是谁，再看看哪儿不舒服" : "看看叶子、土壤，判断是记录还是要诊断"}</div>
          </div>
        )}

        {/* ---- IDENTIFY: which plant is this? (clinic intake) ---- */}
        {step === "identify" && (
          <IdentifyStep species={detectedSpecies} candidates={sameSpecies}
            onPick={pickExisting} onNew={pickNewFriend} onRetry={() => setStep("shoot")} />
        )}

        {/* ---- GOOD: emotional record ---- */}
        {step === "good" && (
          <div className="soft-fade" style={{ marginTop: 24, width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 14 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: p.accent, display: "flex",
                alignItems: "center", justifyContent: "center" }}><Icon name="check" size={14} color="#fff" stroke={2.6} /></span>
              <span style={{ fontFamily: "var(--f-journal)", fontSize: 16, fontWeight: 600, color: p.deep }}>状态不错，记一笔</span>
            </div>

            <div className="glass-card" style={{ padding: "18px 18px 16px" }}>
              <div className="serif" style={{ fontSize: 16.5, color: "var(--ink)", lineHeight: 1.6 }}>
                “今天给<em style={{ color: p.accent, fontStyle: "normal" }}>{p.name}</em>拍了张照，<em style={{ color: "var(--coral)", fontStyle: "normal" }}>状态正好</em>。”
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <PlantAvatar plant={p} size={30} />
                <div style={{ background: p.bubble, borderRadius: 14, borderTopLeftRadius: 4, padding: "9px 13px",
                  fontFamily: "var(--f-journal)", fontSize: 14.5, color: "var(--ink)", border: `1px solid ${p.accent}22` }}>
                  {voice || p.voice}
                </div>
              </div>
            </div>

            <button onClick={() => saveRecord(false)} className="btn-green"
              style={{ marginTop: 20, width: "100%", height: 52, fontSize: 16, display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8, background: `linear-gradient(180deg, ${p.accent}, ${p.deep})`,
                boxShadow: `0 8px 20px ${p.accent}4d` }}>
              <Icon name="book" size={19} color="#fff" /> 存入日记
            </button>
            <button onClick={() => setStep("shoot")} style={{ marginTop: 12, width: "100%", fontSize: 14, color: "var(--ink-faint)" }}>重拍一张</button>
          </div>
        )}

        {/* ---- ABNORMAL: route to doctor ---- */}
        {step === "abnormal" && (
          <div className="soft-fade" style={{ marginTop: 24, width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 14 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--terra)", display: "flex",
                alignItems: "center", justifyContent: "center" }}><Icon name="bell" size={13} color="#fff" /></span>
              <span style={{ fontFamily: "var(--f-journal)", fontSize: 16, fontWeight: 600, color: "var(--terra)" }}>好像有点不对劲</span>
            </div>

            <div className="glass-card" style={{ padding: "18px 18px 16px", border: "1px solid rgba(201,138,60,0.3)" }}>
              <div className="serif" style={{ fontSize: 15.5, color: "var(--ink)", lineHeight: 1.6 }}>
                花花注意到 <em style={{ color: "var(--terra)", fontStyle: "normal" }}>{p.name}</em> 的叶片有点蔫、颜色偏暗，可能需要看看。要不要让<em style={{ color: p.deep, fontStyle: "normal" }}>花大夫</em>诊断一下？
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <PlantAvatar plant={p} size={30} />
                <div style={{ background: p.bubble, borderRadius: 14, borderTopLeftRadius: 4, padding: "9px 13px",
                  fontFamily: "var(--f-journal)", fontSize: 14.5, color: "var(--ink)", border: `1px solid ${p.accent}22` }}>
                  {p.voice}
                </div>
              </div>
            </div>

            <button onClick={() => go("doctorChat", p)} className="btn-green"
              style={{ marginTop: 20, width: "100%", height: 52, fontSize: 16, display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8, background: "linear-gradient(180deg, #357355, #234B36)" }}>
              <Icon name="doctor" size={20} color="#fff" /> 去问花大夫
            </button>
            <button onClick={() => saveRecord(true)} style={{ marginTop: 12, width: "100%", fontSize: 14, color: "var(--ink-faint)" }}>先不诊断，只记录一下</button>
          </div>
        )}
      </div>
    </div>
  );
}
window.CaptureFlow = CaptureFlow;

/* ============================================================
   IdentifyStep — clinic intake: work out which plant this is
   · ambiguous (≥2 same species) → ask which one
   · single match → confirm or new
   · always offer "新朋友" (new plant) branch
   ============================================================ */
function IdentifyStep({ species, candidates, onPick, onNew, onRetry }) {
  const ambiguous = candidates.length >= 2;
  return (
    <div className="soft-fade" style={{ marginTop: 22, width: "100%" }}>
      {/* AI read */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 6 }}>
        <Icon name="check" size={16} color="var(--green-deep)" />
        <span style={{ fontSize: 13, color: "var(--green-deep)", fontWeight: 600 }}>花花认出来了 · 这像是「{species}」</span>
      </div>
      <div className="serif" style={{ fontSize: 15.5, color: "var(--ink)", textAlign: "center", lineHeight: 1.6, padding: "0 8px" }}>
        {ambiguous
          ? <>你有 <em style={{ color: "var(--coral)", fontStyle: "normal" }}>{candidates.length}</em> 盆「{species}」长得很像，<br />这是<em style={{ color: "var(--green-deep)", fontStyle: "normal" }}>哪一盆</em>呢？</>
          : candidates.length === 1
            ? <>这盆是你的 <em style={{ color: "var(--green-deep)", fontStyle: "normal" }}>{candidates[0].name}</em> 吗？</>
            : <>花园里还没有「{species}」，<br />这是位<em style={{ color: "var(--coral)", fontStyle: "normal" }}>新朋友</em>吗？</>}
      </div>

      {/* candidate cards */}
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {candidates.map(c => (
          <button key={c.id} onClick={() => onPick(c)}
            style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
              background: "var(--paper-card)", border: "1px solid var(--hairline)", borderRadius: "var(--r-lg)",
              padding: "11px 13px", boxShadow: "var(--sh-1)" }}>
            <PlantAvatar plant={c} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span className="mast" style={{ fontSize: 16 }}>{c.name}</span>
                <span style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{c.species}</span>
              </div>
              <div style={{ fontSize: 11.5, color: c.statusTone === "warn" ? "var(--terra)" : "var(--ink-faint)", marginTop: 2 }}>
                {c.status}
              </div>
            </div>
            <Icon name="chevR" size={18} color="var(--ink-faint)" />
          </button>
        ))}

        {/* new friend branch */}
        <button onClick={onNew}
          style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
            background: "rgba(44,118,89,0.06)", border: "1.5px dashed rgba(44,118,89,0.4)", borderRadius: "var(--r-lg)",
            padding: "11px 13px" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: "rgba(44,118,89,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="plus" size={22} color="#2C7659" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mast" style={{ fontSize: 16, color: "#2C7659" }}>{candidates.length ? "都不是，是新朋友" : "是的，新朋友"}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 2 }}>先看诊，结束后帮它建一份档案</div>
          </div>
          <Icon name="chevR" size={18} color="#2C7659" />
        </button>
      </div>

      <button onClick={onRetry} style={{ marginTop: 14, width: "100%", fontSize: 14, color: "var(--ink-faint)" }}>重拍一张</button>
    </div>
  );
}
window.IdentifyStep = IdentifyStep;

/* ============================================================
   ArchiveNew — after diagnosing a NEW plant, summarise & 建档
   ============================================================ */
function ArchiveNew({ draft, dx, onArchive, onBack }) {
  const sp0 = (draft && draft._sp) || window.SPECIES[0];
  const [sp, setSp] = useState(sp0);
  const [speciesText, setSpeciesText] = useState(sp0.species);
  const [name, setName] = useState("");
  const [traits, setTraits] = useState(sp0.traits.slice(0, 3));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const photoId = (draft && draft.photoId) || "intake-new";

  function pickSp(s) { setSp(s); setSpeciesText(s.species); setTraits(s.traits.slice(0, 3)); }
  const GENERIC_TRAITS = ["温柔", "安静", "元气", "高冷", "傲娇", "黏人", "乐天", "敏感", "坚强", "治愈", "话痨", "怕生"];
  const traitPool = Array.from(new Set([...sp.traits, ...GENERIC_TRAITS]));
  function toggle(t) {
    setTraits(ts => ts.includes(t) ? ts.filter(x => x !== t) : (ts.length >= 4 ? ts : [...ts, t]));
  }

  async function archive() {
    if (saving) return;
    setSaving(true);
    setSaveError("");
    const nm = name.trim() || "新朋友";
    const finalSpecies = speciesText.trim() || sp.species;
    const guide = window.CARE_GUIDE[sp.shape] || window.CARE_GUIDE.succulent;
    const newP = {
      id: "u" + Date.now(), name: nm, species: finalSpecies, shape: sp.shape,
      accent: sp.accent, deep: sp.deep, bubble: sp.bubble, soft: sp.soft, pot: sp.pot,
      tagsOn: traits, tagsOff: sp.traits.filter(t => !traits.includes(t)),
      custom: sp.care, style: traits.join("、") + "。",
      voice: `（小声）我叫${nm}了……谢谢你带我来看病。`, opener: `（小声）我叫${nm}了……谢谢你带我来看病。`,
      days: 1, mood: "初遇", stars: 5,
      status: "刚住进来", statusTone: "good", photoId, born: "2026年6月8日",
      guide,
      selfCare: { say: `我是${nm}，${sp.care}。慢慢熟悉我就好～`, tips: guide.items.slice(0, 3) },
    };
    const dxEntry = window.makeEntry("diagnosis", newP, {
      symptom: "初诊 · 叶片状态偏弱",
      conclusion: "已建档，按医嘱养护",
      plan: (dx || "").slice(0, 40) || "先调整光照与浇水，观察一周",
      voice: "花大夫看过啦，我会照做的。", photo: photoId,
    });
    const born = {
      id: newP.id + "-d0", day: "今天", date: "6月8日", weather: "🌧 小雨 22°", mood: "初遇", type: "born", photo: photoId,
      quote: ["在花大夫这儿第一次见面，", { hl: nm }, " 住进了日记本，", { grn: "也留下了第一份病历" }, "。"],
      voice: newP.voice, stars: 5,
    };
    newP.diary = [dxEntry, born];
    try {
      await onArchive(newP);
    } catch (error) {
      setSaveError(error && error.message ? error.message : "没有建档成功，请再试一次");
      setSaving(false);
    }
  }

  return (
    <div className="noscroll" style={{ position: "absolute", inset: 0, overflowY: "auto",
      background: `linear-gradient(180deg, ${sp.soft}aa 0%, var(--paper) 30%)` }}>
      {/* nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "54px 16px 6px" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 2, color: "var(--ink-soft)" }}>
          <Icon name="chevL" size={26} color="var(--ink-soft)" />
          <span style={{ fontSize: 15, fontFamily: "var(--f-journal)" }}>返回</span>
        </button>
        <span style={{ fontFamily: "var(--f-journal)", fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>为新朋友建档</span>
        <span style={{ width: 44 }}></span>
      </div>

      <div style={{ padding: "8px 24px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* diagnosis summary */}
        <div className="glass-card" style={{ width: "100%", padding: "14px 16px", display: "flex", gap: 11, alignItems: "flex-start",
          border: "1px solid var(--green-soft)" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "var(--green-bubble)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="doctor" size={18} color="var(--green-deep)" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="kicker" style={{ color: "var(--green-deep)" }}>花大夫 · 诊断已完成</div>
            <div className="serif" style={{ fontSize: 13.5, color: "var(--ink)", marginTop: 4, lineHeight: 1.55 }}>
              {((dx || "").replace(/[*#`>_]/g, "").replace(/\s+/g, " ").trim() || "已记录初诊，养护建议会一并存进它的档案。").slice(0, 64)}
            </div>
          </div>
        </div>

        <div className="serif" style={{ fontSize: 14, color: "var(--ink-soft)", textAlign: "center", marginTop: 18, lineHeight: 1.6 }}>
          诊断好啦，把这位新朋友<em style={{ color: sp.deep, fontStyle: "normal" }}>建个档案</em>，<br />以后就能在日记本里陪着它了。
        </div>

        {/* species — free text, with quick presets */}
        <div style={{ width: "100%", marginTop: 18 }}>
          <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginBottom: 8 }}>它是什么品种？（识别仅供参考，可直接填写）</div>
          <input value={speciesText} onChange={e => setSpeciesText(e.target.value)} maxLength={12} placeholder="输入品种，如「虎皮兰」"
            style={{ width: "100%", height: 46, borderRadius: 12, border: `1.5px solid ${sp.accent}40`,
              background: "var(--glass-strong)", padding: "0 15px", fontSize: 15.5, fontFamily: "var(--f-journal)",
              color: "var(--ink)", outline: "none" }} />
          <div className="noscroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginTop: 10 }}>
            {window.SPECIES.map(s => {
              const on = s.species === speciesText.trim();
              return (
                <button key={s.species} onClick={() => pickSp(s)} style={{ display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 12px", borderRadius: 999, flexShrink: 0,
                  background: on ? `linear-gradient(180deg, ${s.accent}, ${s.deep})` : "var(--paper-card)",
                  border: on ? "none" : "1px solid var(--hairline)", color: on ? "#fff" : "var(--ink-soft)",
                  fontSize: 13.5, fontFamily: "var(--f-journal)", boxShadow: on ? `0 5px 12px ${s.accent}40` : "none" }}>
                  <PlantSprite shape={s.shape} color={on ? "#fff" : s.deep} pot={on ? "rgba(255,255,255,0.5)" : s.pot} h={18} />
                  {s.species}
                </button>
              );
            })}
          </div>
        </div>

        {/* name */}
        <input value={name} onChange={e => setName(e.target.value)} maxLength={8} placeholder="给它起个名字"
          style={{ marginTop: 18, width: "100%", height: 52, borderRadius: 14, border: `1.5px solid ${sp.accent}40`,
            background: "var(--glass-strong)", textAlign: "center", fontSize: 18, fontFamily: "var(--f-journal)",
            color: "var(--ink)", outline: "none" }} />

        {/* traits */}
        <div style={{ width: "100%", marginTop: 18 }}>
          <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginBottom: 8 }}>它是什么性格？（选 2–4 个，决定它说话的方式）</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {traitPool.map(t => {
              const on = traits.includes(t);
              return (
                <button key={t} onClick={() => toggle(t)} className="badge"
                  style={{ fontSize: 13.5, padding: "8px 13px",
                    background: on ? `linear-gradient(180deg, ${sp.accent}, ${sp.deep})` : "rgba(58,53,46,0.05)",
                    color: on ? "#fff" : "var(--ink-faint)", border: on ? "none" : "1px dashed var(--hairline)" }}>
                  {on && <Icon name="check" size={13} color="#fff" />}{t}
                </button>
              );
            })}
          </div>
        </div>

        {saveError && <div role="alert" style={{ marginTop: 18, color: "var(--coral)", fontSize: 12.5, textAlign: "center" }}>{saveError}</div>}
        <button onClick={archive} disabled={saving} className="btn-green"
          style={{ marginTop: 26, width: "100%", height: 54, fontSize: 16.5, display: "flex", alignItems: "center",
            justifyContent: "center", gap: 9, background: `linear-gradient(180deg, ${sp.accent}, ${sp.deep})`,
            opacity: saving ? .68 : 1, boxShadow: `0 8px 20px ${sp.accent}4d` }}>
          <Icon name="book" size={20} color="#fff" /> {saving ? "正在建档……" : "建档，存进日记本"}
        </button>
      </div>
    </div>
  );
}
window.ArchiveNew = ArchiveNew;
