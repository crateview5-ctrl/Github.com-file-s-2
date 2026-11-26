// Teacher selection: Adrian (male) or Diana (female).
// The choice is saved on the device. Each teacher can have your own picture, saved on this phone.
//
// TEMPORARY FEATURE: the "Upload photo" buttons are only for saving your own character pictures once.
// When both pictures are saved, ask for the upload buttons to be removed (the pictures stay saved).
const Teacher = (() => {
  const LIST = [
    { id: "adrian", name: "Adrian", role: "Male teacher", line: "Calm, kind and patient", initial: "A" },
    { id: "diana", name: "Diana", role: "Female teacher", line: "Warm, gentle and encouraging", initial: "D" }
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
  const picSet = (id, blob) => dbOpen().then(db => new Promise((res, rej) => {
    const tx = db.transaction("pics", "readwrite");
    tx.objectStore("pics").put(blob, id);
    tx.oncomplete = () => res(true);
    tx.onerror = () => rej(tx.error);
  }));

  function addStyles() {
    if (document.getElementById("teacher-css")) return;
    const s = document.createElement("style");
    s.id = "teacher-css";
    s.textContent = `
    .tgrid{display:flex;gap:12px;margin-bottom:14px}
    .tcard{flex:1;position:relative;border:4px solid #cfe3f3;border-radius:24px;background:#fff;padding:10px 8px 12px;text-align:center;box-shadow:0 4px 0 #c9e3f5}
    .tsel{display:block;width:100%;border:0;background:none;font:inherit;color:var(--ink);padding:0}
    .tpic{position:relative;width:100%;max-width:170px;aspect-ratio:1/1;margin:0 auto 8px;border-radius:20px;overflow:hidden;background:#cfe3f3;display:flex;align-items:center;justify-content:center;font-size:4rem;font-weight:800;color:#7aa3c4}
    .tpic img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top}
    .tsel b{display:block;font-size:1.35rem}
    .tsel span{display:block;font-size:.9rem;margin-top:2px;font-weight:700;color:#4a5b78}
    .tsel small{display:block;font-size:.8rem;margin-top:4px;color:#5b6b80}
    .tcard.on{border-color:var(--green);background:#e3f8ec;box-shadow:0 4px 0 #1c8f52}
    .tcard.on::after{content:"\\2713";position:absolute;top:8px;right:8px;width:30px;height:30px;line-height:30px;border-radius:50%;background:var(--green);color:#fff;font-weight:800}
    .tup{display:block;margin-top:10px;padding:10px 6px;border-radius:14px;background:var(--sun);color:var(--ink);font-weight:700;font-size:.9rem}
    .tup input{display:none}
    .tnote{min-height:1.4em;font-weight:700;color:#b05a00;text-align:center;margin:4px 0 0}
    .btn[disabled]{opacity:.45}`;
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
    let msg = "";
    const draw = () => {
      const pick = get();
      const note = msg || (pick && !VOICE_READY[pick] ? info(pick).name + "'s voice is coming soon. For now the lessons use Adrian's voice." : "");
      view.innerHTML = `
      <div class="card hello"><p class="q">Choose your teacher</p></div>
      <div class="tgrid">` + LIST.map(t => `
        <div class="tcard${pick === t.id ? " on" : ""}">
          <button class="tsel" data-id="${t.id}" aria-pressed="${pick === t.id}">
            <div class="tpic">${t.initial}${urls[t.id] ? `<img src="${urls[t.id]}" alt="${t.name}">` : ""}</div>
            <b>${t.name}</b><span>${t.role}</span><small>${t.line}</small>
          </button>
          <label class="tup">📷 Upload photo<input type="file" accept="image/*" data-up="${t.id}"></label>
        </div>`).join("") + `
      </div>
      <p class="tnote">${note}</p>
      <button class="btn go" id="tgo"${pick ? "" : " disabled"}>${pick ? "Continue" : "Tap a teacher"}</button>`;
      view.querySelectorAll(".tsel").forEach(b => b.onclick = () => { msg = ""; store.set("teacher", b.dataset.id); draw(); });
      view.querySelectorAll("[data-up]").forEach(inp => inp.onchange = () => {
        const f = inp.files && inp.files[0];
        if (!f) return;
        const id = inp.dataset.up;
        picSet(id, f).then(() => {
          if (urls[id]) URL.revokeObjectURL(urls[id]);
          urls[id] = URL.createObjectURL(f);
          msg = info(id).name + "'s photo is saved on this phone.";
          draw();
        }).catch(() => { msg = "Could not save the photo on this phone."; draw(); });
      });
      view.querySelector("#tgo").onclick = () => { if (get()) opts.done(); };
    };
    draw();
  }

  return { show, get, current, info, audioDir };
})();
