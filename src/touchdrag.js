/* ================= arrastre con el dedo =================
   El arrastre nativo del navegador (dragstart/dragover/drop) no existe en pantallas táctiles.
   Este módulo traduce el gesto táctil a esos mismos eventos, así los bloques, tarjetas, campos y
   páginas se mueven igual con dedo que con ratón.
   - El asa de un bloque arrastra de inmediato; el resto (tarjeta, campo, página) con pulsación larga.
   - Mientras se arrastra se desplaza la pantalla sola cerca de los bordes. */
(function () {
  if (typeof document === 'undefined' || typeof window === 'undefined' || window.__tdInstalled) return;
  window.__tdInstalled = true;
  var SEL = '.bt-grip, .kcard[draggable="true"], .fb-item[draggable="true"], .nav-row[draggable="true"]';
  var HOLD = 320, SLOP = 9, S = null, swallowUntil = 0, raf = 0;

  function mkDT() { return { _d: {}, effectAllowed: 'move', dropEffect: 'move', types: [], files: [], setData: function (k, v) { this._d[k] = String(v); }, getData: function (k) { return this._d[k] || ''; }, setDragImage: function () { } }; }
  function fire(el, type, x, y) {
    if (!el) return;
    var ev;
    try { ev = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, view: window }); } catch (e) { return; }
    try { Object.defineProperty(ev, 'dataTransfer', { value: S ? S.dt : mkDT() }); } catch (e2) { }
    el.dispatchEvent(ev);
  }
  function scrollable(el, axis) {
    while (el && el !== document.documentElement) {
      var cs = getComputedStyle(el), o = axis === 'y' ? cs.overflowY : cs.overflowX;
      if (/(auto|scroll)/.test(o) && (axis === 'y' ? el.scrollHeight > el.clientHeight + 2 : el.scrollWidth > el.clientWidth + 2)) return el;
      el = el.parentElement;
    }
    return null;
  }
  function edgeSpeed(pos, lo, hi) { var z = 56; if (pos < lo + z) return -Math.ceil((lo + z - pos) / z * 14); if (pos > hi - z) return Math.ceil((pos - (hi - z)) / z * 14); return 0; }
  function loop() {
    raf = 0;
    if (!S || !S.active) return;
    var t = S.over || document.elementFromPoint(S.x, S.y), moved = false;
    var sy = scrollable(t, 'y'), sx = scrollable(t, 'x');
    var ry = sy ? sy.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
    var vy = edgeSpeed(S.y, ry.top, ry.bottom);
    if (vy) { if (sy) sy.scrollTop += vy; else window.scrollBy(0, vy); moved = true; }
    if (sx) { var rx = sx.getBoundingClientRect(), vx = edgeSpeed(S.x, rx.left, rx.right); if (vx) { sx.scrollLeft += vx; moved = true; } }
    if (moved) over(S.x, S.y);
    raf = requestAnimationFrame(loop);
  }
  function place() { if (S && S.ghost) S.ghost.style.transform = 'translate(' + Math.round(S.x - S.gx) + 'px,' + Math.round(S.y - S.gy) + 'px)'; }
  function over(x, y) {
    var t = document.elementFromPoint(x, y);
    if (t && S.ghost && S.ghost.contains(t)) t = S.over;
    if (t !== S.over) { if (S.over) fire(S.over, 'dragleave', x, y); S.over = t; if (t) fire(t, 'dragenter', x, y); }
    if (t) fire(t, 'dragover', x, y);
  }
  function begin() {
    if (!S || S.active) return;
    clearTimeout(S.timer);
    S.active = true; S.dt = mkDT();
    fire(S.src, 'dragstart', S.x, S.y);
    var vis = S.src.classList.contains('bt-grip') ? (S.src.closest('.blk') || S.src) : S.src;
    var r = vis.getBoundingClientRect(), g = vis.cloneNode(true), w = Math.min(r.width, window.innerWidth - 24);
    g.removeAttribute('id'); g.classList.add('td-ghost');
    g.style.width = w + 'px'; g.style.maxHeight = '150px';
    S.gx = Math.max(12, Math.min(S.x - r.left, w * 0.6)); S.gy = Math.max(12, Math.min(S.y - r.top, 44));
    document.body.appendChild(g); S.ghost = g; S.vis = vis; vis.classList.add('td-src');
    document.body.classList.add('td-active');
    try { if (navigator.vibrate) navigator.vibrate(10); } catch (e) { }
    place(); over(S.x, S.y);
    if (!raf) raf = requestAnimationFrame(loop);
  }
  function finish(drop) {
    if (!S) return;
    var s = S; clearTimeout(s.timer);
    if (s.active) {
      if (drop && s.over) fire(s.over, 'drop', s.x, s.y);
      fire(s.src, 'dragend', s.x, s.y);
      swallowUntil = Date.now() + 500;
      if (s.vis) s.vis.classList.remove('td-src');
      if (s.ghost) { var g = s.ghost; g.classList.add('td-gone'); setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); }, 160); }
      document.body.classList.remove('td-active');
    }
    S = null;
  }
  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' || !e.isPrimary || S) return;
    var src = e.target && e.target.closest ? e.target.closest(SEL) : null;
    if (!src) return;
    if (e.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    S = { src: src, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, id: e.pointerId, active: false, grip: src.classList.contains('bt-grip'), over: null };
    if (!S.grip) S.timer = setTimeout(begin, HOLD);
  }, true);
  window.addEventListener('pointermove', function (e) {
    if (!S || e.pointerId !== S.id) return;
    S.x = e.clientX; S.y = e.clientY;
    if (!S.active) {
      var d = Math.abs(S.x - S.x0) + Math.abs(S.y - S.y0);
      if (S.grip) { if (d > 4) begin(); }
      else if (d > SLOP) { clearTimeout(S.timer); S = null; }
      return;
    }
    place(); over(S.x, S.y);
  }, true);
  window.addEventListener('pointerup', function (e) { if (S && e.pointerId === S.id) finish(true); }, true);
  window.addEventListener('pointercancel', function (e) { if (S && e.pointerId === S.id) finish(false); }, true);
  document.addEventListener('touchmove', function (e) { if (S && S.active && e.cancelable) e.preventDefault(); }, { passive: false });
  document.addEventListener('contextmenu', function (e) { if (S) e.preventDefault(); }, true);
  document.addEventListener('click', function (e) { if (Date.now() < swallowUntil) { e.stopPropagation(); e.preventDefault(); } }, true);
})();
