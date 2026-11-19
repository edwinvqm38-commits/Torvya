/* ================= componente: datos de cada vista ================= */
var WID = { title: [210, '1.7fr'], text: [150, '1fr'], number: [110, '.7fr'], select: [130, '.8fr'], status: [145, '.9fr'], multi_select: [170, '1.1fr'], date: [120, '.8fr'], person: [160, '1fr'], files: [170, '1fr'], checkbox: [90, '.45fr'], url: [170, '1fr'], email: [200, '1.1fr'], phone: [145, '.9fr'], formula: [140, '.9fr'], relation: [190, '1.3fr'], rollup: [140, '.8fr'], created_time: [150, '.9fr'], created_by: [150, '.9fr'], last_edited_time: [150, '.9fr'], last_edited_by: [150, '.9fr'], button: [150, '.8fr'], place: [200, '1.1fr'], id: [100, '.6fr'], ai: [260, '1.6fr'] };
var WMUL = { S: 0.7, M: 1, L: 1.6 };

Object.assign(Component.prototype, {
  rulesUI(s, t, rprops, list, kind, h) {
    var self = this;
    var rulesV = (list || []).map(function (r, i) {
      var p = propOf(t, r.prop);
      if (!p) return null;
      var cat = catOf(p.type);
      var ops = (OPS[cat] || []).map(function (op) { return { label: OP_NAME[op], cls: r.op === op ? 'on' : '', pick: function () { h.set(i, { op: op }); } }; });
      var needs = !NOVAL[r.op];
      var choices = null;
      if (cat === 'select' || cat === 'multi') choices = p.options.map(function (x) { return { label: x.v, on: r.value === x.v, cls: r.value === x.v ? 'p-' + x.c : 'p-off', pick: function () { h.set(i, { value: x.v }); } }; });
      if (cat === 'person') choices = [{ id: 'me', name: 'Yo (quien mira)' }].concat(s.members.filter(function (m) { return !m.pending; }).map(function (m) { return { id: m.id, name: m.name }; })).map(function (x) { return { label: x.name, on: r.value === x.id, cls: r.value === x.id ? 'p-blue' : 'p-off', pick: function () { h.set(i, { value: x.id }); } }; });
      return {
        propName: p.name, icon: ICON[p.type], ops: ops, vChoices: needs && !!choices, choices: choices || [], vInput: needs && !choices, itype: cat === 'date' ? 'date' : 'text', value: r.value || '',
        setValue: function (e) { h.set(i, { value: e.target.value }); }, hasColor: kind === 'colors',
        colors: COLORS.map(function (c) { return { name: COLOR_NAME[c], cls: 'p-' + c + (r.color === c ? ' on' : ''), on: r.color === c, pick: function () { h.set(i, { color: c }); } }; }),
        remove: function () { h.del(i); }, removeAria: 'Quitar ' + p.name
      };
    }).filter(function (x) { return x; });
    return {
      rulesV: rulesV, rulesEmpty: rulesV.length === 0, rulesEmptyText: h.emptyText, rulesIntro: h.intro, rulesAddLabel: h.addLabel,
      rulesAdding: !!h.adding, toggleRuleAdd: h.toggleAdd,
      ruleProps: rprops.filter(function (p) { return catOf(p.type) !== 'none'; }).map(function (p) { return { name: p.name, icon: ICON[p.type], pick: function () { h.add(p.key); } }; })
    };
  },
  fieldView(s, t, p, row, v, canEdit, ctx) {
    var self = this;
    var f = {
      label: p.name + (p.required ? ' *' : ''), desc: p.desc || TYPE_NAME[p.type], icon: ICON[p.type] || ICON.text,
      eInput: false, eSelect: false, ePeople: false, eCheck: false, eFiles: false, eRel: false, eButton: false, eAi: false, eRead: false,
      value: '', itype: 'text', placeholder: 'Vacío', onChange: null, hasLink: false, linkHref: '', linkAria: '',
      options: [], people: [], checked: false, checkCls: '', toggle: null, files: [], addFile: null,
      chips: [], canLink: false, pickerOpen: false, pick: [], pickerTitle: '', togglePicker: null,
      btnLabel: '', run: null, aiText: '', aiGen: null, aiBtn: '', hasNote: false, note: '', d: null, rowCls: (s.recHi === p.key ? 'f-hi' : ''), fkey: p.key, hasRefs: false, refs: [], refsTip: ''
    };
    var raw = row[p.key];
    if (p.type === 'title' && canEdit) {
      f.eInput = true; f.value = raw || ''; f.placeholder = 'Sin título';
      f.onChange = function (e) { ctx.set(p.key, e.target.value, false); };
      return f;
    }
    if (COMPUTED[p.type] || p.type === 'title' || (!canEdit && p.type !== 'relation')) {
      f.eRead = true;
      f.d = this.dispOf(s, t, p, row, v, false);
      if (f.d.empty) { f.d.kText = true; f.d.text = '—'; f.d.cls = 'v-muted'; f.d.kButton = false; }
      if (p.type === 'formula') { if (f.d.cls === 'v-err') { f.hasNote = true; f.note = f.d.srText; } f.refs = this.formulaRefs(s, t, p); f.hasRefs = f.refs.length > 0; f.refsTip = 'Fórmula: ' + (p.expr || '(vacía)'); }
      else if (p.type === 'rollup') { var rel0 = propOf(t, p.rel), T0 = rel0 ? s.tables.byId[rel0.target] : null, P0 = T0 ? propOf(T0, p.prop) : null; if (T0) { var self0 = this; f.refs = [{ label: T0.name + (P0 && p.fn !== 'count' ? ' · ' + P0.name : ''), cls: 'ext', tip: this.rollupDesc(s, t, p) + ': abrir ' + T0.name, go: function () { self0.go(T0.id, null); } }]; f.hasRefs = true; f.refsTip = this.rollupDesc(s, t, p); } else { f.hasNote = true; f.note = this.rollupDesc(s, t, p); } }
      else if (COMPUTED[p.type]) { f.hasNote = true; f.note = 'Se completa sola'; }
      return f;
    }
    if (['text', 'url', 'email', 'phone', 'place', 'number', 'date'].indexOf(p.type) >= 0) {
      f.eInput = true;
      f.value = raw == null ? '' : String(raw);
      f.itype = { url: 'url', email: 'email', phone: 'tel', date: 'date' }[p.type] || 'text';
      f.placeholder = p.type === 'number' ? ({ money: 'Importe en S/', usd: 'Importe en US$', eur: 'Importe en €', percent: 'Porcentaje' }[p.fmt] || '0') : ({ url: 'https://…', email: 'nombre@empresa.com', phone: '+51 …', place: 'Dirección' }[p.type] || 'Vacío');
      f.onChange = function (e) { var val = e.target.value; if (p.type === 'number') val = String(val).replace(/[^0-9.,\-]/g, '').replace(',', '.'); ctx.set(p.key, val, false); };
      if (raw && ['url', 'email', 'phone', 'place'].indexOf(p.type) >= 0) { var dd = this.dispOf(s, t, p, row, v, false); if (dd.kLink) { f.hasLink = true; f.linkHref = dd.href; f.linkAria = 'Abrir ' + p.name; } }
      if (p.type === 'number' && raw !== '' && raw != null && (p.fmt && p.fmt !== 'number' || p.showAs)) { f.hasNote = true; f.note = fmtNumber(raw, p.fmt, p.dec, p.sep) + (p.showAs === 'bar' || p.showAs === 'ring' ? ' · ' + Math.round(Math.min(100, Number(raw) / (Number(p.max) || 100) * 100)) + ' % de ' + fmtNum(p.max || 100) : ''); }
      if (p.type === 'date' && raw && p.dateFmt === 'relative') { f.hasNote = true; f.note = fmtDate(raw, 'relative'); }
      return f;
    }
    if (p.type === 'select' || p.type === 'status') {
      f.eSelect = true;
      f.options = p.options.map(function (x) { var on = raw === x.v; return { v: x.v, on: on, dot: p.type === 'status', cls: on ? 'p-' + x.c : 'p-off', pick: function () { ctx.set(p.key, on && p.type === 'select' ? '' : x.v, true); } }; });
      if (p.type === 'status') { var op = optOf(p, raw); var g = op ? STATUS_GROUPS.filter(function (x) { return x.id === op.g; })[0] : null; if (g) { f.hasNote = true; f.note = 'Grupo: ' + g.n; } }
      return f;
    }
    if (p.type === 'multi_select') {
      f.eSelect = true;
      var arr = raw || [];
      f.options = p.options.map(function (x) { var on = arr.indexOf(x.v) >= 0; return { v: x.v, on: on, dot: false, cls: on ? 'p-' + x.c : 'p-off', pick: function () { ctx.set(p.key, on ? arr.filter(function (y) { return y !== x.v; }) : arr.concat([x.v]), true); } }; });
      return f;
    }
    if (p.type === 'person') {
      f.ePeople = true;
      var ids = raw || [];
      f.people = s.members.filter(function (m) { return !m.pending; }).map(function (m) { var on = ids.indexOf(m.id) >= 0; return { first: m.name.split(' ')[0], initials: initialsOf(m.name), color: m.color, on: on, cls: on ? 'on' : '', pick: function () { ctx.set(p.key, on ? ids.filter(function (y) { return y !== m.id; }) : (p.single ? [m.id] : ids.concat([m.id])), true); } }; });
      return f;
    }
    if (p.type === 'checkbox') { f.eCheck = true; f.checked = !!raw; f.checkCls = (raw ? 'on' : '') + (p.checkStyle === 'switch' ? ' as-switch' : ''); f.toggle = function () { ctx.set(p.key, !raw, true); }; return f; }
    if (p.type === 'files') {
      f.eFiles = true;
      var list = raw || [];
      f.files = list.map(function (n, i) { return { name: n, aria: 'Quitar ' + n, remove: function () { ctx.set(p.key, list.filter(function (x, j) { return j !== i; }), true); } }; });
      f.addFile = function (e) { var names = []; try { var fl = e.target.files; for (var i = 0; i < fl.length; i++) names.push(fl[i].name); e.target.value = ''; } catch (err) { names = []; } if (names.length) ctx.set(p.key, list.concat(names), true); };
      f.hasNote = true; f.note = 'En el prototipo solo se guarda el nombre del archivo';
      return f;
    }
    if (p.type === 'relation') {
      f.eRel = true;
      var T2 = s.tables.byId[p.target];
      var tgtOk = !!T2 && this.lvl(s, p.target, v.role) !== 'none';
      var vals = raw || [];
      f.chips = vals.map(function (id) {
        var ch = self.chip(s, p.target, id, v);
        if (!ch) return null;
        ch.canUnlink = canEdit && ch.ok; ch.joinCls = ch.canUnlink ? 'joined' : ''; ch.unlinkAria = 'Desvincular ' + ch.label;
        ch.unlink = function () { ctx.toggleRel(p.key, id, false); };
        return ch;
      }).filter(function (x) { return x; });
      f.canLink = canEdit && tgtOk;
      f.pickerOpen = f.canLink && s.picker === ctx.pickKey + p.key;
      f.pickerTitle = (p.single ? 'Elige un registro de ' : 'Vincular con ') + (T2 ? T2.name : '');
      f.togglePicker = function () { self.setState({ picker: s.picker === ctx.pickKey + p.key ? null : ctx.pickKey + p.key }); };
      if (f.pickerOpen) f.pick = this.rowsFor(s, p.target, v).map(function (x) { var on = vals.indexOf(x.id) >= 0; return { label: self.titleOf(T2, x), on: on, cls: on ? 'on' : '', toggle: function () { ctx.toggleRel(p.key, x.id, !!p.single); } }; });
      if (!tgtOk && T2) { f.hasNote = true; f.note = 'Sin acceso a ' + T2.name; }
      else if (!f.chips.length && !canEdit) { f.hasNote = true; f.note = 'Sin vínculos'; }
      else if (p.pair && T2) { var P2 = propOf(T2, p.pair); if (P2) { f.hasNote = true; f.note = 'También aparece en ' + T2.name + ' › ' + P2.name; } }
      return f;
    }
    if (p.type === 'button') {
      f.eButton = true; f.btnLabel = p.label || p.name; f.run = function () { ctx.runButton(p.key); };
      var ap = p.action ? propOf(t, p.action.prop) : null;
      f.hasNote = true; f.note = ap ? 'Pone ' + ap.name + ' en «' + autoValLabel(p.action.value) + '»' : 'Sin acción configurada';
      return f;
    }
    if (p.type === 'ai') {
      f.eAi = true;
      f.aiText = raw || (p.mode === 'translate' ? 'Pendiente: la traducción la hará Claude en la versión real' : 'Sin generar');
      f.aiBtn = raw ? 'Regenerar' : 'Generar'; f.aiGen = function () { ctx.aiGen(p.key); };
      f.hasNote = true; f.note = p.mode === 'translate' ? 'Traducción al ' + (p.lang || 'inglés').toLowerCase() : 'Resumen automático (simulado en el prototipo)';
      return f;
    }
    f.eRead = true; f.d = this.dispOf(s, t, p, row, v, false);
    return f;
  },
  recCtx(tid, rowId) {
    var self = this;
    return {
      pickKey: 'rec:' + rowId + ':',
      set: function (key, val, imp) { var s = self.st(); var t = s.tables.byId[tid]; var pp = propOf(t, key); var row = findRow(t, rowId); self.setField(tid, rowId, key, val, imp ? 'cambió ' + pp.name + ' en ' + self.titleOf(t, row) : null); },
      toggleRel: function (key, id, single) { self.toggleLink(tid, rowId, key, id, single); },
      runButton: function (key) { self.runButton(tid, rowId, key); },
      aiGen: function (key) { self.aiGenRow(tid, rowId, key); }
    };
  },

  /* ---------- gráfico ---------- */
  chartData(s, t, rows, cfg, click) {
    var self = this;
    var P = { showLegend: true, legendCls: '', boxCls: '', hasGoal: false, goalPct: '0', goalText: '', title: cfg.title || '', sub: '', hasHead: !!cfg.head, isBar: false, isColumn: false, isLine: false, isDonut: false, empty: false, emptyText: '', bars: [], segs: [], path: '', area: '', dots: [], grid: [], xlabels: [], total: '', totalCaption: '', lw: 640, lh: 200 };
    var by = propOf(t, cfg.by);
    if (!by) { P.empty = true; P.emptyText = 'Elige por qué propiedad agrupar en la configuración.'; return P; }
    var groups = this.groupsOf(s, t, rows, by.key, { hideEmpty: true, bucket: cfg.bucket }) || [];
    var fmt = null;
    var items = groups.map(function (g) { var a = self.aggregate(s, t, g.rows, cfg.val); fmt = a.fmt; return { key: g.key, label: g.label, value: a.value || 0, color: g.color || PALETTE[0], n: g.rows.length }; });
    var aggAll = this.aggregate(s, t, rows, cfg.val);
    fmt = aggAll.fmt;
    if (cfg.kind !== 'line' && cfg.sort !== 'label') items.sort(function (a, b) { return cfg.sort === 'asc' ? a.value - b.value : b.value - a.value; });
    if (cfg.limit) items = items.slice(0, cfg.limit);
    var palC = (CHART_PALS.filter(function (x) { return x.id === (cfg.pal || 'auto'); })[0] || CHART_PALS[0]).c;
    if (palC.length) items.forEach(function (it, i) { it.color = palC[i % palC.length]; });
    P.showLegend = cfg.legend !== 'hide'; P.legendCls = cfg.legend === 'hide' ? 'no-legend' : '';
    var kind = cfg.kind || 'column';
    P.isBar = kind === 'bar'; P.isColumn = kind === 'column'; P.isLine = kind === 'line'; P.isDonut = kind === 'donut';
    P.sub = aggAll.label + ' por ' + by.name + (isDateType(by) ? ' (' + ({ day: 'día', week: 'semana', month: 'mes' }[cfg.bucket || 'day']) + ')' : '');
    if (!items.length) { P.empty = true; P.emptyText = 'No hay datos con los filtros actuales.'; return P; }
    var goal = (cfg.goal === '' || cfg.goal == null || isNaN(Number(cfg.goal))) ? null : Number(cfg.goal);
    var max = Math.max.apply(null, [0, goal || 0].concat(items.map(function (x) { return x.value; }))) || 1;
    if (goal != null && cfg.goalColor) items.forEach(function (it) { var ok = cfg.goalDir === 'down' ? it.value <= goal : it.value >= goal; it.color = ok ? '#2F9A5C' : '#D2483B'; });
    P.boxCls = (cfg.labels === 'hide' ? 'no-vals ' : '') + (cfg.legend === 'hide' ? 'no-legend' : '');
    P.hasGoal = goal != null && (P.isBar || P.isColumn); P.goalPct = goal != null ? (goal / max * 100).toFixed(2) : '0';
    var total = items.reduce(function (a, x) { return a + x.value; }, 0);
    var xf = click ? click.current : null;
    var hasSel = !!(xf && xf.table === t.id && xf.prop === by.key);
    function fmtv(x) { return fmtNumber(x, fmt.fmt, fmt.dec === 'auto' ? undefined : (fmt.dec != null ? fmt.dec : (Math.abs(x) >= 100 ? 0 : undefined)), fmt.sep); }
    P.bars = items.map(function (x) {
      var on = hasSel && String(xf.key) === String(x.key);
      return { label: x.label, value: x.value, valueText: fmtv(x.value), pct: Math.max(2, Math.round(x.value / max * 100)), color: x.color, share: total ? Math.round(x.value / total * 100) + ' %' : '', cls: hasSel ? (on ? 'on' : 'dim') : '', on: on, aria: by.name + ' ' + x.label + ': ' + fmtv(x.value) + (click ? '. Pulsa para filtrar el panel' : ''),
        pick: click ? function () { self.setXf(click.pid, { table: t.id, prop: by.key, bucket: cfg.bucket, key: x.key, label: by.name + ': ' + x.label }); } : function () { } };
    });
    P.total = fmtv(total);
    if (goal != null) P.goalText = 'Meta: ' + fmtv(goal);
    P.totalCaption = cfg.val === 'count' ? 'registros' : 'total';
    if (P.isLine) {
      var W = 640, H = 200, px = 28, pt = 14, pb = 14, n = items.length;
      var pts = items.map(function (x, i) { return { x: n === 1 ? W / 2 : px + i * (W - 2 * px) / (n - 1), y: pt + (1 - x.value / max) * (H - pt - pb) }; });
      P.path = pts.map(function (q, i) { return (i ? 'L' : 'M') + q.x.toFixed(1) + ' ' + q.y.toFixed(1); }).join(' ');
      P.area = 'M' + pts[0].x.toFixed(1) + ' ' + (H - pb) + ' ' + pts.map(function (q) { return 'L' + q.x.toFixed(1) + ' ' + q.y.toFixed(1); }).join(' ') + ' L' + pts[n - 1].x.toFixed(1) + ' ' + (H - pb) + ' Z';
      P.dots = pts.map(function (q, i) { return { cx: q.x.toFixed(1), cy: q.y.toFixed(1), tip: items[i].label + ': ' + fmtv(items[i].value), cls: P.bars[i].cls }; });
      P.grid = [0.25, 0.5, 0.75, 1].map(function (f) { var y = pt + (1 - f) * (H - pt - pb); return { y: y.toFixed(1), label: fmtv(max * f) }; });
      var step = Math.ceil(n / 8);
      P.xlabels = P.bars.map(function (b, i) { return { label: i % step === 0 || i === n - 1 ? b.label : '', valueText: b.valueText, pick: b.pick, cls: b.cls, aria: b.aria }; });
    }
    if (P.isDonut) {
      var C = 2 * Math.PI * 44, cum = 0;
      P.segs = items.map(function (x, i) { var len = total ? x.value / total * C : 0; var sg = { color: x.color, dash: Math.max(0, len - 1.5).toFixed(2) + ' ' + (C - Math.max(0, len - 1.5)).toFixed(2), off: (-cum).toFixed(2), cls: P.bars[i].cls }; cum += len; return sg; });
    }
    return P;
  },
  kpiData(s, t, rows, cfg) {
    var a = this.aggregate(s, t, rows, cfg.val);
    var f = a.fmt || { fmt: 'number' };
    var v = a.value;
    var txt = v == null ? '—' : fmtNumber(v, f.fmt, cfg.val === 'count' ? 0 : (Math.abs(v) >= 1000 ? 0 : (f.dec === 'auto' ? undefined : f.dec)), f.sep);
    var out = { value: txt, caption: a.label + ' · ' + rows.length + (rows.length === 1 ? ' registro' : ' registros'), hasGoal: false, goalText: '', goalPct: '0', stateCls: '' };
    var g = (cfg.goal === '' || cfg.goal == null || isNaN(Number(cfg.goal))) ? null : Number(cfg.goal);
    if (g != null && v != null) {
      var ok = cfg.goalDir === 'down' ? v <= g : v >= g;
      var pct = g ? Math.round(v / g * 100) : 0;
      out.hasGoal = true; out.goalPct = String(Math.max(0, Math.min(100, pct)));
      out.goalText = 'Meta ' + fmtNumber(g, f.fmt, cfg.val === 'count' ? 0 : (Math.abs(g) >= 1000 ? 0 : undefined), f.sep) + ' · ' + pct + ' %';
      out.stateCls = ok ? 'kpi-ok' : 'kpi-bad';
    }
    return out;
  },
  applyFilters(s, t, rows, filters, v) { var self = this; return (filters || []).length ? rows.filter(function (r) { return filters.every(function (f) { return self.ruleMatch(s, t, f, r, v); }); }) : rows; },

  /* ---------- hoja de cálculo ---------- */
  sheetData(s, b, v, canEditPage) {
    var self = this;
    var cells = b.cells || {};
    var nC = b.cols || 6, nR = b.rows || 12;
    var cache = {}, visiting = {};
    var ctx = {
      cell: function (ref) { return val(ref); },
      range: function (a, c) { var A = cellIdx(a), B = cellIdx(c); if (!A || !B) throw new Error('Rango no válido'); var out = []; for (var r = Math.min(A.r, B.r); r <= Math.max(A.r, B.r); r++) for (var cc = Math.min(A.c, B.c); cc <= Math.max(A.c, B.c); cc++) { var x; try { x = val(cellRef(cc, r)); } catch (e) { x = null; } out.push(x); } return out; },
      sref: function (tn, cn) { return self.srefVals(s, tn, cn, 0, v); }
    };
    function val(ref) {
      if (Object.prototype.hasOwnProperty.call(cache, ref)) { var c = cache[ref]; if (c && c.__err) throw new Error(c.__err); return c; }
      if (visiting[ref]) throw new Error('Referencia circular en ' + ref);
      visiting[ref] = true;
      var raw = cells[ref], res;
      try {
        if (raw == null || raw === '') res = null;
        else if (String(raw).charAt(0) === '=') res = evalAst(self.parsed(raw), ctx);
        else if (String(raw).trim() !== '' && !isNaN(Number(raw))) res = Number(raw);
        else res = raw;
        cache[ref] = res;
      } catch (e) { cache[ref] = { __err: e.message }; visiting[ref] = false; throw e; }
      visiting[ref] = false;
      return res;
    }
    var sel = (s.sheetSel || {})[b.id] || 'B2';
    var selErr = '', selVal = '';
    var rows = [];
    for (var r = 0; r < nR; r++) {
      var rc = [];
      for (var c = 0; c < nC; c++) {
        var ref = cellRef(c, r), raw = cells[ref], txt = '', cls = '', tip = raw || '';
        try {
          var x = val(ref);
          if (x == null) txt = '';
          else if (typeof x === 'number') { txt = fmtNum(x); cls = 'num'; }
          else if (typeof x === 'boolean') txt = x ? 'VERDADERO' : 'FALSO';
          else txt = toStr(x);
          if (ref === sel) selVal = txt;
        } catch (e) { txt = '#ERROR'; cls = 'err'; tip = e.message; if (ref === sel) selErr = e.message; }
        if (raw && String(raw).charAt(0) === '=') cls += ' fx';
        if (r === 0 && raw && cls.indexOf('num') < 0) cls += ' head';
        if (ref === sel) cls += ' sel';
        rc.push({ ref: ref, text: txt, cls: cls, tip: tip || ref, pick: (function (rf) { return function () { var ss = clone(self.st().sheetSel || {}); ss[b.id] = rf; self.setState({ sheetSel: ss }); }; })(ref) });
      }
      rows.push({ num: String(r + 1), cells: rc });
    }
    var raw0 = cells[sel] || '';
    function insert(code) { var cur = (self.findBlock(self.st().pages, b.id) || { block: b }).block.cells || {}; var rr = cur[sel] || ''; self.setCell(b.id, sel, joinExpr(rr, code)); }
    var refs = [];
    s.tables.order.forEach(function (tid) {
      var T = s.tables.byId[tid];
      if (self.lvl(s, tid, v.role) === 'none') return;
      T.props.filter(function (p) { return p.type === 'number' || (p.type === 'formula' && p.resFmt !== 'text') || p.type === 'title' || p.type === 'status'; }).slice(0, 5).forEach(function (p) {
        var code = (/\s/.test(T.name) ? "'" + T.name + "'" : T.name) + '[' + p.name + ']';
        refs.push({ label: code, pick: function () { insert(code); } });
      });
    });
    return {
      title: b.title || 'Hoja de cálculo', cols: SHEET_COLS.slice(0, nC).map(function (l) { return { l: l }; }), rows: rows, gridStyle: 'grid-template-columns: 44px repeat(' + nC + ', minmax(120px, 1fr))',
      sel: sel, raw: raw0, setRaw: function (e) { self.setCell(b.id, sel, e.target.value); }, canEdit: canEditPage, readOnly: !canEditPage,
      result: selErr ? 'Error: ' + selErr : (String(raw0).charAt(0) === '=' ? '= ' + (selVal === '' ? '(vacío)' : selVal) : ''), hasResult: !!(selErr || String(raw0).charAt(0) === '='), resCls: selErr ? 'fx-err' : 'fx-ok',
      clear: function () { self.setCell(b.id, sel, ''); },
      fns: ['SUMA(', 'PROMEDIO(', 'CONTAR.SI(', 'SUMAR.SI(', 'SI(', 'REDONDEAR(', 'BUSCAR(', 'MAX(', 'MIN(', 'HOY()'].map(function (fn) { return { label: fn.replace('(', '').replace(')', ''), pick: function () { insert(fn); } }; }),
      refs: refs.slice(0, 18)
    };
  },

  /* ---------- mapa de relaciones ---------- */
  mapData(s, v) {
    var self = this;
    var tids = s.tables.order.filter(function (id) { return self.lvl(s, id, v.role) !== 'none'; });
    var W = 250, GX = 96, GY = 56, HEAD = 46, ROW = 27, MAXR = 11;
    var cols = Math.max(1, Math.min(4, tids.length));
    var pos = {}, colH = [];
    var boxes = tids.map(function (tid, i) {
      var T = s.tables.byId[tid];
      var props = self.rprops(s, T, v.role);
      var shown = props.slice(0, MAXR);
      var rels = props.filter(function (p) { return p.type === 'relation'; });
      rels.forEach(function (p) { if (shown.indexOf(p) < 0) shown.push(p); });
      shown = props.filter(function (p) { return shown.indexOf(p) >= 0; });
      var h = HEAD + shown.length * ROW + (props.length > shown.length ? 26 : 8);
      var c = i % cols, rowN = Math.floor(i / cols);
      var x = c * (W + GX), y = 0;
      for (var k = 0; k < rowN; k++) y += (colH[k] || 0) + GY;
      pos[tid] = { x: x, y: y, h: h, rows: {} };
      shown.forEach(function (p, j) { pos[tid].rows[p.key] = y + HEAD + j * ROW + ROW / 2; });
      colH[rowN] = Math.max(colH[rowN] || 0, h);
      return {
        tid: tid, name: T.name, icon: ICON[T.icon] || ICON.db, color: T.color, style: 'left: ' + x + 'px; top: ' + y + 'px; width: ' + W + 'px', open: function () { self.go(tid, null); },
        count: T.rows.length + ' registros',
        rows: shown.map(function (p) {
          var tg = p.type === 'relation' ? s.tables.byId[p.target] : null;
          var hk = tid + ':' + p.key, hi = s.mapHi === hk || (p.pair && s.mapHi === p.target + ':' + p.pair);
          return { name: p.name, icon: ICON[p.type], isRel: !!tg, target: tg ? '→ ' + tg.name : TYPE_NAME[p.type], cls: (tg ? 'rel' : '') + (hi ? ' hi' : ''), pick: function () { self.setState({ mapHi: s.mapHi === hk ? null : hk }); }, aria: tg ? 'Resaltar la relación ' + p.name + ' con ' + tg.name : p.name };
        }),
        more: props.length > shown.length ? '+' + (props.length - shown.length) + ' columnas más' : '', hasMore: props.length > shown.length
      };
    });
    var totalH = 0;
    colH.forEach(function (h, i) { totalH += h + (i ? GY : 0); });
    var links = [], done = {};
    tids.forEach(function (tid) {
      var T = s.tables.byId[tid];
      T.props.forEach(function (p) {
        if (p.type !== 'relation' || !pos[p.target] || pos[tid].rows[p.key] == null) return;
        var keyA = tid + ':' + p.key, keyB = p.target + ':' + (p.pair || '');
        if (done[keyA] || done[keyB]) return;
        done[keyA] = done[keyB] = 1;
        var T2 = s.tables.byId[p.target], P2 = p.pair ? propOf(T2, p.pair) : null;
        var A = pos[tid], B = pos[p.target];
        var y1 = A.rows[p.key], y2 = P2 && B.rows[P2.key] != null ? B.rows[P2.key] : B.y + HEAD / 2;
        var x1, x2, d;
        if (A.x < B.x) { x1 = A.x + W; x2 = B.x; d = 'M' + x1 + ' ' + y1 + ' C' + (x1 + 48) + ' ' + y1 + ' ' + (x2 - 48) + ' ' + y2 + ' ' + x2 + ' ' + y2; }
        else if (A.x > B.x) { x1 = A.x; x2 = B.x + W; d = 'M' + x1 + ' ' + y1 + ' C' + (x1 - 48) + ' ' + y1 + ' ' + (x2 + 48) + ' ' + y2 + ' ' + x2 + ' ' + y2; }
        else { x1 = A.x + W; x2 = B.x + W; d = 'M' + x1 + ' ' + y1 + ' C' + (x1 + 70) + ' ' + y1 + ' ' + (x2 + 70) + ' ' + y2 + ' ' + x2 + ' ' + y2; }
        var hi = s.mapHi === keyA || s.mapHi === keyB;
        var dir1 = x2 > x1 ? 1 : -1;
        links.push({ d: d, cls: hi ? 'hi' : '', x1: x1, y1: y1, x2: x2, y2: y2,
          l1x: (x1 + dir1 * 12).toFixed(0), l1y: (y1 - 6).toFixed(0), l1: P2 && P2.single ? '1' : 'N',
          l2x: (x2 - (A.x === B.x ? -12 : dir1 * 12)).toFixed(0), l2y: (y2 - 6).toFixed(0), l2: p.single ? '1' : 'N' });
      });
    });
    var w = cols * W + (cols - 1) * GX + (tids.length && links.some(function (l) { return l.x1 === l.x2; }) ? 80 : 0);
    return { boxes: boxes, links: links, w: w, h: totalH + 8, style: 'width: ' + w + 'px; height: ' + (totalH + 8) + 'px', svgW: String(w), svgH: String(totalH + 8), vb: '0 0 ' + w + ' ' + (totalH + 8), empty: !boxes.length };
  },

  /* ---------- trazabilidad ---------- */
  traceData(s, t, row, v) {
    var self = this;
    var out = [];
    this.rprops(s, t, v.role).filter(function (p) { return p.type === 'relation'; }).forEach(function (p) {
      var T2 = s.tables.byId[p.target];
      if (!T2 || self.lvl(s, T2.id, v.role) === 'none') return;
      var vis = self.rowsFor(s, T2.id, v);
      var items = (row[p.key] || []).map(function (id) { return findRow(T2, id); }).filter(function (r) { return r && vis.indexOf(r) >= 0; }).slice(0, 6).map(function (r2) {
        var subs = self.rprops(s, T2, v.role).filter(function (q) { return q.type === 'relation' && q.key !== p.pair; }).map(function (q) {
          var T3 = s.tables.byId[q.target];
          if (!T3 || self.lvl(s, T3.id, v.role) === 'none') return null;
          var vis3 = self.rowsFor(s, T3.id, v);
          var chips = (r2[q.key] || []).map(function (id) { return findRow(T3, id); }).filter(function (r3) { return r3 && vis3.indexOf(r3) >= 0; }).slice(0, 4).map(function (r3) { return { title: self.titleOf(T3, r3), color: T3.color, open: function () { self.openRec(T3.id, r3.id); } }; });
          return chips.length ? { name: q.name, icon: ICON[T3.icon] || ICON.db, chips: chips } : null;
        }).filter(function (x) { return x; });
        return { title: self.titleOf(T2, r2), color: T2.color, icon: ICON[T2.icon] || ICON.db, open: function () { self.openRec(T2.id, r2.id); }, subs: subs, hasSubs: subs.length > 0 };
      });
      if (items.length) out.push({ name: p.name, icon: ICON.relation, items: items });
    });
    return out;
  },

  /* ---------- vista de base de datos (pantalla completa o bloque) ---------- */
  dbViewData(s, tid, vid, where, opts) {
    var self = this;
    opts = opts || {};
    var v = this.viewer(s);
    var t = s.tables.byId[tid];
    var vw = this.viewOf(t, vid);
    vid = vw.id;
    var tLvl = this.lvl(s, tid, v.role);
    var canEdit = tLvl === 'edit' || tLvl === 'full';
    var canStructure = tLvl === 'full';
    var locked = !!vw.locked;
    var ctxD = { tid: tid, vid: vid, where: where };
    var rprops = this.rprops(s, t, v.role);
    var vprops = rprops.filter(function (p) { return p.type === 'title' || vw.hidden.indexOf(p.key) < 0; });
    var baseRows = this.rowsFor(s, tid, v);
    var xfNote = '';
    if (opts.xfSets) {
      if (opts.xfSets[tid]) { var ok = opts.xfSets[tid]; baseRows = baseRows.filter(function (r) { return ok[r.id]; }); xfNote = 'Filtrado por ' + opts.xfLabel; }
      else xfNote = 'Esta tabla no está relacionada con el filtro «' + opts.xfLabel + '»';
    }
    var activeFilters = (vw.filters || []).filter(function (f) { return rprops.some(function (p) { return p.key === f.prop; }); });
    var filtered = baseRows.filter(function (r) { return activeFilters.every(function (f) { return self.ruleMatch(s, t, f, r, v); }); });
    var q = where === 'scr' ? String(s.q || '').toLowerCase().trim() : '';
    if (q) filtered = filtered.filter(function (r) { return vprops.some(function (p) { return dispText(self.dispOf(s, t, p, r, v, false)).toLowerCase().indexOf(q) >= 0; }); });
    var sorted = this.sortRows(s, t, filtered, (vw.sorts || []).filter(function (x) { return rprops.some(function (p) { return p.key === x.prop; }); }));
    function rowColor(r) {
      var c = '';
      (vw.colors || []).some(function (rule) { if (rprops.some(function (p) { return p.key === rule.prop; }) && !(rule.value === '' && !NOVAL[rule.op]) && self.ruleMatch(s, t, rule, r, v)) { c = 'rc-' + rule.color; return true; } return false; });
      if (!c && r._bg) c = 'rc-' + r._bg;
      return c;
    }
    function propsFor(r) { return vprops.filter(function (p) { return p.type !== 'title'; }).map(function (p) { return { name: p.name, hasLbl: ['select', 'status', 'multi_select', 'person', 'relation', 'created_by', 'last_edited_by'].indexOf(p.type) < 0, d: self.dispOf(s, t, p, r, v, canEdit) }; }).filter(function (x) { return !x.d.empty; }); }
    function openFn(r) { return function () { self.openRec(tid, r.id); }; }
    var layout = vw.layout || 'table';
    var gprop = propOf(t, vw.group);
    if (gprop && (!isGroupable(gprop) || rprops.indexOf(gprop) < 0)) gprop = null;
    var isOpenRec = function (r) { return s.rec && s.rec.tid === tid && s.rec.id === r.id; };

    /* tabla */
    var widths = vw.widths || {}, wraps = vw.wrap || {};
    var gridCols = vprops.map(function (p) { var w = WID[p.type] || [120, '1fr']; var m = WMUL[widths[p.key] || 'M']; return 'minmax(' + Math.round(w[0] * m) + 'px,' + (parseFloat(w[1]) * m).toFixed(2) + 'fr)'; }).join(' ') + ' 44px';
    var tblMinW = vprops.reduce(function (a, p) { return a + Math.round((WID[p.type] || [120])[0] * WMUL[widths[p.key] || 'M']); }, 44);
    var hmKey = s.headMenu && s.headMenu.where === where ? s.headMenu.prop : null;
    var headCols = vprops.map(function (p) {
      var hide = (s.colHide[tid] || {})[p.key] || [];
      var srt = (vw.sorts || []).filter(function (x) { return x.prop === p.key; })[0];
      return { label: p.name, icon: ICON[p.type], desc: p.desc || TYPE_NAME[p.type], restricted: v.role === 'admin' && hide.length > 0, restrictedText: 'Oculta para: ' + hide.map(function (r) { return ROLE_NAME[r]; }).join(', '), num: isNumericProp(p) ? 'num' : '', cls: hmKey === p.key ? 'on' : '', sorted: !!srt, sortArrow: srt ? (srt.dir === 'asc' ? '↑' : '↓') : '', aria: 'Opciones de la columna ' + p.name, menu: function () { self.setState({ headMenu: hmKey === p.key ? null : { where: where, prop: p.key } }); } };
    });
    var sel = s.selCell && s.selCell.where === where && s.selCell.tid === tid ? s.selCell : null;
    function rowView(r) {
      return {
        gc: gridCols, sel: isOpenRec(r) ? 'is-sel' : '', rc: rowColor(r),
        cells: vprops.map(function (p) {
          var wc = wraps[p.key] ? 'wrap' : '';
          if (p.type === 'title') return { isTitle: true, notTitle: false, title: r[p.key] || 'Sin título', open: openFn(r), align: '', wrapCls: wc, selCls: '', d: null, select: null, aria: '', lbl: '' };
          var isSel = sel && sel.row === r.id && sel.prop === p.key;
          var dd = self.dispOf(s, t, p, r, v, canEdit);
          var emp = !(dd.text || (dd.pills || []).length || (dd.chips || []).length || (dd.people || []).length || dd.kCheck || dd.kLink || (dd.files || []).length || dd.kBar || dd.kRing || dd.kButton);
          return { isTitle: false, notTitle: true, title: '', open: null, align: isNumericProp(p) ? 'num' : '', wrapCls: wc + (emp ? ' td-emp' : ''), selCls: isSel ? 'cell-sel' : '', lbl: p.name, d: dd, aria: 'Editar ' + p.name + ' de ' + self.titleOf(t, r), select: function () { var ddp = canEdit && DROP_TYPES[p.type]; self.setState({ selCell: isSel && !ddp ? null : { where: where, tid: tid, row: r.id, prop: p.key }, headMenu: null, opPop: ddp ? { tid: tid, rid: r.id, key: p.key, anchor: '.td.cell-sel' } : null, opQ: '' }); } };
        })
      };
    }
    var collapsed = s.collapsed || {};
    var tgroups;
    var groups = gprop && layout === 'table' ? this.groupsOf(s, t, sorted, gprop.key, { hideEmpty: vw.hideEmpty }) : null;
    if (groups) {
      tgroups = groups.map(function (g) {
        var ck = where + ':' + vw.id + ':' + String(g.key), open = !collapsed[ck], preset = self.groupPatch(gprop, g.key);
        return { hasHeader: true, open: open, chevCls: open ? 'open' : '', label: g.label, cls: g.cls, dot: g.dot, isPill: g.isPill, isPerson: g.isPerson, avatar: g.avatar, initials: g.initials, count: String(g.rows.length),
          toggle: function () { var c = clone(self.st().collapsed || {}); c[ck] = open; self.setState({ collapsed: c }); },
          canAdd: canEdit && !!preset, add: function () { self.newRow(tid, Object.assign(self.viewPreset(s, t, vw, v), preset || {})); }, rows: g.rows.map(rowView) };
      });
    } else tgroups = [{ hasHeader: false, open: true, chevCls: '', label: '', cls: '', dot: false, isPill: false, isPerson: false, avatar: '', initials: '', count: '', toggle: null, canAdd: canEdit, add: function () { self.newRow(tid, self.viewPreset(s, t, vw, v)); }, rows: sorted.map(rowView) }];
    var calcCells = vprops.map(function (p) {
      var fn = (vw.calcs || {})[p.key] || 'none';
      var cycle = ['none', 'count', 'not_empty', 'empty'];
      if (isAggProp(p)) cycle = cycle.concat(['sum', 'avg', 'min', 'max']);
      if (p.type === 'checkbox') cycle = ['none', 'count', 'checked', 'pct_checked'];
      var label = CALC_NAME[fn];
      if (fn !== 'none') {
        var val = '';
        if (fn === 'count') val = fmtNum(sorted.length);
        else if (fn === 'empty' || fn === 'not_empty') { var ne = sorted.filter(function (r) { return !self.dispOf(s, t, p, r, v, false).empty; }).length; val = fmtNum(fn === 'empty' ? sorted.length - ne : ne); }
        else if (fn === 'checked' || fn === 'pct_checked') { var ck2 = sorted.filter(function (r) { return !!r[p.key]; }).length; val = fn === 'checked' ? fmtNum(ck2) : (sorted.length ? Math.round(ck2 / sorted.length * 100) : 0) + ' %'; }
        else { var ag = self.aggregate(s, t, sorted, fn + ':' + p.key); val = ag.value == null ? '—' : fmtNumber(ag.value, ag.fmt.fmt, fn === 'avg' ? 2 : ag.fmt.dec, ag.fmt.sep); }
        label = CALC_NAME[fn] + ' ' + val;
      }
      return { label: label, cls: fn === 'none' ? 'idle' : '', num: isNumericProp(p) ? 'num' : '', run: function () { self.updView(tid, vid, function (x) { var i = cycle.indexOf(fn); x.calcs[p.key] = cycle[(i + 1) % cycle.length]; }); } };
    });

    /* menú de columna */
    var hmProp = hmKey ? propOf(t, hmKey) : null;
    var hm = { name: '', icon: '', canHide: false, canEditProp: false, wrapOn: false, widthOpts: [] };
    if (hmProp) {
      var close = function () { self.setState({ headMenu: null }); };
      hm = {
        name: hmProp.name, icon: ICON[hmProp.type], canHide: hmProp.type !== 'title', canEditProp: canStructure && !locked, wrapOn: !!wraps[hmProp.key], wrapCls: wraps[hmProp.key] ? 'on' : '',
        asc: function () { self.updView(tid, vid, function (x) { x.sorts = [{ prop: hmProp.key, dir: 'asc' }]; }); close(); },
        desc: function () { self.updView(tid, vid, function (x) { x.sorts = [{ prop: hmProp.key, dir: 'desc' }]; }); close(); },
        filter: function () { if (catOf(hmProp.type) === 'none') return; self.addRule(tid, vid, 'filters', hmProp.key); self.openDrawer('filter', { dCtx: ctxD }); },
        hide: function () { self.updView(tid, vid, function (x) { if (x.hidden.indexOf(hmProp.key) < 0) x.hidden.push(hmProp.key); }); close(); },
        wrap: function () { self.updView(tid, vid, function (x) { x.wrap[hmProp.key] = !x.wrap[hmProp.key]; }); },
        widthOpts: ['S', 'M', 'L'].map(function (w) { return { label: { S: 'Estrecha', M: 'Normal', L: 'Ancha' }[w], cls: (widths[hmProp.key] || 'M') === w ? 'on' : '', pick: function () { self.updView(tid, vid, function (x) { x.widths[hmProp.key] = w; }); } }; }),
        edit: function () { self.openDrawer('propEdit', { dCtx: ctxD, dProp: hmProp.key }); },
        insert: function () { self.openDrawer('newProp', { dCtx: ctxD }); },
        close: close
      };
    }

    /* barra de edición de celda (tipo Excel) */
    var cb = { icon: '', prop: '', rowTitle: '', fields: [], isFormula: false, formula: '', editFormula: null, openRec: null, close: null };
    var selRow = sel ? findRow(t, sel.row) : null, selProp = sel ? propOf(t, sel.prop) : null;
    if (selRow && selProp && baseRows.indexOf(selRow) >= 0 && !(canEdit && DROP_TYPES[selProp.type])) {
      var fv = this.fieldView(s, t, selProp, selRow, v, canEdit, this.recCtx(tid, selRow.id));
      cb = { icon: ICON[selProp.type], prop: selProp.name, rowTitle: this.titleOf(t, selRow), fields: [fv], isFormula: selProp.type === 'formula', formula: selProp.expr || '', canEditFormula: canStructure && !locked,
        editFormula: function () { self.openDrawer('propEdit', { dCtx: ctxD, dProp: selProp.key }); }, openRec: function () { self.openRec(tid, selRow.id); }, close: function () { self.setState({ selCell: null }); } };
    }

    /* tablero */
    var bprop = gprop || rprops.filter(function (p) { return p.type === 'status' || p.type === 'select'; })[0] || null;
    var board = [];
    if (layout === 'board' && bprop) {
      board = (this.groupsOf(s, t, sorted, bprop.key, { hideEmpty: vw.hideEmpty }) || []).map(function (g) {
        var preset = self.groupPatch(bprop, g.key);
        return { label: g.label, cls: g.cls, dot: g.dot, isPill: g.isPill, isPerson: g.isPerson, avatar: g.avatar, initials: g.initials, count: String(g.rows.length), empty: g.rows.length === 0,
          canAdd: canEdit && !!preset, add: function () { self.newRow(tid, Object.assign(self.viewPreset(s, t, vw, v), preset || {})); },
          drop: function (e) { try { e.preventDefault(); } catch (err) { } var id = self._drag; if (!id) { try { id = e.dataTransfer.getData('text/plain'); } catch (err2) { id = null; } } self._drag = null; if (id) { self.moveToGroup(tid, id, bprop.key, g.key); self.jellyOn(id); } },
          cards: g.rows.map(function (r) { return { title: self.titleOf(t, r), open: openFn(r), sel: isOpenRec(r) ? 'is-sel' : '', rc: rowColor(r) + (s.jellyKey === r.id ? ' jelly' : ''), drag: canEdit && !!preset, props: propsFor(r), dragStart: function (e) { self._drag = r.id; var cd = null; try { e.dataTransfer.setData('text/plain', r.id); e.dataTransfer.effectAllowed = 'move'; cd = e.currentTarget; } catch (err) { } if (cd) setTimeout(function () { cd.classList.add('jk-src'); }, 0); }, dragEnd: function (e) { try { e.currentTarget.classList.remove('jk-src'); document.querySelectorAll('.kcol.jk-over').forEach(function (n) { n.classList.remove('jk-over'); }); } catch (err) { } } }; }) };
      });
    }
    var listItems = layout === 'list' ? sorted.map(function (r) { return { title: self.titleOf(t, r), open: openFn(r), sel: isOpenRec(r) ? 'is-sel' : '', rc: rowColor(r), props: propsFor(r) }; }) : [];
    var gallery = layout === 'gallery' ? sorted.map(function (r) { var tt = self.titleOf(t, r); return { title: tt, initials: initialsOf(tt), coverBg: t.color + '1F', coverFg: t.color, icon: ICON[t.icon] || ICON.db, open: openFn(r), sel: isOpenRec(r) ? 'is-sel' : '', rc: rowColor(r), props: propsFor(r) }; }) : [];

    /* calendario */
    var cal = { ok: false, title: '', propName: '', days: [], dows: [], prev: null, next: null, today: null, msg: '' };
    if (layout === 'calendar') {
      var dp = propOf(t, vw.dateProp);
      if (!dp || !isDateType(dp) || rprops.indexOf(dp) < 0) dp = rprops.filter(function (p) { return p.type === 'date'; })[0];
      if (!dp) cal.msg = 'Añade una columna de tipo Fecha para usar el calendario.';
      else {
        var month = (s.calMonth || {})[where] || todayIso().slice(0, 7);
        var y = +month.slice(0, 4), m = +month.slice(5, 7) - 1;
        var startDow = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7;
        var start = Date.UTC(y, m, 1 - startDow), today = todayIso();
        var statusP = rprops.filter(function (p) { return p.type === 'status' || p.type === 'select'; })[0];
        var byDate = {};
        sorted.forEach(function (r) { var raw = ''; try { raw = toStr(self.rawOf(s, t, dp, r, 0)).slice(0, 10); } catch (e) { raw = ''; } if (raw) (byDate[raw] = byDate[raw] || []).push(r); });
        var days = [];
        for (var i = 0; i < 42; i++) {
          var d = new Date(start + i * 86400000), iso = isoOfDate(d), items = byDate[iso] || [];
          days.push({ num: String(d.getUTCDate()), other: d.getUTCMonth() !== m, cls: (d.getUTCMonth() !== m ? 'other ' : '') + (iso === today ? 'today' : ''),
            items: items.slice(0, 3).map(function (r) { var op = statusP ? optOf(statusP, r[statusP.key]) : null; return { title: self.titleOf(t, r), cls: rowColor(r) || (op ? 'p-' + op.c : 'p-gray'), open: openFn(r) }; }),
            hasMore: items.length > 3, more: '+' + (items.length - 3) + ' más', canAdd: canEdit && dp.type === 'date', addAria: 'Nuevo registro el ' + fmtDate(iso),
            add: (function (isoDay) { return function () { var pr = self.viewPreset(s, t, vw, v); pr[dp.key] = isoDay; self.newRow(tid, pr); }; })(iso) });
        }
        if (days.slice(35).every(function (x) { return x.other; })) days = days.slice(0, 35);
        var shift = function (n) { var dd = new Date(Date.UTC(y, m + n, 1)); return dd.getUTCFullYear() + '-' + pad2(dd.getUTCMonth() + 1); };
        var setMonth = function (mm) { var cm = clone(self.st().calMonth || {}); cm[where] = mm; self.setState({ calMonth: cm }); };
        cal = { ok: true, title: MONTHS_LONG[m] + ' de ' + y, propName: dp.name, days: days, dows: DOW.map(function (n) { return { n: n }; }), msg: '',
          prev: function () { setMonth(shift(-1)); }, next: function () { setMonth(shift(1)); }, today: function () { setMonth(todayIso().slice(0, 7)); } };
      }
    }

    /* gráfico como vista */
    var chart = { empty: true, emptyText: '', bars: [], segs: [], dots: [], grid: [], xlabels: [] };
    if (layout === 'chart') {
      var cbp = propOf(t, vw.chartBy);
      if (!cbp || rprops.indexOf(cbp) < 0) cbp = rprops.filter(function (p) { return isGroupable(p); })[0];
      var cv = String(vw.chartVal || 'count');
      if (cv !== 'count' && cv.indexOf(':') < 0) cv = 'sum:' + cv;
      chart = this.chartData(s, t, sorted, { head: true, title: LAYOUT_NAME.chart + ' · ' + vw.name, kind: vw.chartKind || 'column', by: cbp ? cbp.key : null, bucket: vw.chartBucket || 'day', val: cv, sort: vw.chartKind === 'line' ? 'label' : 'desc', limit: 0 }, null);
    }

    /* formulario */
    var form = { fields: [], title: '', sub: '', canSubmit: false, submit: null, copy: null };
    if (layout === 'form') {
      var draft = (s.formDrafts || {})[tid] || {};
      var drow = { id: '__draft' };
      vprops.forEach(function (p) {
        if (draft[p.key] !== undefined) drow[p.key] = draft[p.key];
        else if (['relation', 'person', 'multi_select', 'files'].indexOf(p.type) >= 0) drow[p.key] = [];
        else if (p.type === 'checkbox') drow[p.key] = p.def === true;
        else if (p.type === 'status') drow[p.key] = p.options.length ? p.options[0].v : '';
        else drow[p.key] = p.def && p.def !== '__today' ? p.def : '';
      });
      var fctx = {
        pickKey: 'form:' + tid + ':', set: function (key, val) { self.setDraftVal(tid, key, val); },
        toggleRel: function (key, id, single) { var arr = (drow[key] || []).slice(); var i = arr.indexOf(id); if (i >= 0) arr.splice(i, 1); else arr = single ? [id] : arr.concat([id]); self.setDraftVal(tid, key, arr); if (single) self.setState({ picker: null }); },
        runButton: function () { }, aiGen: function () { }
      };
      form = {
        title: 'Nuevo registro en ' + t.name,
        sub: canEdit ? 'Las respuestas crean un registro en ' + t.name + '. Los campos con * son obligatorios.' : 'Con tu permiso no puedes enviar este formulario.',
        fields: vprops.filter(function (p) { return !COMPUTED[p.type] && ['button', 'ai', 'files'].indexOf(p.type) < 0; }).map(function (p) {
          var f = self.fieldView(s, t, p, drow, v, canEdit, fctx);
          if (p.type === 'title') f.label = p.name + ' *';
          return f;
        }),
        canSubmit: canEdit, submit: function () { self.submitForm(tid, vid); }, copy: function () { self.copyLink(tid, vid, 'form'); }
      };
    }

    var hiddenByRules = t.rows.length - this.rowsFor(s, tid, v).length;
    var countText = sorted.length + (sorted.length === 1 ? ' registro' : ' registros');
    if (baseRows.length - filtered.length > 0 && !q) countText += ' · ' + (baseRows.length - filtered.length) + ' ocultos por los filtros de la vista';
    if (hiddenByRules > 0) countText += ' · ' + hiddenByRules + ' ocultos por permisos';
    var emptyText = q ? 'Nada coincide con «' + s.q + '».' : ((activeFilters.length || opts.xfSets) ? 'Ningún registro cumple los filtros.' : 'Aún no hay registros.' + (canEdit ? ' Crea el primero con «Nuevo».' : ''));
    var activeChips = activeFilters.map(function (f) {
      var p = propOf(t, f.prop), val = f.value;
      if (catOf(p.type) === 'person') { var mm = self.memberById(s, val); val = val === 'me' ? 'Yo' : (mm ? mm.name.split(' ')[0] : val); }
      return { label: p.name + ' ' + OP_NAME[f.op] + (NOVAL[f.op] ? '' : ' ' + (val === '' ? '…' : (catOf(p.type) === 'date' ? fmtDate(val) : val))), remove: function () { var i = vw.filters.indexOf(f); self.updView(tid, vid, function (x) { x.filters.splice(i, 1); }); }, aria: 'Quitar filtro ' + p.name };
    });
    return {
      tid: tid, name: t.name, icon: ICON[t.icon] || ICON.db, color: t.color, compact: !!opts.compact,
      viewTabs: t.views.map(function (x) { return { name: x.name, icon: ICON[x.layout], cls: x.id === vid ? 'on' : '', locked: !!x.locked, pick: function () { self.pickView(where, tid, x.id); } }; }),
      addViewOpen: s.addViewOpen === where, toggleAddView: function () { self.setState({ addViewOpen: s.addViewOpen === where ? null : where }); },
      layoutsAdd: LAYOUTS.map(function (l) { return { name: l.n, icon: ICON[l.id], pick: function () { self.addView(tid, where, l.id); } }; }),
      hasFilters: activeFilters.length > 0, filterCount: String(activeFilters.length), filterOn: activeFilters.length ? 'on' : '',
      hasSorts: (vw.sorts || []).length > 0, sortCount: String((vw.sorts || []).length), sortOn: (vw.sorts || []).length ? 'on' : '',
      openFilter: function () { self.openDrawer('filter', { dCtx: ctxD }); }, openSort: function () { self.openDrawer('sort', { dCtx: ctxD }); }, openSettings: function () { self.openDrawer('root', { dCtx: ctxD }); },
      openNewProp: function () { self.openDrawer('newProp', { dCtx: ctxD }); }, openRelate: function () { self.openDrawer('newProp', { dCtx: ctxD, newPropSearch: 'Relación' }); },
      showSearch: where === 'scr', q: s.q || '', setQ: function (e) { self.setState({ q: e.target.value }); }, searchPh: 'Buscar en ' + t.name,
      canEdit: canEdit, canStructureOpen: canStructure && !locked, newRowBtn: function () { self.newRow(tid, self.viewPreset(s, t, vw, v)); },
      viewLocked: locked, hasXf: !!xfNote, xfText: xfNote,
      activeChips: activeChips, hasActiveChips: activeChips.length > 0, clearFilters: function () { self.updView(tid, vid, function (x) { x.filters = []; }); },
      hasHeadMenu: !!hmProp, hm: hm, hasCellBar: !!cb.prop, cb: cb,
      isTable: layout === 'table', isBoard: layout === 'board', isList: layout === 'list', isGallery: layout === 'gallery', isCalendar: layout === 'calendar', isChart: layout === 'chart', isForm: layout === 'form',
      tblMinW: tblMinW, gridCols: gridCols, headCols: headCols, tgroups: tgroups, calcCells: calcCells, noRows: sorted.length === 0, emptyText: emptyText,
      board: board, boardNoProp: layout === 'board' && !bprop, boardMsg: 'Añade una columna de tipo Estado o Seleccionar para usar el tablero.', allowDrop: function (e) { try { e.preventDefault(); } catch (err) { } },
      listItems: listItems, gallery: gallery, showListEmpty: (layout === 'list' || layout === 'gallery' || layout === 'board') && sorted.length === 0,
      cal: cal, calOk: cal.ok, calNo: layout === 'calendar' && !cal.ok, calMsg: cal.msg,
      chart: chart, form: form, countText: countText
    };
  }
});
