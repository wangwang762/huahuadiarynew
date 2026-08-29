/* ============================================================
   花花日记本 · shared components + line icon set
   ============================================================ */
const { useState, useEffect, useRef } = React;

// ---- line icon set (rounded caps, single colour — DDMC style) ----
function Icon({ name, size = 24, color = "currentColor", stroke = 1.8, fill = false, style = {} }) {
  const p = { fill: "none", stroke: color, strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    home: <><path d="M3 11.5 12 4l9 7.5" {...p}/><path d="M5.5 10v9.5h13V10" {...p}/></>,
    book: <><path d="M5 4.5h11a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2z" {...p}/><path d="M9 4.5V19" {...p}/></>,
    grid: <><rect x="4" y="4" width="7" height="7" rx="1.6" {...p}/><rect x="13" y="4" width="7" height="7" rx="1.6" {...p}/><rect x="4" y="13" width="7" height="7" rx="1.6" {...p}/><rect x="13" y="13" width="7" height="7" rx="1.6" {...p}/></>,
    cactus: <><path d="M12 21v-6" {...p}/><path d="M12 15c0-5 0-9 0-9" {...p}/><path d="M12 12c0 1.6-1.4 3-3.2 3H8c0-2.2 0-4.5 2-4.5" {...p}/><path d="M12 13c0 1.6 1.4 3 3.2 3H16c0-3 0-5.5-2-5.5" {...p}/><path d="M9 21h6" {...p}/></>,
    chevR: <path d="M9 5l7 7-7 7" {...p}/>,
    chevL: <path d="M15 5l-7 7 7 7" {...p}/>,
    arrowR: <><path d="M4 12h15" {...p}/><path d="M13 6l6 6-6 6" {...p}/></>,
    send: <><path d="M4.5 12 20 4.5 14 20l-3.5-6.5L4.5 12Z" {...p}/></>,
    camera: <><rect x="3.4" y="7.2" width="17.2" height="12" rx="2.8" {...p}/><path d="M8.8 7.2 10 5.3h4l1.2 1.9" {...p}/><circle cx="12" cy="13.3" r="3" {...p}/><circle cx="17" cy="10.2" r="0.7" fill={color} stroke="none"/></>,
    drop: <><path d="M12 3.4c3.3 3.9 5.2 6.7 5.2 9.4a5.2 5.2 0 1 1-10.4 0c0-2.7 1.9-5.5 5.2-9.4Z" {...p}/><path d="M9.2 13.8a2.8 2.8 0 0 0 2 2.4" {...p}/></>,
    sun: <><circle cx="12" cy="12" r="4" {...p}/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" {...p}/></>,
    leaf: <><path d="M5 19.4 7.3 17" {...p}/><path d="M7.3 17C6.2 10.5 11.2 5.8 18.6 6c.4 7.2-4.6 12.3-11.3 11Z" {...p}/><path d="M9.3 14.7c2-1.9 4.3-3.2 6.9-3.9" {...p}/></>,
    doctor: <><path d="M6 4.2v4.3a4 4 0 0 0 8 0V4.2" {...p}/><path d="M5.4 4.2H6.4M13.6 4.2h1" {...p}/><path d="M10 12.4v1.1a3.6 3.6 0 0 0 7.2 0v-.6" {...p}/><circle cx="17.6" cy="11" r="1.9" {...p}/></>,
    share: <><circle cx="6.5" cy="12" r="2.2" {...p}/><circle cx="17" cy="6.5" r="2.2" {...p}/><circle cx="17" cy="17.5" r="2.2" {...p}/><path d="M8.5 11 15 7.5M8.5 13l6.5 3.5" {...p}/></>,
    plus: <><path d="M12 5v14M5 12h14" {...p}/></>,
    check: <path d="M5 12.5 10 17.5 19 6.5" {...p}/>,
    edit: <><path d="M14.5 5.5 18.5 9.5 8 20H4v-4z" {...p}/><path d="M13 7 17 11" {...p}/></>,
    close: <path d="M6 6l12 12M18 6 6 18" {...p}/>,
    heart: fill
      ? <path d="M12 19.6C7 16.2 4.3 13.3 4.3 9.9A3.9 3.9 0 0 1 12 7.3a3.9 3.9 0 0 1 7.7 2.6c0 3.4-2.7 6.3-7.7 9.7Z" fill={color} stroke="none"/>
      : <path d="M12 19.6C7 16.2 4.3 13.3 4.3 9.9A3.9 3.9 0 0 1 12 7.3a3.9 3.9 0 0 1 7.7 2.6c0 3.4-2.7 6.3-7.7 9.7Z" {...p}/>,
    bell: <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" {...p}/><path d="M10 19a2 2 0 0 0 4 0" {...p}/></>,
    cloudRain: <><path d="M7 15a4 4 0 0 1 .5-8 5 5 0 0 1 9.5 1.2A3.3 3.3 0 0 1 17 15Z" {...p}/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2" {...p}/></>,
    cloud: <path d="M7 18a4.2 4.2 0 0 1 .5-8.4 5.2 5.2 0 0 1 9.9 1.3A3.5 3.5 0 0 1 17 18Z" {...p}/>,
    moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" {...p}/>,
    clock: <><circle cx="12" cy="12" r="8" {...p}/><path d="M12 8v4.5l3 1.6" {...p}/></>,
    pin: <><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" {...p}/><circle cx="12" cy="10" r="2.5" {...p}/></>,
    mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" {...p}/><path d="m5 8 7 5 7-5" {...p}/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
window.Icon = Icon;

// ---- star row ----
function Stars({ n = 5, size = 15, color = "var(--gold)" }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <path d="M12 3.5 14.6 9l6 .7-4.4 4.1 1.2 5.9L12 16.8 6.6 19.7l1.2-5.9L3.4 9.7l6-.7z"
            fill={i <= n ? color : "rgba(0,0,0,0.10)"} />
        </svg>
      ))}
    </div>
  );
}
window.Stars = Stars;

// ---- render journal copy: array of strings | {hl} | {grn} ----
function Journal({ parts, style = {} }) {
  return (
    <span style={style}>
      {parts.map((seg, i) =>
        typeof seg === "string"
          ? <span key={i}>{seg}</span>
          : seg.grn
            ? <em key={i} className="grn" style={{ color: "var(--green-deep)", fontStyle: "normal" }}>{seg.grn}</em>
            : <em key={i} style={{ color: "var(--coral)", fontStyle: "normal" }}>{seg.hl}</em>
      )}
    </span>
  );
}
window.Journal = Journal;

// ---- bottom navigation (warm glass) ----
function BottomNav({ tab, onTab }) {
  const items = [
    { id: "diary", label: "日记", icon: "book" },
    { id: "doctor", label: "花大夫", icon: "doctor" },
    { id: "garden", label: "花园", icon: "leaf" },
  ];
  return (
    <div className="app-bottom-nav" style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 40, paddingTop: 22,
      display: "flex", justifyContent: "center", pointerEvents: "none",
      background: "linear-gradient(180deg, rgba(241,234,219,0) 0%, var(--paper) 72%)" }}>
      <div style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 4,
        background: "var(--paper-card)", border: "1px solid var(--hairline)", borderRadius: 999,
        padding: 5, boxShadow: "var(--sh-2)" }}>
        {items.map(it => {
          const active = tab === it.id;
          return (
            <button key={it.id} onClick={() => onTab(it.id)}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: active ? "9px 16px" : "9px 13px",
                borderRadius: 999, background: active ? "var(--green)" : "transparent", transition: "all .2s ease" }}>
              <Icon name={it.icon} size={20} color={active ? "#fff" : "var(--ink-faint)"} stroke={active ? 2 : 1.7} />
              {active && <span style={{ fontSize: 13.5, fontWeight: 600, color: "#fff", fontFamily: "var(--f-ui)" }}>{it.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
window.BottomNav = BottomNav;

// ---- chat message bubble ----
function Bubble({ from, children, avatar, bb }) {
  const me = from === "me";
  const themBg = (bb && bb.bg) || "var(--green-bubble)";
  const themBorder = (bb && bb.border) || "rgba(0,160,56,0.12)";
  return (
    <div style={{ display: "flex", gap: 9, justifyContent: me ? "flex-end" : "flex-start",
      alignItems: "flex-start", margin: "10px 0" }}>
      {!me && <div className="chat-avatar-slot" style={{ flex: "0 0 auto", alignSelf: "flex-start", display: "flex" }}>{avatar}</div>}
      <div className={me ? "chat-bubble chat-bubble-me" : "chat-bubble chat-bubble-them"} style={{
        position: "relative",
        maxWidth: "74%",
        background: me ? "var(--green-grad)" : themBg,
        color: me ? "#fff" : "var(--ink)",
        fontFamily: me ? "var(--f-ui)" : "var(--f-journal)",
        fontSize: me ? 15 : 16, lineHeight: 1.55,
        padding: me ? "11px 15px" : "12px 16px",
        borderRadius: 20,
        borderBottomRightRadius: me ? 6 : 20,
        boxShadow: "var(--sh-1)",
        border: me ? "none" : `1px solid ${themBorder}`,
        whiteSpace: "pre-wrap",
      }}>
        {!me && (
          <span aria-hidden="true" style={{ position: "absolute", left: -9, top: 11, width: 0, height: 0,
            borderTop: "8px solid transparent", borderBottom: "8px solid transparent",
            borderRight: `9px solid ${themBorder}` }}>
            <span style={{ position: "absolute", left: 2, top: -7, width: 0, height: 0,
              borderTop: "7px solid transparent", borderBottom: "7px solid transparent",
              borderRight: `8px solid ${themBg}` }}></span>
          </span>
        )}
        {children}
      </div>
    </div>
  );
}
window.Bubble = Bubble;

// ---- typing indicator ----
function Typing({ avatar }) {
  return (
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start", margin: "10px 0" }}>
      <div className="chat-avatar-slot" style={{ flex: "0 0 auto", alignSelf: "flex-start", display: "flex" }}>{avatar}</div>
      <div className="chat-bubble chat-bubble-them" style={{ position: "relative", background: "var(--green-bubble)", padding: "13px 16px", borderRadius: 20,
        display: "flex", gap: 5, border: "1px solid rgba(0,160,56,0.12)" }}>
        <span aria-hidden="true" style={{ position: "absolute", left: -9, top: 11, width: 0, height: 0,
          borderTop: "8px solid transparent", borderBottom: "8px solid transparent",
          borderRight: "9px solid rgba(0,160,56,0.12)" }}>
          <span style={{ position: "absolute", left: 2, top: -7, width: 0, height: 0,
            borderTop: "7px solid transparent", borderBottom: "7px solid transparent",
            borderRight: "8px solid var(--green-bubble)" }}></span>
        </span>
        <span className="dot"></span><span className="dot"></span><span className="dot"></span>
      </div>
    </div>
  );
}
window.Typing = Typing;

// ---- 小刺 avatar (cactus in a pot, drawn) ----
function CactusAvatar({ size = 38 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "radial-gradient(120% 120% at 30% 25%, #E7F1E4, #CFE6CB)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "inset 0 0 0 1px rgba(0,160,56,0.18)" }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24">
        <g fill="none" stroke="#0B7A37" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20v-8"/>
          <path d="M12 15.5c0-2.2-1.6-3.4-3.4-3.4H8.2c0 2 .1 4 2.2 4"/>
          <path d="M12 13.5c0 1.8 1.5 3 3.2 3H16c0-2.4-.1-4.4-2-4.4"/>
        </g>
        <path d="M8.6 20h6.8l-.5 1.6H9.1z" fill="#C98A3C"/>
      </svg>
    </div>
  );
}
window.CactusAvatar = CactusAvatar;

// ---- plant silhouettes per species (simple line iconography) ----
function PlantSprite({ shape = "cactus", color = "#0B7A37", pot = "#C98A3C", h = 70, sway = false, delay = 0 }) {
  const w = h * 0.78;
  const g = { fill: "none", stroke: color, strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" };
  const bodies = {
    cactus: <g {...g}>
      <path d="M20 64V30"/>
      <path d="M20 46c0-8-6-12-12-12 0 8 .4 14 8 14"/>
      <path d="M20 40c0 7 6 11 12 11 0-9-.4-15-8-15"/>
    </g>,
    succulent: <g {...g}>
      <path d="M20 64v-18"/>
      <path d="M20 46c-3-7-9-9-13-7 1 6 5 11 13 9"/>
      <path d="M20 46c3-7 9-9 13-7-1 6-5 11-13 9"/>
      <path d="M20 48c-1-8-4-13-1-18 4 4 5 12 1 18"/>
      <path d="M20 48c1-8 4-13 1-18"/>
    </g>,
    pothos: <g {...g}>
      <path d="M20 64V40c0-7 5-11 11-11"/>
      <path d="M20 52c-6 1-11-2-12-8 6-1 11 2 12 8"/>
      <path d="M22 44c5-2 10-6 10-12-5 1-9 5-10 12"/>
      <path d="M18 40c-5-1-9-5-9-11 5 1 8 5 9 11"/>
    </g>,
    monstera: <g {...g}>
      <path d="M20 64V42"/>
      <path d="M20 42c-9 0-14-6-14-15 9 0 14 5 14 15Z"/>
      <path d="M11 31h3M11 36h5M14 41h3" />
      <path d="M20 40c8 0 13-5 13-13-8 0-13 4-13 13Z"/>
    </g>,
    sunflower: <g {...g}>
      <path d="M20 64V34"/>
      <circle cx="20" cy="22" r="6"/>
      <path d="M20 8v6M20 30v6M6 22h6M28 22h6M11 13l4 4M29 13l-4 4M11 31l4-4M29 31l-4-4"/>
      <path d="M16 50c-5 0-8-3-8-7 4 0 8 2 8 7Z"/>
    </g>,
  };
  return (
    <div style={{ width: w, height: h, transformOrigin: "bottom center",
      animation: sway ? `sway 3.6s ease-in-out ${delay}s infinite alternate` : "none" }}>
      <svg width={w} height={h} viewBox="0 0 40 72">
        {bodies[shape] || bodies.cactus}
        <path d="M11 64h18l-2.4 8H13.4z" fill={pot}/>
        <path d="M10 62h20v3H10z" fill={pot} opacity="0.85"/>
      </svg>
    </div>
  );
}
window.PlantSprite = PlantSprite;

// ---- round avatar for any flower — real plant cutout on its soul-color tint ----
function PlantAvatar({ plant, size = 38 }) {
  const custom = String(plant.avatarData || "");
  const cut = window.cutFor ? window.cutFor(plant.photoId) : "";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
      background: `radial-gradient(120% 120% at 30% 22%, #fff, ${plant.soft})`,
      boxShadow: `inset 0 0 0 1px ${plant.accent}30`,
      display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      {custom
        ? <img src={custom} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        : cut
        ? <img src={cut} alt="" style={{ height: size * 0.92, width: "auto", display: "block" }} />
        : <PlantSprite shape={plant.shape} color={plant.deep} pot={plant.pot} h={size * 0.66} />}
    </div>
  );
}
window.PlantAvatar = PlantAvatar;

// ---- timeline marker — a warm "ink stamp" glyph on a soft tinted disc (no hard ring) ----
function TimelineMark({ kind, type, plant, size = 30 }) {
  const p = plant;
  const isDx = kind === "diagnosis";
  const disc = isDx ? p.deep : p.bubble;        // diagnosis = solid soul-deep; record = soft tint
  const fg = isDx ? "#fff" : p.deep;
  const g = size * 0.5;                          // glyph box
  let glyph;
  if (isDx) {
    // rounded medical cross
    glyph = <path d="M12 5.5v13M5.5 12h13" fill="none" stroke={fg} strokeWidth="3.4" strokeLinecap="round"/>;
  } else if (type === "water") {
    glyph = <path d="M12 3.6c3.1 3.8 4.9 6.4 4.9 9a4.9 4.9 0 1 1-9.8 0c0-2.6 1.8-5.2 4.9-9Z" fill={fg}/>;
  } else if (type === "photo") {
    glyph = <g><path d="M3.8 7.6h3.0l1.1-1.9h6.2l1.1 1.9h3.0a1.4 1.4 0 0 1 1.4 1.4v8.6a1.4 1.4 0 0 1-1.4 1.4H3.8a1.4 1.4 0 0 1-1.4-1.4V9a1.4 1.4 0 0 1 1.4-1.4Z" fill={fg}/><circle cx="12" cy="13.2" r="3.1" fill={disc}/><circle cx="12" cy="13.2" r="1.5" fill={fg}/></g>;
  } else if (type === "born") {
    glyph = <path d="M12 19C7.4 15.8 5 13.1 5 10A3.6 3.6 0 0 1 12 7.6 3.6 3.6 0 0 1 19 10c0 3.1-2.4 5.8-7 9Z" fill={fg}/>;
  } else {
    // leaf
    glyph = <g><path d="M6.6 18.4C5.7 11.5 10.6 6.8 17.8 7c.4 6.8-4.4 11.6-11.2 11.4Z" fill={fg}/><path d="M6.6 18.4C9 16 11.4 14 14.6 12.9" fill="none" stroke={disc} strokeWidth="1.3" strokeLinecap="round"/></g>;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: disc, boxShadow: `0 0 0 4px var(--paper)${isDx ? "" : `, inset 0 0 0 1px ${p.accent}33`}`,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={g} height={g} viewBox="0 0 24 24" aria-hidden="true">{glyph}</svg>
    </div>
  );
}
window.TimelineMark = TimelineMark;

// ---- 花大夫 clinic emblem — leaf + pulse line, editorial pine ----
function DoctorAvatar({ size = 46 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, position: "relative",
      background: "radial-gradient(120% 120% at 32% 24%, #3a8a64, #1d4a34)",
      boxShadow: "0 5px 14px rgba(20,60,40,0.32), inset 0 0 0 1px rgba(255,255,255,0.14)",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" aria-hidden="true">
        {/* leaf */}
        <path d="M19 5c0 7-4.5 11.5-11 11.2C7.7 9.8 12 5.4 19 5Z"
          fill="rgba(255,255,255,0.94)" />
        <path d="M9 15.4C11.6 12.4 14.4 10.6 17 9.6" stroke="#2f8064" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        {/* pulse line across the leaf */}
        <path d="M5.5 12.4h3l1.4-3 1.8 5 1.3-2.4h2.3"
          fill="none" stroke="#E6E24F" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
window.DoctorAvatar = DoctorAvatar;

// ---- status dot ----
function StatusDot({ tone = "good" }) {
  const c = tone === "warn" ? "var(--terra)" : "var(--green)";
  return <span style={{ width: 7, height: 7, borderRadius: "50%", background: c,
    boxShadow: `0 0 0 3px ${tone === "warn" ? "rgba(201,138,60,0.18)" : "rgba(0,183,64,0.15)"}` }}></span>;
}
window.StatusDot = StatusDot;
