const CACHE = "brightsteps-v32";
const FILES = ["./", "index.html", "style.css", "app.js", "english.js", "lessons.js", "glyphs.js", "writing.js", "teacher.js", "bunny.js", "splash.js", "splash-plate.webp", "splash-boy.webp", "manifest.json", "icon-192.png", "icon-512.png", "recorder.html"];
// v31: install must never fail as a whole. caches.addAll() rejects if ANY single file
// 404s, which leaves the old service worker in place and the app looking exactly the
// same — so each file is cached on its own and a missing one is skipped instead.
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => null))))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const isAudio = /\.(mp3|webm|ogg|wav)$/i.test(new URL(e.request.url).pathname);
  if (isAudio) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      if (r.ok && r.status === 200) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); }
      return r;
    })));
  } else {
    e.respondWith(fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); }
      return r;
    }).catch(() => caches.match(e.request)));
  }
});
