/* ============================================================
   花花日记本 · Tab 2 · 花大夫诊所
   情绪化的植物诊所：顶部诊所介绍 + 带花看诊合为一个模块；
   下方病历墙按 紧急程度 筛选（全部/待复诊/恢复中/已康复/已离开）。
   ============================================================ */
function DoctorTab({ go }) {
  const plants = window.PLANTS;
  const byId = Object.fromEntries(plants.map(p => [p.id, p]));
  const cases = window.CLINIC_CASES;
  const tabs = window.CLINIC_TABS;
  const [tab, setTab] = useState("all");

  const seenToday = cases.filter(c => c.seen === "今天").length;
  const counts = Object.fromEntries(tabs.map(t => [t.id,
    t.id === "all" ? cases.length : cases.filter(c => c.status === t.id).length]));

  // newest first; filter by status
  const shown = (tab === "all" ? cases : cases.filter(c => c.status === tab));

  return (
    <div className="noscroll" style={{ position: "absolute", inset: 0, overflowY: "auto", paddingBottom: 100,
      background: "linear-gradient(180deg,#EAF1E6 0%, var(--paper) 22%)" }}>

      {/* ===== reception module: intro + 带花看诊 in one card ===== */}
      <div style={{ padding: "56px 20px 0" }}>
        <div className="glass-card" style={{ padding: "18px 18px 16px", borderRadius: "var(--r-2xl)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <DoctorAvatar size={50} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mast" style={{ fontSize: 24, lineHeight: 1.05 }}>花大夫诊所</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2C7A4B",
                  boxShadow: "0 0 0 3px rgba(44,122,75,0.18)" }}></span>
                <span style={{ fontSize: 12.5, color: "#2C7A4B", fontWeight: 600 }}>营业中</span>
                <span style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>· 今日已接诊 {seenToday}</span>
              </div>
            </div>
          </div>

          <div className="serif" style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 13, lineHeight: 1.6 }}>
            看叶辨症，对症养护。把蔫了、黄了、没精神的花带来，我替你瞧瞧。
          </div>

          <button onClick={() => go("capture", window.UNKNOWN_PLANT, { intake: true })} className="btn-green"
            style={{ marginTop: 15, width: "100%", height: 50, display: "flex", alignItems: "center",
              justifyContent: "center", gap: 9, fontSize: 16 }}>
            <Icon name="camera" size={20} color="#fff" /> 带一盆花来看诊
          </button>
        </div>
      </div>

      {/* ===== 病历墙 ===== */}
      <div style={{ padding: "26px 22px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="mast" style={{ fontSize: 19 }}>病历墙</span>
        <span className="kicker">CASE FILES · {cases.length}</span>
      </div>
      <div style={{ padding: "4px 22px 0", fontSize: 12, color: "var(--ink-faint)" }}>
        瞧瞧上次都给哪些倒霉蛋看过诊，最近恢复得怎么样了。
      </div>

      {/* urgency-ordered filter tabs */}
      <div className="noscroll" style={{ display: "flex", gap: 8, padding: "13px 22px 2px", overflowX: "auto" }}>
        {tabs.map(t => {
          const on = tab === t.id;
          const st = window.CLINIC_STATUS[t.id];
          const dot = t.id === "all" ? "var(--ink)" : (st ? st.color : "var(--ink)");
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 999, flexShrink: 0,
                whiteSpace: "nowrap", background: on ? "var(--ink)" : "var(--paper-card)",
                border: on ? "1px solid var(--ink)" : "1px solid var(--hairline)" }}>
              {t.id !== "all" && <span style={{ width: 7, height: 7, borderRadius: "50%",
                background: on ? "#fff" : dot, opacity: on ? 0.9 : 1 }}></span>}
              <span style={{ fontSize: 13.5, fontWeight: 600, color: on ? "#fff" : "var(--ink-soft)" }}>{t.label}</span>
              <span style={{ fontFamily: "var(--f-num)", fontSize: 11.5, fontWeight: 600,
                color: on ? "rgba(255,255,255,0.78)" : "var(--ink-faint)" }}>{counts[t.id]}</span>
            </button>
          );
        })}
      </div>

      {/* the wall */}
      <div style={{ margin: "12px 16px 0", borderRadius: "var(--r-2xl)", padding: "20px 14px 22px",
        background: "linear-gradient(180deg,#E5D6BC,#DCC8A8)",
        boxShadow: "inset 0 2px 10px rgba(120,90,50,0.18)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "var(--r-2xl)", pointerEvents: "none", opacity: 0.5,
          backgroundImage: "radial-gradient(circle at 20% 30%, rgba(120,90,50,0.18) 0 1px, transparent 1.4px), radial-gradient(circle at 65% 70%, rgba(90,65,35,0.16) 0 1px, transparent 1.4px)",
          backgroundSize: "9px 9px, 13px 13px" }}></div>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 18 }}>
          {shown.length === 0 ? (
            <div className="serif" style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: 13.5, padding: "26px 10px" }}>
              这一类暂时没有病历～
            </div>
          ) : shown.map((c, i) => (
            <ClinicCaseCard key={c.id} c={c} p={byId[c.pid]} tilt={i % 2 ? -1.4 : 1.4} go={go} />
          ))}
        </div>
      </div>
    </div>
  );
}
window.DoctorTab = DoctorTab;

/* ---------- a single pinned case chart ---------- */
function ClinicCaseCard({ c, p, tilt, go }) {
  const st = window.CLINIC_STATUS[c.status];
  const healed = c.status === "healed";
  const dead = c.status === "dead";
  // dead patients may be plants no longer in the garden — use case-level identity
  const name = c.patientName || p.name;
  const species = c.patientSpecies || p.species;

  return (
    <div style={{ position: "relative", transform: `rotate(${tilt}deg)` }}>
      {/* pushpin */}
      <div style={{ position: "absolute", top: -9, left: "50%", marginLeft: -7, zIndex: 3,
        width: 14, height: 14, borderRadius: "50%",
        background: "radial-gradient(circle at 35% 30%, #ff9a8a, " + (dead ? "#8A7B6B" : healed ? "#2C7A4B" : "#C8553C") + ")",
        boxShadow: "0 3px 5px rgba(0,0,0,0.28)" }}></div>

      {/* the chart card */}
      <div className="glass-card" style={{ padding: 0, borderRadius: "var(--r-lg)", overflow: "hidden",
        opacity: dead ? 0.96 : healed ? 0.93 : 1, boxShadow: "0 10px 22px rgba(70,50,25,0.22)",
        filter: dead ? "saturate(0.72)" : "none" }}>
        {/* clinic header stripe */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 13px", background: dead ? "rgba(110,98,86,0.14)" : "var(--green-bubble)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Icon name={dead ? "leaf" : "doctor"} size={15} color={dead ? "#8A7B6B" : "var(--green-deep)"} />
            <span style={{ fontFamily: "var(--f-num)", fontWeight: 600, fontSize: 12.5, color: dead ? "#8A7B6B" : "var(--green-deep)", letterSpacing: 0.4 }}>{c.no}</span>
          </div>
          <span style={{ fontFamily: "var(--f-num)", fontSize: 11.5, color: "var(--ink-faint)" }}>{c.date} · {c.seen}</span>
        </div>

        <div style={{ padding: "13px 15px 15px", position: "relative" }}>
          {/* patient identity */}
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ filter: dead ? "grayscale(0.85)" : "none", opacity: dead ? 0.8 : 1 }}>
              <PlantAvatar plant={p} size={42} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span className="mast" style={{ fontSize: 17 }}>{name}</span>
                <span style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{species}</span>
              </div>
              <span className="badge" style={{ fontSize: 10, padding: "2px 8px", marginTop: 3,
                background: st.bg, color: st.color }}>● {st.label}</span>
            </div>
          </div>

          {/* chart rows */}
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
            <ChartRow label="主诉" text={c.complaint} />
            <ChartRow label="诊断" text={c.diagnosis} accent />
            {!dead && <ChartRow label="医嘱" text={c.rx} />}
          </div>

          {/* recovery progress (recovering / recheck) */}
          {!healed && !dead && (
            <div style={{ marginTop: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-faint)", marginBottom: 4 }}>
                <span>恢复进度</span>
                <span style={{ fontFamily: "var(--f-num)", fontWeight: 600, color: st.color }}>{c.progress}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 6, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                <div style={{ width: c.progress + "%", height: "100%", borderRadius: 6, background: st.color }}></div>
              </div>
            </div>
          )}

          {/* death record: cause + lesson (养花经验教训) */}
          {dead && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start",
                background: "rgba(110,98,86,0.10)", borderRadius: "var(--r-sm)", padding: "9px 11px" }}>
                <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 700, color: "#8A7B6B", paddingTop: 1 }}>死因</span>
                <span className="serif" style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.55 }}>{c.cause}</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start",
                background: "rgba(44,122,75,0.08)", border: "1px solid rgba(44,122,75,0.18)", borderRadius: "var(--r-sm)", padding: "9px 11px" }}>
                <Icon name="leaf" size={14} color="#2C7A4B" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "#2C7A4B", marginBottom: 2 }}>避坑经验</div>
                  <span className="serif" style={{ fontSize: 12.5, color: "var(--ink)", lineHeight: 1.55 }}>{c.lesson}</span>
                </div>
              </div>
            </div>
          )}

          {/* latest note (non-dead) */}
          {!dead && (
            <div style={{ marginTop: 12, display: "flex", gap: 7, alignItems: "flex-start",
              background: "rgba(0,0,0,0.025)", borderRadius: "var(--r-sm)", padding: "8px 10px" }}>
              <Icon name="clock" size={14} color="var(--ink-faint)" style={{ marginTop: 1, flexShrink: 0 }} />
              <span className="serif" style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>{c.note}</span>
            </div>
          )}

          {/* action */}
          {dead ? (
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--ink-faint)", textAlign: "center", fontFamily: "var(--f-journal)" }}>
              {c.note}
            </div>
          ) : (
            <button onClick={() => go(c.status === "recheck" ? "capture" : "doctorChat", p)}
              style={{ marginTop: 12, width: "100%", height: 40, borderRadius: "var(--r-pill)",
                border: "1px solid " + (healed ? "var(--hairline)" : st.color + "55"),
                background: healed ? "transparent" : st.bg,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                fontSize: 13, fontWeight: 600, color: healed ? "var(--ink-soft)" : st.color }}>
              {healed ? "查看病历" : c.status === "recheck" ? "拍照复诊" : "继续复查"}
              <Icon name="chevR" size={15} color={healed ? "var(--ink-soft)" : st.color} />
            </button>
          )}

          {/* stamps */}
          {healed && (
            <div style={{ position: "absolute", top: 18, right: 10, transform: "rotate(-14deg)",
              border: "2.5px solid rgba(44,122,75,0.5)", color: "rgba(44,122,75,0.62)", borderRadius: 7,
              padding: "3px 9px", fontFamily: "var(--f-journal)", fontWeight: 700, fontSize: 14, letterSpacing: 2,
              pointerEvents: "none" }}>已痊愈</div>
          )}
          {dead && (
            <div style={{ position: "absolute", top: 16, right: 10, transform: "rotate(-12deg)",
              border: "2.5px solid rgba(110,98,86,0.45)", color: "rgba(110,98,86,0.6)", borderRadius: 7,
              padding: "3px 9px", fontFamily: "var(--f-journal)", fontWeight: 700, fontSize: 13, letterSpacing: 2,
              pointerEvents: "none" }}>已离开</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChartRow({ label, text, accent }) {
  return (
    <div style={{ display: "flex", gap: 9 }}>
      <span style={{ flexShrink: 0, width: 30, fontSize: 11, fontWeight: 700, color: "var(--ink-faint)",
        fontFamily: "var(--f-ui)", paddingTop: 1 }}>{label}</span>
      <span className="serif" style={{ fontSize: 13, lineHeight: 1.5,
        color: accent ? "var(--green-deep)" : "var(--ink)", fontWeight: accent ? 600 : 400 }}>{text}</span>
    </div>
  );
}
