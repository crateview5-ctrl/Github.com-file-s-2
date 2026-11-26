// Teacher selection: Mr. Adrian (male) or Ms. Diana (female).
// Tap a teacher to select; press Next to go to the home screen. The choice is saved on the device.
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
    .th{font:800 22px/1.15 var(--disp);margin:4px 2px 6px}
    .ts{margin:0 2px 14px;color:var(--muted);font-weight:800;font-size:14px}
    .tgrid{display:flex;gap:12px;margin-bottom:14px;align-items:stretch}
    .tcard{flex:1;position:relative;border:2px solid #dceaf8;border-radius:20px;background:#fff;padding:16px 8px 14px;text-align:center;font:inherit;color:var(--ink)}
    .tpic{position:relative;width:100%;max-width:130px;aspect-ratio:1/1;margin:0 auto 10px;border-radius:50%;overflow:hidden;background:#cfe3f3;border:3px solid #dceaf8;display:flex;align-items:center;justify-content:center;font:800 3.4rem var(--disp);color:#7aa3c4}
    .tpic img{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;object-position:top}
    .tcard b{display:block;font:700 18px var(--disp)}
    .tcard small{display:block;margin-top:2px;font-weight:800;font-size:12.5px;color:#7d90ac}
    .tick{position:absolute;top:8px;right:8px;width:26px;height:26px;border-radius:50%;background:var(--blue);color:#fff;font-weight:800;display:none;align-items:center;justify-content:center}
    .tcard.on{border-color:var(--blue);background:#f0f7ff}
    .tcard.on .tpic{border-color:var(--blue)}
    .tcard.on .tick{display:flex}
    .tcard.on small{color:var(--blue)}
    .tmsg{text-align:center;font-weight:800;color:#3f5273;margin:0 0 12px;min-height:1.4em}
    .tnext{display:block;width:100%;min-height:56px;border:0;border-radius:16px;background:var(--sun);color:var(--ink);font:800 17.5px var(--disp);padding:12px}
    .tnext:active{transform:scale(.97)}`;
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
    let sel = get();
    view.innerHTML = `
    <h2 class="th">Who would you like to learn with?</h2>
    <p class="ts">Tap a teacher to choose them.</p>
    <div class="tgrid">` + LIST.map(t => `
      <button class="tcard" data-id="${t.id}" aria-pressed="false" aria-label="Choose ${t.title}">
        <span class="tick">✓</span>
        <span class="tpic">${t.initial}${urls[t.id] ? `<img src="${urls[t.id]}" alt="">` : ""}</span>
        <b>${t.title}</b>
        <small>Tap to choose</small>
      </button>`).join("") + `
    </div>
    <p class="tmsg" id="tmsg"></p>
    <button class="tnext" id="tnext">Next</button>`;
    const cards = view.querySelectorAll(".tcard");
    const refresh = () => {
      cards.forEach(c => {
        const on = c.dataset.id === sel;
        c.classList.toggle("on", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
        c.querySelector("small").textContent = on ? "Selected" : "Tap to choose";
      });
      document.getElementById("tmsg").textContent = sel ? info(sel).title + " selected" : "No teacher chosen yet";
      document.getElementById("tnext").textContent = sel ? "Next - with " + info(sel).title : "Next";
    };
    cards.forEach(c => c.onclick = () => { sel = c.dataset.id; store.set("teacher", sel); refresh(); });
    document.getElementById("tnext").onclick = opts.done;
    refresh();
  }

  return { show, get, current, info, audioDir };
})();
