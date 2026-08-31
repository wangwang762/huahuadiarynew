/* 花花日记本 · 花园：把原小组件的扁平花架展开成整页 */
function FlatGardenPlant({ plant, index, total, go }) {
  const src = window.cutFor ? window.cutFor(plant.photoId) : "";
  const actualPlant = plant._previewSource || plant;
  const scale = typeof window.coverScale === "function" ? window.coverScale(plant.photoId) : 1;
  const baseHeight = total === 1 ? 112 : total <= 5 ? 70 : 57;
  const height = Math.max(total === 1 ? 94 : 45, Math.min(total === 1 ? 128 : 78, Math.round(baseHeight * scale)));
  return (
    <button className="flat-garden-plant" onClick={() => go("plantDiary", actualPlant)} onContextMenu={event => event.preventDefault()}
      aria-label={`打开${plant.name}的日记`} style={{ "--plant-delay": `${index * .045}s`, touchAction: "pan-y",
        userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" }}>
      <span className="flat-garden-plant-art" style={{ height }}>
        {src ? <span className="flat-garden-sway-cut">
          <img className="flat-plant-body" src={src} alt="" />
          <img className="flat-plant-pot" src={src} alt="" aria-hidden="true" />
        </span> :
          <PlantSprite shape={plant.shape} color={plant.deep} pot={plant.pot} h={height} sway />}
      </span>
    </button>
  );
}

function GardenVisitorArt({ type }) {
  if (type === "bee") return <svg viewBox="0 0 28 24">
    <g className="visitor-wing-fast"><ellipse cx="10" cy="8" rx="5" ry="3"/><ellipse cx="17" cy="8" rx="5" ry="3"/></g>
    <ellipse className="bee-body" cx="14" cy="14" rx="5.5" ry="4"/><path className="bee-stripes" d="M12 10.5v7M15 10.2v7.6"/><circle className="visitor-eye" cx="18.5" cy="13" r="1"/>
  </svg>;
  if (type === "bird") return <svg viewBox="0 0 32 25">
    <path className="bird-body" d="M8 15c5-6 12-7 17-3 2 2 1 5-2 6-5 2-10 1-15-3Z"/><path className="bird-tail" d="m9 14-7-3 4 6Z"/>
    <path className="bird-wing" d="M13 14c1-6 7-9 11-8-2 3-5 7-9 10Z"/><circle className="visitor-eye" cx="24" cy="12" r=".8"/><path className="bird-beak" d="m26 13 5 2-5 1Z"/>
  </svg>;
  return (
      <svg viewBox="0 0 24 24">
        <g className="butterfly-wing-left"><path d="M11.6 12c-1.5-3.6-4.6-5.4-6.8-4-1.7 1.1-1.4 3.6.2 4.9-1.8.5-2.6 2.3-1.8 3.9 1.1 2 4.7 1.6 8.4-1.3Z"/><circle cx="6.6" cy="10.6" r=".9"/></g>
        <g className="butterfly-wing-right"><path d="M12.4 12c1.5-3.6 4.6-5.4 6.8-4 1.7 1.1 1.4 3.6-.2 4.9 1.8.5 2.6 2.3 1.8 3.9-1.1 2-4.7 1.6-8.4-1.3Z"/><circle cx="17.4" cy="10.6" r=".9"/></g>
        <ellipse cx="12" cy="12.4" rx=".85" ry="3.3"/><path className="butterfly-feelers" d="M12 9.2c-.5-.9-1.3-1.5-1.9-1.7M12 9.2c.5-.9 1.3-1.5 1.9-1.7"/>
      </svg>
  );
}

function GardenVisitors({ hostRef, active }) {
  const visitorRef = React.useRef(null);
  const [visitor, setVisitor] = React.useState(null);
  React.useEffect(() => {
    if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let alive = true, animation = null, timer = null;
    const wait = ms => new Promise(resolve => { timer = setTimeout(resolve, ms); });
    async function visitLoop() {
      await wait(2600 + Math.random() * 2800);
      while (alive) {
        const types = ["butterfly", "bee", "bird", "butterfly", "bee"];
        const type = types[Math.floor(Math.random() * types.length)];
        setVisitor({ type, id: Date.now() });
        await wait(70);
        const host = hostRef.current, el = visitorRef.current;
        const hostBox = host && host.getBoundingClientRect();
        const crowns = host && Array.from(host.querySelectorAll(".flat-garden-plant-art")).filter(node => {
          const box = node.getBoundingClientRect();
          return hostBox && box.bottom > hostBox.top + 80 && box.top < hostBox.bottom - 72;
        });
        if (!alive || !host || !el || !crowns.length) break;
        const crown = crowns[Math.floor(Math.random() * crowns.length)].getBoundingClientRect();
        const fromLeft = Math.random() < .5, direction = fromLeft ? 1 : -1;
        const startX = fromLeft ? -42 : hostBox.width + 42;
        const endX = fromLeft ? hostBox.width + 46 : -46;
        const leafX = crown.left - hostBox.left + crown.width * (.3 + Math.random() * .4);
        const leafY = crown.top - hostBox.top + crown.height * (.16 + Math.random() * .28);
        const startY = Math.max(120, leafY - 120 - Math.random() * 60);
        const pose = (x, y, tilt = 0) => `translate(${x}px,${y}px) scaleX(${direction}) rotate(${tilt}deg)`;
        animation = el.animate([
          { offset:0, transform:pose(startX,startY,8), opacity:0 },
          { offset:.08, transform:pose(startX + direction * 46,startY + 18,-7), opacity:1 },
          { offset:.2, transform:pose((startX + leafX) * .55,leafY - 65,9), opacity:1 },
          { offset:.34, transform:pose(leafX - direction * 28,leafY - 22,-6), opacity:1 },
          { offset:.43, transform:pose(leafX,leafY,0), opacity:1 },
          { offset:.7, transform:pose(leafX,leafY,0), opacity:1 },
          { offset:.78, transform:pose(leafX + direction * 32,leafY - 32,-9), opacity:1 },
          { offset:.9, transform:pose((leafX + endX) * .55,startY + 6,8), opacity:1 },
          { offset:1, transform:pose(endX,startY - 28,5), opacity:0 }
        ], { duration:type === "bird" ? 7800 : 9000, easing:"ease-in-out", fill:"forwards" });
        try { await animation.finished; } catch (_) {}
        if (!alive) break;
        setVisitor(null);
        await wait(6500 + Math.random() * 8500);
      }
    }
    visitLoop();
    return () => { alive = false; clearTimeout(timer); if (animation) animation.cancel(); };
  }, [active, hostRef]);
  return visitor ? <span ref={visitorRef} className={`garden-visitor visitor-${visitor.type}`} aria-hidden="true">
    <GardenVisitorArt type={visitor.type} />
  </span> : null;
}

function automaticGardenScene(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "airy";
  if (hour >= 17 && hour < 20) return "warm";
  if (hour >= 20 || hour < 5) return "night";
  return "airy";
}

function automaticGardenWeather(weatherName) {
  const name = String(weatherName || "");
  if (/晴/.test(name)) return "clear";
  if (/云|阴|雾|霾/.test(name)) return "cloudy";
  return "rain";
}

function gardenSceneSource(scene, weatherKind) {
  const suffix = weatherKind === "clear" ? "" : `-${weatherKind}`;
  return `assets/garden-scene-${scene}${suffix}-v1.jpg`;
}

function GardenRoomDecor({ weatherKind, scene }) {
  const wallSrc = gardenSceneSource(scene, weatherKind);
  return <div className="garden-room-decor" aria-hidden="true">
    <img className="garden-wall-art" src={wallSrc} alt="" />
  </div>;
}

function GardenScreen({ go }) {
  const plants = (window.PLANTS || []).slice(0, 100);
  const gardenRef = React.useRef(null);
  const [weather, setWeather] = useState(() => window.HHWeather && window.HHWeather.current());
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    let active = true;
    if (window.HHWeather) window.HHWeather.load().then(value => { if (active) setWeather(value); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const weatherName = weather && weather.weather || "小雨";
  const visibleScene = automaticGardenScene(clock);
  const visibleWeather = automaticGardenWeather(weatherName);
  const weatherClass = visibleWeather === "clear" ? "晴" : visibleWeather === "cloudy" ? "多云" : "小雨";
  const displayedPlants = plants.map((plant, index) => ({
    ...plant, _gardenKey: `real-${plant.id}-${index}`, _previewSource: plant,
  }));
  const gardenPages = displayedPlants.length
    ? Array.from({ length: Math.ceil(displayedPlants.length / 20) }, (_, pageIndex) => displayedPlants.slice(pageIndex * 20, pageIndex * 20 + 20))
    : [[]];
  return (
    <div ref={gardenRef} className={`flat-garden flat-weather-${weatherClass} flat-scene-${visibleScene}`}>
      <div className="flat-weather-zone" aria-hidden="true">
        {visibleWeather === "rain" && Array.from({ length: 24 }).map((_, i) =>
          <i className="flat-raindrop" key={i} style={{ left: `${3 + (i * 23) % 96}%`, animationDelay: `${(i % 7) * -.18}s` }}></i>)}
        {visibleWeather === "clear" && <span className="flat-sun-glow"></span>}
        {visibleWeather === "cloudy" && <><span className="flat-cloud cloud-one"></span><span className="flat-cloud cloud-two"></span></>}
      </div>
      <GardenRoomDecor weatherKind={visibleWeather} scene={visibleScene} />
      <div className="garden-wind-shadows" aria-hidden="true"><i></i><i></i></div>
      <div className="garden-breeze-foreground" aria-hidden="true">
        <img className="breeze-plant-left" src="assets/plants/final-v1/guibeizhu.png" alt="" />
        <img className="breeze-plant-right" src="assets/plants/final-v1/lvluo.png" alt="" />
      </div>
      <GardenVisitors hostRef={gardenRef} active={displayedPlants.length > 0} />

      <div className="garden-page-scroll noscroll" aria-label="花园花架">
        {gardenPages.map((pagePlants, pageIndex) => {
          const levelCount = Math.max(1, Math.ceil(pagePlants.length / 5));
          const rows = Array.from({ length: levelCount }, (_, row) => pagePlants.slice(row * 5, row * 5 + 5));
          return <section className="garden-shelf-page" key={pageIndex} aria-label={`花园第 ${pageIndex + 1} 页`}>
            <main className={`flat-garden-rack flat-rack-levels-${levelCount}`}>
              {rows.map((rowPlants, rowIndex) => <div className={`flat-garden-tier flat-tier-${5 - levelCount + rowIndex}`} key={rowIndex}>
                <div className={`flat-garden-residents flat-row-count-${rowPlants.length}`}>
                  {rowPlants.map((plant, index) => <FlatGardenPlant key={plant._gardenKey || plant.id} plant={plant}
                    index={pageIndex * 20 + rowIndex * 5 + index} total={displayedPlants.length} go={go} />)}
                  {!displayedPlants.length && rowIndex === 0 &&
                    <button className="flat-first-plant" onClick={() => go("onboard", null, { startAtSpecies: true })} aria-label="添加第一盆植物">
                      <Icon name="plus" size={19} color="var(--green-deep)" />
                    </button>}
                </div>
                <div className="flat-shelf-braces" aria-hidden="true"><i></i><i></i></div>
                <div className="flat-rack-board"></div>
              </div>
              )}
            </main>
            {gardenPages.length > 1 && <div className="garden-page-cue">
              <span>{pagePlants.length} 盆花住在这里</span>
              {pageIndex < gardenPages.length - 1 && <small>往上滑，继续逛花园</small>}
            </div>}
          </section>;
        })}
      </div>
    </div>
  );
}

window.GardenScreen = GardenScreen;
