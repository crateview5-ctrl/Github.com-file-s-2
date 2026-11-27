// Teacher selection screen of the final design: Mr. Adrian (male) or Ms. Diana (female).
// Tap a teacher to select; Next goes on (it works even before a teacher is chosen, as designed).
// The choice is saved on the device and decides whose voice the lessons use.
// Photos: assets/mr-adrian.jpg and assets/ms-diana.jpg from the design. If those files are not in the
// repo yet, the pictures saved on this phone earlier (IndexedDB) are shown instead.
const Teacher = (() => {
  const LIST = [
    { id: "adrian", title: "Mr. Adrian", img: "assets/mr-adrian.jpg", alt: "Mr. Adrian, smiling, wearing a navy cardigan over a light blue shirt" },
    { id: "diana", title: "Ms. Diana", img: "assets/ms-diana.jpg", alt: "Ms. Diana, smiling, wearing a beige blazer over a blue shirt" }
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

  const STAR = '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9L12 2.6z" fill="#ffc82e"/></svg>';
  const BACK = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  const TICK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const OK = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="flex:none;margin-top:1px"><circle cx="12" cy="12" r="10" fill="#166b45"/><path d="M8 12.5l2.6 2.6L16 9.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // opts: { stars, back(), done() }
  async function show(opts) {
    const view = document.querySelector("#view");
    const urls = {};
    for (const t of LIST) {
      const blob = await picGet(t.id);
      if (blob) urls[t.id] = URL.createObjectURL(blob);
    }
    let sel = get();
    view.innerHTML = `
    <div class="phone" id="phone-teacher">
      <div class="screen">
        <div class="appbar">
          <button class="backbtn" id="btn-back" type="button" aria-label="Back to home screen">${BACK}</button>
          <span class="ttl">Choose your teacher</span>
          <span class="stars" aria-label="${opts.stars} stars">${STAR}${opts.stars}</span>
        </div>
        <div class="appbody">
          <div class="t-intro">
            <h3>Who would you like to learn with?</h3>
            <p>Tap a teacher to choose them.</p>
          </div>
          <div class="t-grid" role="radiogroup" aria-label="Choose your teacher">` + LIST.map(t => `
            <button class="teacher" type="button" role="radio" aria-checked="false" data-id="${t.id}" data-name="${t.title}">
              <span class="tick" aria-hidden="true">${TICK}</span>
              <img src="${t.img}" alt="${t.alt}" />
              <span class="nm">${t.title}</span>
              <span class="role">Tap to choose</span>
            </button>`).join("") + `
          </div>
          <p class="sel-msg" id="sel-msg" aria-live="polite">No teacher chosen yet</p>
          <button class="cta ready" id="btn-continue" type="button">Next</button>
          <div class="success" id="success" role="status">
            ${OK}
            <p id="success-text">Great choice!</p>
          </div>
        </div>
      </div>
    </div>`;
    // If an image file from the design is missing, use the picture saved on this phone.
    view.querySelectorAll(".teacher img").forEach(img => {
      const id = img.closest(".teacher").dataset.id;
      img.onerror = () => { img.onerror = null; if (urls[id]) img.src = urls[id]; };
    });
    const cards = view.querySelectorAll(".teacher");
    const refresh = () => {
      cards.forEach(c => {
        const on = c.dataset.id === sel;
        c.classList.toggle("selected", on);
        c.setAttribute("aria-checked", on ? "true" : "false");
        c.querySelector(".role").textContent = on ? "Selected" : "Tap to choose";
      });
      document.getElementById("sel-msg").textContent = sel ? info(sel).title + " selected" : "No teacher chosen yet";
      document.getElementById("btn-continue").textContent = sel ? "Next · with " + info(sel).title : "Next";
    };
    cards.forEach(c => c.onclick = () => { sel = c.dataset.id; store.set("teacher", sel); refresh(); });
    document.getElementById("btn-back").onclick = opts.back;
    let going = false;
    document.getElementById("btn-continue").onclick = () => {
      if (going) return;
      if (sel) {
        going = true;
        document.getElementById("success-text").textContent = "Great choice! " + info(sel).title + " is your teacher. Now your English levels open — see screen 03.";
        document.getElementById("success").classList.add("show");
        setTimeout(opts.done, 1200);
      } else opts.done();
    };
    refresh();
  }

  return { show, get, current, info, audioDir };
})();
