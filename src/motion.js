/* ================= movimiento, apariencia y preferencias =================
   Un solo módulo controla todas las animaciones nuevas. Solo anima transform y opacity.
   Niveles: completo · equilibrado · reducido · desactivado. Se guarda en el navegador. */
var TRZ = (function () {
  var W = typeof window !== 'undefined' ? window : null;
  var LV = {
    completo: { nav: 1, charts: 1, micro: 1, load: 1, spring: 1, move: 1 },
    equilibrado: { nav: 1, charts: 1, micro: 1, load: 0, spring: 0, move: 1 },
    reducido: { nav: 1, charts: 0, micro: 0, load: 0, spring: 0, move: 0 },
    desactivado: { nav: 0, charts: 0, micro: 0, load: 0, spring: 0, move: 0 }
  };
  var SPEED = { rapida: 0.65, normal: 1, lenta: 1.6 };
  var cfg = { level: 'equilibrado', nav: true, charts: true, micro: true, load: true, speed: 'normal' };
  var T = {
    cfg: cfg,
    set: function (c) { if (!c) return; for (var k in c) if (c[k] !== undefined) cfg[k] = c[k]; if (!LV[cfg.level]) cfg.level = 'equilibrado'; },
    on: function (kind) { var l = LV[cfg.level] || LV.equilibrado; if (!l[kind]) return false; return kind === 'spring' || kind === 'move' ? (cfg.micro || cfg.nav) : cfg[kind] !== false; },
    moves: function () { return !!(LV[cfg.level] || LV.equilibrado).move; },
    dur: function (ms) { return Math.round(ms * (SPEED[cfg.speed] || 1)); },
    ease: 'cubic-bezier(.2,.7,.3,1)',
    reduceDefault: function () { try { return !!(W && W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } },
    defaults: function () { return { level: T.reduceDefault() ? 'reducido' : 'equilibrado', nav: true, charts: true, micro: true, load: true, speed: 'normal' }; },
    /* carga de archivos propios (sin CDN), una sola vez */
    _ld: {},
    load: function (file, ready) {
      if (!W) return;
      var L = T._ld;
      if (ready && ready()) return Promise.resolve(true);
      if (L[file]) return L[file];
      L[file] = new Promise(function (res) {
        var sc = document.createElement('script');
        sc.src = new URL('vendor/' + file, document.baseURI).href;
        sc.onload = function () { res(true); };
        sc.onerror = function () { L[file] = null; res(false); };
        document.head.appendChild(sc);
      });
      return L[file];
    },
    /* aparición suave: movimiento corto si el nivel lo permite, solo fundido si es reducido */
    enter: function (el, o) {
      if (!el || !el.animate || !T.on('nav')) return;
      o = o || {};
      var dy = T.moves() ? (o.dy == null ? 8 : o.dy) : 0, dx = T.moves() ? (o.dx || 0) : 0, sc = T.moves() ? (o.scale || 1) : 1, pre = o.pre || '';
      var from = pre + (dx || dy ? ' translate(' + dx + 'px,' + dy + 'px)' : '') + (sc !== 1 ? ' scale(' + sc + ')' : '');
      try { el.animate([{ opacity: 0, transform: from.trim() || 'none' }, { opacity: 1, transform: (pre || 'none') }], { duration: T.dur(o.ms || 220), easing: T.ease, fill: 'backwards' }); } catch (e) { }
    },
    /* números que suben o bajan hasta el valor nuevo */
    count: function (el, a, b, pre, suf, dec) {
      var run = el._anim; if (run) { run.stop(); el._anim = null; }
      var total = T.dur(T.on('spring') ? 800 : 520), t0 = null, fin = pre + T.fmt(b, dec) + suf, dead = false;
      var raf = W.requestAnimationFrame || function (f) { return setTimeout(function () { f(Date.now()); }, 16); };
      function ease(x) { return 1 - Math.pow(1 - x, 3); }
      function frame(ts) {
        if (dead) return;
        if (t0 == null) t0 = ts;
        var x = Math.min(1, (ts - t0) / total), val = a + (b - a) * ease(x);
        el.textContent = x >= 1 ? fin : pre + T.fmt(val, dec) + suf;
        if (x < 1) raf(frame); else el._anim = null;
      }
      el._anim = { stop: function () { dead = true; } };
      el.textContent = pre + T.fmt(a, dec) + suf;
      raf(frame);
    },
    fmt: function (n, d) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }
  };
  return T;
})();

/* ---------- preferencias guardadas en el navegador ---------- */
var PREF_KEYS = ['mode', 'accent', 'density', 'corners', 'font', 'contrast', 'mv'];
function prefsLoad() { try { var j = JSON.parse(localStorage.getItem('trazya.prefs') || 'null'); return j && typeof j === 'object' ? j : null; } catch (e) { return null; } }
function prefsSave(st) { try { var o = {}; PREF_KEYS.forEach(function (k) { if (st[k] !== undefined && st[k] !== null) o[k] = st[k]; }); localStorage.setItem('trazya.prefs', JSON.stringify(o)); } catch (e) { } }
var _makeInitial0 = makeInitial;
makeInitial = function () {
  var o = _makeInitial0(), p = prefsLoad();
  if (p) PREF_KEYS.forEach(function (k) { if (p[k] !== undefined) o[k] = p[k]; });
  o.mv = Object.assign(TRZ.defaults(), o.mv || {});
  if (o.mode === 'light' || o.mode === 'dark' || o.mode === 'system') { } else o.mode = null;
  return o;
};

Object.assign(Component.prototype, {
  setState(patch) {
    DCLogic.prototype.setState.call(this, patch);
    if (patch && typeof patch === 'object') { for (var i = 0; i < PREF_KEYS.length; i++) if (PREF_KEYS[i] in patch) { prefsSave(this.st()); break; } }
  },
  sysMode() { try { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch (e) { return 'light'; } },
  mvSet(p) { var s = this.st(); this.setState({ mv: Object.assign({}, s.mv, p) }); },

  /* ---------- después de cada pintado ---------- */
  afterRender() {
    if (typeof document === 'undefined') return;
    var self = this, s = this.st();
    TRZ.set(s.mv);
    if (!this._mq && window.matchMedia) {
      try {
        this._mq = window.matchMedia('(prefers-color-scheme: dark)');
        this._mq.addEventListener('change', function () { if (self.st().mode === 'system') self.setState({ _sys: Date.now() }); });
      } catch (e) { }
    }
    var first = this._pg === undefined;
    var sig = [s.screen, s.page, s.table].join('|');
    var navChanged = !first && sig !== this._pg;
    this._pg = sig;
    if (navChanged) {
      var main = document.querySelector('.main');
      if (main) for (var i = 0; i < main.children.length; i++) { var ch = main.children[i]; if (!ch.classList.contains('banner')) TRZ.enter(ch, { dy: 10, ms: 260 }); }
      this._snap = {};
    }
    /* panel o ventana del registro */
    var recOpen = !!s.rec;
    if (recOpen && !this._recOpen) {
      var rec = document.querySelector('.rec');
      if (rec) {
        if (rec.classList.contains('full')) TRZ.enter(rec, { dy: 0, scale: 0.97, pre: 'translateX(-50%)', ms: 260 });
        else TRZ.enter(rec, { dx: 28, dy: 0, ms: 260 });
        var sc = document.querySelector('.rec-scrim'); if (sc) TRZ.enter(sc, { dy: 0, ms: 200 });
      }
    }
    this._recOpen = recOpen;
    this.mvNumbers();
    this.mvRows(navChanged || first);
    if (typeof this.chartsSync === 'function') this.chartsSync();
    if (!this._motionLib && TRZ.on('spring')) { this._motionLib = true; TRZ.load('trz-motion.js', function () { return !!window.TrzMotion; }); }
  },

  /* indicadores: el número recorre el camino hasta el valor nuevo */
  mvNumbers() {
    var els = document.querySelectorAll('.kpi-val, .sc-m-v');
    for (var i = 0; i < els.length; i++) {
      var el = els[i], txt = el.textContent;
      if (el._anim && txt === el._t) { el._anim.stop(); el._anim = null; }
      var prev = el._t; el._t = txt;
      if (prev === undefined || prev === txt || !TRZ.on('micro')) continue;
      var a = /^([^\d-]*)(-?[\d.,]+)(.*)$/.exec(prev), b = /^([^\d-]*)(-?[\d.,]+)(.*)$/.exec(txt);
      if (!a || !b || a[1] !== b[1] || a[3] !== b[3]) continue;
      var na = parseFloat(a[2].replace(/,/g, '')), nb = parseFloat(b[2].replace(/,/g, ''));
      if (!isFinite(na) || !isFinite(nb)) continue;
      var dec = (b[2].split('.')[1] || '').length;
      TRZ.count(el, na, nb, b[1], b[3], dec);
    }
  },

  /* tablas: reordenar con FLIP, aparición de filas nuevas y resaltado de lo que cambió */
  mvRows(reset) {
    var tbls = document.querySelectorAll('.tbl'), snap = this._snap = this._snap || {};
    for (var t = 0; t < tbls.length; t++) {
      var tb = tbls[t], blk = tb.closest('[data-bid]'), id = blk ? blk.getAttribute('data-bid') : 'main:' + t;
      var top0 = tb.getBoundingClientRect().top, rows = tb.querySelectorAll('.tr.row[data-rk]'), now = {}, old = snap[id];
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i], k = r.getAttribute('data-rk'), y = r.getBoundingClientRect().top - top0, sg = r.textContent;
        now[k] = { y: y, sg: sg };
        if (!old || !TRZ.on('micro') || reset) continue;
        var o = old[k];
        if (!o) { TRZ.enter(r, { dy: 6, ms: 220 }); continue; }
        var dy = o.y - y;
        if (Math.abs(dy) > 2 && TRZ.moves() && r.animate) { try { r.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: TRZ.dur(280), easing: TRZ.ease }); } catch (e) { } }
        else if (o.sg !== sg && r.animate) { try { r.animate([{ backgroundColor: 'color-mix(in srgb, var(--acc) 18%, transparent)' }, { backgroundColor: 'transparent' }], { duration: TRZ.dur(1100), easing: 'ease-out' }); } catch (e) { } }
      }
      snap[id] = now;
    }
  },

  /* ---------- ajustes de apariencia y movimiento (pantalla Personalizar) ---------- */
  mvVals(s) {
    var self = this, mv = s.mv || TRZ.defaults();
    function seg(list, cur, fn) { return list.map(function (x) { return { label: x[1], cls: x[0] === cur ? 'on' : '', on: x[0] === cur, pick: function () { fn(x[0]); } }; }); }
    return {
      mvCls: 'mv-' + mv.level + ' mvs-' + mv.speed + (s.contrast ? ' hc' : ''),
      contrastOpts: seg([[false, 'Normal'], [true, 'Alto']], !!s.contrast, function (v) { self.setState({ contrast: v }); }),
      mvLevelOpts: seg([['completo', 'Completo'], ['equilibrado', 'Equilibrado'], ['reducido', 'Reducido'], ['desactivado', 'Desactivado']], mv.level, function (v) { self.mvSet({ level: v }); }),
      mvSpeedOpts: seg([['rapida', 'Rápida'], ['normal', 'Normal'], ['lenta', 'Lenta']], mv.speed, function (v) { self.mvSet({ speed: v }); }),
      mvToggles: [['nav', 'Navegación'], ['charts', 'Gráficos'], ['micro', 'Microinteracciones'], ['load', 'Efectos de carga']].map(function (x) {
        var on = mv[x[0]] !== false;
        return { label: x[1], cls: on ? 'on' : '', on: on, pick: function () { var p = {}; p[x[0]] = !on; self.mvSet(p); } };
      }),
      mvHint: mv.level === 'desactivado' ? 'Sin animaciones.' : mv.level === 'reducido' ? 'Solo fundidos cortos, sin desplazamientos.' : mv.level === 'equilibrado' ? 'Transiciones, números y gráficas animadas.' : 'Todos los efectos, con resortes y gráficas que crecen al entrar.'
    };
  }
});

(function () {
  var baseRv = Component.prototype.renderVals;
  Component.prototype.renderVals = function () {
    var out = baseRv.call(this), s = this.st();
    TRZ.set(s.mv);
    return Object.assign(out, this.mvVals(s));
  };
})();
