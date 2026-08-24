/* ============================================================
   花花日记本 MVP · browser location + live weather
   Weather: Open-Meteo (no key). City: BigDataCloud client API.
   ============================================================ */
(function () {
  const fallback = {
    city: "上海", weather: "小雨", temp: 22, icon: "cloudRain",
    phrase: "细雨天", note: "宜窝在家，陪花说说话", tint: "#5c6b7a",
    sky: ["#aebccb", "#c8ced4"], live: false,
  };
  let current = fallback;
  let pending = null;

  function moodFor(code) {
    if (code === 0) return { weather: "晴", icon: "sun", phrase: "阳光正好", note: "晒晒你，也晒晒它们", tint: "#b3852f", sky: ["#f7e2a2", "#f4e7cf"] };
    if ([1, 2, 3, 45, 48].includes(code)) return { weather: "多云", icon: "cloud", phrase: "云慢悠悠的", note: "刚刚好的一天", tint: "#79806f", sky: ["#d2d7cf", "#e4e2d4"] };
    return { weather: "小雨", icon: "cloudRain", phrase: "细雨天", note: "宜窝在家，陪花说说话", tint: "#5c6b7a", sky: ["#aebccb", "#c8ced4"] };
  }

  function locate() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("当前浏览器不支持定位"));
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000,
      });
    });
  }

  async function load(force = false) {
    if (force) pending = null;
    if (pending) return pending;
    pending = (async () => {
      try {
        const position = await locate();
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&current=temperature_2m,weather_code&timezone=auto`;
        const cityURL = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&localityLanguage=zh`;
        const [weatherResponse, cityResponse] = await Promise.all([fetch(weatherURL), fetch(cityURL)]);
        if (!weatherResponse.ok) throw new Error("天气服务暂时不可用");
        const weatherData = await weatherResponse.json();
        const cityData = cityResponse.ok ? await cityResponse.json() : {};
        const live = weatherData.current || {};
        const mood = moodFor(Number(live.weather_code));
        current = {
          ...mood,
          city: cityData.city || cityData.locality || cityData.principalSubdivision || fallback.city,
          temp: Math.round(Number(live.temperature_2m)), live: true,
        };
        return current;
      } catch (error) {
        current = { ...fallback, error: error && error.message ? error.message : "定位不可用" };
        return current;
      }
    })();
    return pending;
  }

  function currentLabel() {
    const icon = current.weather === "晴" ? "☀️" : current.weather === "多云" ? "☁️" : "🌧";
    return `${icon} ${current.weather} ${current.temp}°`;
  }

  window.HHWeather = { load, refresh: () => load(true), current: () => current, currentLabel };
})();
