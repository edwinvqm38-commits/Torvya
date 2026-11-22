/* ================= movimiento, apariencia y preferencias =================
   Un solo módulo controla todas las animaciones nuevas. Solo anima transform y opacity.
   Niveles: completo · equilibrado · reducido · desactivado. Se guarda en el navegador. */
var TRZ = (function () {
  var W = typeof window !== 'undefined' ? window : null;
  var LV = {
    completo: { nav: 1, charts: 1, micro: 1, load: 1, spring: 1, move: 1 },
    equilibrado: { nav: 1, charts: 1, micro: 1, load: 1, spring: 0, move: 1 },
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
    defaults: function () { var r = T.reduceDefault(); return { level: r ? 'reducido' : 'equilibrado', nav: true, charts: true, micro: true, load: true, speed: 'normal', snd: { on: !r, vol: 'bajo', click: true, ok: true, panel: true, alert: true } }; },
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
      try { el.animate([{ opacity: 0, transform: from.trim() || 'none' }, { opacity: 1, transform: (pre || 'none') }], { duration: T.dur(o.ms || 220), delay: o.delay || 0, easing: T.ease, fill: 'backwards' }); } catch (e) { }
    },
    /* varios elementos uno tras otro (máx. ~0,35 s de escalonado); en Reducido solo fundido y sin espera */
    stagger: function (list, o) {
      o = o || {}; var n = Math.min(list.length, 14), step = T.moves() ? Math.min(o.step || 45, 340 / Math.max(1, n)) : 0;
      for (var i = 0; i < list.length; i++) T.enter(list[i], { dy: o.dy == null ? 10 : o.dy, ms: o.ms || 280, delay: Math.round(Math.min(i, 13) * step) });
    },

    /* esqueleto de carga breve (0,3 s) antes de mostrar los datos */
    skelRe: /(^|\s)(blk-kpi|blk-chart|blk-db|blk-slicer|blk-pm|blk-scurve|blk-sheet|blk-map|blk-todo)(\s|$)/,
    skeleton: function (comp, items, force, after) {
      if (!T.on('load')) return [];
      var shown = [];
      for (var i = 0; i < items.length; i++) { var el = items[i]; if (force || T.skelRe.test(el.className || '')) { el.classList.add('skl'); shown.push(el); } }
      if (!shown.length) return shown;
      comp._skEls = (comp._skEls || []).concat(shown);
      if (comp._skT) clearTimeout(comp._skT);
      comp._skT = setTimeout(function () {
        var els = comp._skEls || []; comp._skEls = [];
        for (var k = 0; k < els.length; k++) els[k].classList.remove('skl');
        if (after) after(els);
      }, T.dur(300));
      return shown;
    },
    /* sonidos sutiles (Web Audio, sin archivos) */
    _ac: null, _last: 0,
    sound: function (kind) {
      var sn = cfg.snd; if (!W || !sn || !sn.on || cfg.level === 'desactivado') return;
      var grp = { click: 'click', ok: 'ok', err: 'alert', notice: 'alert', open: 'panel', close: 'panel' }[kind];
      if (!grp || sn[grp] === false) return;
      var now = Date.now(); if (now - T._last < 35) return; T._last = now;
      try {
        var AC = W.AudioContext || W.webkitAudioContext; if (!AC) return;
        var ac = T._ac || (T._ac = new AC()); if (ac.state === 'suspended') ac.resume();
        var vol = { bajo: 0.05, medio: 0.1, alto: 0.18 }[sn.vol] || 0.05, t0 = ac.currentTime;
        function tone(f1, f2, dur, type, g, at) {
          var o = ac.createOscillator(), gn = ac.createGain(), st = t0 + (at || 0);
          o.type = type; o.frequency.setValueAtTime(f1, st); o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), st + dur);
          gn.gain.setValueAtTime(0.0001, st); gn.gain.exponentialRampToValueAtTime(vol * g, st + 0.004); gn.gain.exponentialRampToValueAtTime(0.0001, st + dur);
          o.connect(gn); gn.connect(ac.destination); o.start(st); o.stop(st + dur + 0.02);
        }
        if (kind === 'click') tone(300, 150, 0.035, 'triangle', 1);
        else if (kind === 'ok') { tone(520, 540, 0.09, 'sine', 0.9, 0); tone(780, 800, 0.12, 'sine', 0.8, 0.08); }
        else if (kind === 'err') { tone(330, 320, 0.1, 'triangle', 1, 0); tone(247, 240, 0.14, 'triangle', 1, 0.09); }
        else if (kind === 'notice') { tone(660, 650, 0.12, 'sine', 0.9, 0); tone(880, 870, 0.1, 'sine', 0.5, 0.1); }
        else if (kind === 'open') tone(200, 420, 0.09, 'sine', 0.7);
        else if (kind === 'close') tone(420, 200, 0.09, 'sine', 0.6);
      } catch (e) { }
    },
    /* toque: onda suave desde el punto tocado y sonido de clic */
    ripSel: '.btn,.tool,.seg-btn,.slc,.nav-item,.vtab,.addblk-item,.menu-item,.kcard,.gcard,.clk,.pmp-row,.icon-btn',
    clickSel: 'button,a[href],[role="button"],[role="switch"],.nav-item,.vtab,.seg-btn,.slc,.kcard,.gcard,.clk,.pmp-row,.cc,.hb,summary,input[type="checkbox"],input[type="radio"],select',
    initTouch: function () {
      if (T._ti || !W) return; T._ti = true;
      document.addEventListener('pointerdown', function (e) {
        if (!T.on('micro') || !e.target.closest) return;
        var t = e.target.closest(T.ripSel); if (!t || t.disabled || t.closest('.blk-tools')) return;
        var r = t.getBoundingClientRect(), sz = Math.max(r.width, r.height) * 2.2, sp = document.createElement('span');
        if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
        sp.className = 'rip'; sp.style.cssText = 'left:' + (e.clientX - r.left - sz / 2) + 'px;top:' + (e.clientY - r.top - sz / 2) + 'px;width:' + sz + 'px;height:' + sz + 'px';
        t.appendChild(sp);
        if (sp.animate) { var a = sp.animate([{ transform: 'scale(0)', opacity: 0.2 }, { transform: 'scale(1)', opacity: 0 }], { duration: T.dur(520), easing: 'ease-out' }); a.onfinish = function () { sp.remove(); }; } else sp.remove();
      }, true);
      document.addEventListener('click', function (e) {
        if (!e.target.closest) return;
        var t = e.target.closest(T.clickSel); if (!t || t.disabled || t.getAttribute('aria-disabled') === 'true') return;
        if (t.closest('.scrim') || t.classList.contains('scrim')) { T.sound('close'); return; }
        T.sound('click');
      }, true);
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
  toastMsg(text) {
    var bad = /error|no se pudo|sin acceso|falta|obligatori|no puedes|solo .* pueden|no existe|inv[aá]lid|incompleta|circular|no hay/i.test(String(text || ''));
    TRZ.sound(bad ? 'err' : 'ok');
    var self = this, id = (this.st().toastId || 0) + 1;
    this.setState({ toast: text, toastId: id });
    setTimeout(function () { if (self.st().toastId === id) self.setState({ toast: null }); }, 4200);
  },
  sysMode() { try { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch (e) { return 'light'; } },
  sndSet(p) { var mv = this.st().mv || {}; this.mvSet({ snd: Object.assign({}, TRZ.defaults().snd, mv.snd || {}, p) }); },
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
      var main = document.querySelector('.main'), items = [];
      if (main) for (var i = 0; i < main.children.length; i++) {
        var ch = main.children[i]; if (ch.classList.contains('banner')) continue;
        var kids = ch.classList.contains('pg') || ch.classList.contains('page') ? ch.children : [ch];
        for (var j = 0; j < kids.length; j++) { var k = kids[j]; if (k.classList.contains('pg-grid')) { for (var q = 0; q < k.children.length; q++) items.push(k.children[q]); } else items.push(k); }
      }
      var sk = TRZ.skeleton(this, items, false, function (els) { TRZ.stagger(els, { dy: 10, ms: 300 }); self.mvNumbers(true); self.chartsSync(); });
      var rest = items.filter(function (x) { return sk.indexOf(x) < 0; });
      TRZ.stagger(rest, { dy: 10, ms: 300 });
      this._skNav = sk.length > 0;
      this._snap = {};
    } else this._skNav = false;
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
    var kdOpen = !!s.kd;
    if (kdOpen && !this._kdOpen) { var kdEl = document.querySelector('.kd'); if (kdEl) TRZ.enter(kdEl, { dy: 0, scale: 0.97, ms: 240 }); var ks = document.querySelector('.kd-scrim'); if (ks) TRZ.enter(ks, { dy: 0, ms: 200 }); }
    var panelNow = recOpen || kdOpen || !!s.drawer;
    if (this._panel !== undefined && panelNow !== this._panel) TRZ.sound(panelNow ? 'open' : 'close');
    this._panel = panelNow; this._kdOpen = kdOpen;
    var un = (s.notifs || []).filter(function (n) { return !n.read; }).length;
    if (this._un !== undefined && un > this._un) TRZ.sound('notice');
    this._un = un;
    TRZ.initTouch();
    this.mvNumbers(navChanged && !this._skNav);
    this.mvViews();
    this.mvRows(navChanged || first);
    if (typeof this.chartsSync === 'function') this.chartsSync();
    if (!this._motionLib && TRZ.on('spring')) { this._motionLib = true; TRZ.load('trz-motion.js', function () { return !!window.TrzMotion; }); }
  },

  /* indicadores: el número recorre el camino hasta el valor nuevo */
  mvNumbers(zero) {
    var els = document.querySelectorAll('.kpi-val, .sc-m-v');
    for (var i = 0; i < els.length; i++) {
      var el = els[i], txt = el.textContent;
      if (el._anim && txt === el._t) { el._anim.stop(); el._anim = null; }
      var prev = el._t; el._t = txt;
      if (!TRZ.on('micro') || prev === txt) continue;
      if (zero && /\d/.test(txt)) prev = txt.replace(/\d/g, '0');
      else if (prev === undefined) continue;
      var a = /^([^\d-]*)(-?[\d.,]+)(.*)$/.exec(prev), b = /^([^\d-]*)(-?[\d.,]+)(.*)$/.exec(txt);
      if (!a || !b || a[1] !== b[1] || a[3] !== b[3]) continue;
      var na = parseFloat(a[2].replace(/,/g, '')), nb = parseFloat(b[2].replace(/,/g, ''));
      if (!isFinite(na) || !isFinite(nb)) continue;
      var dec = (b[2].split('.')[1] || '').length;
      TRZ.count(el, na, nb, b[1], b[3], dec);
    }
  },

  /* tablas y vistas: al cambiar de vista, diseño o filtros el contenido reaparece suavemente */
  mvViews() {
    var vs = document.querySelectorAll('.dbv[data-vsig]'), skip = /(^|\s)(toolbar|dbv-head|addview|fchips|xf-note|headbar|cellbar)(\s|$)/;
    for (var i = 0; i < vs.length; i++) {
      var el = vs[i], sg = el.getAttribute('data-vsig'), prev = el._vs;
      el._vs = sg;
      if (prev === undefined || prev === sg || !TRZ.on('nav')) continue;
      var list = []; for (var j = 0; j < el.children.length; j++) if (!skip.test(el.children[j].className || '')) list.push(el.children[j]);
      var self2 = this, sk2 = TRZ.skeleton(this, list, true, function (els) { TRZ.stagger(els, { dy: 8, ms: 240, step: 30 }); self2.chartsSync(); });
      if (!sk2.length) TRZ.stagger(list, { dy: 8, ms: 240, step: 30 });
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
      sndOn: seg([[true, 'Activado'], [false, 'Silencio']], !!(mv.snd && mv.snd.on), function (v) { self.sndSet({ on: v }); }),
      sndVol: seg([['bajo', 'Bajo'], ['medio', 'Medio'], ['alto', 'Alto']], (mv.snd && mv.snd.vol) || 'bajo', function (v) { self.sndSet({ vol: v }); setTimeout(function () { TRZ.sound('click'); }, 30); }),
      sndToggles: [['click', 'Botones y pestañas'], ['ok', 'Guardar y completar'], ['panel', 'Abrir y cerrar paneles'], ['alert', 'Avisos y errores']].map(function (x) {
        var on = !(mv.snd && mv.snd[x[0]] === false);
        return { label: x[1], cls: on ? 'on' : '', on: on, pick: function () { var p = {}; p[x[0]] = !on; self.sndSet(p); } };
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
