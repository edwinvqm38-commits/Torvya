/* ================= configuración por tipo de negocio: módulos y propuestas ================= */
var BIZ_MODULES = [
  { id: 'ventas', name: 'Ventas e inventario', icon: 'i-cart', color: '#BE185D', desc: 'Clientes, pedidos, productos y proveedores', tables: ['cli', 'ped', 'pro', 'prov'] },
  { id: 'proyectos', name: 'Proyectos (PMBOK)', icon: 'i-target', color: '#B45309', desc: 'Cartera, tareas, riesgos e interesados con recomendaciones PMBOK 6, 7 y 8', tables: ['proy', 'tar', 'rie', 'int'] },
  { id: 'personal', name: 'Personal y planilla', icon: 'i-contact', color: '#047857', desc: 'Fichas, planilla editable y costo por hora', tables: ['per', 'par'] },
  { id: 'aprob', name: 'Solicitudes y aprobaciones', icon: 'i-clipboard', color: '#9333EA', desc: 'Jefe directo y administración, con historial', tables: ['sol'] },
  { id: 'campo', name: 'Formularios y partes de campo', icon: 'i-clipcheck', color: '#0E7490', desc: 'App móvil con GPS, fotos y modo sin señal', tables: ['pd'] },
  { id: 'maestros', name: 'Recursos, precios y cortes', code: 'M01', icon: 'i-boxes', color: '#7C3AED', desc: 'Maestro único de recursos, equivalencias, importación de cortes Excel e historial de precios con vigencia', tables: ['cor', 'rec', 'prc'] },
  { id: 'acu', name: 'Ingeniería de costos: ACU', code: 'M02', icon: 'i-calc', color: '#B45309', desc: 'ACU por matrícula y versión, comparador que explica variaciones e impacto de un cambio de precio', tables: ['acu', 'acud'], needs: ['maestros'] },
  { id: 'ops', name: 'Contratos, servicios y OT/SST', code: 'M03', icon: 'i-wrench', color: '#0F766E', desc: 'Contratos con modalidad económica, servicios y órdenes de trabajo sin crear proyectos; HH, km y cantidades programada → reconocida', tables: ['ctr', 'srv', 'ot'], needs: ['acu'] },
  { id: 'presu', name: 'Presupuestos y control de costos', code: 'M04', icon: 'i-wallet', color: '#475569', desc: 'Presupuesto inicial y vigente, costo real, compromisos, desviaciones y estimado al cierre', soon: true },
  { id: 'epp', name: 'EPP, equipos y transporte', code: 'M05', icon: 'i-hardhat', color: '#475569', desc: 'Kits por cuadrilla, vida útil, reposición y costo de uso', soon: true },
  { id: 'valor', name: 'Valorizaciones', code: 'M06', icon: 'i-receipt', color: '#475569', desc: 'Elaborada, enviada, observada, aprobada, facturada y cobrada', soon: true },
  { id: 'bi', name: 'Reportes gerenciales', code: 'M08', icon: 'i-chart', color: '#475569', desc: 'Tableros por contrato y jefatura con fórmula, fuente y responsable de cada indicador', soon: true }
];
var BIZ_RUBROS = [
  { id: 'general', name: 'Proyectos y servicios', desc: 'Para empresas que gestionan proyectos, personal y aprobaciones.', modules: ['proyectos', 'personal', 'aprob', 'campo'] },
  { id: 'electrico', name: 'Servicios eléctricos y mantenimiento de redes', badge: 'Propuesta basada en TECSUR', desc: 'Contratos con distribuidoras, OT/SST, emergencias, mantenimiento BT/MT, cortes de tarifas y ACU.', modules: ['proyectos', 'personal', 'aprob', 'campo', 'maestros', 'acu', 'ops'],
    areas: [{ id: 'a-cos', name: 'Ingeniería de Costos', color: '#7C3AED', icon: 'i-calc', parent: 'a-ger' }],
    cargos: [{ name: 'Jefe de Ingeniería de Costos', area: 'a-cos', parentName: 'Gerente general' }, { name: 'Analista de costos', area: 'a-cos', parentName: 'Jefe de Ingeniería de Costos' }, { name: 'Supervisor de cuadrillas', area: 'a-ope', parentName: 'Jefe de Operaciones y Proyectos' }],
    notes: ['Modalidades, gastos generales y utilidad quedan marcados «por validar»: el sistema no asume reglas contractuales.', 'Las OT se registran por servicio, sin obligarlas a ser proyectos.', 'Lo importado nunca queda validado solo; los ACU aprobados no se recalculan.'] },
  { id: 'construccion', name: 'Construcción y obras', desc: 'Obras por proyecto con presupuesto por partidas y partes diarios.', modules: ['proyectos', 'personal', 'aprob', 'campo', 'maestros', 'acu'] },
  { id: 'comercio', name: 'Comercio y distribución', desc: 'Ventas, inventario, compras y aprobaciones.', modules: ['ventas', 'aprob', 'personal'] }
];

Object.assign(Component.prototype, {
  bizMod(id) { return BIZ_MODULES.filter(function (m) { return m.id === id; })[0]; },
  bizInstalled(s, id) { var m = this.bizMod(id); return !!m && !m.soon && (m.tables || []).every(function (t) { return !!s.tables.byId[t]; }); },
  /* instala un módulo sobre copias del estado; devuelve true si lo instaló */
  bizInstallInto(st, id, made) {
    var self = this, m = this.bizMod(id);
    if (!m || m.soon) return false;
    if ((m.tables || []).every(function (t) { return !!st.tables.byId[t]; })) return false;
    (m.needs || []).forEach(function (n) { self.bizInstallInto(st, n, made); });
    var T = st.tables;
    function addTable(t) { if (T.byId[t.id]) return; T.byId[t.id] = t; T.order.push(t.id); }
    function addAccess(tid, a) { st.access[tid] = a; }
    function ensureArea(a) { if (!st.org.areas.some(function (x) { return x.id === a.id; })) st.org.areas.push({ id: a.id, name: a.name, color: a.color, icon: a.icon, parent: a.parent }); }
    function addPage(pg) { if (st.pages.byId[pg.id]) return; st.pages.byId[pg.id] = pg; st.pages.order.push(pg.id); }
    function addProp(tid, p) { var t = T.byId[tid]; if (t && !propOf(t, p.key)) t.props.push(p); }
    if (id === 'maestros') {
      var mm = seedMaestros();
      ['cor', 'rec', 'prc'].forEach(function (k) { addTable(mm[k]); });
      var acc = { admin: 'full', finanzas: 'full', ventas: 'none', almacen: 'view', invitado: 'none' };
      ['cor', 'rec', 'prc'].forEach(function (k) { addAccess(k, clone(acc)); });
      ensureArea({ id: 'a-cos', name: 'Ingeniería de Costos', color: '#7C3AED', icon: 'i-calc', parent: 'a-ger' });
      addPage({ id: 'pgcos', area: 'a-cos', cover: { kind: 'grad', v: 2 }, title: 'Ingeniería de costos', icon: 'i-calc', color: '#7C3AED', desc: 'Recursos, cortes de tarifas, historial de precios y ACU', blocks: [
        blk('k0', 'callout', 12, { icon: 'i-bulb', text: 'Propuesta para no empezar de cero: cada corte de tarifas (semanal o mensual) se importa y queda «por validar». Un recurso tiene un solo código y guarda sus equivalencias; su precio nunca se sobrescribe, se agrega al historial con su vigencia. Abre «Ingeniería de costos» en el menú para importar, validar y comparar.' }),
        blk('k1', 'kpi', 3, { title: 'Recursos', table: 'rec', val: 'count', filters: [] }),
        blk('k2', 'kpi', 3, { title: 'Cambios de precio por validar', table: 'rec', val: 'count', filters: [{ prop: 'estado', op: 'is', value: 'Cambio por validar' }] }),
        blk('k3', 'kpi', 3, { title: 'Precios por validar', table: 'prc', val: 'count', filters: [{ prop: 'estado', op: 'is_not', value: 'Validado' }, { prop: 'estado', op: 'is_not', value: 'Rechazado' }] }),
        blk('k4', 'kpi', 3, { title: 'Cortes recibidos', table: 'cor', val: 'count', filters: [] }),
        blk('k5', 'db', 12, { table: 'rec', view: 'vr1' }),
        blk('k6', 'db', 12, { table: 'cor', view: 'vk1' })
      ] });
      made.push(m.name);
    }
    if (id === 'acu') {
      var recIds = {}, R = T.byId.rec;
      R.rows.forEach(function (r) { if (r.codigo) recIds[r.codigo] = r.id; });
      var aa = seedAcu({ hist: cosPriceHistory(), recIds: recIds });
      aa.acud.rows = aa.acud.rows.filter(function (d) { return d.recurso[0]; });
      addTable(aa.acu); addTable(aa.acud);
      addProp('rec', { key: 'usos', name: 'Usado en ACU', type: 'relation', target: 'acud', pair: 'recurso' });
      var acc2 = { admin: 'full', finanzas: 'full', ventas: 'none', almacen: 'view', invitado: 'none' };
      addAccess('acu', clone(acc2)); addAccess('acud', clone(acc2));
      var pg = st.pages.byId.pgcos;
      if (pg && !pg.blocks.some(function (b) { return b.id === 'k7'; })) {
        pg.blocks.splice(5, 0,
          blk('k7', 'chart', 6, { title: 'ACU por estado', table: 'acu', kind: 'donut', by: 'estado', val: 'count', sort: 'label', limit: 0, filters: [] }),
          blk('k8', 'chart', 6, { title: 'Costo directo por familia (detalle de ACU)', table: 'acud', kind: 'bar', by: 'familia', val: 'sum:parcial', sort: 'desc', limit: 0, filters: [] }),
          blk('k9', 'db', 12, { table: 'acu', view: 'va1' }));
      }
      made.push(m.name);
    }
    if (id === 'ops') {
      var hasCli = !!T.byId.cli, cliId = null;
      if (hasCli) {
        var C = T.byId.cli;
        var ex = C.rows.filter(function (r) { return /Electro Andina/.test(r.nombre || ''); })[0];
        if (ex) cliId = ex.id;
        else { cliId = 'clx1'; C.rows.push(mkRow(cliId, C.nextId++, { nombre: 'Electro Andina Distribución S.A. (ficticia)', ruc: '20100000001', sector: '', ciudad: 'Lima', etiquetas: [], contacto: 'Gerencia de Distribución', correo: '', telefono: '', direccion: '', pedidos: [] }, nowIso(), 'ana')); }
        addProp('cli', { key: 'contratos', name: 'Contratos', type: 'relation', target: 'ctr', pair: 'cliente' });
      }
      var oo = seedOps(hasCli, cliId);
      if (!T.byId.acu) oo.ot.props = oo.ot.props.filter(function (p) { return p.key !== 'partida' && p.key !== 'pu'; });
      addTable(oo.ctr); addTable(oo.srv); addTable(oo.ot);
      addProp('acu', { key: 'ots', name: 'Órdenes de trabajo', type: 'relation', target: 'ot', pair: 'partida' });
      addAccess('ctr', { admin: 'full', finanzas: 'edit', ventas: 'view', almacen: 'view', invitado: 'none' });
      addAccess('srv', { admin: 'full', finanzas: 'edit', ventas: 'view', almacen: 'view', invitado: 'none' });
      addAccess('ot', { admin: 'full', finanzas: 'view', ventas: 'none', almacen: 'full', invitado: 'none' });
      addPage({ id: 'pgops', area: 'a-ope', cover: { kind: 'grad', v: 3 }, title: 'Contratos y operaciones', icon: 'i-wrench', color: '#0F766E', desc: 'Contratos, servicios y órdenes de trabajo: programado, ejecutado, verificado y reconocido', blocks: [
        blk('o0', 'callout', 12, { icon: 'info', text: 'Una OT o una incidencia se registra en su servicio sin crear un proyecto. Programado, ejecutado, verificado y reconocido son cantidades distintas; el importe solo usa lo reconocido. Varias OT de un mismo viaje comparten «Movilización» para no repartir km y horas al azar. Las reglas de reconocimiento de cada contrato están «por validar».' }),
        blk('o1', 'kpi', 3, { title: 'Órdenes de trabajo', table: 'ot', val: 'count', filters: [] }),
        blk('o2', 'kpi', 3, { title: 'HH ejecutadas', table: 'ot', val: 'sum:hh', filters: [] }),
        blk('o3', 'kpi', 3, { title: 'Km recorridos', table: 'ot', val: 'sum:km', filters: [] }),
        blk('o4', 'kpi', 3, { title: 'Importe reconocido', table: 'ot', val: 'sum:importe', filters: [] }),
        blk('o5', 'chart', 6, { title: 'OT por estado', table: 'ot', kind: 'donut', by: 'estado', val: 'count', sort: 'label', limit: 0, filters: [] }),
        blk('o6', 'chart', 6, { title: 'HH por cuadrilla', table: 'ot', kind: 'bar', by: 'cuadrilla', val: 'sum:hh', sort: 'desc', limit: 0, filters: [] }),
        blk('o7', 'db', 12, { table: 'ot', view: 'vo2' }),
        blk('o8', 'db', 7, { table: 'srv', view: 'vs1' }),
        blk('o9', 'db', 5, { table: 'ctr', view: 'vc1' })
      ] });
      made.push(m.name);
    }
    syncPairs(T);
    if (id === 'maestros') this.cosRecompute(T);
    return true;
  },
  bizInstall(id) {
    var s = this.st(), v = this.viewer(s);
    if (v.role !== 'admin') { this.toastMsg('Solo administración puede instalar módulos.'); return; }
    var st = { tables: clone(s.tables), pages: clone(s.pages), access: clone(s.access), org: clone(s.org) }, made = [];
    this.bizInstallInto(st, id, made);
    if (!made.length) return;
    this.setState({ tables: st.tables, pages: st.pages, access: st.access, org: st.org, log: this.addLog(s, ['instaló ' + made.join(', ')]) });
    this.toastMsg('Instalado: ' + made.join(', ') + '. Todo queda editable: renombra tablas, columnas y fórmulas cuando quieras.');
  },
  bizApply(rid) {
    var self = this, s = this.st(), v = this.viewer(s);
    if (v.role !== 'admin') { this.toastMsg('Solo administración puede aplicar una propuesta.'); return; }
    var rb = BIZ_RUBROS.filter(function (x) { return x.id === rid; })[0];
    if (!rb) return;
    var st = { tables: clone(s.tables), pages: clone(s.pages), access: clone(s.access), org: clone(s.org) }, made = [];
    rb.modules.forEach(function (mid) { self.bizInstallInto(st, mid, made); });
    var addedC = [];
    (rb.areas || []).forEach(function (a) { if (!st.org.areas.some(function (x) { return x.id === a.id; })) st.org.areas.push(clone(a)); });
    var seq = s.seq;
    (rb.cargos || []).forEach(function (c) {
      if (st.org.cargos.some(function (x) { return x.name === c.name; })) return;
      var par = st.org.cargos.filter(function (x) { return x.name === c.parentName; })[0];
      if (!st.org.areas.some(function (x) { return x.id === c.area; })) return;
      st.org.cargos.push({ id: 'c' + (++seq), name: c.name, area: c.area, parent: par ? par.id : null, person: null });
      addedC.push(c.name);
    });
    var biz = Object.assign({}, s.biz || {}, { rubro: rid });
    this.setState({ tables: st.tables, pages: st.pages, access: st.access, org: st.org, seq: seq, biz: biz, log: this.addLog(s, ['aplicó la propuesta «' + rb.name + '»']) });
    this.toastMsg('Propuesta aplicada' + (made.length ? ': ' + made.join(', ') : '') + (addedC.length ? '. Cargos sugeridos: ' + addedC.join(', ') : '') + '. Ajusta nombres, cargos y parámetros a tu empresa.');
  },
  bizRename(tid, name) {
    var s = this.st(); if (!s.tables.byId[tid]) return;
    var tables = clone(s.tables); tables.byId[tid].name = name;
    this.setState({ tables: tables });
  },
  bizData(s, v) {
    var self = this, biz = s.biz || {}, pick = s.bizPick || biz.rubro || 'electrico';
    var rubros = BIZ_RUBROS.map(function (rb) {
      var pend = rb.modules.filter(function (mid) { return !self.bizInstalled(s, mid); });
      return { name: rb.name, desc: rb.desc, hasBadge: !!rb.badge, badge: rb.badge || '', cls: (pick === rb.id ? 'on' : '') + (biz.rubro === rb.id ? ' applied' : ''), applied: biz.rubro === rb.id, pick: function () { self.setState({ bizPick: rb.id }); },
        mods: rb.modules.map(function (mid) { var m = self.bizMod(mid); return { name: m.name, cls: self.bizInstalled(s, mid) ? 'p-green' : 'p-gray' }; }), pendTxt: pend.length ? pend.length + (pend.length === 1 ? ' módulo por instalar' : ' módulos por instalar') : 'Todo instalado' };
    });
    var rb = BIZ_RUBROS.filter(function (x) { return x.id === pick; })[0];
    var pendMods = rb.modules.filter(function (mid) { return !self.bizInstalled(s, mid); }).map(function (mid) { var m = self.bizMod(mid); return { name: (m.code ? m.code + ' · ' : '') + m.name, tables: (m.tables || []).length }; });
    var pendAreas = (rb.areas || []).filter(function (a) { return !s.org.areas.some(function (x) { return x.id === a.id; }); }).map(function (a) { return { name: 'Área: ' + a.name }; });
    var pendCargos = (rb.cargos || []).filter(function (c) { return !s.org.cargos.some(function (x) { return x.name === c.name; }); }).map(function (c) { return { name: 'Cargo: ' + c.name }; });
    var changes = pendMods.map(function (x) { return { name: 'Módulo ' + x.name }; }).concat(pendAreas, pendCargos);
    var mods = BIZ_MODULES.map(function (m) {
      var inst = self.bizInstalled(s, m.id);
      var firstT = inst ? m.tables[0] : null;
      return { name: m.name, code: m.code || '', hasCode: !!m.code, desc: m.desc, icon: ICON[m.icon] || ICON.db, color: m.color, installed: inst, canInstall: !inst && !m.soon, soon: !!m.soon,
        stateTxt: inst ? 'Instalado' : m.soon ? 'Siguiente bloque' : 'Disponible', stateCls: inst ? 'p-green' : m.soon ? 'p-gray' : 'p-blue',
        tables: (m.tables || []).map(function (tid) { var t = s.tables.byId[tid]; return { name: t ? t.name : tid }; }), hasTables: !!(m.tables || []).length,
        needsTxt: (m.needs || []).length ? 'Requiere: ' + m.needs.map(function (n) { return self.bizMod(n).name; }).join(', ') : '', hasNeeds: !!(m.needs || []).length && !inst,
        install: function () { self.bizInstall(m.id); }, open: function () { if (firstT) self.go(firstT, null); } };
    });
    var tnames = s.tables.order.map(function (tid) { var t = s.tables.byId[tid]; return { name: t.name, icon: ICON[t.icon] || ICON.db, color: t.color, set: function (e) { self.bizRename(tid, e.target.value); } }; });
    return {
      isAdmin: v.role === 'admin', notAdmin: v.role !== 'admin', ws: s.ws, setWs: function (e) { self.setState({ ws: e.target.value }); },
      rubros: rubros, sel: { name: rb.name, desc: rb.desc, hasBadge: !!rb.badge, badge: rb.badge || '', notes: (rb.notes || []).map(function (n) { return { text: n }; }), hasNotes: !!(rb.notes || []).length, changes: changes, hasChanges: changes.length > 0, noChanges: changes.length === 0, applied: biz.rubro === rb.id, apply: function () { self.bizApply(rb.id); } },
      mods: mods, tnames: tnames
    };
  },

  /* ---------- pantalla de ingeniería de costos ---------- */
  cosData(s, v) {
    var self = this;
    if (!this.cosHas(s)) return { has: false, none: true, goBiz: function () { self.setScreen('negocio'); } };
    var R = s.tables.byId.rec, P = s.tables.byId.prc, C = s.tables.byId.cor, A = s.tables.byId.acu;
    var lp = this.lvl(s, 'prc', v.role), canEdit = lp === 'edit' || lp === 'full';
    var hasAcu = !!(A && s.tables.byId.acud);
    var tab = s.cosTab || 'cortes';
    if (tab === 'acu' && !hasAcu) tab = 'cortes';
    var out = { has: true, none: false, canEdit: canEdit, readOnly: !canEdit, hasAcu: hasAcu };
    var tabs = [{ id: 'cortes', n: 'Cortes e importación', ic: ICON['i-folder'] }, { id: 'precios', n: 'Recursos y precios', ic: ICON['i-trend'] }];
    if (hasAcu) tabs.push({ id: 'acu', n: 'Comparar versiones de ACU', ic: ICON['i-calc'] }, { id: 'impacto', n: 'Impacto de un precio', ic: ICON.bolt });
    out.tabs = tabs.map(function (x) { return { n: x.n, icon: x.ic, cls: tab === x.id ? 'on' : '', pick: function () { self.setState({ cosTab: x.id }); } }; });
    out.isCortes = tab === 'cortes'; out.isPrecios = tab === 'precios'; out.isAcu = tab === 'acu'; out.isImpacto = tab === 'impacto';
    var pend = P.rows.filter(function (p) { return p.estado === 'Importado' || p.estado === 'Por validar'; }).length;
    out.kpis = [
      { n: 'Recursos', v: String(R.rows.length), sub: R.rows.filter(function (r) { return r.alias; }).length + ' con equivalencias' },
      { n: 'Precios por validar', v: String(pend), sub: 'importados sin revisar', warn: pend > 0 },
      { n: 'Cambios por validar', v: String(R.rows.filter(function (r) { return r.estado === 'Cambio por validar'; }).length), sub: 'el precio vigente aún no cambia' },
      { n: 'Cortes recibidos', v: String(C.rows.length), sub: 'último: ' + (C.rows.slice().sort(function (a, b) { return String(b.fecha).localeCompare(String(a.fecha)); })[0] || { fecha: '' }).fecha.split('-').reverse().join('/') },
      { n: 'Sin familia', v: String(R.rows.filter(function (r) { return !r.familia; }).length), sub: 'recursos por clasificar' }
    ].map(function (k) { k.cls = k.warn ? 'warn' : ''; return k; });
    function famCls(f) { var op = FAMILIAS.filter(function (x) { return x.v === f; })[0]; return op ? 'p-' + op.c : 'p-gray'; }
    function stCls(st) { return { 'Validado': 'p-green', 'Importado': 'p-gray', 'Por validar': 'p-amber', 'Rechazado': 'p-red', 'Cambio por validar': 'p-amber' }[st] || 'p-gray'; }
    function money(x) { return x === '' || x == null ? '—' : fmtNumber(x, 'money', 2); }
    function pct(a, b) { if (a == null || b == null || !Number(a)) return ''; var d = (Number(b) - Number(a)) / Number(a) * 100; return (d > 0 ? '+' : '') + d.toFixed(1) + ' %'; }

    /* --- cortes --- */
    if (tab === 'cortes') {
      var imp = s.cosImp;
      out.importing = !!imp; out.notImporting = !imp;
      if (imp) {
        var an = this.cosAnalyze(s, imp);
        var cnt = { nuevo: 0, igual: 0, cambio: 0, duda: 0, primero: 0 };
        an.forEach(function (a) { cnt[a.kind] = (cnt[a.kind] || 0) + 1; });
        out.imp = {
          name: imp.name, fecha: imp.fecha, setFecha: function (e) { self.setState({ cosImp: Object.assign({}, self.st().cosImp, { fecha: e.target.value }) }); },
          periodos: ['Semanal', 'Mensual', 'Extraordinario'].map(function (p) { return { n: p, cls: imp.periodo === p ? 'on' : '', pick: function () { self.setState({ cosImp: Object.assign({}, self.st().cosImp, { periodo: p }) }); } }; }),
          hasErr: !!imp.err, err: imp.err || '', hasRows: an.length > 0,
          summary: [{ n: 'Sin cambio', v: cnt.igual, cls: 'p-gray' }, { n: 'Cambio de precio', v: cnt.cambio, cls: 'p-amber' }, { n: 'Posible equivalencia', v: cnt.duda, cls: 'p-violet' }, { n: 'Recurso nuevo', v: cnt.nuevo, cls: 'p-blue' }].filter(function (x) { return x.v; }).map(function (x) { return { n: x.n, v: String(x.v), cls: x.cls }; }),
          rows: an.map(function (a) {
            var kindTxt = { nuevo: 'Nuevo', igual: 'Sin cambio', cambio: 'Cambio ' + pct(a.prev, a.x.precio), duda: '¿Equivalencia?', primero: 'Primer precio' }[a.kind];
            var kcls = { nuevo: 'p-blue', igual: 'p-gray', cambio: 'p-amber', duda: 'p-violet', primero: 'p-teal' }[a.kind];
            return { cod: a.x.cod, desc: a.x.desc || '—', und: a.x.und || '', precio: money(a.x.precio), prev: a.prev != null ? money(a.prev) : '', hasPrev: a.prev != null && a.kind === 'cambio', kindTxt: kindTxt, kcls: kcls, cls: a.kind === 'duda' ? 'duda' : a.kind === 'cambio' ? 'cambio' : '',
              isDuda: a.kind === 'duda', candTxt: a.cand ? '¿Es «' + a.cand.nombre + '» (' + a.cand.codigo + ')? Coincidencia ' + Math.round(a.score * 100) + ' %' : '',
              sameCls: a.dec === 'same' ? 'on' : '', newCls: a.dec === 'new' ? 'on' : '',
              same: function () { var im2 = clone(self.st().cosImp); im2.dec[a.i] = 'same'; self.setState({ cosImp: im2 }); },
              other: function () { var im2 = clone(self.st().cosImp); im2.dec[a.i] = 'new'; self.setState({ cosImp: im2 }); },
              matchTxt: a.ref ? a.ref.nombre + (normTxt(a.ref.codigo) !== normTxt(a.x.cod) ? ' (equivalencia de ' + a.ref.codigo + ')' : '') : '' };
          }),
          confirmTxt: 'Importar ' + an.length + ' precios como «por validar»',
          confirm: function () { self.cosConfirm(); }, cancel: function () { self.setState({ cosImp: null }); }
        };
      } else {
        var ks = C.rows.slice().sort(function (a, b) { return String(b.fecha).localeCompare(String(a.fecha)); });
        var selK = s.cosSelK && findRow(C, s.cosSelK) ? s.cosSelK : (ks[0] ? ks[0].id : null);
        out.cortes = ks.map(function (k) {
          return { name: k.archivo, fecha: fmtDdMmY(k.fecha), periodo: k.periodo || '', meta: (k.filas || 0) + ' filas · ' + (k.cambios || 0) + ' cambios · ' + (k.nuevos || 0) + ' nuevos' + (k.equiv ? ' · ' + k.equiv + ' equiv.' : ''), estado: k.estado, stCls: stCls(k.estado), cls: k.id === selK ? 'on' : '', pick: function () { self.setState({ cosSelK: k.id }); } };
        });
        var k = selK ? findRow(C, selK) : null;
        out.hasK = !!k;
        if (k) {
          var rows = P.rows.filter(function (p) { return (p.corte || [])[0] === k.id; });
          out.k = {
            name: k.archivo, fecha: fmtDdMmY(k.fecha), estado: k.estado, stCls: stCls(k.estado),
            who: (function () { var m2 = self.memberById(s, (k.importo || [])[0]); return m2 ? 'Importó ' + m2.name : ''; })(),
            canValidate: canEdit && (k.estado === 'Por validar' || k.estado === 'Importado'),
            validate: function () { self.cosValidate(k.id, true); }, reject: function () { self.cosValidate(k.id, false); },
            rows: rows.map(function (p) {
              var r = findRow(R, (p.recurso || [])[0]);
              var before = P.rows.filter(function (q) { return q !== p && (q.recurso || [])[0] === (p.recurso || [])[0] && q.vigencia < p.vigencia && q.estado !== 'Rechazado'; }).sort(function (a, b) { return String(b.vigencia).localeCompare(String(a.vigencia)); })[0];
              var ch = before && Math.abs(Number(before.precio) - Number(p.precio)) > 0.004;
              return { cod: p.codorig || (r ? r.codigo : ''), name: r ? r.nombre : '—', precio: money(p.precio), prev: before ? money(before.precio) : '', delta: ch ? pct(before.precio, p.precio) : (before ? 'Sin cambio' : 'Primer precio'), dcls: ch ? (Number(p.precio) > Number(before.precio) ? 'up' : 'down') : 'same', alias: p.codorig && r && p.codorig !== r.codigo, aliasTxt: p.codorig && r && p.codorig !== r.codigo ? 'Llegó como ' + p.codorig : '', estado: p.estado, stCls: stCls(p.estado), open: function () { if (r) self.setState({ cosTab: 'precios', cosRid: r.id }); } };
            }).sort(function (a, b) { return (a.dcls === 'same') - (b.dcls === 'same'); })
          };
        }
        out.samples = COS_SAMPLES.filter(function (sm) { return !C.rows.some(function (k2) { return k2.archivo === sm.name; }); }).map(function (sm, i) { var idx = COS_SAMPLES.indexOf(sm); return { name: sm.name, meta: sm.rows.length + ' filas · ' + fmtDdMmY(sm.fecha), pick: function () { self.cosSample(idx); } }; });
        out.hasSamples = out.samples.length > 0;
        out.upload = function (e) { self.cosFile(e); };
      }
    }

    /* --- recursos y precios --- */
    if (tab === 'precios') {
      var q = normTxt(s.cosQ || ''), fam = s.cosFam || '';
      var list = R.rows.filter(function (r) { return (!fam || r.familia === fam) && (!q || normTxt(r.nombre + ' ' + r.codigo + ' ' + (r.alias || '')).indexOf(q) >= 0); });
      list.sort(function (a, b) { return (a.estado === 'Cambio por validar' ? 0 : 1) - (b.estado === 'Cambio por validar' ? 0 : 1) || String(a.codigo).localeCompare(String(b.codigo)); });
      var rid = s.cosRid && findRow(R, s.cosRid) ? s.cosRid : (list[0] ? list[0].id : null);
      out.q = s.cosQ || ''; out.setQ = function (e) { self.setState({ cosQ: e.target.value }); };
      out.fams = [{ v: '', n: 'Todas' }].concat(FAMILIAS.map(function (x) { return { v: x.v, n: x.v }; })).map(function (x) { return { n: x.n, cls: fam === x.v ? 'on' : '', pick: function () { self.setState({ cosFam: x.v }); } }; });
      out.recs = list.map(function (r) { return { cod: r.codigo, name: r.nombre, fam: r.familia || 'Sin familia', famCls: famCls(r.familia), precio: money(r.precio), ultimo: r.ultimo !== '' && Number(r.ultimo) !== Number(r.precio) ? money(r.ultimo) : '', hasUlt: r.ultimo !== '' && r.ultimo != null && Number(r.ultimo) !== Number(r.precio), estado: r.estado, stCls: stCls(r.estado), cls: r.id === rid ? 'on' : '', pick: function () { self.setState({ cosRid: r.id }); } }; });
      out.noRecs = list.length === 0;
      var r = rid ? findRow(R, rid) : null;
      out.hasR = !!r;
      if (r) {
        var hs = P.rows.filter(function (p) { return (p.recurso || [])[0] === r.id; }).sort(function (a, b) { return String(a.vigencia).localeCompare(String(b.vigencia)) || String(a._cAt).localeCompare(String(b._cAt)); });
        var W = 520, H = 150, pad = 26;
        var vals = hs.filter(function (p) { return p.estado !== 'Rechazado'; }).map(function (p) { return Number(p.precio); });
        var mn = Math.min.apply(null, vals.concat([Infinity])), mx = Math.max.apply(null, vals.concat([-Infinity]));
        if (!isFinite(mn)) { mn = 0; mx = 1; }
        if (mx - mn < 0.01) { mx += 1; mn = Math.max(0, mn - 1); }
        var t0 = hs.length ? Date.parse(hs[0].vigencia) : 0, t1 = hs.length ? Date.parse(hs[hs.length - 1].vigencia) : 1; if (t1 === t0) t1 = t0 + 86400000;
        var pts = hs.filter(function (p) { return p.estado !== 'Rechazado'; }).map(function (p) { var x = pad + (Date.parse(p.vigencia) - t0) / (t1 - t0) * (W - pad * 2), y = H - pad - (Number(p.precio) - mn) / (mx - mn) * (H - pad * 2); return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, p: p }; });
        var step = ''; pts.forEach(function (pt, i) { step += (i ? ' ' + pt.x + ',' + pts[i - 1].y + ' ' : '') + pt.x + ',' + pt.y; });
        var users = [];
        if (hasAcu) {
          var D = s.tables.byId.acud;
          D.rows.filter(function (d) { return (d.recurso || [])[0] === r.id; }).forEach(function (d) { var a = findRow(A, (d.acu || [])[0]); if (a) users.push({ name: a.matricula + ' v' + a.version + ' · ' + a.partida, sub: 'precio usado ' + money(d.precio) + ' · ' + a.estado, open: function () { self.openRec('acu', a.id); } }); });
        }
        out.r = {
          name: r.nombre, cod: r.codigo, fam: r.familia || 'Sin familia', famCls: famCls(r.familia), und: r.unidad || '', precio: money(r.precio), desde: r.vigdesde ? 'desde ' + fmtDdMmY(r.vigdesde) : 'sin precio validado',
          hasUlt: r.ultimo !== '' && r.ultimo != null && Number(r.ultimo) !== Number(r.precio), ultimo: money(r.ultimo), estado: r.estado, stCls: stCls(r.estado),
          hasAlias: !!r.alias, alias: r.alias || '', open: function () { self.openRec('rec', r.id); },
          chart: { w: String(W), h: String(H), vb: '0 0 ' + W + ' ' + H, line: step, lo: money(mn), hi: money(mx), yLo: String(H - pad + 14), yHi: String(pad - 8),
            dots: pts.map(function (pt) { return { cx: String(pt.x), cy: String(pt.y), cls: pt.p.estado === 'Validado' ? 'ok' : 'pend', tip: fmtDdMmY(pt.p.vigencia) + ': ' + money(pt.p.precio) + ' (' + pt.p.estado + ')' }; }) },
          hist: hs.slice().reverse().map(function (p, i, arr) {
            var older = arr.slice(i + 1).filter(function (q2) { return q2.estado !== 'Rechazado'; })[0];
            var k2 = C ? findRow(C, (p.corte || [])[0]) : null;
            var can = canEdit && (p.estado === 'Importado' || p.estado === 'Por validar');
            return { fecha: fmtDdMmY(p.vigencia), precio: money(p.precio), delta: older && Math.abs(Number(older.precio) - Number(p.precio)) > 0.004 ? pct(older.precio, p.precio) : '', fuente: k2 ? k2.archivo : (p.fuente || ''), cod: p.codorig && p.codorig !== r.codigo ? 'como ' + p.codorig : '', estado: p.estado, stCls: stCls(p.estado), canAct: can, ok: function () { self.cosValidatePrice(p.id, true); }, no: function () { self.cosValidatePrice(p.id, false); }, motivo: p.motivo || '' };
          }),
          users: users, hasUsers: users.length > 0,
          impact: function () { self.setState({ cosTab: 'impacto', cosImpact: { rid: r.id, precio: '', fecha: todayIso(), fuente: 'Compras', motivo: '' } }); }
        };
      }
    }

    /* --- comparar ACU --- */
    if (tab === 'acu') {
      var mats = this.cosMats(s);
      var cmp = s.cosCmp || {};
      var mat = cmp.mat && mats.indexOf(cmp.mat) >= 0 ? cmp.mat : mats[0];
      var vs = this.cosVersions(s, mat);
      var aId = cmp.mat === mat && cmp.a && findRow(A, cmp.a) ? cmp.a : (vs.length > 1 ? vs[vs.length - 2].id : (vs[0] || {}).id);
      var bId = cmp.mat === mat && cmp.b && findRow(A, cmp.b) ? cmp.b : (vs[vs.length - 1] || {}).id;
      out.mats = mats.map(function (m2) {
        var vv = self.cosVersions(s, m2), last = vv[vv.length - 1];
        return { mat: m2, name: last ? last.partida : '', meta: vv.length + (vv.length === 1 ? ' versión' : ' versiones') + ' · PU ' + money(self.cosCalc(s, last).pu), cls: m2 === mat ? 'on' : '', pick: function () { self.setState({ cosCmp: { mat: m2 } }); } };
      });
      var verOpts = vs.map(function (a) { return { v: a.id, label: 'v' + a.version + ' · ' + a.estado + ' · ' + fmtDdMmY(a.vigencia) }; });
      var a1 = findRow(A, aId), a2 = findRow(A, bId);
      out.acu = {
        mat: mat, verA: aId, verB: bId, verOpts: verOpts, single: vs.length < 2,
        setA: function (e) { self.setState({ cosCmp: { mat: mat, a: e.target.value, b: bId } }); }, setB: function (e) { self.setState({ cosCmp: { mat: mat, a: aId, b: e.target.value } }); },
        versions: vs.map(function (a) { var c = self.cosCalc(s, a); var est = optOf(propOf(A, 'estado'), a.estado), tp = optOf(propOf(A, 'tipo'), a.tipo); return { name: 'v' + a.version, estado: a.estado, eCls: est ? 'p-' + est.c : 'p-gray', tipo: a.tipo || '', tCls: tp ? 'p-' + tp.c : 'p-gray', pu: money(c.pu), vig: fmtDdMmY(a.vigencia), rend: (a.rend || '') + ' ' + (a.unidad || '') + '/día', cls: (a.id === aId ? 'isA' : '') + (a.id === bId ? ' isB' : ''), open: function () { self.openRec('acu', a.id); } }; }),
        canNew: this.lvl(s, 'acu', v.role) === 'edit' || this.lvl(s, 'acu', v.role) === 'full',
        newVer: function () { self.cosNewVersion(bId); }
      };
      out.acu.hasCmp = !!(a1 && a2 && a1.id !== a2.id); out.acu.noCmp = !out.acu.hasCmp;
      if (out.acu.hasCmp) {
        var cp = this.cosCompare(s, a1, a2);
        var maxAbs = cp.comps.reduce(function (m3, c) { return Math.max(m3, Math.abs(c.v)); }, 0.0001);
        var pctT = cp.c1.pu ? (cp.dPu / cp.c1.pu * 100) : 0;
        var main = cp.comps.filter(function (c) { return Math.abs(c.v) >= 0.005; }).sort(function (x, y) { return Math.abs(y.v) - Math.abs(x.v); });
        var why = main.map(function (c) { return c.n.toLowerCase() + ' (' + (c.v > 0 ? '+' : '') + fmtNumber(c.v, 'money', 2) + ')'; });
        var topRows = cp.rows.filter(function (x) { return Math.abs(x.delta) >= 0.005; }).slice(0, 3).map(function (x) { return x.name + ': ' + x.causa.charAt(0).toLowerCase() + x.causa.slice(1); });
        out.acu.cmp = {
          aName: 'v' + a1.version, bName: 'v' + a2.version, puA: money(cp.c1.pu), puB: money(cp.c2.pu), cdA: money(cp.c1.cd), cdB: money(cp.c2.cd),
          dPu: (cp.dPu > 0 ? '+' : '') + fmtNumber(cp.dPu, 'money', 2), dPct: (pctT > 0 ? '+' : '') + pctT.toFixed(1) + ' %', dCls: cp.dPu > 0 ? 'up' : cp.dPu < 0 ? 'down' : 'same',
          explain: Math.abs(cp.dPu) < 0.005 ? 'Las dos versiones tienen el mismo precio unitario.' : 'El precio unitario ' + (cp.dPu > 0 ? 'sube' : 'baja') + ' ' + fmtNumber(Math.abs(cp.dPu), 'money', 2) + ' (' + pctT.toFixed(1) + ' %). Se explica por ' + why.join(', ') + '.' + (topRows.length ? ' Principales cambios: ' + topRows.join('; ') + '.' : ''),
          comps: cp.comps.map(function (c) { var w = Math.round(Math.abs(c.v) / maxAbs * 100); return { n: c.n, v: (c.v > 0 ? '+' : c.v < 0 ? '−' : '') + fmtNumber(Math.abs(c.v), 'money', 2), w: 'width: ' + w + '%', cls: c.v > 0.004 ? 'up' : c.v < -0.004 ? 'down' : 'zero' }; }),
          rows: cp.rows.map(function (x) { return { name: x.name, fam: x.fam || '', famCls: famCls(x.fam), q: (x.q1 == null ? '—' : fmtNumber(x.q1, 'number', 4)) + ' → ' + (x.q2 == null ? '—' : fmtNumber(x.q2, 'number', 4)), p: (x.p1 == null ? '—' : money(x.p1)) + ' → ' + (x.p2 == null ? '—' : money(x.p2)), par: money(x.par1) + ' → ' + money(x.par2), delta: (x.delta > 0 ? '+' : '') + fmtNumber(x.delta, 'money', 2), dCls: x.delta > 0.004 ? 'up' : x.delta < -0.004 ? 'down' : 'same', causa: x.causa }; }),
          meta: 'Rendimiento ' + a1.rend + ' → ' + a2.rend + ' ' + (a2.unidad || '') + '/día · GG ' + a1.gg + ' % → ' + a2.gg + ' % · Utilidad ' + a1.ut + ' % → ' + a2.ut + ' %'
        };
      }
    }

    /* --- impacto de un precio --- */
    if (tab === 'impacto') {
      var im = s.cosImpact || {};
      var rr = im.rid ? findRow(R, im.rid) : null;
      var np = parseNum(im.precio);
      function setI(patch) { self.setState({ cosImpact: Object.assign({}, self.st().cosImpact || {}, patch, { done: false }) }); }
      out.imp2 = {
        rid: im.rid || '', recOpts: [{ v: '', label: 'Elige un recurso…' }].concat(R.rows.slice().sort(function (a, b) { return String(a.codigo).localeCompare(String(b.codigo)); }).map(function (r2) { return { v: r2.id, label: r2.codigo + ' · ' + r2.nombre }; })),
        setRec: function (e) { setI({ rid: e.target.value }); },
        hasRec: !!rr, cur: rr ? money(rr.precio) + (rr.vigdesde ? ' desde ' + fmtDdMmY(rr.vigdesde) : '') : '', curUlt: rr && rr.ultimo !== '' && Number(rr.ultimo) !== Number(rr.precio) ? 'Último importado: ' + money(rr.ultimo) + ' (por validar)' : '',
        precio: im.precio || '', setPrecio: function (e) { setI({ precio: e.target.value }); },
        fecha: im.fecha || todayIso(), setFecha: function (e) { setI({ fecha: e.target.value }); },
        fuentes: ['Compras', 'Cotización', 'Contrato'].map(function (f2) { return { n: f2, cls: (im.fuente || 'Compras') === f2 ? 'on' : '', pick: function () { setI({ fuente: f2 }); } }; }),
        motivo: im.motivo || '', setMotivo: function (e) { setI({ motivo: e.target.value }); },
        done: !!im.done
      };
      if (rr) {
        var its = this.cosImpacted(s, rr.id);
        var O = s.tables.byId.ot;
        var tot = 0;
        out.imp2.rows = its.map(function (it) {
          var c0 = self.cosCalc(s, it.a);
          var c1 = self.cosCalc(s, it.a, null, function (d) { return (d.recurso || [])[0] === rr.id && np != null ? np : Number(d.precio) || 0; });
          var nOt = O ? O.rows.filter(function (o2) { return (o2.partida || [])[0] === it.a.id; }).length : 0;
          tot += c1.pu - c0.pu;
          return { mat: it.a.matricula + ' v' + it.a.version, name: it.a.partida, estado: it.a.estado, q: fmtNumber(self.cosQty(it.a, it.d), 'number', 4) + ' ' + (rr.unidad || ''), used: money(it.d.precio), puA: money(c0.pu), puB: np == null ? '—' : money(c1.pu), d: np == null ? '' : ((c1.pu - c0.pu) > 0 ? '+' : '') + fmtNumber(c1.pu - c0.pu, 'money', 2) + ' (' + pct(c0.pu, c1.pu) + ')', dCls: c1.pu > c0.pu ? 'up' : c1.pu < c0.pu ? 'down' : 'same', ots: nOt ? nOt + ' OT ya usan esta versión: conservan su importe' : '', open: function () { self.openRec('acu', it.a.id); } };
        });
        out.imp2.hasRows = its.length > 0; out.imp2.noRows = its.length === 0;
        out.imp2.summary = np == null ? 'Escribe el nuevo precio para ver el efecto.' : its.length + (its.length === 1 ? ' ACU vigente o en curso usa' : ' ACU vigentes o en curso usan') + ' este recurso. ' + (rr.precio !== '' ? 'Cambio de precio: ' + pct(rr.precio, np) + '.' : '');
        out.imp2.canApply = canEdit && np != null && !im.done;
        out.imp2.applyPrice = function () { self.cosImpactApply('price'); };
        out.imp2.applyVersions = function () { self.cosImpactApply('versions'); };
      } else { out.imp2.rows = []; out.imp2.hasRows = false; out.imp2.noRows = false; out.imp2.summary = ''; out.imp2.canApply = false; out.imp2.applyPrice = null; out.imp2.applyVersions = null; }
    }
    return out;
  }
});

(function () {
  var baseRv = Component.prototype.renderVals;
  Component.prototype.renderVals = function () {
    var self = this, out = baseRv.call(this);
    var s = this.st(), v = this.viewer(s), screen = s.screen;
    var isAdmin = v.role === 'admin';
    if (screen === 'negocio' && !isAdmin) screen = 'page';
    out.navBiz = screen === 'negocio' ? 'on' : ''; out.goBiz = function () { self.setScreen('negocio'); };
    out.scrBiz = screen === 'negocio'; out.biz = screen === 'negocio' ? this.bizData(s, v) : null;
    var cosOk = this.cosHas(s) && this.lvl(s, 'prc', v.role) !== 'none';
    out.hasCos = cosOk; out.navCos = screen === 'costos' ? 'on' : ''; out.goCos = function () { self.setScreen('costos'); };
    out.scrCos = screen === 'costos' && cosOk; out.cos = out.scrCos ? this.cosData(s, v) : null;
    out.scrCosNo = screen === 'costos' && !cosOk;
    out.icCalc = ICON['i-calc'];
    return out;
  };
})();
