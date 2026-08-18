/* ============================================================
   花花日记本 MVP · CloudBase per-user data boundary
   Collections: profiles, plants, diary_entries
   ============================================================ */
(function () {
  const COLLECTIONS = {
    profiles: "profiles",
    plants: "plants",
    diaryEntries: "diary_entries",
  };
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

  function listFrom(result) {
    const data = result && result.data !== undefined ? result.data : result;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.list)) return data.list;
    if (data && Array.isArray(data.records)) return data.records;
    return [];
  }

  function docFrom(result) {
    const data = result && result.data !== undefined ? result.data : result;
    if (Array.isArray(data)) return data[0] || null;
    if (data && data.data && !Array.isArray(data.data)) return data.data;
    return data && typeof data === "object" ? data : null;
  }

  function stripMeta(doc) {
    if (!doc) return null;
    const { _id, ownerId, createdAt, updatedAt, plantId, ...rest } = doc;
    return rest;
  }

  async function readProfile(db, uid) {
    try {
      return docFrom(await db.collection(COLLECTIONS.profiles).doc(uid).get());
    } catch (error) {
      const raw = String(error && (error.message || error.code) || "").toLowerCase();
      if (raw.includes("not found") || raw.includes("does not exist") || raw.includes("document_not_found")) return null;
      throw error;
    }
  }

  async function bootstrap(account) {
    activeAccount = account;
    if (window.HHCloud.demo) {
      window.PLANTS = clone(window.DEMO_PLANTS || []);
      window.CACTUS = window.PLANTS[0] || null;
      return { profile: { ownerId: account.id, email: account.email, onboarded: true, demo: true }, plants: window.PLANTS };
    }

    const uid = currentOwnerId();
    try {
      const { db } = window.HHCloud.get();
      const [profile, plantsResult, diaryResult] = await Promise.all([
        readProfile(db, uid),
        db.collection(COLLECTIONS.plants).where({ ownerId: uid }).limit(100).get(),
        db.collection(COLLECTIONS.diaryEntries).where({ ownerId: uid }).limit(100).get(),
      ]);
      const byNewest = (a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
      const entries = listFrom(diaryResult).sort(byNewest);
      const plants = listFrom(plantsResult).sort(byNewest).map(doc => {
        const plant = stripMeta(doc);
        plant.diary = entries
          .filter(entry => entry.plantId === plant.id)
          .map(stripMeta);
        return plant;
      });
      window.PLANTS = plants;
      window.CACTUS = plants[0] || null;
      return {
        profile: profile || { ownerId: uid, email: account.email, onboarded: false },
        plants,
      };
    } catch (error) {
      throw new Error(error && error.message ? `花园数据没有载入：${error.message}` : "花园数据没有载入，请稍后重试");
    }
  }

  async function setOnboarded(account) {
    activeAccount = account || activeAccount;
    if (window.HHCloud.demo) return { ...(activeAccount || {}), onboarded: true };
    const uid = currentOwnerId();
    const now = new Date().toISOString();
    const profile = clean({
      ownerId: uid,
      email: activeAccount.email || "",
      onboarded: true,
      createdAt: activeAccount.createdAt || now,
      updatedAt: now,
    });
    const { db } = window.HHCloud.get();
    await db.collection(COLLECTIONS.profiles).doc(uid).set(profile);
    return profile;
  }

  async function createPlantWithFirstEntry(plant) {
    if (window.HHCloud.demo) return clone(plant);
    const uid = currentOwnerId();
    const { db } = window.HHCloud.get();
    const now = new Date().toISOString();
    const entries = plant.diary || [];
    const { diary, ...plantFields } = plant;
    const plantDoc = clean({ ...plantFields, ownerId: uid, createdAt: now, updatedAt: now });
    await db.collection(COLLECTIONS.plants).doc(plant.id).set(plantDoc);
    try {
      for (const entry of entries) {
        const entryDoc = clean({ ...entry, ownerId: uid, plantId: plant.id, createdAt: now, updatedAt: now });
        await db.collection(COLLECTIONS.diaryEntries).doc(entry.id).set(entryDoc);
      }
      await setOnboarded(activeAccount);
      return clone(plant);
    } catch (error) {
      for (const entry of entries) {
        try { await db.collection(COLLECTIONS.diaryEntries).doc(entry.id).remove(); } catch (_) {}
      }
      try { await db.collection(COLLECTIONS.plants).doc(plant.id).remove(); } catch (_) {}
      throw error;
    }
  }

  async function updatePlant(plant) {
    if (window.HHCloud.demo) return clone(plant);
    const uid = currentOwnerId();
    const { diary, ...plantFields } = plant;
    const payload = clean({ ...plantFields, ownerId: uid, updatedAt: new Date().toISOString() });
    const { db } = window.HHCloud.get();
    await db.collection(COLLECTIONS.plants).doc(plant.id).update(payload);
    return clone(plant);
  }

  async function addDiaryEntry(plantId, entry) {
    if (window.HHCloud.demo) return clone(entry);
    const uid = currentOwnerId();
    const now = new Date().toISOString();
    const payload = clean({ ...entry, ownerId: uid, plantId, createdAt: now, updatedAt: now });
    const { db } = window.HHCloud.get();
    await db.collection(COLLECTIONS.diaryEntries).doc(entry.id).set(payload);
    return clone(entry);
  }

  window.HHData = {
    COLLECTIONS,
    bootstrap,
    setOnboarded,
    createPlantWithFirstEntry,
    updatePlant,
    addDiaryEntry,
  };
})();
