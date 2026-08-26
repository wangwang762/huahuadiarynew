/* ============================================================
   花花日记本 · 对话 — 与植物 / 花大夫
   ============================================================ */

// shared chat engine
function ChatBase({ go, title, subtitle, headerAvatar, systemPrompt, opener,
  bubbleFrom, quicks, accentDoctor = false, contextBar, onFirstReply, carePlanName,
  avatar: avatarProp, bubbleBg, bubbleBorder, sendGrad, placeholder, onFinishDx, finishLabel,
  complete }) {
  const [convo, setConvo] = useState([]);       // {role:'user'|'assistant', content}
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [showQuicks, setShowQuicks] = useState(true);
  const [finished, setFinished] = useState(null);  // diagnosis summary, set when user ends consult
  const [serviceError, setServiceError] = useState("");
  const scrollRef = useRef(null);
  const firedFirst = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight + 999;
  }, [convo, typing]);

  async function send(text) {
    const msg = (text ?? draft).trim();
    if (!msg || typing) return;
    setDraft("");
    setShowQuicks(false);
    const next = [...convo, { role: "user", content: msg }];
    setConvo(next);
    setTyping(true);
    setServiceError("");

    const messages = [
      { role: "user", content: systemPrompt },
      { role: "assistant", content: opener },
      ...next,
    ];
    let reply = "";
    try {
      if (complete) reply = await complete(next);
      else if (window.claude && typeof window.claude.complete === "function") reply = await window.claude.complete({ messages });
      else throw new Error("对话服务尚未接通");
    } catch (e) {
      setTyping(false);
      if (accentDoctor) {
        setServiceError(e && e.message ? e.message : "花大夫暂时没有接通，请稍后重试");
        return;
      }
      reply = "（信号不好…）等网络恢复了再聊吧。";
    }
    reply = (reply || "").trim() || "……";
    setTyping(false);
    setConvo(c => [...c, { role: "assistant", content: reply }]);
    if (!firedFirst.current && onFirstReply) { firedFirst.current = true; onFirstReply(); }
  }

  const docAv = <DoctorAvatar size={36} />;
  const avatar = accentDoctor ? docAv : (avatarProp || <CactusAvatar size={36} />);
  const bb = { bg: bubbleBg, border: bubbleBorder };

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      background: accentDoctor ? "#F3EFE6" : "var(--paper)" }}>

      {/* header */}
      <div style={{ paddingTop: 54, paddingBottom: 12, background: "var(--glass-strong)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center",
        padding: "54px 14px 12px", gap: 10, zIndex: 10 }}>
        <button onClick={() => go("back")} style={{ padding: 4, display: "flex" }}>
          <Icon name="chevL" size={26} color="var(--ink-soft)" />
        </button>
        {headerAvatar}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 17, fontFamily: "var(--f-journal)", color: "var(--ink)" }}>{title}</div>
          <div style={{ fontSize: 12, color: accentDoctor ? "var(--green-deep)" : "var(--ink-faint)" }}>{subtitle}</div>
        </div>
      </div>

      {/* context bar (doctor) */}
      {contextBar}

      {/* messages */}
      <div ref={scrollRef} className="noscroll" style={{ flex: 1, overflowY: "auto", padding: "12px 16px 8px" }}>
        {/* opener */}
        <Bubble from="them" avatar={avatar} bb={bb}>{opener}</Bubble>
        {convo.map((m, i) => (
          <Bubble key={i} from={m.role === "user" ? "me" : "them"} avatar={avatar} bb={bb}>{m.content}</Bubble>
        ))}
        {typing && <Typing avatar={avatar} />}
        {serviceError && <div role="alert" style={{ margin: "6px 0 12px 45px", padding: "10px 12px",
          borderRadius: 12, background: "rgba(200,85,60,.08)", border: "1px solid rgba(200,85,60,.16)",
          color: "var(--coral)", fontSize: 12.5, lineHeight: 1.5 }}>{serviceError}。这次没有生成诊断建议。</div>}
        {accentDoctor && onFinishDx && convo.some(m => m.role === "assistant") && !typing && !finished && (
          <div style={{ display: "flex", justifyContent: "center", margin: "6px 0 12px" }}>
            <button onClick={async () => {
                const conclusion = [...convo].reverse().find(m => m.role === "assistant")?.content || opener;
                setServiceError("");
                try {
                  const sum = await onFinishDx(conclusion, [{ role: "assistant", content: opener }, ...convo]);
                  if (sum) setFinished(sum);
                } catch (e) {
                  setServiceError(e && e.message ? e.message : "病历没有整理成功，请稍后重试");
                }
              }}
              style={{ height: 36, padding: "0 16px", fontSize: 13, color: "var(--green-deep)", fontWeight: 600,
                background: "var(--green-soft)", border: "1.5px solid var(--green)", borderRadius: "var(--r-pill)",
                display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--f-journal)" }}>
              <Icon name="check" size={14} color="var(--green-deep)" stroke={2.4} /> {finishLabel || "结束问诊 · 记入日记"}
            </button>
          </div>
        )}
        {finished && <DiagnosisSummaryCard summary={finished} onView={() => go("home")} />}
      </div>

      {/* quick replies */}
      {showQuicks && !finished && (
        <div className="noscroll" style={{ display: "flex", gap: 8, padding: "0 16px 10px", overflowX: "auto" }}>
          {quicks.map((q, i) => (
            <button key={i} onClick={() => send(q)}
              style={{ flexShrink: 0, padding: "9px 15px", borderRadius: "var(--r-pill)", whiteSpace: "nowrap",
                background: "rgba(255,255,255,0.7)", border: "1px solid var(--hairline)",
                fontSize: 14, color: "var(--ink-soft)", fontFamily: "var(--f-journal)" }}>{q}</button>
          ))}
        </div>
      )}

      {/* input — hidden once consult is wrapped up */}
      {!finished && (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px 30px",
        background: "var(--glass-strong)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        borderTop: "1px solid var(--hairline)" }}>
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") send(); }}
          placeholder={placeholder || (accentDoctor ? "继续追问花大夫…" : "说点什么…")}
          style={{ flex: 1, height: 46, borderRadius: "var(--r-pill)", border: "1px solid var(--hairline)",
            background: "#fff", padding: "0 18px", fontSize: 15, color: "var(--ink)", outline: "none" }} />
        <button onClick={() => send()} className="btn-green"
          style={{ width: 46, height: 46, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            background: sendGrad || "var(--green-grad)" }}>
          <Icon name="send" size={20} color="#fff" />
        </button>
      </div>
      )}
    </div>
  );
}

// diagnosis wrap-up summary — pushed after the user taps 结束问诊
function DiagnosisSummaryCard({ summary, onView }) {
  return (
    <div className="rise" style={{ margin: "6px 0 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 320, background: "#fff", borderRadius: "var(--r-lg)",
        padding: "20px 20px 18px", boxShadow: "var(--sh-2)", border: "1px solid var(--green-soft)", textAlign: "center" }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", margin: "0 auto 12px", background: "var(--green-grad)",
          display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(0,160,56,0.28)" }}>
          <Icon name="check" size={24} color="#fff" stroke={2.6} />
        </div>
        <div style={{ fontFamily: "var(--f-journal)", fontWeight: 700, fontSize: 17, color: "var(--ink)" }}>
          已记入{summary.plantName || "它"}的日记
        </div>
        <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 4 }}>
          {summary.attached ? "本次建议已补充到刚才的观察记录" : "本次问诊已整理成一篇养护记录"}
        </div>
        <div style={{ margin: "14px 0 4px", padding: "12px 14px", borderRadius: 12, background: "var(--green-bubble)", textAlign: "left" }}>
          <div style={{ fontSize: 11.5, color: "var(--green-deep)", fontWeight: 700, letterSpacing: ".04em", opacity: 0.8 }}>本次养护要点</div>
          <div style={{ fontFamily: "var(--f-journal)", fontWeight: 700, fontSize: 15, color: "var(--ink)", marginTop: 3 }}>
            {summary.points || "散射光 · 多通风 · 土干透再浇"}
          </div>
        </div>
      </div>
      <button onClick={onView} className="btn-green"
        style={{ marginTop: 14, height: 46, padding: "0 22px", fontSize: 14.5, borderRadius: "var(--r-pill)",
          display: "inline-flex", alignItems: "center", gap: 7 }}>
        查看所有日记 <Icon name="chevR" size={18} color="#fff" stroke={2.4} />
      </button>
    </div>
  );
}

// care-plan suggestion card (doctor)
function CarePlanCard({ name }) {
  const [added, setAdded] = useState(false);
  return (
    <div className="rise" style={{ margin: "6px 0 12px 45px", background: "#fff", borderRadius: "var(--r-lg)",
      padding: "14px 16px", boxShadow: "var(--sh-2)", border: "1px solid var(--green-soft)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "var(--green-deep)" }}>
        <Icon name="leaf" size={17} color="var(--green)" /> 要把这次建议记进{name || "这盆花"}的养护笔记吗？
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>本次养护要点</div>
          <div style={{ fontFamily: "var(--f-journal)", fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>散射光 · 多通风 · 土干透再浇</div>
        </div>
        <button onClick={() => setAdded(true)} disabled={added}
          style={{ padding: "9px 16px", borderRadius: "var(--r-pill)", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
            background: added ? "var(--green-soft)" : "var(--green-grad)", color: added ? "var(--green-deep)" : "#fff",
            display: "flex", alignItems: "center", gap: 5, boxShadow: added ? "none" : "0 6px 14px rgba(0,160,56,0.25)" }}>
          {added ? <><Icon name="check" size={15} color="var(--green-deep)" /> 已记下</> : "记下来"}
        </button>
      </div>
    </div>
  );
}

// ---- 与任一花对话 ----
function PlantChat({ go, plant }) {
  const p = plant || window.PLANTS[0];
  const quickMap = {
    ciji: ["我有点想你了", "今天给你浇水好不好？", "你今天好看吗", "我出差了几天，对不起"],
    tuanzi: ["冷不冷呀？", "我把你搬到窗边啦", "今天想我了吗", "要浇水吗？"],
    alv: ["今天又长新叶了？", "谢谢你鼓励我", "你真好养", "给我加点油吧"],
    laobei: ["你又在观察谁了", "多肉真的浇多了吗", "给我出个主意", "你是不是该换盆了"],
    zhaozhao: ["今天太阳好吗", "你总是那么乐观", "我最近有点丧", "陪我晒会太阳"],
  };
  return (
    <ChatBase go={go}
      title={p.name}
      subtitle={`${p.species} · ${p.tagsOn.join("，")}`}
      headerAvatar={<PlantAvatar plant={p} size={38} />}
      avatar={<PlantAvatar plant={p} size={36} />}
      bubbleBg={p.bubble} bubbleBorder={`${p.accent}26`} sendGrad={`linear-gradient(180deg, ${p.accent}, ${p.deep})`}
      systemPrompt={window.systemPromptFor(p)}
      opener={p.opener}
      placeholder={`对${p.name}说点什么…`}
      quicks={quickMap[p.id] || ["你今天怎么样？", "想你了", "需要浇水吗"]}
    />
  );
}
window.PlantChat = PlantChat;
// back-compat alias
window.CactusChat = PlantChat;

// ---- 花大夫问诊 ----
function DoctorChat({ go, plant, observation, onSaveEntry, onUpdateEntry }) {
  const p = plant || window.PLANTS[0];
  const docAv = <DoctorAvatar size={38} />;
  const recognitionMessage = p.recognitionFailed
    ? "识别暂时没成功，先按新朋友问诊，不耽误花大夫判断"
    : p.isNew
      ? `认出它像「${p.species}」· 正在看一位新朋友`
      : `认出是 ${p.name}（${p.species}）· 正在结合新照片分析`;
  const ctx = (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
      background: p.recognitionFailed ? "rgba(201,138,60,.12)" : "var(--green-bubble)", fontSize: 12.5,
      color: p.recognitionFailed ? "var(--terra)" : "var(--green-deep)", fontWeight: 600 }}>
      <Icon name={p.recognitionFailed ? "bell" : "camera"} size={16}
        color={p.recognitionFailed ? "var(--terra)" : "var(--green-deep)"} /> {recognitionMessage}
    </div>
  );
  const diagnosisImage = p.diagnosisPhoto || "";
  async function finishDx(conclusion, messages) {
    const summary = await window.HHDoctor.summarize({ plant: p, image: diagnosisImage, messages });
    if (p.isNew) { go("archiveNew", p, { dx: summary }); return null; }
    if (observation && onUpdateEntry) {
      await onUpdateEntry(p, {
        ...observation,
        doctorStatus: "completed",
        diagnosis: {
          symptom: summary.symptom,
          conclusion: summary.conclusion,
          plan: summary.plan,
          points: summary.points,
          followupDays: summary.followupDays,
          urgency: summary.urgency,
          confidence: summary.confidence,
          completedAt: new Date().toISOString(),
        },
      });
    } else if (onSaveEntry) {
      const entry = window.makeEntry("diagnosis", p, {
        symptom: summary.symptom,
        conclusion: summary.conclusion,
        plan: summary.plan,
        points: summary.points,
        followupDays: summary.followupDays,
        urgency: summary.urgency,
        confidence: summary.confidence,
        voice: p.voice,
        photo: p.photoId,
      });
      await onSaveEntry(p, entry);
    }
    return { plantName: p.name, points: (summary.points || []).join(" · ") || summary.plan, attached: Boolean(observation) };
  }
  return (
    <ChatBase go={go}
      title="花大夫"
      subtitle={p.isNew ? "正在看一位新朋友" : `第三方养护专家 · 正在看 ${p.name}`}
      headerAvatar={docAv}
      systemPrompt={window.doctorSystemPrompt(p.isNew ? "这位新朋友" : p.name)}
      opener="照片我收到了。先告诉我：最近一次浇水是什么时候，盆土现在偏干还是偏湿？我会结合照片一起判断。"
      complete={(messages) => window.HHDoctor.reply({ plant: p, image: diagnosisImage, messages })}
      quicks={["浇多少水合适？", "多久浇一次？", "叶片发皱怎么办", "需要换盆吗"]}
      accentDoctor
      carePlanName={p.isNew ? "这位新朋友" : p.name}
      contextBar={ctx}
      onFinishDx={finishDx}
      finishLabel={p.isNew ? "诊断完成 · 为它建档" : "结束问诊 · 记入日记"}
    />
  );
}
window.DoctorChat = DoctorChat;
