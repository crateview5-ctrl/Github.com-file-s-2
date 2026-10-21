const English = (() => {
  const $ = s => document.querySelector(s);
  const view = () => $("#view");
  const shuffle = a => [...a].sort(() => Math.random() - 0.5);
  const lc = (x, up) => `<span style="color:${x.color}">${up ? x.U : x.l}</span>`;
  let lesson = null, L = [], steps = [], i = 0, earned = 0, possible = 0, best = 0;

  // Alphabet levels: only the letter name and the letter sound. No picture words here.
  // (Picture words stay in lessons.js for the Word Building section later.)
  function build() {
    const s = [];
    L.forEach(x => s.push({ t: "learn", x }));
    shuffle(L).forEach(x => s.push({ t: "qName", x }));
    shuffle(L).forEach(x => s.push({ t: "qSound", x }));
    s.push({ t: "match" });
    L.forEach(x => s.push({ t: "repeat", x }));
    s.push({ t: "done" });
    return s;
  }

  function start(l) {
    lesson = l || lesson || LESSONS[0];
    L = lesson.letters;
    steps = build(); i = 0; earned = 0; possible = 0;
    best = App.getBest(lesson.id);
    render();
  }
  // Stars only go up when the child beats their best score for this lesson.
  function win() {
    earned++;
    if (earned > best) { best = earned; App.setBest(lesson.id, best); App.addStar(); }
  }
  function next() { i++; render(); }
  function fb(msg, good) { const f = $("#fb"); if (f) { f.textContent = msg; f.className = "fb " + (good ? "good" : "oops"); } }

  function render() {
    const st = steps[i];
    App.setProgress(i / (steps.length - 1));
    App.setTitle(lesson.title);
    ({ learn, qName, qSound, match, repeat, done })[st.t](st);
  }

  function nextBtn(label) { return `<button class="btn go" id="next">${label || "Next"}</button>`; }

  function learn({ x }) {
    view().innerHTML = `
    <div class="card">
      <p class="q">This is the letter ${x.U}</p>
      <div class="tile" style="background:${x.color}"><span>${x.U}</span><span>${x.l}</span></div>
      <div class="two">
        <button class="btn" id="n">🔤 Hear the name<small>${x.U} is called “${x.nameSay}”</small></button>
        <button class="btn alt" id="s">🔊 Hear the sound<small>${x.U} says “${x.soundSay}”</small></button>
      </div>
      ${nextBtn()}
    </div>`;
    $("#n").onclick = () => Snd.name(x);
    $("#s").onclick = () => Snd.sound(x);
    $("#next").onclick = next;
  }

  // first (optional): what plays automatically when the question appears.
  // again: what the "Listen again" button plays.
  function quiz(title, again, opts, pic, first) {
    possible++;
    view().innerHTML = `
    <div class="card">
      <p class="q">${title}</p>
      ${pic ? `<div class="emoji">${pic}</div>` : ""}
      <button class="btn alt" id="again">🔊 Listen again</button>
      <div class="opts">${opts.map((o, k) => `<button class="opt" data-k="${k}">${o.label}</button>`).join("")}</div>
      <p id="fb" class="fb" aria-live="polite"></p>
    </div>`;
    $("#again").onclick = again;
    setTimeout(first || again, 300);
    let tried = false, done = false;
    view().querySelectorAll(".opt").forEach(b => b.onclick = () => {
      if (done) return;
      if (opts[b.dataset.k].ok) {
        done = true;
        if (!tried) { win(); }
        b.classList.add("good");
        fb(tried ? "You got it! 🎉" : "Great job! ⭐", true);
        setTimeout(next, 1200);
      } else {
        tried = true; b.classList.add("oops"); b.disabled = true;
        fb("Good try! Listen again and have another go 🙂");
        setTimeout(again, 500);
      }
    });
  }

  // Two wrong choices. If this level has fewer than 3 letters (Y, Z), borrow from other levels.
  function others(x) {
    const own = shuffle(L.filter(y => y !== x));
    const extra = shuffle(ALL_LETTERS.filter(y => !L.includes(y)));
    return own.concat(extra).slice(0, 2);
  }

  function qName({ x }) {
    const up = Math.random() < 0.5;
    const opts = shuffle([x, ...others(x)]).map(y => ({ label: lc(y, up), ok: y === x }));
    quiz("Listen. Which letter is this name?", () => Snd.name(x), opts);
  }

  function qSound({ x }) {
    const up = Math.random() < 0.5;
    const opts = shuffle([x, ...others(x)]).map(y => ({ label: lc(y, up), ok: y === x }));
    quiz("Listen. Which letter makes this sound?", () => Snd.quiz(x), opts);
  }

  function match() {
    possible++;
    const ups = shuffle(L), lows = shuffle(L);
    view().innerHTML = `
    <div class="card">
      <p class="q">Match capital and small letters</p>
      <div class="cols">
        <div>${ups.map(x => `<button class="opt m" data-side="u" data-id="${x.U}">${lc(x, true)}</button>`).join("")}</div>
        <div>${lows.map(x => `<button class="opt m" data-side="l" data-id="${x.U}">${lc(x, false)}</button>`).join("")}</div>
      </div>
      <p id="fb" class="fb" aria-live="polite"></p>
    </div>`;
    let sel = null, found = 0, slips = 0;
    view().querySelectorAll(".m").forEach(b => b.onclick = () => {
      if (b.classList.contains("good")) return;
      if (!sel) { sel = b; b.classList.add("sel"); return; }
      if (sel === b) { b.classList.remove("sel"); sel = null; return; }
      if (sel.dataset.side === b.dataset.side) { sel.classList.remove("sel"); sel = b; b.classList.add("sel"); return; }
      if (sel.dataset.id === b.dataset.id) {
        sel.classList.remove("sel"); sel.classList.add("good"); b.classList.add("good"); sel = null; found++;
        fb("Yes! A pair! 🎉", true);
        if (found === L.length) {
          if (slips === 0) { win(); }
          fb("All matched! ⭐", true); setTimeout(next, 1200);
        }
      } else {
        slips++; sel.classList.remove("sel"); sel = null;
        fb("Not a pair yet. Look closely and try again 🙂");
      }
    });
  }

  function repeat({ x }) {
    view().innerHTML = `
    <div class="card">
      <p class="q">Say it out loud</p>
      <div class="tile" style="background:${x.color}"><span>${x.U}</span><span>${x.l}</span></div>
      <p class="say">Name: <b>“${x.nameSay}”</b></p>
      <button class="btn" id="n">🔤 Hear the name</button>
      <p class="say">Sound: <b>${x.U} says “${x.soundSay}”</b></p>
      <button class="btn alt" id="s">🔊 Hear the sound</button>
      ${nextBtn("I said both ✅")}
    </div>`;
    $("#n").onclick = () => Snd.name(x);
    $("#s").onclick = () => Snd.sound(x);
    $("#next").onclick = next;
  }

  function done() {
    App.finishLesson(lesson.id);
    const n = LESSONS.indexOf(lesson);
    const nxt = LESSONS[n + 1];
    view().innerHTML = `
    <div class="card">
      <div class="emoji">🌟</div>
      <p class="q">${nxt ? "Level " + (n + 1) + " complete!" : "You finished every letter! 🎉"}</p>
      <p class="say">You got <b>${earned}</b> out of <b>${possible}</b> stars on this try. Every try helps you learn.</p>
      <button class="btn" id="again">🔁 Practice again</button>
      ${nxt
        ? `<button class="btn go" id="nextlevel">➡️ Next level<small>${nxt.title}</small></button>`
        : `<button class="btn go" id="nextlevel">🏠 Back to levels</button>`}
    </div>`;
    $("#again").onclick = () => start(lesson);
    $("#nextlevel").onclick = () => nxt ? App.open(nxt) : App.go("path");
  }

  return { start };
})();
