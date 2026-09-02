const fs = require("fs");
const vm = require("vm");

const source = fs.readFileSync("data-service.js", "utf8");
const memory = new Map();
const localStorage = {
  getItem(key) { return memory.has(key) ? memory.get(key) : null; },
  setItem(key, value) { memory.set(key, String(value)); },
  removeItem(key) { memory.delete(key); },
};

function tableBuilder() {
  return {
    select() { return this; },
    eq() { return this; },
    limit() { return Promise.resolve({ data: [] }); },
    upsert() { return Promise.resolve({ error: new Error("The quota has been exceeded.") }); },
    update() { return this; },
    delete() { return this; },
    then(resolve) { return Promise.resolve({ data: [] }).then(resolve); },
  };
}

const window = {
  localStorage,
  HHCloud: { demo: false, get() { return { db: { from() { return tableBuilder(); } } }; } },
  PLANTS: [],
};

vm.runInNewContext(source, { window, localStorage, console, JSON, Date, Error });

(async () => {
  const account = { id: "phone-user-1", email: "", guest: false };
  await window.HHData.bootstrap(account);
  const plant = {
    id: "unknown-plant-1",
    name: "粑粑",
    species: "小仙女竹芋",
    diary: [{ id: "diagnosis-1", type: "diagnosis", text: "初诊" }],
  };
  const saved = await window.HHData.createPlantWithFirstEntry(plant);
  if (!saved.syncPending || saved.syncState !== "local-only") throw new Error("quota fallback was not marked local-only");
  if (saved.species !== "小仙女竹芋") throw new Error("recognized unknown species was not preserved");
  const key = `${window.HHData.CLOUD_FALLBACK_STORAGE_PREFIX}${account.id}`;
  const localPlants = JSON.parse(localStorage.getItem(key) || "[]");
  if (localPlants.length !== 1 || localPlants[0].name !== "粑粑") throw new Error("quota fallback was not saved locally");

  await window.HHData.addDiaryEntry(saved.id, { id: "record-2", text: "第二次观察" });
  const restored = await window.HHData.bootstrap(account);
  if (restored.plants.length !== 1) throw new Error("local-only plant was not restored");
  if (restored.plants[0].diary[0].id !== "record-2") throw new Error("local-only diary updates were not preserved");

  console.log("CLOUD_QUOTA_FALLBACK_OK");
})().catch(error => {
  console.error(error);
  process.exit(1);
});
