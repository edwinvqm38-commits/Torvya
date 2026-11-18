/* ================= componente: acciones ================= */
Object.assign(Component.prototype, {
  /* ---------- navegación ---------- */
  go(tid, rid) {
    var p = { screen: 'db', table: tid, q: '', picker: null, viewMenu: false, navOpen: false, drawer: null, headMenu: null, addViewOpen: null, selCell: null, addBlockOpen: false };
    if (rid) { p.rec = { tid: tid, id: rid }; p.recFull = null; }
    this.setState(p);
  },
  goPage(pid) { this.setState({ screen: 'page', page: pid, picker: null, viewMenu: false, navOpen: false, drawer: null, headMenu: null, addViewOpen: null, selCell: null, addBlockOpen: false, iconPick: null }); },
  openRec(tid, id) { this.setState({ rec: { tid: tid, id: id }, recFull: null, picker: null }); },
  setScreen(sc, extra) {
    var p = { screen: sc, picker: null, viewMenu: false, navOpen: false, drawer: null, headMenu: null, addViewOpen: null, selCell: null, addBlockOpen: false };
    if (extra) for (var k in extra) p[k] = extra[k];
    this.setState(p);
  },
  previewAs(id) {
    var self = this;
    var s = this.st();
    var v = this.memberById(s, id) || s.members[0];
    var tid = this.curTid(s);
    if (this.lvl(s, tid, v.role) === 'none') { var first = s.tables.order.filter(function (x) { return self.lvl(s, x, v.role) !== 'none'; })[0]; if (first) tid = first; }
    var p = { viewAs: v.id, viewMenu: false, navOpen: false, table: tid, rec: null, picker: null, drawer: null, headMenu: null, selCell: null, q: '' };
    if (s.screen === 'permisos' || s.screen === 'tema' || s.screen === 'negocio') p.screen = 'page';
    this.setState(p);
  },
  openDrawer(page, extra) {
    var p = { drawer: page, dAdding: false, dTypeChange: false, confirmDel: null, headMenu: null, addViewOpen: null, addBlockOpen: false };
    if (extra) for (var k in extra) p[k] = extra[k];
    this.setState(p);
  },

  /* ---------- registros ---------- */
  setField(tid, rowId, key, val, logText) {
    var s = this.st();
    var v = this.viewer(s);
    var tables = clone(s.tables);
    var t = tables.byId[tid];
    var row = findRow(t, rowId);
    if (!row) return;
    var old = row[key];
    row[key] = val;
    row._eAt = nowIso(); row._eBy = v.id;
    var s2 = Object.assign({}, s, { tables: tables });
    var notifs = s.notifs.slice(), logs = [], msgs = [];
    if (logText) logs.push(logText);
    if (JSON.stringify(old) !== JSON.stringify(val)) this.runAutos(s2, t, row, { type: 'changed', prop: key, value: val }, v, notifs, logs, msgs);
    this.refreshAi(s2, t, row);
    var patch = { tables: tables, notifs: notifs };
    if (logs.length) patch.log = this.addLog(s, logs);
    this.setState(patch);
    if (msgs.length) this.toastMsg(msgs.join(' · '));
  },
  newRow(tid, preset, keepOpen) {
    var s = this.st();
    var v = this.viewer(s);
    var l = this.lvl(s, tid, v.role);
    if (l !== 'edit' && l !== 'full') { this.toastMsg('Con tu permiso no puedes crear registros aquí.'); return null; }
    var tables = clone(s.tables);
    var t = tables.byId[tid];
    var seq = s.seq + 1, id = 'n' + seq, now = nowIso();
    var row = { id: id, _n: t.nextId || (t.rows.length + 1), _cAt: now, _cBy: v.id, _eAt: now, _eBy: v.id, _body: '' };
    t.nextId = row._n + 1;
    var firstPerson = null;
    t.props.forEach(function (p) {
      if (COMPUTED[p.type] || p.type === 'button') return;
      if (['relation', 'person', 'multi_select', 'files'].indexOf(p.type) >= 0) row[p.key] = [];
      else if (p.type === 'checkbox') row[p.key] = p.def === true;
      else if (p.type === 'status') row[p.key] = p.def || (p.options.length ? p.options[0].v : '');
      else if (p.type === 'date') row[p.key] = p.def === '__today' ? todayIso() : '';
      else row[p.key] = p.def != null && p.def !== '__today' ? p.def : '';
      if (p.type === 'person' && !firstPerson) firstPerson = p;
    });
    if (firstPerson) row[firstPerson.key] = [v.id];
    if (preset) for (var k in preset) row[k] = clone(preset[k]);
    if (tid === 'sol') this.solInit(s, row, v);
    t.rows.push(row);
    t.props.forEach(function (p) {
      if (p.type !== 'relation' || !p.pair) return;
      var T2 = tables.byId[p.target], P2 = propOf(T2, p.pair);
      if (!P2) return;
      (row[p.key] || []).forEach(function (rid) {
        var r2 = findRow(T2, rid);
        if (!r2) return;
        if (P2.single) { (r2[P2.key] || []).forEach(function (oldId) { var r3 = findRow(t, oldId); if (r3 && r3 !== row) r3[p.key] = (r3[p.key] || []).filter(function (x) { return x !== rid; }); }); r2[P2.key] = [row.id]; }
        else if ((r2[P2.key] || []).indexOf(row.id) < 0) r2[P2.key] = (r2[P2.key] || []).concat([row.id]);
      });
    });
    var s2 = Object.assign({}, s, { tables: tables });
    var notifs = s.notifs.slice(), logs = ['creó un registro en ' + t.name], msgs = [];
    this.runAutos(s2, t, row, { type: 'created' }, v, notifs, logs, msgs);
    this.refreshAi(s2, t, row);
    var patch = { tables: tables, seq: seq, notifs: notifs, log: this.addLog(s, logs), picker: null };
    if (!keepOpen) { patch.rec = { tid: tid, id: id }; patch.recFull = null; }
    this.setState(patch);
    if (msgs.length) this.toastMsg(msgs.join(' · '));
    return id;
  },
  toggleLink(tid, rowId, key, targetId, single) {
    var s = this.st();
    var v = this.viewer(s);
    var tables = clone(s.tables);
    var t = tables.byId[tid];
    var row = findRow(t, rowId), p = propOf(t, key);
    if (!row || !p) return;
    var T2 = tables.byId[p.target], P2 = p.pair ? propOf(T2, p.pair) : null, tgtRow = findRow(T2, targetId);
    var arr = (row[key] || []).slice(), i = arr.indexOf(targetId), removed = [];
    if (i >= 0) { arr.splice(i, 1); removed.push(targetId); }
    else if (single) { removed = arr.slice(); arr = [targetId]; }
    else arr.push(targetId);
    row[key] = arr; row._eAt = nowIso(); row._eBy = v.id;
    if (P2) {
      removed.forEach(function (rid) { var r2 = findRow(T2, rid); if (r2) r2[P2.key] = (r2[P2.key] || []).filter(function (x) { return x !== rowId; }); });
      if (i < 0 && tgtRow) {
        var a2 = (tgtRow[P2.key] || []).slice();
        if (P2.single) { a2.forEach(function (oldId) { if (oldId !== rowId) { var r3 = findRow(t, oldId); if (r3) r3[key] = (r3[key] || []).filter(function (x) { return x !== targetId; }); } }); a2 = [rowId]; }
        else if (a2.indexOf(rowId) < 0) a2.push(rowId);
        tgtRow[P2.key] = a2;
      }
    }
    var s2 = Object.assign({}, s, { tables: tables });
    this.refreshAi(s2, t, row);
    var label = tgtRow ? this.titleOf(T2, tgtRow) : '';
    var patch = { tables: tables, log: this.addLog(s, (i >= 0 ? 'desvinculó ' : 'vinculó ') + label + (i >= 0 ? ' de ' : ' con ') + this.titleOf(t, row)) };
    if (single && i < 0) patch.picker = null;
    this.setState(patch);
  },
  delRec(tid, rid) {
    var s = this.st();
    var tables = clone(s.tables);
    var t = tables.byId[tid];
    var row = findRow(t, rid);
    if (!row) return;
    var name = this.titleOf(t, row);
    t.rows = t.rows.filter(function (x) { return x.id !== rid; });
    tables.order.forEach(function (id) { tables.byId[id].props.forEach(function (p) { if (p.type === 'relation' && p.target === t.id) tables.byId[id].rows.forEach(function (x) { if (x[p.key]) x[p.key] = x[p.key].filter(function (y) { return y !== rid; }); }); }); });
    this.setState({ tables: tables, rec: null, picker: null, selCell: null, log: this.addLog(s, 'eliminó ' + name + ' de ' + t.name) });
    this.toastMsg('Registro eliminado');
  },
  runButton(tid, rowId, key) {
    var s = this.st();
    var t = s.tables.byId[tid], p = propOf(t, key), row = findRow(t, rowId);
    if (!p || !row) return;
    var v = this.viewer(s), l = this.lvl(s, tid, v.role);
    if (l !== 'edit' && l !== 'full') { this.toastMsg('Con tu permiso no puedes usar este botón.'); return; }
    if (!p.action || !propOf(t, p.action.prop)) { this.toastMsg('Configura qué hace el botón en la configuración de la columna.'); return; }
    var ap = propOf(t, p.action.prop), val = p.action.value;
    if (val === '__today') val = todayIso();
    if (val === '__me') val = [v.id];
    this.setField(tid, rowId, ap.key, val, 'pulsó «' + (p.label || p.name) + '» en ' + this.titleOf(t, row));
    this.toastMsg('«' + (p.label || p.name) + '»: ' + ap.name + ' → ' + autoValLabel(p.action.value));
  },
  aiGenRow(tid, rowId, key) {
    var s = this.st();
    var t = s.tables.byId[tid], p = propOf(t, key), row = findRow(t, rowId);
    if (!p || !row) return;
    if (p.mode === 'translate') { this.toastMsg('La traducción la hará Claude cuando conectemos la IA real.'); return; }
    this.setField(tid, rowId, key, this.aiText(s, t, p, row), null);
    this.toastMsg('Resumen generado');
  },
  moveToGroup(tid, rowId, gkey, groupKey) {
    var s = this.st();
    var t = s.tables.byId[tid], p = propOf(t, gkey), row = findRow(t, rowId);
    if (!p || !row) return;
    var v = this.viewer(s), l = this.lvl(s, tid, v.role);
    if (l !== 'edit' && l !== 'full') { this.toastMsg('Con tu permiso no puedes mover tarjetas.'); return; }
    var patch = this.groupPatch(p, groupKey);
    if (!patch) { this.toastMsg('Este tablero se agrupa por una propiedad que no se puede cambiar arrastrando.'); return; }
    this.setField(tid, rowId, p.key, patch[p.key], 'movió ' + this.titleOf(t, row) + ' a «' + (groupKey === '__none' ? 'Sin ' + p.name.toLowerCase() : autoValLabel(groupKey)) + '»');
  },
  setDraftVal(tid, key, val) { var s = this.st(); var fd = clone(s.formDrafts); if (!fd[tid]) fd[tid] = {}; fd[tid][key] = val; this.setState({ formDrafts: fd }); },
  submitForm(tid, vid) {
    var s = this.st();
    var t = s.tables.byId[tid];
    var vw = this.viewOf(t, vid);
    var d = (s.formDrafts || {})[tid] || {};
    var missing = t.props.filter(function (p) { return (p.type === 'title' || p.required) && vw.hidden.indexOf(p.key) < 0 && isEmptyVal(d[p.key]); });
    if (missing.length) { this.toastMsg('Completa: ' + missing.map(function (p) { return p.name; }).join(', ')); return; }
    this.newRow(tid, d, true);
    var fd = clone(this.st().formDrafts);
    fd[tid] = {};
    this.setState({ formDrafts: fd, picker: null });
    this.toastMsg('Respuesta enviada: se creó un registro en ' + t.name);
  },
  copyLink(tid, vid, kind) {
    var s = this.st();
    var t = s.tables.byId[tid];
    var url = 'https://[tu-dominio]/' + slugOf(s.ws) + '/' + slugOf(t.name) + (kind === 'form' ? '/formulario?v=' : '?vista=') + vid;
    var self = this;
    try { navigator.clipboard.writeText(url).then(function () { self.toastMsg('Enlace copiado: ' + url); }, function () { self.toastMsg('Enlace de la vista: ' + url); }); }
    catch (e) { this.toastMsg('Enlace de la vista: ' + url); }
  },

  /* ---------- estructura de tablas ---------- */
  updTable(tid, fn, logText, extra) {
    var s = this.st();
    if (!this.canDo(s, tid, null, 'struct')) return false;
    var tables = clone(s.tables);
    var t = tables.byId[tid];
    if (!t) return false;
    var res = fn(t, tables);
    if (res === false) return false;
    var patch = { tables: tables };
    if (logText) patch.log = this.addLog(s, logText);
    if (extra) for (var k in extra) patch[k] = extra[k];
    this.setState(patch);
    return true;
  },
  updView(tid, vid, fn, force) {
    var s = this.st();
    if (!force && !this.canDo(s, tid, vid, 'view')) return;
    var tables = clone(s.tables);
    var t = tables.byId[tid];
    var vw = this.viewOf(t, vid);
    if (!vw.widths) vw.widths = {};
    if (!vw.wrap) vw.wrap = {};
    if (!vw.calcs) vw.calcs = {};
    fn(vw, t);
    this.setState({ tables: tables });
  },
  propDefaults(p, t, tables, seqRef, extra) {
    var others = tables.order.filter(function (id) { return id !== t.id; });
    switch (p.type) {
      case 'number': p.fmt = 'number'; p.dec = 'auto'; break;
      case 'select': case 'multi_select': p.options = [o('Opción 1', 'gray'), o('Opción 2', 'blue'), o('Opción 3', 'green')]; break;
      case 'status': p.options = [so('Sin empezar', 'gray', 'todo'), so('En curso', 'blue', 'doing'), so('Listo', 'green', 'done')]; break;
      case 'formula': p.expr = ''; p.resFmt = 'auto'; break;
      case 'date': p.dateFmt = 'long'; break;
      case 'relation': {
        var tg = (extra && extra.target) || others[0];
        if (!tg) { p.type = 'text'; break; }
        var T2 = tables.byId[tg];
        seqRef.n++;
        var pk = 'f' + seqRef.n;
        p.target = tg; p.pair = pk; p.single = false;
        T2.props.push({ key: pk, name: uniqueName(T2, t.name), type: 'relation', target: t.id, pair: p.key, single: false });
        T2.rows.forEach(function (r) { r[pk] = []; });
        break;
      }
      case 'rollup': {
        var rel = t.props.filter(function (x) { return x.type === 'relation' && x.key !== p.key; })[0];
        p.rel = rel ? rel.key : '';
        var T3 = rel ? tables.byId[rel.target] : null;
        var np = T3 ? T3.props.filter(function (x) { return x.type === 'number'; })[0] : null;
        p.prop = np ? np.key : ''; p.fn = np ? 'sum' : 'count';
        break;
      }
      case 'button': {
        var ap = t.props.filter(function (x) { return x.type === 'status' || x.type === 'select' || x.type === 'checkbox'; })[0];
        if (ap) { var val = ap.type === 'checkbox' ? true : (ap.options.length ? ap.options[ap.options.length - 1].v : ''); p.action = { prop: ap.key, value: val }; p.label = ap.type === 'checkbox' ? 'Marcar ' + ap.name : 'Pasar a ' + val; }
        else { p.action = null; p.label = 'Ejecutar'; }
        break;
      }
      case 'id': p.prefix = String(t.abbr || t.name).slice(0, 3).toUpperCase(); break;
      case 'ai': p.mode = (extra && extra.mode) || 'summary'; p.auto = true; if (p.mode === 'translate') { p.src = this.titleProp(t).key; p.lang = 'Inglés'; } break;
    }
  },
  createProp(tid, type, name, extra) {
    var self = this;
    var s = this.st();
    var key = 'f' + (s.seq + 1);
    var seqRef = { n: s.seq + 1 };
    var ok = this.updTable(tid, function (t, tables) {
      var defName = type === 'ai' ? ((extra && extra.mode) === 'translate' ? 'Traducción IA' : 'Resumen IA') : (type === 'relation' && extra && extra.target ? tables.byId[extra.target].name : TYPE_NAME[type]);
      var p = { key: key, name: uniqueName(t, name || defName), type: type };
      self.propDefaults(p, t, tables, seqRef, extra);
      t.props.push(p);
      t.rows.forEach(function (r) {
        if (['relation', 'person', 'multi_select', 'files'].indexOf(p.type) >= 0) r[key] = [];
        else if (p.type === 'checkbox') r[key] = false;
        else if (!COMPUTED[p.type] && p.type !== 'button') r[key] = '';
      });
      if (p.type === 'ai') { var s2 = Object.assign({}, s, { tables: tables }); t.rows.forEach(function (r) { r[key] = self.aiText(s2, t, p, r); }); }
    }, 'añadió la propiedad ' + (name || TYPE_NAME[type]), { seq: seqRef.n, drawer: 'propEdit', dProp: key, newPropName: '', newPropSearch: '', dTypeChange: false });
    if (ok) this.toastMsg('Columna creada. Configúrala aquí.');
  },
  renameProp(tid, key, name) {
    this.updTable(tid, function (t) {
      var p = propOf(t, key);
      if (!p) return false;
      var old = p.name;
      p.name = name;
      if (old && name && old !== name) {
        var esc = old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var re1 = new RegExp('prop\\(\\s*"' + esc + '"\\s*\\)', 'g'), re2 = new RegExp('(^|[^A-Za-z0-9_\'"])\\[' + esc + '\\]', 'g');
        t.props.forEach(function (x) { if (x.type === 'formula' && x.expr) x.expr = x.expr.replace(re1, 'prop("' + name + '")').replace(re2, '$1[' + name + ']'); });
      }
    });
  },
  setPropCfg(tid, key, patch, logText) { this.updTable(tid, function (t) { var p = propOf(t, key); if (!p) return false; for (var k in patch) { if (patch[k] === undefined) delete p[k]; else p[k] = patch[k]; } }, logText); },
  changeType(tid, key, nt) {
    var self = this;
    var s = this.st();
    var seqRef = { n: s.seq };
    this.updTable(tid, function (t, tables) {
      var p = propOf(t, key);
      if (!p || p.type === 'title') return false;
      var s2 = Object.assign({}, s, { tables: tables });
      var admin = s.members[0];
      var olds = t.rows.map(function (r) { return { r: r, text: dispText(self.dispOf(s2, t, p, r, admin, false)), raw: r[key] }; });
      if (p.type === 'relation' && p.pair) { var T2 = tables.byId[p.target]; if (T2) { T2.props = T2.props.filter(function (x) { return x.key !== p.pair; }); T2.rows.forEach(function (r) { delete r[p.pair]; }); } }
      var oldType = p.type;
      ['options', 'fmt', 'dec', 'sep', 'showAs', 'max', 'expr', 'resFmt', 'resDec', 'target', 'pair', 'single', 'rel', 'prop', 'fn', 'label', 'action', 'prefix', 'mode', 'src', 'lang', 'auto', 'dateFmt', 'checkStyle', 'urlShort', 'def'].forEach(function (k) { delete p[k]; });
      p.type = nt;
      self.propDefaults(p, t, tables, seqRef, null);
      if (nt === 'select' || nt === 'multi_select' || nt === 'status') {
        var seen = [];
        olds.forEach(function (x) { String(x.text || '').split(', ').forEach(function (w) { w = w.trim(); if (w && w !== 'No' && seen.indexOf(w) < 0 && seen.length < 12) seen.push(w); }); });
        if (seen.length) p.options = seen.map(function (w, i) { var op = { v: w, c: COLORS[(i + 1) % COLORS.length] }; if (nt === 'status') op.g = i === 0 ? 'todo' : (i === seen.length - 1 ? 'done' : 'doing'); return op; });
      }
      olds.forEach(function (x) {
        var r = x.r;
        if (['text', 'url', 'email', 'phone', 'place'].indexOf(nt) >= 0) r[key] = x.text === 'No' && oldType === 'checkbox' ? '' : x.text;
        else if (nt === 'number') { var n = parseFloat(String(x.text).replace(/[^0-9.\-]/g, '')); r[key] = isNaN(n) ? '' : n; }
        else if (nt === 'select' || nt === 'status') { var first = String(x.text || '').split(', ')[0]; r[key] = optOf(p, first) ? first : (nt === 'status' && p.options.length ? p.options[0].v : ''); }
        else if (nt === 'multi_select') r[key] = String(x.text || '').split(', ').filter(function (w) { return optOf(p, w); });
        else if (nt === 'checkbox') r[key] = oldType === 'checkbox' ? !!x.raw : (x.text !== '' && x.text !== 'No');
        else if (nt === 'date') r[key] = /^\d{4}-\d{2}-\d{2}/.test(String(x.raw)) ? String(x.raw).slice(0, 10) : '';
        else if (nt === 'person') r[key] = oldType === 'person' ? (x.raw || []) : [];
        else if (nt === 'files' || nt === 'relation') r[key] = [];
        else delete r[key];
      });
      if (nt === 'ai') t.rows.forEach(function (r) { r[key] = self.aiText(s2, t, p, r); });
    }, 'cambió el tipo de una columna a ' + TYPE_NAME[nt], { seq: seqRef.n, dTypeChange: false });
  },
  deleteProp(tid, key) {
    var s = this.st();
    var name = '';
    var ok = this.updTable(tid, function (t, tables) {
      var p = propOf(t, key);
      if (!p || p.type === 'title') return false;
      name = p.name;
      function cleanTable(tt, k) {
        tt.props = tt.props.filter(function (x) { return x.key !== k; });
        tt.rows.forEach(function (r) { delete r[k]; });
        tt.views.forEach(function (vw) {
          vw.hidden = vw.hidden.filter(function (x) { return x !== k; });
          vw.sorts = vw.sorts.filter(function (x) { return x.prop !== k; });
          vw.filters = vw.filters.filter(function (x) { return x.prop !== k; });
          vw.colors = vw.colors.filter(function (x) { return x.prop !== k; });
          if (vw.group === k) vw.group = null;
          if (vw.dateProp === k) vw.dateProp = null;
          if (vw.chartBy === k) vw.chartBy = null;
          if (String(vw.chartVal).split(':')[1] === k) vw.chartVal = 'count';
          if (vw.calcs) delete vw.calcs[k];
        });
        tt.automations = (tt.automations || []).filter(function (a) { return a.trigger.prop !== k && a.action.prop !== k && a.action.who !== 'prop:' + k; });
        tt.props.forEach(function (x) { if (x.type === 'button' && x.action && x.action.prop === k) x.action = null; });
      }
      if (p.type === 'relation' && p.pair && tables.byId[p.target]) cleanTable(tables.byId[p.target], p.pair);
      cleanTable(t, key);
    }, null, { drawer: 'props', dProp: null, confirmDel: null, selCell: null });
    if (ok) {
      var s2 = this.st();
      var ch = clone(s2.colHide);
      if (ch[tid]) delete ch[tid][key];
      this.setState({ colHide: ch, log: this.addLog(s, 'eliminó la columna ' + name) });
      this.toastMsg('Columna «' + name + '» eliminada');
    }
  },
  dupProp(tid, key) {
    var s = this.st();
    var nk = 'f' + (s.seq + 1);
    this.updTable(tid, function (t) {
      var p = propOf(t, key);
      if (!p || p.type === 'title' || p.type === 'relation') return false;
      var np = clone(p);
      np.key = nk; np.name = uniqueName(t, p.name + ' (copia)');
      t.props.splice(t.props.indexOf(p) + 1, 0, np);
      t.rows.forEach(function (r) { if (r[key] !== undefined) r[nk] = clone(r[key]); });
    }, 'duplicó una columna', { seq: s.seq + 1, dProp: nk });
  },
  moveProp(tid, key, dir) {
    this.updTable(tid, function (t) {
      var i = -1;
      t.props.forEach(function (p, j) { if (p.key === key) i = j; });
      var j = i + dir;
      if (i <= 0 || j <= 0 || j >= t.props.length) return false;
      var tmp = t.props[i]; t.props[i] = t.props[j]; t.props[j] = tmp;
    });
  },
  addOption(tid, key, text) {
    var v = String(text || '').trim();
    if (!v) return;
    this.updTable(tid, function (t) { var p = propOf(t, key); if (!p || optOf(p, v)) return false; var op = { v: v, c: COLORS[p.options.length % COLORS.length] }; if (p.type === 'status') op.g = 'todo'; p.options.push(op); }, null, { optDraft: '' });
  },
  renameOption(tid, key, i, text) {
    this.updTable(tid, function (t) {
      var p = propOf(t, key);
      if (!p || !p.options[i]) return false;
      var old = p.options[i].v;
      p.options[i].v = text;
      if (p.def === old) p.def = text;
      t.rows.forEach(function (r) { if (p.type === 'multi_select') r[key] = (r[key] || []).map(function (x) { return x === old ? text : x; }); else if (r[key] === old) r[key] = text; });
      t.views.forEach(function (vw) { vw.filters.concat(vw.colors).forEach(function (f) { if (f.prop === key && f.value === old) f.value = text; }); });
      (t.automations || []).forEach(function (a) { if (a.trigger.prop === key && a.trigger.value === old) a.trigger.value = text; if (a.action.prop === key && a.action.value === old) a.action.value = text; });
      t.props.forEach(function (x) { if (x.type === 'button' && x.action && x.action.prop === key && x.action.value === old) x.action.value = text; });
    });
  },
  cycleOptColor(tid, key, i) { this.updTable(tid, function (t) { var p = propOf(t, key); if (!p || !p.options[i]) return false; p.options[i].c = COLORS[(COLORS.indexOf(p.options[i].c) + 1) % COLORS.length]; }); },
  cycleOptGroup(tid, key, i) { this.updTable(tid, function (t) { var p = propOf(t, key); if (!p || !p.options[i]) return false; var ids = ['todo', 'doing', 'done']; p.options[i].g = ids[(ids.indexOf(p.options[i].g) + 1) % 3]; }); },
  moveOption(tid, key, i, dir) { this.updTable(tid, function (t) { var p = propOf(t, key); var j = i + dir; if (!p || !p.options[i] || !p.options[j]) return false; var tmp = p.options[i]; p.options[i] = p.options[j]; p.options[j] = tmp; }); },
  sortOptions(tid, key) { this.updTable(tid, function (t) { var p = propOf(t, key); if (!p) return false; p.options.sort(function (a, b) { return a.v.localeCompare(b.v, 'es'); }); }); this.toastMsg('Opciones ordenadas de la A a la Z'); },
  delOption(tid, key, i) {
    this.updTable(tid, function (t) {
      var p = propOf(t, key);
      if (!p || !p.options[i]) return false;
      var old = p.options[i].v;
      p.options.splice(i, 1);
      if (p.def === old) delete p.def;
      t.rows.forEach(function (r) { if (p.type === 'multi_select') r[key] = (r[key] || []).filter(function (x) { return x !== old; }); else if (r[key] === old) r[key] = p.type === 'status' && p.options.length ? p.options[0].v : ''; });
    });
  },

  /* ---------- vistas ---------- */
  pickView(where, tid, vid) {
    var s = this.st();
    if (where === 'scr') { var vs = clone(s.viewSel || {}); vs[tid] = vid; this.setState({ viewSel: vs, headMenu: null, addViewOpen: null, picker: null, selCell: null }); return; }
    var pages = clone(s.pages);
    var fb = this.findBlock(pages, where.slice(2));
    if (fb) fb.block.view = vid;
    this.setState({ pages: pages, headMenu: null, addViewOpen: null, picker: null, selCell: null });
  },
  addView(tid, where, layout) {
    var s = this.st();
    var v = this.viewer(s);
    var l = this.lvl(s, tid, v.role);
    if (l !== 'edit' && l !== 'full') { this.toastMsg('Con tu permiso no puedes crear vistas.'); return; }
    var tables = clone(s.tables);
    var t = tables.byId[tid];
    var id = 'v' + (s.seq + 1);
    var base = LAYOUT_NAME[layout], name = base, i = 2;
    while (t.views.some(function (x) { return x.name === name; })) { name = base + ' ' + i; i++; }
    var gp = t.props.filter(function (p) { return p.type === 'status'; })[0] || t.props.filter(function (p) { return p.type === 'select'; })[0];
    var dp = t.props.filter(function (p) { return p.type === 'date'; })[0];
    var cb = t.props.filter(function (p) { return isGroupable(p) && p.type !== 'relation'; })[0] || t.props.filter(isGroupable)[0];
    t.views.push(mkView(id, name, layout, { group: layout === 'board' && gp ? gp.key : null, dateProp: dp ? dp.key : null, chartBy: cb ? cb.key : null }));
    var patch = { tables: tables, seq: s.seq + 1, addViewOpen: null, log: this.addLog(s, 'creó la vista ' + name + ' en ' + t.name) };
    if (where === 'scr') { var vs = clone(s.viewSel || {}); vs[tid] = id; patch.viewSel = vs; }
    else { var pages = clone(s.pages); var fb = this.findBlock(pages, where.slice(2)); if (fb) fb.block.view = id; patch.pages = pages; }
    this.setState(patch);
  },
  delView(tid, vid, where) {
    var s = this.st();
    if (!this.canDo(s, tid, vid, 'view')) return;
    var tables = clone(s.tables);
    var t = tables.byId[tid];
    if (t.views.length < 2) { this.toastMsg('Una base de datos necesita al menos una vista.'); return; }
    var vw = this.viewOf(t, vid);
    t.views = t.views.filter(function (x) { return x.id !== vw.id; });
    var pages = clone(s.pages);
    pages.order.forEach(function (pid) { pages.byId[pid].blocks.forEach(function (b) { if (b.type === 'db' && b.table === tid && b.view === vw.id) b.view = t.views[0].id; }); });
    var vs = clone(s.viewSel || {});
    if (vs[tid] === vw.id) vs[tid] = t.views[0].id;
    this.setState({ tables: tables, pages: pages, viewSel: vs, drawer: null, log: this.addLog(s, 'eliminó la vista ' + vw.name) });
    this.toastMsg('Vista eliminada');
  },
  dupView(tid, vid, where) {
    var s = this.st();
    if (!this.canDo(s, tid, vid, 'view')) return;
    var tables = clone(s.tables);
    var t = tables.byId[tid];
    var vw = this.viewOf(t, vid);
    var nv = clone(vw);
    nv.id = 'v' + (s.seq + 1); nv.name = vw.name + ' (copia)'; nv.locked = false;
    t.views.splice(t.views.indexOf(vw) + 1, 0, nv);
    this.setState({ tables: tables, seq: s.seq + 1 });
    this.pickView(where || 'scr', tid, nv.id);
    this.toastMsg('Vista duplicada');
  },
  addRule(tid, vid, kind, key) {
    var s = this.st();
    var t = s.tables.byId[tid];
    var p = propOf(t, key);
    if (!p) return;
    var op = OPS[catOf(p.type)][0];
    this.updView(tid, vid, function (vw) { var r = { prop: key, op: op, value: '' }; if (kind === 'colors') r.color = 'red'; vw[kind].push(r); });
    this.setState({ dAdding: false });
  },

  /* ---------- automatizaciones ---------- */
  autoCreate(tid) {
    var s = this.st();
    var d = s.autoDraft;
    if (!d) return;
    var ok = this.updTable(tid, function (t) {
      if (!t.automations) t.automations = [];
      t.automations.push({ id: 'a' + (s.seq + 1), on: true, runs: 0, trigger: d.trig === 'created' ? { type: 'created' } : { type: 'changed', prop: d.tprop, value: d.tval }, action: d.act === 'notify' ? { type: 'notify', who: d.who } : { type: 'set', prop: d.aprop, value: d.aval } });
    }, 'creó una automatización', { seq: s.seq + 1, drawer: 'automations', autoDraft: null });
    if (ok) this.toastMsg('Automatización creada y activa');
  },

  /* ---------- bases de datos ---------- */
  newDb(pageId, opt) {
    var s = this.st();
    if (this.viewer(s).role !== 'admin') { this.toastMsg('Solo Administración puede crear bases de datos.'); return; }
    var tables = clone(s.tables);
    var access = clone(s.access);
    var seq = s.seq + 8;
    var id = 'x' + seq;
    var names = tables.order.map(function (i) { return tables.byId[i].name; });
    var name = 'Nueva tabla', k = 2;
    while (names.indexOf(name) >= 0) { name = 'Nueva tabla ' + k; k++; }
    var n = tables.order.length;
    tables.byId[id] = {
      id: id, name: name, desc: 'Escribe para qué sirve esta tabla', color: NEW_COLORS[n % NEW_COLORS.length], icon: DB_ICONS[(n * 7) % DB_ICONS.length], abbr: 'Nt', nextId: 1,
      props: [
        { key: 'k' + (seq - 5), name: 'Nombre', type: 'title' },
        { key: 'k' + (seq - 4), name: 'Estado', type: 'status', options: [so('Sin empezar', 'gray', 'todo'), so('En curso', 'blue', 'doing'), so('Listo', 'green', 'done')] },
        { key: 'k' + (seq - 3), name: 'Responsable', type: 'person' },
        { key: 'k' + (seq - 2), name: 'Fecha', type: 'date', dateFmt: 'long' },
        { key: 'k' + (seq - 1), name: 'Importe', type: 'number', fmt: 'money' },
        { key: 'k' + seq, name: 'Notas', type: 'text' }
      ],
      rows: [],
      views: [mkView('v' + seq + 'a', 'Tabla', 'table', { calcs: { ['k' + (seq - 1)]: 'sum' } }), mkView('v' + seq + 'b', 'Tablero', 'board', { group: 'k' + (seq - 4) })],
      automations: []
    };
    tables.order.push(id);
    access[id] = { admin: 'full', finanzas: 'none', ventas: 'none', almacen: 'none', invitado: 'none' };
    var patch = { tables: tables, access: access, seq: seq + 1, drawer: null, navOpen: false, addBlockOpen: false, log: this.addLog(s, 'creó la base de datos ' + name) };
    if (pageId) {
      var pages = clone(s.pages);
      placeBlock(pages.byId[pageId], blk('b' + (seq + 1), 'db', 12, { table: id, view: 'v' + seq + 'a' }), opt);
      patch.pages = pages;
    } else { patch.screen = 'db'; patch.table = id; patch.rec = null; patch.q = ''; }
    this.setState(patch);
    this.toastMsg(pageId ? 'Tabla creada en esta página. Usa «Relacionar» para vincularla con otra.' : 'Base de datos creada');
  },
  delTable(tid) {
    var s = this.st();
    if (this.viewer(s).role !== 'admin') return;
    if (s.confirmDel !== 'db:' + tid) { this.setState({ confirmDel: 'db:' + tid }); return; }
    var tables = clone(s.tables);
    var name = tables.byId[tid].name;
    delete tables.byId[tid];
    tables.order = tables.order.filter(function (x) { return x !== tid; });
    tables.order.forEach(function (id) {
      var tt = tables.byId[id];
      var gone = tt.props.filter(function (p) { return p.type === 'relation' && p.target === tid; }).map(function (p) { return p.key; });
      tt.props = tt.props.filter(function (p) { return gone.indexOf(p.key) < 0 && !(p.type === 'rollup' && gone.indexOf(p.rel) >= 0); });
    });
    var pages = clone(s.pages);
    pages.order.forEach(function (pid) { pages.byId[pid].blocks = pages.byId[pid].blocks.filter(function (b) { return b.table !== tid; }); });
    var access = clone(s.access);
    delete access[tid];
    this.setState({ tables: tables, pages: pages, access: access, table: tables.order[0], drawer: null, confirmDel: null, rec: null, xf: {}, log: this.addLog(s, 'eliminó la base de datos ' + name) });
    this.toastMsg('Base de datos «' + name + '» eliminada');
  },
  dupTable(tid) {
    var s = this.st();
    if (this.viewer(s).role !== 'admin') return;
    var tables = clone(s.tables);
    var src = tables.byId[tid];
    var id = 'x' + (s.seq + 1);
    var nt = clone(src);
    nt.id = id; nt.name = src.name + ' (copia)';
    nt.props.forEach(function (p) { if (p.type === 'relation') delete p.pair; });
    nt.rows.forEach(function (r) { nt.props.forEach(function (p) { if (p.type === 'relation') r[p.key] = []; }); r.id = id + '-' + r.id; });
    nt.views.forEach(function (vw, i) { vw.id = id + 'v' + i; });
    nt.automations = [];
    tables.byId[id] = nt;
    tables.order.push(id);
    var access = clone(s.access);
    access[id] = clone(access[tid] || {});
    this.setState({ tables: tables, access: access, seq: s.seq + 1, screen: 'db', table: id, drawer: null, rec: null, log: this.addLog(s, 'duplicó la base de datos ' + src.name) });
    this.toastMsg('Base de datos duplicada (sin vínculos)');
  },

  /* ---------- páginas y bloques ---------- */
  newPage(area) {
    var s = this.st();
    var pages = clone(s.pages);
    var id = 'pg' + (s.seq + 1);
    var n = pages.order.length;
    pages.byId[id] = { id: id, area: area || (s.pages.byId[s.page] && !s.pages.byId[s.page].mine ? s.pages.byId[s.page].area || null : null), cover: null, title: 'Nueva página', icon: DB_ICONS[(n * 5 + 3) % DB_ICONS.length], color: NEW_COLORS[(n + 3) % NEW_COLORS.length], desc: '', blocks: [blk('h' + (s.seq + 2), 'text', 12, { text: '' })] };
    pages.order.push(id);
    this.setState({ pages: pages, seq: s.seq + 3, screen: 'page', page: id, navOpen: false, addBlockOpen: false, log: this.addLog(s, 'creó una página') });
  },
  updPage(pid, fn) { var s = this.st(); var pages = clone(s.pages); var pg = pages.byId[pid]; if (!pg) return; if (fn(pg, pages) === false) return; this.setState({ pages: pages }); },
  updBlock(bid, fn) { var s = this.st(); var pages = clone(s.pages); var fb = this.findBlock(pages, bid); if (!fb) return; if (fn(fb.block, fb.page) === false) return; this.setState({ pages: pages }); },
  delPage(pid) {
    var s = this.st();
    if (s.confirmDel !== 'pg:' + pid) { this.setState({ confirmDel: 'pg:' + pid }); return; }
    var pages = clone(s.pages);
    if (pages.order.length < 2) { this.toastMsg('Debe quedar al menos una página.'); return; }
    var title = pages.byId[pid].title;
    delete pages.byId[pid];
    pages.order = pages.order.filter(function (x) { return x !== pid; });
    this.setState({ pages: pages, page: pages.order[0], confirmDel: null, drawer: null });
    this.toastMsg('Página «' + title + '» eliminada');
  },
  addBlock(pid, spec, extra) {
    var s = this.st();
    var pages = clone(s.pages);
    var pg = pages.byId[pid];
    var id = 'b' + (s.seq + 1);
    var tid = (extra && extra.table) || 'ped';
    if (!s.tables.byId[tid]) tid = s.tables.order[0];
    var t = s.tables.byId[tid];
    var firstGroup = t.props.filter(function (p) { return p.type === 'status' || p.type === 'select'; })[0] || t.props.filter(isChartGroupable)[1] || t.props[0];
    var firstDate = t.props.filter(function (p) { return p.type === 'date'; })[0];
    var firstNum = t.props.filter(function (p) { return p.type === 'number'; })[0];
    var b;
    var parts = String(spec).split(':');
    switch (parts[0]) {
      case 'heading': b = blk(id, 'heading', 12, { text: 'Nueva sección' }); break;
      case 'text': b = blk(id, 'text', 12, { text: '' }); break;
      case 'divider': b = blk(id, 'divider', 12, {}); break;
      case 'db': b = blk(id, 'db', 12, { table: tid, view: t.views[0].id }); break;
      case 'chart': {
        var kind = parts[1] || 'column';
        var by = kind === 'line' && firstDate ? firstDate.key : firstGroup.key;
        b = blk(id, 'chart', kind === 'line' ? 12 : 6, { title: 'Nuevo gráfico', table: tid, kind: kind, by: by, bucket: 'day', val: firstNum ? 'sum:' + firstNum.key : 'count', sort: kind === 'line' ? 'label' : 'desc', limit: 0, filters: [] });
        break;
      }
      case 'kpi': b = blk(id, 'kpi', 3, { title: 'Nuevo indicador', table: tid, val: firstNum ? 'sum:' + firstNum.key : 'count', filters: [] }); break;
      case 'slicer': b = blk(id, 'slicer', 6, { title: 'Segmentación', table: tid, prop: firstGroup.key }); break;
      case 'sheet': b = blk(id, 'sheet', 12, { title: 'Hoja de cálculo', cells: { A1: 'Concepto', B1: 'Valor', A2: 'Total', B2: '=SUMA(' + t.name + '[' + (firstNum ? firstNum.name : this.titleProp(t).name) + '])' } }); break;
      case 'map': b = blk(id, 'map', 12, { title: 'Mapa de relaciones' }); break;
      case 'todo': b = blk(id, 'todo', 4, { title: 'Pendientes', items: [{ id: 'q' + id, text: '', done: false }] }); break;
      case 'callout': b = blk(id, 'callout', 12, { icon: 'info', text: '' }); break;
      case 'pm': b = blk(id, 'pm', 12, { title: 'Salud de los proyectos', scope: 'all' }); break;
      case 'cols': this.slashPick(pid, spec, extra); return;
      default: return;
    }
    placeBlock(pg, b, extra);
    var patch = { pages: pages, seq: s.seq + 1, addBlockOpen: false, addCtx: null };
    if (b.type === 'chart' || b.type === 'kpi' || b.type === 'slicer') { patch.drawer = 'block'; patch.dCtx = { pid: pid, bid: id }; patch.dAdding = false; }
    this.setState(patch);
  },
  moveBlock(bid, dir) {
    this.updBlock(bid, function (b, pg) { var i = pg.blocks.indexOf(b), j = i + dir; if (j < 0 || j >= pg.blocks.length) return false; pg.blocks[i] = pg.blocks[j]; pg.blocks[j] = b; });
  },
  delBlock(bid) {
    var s = this.st();
    if (s.confirmDel !== 'blk:' + bid) { this.setState({ confirmDel: 'blk:' + bid }); this.toastMsg('Pulsa otra vez la papelera para quitar el bloque.'); return; }
    this.updBlock(bid, function (b, pg) { pg.blocks = pg.blocks.filter(function (x) { return x.id !== bid; }); });
    this.setState({ confirmDel: null, drawer: null });
  },
  cycleWidth(bid) { this.updBlock(bid, function (b) { var ids = WIDTHS.map(function (w) { return w.id; }); b.w = ids[(ids.indexOf(b.w) + 1) % ids.length]; }); },
  setXf(pid, xf) {
    var s = this.st();
    var cur = (s.xf || {})[pid];
    var nx = clone(s.xf || {});
    if (cur && xf && cur.table === xf.table && cur.prop === xf.prop && String(cur.key) === String(xf.key)) delete nx[pid];
    else if (xf) nx[pid] = xf; else delete nx[pid];
    this.setState({ xf: nx });
  },
  setCell(bid, ref, raw) { this.updBlock(bid, function (b) { if (!b.cells) b.cells = {}; if (raw === '' || raw == null) delete b.cells[ref]; else b.cells[ref] = raw; }); },

  /* ---------- permisos ---------- */
  cycleAccess(tid, role) {
    if (role === 'admin') return;
    var s = this.st();
    var access = clone(s.access);
    if (!access[tid]) access[tid] = {};
    var nx = LEVELS[(LEVELS.indexOf(access[tid][role] || 'none') + 1) % LEVELS.length];
    access[tid][role] = nx;
    this.setState({ access: access, log: this.addLog(s, 'cambió el acceso de ' + ROLE_NAME[role] + ' a ' + s.tables.byId[tid].name + ': ' + LEVEL_NAME[nx]) });
  },
  toggleColHide(tid, key, role) {
    var s = this.st();
    var ch = clone(s.colHide);
    if (!ch[tid]) ch[tid] = {};
    var arr = (ch[tid][key] || []).slice(), i = arr.indexOf(role), p = propOf(s.tables.byId[tid], key);
    if (i >= 0) arr.splice(i, 1); else arr.push(role);
    ch[tid][key] = arr;
    this.setState({ colHide: ch, log: this.addLog(s, (i >= 0 ? 'mostró ' : 'ocultó ') + 'la columna ' + (p ? p.name : '') + ' a ' + ROLE_NAME[role] + ' en ' + s.tables.byId[tid].name) });
  },
  toggleRule(id) {
    var s = this.st();
    var rules = clone(s.rowRules), txt = '';
    rules.forEach(function (r) { if (r.id === id) { r.on = !r.on; txt = (r.on ? 'activó' : 'desactivó') + ' la regla «' + r.text + '»'; } });
    this.setState({ rowRules: rules, log: this.addLog(s, txt) });
  },
  setRole(mid, role) {
    var s = this.st();
    var members = clone(s.members), name = '';
    members.forEach(function (m) { if (m.id === mid) { m.role = role; name = m.name; } });
    this.setState({ members: members, log: this.addLog(s, 'cambió el rol de ' + name + ' a ' + ROLE_NAME[role]) });
  },
  invite() {
    var s = this.st();
    var em = String(s.inviteEmail || '').trim();
    if (em.indexOf('@') < 1 || em.indexOf('.') < 0) { this.setState({ inviteErr: 'Escribe un correo válido para enviar la invitación.' }); return; }
    var members = s.members.concat([{ id: 'm' + (s.seq + 1), name: em, role: s.inviteRole, team: 'Invitación enviada', last: 'Pendiente', color: '#64748B', pending: true }]);
    this.setState({ members: members, seq: s.seq + 1, inviteEmail: '', inviteErr: '', log: this.addLog(s, 'invitó a ' + em + ' como ' + ROLE_NAME[s.inviteRole]) });
  },
  toggleSec(key, label) { var s = this.st(); var sec = clone(s.security); sec[key] = !sec[key]; this.setState({ security: sec, log: this.addLog(s, (sec[key] ? 'activó' : 'desactivó') + ' «' + label + '»') }); },
  addComment(tid, rid) {
    var s = this.st();
    var txt = String(s.draft || '').trim();
    if (!txt) return;
    var comments = clone(s.comments);
    var list = comments[rid] || [];
    list.push({ who: s.viewAs, text: txt, when: 'Ahora' });
    comments[rid] = list;
    var t = s.tables.byId[tid], row = findRow(t, rid);
    this.setState({ comments: comments, draft: '', log: this.addLog(s, 'comentó en ' + (row ? this.titleOf(t, row) : t.name)) });
  },
  requestAccess(tid) {
    var s = this.st();
    var req = clone(s.reqSent);
    req[tid] = true;
    var notifs = [{ id: 'nr' + (s.seq + 1), to: 'role:admin', text: this.viewer(s).name + ' pidió acceso a ' + s.tables.byId[tid].name, when: 'Ahora', table: tid, row: null, read: false }].concat(s.notifs);
    this.setState({ reqSent: req, notifs: notifs, seq: s.seq + 1, log: this.addLog(s, 'solicitó acceso a ' + s.tables.byId[tid].name) });
  },
  inboxFor(s, v) { return s.notifs.filter(function (n) { return v.role === 'admin' || n.to === v.id || n.to === 'role:' + v.role; }); },
  openNotif(id) {
    var s = this.st();
    var notifs = clone(s.notifs), n = null;
    notifs.forEach(function (x) { if (x.id === id) { x.read = true; n = x; } });
    this.setState({ notifs: notifs });
    if (n && n.page && s.pages.byId[n.page]) { this.goPage(n.page); return; }
    if (n && n.table && s.tables.byId[n.table]) this.go(n.table, n.row && findRow(s.tables.byId[n.table], n.row) ? n.row : null);
  },
  markAllRead() {
    var s = this.st();
    var mine = this.inboxFor(s, this.viewer(s)).map(function (n) { return n.id; });
    var notifs = clone(s.notifs);
    notifs.forEach(function (n) { if (mine.indexOf(n.id) >= 0) n.read = true; });
    this.setState({ notifs: notifs });
  },

  /* ---------- asistente IA ---------- */
  aiRun(textArg) {
    var s = this.st();
    var text = String(textArg != null ? textArg : (s.aiText || '')).trim();
    if (!text) return;
    var l = text.toLowerCase();
    var isQ = /[?¿]/.test(l) || /^(cu[aá]nt|qu[eé] |qui[eé]n|cu[aá]l|d[oó]nde)/.test(l);
    var p = { aiText: text };
    if (isQ) { p.aiAns = /repon|stock|agot|falta/.test(l) ? 'reponer' : /vendedor|vend[ií]|vende/.test(l) ? 'vendedores' : /pendient/.test(l) ? 'pendientes' : /client|compr/.test(l) ? 'topCliente' : 'pendientes'; p.aiProp = null; }
    else { p.aiProp = /proyect|tarea|hora|obra/.test(l) ? 'proyectos' : /candidat|reclut|vacant|rrhh|recursos humanos|personal|emplead|contrat|selecci/.test(l) ? 'rrhh' : 'inventario'; p.aiAns = null; }
    this.setState(p);
  },
  aiCreate() {
    var s = this.st();
    var key = s.aiProp;
    var tpl = AI_TEMPLATES[key];
    if (!tpl || s.aiCreated[key]) return;
    var tables = clone(s.tables), access = clone(s.access), colHide = clone(s.colHide);
    var seq = s.seq, ids = {};
    tpl.tables.forEach(function (tt) { seq++; ids[tt.ref] = 'x' + seq; });
    tpl.tables.forEach(function (tt) {
      var id = ids[tt.ref], props = [], statusKey = null, firstSelect = null, dateKey = null, moneyKey = null;
      tt.fields.forEach(function (f) {
        seq++;
        var type = f[1] === 'money' ? 'number' : f[1];
        var p = { key: 'k' + seq, name: f[0], type: type };
        if (f[1] === 'money') { p.fmt = 'money'; moneyKey = moneyKey || p.key; }
        if (f[1] === 'number') p.fmt = 'number';
        if (type === 'date') { p.dateFmt = 'long'; dateKey = dateKey || p.key; }
        if (type === 'select') { p.options = (f[2] || []).map(function (x, j) { return o(x, COLORS[(j + 1) % COLORS.length]); }); firstSelect = firstSelect || p.key; }
        if (type === 'status') { var n = (f[2] || []).length; p.options = (f[2] || []).map(function (x, j) { return so(x, ['gray', 'blue', 'green'][Math.min(j, 2)], j === 0 ? 'todo' : (j === n - 1 ? 'done' : 'doing')); }); statusKey = statusKey || p.key; }
        if (type === 'relation') { p.target = String(f[2]).charAt(0) === '@' ? ids[String(f[2]).slice(1)] : f[2]; p.single = !/s$/.test(f[0]); }
        props.push(p);
      });
      var views = [mkView(id + 'v1', 'Tabla', 'table', moneyKey ? { calcs: { [moneyKey]: 'sum' } } : {})];
      if (statusKey || firstSelect) views.push(mkView(id + 'v2', 'Tablero', 'board', { group: statusKey || firstSelect }));
      if (dateKey) views.push(mkView(id + 'v3', 'Calendario', 'calendar', { dateProp: dateKey }));
      views.push(mkView(id + 'v4', 'Formulario', 'form'));
      tables.byId[id] = { id: id, name: tt.ref, desc: tt.desc, color: tt.color, icon: tt.icon, abbr: abbrOf(tt.ref), nextId: 1, props: props, rows: [], views: views, automations: [] };
      tables.order.push(id);
      var acc = { admin: 'full', finanzas: 'view', ventas: 'view', almacen: 'view', invitado: 'none' };
      var over = (tpl.access || {})[tt.ref] || {};
      for (var r in over) acc[r] = over[r];
      access[id] = acc;
      var hide = (tpl.colHide || {})[tt.ref];
      if (hide) { colHide[id] = {}; props.forEach(function (p) { if (hide[p.name]) colHide[id][p.key] = hide[p.name].slice(); }); }
    });
    tpl.tables.forEach(function (tt) {
      var t = tables.byId[ids[tt.ref]];
      t.props.forEach(function (p) {
        var T2 = p.type === 'relation' ? tables.byId[p.target] : null;
        if (!T2 || p.pair) return;
        seq++;
        var pk = 'b' + seq;
        p.pair = pk;
        T2.props.push({ key: pk, name: uniqueName(T2, t.name), type: 'relation', target: t.id, pair: p.key, single: false });
        T2.rows.forEach(function (r) { r[pk] = []; });
      });
    });
    var created = clone(s.aiCreated);
    created[key] = true;
    this.setState({ tables: tables, access: access, colHide: colHide, seq: seq, aiCreated: created, log: this.addLog(s, 'creó ' + tpl.tables.length + ' bases de datos con el Asistente IA (' + tpl.title + ')'), screen: 'db', table: ids[tpl.tables[0].ref], rec: null, q: '' });
    this.toastMsg('Creadas: ' + tpl.tables.map(function (x) { return x.ref; }).join(', ') + '. Míralas en el Mapa de relaciones.');
  },
  answerView(s, key, v) {
    var self = this;
    var first = v.name.split(' ')[0];
    var out = { q: '', text: '', items: [], hasItems: false, hasGo: false, goName: '', go: null, scope: '' };
    var ped = s.tables.byId.ped, pro = s.tables.byId.pro, cli = s.tables.byId.cli;
    var pedOk = !!ped && this.lvl(s, 'ped', v.role) !== 'none';
    var proOk = !!pro && this.lvl(s, 'pro', v.role) !== 'none';
    function cliName(id) { var row = findRow(cli, id); if (!row) return 'Sin cliente'; if (self.lvl(s, 'cli', v.role) === 'none') return 'Cliente restringido'; return row.nombre; }
    if (key === 'reponer') {
      out.q = '¿Qué productos hay que reponer?';
      if (!proOk) out.text = first + ' no tiene acceso a Productos, así que no puedo responder con esos datos.';
      else {
        var low = this.rowsFor(s, 'pro', v).filter(function (r) { return r.stock !== '' && r.stock != null && Number(r.stock) < 20; }).sort(function (a, b) { return Number(a.stock) - Number(b.stock); });
        out.text = low.length ? 'Hay ' + low.length + ' productos con menos de 20 unidades. Te sugiero generar una compra a sus proveedores.' : 'Ningún producto está por debajo de 20 unidades.';
        out.items = low.map(function (r) { return { label: r.nombre, value: fmtNum(r.stock) + ' uds' }; });
        out.hasGo = true; out.goName = 'Productos'; out.go = function () { self.go('pro', null); };
      }
    } else {
      var rows = pedOk ? this.rowsFor(s, 'ped', v) : [];
      if (!pedOk) out.text = first + ' no tiene acceso a Pedidos, así que no puedo calcularlo.';
      if (key === 'topCliente') {
        out.q = '¿Qué cliente ha comprado más?';
        var sums = {}, counts = {};
        rows.forEach(function (r) { var c = (r.cliente || [])[0] || '-'; sums[c] = (sums[c] || 0) + (Number(r.total) || 0); counts[c] = (counts[c] || 0) + 1; });
        var ranked = Object.keys(sums).sort(function (a, b) { return sums[b] - sums[a]; });
        if (pedOk) out.text = ranked.length ? cliName(ranked[0]) + ' es el cliente con más compras: ' + fmtNumber(sums[ranked[0]], 'money') + ' en ' + counts[ranked[0]] + (counts[ranked[0]] === 1 ? ' pedido.' : ' pedidos.') : 'No hay pedidos visibles para calcularlo.';
        out.items = ranked.slice(0, 4).map(function (id) { return { label: cliName(id), value: fmtNumber(sums[id], 'money') }; });
      } else if (key === 'vendedores') {
        out.q = '¿Cuánto ha vendido cada vendedor?';
        var by = {}, n = {};
        rows.forEach(function (r) { (r.vendedor || []).forEach(function (id) { by[id] = (by[id] || 0) + (Number(r.total) || 0); n[id] = (n[id] || 0) + 1; }); });
        var sellers = Object.keys(by).sort(function (a, b) { return by[b] - by[a]; });
        if (pedOk) out.text = sellers.length ? 'Ventas totales por vendedor en los pedidos registrados.' : 'No hay pedidos visibles para calcularlo.';
        out.items = sellers.map(function (id) { var m = self.memberById(s, id); return { label: (m ? m.name : id) + ' · ' + n[id] + (n[id] === 1 ? ' pedido' : ' pedidos'), value: fmtNumber(by[id], 'money') }; });
      } else {
        out.q = '¿Cuántos pedidos están pendientes?';
        var pend = rows.filter(function (r) { return r.estado === 'Pendiente'; });
        var tot = pend.reduce(function (a, r) { return a + (Number(r.total) || 0); }, 0);
        if (pedOk) out.text = pend.length ? 'Hay ' + pend.length + (pend.length === 1 ? ' pedido pendiente' : ' pedidos pendientes') + ' por ' + fmtNumber(tot, 'money') + '.' : 'No hay pedidos pendientes.';
        out.items = pend.map(function (r) { return { label: r.concepto + ' · ' + cliName((r.cliente || [])[0]), value: fmtNumber(r.total, 'money') }; });
      }
      if (pedOk) { out.hasGo = true; out.goName = 'Pedidos'; out.go = function () { self.go('ped', null); }; }
      if (pedOk && v.role !== 'admin') out.scope = 'Calculado solo con lo que ' + first + ' puede ver: ' + rows.length + ' de ' + ped.rows.length + ' pedidos.';
    }
    if (!out.scope) out.scope = v.role === 'admin' ? 'Calculado con todos los datos del espacio.' : 'Calculado solo con lo que ' + first + ' puede ver.';
    out.hasItems = out.items.length > 0;
    return out;
  }
});
