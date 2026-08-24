/* ============================================================
   花花日记本 · Tab 1 · 日记本 — 所有植物日记封面（双列等高）
   沉浸式天气头部 · 定位左上 · 全部 / 需照料 切换
   ============================================================ */

// weather presets (keyed by Chinese label so tweak value maps directly)
const WX = {
  "小雨": { icon: "cloudRain", temp: "22°", sky: ["#aebccb", "#c8ced4"], glow: null,
    phrase: "细雨天", note: "宜窝在家，陪花说说话", tint: "#5c6b7a" },
  "晴":   { icon: "sun", temp: "27°", sky: ["#f7e2a2", "#f4e7cf"], glow: "rgba(255,238,180,0.9)",
    phrase: "阳光正好", note: "晒晒你，也晒晒它们", tint: "#b3852f" },
  "多云": { icon: "cloud", temp: "24°", sky: ["#d2d7cf", "#e4e2d4"], glow: null,
    phrase: "云慢悠悠的", note: "刚刚好的一天", tint: "#79806f" },
};

function TitleMark({ style }) {
  if (style === "手写") {
    return (
      <>
        <div className="app-title-hand">花花日记本</div>
        <div className="app-sub-en">A Diary for Your Plants</div>
      </>
    );
  }
  if (style === "混排") {
    return (
      <>
        <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
          <span style={{ fontFamily: "var(--f-script)", fontSize: 50, lineHeight: 0.8, color: "var(--green-deep)" }}>花花</span>
          <span style={{ fontFamily: "var(--f-journal)", fontWeight: 500, fontSize: 27, letterSpacing: 2, color: "var(--ink)" }}>日记本</span>
        </div>
        <div className="app-sub-en" style={{ marginTop: 6 }}>A Diary for Your Plants</div>
      </>
    );
  }
  // 清秀 (default) — light, airy serif
  return (
    <>
      <div className="app-title-light">花花日记本</div>
      <div className="app-sub-en">A Diary for Your Plants</div>
    </>
  );
}

function WeatherHeader({ weather, titleStyle, flourish, liveWeather, onRefreshWeather }) {
  const preset = WX[weather] || WX["小雨"];
  const wx = liveWeather && liveWeather.live ? liveWeather : preset;
  const shownWeather = liveWeather && liveWeather.live ? liveWeather.weather : weather;
  return (
    <div className="sky">
      {/* atmospheric sky */}
      <div className="sky-bg" style={{ background: `linear-gradient(180deg, ${wx.sky[0]} 0%, ${wx.sky[1]} 34%, var(--paper) 90%)` }}>
        {wx.glow && <div style={{ position: "absolute", top: -50, right: -30, width: 190, height: 190, borderRadius: "50%",
          background: `radial-gradient(circle, ${wx.glow}, rgba(255,238,180,0))` }}></div>}
      </div>

      {/* flourish: weather particles */}
      {flourish && shownWeather === "小雨" && (
        <div className="sky-bg" style={{ zIndex: 1 }}>
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="raindrop" style={{ left: `${(i * 5.6 + (i % 3) * 1.5) % 100}%`,
              height: `${13 + (i % 4) * 4}px`, animationDuration: `${0.7 + (i % 3) * 0.25}s`, animationDelay: `${(i % 7) * 0.22}s` }}></span>
          ))}
        </div>
      )}
      {flourish && shownWeather === "晴" && (
        <div className="sky-bg" style={{ zIndex: 1 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="mote" style={{ left: `${10 + i * 9}%`, top: `${30 + (i % 4) * 16}%`,
              animationDuration: `${3 + (i % 3)}s`, animationDelay: `${(i % 5) * 0.6}s` }}></span>
          ))}
        </div>
      )}
      {flourish && shownWeather === "多云" && (
        <div className="sky-bg" style={{ zIndex: 1 }}>
          <div className="cloud-blob" style={{ left: "12%", top: 36, width: 90, height: 30, animationDuration: "7s" }}></div>
          <div className="cloud-blob" style={{ right: "16%", top: 64, width: 70, height: 24, animationDuration: "9s", animationDelay: "1s" }}></div>
        </div>
      )}

      {/* content */}
      <div style={{ position: "relative", zIndex: 2, padding: "54px 22px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onRefreshWeather} title="点击更新定位和天气" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Icon name="pin" size={15} color={wx.tint} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{liveWeather && liveWeather.city || "上海"}</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>
            <Icon name={wx.icon} size={17} color={wx.tint} />
            <span style={{ fontWeight: 600 }}>{shownWeather}</span>
            <span style={{ fontFamily: "var(--f-num)", fontWeight: 600 }}>{typeof wx.temp === "number" ? `${wx.temp}°` : wx.temp}</span>
          </div>
        </div>

        {/* immersive weather mood line */}
        <div style={{ marginTop: 16, display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontFamily: "var(--f-hand)", fontSize: 21, fontWeight: 700, color: wx.tint }}>{wx.phrase}</span>
          <span className="serif" style={{ fontSize: 13, color: "var(--ink-soft)" }}>{wx.note}</span>
        </div>

        {/* title */}
        <div style={{ marginTop: 14 }}>
          <TitleMark style={titleStyle} />
        </div>

        <div className="rule" style={{ marginTop: 16 }}></div>
      </div>
    </div>
  );
}

function DiaryHome({ go, t = {} }) {
  const plants = window.PLANTS;
  const [filter, setFilter] = useState("all"); // all | care
  const careList = plants.filter(p => p.statusTone === "warn");
  const grid = filter === "care" ? careList : plants;
  const weather = t.weather || "小雨";
  const titleStyle = t.titleStyle || "清秀";
  const flourish = t.bgFlourish !== false;
  const [liveWeather, setLiveWeather] = useState(() => window.HHWeather && window.HHWeather.current());

  useEffect(() => {
    let active = true;
    if (window.HHWeather) window.HHWeather.load().then(value => { if (active) setLiveWeather(value); });
    return () => { active = false; };
  }, []);

  function refreshWeather() {
    if (window.HHWeather) window.HHWeather.refresh().then(setLiveWeather);
  }

  return (
    <div className="noscroll" style={{ position: "absolute", inset: 0, overflowY: "auto", paddingBottom: 110 }}>
      {/* ---- immersive weather masthead ---- */}
      <WeatherHeader weather={weather} titleStyle={titleStyle} flourish={flourish} liveWeather={liveWeather} onRefreshWeather={refreshWeather} />

      {/* ---- filter pills ---- */}
      <div style={{ display: "flex", gap: 9, padding: "16px 22px 0" }}>
        {[["all", "全部", "book"], ["care", "需照料", "bell"]].map(([id, label, icon]) => {
          const on = filter === id;
          const n = id === "care" ? careList.length : plants.length;
          return (
            <button key={id} onClick={() => setFilter(id)}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 999,
                whiteSpace: "nowrap", flexShrink: 0,
                background: on ? "var(--green)" : "transparent",
                border: on ? "1px solid var(--green)" : "1px solid var(--hairline)" }}>
              <Icon name={icon} size={16} color={on ? "#fff" : "var(--ink-soft)"} />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: on ? "#fff" : "var(--ink-soft)", fontFamily: "var(--f-ui)" }}>{label}</span>
              <span style={{ fontFamily: "var(--f-num)", fontSize: 12, fontWeight: 600, paddingLeft: 1,
                color: on ? "rgba(255,255,255,0.78)" : "var(--ink-faint)" }}>{n}</span>
            </button>
          );
        })}
      </div>

      {/* ---- uniform two-column grid ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, padding: "16px 20px 0" }}>
        {grid.map((p) => (
          <DiaryCover key={p.id} p={p} onOpen={() => go("plantDiary", p)} />
        ))}
        {/* adopt new — same height as cards */}
        <button onClick={() => go("onboard")} style={{ display: "block", width: "100%", height: "100%", padding: 0 }}>
          <div style={{ height: "100%", minHeight: 248, borderRadius: "var(--r-xl)", border: "1.5px dashed var(--hairline)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
            color: "var(--ink-faint)", background: "rgba(255,255,255,0.25)" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: "1.5px solid var(--hairline)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="plus" size={20} color="var(--ink-faint)" />
            </div>
            <div style={{ fontSize: 12.5, fontFamily: "var(--f-journal)", lineHeight: 1.5, textAlign: "center" }}>领养新花<br />开一本新日记</div>
          </div>
        </button>
      </div>
    </div>
  );
}
window.DiaryHome = DiaryHome;

/* ---------- equal-height cover ---------- */
function DiaryCover({ p, onOpen }) {
  const latest = p.diary[0];
  // diagnosis entries have no `quote` field — fall back to their voice / conclusion so the cover never crashes
  const coverParts = (latest && latest.quote)
    ? latest.quote
    : [(latest && (latest.voice || latest.conclusion || latest.plan)) || "刚记下了一笔。"];
  const warn = p.statusTone === "warn";
  return (
    <button onClick={onOpen} style={{ display: "block", width: "100%", height: "100%", textAlign: "left", padding: 0 }}>
      <div className="glass-card" style={{ height: "100%", minHeight: 248, padding: 10, display: "flex", flexDirection: "column" }}>
        {/* photo */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <div style={{ borderRadius: 8, overflow: "hidden", background: `linear-gradient(180deg, #FBF7EF 0%, ${p.soft}66 78%, ${p.soft}aa 100%)`,
            display: "flex", alignItems: "flex-end", justifyContent: "center", position: "relative", height: 108 }}>
            <image-slot id={p.photoId} shape="rounded" radius="3" transparent-frame="" src={window.cutFor ? window.cutFor(p.photoId) : window.photoFor(p.photoId)}
              fit="contain" position="50% 100%"
              style={{ width: "100%", height: "104px", display: "block", position: "relative",
                top: window.coverOffsetY ? window.coverOffsetY(p.photoId) : 0,
                transform: `scale(${window.coverScale ? window.coverScale(p.photoId) : 1})`, transformOrigin: "bottom center" }}
              placeholder=" "></image-slot>
          </div>
          {warn && (
            <div style={{ position: "absolute", top: 8, right: 8, display: "flex", alignItems: "center", gap: 4,
              background: "var(--terra)", color: "#fff", padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
              whiteSpace: "nowrap", boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}>
              <Icon name="bell" size={11} color="#fff" /> 需照料
            </div>
          )}
        </div>

        {/* name */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span className="mast" style={{ fontSize: 18 }}>{p.name}</span>
          <span style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{p.species}</span>
        </div>

        {/* quote — clamped to 2 lines so all cards match */}
        <div className="serif" style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 7, lineHeight: 1.5,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 39 }}>
          <Journal parts={coverParts} />
        </div>

        {/* meta pinned to bottom */}
        <div style={{ marginTop: "auto" }}>
          <div className="hairrule" style={{ margin: "11px 0 9px" }}></div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>
              <Icon name="book" size={12} color={p.deep} />
              <span style={{ fontFamily: "var(--f-num)", fontWeight: 600 }}>{(p.diary || []).length}</span> 篇日记
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 600, whiteSpace: "nowrap",
              color: warn ? "var(--terra)" : p.deep }}>
              {p.status}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
