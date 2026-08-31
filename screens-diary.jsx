/* ============================================================
   花花日记本 · 日记时间线（某盆花）+ 可分享卡片
   ============================================================ */
function DiaryTimeline({ plant, entries, onDiagnose, onAddPhoto }) {
  const p = plant;
  if (!entries.length) {
    return (
      <div className="glass-card soft-fade" style={{ margin: "10px 0 4px", padding: "34px 24px 30px", borderRadius: "var(--r-2xl)",
        textAlign: "center", background: "rgba(255,253,247,.72)", border: "1px dashed var(--hairline)" }}>
        <div style={{ width: 68, height: 68, margin: "0 auto", borderRadius: "50%", display: "flex", alignItems: "center",
          justifyContent: "center", background: "var(--green-soft)", border: "1px solid rgba(30,70,50,.18)" }}>
          <Icon name="camera" size={28} color="var(--green-deep)" />
        </div>
        <div style={{ marginTop: 17, fontFamily: "var(--f-journal)", fontSize: 20, fontWeight: 650, color: "var(--ink)" }}>
          日记还是空的
        </div>
        <div className="serif" style={{ marginTop: 7, fontSize: 13.5, lineHeight: 1.65, color: "var(--ink-soft)" }}>
          拍下它住进来的第一天，<br />从这张照片开始慢慢记录变化。
        </div>
        <button onClick={() => onAddPhoto && onAddPhoto()} className="btn-ghost"
          style={{ marginTop: 22, minWidth: 176, height: 44, padding: "0 20px", fontSize: 14.5,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
            color: "var(--green-deep)", borderColor: "rgba(30,70,50,.28)" }}>
          <Icon name="camera" size={18} color="var(--green-deep)" /> 拍下第一张照片
        </button>
      </div>
    );
  }
  return (
    <div style={{ padding: "4px 0 0" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {entries.map((d, i) => (
          <div key={d.id} style={{ position: "relative" }}>
            <TimelineDate entry={d} plant={p} />

            {/* ---- diagnosis card ---- */}
            {d.kind === "diagnosis" ? (
              <div className="glass-card" style={{ width: "100%", padding: "15px 16px 14px", borderRadius: "var(--r-xl)",
                border: "1px solid var(--green-soft)", background: "linear-gradient(180deg, #F4F8F0, var(--paper-card))" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>{d.weather || "诊疗记录"}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, flexWrap: "nowrap" }}>
                    <span className="badge" style={{ fontSize: 10.5, padding: "2px 9px", background: "var(--green-deep)", color: "#fff",
                      display: "flex", alignItems: "center", gap: 4 }}>
                      <Icon name="doctor" size={11} color="#fff" /> 花大夫诊断
                    </span>
                    <FollowupTag diagnosis={d} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 11 }}>
                  <div style={{ flex: 1, minWidth: 0 }}><DiagnosisDigest diagnosis={d} /></div>
                  <DiaryPhotos entry={d} compact />
                </div>
              </div>
            ) : (
            /* ---- record card ---- */
            <div className="glass-card" style={{ width: "100%", padding: "15px 16px 14px", borderRadius: "var(--r-xl)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>{d.weather}</div>
                {d.diagnosis ? <FollowupTag diagnosis={d.diagnosis} /> :
                  <span className="badge" style={{ fontSize: 10.5, padding: "2px 8px", background: "var(--green-soft)", color: "var(--green-deep)" }}>{d.mood}</span>}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 11 }}>
                <div style={{ flex: 1, padding: "3px 1px 0", fontFamily: "var(--f-journal)",
                  fontSize: 14.5, lineHeight: 1.65, color: "var(--ink)" }}>
                  {d.voice || "今天也请多关照。"}
                </div>
                {(d.photo || d.photoData || (d.photos && d.photos.length)) && <DiaryPhotos entry={d} tilt={i % 2 ? -4 : 4} />}
                {d.type === "born" && !d.photoData && !d.photo && (
                  <button onClick={() => onAddPhoto && onAddPhoto()} aria-label="补拍第一张照片"
                    className="snap" style={{ width: 78, minHeight: 96, transform: "rotate(3deg)", alignSelf: "flex-start", flexShrink: 0,
                      border: "1px dashed var(--hairline)", background: "rgba(255,255,255,.46)", color: "var(--ink-faint)",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <Icon name="camera" size={20} color="var(--ink-faint)" />
                    <span style={{ fontSize: 11.5, lineHeight: 1.35 }}>补拍第一张</span>
                  </button>
                )}
              </div>

              {d.diagnosis && (
                <div style={{ marginTop: 11, paddingTop: 10, borderTop: "1px dashed var(--green-soft)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 9,
                    fontSize: 11.5, fontWeight: 700, color: "var(--green-deep)", letterSpacing: ".04em" }}>
                    <Icon name="doctor" size={13} color="var(--green-deep)" /> 花大夫补充
                  </div>
                  <DiagnosisDigest diagnosis={d.diagnosis} compact />
                </div>
              )}

              {/* soft concern hook — issue observed but user deferred the doctor */}
              {d.concern && !d.diagnosis && (
                <button onClick={() => onDiagnose && onDiagnose(p, d)}
                  style={{ width: "100%", marginTop: 11, display: "flex", alignItems: "center", gap: 9, textAlign: "left",
                    background: "transparent", border: "0", borderRadius: "var(--r-md)", padding: "8px 0 1px" }}>
                  <Icon name="doctor" size={15} color="var(--green-deep)" />
                  <span style={{ flex: 1, fontSize: 12.5, color: "var(--green-deep)", lineHeight: 1.4 }}>
                    {d.doctorStatus === "started" ? "继续带着这张照片问花大夫" : "带这张照片问问花大夫"}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--green-deep)", display: "flex", alignItems: "center", gap: 2, whiteSpace: "nowrap" }}>
                    去看看 <Icon name="chevR" size={13} color="var(--green-deep)" />
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

function diaryPhotoSources(entry) {
  const values = [
    ...(Array.isArray(entry && entry.photos) ? entry.photos : []),
    entry && entry.photoData,
    ...(Array.isArray(entry && entry.diagnosis && entry.diagnosis.photos) ? entry.diagnosis.photos : []),
  ].filter(Boolean);
  if (!values.length && entry && entry.photo) {
    const fallback = window.photoFor(entry.photo);
    if (fallback) values.push(fallback);
  }
  return [...new Set(values.map(String))].slice(0, 6);
}

function DiaryPhotos({ entry, compact = false, tilt = 3 }) {
  const photos = diaryPhotoSources(entry);
  const [active, setActive] = useState(null);
  if (!photos.length) return null;
  const width = compact ? 72 : 82;
  const height = compact ? 82 : 94;
  return <>
    <button onClick={() => setActive(0)} aria-label={`查看${photos.length > 1 ? `${photos.length}张` : ""}照片大图`}
      style={{ position: "relative", width, height, flex: "0 0 auto", alignSelf: "flex-start", padding: 0,
        transform: `rotate(${tilt}deg)` }}>
      {photos.slice(0, 3).map((src, index) => <span key={src} className="snap" style={{ position: "absolute",
        width: width - 8, height: height - 8, left: index * 5, top: index * 3, padding: 4,
        transform: `rotate(${(index - 1) * 3}deg)`, zIndex: index + 1, overflow: "hidden" }}>
        <img src={src} alt="问诊照片" style={{ width: "100%", height: "100%", display: "block", objectFit: "cover", borderRadius: 3 }} />
      </span>)}
      {photos.length > 1 && <span style={{ position: "absolute", right: -3, bottom: -2, zIndex: 6, minWidth: 22, height: 22,
        padding: "0 6px", borderRadius: 11, display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: "var(--green-deep)", color: "#fff", fontFamily: "var(--f-num)", fontSize: 10.5,
        boxShadow: "0 3px 8px rgba(20,50,36,.2)" }}>+{photos.length - 1}</span>}
    </button>

    {active !== null && <div role="dialog" aria-modal="true" aria-label="照片大图" onClick={() => setActive(null)}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(17,25,20,.94)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: "64px 18px 76px" }}>
      <button onClick={() => setActive(null)} aria-label="关闭大图" style={{ position: "absolute", top: 54, right: 18,
        width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,.14)", color: "#fff", fontSize: 24 }}>×</button>
      <img onClick={event => event.stopPropagation()} src={photos[active]} alt={`照片 ${active + 1}`}
        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8, boxShadow: "0 16px 50px rgba(0,0,0,.38)" }} />
      {photos.length > 1 && <>
        <button onClick={event => { event.stopPropagation(); setActive((active - 1 + photos.length) % photos.length); }}
          aria-label="上一张" style={{ position: "absolute", left: 14, top: "50%", width: 40, height: 40,
            borderRadius: "50%", background: "rgba(255,255,255,.14)", color: "#fff", fontSize: 25 }}>‹</button>
        <button onClick={event => { event.stopPropagation(); setActive((active + 1) % photos.length); }}
          aria-label="下一张" style={{ position: "absolute", right: 14, top: "50%", width: 40, height: 40,
            borderRadius: "50%", background: "rgba(255,255,255,.14)", color: "#fff", fontSize: 25 }}>›</button>
        <span style={{ position: "absolute", bottom: 42, color: "rgba(255,255,255,.8)", fontSize: 12.5,
          fontFamily: "var(--f-num)" }}>{active + 1} / {photos.length}</span>
      </>}
    </div>}
  </>;
}

function DiagnosisDigest({ diagnosis, compact = false }) {
  const [expanded, setExpanded] = useState(false);
  const dx = diagnosis || {};
  const clean = value => String(value || "").replace(/\*\*|#{1,4}\s*/g, "").replace(/\s+/g, " ").trim();
  const conclusion = clean(dx.conclusion) || "暂时无法确定原因，继续观察变化。";
  const symptom = clean(dx.symptom);
  const rawPlan = clean(dx.plan);
  const suppliedPoints = Array.isArray(dx.points) ? dx.points.map(clean).filter(Boolean) : [];
  const actions = (suppliedPoints.length ? suppliedPoints : rawPlan.split(/[。；;]+/))
    .flatMap(item => item.length > 42 ? item.split(/[，,]/) : [item])
    .map(clean).filter(item => item.length > 2).slice(0, compact ? 2 : 3);
  const hasDetails = symptom.length > 42 || rawPlan.length > 90 || actions.length < 2;
  return <div className="diagnosis-digest">
    <div style={{ fontSize: 11, color: "var(--green-deep)", fontWeight: 750 }}>判断</div>
    <div className="serif" style={{ marginTop: 7, fontSize: 13.5, lineHeight: 1.55, color: "var(--ink)", display: "-webkit-box",
      WebkitBoxOrient: "vertical", WebkitLineClamp: expanded ? "unset" : 2, overflow: "hidden" }}>{conclusion}</div>

    {actions.length > 0 && <div style={{ marginTop: 10, display: "grid", gap: 7 }}>
      <div style={{ fontSize: 11, color: "var(--green-deep)", fontWeight: 750 }}>现在做</div>
      {actions.map((action, index) => <div key={index} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ width: 17, height: 17, borderRadius: "50%", flex: "0 0 auto", marginTop: 1,
          display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--green-soft)",
          color: "var(--green-deep)", fontFamily: "var(--f-num)", fontSize: 9.5, fontWeight: 750 }}>{index + 1}</span>
        <span style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-soft)" }}>{action}</span>
      </div>)}
    </div>}

    {dx.urgency === "urgent" && <div style={{ marginTop: 10, color: "var(--terra)", fontSize: 10.5, fontWeight: 700 }}>建议尽快处理</div>}
    {expanded && <div className="serif" style={{ marginTop: 9, paddingTop: 9, borderTop: "1px dashed var(--hairline)",
      fontSize: 12, lineHeight: 1.55, color: "var(--ink-faint)" }}>
      {symptom && <div><b style={{ color: "var(--ink-soft)" }}>观察：</b>{symptom}</div>}
      {rawPlan && <div style={{ marginTop: symptom ? 5 : 0 }}><b style={{ color: "var(--ink-soft)" }}>完整护理：</b>{rawPlan}</div>}
    </div>}

    {hasDetails && <div style={{ marginTop: expanded ? 14 : 11, display: "flex", justifyContent: "center" }}>
      <button onClick={() => setExpanded(value => !value)} style={{ minHeight: 30, padding: "0 14px", borderRadius: "var(--r-pill)",
        color: "var(--ink-faint)", fontSize: 11.5 }}>{expanded ? "收起详情" : "展开详情"}</button>
    </div>}
  </div>;
}

function FollowupTag({ diagnosis }) {
  const days = Math.max(1, Math.min(30, Number(diagnosis && diagnosis.followupDays) || 7));
  return <span style={{ padding: "4px 9px", borderRadius: "var(--r-pill)", background: "rgba(30,70,50,.08)",
    color: "var(--green-deep)", fontSize: 10.5, lineHeight: 1.2, fontWeight: 700, whiteSpace: "nowrap" }}>
    约 {days} 天后复查
  </span>;
}

function TimelineDate({ entry, plant }) {
  const match = String(entry.date || "").match(/(\d+)月(\d+)日/);
  const date = match
    ? `${match[1].padStart(2, "0")}.${match[2].padStart(2, "0")}`
    : String(entry.date || "今天");
  return (
    <div data-timeline-date="true" style={{ display: "flex", alignItems: "baseline", gap: 9, margin: "0 3px 9px" }}>
      <div style={{ fontFamily: "var(--f-num)", fontSize: 22, lineHeight: 1, fontWeight: 750, color: "var(--green-deep)" }}>{date}</div>
      <div style={{ fontFamily: "var(--f-journal)", fontSize: 11.5, color: "var(--ink-soft)" }}>{entry.day}</div>
      <div style={{ flex: 1, height: 1, alignSelf: "center", background: "linear-gradient(90deg, rgba(30,70,50,.28), transparent)" }}></div>
    </div>
  );
}

// ---- 成长小报 — the whole plant's life, condensed into one shareable poster ----
function GrowthReport({ plant, onClose }) {
  const p = plant;
  const r = window.growthReport(p);
  const c = r.copy;
  const photos = window.reportPhotos(p);
  const [preparedReport, setPreparedReport] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveNote, setSaveNote] = useState("");

  useEffect(() => {
    let active = true;
    setPreparedReport(null);
    setSaveError("");
    window.HHReport.prepare({ plant: p, report: r, photos })
      .then(result => { if (active) setPreparedReport(result); })
      .catch(error => { if (active) setSaveError(error && error.message ? error.message : "小报暂时没有生成成功"); });
    return () => { active = false; };
  }, [p]);

  async function saveReport() {
    if (!preparedReport || saving) return;
    setSaving(true);
    setSaveError("");
    setSaveNote("");
    try {
      const result = await window.HHReport.save(preparedReport);
      if (result.method === "download") setSaveNote("图片已下载；如浏览器打开预览，可长按存入相册");
      if (result.method === "share") setSaveNote("已经打开系统保存菜单");
    } catch (error) {
      setSaveError(error && error.message ? error.message : "这次没有保存成功，请再试一次");
    } finally {
      setSaving(false);
    }
  }

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
        <button onClick={saveReport} disabled={!preparedReport || saving}
          style={{ width: "100%", maxWidth: 332, height: 52, borderRadius: 999, fontSize: 15.5, fontWeight: 600, color: "#fff",
          background: "var(--green-grad)", boxShadow: "0 8px 20px rgba(30,70,50,.28)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          opacity: !preparedReport || saving ? .58 : 1 }}>
          <Icon name="share" size={19} color="#fff" /> {!preparedReport ? "正在生成小报…" : saving ? "正在打开…" : "保存小报"}
        </button>
        {(saveError || saveNote) && <div role={saveError ? "alert" : "status"} style={{ maxWidth: 332, marginTop: -8,
          fontSize: 11.5, lineHeight: 1.45, textAlign: "center", color: saveError ? "#FFD3C8" : "rgba(255,255,255,.82)" }}>
          {saveError || saveNote}
        </div>}
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
window.reportPhotos = function reportPhotos(plant) {
  const seen = new Set();
  return (plant.diary || []).flatMap(d => {
    const src = d.photoData || (d.photo ? window.photoFor(d.photo) : "");
    if (!src || seen.has(src)) return [];
    seen.add(src);
    return [{ id: d.id, src, day: d.day || "", date: d.date || "" }];
  });
};

// Only photos that already exist in the diary can enter the report.
function AlbumGrid({ p }) {
  const photos = window.reportPhotos(p).slice(0, 3);
  const columns = photos.length === 1 ? "1fr" : photos.length === 2 ? "repeat(2, 1fr)" : "repeat(4, 1fr)";

  return (
    <div style={{ display: "grid", gridTemplateColumns: columns, gridAutoRows: "1fr", gap: 5 }}>
      {photos.map((photo, i) => {
        const featured = photos.length >= 3 && i === 0;
        return (
          <div key={photo.id} style={{ position: "relative", overflow: "hidden", borderRadius: 6, background: p.soft,
            gridColumn: featured ? "span 2" : "span 1", gridRow: featured ? "span 2" : "span 1",
            aspectRatio: photos.length === 1 ? "16 / 9" : "1 / 1" }}>
            <image-slot id={`report-${photo.id}`} shape="rect" src={photo.src}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} placeholder=" "></image-slot>
            {(featured || photos.length === 1) && (
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "16px 9px 7px",
                background: "linear-gradient(180deg, transparent, rgba(20,16,10,0.55))", pointerEvents: "none" }}>
                <div className="sig" style={{ fontSize: 18, color: "#fff", lineHeight: 1, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>{i === 0 ? "现在的我" : "成长中的我"}</div>
                <div style={{ fontFamily: "var(--f-num)", fontSize: 10, color: "rgba(255,255,255,0.85)" }}>{photo.day}{photo.date ? ` · ${photo.date}` : ""}</div>
              </div>
            )}
            {!featured && photos.length > 1 && (
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "12px 5px 3px",
                background: "linear-gradient(180deg, transparent, rgba(20,16,10,0.5))", pointerEvents: "none", textAlign: "center" }}>
                <span style={{ fontFamily: "var(--f-num)", fontWeight: 600, fontSize: 9.5, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{photo.day || photo.date}</span>
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
  const total = window.reportPhotos(p).length;
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
  const total = window.reportPhotos(p).length;
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
