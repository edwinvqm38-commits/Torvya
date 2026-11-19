/* ================= componente: lectura y cálculo ================= */
class Component extends DCLogic {
  st() {
    if (!this._base) this._base = makeInitial();
    var cur = this.state || {};
    var out = {}, k;
    for (k in this._base) out[k] = this._base[k];
    for (k in cur) out[k] = cur[k];
    return out;
  }
  toastMsg(text) {
    var self = this;
    var id = (this.st().toastId || 0) + 1;
    this.setState({ toast: text, toastId: id });
    setTimeout(function () { if (self.st().toastId === id) self.setState({ toast: null }); }, 4200);
  }
}

Object.assign(Component.prototype, {
  memo(s) { if (this._mt !== s.tables) { this._mt = s.tables; this._m = {}; } return this._m; },
  memberById(s, id) { var r = null; s.members.forEach(function (m) { if (m.id === id) r = m; }); return r; },
  viewer(s) { return this.memberById(s, s.viewAs) || s.members[0]; },
  lvl(s, tid, role) { if (role === 'admin') return 'full'; var a = s.access[tid]; return (a && a[role]) || 'none'; },
  curTid(s) { return s.tables.byId[s.table] ? s.table : s.tables.order[0]; },
  viewOf(t, vid) { var r = null; t.views.forEach(function (x) { if (x.id === vid) r = x; }); return r || t.views[0]; },
  screenView(s, t) { return this.viewOf(t, (s.viewSel || {})[t.id]); },
  rprops(s, t, role) { var hide = s.colHide[t.id] || {}; return t.props.filter(function (p) { return role === 'admin' || p.type === 'title' || (hide[p.key] || []).indexOf(role) < 0; }); },
  rowsFor(s, tid, v) {
    var t = s.tables.byId[tid];
    if (!t) return [];
    var rows = t.rows;
    if (v.role === 'admin') return rows;
    s.rowRules.forEach(function (r) { if (r.on && r.table === tid && r.role === v.role && RULE_FN[r.id]) rows = rows.filter(function (row) { return RULE_FN[r.id](row, v); }); });
    return rows;
  },
  titleProp(t) { var r = t.props[0]; t.props.forEach(function (p) { if (p.type === 'title') r = p; }); return r; },
  titleOf(t, row) { var tp = this.titleProp(t); return (row && row[tp.key]) || 'Sin título'; },
  tableByName(s, name) { var nm = String(name).trim().toLowerCase(); var r = null; s.tables.order.forEach(function (id) { if (String(s.tables.byId[id].name).trim().toLowerCase() === nm) r = s.tables.byId[id]; }); return r; },
  parsed(expr) {
    if (!this._fc) this._fc = {};
    var c = this._fc[expr];
    if (!c) { try { c = { ast: parseFormula(expr) }; } catch (e) { c = { err: e.message }; } this._fc[expr] = c; }
    if (c.err) throw new Error(c.err);
    return c.ast;
  },
  rawOf(s, t, p, row, depth) {
    depth = depth || 0;
    if (depth > 10) throw new Error('Referencia circular');
    var v = row[p.key];
    switch (p.type) {
      case 'number': return (v === '' || v == null || isNaN(Number(v))) ? null : Number(v);
      case 'checkbox': return !!v;
      case 'multi_select': case 'person': case 'files': case 'relation': return Array.isArray(v) ? v : [];
      case 'rollup': return this.rollupVal(s, t, p, row, depth + 1);
      case 'formula': {
        var m = this.memo(s), mk = 'f|' + t.id + '|' + row.id + '|' + p.key;
        if (row.id !== '__draft' && Object.prototype.hasOwnProperty.call(m, mk)) { if (m[mk] && m[mk].__err) throw new Error(m[mk].__err); return m[mk]; }
        try { var res = this.formulaVal(s, t, p, row, depth + 1); if (row.id !== '__draft') m[mk] = res; return res; }
        catch (e) { if (row.id !== '__draft' && depth <= 1) m[mk] = { __err: e.message }; throw e; }
      }
      case 'created_time': return row._cAt || '';
      case 'last_edited_time': return row._eAt || '';
      case 'created_by': return row._cBy || '';
      case 'last_edited_by': return row._eBy || '';
      case 'id': return row._n == null ? null : row._n;
      case 'button': return null;
    }
    return v == null ? '' : v;
  },
  fval(s, t, p, row, depth) {
    var self = this;
    var raw = this.rawOf(s, t, p, row, depth);
    if (p.type === 'person') return raw.map(function (id) { var m = self.memberById(s, id); return m ? m.name : ''; });
    if (p.type === 'created_by' || p.type === 'last_edited_by') { var m = this.memberById(s, raw); return m ? m.name : ''; }
    if (p.type === 'relation') { var T2 = s.tables.byId[p.target]; return raw.map(function (id) { var r = findRow(T2, id); return r ? self.titleOf(T2, r) : ''; }); }
    if (p.type === 'id') return raw == null ? '' : (p.prefix ? p.prefix + '-' : '') + raw;
    return raw;
  },
  srefVals(s, tableName, colName, depth, viewer) {
    var self = this;
    var T = this.tableByName(s, tableName);
    if (!T) throw new Error('No existe la tabla «' + tableName + '»');
    var P = propByName(T, colName);
    if (!P) throw new Error('No existe la columna «' + colName + '» en ' + T.name);
    var rows = T.rows;
    if (viewer) {
      if (this.lvl(s, T.id, viewer.role) === 'none') throw new Error('Sin acceso a ' + T.name);
      var hide = (s.colHide[T.id] || {})[P.key] || [];
      if (viewer.role !== 'admin' && hide.indexOf(viewer.role) >= 0) throw new Error('Columna oculta para tu rol');
      rows = this.rowsFor(s, T.id, viewer);
    }
    var m = this.memo(s), mk = 's|' + T.id + '|' + P.key + '|' + (viewer ? viewer.id : '*');
    if (m[mk]) return m[mk];
    var out = rows.map(function (r) { try { return self.fval(s, T, P, r, (depth || 0) + 1); } catch (e) { return null; } });
    m[mk] = out;
    return out;
  },
  rollupVal(s, t, p, row, depth) {
    var self = this;
    var rel = propOf(t, p.rel);
    if (!rel || rel.type !== 'relation') return null;
    var T2 = s.tables.byId[rel.target];
    if (!T2) return null;
    var ids = row[rel.key] || [];
    var rows = T2.rows.filter(function (r) { return ids.indexOf(r.id) >= 0; });
    if (p.fn === 'count') return rows.length;
    var P2 = propOf(T2, p.prop);
    if (!P2) return p.fn === 'show' ? [] : null;
    var vals = rows.map(function (r) { try { return self.fval(s, T2, P2, r, depth); } catch (e) { return null; } });
    if (p.fn === 'show') { var out = []; vals.forEach(function (x) { if (Array.isArray(x)) x.forEach(function (y) { if (y !== '') out.push(toStr(y)); }); else if (!isEmptyVal(x)) out.push(P2.type === 'number' ? fmtNumber(x, P2.fmt, P2.dec) : toStr(x)); }); return out; }
    if (p.fn === 'count_values') return vals.filter(function (x) { return !isEmptyVal(x) && x !== false; }).length;
    var nums = vals.map(toNumOrNull).filter(function (x) { return x != null; });
    if (p.fn === 'sum') return nums.reduce(function (a, b) { return a + b; }, 0);
    if (!nums.length) return null;
    if (p.fn === 'avg') return nums.reduce(function (a, b) { return a + b; }, 0) / nums.length;
    if (p.fn === 'min') return Math.min.apply(null, nums);
    if (p.fn === 'max') return Math.max.apply(null, nums);
    return null;
  },
  formulaVal(s, t, p, row, depth) {
    var self = this;
    var ast = this.parsed(p.expr || '');
    function propVal(name) {
      var p2 = propByName(t, name);
      if (!p2) throw new Error('No existe la propiedad «' + name + '»');
      if (p2.key === p.key) throw new Error('La fórmula no puede usarse a sí misma');
      return self.fval(s, t, p2, row, depth);
    }
    return evalAst(ast, { prop: propVal, sref: function (tn, cn) { return self.srefVals(s, tn, cn, depth); } });
  },
  numFmtOf(s, t, p) {
    if (!p) return { fmt: 'number' };
    if (p.type === 'number') return { fmt: p.fmt || 'number', dec: p.dec, sep: p.sep };
    if (p.type === 'formula') return { fmt: (!p.resFmt || p.resFmt === 'auto' || p.resFmt === 'text') ? 'number' : p.resFmt, dec: p.resDec };
    if (p.type === 'rollup') {
      if (p.fn === 'count' || p.fn === 'count_values') return { fmt: 'number', dec: 0 };
      var rel = propOf(t, p.rel), T2 = rel ? s.tables.byId[rel.target] : null, P2 = T2 ? propOf(T2, p.prop) : null;
      if (P2 && P2.type === 'formula' && p.fn !== 'show') { var f2 = this.numFmtOf(s, T2, P2); return { fmt: p.fn === 'sum' || p.fn === 'avg' || p.fn === 'min' || p.fn === 'max' ? f2.fmt : 'number', dec: f2.dec }; }
      return P2 && P2.type === 'number' ? { fmt: P2.fmt || 'number', dec: P2.dec } : { fmt: 'number' };
    }
    return { fmt: 'number' };
  },
  fmtRollup(s, t, p, raw) { if (raw == null) return ''; var f = this.numFmtOf(s, t, p); return fmtNumber(raw, f.fmt, f.dec, f.sep); },
  rollupDesc(s, t, p) {
    var rel = propOf(t, p.rel), T2 = rel ? s.tables.byId[rel.target] : null, P2 = T2 ? propOf(T2, p.prop) : null;
    var fn = ROLLUP_FNS.filter(function (x) { return x.id === p.fn; })[0];
    if (!rel) return 'Elige una relación en la configuración de la columna';
    if (p.fn === 'count') return 'Cuenta los registros vinculados en ' + rel.name;
    return (fn ? fn.n : '') + ' de ' + (P2 ? P2.name : '…') + ' en ' + rel.name;
  },
  chip(s, tid, id, v) {
    var self = this;
    var t = s.tables.byId[tid];
    var row = findRow(t, id);
    if (!row) return null;
    var ok = this.lvl(s, tid, v.role) !== 'none' && this.rowsFor(s, tid, v).indexOf(row) >= 0;
    if (!ok) return { locked: true, ok: false, label: 'Restringido', color: '', joinCls: '', open: null };
    return { locked: false, ok: true, label: this.titleOf(t, row), color: t.color, joinCls: '', open: function () { self.openRec(tid, id); } };
  },
  dispOf(s, t, p, row, v, canEdit) {
    var self = this;
    var d = { kText: false, kPills: false, kChips: false, kPeople: false, kCheck: false, kLink: false, kFiles: false, kButton: false, kBar: false, kRing: false, text: '', cls: '', pills: [], chips: [], people: [], checked: false, checkCls: '', canToggle: false, noToggle: true, toggle: null, aria: '', srText: '', href: '', linkText: '', files: [], btnLabel: '', run: null, btnDis: true, pct: 0, dash: '0 44', empty: true };
    var raw;
    try { raw = this.rawOf(s, t, p, row, 0); } catch (e) { d.kText = true; d.text = '#ERROR'; d.srText = e.message; d.cls = 'v-err'; d.empty = false; return d; }
    switch (p.type) {
      case 'title': case 'text': d.kText = true; d.text = raw || ''; break;
      case 'ai': d.kText = true; d.text = raw || ''; d.cls = 'v-ai'; break;
      case 'number': {
        var txt = fmtNumber(raw, p.fmt, p.dec, p.sep);
        if ((p.showAs === 'bar' || p.showAs === 'ring') && raw != null) {
          var pct = Math.max(0, Math.min(100, raw / (Number(p.max) || 100) * 100));
          d.pct = Math.round(pct); d.text = txt; d.dash = (pct / 100 * 43.98).toFixed(2) + ' 44';
          if (p.showAs === 'bar') d.kBar = true; else d.kRing = true;
        } else { d.kText = true; d.text = txt; d.cls = 'v-num'; }
        break;
      }
      case 'select': case 'status': { var op = optOf(p, raw); if (op) { d.kPills = true; d.pills = [{ text: op.v, cls: 'p-' + op.c, dot: p.type === 'status' }]; } break; }
      case 'multi_select': d.pills = raw.map(function (x) { var op2 = optOf(p, x); return op2 ? { text: op2.v, cls: 'p-' + op2.c, dot: false } : null; }).filter(function (x) { return x; }); d.kPills = d.pills.length > 0; break;
      case 'date': d.kText = true; d.text = fmtDate(raw, p.dateFmt); break;
      case 'person': d.people = raw.map(function (id) { return self.memberById(s, id); }).filter(function (x) { return x; }).map(function (m) { return { name: m.name, initials: initialsOf(m.name), color: m.color }; }); d.kPeople = d.people.length > 0; break;
      case 'created_by': case 'last_edited_by': { var m = this.memberById(s, raw); if (m) { d.kPeople = true; d.people = [{ name: m.name, initials: initialsOf(m.name), color: m.color }]; } break; }
      case 'files': d.files = raw.map(function (n) { return { name: n }; }); d.kFiles = d.files.length > 0; break;
      case 'checkbox':
        d.kCheck = true; d.checked = !!raw; d.checkCls = (raw ? 'on' : '') + (p.checkStyle === 'switch' ? ' as-switch' : ''); d.canToggle = !!canEdit; d.noToggle = !canEdit;
        d.aria = (raw ? 'Desmarcar ' : 'Marcar ') + p.name; d.srText = p.name + ': ' + (raw ? 'sí' : 'no');
        d.toggle = function () { self.setField(t.id, row.id, p.key, !raw, (raw ? 'desmarcó ' : 'marcó ') + p.name + ' en ' + self.titleOf(t, row)); };
        break;
      case 'url': if (raw) { d.kLink = true; d.href = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw; d.linkText = p.urlShort ? String(raw).replace(/^https?:\/\//i, '').split('/')[0] : String(raw).replace(/^https?:\/\//i, ''); if (/(1drv\.ms|onedrive\.live\.com|sharepoint\.com)/i.test(d.href)) d.linkText = 'OneDrive · abrir carpeta'; else if (/(drive\.google\.com|docs\.google\.com)/i.test(d.href)) d.linkText = 'Google Drive · abrir carpeta'; } break;
      case 'email': if (raw) { d.kLink = true; d.href = 'mailto:' + raw; d.linkText = raw; } break;
      case 'phone': if (raw) { d.kLink = true; d.href = 'tel:' + String(raw).replace(/[^0-9+]/g, ''); d.linkText = raw; } break;
      case 'place': if (raw) { d.kLink = true; d.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(raw); d.linkText = raw; } break;
      case 'relation': d.chips = raw.map(function (id) { return self.chip(s, p.target, id, v); }).filter(function (x) { return x; }); d.kChips = d.chips.length > 0; break;
      case 'rollup': d.kText = true; if (Array.isArray(raw)) d.text = raw.join(', '); else { d.text = this.fmtRollup(s, t, p, raw); d.cls = 'v-num'; } break;
      case 'formula': {
        var rf = p.resFmt || 'auto';
        if (typeof raw === 'boolean') { d.kCheck = true; d.checked = raw; d.checkCls = raw ? 'on' : ''; d.srText = p.name + ': ' + (raw ? 'sí' : 'no'); }
        else if (typeof raw === 'number' && rf !== 'text') { d.kText = true; d.text = fmtNumber(raw, rf === 'auto' ? 'number' : rf, p.resDec); d.cls = 'v-num'; }
        else if (typeof raw === 'string' && (raw === 'Rojo' || raw === 'Amarillo' || raw === 'Verde')) { d.kPills = true; d.pills = [{ text: raw, cls: 'p-' + ({ Rojo: 'red', Amarillo: 'amber', Verde: 'green' })[raw], dot: true }]; }
        else { d.kText = true; d.text = raw == null ? '' : (Array.isArray(raw) ? toStr(raw) : (typeof raw === 'number' ? fmtNum(raw) : String(raw))); }
        break;
      }
      case 'created_time': case 'last_edited_time': d.kText = true; d.text = p.dateFmt === 'relative' ? fmtDate(raw, 'relative') : fmtDateTime(raw); d.cls = 'v-muted'; break;
      case 'id': d.kText = true; d.text = raw == null ? '' : (p.prefix ? p.prefix + '-' : '') + raw; d.cls = 'v-id'; break;
      case 'button': d.kButton = true; d.btnLabel = p.label || p.name; d.btnDis = !canEdit; d.run = function () { self.runButton(t.id, row.id, p.key); }; break;
    }
    d.empty = !(d.kPills || d.kChips || d.kPeople || d.kCheck || d.kLink || d.kFiles || d.kButton || d.kBar || d.kRing || (d.kText && d.text !== ''));
    return d;
  },
  ruleMatch(s, t, rule, row, v) {
    var p = propOf(t, rule.prop);
    if (!p) return true;
    var cat = catOf(p.type), op = rule.op, val = rule.value;
    var raw;
    try { raw = this.rawOf(s, t, p, row, 0); } catch (e) { raw = null; }
    if (op === 'empty') return isEmptyVal(raw);
    if (op === 'not_empty') return !isEmptyVal(raw);
    if (op === 'checked') return !!raw;
    if (op === 'unchecked') return !raw;
    if (val === '' || val == null) return true;
    if (cat === 'text' || cat === 'rel') {
      var fv; try { fv = this.fval(s, t, p, row, 0); } catch (e2) { fv = ''; }
      var hay = toStr(fv).toLowerCase(), needle = toStr(val).toLowerCase();
      if (op === 'contains') return hay.indexOf(needle) >= 0;
      if (op === 'not_contains') return hay.indexOf(needle) < 0;
      if (op === 'is') return hay === needle;
      if (op === 'is_not') return hay !== needle;
      return true;
    }
    if (cat === 'number') {
      if (raw == null) return false;
      var a = Number(raw), b = toNum(val);
      return op === 'eq' ? a === b : op === 'neq' ? a !== b : op === 'gt' ? a > b : op === 'lt' ? a < b : op === 'gte' ? a >= b : a <= b;
    }
    if (cat === 'select') return op === 'is' ? raw === val : raw !== val;
    if (cat === 'multi') { var has = (raw || []).indexOf(val) >= 0; return op === 'contains' ? has : !has; }
    if (cat === 'person') { var ids = Array.isArray(raw) ? raw : (raw ? [raw] : []); var inc = ids.indexOf(val === 'me' ? v.id : val) >= 0; return op === 'contains' ? inc : !inc; }
    if (cat === 'date') { var dv = toStr(raw).slice(0, 10), cv = toStr(val).slice(0, 10); if (!dv) return false; return op === 'is' ? dv === cv : op === 'before' ? dv < cv : dv > cv; }
    if (cat === 'calc') {
      if (op === 'contains') return toStr(raw).toLowerCase().indexOf(toStr(val).toLowerCase()) >= 0;
      var numeric = typeof raw === 'number' && !isNaN(Number(val));
      if (op === 'eq') return numeric ? raw === Number(val) : looseEq(raw, val);
      if (op === 'gt') return numeric ? raw > Number(val) : cmpVals(raw, val) > 0;
      if (op === 'lt') return numeric ? raw < Number(val) : cmpVals(raw, val) < 0;
    }
    return true;
  },
  sortKey(s, t, p, row) {
    if (!p) return null;
    var raw;
    try { raw = this.rawOf(s, t, p, row, 0); } catch (e) { return null; }
    if (p.type === 'select' || p.type === 'status') { if (!raw) return null; var i = (p.options || []).map(function (x) { return x.v; }).indexOf(raw); return i < 0 ? 999 : i; }
    if (p.type === 'checkbox') return raw ? 1 : 0;
    if (typeof raw === 'number') return raw;
    if (raw == null || raw === '' || (Array.isArray(raw) && !raw.length)) return null;
    var fv; try { fv = this.fval(s, t, p, row, 0); } catch (e2) { fv = raw; }
    if (Array.isArray(fv)) fv = fv[0];
    if (typeof fv === 'number') return fv;
    return toStr(fv).toLowerCase();
  },
  sortRows(s, t, rows, sorts) {
    var self = this;
    var valid = (sorts || []).filter(function (x) { return propOf(t, x.prop); });
    if (!valid.length) return rows;
    var keyed = rows.map(function (r, i) { return { r: r, i: i, k: valid.map(function (x) { return self.sortKey(s, t, propOf(t, x.prop), r); }) }; });
    keyed.sort(function (a, b) {
      for (var i = 0; i < valid.length; i++) {
        var x = a.k[i], y = b.k[i], ex = x == null || x === '', ey = y == null || y === '';
        if (ex && ey) continue;
        if (ex) return 1;
        if (ey) return -1;
        var c = (typeof x === 'number' && typeof y === 'number') ? x - y : String(x).localeCompare(String(y), 'es');
        if (c) return valid[i].dir === 'desc' ? -c : c;
      }
      return a.i - b.i;
    });
    return keyed.map(function (x) { return x.r; });
  },
  bucketKey(raw, bucket) {
    var s = toStr(raw).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    if (bucket === 'month') return s.slice(0, 7);
    if (bucket === 'week') { var d = parseDateVal(s); var dow = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - dow); return 'w' + isoOfDate(d); }
    return s;
  },
  bucketLabel(key) {
    if (!key) return '';
    if (key.charAt(0) === 'w') { var p = key.slice(1).split('-'); return 'Sem. ' + Number(p[2]) + ' ' + MONTHS[Number(p[1]) - 1]; }
    var q = key.split('-');
    if (q.length === 2) return MONTHS[Number(q[1]) - 1] + ' ' + q[0];
    return Number(q[2]) + ' ' + MONTHS[Number(q[1]) - 1];
  },
  groupKeys(s, t, p, row, bucket) {
    var raw;
    try { raw = this.rawOf(s, t, p, row, 0); } catch (e) { return ['__none']; }
    switch (p.type) {
      case 'select': case 'status': return raw ? [raw] : ['__none'];
      case 'multi_select': case 'person': case 'relation': return raw && raw.length ? raw.slice() : ['__none'];
      case 'created_by': case 'last_edited_by': return raw ? [raw] : ['__none'];
      case 'checkbox': return [!!raw];
      case 'title': return [row.id];
      case 'date': case 'created_time': case 'last_edited_time': { var k = this.bucketKey(raw, bucket || 'day'); return k ? [k] : ['__none']; }
    }
    var txt = dispText(this.dispOf(s, t, p, row, s.members[0], false));
    return txt ? [txt] : ['__none'];
  },
  groupsOf(s, t, rows, gkey, opts) {
    var self = this;
    opts = opts || {};
    var p = propOf(t, gkey);
    if (!p) return null;
    var defs = [];
    var map = {};
    function add(key, def) { if (map[String(key)]) return map[String(key)]; def.key = key; def.rows = []; map[String(key)] = def; defs.push(def); return def; }
    if (p.type === 'select' || p.type === 'status' || p.type === 'multi_select') p.options.forEach(function (x) { add(x.v, { label: x.v, cls: 'p-' + x.c, color: SOLID[x.c] || PALETTE[0], dot: p.type === 'status', isPerson: false }); });
    else if (p.type === 'checkbox') { add(true, { label: 'Marcada', cls: 'p-green', color: SOLID.green }); add(false, { label: 'Sin marcar', cls: 'p-gray', color: SOLID.gray }); }
    else if (p.type === 'person' || p.type === 'created_by' || p.type === 'last_edited_by') s.members.filter(function (m) { return !m.pending; }).forEach(function (m) { add(m.id, { label: m.name, isPerson: true, avatar: m.color, initials: initialsOf(m.name), color: m.color, cls: '' }); });
    else if (p.type === 'relation') { var T2 = s.tables.byId[p.target]; (T2 ? T2.rows : []).forEach(function (r, i) { add(r.id, { label: self.titleOf(T2, r), cls: 'p-gray', color: PALETTE[i % PALETTE.length], isRel: true, relColor: T2.color }); }); }
    else if (p.type === 'title') rows.forEach(function (r, i) { add(r.id, { label: self.titleOf(t, r), cls: 'p-gray', color: PALETTE[i % PALETTE.length] }); });
    var none = { key: '__none', label: 'Sin ' + p.name.toLowerCase(), cls: 'p-off', color: SOLID.gray, rows: [] };
    rows.forEach(function (r) {
      self.groupKeys(s, t, p, r, opts.bucket).forEach(function (k) {
        if (k === '__none') { none.rows.push(r); return; }
        var g = map[String(k)];
        if (!g) { var sem = p.type === 'formula' ? ({ Rojo: 'red', Amarillo: 'amber', Verde: 'green' })[String(k)] : null; g = add(k, { label: isDateType(p) ? self.bucketLabel(k) : String(k), cls: sem ? 'p-' + sem : 'p-gray', color: sem ? SOLID[sem] : PALETTE[defs.length % PALETTE.length] }); }
        g.rows.push(r);
      });
    });
    if (isDateType(p)) defs.sort(function (a, b) { return String(a.key).replace(/^w/, '') < String(b.key).replace(/^w/, '') ? -1 : 1; });
    defs.push(none);
    return defs.filter(function (g) { return g.key === '__none' ? g.rows.length > 0 : (!opts.hideEmpty || g.rows.length > 0); }).map(function (g) {
      g.dot = !!g.dot; g.isPerson = !!g.isPerson; g.isPill = !g.isPerson; g.avatar = g.avatar || ''; g.initials = g.initials || ''; return g;
    });
  },
  groupPatch(p, key) {
    var patch = {};
    if (key === '__none') { patch[p.key] = (p.type === 'person' || p.type === 'multi_select') ? [] : (p.type === 'checkbox' ? false : ''); return patch; }
    if (p.type === 'select' || p.type === 'status') patch[p.key] = key;
    else if (p.type === 'multi_select' || p.type === 'person') patch[p.key] = [key];
    else if (p.type === 'checkbox') patch[p.key] = key === true;
    else return null;
    return patch;
  },
  aggregate(s, t, rows, valSpec) {
    var self = this;
    var spec = String(valSpec || 'count');
    if (spec === 'count') return { value: rows.length, fmt: { fmt: 'number', dec: 0 }, label: 'registros' };
    var parts = spec.split(':'), fn = parts[0], p = propOf(t, parts[1]);
    if (!p) return { value: rows.length, fmt: { fmt: 'number', dec: 0 }, label: 'registros' };
    var nums = rows.map(function (r) { try { return toNumOrNull(self.rawOf(s, t, p, r, 0)); } catch (e) { return null; } }).filter(function (x) { return x != null; });
    var val = null;
    if (fn === 'sum') val = nums.reduce(function (a, b) { return a + b; }, 0);
    else if (nums.length) {
      if (fn === 'avg') val = nums.reduce(function (a, b) { return a + b; }, 0) / nums.length;
      if (fn === 'min') val = Math.min.apply(null, nums);
      if (fn === 'max') val = Math.max.apply(null, nums);
    }
    return { value: val, fmt: this.numFmtOf(s, t, p), label: (AGG_NAME[fn] || '') + ' de ' + p.name };
  },
  aiText(s, t, p, row) {
    var self = this;
    if (p.mode === 'translate') return '';
    var admin = s.members[0], hide = s.colHide[t.id] || {}, parts = [];
    t.props.forEach(function (x) {
      if (parts.length >= 5) return;
      if (['title', 'ai', 'button', 'files', 'created_time', 'created_by', 'last_edited_time', 'last_edited_by', 'id'].indexOf(x.type) >= 0) return;
      if ((hide[x.key] || []).length) return;
      var d = self.dispOf(s, t, x, row, admin, false);
      if (d.kCheck && !d.checked) return;
      var txt = dispText(d);
      if (!txt || txt.indexOf('#') === 0) return;
      parts.push(x.name + ': ' + txt);
    });
    return this.titleOf(t, row) + ' — ' + (parts.length ? parts.join(' · ') : 'sin datos todavía') + '.';
  },
  refreshAi(s2, t, row) { var self = this; t.props.forEach(function (p) { if (p.type === 'ai' && p.auto && p.mode !== 'translate') row[p.key] = self.aiText(s2, t, p, row); }); },
  whoLabel(s, t, who) {
    who = String(who || '');
    if (who.indexOf('role:') === 0) return ROLE_NAME[who.slice(5)] || who;
    if (who.indexOf('prop:') === 0) { var p = propOf(t, who.slice(5)); return 'las personas en ' + (p ? p.name : '…'); }
    var m = this.memberById(s, who);
    return m ? m.name : who;
  },
  describeAuto(s, t, a) {
    var tp = a.trigger.type === 'created' ? 'Cuando se crea un registro' : 'Cuando ' + ((propOf(t, a.trigger.prop) || {}).name || '…') + ' cambia a «' + autoValLabel(a.trigger.value) + '»';
    var ac = a.action.type === 'notify' ? 'avisar a ' + this.whoLabel(s, t, a.action.who) : 'poner ' + ((propOf(t, a.action.prop) || {}).name || '…') + ' en «' + autoValLabel(a.action.value) + '»';
    return tp + ', ' + ac + '.';
  },
  runAutos(s2, t, row, trig, v, notifs, logs, msgs) {
    var self = this;
    (t.automations || []).forEach(function (a) {
      if (!a.on || a.trigger.type !== trig.type) return;
      if (trig.type === 'changed') {
        if (a.trigger.prop !== trig.prop) return;
        var tv = a.trigger.value;
        if (typeof tv === 'boolean' ? (!!trig.value !== tv) : (trig.value !== tv)) return;
      }
      a.runs = (a.runs || 0) + 1;
      var title = self.titleOf(t, row);
      if (a.action.type === 'set') {
        var ap = propOf(t, a.action.prop);
        if (!ap) return;
        var val = a.action.value;
        if (val === '__today') val = todayIso();
        if (val === '__me') val = [v.id];
        row[ap.key] = val;
        msgs.push('Automatización: ' + ap.name + ' → ' + autoValLabel(a.action.value));
        logs.push('ejecutó una automatización en ' + title + ' (' + ap.name + ')');
      } else {
        var tos = [], who = String(a.action.who || '');
        if (who.indexOf('prop:') === 0) (row[who.slice(5)] || []).forEach(function (id) { tos.push(id); }); else tos.push(who);
        var tprop = propOf(t, trig.prop);
        var text = trig.type === 'created' ? 'Nuevo registro en ' + t.name + ': ' + title : title + ': ' + (tprop ? tprop.name : '') + ' cambió a «' + autoValLabel(trig.value) + '»';
        tos.forEach(function (to) { notifs.unshift({ id: 'nt' + Math.random().toString(36).slice(2, 9), to: to, text: text, when: 'Ahora', table: t.id, row: row.id, read: false }); });
        msgs.push('Automatización: aviso a ' + self.whoLabel(s2, t, who));
        logs.push('envió un aviso automático a ' + self.whoLabel(s2, t, who));
      }
    });
  },
  viewPreset(s, t, vw, v) {
    var patch = {};
    (vw.filters || []).forEach(function (f) {
      var p = propOf(t, f.prop);
      if (!p || f.value === '' || f.value == null) return;
      if ((p.type === 'select' || p.type === 'status') && f.op === 'is') patch[p.key] = f.value;
      if (p.type === 'multi_select' && f.op === 'contains') patch[p.key] = [f.value];
      if (p.type === 'person' && f.op === 'contains') patch[p.key] = [f.value === 'me' ? v.id : f.value];
      if (p.type === 'checkbox') patch[p.key] = f.op === 'checked';
    });
    return patch;
  },
  canDo(s, tid, vid, kind) {
    var v = this.viewer(s);
    var t = s.tables.byId[tid];
    if (!t) return false;
    var l = this.lvl(s, tid, v.role);
    var vw = this.viewOf(t, vid);
    if (kind === 'struct' && l !== 'full') { this.toastMsg('Solo quien tiene permiso «Total» puede cambiar las propiedades.'); return false; }
    if (kind === 'view' && l !== 'edit' && l !== 'full') { this.toastMsg('Con tu permiso no puedes cambiar esta vista.'); return false; }
    if (vw && vw.locked && kind !== 'page') { this.toastMsg('Esta vista está bloqueada. Desbloquéala en Configuración › Bloquear vistas.'); return false; }
    return true;
  },
  addLog(s, what) {
    var v = this.viewer(s);
    var list = Array.isArray(what) ? what : [what];
    return list.map(function (w) { return { who: v.name, color: v.color, what: w, when: 'Ahora' }; }).concat(s.log).slice(0, 60);
  },
  findBlock(pages, bid) {
    var r = null;
    pages.order.forEach(function (pid) { pages.byId[pid].blocks.forEach(function (b) { if (b.id === bid) r = { page: pages.byId[pid], block: b }; }); });
    return r;
  },
  /* filtro cruzado: devuelve un mapa tabla → conjunto de ids permitidos */
  xfSets(s, xf, v) {
    var self = this;
    if (!xf) return null;
    var T0 = s.tables.byId[xf.table];
    var P0 = propOf(T0, xf.prop);
    if (!T0 || !P0) return null;
    var sets = {};
    var base = this.rowsFor(s, T0.id, v).filter(function (r) { return self.groupKeys(s, T0, P0, r, xf.bucket).some(function (k) { return String(k) === String(xf.key); }); });
    sets[T0.id] = {};
    base.forEach(function (r) { sets[T0.id][r.id] = 1; });
    var frontier = [T0.id];
    for (var depth = 0; depth < 3 && frontier.length; depth++) {
      var next = [];
      frontier.forEach(function (fid) {
        s.tables.order.forEach(function (tid) {
          if (sets[tid]) return;
          var T = s.tables.byId[tid];
          var rels = T.props.filter(function (p) { return p.type === 'relation' && p.target === fid; });
          if (!rels.length) return;
          var ok = {};
          T.rows.forEach(function (r) { if (rels.some(function (p) { return (r[p.key] || []).some(function (id) { return sets[fid][id]; }); })) ok[r.id] = 1; });
          sets[tid] = ok;
          next.push(tid);
        });
      });
      frontier = next;
    }
    return sets;
  }
});
