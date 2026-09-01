/* ============================================================
   花花日记本 · App shell / router (history stack)
   日记是唯一一级入口；花园作为“二楼”，花大夫从异常记录进入
   ============================================================ */
const ROOT_VIEWS = ["diary"];
const LOGIN_INTRO_KEY = "huahua.loginIntroSeen.v1";
const GARDEN_FLOOR_GUIDE_KEY = "huahua.gardenFloorGuideSeen.v1";
const FLOOR_DIRECTION_TOLERANCE = 8;
const FLOOR_SWITCH_THRESHOLD_RATIO = .18;

function shouldShowGardenFloorGuide() {
  try {
    return !window.localStorage.getItem(GARDEN_FLOOR_GUIDE_KEY);
  } catch (_) {
    return true;
  }
}

function markGardenFloorGuideSeen() {
  try {
    window.localStorage.setItem(GARDEN_FLOOR_GUIDE_KEY, "1");
  } catch (_) {}
}

function GlobalCaptureButton({ go }) {
  const inputRef = useRef(null);

  function choosePhoto() {
    if (inputRef.current) inputRef.current.click();
  }

  function openCapture(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => go("capture", window.UNKNOWN_PLANT, { intake: true, image: reader.result });
    reader.readAsDataURL(file);
  }

  return <>
    <input ref={inputRef} className="global-capture-input" type="file" accept="image/*" capture="environment"
      onChange={openCapture} aria-label="拍照或从相册选择植物照片" />
    <button className="global-capture-button" onClick={choosePhoto} aria-label="拍照记今天">
      <Icon name="camera" size={24} color="#fff" />
    </button>
  </>;
}

function DiaryGardenFloor({ go, t, onAccount, floor, onFloorChange }) {
  const hostRef = useRef(null);
  const scrollRef = useRef(null);
  const gestureRef = useRef(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [guideActive, setGuideActive] = useState(() => shouldShowGardenFloorGuide());

  useEffect(() => {
    if (!guideActive || floor !== "diary") return undefined;
    markGardenFloorGuideSeen();
    const timer = window.setTimeout(() => setGuideActive(false), 2600);
    return () => window.clearTimeout(timer);
  }, [guideActive, floor]);

  function dismissGuide() {
    if (!guideActive) return;
    markGardenFloorGuideSeen();
    setGuideActive(false);
  }

  function openGarden() {
    setDragOffset(0);
    onFloorChange("garden");
  }

  function openDiary() {
    setDragOffset(0);
    onFloorChange("diary");
  }

  function startGesture(event) {
    dismissGuide();
    const touch = event.touches && event.touches[0];
    if (!touch) return;
    gestureRef.current = { x: touch.clientX, y: touch.clientY, axis: "", offset: 0 };
  }

  function moveGesture(event) {
    const gesture = gestureRef.current;
    const touch = event.touches && event.touches[0];
    if (!gesture || !touch) return;
    const dx = touch.clientX - gesture.x;
    const dy = touch.clientY - gesture.y;
    if (!gesture.axis && Math.max(Math.abs(dx), Math.abs(dy)) >= FLOOR_DIRECTION_TOLERANCE) {
      gesture.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (gesture.axis !== "y") return;
    const height = hostRef.current ? hostRef.current.clientHeight : 0;
    if (floor === "diary") {
      if ((scrollRef.current && scrollRef.current.scrollTop > 0) || dy <= 0) return;
      gesture.offset = Math.min(height, dy);
    } else {
      if (dy >= 0) return;
      gesture.offset = Math.max(-height, dy);
    }
    setDragging(true);
    setDragOffset(gesture.offset);
    if (event.cancelable) event.preventDefault();
  }

  function endGesture() {
    const gesture = gestureRef.current;
    const height = hostRef.current ? hostRef.current.clientHeight : 0;
    const crossed = gesture && Math.abs(gesture.offset) >= height * FLOOR_SWITCH_THRESHOLD_RATIO;
    if (crossed) onFloorChange(floor === "diary" ? "garden" : "diary");
    gestureRef.current = null;
    setDragging(false);
    setDragOffset(0);
  }

  const restingOffset = floor === "garden" ? "100%" : "0px";
  const sheetOffset = dragging
    ? (floor === "garden" ? `calc(100% + ${dragOffset}px)` : `${dragOffset}px`)
    : restingOffset;

  return <div ref={hostRef} className={`diary-garden-floor floor-${floor}`}
    onTouchStart={startGesture} onTouchMove={moveGesture} onTouchEnd={endGesture} onTouchCancel={endGesture}>
    <div className="garden-floor-scene">
      <GardenScreen go={go} onReturnHome={openDiary} />
    </div>
    <div className={`diary-floor-sheet${dragging ? " is-dragging" : ""}${guideActive && floor === "diary" ? " is-guide-active" : ""}`}
      style={{ transform: `translate3d(0, ${sheetOffset}, 0)` }}>
      <DiaryHome go={go} t={t} onAccount={onAccount} scrollRef={scrollRef} />
      {guideActive && floor === "diary" && <div className="garden-floor-guide" aria-hidden="true">
        <span>下拉看看，花园住在二楼</span>
        <i></i>
      </div>}
    </div>
    <GlobalCaptureButton go={go} />
  </div>;
}

function shouldPlayLoginIntro() {
  try {
    if (window.sessionStorage.getItem(LOGIN_INTRO_KEY)) return false;
    window.sessionStorage.setItem(LOGIN_INTRO_KEY, "1");
    return true;
  } catch (_) {
    return true;
  }
}

function hasStartedGarden(garden) {
  return !!(garden && garden.profile && garden.profile.onboarded)
    || !!(garden && Array.isArray(garden.plants) && garden.plants.length);
}

function collapseDuplicateObservations(plants) {
  return (plants || []).map(plant => {
    const seen = [];
    const diary = (plant.diary || []).filter(entry => {
      if (entry.kind !== "record" || !entry.photoData) return true;
      const at = Date.parse(entry.observedAt || entry.createdAt || 0) || 0;
      const duplicate = seen.some(item => item.photoData === entry.photoData && (!at || !item.at || Math.abs(item.at - at) < 10 * 60 * 1000));
      if (!duplicate) seen.push({ photoData: entry.photoData, at });
      return !duplicate;
    });
    return diary.length === (plant.diary || []).length ? plant : { ...plant, diary };
  });
}

function App({ t = {} }) {
  const [, force] = useState(0);
  const [, setPlants] = useState([]);
  const [account, setAccount] = useState(null);
  const [stack, setStack] = useState([{ view: "email", playIntro: false }]);
  const [mainFloor, setMainFloor] = useState("diary");
  const [boot, setBoot] = useState({ status: "loading", error: "" });
  const top = stack[stack.length - 1];

  useEffect(() => { bootGarden(); }, []);

  async function bootGarden() {
    setBoot({ status: "loading", error: "" });
    try {
      const restored = await window.HHAccount.restoreSession();
      if (!restored) {
        window.PLANTS = [];
        setPlants([]);
        setAccount(null);
        setStack([{ view: "email", playIntro: shouldPlayLoginIntro() }]);
        setBoot({ status: "ready", error: "" });
        return;
      }
      const garden = await window.HHData.bootstrap(restored);
      const hydrated = { ...restored, onboarded: hasStartedGarden(garden) };
      setAccount(hydrated);
      const plants = collapseDuplicateObservations(garden.plants);
      window.PLANTS = plants;
      window.CACTUS = plants[0] || null;
      setPlants([...plants]);
      setStack([{ view: hydrated.onboarded ? "diary" : "onboard" }]);
      setBoot({ status: "ready", error: "" });
    } catch (error) {
      setBoot({ status: "error", error: error && error.message ? error.message : "花园暂时没有连上" });
    }
  }

  function go(dest, plant, opts) {
    if (dest === "back") { setStack(s => s.length > 1 ? s.slice(0, -1) : s); return; }
    if (dest === "doctorBack") {
      setStack(s => {
        if (s.length <= 1) return s;
        const withoutChat = s.slice(0, -1);
        return withoutChat[withoutChat.length - 1] && withoutChat[withoutChat.length - 1].view === "capture"
          ? withoutChat.slice(0, -1)
          : withoutChat;
      });
      return;
    }
    if (dest === "home") { setStack([{ view: "diary" }]); return; }
    if (dest === "plantDiary" && opts && opts.returnHome) {
      setStack([{ view: "diary" }, { view: "plantDiary", plant }]);
      return;
    }
    if (ROOT_VIEWS.includes(dest)) { setMainFloor("diary"); setStack([{ view: dest, plant }]); return; }
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
  async function deletePlant(plant) {
    await window.HHData.deletePlant(plant.id);
    window.PLANTS = window.PLANTS.filter(item => item.id !== plant.id);
    window.CACTUS = window.PLANTS[0] || null;
    setPlants([...window.PLANTS]);
    setStack([{ view: "diary" }]);
  }
  async function signOut() {
    await window.HHAccount.signOut();
    window.PLANTS = [];
    window.CACTUS = null;
    setPlants([]);
    setAccount(null);
    setStack([{ view: "email", playIntro: false }]);
    if (typeof window !== "undefined" && /^https?:$/.test(window.location.protocol)) {
      const cleanEntry = `${window.location.origin}${window.location.pathname}?signedout=${Date.now()}`;
      setTimeout(() => window.location.replace(cleanEntry), 30);
    }
  }
  function openAccount() {
    if (account && !account.guest) {
      go("account");
      return;
    }
    setStack([{ view: "email", playIntro: false }]);
  }
  async function finishOnboard(newPlant, firstPhoto) {
    const validFirstPhoto = typeof firstPhoto === "string"
      && /^data:image\/(?:jpeg|png|webp|heic|heif);base64,/i.test(firstPhoto)
      ? firstPhoto
      : "";
    if (newPlant) await window.HHData.createPlantWithFirstEntry(newPlant);
    else await window.HHData.setOnboarded(account);
    const updatedAccount = window.HHAccount.markOnboarded();
    if (updatedAccount) setAccount(updatedAccount);
    if (newPlant) {
      window.PLANTS.unshift(newPlant);
      setPlants([...window.PLANTS]);
      setStack(validFirstPhoto
        ? [{ view: "diary" }, { view: "capture", plant: newPlant, image: validFirstPhoto, autoSave: true }]
        : [{ view: "diary" }]);
    } else {
      setStack([{ view: "diary" }]);
    }
  }
  async function enterGarden(result) {
    const garden = await window.HHData.migrateGuestGarden(result.account);
    const hydrated = { ...result.account, onboarded: hasStartedGarden(garden) };
    setAccount(hydrated);
    setPlants([...garden.plants]);
    const next = hydrated.onboarded ? "diary" : "onboard";
    setStack([{ view: next }]);
  }
  async function enterGuestGarden() {
    const guestAccount = { id: "guest-local", email: "", guest: true, onboarded: false };
    const garden = await window.HHData.bootstrap(guestAccount);
    const hydrated = { ...guestAccount, onboarded: hasStartedGarden(garden) };
    setAccount(hydrated);
    setPlants([...garden.plants]);
    setStack([{ view: hydrated.onboarded ? "diary" : "onboard" }]);
  }
  async function addEntry(pl, entry) {
    const duplicate = entry.kind === "record" && entry.photoData && (pl.diary || []).find(existing => {
      if (existing.kind !== "record" || existing.photoData !== entry.photoData) return false;
      const existingAt = Date.parse(existing.observedAt || existing.createdAt || 0) || 0;
      const nextAt = Date.parse(entry.observedAt || entry.createdAt || 0) || 0;
      return !existingAt || !nextAt || Math.abs(existingAt - nextAt) < 10 * 60 * 1000;
    });
    if (duplicate) return duplicate;
    await window.HHData.addDiaryEntry(pl.id, entry);
    pl.diary.unshift(entry);
    force(n => n + 1);
    return entry;
  }
  async function updateEntry(pl, entry) {
    const savedEntry = await window.HHData.updateDiaryEntry(pl.id, entry);
    const index = (pl.diary || []).findIndex(item => item.id === savedEntry.id);
    if (index < 0) throw new Error("这篇观察记录还没有保存在日记里");
    pl.diary.splice(index, 1, savedEntry);
    force(n => n + 1);
    return savedEntry;
  }

  if (boot.status !== "ready") {
    return <GardenBootScreen error={boot.status === "error" ? boot.error : ""} onRetry={bootGarden} />;
  }

  const isOverlay = !ROOT_VIEWS.includes(top.view);

  return (
    <div className="canvas">
      {/* diary home and its immersive second-floor garden */}
      {!isOverlay && <DiaryGardenFloor go={go} t={t} onAccount={openAccount}
        floor={mainFloor} onFloorChange={setMainFloor} />}

      {/* overlays */}
      {top.view === "email" && <EmailEntry onEnter={enterGarden} onSkip={enterGuestGarden} playIntro={!!top.playIntro} />}
      {top.view === "onboard" && <Onboard startAtSpecies={!!top.startAtSpecies}
        onComplete={finishOnboard} onSkip={() => finishOnboard(null)} />}
      {top.view === "plantDiary" && <PlantDiary go={go} plant={top.plant} t={t} onSave={savePlant}
        returnLabel="日记本" />}
      {top.view === "capture" && <CaptureFlow go={go} plant={top.plant} intake={!!top.intake}
        initialImage={top.image} autoSave={!!top.autoSave}
        onSaveEntry={addEntry} onUpdateEntry={updateEntry} />}
      {top.view === "doctorChat" && <DoctorChat go={go} plant={top.plant} observation={top.observation}
        onSaveEntry={addEntry} onUpdateEntry={updateEntry} />}
      {top.view === "archiveNew" && <ArchiveNew draft={top.plant} dx={top.dx} onArchive={archiveNewPlant} onBack={() => go("back")} />}
      {top.view === "profile" && <ProfileScreen go={go} plant={top.plant} onSave={savePlant} />}
      {top.view === "deletePlant" && <PlantDeleteConfirm plant={top.plant} onCancel={() => go("back")} onDelete={deletePlant} />}
      {top.view === "account" && <AccountScreen go={go} account={account} plantCount={window.PLANTS.length} onSignOut={signOut} />}
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
