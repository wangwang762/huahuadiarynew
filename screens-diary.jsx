/* ============================================================
   花花日记本 · 日记时间线（某盆花）+ 可分享卡片
   ============================================================ */
function DiaryTimeline({ plant, entries, onDiagnose }) {
  const p = plant;
  return (
    <div style={{ position: "relative", padding: "4px 0 0" }}>
      {/* rail */}
      <div style={{ position: "absolute", left: 14, top: 26, bottom: 16, width: 2,
        background: `repeating-linear-gradient(${p.soft} 0 6px, transparent 6px 12px)` }}></div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {entries.map((d, i) => (
          <div key={d.id} style={{ display: "flex", gap: 14, position: "relative" }}>
            {/* node */}
            <div style={{ width: 30, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 6 }}>
              <TimelineMark kind={d.kind} type={d.type} plant={p} size={30} />
            </div>

            {/* ---- diagnosis card ---- */}
            {d.kind === "diagnosis" ? (
              <div className="glass-card" style={{ flex: 1, padding: "15px 16px 14px", borderRadius: "var(--r-xl)",
                border: "1px solid var(--green-soft)", background: "linear-gradient(180deg, #F4F8F0, var(--paper-card))" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12.5, color: "var(--ink-faint)", display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontWeight: 600, color: "var(--ink-soft)" }}>{d.day}</span>
                    <span style={{ fontFamily: "var(--f-num)" }}>{d.date}</span>
                  </div>
                  <span className="badge" style={{ fontSize: 10.5, padding: "2px 9px", background: p.deep, color: "#fff",
                    display: "flex", alignItems: "center", gap: 4 }}>
                    <Icon name="doctor" size={11} color="#fff" /> 花大夫诊断
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 11 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 7, marginBottom: 8 }}>
                      <span style={{ fontSize: 11.5, color: "var(--terra)", fontWeight: 600, flexShrink: 0 }}>症状</span>
                      <span className="serif" style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>{d.symptom}</span>
                    </div>
                    <div style={{ display: "flex", gap: 7, marginBottom: 8 }}>
                      <span style={{ fontSize: 11.5, color: p.deep, fontWeight: 600, flexShrink: 0 }}>结论</span>
                      <span className="serif" style={{ fontSize: 13.5, color: "var(--ink)" }}>{d.conclusion}</span>
                    </div>
                    <div style={{ display: "flex", gap: 7 }}>
                      <span style={{ fontSize: 11.5, color: p.deep, fontWeight: 600, flexShrink: 0 }}>护理</span>
                      <span className="serif" style={{ fontSize: 13.5, color: "var(--ink)" }}>{d.plan}</span>
                    </div>
                  </div>
                  {d.photo && (
                    <div className="snap" style={{ width: 70, transform: "rotate(3deg)", alignSelf: "flex-start", flexShrink: 0 }}>
                      <image-slot id={`dx-${d.id}`} shape="rounded" radius="3" src={window.photoFor(d.photo)}
                        style={{ width: "60px", height: "72px", display: "block" }} placeholder="照片"></image-slot>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 11, paddingTop: 10, borderTop: "1px dashed var(--hairline)", display: "flex", gap: 7, alignItems: "flex-start" }}>
                  <PlantAvatar plant={p} size={24} />
                  <div style={{ fontFamily: "var(--f-journal)", fontSize: 13.5, color: "var(--ink-soft)" }}>{d.voice}</div>
                </div>
              </div>
            ) : (
            /* ---- record card ---- */
            <div className="glass-card" style={{ flex: 1, padding: "15px 16px 14px", borderRadius: "var(--r-xl)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12.5, color: "var(--ink-faint)", display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontWeight: 600, color: "var(--ink-soft)" }}>{d.day}</span>
                  <span style={{ fontFamily: "var(--f-num)" }}>{d.date}</span>
                  <span>· {d.weather}</span>
                </div>
                <span className="badge" style={{ fontSize: 10.5, padding: "2px 8px", background: p.bubble, color: p.deep }}>{d.mood}</span>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <div style={{ flex: 1 }}>
                  <div className="serif" style={{ fontSize: 16, color: "var(--ink)" }}>
                    <Journal parts={d.quote} />
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 7, alignItems: "flex-start" }}>
                    <PlantAvatar plant={p} size={26} />
                    <div style={{ background: p.bubble, borderRadius: 12, borderTopLeftRadius: 3,
                      padding: "7px 11px", fontFamily: "var(--f-journal)", fontSize: 14, color: "var(--ink)",
                      border: `1px solid ${p.accent}22` }}>{d.voice}</div>
                  </div>
                </div>
                {d.photo && (
                  <div className="snap" style={{ width: 78, transform: `rotate(${i % 2 ? -4 : 4}deg)`, alignSelf: "flex-start", flexShrink: 0 }}>
                    <image-slot id={d.photo} shape="rounded" radius="3" src={window.photoFor(d.photo)}
                      style={{ width: "68px", height: "82px", display: "block" }} placeholder="加照片"></image-slot>
                  </div>
                )}
              </div>

              {/* soft concern hook — issue observed but user deferred the doctor */}
              {d.concern && (
                <button onClick={() => onDiagnose && onDiagnose(p)}
                  style={{ width: "100%", marginTop: 11, display: "flex", alignItems: "center", gap: 9, textAlign: "left",
                    background: "rgba(201,138,60,0.10)", border: "1px solid rgba(201,138,60,0.28)",
                    borderRadius: "var(--r-md)", padding: "9px 11px" }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: "rgba(201,138,60,0.18)",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="bell" size={12} color="var(--terra)" />
                  </span>
                  <span style={{ flex: 1, fontSize: 12, color: "var(--terra)", lineHeight: 1.4 }}>{d.concern}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: p.deep, display: "flex", alignItems: "center", gap: 2, whiteSpace: "nowrap" }}>
                    找花大夫 <Icon name="chevR" size={13} color={p.deep} />
                  </span>
                </button>
              )}
            </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
window.DiaryTimeline = DiaryTimeline;

// ---- 成长小报 — the whole plant's life, condensed into one shareable poster ----
function GrowthReport({ plant, onClose }) {
  const p = plant;
  const r = window.growthReport(p);
  const c = r.copy;

  return (
    <div className="fadein" style={{ position: "absolute", inset: 0, zIndex: 60,
      background: "rgba(34,28,20,0.62)", backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)",
      display: "flex", flexDirection: "column" }}>

      {/* close */}
      <button onClick={onClose} style={{ position: "absolute", top: 52, right: 18, width: 38, height: 38, borderRadius: "50%",
        background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3 }}>
        <Icon name="close" size={19} color="#fff" />
      </button>

      {/* centered: poster as the hero, share button directly below */}
      <div className="noscroll" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "68px 24px 28px", gap: 18 }}>
        <div style={{ width: "100%", maxWidth: 332 }}>
          <ReportFusion p={p} r={r} c={c} />
        </div>
        <button style={{ width: "100%", maxWidth: 332, height: 52, borderRadius: 999, fontSize: 15.5, fontWeight: 600, color: "#fff",
          background: `linear-gradient(180deg, ${p.accent}, ${p.deep})`, boxShadow: `0 8px 20px ${p.accent}55`,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="share" size={19} color="#fff" /> 分享小报
        </button>
      </div>
    </div>
  );
}
window.GrowthReport = GrowthReport;

// ---- 照片墙 / 成长相册 — tidy iPhone-Photos-style grid, fits one screen ----
function albumCap(s) {
  s = (s || "").replace(/[（(][^）)]*[）)]/g, "").replace(/^[…\s。，！!？?~～.,]+/, "").trim();
  const parts = s.split(/[，。！？～…,.]/).filter(Boolean);
  return (parts[0] || s).slice(0, 14);
}
function albumTotal(p) {
  const base = 1 + (p.diary ? p.diary.length : 0);
  return Math.max(base, Math.min(60, Math.round(p.days / 8) + 1));
}

// shared iPhone-album grid: featured 2×2 + uniform day-labelled thumbs + "+N"
function AlbumGrid({ p }) {
  const shots = [{ src: window.photoFor(p.photoId) }];
  (p.diary || []).forEach(d => shots.push({ src: window.photoFor(d.photo || p.photoId) }));
  const total = albumTotal(p);
  const VISIBLE = 9;
  const cells = [];
  for (let i = 0; i < Math.min(total, VISIBLE); i++) cells.push({ id: `gw-${p.id}-${i}`, src: shots[i % shots.length].src });
  const extra = total - cells.length;
  const dayOf = (i) => Math.max(1, Math.round(p.days - i * (p.days - 1) / Math.max(1, total - 1)));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gridAutoRows: "1fr", gap: 4 }}>
      {cells.map((cell, i) => {
        const featured = i === 0;
        const isMore = i === cells.length - 1 && extra > 0;
        return (
          <div key={cell.id} style={{ position: "relative", overflow: "hidden", borderRadius: 6, background: p.soft,
            gridColumn: featured ? "span 2" : "span 1", gridRow: featured ? "span 2" : "span 1", aspectRatio: "1 / 1" }}>
            <image-slot id={cell.id} shape="rect" src={cell.src}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} placeholder=" "></image-slot>
            {featured && (
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "16px 9px 7px",
                background: "linear-gradient(180deg, transparent, rgba(20,16,10,0.55))", pointerEvents: "none" }}>
                <div className="sig" style={{ fontSize: 18, color: "#fff", lineHeight: 1, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>现在的我</div>
                <div style={{ fontFamily: "var(--f-num)", fontSize: 10, color: "rgba(255,255,255,0.85)" }}>第 {p.days} 天</div>
              </div>
            )}
            {!featured && !isMore && (
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "12px 5px 3px",
                background: "linear-gradient(180deg, transparent, rgba(20,16,10,0.5))", pointerEvents: "none", textAlign: "center" }}>
                <span style={{ fontFamily: "var(--f-num)", fontWeight: 600, fontSize: 9.5, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>第 {dayOf(i)} 天</span>
              </div>
            )}
            {isMore && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(34,28,20,0.5)", backdropFilter: "blur(1px)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <span style={{ fontFamily: "var(--f-num)", fontWeight: 700, fontSize: 17 }}>+{extra}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
window.AlbumGrid = AlbumGrid;

function ReportWall({ p, r, c }) {
  const total = albumTotal(p);
  const oneLiner = albumCap(p.opener || p.voice);
  return (
    <div className="rise" style={{ position: "relative", background: "#FBF5E9",
      borderRadius: "var(--r-lg)", boxShadow: "var(--sh-3)", overflow: "hidden",
      border: "1px solid rgba(120,90,50,0.18)", padding: "18px 16px 16px" }}>

      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <PlantAvatar plant={p} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="kicker" style={{ color: p.deep }}>GROWTH ALBUM</div>
          <div className="mast" style={{ fontSize: 20, lineHeight: 1.1, marginTop: 1 }}>{p.name}的成长相册</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--f-num)", fontWeight: 700, fontSize: 19, color: p.deep, lineHeight: 1 }}>{total}</div>
          <div style={{ fontSize: 10, color: "var(--ink-faint)", marginTop: 2 }}>张照片</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 5, marginTop: 9, marginBottom: 13 }}>
        <span style={{ fontSize: 11, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>陪伴第 <span style={{ fontFamily: "var(--f-num)", fontWeight: 700, color: p.deep }}>{p.days}</span> 天</span>
        <span style={{ fontSize: 11, color: "var(--ink-faint)", whiteSpace: "nowrap" }}>· {p.species}</span>
      </div>

      <AlbumGrid p={p} />

      {/* one-line voice + brand */}
      <div style={{ marginTop: 13, paddingTop: 12, borderTop: "1px dashed var(--hairline)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="serif" style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.4, overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap" }}>「{oneLiner}」</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
            <Icon name="leaf" size={12} color={p.deep} />
            <span style={{ fontSize: 10, color: "var(--ink-faint)" }}>花花日记本 · {p.name}</span>
          </div>
        </div>
        <div className="sig" style={{ fontSize: 24, color: p.deep, flexShrink: 0 }}>{p.name}</div>
      </div>
    </div>
  );
}
window.ReportWall = ReportWall;

// ---- 融合版 — newspaper chrome with the photo album as the centerpiece, one screen ----
function ReportFusion({ p, r, c }) {
  const total = albumTotal(p);
  return (
    <div className="rise" style={{ position: "relative", background: "#FBF5E9", borderRadius: "var(--r-lg)",
      boxShadow: "var(--sh-3)", overflow: "hidden", border: "1px solid rgba(120,90,50,0.18)", padding: "18px 16px 14px" }}>
      {/* grain */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.45,
        backgroundImage: "radial-gradient(circle at 20% 30%, rgba(120,90,50,0.10) 0 1px, transparent 1.4px), radial-gradient(circle at 70% 60%, rgba(90,65,35,0.08) 0 1px, transparent 1.4px)",
        backgroundSize: "10px 10px, 14px 14px" }}></div>

      <div style={{ position: "relative" }}>
        {/* masthead */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 7, borderBottom: "2px solid var(--ink)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="leaf" size={13} color="var(--ink)" />
            <span style={{ fontFamily: "var(--f-journal)", fontWeight: 700, fontSize: 12, letterSpacing: 0.5, whiteSpace: "nowrap", color: "var(--ink)" }}>花花日报 · 号外</span>
          </div>
          <span style={{ fontFamily: "var(--f-num)", fontSize: 10.5, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>第 {p.days} 期</span>
        </div>
        <div style={{ height: 2 }}></div>
        <div style={{ height: 1, background: "var(--ink)", opacity: 0.5 }}></div>

        {/* headline */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, marginTop: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div className="kicker" style={{ color: p.deep }}>{c.kicker}</div>
            <div className="mast" style={{ fontSize: 23, lineHeight: 1.12, marginTop: 3 }}>{c.headline[0]}{c.headline[1]}</div>
          </div>
        </div>

        {/* album hero */}
        <div style={{ marginTop: 11 }}>
          <AlbumGrid p={p} />
        </div>

        {/* footer: stats line + seal + brand */}
        <div style={{ marginTop: 11, paddingTop: 10, borderTop: "1px dashed var(--hairline)",
          display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="serif" style={{ fontSize: 12.5, color: "var(--ink)", lineHeight: 1.45 }}>
              陪伴 <b style={{ fontFamily: "var(--f-num)", color: p.deep }}>{p.days}</b> 天 · 收录 <b style={{ fontFamily: "var(--f-num)", color: p.deep }}>{total}</b> 张 · 日记 <b style={{ fontFamily: "var(--f-num)", color: p.deep }}>{(p.diary || []).length}</b> 篇
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
              <Icon name="leaf" size={12} color={p.deep} />
              <span style={{ fontSize: 10, color: "var(--ink-faint)" }}>花花日记本 · 养一盆有灵魂的花</span>
            </div>
          </div>
          <div style={{ transform: "rotate(-8deg)", border: `2px solid ${p.accent}99`, color: p.deep, borderRadius: 8,
            padding: "4px 8px 3px", textAlign: "center", background: `${p.accent}12`, flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--f-journal)", fontWeight: 700, fontSize: 12, letterSpacing: 0.5, lineHeight: 1.1 }}>{c.stamp}</div>
            <div style={{ fontSize: 7, letterSpacing: 2, marginTop: 1, opacity: 0.8 }}>已 认 证</div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.ReportFusion = ReportFusion;
