const Snd = {
  speak(t, rate = 0.7) {
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = "en-US"; u.rate = rate; speechSynthesis.speak(u); } catch (e) {}
  },
  file(f, fallback) { try { const a = new Audio(f); a.play().catch(() => Snd.speak(fallback)); } catch (e) { Snd.speak(fallback); } },
  name(x) { Snd.file("audio/adrian/names/adrian_" + x.U + "_name.mp3", x.nameSay); },
  sound(x) { Snd.file("audio-sound-" + x.l + ".webm", x.soundSay); },
  word(w) { Snd.file("audio-word-" + w + ".webm", w); }
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

  $("#back").onclick = () => go(screen === "lesson" ? "path" : "home");
  showStars(); go("home");
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  return { go, setTitle, setProgress, addStar, finishLesson };
})();
