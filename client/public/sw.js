const CACHE_NAME = "ouvidoria-v1";

// App shell mínimo
const APP_SHELL = ["/", "/manifest.json", "/icon/favicon.svg"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(names =>
        Promise.all(
          names.map(name => (name !== CACHE_NAME ? caches.delete(name) : null))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const req = event.request;

  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // ✅ evita erro de cache com chrome-extension:// etc
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Não cachear chamadas da API
  if (url.origin === "https://api.simplificagov.com") return;

  // Navegação SPA: network-first com fallback para cache (e depois /index.html)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put("/", copy));
          }
          return res;
        })
        .catch(
          async () =>
            (await caches.match("/")) || (await caches.match("/index.html"))
        )
    );
    return;
  }

  // Assets estáticos: cache-first, atualiza em background
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req)
        .then(res => {
          if (
            res &&
            res.status === 200 &&
            (res.type === "basic" || res.type === "cors")
          ) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
