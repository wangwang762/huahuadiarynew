/* ============================================================
   花花日记本 MVP · public CloudBase browser configuration
   Environment IDs are public. Never place admin credentials here.
   ============================================================ */
(function () {
  const env = "huahuadiary-d4gajnlumc8432f6c";
  const region = "ap-shanghai";
  const params = new URLSearchParams((window.location && window.location.search) || "");
  const demo = params.get("demo") === "1"; // explicit preview: ?demo=1
  let services = null;

  function get() {
    if (demo) throw new Error("演示模式不连接远端花园");
    if (services) return services;
    if (!window.cloudbase || typeof window.cloudbase.init !== "function") {
      throw new Error("花园服务没有加载出来，请检查网络后重试");
    }

    const app = window.cloudbase.init({ env, region });
    const auth = typeof app.auth === "function"
      ? app.auth({ persistence: "local" })
      : app.auth;
    const db = typeof app.database === "function" ? app.database() : app.database;
    if (!auth || !db) throw new Error("花园服务初始化失败，请稍后再试");
    services = { app, auth, db };
    return services;
  }

  window.HHCloud = { env, region, demo, get };
})();
