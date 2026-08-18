/* ============================================================
   花花日记本 · App shell / router (history stack)
   Tabs: 日记 · 花大夫 · 小组件
   ============================================================ */
const TABS = ["diary", "doctor", "widget"];

function App({ t = {} }) {
  const [, force] = useState(0);
  const [, setPlants] = useState(window.PLANTS);
  const initTab = (typeof location !== "undefined" && /[?&#]tab=(\w+)/.exec(location.hash + location.search) || [])[1];
  const [account, setAccount] = useState(() => window.HHAccount.getCurrentAccount());
  const [stack, setStack] = useState(() => [{ view: !account ? "email" : (!account.onboarded ? "onboard" : (TABS.includes(initTab) ? initTab : "diary")) }]);
  const top = stack[stack.length - 1];
  const baseTab = stack[0].view;

  function go(dest, plant, opts) {
    if (dest === "back") { setStack(s => s.length > 1 ? s.slice(0, -1) : s); return; }
    if (dest === "home") { setStack([{ view: "diary" }]); return; }
    if (TABS.includes(dest)) { setStack([{ view: dest, plant }]); return; }
    setStack(s => [...s, { view: dest, plant: plant || top.plant, ...(opts || {}) }]);
  }
  function archiveNewPlant(newPlant) {
    window.PLANTS.unshift(newPlant);
    setPlants([...window.PLANTS]);
    setStack([{ view: "plantDiary", plant: newPlant }]);
  }
  function savePlant() {
    setPlants(p => [...p]); force(n => n + 1);
  }
  function finishOnboard(newPlant) {
    const updatedAccount = window.HHAccount.markOnboarded();
    if (updatedAccount) setAccount(updatedAccount);
    if (newPlant) window.PLANTS.unshift(newPlant);
    setPlants([...window.PLANTS]);
    setStack(newPlant ? [{ view: "plantDiary", plant: newPlant }] : [{ view: "diary" }]);
  }
  function enterGarden(result) {
    setAccount(result.account);
    const next = result.account.onboarded ? (TABS.includes(initTab) ? initTab : "diary") : "onboard";
    setStack([{ view: next }]);
  }
  function addEntry(pl, entry) {
    pl.diary.unshift(entry);
    force(n => n + 1);
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
