const fs = require("fs");
const vm = require("vm");

const source = fs.readFileSync("data-service.js", "utf8");
const memory = new Map();
const localStorage = {
  getItem(key) { return memory.has(key) ? memory.get(key) : null; },
  setItem(key, value) { memory.set(key, String(value)); },
  removeItem(key) { memory.delete(key); },
};
let cloudCalls = 0;
const window = {
  localStorage,
  HHCloud: {
    demo: false,
    get() { cloudCalls += 1; throw new Error("guest mode must not touch cloud"); },
  },
  PLANTS: [],
};

vm.runInNewContext(source, { window, localStorage, console, JSON, Date, Error });

(async () => {
  const account = { id: "guest-local", email: "", guest: true, onboarded: false };
  const empty = await window.HHData.bootstrap(account);
  if (empty.plants.length !== 0) throw new Error("guest garden should start empty");
  if (window.HHData.GUEST_STORAGE_KEY !== "huahua.guestGarden.v1") throw new Error("guest storage key is not versioned");

  const plant = {
    id: "plant-guest-1",
    name: "小薄荷",
    species: "薄荷",
    diary: [{ id: "entry-1", text: "第一次见面" }],
  };
  await window.HHData.createPlantWithFirstEntry(plant);
  plant.name = "薄荷糖";
  await window.HHData.updatePlant(plant);
  await window.HHData.addDiaryEntry(plant.id, { id: "entry-2", text: "今天浇水了" });

  const restored = await window.HHData.bootstrap(account);
  if (restored.plants.length !== 1) throw new Error("guest plant was not restored");
  if (restored.plants[0].name !== "薄荷糖") throw new Error("guest plant update was not persisted");
  if (restored.plants[0].diary[0].id !== "entry-2") throw new Error("guest diary entry was not prepended");
  if (cloudCalls !== 0) throw new Error(`guest path called cloud ${cloudCalls} times`);

  console.log("GUEST_DATA_SERVICE_OK");
})().catch(error => {
  console.error(error);
  process.exit(1);
});
