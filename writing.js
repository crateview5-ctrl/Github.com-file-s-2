const Writing = (() => {
  const $ = s => document.querySelector(s);
  const shuffle = a => [...a].sort(() => Math.random() - 0.5);
  // Plays audio/adrian/prompts/adrian_<f>.mp3, or the phone voice if that clip is missing.
  const say = (f, t, done) => Snd.play("audio/adrian/prompts/adrian_" + f + ".mp3", t, done);

  // Find-step clips (52): Capital A, small a, Capital B, small b ... in upload-time order.
  const FIND_SUF = "_Chris - Warm, Resonant, Thoughtful_pvc_sp100_s50_sb75_v3.mp3";
  const FIND_STAMPS = ["17_41","18_31","19_36","20_17","20_43","21_19","22_15","22_59","23_36","24_13","24_49","25_15","25_43","26_13","26_43","27_33","28_06","28_47","31_43","32_22","33_02","33_40","34_23","34_49","35_25","35_51","36_48","37_45","38_16","38_55","39_19","39_54","40_29","40_55","41_27","41_55","42_52","43_28","44_03","44_35","45_07","45_37","46_25","46_57","47_50","48_18","48_58","49_58","50_25","51_00","51_33","52_58"];
  const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const word = size => size === "big" ? "capital" : "small";
  const findFile = q => {
    const k = ABC.indexOf(q.x.U) * 2 + (q.size === "small" ? 1 : 0);
    return "audio/adrian/writing/" + encodeURI("ElevenLabs_2026-10-20T19_" + FIND_STAMPS[k] + FIND_SUF);
  };

  // Tracing clips (5), uploaded to audio/adrian/tracing/ on 2026-10-21.
  const TRACE = { big: "14_08_13", small: "14_08_49", found: "14_09_22", oops: "14_10_06", notebook: "14_13_06" };
  const traceFile = k => "audio/adrian/tracing/" + encodeURI("ElevenLabs_2026-10-21T" + TRACE[k] + FIND_SUF);

  if (!document.getElementById("w-css")) {
    const st = document.createElement("style");
    st.id = "w-css";
    st.textContent = `
.w-hide{display:none!important}
.w-scene{width:min(100%,380px);margin:0 auto;animation:w-enter .9s cubic-bezier(.2,.9,.3,1.2) both}
@keyframes w-enter{from{transform:perspective(900px) rotateX(35deg) translateY(60px) scale(.9);opacity:0}to{transform:none;opacity:1}}
.w-cover{position:relative;background:linear-gradient(135deg,#eb9a42,#c26d1b);padding:28px 12px 14px;border-radius:16px;box-shadow:0 12px 0 #8d4d10,0 26px 30px rgba(0,0,0,.45),inset 0 2px 0 rgba(255,255,255,.35)}
.w-rings{position:absolute;top:8px;left:0;right:0;display:flex;justify-content:space-around;padding:0 26px;z-index:3}
.w-rings i{width:15px;height:40px;border-radius:8px;background:linear-gradient(90deg,#6d6d6d,#fff 45%,#9a9a9a);box-shadow:2px 5px 5px rgba(0,0,0,.45)}
.w-paper{position:relative;background:#fbf9f5;border-radius:4px 4px 6px 6px;overflow:hidden;box-shadow:0 2px 0 #fff,0 4px 0 #ddd,0 6px 0 #fff,0 8px 0 #ccc,0 12px 14px rgba(0,0,0,.35)}
.w-top{background:linear-gradient(#4a90c9,#2f6fa3);padding:20px 12px 10px;display:flex;justify-content:center;gap:34px;font-size:38px;box-shadow:inset 0 -6px 8px rgba(0,0,0,.25)}
.w-star{filter:grayscale(1) opacity(.4) drop-shadow(0 3px 2px rgba(0,0,0,.4));transition:.3s}
.w-star.on{filter:drop-shadow(0 4px 4px rgba(0,0,0,.5));animation:w-pop .6s}
@keyframes w-pop{0%{transform:scale(.3) rotate(-40deg)}60%{transform:scale(1.5) rotate(10deg)}100%{transform:scale(1.15)}}
#w-find{padding:14px 16px 4px;background:repeating-linear-gradient(transparent 0 38px,rgba(90,140,200,.13) 38px 40px)}
#w-ask{text-align:center;font-size:20px;font-weight:700;color:#2b4c7e;margin-bottom:12px}
#w-ask button{margin:0 0 0 8px;padding:4px 10px;font-size:18px;border:0;border-radius:12px;background:#fff;box-shadow:0 3px 0 #b9c4d6}
#w-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding-bottom:12px}
.w-card{aspect-ratio:1;border:0;border-radius:14px;background:#fff;font-size:64px;font-weight:700;font-family:Andika,'Comic Sans MS',system-ui,sans-serif;color:#2b4c7e;margin:0;padding:0;box-shadow:0 6px 0 #b9c4d6,0 10px 12px rgba(0,0,0,.25);transition:.2s}
.w-card:active{transform:translateY(4px);box-shadow:0 2px 0 #b9c4d6}
.w-card.ok{background:#2fbf70;color:#fff;box-shadow:0 6px 0 #17874a;transform:scale(.92) rotate(-3deg)}
.w-card.bad{animation:w-shake .4s}
@keyframes w-shake{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
#w-cv{display:block;width:100%;aspect-ratio:1;touch-action:none;background:repeating-linear-gradient(transparent 0 38px,rgba(90,140,200,.13) 38px 40px)}
#w-msg{text-align:center;font-size:19px;padding:8px;min-height:40px;color:#345;background:#fbf9f5}
.w-panel{text-align:center;padding:24px 16px}
.w-panel .e{font-size:64px}
.w-panel p{font-size:20px;color:#2b4c7e;margin:12px 0}
.w-btn{display:block;width:100%;margin:12px 0 0;padding:14px;font-size:19px;font-weight:700;border:0;border-radius:22px;background:#2fbf70;color:#fff;box-shadow:0 5px 0 #17874a}
.w-btn.alt{background:#fff;color:#7a4513;box-shadow:0 5px 0 #8d4d10}
.w-btn:active{transform:translateY(3px)}`;
    document.head.appendChild(st);
  }

  // ---------- Sound effects ----------
  let ac;
  function AC() { return ac = ac || new (window.AudioContext || window.webkitAudioContext)(); }
  function tone(f, d, t, v, w) { const a = AC(), o = a.createOscillator(), g = a.createGain(); o.type = t; o.frequency.value = f; o.connect(g); g.connect(a.destination); const s = a.currentTime + (w || 0); g.gain.setValueAtTime(v, s); g.gain.exponentialRampToValueAtTime(.001, s + d); o.start(s); o.stop(s + d); }
  const good = () => [660, 880, 1100].forEach((f, i) => tone(f, .25, "triangle", .15, i * .09));
  const bad = () => tone(180, .25, "sawtooth", .08);
  let sg, lastM = 0;
  function scInit() { if (sg) return; const a = AC(), n = a.sampleRate * 2, b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0); let l = 0; for (let i = 0; i < n; i++) { l = l * .6 + (Math.random() * 2 - 1) * .4; d[i] = l; } const s = a.createBufferSource(), f = a.createBiquadFilter(); sg = a.createGain(); sg.gain.value = 0; s.buffer = b; s.loop = true; f.type = "bandpass"; f.frequency.value = 1600; f.Q.value = .6; s.connect(f); f.connect(sg); sg.connect(a.destination); s.start(); }
  function sc(v) { if (sg) sg.gain.setTargetAtTime(v, AC().currentTime, .04); }

  // ---------- State ----------
  let lesson, L = [], items = [], qi = 0, tr = 0, li = 0, strokes = [], cur = 0, prog = 0, drawing = false, off = false, parts = [], cv, ctx, running = false;
  const ready = l => l.letters.every(x => GLYPHS[x.U] && GLYPHS[x.l]);
  const setStars = n => document.querySelectorAll(".w-star").forEach((x, i) => x.classList.toggle("on", i < n));
  const setProg = () => App.setProgress((qi + tr) / (items.length * 2));
  const msg = t => { const m = $("#w-msg"); if (m) m.textContent = t; };

  function start(l) {
    lesson = l || lesson; L = lesson.letters;
    items = [];
    L.forEach(x => { items.push({ c: x.U, x, size: "big" }); items.push({ c: x.l, x, size: "small" }); });
    qi = 0; tr = 0;
    $("#view").innerHTML = `
    <div class="w-scene"><div class="w-cover">
      <div class="w-rings"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="w-paper">
        <div class="w-top"><span class="w-star">⭐</span><span class="w-star">⭐</span><span class="w-star">⭐</span></div>
        <div id="w-find"><div id="w-ask"></div><div id="w-grid"></div></div>
        <canvas id="w-cv" class="w-hide" width="400" height="400"></canvas>
        <div id="w-msg"></div>
      </div></div></div>`;
    cv = $("#w-cv"); ctx = cv.getContext("2d");
    cv.onpointerdown = down; cv.onpointermove = move; cv.onpointerup = cv.onpointercancel = up;
    strokes = []; cur = 0; prog = 0; drawing = false;
    if (!running) { running = true; requestAnimationFrame(draw); }
    startFind();
  }

  // ---------- Step 1: find (the letter is never written in the question) ----------
  function again() { const q = items[qi]; Snd.play(findFile(q), "Find the " + word(q.size) + " letter " + q.x.nameSay); }
  function startFind() {
    setStars(0); setProg();
    $("#w-ask").innerHTML = `Listen and tap the right letter 👂<button id="w-again">🔊</button>`;
    $("#w-again").onclick = again;
    const g = $("#w-grid"); g.innerHTML = "";
    shuffle(items).forEach(it => {
      const b = document.createElement("button"); b.className = "w-card"; b.textContent = it.c;
      b.onclick = () => pick(b, it); g.appendChild(b);
    });
    setTimeout(again, 400);
  }
  function pick(b, it) {
    if (b.classList.contains("ok") || qi >= items.length) return;
    if (it === items[qi]) {
      b.classList.add("ok"); good(); qi++; setStars(Math.floor(qi * 3 / items.length)); setProg();
      if (qi >= items.length) {
        msg("You found them all! Now let's write ✏️");
        setTimeout(() => Snd.play(traceFile("found"), "You found them all! Now let us write.", () => setTimeout(() => startTrace(0), 400)), 600);
      }
      else setTimeout(again, 800);
    } else {
      b.classList.add("bad"); bad(); msg("Oops, try again 🙂"); Snd.play(traceFile("oops"), "Oops, try again!");
      setTimeout(() => b.classList.remove("bad"), 400);
    }
  }

  // ---------- Step 2: trace ----------
  function build(p) { const len = [0]; for (let i = 1; i < p.length; i++) len.push(len[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); return { pts: p, len, total: len[len.length - 1] }; }
  function startTrace(i) {
    li = i; const ch = items[i];
    $("#w-find").classList.add("w-hide"); cv.classList.remove("w-hide");
    strokes = GLYPHS[ch.c].map(build); cur = 0; prog = 0; drawing = false; off = false; setStars(0); setProg();
    msg("Trace the " + word(ch.size) + " letter " + ch.c + ". Start at the glowing dot 👆");
    // "Now let us write the capital/small letter ..." then the letter's own name clip.
    Snd.play(traceFile(ch.size), "Now let us write the " + word(ch.size) + " letter", () =>
      Snd.play("audio/adrian/names/adrian_" + ch.x.U + "_name.mp3", ch.x.nameSay));
  }
  function at(s, d) { for (let i = 1; i < s.pts.length; i++) { if (d <= s.len[i] || i == s.pts.length - 1) { const k = Math.max(0, Math.min(1, (d - s.len[i - 1]) / (s.len[i] - s.len[i - 1]))); const a = s.pts[i - 1], b = s.pts[i]; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; } } }
  function nearest(s, p) { let best = { d: 1e9, t: 0 }; for (let i = 1; i < s.pts.length; i++) { const a = s.pts[i - 1], b = s.pts[i], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy; let k = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2; k = Math.max(0, Math.min(1, k)); const d = Math.hypot(p[0] - (a[0] + dx * k), p[1] - (a[1] + dy * k)), t = s.len[i - 1] + k * Math.sqrt(l2), dd = (t < prog - 40 || t > prog + 150) ? d + 1000 : d; if (dd < best.d) best = { d: dd, t }; } return best; }
  function line(s, d, w, col, dash, ox, oy) { ctx.save(); ctx.translate(ox || 0, oy || 0); ctx.beginPath(); ctx.moveTo(s.pts[0][0], s.pts[0][1]); for (let i = 1; i < s.pts.length; i++) { if (s.len[i] <= d) ctx.lineTo(s.pts[i][0], s.pts[i][1]); else { const q = at(s, d); ctx.lineTo(q[0], q[1]); break; } } ctx.lineWidth = w; ctx.strokeStyle = col; ctx.setLineDash(dash || []); ctx.stroke(); ctx.restore(); }
  function burst(x, y, n) { const c = ["#ffd23f", "#ff8a5c", "#7ee081", "#4dd0e1", "#fff"]; for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = 1 + Math.random() * 4; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 1, c: c[i % 5], s: 3 + Math.random() * 5 }); } }
  function pencil(x, y) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-Math.PI / 4);
    ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 6; ctx.fillStyle = "#ffc933"; ctx.fillRect(22, -9, 44, 18); ctx.shadowColor = "transparent";
    ctx.fillStyle = "#f0a500"; ctx.fillRect(22, -9, 44, 5); ctx.fillStyle = "#ffe58a"; ctx.fillRect(22, 2, 44, 4);
    ctx.fillStyle = "#f3d3a0"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(24, -9); ctx.lineTo(24, 9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#333"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(8, -3.3); ctx.lineTo(8, 3.3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#b8b8b8"; ctx.fillRect(66, -9, 8, 18); ctx.fillStyle = "#f08aa0"; ctx.fillRect(74, -9, 13, 18); ctx.restore();
  }
  function draw(ts) {
    if (!cv || !document.body.contains(cv)) { running = false; return; }
    requestAnimationFrame(draw);
    if (sg && performance.now() - lastM > 90) sc(0);
    if (cv.classList.contains("w-hide") || !strokes.length) return;
    ctx.clearRect(0, 0, 400, 400); ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(0,0,0,.3)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 5;
    strokes.forEach(s => line(s, s.total, 54, "#c5cfdc"));
    ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    strokes.forEach(s => line(s, s.total, 46, "#f5f8fc"));
    strokes.forEach((s, i) => { if (i < cur) { line(s, s.total, 24, "#17874a", null, 0, 3); line(s, s.total, 22, "#2fbf70"); line(s, s.total, 6, "#a6f5c6", null, -3, -4); } });
    if (cur < strokes.length) {
      const s = strokes[cur];
      line(s, s.total, 7, "#4d9de0", [1, 17]);
      if (prog > 0) { line(s, prog, 20, off ? "#b3261e" : "#22222b", null, 0, 2); line(s, prog, 20, off ? "#e5533d" : "#3b3b48"); line(s, prog, 5, "#9a9aaa", null, -3, -3); }
      const st = at(s, prog); ctx.setLineDash([]);
      if (!drawing) {
        const r = 16 + 4 * Math.sin(ts / 200);
        ctx.shadowColor = "#4d9de0"; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(st[0], st[1], r, 0, 7); ctx.fillStyle = "#4d9de0"; ctx.fill();
        ctx.shadowBlur = 0; ctx.shadowColor = "transparent";
        ctx.fillStyle = "#fff"; ctx.font = "bold 18px sans-serif"; ctx.textAlign = "center"; ctx.fillText(cur + 1, st[0], st[1] + 6);
      } else { if (Math.random() < .4) burst(st[0], st[1], 1); pencil(st[0], st[1]); }
    }
    parts = parts.filter(p => p.life > 0);
    parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .12; p.life -= .02; ctx.globalAlpha = Math.max(0, Math.min(1, p.life)); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.s / 2, 0, 7); ctx.fill(); });
    ctx.globalAlpha = 1;
  }
  const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 400 / r.width, (e.clientY - r.top) * 400 / r.height]; };
  function down(e) {
    if (cur >= strokes.length) return;
    scInit();
    const p = pt(e), st = at(strokes[cur], prog);
    if (Math.hypot(p[0] - st[0], p[1] - st[1]) < 48) { drawing = true; off = false; cv.setPointerCapture(e.pointerId); msg(""); }
    else msg("Put your finger on the glowing dot 👆");
  }
  function move(e) {
    if (!drawing) return;
    const s = strokes[cur], n = nearest(s, pt(e)), was = off;
    off = n.d > 38;
    if (off) { sc(0); msg("Stay on the path 🙂"); if (!was) bad(); return; }
    msg("");
    if (n.t > prog) { prog = n.t; lastM = performance.now(); sc(.25); }
    if (prog >= s.total * 0.93) {
      const end = s.pts[s.pts.length - 1]; burst(end[0], end[1], 28);
      cur++; prog = 0; drawing = false; off = false; sc(0);
      setStars(Math.floor(cur * 3 / strokes.length)); good();
      if (navigator.vibrate) navigator.vibrate(40);
      if (cur >= strokes.length) letterDone(); else msg("Great! Now the next line ➡️");
    }
  }
  function up() { sc(0); if (drawing) { drawing = false; off = false; msg("Continue from the glowing dot 👆"); } }

  function letterDone() {
    msg("Well done! 🎉");
    const ch = items[li], U = ch.x.U;
    const after = () => setTimeout(() => { tr++; setProg(); if (li < items.length - 1) startTrace(li + 1); else practice(); }, 800);
    const snd = () => Snd.play("audio/adrian/sounds/adrian_" + U + "_sound.mp3", ch.x.soundSay, after);
    setTimeout(() => {
      if (ch.size === "big") Snd.play("audio/adrian/names/adrian_" + U + "_name.mp3", ch.x.nameSay, () => setTimeout(snd, 400));
      else snd();
    }, 700);
  }

  // ---------- Step 3: practice in the real notebook ----------
  function practice() {
    const letters = L.map(x => x.U + x.l).join("  ");
    $("#view").innerHTML = `
    <div class="w-scene"><div class="w-cover"><div class="w-rings"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="w-paper"><div class="w-panel">
        <div class="e">📒✏️</div>
        <p><b>You are doing wonderfully!</b></p>
        <p>Grab your notebook and pencil, and write <b>${letters}</b> three times. Show a grown-up when you are done!</p>
        <button class="w-btn" id="w-did">I practiced! ✅</button>
      </div></div></div></div>`;
    Snd.play(traceFile("notebook"), "You are doing wonderfully! Grab your notebook and pencil, and write these letters three times. Show a grown-up when you are done!");
    $("#w-did").onclick = finish;
  }
  function finish() {
    App.finishWriting(lesson.id);
    App.setProgress(1);
    const k = LESSONS.indexOf(lesson), nxt = LESSONS[k + 1];
    const canNext = nxt && ready(nxt);
    $("#view").innerHTML = `
    <div class="w-scene"><div class="w-cover"><div class="w-rings"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="w-paper"><div class="w-panel">
        <div class="e">🌟</div>
        <p><b>Writing level ${k + 1} complete!</b></p>
        <p>Great writing, ${L.map(x => x.U).join(", ")}!</p>
        <button class="w-btn alt" id="w-redo">🔁 Write again</button>
        <button class="w-btn" id="w-next">${canNext ? "➡️ Next writing level" : "🏠 Back to levels"}</button>
      </div></div></div></div>`;
    $("#w-redo").onclick = () => start(lesson);
    $("#w-next").onclick = () => canNext ? App.openWriting(nxt) : App.go("path");
  }

  return { start, ready };
})();
