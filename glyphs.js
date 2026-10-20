// Tracing paths for each letter, inside a 400x400 box.
// Each letter = list of strokes, each stroke = list of [x, y] points.
function glyphArc(cx, cy, r, a0, a1, n) {
  const p = [];
  for (let i = 0; i <= n; i++) {
    const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180;
    p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return p;
}
const GLYPHS = {
  A: [[[200, 70], [110, 330]], [[200, 70], [290, 330]], [[143, 235], [257, 235]]],
  B: [[[130, 70], [130, 330]],
      [[130, 70]].concat(glyphArc(210, 135, 65, -90, 90, 14), [[130, 200]]),
      [[130, 200]].concat(glyphArc(220, 265, 65, -90, 90, 14), [[130, 330]])],
  C: [glyphArc(200, 200, 130, -40, -320, 40)],
  a: [glyphArc(180, 230, 65, -45, -400, 36), [[245, 165], [245, 295]]],
  b: [[[130, 70], [130, 295]], glyphArc(195, 230, 65, 180, 540, 36)],
  c: [glyphArc(190, 230, 65, -40, -320, 30)]
};
