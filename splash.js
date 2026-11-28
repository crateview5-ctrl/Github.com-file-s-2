// Start screen animation: the boy from the logo climbs the stairs and walks inside (about 3.6 s).
// Tap anywhere to skip. Needs splash-plate.webp and splash-boy.webp in the repo root;
// if they are missing, nothing changes and the normal logo screen shows.
(function () {
  if (document.getElementById("splash-anim")) return;
  const plate = new Image(), boy = new Image();
  let ready = 0;
  plate.onload = boy.onload = () => { if (++ready === 2) start(); };
  plate.src = "splash-plate.webp";
  boy.src = "splash-boy.webp";

  function start() {
    const still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const st = document.createElement("style");
    st.textContent = `
#splash-anim{position:fixed;inset:0;z-index:99998;background:#eaf1ff;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity .45s ease}
#splash-anim.out{opacity:0}
.sa-logo{position:relative;width:min(62vw,260px);aspect-ratio:1;border-radius:22%;overflow:hidden;box-shadow:0 14px 34px rgba(28,46,79,.22);animation:sa-pop .5s ease-out both}
.sa-logo img{position:absolute;display:block}
.sa-plate{inset:0;width:100%;height:100%}
.sa-boy{left:30.08%;top:33.59%;width:21.29%;height:42%;transform-origin:50% 100%;animation:sa-climb 2.7s .6s cubic-bezier(.45,.05,.4,1) both}
.sa-title{margin:22px 0 0;font-family:var(--disp,'Baloo 2',sans-serif);font-size:26px;font-weight:800;color:#1c2e4f;text-align:center;animation:sa-up .7s 1.2s ease-out both}
@keyframes sa-pop{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none}}
@keyframes sa-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes sa-climb{
 0%{transform:translate(0,0) scale(1);opacity:1}
 14%{transform:translate(9%,-12%) scale(1)}
 28%{transform:translate(23%,-19%) scale(.97)}
 42%{transform:translate(33%,-31%) scale(.95)}
 56%{transform:translate(47%,-36%) scale(.92)}
 70%{transform:translate(61%,-50%) scale(.86)}
 84%{transform:translate(75%,-55%) scale(.78);opacity:1;filter:brightness(1.15)}
 100%{transform:translate(89%,-64%) scale(.62);opacity:0;filter:brightness(1.5)}
}
@media (prefers-reduced-motion:reduce){.sa-boy{animation:none}.sa-logo,.sa-title{animation:none}}`;
    document.head.appendChild(st);

    const box = document.createElement("div");
    box.id = "splash-anim";
    box.setAttribute("aria-label", "BrightSteps Learning");
    box.innerHTML = '<div class="sa-logo"></div><h2 class="sa-title">BrightSteps Learning</h2>';
    const logo = box.firstChild;
    plate.className = "sa-plate"; plate.alt = "";
    boy.className = "sa-boy"; boy.alt = "";
    logo.appendChild(plate); logo.appendChild(boy);
    document.body.appendChild(box);

    let done = false;
    const end = () => {
      if (done) return; done = true;
      box.classList.add("out");
      setTimeout(() => { box.remove(); st.remove(); }, 500);
    };
    box.addEventListener("click", end);
    setTimeout(end, still ? 1200 : 3600);
  }
})();
