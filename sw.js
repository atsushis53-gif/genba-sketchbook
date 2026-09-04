// 現場スケッチ service worker — オフラインでも開けるようにする最小構成
// 方針：画面（HTML）はネットワーク優先。電波が悪い・圏外のときだけキャッシュを出す。
// 　　　アイコンやmanifestはキャッシュ優先＋裏で更新。
const CACHE_NAME = "genba-sketch-v4";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
const NET_TIMEOUT = 2500; // これを過ぎたらキャッシュを出す（裏の取得は続ける）

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // cache:"reload" でブラウザのHTTPキャッシュを迂回し、必ず取り直す。
      // 1つ失敗しても install 自体は続ける（addAll だと全部巻き添えで失敗する）。
      Promise.all(ASSETS.map((url) =>
        fetch(url, { cache: "reload" })
          .then((res) => (res && res.ok ? cache.put(url, res) : null))
          .catch(() => null)
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function putInCache(request, response){
  if (!response || !response.ok) return response;
  const clone = response.clone();
  caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
  return response;
}

// 画面：ネットワーク優先。遅い・繋がらないときだけキャッシュに落ちる。
function pageFirstFromNetwork(request){
  return new Promise((resolve) => {
    let settled = false;
    const done = (res) => { if (!settled && res){ settled = true; resolve(res); } };
    const timer = setTimeout(() => { caches.match(request).then(done); }, NET_TIMEOUT);
    fetch(request)
      .then((res) => { clearTimeout(timer); putInCache(request, res); done(res); })
      .catch(() => {
        clearTimeout(timer);
        caches.match(request)
          .then((hit) => hit || caches.match("./index.html"))
          .then((hit) => { if (hit) done(hit); else done(Response.error()); });
      });
  });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  // API呼び出し（api.anthropic.com）はキャッシュせず素通し
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  const isPage = request.mode === "navigate" ||
                 url.pathname.endsWith("/") ||
                 url.pathname.endsWith(".html");
  if (isPage){
    event.respondWith(pageFirstFromNetwork(request));
    return;
  }

  // アイコン・manifest はキャッシュ優先＋裏で更新（stale-while-revalidate）
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request).then((res) => putInCache(request, res)).catch(() => cached);
      return cached || fetched;
    })
  );
});
