/* ================= formularios avanzados, app móvil, plantillas de registro y listas vinculadas ================= */
function seedPD() {
  var R = function (id, n, nm, proy, fecha, who, turno, clima, avance, gente, act, inc, tinc, grav, dinc, gps, fotos, est) {
    return mkRow(id, n, { titulo: nm, proyecto: proy ? [proy] : [], fecha: fecha, resp: [who], turno: turno, clima: clima, avance: avance, personal: gente, horas: gente * 8, actividades: act, incidente: inc, tipoinc: tinc, gravedad: grav, detalleinc: dinc, ubicacion: gps, fotos: fotos, estado: est, origen: 'App móvil' }, fecha + 'T18:10', who);
  };
  return {
    id: 'pd', name: 'Partes diarios', desc: 'Reportes de obra enviados desde el celular: avance, personal, clima, incidentes, fotos y ubicación', color: '#0E7490', icon: 'i-clipcheck', abbr: 'Pd', nextId: 4,
    props: [
      { key: 'titulo', name: 'Parte', type: 'title' },
      { key: 'proyecto', name: 'Proyecto', type: 'relation', target: 'proy', pair: 'partes', single: true },
      { key: 'fecha', name: 'Fecha', type: 'date', def: '__today', dateFmt: 'short' },
      { key: 'resp', name: 'Responsable', type: 'person', single: true },
      { key: 'turno', name: 'Turno', type: 'select', options: [o('Mañana', 'amber'), o('Tarde', 'blue'), o('Noche', 'violet')] },
      { key: 'clima', name: 'Clima', type: 'select', options: [o('Soleado', 'amber'), o('Nublado', 'gray'), o('Lluvia', 'blue'), o('Viento fuerte', 'teal')] },
      { key: 'avance', name: 'Avance del día', type: 'number', fmt: 'percent', desc: 'Avance físico logrado en el turno' },
      { key: 'personal', name: 'Personal en obra', type: 'number' },
      { key: 'horas', name: 'Horas hombre', type: 'number' },
      { key: 'actividades', name: 'Actividades realizadas', type: 'text' },
      { key: 'incidente', name: '¿Hubo incidente?', type: 'checkbox' },
      { key: 'tipoinc', name: 'Tipo de incidente', type: 'select', options: [o('Accidente', 'red'), o('Casi accidente', 'amber'), o('Daño material', 'violet'), o('Ambiental', 'green')] },
      { key: 'gravedad', name: 'Gravedad', type: 'select', options: [o('Leve', 'green'), o('Moderada', 'amber'), o('Grave', 'red')] },
      { key: 'detalleinc', name: 'Descripción del incidente', type: 'text' },
      { key: 'ubicacion', name: 'Ubicación GPS', type: 'text', desc: 'Se captura al enviar desde el celular' },
      { key: 'fotos', name: 'Fotos', type: 'files' },
      { key: 'estado', name: 'Revisión', type: 'status', options: [so('Enviado', 'blue', 'todo'), so('Observado', 'amber', 'doing'), so('Revisado', 'green', 'done')] },
      { key: 'origen', name: 'Origen', type: 'select', options: [o('App móvil', 'teal'), o('Escritorio', 'gray')] }
    ],
    rows: [
      R('d1', 1, 'Parte · Ampliación del almacén central · 16/11', 'y1', '2026-11-16', 'jorge', 'Mañana', 'Nublado', 2, 14, 'Vaciado de zapatas eje C; armado de acero eje D', false, '', '', '', '-12.04712, -77.03055 (±9 m)', ['zapatas-eje-c.jpg'], 'Revisado'),
      R('d2', 2, 'Parte · Ampliación del almacén central · 17/11', 'y1', '2026-11-17', 'jorge', 'Mañana', 'Soleado', 3, 16, 'Encofrado de columnas; llegada de 2 camiones de estructura', true, 'Casi accidente', 'Leve', 'Carga suspendida pasó sobre zona de tránsito. Se señalizó el área y se reforzó la charla de 5 minutos.', '-12.04698, -77.03071 (±12 m)', ['columnas.jpg', 'senalizacion.jpg'], 'Observado'),
      R('d3', 3, 'Parte · Implementación del ERP · 17/11', 'y2', '2026-11-17', 'marta', 'Tarde', 'Soleado', 5, 4, 'Talleres de levantamiento con almacén y compras', false, '', '', '', '-12.09431, -77.02218 (±20 m)', ['taller.jpg'], 'Enviado')
    ],
    views: [
      mkView('vd1', 'Partes', 'table', { hidden: ['actividades', 'detalleinc', 'tipoinc', 'origen', 'horas', 'ubicacion'] }),
      mkView('vd2', 'Por revisar', 'board', { group: 'estado' }),
      mkView('vd3', 'Incidentes', 'table', { filters: [{ prop: 'incidente', op: 'is', value: true }], hidden: ['actividades', 'avance', 'personal', 'horas', 'clima', 'turno', 'origen'] })
    ],
    automations: []
  };
}

function seedForms(tb) {
  var F = function (key, req, help, show, label) { return { id: 'i-' + key, kind: 'field', key: key, req: !!req, help: help || '', show: show || null, label: label || '' }; };
  var SEC = function (id, title) { return { id: id, kind: 'section', title: title }; };
  var inc = { key: 'incidente', value: true };
  tb.byId.pd.forms = [{
    id: 'fm1', name: 'Parte diario de obra', desc: 'Llénalo al cerrar cada turno. Funciona sin señal: se envía solo al recuperar conexión.', pub: true,
    auto: { gps: 'ubicacion', photo: 'fotos', user: 'resp', date: 'fecha' }, prefix: 'Parte',
    submitMsg: '¡Gracias! Tu parte quedó registrado y ya lo ve tu jefe de proyecto.',
    items: [
      SEC('s-1', 'Datos generales'),
      F('proyecto', true, 'Elige la obra donde trabajaste hoy'),
      F('turno', true), F('clima'),
      SEC('s-2', 'Avance y personal'),
      F('avance', true, 'Porcentaje físico logrado hoy, no el acumulado', null, 'Avance del día (%)'),
      F('personal', true, 'Cuenta también a los subcontratistas'),
      F('actividades', false, 'Qué se hizo, en qué frente y qué quedó pendiente'),
      SEC('s-3', 'Seguridad'),
      F('incidente', false, 'Incluye casi accidentes: ayudan a prevenir'),
      F('tipoinc', true, '', inc), F('gravedad', true, '', inc),
      F('detalleinc', true, 'Qué pasó, a quién y qué medidas se tomaron', inc)
    ]
  }];
  tb.byId.sol.forms = [{
    id: 'fm2', name: 'Solicitud de compra o gasto', desc: 'Va a tu jefe directo y luego a administración. Te avisamos cuando cambie de estado.', pub: true,
    auto: { gps: null, photo: null, user: 'solicitante', date: 'fecha' }, prefix: '',
    submitMsg: 'Solicitud enviada. Tu jefe directo ya la tiene en «Por aprobar».',
    items: [
      F('titulo', true, 'Ejemplo: 20 cascos de seguridad para la obra', null, '¿Qué necesitas?'),
      F('tipo', true),
      F('monto', true, 'Monto aproximado en soles', { key: 'tipo', value: ['Compra', 'Gasto', 'Contratación'] }),
      F('proyecto', false, 'Si es para un proyecto, elígelo: así suma a su trazabilidad')
    ]
  }];
  tb.byId.rie.forms = [{
    id: 'fm3', name: 'Reportar un riesgo', desc: 'Cualquier persona puede alertar un riesgo; el director del proyecto lo evalúa.', pub: false,
    auto: { gps: null, photo: null, user: 'responsable', date: null }, prefix: '',
    submitMsg: 'Riesgo reportado. El director del proyecto lo revisará.',
    items: [F('nombre', true, 'Causa → evento → efecto', null, '¿Qué podría pasar?'), F('proyecto', true), F('prob'), F('impacto')]
  }];
  tb.byId.tar.templates = [
    { id: 'tp1', name: 'Inspección de seguridad', vals: { nombre: 'Inspección de seguridad semanal', estado: 'Sin empezar', horas: 4, entregable: 'Checklist de seguridad firmado', criterio: 'Sin observaciones abiertas' } },
    { id: 'tp2', name: 'Entregable con aprobación', vals: { nombre: 'Nuevo entregable', estado: 'Sin empezar', horas: 8, entregable: 'Documento del entregable', criterio: 'Aprobado por el patrocinador' } }
  ];
  tb.byId.sol.templates = [
    { id: 'tp3', name: 'Compra de materiales', vals: { titulo: 'Compra de materiales', tipo: 'Compra' } },
    { id: 'tp4', name: 'Vacaciones', vals: { titulo: 'Vacaciones', tipo: 'Vacaciones' } }
  ];
  tb.byId.pd.templates = [
    { id: 'tp5', name: 'Parte sin novedades', vals: { titulo: 'Parte sin novedades', turno: 'Mañana', clima: 'Soleado', incidente: false, actividades: 'Trabajos según programa, sin novedades' } }
  ];
}

var FM_COND_TYPES = { select: 1, status: 1, checkbox: 1, multi_select: 1 };
function fmFieldOk(p) { return !!p && !COMPUTED[p.type] && ['button', 'ai', 'id'].indexOf(p.type) < 0; }
function fmCondMatch(cur, want) {
  var w = Array.isArray(want) ? want : [want];
  if (typeof w[0] === 'boolean') return !!cur === w[0];
  if (Array.isArray(cur)) return cur.some(function (x) { return w.indexOf(x) >= 0; });
  return w.indexOf(cur) >= 0;
}
/* campos visibles según secciones y condiciones */
function fmVisible(form, vals) {
  var byKey = {};
  form.items.forEach(function (it) { if (it.kind === 'field') byKey[it.key] = it; });
  function vis(it, depth) {
    if (depth > 6) return true;
    if (!it.show || !it.show.key) return true;
    var ctrl = byKey[it.show.key];
    if (ctrl && ctrl !== it && !vis(ctrl, depth + 1)) return false;
    return fmCondMatch(vals[it.show.key], it.show.value);
  }
  var out = [], secOn = true;
  form.items.forEach(function (it) {
    if (it.kind === 'section') { secOn = vis(it, 0); return; }
    if (secOn && vis(it, 0)) out.push(it);
  });
  return out;
}
function fmCondText(t, it) {
  if (!it.show || !it.show.key) return '';
  var p = propOf(t, it.show.key);
  var w = Array.isArray(it.show.value) ? it.show.value : [it.show.value];
  var vt = typeof w[0] === 'boolean' ? (w[0] ? 'está marcado' : 'no está marcado') : 'es ' + (w.length > 1 ? w.slice(0, -1).join(', ') + ' o ' + w[w.length - 1] : w[0]);
  return 'Se muestra si «' + (p ? p.name : it.show.key) + '» ' + vt;
}
function fmDdMm() { var d = new Date(); return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2); }
function fmHhMm() { var d = new Date(); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
function fmGpsSim() { var la = -12.0464 + (Math.random() - 0.5) * 0.02, lo = -77.0428 + (Math.random() - 0.5) * 0.02; return la.toFixed(5) + ', ' + lo.toFixed(5) + ' (±' + (6 + Math.round(Math.random() * 14)) + ' m · simulada)'; }
function fmRid() { return Math.random().toString(36).slice(2, 10); }

Object.assign(Component.prototype, {
  /* ---------- formularios: datos ---------- */
  fmAll(s) {
    var out = [];
    s.tables.order.forEach(function (tid) { var t = s.tables.byId[tid]; (t.forms || []).forEach(function (f) { out.push({ t: t, f: f }); }); });
    return out;
  },
  fmFind(s, fid) { return this.fmAll(s).filter(function (x) { return x.f.id === fid; })[0] || null; },
  fmCanEdit(s, tid, v) { return this.lvl(s, tid, v.role) === 'full'; },
  fmCanFill(s, tid, v) { var l = this.lvl(s, tid, v.role); return l === 'edit' || l === 'full'; },
  fmUpd(fid, fn) {
    var s = this.st(), v = this.viewer(s);
    var hit = this.fmFind(s, fid);
    if (!hit) return;
    if (!this.fmCanEdit(s, hit.t.id, v)) { this.toastMsg('Solo quien administra ' + hit.t.name + ' puede editar sus formularios.'); return; }
    var tables = clone(s.tables);
    var f = (tables.byId[hit.t.id].forms || []).filter(function (x) { return x.id === fid; })[0];
    fn(f, tables.byId[hit.t.id]);
    this.setState({ tables: tables });
  },
  fmItemUpd(fid, iid, fn) { this.fmUpd(fid, function (f) { var it = f.items.filter(function (x) { return x.id === iid; })[0]; if (it) fn(it, f); }); },
  fmNew(tid) {
    var s = this.st(), v = this.viewer(s);
    if (!this.fmCanEdit(s, tid, v)) { this.toastMsg('Necesitas acceso total a la tabla para crear formularios.'); return; }
    var tables = clone(s.tables), t = tables.byId[tid];
    var fid = 'fm' + fmRid();
    var items = [];
    t.props.forEach(function (p) { if (fmFieldOk(p) && items.length < 4 && p.type !== 'files') items.push({ id: 'i-' + p.key, kind: 'field', key: p.key, req: p.type === 'title', help: '', show: null, label: '' }); });
    var person = t.props.filter(function (p) { return p.type === 'person'; })[0];
    var date = t.props.filter(function (p) { return p.type === 'date'; })[0];
    t.forms = (t.forms || []).concat([{ id: fid, name: 'Formulario de ' + t.name.toLowerCase(), desc: '', pub: false, auto: { gps: null, photo: null, user: person ? person.key : null, date: date ? date.key : null }, prefix: '', submitMsg: '¡Gracias! Tu respuesta quedó registrada.', items: items }]);
    this.setState({ tables: tables, fmSel: fid, fmNewOpen: false, screen: 'forms' });
  },
  fmDelete(fid) {
    var s = this.st(), v = this.viewer(s), hit = this.fmFind(s, fid);
    if (!hit || !this.fmCanEdit(s, hit.t.id, v)) return;
    var tables = clone(s.tables), t = tables.byId[hit.t.id];
    t.forms = t.forms.filter(function (x) { return x.id !== fid; });
    this.setState({ tables: tables, fmSel: null });
    this.toastMsg('Formulario eliminado. Los registros que creó se mantienen en ' + t.name + '.');
  },
  fmMove(fid, from, to) {
    if (from === to || from == null || to == null) return;
    this.fmUpd(fid, function (f) { if (to < 0 || to >= f.items.length) return; var it = f.items.splice(from, 1)[0]; f.items.splice(to, 0, it); });
  },
  goForms(tid) {
    var s = this.st(), first = null;
    if (tid) { var t = s.tables.byId[tid]; first = t && (t.forms || [])[0] ? t.forms[0].id : null; if (!first) { this.fmNew(tid); return; } }
    this.setScreen('forms', first ? { fmSel: first } : null);
  },

  /* ---------- borrador y llenado ---------- */
  fmKey(fid, mode) { return (mode === 'prev' ? 'p:' : 'm:') + fid; },
  fmDraftOf(s, t, form, mode) {
    var d = (s.fmDraft || {})[this.fmKey(form.id, mode)] || {};
    var vals = { id: '__fm' };
    t.props.forEach(function (p) {
      if (['relation', 'person', 'multi_select', 'files'].indexOf(p.type) >= 0) vals[p.key] = [];
      else if (p.type === 'checkbox') vals[p.key] = p.def === true;
      else if (p.type === 'status') vals[p.key] = p.options.length ? p.options[0].v : '';
      else vals[p.key] = p.def != null && p.def !== '__today' ? p.def : '';
    });
    for (var k in (d.vals || {})) vals[k] = d.vals[k];
    return { vals: vals, gps: d.gps || '', tried: !!d.tried, gpsBusy: !!d.gpsBusy };
  },
  fmSetDraft(dk, patch) {
    var s = this.st();
    var all = Object.assign({}, s.fmDraft || {});
    var d = Object.assign({ vals: {} }, all[dk] || {});
    if (patch.vals) d.vals = Object.assign({}, d.vals, patch.vals);
    for (var k in patch) if (k !== 'vals') d[k] = patch[k];
    all[dk] = d;
    this.setState({ fmDraft: all });
  },
  fmSetVal(dk, key, val) { var o2 = {}; o2[key] = val; this.fmSetDraft(dk, { vals: o2 }); },
  fmMissing(s, t, form, dr) {
    var A = form.auto || {}, miss = [];
    fmVisible(form, dr.vals).forEach(function (it) {
      var p = propOf(t, it.key);
      if (!p || it.key === A.photo || it.key === A.gps) return;
      if (!it.req) return;
      var val = dr.vals[it.key];
      if (p.type === 'checkbox' ? !val : isEmptyVal(typeof val === 'string' ? val.trim() : val)) miss.push(it.key);
    });
    if (A.photo && propOf(t, A.photo) && isEmptyVal(dr.vals[A.photo])) miss.push(A.photo);
    return miss;
  },
  fmValues(s, v, t, form, dr) {
    var A = form.auto || {}, vals = {};
    fmVisible(form, dr.vals).forEach(function (it) { if (propOf(t, it.key)) vals[it.key] = clone(dr.vals[it.key]); });
    if (A.user && propOf(t, A.user)) vals[A.user] = [v.id];
    if (A.date && propOf(t, A.date)) vals[A.date] = todayIso();
    if (A.gps && propOf(t, A.gps)) vals[A.gps] = dr.gps || fmGpsSim();
    if (A.photo && propOf(t, A.photo)) vals[A.photo] = (dr.vals[A.photo] || []).slice();
    if (propOf(t, 'origen')) vals.origen = 'App móvil';
    var tp = t.props.filter(function (p) { return p.type === 'title'; })[0];
    if (tp && isEmptyVal(vals[tp.key])) {
      var parts = [form.prefix || form.name];
      var rel = t.props.filter(function (p) { return p.type === 'relation' && p.single && (vals[p.key] || []).length; })[0];
      if (rel) { var T2 = s.tables.byId[rel.target], r2 = T2 ? findRow(T2, vals[rel.key][0]) : null; if (r2) parts.push(this.titleOf(T2, r2)); }
      parts.push(fmDdMm());
      vals[tp.key] = parts.join(' · ');
    }
    return vals;
  },
  fmGps(dk) {
    var self = this, done = false;
    function fin(txt) { if (done) return; done = true; self.fmSetDraft(dk, { gps: txt, gpsBusy: false }); }
    this.fmSetDraft(dk, { gpsBusy: true });
    setTimeout(function () { fin(fmGpsSim()); }, 6500);
    try {
      if (!navigator.geolocation) { fin(fmGpsSim()); return; }
      navigator.geolocation.getCurrentPosition(function (pos) {
        var c = pos.coords; fin(c.latitude.toFixed(5) + ', ' + c.longitude.toFixed(5) + ' (±' + Math.round(c.accuracy || 0) + ' m)');
      }, function () { fin(fmGpsSim()); }, { timeout: 6000, maximumAge: 60000 });
    } catch (e) { fin(fmGpsSim()); }
  },
  fmPhoto(fid, mode, key, e) {
    var names = [];
    this._thumbs = this._thumbs || {};
    try {
      var fl = e.target.files;
      for (var i = 0; i < fl.length; i++) { names.push(fl[i].name); try { this._thumbs[fl[i].name] = URL.createObjectURL(fl[i]); } catch (e2) { } }
      e.target.value = '';
    } catch (err) { names = []; }
    if (!names.length) return;
    var s = this.st(), hit = this.fmFind(s, fid);
    if (!hit) return;
    var cur = this.fmDraftOf(s, hit.t, hit.f, mode).vals[key] || [];
    this.fmSetVal(this.fmKey(fid, mode), key, cur.concat(names));
  },
  fmSubmit(fid, mode) {
    var s = this.st(), v = this.viewer(s), hit = this.fmFind(s, fid);
    if (!hit) return;
    var t = hit.t, form = hit.f, dr = this.fmDraftOf(s, t, form, mode), dk = this.fmKey(fid, mode);
    if (mode !== 'prev' && !this.fmCanFill(s, t.id, v)) { this.toastMsg('Con tu permiso no puedes enviar este formulario.'); return; }
    var miss = this.fmMissing(s, t, form, dr);
    if (miss.length) { this.fmSetDraft(dk, { tried: true }); this.toastMsg('Completa ' + miss.length + (miss.length === 1 ? ' campo obligatorio' : ' campos obligatorios') + ' antes de enviar'); return; }
    var vals = this.fmValues(s, v, t, form, dr);
    var drafts = Object.assign({}, s.fmDraft || {}); delete drafts[dk];
    if (mode === 'prev') { this.setState({ fmDraft: drafts, fmPrevDone: fid }); return; }
    var mob = Object.assign({}, s.mob || {});
    mob.form = null;
    if (mob.offline) {
      var tp = t.props.filter(function (p) { return p.type === 'title'; })[0];
      var q = (s.mobQueue || []).concat([{ id: 'q' + fmRid(), fid: fid, tid: t.id, vals: vals, title: tp ? vals[tp.key] : form.name, at: fmHhMm() }]);
      mob.done = { fid: fid, queued: true };
      this.setState({ mobQueue: q, mob: mob, fmDraft: drafts });
      return;
    }
    var rid = this.fmCreate(t.id, fid, vals);
    mob.done = { fid: fid, rid: rid, tid: t.id };
    this.setState({ mob: mob, fmDraft: drafts });
  },
  /* crea el registro y deja huella: origen, formulario y avisos */
  fmCreate(tid, fid, vals) {
    var rid = this.newRow(tid, vals, true);
    if (!rid) return null;
    var s = this.st(), v = this.viewer(s);
    var tables = clone(s.tables), t = tables.byId[tid], row = findRow(t, rid);
    if (!row) return rid;
    row._form = fid;
    var notifs = s.notifs.slice();
    if (tid === 'pd' && row.incidente) {
      var P = tables.byId.proy, pr = P ? findRow(P, (row.proyecto || [])[0]) : null;
      var to = [];
      if (pr) (pr.director || []).forEach(function (x) { if (to.indexOf(x) < 0) to.push(x); });
      var adm = this.appAdmin ? this.appAdmin(s) : 'ana';
      if (adm && to.indexOf(adm) < 0) to.push(adm);
      var txt = (row.gravedad === 'Grave' ? 'URGENTE · ' : '') + 'Incidente ' + (row.gravedad || '').toLowerCase() + ' en ' + (pr ? this.titleOf(P, pr) : 'obra') + ': ' + (row.tipoinc || 'sin tipo') + ' (reportó ' + v.name.split(' ')[0] + ')';
      to.forEach(function (x) { if (x !== v.id) notifs.unshift({ id: 'nt' + fmRid(), to: x, text: txt, when: 'Ahora', table: 'pd', row: rid, read: false }); });
    }
    this.setState({ tables: tables, notifs: notifs });
    return rid;
  },

  /* ---------- app móvil ---------- */
  mobSet(patch) { var s = this.st(); this.setState({ mob: Object.assign({}, s.mob || {}, patch) }); },
  mobNet() {
    var s = this.st(), off = !(s.mob || {}).offline;
    this.mobSet({ offline: off });
    if (!off && (s.mobQueue || []).length) this.mobSync();
  },
  mobSync() {
    var self = this, s = this.st();
    if ((s.mob || {}).offline) { this.toastMsg('Sigues sin señal: los registros esperan en el celular.'); return; }
    var q = (s.mobQueue || []).slice();
    if (!q.length) { this.toastMsg('No hay nada pendiente de enviar.'); return; }
    this.setState({ mobQueue: [] });
    var n = 0;
    q.forEach(function (it) { if (self.fmCreate(it.tid, it.fid, it.vals)) n++; });
    this.toastMsg('Señal recuperada: ' + (n === 1 ? 'se envió 1 registro guardado' : 'se enviaron ' + n + ' registros guardados') + ' en el celular.');
  },
  mobTaskDone(rid) {
    var s = this.st(), t = s.tables.byId.tar, row = findRow(t, rid);
    if (!row) return;
    var p = propOf(t, 'estado');
    var done = p.options.filter(function (x) { return x.g === 'done'; })[0];
    if (done) this.setField('tar', rid, 'estado', done.v, 'marcó «' + row.nombre + '» como ' + done.v.toLowerCase() + ' desde el celular');
    this.toastMsg('Tarea marcada como ' + (done ? done.v.toLowerCase() : 'hecha'));
  },

  fillView(s, v, t, form, mode) {
    var self = this, fid = form.id, A = form.auto || {}, dk = this.fmKey(fid, mode);
    var dr = this.fmDraftOf(s, t, form, mode);
    var canFill = mode === 'prev' || this.fmCanFill(s, t.id, v);
    var miss = dr.tried ? this.fmMissing(s, t, form, dr) : [];
    var ctx = {
      pickKey: 'fm:' + dk + ':',
      set: function (key, val) { self.fmSetVal(dk, key, val); },
      toggleRel: function (key, id, single) { var cur = (self.fmDraftOf(self.st(), t, form, mode).vals[key] || []).slice(); var i = cur.indexOf(id); if (i >= 0) cur.splice(i, 1); else cur = single ? [id] : cur.concat([id]); self.fmSetVal(dk, key, cur); if (single) self.setState({ picker: null }); },
      runButton: function () { }, aiGen: function () { }
    };
    var vis = fmVisible(form, dr.vals), visKeys = vis.map(function (x) { return x.key; });
    var sections = [], cur = { hasTitle: false, title: '', fields: [] }, secOn = true;
    form.items.forEach(function (it) {
      if (it.kind === 'section') {
        if (cur.fields.length || cur.hasTitle) sections.push(cur);
        secOn = !it.show || fmCondMatch(dr.vals[it.show.key], it.show.value);
        cur = { hasTitle: !!it.title && secOn, title: it.title || '', fields: [] };
        return;
      }
      if (visKeys.indexOf(it.key) < 0 || it.key === A.photo || it.key === A.gps) return;
      var p = propOf(t, it.key);
      if (!fmFieldOk(p)) return;
      var f = self.fieldView(s, t, p, dr.vals, v, canFill, ctx);
      var req = !!it.req;
      f.label = (it.label || p.name) + (req ? ' *' : '');
      f.desc = it.help || p.desc || '';
      if (it.help) { f.hasNote = true; f.note = it.help; }
      else if (p.type === 'files' || p.type === 'relation') { f.hasNote = false; f.note = ''; }
      if (miss.indexOf(it.key) >= 0) { f.rowCls = 'f-err'; f.hasNote = true; f.note = 'Este campo es obligatorio'; }
      if (it.show && it.show.key) f.rowCls = (f.rowCls || '') + ' f-cond';
      cur.fields.push(f);
    });
    if (cur.fields.length || cur.hasTitle) sections.push(cur);
    sections = sections.filter(function (x) { return x.fields.length; });
    var autos = [];
    if (A.user && propOf(t, A.user)) autos.push({ icon: ICON.user, text: propOf(t, A.user).name + ': ' + v.name.split(' ')[0] });
    if (A.date && propOf(t, A.date)) autos.push({ icon: ICON.date, text: 'Fecha: hoy ' + fmDdMm() });
    var photos = (A.photo && propOf(t, A.photo)) ? (dr.vals[A.photo] || []) : [];
    var th = this._thumbs || {};
    var off = mode === 'mob' && !!(s.mob || {}).offline;
    return {
      title: form.name, desc: form.desc || '', hasDesc: !!form.desc,
      hasAutos: autos.length > 0, autos: autos, sections: sections,
      hasPhoto: !!(A.photo && propOf(t, A.photo)), photoTitle: (propOf(t, A.photo || '') || { name: 'Fotos' }).name + ' *',
      photos: photos.map(function (n, i) { return { name: n, src: th[n] || '', hasSrc: !!th[n], noSrc: !th[n], aria: 'Quitar ' + n, remove: function () { self.fmSetVal(dk, A.photo, photos.filter(function (x, j) { return j !== i; })); } }; }),
      photoCls: miss.indexOf(A.photo) >= 0 ? 'f-err' : '', photoErr: miss.indexOf(A.photo) >= 0,
      addPhoto: function (e) { self.fmPhoto(fid, mode, A.photo, e); },
      hasGps: !!(A.gps && propOf(t, A.gps)), gpsBusy: dr.gpsBusy, gpsText: dr.gpsBusy ? 'Buscando señal GPS…' : (dr.gps || 'Se captura al enviar'),
      gpsBtn: dr.gps ? 'Actualizar' : 'Capturar ahora', captureGps: function () { self.fmGps(dk); },
      hasErr: miss.length > 0, errText: 'Faltan ' + miss.length + (miss.length === 1 ? ' dato obligatorio' : ' datos obligatorios') + ': revisa los campos marcados.',
      submit: function () { self.fmSubmit(fid, mode); },
      submitLabel: mode === 'prev' ? 'Probar envío' : off ? 'Guardar sin señal' : 'Enviar', submitIcon: off ? ICON.wifioff : ICON.send,
      hasNoEdit: !canFill, noEditText: 'Tu rol no puede crear registros en ' + t.name + '.'
    };
  },

  mobData(s, v) {
    var self = this, mob = s.mob || {}, tab = mob.tab || 'inicio';
    var q = s.mobQueue || [];
    var forms = this.fmAll(s).filter(function (x) { return x.f.pub && self.fmCanFill(s, x.t.id, v); });
    var unread = s.notifs.filter(function (n) { return n.to === v.id && !n.read; }).length;
    var fillHit = mob.form ? this.fmFind(s, mob.form) : null;
    var doneHit = mob.done ? this.fmFind(s, mob.done.fid) : null;
    var mode = fillHit ? 'fill' : doneHit ? 'done' : tab;
    var first = v.name.split(' ')[0];
    var out = {
      offline: !!mob.offline, online: !mob.offline, netIcon: mob.offline ? ICON.wifioff : ICON.wifi, netTxt: mob.offline ? 'Sin señal' : '4G',
      queueTxt: q.length ? q.length + (q.length === 1 ? ' registro espera' : ' registros esperan') + ' para enviarse' : 'lo que registres se guardará aquí',
      meIni: initialsOf(v.name), meColor: v.color, meName: v.name, first: first,
      title: fillHit ? fillHit.t.name : { inicio: 'Trama', registrar: 'Registrar', registros: 'Mis registros', avisos: 'Avisos' }[tab] || 'Trama',
      hasBack: !!fillHit, back: function () { self.mobSet({ form: null }); },
      isHome: mode === 'inicio', isReg: mode === 'registrar', isMine: mode === 'registros', isInbox: mode === 'avisos', isFill: mode === 'fill', isDone: mode === 'done',
      tabs: [{ id: 'inicio', n: 'Inicio', ic: ICON.home }, { id: 'registrar', n: 'Registrar', ic: ICON.plus }, { id: 'registros', n: 'Mis registros', ic: ICON.list }, { id: 'avisos', n: 'Avisos', ic: ICON.bell }].map(function (x) {
        return { n: x.n, icon: x.ic, cls: tab === x.id && !fillHit && !doneHit ? 'on' : '', badge: x.id === 'avisos' && unread ? String(unread) : x.id === 'registros' && q.length ? String(q.length) : '', hasBadge: (x.id === 'avisos' && unread > 0) || (x.id === 'registros' && q.length > 0), go: function () { self.mobSet({ tab: x.id, form: null, done: null }); } };
      }),
      fill: fillHit ? this.fillView(s, v, fillHit.t, fillHit.f, 'mob') : null,
      queue: q.map(function (it) { return { title: it.title, at: it.at }; }), hasQueue: q.length > 0, queueCount: String(q.length),
      sync: function () { self.mobSync(); }, toggleNet: function () { self.mobNet(); },
      netOpts: [{ id: false, n: 'Con señal' }, { id: true, n: 'Sin señal' }].map(function (x) { return { n: x.n, cls: !!mob.offline === x.id ? 'on' : '', pick: function () { if (!!self.st().mob && !!self.st().mob.offline === x.id) return; self.mobNet(); } }; }),
      people: s.members.filter(function (m) { return !m.pending; }).map(function (m) { return { first: m.name.split(' ')[0], initials: initialsOf(m.name), color: m.color, cls: m.id === v.id ? 'on' : '', pick: function () { self.previewAs(m.id); } }; }),
      formsCount: String(forms.length), goForms: function () { self.goForms(null); }
    };
    /* inicio */
    if (mode === 'inicio') {
      var T = s.tables.byId.tar, est = propOf(T, 'estado');
      var tasks = this.rowsFor(s, 'tar', v).filter(function (r) { var op = optOf(est, r.estado); return (r.responsable || []).indexOf(v.id) >= 0 && !(op && op.g === 'done'); });
      tasks.sort(function (a, b) { return String(a.fin || '9999').localeCompare(String(b.fin || '9999')); });
      var P = s.tables.byId.proy;
      out.tasks = tasks.slice(0, 6).map(function (r) {
        var op = optOf(est, r.estado), pr = P ? findRow(P, (r.proyecto || [])[0]) : null;
        var late = r.fin && r.fin < todayIso();
        return { title: r.nombre, sub: (pr ? self.titleOf(P, pr) : 'Sin proyecto') + (r.fin ? (late ? ' · atrasada, venció ' : ' · vence ') + String(fmtDate(r.fin, 'relative')).toLowerCase() : ''), late: !!late, cls: late ? 'late' : '', pill: r.estado, pillCls: op ? 'p-' + op.c : 'p-gray', done: function () { self.mobTaskDone(r.id); }, doneAria: 'Marcar «' + r.nombre + '» como hecha', open: function () { self.openRec('tar', r.id); } };
      });
      out.hasTasks = out.tasks.length > 0; out.noTasks = !out.hasTasks; out.taskCount = String(tasks.length);
      var S = s.tables.byId.sol;
      var apr = this.lvl(s, 'sol', v.role) === 'none' ? [] : S.rows.filter(function (r) { return (r.aprobador || []).indexOf(v.id) >= 0 && /^Pendiente/.test(r.estado || ''); });
      out.approvals = apr.map(function (r) {
        var who = self.memberById(s, (r.solicitante || [])[0]);
        return { title: r.titulo, sub: (who ? who.name.split(' ')[0] + ' · ' : '') + (r.monto ? fmtNumber(r.monto, 'money', 0) : r.tipo || ''), step: r.estado === 'Pendiente jefe' ? 'Como jefe directo' : 'Como administración', ok: function () { self.solAct(r.id, true); }, no: function () { self.solAct(r.id, false); }, open: function () { self.openRec('sol', r.id); } };
      });
      out.hasApprovals = out.approvals.length > 0;
      out.quick = forms.slice(0, 4).map(function (x) { return { name: x.f.name, icon: ICON[x.t.icon] || ICON.form, color: x.t.color, go: function () { self.mobSet({ form: x.f.id, done: null }); } }; });
      out.hasQuick = out.quick.length > 0;
      out.hello = 'Hola, ' + first;
      out.today = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    if (mode === 'registrar') {
      out.forms = forms.map(function (x) { return { name: x.f.name, desc: x.f.desc || x.t.name, icon: ICON[x.t.icon] || ICON.form, color: x.t.color, tname: x.t.name, go: function () { self.mobSet({ form: x.f.id, done: null }); } }; });
      out.hasForms = out.forms.length > 0; out.noForms = !out.hasForms;
    }
    if (mode === 'registros') {
      var mine = [];
      s.tables.order.forEach(function (tid) {
        var t = s.tables.byId[tid];
        if (!(t.forms || []).length || self.lvl(s, tid, v.role) === 'none') return;
        t.rows.forEach(function (r) { if (r._cBy === v.id) mine.push({ t: t, r: r }); });
      });
      mine.sort(function (a, b) { return String(b.r._cAt).localeCompare(String(a.r._cAt)); });
      out.mine = mine.slice(0, 12).map(function (x) {
        var st = x.t.props.filter(function (p) { return p.type === 'status'; })[0], op = st ? optOf(st, x.r[st.key]) : null;
        return { title: self.titleOf(x.t, x.r), sub: x.t.name + ' · ' + fmtDate(String(x.r._cAt).slice(0, 10), 'relative'), icon: ICON[x.t.icon] || ICON.db, color: x.t.color, hasPill: !!op, pill: op ? op.v : '', pillCls: op ? 'p-' + op.c : '', open: function () { self.openRec(x.t.id, x.r.id); } };
      });
      out.hasMine = out.mine.length > 0; out.noMine = !out.hasMine && !q.length;
    }
    if (mode === 'avisos') {
      out.notifs = s.notifs.filter(function (n) { return n.to === v.id; }).slice(0, 12).map(function (n) { return { text: n.text, when: n.when, cls: n.read ? '' : 'unread', open: function () { self.openNotif(n.id); } }; });
      out.hasNotifs = out.notifs.length > 0; out.noNotifs = !out.hasNotifs;
    }
    if (mode === 'done') {
      var d = mob.done;
      out.doneTitle = d.queued ? 'Guardado en el celular' : 'Enviado';
      out.doneMsg = d.queued ? 'No hay señal. Se enviará solo cuando vuelvas a tener conexión; también puedes enviarlo desde «Mis registros».' : (doneHit.f.submitMsg || '¡Gracias!');
      out.doneIcon = d.queued ? ICON.wifioff : ICON.check; out.doneCls = d.queued ? 'queued' : '';
      out.hasDoneRec = !!d.rid;
      out.openDone = function () { if (d.rid) self.openRec(d.tid, d.rid); };
      out.again = function () { self.mobSet({ form: d.fid, done: null }); };
      out.home = function () { self.mobSet({ tab: 'inicio', done: null, form: null }); };
    }
    return out;
  },

  /* ---------- constructor de formularios ---------- */
  fbData(s, v) {
    var self = this;
    var all = this.fmAll(s);
    var firstPub = all.filter(function (x) { return x.f.pub && self.lvl(s, x.t.id, v.role) !== 'none'; })[0] || all.filter(function (x) { return self.lvl(s, x.t.id, v.role) !== 'none'; })[0];
    var sel = s.fmSel && this.fmFind(s, s.fmSel) ? s.fmSel : (firstPub ? firstPub.f.id : null);
    var groups = [];
    s.tables.order.forEach(function (tid) {
      var t = s.tables.byId[tid];
      if (!(t.forms || []).length || self.lvl(s, tid, v.role) === 'none') return;
      groups.push({ tname: t.name, ticon: ICON[t.icon] || ICON.db, tcolor: t.color, forms: t.forms.map(function (f) {
        var n = t.rows.filter(function (r) { return r._form === f.id; }).length;
        return { name: f.name, cls: f.id === sel ? 'on' : '', pubCls: f.pub ? 'p-green' : 'p-gray', pubTxt: f.pub ? 'En la app' : 'Borrador', count: n ? n + (n === 1 ? ' respuesta' : ' respuestas') : 'Sin respuestas', pick: function () { self.setState({ fmSel: f.id, fmPrevDone: null, fmAddOpen: false }); } };
      }) });
    });
    var out = {
      groups: groups, newOpen: !!s.fmNewOpen, toggleNew: function () { self.setState({ fmNewOpen: !s.fmNewOpen }); },
      newTables: s.tables.order.filter(function (tid) { return self.fmCanEdit(s, tid, v); }).map(function (tid) { var t = s.tables.byId[tid]; return { name: t.name, icon: ICON[t.icon] || ICON.db, color: t.color, pick: function () { self.fmNew(tid); } }; }),
      has: false, none: true, goMob: function () { self.setScreen('movil'); }
    };
    var hit = sel ? this.fmFind(s, sel) : null;
    if (!hit || this.lvl(s, hit.t.id, v.role) === 'none') return out;
    var t = hit.t, form = hit.f, fid = form.id, canEdit = this.fmCanEdit(s, t.id, v), A = form.auto || {};
    out.has = true; out.none = false;
    var used = form.items.filter(function (x) { return x.kind === 'field'; }).map(function (x) { return x.key; });
    var autoKeys = [A.gps, A.photo, A.user, A.date].filter(function (x) { return x; });
    var drag = s.fmDrag;
    var items = form.items.map(function (it, i) {
      var p = it.kind === 'field' ? propOf(t, it.key) : null;
      var o2 = {
        isSec: it.kind === 'section', isField: it.kind === 'field' && !!p, cls: (it.kind === 'section' ? 'is-sec' : '') + (drag && drag.over === i && drag.from !== i ? ' drop-' + (drag.from < i ? 'after' : 'before') : '') + (drag && drag.from === i ? ' dragging' : ''),
        title: it.title || '', setTitle: function (e) { var val = e.target.value; self.fmItemUpd(fid, it.id, function (x) { x.title = val; }); },
        canUp: i > 0, canDown: i < form.items.length - 1, noUp: i === 0, noDown: i === form.items.length - 1,
        up: function () { self.fmMove(fid, i, i - 1); }, down: function () { self.fmMove(fid, i, i + 1); },
        del: function () { self.fmUpd(fid, function (f) { f.items = f.items.filter(function (x) { return x.id !== it.id; }); f.items.forEach(function (x) { if (x.show && x.show.key === it.key && it.kind === 'field') x.show = null; }); }); },
        delAria: 'Quitar ' + (p ? p.name : 'sección'),
        dragStart: function (e) { try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); } catch (err) { } self.setState({ fmDrag: { from: i, over: null } }); },
        dragOver: function (e) { try { e.preventDefault(); } catch (err) { } var d = self.st().fmDrag; if (d && d.over !== i) self.setState({ fmDrag: { from: d.from, over: i } }); },
        drop: function (e) { try { e.preventDefault(); } catch (err) { } var d = self.st().fmDrag; self.setState({ fmDrag: null }); if (d) self.fmMove(fid, d.from, i); },
        dragEnd: function () { self.setState({ fmDrag: null }); }
      };
      if (!p) return o2;
      var isTitle = p.type === 'title';
      o2.propName = p.name; o2.typeName = TYPE_NAME[p.type] || p.type; o2.icon = ICON[p.type] || ICON.text;
      o2.q = it.label || ''; o2.setQ = function (e) { var val = e.target.value; self.fmItemUpd(fid, it.id, function (x) { x.label = val; }); };
      o2.help = it.help || ''; o2.setHelp = function (e) { var val = e.target.value; self.fmItemUpd(fid, it.id, function (x) { x.help = val; }); };
      o2.req = !!it.req; o2.reqCls = o2.req ? 'on' : ''; o2.reqLocked = false;
      o2.toggleReq = function () { self.fmItemUpd(fid, it.id, function (x) { x.req = !x.req; }); };
      if (isTitle && !it.req) { o2.autoTitle = true; }
      o2.isAuto = autoKeys.indexOf(it.key) >= 0; o2.autoTxt = 'Se completa solo al enviar (ver «Automático»)';
      var ctrls = form.items.filter(function (x, j) { if (x.kind !== 'field' || x.key === it.key || j > i) return false; var cp = propOf(t, x.key); return cp && FM_COND_TYPES[cp.type]; });
      o2.hasCond = !!(it.show && it.show.key); o2.noCond = !o2.hasCond; o2.condNone = ctrls.length === 0;
      o2.condHint = ctrls.length ? 'Mostrar solo si…' : 'Sin campos previos de opciones para condicionar';
      o2.addCond = function () { if (!ctrls.length) return; var cp = propOf(t, ctrls[0].key); self.fmItemUpd(fid, it.id, function (x) { x.show = { key: cp.key, value: cp.type === 'checkbox' ? true : (cp.options[0] || { v: '' }).v }; }); };
      o2.clearCond = function () { self.fmItemUpd(fid, it.id, function (x) { x.show = null; }); };
      o2.condTxt = fmCondText(t, it);
      if (o2.hasCond) {
        var cp = propOf(t, it.show.key);
        o2.condKey = it.show.key;
        o2.condKeys = ctrls.map(function (x) { var pp = propOf(t, x.key); return { v: pp.key, label: x.label || pp.name }; });
        if (!ctrls.some(function (x) { return x.key === it.show.key; }) && cp) o2.condKeys.unshift({ v: cp.key, label: cp.name });
        var w = Array.isArray(it.show.value) ? it.show.value : [it.show.value];
        o2.condVal = String(w[0]);
        o2.condVals = !cp ? [] : cp.type === 'checkbox' ? [{ v: 'true', label: 'Marcado' }, { v: 'false', label: 'Sin marcar' }] : cp.options.map(function (x) { return { v: x.v, label: x.v }; });
        o2.multi = w.length > 1;
        o2.setCondKey = function (e) { var k = e.target.value, np = propOf(t, k); if (!np) return; self.fmItemUpd(fid, it.id, function (x) { x.show = { key: k, value: np.type === 'checkbox' ? true : (np.options[0] || { v: '' }).v }; }); };
        o2.setCondVal = function (e) { var val = e.target.value; self.fmItemUpd(fid, it.id, function (x) { var np = propOf(t, x.show.key); x.show = { key: x.show.key, value: np && np.type === 'checkbox' ? val === 'true' : val }; }); };
      } else { o2.condKeys = []; o2.condVals = []; o2.condKey = ''; o2.condVal = ''; o2.multi = false; o2.setCondKey = null; o2.setCondVal = null; }
      return o2;
    });
    var addable = t.props.filter(function (p) { return fmFieldOk(p) && used.indexOf(p.key) < 0 && autoKeys.indexOf(p.key) < 0; });
    function autoRow(kind, label, types, prefer) {
      var cands = t.props.filter(function (p) { return types.indexOf(p.type) >= 0; });
      var pick = cands.filter(function (p) { return prefer && prefer.test(p.key + ' ' + p.name); })[0] || cands[0];
      var on = !!A[kind] && !!propOf(t, A[kind]);
      return {
        label: label, on: on, cls: on ? 'on' : '', disabled: !pick,
        note: on ? '→ ' + propOf(t, A[kind]).name : pick ? 'Se guardará en «' + pick.name + '»' : 'La tabla no tiene una columna de tipo ' + types.map(function (x) { return (TYPE_NAME[x] || x).toLowerCase(); }).join(' o '),
        toggle: function () { if (!pick) return; self.fmUpd(fid, function (f) { f.auto = Object.assign({}, f.auto || {}); f.auto[kind] = on ? null : pick.key; if (!on) f.items = f.items.filter(function (x) { return !(x.kind === 'field' && x.key === pick.key); }); }); }
      };
    }
    var roles = ROLES.filter(function (r) { var l = self.lvl(s, t.id, r.id); return l === 'edit' || l === 'full'; }).map(function (r) { return r.name; });
    var resp = t.rows.filter(function (r) { return r._form === fid; }).length;
    out.fm = {
      fid: fid, name: form.name, setName: function (e) { var val = e.target.value; self.fmUpd(fid, function (f) { f.name = val; }); },
      desc: form.desc || '', setDesc: function (e) { var val = e.target.value; self.fmUpd(fid, function (f) { f.desc = val; }); },
      tname: t.name, ticon: ICON[t.icon] || ICON.db, tcolor: t.color, openTable: function () { self.go(t.id, null); },
      pub: !!form.pub, pubCls: form.pub ? 'on' : '', pubTxt: form.pub ? 'Publicado en la app móvil' : 'Borrador: no aparece en la app',
      togglePub: function () { self.fmUpd(fid, function (f) { f.pub = !f.pub; }); },
      canEdit: canEdit, readOnly: !canEdit, roText: 'Solo lectura: necesitas acceso total a ' + t.name + ' para editar este formulario.',
      del: function () { self.fmDelete(fid); },
      test: function () { if (!form.pub) self.fmUpd(fid, function (f) { f.pub = true; }); self.setScreen('movil', { mob: Object.assign({}, s.mob || {}, { form: fid, done: null }) }); },
      items: items, noItems: items.length === 0,
      addOpen: !!s.fmAddOpen, toggleAdd: function () { self.setState({ fmAddOpen: !s.fmAddOpen }); },
      addable: addable.map(function (p) { return { name: p.name, icon: ICON[p.type] || ICON.text, type: TYPE_NAME[p.type] || '', pick: function () { self.setState({ fmAddOpen: false }); self.fmUpd(fid, function (f) { f.items.push({ id: 'i-' + p.key, kind: 'field', key: p.key, req: p.type === 'title', help: '', show: null, label: '' }); }); } }; }),
      hasAddable: addable.length > 0, noAddable: addable.length === 0,
      addSection: function () { self.fmUpd(fid, function (f) { f.items.push({ id: 's-' + fmRid(), kind: 'section', title: 'Nueva sección' }); }); },
      autos: [autoRow('gps', 'Capturar ubicación GPS', ['text', 'place'], /ubic|gps/i), autoRow('photo', 'Exigir foto (cámara del celular)', ['files'], /foto/i), autoRow('user', 'Responsable = quien llena', ['person'], null), autoRow('date', 'Fecha = día del envío', ['date'], /fecha/i)],
      submitMsg: form.submitMsg || '', setSubmitMsg: function (e) { var val = e.target.value; self.fmUpd(fid, function (f) { f.submitMsg = val; }); },
      who: roles.length ? 'Lo pueden llenar: ' + roles.join(', ') + ' (según los permisos de ' + t.name + ').' : 'Ningún rol puede crear registros en ' + t.name + '.',
      stats: resp + (resp === 1 ? ' respuesta' : ' respuestas') + ' · ' + form.items.filter(function (x) { return x.kind === 'field'; }).length + ' preguntas · ' + form.items.filter(function (x) { return x.show && x.show.key; }).length + ' condicionales'
    };
    out.prevDone = s.fmPrevDone === fid; out.prevFill = !out.prevDone;
    out.prev = out.prevFill ? this.fillView(s, v, t, form, 'prev') : null;
    out.prevMsg = form.submitMsg || '¡Gracias!';
    out.prevAgain = function () { self.setState({ fmPrevDone: null }); };
    return out;
  },

  /* ---------- plantillas de registro ---------- */
  tplNew(tid, tplId, preset) {
    var s = this.st(), t = s.tables.byId[tid];
    var tp = (t.templates || []).filter(function (x) { return x.id === tplId; })[0];
    if (!tp) return;
    var vals = Object.assign({}, preset || {}, clone(tp.vals));
    this.setState({ tplMenu: null });
    var rid = this.newRow(tid, vals);
    if (rid) this.toastMsg('Registro creado desde la plantilla «' + tp.name + '»');
  },
  tplSave(tid, rid) {
    var s = this.st(), v = this.viewer(s);
    var l = this.lvl(s, tid, v.role);
    if (l !== 'edit' && l !== 'full') { this.toastMsg('Con tu permiso no puedes crear plantillas aquí.'); return; }
    var tables = clone(s.tables), t = tables.byId[tid], row = findRow(t, rid);
    if (!row) return;
    var vals = {};
    t.props.forEach(function (p) { if (COMPUTED[p.type] || ['button', 'ai', 'id'].indexOf(p.type) >= 0) return; if (p.type === 'relation' && !p.single) return; if (!isEmptyVal(row[p.key]) && row[p.key] !== false) vals[p.key] = clone(row[p.key]); });
    var name = this.titleOf(t, row) || 'Plantilla';
    t.templates = (t.templates || []).concat([{ id: 'tp' + fmRid(), name: name, vals: vals }]);
    this.setState({ tables: tables });
    this.toastMsg('Plantilla «' + name + '» guardada. Úsala desde el botón Nuevo ▾ de ' + t.name + '.');
  },
  tplDel(tid, tplId) {
    var s = this.st(), v = this.viewer(s);
    if (this.lvl(s, tid, v.role) !== 'full') { this.toastMsg('Solo quien administra la tabla puede borrar plantillas.'); return; }
    var tables = clone(s.tables), t = tables.byId[tid];
    t.templates = (t.templates || []).filter(function (x) { return x.id !== tplId; });
    this.setState({ tables: tables });
  },

  /* ---------- listas vinculadas dentro del registro ---------- */
  linkNew(tid, rid, key) {
    var s = this.st(), t = s.tables.byId[tid], p = propOf(t, key);
    if (!p || !p.pair) return;
    var preset = {}; preset[p.pair] = [rid];
    var nid = this.newRow(p.target, preset, true);
    if (nid) { var o3 = Object.assign({}, s.lkOpen || {}); o3[rid + ':' + key] = true; this.setState({ lkNew: nid, lkOpen: o3 }); }
  },
  linkedData(s, v, tid, rid) {
    var self = this, t = s.tables.byId[tid], row = findRow(t, rid);
    if (!row) return [];
    return t.props.filter(function (p) { return p.type === 'relation' && !p.single && s.tables.byId[p.target] && self.lvl(s, p.target, v.role) !== 'none'; }).map(function (p) {
      var T2 = s.tables.byId[p.target];
      var ids = row[p.key] || [];
      var visible = self.rowsFor(s, p.target, v);
      var rows = visible.filter(function (r) { return ids.indexOf(r.id) >= 0; });
      var stP = T2.props.filter(function (x) { return x.type === 'status'; })[0];
      var peP = T2.props.filter(function (x) { return x.type === 'person'; })[0];
      var dtP = T2.props.filter(function (x) { return x.type === 'date'; })[0];
      var tp = T2.props.filter(function (x) { return x.type === 'title'; })[0];
      var lvl2 = self.lvl(s, p.target, v.role);
      var k = rid + ':' + p.key, open = (s.lkOpen || {})[k] !== undefined ? !!s.lkOpen[k] : rows.length > 0 && rows.length <= 8;
      return {
        name: p.name, tname: T2.name, icon: ICON[T2.icon] || ICON.db, color: T2.color, count: String(rows.length), open: open, chevCls: open ? 'open' : '',
        toggle: function () { var o3 = Object.assign({}, self.st().lkOpen || {}); o3[k] = !open; self.setState({ lkOpen: o3 }); },
        canAdd: (lvl2 === 'edit' || lvl2 === 'full') && !!p.pair, add: function () { self.linkNew(tid, rid, p.key); }, addAria: 'Nuevo registro en ' + T2.name + ' vinculado',
        empty: rows.length === 0,
        rows: rows.slice(0, 12).map(function (r) {
          var op = stP ? optOf(stP, r[stP.key]) : null, m = peP ? self.memberById(s, (r[peP.key] || [])[0]) : null;
          var editing = s.lkNew === r.id && (lvl2 === 'edit' || lvl2 === 'full');
          return {
            title: self.titleOf(T2, r), editing: editing, notEditing: !editing,
            setTitle: function (e) { if (tp) self.setField(T2.id, r.id, tp.key, e.target.value, null); },
            done: function () { self.setState({ lkNew: null }); },
            open: function () { self.setState({ lkNew: null }); self.openRec(T2.id, r.id); },
            hasPill: !!op, pill: op ? op.v : '', pillCls: op ? 'p-' + op.c : '',
            hasAv: !!m, av: m ? initialsOf(m.name) : '', avColor: m ? m.color : '', avName: m ? m.name : '',
            date: dtP && r[dtP.key] ? fmtDate(r[dtP.key], 'short') : ''
          };
        }),
        more: rows.length > 12, moreTxt: 'Ver los ' + rows.length + ' en ' + T2.name, openTable: function () { self.go(T2.id, null); }
      };
    });
  }
});

/* ---------- integración con vistas existentes ---------- */
(function () {
  var baseDbv = Component.prototype.dbViewData;
  Component.prototype.dbViewData = function (s, tid, vid, where, opts) {
    var self = this, out = baseDbv.call(this, s, tid, vid, where, opts);
    var t = s.tables.byId[tid];
    if (!t) return out;
    var key = 'tpl:' + where + ':' + tid, v = this.viewer(s);
    var preset = {};
    try { preset = this.viewPreset(s, t, this.viewOf(t, vid), v) || {}; } catch (e) { preset = {}; }
    var canFull = this.lvl(s, tid, v.role) === 'full';
    out.tplOpen = s.tplMenu === key;
    out.toggleTpl = function () { self.setState({ tplMenu: s.tplMenu === key ? null : key }); };
    out.tpls = (t.templates || []).map(function (tp) { var n = Object.keys(tp.vals || {}).length; return { name: tp.name, sub: n + (n === 1 ? ' campo' : ' campos'), pick: function () { self.tplNew(tid, tp.id, preset); }, canDel: canFull, del: function () { self.tplDel(tid, tp.id); }, delAria: 'Borrar plantilla ' + tp.name }; });
    out.hasTpls = out.tpls.length > 0; out.noTpls = !out.hasTpls;
    out.newBlank = function () { self.setState({ tplMenu: null }); self.newRow(tid, preset); };
    out.fmAdv = function () { self.goForms(tid); };
    out.fmAdvTxt = (t.forms || []).length ? 'Formularios avanzados (' + t.forms.length + ')' : 'Diseñar formulario avanzado';
    return out;
  };
  var baseRv = Component.prototype.renderVals;
  Component.prototype.renderVals = function () {
    var self = this, out = baseRv.call(this);
    var s = this.st(), v = this.viewer(s), screen = s.screen;
    out.navForms = screen === 'forms' ? 'on' : ''; out.navMob = screen === 'movil' ? 'on' : '';
    out.goForms = function () { self.goForms(null); }; out.goMob = function () { self.setScreen('movil'); };
    out.scrForms = screen === 'forms'; out.scrMob = screen === 'movil';
    out.fb = screen === 'forms' ? this.fbData(s, v) : null;
    out.mob = screen === 'movil' ? this.mobData(s, v) : null;
    out.mobQueued = (s.mobQueue || []).length; out.hasMobQueued = out.mobQueued > 0; out.mobQueuedTxt = String(out.mobQueued);
    if (out.hasRec && out.rec && s.rec) {
      var tid = s.rec.tid, rid = s.rec.id;
      var l = this.lvl(s, tid, v.role);
      out.rec.canTpl = l === 'edit' || l === 'full';
      out.rec.saveTpl = function () { self.tplSave(tid, rid); };
      out.rec.linked = this.linkedData(s, v, tid, rid);
      out.rec.hasLinked = out.rec.linked.length > 0;
      var t = s.tables.byId[tid], row = t ? findRow(t, rid) : null;
      var fm = row && row._form ? (t.forms || []).filter(function (x) { return x.id === row._form; })[0] : null;
      out.rec.hasOrigin = !!fm; out.rec.originTxt = fm ? 'Enviado con el formulario «' + fm.name + '»' + (row.origen ? ' · ' + row.origen : '') : '';
    }
    return out;
  };
})();
