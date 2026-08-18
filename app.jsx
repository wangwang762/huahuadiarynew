/* ============================================================
   花花日记本 · App shell / router (history stack)
   Tabs: 日记 · 花大夫 · 小组件
   ============================================================ */
const TABS = ["diary", "doctor", "widget"];

function App({ t = {} }) {
  const [, force] = useState(0);
  const [, setPlants] = useState([]);
  const initTab = (typeof location !== "undefined" && /[?&#]tab=(\w+)/.exec(location.hash + location.search) || [])[1];
  const [account, setAccount] = useState(null);
  const [stack, setStack] = useState([{ view: "email" }]);
  const [boot, setBoot] = useState({ status: "loading", error: "" });
  const top = stack[stack.length - 1];
  const baseTab = stack[0].view;

  useEffect(() => { bootGarden(); }, []);

  async function bootGarden() {
    setBoot({ status: "loading", error: "" });
    try {
      const restored = await window.HHAccount.restoreSession();
      if (!restored) {
        window.PLANTS = [];
        setPlants([]);
        setAccount(null);
        setStack([{ view: "email" }]);
        setBoot({ status: "ready", error: "" });
        return;
      }
      const garden = await window.HHData.bootstrap(restored);
      const hydrated = { ...restored, onboarded: !!(garden.profile && garden.profile.onboarded) };
      setAccount(hydrated);
      setPlants([...garden.plants]);
      setStack([{ view: hydrated.onboarded ? (TABS.includes(initTab) ? initTab : "diary") : "onboard" }]);
      setBoot({ status: "ready", error: "" });
    } catch (error) {
      setBoot({ status: "error", error: error && error.message ? error.message : "花园暂时没有连上" });
    }
  }

  function go(dest, plant, opts) {
    if (dest === "back") { setStack(s => s.length > 1 ? s.slice(0, -1) : s); return; }
    if (dest === "home") { setStack([{ view: "diary" }]); return; }
    if (TABS.includes(dest)) { setStack([{ view: dest, plant }]); return; }
    setStack(s => [...s, { view: dest, plant: plant || top.plant, ...(opts || {}) }]);
  }
  async function archiveNewPlant(newPlant) {
    await window.HHData.createPlantWithFirstEntry(newPlant);
    window.PLANTS.unshift(newPlant);
    setPlants([...window.PLANTS]);
    setStack([{ view: "plantDiary", plant: newPlant }]);
  }
  async function savePlant(plant) {
    await window.HHData.updatePlant(plant);
    const existing = window.PLANTS.find(item => item.id === plant.id);
    if (existing && existing !== plant) Object.assign(existing, plant);
    setPlants(p => [...p]); force(n => n + 1);
  }
  async function finishOnboard(newPlant) {
    if (newPlant) await window.HHData.createPlantWithFirstEntry(newPlant);
    else await window.HHData.setOnboarded(account);
    const updatedAccount = window.HHAccount.markOnboarded();
    if (updatedAccount) setAccount(updatedAccount);
    if (newPlant) window.PLANTS.unshift(newPlant);
    setPlants([...window.PLANTS]);
    setStack(newPlant ? [{ view: "plantDiary", plant: newPlant }] : [{ view: "diary" }]);
  }
  async function enterGarden(result) {
    const garden = await window.HHData.bootstrap(result.account);
    const hydrated = { ...result.account, onboarded: !!(garden.profile && garden.profile.onboarded) };
    setAccount(hydrated);
    setPlants([...garden.plants]);
    const next = hydrated.onboarded ? (TABS.includes(initTab) ? initTab : "diary") : "onboard";
    setStack([{ view: next }]);
  }
  async function addEntry(pl, entry) {
    await window.HHData.addDiaryEntry(pl.id, entry);
    pl.diary.unshift(entry);
    force(n => n + 1);
  }

  if (boot.status !== "ready") {
    return <GardenBootScreen error={boot.status === "error" ? boot.error : ""} onRetry={bootGarden} />;
  }

  const isOverlay = !TABS.includes(top.view);

  return (
    <div className="canvas">
      {/* base tab (hidden under overlays) */}
      {!isOverlay && baseTab === "diary" && <DiaryHome go={go} t={t} />}
      {!isOverlay && baseTab === "doctor" && <DoctorTab go={go} />}
      {!isOverlay && baseTab === "widget" && <WidgetScreen go={go} t={t} />}

      {/* overlays */}
      {top.view === "email" && <EmailEntry onEnter={enterGarden} />}
      {top.view === "onboard" && <Onboard onComplete={finishOnboard} onSkip={() => finishOnboard(null)} />}
      {top.view === "plantDiary" && <PlantDiary go={go} plant={top.plant} t={t} />}
      {top.view === "capture" && <CaptureFlow go={go} plant={top.plant} intake={!!top.intake} onSaveEntry={addEntry} />}
      {top.view === "chat" && <PlantChat go={go} plant={top.plant} />}
      {top.view === "doctorChat" && <DoctorChat go={go} plant={top.plant} onSaveEntry={addEntry} />}
      {top.view === "archiveNew" && <ArchiveNew draft={top.plant} dx={top.dx} onArchive={archiveNewPlant} onBack={() => go("back")} />}
      {top.view === "profile" && <ProfileScreen go={go} plant={top.plant} onSave={savePlant} />}

      {!isOverlay && <BottomNav tab={baseTab} onTab={go} />}
    </div>
  );
}

function GardenBootScreen({ error, onRetry }) {
  return (
    <div className="canvas" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "0 38px", textAlign: "center", background: "radial-gradient(circle at 50% 42%, #E4ECD9 0%, var(--paper) 46%, #E7E1D0 100%)" }}>
      <div style={{ width: 92, height: 92, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(251,246,235,.82)", border: "1px solid var(--hairline)", boxShadow: "var(--sh-2)" }}>
        <div style={{ animation: error ? "none" : "breathe 2.2s ease-in-out infinite" }}>
          <Icon name={error ? "cloud" : "leaf"} size={38} color={error ? "var(--ink-faint)" : "var(--green-deep)"} />
        </div>
      </div>
      <div style={{ marginTop: 22, fontFamily: "var(--f-journal)", fontSize: 23, fontWeight: 650, color: "var(--ink)" }}>
        {error ? "花园暂时没有连上" : "正在打开你的花园……"}
      </div>
      <div className="serif" style={{ marginTop: 9, maxWidth: 270, fontSize: 14, lineHeight: 1.65, color: "var(--ink-soft)" }}>
        {error || "正在取回你的植物和日记，请稍等一下。"}
      </div>
      {error && <button onClick={onRetry} className="btn-green" style={{ marginTop: 24, width: 180, height: 48, fontSize: 15 }}>再试一次</button>}
    </div>
  );
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "weather": "小雨",
  "titleStyle": "清秀",
  "bgFlourish": true
}/*EDITMODE-END*/;

function Root() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  return (
    <>
      <IOSDevice width={390} height={844}>
        <App t={t} />
      </IOSDevice>
      <TweaksPanel title="Tweaks">
        <TweakSection label="首页氛围" />
        <TweakRadio label="天气" value={t.weather} options={["小雨", "晴", "多云"]}
          onChange={(v) => setTweak("weather", v)} />
        <TweakRadio label="标题样式" value={t.titleStyle} options={["清秀", "手写", "混排"]}
          onChange={(v) => setTweak("titleStyle", v)} />
        <TweakToggle label="背景小巧思" value={t.bgFlourish}
          onChange={(v) => setTweak("bgFlourish", v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("device-host")).render(<Root />);
