// Teacher selection: Mr. Adrian (male) or Ms. Diana (female).
// Tap a teacher to choose; the choice is saved on the device and the app goes to the home screen.
// Teacher pictures saved on this phone earlier (IndexedDB) are shown in the circles.
const Teacher = (() => {
  const LIST = [
    { id: "adrian", name: "Adrian", title: "Mr. Adrian", initial: "A" },
    { id: "diana", name: "Diana", title: "Ms. Diana", initial: "D" }
  ];
  // Voice folders that exist on GitHub (audio/adrian/ ...). Diana's clips are not uploaded yet,
  // so lessons keep playing Adrian's clips even when Diana is chosen.
  // When audio/diana/ is ready (same file names with diana_ instead of adrian_), change diana to true.
  const VOICE_READY = { adrian: true, diana: false };

  const get = () => { const t = store.get("teacher", null); return t === "adrian" || t === "diana" ? t : null; };
  const current = () => get() || "adrian";
  const info = id => LIST.find(t => t.id === id) || LIST[0];
  const audioDir = () => (VOICE_READY[current()] ? current() : "adrian");

  // ---- pictures saved on this phone (IndexedDB keeps the original quality) ----
  const dbOpen = () => new Promise((res, rej) => {
    try {
      const r = indexedDB.open("bs_teacher_pics", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("pics");
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    } catch (e) { rej(e); }
  });
  const picGet = id => dbOpen().then(db => new Promise(res => {
    const q = db.transaction("pics").objectStore("pics").get(id);
    q.onsuccess = () => res(q.result || null);
    q.onerror = () => res(null);
  })).catch(() => null);

  function addStyles() {
    if (document.getElementById("teacher-css")) return;
    const s = document.createElement("style");
    s.id = "teacher-css";
    s.textContent = `
    .tgrid{display:flex;gap:12px;margin-bottom:14px;align-items:stretch}
    .tcard{flex:1;display:flex;flex-direction:column;position:relative;border:4px solid #cfe3f3;border-radius:24px;background:#fff;padding:18px 8px 16px;text-align:center;box-shadow:0 4px 0 #c9e3f5}
    .tsel{display:block;width:100%;flex:1;border:0;background:none;font:inherit;color:var(--ink);padding:0}
    .tpic{position:relative;width:100%;max-width:150px;aspect-ratio:1/1;margin:0 auto 14px;border-radius:50%;overflow:hidden;background:#cfe3f3;border:4px solid #fff;box-shadow:0 0 0 3px #cfe3f3,0 8px 16px rgba(29,43,79,.18);display:flex;align-items:center;justify-content:center;font-size:3.6rem;font-weight:800;color:#7aa3c4}
    .tpic img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top}
    .tsel b{display:block;font-size:1.4rem}
    .tcard.on{border-color:var(--green);background:#e3f8ec;box-shadow:0 4px 0 #1c8f52}
    .tcard.on .tpic{box-shadow:0 0 0 3px var(--green),0 8px 16px rgba(29,43,79,.18)}`;
    document.head.appendChild(s);
  }

  // opts.setTitle(text) sets the top bar title; opts.done() goes on to the home screen.
  async function show(opts) {
    addStyles();
    opts.setTitle("Choose your teacher");
    const view = document.querySelector("#view");
    const urls = {};
    for (const t of LIST) {
      const blob = await picGet(t.id);
      if (blob) urls[t.id] = URL.createObjectURL(blob);
    }
    view.innerHTML = `
    <div class="card hello"><p class="q">Choose your teacher</p></div>
    <div class="tgrid">` + LIST.map(t => `
      <div class="tcard">
        <button class="tsel" data-id="${t.id}" aria-label="Choose ${t.title}">
          <div class="tpic">${t.initial}${urls[t.id] ? `<img src="${urls[t.id]}" alt="">` : ""}</div>
          <b>${t.title}</b>
        </button>
      </div>`).join("") + `
    </div>`;
    view.querySelectorAll(".tsel").forEach(b => b.onclick = () => {
      store.set("teacher", b.dataset.id);
      view.querySelectorAll(".tcard").forEach(c => c.classList.toggle("on", c.contains(b)));
      setTimeout(opts.done, 350);
    });
  }

  return { show, get, current, info, audioDir };
})();
