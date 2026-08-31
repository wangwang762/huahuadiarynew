/* ============================================================
   花花日记本 · 花档案编辑（任意花通用）
   ============================================================ */
function ProfileScreen({ go, plant, onSave, isTab }) {
  const p = plant;
  const [tagOrder] = useState(() => [...new Set([...(p.tagsOn || []), ...(p.tagsOff || [])])]);
  const [selectedTags, setSelectedTags] = useState(() => new Set(p.tagsOn || []));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  function toggle(tag) {
    setSelectedTags(current => {
      const next = new Set(current);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
    setSaved(false);
  }
  async function done() {
    if (saving || saved) return;
    setSaving(true);
    setSaveError("");
    const updated = {
      ...p,
      tagsOn: tagOrder.filter(tag => selectedTags.has(tag)),
      tagsOff: tagOrder.filter(tag => !selectedTags.has(tag)),
      custom: p.custom,
    };
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
        <button onClick={done} disabled={saving} style={{ fontSize: 15, fontWeight: 600, color: saved ? "var(--ink-faint)" : "var(--green-deep)" }}>
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
      </div>
      <div style={{ fontSize: 12.5, color: "var(--ink-faint)", padding: "6px 24px 0", lineHeight: 1.5 }}>
        这些标签会影响 {p.name} 在日记里的语气。
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 9, padding: "14px 24px 0" }}>
        {tagOrder.map(t => {
          const selected = selectedTags.has(t);
          return (
            <button key={t} onClick={() => toggle(t)} className="badge" aria-pressed={selected}
              style={{ fontSize: 14, padding: "8px 14px", background: selected ? "var(--green-deep)" : "rgba(58,53,46,0.06)",
                color: selected ? "#fff" : "var(--ink-faint)", border: selected ? "1px solid var(--green-deep)" : "1px dashed var(--hairline)",
                boxShadow: selected ? "0 5px 12px rgba(36,91,69,.18)" : "none" }}>
              <Icon name={selected ? "check" : "plus"} size={13} color={selected ? "#fff" : "var(--ink-faint)"} /> {t}
            </button>
          );
        })}
      </div>

      <div style={{ margin: "34px 24px 0", paddingTop: 20, borderTop: "1px solid var(--hairline)" }}>
        <button onClick={() => go("deletePlant", p)}
          style={{ width: "100%", minHeight: 46, borderRadius: "var(--r-pill)", color: "var(--coral)",
            background: "rgba(200,85,60,.055)", border: "1px solid rgba(200,85,60,.2)",
            fontSize: 14.5, fontWeight: 600 }}>
          删除这盆花
        </button>
        <div style={{ marginTop: 8, textAlign: "center", fontSize: 11.5, color: "var(--ink-faint)" }}>
          删除前会再次确认，照片、日记和问诊记录会一起移除。
        </div>
      </div>

    </div>
  );
}
window.ProfileScreen = ProfileScreen;
