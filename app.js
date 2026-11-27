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

  // Every time the app opens: splash (logo) -> home (book shelf) -> teacher -> english (two cards)
  //   english -> sounds (levels) -> lesson            (after level 9: complete, once)
  //           -> writing (levels) -> write
  // go("path") means "back to the list I came from", so lesson/writing files
  // that still say go("path") land on the right list.
  const BACK = { teacher: "home", english: "teacher", sounds: "english", writing: "english", lesson: "sounds", write: "writing", complete: "sounds" };
  // These four screens are the final design; they bring their own app bar.
  const DESIGN = ["home", "teacher", "sounds", "complete"];

  function go(name) {
    if (name === "path") {
      name = (screen === "write" || screen === "writing") ? "writing"
        : (screen === "lesson" || screen === "sounds") ? "sounds" : "english";
    }
    screen = name;
    const design = DESIGN.includes(name);
    document.body.classList.toggle("design", design);
    document.documentElement.classList.toggle("white", name === "sounds" || name === "complete");
    $("#back").hidden = design || name === "splash";
    $("#progress").hidden = !(name === "lesson" || name === "write");
    if (name === "splash") splash();
    else if (name === "home") home();
    else if (name === "teacher") Teacher.show({ stars, back: () => go("home"), done: () => go("english") });
    else if (name === "english") english();
    else if (name === "sounds") sounds();
    else if (name === "complete") complete();
    else if (name === "writing") writing();
    else if (name === "lesson") English.start(current);
    else if (name === "write") Writing.start(current);
    window.scrollTo(0, 0);
  }

  function open(lesson) { current = lesson; go("lesson"); }
  function openWriting(lesson) { current = lesson; go("write"); }

  // Logo screen for a moment, then the home screen.
  function splash() {
    setTitle("BrightSteps");
    $("#view").innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center">
      <img src="icon-512.png" alt="BrightSteps logo" style="width:220px;height:220px;border-radius:48px;display:block">
      <h2 style="margin:18px 0 0;font-family:var(--disp)">BrightSteps Learning</h2>
    </div>`;
    setTimeout(() => { if (screen === "splash") go("home"); }, 1800);
  }

  // ---------- shared pieces of the final design ----------
  const STAR_D = "M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9L12 2.6z";
  const starIcon = (size, fill) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="${STAR_D}" fill="${fill}"/></svg>`;
  const pill = () => `<span class="stars" aria-label="${stars} stars">${starIcon(16, "#ffc82e")}${stars}</span>`;
  const BACK_SVG = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  const TICK_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const LOCK_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><rect x="5.5" y="10.5" width="13" height="9" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>';
  const BURST = '<div class="burst" aria-hidden="true"><svg width="66" height="40" viewBox="0 0 88 54"><g fill="#f6a609"><polygon points="44,54 2,22 14,14"/><polygon points="44,54 20,8 30,6"/><polygon points="44,54 38,2 50,2"/><polygon points="44,54 58,6 68,8"/><polygon points="44,54 74,14 86,22"/></g><g fill="#ffc82e"><path transform="translate(8,18)" d="M-8 5.6 L-7.7 -4.9 L-3 -0.7 L0 -6.9 L3 -0.7 L7.7 -4.9 L8 5.6 Z M-8 7.1 h16 v2.1 H-8 Z"/><path transform="translate(25,9) scale(1.1)" d="M-8 5.6 L-7.7 -4.9 L-3 -0.7 L0 -6.9 L3 -0.7 L7.7 -4.9 L8 5.6 Z M-8 7.1 h16 v2.1 H-8 Z"/><path transform="translate(44,7) scale(1.25)" d="M-8 5.6 L-7.7 -4.9 L-3 -0.7 L0 -6.9 L3 -0.7 L7.7 -4.9 L8 5.6 Z M-8 7.1 h16 v2.1 H-8 Z"/><path transform="translate(63,9) scale(1.1)" d="M-8 5.6 L-7.7 -4.9 L-3 -0.7 L0 -6.9 L3 -0.7 L7.7 -4.9 L8 5.6 Z M-8 7.1 h16 v2.1 H-8 Z"/><path transform="translate(80,18)" d="M-8 5.6 L-7.7 -4.9 L-3 -0.7 L0 -6.9 L3 -0.7 L7.7 -4.9 L8 5.6 Z M-8 7.1 h16 v2.1 H-8 Z"/></g></svg></div>';

  // ---------- 01 Home: book shelf ----------
  // Only the English & Reading book opens something. The other books are "Coming soon".
  function home() {
    setTitle("BrightSteps");
    const n = LESSONS.length;
    const done = LESSONS.filter(l => isDone(l.id)).length;
    const filled = Math.min(3, Math.floor(3 * done / n));
    const rowStars = [0, 1, 2].map(i => starIcon(14, i < filled ? "#ffc82e" : "rgba(255,255,255,.35)")).join("");
    const spines = [[30, "#22a464"], [24, "#2783cc"], [33, "#4f55c4"], [27, "#8b46c7"], [31, "#c44fae"], [22, "#e5484d"], [29, "#f2760a"], [26, "#d99400"]]
      .map(s => `<i style="height:${s[0]}px;background:${s[1]}"></i>`).join("");
    $("#view").innerHTML = `
    <div class="phone" id="phone-home">
      <div class="screen">
        <div class="appbar">
          <div class="brand">
            <span class="mark" aria-hidden="true"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 19c4-1 5-4 5-8V6.5C9 4.6 7.8 3.5 6.4 3.5 4.9 3.5 4 4.9 4 7v12Zm16 0c-4-1-5-4-5-8V6.5c0-1.9 1.2-3 2.6-3C19.1 3.5 20 4.9 20 7v12Z" fill="#1c2e4f" opacity=".9"/></svg></span>
            BrightSteps
          </div>
          ${pill()}
        </div>
        <div class="appbody">
          <div class="lib-hero">
            <div class="lh-top">
              <div class="lh-txt">
                <span class="lh-kicker">The BrightSteps Library</span>
                <h3>Pick a book, <em>start learning</em></h3>
              </div>
            </div>
            <div class="spines" aria-hidden="true">${spines}</div>
          </div>
          <div class="library">
            <div class="shelf-label"><b>Start learning</b><span>Shelf 1</span></div>
            <div class="shelf">
              <button class="book bk-english" id="btn-english" type="button" aria-label="English and Reading book — tap to open it">
                <span class="bk-top">
                  <img src="icon-192.png" alt="" aria-hidden="true" style="width:52px;height:52px;border-radius:14px;display:block">
                  <span class="bk-flag" aria-hidden="true">Start here</span>
                </span>
                <span class="bk-foot">
                  <span class="bk-name">English &amp; Reading</span>
                  <span class="bk-meta">Alphabet Sounds</span>
                  <span class="bk-rule" style="background:#ffc82e" aria-hidden="true"></span>
                  <span class="bk-row" aria-label="${filled} of 3 stars earned">
                    ${rowStars}
                    <span class="bk-open" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></span>
                  </span>
                </span>
              </button>
              <div class="book" style="background:var(--yellow);color:var(--navy)" aria-label="Maths book, coming soon">
                <span class="bk-top"><span class="bk-glyph" aria-hidden="true">123</span></span>
                <span class="bk-foot">
                  <span class="bk-name">Maths</span>
                  <span class="bk-meta">Counting</span>
                  <span class="bk-rule" style="background:rgba(28,46,79,.5)" aria-hidden="true"></span>
                  <span class="bk-row"><span class="bk-tag tag-navy">Coming soon</span></span>
                </span>
              </div>
            </div>
            <div class="shelf-board" aria-hidden="true"></div>
            <div class="shelf-label"><b>More to explore</b><span>Shelf 2</span></div>
            <div class="shelf">
              <div class="book" style="background:var(--navy);color:#fff" aria-label="AI Learning Buddy book, coming soon">
                <span class="bk-top"><span class="bk-medal" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="8" width="15" height="11" rx="3.5"/><path d="M12 8V4.8M12 4.8h.01"/><circle cx="12" cy="4.6" r="1.4"/><circle cx="9" cy="13" r=".6" fill="#fff"/><circle cx="15" cy="13" r=".6" fill="#fff"/><path d="M9.5 16.2c.8.6 4.2.6 5 0"/></svg></span></span>
                <span class="bk-foot">
                  <span class="bk-name">AI Learning Buddy</span>
                  <span class="bk-meta">Talk &amp; learn</span>
                  <span class="bk-rule" style="background:#ffc82e" aria-hidden="true"></span>
                  <span class="bk-row"><span class="bk-tag tag-yellow">Coming soon</span></span>
                </span>
              </div>
              <div class="book on-soft" style="background:#dcebfd;color:var(--navy)" aria-label="Rhymes and Stories book, coming soon">
                <span class="bk-top"><span class="bk-medal" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2783cc" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></span></span>
                <span class="bk-foot">
                  <span class="bk-name">Rhymes &amp; Stories</span>
                  <span class="bk-meta">Songs &amp; stories</span>
                  <span class="bk-rule" style="background:#2783cc" aria-hidden="true"></span>
                  <span class="bk-row"><span class="bk-tag tag-navy">Coming soon</span></span>
                </span>
              </div>
            </div>
            <div class="shelf-board last" aria-hidden="true"></div>
          </div>
        </div>
      </div>
    </div>`;
    $("#btn-english").onclick = () => go("teacher");
  }

  // Window 3 (not in the design, kept from the app): the two sections.
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

  // ---------- the levels path (screens 03 and 04 share it) ----------
  const POS = [[50, 70], [75, 170], [25, 170], [50, 270], [75, 370], [25, 370], [50, 470], [75, 570], [25, 570]];
  const TRACK = "M158 70 H237 A50 50 0 0 1 237 170 H79 A50 50 0 0 0 79 270 H237 A50 50 0 0 1 237 370 H79 A50 50 0 0 0 79 470 H237 A50 50 0 0 1 237 570 H79";
  const SEGS = [["s-g", "M158 70 H237 A50 50 0 0 1 237 170"], ["s-b", "M237 170 H79"], ["s-i", "M79 170 A50 50 0 0 0 79 270 H158"], ["s-v", "M158 270 H237 A50 50 0 0 1 237 370"], ["s-p", "M237 370 H79"], ["s-r", "M79 370 A50 50 0 0 0 79 470 H158"], ["s-o", "M158 470 H237 A50 50 0 0 1 237 570"], ["s-y", "M237 570 H79"]];

  function pathHTML(doneArr, cur) {
    const seg = SEGS.map((s, i) => `<path class="seg ${doneArr[i] ? "on " : ""}${s[0]}" d="${s[1]}"/>`).join("");
    let nodes = "";
    LESSONS.forEach((l, i) => {
      const k = i + 1;
      const state = doneArr[i] ? "done" : (i === cur ? "current" : "locked");
      const letters = l.letters.map(x => x.U).join("");
      const spaced = l.letters.map(x => x.U).join(" ");
      const label = state === "done" ? "Level · Finished" : state === "current" ? "Level · Tap to start" : "Level · Locked";
      const aria = "Level " + k + " — letters " + spaced + ", " + (state === "done" ? "finished" : state === "current" ? "your current level — tap to start it" : "locked — finish Level " + (k - 1) + " to open it");
      const badge = state === "done" ? TICK_SVG : state === "locked" ? LOCK_SVG : "";
      const stars3 = [0, 1, 2].map(() => `<svg width="15" height="15" viewBox="0 0 24 24"><path d="${STAR_D}"/></svg>`).join("");
      nodes += `
      <div class="lvl st-${state}${state === "done" ? " done-c" + k : ""}" style="left:${POS[i][0]}%;top:${POS[i][1]}px">
        ${i === 0 && state === "done" ? BURST : ""}
        <button class="lvl-node" type="button" data-lvl="${i}" ${state === "locked" ? "disabled" : ""} aria-label="${aria}">
          ${state === "current" ? '<span class="here" aria-hidden="true">You are here</span>' : ""}
          <span class="lvl-sign sg-abc">${letters}</span>
          <span class="lvl-badge" aria-hidden="true">${badge}</span>
        </button>
        <div class="lvl-label">
          <span class="lt">${k}</span>
          <span class="ls">${label}</span>
          <span class="lstar" aria-label="${state === "done" ? "3 stars earned" : "No stars yet"}">${stars3}</span>
        </div>
      </div>`;
    });
    return `<div class="path2-wrap">
      <svg class="path2-svg" viewBox="0 0 316 680" preserveAspectRatio="none" aria-hidden="true">
        <path class="track" d="${TRACK}"/>${seg}
      </svg>${nodes}
    </div>`;
  }

  // ---------- 03 English levels: Alphabet Sounds ----------
  // A level opens when the level before it is finished. Tapping a level opens its lesson.
  function sounds() {
    const n = LESSONS.length;
    const doneArr = LESSONS.map(l => isDone(l.id));
    const doneCount = doneArr.filter(Boolean).length;
    const cur = doneArr.indexOf(false);
    const all = doneCount === n;
    // Finishing level 9 opens screen 04, All levels complete (once).
    if (all && !store.get("complete_seen", false)) { store.set("complete_seen", true); return complete(); }
    setTitle("English & Reading");
    const prog = all ? "<b>Level " + n + " of " + n + "</b> · " + n + " levels done"
      : "<b>Level " + (cur + 1) + " of " + n + "</b> · " + doneCount + (doneCount === 1 ? " level done" : " levels done");
    $("#view").innerHTML = `
    <div class="phone" id="phone-levels">
      <div class="screen white">
        <div class="appbar">
          <button class="backbtn" id="btn-back2" type="button" aria-label="Back">${BACK_SVG}</button>
          <span class="ttl">English &amp; Reading</span>
          <span class="stars" aria-label="Stars earned">${starIcon(16, "#ffc82e")}<span id="lv-stars-num">${stars}</span></span>
        </div>
        <div class="appbody">
          <div class="lv-intro">
            <h3>Your English levels</h3>
            <p>Alphabet Sounds has <b>${n} levels</b>. Finish a level and the path turns the next <b>rainbow</b> colour — green, blue, indigo, violet, pink, red, orange, gold.${all ? "" : " Tap Level " + (cur + 1) + " to try it."}</p>
          </div>
          ${pathHTML(doneArr, cur)}
          <div class="success${all ? " show" : ""}" id="lv-finish" role="status">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="flex:none;margin-top:1px"><circle cx="12" cy="12" r="10" fill="#166b45"/><path d="M8 12.5l2.6 2.6L16 9.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <p>Path complete! You finished all ${n} English levels — the whole path is a rainbow now.</p>
          </div>
          <div class="progress">
            <div class="row">
              ${starIcon(18, "#ffc82e").replace("<svg ", '<svg style="flex:none" ')}
              <span id="lv-prog-text">${prog}</span>
            </div>
            <div class="bar" role="progressbar" aria-valuenow="${doneCount}" aria-valuemin="0" aria-valuemax="${n}" aria-label="${doneCount} of ${n} levels done"><div class="fill" style="width:${(doneCount * 100 / n).toFixed(1)}%"></div></div>
          </div>
        </div>
      </div>
    </div>`;
    $("#btn-back2").onclick = () => go(BACK.sounds);
    document.querySelectorAll("#phone-levels .lvl-node:not(:disabled)").forEach(b => b.onclick = () => open(LESSONS[b.dataset.lvl]));
  }

  // ---------- 04 All levels complete ----------
  // Still screen, as designed: no buttons and no back button on the screen.
  // The phone's own back button returns to the levels.
  function complete() {
    screen = "complete";
    setTitle("English & Reading");
    const n = LESSONS.length;
    const doneArr = LESSONS.map(() => true);
    $("#view").innerHTML = `
    <div class="phone" id="phone-complete">
      <div class="screen white">
        <div class="appbar">
          <span class="ttl">English &amp; Reading</span>
          <span class="stars" aria-label="${stars} stars earned">${starIcon(16, "#ffc82e")}<span>${stars}</span></span>
        </div>
        <div class="appbody">
          <div class="done-banner">
            <h3>Path complete!</h3>
            <p>All ${n} English levels finished — the whole path turned into a rainbow.</p>
            <div class="rainbow-bar" aria-hidden="true"></div>
          </div>
          ${pathHTML(doneArr, -1).replace(/ data-lvl="\d+"/g, "").replace(/<button class="lvl-node" type="button" /g, '<button class="lvl-node" type="button" disabled ')}
          <div class="progress">
            <div class="row">
              ${starIcon(18, "#ffc82e").replace("<svg ", '<svg style="flex:none" ')}
              <span><b>All ${n} levels done</b> · ${3 * n} stars earned</span>
            </div>
            <div class="bar" role="progressbar" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="${n}" aria-label="${n} of ${n} levels done"><div class="fill" style="width:100%;background:linear-gradient(90deg,#22a464,#2783cc,#4f55c4,#8b46c7,#c44fae,#e5484d,#f2760a,#d99400)"></div></div>
          </div>
        </div>
      </div>
    </div>`;
    try {
      history.pushState({ bs: "complete" }, "");
      window.onpopstate = () => { if (screen === "complete") go("sounds"); };
    } catch (e) {}
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
