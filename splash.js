// Start screen animation: the whole original logo image (icon-512.png) animates as one —
// it rises step by step, as if the boy is climbing up and walking forward through the arch,
// then the app opens. The image is never cut, re-saved or compressed, so its quality stays
// exactly as exported. Tap anywhere to skip.
(function () {
  if (document.getElementById("splash-anim")) return;
  const img = new Image();
  img.onload = start;
  img.onerror = () => {}; // missing image: the normal logo screen shows instead
  img.src = "icon-512.png";

  function start() {
    const still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const st = document.createElement("style");
    st.textContent = `
#splash-anim{position:fixed;inset:0;z-index:99998;background:#eaf1ff;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity .45s ease}
#splash-anim.out{opacity:0}
.sa-logo{position:relative;width:min(62vw,260px);aspect-ratio:1;border-radius:22%;overflow:hidden;box-shadow:0 14px 34px rgba(28,46,79,.22);animation:sa-pop .5s ease-out both}
.sa-logo-img{display:block;width:100%;height:100%;animation:sa-climb 2.7s .6s cubic-bezier(.45,.05,.4,1) both}
.sa-title{margin:22px 0 0;font-family:var(--disp,'Baloo 2',sans-serif);font-size:26px;font-weight:800;color:#1c2e4f;text-align:center;animation:sa-up .7s 1.2s ease-out both}
@keyframes sa-pop{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none}}
@keyframes sa-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes sa-climb{
 0%{transform:translate(0,0) scale(1)}
 15%{transform:translate(1%,-2%) scale(1.02)}
 30%{transform:translate(2%,-5%) scale(1.04)}
 45%{transform:translate(2%,-5%) scale(1.04)}
 60%{transform:translate(3%,-8%) scale(1.07)}
 75%{transform:translate(3%,-8%) scale(1.07)}
 100%{transform:translate(4%,-12%) scale(1.12)}
}
@media (prefers-reduced-motion:reduce){.sa-logo-img{animation:none}.sa-logo,.sa-title{animation:none}}`;
    document.head.appendChild(st);

    const box = document.createElement("div");
    box.id = "splash-anim";
    box.setAttribute("aria-label", "BrightSteps Learning");
    box.innerHTML = '<div class="sa-logo"></div><h2 class="sa-title">BrightSteps Learning</h2>';
    const logo = box.firstChild;
    img.className = "sa-logo-img"; img.alt = "";
    logo.appendChild(img);
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
