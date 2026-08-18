/* ============================================================
   花花日记本 · 桌面小组件 · 多风格 + 多配色切换
   uses the real plant plates so the widget shows YOUR plants
   ============================================================ */

// real plant photo thumbnail (data-URI plates → render everywhere)
function PlantThumb({ pid, size, radius = 10, ring = "2px solid rgba(255,255,255,0.85)", sway = false, delay = 0, shadow = "0 5px 12px rgba(0,0,0,0.22)" }) {
  const src = window.PLANT_IMG && window.PLANT_IMG[pid] || "";
  return (
    <div style={{ width: size, height: size, borderRadius: radius, overflow: "hidden", flexShrink: 0,
      border: ring, boxShadow: shadow, transformOrigin: "bottom center",
      animation: sway ? `sway 3.6s ease-in-out ${delay}s infinite alternate` : "none" }}>
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>);

}

// per-plant physical sway: amplitude (deg) + soil-line fraction (pivot/clip seam)
// soil-line fraction per plant (pivot/clip seam so the pot stays put)
const PLANT_SOIL = { ciji: 0.66, tuanzi: 0.64, laobei: 0.62, alv: 0.64, zhaozhao: 0.60 };
const SWAY_AMP = 3.2; // one uniform sway angle for every plant
const SWAY_DUR = 3.6; // one uniform period

// Match perceived plant size rather than assigning every cutout the same
// height. Tall plants ease down; compact plants can use more of the frame.
function widgetPlantScale(photoId) {
  return typeof window.coverScale === "function" ? window.coverScale(photoId) : 1;
}

// transparent cutout plant. When sway=true, only the BODY sways (pot stays put):
// two stacked copies — body pivots at the soil line, a clipped pot-cover stays static.
// (The cutout already has a baked soft GROUND shadow under the pot, so we add no
//  extra drop-shadow — a silhouette drop-shadow would float up behind tall plants.)
function PlantCut({ pid, h, sway = false, delay = 0, glow = false }) {
  const src = window.PLANT_CUT && window.PLANT_CUT[pid] || "";
  if (!sway) {
    return <img src={src} alt="" style={{ height: h, width: "auto", display: "block", flexShrink: 0 }} />;
  }
  const soilPct = (PLANT_SOIL[pid] || 0.64) * 100;
  return (
    <div style={{ position: "relative", height: h, flexShrink: 0 }}>
      {/* body — sways, pivot at soil line; establishes the box width */}
      <img src={src} alt="" style={{ height: h, width: "auto", display: "block",
        transformOrigin: `50% ${soilPct}%`,
        ["--amp"]: `${SWAY_AMP}deg`,
        animation: `swayBody ${SWAY_DUR}s ease-in-out ${delay}s infinite alternate` }} />
      {/* pot cover — static, shows only below the soil line, hides the swaying pot */}
      <img src={src} alt="" aria-hidden="true" style={{ position: "absolute", top: 0, left: 0,
        height: h, width: "auto", display: "block",
        clipPath: `inset(${soilPct}% 0 0 0)`, WebkitClipPath: `inset(${soilPct}% 0 0 0)` }} />
    </div>);

}

// little weather chip (echoes the home top) — makes the widget cuter
function WxChip({ wx = "小雨", temp = 22, scale = 1, onDark = false }) {
  const icon = wx === "晴" ? "sun" : wx === "多云" ? "cloud" : "cloudRain";
  const col = onDark ? "rgba(255,255,255,0.92)" : "var(--ink-soft)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4,
      background: onDark ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.6)",
      borderRadius: 999, padding: "3px 8px", whiteSpace: "nowrap" }}>
      <Icon name={icon} size={14} color={col} />
      <span style={{ fontFamily: "var(--f-num)", fontWeight: 600, fontSize: "11px", color: col }}>{temp}°</span>
    </div>);

}

// ---- live weather atmosphere overlay (fills the widget, behind/over content) ----
function WeatherFX({ wx, scale = 1, onDark = false, radius = 24 }) {
  const wrap = { position: "absolute", inset: 0, overflow: "hidden", borderRadius: radius * scale, pointerEvents: "none", zIndex: 2 };

  // ☀️ 晴 — warm rays sweeping from top-right + floating light motes
  if (wx === "晴") {
    const motes = Array.from({ length: scale < 1 ? 5 : 9 });
    return (
      <div style={wrap}>
        {/* warm wash */}
        <div style={{ position: "absolute", inset: 0,
          background: "radial-gradient(120% 90% at 82% 6%, rgba(255,238,180,0.5), rgba(255,238,180,0) 60%)",
          animation: "wxGlow 4.5s ease-in-out infinite" }}></div>
        {/* rotating ray fan from top-right */}
        <div style={{ position: "absolute", top: -70 * scale, right: -70 * scale, width: 200 * scale, height: 200 * scale,
          transformOrigin: "center", animation: "wxSpin 26s linear infinite",
          background: "conic-gradient(from 0deg, rgba(255,240,190,0) 0deg, rgba(255,240,190,0.34) 10deg, rgba(255,240,190,0) 20deg, rgba(255,240,190,0) 40deg, rgba(255,240,190,0.26) 50deg, rgba(255,240,190,0) 62deg, rgba(255,240,190,0) 90deg, rgba(255,240,190,0.3) 100deg, rgba(255,240,190,0) 112deg, rgba(255,240,190,0) 360deg)",
          borderRadius: "50%", opacity: 0.8 }}></div>
        {/* floating motes */}
        {motes.map((_, i) =>
        <span key={i} style={{ position: "absolute", left: `${8 + i * 67 % 84}%`, bottom: `${6 + i * 37 % 50}%`,
          width: (3 + i % 2 * 2) * scale, height: (3 + i % 2 * 2) * scale, borderRadius: "50%",
          background: "rgba(255,244,200,0.95)", boxShadow: "0 0 6px rgba(255,236,170,0.9)",
          ["--mx"]: `${(i % 3 - 1) * 8}px`,
          animation: `wxMote ${3.6 + i % 4 * 0.7}s ease-in ${i * 0.5}s infinite` }}></span>
        )}
      </div>);

  }

  // ☁️ 多云 — full-sky overcast made of layered cloud clusters (varied opacity), seamless drift
  if (wx === "多云") {
    const light = onDark ? "rgba(232,237,242,1)" : "rgba(251,252,253,1)";
    const grey  = onDark ? "rgba(150,161,174,1)"  : "rgba(182,191,203,1)";
    // each cloud = a cluster of overlapping puffs; cx across HALF the band, own opacity & depth
    const clouds = [
      { cx: 6,  y: 5,  s: 1.15, o: 0.95, g: true },
      { cx: 27, y: 2,  s: 0.85, o: 0.5,  g: false },
      { cx: 44, y: 8,  s: 1.0,  o: 0.78, g: true },
    ];
    const puff = (cx, cy, r, fill, op) => (
      <div style={{ position: "absolute", left: `${cx}%`, top: cy, width: r, height: r,
        marginLeft: -r / 2, borderRadius: "50%", background: fill, opacity: op }}></div>
    );
    const Band = () => (
      <div style={{ position: "relative", width: "50%", height: "100%", flexShrink: 0 }}>
        {clouds.map((c, i) => {
          const fill = c.g ? grey : light;
          const u2 = c.s * scale, base = c.y * scale;
          return (
            <React.Fragment key={i}>
              {puff(c.cx - 6, base + 9 * u2, 26 * u2, fill, c.o)}
              {puff(c.cx,     base,        34 * u2, fill, c.o)}
              {puff(c.cx + 7, base + 6 * u2, 28 * u2, fill, c.o)}
              {puff(c.cx + 13,base + 12 * u2,20 * u2, fill, c.o)}
            </React.Fragment>
          );
        })}
      </div>
    );
    return (
      <div style={wrap}>
        {/* overcast grey sky wash over the top */}
        <div style={{ position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(140,152,166,0.45) 0%, rgba(168,180,194,0.2) 34%, transparent 58%)" }}></div>
        {/* full-width cloud band, seamless loop, only a touch of softness */}
        <div style={{ position: "absolute", top: -4 * scale, left: 0, width: "200%", height: "50%", display: "flex",
          filter: `blur(${2.4 * scale}px)`, animation: "wxBand 52s linear infinite" }}>
          <Band /><Band />
        </div>
      </div>);

  }

  // 🌧 小雨 — slanted falling streaks (+ tiny ripples near the base)
  const streaks = Array.from({ length: scale < 1 ? 10 : 18 });
  const rc = onDark ? "rgba(200,225,255,0.55)" : "rgba(120,160,210,0.45)";
  return (
    <div style={wrap}>
      <div style={{ position: "absolute", inset: "-10% -6% -6% -6%", transform: "rotate(12deg)" }}>
        {streaks.map((_, i) =>
        <span key={i} style={{ position: "absolute", top: 0, left: `${i * 53 % 100}%`,
          width: Math.max(1, 1.4 * scale), height: `${16 + i % 3 * 6}%`, borderRadius: 2,
          background: `linear-gradient(to bottom, ${rc.replace(/[\d.]+\)$/, "0)")}, ${rc})`,
          animation: `wxFall ${0.9 + i % 5 * 0.18}s linear ${i % 7 * 0.16}s infinite` }}></span>
        )}
      </div>
    </div>);

}

// ---- accent themes (the 配色 control) ----
const WTHEMES = [
{ id: "pine", sw: "#2C6147", light: ["#ECF2E6", "#D8E6CF"], deep: ["#1d4a34", "#0c2113"], warm: ["#E9F1E2", "#D2E4C8"], ink: "#21311f", sub: "#3f6b4a", accent: "#2C6147", glow: "#bfe6a8" },
{ id: "terra", sw: "#C8553C", light: ["#F7E9E1", "#EDD2C4"], deep: ["#5a2c1f", "#2a120b"], warm: ["#F8E7D6", "#F0CCAE"], ink: "#3a201a", sub: "#9a5640", accent: "#C8553C", glow: "#f3c39a" },
{ id: "dusk", sw: "#3E6B8C", light: ["#E4ECF2", "#CDDAE7"], deep: ["#1d344a", "#0b1722"], warm: ["#E6EDF3", "#CFDCEA"], ink: "#1f2f3f", sub: "#42647d", accent: "#3E6B8C", glow: "#a9cdeb" },
{ id: "plum", sw: "#8A5A8C", light: ["#EFE6F0", "#DDC9DF"], deep: ["#3f2742", "#1c0f1e"], warm: ["#F0E6F1", "#DEC9E0"], ink: "#332036", sub: "#6e4d70", accent: "#8A5A8C", glow: "#dcb6de" },
{ id: "gold", sw: "#D7A23F", light: ["#F7EFD7", "#EEDDAE"], deep: ["#4f3a17", "#241803"], warm: ["#F9ECCB", "#F1D89E"], ink: "#3d2c11", sub: "#8a6a2a", accent: "#C98A1F", glow: "#f6d97a" }];


// ---- glossy claymorphism sheen (the 此间-style polished-candy finish) ----
function Sheen({ scale = 1, radius = 24, onDark = false }) {
  const r = radius * scale;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", borderRadius: r,
      boxShadow: `inset 0 1px 1px rgba(255,255,255,${onDark ? 0.18 : 0.3}), inset 0 -14px 26px rgba(0,0,0,0.06)` }}></div>);

}

// ---- little visitors: bee / butterfly / bird ----
function CritterArt({ type, u = 1 }) {
  const s = 26 * u;
  if (type === "bee") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" style={{ overflow: "visible" }}>
        {/* wings */}
        <ellipse cx="10" cy="8.5" rx="4.2" ry="2.6" fill="rgba(220,238,255,0.85)" stroke="rgba(120,150,180,0.5)" strokeWidth="0.5"
        style={{ transformOrigin: "13px 10px", animation: "critWingL .09s ease-in-out infinite alternate" }} />
        <ellipse cx="15" cy="8.5" rx="4.2" ry="2.6" fill="rgba(220,238,255,0.85)" stroke="rgba(120,150,180,0.5)" strokeWidth="0.5"
        style={{ transformOrigin: "12px 10px", animation: "critWingR .09s ease-in-out infinite alternate" }} />
        {/* body */}
        <ellipse cx="12.5" cy="13" rx="4.6" ry="3.4" fill="#F2B73A" stroke="#6b4a14" strokeWidth="0.7" />
        <path d="M11 10.2c.6 2 .6 3.8 0 5.6M14 10.4c.5 1.8.5 3.4 0 5.2" stroke="#5a3d12" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        <circle cx="16.6" cy="11.6" r="1.5" fill="#3a2a10" />
        <circle cx="16.2" cy="11.1" r="0.4" fill="#fff" />
      </svg>);

  }
  if (type === "butterfly") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" style={{ overflow: "visible" }}>
        {/* left wing — gentle flap */}
        <g style={{ transformOrigin: "12px 12px", animation: "critWingL .2s ease-in-out infinite alternate" }}>
          <path d="M11.6 12c-1.5-3.6-4.6-5.4-6.8-4-1.7 1.1-1.4 3.6.2 4.9-1.8.5-2.6 2.3-1.8 3.9 1.1 2 4.7 1.6 8.4-1.3Z" fill="#EBA35E" stroke="#b56b2f" strokeWidth="0.5" />
          <circle cx="6.6" cy="10.6" r="0.9" fill="#FBE7C8" />
        </g>
        {/* right wing */}
        <g style={{ transformOrigin: "12px 12px", animation: "critWingR .2s ease-in-out infinite alternate" }}>
          <path d="M12.4 12c1.5-3.6 4.6-5.4 6.8-4 1.7 1.1 1.4 3.6-.2 4.9 1.8.5 2.6 2.3 1.8 3.9-1.1 2-4.7 1.6-8.4-1.3Z" fill="#F2B470" stroke="#b56b2f" strokeWidth="0.5" />
          <circle cx="17.4" cy="10.6" r="0.9" fill="#FBE7C8" />
        </g>
        <ellipse cx="12" cy="12.4" rx="0.85" ry="3.3" fill="#4a3420" />
        <path d="M12 9.2c-.5-.9-1.3-1.5-1.9-1.7M12 9.2c.5-.9 1.3-1.5 1.9-1.7" stroke="#4a3420" strokeWidth="0.6" fill="none" strokeLinecap="round" />
      </svg>);

  }
  // bird — a tiny swallow silhouette
  return (
    <svg width={s * 1.15} height={s} viewBox="0 0 28 24" style={{ overflow: "visible" }}>
      <g style={{ transformOrigin: "14px 13px", animation: "critBob 1.6s ease-in-out infinite" }}>
        <path d="M14 13c1.6-.4 3-1.4 4.2-2.8.3 1.3.1 2.4-.3 3.2 1.3.2 2.6 0 3.8-.6-1 1.8-2.7 2.9-4.7 3.1.2.6.2 1.2 0 1.8-.9-.6-1.9-.9-2.9-.9-1.1 0-2.2.3-3.1.9-.2-.6-.2-1.2 0-1.8-2-.2-3.7-1.3-4.7-3.1 1.2.6 2.5.8 3.8.6-.4-.8-.6-1.9-.3-3.2C11 11.6 12.4 12.6 14 13Z" fill="#5a6b7a" />
        {/* left wing flap */}
        <path d="M13.6 12.8C11 11 8 10.4 5.4 11.2c2 .7 3.4 1.9 4.4 3.4" fill="#46545f"
        style={{ transformOrigin: "13px 13px", animation: "critFlap .22s ease-in-out infinite alternate" }} />
        <path d="M14.4 12.8C17 11 20 10.4 22.6 11.2c-2 .7-3.4 1.9-4.4 3.4" fill="#46545f"
        style={{ transformOrigin: "15px 13px", animation: "critFlap .22s ease-in-out infinite alternate" }} />
        <circle cx="18.4" cy="11.4" r="0.7" fill="#1f2a33" />
      </g>
    </svg>);

}

function Critters({ u = 1, active }) {
  const hostRef = React.useRef(null);
  const elRef = React.useRef(null);
  const [c, setC] = React.useState(null); // {type, id}

  React.useEffect(() => {
    if (!active) return;
    let alive = true,curAnim = null;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const types = ["bee", "butterfly", "bird", "bee", "butterfly"]; // birds rarer
    async function loop() {
      await wait(2500 + Math.random() * 4000);
      while (alive) {
        const type = types[Math.floor(Math.random() * types.length)];
        setC({ type, id: Date.now() });
        await wait(60);
        const el = elRef.current,host = hostRef.current;
        if (alive && el && host) {
          const r = host.getBoundingClientRect();
          const W = r.width,H = r.height || 200;
          const fromLeft = Math.random() < 0.5;
          const dir = fromLeft ? 1 : -1;
          const x0 = fromLeft ? -30 : W + 30;
          const x2 = fromLeft ? W + 30 : -30;
          const landX = (0.26 + Math.random() * 0.48) * W;
          const landY = (0.55 + Math.random() * 0.16) * H;   // on the plant tops (they sit on the shelf below)
          const isBird = type === "bird";
          // a fluttering flight in: bob up/down with a little banking tilt, not a stiff vertical line
          const f = (x, y, tilt) => `translate(${x}px, ${y}px) scaleX(${dir}) rotate(${tilt}deg)`;
          const wob = isBird ? 0 : 1; // butterflies/bees flutter; birds glide
          const bob = (k) => Math.sin(k * Math.PI * (isBird ? 2 : 5)) * (isBird ? 6 : 13) * wob;
          const inX = (k) => x0 + (landX - x0) * k;
          const inY = (k) => H * 0.24 + (landY - H * 0.24) * k + bob(k);
          const kf = [
          { offset: 0, transform: f(x0, H * 0.24, dir * 8), opacity: 0 },
          { offset: 0.06, transform: f(inX(0.08), inY(0.08), dir * 8), opacity: 1 },
          { offset: 0.12, transform: f(inX(0.18), inY(0.18), dir * -6), opacity: 1 },
          { offset: 0.20, transform: f(inX(0.34), inY(0.34), dir * 10), opacity: 1 },
          { offset: 0.28, transform: f(inX(0.55), inY(0.55), dir * -8), opacity: 1 },
          { offset: 0.36, transform: f(inX(0.78), inY(0.82), dir * 6), opacity: 1 },
          { offset: 0.43, transform: f(landX, landY, 0), opacity: 1 }, // touch down
          { offset: 0.72, transform: f(landX, landY, 0), opacity: 1 }, // rest on the flower
          { offset: 0.80, transform: f(landX + dir * 10, landY - 18, dir * -10), opacity: 1 }, // lift off
          { offset: 0.90, transform: f((landX + x2) / 2, H * 0.2 + bob(0.5), dir * 8), opacity: 1 },
          { offset: 1, transform: f(x2, H * 0.14, dir * 6), opacity: 0 }];

          const anim = el.animate(kf, { duration: 8200 + Math.random() * 2400, easing: "ease-in-out", fill: "forwards" });
          curAnim = anim;
          try {await anim.finished;} catch (e) {/* cancelled */}
        }
        setC(null);
        if (!alive) break;
        await wait(10000 + Math.random() * 13000); // quiet gap between visitors
      }
    }
    loop();
    return () => {alive = false;if (curAnim) curAnim.cancel();};
  }, [active]);

  return (
    <div ref={hostRef} style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none", overflow: "hidden" }}>
      {c &&
      <div ref={elRef} key={c.id} style={{ position: "absolute", left: 0, top: 0, opacity: 0,
        transform: "translate(-40px,-40px)", willChange: "transform, opacity" }}>
          <CritterArt type={c.type} u={u} />
        </div>
      }
    </div>);

}

function WidgetPreview({ scene, size, theme, wx = "小雨", temp = 22, big = false, live = false, sc, pick }) {
  const u = sc != null ? sc : big ? 1 : 0.34;
  const wide = size.id === "wide";
  const W = size.w * u,H = size.h * u;
  const sheen = <Sheen scale={u} radius={wide ? 26 : 24} onDark={scene === "garden"} />;
  const base = { width: W, height: H, borderRadius: (wide ? 26 : 24) * u, padding: 14 * u, position: "relative",
    overflow: "hidden", display: "flex",
    boxShadow: `0 ${10 * u}px ${28 * u}px rgba(60,45,25,0.13), 0 ${2 * u}px ${6 * u}px rgba(60,45,25,0.06)` };

  const plants = window.PLANTS;
  const hero = plants.find((p) => p.statusTone === "warn") || plants[0];
  const heroPid = window.cutKey(hero.photoId);

  // ===== 主角版 — one featured plant, big & glossy =====
  if (scene === "hero") {
    const warmBg = `linear-gradient(160deg, ${theme.warm[0]}, ${theme.warm[1]})`;
    if (wide) {
      return (
        <div style={{ ...base, background: warmBg, flexDirection: "row", alignItems: "stretch" }}>
          {wx === "晴" && <div style={{ position: "absolute", top: -34 * u, left: -24 * u, width: 110 * u, height: 110 * u,
            borderRadius: "50%", background: `radial-gradient(circle, ${theme.glow}, ${theme.glow}00)`, zIndex: 1 }}></div>}
          <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 3, display: "flex", flexDirection: "column", justifyContent: "center", gap: 5 * u }}>
            <div style={{ fontFamily: "var(--f-journal)", fontWeight: 700, fontSize: 21 * u, color: theme.ink, lineHeight: 1 }}>{hero.name}</div>
            <div style={{ fontSize: 11 * u, color: theme.sub, fontWeight: 600 }}>{hero.species} · {hero.status}</div>
            <div style={{ marginTop: 5 * u }}><WxChip wx={wx} temp={temp} scale={u} /></div>
          </div>
          <div style={{ flex: "0 0 auto", display: "flex", alignItems: "flex-end", justifyContent: "center", position: "relative", zIndex: 3, paddingLeft: 6 * u }}>
            <PlantCut pid={heroPid} h={H * 0.92} sway delay={0} />
          </div>
          <WeatherFX wx={wx} scale={u} radius={26} />
          <Critters u={u} active={live} />
          {sheen}
        </div>);

    }
    return (
      <div style={{ ...base, background: warmBg, flexDirection: "column" }}>
        {wx === "晴" && <div style={{ position: "absolute", top: -34 * u, right: -26 * u, width: 118 * u, height: 118 * u,
          borderRadius: "50%", background: `radial-gradient(circle, ${theme.glow}, ${theme.glow}00)`, zIndex: 1 }}></div>}
        <div style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 * u }}>
          <div>
            <div style={{ fontFamily: "var(--f-journal)", fontWeight: 700, fontSize: 24 * u, color: theme.ink, lineHeight: 1.05 }}>{hero.name}</div>
            <div style={{ fontSize: 14.5 * u, color: theme.sub, fontWeight: 600 }}>{hero.species} · {hero.status}</div>
          </div>
          <WxChip wx={wx} temp={temp} scale={u * 1.18} />
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "center", alignItems: "flex-end", position: "relative", zIndex: 3 }}>
          <PlantCut pid={heroPid} h={H * 0.6} sway delay={0} />
        </div>
        <WeatherFX wx={wx} scale={u} radius={24} />
        <Critters u={u} active={live} />
        {sheen}
      </div>);

  }

  // ===== 花园版 — sunny balcony shelf =====
  // square → 3 random plants (reshuffles on refresh) · wide → all of them
  const balconyBg = `linear-gradient(180deg, #eef4f8 0%, ${theme.light[0]} 46%, ${theme.warm[1]} 100%)`;
  const shown = wide ?
  plants :
  pick && pick.length ? pick.map((id) => plants.find((p) => p.id === id)).filter(Boolean) : plants.slice(0, 3);
  const plantH = (wide ? 0.42 : 0.355) * H;
  const shelfH = 8 * u;
  const spaceBelow = (wide ? 12 : 16) * u; // gap beneath the shelf
  const seat = spaceBelow + shelfH - 4 * u; // pot base rests on the shelf top surface

  // ===== 花园版 · 正方形 — bold single "今日出镜" feature: one plant talks to you =====
  if (!wide) {
    const star = shown[0] || hero;
    const tag = (star.tagsOn && star.tagsOn[0]) || star.mood || "";
    const raw = (star.voice || star.opener || "今天，也悄悄陪着你。").replace(/（.*?）/g, "");
    const segs = raw.split(/(?<=[。！？])/).map(s => s.trim()).filter(Boolean);
    const line = segs.slice(0, 2).join("") || raw;
    const starFrameH = H * 0.5;
    const starH = starFrameH * widgetPlantScale(star.photoId);
    return (
      <div style={{ ...base, background: balconyBg, flexDirection: "column", padding: 14, overflow: "hidden" }}>
        {wx === "晴" && (
          <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
            background: `radial-gradient(120% 95% at 92% -6%, ${theme.glow}cc 0%, ${theme.glow}55 24%, ${theme.glow}1a 45%, transparent 66%)` }}></div>
        )}
        {/* header — name on top + weather */}
        <div style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <span style={{ fontFamily: "var(--f-journal)", fontWeight: 700, fontSize: "18px", color: theme.ink, lineHeight: 1 }}>{star.name}</span>
          <WxChip wx={wx} temp={temp} scale={u} />
        </div>

        {/* the plant speaking to you — 心灵鸡汤 in its own voice, given room to breathe */}
        <div style={{ position: "relative", zIndex: 3, marginTop: 8, maxWidth: "68%" }}>
          <div style={{ fontFamily: "var(--f-journal)", fontSize: "11.5px", lineHeight: 1.5, color: theme.ink, opacity: 0.92,
            display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            “{line}”
          </div>
        </div>

        {/* mini shelf under the star plant (right side) */}
        <div style={{ position: "absolute", right: 8 * u, bottom: spaceBelow, width: starFrameH * 0.7, height: shelfH, zIndex: 2,
          background: "linear-gradient(180deg, #e7c79e 0%, #d3a468 55%, #c0934f 100%)", borderRadius: 1.5 * u,
          boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.5), 0 3px 7px rgba(120,80,40,0.18)" }}></div>
        <div style={{ position: "absolute", right: 8 * u, bottom: seat, width: starFrameH * 0.7, zIndex: 3,
          display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <span style={{ position: "absolute", bottom: 1 * u, left: "50%", width: starH * 0.42, height: starH * 0.06,
            transform: "translateX(-52%)", borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(60,38,16,0.42), rgba(60,38,16,0.14) 55%, transparent 74%)",
            filter: `blur(${1.6 * u}px)`, zIndex: 0, pointerEvents: "none" }}></span>
          <PlantCut pid={window.cutKey(star.photoId)} h={starH} sway delay={0} />
        </div>

        <WeatherFX wx={wx} scale={u} radius={24} />
        <Critters u={u} active={live} />
        {sheen}
      </div>);

  }

  return (
    <div style={{ ...base, background: balconyBg, flexDirection: "column", padding: 14 }}>
      {/* radiant sun — only on clear days (晴), with warm rays like the home */}
      {wx === "晴" && (
        <>
          {/* warm sunlight flooding the whole top-right corner */}
          <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
            background: `radial-gradient(120% 95% at 92% -6%, ${theme.glow}cc 0%, ${theme.glow}55 24%, ${theme.glow}1a 45%, transparent 66%)` }}></div>
          {/* sun + beams share one center, so light radiates from the sun's middle */}
          <div style={{ position: "absolute", top: 13 * u, right: 19 * u, width: 0, height: 0, zIndex: 1, pointerEvents: "none" }}>
            {/* diffuse beams, originating at center (0,0) */}
            <svg viewBox="-100 -100 200 200" style={{ position: "absolute", left: "50%", top: "50%",
              width: 230 * u, height: 230 * u, transform: "translate(-50%,-50%)",
              opacity: 0.4, filter: `blur(${1.6 * u}px)`, overflow: "visible" }}>
              <defs>
                <linearGradient id={`beam-${theme.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={theme.glow} stopOpacity="0.7" />
                  <stop offset="1" stopColor={theme.glow} stopOpacity="0" />
                </linearGradient>
              </defs>
              {[-34, -12, 12, 34].map((deg, k) => (
                <polygon key={k} points="-6,0 6,0 9,104 -9,104" fill={`url(#beam-${theme.id})`}
                  transform={`rotate(${deg + 180})`} />
              ))}
            </svg>
            {/* soft glowing sun disc */}
            <div style={{ position: "absolute", left: "50%", top: "50%", width: 86 * u, height: 86 * u,
              transform: "translate(-50%,-50%)", borderRadius: "50%",
              background: `radial-gradient(circle, #fff8e6 0%, ${theme.glow} 38%, ${theme.glow}00 70%)`,
              filter: `blur(${3 * u}px)` }}></div>
          </div>
        </>
      )}
      <div style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 * u }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--f-journal)", fontWeight: 700, fontSize: "15px", color: theme.ink }}>我的小花园 · 全家福</div>
          <div style={{ fontSize: "10.5px", color: theme.sub, fontWeight: 600 }}>{plants.length} 盆 · 都还活着 🌿</div>
        </div>
        <WxChip wx={wx} temp={temp} scale={u} />
      </div>

      {/* wooden windowsill — raised off the bottom */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: spaceBelow, height: shelfH, zIndex: 2,
        background: "linear-gradient(180deg, #e7c79e 0%, #d3a468 55%, #c0934f 100%)",
        boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.5), 0 3px 7px rgba(120,80,40,0.18)" }}>
        {/* front edge highlight */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 1.5 * u, background: "rgba(255,245,225,0.55)" }}></div>
      </div>

      {/* plants seated on the shelf — pot base rests on the surface, baked contact shadow lands directly under each pot */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: seat, zIndex: 3,
        display: "flex", alignItems: "flex-end",
        justifyContent: wide ? "space-around" : "space-evenly", gap: wide ? 2 * u : 0,
        paddingInline: wide ? 12 * u : 12 * u }}>
        {shown.map((pl, i) => {
          const h = plantH * (i % 2 ? 0.94 : 1) * widgetPlantScale(pl.photoId);
          return (
            <span key={pl.id} style={{ position: "relative", flex: 1, minWidth: 0, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              {/* single clean contact shadow at the pot/shelf junction — soft, wide, faint */}
              <span style={{ position: "absolute", bottom: 1 * u, left: "50%",
                width: h * 0.6, height: h * 0.087,
                transform: "translateX(-52%)", borderRadius: "50%",
                background: "radial-gradient(ellipse, rgba(60,38,16,0.42), rgba(60,38,16,0.14) 55%, transparent 74%)",
                maskImage: "linear-gradient(180deg, transparent 0%, #000 100%)",
                WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 100%)",
                filter: `blur(${1.6 * u}px)`, zIndex: 0, pointerEvents: "none" }}></span>
              <PlantCut pid={window.cutKey(pl.photoId)} h={h} sway delay={0} />
            </span>);

        })}
      </div>

      <WeatherFX wx={wx} scale={u} radius={wide ? 26 : 24} />
      <Critters u={u} active={live} />
      {sheen}
    </div>);

}

function WidgetScreen({ go, t = {} }) {
  const sizes = window.WIDGET_SIZES;
  const [sizeIdx, setSizeIdx] = useState(0); // 0 square · 1 wide
  const [scene, setScene] = useState("garden"); // garden only
  const [themeId, setThemeId] = useState("pine"); // accent color
  const theme = WTHEMES.find((x) => x.id === themeId) || WTHEMES[0];
  const wx = t.weather || "小雨";
  const temp = wx === "晴" ? 28 : wx === "多云" ? 25 : 22;
  // square 花园版 shows 3 random plants — reshuffles on each refresh (remount)
  const [gardenPick] = useState(() => {
    const ids = window.PLANTS.map((p) => p.id);
    for (let i = ids.length - 1; i > 0; i--) {const j = Math.floor(Math.random() * (i + 1));[ids[i], ids[j]] = [ids[j], ids[i]];}
    return ids.slice(0, 3);
  });
  const trackRef = React.useRef(null);
  const cur = window.WIDGETS.find((w) => w.id === scene);
  const size = sizes[sizeIdx];

  function onScroll() {
    const el = trackRef.current;if (!el || !el.children.length) return;
    const step = el.children[0].offsetWidth + 18;
    const i = Math.round(el.scrollLeft / step);
    if (i !== sizeIdx && i >= 0 && i < sizes.length) setSizeIdx(i);
  }
  function goSize(i) {
    const el = trackRef.current;
    if (el && el.children.length) el.scrollTo({ left: i * (el.children[0].offsetWidth + 18), behavior: "smooth" });
    setSizeIdx(i);
  }

  return (
    <div className="noscroll" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      background: "var(--paper)", overflowY: "auto", overflowX: "hidden" }}>
      {/* nav */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "54px 22px 0", flexShrink: 0 }}>
        <div>
          <span className="mast" style={{ fontSize: 22 }}>小组件样式</span>
          <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 2 }}>把小花园放上桌面，随时看看它们</div>
        </div>
        <button onClick={() => go("diary")} style={{ fontSize: 15, fontWeight: 600, color: "var(--green-deep)", paddingTop: 4 }}>完成</button>
      </div>

      {/* ===== size pager (正方形 ↔ 长方形), swipe + dots ===== */}
      <div style={{ margin: "16px 16px 0", position: "relative", flexShrink: 0, borderRadius: 26,
        background: `linear-gradient(180deg, #efe7d8 0%, #e6dbc7 60%, #ddd0b7 100%)`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -22px 40px rgba(90,70,40,0.10), 0 1px 3px rgba(60,50,30,0.06)",
        paddingBottom: 4, overflow: "hidden", transition: "background .35s ease" }}>
        {/* faint theme-tinted wash from the top so it still echoes the chosen color, without flooding */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(120% 80% at 50% -10%, ${theme.accent}1f 0%, transparent 60%)`, transition: "background .35s ease" }}></div>
        {/* faint dotted texture */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.4,
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(120,90,50,0.10) 0 1px, transparent 1.6px), radial-gradient(circle at 72% 64%, rgba(90,65,35,0.08) 0 1px, transparent 1.6px)`,
          backgroundSize: "13px 13px, 17px 17px" }}></div>
        <div ref={trackRef} onScroll={onScroll} className="noscroll"
        style={{ display: "flex", gap: 20, overflowX: "auto", scrollSnapType: "x mandatory",
          scrollPaddingInline: "12%", paddingInline: "12%", paddingBlock: "18px 6px", WebkitOverflowScrolling: "touch", position: "relative" }}>
          {sizes.map((sz) =>
          <div key={sz.id} style={{ flex: "0 0 auto", scrollSnapAlign: "center",
            display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
              <div className="rise" key={scene + themeId + sz.id}>
                <WidgetPreview scene={scene} size={sz} theme={theme} wx={wx} temp={temp} pick={gardenPick} live sc={sz.id === "wide" ? 1.0 : 0.655} />
              </div>
            </div>
          )}
        </div>
        {/* dots + size labels */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "center", marginTop: 10, paddingBottom: 12 }}>
          {sizes.map((sz, i) => {
            const on = i === sizeIdx;
            return (
              <button key={sz.id} onClick={() => goSize(i)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 4px" }}>
                <span style={{ width: on ? 16 : 7, height: 7, borderRadius: 999,
                  background: on ? theme.accent : "rgba(40,30,15,0.18)", transition: "all .2s" }}></span>
                <span style={{ fontSize: 11.5, fontWeight: on ? 700 : 500, fontFamily: "var(--f-journal)",
                  color: on ? theme.accent : "var(--ink-faint)" }}>{sz.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- 配色 ---- */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "24px 24px 0", flexShrink: 0 }}>
        <span className="kicker">配色</span>
        <span style={{ flex: 1, height: 1, background: "var(--hairline)" }}></span>
        <span style={{ fontSize: 12, color: "var(--ink-faint)", fontFamily: "var(--f-journal)" }}>随季节换个心情</span>
      </div>
      <div className="noscroll" style={{ display: "flex", gap: 15, padding: "16px 24px 40px", justifyContent: "flex-start", flexShrink: 0, overflowX: "auto" }}>
        {WTHEMES.map((tm) => {
          const on = themeId === tm.id;
          // swatch mirrors the ACTUAL garden background (airy balcony gradient) so its
          // lightness/saturation matches what you'll see on the widget
          const bg = `linear-gradient(180deg, #eef4f8 0%, ${tm.light[0]} 46%, ${tm.warm[1]} 100%)`;
          return (
            <button key={tm.id} onClick={() => setThemeId(tm.id)} aria-label={tm.id}
            style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
              <span style={{ position: "relative", width: 52, height: 52, borderRadius: 15, background: bg,
                border: on ? `2px solid ${tm.accent}` : "1px solid rgba(40,30,15,0.12)",
                boxShadow: on ? `0 5px 13px ${tm.accent}44` : "0 2px 6px rgba(40,30,15,0.10)",
                transition: "transform .16s ease", transform: on ? "scale(1.05)" : "scale(1)",
                display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
                {/* a little accent strip at the base = the shelf/accent tone */}
                <span style={{ width: "100%", height: 9, background: tm.accent, opacity: 0.9 }}></span>
                {on && <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: tm.accent,
                    display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }}>
                    <Icon name="check" size={14} color="#fff" stroke={3} />
                  </span>
                </span>}
              </span>
            </button>);

        })}
      </div>
    </div>);

}
window.WidgetScreen = WidgetScreen;
