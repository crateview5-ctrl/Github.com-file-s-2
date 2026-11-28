// Animated reading bunny for the home screen hero card (right side).
// Self-contained: injects its own CSS and adds itself next to the hero text.
// To remove it later: delete this file and its <script> line in index.html.
(function () {
  var css = '' +
    '.lh-bunny{position:relative;flex:none;width:84px;height:84px;margin:-2px 0 0 4px}' +
    '.lh-bunny svg{display:block;width:84px;height:84px}' +
    '.bn-bubble{position:absolute;top:88px;right:0;white-space:nowrap;background:#eaf3ff;border:1.5px solid #b9d2ee;color:#1c2e4f;font:800 12.5px "Baloo 2","Nunito",sans-serif;padding:5px 11px;border-radius:14px;opacity:0;z-index:3}' +
    '.bn-bubble::before{content:"";position:absolute;top:-6px;right:30px;width:9px;height:9px;background:#eaf3ff;border-left:1.5px solid #b9d2ee;border-top:1.5px solid #b9d2ee;transform:rotate(45deg)}' +
    '.bn-pupils{transform:translate(0,2.6px)}' +
    '@media (prefers-reduced-motion: no-preference){' +
    '.bn-pupils{animation:bnLook 9s ease-in-out infinite}' +
    '.bn-bubble{animation:bnSay 9s ease-in-out infinite}' +
    '@keyframes bnLook{' +
    '0%{transform:translate(-1.6px,2.6px)}9%{transform:translate(1.6px,2.6px)}18%{transform:translate(-1.6px,2.6px)}27%{transform:translate(1.6px,2.6px)}36%{transform:translate(-1.6px,2.6px)}46%{transform:translate(0,2.6px)}' +
    '54%{transform:translate(0,-2.2px)}90%{transform:translate(0,-2.2px)}98%,100%{transform:translate(-1.6px,2.6px)}}' +
    '@keyframes bnSay{0%,54%{opacity:0;transform:translateY(4px) scale(.9)}60%,88%{opacity:1;transform:translateY(0) scale(1)}94%,100%{opacity:0;transform:translateY(4px) scale(.9)}}' +
    '}' +
    '@media (prefers-reduced-motion: reduce){.bn-bubble{opacity:1}}';

  var svg = '' +
    '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
    '<defs><clipPath id="bnClip"><circle cx="50" cy="50" r="48"/></clipPath></defs>' +
    '<circle cx="50" cy="50" r="48" fill="#2783cc"/>' +
    '<g clip-path="url(#bnClip)">' +
    '<ellipse cx="37" cy="26" rx="9" ry="20" fill="#fff" transform="rotate(-6 37 26)"/>' +
    '<ellipse cx="37" cy="27" rx="4.4" ry="14" fill="#ffb3c7" transform="rotate(-6 37 27)"/>' +
    '<ellipse cx="63" cy="26" rx="9" ry="20" fill="#fff" transform="rotate(6 63 26)"/>' +
    '<ellipse cx="63" cy="27" rx="4.4" ry="14" fill="#ffb3c7" transform="rotate(6 63 27)"/>' +
    '<ellipse cx="50" cy="50" rx="24" ry="20" fill="#fff"/>' +
    '<circle cx="35" cy="57" r="4.2" fill="#ffb3c7"/><circle cx="65" cy="57" r="4.2" fill="#ffb3c7"/>' +
    '<ellipse cx="41" cy="49" rx="5.6" ry="6.2" fill="#fff" stroke="#c9d8ea" stroke-width="1.2"/>' +
    '<ellipse cx="59" cy="49" rx="5.6" ry="6.2" fill="#fff" stroke="#c9d8ea" stroke-width="1.2"/>' +
    '<g class="bn-pupils"><circle cx="41" cy="49" r="3" fill="#1c2e4f"/><circle cx="59" cy="49" r="3" fill="#1c2e4f"/>' +
    '<circle cx="42" cy="47.6" r="1" fill="#fff"/><circle cx="60" cy="47.6" r="1" fill="#fff"/></g>' +
    '<ellipse cx="50" cy="57" rx="2.6" ry="1.9" fill="#ff8fb0"/>' +
    '<path d="M46.5 60.6q3.5 2.8 7 0" fill="none" stroke="#1c2e4f" stroke-width="1.3" stroke-linecap="round"/>' +
    '<path d="M50 69C42 64 32 64 24 67.5V91C32 87.5 42 87.5 50 92Z" fill="#1b5fa6"/>' +
    '<path d="M50 69C58 64 68 64 76 67.5V91C68 87.5 58 87.5 50 92Z" fill="#1b5fa6"/>' +
    '<path d="M50 71C43 67 34 67 27 70V88.5C34 85.5 43 85.5 50 89.5Z" fill="#eaf3ff"/>' +
    '<path d="M50 71C57 67 66 67 73 70V88.5C66 85.5 57 85.5 50 89.5Z" fill="#eaf3ff"/>' +
    '<path d="M31 74.5q8-2 15 1M31 79q8-2 15 1M54 75.5q7-3 15-1M54 80q7-3 15-1" fill="none" stroke="#9db9d9" stroke-width="1.1" stroke-linecap="round"/>' +
    '<line x1="50" y1="70" x2="50" y2="90" stroke="#1b5fa6" stroke-width="1.6"/>' +
    '<ellipse cx="26" cy="78" rx="5" ry="4.4" fill="#fff"/><ellipse cx="74" cy="78" rx="5" ry="4.4" fill="#fff"/>' +
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
