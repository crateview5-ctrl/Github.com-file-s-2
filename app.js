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
    try {
      const a = new Audio(encodeURI(src));
      Snd.cur = a;
      a.onended = finish;
      a.onerror = viaVoice;
      a.play().catch(viaVoice);
    } catch (e) { viaVoice(); }
  },
  file(f, fallback) { Snd.play(f, fallback); },
  name(x) { Snd.play("audio/adrian/names/adrian_" + x.U + "_name.mp3", x.nameSay); },
  sound(x) { Snd.play("audio/adrian/sounds/adrian_" + x.U + "_sound.mp3", x.soundSay); },
  quiz(x) { Snd.play("audio/adrian/quiz/adrian_" + x.U + "_quiz.mp3", "Which letter makes this sound? " + x.soundSay); },
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
  let stars = store.get("stars", 0), screen = "home", current = null;
  const showStars = () => { $("#stars").textContent = "⭐ " + stars; };

  function go(name) {
    screen = name;
    $("#back").hidden = name === "home";
    $("#progress").hidden = !(name === "lesson" || name === "write");
    if (name === "home") home();
    else if (name === "path") path();
    else if (name === "lesson") English.start(current);
    else if (name === "write") Writing.start(current);
    window.scrollTo(0, 0);
  }

  function open(lesson) { current = lesson; go("lesson"); }
  function openWriting(lesson) { current = lesson; go("write"); }

  function home() {
    setTitle("BrightSteps");
    $("#view").innerHTML = `
    <div class="card hello"><p class="q">What shall we learn today?</p></div>
    <button class="big en" id="en"><b>📖</b><span>English &amp; Reading</span></button>
    <button class="big soon" disabled><b>🔢</b><span>Maths<small>Coming soon</small></span></button>
    <button class="big soon" disabled><b>🤖</b><span>AI Learning Buddy<small>Coming soon</small></span></button>`;
    $("#en").onclick = () => go("path");
  }

  // A level opens when the level before it is finished.
  function path() {
    setTitle("English & Reading");
    let html = `<div class="card hello"><p class="q">Your English path</p></div>`;
    LESSONS.forEach((l, k) => {
      const unlocked = k === 0 || isDone(LESSONS[k - 1].id);
      html += unlocked
        ? `<button class="big en lv" data-k="${k}"><b>${isDone(l.id) ? "✅" : "🔤"}</b><span>Level ${k + 1}: ${l.title}<small>Names, sounds, pictures and games</small></span></button>`
        : `<button class="big soon" disabled><b>🔒</b><span>Level ${k + 1}: ${l.title}<small>Finish the level before this one</small></span></button>`;
    });

    // Alphabet Writing: opens after the matching Sounds level and the writing level before it.
    html += `<div class="card hello"><p class="q">Alphabet Writing ✏️</p></div>`;
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
    document.querySelectorAll(".lv").forEach(b => b.onclick = () => open(LESSONS[b.dataset.k]));
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

  $("#back").onclick = () => go(screen === "lesson" || screen === "write" ? "path" : "home");
  showStars(); go("home");

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
