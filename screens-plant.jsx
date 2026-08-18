/* ============================================================
   花花日记本 · 某盆花的日记详情（点封面进入）
   日记封面 hero + 这盆花的时间线
   ============================================================ */
function PlantDiary({ go, plant, t = {} }) {
  const p = plant;
  const [report, setReport] = useState(false);
  const [filter, setFilter] = useState("all"); // all | record | diagnosis
  const recN = p.diary.filter(d => d.kind !== "diagnosis").length;
  const dxN = p.diary.filter(d => d.kind === "diagnosis").length;
  const shown = filter === "all" ? p.diary
    : filter === "diagnosis" ? p.diary.filter(d => d.kind === "diagnosis")
    : p.diary.filter(d => d.kind !== "diagnosis");

  return (
    <div className="noscroll" style={{ position: "absolute", inset: 0, overflowY: "auto", paddingBottom: 40,
      background: `linear-gradient(180deg, ${p.soft}66 0%, var(--paper) 24%)` }}>
      {/* nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "54px 16px 6px" }}>
        <button onClick={() => go("home")} style={{ display: "flex", alignItems: "center", gap: 2, color: "var(--ink-soft)" }}>
          <Icon name="chevL" size={26} color="var(--ink-soft)" />
          <span style={{ fontSize: 15, fontFamily: "var(--f-journal)" }}>日记本</span>
        </button>
        <button onClick={() => setReport(true)} aria-label="生成成长小报"
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 999,
            background: p.deep, color: "#fff", boxShadow: `0 4px 12px ${p.accent}44` }}>
          <Icon name="share" size={15} color="#fff" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>成长小报</span>
        </button>
      </div>

      {/* ===== plant intro: photo + name + stats + traits ===== */}
      <div className="glass-card rise" style={{ margin: "8px 20px 0", padding: 14, display: "flex", gap: 14 }}>
        {/* polaroid */}
        <div className="snap" style={{ width: 104, flexShrink: 0, transform: "rotate(-2.5deg)", alignSelf: "flex-start" }}>
          <image-slot id={`detail-${p.photoId}`} shape="rounded" radius="4" src={window.photoFor(p.photoId)}
            style={{ width: "94px", height: "112px", display: "block" }} placeholder={p.name}></image-slot>
          <div style={{ textAlign: "center", fontFamily: "var(--f-script)", fontSize: 16, color: "var(--ink-soft)", paddingTop: 1 }}>第 {p.days} 天</div>
        </div>
        {/* right: name + stats + tags */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 7, flexWrap: "wrap" }}>
            <span className="mast" style={{ fontSize: 25 }}>{p.name}</span>
            <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>{p.species}</span>
            <button onClick={() => go("profile", p)} aria-label="编辑性格"
              style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 3, padding: "3px 8px",
                borderRadius: 999, border: "1px solid var(--hairline)", color: "var(--ink-faint)" }}>
              <Icon name="edit" size={12} color="var(--ink-faint)" />
              <span style={{ fontSize: 11 }}>性格</span>
            </button>
          </div>
          {/* fused stats */}
          <div style={{ display: "flex", gap: 14, marginTop: 9 }}>
            {[
              { n: p.days, u: "天", l: "认识" },
              { n: (p.diary || []).length, u: "篇", l: "日记" },
              { n: (p.diary || []).filter(d => d.photo).length + 1, u: "张", l: "拍照" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: "var(--f-num)", fontWeight: 700, fontSize: 18, color: p.deep, lineHeight: 1 }}>
                  {s.n}<span style={{ fontSize: 10.5, marginLeft: 1, color: "var(--ink-faint)" }}>{s.u}</span></div>
                <div style={{ fontSize: 10.5, color: "var(--ink-faint)", marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>
          {/* trait tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto", paddingTop: 11 }}>
            {p.tagsOn.map(t => (
              <span key={t} className="badge" style={{ fontSize: 11, padding: "3px 9px", background: p.bubble, color: p.deep }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== first-person care guide (personality + care combined) ===== */}
      <SelfCareGuide plant={p} />

      {/* ===== single main action ===== */}
      <div style={{ padding: "16px 20px 0" }}>
        <button onClick={() => go("capture", p)} className="btn-green"
          style={{ width: "100%", height: 54, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontSize: 16.5,
            background: `linear-gradient(180deg, ${p.accent}, ${p.deep})`, boxShadow: `0 8px 20px ${p.accent}4d` }}>
          <Icon name="camera" size={21} color="#fff" /> 拍照记录今天
        </button>
      </div>

      {/* ===== diary timeline + filter ===== */}
      <div style={{ padding: "22px 22px 4px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--f-journal)", fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>和 {p.name} 的日记</span>
        <span style={{ fontSize: 12.5, color: "var(--ink-faint)", whiteSpace: "nowrap" }}>共 {p.diary.length} 篇</span>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "10px 22px 0" }}>
        {[["all", "全部", p.diary.length], ["record", "记录", recN], ["diagnosis", "诊断", dxN]].map(([id, label, n]) => {
          const on = filter === id;
          return (
            <button key={id} onClick={() => setFilter(id)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 999, whiteSpace: "nowrap",
                background: on ? p.deep : "transparent", border: on ? `1px solid ${p.deep}` : "1px solid var(--hairline)" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: on ? "#fff" : "var(--ink-soft)" }}>{label}</span>
              <span style={{ fontFamily: "var(--f-num)", fontSize: 11.5, fontWeight: 600, color: on ? "rgba(255,255,255,0.8)" : "var(--ink-faint)" }}>{n}</span>
            </button>
          );
        })}
      </div>
      <div style={{ padding: "12px 20px 0" }}>
        <DiaryTimeline plant={p} entries={shown} onDiagnose={(pl) => go("doctorChat", pl)} />
      </div>

      {report && <GrowthReport plant={p} onClose={() => setReport(false)} />}
    </div>
  );
}
window.PlantDiary = PlantDiary;

/* ---------- 第一人称养护自述（性格 + 养护合一，可展开） ---------- */
function SelfCareGuide({ plant }) {
  const p = plant;
  const [open, setOpen] = useState(false);
  const sc = p.selfCare || {
    say: `我是${p.name}。${p.custom || "先观察我的叶片和盆土，再慢慢找到适合我的照顾节奏"}。`,
    tips: [
      { icon: "drop", label: "浇水", text: "摸摸盆土再决定是否浇水，避免盆底长期积水。" },
      { icon: "sun", label: "光照", text: "先放在明亮通风的位置，再根据状态调整光线。" },
      { icon: "heart", label: "多观察", text: p.custom || "叶片和盆土的变化，就是我给你的提示。" },
    ],
  };
  return (
    <div style={{ padding: "16px 20px 0" }}>
      <div className="glass-card" style={{ overflow: "hidden" }}>
        {/* the plant introduces its own care, first person */}
        <div style={{ display: "flex", gap: 11, padding: "15px 16px 13px", alignItems: "flex-start" }}>
          <PlantAvatar plant={p} size={40} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="kicker" style={{ color: p.deep }}>怎么养我 · {p.species}</div>
            <div className="serif" style={{ fontSize: 15, color: "var(--ink)", marginTop: 5, lineHeight: 1.6 }}>{sc.say}</div>
          </div>
        </div>

        {/* care tips fully collapsed by default — only revealed on expand */}
        {open && (
          <>
            <div style={{ height: 1, background: "var(--hairline)", margin: "0 16px" }}></div>
            <div className="soft-fade" style={{ padding: "13px 16px 4px", display: "flex", flexDirection: "column", gap: 12 }}>
              {sc.tips.map((it, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: p.soft + "88",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name={it.icon} size={15} color={p.deep} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: p.deep }}>{it.label}</div>
                    <div className="serif" style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 1, lineHeight: 1.5 }}>{it.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ height: 1, background: "var(--hairline)", margin: open ? "0 16px" : "0 16px" }}></div>
        <button onClick={() => setOpen(o => !o)} style={{ width: "100%", padding: "11px 16px 13px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12.5, color: p.deep, fontWeight: 600 }}>
          <Icon name="leaf" size={15} color={p.deep} />
          {open ? "收起养护指南" : `展开养护指南 · ${sc.tips.length} 条`}
          <span style={{ transform: open ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform .2s", display: "flex" }}>
            <Icon name="chevR" size={15} color={p.deep} />
          </span>
        </button>
      </div>
    </div>
  );
}
window.SelfCareGuide = SelfCareGuide;
