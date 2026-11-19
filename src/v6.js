/* ================= v6: campos compactos, listas desplegables, ventana centrada y formato de texto ================= */
var DROP_TYPES = { select: 1, status: 1, multi_select: 1, person: 1, relation: 1 };
var TONES = [{ k: '', n: 'Sin color' }].concat(COLORS.map(function (c) { return { k: c, n: COLOR_NAME[c] }; }));
var TONE_ES = { gris: 'gray', azul: 'blue', verde: 'green', ambar: 'amber', violeta: 'violet', turquesa: 'teal', rojo: 'red', rosa: 'pink' };
var TONE_KEY_ES = {}; Object.keys(TONE_ES).forEach(function (k) { TONE_KEY_ES[TONE_ES[k]] = k; });
DOC_TYPES.push('toggle', 'code');
SLASH.splice(2, 0,
  { spec: 'doc:h2', n: 'Subtítulo', d: 'Encabezado mediano', icon: 'h2', k: 'subtitulo encabezado h2' },
  { spec: 'doc:h3', n: 'Encabezado pequeño', d: 'Encabezado de apartado', icon: 'h3', k: 'encabezado pequeno h3 apartado' },
  { spec: 'doc:bullet', n: 'Lista con viñetas', d: 'Puntos sueltos', icon: 'bullets', k: 'lista vinetas puntos bullet' },
  { spec: 'doc:number', n: 'Lista numerada', d: '1, 2, 3…', icon: 'numbers', k: 'lista numerada numeros' },
  { spec: 'doc:check', n: 'Casilla', d: 'Pendiente para marcar', icon: 'todo2', k: 'casilla check pendiente marcar' },
  { spec: 'doc:quote', n: 'Cita', d: 'Destaca una frase', icon: 'quote', k: 'cita frase quote' },
  { spec: 'doc:toggle', n: 'Lista desplegable', d: 'Texto que se abre y se cierra', icon: 'tgl', k: 'desplegable toggle plegable ocultar acordeon' },
  { spec: 'doc:code', n: 'Código', d: 'Texto en formato de código', icon: 'code', k: 'codigo code monoespaciado' }
);

/* ---------- texto con formato ----------
   **negrita**  *cursiva*  __subrayado__  ~~tachado~~  `código`  ==resaltado==
   {rojo|texto en color}  {fondo rojo|texto con fondo} */
var RT_RULES = [
  { re: /\*\*([\s\S]+?)\*\*/, c: 'rt-b' },
  { re: /__([\s\S]+?)__/, c: 'rt-u' },
  { re: /~~([\s\S]+?)~~/, c: 'rt-s' },
  { re: /`([^`]+?)`/, c: 'rt-code', flat: true },
  { re: /==([\s\S]+?)==/, c: 'rt-hl' },
  { re: /\{(fondo )?(gris|azul|verde|ambar|violeta|turquesa|rojo|rosa)\|([\s\S]+?)\}/, color: true },
  { re: /\*([^*\s][^*]*?)\*/, c: 'rt-i' }
];
function rtHasMarks(str) { return RT_RULES.some(function (r) { return r.re.test(str || ''); }); }
function rtParse(str, cls, out) {
  out = out || []; cls = cls || '';
  var guard = 0;
  while (str && guard++ < 400) {
    var best = null;
    RT_RULES.forEach(function (r) { var m = r.re.exec(str); if (m && (!best || m.index < best.m.index)) best = { r: r, m: m }; });
    if (!best) { out.push({ t: str, cls: cls }); break; }
    if (best.m.index) out.push({ t: str.slice(0, best.m.index), cls: cls });
    var inner, c;
    if (best.r.color) { inner = best.m[3]; c = (best.m[1] ? 'rt-bg-' : 'rt-fg-') + TONE_ES[best.m[2]]; }
    else { inner = best.m[1]; c = best.r.c; }
    var nc = (cls ? cls + ' ' : '') + c;
    if (best.r.flat) out.push({ t: inner, cls: nc }); else rtParse(inner, nc, out);
    str = str.slice(best.m.index + best.m[0].length);
  }
  return out;
}
/* convierte lo que escribe la persona en número: acepta 60000, 60,000.50, 60.000,50 o S/ 1 200 */
function parseNumInput(val) {
  var t = String(val == null ? '' : val).replace(/[^0-9.,\-]/g, '');
  if (!t) return '';
  var hasC = t.indexOf(',') >= 0, hasD = t.indexOf('.') >= 0;
  if (hasC && hasD) {
    if (t.lastIndexOf(',') > t.lastIndexOf('.')) t = t.replace(/\./g, '').replace(',', '.');
    else t = t.replace(/,/g, '');
  } else if (hasC) {
    var parts = t.split(',');
    var thousands = parts.length > 1 && parts.slice(1).every(function (p) { return p.length === 3; }) && parts.length > 2;
    t = thousands ? parts.join('') : parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
  } else if (hasD && (t.match(/\./g) || []).length > 1) {
    t = t.replace(/\./g, '');
  }
  return t;
}

var _fvBase6 = Component.prototype.fieldView;
var _bvBase6 = Component.prototype.blockView;
var _docKeyBase6 = Component.prototype.docKey;
var _docChangeBase6 = Component.prototype.docChange;
var _slashPickBase6 = Component.prototype.slashPick;

Object.assign(Component.prototype, {
  /* ---------- campos del detalle: una sola fila ---------- */
  fieldView(s, t, p, row, v, canEdit, ctx) {
    var self = this, f = _fvBase6.call(this, s, t, p, row, v, canEdit, ctx);
    f._pk = p.key; f._tp = p.type;
    f.eNum = false; f.fmtText = ''; f.numCls = ''; f.hasMeter = false; f.meterPct = 0;
    f.eDrop = false; f.dropPills = []; f.dropEmpty = false; f.openDrop = null; f.opa = ''; f.dropAria = '';
    f.hasFx = false; f.fxOpen = false; f.fxText = ''; f.fxCls = ''; f.fxToggle = null;
    if (f.eInput && p.type === 'number') {
      var raw = row[p.key], has = raw !== '' && raw != null && !isNaN(Number(raw));
      f.eInput = false; f.eNum = true;
      f.fmtText = has ? fmtNumber(raw, p.fmt || 'number', p.dec, p.sep) : '';
      f.numCls = has ? 'has-v' : '';
      if (has && (p.showAs === 'bar' || p.showAs === 'ring')) { f.hasMeter = true; f.meterPct = Math.round(Math.max(0, Math.min(100, Number(raw) / (Number(p.max) || 100) * 100))); }
      f.onChange = function (e) { ctx.set(p.key, parseNumInput(e.target.value), false); };
      f.hasNote = false; f.note = '';
    }
    if (f.hasNote) {
      if (p.type === 'formula' || p.type === 'rollup' || COMPUTED[p.type]) {
        var fk = t.id + ':' + p.key, open = s.fxOpen === fk;
        f.hasFx = true; f.fxText = f.note; f.fxOpen = open; f.fxCls = open ? 'on' : '';
        f.fxToggle = function () { self.setState({ fxOpen: self.st().fxOpen === fk ? null : fk }); };
      } else {
        f.desc = (f.desc ? f.desc + ' · ' : '') + f.note;
      }
      f.hasNote = false; f.note = '';
    }
    /* «Se calcula con …»: solo al abrir el detalle de la fórmula */
    if (f.hasRefs) {
      if (!f.hasFx) {
        var fk2 = t.id + ':' + p.key, open2 = s.fxOpen === fk2;
        f.hasFx = true; f.fxOpen = open2; f.fxCls = open2 ? 'on' : ''; f.fxText = p.expr ? 'Fórmula: ' + p.expr : '';
        f.fxToggle = function () { self.setState({ fxOpen: self.st().fxOpen === fk2 ? null : fk2 }); };
      }
      f.hasRefs = !!f.fxOpen;
    }
    return f;
  },

  /* ---------- lista desplegable de opciones (celda o campo) ---------- */
  opClose() { this.setState({ opPop: null, opQ: '', selCell: null }); },
  opData(s, v) {
    var self = this, o = s.opPop, none = { has: false };
    if (!o) return none;
    var t = s.tables.byId[o.tid]; if (!t) return none;
    var row = findRow(t, o.rid), p = propOf(t, o.key);
    if (!row || !p || !DROP_TYPES[p.type]) return none;
    var lvl = this.lvl(s, t.id, v.role); if (lvl !== 'edit' && lvl !== 'full') return none;
    var ctx = this.recCtx(t.id, row.id), q = s.opQ || '', nq = normTxt(q).trim();
    var match = function (txt) { return !nq || normTxt(txt).indexOf(nq) >= 0; };
    var close = function () { self.opClose(); };
    var multi = false, opts = [], raw = row[p.key], hasVal = false, ph = 'Buscar o elegir…';
    if (p.type === 'select' || p.type === 'status' || p.type === 'multi_select') {
      multi = p.type === 'multi_select';
      var arr = multi ? (raw || []) : null;
      hasVal = multi ? arr.length > 0 : !!raw;
      opts = p.options.filter(function (x) { return match(x.v); }).map(function (x) {
        var on = multi ? arr.indexOf(x.v) >= 0 : raw === x.v;
        return { label: x.v, on: on, cls: on ? 'on' : '', pcls: 'p-' + x.c, dot: p.type === 'status', isPill: true, isPerson: false, isRow: false, initials: '', color: '',
          pick: function () {
            if (multi) { var cur = (findRow(self.st().tables.byId[t.id], row.id) || {})[p.key] || []; ctx.set(p.key, cur.indexOf(x.v) >= 0 ? cur.filter(function (y) { return y !== x.v; }) : cur.concat([x.v]), true); }
            else { ctx.set(p.key, on && p.type === 'select' ? '' : x.v, true); close(); }
          } };
      });
      ph = multi ? 'Busca o crea etiquetas…' : 'Busca o crea una opción…';
    } else if (p.type === 'person') {
      multi = !p.single;
      var ids = raw || []; hasVal = ids.length > 0; ph = 'Buscar persona…';
      opts = s.members.filter(function (m) { return !m.pending && match(m.name); }).map(function (m) {
        var on = ids.indexOf(m.id) >= 0;
        return { label: m.name, on: on, cls: on ? 'on' : '', pcls: '', dot: false, isPill: false, isPerson: true, isRow: false, initials: initialsOf(m.name), color: m.color,
          pick: function () {
            var cur = (findRow(self.st().tables.byId[t.id], row.id) || {})[p.key] || [];
            if (multi) ctx.set(p.key, cur.indexOf(m.id) >= 0 ? cur.filter(function (y) { return y !== m.id; }) : cur.concat([m.id]), true);
            else { ctx.set(p.key, on ? [] : [m.id], true); close(); }
          } };
      });
    } else if (p.type === 'relation') {
      var T2 = s.tables.byId[p.target];
      if (!T2 || this.lvl(s, p.target, v.role) === 'none') return none;
      multi = !p.single;
      var vals = raw || []; hasVal = vals.length > 0; ph = 'Buscar en ' + T2.name + '…';
      opts = this.rowsFor(s, p.target, v).filter(function (x) { return match(self.titleOf(T2, x)); }).slice(0, 60).map(function (x) {
        var on = vals.indexOf(x.id) >= 0;
        return { label: self.titleOf(T2, x), on: on, cls: on ? 'on' : '', pcls: '', dot: false, isPill: false, isPerson: false, isRow: true, initials: '', color: T2.color,
          pick: function () { ctx.toggleRel(p.key, x.id, !!p.single); if (p.single) close(); } };
      });
    }
    var canStruct = v.role === 'admin' || lvl === 'full';
    var exact = (p.options || []).some(function (x) { return normTxt(x.v) === nq; });
    var canCreate = !!nq && (p.type === 'select' || p.type === 'multi_select' || p.type === 'status') && canStruct && !exact;
    return {
      has: true, title: 'Elegir ' + p.name, q: q, ph: ph, multi: multi, modeTxt: multi ? 'Varias' : 'Una',
      setQ: function (e) { self.setState({ opQ: e.target.value }); },
      key: function (e) {
        if (!e) return;
        if (e.key === 'Escape') { try { e.preventDefault(); } catch (er) { } close(); }
        else if (e.key === 'Enter') { try { e.preventDefault(); } catch (er) { } if (opts[0]) opts[0].pick(); else if (canCreate) this_create(); }
      },
      opts: opts, empty: opts.length === 0 && !canCreate, canCreate: canCreate, create: function () { this_create(); },
      hasClear: hasVal, clear: function () { ctx.set(p.key, (p.type === 'select' || p.type === 'status') ? '' : [], true); if (!multi) close(); },
      canOpenRec: o.anchor === '.td.cell-sel', openRec: function () { self.setState({ opPop: null, opQ: '', selCell: null }); self.openRec(t.id, row.id); },
      close: close
    };
    function this_create() {
      var txt = String(q).trim(); if (!txt) return;
      self.addOption(t.id, p.key, txt);
      var cur = (findRow(self.st().tables.byId[t.id], row.id) || {})[p.key];
      if (p.type === 'multi_select') ctx.set(p.key, (cur || []).concat([txt]), true);
      else { ctx.set(p.key, txt, true); close(); }
      self.setState({ opQ: '' });
    }
  },
  /* coloca la lista junto a su celda o campo; funciona aunque la página esté escalada */
  opPlace() {
    var o = this.st().opPop; if (!o) return;
    var pop = document.querySelector('.oppop'); if (!pop) return;
    var an = null; try { an = document.querySelector(o.anchor); } catch (e) { an = null; }
    if (!an) { pop.style.visibility = 'visible'; return; }
    pop.style.left = '0px'; pop.style.top = '0px';
    var r0 = pop.getBoundingClientRect(), k = pop.offsetWidth ? r0.width / pop.offsetWidth : 1;
    var a = an.getBoundingClientRect(), W = r0.width, H = r0.height, vw = window.innerWidth || 1200, vh = window.innerHeight || 800;
    var x = a.left, y = a.bottom + 4;
    if (y + H > vh - 8 && a.top - H - 4 > 8) y = a.top - H - 4;
    x = Math.max(8, Math.min(x, vw - W - 8)); y = Math.max(8, y);
    pop.style.left = ((x - r0.left) / k) + 'px'; pop.style.top = ((y - r0.top) / k) + 'px';
    pop.style.visibility = 'visible';
    if (this._opFocusKey !== o.tid + o.rid + o.key) {
      this._opFocusKey = o.tid + o.rid + o.key;
      try { var qi = pop.querySelector('.op-q'); if (qi && window.matchMedia && window.matchMedia('(pointer: fine)').matches) qi.focus(); } catch (e) { }
    }
  },
  opPlaceSoon() {
    var self = this;
    if (this._opRaf) return;
    if (!this._opListen) {
      this._opListen = true;
      try {
        window.addEventListener('scroll', function () { if (self.st().opPop) self.opPlace(); }, true);
        window.addEventListener('resize', function () { if (self.st().opPop) self.opPlace(); });
      } catch (e) { }
    }
    try { this._opRaf = requestAnimationFrame(function () { self._opRaf = null; self.opPlace(); }); } catch (e) { this._opRaf = null; }
  },

  /* ---------- formato del texto en las páginas ---------- */
  fmtEl(bid) { try { return document.querySelector('[data-bid="' + bid + '"] textarea.doc-in'); } catch (e) { return null; } },
  fmtWrap(bid, open, close) {
    var el = this.fmtEl(bid); if (!el) return;
    var val = String(el.value || ''), a = el.selectionStart || 0, b = el.selectionEnd || 0;
    var nv, na, nb, sel = val.slice(a, b);
    if (val.slice(a - open.length, a) === open && val.slice(b, b + close.length) === close) {
      nv = val.slice(0, a - open.length) + sel + val.slice(b + close.length); na = a - open.length; nb = b - open.length;
    } else if (sel.indexOf(open) === 0 && sel.slice(-close.length) === close && sel.length >= open.length + close.length) {
      var inner = sel.slice(open.length, sel.length - close.length);
      nv = val.slice(0, a) + inner + val.slice(b); na = a; nb = a + inner.length;
    } else {
      nv = val.slice(0, a) + open + sel + close + val.slice(b); na = a + open.length; nb = na + sel.length;
    }
    this.updBlock(bid, function (x) { x.text = nv; });
    var self = this;
    setTimeout(function () { var e2 = self.fmtEl(bid); if (e2) { try { e2.focus(); e2.setSelectionRange(na, nb); } catch (er) { } } }, 30);
  },
  fmtSetType(pid, bid, type, lvl) {
    this.docEdit(pid, function (p) { p.blocks.forEach(function (x) { if (x.id !== bid) return; x.type = type; if (type === 'heading') x.lvl = lvl || 1; else delete x.lvl; if (type === 'check' && x.done == null) x.done = false; }); });
    this.focusBlock(bid, true);
  },
  docKey(pid, bid, e) {
    if (e && (e.ctrlKey || e.metaKey) && !e.altKey) {
      var k = String(e.key || '').toLowerCase();
      var m = { b: ['**', '**'], i: ['*', '*'], u: ['__', '__'] }[k];
      if (m) { try { e.preventDefault(); } catch (er) { } this.fmtWrap(bid, m[0], m[1]); return; }
      if (k === 'e') { try { e.preventDefault(); } catch (er) { } this.fmtWrap(bid, '`', '`'); return; }
    }
    var s = this.st(), pg = s.pages.byId[pid], b = pg ? pg.blocks.filter(function (x) { return x.id === bid; })[0] : null;
    if (b && b.type === 'code' && e && e.key === 'Enter' && !e.shiftKey) return;
    if (b && b.type === 'toggle' && e && e.key === 'Enter' && !e.shiftKey && !b.open) {
      var el = e.target || {}, val = String(el.value || '');
      if (!/^\//.test(val) && !(s.mention && s.mention.bid === bid)) {
        try { e.preventDefault(); } catch (er) { }
        this.updBlock(bid, function (x) { x.open = true; });
        var self = this; setTimeout(function () { try { var t = document.querySelector('[data-bid="' + bid + '"] .doc-tg-in'); if (t) t.focus(); } catch (er2) { } }, 50);
        return;
      }
    }
    return _docKeyBase6.call(this, pid, bid, e);
  },
  docChange(pid, bid, val) {
    var s = this.st(), pg = s.pages.byId[pid];
    var b = pg ? pg.blocks.filter(function (x) { return x.id === bid; })[0] : null;
    if (b && b.type === 'text') {
      var conv = null, m;
      if ((m = val.match(/^>>\s/))) conv = { type: 'toggle', text: val.slice(m[0].length), open: false };
      else if ((m = val.match(/^```\s?/))) conv = { type: 'code', text: val.slice(m[0].length) };
      else if ((m = val.match(/^"\s/))) conv = { type: 'quote', text: val.slice(m[0].length) };
      if (conv) {
        this.docEdit(pid, function (p) { p.blocks.forEach(function (x) { if (x.id === bid) for (var k in conv) x[k] = conv[k]; }); });
        this.focusBlock(bid, true);
        return;
      }
    }
    return _docChangeBase6.call(this, pid, bid, val);
  },
  slashPick(pid, spec, opt) {
    if (String(spec).indexOf('doc:') !== 0) return _slashPickBase6.call(this, pid, spec, opt);
    opt = opt || {};
    var kind = spec.slice(4), type = kind, lvl = null;
    if (kind === 'h2' || kind === 'h3') { type = 'heading'; lvl = kind === 'h2' ? 2 : 3; }
    var target = opt.replace || null;
    var nid = this.docEdit(pid, function (p, seq) {
      var extra = { text: '' };
      if (type === 'check') extra.done = false;
      if (type === 'toggle') { extra.open = true; extra.body = ''; }
      if (lvl) extra.lvl = lvl;
      if (target) {
        var hit = null;
        p.blocks.forEach(function (x) { if (x.id === target) { hit = x; x.type = type; for (var k in extra) x[k] = extra[k]; if (!lvl) delete x.lvl; } });
        if (hit) return hit.id;
      }
      var id = 'b' + (seq + 1);
      p.blocks.push(blk(id, type, 12, extra));
      return id;
    });
    this.setState({ slashQ: '', addBlockOpen: false });
    if (nid) this.focusBlock(nid, true);
  },
  blockView(s, v, pg, b, ctx) {
    var self = this, bv = _bvBase6.call(this, s, v, pg, b, ctx);
    var isDoc = DOC_TYPES.indexOf(b.type) >= 0;
    /* color de fondo y de texto de cualquier bloque */
    var palOpen = s.bkPal === b.id && ctx.canEditPage;
    bv.palOpen = palOpen; bv.palCls = palOpen || b.bg || b.fg ? 'on' : '';
    bv.togglePal = function () { self.setState({ bkPal: self.st().bkPal === b.id ? null : b.id }); };
    bv.hasFg = isDoc || b.type === 'callout' || b.type === 'heading' || b.type === 'text';
    bv.bgOpts = TONES.map(function (tn) { var on = (b.bg || '') === tn.k; return { name: tn.n, on: on, cls: 'tone-' + (tn.k || 'none') + (on ? ' on' : ''), pick: function () { self.updBlock(b.id, function (x) { if (tn.k) x.bg = tn.k; else delete x.bg; }); } }; });
    bv.fgOpts = TONES.map(function (tn) { var on = (b.fg || '') === tn.k; return { name: tn.n, on: on, cls: 'tone-' + (tn.k || 'none') + (on ? ' on' : ''), pick: function () { self.updBlock(b.id, function (x) { if (tn.k) x.fg = tn.k; else delete x.fg; }); } }; });
    if (b.bg) bv.cls += ' has-bg rc-' + b.bg;
    if (b.fg) bv.cls += ' fg-' + b.fg;
    if (palOpen) bv.cls += ' pal-open';
    /* valores por defecto para la plantilla */
    bv.isToggle = false; bv.tgCls = ''; bv.tgOpen = false; bv.tgToggle = null; bv.tgShow = false; bv.tgBody = ''; bv.setTgBody = null;
    bv.editRaw = false; bv.showRich = false; bv.editRich = null; bv.onFocus = null; bv.onBlur = null; bv.rt = { segs: [] };
    bv.fmtOpen = false; bv.fmtBtns = []; bv.fmtTypes = []; bv.fmtFg = []; bv.fmtBg = []; bv.fmtColOpen = false; bv.fmtColCls = ''; bv.fmtColDown = null;
    if (!isDoc) return bv;
    var text = b.text || '';
    var marks = rtHasMarks(text), focused = s.docFocus === b.id;
    bv.rt = { segs: rtParse(text) };
    bv.editRaw = ctx.canEditPage && (!marks || focused);
    bv.showRich = ctx.canEditPage && marks && !focused;
    bv.editRich = function () { if (self.st().docFocus !== b.id) self.setState({ docFocus: b.id, fmtCol: false }); self.focusBlock(b.id, true); };
    bv.onFocus = function () { if (self.st().docFocus !== b.id) self.setState({ docFocus: b.id, fmtCol: false }); };
    bv.onBlur = function () {
      setTimeout(function () {
        var ae = null; try { ae = document.activeElement; } catch (e) { ae = null; }
        if (ae && ae.closest && ae.closest('[data-bid="' + b.id + '"]')) return;
        if (self.st().docFocus === b.id) self.setState({ docFocus: null, fmtCol: false });
      }, 160);
    };
    bv.typeName = { text: 'Texto', heading: 'Encabezado', bullet: 'Viñeta', number: 'Lista numerada', check: 'Casilla', quote: 'Cita', toggle: 'Lista desplegable', code: 'Código' }[b.type] || bv.typeName;
    bv.docCls = 'doc-' + (b.type === 'heading' ? 'h' + (b.lvl || 1) : b.type) + (b.done ? ' done' : '');
    if (b.type === 'toggle') {
      bv.isToggle = true; bv.tgOpen = !!b.open; bv.tgCls = b.open ? 'open' : ''; bv.tgShow = !!b.open; bv.tgBody = b.body || '';
      bv.tgToggle = function () { self.updBlock(b.id, function (x) { x.open = !x.open; }); };
      bv.setTgBody = function (e) { var val = e.target.value; self.updBlock(b.id, function (x) { x.body = val; }); };
      bv.docPh = 'Título del desplegable';
    }
    if (b.type === 'code') bv.docPh = 'Escribe código; Intro hace salto de línea';
    /* barra de formato del bloque que se está editando */
    if (focused && ctx.canEditPage) {
      bv.fmtOpen = true;
      var down = function (fn) { return function (e) { try { e.preventDefault(); } catch (er) { } self._fmtMD = Date.now(); fn(); }; };
      var click = function (fn) { return function () { if (self._fmtMD && Date.now() - self._fmtMD < 500) return; fn(); }; };
      bv.fmtBtns = [
        { label: 'B', cls: 'fb-b', aria: 'Negrita (Ctrl+B)', o: '**', c: '**' },
        { label: 'I', cls: 'fb-i', aria: 'Cursiva (Ctrl+I)', o: '*', c: '*' },
        { label: 'U', cls: 'fb-u', aria: 'Subrayado (Ctrl+U)', o: '__', c: '__' },
        { label: 'S', cls: 'fb-s', aria: 'Tachado', o: '~~', c: '~~' },
        { label: '‹›', cls: 'fb-c', aria: 'Código (Ctrl+E)', o: '`', c: '`' }
      ].map(function (x) { var fn = function () { self.fmtWrap(b.id, x.o, x.c); }; return { label: x.label, cls: x.cls, aria: x.aria, down: down(fn), click: click(fn) }; });
      var colOpen = !!s.fmtCol;
      bv.fmtColOpen = colOpen; bv.fmtColCls = colOpen ? 'on' : '';
      bv.fmtColDown = down(function () { self.setState({ fmtCol: !self.st().fmtCol }); });
      var tones = TONES.filter(function (tn) { return tn.k; });
      bv.fmtFg = tones.map(function (tn) { return { name: tn.n, cls: 'tone-' + tn.k, down: down(function () { self.setState({ fmtCol: false }); self.fmtWrap(b.id, '{' + TONE_KEY_ES[tn.k] + '|', '}'); }) }; });
      bv.fmtBg = tones.map(function (tn) { return { name: tn.n, cls: 'tone-' + tn.k, down: down(function () { self.setState({ fmtCol: false }); self.fmtWrap(b.id, '{fondo ' + TONE_KEY_ES[tn.k] + '|', '}'); }) }; });
      var cur = b.type === 'heading' ? 'h' + (b.lvl || 1) : b.type;
      bv.fmtTypes = [
        ['text', 'para', 'Texto'], ['h1', 'heading', 'Título'], ['h2', 'h2', 'Subtítulo'], ['h3', 'h3', 'Encabezado pequeño'],
        ['bullet', 'bullets', 'Viñetas'], ['number', 'numbers', 'Lista numerada'], ['check', 'todo2', 'Casilla'],
        ['quote', 'quote', 'Cita'], ['toggle', 'tgl', 'Lista desplegable'], ['code', 'code', 'Código']
      ].map(function (x) {
        var on = cur === x[0];
        return { icon: ICON[x[1]] || ICON.para, aria: 'Convertir en ' + x[2].toLowerCase(), cls: on ? 'on' : '',
          down: down(function () { var h = /^h[123]$/.test(x[0]); self.fmtSetType(pg.id, b.id, h ? 'heading' : x[0], h ? Number(x[0].slice(1)) : null); }) };
      });
    }
    return bv;
  }
});

(function () {
  var baseRv = Component.prototype.renderVals;
  Component.prototype.renderVals = function () {
    var self = this, out = baseRv.call(this);
    var s = this.st(), v = this.viewer(s);
    /* lista desplegable */
    out.op = this.opData(s, v);
    if (out.op.has) this.opPlaceSoon(); else this._opFocusKey = null;
    /* modo del registro: panel o ventana */
    var full = !!out.recFullB;
    out.recIsSide = !full; out.recSideCls = full ? '' : 'on'; out.recFullCls = full ? 'on' : '';
    out.recAsSide = function () { self.setState({ recFull: false, recPref: 'side' }); };
    out.recAsFull = function () { self.setState({ recFull: true, recPref: 'full' }); };
    var rec = out.rec || {};
    rec.bgCls = ''; rec.palOpen = false; rec.pal = []; rec.togglePal = null;
    if (out.hasRec && s.rec) {
      var t = s.tables.byId[s.rec.tid], row = t ? findRow(t, s.rec.id) : null;
      if (t && row) {
        var tid = t.id, rid = row.id;
        rec.bgCls = row._bg ? 'rc-' + row._bg : '';
        rec.palOpen = s.recPal === rid;
        rec.togglePal = function () { self.setState({ recPal: self.st().recPal === rid ? null : rid }); };
        rec.pal = TONES.map(function (tn) { var on = (row._bg || '') === tn.k; return { name: tn.n, on: on, cls: 'tone-' + (tn.k || 'none') + (on ? ' on' : ''), pick: function () { self.setField(tid, rid, '_bg', tn.k || null, null); self.setState({ recPal: null }); } }; });
        /* selección, etiquetas y personas como lista desplegable */
        if (rec.canEdit) (rec.fields || []).forEach(function (f) {
          if (!(f.eSelect || f.ePeople)) return;
          var p = propOf(t, f._pk); if (!p) return;
          var raw = row[p.key], pills = [];
          if (p.type === 'person') {
            pills = (raw || []).map(function (id) { var m = self.memberById(s, id); return m ? { text: m.name, isPerson: true, isPill: false, initials: initialsOf(m.name), color: m.color, cls: '', dot: false } : null; }).filter(function (x) { return x; });
          } else {
            var vals = p.type === 'multi_select' ? (raw || []) : (raw ? [raw] : []);
            pills = vals.map(function (val) { var op = optOf(p, val); return { text: val, isPerson: false, isPill: true, initials: '', color: '', cls: op ? 'p-' + op.c : 'p-gray', dot: p.type === 'status' }; });
          }
          f.eSelect = false; f.ePeople = false; f.eDrop = true;
          f.dropPills = pills; f.dropEmpty = pills.length === 0; f.opa = 'rf-' + p.key; f.dropAria = 'Elegir ' + p.name;
          f.openDrop = function () { self.setState({ opPop: { tid: tid, rid: rid, key: p.key, anchor: '[data-opa="rf-' + p.key + '"]' }, opQ: '' }); };
        });
      }
    }
    out.rec = rec;
    return out;
  };
})();

/* ================= cerrar al tocar fuera ================= */
var OUT_FLOAT = '.oppop,.op-scrim,.tone-pop,.fmt-bar,.fmt-pal,.menu,.picker,.picker-pop,.cover-pop,.slash-menu,.addview,.headbar,.addblk,.org-lvedit,.modal,.drawer,.scrim,.toast,[role="dialog"],[role="menu"],[role="listbox"]';
var OUT_TOGGLE = '[aria-expanded],[aria-haspopup]';
var OUT_KEYS = ['bkPal', 'recPal', 'fmtCol', 'viewMenu', 'tplMenu', 'picker', 'parentPick', 'coverPick', 'areaPick', 'iconPick', 'addViewOpen', 'fmAddOpen', 'fmNewOpen', 'headMenu', 'orgLvlOpen', 'mention', 'fxOpen', 'addBlockOpen', 'dAdding', 'dTypeChange'];
Object.assign(Component.prototype, {
  outsideDown(e) {
    var t = e && e.target;
    if (!t || !t.closest) return;
    var s = this.st(), p = {}, n = 0;
    var inFloat = !!t.closest(OUT_FLOAT), onToggle = !!t.closest(OUT_TOGGLE);
    if (!inFloat && !onToggle) OUT_KEYS.forEach(function (k) { if (s[k]) { p[k] = k === 'addBlockOpen' || k === 'orgLvlOpen' || k === 'dAdding' ? false : null; n++; } });
    /* registro abierto como panel lateral: se cierra al tocar fuera de él */
    if (s.rec && !inFloat && !t.closest('.rec')) {
      var recEl = null; try { recEl = document.querySelector('.rec'); } catch (er) { recEl = null; }
      if (recEl && !recEl.classList.contains('full')) { p.rec = null; p.picker = null; p.recFull = null; n++; }
    }
    /* celda seleccionada de una tabla */
    if (s.selCell && !s.opPop && !t.closest('.tbl,.cellbar') && !inFloat) { p.selCell = null; n++; }
    /* detalle de cargo en el organigrama */
    if (s.orgSel && !inFloat && !t.closest('.org-panel,.org-slot,.org-node')) { p.orgSel = null; n++; }
    /* menú del celular */
    if (s.navOpen && !t.closest('.side')) { p.navOpen = false; n++; }
    if (n) this.setState(p);
  }
});
(function () {
  var baseRv = Component.prototype.renderVals;
  Component.prototype.renderVals = function () {
    var self = this;
    if (!this._outBound) {
      this._outBound = true;
      try {
        var h = function (e) { self.outsideDown(e); };
        if (window.PointerEvent) document.addEventListener('pointerdown', h, true);
        else { document.addEventListener('mousedown', h, true); document.addEventListener('touchstart', h, true); }
        document.addEventListener('keydown', function (e) {
          if (e.key !== 'Escape') return;
          var s = self.st(), p = {}, n = 0;
          OUT_KEYS.forEach(function (k) { if (s[k]) { p[k] = k === 'addBlockOpen' || k === 'orgLvlOpen' || k === 'dAdding' ? false : null; n++; } });
          if (s.opPop) { p.opPop = null; p.opQ = ''; n++; }
          if (n) self.setState(p);
        });
      } catch (e) { }
    }
    return baseRv.call(this);
  };
})();
