/* ============================================================
   花花日记本 MVP · CloudBase PostgreSQL per-user data boundary
   Tables: profiles, plants, diary_entries
   ============================================================ */
(function () {
  const TABLES = {
    profiles: "profiles",
    plants: "plants",
    diaryEntries: "diary_entries",
  };
  const GUEST_STORAGE_KEY = "huahua.guestGarden.v1";
  let activeAccount = null;

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function clean(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function currentOwnerId() {
    const id = activeAccount && activeAccount.id;
    if (!id) throw new Error("请先登录，再打开自己的花园");
    return id;
  }

  function isGuestAccount(account = activeAccount) {
    return Boolean(account && account.guest);
  }

  function emptyGuestGarden(account = activeAccount) {
    return {
      profile: {
        ownerId: (account && account.id) || "guest-local",
        email: "",
        onboarded: false,
        guest: true,
      },
      plants: [],
    };
  }

  function readGuestGarden(account = activeAccount) {
    const fallback = emptyGuestGarden(account);
    try {
      const raw = window.localStorage.getItem(GUEST_STORAGE_KEY);
      if (!raw) return fallback;
      const saved = JSON.parse(raw);
      return {
        profile: { ...fallback.profile, ...(saved && saved.profile ? saved.profile : {}), guest: true },
        plants: Array.isArray(saved && saved.plants) ? clone(saved.plants) : [],
      };
    } catch (_) {
      return fallback;
    }
  }

  function writeGuestGarden(garden) {
    const safeGarden = {
      profile: { ...garden.profile, guest: true },
      plants: clone(garden.plants || []),
    };
    window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(safeGarden));
    return clone(safeGarden);
  }

  function rowsFrom(result) {
    if (result && result.error) throw result.error;
    const data = result && result.data !== undefined ? result.data : result;
    return Array.isArray(data) ? data : [];
  }

  function jsonFrom(value) {
    if (!value) return {};
    if (typeof value === "string") {
      try { return JSON.parse(value); } catch (_) { return {}; }
    }
    return typeof value === "object" ? value : {};
  }

  function plantFromRow(row) {
    return {
      ...jsonFrom(row.data),
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  function entryFromRow(row) {
    return {
      ...jsonFrom(row.data),
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  function profileFromRow(row, fallback) {
    if (!row) return fallback;
    return {
      ownerId: row.owner_id,
      email: row.email || "",
      onboarded: Boolean(row.onboarded),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  function throwWriteError(result) {
    if (result && result.error) throw result.error;
    return result;
  }

  async function bootstrap(account) {
    activeAccount = account;
    if (isGuestAccount(account)) {
      const garden = readGuestGarden(account);
      window.PLANTS = clone(garden.plants);
      window.CACTUS = window.PLANTS[0] || null;
      return { profile: clone(garden.profile), plants: window.PLANTS };
    }
    if (window.HHCloud.demo) {
      window.PLANTS = clone(window.DEMO_PLANTS || []);
      window.CACTUS = window.PLANTS[0] || null;
      return { profile: { ownerId: account.id, email: account.email, onboarded: true, demo: true }, plants: window.PLANTS };
    }

    const uid = currentOwnerId();
    try {
      const { db } = window.HHCloud.get();
      const [profileResult, plantsResult, diaryResult] = await Promise.all([
        db.from(TABLES.profiles).select("*").eq("owner_id", uid).limit(1),
        db.from(TABLES.plants).select("*").eq("owner_id", uid).limit(100),
        db.from(TABLES.diaryEntries).select("*").eq("owner_id", uid).limit(100),
      ]);
      const profileRows = rowsFrom(profileResult);
      const plantRows = rowsFrom(plantsResult);
      const diaryRows = rowsFrom(diaryResult);
      const byNewest = (a, b) => String(b.created_at || "").localeCompare(String(a.created_at || ""));
      const entries = diaryRows.sort(byNewest);
      const plants = plantRows.sort(byNewest).map(row => {
        const plant = plantFromRow(row);
        plant.diary = entries
          .filter(entry => entry.plant_id === plant.id)
          .map(entryFromRow);
        return plant;
      });
      window.PLANTS = plants;
      window.CACTUS = plants[0] || null;
      return {
        profile: profileFromRow(profileRows[0], { ownerId: uid, email: account.email, onboarded: false }),
        plants,
      };
    } catch (error) {
      throw new Error(error && error.message ? `花园数据没有载入：${error.message}` : "花园数据没有载入，请稍后重试");
    }
  }

  async function setOnboarded(account) {
    activeAccount = account || activeAccount;
    if (isGuestAccount()) {
      const garden = readGuestGarden();
      garden.profile = { ...garden.profile, onboarded: true, guest: true };
      writeGuestGarden(garden);
      return clone(garden.profile);
    }
    if (window.HHCloud.demo) return { ...(activeAccount || {}), onboarded: true };
    const uid = currentOwnerId();
    const now = new Date().toISOString();
    const profile = {
      owner_id: uid,
      email: activeAccount.email || "",
      onboarded: true,
      created_at: activeAccount.createdAt || now,
      updated_at: now,
    };
    const { db } = window.HHCloud.get();
    throwWriteError(await db.from(TABLES.profiles).upsert(profile, { onConflict: "owner_id" }));
    return profileFromRow(profile);
  }

  async function createPlantWithFirstEntry(plant) {
    if (isGuestAccount()) {
      const garden = readGuestGarden();
      const savedPlant = clone(plant);
      const existingIndex = garden.plants.findIndex(item => item.id === savedPlant.id);
      if (existingIndex >= 0) garden.plants.splice(existingIndex, 1, savedPlant);
      else garden.plants.unshift(savedPlant);
      garden.profile = { ...garden.profile, onboarded: true, guest: true };
      writeGuestGarden(garden);
      return clone(savedPlant);
    }
    if (window.HHCloud.demo) return clone(plant);
    const uid = currentOwnerId();
    const { db } = window.HHCloud.get();
    const now = new Date().toISOString();
    const entries = plant.diary || [];
    const { diary, id, createdAt, updatedAt, ...plantFields } = plant;
    const plantRow = clean({ id: plant.id, owner_id: uid, data: plantFields, created_at: now, updated_at: now });
    throwWriteError(await db.from(TABLES.plants).upsert(plantRow, { onConflict: "id" }));
    try {
      for (const entry of entries) {
        const { id: entryId, createdAt: _createdAt, updatedAt: _updatedAt, ...entryFields } = entry;
        const entryRow = clean({
          id: entryId,
          owner_id: uid,
          plant_id: plant.id,
          data: entryFields,
          created_at: now,
          updated_at: now,
        });
        throwWriteError(await db.from(TABLES.diaryEntries).upsert(entryRow, { onConflict: "id" }));
      }
      await setOnboarded(activeAccount);
      return clone(plant);
    } catch (error) {
      for (const entry of entries) {
        try { await db.from(TABLES.diaryEntries).delete().eq("id", entry.id); } catch (_) {}
      }
      try { await db.from(TABLES.plants).delete().eq("id", plant.id); } catch (_) {}
      throw error;
    }
  }

  async function updatePlant(plant) {
    if (isGuestAccount()) {
      const garden = readGuestGarden();
      const existingIndex = garden.plants.findIndex(item => item.id === plant.id);
      if (existingIndex < 0) throw new Error("这株植物还没有保存在本地花园里");
      garden.plants.splice(existingIndex, 1, clone(plant));
      writeGuestGarden(garden);
      return clone(plant);
    }
    if (window.HHCloud.demo) return clone(plant);
    currentOwnerId();
    const { diary, id, createdAt, updatedAt, ...plantFields } = plant;
    const payload = clean({ data: plantFields, updated_at: new Date().toISOString() });
    const { db } = window.HHCloud.get();
    throwWriteError(await db.from(TABLES.plants).update(payload).eq("id", plant.id));
    return clone(plant);
  }

  async function addDiaryEntry(plantId, entry) {
    if (isGuestAccount()) {
      const garden = readGuestGarden();
      const plant = garden.plants.find(item => item.id === plantId);
      if (!plant) throw new Error("这株植物还没有保存在本地花园里");
      plant.diary = Array.isArray(plant.diary) ? plant.diary : [];
      plant.diary.unshift(clone(entry));
      writeGuestGarden(garden);
      return clone(entry);
    }
    if (window.HHCloud.demo) return clone(entry);
    const uid = currentOwnerId();
    const now = new Date().toISOString();
    const { id, createdAt, updatedAt, ...entryFields } = entry;
    const row = clean({
      id: entry.id,
      owner_id: uid,
      plant_id: plantId,
      data: entryFields,
      created_at: now,
      updated_at: now,
    });
    const { db } = window.HHCloud.get();
    throwWriteError(await db.from(TABLES.diaryEntries).upsert(row, { onConflict: "id" }));
    return clone(entry);
  }

  window.HHData = {
    TABLES,
    GUEST_STORAGE_KEY,
    bootstrap,
    setOnboarded,
    createPlantWithFirstEntry,
    updatePlant,
    addDiaryEntry,
  };
})();
