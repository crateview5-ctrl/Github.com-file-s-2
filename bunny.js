// Animated reading bunny for the home screen hero card (right side).
// Artwork and animation are taken from her original bunny.html (same shapes, colours, timings).
// Self-contained: injects its own CSS and adds itself next to the hero text.
// To remove it later: delete this file and its <script> line in index.html.
(function () {
  var css = '' +
    '.lh-bunny{position:relative;flex:none;width:100px;margin:-6px -4px 0 4px}' +
    '.lh-bunny svg{display:block;width:100px;height:auto;overflow:visible}' +
    '.bn-vb{transform-box:view-box}' +
    '.bn-bubble{position:absolute;top:96px;right:0;white-space:nowrap;background:#fff;border:1.5px solid #b9d2ee;color:#1f2a4d;font:800 12.5px "Nunito",sans-serif;padding:6px 12px;border-radius:16px;opacity:0;z-index:3;box-shadow:0 4px 10px rgba(28,46,79,.12);transform-origin:70% 0}' +
    '.bn-bubble::before{content:"";position:absolute;top:-6px;right:34px;width:9px;height:9px;background:#fff;border-left:1.5px solid #b9d2ee;border-top:1.5px solid #b9d2ee;transform:rotate(45deg)}' +
    '.bn-look{transform:translateY(6px);transform-origin:150px 150px}' +
    '.bn-blink{transform-origin:150px 150px}' +
    '.bn-head{transform:rotate(3deg) translateY(3px);transform-origin:150px 205px}' +
    '@media (prefers-reduced-motion: no-preference){' +
    '.bn-look{animation:bnLook 8s ease-in-out infinite}' +
    '.bn-blink{animation:bnBlink 8s linear infinite}' +
    '.bn-head{animation:bnHead 8s ease-in-out infinite}' +
    '.bn-bubble{animation:bnBub 8s ease-in-out infinite}' +
    '@keyframes bnLook{0%,40%{transform:translateY(6px)}50%,88%{transform:translateY(-4px)}97%,100%{transform:translateY(6px)}}' +
    '@keyframes bnHead{0%,40%{transform:rotate(3deg) translateY(3px)}50%,88%{transform:rotate(-2deg) translateY(-3px)}97%,100%{transform:rotate(3deg) translateY(3px)}}' +
    '@keyframes bnBlink{0%,22%,24.5%,70%,72.5%,100%{transform:scaleY(1)}23.2%,71.2%{transform:scaleY(0.1)}}' +
    '@keyframes bnBub{0%,52%{opacity:0;transform:scale(0.5)}59%{opacity:1;transform:scale(1.08)}62%,86%{opacity:1;transform:scale(1)}92%,100%{opacity:0;transform:scale(0.8)}}' +
    '}' +
    '@media (prefers-reduced-motion: reduce){.bn-bubble{opacity:1}}';

  var svg = '' +
    '<svg viewBox="24 28 252 268" aria-hidden="true" focusable="false">' +
    '<defs><clipPath id="bnCc"><circle cx="150" cy="170" r="120"/></clipPath></defs>' +
    '<circle cx="150" cy="170" r="120" fill="#2F86DB" stroke="#D6E8FA" stroke-width="6"/>' +
    '<g clip-path="url(#bnCc)">' +
    '<path d="M70 232 Q110 214 150 228 Q190 214 230 232 L230 300 L70 300 Z" fill="#1F5FB8"/>' +
    '<path d="M78 224 Q114 208 150 222 L150 262 Q114 248 78 262 Z" fill="#fff"/>' +
    '<path d="M222 224 Q186 208 150 222 L150 262 Q186 248 222 262 Z" fill="#F1F6FC"/>' +
    '<path d="M92 236 Q118 228 140 236 M92 246 Q118 238 140 246 M160 236 Q182 228 208 236 M160 246 Q182 238 208 246" stroke="#BFD3EA" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<rect x="148" y="222" width="4" height="42" fill="#1F5FB8"/>' +
    '</g>' +
    '<g class="bn-head bn-vb">' +
    '<ellipse cx="118" cy="80" rx="19" ry="46" fill="#fff" stroke="#DCE6F2" stroke-width="3" transform="rotate(-8 118 80)"/>' +
    '<ellipse cx="118" cy="82" rx="9" ry="32" fill="#F59AAE" transform="rotate(-8 118 82)"/>' +
    '<ellipse cx="182" cy="80" rx="19" ry="46" fill="#fff" stroke="#DCE6F2" stroke-width="3" transform="rotate(8 182 80)"/>' +
    '<ellipse cx="182" cy="82" rx="9" ry="32" fill="#F59AAE" transform="rotate(8 182 82)"/>' +
    '<ellipse cx="150" cy="152" rx="60" ry="54" fill="#fff" stroke="#DCE6F2" stroke-width="3"/>' +
    '<ellipse cx="114" cy="168" rx="11" ry="7" fill="#F8B4C4"/>' +
    '<ellipse cx="186" cy="168" rx="11" ry="7" fill="#F8B4C4"/>' +
    '<g class="bn-blink bn-vb"><g class="bn-look bn-vb">' +
    '<circle cx="126" cy="150" r="8" fill="#1F2A4D"/><circle cx="174" cy="150" r="8" fill="#1F2A4D"/>' +
    '<circle cx="129" cy="147" r="2.6" fill="#fff"/><circle cx="177" cy="147" r="2.6" fill="#fff"/>' +
    '</g></g>' +
    '<ellipse cx="150" cy="165" rx="5" ry="3.6" fill="#F27A93"/>' +
    '<path d="M143 173 Q147 179 150 173 Q153 179 157 173" stroke="#1F2A4D" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
    '</g></svg>';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  function mount() {
    var top = document.querySelector('#phone-home .lh-top');
    if (!top || top.querySelector('.lh-bunny')) return;
    var d = document.createElement('div');
    d.className = 'lh-bunny';
    d.innerHTML = svg + '<div class="bn-bubble" aria-hidden="true">Hello! I\'m here!</div>';
    top.appendChild(d);
  }

  var view = document.getElementById('view');
  if (view) new MutationObserver(mount).observe(view, { childList: true, subtree: true });
  mount();
})();
