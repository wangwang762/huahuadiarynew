/* ============================================================
   花花日记本 · App shell / router (history stack)
   Tabs: 日记 · 花大夫 · 花园
   ============================================================ */
const TABS = ["diary", "doctor", "garden"];

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
      const hydrated = { ...restored, onboarded: hasStartedGarden(garden) };
      setAccount(hydrated);
      const plants = collapseDuplicateObservations(garden.plants);
      window.PLANTS = plants;
      window.CACTUS = plants[0] || null;
      setPlants([...plants]);
      setStack([{ view: hydrated.onboarded ? (TABS.includes(initTab) ? initTab : "diary") : "onboard" }]);
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
  async function deletePlant(plant) {
    await window.HHData.deletePlant(plant.id);
    window.PLANTS = window.PLANTS.filter(item => item.id !== plant.id);
    window.CACTUS = window.PLANTS[0] || null;
    setPlants([...window.PLANTS]);
    setStack(current => [{ view: TABS.includes(current[0] && current[0].view) ? current[0].view : "diary" }]);
  }
  async function signOut() {
    await window.HHAccount.signOut();
    window.PLANTS = [];
    window.CACTUS = null;
    setPlants([]);
    setAccount(null);
    setStack([{ view: "email" }]);
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
    setStack([{ view: "email" }]);
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
    const next = hydrated.onboarded ? (TABS.includes(initTab) ? initTab : "diary") : "onboard";
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

  const isOverlay = !TABS.includes(top.view);

  return (
    <div className="canvas">
      {/* base tab (hidden under overlays) */}
      {!isOverlay && baseTab === "diary" && <DiaryHome go={go} t={t}
        onAccount={openAccount} />}
      {!isOverlay && baseTab === "doctor" && <DoctorTab go={go} />}
      {!isOverlay && baseTab === "garden" && <GardenScreen go={go} />}

      {/* overlays */}
      {top.view === "email" && <EmailEntry onEnter={enterGarden} onSkip={enterGuestGarden} />}
      {top.view === "onboard" && <Onboard startAtSpecies={!!top.startAtSpecies}
        onComplete={finishOnboard} onSkip={() => finishOnboard(null)} />}
      {top.view === "plantDiary" && <PlantDiary go={go} plant={top.plant} t={t} onSave={savePlant}
        returnLabel={baseTab === "garden" ? "花园" : "日记本"} />}
      {top.view === "capture" && <CaptureFlow go={go} plant={top.plant} intake={!!top.intake}
        initialImage={top.image} autoSave={!!top.autoSave}
        onSaveEntry={addEntry} onUpdateEntry={updateEntry} />}
      {top.view === "doctorChat" && <DoctorChat go={go} plant={top.plant} observation={top.observation}
        onSaveEntry={addEntry} onUpdateEntry={updateEntry} />}
      {top.view === "archiveNew" && <ArchiveNew draft={top.plant} dx={top.dx} onArchive={archiveNewPlant} onBack={() => go("back")} />}
      {top.view === "profile" && <ProfileScreen go={go} plant={top.plant} onSave={savePlant} />}
      {top.view === "deletePlant" && <PlantDeleteConfirm plant={top.plant} onCancel={() => go("back")} onDelete={deletePlant} />}
      {top.view === "account" && <AccountScreen go={go} account={account} plantCount={window.PLANTS.length} onSignOut={signOut} />}

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
