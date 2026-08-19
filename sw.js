/* Or Barak · Educativo — service worker mínimo.
   Sirve para que la app se pueda instalar y para que abra aunque la señal esté mala.
   No guarda en caché nada del Apps Script: los datos siempre se piden a la red. */

const CACHE = "orbarak-educativo-v1";
const BASE = ["./", "./index.html", "./icono.svg", "./icono-192.png", "./manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Todo lo que va al Apps Script pasa derecho a la red, sin caché.
  if (url.hostname.indexOf("script.google") !== -1 || e.request.method !== "GET") return;

  // El resto: primero red (para que una actualización se vea de inmediato), luego caché.
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
