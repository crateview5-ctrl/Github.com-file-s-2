// Start screen animation: the approved walk video (splash-walk.mp4, ~4s) plays once —
// the boy walks up the steps and through the arch, then the app opens.
// Tap anywhere to skip. If the video cannot play, the original logo shows instead.
(function () {
  if (document.getElementById("splash-anim")) return;
  const still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const st = document.createElement("style");
  st.textContent = `
#splash-anim{position:fixed;inset:0;z-index:99998;background:#eaf1ff;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity .45s ease}
#splash-anim.out{opacity:0}
.sa-logo{position:relative;width:min(62vw,260px);aspect-ratio:1;border-radius:22%;overflow:hidden;box-shadow:0 14px 34px rgba(28,46,79,.22)}
.sa-logo video,.sa-logo img{display:block;width:100%;height:100%;object-fit:cover}
.sa-title{margin:22px 0 0;font-family:var(--disp,'Baloo 2',sans-serif);font-size:26px;font-weight:800;color:#1c2e4f;text-align:center;animation:sa-up .7s .4s ease-out both}
@keyframes sa-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.sa-title{animation:none}}`;
  document.head.appendChild(st);

  const box = document.createElement("div");
  box.id = "splash-anim";
  box.setAttribute("aria-label", "BrightSteps Learning");
  box.innerHTML = '<div class="sa-logo"></div><h2 class="sa-title">BrightSteps Learning</h2>';
  const logo = box.firstChild;
  document.body.appendChild(box);

  let done = false;
  const end = () => {
    if (done) return; done = true;
    box.classList.add("out");
    setTimeout(() => { box.remove(); st.remove(); }, 500);
  };
  box.addEventListener("click", end);

  if (still) {
    const img = new Image();
    img.src = "icon-512.png"; img.alt = "";
    logo.appendChild(img);
    setTimeout(end, 1200);
    return;
  }

  const vid = document.createElement("video");
  vid.src = "splash-walk.mp4";
  vid.muted = true; vid.playsInline = true; vid.preload = "auto";
  vid.addEventListener("ended", end);
  vid.addEventListener("error", showStill);
  const play = vid.play();
  if (play) play.catch(showStill);
  logo.appendChild(vid);
  // safety: never hold the app longer than 5.5s
  setTimeout(end, 5500);

  function showStill() {
    if (done) return;
    vid.remove();
    const img = new Image();
    img.src = "icon-512.png"; img.alt = "";
    logo.appendChild(img);
    setTimeout(end, 1200);
  }
})();
