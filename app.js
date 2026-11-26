// Picture-word clips uploaded to audio/adrian/words with the default ElevenLabs file names.
// Each word maps to the time stamp in its file name.
const WORD_AUDIO_BASE = "audio/adrian/words/ElevenLabs_2026-10-18T";
const WORD_AUDIO_TAIL = "_Chris - Warm, Resonant, Thoughtful_pvc_sp100_s50_sb75_v3.mp3";
const WORD_TIME = {
  apple: "16_04_51", ant: "16_06_37", ball: "16_07_27", bus: "16_08_03", cat: "16_08_31", cup: "16_08_58",
  dog: "16_25_10", duck: "16_26_12", egg: "16_26_48", elephant: "16_28_53", fish: "16_29_52", frog: "16_30_49",
  goat: "16_31_32", grapes: "16_35_17", hat: "16_36_08", horse: "16_36_52", igloo: "16_37_30", insect: "16_38_08",
  jam: "16_38_47", jug: "16_39_19", kite: "16_39_52", key: "16_40_54", lion: "16_41_29", lemon: "16_42_03",
  moon: "16_42_48", monkey: "16_43_21", nest: "16_44_01", nose: "16_44_33", orange: "16_45_03", octopus: "16_45_41",
  pig: "16_46_30", pen: "16_47_53", queen: "16_48_28", quilt: "16_50_43", rabbit: "16_51_24", rain: "16_51_59",
  sun: "16_52_35", snake: "16_53_03", tiger: "16_53_44", tree: "16_54_23", umbrella: "16_55_01", uncle: "16_55_42",
  van: "16_57_15", violin: "16_58_08", watch: "16_58_40", worm: "16_59_44", xylophone: "17_00_20", xray: "17_01_02",
  yoyo: "17_01_47", yak: "17_02_21", zebra: "17_02_52", zip: "17_04_09"
};
// The clip "Which letter does this picture start with?"
// PASTE its full file name between the quotes below (the same one you used before).
// While this is empty, the phone's built-in voice asks the question instead.
const QUIZ_PICTURE_AUDIO = "";

// Two safe ways to write a file path, so a clip name with spaces or commas still loads.
const safeSrc = s => { let p = String(s); try { p = decodeURI(p); } catch (e) {} return encodeURI(p); };
const altSrc = s => { let p = String(s); try { p = decodeURI(p); } catch (e) {} return p.split("/").map(encodeURIComponent).join("/"); };

// Temporary red note at the bottom of the screen when a clip cannot play (to find problems).
function audioNote(t) {
  try {
    let n = document.getElementById("audio-note");
    if (!n) {
      n = document.createElement("div"); n.id = "audio-note";
      n.style.cssText = "position:fixed;left:8px;right:8px;bottom:8px;z-index:99999;background:#b3261e;color:#fff;font:12px/1.3 sans-serif;padding:8px 10px;border-radius:8px;word-break:break-all;box-shadow:0 2px 8px rgba(0,0,0,.4)";
      document.body.appendChild(n);
    }
    n.textContent = "Audio problem: " + t;
    clearTimeout(n._t); n._t = setTimeout(() => n.remove(), 12000);
  } catch (e) {}
}

// Which teacher's folder the names / sounds / quiz clips come from (see teacher.js).
// Until Diana's clips are uploaded this stays "adrian" even if Diana is chosen.
const tdir = () => (typeof Teacher !== "undefined" ? Teacher.audioDir() : "adrian");

// Level colours, in order. Each finished level takes the next colour; the ninth is green again.
const RAINBOW = ["#22a464", "#2783cc", "#4f55c4", "#8b46c7", "#c44fae", "#e5484d", "#f2760a", "#d99400"];

const Snd = {
  tok: 0,
  cur: null,
  stop() { try { speechSynthesis.cancel(); } catch (e) {} if (Snd.cur) { try { Snd.cur.pause(); } catch (e) {} Snd.cur = null; } },
  speak(t, rate = 0.7, done) {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(t);
      u.lang = "en-US"; u.rate = rate;
      if (done) { u.onend = done; u.onerror = done; }
      speechSynthesis.speak(u);
    } catch (e) { if (done) done(); }
  },
  // Plays a file. If it can't play, the phone's voice says the fallback text.
  // done() runs when it finishes, unless something newer started playing.
  play(src, fallback, done) {
    Snd.stop();
    const my = ++Snd.tok;
    const finish = () => { if (done && my === Snd.tok) done(); };
    let used = false;
    const viaVoice = () => { if (used) return; used = true; Snd.speak(fallback, 0.7, finish); };
    if (!src) return viaVoice();
    const tries = [safeSrc(src), altSrc(src)];
    const attempt = n => {
      let failed = false;
      const fail = why => {
        if (failed || my !== Snd.tok) return;
        failed = true;
        if (n + 1 < tries.length && tries[n + 1] !== tries[n]) attempt(n + 1);
        else { audioNote(why + " | " + tries[n]); viaVoice(); }
      };
      try {
        const a = new Audio(tries[n]);
        Snd.cur = a;
        a.onended = finish;
        a.onerror = () => fail("load error");
        a.play().catch(e => fail((e && e.name) || "play error"));
      } catch (e) { fail("exception"); }
    };
    attempt(0);
  },
  file(f, fallback) { Snd.play(f, fallback); },
  name(x) { const d = tdir(); Snd.play("audio/" + d + "/names/" + d + "_" + x.U + "_name.mp3", x.nameSay); },
  sound(x) { const d = tdir(); Snd.play("audio/" + d + "/sounds/" + d + "_" + x.U + "_sound.mp3", x.soundSay); },
  quiz(x) { const d = tdir(); Snd.play("audio/" + d + "/quiz/" + d + "_" + x.U + "_quiz.mp3", "Which letter makes this sound? " + x.soundSay); },
  word(w, done) {
    const key = String(w).toLowerCase().replace(/[^a-z]/g, "");
    const t = WORD_TIME[key];
    Snd.play(t ? WORD_AUDIO_BASE + t + WORD_AUDIO_TAIL : "", w, done);
  },
  quizPicture(done) {
    Snd.play(QUIZ_PICTURE_AUDIO, "Which letter does this picture start with?", done);
  }
};

const store = {
  get(k, d) { try { const v = localStorage.getItem("bs_" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("bs_" + k, JSON.stringify(v)); } catch (e) {} }
};

const App = (() => {
  const $ = s => document.querySelector(s);
  let stars = store.get("stars", 0), screen = "splash", current = null;
  const showStars = () => { $("#stars").textContent = "⭐ " + stars; };

  // Every time the app opens: splash (logo) -> teacher (choose Adrian or Diana) -> home
  // home -> english (two cards) -> sounds (levels) -> lesson
  //                              -> writing (levels) -> write
  // go("path") means "back to the list I came from", so lesson/writing files
  // that still say go("path") land on the right list.
  const BACK = { english: "home", sounds: "english", writing: "english", lesson: "sounds", write: "writing" };

  function go(name) {
    if (name === "path") {
      name = (screen === "write" || screen === "writing") ? "writing"
        : (screen === "lesson" || screen === "sounds") ? "sounds" : "english";
    }
    screen = name;
    $("#back").hidden = name === "home" || name === "splash" || name === "teacher";
    $("#progress").hidden = !(name === "lesson" || name === "write");
    if (name === "splash") splash();
    else if (name === "teacher") Teacher.show({ setTitle, done: () => go("home") });
    else if (name === "home") home();
    else if (name === "english") english();
    else if (name === "sounds") sounds();
    else if (name === "writing") writing();
    else if (name === "lesson") English.start(current);
    else if (name === "write") Writing.start(current);
    window.scrollTo(0, 0);
  }

  function open(lesson) { current = lesson; go("lesson"); }
  function openWriting(lesson) { current = lesson; go("write"); }

  // Logo screen for a moment, then the teacher choice.
  function splash() {
    setTitle("BrightSteps");
    $("#view").innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center">
      <img src="icon-512.png" alt="BrightSteps logo" style="width:200px;height:200px;border-radius:44px;box-shadow:0 6px 0 #c9e3f5">
      <h2 style="margin:18px 0 0;font-family:var(--disp)">BrightSteps Learning</h2>
    </div>`;
    setTimeout(() => { if (screen === "splash") go("teacher"); }, 1800);
  }

  // Home: the library bookshelf. Only the English book opens something for now.
  function home() {
    setTitle("BrightSteps");
    const done = LESSONS.filter(l => isDone(l.id)).length;
    const filled = Math.min(3, Math.floor(3 * done / LESSONS.length));
    const starRow = [0, 1, 2].map(i => `<span class="${i < filled ? "" : "off"}">★</span>`).join("");
    const heights = [30, 22, 40, 28, 36, 24, 34, 26];
    const spines = RAINBOW.map((c, i) => `<i style="background:${c};height:${heights[i]}px;animation-delay:${(0.15 + i * 0.08).toFixed(2)}s"></i>`).join("");
    $("#view").innerHTML = `
    <div class="hero">
      <div class="kick">The BrightSteps library</div>
      <h2>Pick a book, <span>start learning</span></h2>
      <div class="spines" aria-hidden="true">${spines}</div>
    </div>
    <div class="shelf">
      <div class="shelf-h">Start learning <small>Shelf 1</small></div>
      <div class="books">
        <button class="book eng" id="en" aria-label="English and Reading. Start here">
          <span class="tag">Start here</span>
          <span class="bk">Aa</span>
          <span class="nm">English &amp; Reading</span>
          <span class="sub">Sounds and writing</span>
          <span class="rule"></span>
          <span class="bstars">${starRow}<span class="go" aria-hidden="true">›</span></span>
        </button>
        <div class="book mth">
          <span class="bk">123</span>
          <span class="nm">Maths</span>
          <span class="sub">Counting</span>
          <span class="rule"></span>
          <span class="pill">Coming soon</span>
        </div>
      </div>
      <div class="board"></div>
    </div>
    <div class="shelf">
      <div class="shelf-h">More to explore <small>Shelf 2</small></div>
      <div class="books">
        <div class="book ai">
          <span class="ico" aria-hidden="true">🤖</span>
          <span class="nm">AI Learning Buddy</span>
          <span class="sub">Talk &amp; learn</span>
          <span class="rule"></span>
          <span class="pill">Coming soon</span>
        </div>
        <div class="book rh">
          <span class="ico" aria-hidden="true">🎵</span>
          <span class="nm">Rhymes &amp; Stories</span>
          <span class="sub">Songs &amp; stories</span>
          <span class="rule"></span>
          <span class="pill">Coming soon</span>
        </div>
      </div>
      <div class="board"></div>
    </div>`;
    $("#en").onclick = () => go("english");
  }

  // Window 2: only the two sections.
  function english() {
    setTitle("English & Reading");
    const soundsDone = LESSONS.filter(l => isDone(l.id)).length;
    const wLessons = LESSONS.filter(l => Writing.ready(l));
    const writingDone = wLessons.filter(l => isWDone(l.id)).length;
    $("#view").innerHTML = `
    <div class="card hello"><p class="q">Your English path</p></div>
    <button class="big en" id="sn"><b>🔤</b><span>Alphabet Sounds<small>Names and sounds · ${soundsDone} of ${LESSONS.length} levels done</small></span></button>
    <button class="big en" id="wr"><b>✏️</b><span>Alphabet Writing<small>Find the letters, then write them · ${writingDone} of ${wLessons.length} levels done</small></span></button>`;
    $("#sn").onclick = () => go("sounds");
    $("#wr").onclick = () => go("writing");
  }

  // Window 3a: Sounds levels on a winding rainbow path, 3 circles per row (the path snakes
  // left to right, then right to left), so all 9 levels fit on one screen.
  // A level opens when the level before it is finished. Finished levels can be replayed.
  function sounds() {
    setTitle("Alphabet Sounds");
    const n = LESSONS.length, PER = 3, ROW = 132, TOP = 34, rows = Math.ceil(n / PER), H = TOP + ROW * rows;
    const COLX = [17, 50, 83];
    const doneArr = LESSONS.map(l => isDone(l.id));
    const doneCount = doneArr.filter(Boolean).length;
    const cur = doneArr.indexOf(false);
    const pos = i => {
      const r = Math.floor(i / PER); let c = i % PER;
      if (r % 2) c = PER - 1 - c;
      return { x: COLX[c], y: TOP + ROW * r + 29, r };
    };
    let base = "", col = "";
    for (let i = 0; i < n - 1; i++) {
      const a = pos(i), b = pos(i + 1);
      let d;
      if (a.r === b.r) {
        const m = (a.x + b.x) / 2, w = (i % 2 ? -1 : 1) * 12;
        d = `M${a.x} ${a.y} C${m} ${a.y + w} ${m} ${b.y - w} ${b.x} ${b.y}`;
      } else {
        const o = a.x > 50 ? 14 : -14;
        d = `M${a.x} ${a.y} C${a.x + o} ${a.y + 6} ${b.x + o} ${b.y - 6} ${b.x} ${b.y}`;
      }
      base += `<path d="${d}" fill="none" stroke="#dce6f2" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
      if (doneArr[i]) col += `<path d="${d}" fill="none" stroke="${RAINBOW[i % 8]}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
    }
    let nodes = "";
    LESSONS.forEach((l, i) => {
      const state = doneArr[i] ? "done" : (i === cur ? "cur" : "lock");
      const p = pos(i);
      const letters = l.letters.map(x => x.U).join("");
      const bg = state === "lock" ? "" : `style="background:${RAINBOW[i % 8]}"`;
      const badge = state === "done" ? "✓" : state === "lock" ? "🔒" : "";
      const label = "Level " + (i + 1) + ", letters " + letters + ", " + (state === "done" ? "finished" : state === "cur" ? "your level" : "locked");
      nodes += `<button class="node ${state}" data-k="${i}" ${state === "lock" ? "disabled" : ""} style="left:${p.x}%;top:${TOP + ROW * p.r}px" aria-label="${label}">
        ${state === "cur" ? `<span class="here">You are here</span>` : ""}
        ${i === 0 && state === "done" ? `<span class="crown" aria-hidden="true">👑</span>` : ""}
        <span class="circ" ${bg}>${letters}${badge ? `<span class="badge">${badge}</span>` : ""}</span>
        <span class="num">${i + 1}</span><span class="lab">Level</span>
        <span class="st" aria-hidden="true">★★★</span>
      </button>`;
    });
    const all = doneCount === n;
    $("#view").innerHTML = `
    <h2 class="lvh">Your English levels</h2>
    <p class="lvp">Alphabet Sounds has ${n} levels. Finish a level and the path turns the next rainbow colour. Tap your level to start.</p>
    ${all ? `<div class="done-banner"><b>Path complete!</b><span>All ${n} levels finished. The whole path is a rainbow.</span></div>` : ""}
    <div class="path" style="height:${H}px">
      <svg viewBox="0 0 100 ${H}" preserveAspectRatio="none" style="height:${H}px" aria-hidden="true">${base}${col}</svg>
      ${nodes}
    </div>
    <p class="lsum">${all ? "All " + n + " levels done" : "Level " + (cur + 1) + " of " + n + " · " + doneCount + (doneCount === 1 ? " level" : " levels") + " done"}</p>
    <div class="pbar ${all ? "rb" : ""}"><div style="width:${Math.round(100 * doneCount / n)}%"></div></div>`;
    document.querySelectorAll(".node:not(:disabled)").forEach(b => b.onclick = () => open(LESSONS[b.dataset.k]));
  }

  // Window 3b: Writing levels. A level opens after the matching Sounds level
  // and the writing level before it.
  function writing() {
    setTitle("Alphabet Writing");
    let html = `<div class="card hello"><p class="q">Choose a level</p></div>`;
    let more = false;
    LESSONS.forEach((l, k) => {
      if (!Writing.ready(l)) { more = true; return; }
      const soundsDone = isDone(l.id);
      const prevOk = k === 0 || isWDone(LESSONS[k - 1].id);
      html += (soundsDone && prevOk)
        ? `<button class="big en wv" data-k="${k}"><b>${isWDone(l.id) ? "✅" : "✏️"}</b><span>Writing ${k + 1}: ${l.title}<small>Find the letters, then write them</small></span></button>`
        : `<button class="big soon" disabled><b>🔒</b><span>Writing ${k + 1}: ${l.title}<small>${soundsDone ? "Finish the writing level before this one" : "Finish the Sounds level first"}</small></span></button>`;
    });
    if (more) html += `<button class="big soon" disabled><b>✏️</b><span>More letters<small>Coming soon</small></span></button>`;
    $("#view").innerHTML = html;
    document.querySelectorAll(".wv").forEach(b => b.onclick = () => openWriting(LESSONS[b.dataset.k]));
  }

  function setTitle(t) { $("#title").textContent = t; }
  function setProgress(p) { $("#fill").style.width = Math.round(p * 100) + "%"; }
  function addStar() { stars++; store.set("stars", stars); showStars(); }

  // Level 1 was finished before levels existed under the old name "lesson1", so both count.
  function isDone(id) { return store.get("done_" + id, false) || (id === "english-1" && store.get("lesson1", false)); }
  function finishLesson(id) { store.set("done_" + id, true); if (id === "english-1") store.set("lesson1", true); }
  // Writing levels: one star the first time a level is finished, none for repeats.
  function isWDone(id) { return store.get("wdone_" + id, false); }
  function finishWriting(id) { if (!isWDone(id)) { store.set("wdone_" + id, true); addStar(); } }
  // Best star score per level. A level finished before this rule existed counts as already maxed,
  // so replaying it adds no extra stars.
  function getBest(id) {
    const b = store.get("best_" + id, null);
    if (b !== null) return b;
    return id === "english-1" && store.get("lesson1", false) ? 1e9 : 0;
  }
  function setBest(id, n) { store.set("best_" + id, n); }

  $("#back").onclick = () => go(BACK[screen] || "home");
  showStars(); go("splash");

  if ("serviceWorker" in navigator) {
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!hadController || reloaded) return;
      reloaded = true;
      location.reload();
    });
    navigator.serviceWorker.register("sw.js").then(reg => {
      reg.update();
      document.addEventListener("visibilitychange", () => { if (!document.hidden) reg.update(); });
    }).catch(() => {});
  }

  return { go, open, openWriting, setTitle, setProgress, addStar, finishLesson, isDone, finishWriting, isWDone, getBest, setBest };
})();
