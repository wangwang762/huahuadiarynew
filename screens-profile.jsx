/* ============================================================
   花花日记本 · 花档案 · 性格编辑（任意花通用）
   ============================================================ */
function ProfileScreen({ go, plant, onSave, isTab }) {
  const p = plant;
  const [on, setOn] = useState(p.tagsOn);
  const [off, setOff] = useState(p.tagsOff);
  const [custom, setCustom] = useState(p.custom);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  function toggle(tag, isOn) {
    if (isOn) { setOn(on.filter(t => t !== tag)); setOff([tag, ...off]); }
    else      { setOff(off.filter(t => t !== tag)); setOn([...on, tag]); }
    setSaved(false);
  }
  async function done() {
    if (saving || saved) return;
    setSaving(true);
    setSaveError("");
    const updated = { ...p, tagsOn: on, tagsOff: off, custom };
    try {
      if (onSave) await onSave(updated);
      setSaved(true);
      if (!isTab) setTimeout(() => go("back"), 450);
    } catch (error) {
      setSaveError(error && error.message ? error.message : "没有保存成功，请再试一次");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="noscroll" style={{ position: "absolute", inset: 0, overflowY: "auto", paddingBottom: isTab ? 100 : 40,
      background: `linear-gradient(180deg, ${p.soft}55 0%, var(--paper) 26%)` }}>
      {/* nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "54px 18px 8px" }}>
        <button onClick={() => go(isTab ? "home" : "back")} style={{ display: "flex", alignItems: "center", gap: 2, color: "var(--ink-soft)" }}>
          <Icon name="chevL" size={24} color="var(--ink-soft)" />
          <span style={{ fontSize: 15, fontFamily: "var(--f-journal)" }}>{isTab ? "聚集地" : p.name}</span>
        </button>
        <button onClick={done} disabled={saving} style={{ fontSize: 15, fontWeight: 600, color: saved ? "var(--ink-faint)" : p.deep }}>
          {saved ? "已保存 ✓" : saving ? "保存中…" : "完成"}
        </button>
      </div>
      {saveError && <div role="alert" style={{ margin: "8px 22px 0", padding: "9px 12px", borderRadius: 10,
        background: "rgba(200,85,60,.08)", color: "var(--coral)", fontSize: 12.5, textAlign: "center" }}>{saveError}</div>}

      {/* portrait */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 10 }}>
        <div style={{ boxShadow: "var(--sh-2)", borderRadius: "50%" }}>
          <PlantAvatar plant={p} size={108} />
        </div>
        <div style={{ fontFamily: "var(--f-journal)", fontSize: 30, fontWeight: 600, color: "var(--ink)", marginTop: 12 }}>{p.name}</div>
        <div style={{ fontSize: 13, color: "var(--ink-faint)", marginTop: 3 }}>{p.species} · 加入于 {p.born}</div>
      </div>

      {/* info card */}
      <div style={{ margin: "20px 22px 0", display: "flex", background: "var(--glass-strong)",
        borderRadius: "var(--r-lg)", boxShadow: "var(--sh-1)", border: "1px solid rgba(255,255,255,0.6)", overflow: "hidden" }}>
        {[
          { n: p.days, u: "天", l: "认识了" },
          { n: (p.diary || []).length, u: "篇", l: "日记" },
          { n: (p.diary || []).filter(d => d.photo).length + 1, u: "张", l: "拍照" },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, padding: "14px 4px", textAlign: "center", borderLeft: i ? "1px solid var(--hairline)" : "none" }}>
            <div style={{ fontFamily: "var(--f-num)", fontWeight: 700, fontSize: 22, color: p.deep }}>
              {s.n}<span style={{ fontSize: 11 }}>{s.u}</span></div>
            <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* personality */}
      <div style={{ padding: "26px 24px 0", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--f-journal)", fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>性格设定</span>
        <span style={{ fontSize: 12.5, color: p.deep }}>轻点标签修改 →</span>
      </div>
      <div style={{ fontSize: 12.5, color: "var(--ink-faint)", padding: "6px 24px 0", lineHeight: 1.5 }}>
        改了性格，{p.name}说话的方式真的会跟着变 —— 它的语气来自这些标签。
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 9, padding: "14px 24px 0" }}>
        {on.map(t => (
          <button key={t} onClick={() => toggle(t, true)} className="badge"
            style={{ fontSize: 14, padding: "8px 14px", background: `linear-gradient(180deg, ${p.accent}, ${p.deep})`, color: "#fff",
              boxShadow: `0 5px 12px ${p.accent}38` }}>
            {t} <Icon name="check" size={14} color="#fff" />
          </button>
        ))}
        {off.map(t => (
          <button key={t} onClick={() => toggle(t, false)} className="badge"
            style={{ fontSize: 14, padding: "8px 14px", background: "rgba(58,53,46,0.06)",
              color: "var(--ink-faint)", border: "1px dashed var(--hairline)" }}>
            <Icon name="plus" size={13} color="var(--ink-faint)" /> {t}
          </button>
        ))}
      </div>

      {/* custom input */}
      <div style={{ padding: "16px 24px 0" }}>
        <input value={custom} onChange={e => { setCustom(e.target.value); setSaved(false); }}
          placeholder="自定义补充描述，比如「超级怕冷」"
          style={{ width: "100%", height: 48, borderRadius: "var(--r-md)", border: "1px solid var(--hairline)",
            background: "var(--glass-strong)", padding: "0 16px", fontSize: 14.5, color: "var(--ink)",
            outline: "none", fontFamily: "var(--f-journal)" }} />
      </div>

      {/* current "voice" preview */}
      <div style={{ margin: "24px 22px 0", padding: "16px 18px", borderRadius: "var(--r-lg)",
        background: p.bubble, border: `1px solid ${p.accent}22` }}>
        <div style={{ fontSize: 11.5, color: p.deep, fontWeight: 600, marginBottom: 6 }}>它现在大概会这样说话 ↓</div>
        <div className="serif" style={{ fontSize: 15.5, color: "var(--ink)", lineHeight: 1.55 }}>“{p.voice}”</div>
      </div>

      <div style={{ padding: "16px 24px 0" }}>
        <button onClick={() => go("chat", p)} className="btn-green"
          style={{ width: "100%", height: 50, fontSize: 15.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            background: `linear-gradient(180deg, ${p.accent}, ${p.deep})`, boxShadow: `0 8px 20px ${p.accent}40` }}>
          <Icon name="leaf" size={19} color="#fff" /> 去和 {p.name} 聊聊
        </button>
      </div>
    </div>
  );
}
window.ProfileScreen = ProfileScreen;
