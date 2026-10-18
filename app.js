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
// After you upload it, paste its full file name here, for example:
// "audio/adrian/words/ElevenLabs_2026-10-18T17_30_00_Chris - Warm, Resonant, Thoughtful_pvc_sp100_s50_sb75_v3.mp3"
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
  let stars = store.get("stars", 0), screen = "home";
  const showStars = () => { $("#stars").textContent = "⭐ " + stars; };

  function go(name) {
    screen = name;
    $("#back").hidden = name === "home";
    $("#progress").hidden = name !== "lesson";
    if (name === "home") home();
    else if (name === "path") path();
    else if (name === "lesson") English.start();
    window.scrollTo(0, 0);
  }

  function home() {
    setTitle("BrightSteps");
    $("#view").innerHTML = `
    <div class="card hello"><p class="q">What shall we learn today?</p></div>
    <button class="big en" id="en"><b>📖</b><span>English &amp; Reading</span></button>
    <button class="big soon" disabled><b>🔢</b><span>Maths<small>Coming soon</small></span></button>
    <button class="big soon" disabled><b>🤖</b><span>AI Learning Buddy<small>Coming soon</small></span></button>`;
    $("#en").onclick = () => go("path");
  }

  function path() {
    setTitle("English & Reading");
    const done = store.get("lesson1", false);
    $("#view").innerHTML = `
    <div class="card hello"><p class="q">Your English path</p></div>
    <button class="big en" id="l1"><b>${done ? "✅" : "🔤"}</b><span>Lesson 1: Letters A, B, C<small>Names, sounds, pictures and games</small></span></button>
    <button class="big soon" disabled><b>🔒</b><span>Lesson 2<small>Coming soon</small></span></button>`;
    $("#l1").onclick = () => go("lesson");
  }

  function setTitle(t) { $("#title").textContent = t; }
  function setProgress(p) { $("#fill").style.width = Math.round(p * 100) + "%"; }
  function addStar() { stars++; store.set("stars", stars); showStars(); }
  function finishLesson() { store.set("lesson1", true); }
  // Best star score per lesson. A lesson finished before this rule existed counts as already maxed,
  // so replaying it adds no extra stars.
  function getBest(id) {
    const b = store.get("best_" + id, null);
    if (b !== null) return b;
    return id === "english-1" && store.get("lesson1", false) ? 1e9 : 0;
  }
  function setBest(id, n) { store.set("best_" + id, n); }

  $("#back").onclick = () => go(screen === "lesson" ? "path" : "home");
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

  return { go, setTitle, setProgress, addStar, finishLesson, getBest, setBest };
})();
