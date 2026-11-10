/* Home hero: ornaments hang from the rail and swing when brushed or tapped. */
(function () {
  var strand = document.getElementById("strand");
  if (!strand) return;
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) return;
  var items = Array.prototype.slice.call(strand.querySelectorAll(".bauble")).filter(function (el) {
    return getComputedStyle(el).display !== "none";
  });
  var state = items.map(function (el, i) {
    return { el: el, a: (i % 2 ? -1 : 1) * (4 + (i * 5) % 4), v: 0 };
  });
  var running = false;
  var last = 0;
  function frame(t) {
    var dt = Math.min(32, t - last || 16) / 16.67;
    last = t;
    var moving = false;
    state.forEach(function (s) {
      s.v += (-0.016 * s.a - 0.024 * s.v) * dt;
      s.a += s.v * dt;
      if (Math.abs(s.a) > 0.04 || Math.abs(s.v) > 0.01) moving = true;
      else { s.a = 0; s.v = 0; }
      s.el.style.transform = "rotate(" + s.a.toFixed(2) + "deg)";
    });
    if (moving) requestAnimationFrame(frame);
    else running = false;
  }
  function wake() {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }
  var px = null;
  var hero = strand.parentNode;
  hero.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    if (px === null) { px = e.clientX; return; }
    var dx = e.clientX - px;
    px = e.clientX;
    state.forEach(function (s) {
      var r = s.el.querySelector("img").getBoundingClientRect();
      if (e.clientX > r.left - 12 && e.clientX < r.right + 12 && e.clientY > r.top - 12 && e.clientY < r.bottom + 12) {
        s.v += Math.max(-0.45, Math.min(0.45, dx * -0.02));
      }
    });
    wake();
  });
  state.forEach(function (s) {
    s.el.querySelector("a").addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") { s.v += 0.6; wake(); }
    });
    s.el.style.transform = "rotate(" + s.a + "deg)";
  });
  wake();
})();
