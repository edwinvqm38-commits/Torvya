/* ================= módulo de ingeniería de costos: cortes, recursos, precios, ACU, contratos y OT ================= */
/* Datos inventados para el prototipo. Ninguna tarifa, matrícula ni regla corresponde a un contrato real. */
var FAMILIAS = [o('Mano de obra', 'blue'), o('Material', 'teal'), o('Equipo', 'violet'), o('Herramienta', 'gray'), o('EPP', 'amber'), o('Transporte', 'green')];
var EST_VAL = [so('Importado', 'gray', 'todo'), so('Por validar', 'amber', 'doing'), so('Validado', 'green', 'done'), so('Rechazado', 'red', 'done')];
var COS_BASE = [
  ['MO-001', 'Operario electricista', 'Mano de obra', 'hh', 28.50], ['MO-002', 'Oficial electricista', 'Mano de obra', 'hh', 23.40],
  ['MO-003', 'Ayudante', 'Mano de obra', 'hh', 19.80], ['MO-004', 'Supervisor de cuadrilla', 'Mano de obra', 'hh', 38.00],
  ['MT-101', 'Conector bimetálico 35-70 mm²', 'Material', 'und', 12.80], ['MT-102', 'Cable NYY 3x1x35 mm²', 'Material', 'm', 21.60],
  ['MT-103', 'Cinta aislante vinílica', 'Material', 'und', 6.90], ['MT-104', 'Fusible tipo K 10 A', 'Material', 'und', 18.40],
  ['MT-105', 'Aislador polimérico 10 kV', 'Material', 'und', 96.00],
  ['EP-201', 'Casco dieléctrico clase E', 'EPP', 'und', 48.00], ['EP-202', 'Guantes dieléctricos clase 0', 'EPP', 'par', 210.00],
  ['EP-203', 'Lentes de seguridad antiempañantes', 'EPP', 'und', 14.50], ['EP-204', 'Zapatos dieléctricos', 'EPP', 'par', 165.00],
  ['EP-205', 'Arnés de cuerpo completo', 'EPP', 'und', 320.00],
  ['HE-301', 'Pértiga telescópica 10 kV', 'Herramienta', 'h', 2.40], ['HE-302', 'Detector de tensión', 'Herramienta', 'h', 1.80],
  ['HE-303', 'Juego de herramientas aisladas', 'Herramienta', 'h', 1.10],
  ['EQ-401', 'Camión grúa 8 t', 'Equipo', 'hm', 145.00], ['EQ-402', 'Hidrolavadora', 'Equipo', 'hm', 22.00],
  ['TR-501', 'Camioneta 4x4 con conductor', 'Transporte', 'hv', 55.00], ['TR-502', 'Combustible diésel B5', 'Transporte', 'gal', 16.20]
];
/* cortes: archivos que llegan cada semana o mes; repiten recursos y a veces cambian precios */
var COS_CORTES = [
  { id: 'k1', name: 'Tarifas_2026-09_mensual.xlsx', fecha: '2026-09-30', periodo: 'Mensual', estado: 'Validado', by: 'marta', rows: 'all', changes: {} },
  { id: 'k2', name: 'Corte_semana41_2026-10-09.xlsx', fecha: '2026-10-09', periodo: 'Semanal', estado: 'Validado', by: 'marta',
    rows: ['MO-001', 'MO-003', 'MT-101', 'MT-102', 'MT-103', 'MT-104', 'EP-201', 'EP-203', 'HE-301', 'TR-501', 'TR-502', 'EQ-402'],
    changes: { 'EP-201': 52.50, 'TR-502': 16.85, 'MT-102': 22.40 }, extra: [['E-0202', 'GUANTE DIELECTRICO CL.0', 'EPP', 'par', 214.00, 'EP-202']] },
  { id: 'k3', name: 'Tarifas_2026-10_mensual.xlsx', fecha: '2026-10-31', periodo: 'Mensual', estado: 'Validado', by: 'marta', rows: 'all',
    changes: { 'MO-001': 29.36, 'MO-002': 24.10, 'MO-003': 20.39, 'MO-004': 39.14, 'EQ-401': 152.00, 'EP-202': 214.00 } },
  { id: 'k4', name: 'Corte_semana46_2026-11-13.xlsx', fecha: '2026-11-13', periodo: 'Semanal', estado: 'Por validar', by: 'marta',
    rows: ['MO-001', 'MO-003', 'MT-103', 'MT-104', 'EP-201', 'EP-202', 'HE-301', 'HE-302', 'TR-501', 'TR-502'],
    changes: { 'EP-201': 55.90, 'TR-502': 17.40 }, extra: [['MT-106', 'Terminal de compresión 35 mm²', 'Material', 'und', 4.30, null]] }
];
/* archivos de ejemplo que aún no se importan (para probar el flujo) */
var COS_SAMPLES = [
  { name: 'Corte_semana47_2026-11-20.xlsx', fecha: '2026-11-20', periodo: 'Semanal', rows: [
    ['MO-001', 'Operario electricista', 'Mano de obra', 'hh', 29.36], ['MO-003', 'Ayudante', 'Mano de obra', 'hh', 20.39],
    ['EP-201', 'Casco dieléctrico clase E', 'EPP', 'und', 55.90], ['EP-204', 'Zapatos dieléctricos', 'EPP', 'par', 172.00],
    ['TR-502', 'Combustible diésel B5', 'Transporte', 'gal', 17.10], ['MT-105', 'Aislador polimérico 10 kV', 'Material', 'und', 101.50],
    ['HER-0303', 'JGO. HERRAMIENTAS AISLADAS 1000V', 'Herramienta', 'h', 1.15], ['MT-107', 'Grapa de anclaje para cable autoportante', 'Material', 'und', 9.80]] },
  { name: 'Tarifas_2026-11_mensual.csv', fecha: '2026-11-30', periodo: 'Mensual', rows: [
    ['MO-001', 'Operario electricista', 'Mano de obra', 'hh', 29.36], ['MO-002', 'Oficial electricista', 'Mano de obra', 'hh', 24.10],
    ['MO-003', 'Ayudante', 'Mano de obra', 'hh', 20.39], ['MO-004', 'Supervisor de cuadrilla', 'Mano de obra', 'hh', 39.14],
    ['EQ-401', 'Camión grúa 8 t', 'Equipo', 'hm', 149.00], ['TR-501', 'Camioneta 4x4 con conductor', 'Transporte', 'hv', 58.00],
    ['EP-205', 'Arnés cuerpo completo c/ línea de vida', 'EPP', 'und', 335.00]] }
];

function cosPriceHistory() {
  /* devuelve { code: [{fecha, precio, corte, estado}] } siguiendo los cortes */
  var cur = {}, hist = {};
  COS_BASE.forEach(function (r) { cur[r[0]] = r[4]; hist[r[0]] = []; });
  COS_CORTES.forEach(function (k) {
    var codes = k.rows === 'all' ? COS_BASE.map(function (r) { return r[0]; }) : k.rows.slice();
    for (var c in k.changes) { cur[c] = k.changes[c]; if (codes.indexOf(c) < 0) codes.push(c); }
    codes.forEach(function (c) { if (hist[c]) hist[c].push({ fecha: k.fecha, precio: cur[c], corte: k.id, estado: k.estado }); });
    (k.extra || []).forEach(function (x) {
      var code = x[5] || x[0];
      if (!hist[code]) { hist[code] = []; }
      hist[code].push({ fecha: k.fecha, precio: x[4], corte: k.id, estado: k.estado, alias: x[5] ? x[0] : null, aliasDesc: x[5] ? x[1] : null, isNew: !x[5], def: x });
      if (x[5]) cur[x[5]] = x[4];
    });
  });
  return hist;
}
function cosPriceAt(hist, code, fecha, onlyValid) {
  var best = null;
  (hist[code] || []).forEach(function (h) { if (h.fecha <= fecha && (!onlyValid || h.estado === 'Validado') && (!best || h.fecha >= best.fecha)) best = h; });
  return best;
}

/* ---------- tablas del módulo «maestros» ---------- */
function seedMaestros() {
  var hist = cosPriceHistory();
  var cor = {
    id: 'cor', name: 'Cortes de tarifas', desc: 'Cada archivo de precios recibido (semanal o mensual). Lo importado queda «por validar» hasta revisarlo', color: '#7C3AED', icon: 'i-folder', abbr: 'Co', nextId: 5,
    props: [
      { key: 'archivo', name: 'Archivo', type: 'title' },
      { key: 'fecha', name: 'Fecha de corte', type: 'date', dateFmt: 'short' },
      { key: 'periodo', name: 'Periodicidad', type: 'select', options: [o('Semanal', 'blue'), o('Mensual', 'violet'), o('Extraordinario', 'amber')] },
      { key: 'filas', name: 'Filas', type: 'number' },
      { key: 'nuevos', name: 'Recursos nuevos', type: 'number' },
      { key: 'cambios', name: 'Cambios de precio', type: 'number' },
      { key: 'equiv', name: 'Equivalencias', type: 'number', desc: 'Filas con otro código o descripción que se reconocieron como un recurso existente' },
      { key: 'estado', name: 'Validación', type: 'status', options: EST_VAL },
      { key: 'importo', name: 'Importó', type: 'person', single: true },
      { key: 'precios', name: 'Precios', type: 'relation', target: 'prc', pair: 'corte' }
    ],
    rows: [], views: [mkView('vk1', 'Cortes', 'table', { hidden: ['precios'], sorts: [{ prop: 'fecha', dir: 'desc' }] })], automations: []
  };
  var rec = {
    id: 'rec', name: 'Recursos', desc: 'Maestro único de recursos: un código estable, sus equivalencias y su historial de precios', color: '#7C3AED', icon: 'i-boxes', abbr: 'Re', nextId: 1,
    props: [
      { key: 'nombre', name: 'Recurso', type: 'title' },
      { key: 'codigo', name: 'Código', type: 'text' },
      { key: 'familia', name: 'Familia', type: 'select', options: FAMILIAS },
      { key: 'unidad', name: 'Unidad', type: 'text' },
      { key: 'precio', name: 'Precio vigente', type: 'number', fmt: 'money', dec: 2, desc: 'Último precio validado con vigencia hasta hoy' },
      { key: 'vigdesde', name: 'Vigente desde', type: 'date', dateFmt: 'short' },
      { key: 'anterior', name: 'Precio anterior', type: 'number', fmt: 'money', dec: 2 },
      { key: 'variacion', name: 'Variación', type: 'formula', expr: '=SI(O(ESBLANCO([Precio anterior]); [Precio anterior] = 0); ""; REDONDEAR(([Precio vigente] - [Precio anterior]) / [Precio anterior] * 100; 1))', resFmt: 'percent', resDec: 1 },
      { key: 'ultimo', name: 'Último importado', type: 'number', fmt: 'money', dec: 2, desc: 'Precio del corte más reciente, aunque falte validarlo' },
      { key: 'estado', name: 'Validación', type: 'status', options: [so('Importado', 'gray', 'todo'), so('Cambio por validar', 'amber', 'doing'), so('Validado', 'green', 'done')] },
      { key: 'alias', name: 'Equivalencias', type: 'text', desc: 'Otros códigos o descripciones con que llega en los archivos' },
      { key: 'fuente', name: 'Fuente', type: 'text' },
      { key: 'precios', name: 'Historial de precios', type: 'relation', target: 'prc', pair: 'recurso' },
      { key: 'nprec', name: 'Nº de precios', type: 'rollup', rel: 'precios', prop: 'precio', fn: 'count' }
    ],
    rows: [],
    views: [
      mkView('vr1', 'Maestro', 'table', { hidden: ['precios', 'fuente', 'anterior'], group: 'familia' }),
      mkView('vr2', 'Por validar', 'table', { filters: [{ prop: 'estado', op: 'is_not', value: 'Validado' }], hidden: ['precios', 'anterior'] })
    ], automations: []
  };
  var prc = {
    id: 'prc', name: 'Historial de precios', desc: 'Un registro por precio observado: fecha de vigencia, fuente y validación. Nunca se sobrescribe', color: '#7C3AED', icon: 'i-trend', abbr: 'Pr', nextId: 1,
    props: [
      { key: 'reg', name: 'Registro', type: 'title' },
      { key: 'recurso', name: 'Recurso', type: 'relation', target: 'rec', pair: 'precios', single: true },
      { key: 'precio', name: 'Precio', type: 'number', fmt: 'money', dec: 2 },
      { key: 'vigencia', name: 'Vigente desde', type: 'date', dateFmt: 'short' },
      { key: 'fuente', name: 'Fuente', type: 'select', options: [o('Corte importado', 'violet'), o('Compras', 'blue'), o('Cotización', 'teal'), o('Contrato', 'green')] },
      { key: 'corte', name: 'Corte', type: 'relation', target: 'cor', pair: 'precios', single: true },
      { key: 'codorig', name: 'Código en el archivo', type: 'text' },
      { key: 'estado', name: 'Validación', type: 'status', options: EST_VAL },
      { key: 'motivo', name: 'Motivo', type: 'text' }
    ],
    rows: [], views: [mkView('vh1', 'Historial', 'table', { group: 'corte', hidden: ['motivo'] }), mkView('vh2', 'Por validar', 'table', { filters: [{ prop: 'estado', op: 'is', value: 'Importado' }] })], automations: []
  };
  var n = 0, recIds = {};
  var codes = Object.keys(hist);
  codes.forEach(function (code, i) {
    var base = COS_BASE.filter(function (r) { return r[0] === code; })[0];
    var first = hist[code][0];
    var def = base || first.def;
    var id = 'rc' + (i + 1);
    recIds[code] = id;
    var aliases = hist[code].filter(function (h) { return h.alias; }).map(function (h) { return h.alias + ' «' + h.aliasDesc + '»'; });
    rec.rows.push(mkRow(id, i + 1, { nombre: def[1], codigo: code, familia: def[2], unidad: def[3], alias: aliases.join('; '), precios: [] }, '2026-09-30T10:00', 'marta'));
    hist[code].forEach(function (h) {
      n++;
      prc.rows.push(mkRow('pz' + n, n, { reg: code + ' · ' + fmtDdMmY(h.fecha), recurso: [id], precio: h.precio, vigencia: h.fecha, fuente: 'Corte importado', corte: [h.corte], codorig: h.alias || code, estado: h.estado, motivo: h.alias ? 'Llegó como ' + h.alias + '; se registró como equivalencia' : '' }, h.fecha + 'T09:00', 'marta'));
    });
  });
  rec.nextId = codes.length + 1; prc.nextId = n + 1;
  COS_CORTES.forEach(function (k, i) {
    var mine = prc.rows.filter(function (r) { return r.corte[0] === k.id; });
    cor.rows.push(mkRow(k.id, i + 1, { archivo: k.name, fecha: k.fecha, periodo: k.periodo, filas: mine.length, nuevos: i === 0 ? mine.length : (k.extra || []).filter(function (x) { return !x[5]; }).length, cambios: Object.keys(k.changes).length, equiv: (k.extra || []).filter(function (x) { return x[5]; }).length, estado: k.estado, importo: [k.by], precios: [] }, k.fecha + 'T08:30', k.by));
  });
  return { cor: cor, rec: rec, prc: prc, hist: hist, recIds: recIds };
}
function fmtDdMmY(iso) { var p = String(iso || '').split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso; }

/* ---------- tablas del módulo «acu» ---------- */
var ACU_DEFS = [
  { id: 'au1', mat: '100101', desc: 'Mantenimiento preventivo de subestación aérea monoposte', und: 'SED', ver: 1, rend: 4, corte: 'k1', fecha: '2026-09-30', estado: 'Vigente', tipo: 'Aprobada en contrato', gg: 12, ut: 8,
    lines: [['MO-001', 1, null], ['MO-003', 2, null], ['MO-004', 0.25, null], ['TR-501', 1, null], ['HE-301', 1, null], ['TR-502', null, 1.5], ['MT-103', null, 2], ['MT-104', null, 1], ['EP-201', null, 0.01], ['EP-202', null, 0.005]] },
  { id: 'au2', mat: '100101', desc: 'Mantenimiento preventivo de subestación aérea monoposte', und: 'SED', ver: 2, rend: 3.5, corte: 'k4', fecha: '2026-11-13', estado: 'Enviado', tipo: 'Propuesta al cliente', gg: 12, ut: 8,
    lines: [['MO-001', 1, null], ['MO-003', 2, null], ['MO-004', 0.25, null], ['TR-501', 1, null], ['HE-301', 1, null], ['HE-302', 1, null], ['TR-502', null, 1.5], ['MT-103', null, 3], ['MT-104', null, 1], ['EP-201', null, 0.01], ['EP-202', null, 0.005]] },
  { id: 'au3', mat: '100215', desc: 'Atención de emergencia en red de baja tensión', und: 'atención', ver: 1, rend: 5, corte: 'k3', fecha: '2026-10-31', estado: 'Vigente', tipo: 'Aprobada en contrato', gg: 12, ut: 8,
    lines: [['MO-001', 1, null], ['MO-003', 1, null], ['TR-501', 1, null], ['HE-303', 1, null], ['TR-502', null, 1.2], ['MT-103', null, 1], ['EP-201', null, 0.01]] },
  { id: 'au4', mat: '100322', desc: 'Cambio de aislador polimérico en red de media tensión', und: 'und', ver: 1, rend: 6, corte: 'k3', fecha: '2026-10-31', estado: 'Elaborado', tipo: 'Interna', gg: 14, ut: 10,
    lines: [['MO-001', 2, null], ['MO-002', 1, null], ['MO-003', 2, null], ['EQ-401', 1, null], ['HE-301', 1, null], ['MT-105', null, 1], ['MT-101', null, 2], ['EP-205', null, 0.003]] }
];
var ACU_ESTADOS = [so('Elaborado', 'gray', 'todo'), so('Enviado', 'blue', 'doing'), so('Observado', 'amber', 'doing'), so('Aprobado', 'violet', 'done'), so('Vigente', 'green', 'done'), so('Reemplazado', 'gray', 'done')];
var ACU_TIPOS = [o('Interna', 'gray'), o('Propuesta al cliente', 'blue'), o('Negociada', 'amber'), o('Aprobada en contrato', 'green')];
function seedAcu(m) {
  var acu = {
    id: 'acu', name: 'ACU', desc: 'Análisis de costos unitarios por matrícula y versión. Cada versión conserva los precios con que se calculó', color: '#B45309', icon: 'i-calc', abbr: 'Ac', nextId: 5,
    props: [
      { key: 'partida', name: 'Partida', type: 'title' },
      { key: 'matricula', name: 'Matrícula', type: 'text' },
      { key: 'version', name: 'Versión', type: 'number' },
      { key: 'estado', name: 'Estado', type: 'status', options: ACU_ESTADOS, desc: 'Elaborado, enviado, observado y aprobado son estados distintos' },
      { key: 'tipo', name: 'Tipo de tarifa', type: 'select', options: ACU_TIPOS, desc: 'Interna, propuesta, negociada o aprobada: no son lo mismo' },
      { key: 'unidad', name: 'Unidad', type: 'text' },
      { key: 'rend', name: 'Rendimiento', type: 'number', desc: 'Unidades por jornada de 8 horas' },
      { key: 'vigencia', name: 'Vigente desde', type: 'date', dateFmt: 'short' },
      { key: 'corte', name: 'Precios del corte', type: 'relation', target: 'cor', single: true },
      { key: 'detalle', name: 'Detalle', type: 'relation', target: 'acud', pair: 'acu' },
      { key: 'cd', name: 'Costo directo', type: 'rollup', rel: 'detalle', prop: 'parcial', fn: 'sum' },
      { key: 'gg', name: 'Gastos generales %', type: 'number', fmt: 'percent', desc: 'Por validar: parámetro editable, no un factor universal' },
      { key: 'ut', name: 'Utilidad %', type: 'number', fmt: 'percent', desc: 'Por validar' },
      { key: 'pu', name: 'Precio unitario', type: 'formula', expr: '=REDONDEAR([Costo directo] * (1 + [Gastos generales %] / 100) * (1 + [Utilidad %] / 100); 2)', resFmt: 'money', resDec: 2 },
      { key: 'sustento', name: 'Sustento', type: 'text' }
    ],
    rows: [], views: [mkView('va1', 'Por matrícula', 'table', { group: 'matricula', hidden: ['detalle', 'sustento'] }), mkView('va2', 'Por estado', 'board', { group: 'estado', hidden: ['detalle', 'sustento', 'estado', 'corte'] })], automations: []
  };
  var acud = {
    id: 'acud', name: 'Detalle de ACU', desc: 'Recursos de cada ACU con la cantidad y el precio usados en ese momento', color: '#B45309', icon: 'i-layers', abbr: 'Ad', nextId: 1,
    props: [
      { key: 'linea', name: 'Línea', type: 'title' },
      { key: 'acu', name: 'ACU', type: 'relation', target: 'acu', pair: 'detalle', single: true },
      { key: 'recurso', name: 'Recurso', type: 'relation', target: 'rec', pair: 'usos', single: true },
      { key: 'familia', name: 'Familia', type: 'select', options: FAMILIAS },
      { key: 'cuadrilla', name: 'Cuadrilla', type: 'number', desc: 'Para mano de obra, equipos y transporte: cantidad de personas o unidades. La cantidad se calcula con el rendimiento' },
      { key: 'rendacu', name: 'Rendimiento del ACU', type: 'rollup', rel: 'acu', prop: 'rend', fn: 'sum' },
      { key: 'cantfija', name: 'Cantidad fija', type: 'number', desc: 'Para materiales y EPP' },
      { key: 'cantidad', name: 'Cantidad', type: 'formula', expr: '=SI(ESBLANCO([Cuadrilla]); [Cantidad fija]; REDONDEAR([Cuadrilla] * 8 / [Rendimiento del ACU]; 4))', resDec: 4 },
      { key: 'precio', name: 'Precio usado', type: 'number', fmt: 'money', dec: 2, desc: 'Copia del precio vigente al calcular: no cambia si luego cambia el maestro' },
      { key: 'pfecha', name: 'Precio del', type: 'date', dateFmt: 'short' },
      { key: 'parcial', name: 'Parcial', type: 'formula', expr: '=REDONDEAR([Cantidad] * [Precio usado]; 4)', resFmt: 'money', resDec: 2 }
    ],
    rows: [], views: [mkView('vd1', 'Detalle', 'table', { group: 'acu', hidden: ['rendacu', 'pfecha'] })], automations: []
  };
  var hist = m.hist, n = 0;
  ACU_DEFS.forEach(function (a, i) {
    acu.rows.push(mkRow(a.id, i + 1, { partida: a.desc, matricula: a.mat, version: a.ver, estado: a.estado, tipo: a.tipo, unidad: a.und, rend: a.rend, vigencia: a.fecha, corte: [a.corte], detalle: [], gg: a.gg, ut: a.ut, sustento: a.ver > 1 ? 'Se agregó detector de tensión por exigencia de seguridad y bajó el rendimiento de 4 a 3.5 SED por jornada' : '' }, a.fecha + 'T11:00', 'marta'));
    a.lines.forEach(function (ln) {
      n++;
      var base = COS_BASE.filter(function (r) { return r[0] === ln[0]; })[0];
      var pr = cosPriceAt(hist, ln[0], a.fecha, false);
      acud.rows.push(mkRow('ad' + n, n, { linea: base[1], acu: [a.id], recurso: [m.recIds[ln[0]]], familia: base[2], cuadrilla: ln[1] == null ? '' : ln[1], cantfija: ln[2] == null ? '' : ln[2], precio: pr ? pr.precio : base[4], pfecha: pr ? pr.fecha : a.fecha }, a.fecha + 'T11:00', 'marta'));
    });
  });
  acud.nextId = n + 1;
  return { acu: acu, acud: acud };
}

/* ---------- tablas del módulo «ops»: contratos, servicios y OT/SST ---------- */
function seedOps(hasCli, cliId) {
  var ctr = {
    id: 'ctr', name: 'Contratos', desc: 'Contratos con clientes: modalidad económica, vigencia y servicios', color: '#0F766E', icon: 'i-handshake', abbr: 'Ct', nextId: 3,
    props: [
      { key: 'nombre', name: 'Contrato', type: 'title' },
      { key: 'codigo', name: 'Código', type: 'text' },
      hasCli ? { key: 'cliente', name: 'Cliente', type: 'relation', target: 'cli', pair: 'contratos', single: true } : { key: 'cliente', name: 'Cliente', type: 'text' },
      { key: 'modalidad', name: 'Modalidades', type: 'multi_select', options: [o('Precio unitario (ACU)', 'blue'), o('Costo fijo', 'violet'), o('Tarifa horaria', 'teal'), o('Mixta', 'amber')] },
      { key: 'inicio', name: 'Inicio', type: 'date', dateFmt: 'short' },
      { key: 'fin', name: 'Fin', type: 'date', dateFmt: 'short' },
      { key: 'moneda', name: 'Moneda', type: 'select', options: [o('Soles', 'green'), o('Dólares', 'blue')] },
      { key: 'estado', name: 'Estado', type: 'status', options: [so('En negociación', 'amber', 'todo'), so('Vigente', 'green', 'doing'), so('Cerrado', 'gray', 'done')] },
      { key: 'admin', name: 'Administrador del contrato', type: 'person', single: true },
      { key: 'servicios', name: 'Servicios', type: 'relation', target: 'srv', pair: 'contrato' },
      { key: 'reglas', name: 'Reglas de reconocimiento', type: 'text', desc: 'Por validar con el contrato: no se asumen reglas' }
    ],
    rows: [
      mkRow('ct1', 1, { nombre: 'Mantenimiento de redes de distribución 2026', codigo: 'CM-2026-01', cliente: hasCli ? [cliId] : 'Electro Andina Distribución (ficticia)', modalidad: ['Precio unitario (ACU)', 'Costo fijo'], inicio: '2026-01-01', fin: '2026-12-31', moneda: 'Soles', estado: 'Vigente', admin: ['ana'], servicios: [], reglas: 'Por validar: emergencias por costo fijo mensual; mantenimiento por precio unitario según ACU aprobado' }, '2026-01-02T09:00', 'ana'),
      mkRow('ct2', 2, { nombre: 'Lectura y medición zona sur', codigo: 'CM-2026-04', cliente: hasCli ? [cliId] : 'Electro Andina Distribución (ficticia)', modalidad: ['Tarifa horaria'], inicio: '2026-12-01', fin: '2027-11-30', moneda: 'Soles', estado: 'En negociación', admin: ['ana'], servicios: [], reglas: 'Por definir' }, '2026-11-02T09:00', 'ana')
    ],
    views: [mkView('vc1', 'Contratos', 'table', { hidden: ['reglas'] })], automations: []
  };
  var srv = {
    id: 'srv', name: 'Servicios', desc: 'Prestaciones de cada contrato. No todo es un proyecto: muchos son continuos o por orden de trabajo', color: '#0F766E', icon: 'i-layers', abbr: 'Sv', nextId: 4,
    props: [
      { key: 'nombre', name: 'Servicio', type: 'title' },
      { key: 'contrato', name: 'Contrato', type: 'relation', target: 'ctr', pair: 'servicios', single: true },
      { key: 'tipo', name: 'Tipo', type: 'select', options: [o('Mantenimiento BT', 'blue'), o('Mantenimiento MT', 'violet'), o('Emergencias', 'red'), o('Medición', 'teal'), o('Obras', 'amber')] },
      { key: 'modalidad', name: 'Modalidad económica', type: 'select', options: [o('Precio unitario (ACU)', 'blue'), o('Costo fijo mensual', 'violet'), o('Tarifa horaria', 'teal'), o('Mixta', 'amber')] },
      { key: 'gestion', name: 'Unidad de gestión', type: 'select', options: [o('Servicio continuo', 'green'), o('Por OT/SST', 'blue'), o('Proyecto', 'amber')] },
      { key: 'ots', name: 'Órdenes de trabajo', type: 'relation', target: 'ot', pair: 'servicio' },
      { key: 'nots', name: 'Nº de OT', type: 'rollup', rel: 'ots', prop: 'codigo', fn: 'count' },
      { key: 'hh', name: 'HH ejecutadas', type: 'rollup', rel: 'ots', prop: 'hh', fn: 'sum' },
      { key: 'importe', name: 'Importe reconocido', type: 'rollup', rel: 'ots', prop: 'importe', fn: 'sum' }
    ],
    rows: [
      mkRow('sv1', 1, { nombre: 'Mantenimiento preventivo de subestaciones', contrato: ['ct1'], tipo: 'Mantenimiento MT', modalidad: 'Precio unitario (ACU)', gestion: 'Por OT/SST', ots: [] }, '2026-01-02T09:00', 'ana'),
      mkRow('sv2', 2, { nombre: 'Atención de emergencias BT', contrato: ['ct1'], tipo: 'Emergencias', modalidad: 'Costo fijo mensual', gestion: 'Servicio continuo', ots: [] }, '2026-01-02T09:00', 'ana'),
      mkRow('sv3', 3, { nombre: 'Lectura de medidores', contrato: ['ct2'], tipo: 'Medición', modalidad: 'Tarifa horaria', gestion: 'Servicio continuo', ots: [] }, '2026-11-02T09:00', 'ana')
    ],
    views: [mkView('vs1', 'Servicios', 'table', { group: 'contrato' })], automations: []
  };
  var est = [so('Programada', 'gray', 'todo'), so('En ejecución', 'blue', 'doing'), so('Ejecutada', 'violet', 'doing'), so('Verificada', 'teal', 'doing'), so('Observada', 'amber', 'doing'), so('Reconocida', 'green', 'done')];
  var ot = {
    id: 'ot', name: 'Órdenes de trabajo', desc: 'OT, SST e incidencias. Se ligan a un servicio sin necesidad de crear un proyecto', color: '#0F766E', icon: 'i-wrench', abbr: 'OT', nextId: 9,
    props: [
      { key: 'codigo', name: 'SST / OT', type: 'title' },
      { key: 'servicio', name: 'Servicio', type: 'relation', target: 'srv', pair: 'ots', single: true },
      { key: 'tipo', name: 'Tipo de trabajo', type: 'select', options: [o('Preventivo', 'blue'), o('Correctivo', 'violet'), o('Emergencia', 'red'), o('Incidencia', 'amber'), o('Inspección', 'teal')] },
      { key: 'fecha', name: 'Fecha', type: 'date', dateFmt: 'short' },
      { key: 'lugar', name: 'Ubicación', type: 'place' },
      { key: 'estado', name: 'Estado', type: 'status', options: est, desc: 'Programado, ejecutado, verificado y reconocido no son lo mismo' },
      { key: 'cuadrilla', name: 'Cuadrilla', type: 'select', options: [o('CBT-01', 'blue'), o('CBT-02', 'teal'), o('CMT-01', 'violet'), o('EMG-01', 'red')] },
      { key: 'vehiculo', name: 'Vehículo', type: 'select', options: [o('Camioneta ABX-412', 'gray'), o('Camioneta BKD-118', 'gray'), o('Camión grúa CGR-905', 'amber')] },
      { key: 'movil', name: 'Movilización', type: 'text', desc: 'Varias OT atendidas en un mismo viaje comparten código: así no se reparten km ni horas al azar' },
      { key: 'hh', name: 'HH', type: 'number', desc: 'Horas-hombre. No se mezclan con horas-equipo ni horas-vehículo' },
      { key: 'hv', name: 'Horas-vehículo', type: 'number' },
      { key: 'km', name: 'Km', type: 'number' },
      { key: 'tkm', name: 'Origen del recorrido', type: 'select', options: [o('Registrado (GPS)', 'green'), o('Reconstruido', 'blue'), o('Estimado', 'amber'), o('Reconocido por el cliente', 'violet')] },
      { key: 'partida', name: 'Partida (ACU)', type: 'relation', target: 'acu', pair: 'ots', single: true },
      { key: 'prog', name: 'Cant. programada', type: 'number' },
      { key: 'ejec', name: 'Cant. ejecutada', type: 'number' },
      { key: 'verif', name: 'Cant. verificada', type: 'number' },
      { key: 'recon', name: 'Cant. reconocida', type: 'number' },
      { key: 'pu', name: 'PU de la partida', type: 'rollup', rel: 'partida', prop: 'pu', fn: 'sum' },
      { key: 'importe', name: 'Importe reconocido', type: 'formula', expr: '=SI(ESBLANCO([Cant. reconocida]); 0; REDONDEAR([Cant. reconocida] * [PU de la partida]; 2))', resFmt: 'money', resDec: 2 },
      { key: 'evid', name: 'Evidencias', type: 'files' }
    ],
    rows: [], views: [
      mkView('vo1', 'Órdenes', 'table', { hidden: ['evid', 'prog', 'hv', 'lugar'] }),
      mkView('vo2', 'Por estado', 'board', { group: 'estado', hidden: ['estado', 'evid', 'prog', 'ejec', 'verif', 'hv', 'tkm', 'movil', 'lugar', 'pu'] }),
      mkView('vo3', 'Calendario', 'calendar', { dateProp: 'fecha' })
    ], automations: []
  };
  var O = function (id, n, cod, sv, tipo, fecha, lugar, estado, cua, veh, mov, hh, hv, km, tkm, part, prog, ejec, verif, recon, ev) {
    return mkRow(id, n, { codigo: cod, servicio: [sv], tipo: tipo, fecha: fecha, lugar: lugar, estado: estado, cuadrilla: cua, vehiculo: veh, movil: mov, hh: hh, hv: hv, km: km, tkm: tkm, partida: part ? [part] : [], prog: prog, ejec: ejec, verif: verif, recon: recon, evid: ev }, fecha + 'T07:30', 'jorge');
  };
  ot.rows = [
    O('ot1', 1, 'SST-26-0411', 'sv1', 'Preventivo', '2026-11-09', 'SED 4471 · Chorrillos', 'Reconocida', 'CMT-01', 'Camioneta ABX-412', 'MOV-1109-A', 18, 6, 42, 'Registrado (GPS)', 'au1', 2, 2, 2, 2, ['acta-0411.pdf']),
    O('ot2', 2, 'SST-26-0412', 'sv1', 'Preventivo', '2026-11-09', 'SED 4475 · Chorrillos', 'Reconocida', 'CMT-01', 'Camioneta ABX-412', 'MOV-1109-A', 9, 0, 0, 'Registrado (GPS)', 'au1', 1, 1, 1, 1, ['acta-0412.pdf']),
    O('ot3', 3, 'SST-26-0420', 'sv1', 'Preventivo', '2026-11-12', 'SED 5102 · Surco', 'Verificada', 'CMT-01', 'Camioneta BKD-118', 'MOV-1112-A', 27, 8, 58, 'Reconstruido', 'au1', 3, 3, 3, '', ['fotos-0420.zip']),
    O('ot4', 4, 'SST-26-0431', 'sv1', 'Correctivo', '2026-11-16', 'Alimentador SU-12 · San Juan de Miraflores', 'Ejecutada', 'CMT-01', 'Camión grúa CGR-905', 'MOV-1116-B', 16, 7, 35, 'Estimado', 'au4', 2, 2, '', '', []),
    O('ot5', 5, 'INC-26-1180', 'sv2', 'Emergencia', '2026-11-15', 'Av. Huaylas 1450 · Chorrillos', 'Reconocida', 'EMG-01', 'Camioneta BKD-118', 'MOV-1115-N', 6, 3, 21, 'Registrado (GPS)', 'au3', 1, 1, 1, 1, []),
    O('ot6', 6, 'INC-26-1181', 'sv2', 'Emergencia', '2026-11-15', 'Jr. Las Gardenias 220 · Surco', 'Observada', 'EMG-01', 'Camioneta BKD-118', 'MOV-1115-N', 4, 0, 0, 'Registrado (GPS)', 'au3', 1, 1, 0, '', []),
    O('ot7', 7, 'SST-26-0440', 'sv1', 'Inspección', '2026-11-19', 'SED 5230 · Villa El Salvador', 'Programada', 'CBT-02', 'Camioneta ABX-412', '', '', '', '', '', 'au2', 1, '', '', '', []),
    O('ot8', 8, 'INC-26-1195', 'sv2', 'Incidencia', '2026-11-17', 'Calle Los Pinos 88 · Barranco', 'En ejecución', 'EMG-01', 'Camioneta BKD-118', 'MOV-1117-N', 3, 2, 14, 'Estimado', 'au3', 1, '', '', '', [])
  ];
  return { ctr: ctr, srv: srv, ot: ot };
}

/* ---------- lector de Excel (.xlsx) y CSV en el navegador ---------- */
function xmlText(s) { return String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, function (m, d) { return String.fromCharCode(Number(d)); }).replace(/&amp;/g, '&'); }
async function unzipEntries(buf) {
  var u8 = new Uint8Array(buf), dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  var eocd = -1;
  for (var i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) { if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; } }
  if (eocd < 0) throw new Error('No es un archivo Excel válido (.xlsx)');
  var n = dv.getUint16(eocd + 10, true), off = dv.getUint32(eocd + 16, true), out = {};
  for (var k = 0; k < n; k++) {
    if (dv.getUint32(off, true) !== 0x02014b50) break;
    var method = dv.getUint16(off + 10, true), csize = dv.getUint32(off + 20, true), nlen = dv.getUint16(off + 28, true), xlen = dv.getUint16(off + 30, true), clen = dv.getUint16(off + 32, true), loff = dv.getUint32(off + 42, true);
    var name = new TextDecoder().decode(u8.subarray(off + 46, off + 46 + nlen));
    out[name] = { method: method, csize: csize, loff: loff };
    off += 46 + nlen + xlen + clen;
  }
  async function read(name) {
    var e = out[name];
    if (!e) return null;
    var lo = e.loff, start = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true);
    var data = u8.subarray(start, start + e.csize);
    if (e.method === 0) return new TextDecoder().decode(data);
    var ds = new DecompressionStream('deflate-raw');
    var stream = new Blob([data]).stream().pipeThrough(ds);
    return await new Response(stream).text();
  }
  return { names: Object.keys(out), read: read };
}
function colIdx(ref) { var m = /^([A-Z]+)/.exec(ref || ''); if (!m) return -1; var n = 0; for (var i = 0; i < m[1].length; i++) n = n * 26 + (m[1].charCodeAt(i) - 64); return n - 1; }
async function readXlsx(buf) {
  var z = await unzipEntries(buf);
  var shared = [], ss = await z.read('xl/sharedStrings.xml');
  if (ss) { var re = /<si>([\s\S]*?)<\/si>/g, m; while ((m = re.exec(ss))) { var parts = [], r2 = /<t[^>]*>([\s\S]*?)<\/t>/g, m2; while ((m2 = r2.exec(m[1]))) parts.push(xmlText(m2[1])); shared.push(parts.join('')); } }
  var sheets = z.names.filter(function (x) { return /^xl\/worksheets\/sheet\d+\.xml$/.test(x); }).sort();
  if (!sheets.length) throw new Error('El Excel no tiene hojas');
  var xml = await z.read(sheets[0]);
  var rows = [], rr = /<row[^>]*>([\s\S]*?)<\/row>/g, mr;
  while ((mr = rr.exec(xml))) {
    var row = [], rc = /<c ([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g, mc;
    while ((mc = rc.exec(mr[1]))) {
      var attrs = mc[1], body = mc[2] || '', ref = (/r="([A-Z]+\d+)"/.exec(attrs) || [])[1], t = (/t="(\w+)"/.exec(attrs) || [])[1];
      var v = (/<v>([\s\S]*?)<\/v>/.exec(body) || [])[1], val = '';
      if (t === 's') val = shared[Number(v)] || '';
      else if (t === 'inlineStr') { var it = /<t[^>]*>([\s\S]*?)<\/t>/.exec(body); val = it ? xmlText(it[1]) : ''; }
      else if (v != null) val = xmlText(v);
      var ci = colIdx(ref); if (ci < 0) ci = row.length;
      row[ci] = val;
    }
    for (var q = 0; q < row.length; q++) if (row[q] == null) row[q] = '';
    rows.push(row);
  }
  return rows;
}
function readCsv(text) {
  var first = String(text).split(/\r?\n/)[0] || '';
  var sep = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : (first.indexOf('\t') >= 0 ? '\t' : ',');
  var rows = [], row = [], cell = '', q = false;
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; continue; }
    if (ch === '"') q = true;
    else if (ch === sep) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(function (r) { return r.some(function (c) { return String(c).trim() !== ''; }); });
}
function normTxt(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
var SIM_STOP = { de: 1, del: 1, la: 1, el: 1, los: 1, las: 1, para: 1, con: 1, c: 1, y: 1, en: 1, x: 1 };
function skel(w) { return w.charAt(0) + w.slice(1).replace(/[aeiou]/g, ''); }
function simTxt(a, b) {
  var A = normTxt(a).split(' ').filter(function (w) { return w && !SIM_STOP[w]; }), B = normTxt(b).split(' ').filter(function (w) { return w && !SIM_STOP[w]; });
  if (!A.length || !B.length) return 0;
  var used = {}, hit = 0;
  A.forEach(function (x) {
    for (var j = 0; j < B.length; j++) {
      if (used[j]) continue;
      var y = B[j];
      var ok = x === y || (x.length >= 2 && y.length >= 2 && isNaN(Number(x)) && (x.indexOf(y) === 0 || y.indexOf(x) === 0));
      if (!ok && x.length >= 4 && y.length >= 4) ok = x.slice(0, 4) === y.slice(0, 4);
      if (!ok && isNaN(Number(x)) && isNaN(Number(y))) { var sx = skel(x), sy = skel(y); ok = Math.min(sx.length, sy.length) >= 2 && (sx.indexOf(sy) === 0 || sy.indexOf(sx) === 0); }
      if (ok) { used[j] = true; hit++; break; }
    }
  });
  if (hit < 2 && Math.min(A.length, B.length) > 1) return hit / Math.max(A.length, B.length);
  return hit / Math.min(A.length, B.length) * 0.6 + hit / Math.max(A.length, B.length) * 0.4;
}
function parseNum(v) { if (typeof v === 'number') return v; var s = String(v || '').replace(/[^0-9,.\-]/g, ''); if (s.indexOf(',') >= 0 && s.indexOf('.') >= 0) s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, ''); else s = s.replace(',', '.'); var n = parseFloat(s); return isNaN(n) ? null : n; }
/* encuentra encabezados y devuelve filas normalizadas */
function cosRowsFromTable(rows) {
  var hi = -1, map = null;
  for (var i = 0; i < Math.min(rows.length, 15); i++) {
    var h = rows[i].map(normTxt), m = {};
    h.forEach(function (c, j) {
      if (m.cod == null && /^(cod|codigo|item|cod recurso|codigo recurso)/.test(c)) m.cod = j;
      else if (m.desc == null && /(descrip|recurso|insumo|nombre)/.test(c)) m.desc = j;
      else if (m.und == null && /^(und|unidad|um|u m)/.test(c)) m.und = j;
      else if (m.fam == null && /(familia|tipo|categoria|grupo)/.test(c)) m.fam = j;
      else if (m.pre == null && /(precio|costo|tarifa|^pu|p u)/.test(c)) m.pre = j;
    });
    if (m.cod != null && m.pre != null) { hi = i; map = m; break; }
  }
  if (hi < 0) throw new Error('No encontré las columnas. El archivo debe tener al menos «Código» y «Precio» (y de preferencia «Descripción», «Unidad» y «Familia»).');
  var fams = FAMILIAS.map(function (x) { return x.v; });
  return rows.slice(hi + 1).map(function (r) {
    var fam = map.fam != null ? String(r[map.fam] || '').trim() : '';
    var fm = fams.filter(function (x) { return normTxt(x) === normTxt(fam) || normTxt(fam).indexOf(normTxt(x).slice(0, 5)) === 0; })[0] || '';
    return { cod: String(r[map.cod] || '').trim(), desc: map.desc != null ? String(r[map.desc] || '').trim() : '', und: map.und != null ? String(r[map.und] || '').trim() : '', fam: fm, precio: parseNum(r[map.pre]) };
  }).filter(function (x) { return x.cod && x.precio != null; });
}

Object.assign(Component.prototype, {
  /* ---------- utilidades de datos ---------- */
  cosHas(s) { return !!(s.tables.byId.rec && s.tables.byId.prc && s.tables.byId.cor); },
  cosRecByCode(t, code) {
    var c = normTxt(code);
    return t.rows.filter(function (r) { return normTxt(r.codigo) === c || String(r.alias || '').split(';').some(function (a) { return normTxt(a.split('«')[0]) === c && c; }); })[0] || null;
  },
  /* recalcula precio vigente, anterior, último importado y estado de cada recurso */
  cosRecompute(tables, onlyIds) {
    var R = tables.byId.rec, P = tables.byId.prc;
    if (!R || !P) return;
    var today = todayIso();
    R.rows.forEach(function (r) {
      if (onlyIds && onlyIds.indexOf(r.id) < 0) return;
      var hs = P.rows.filter(function (p) { return (p.recurso || [])[0] === r.id && p.estado !== 'Rechazado'; }).sort(function (a, b) { return String(a.vigencia).localeCompare(String(b.vigencia)) || String(a._cAt).localeCompare(String(b._cAt)); });
      var valid = hs.filter(function (p) { return p.estado === 'Validado' && p.vigencia <= today; });
      var cur = valid[valid.length - 1] || null, last = hs[hs.length - 1] || null;
      var prev = null;
      if (cur) for (var i = valid.length - 2; i >= 0; i--) { if (Number(valid[i].precio) !== Number(cur.precio)) { prev = valid[i]; break; } }
      r.precio = cur ? cur.precio : ''; r.vigdesde = cur ? cur.vigencia : ''; r.anterior = prev ? prev.precio : '';
      r.ultimo = last ? last.precio : '';
      var C = tables.byId.cor, kc = last && C ? findRow(C, (last.corte || [])[0]) : null;
      r.fuente = kc ? kc.archivo : (last ? last.fuente || '' : '');
      r.estado = !cur ? 'Importado' : (last && last !== cur && Number(last.precio) !== Number(cur.precio) && last.estado !== 'Validado') ? 'Cambio por validar' : 'Validado';
    });
  },
  cosLinesOf(s, acuId) {
    var D = s.tables.byId.acud;
    return D ? D.rows.filter(function (d) { return (d.acu || [])[0] === acuId; }) : [];
  },
  cosQty(a, d) { var c = d.cuadrilla; if (c !== '' && c != null && !isNaN(Number(c))) return Math.round(Number(c) * 8 / (Number(a.rend) || 1) * 10000) / 10000; return Number(d.cantfija) || 0; },
  cosCalc(s, a, lines, priceOf) {
    var self = this, cd = 0;
    var L = (lines || this.cosLinesOf(s, a.id)).map(function (d) { var q = self.cosQty(a, d), p = priceOf ? priceOf(d) : Number(d.precio) || 0; var par = Math.round(q * p * 10000) / 10000; cd += par; return { d: d, rid: (d.recurso || [])[0], q: q, p: p, par: par }; });
    var f = (1 + (Number(a.gg) || 0) / 100) * (1 + (Number(a.ut) || 0) / 100);
    return { lines: L, cd: cd, f: f, pu: Math.round(cd * f * 100) / 100 };
  },
  cosVersions(s, mat) {
    var A = s.tables.byId.acu;
    return A ? A.rows.filter(function (a) { return a.matricula === mat; }).sort(function (x, y) { return (Number(x.version) || 0) - (Number(y.version) || 0); }) : [];
  },
  cosMats(s) {
    var A = s.tables.byId.acu, seen = {}, out = [];
    if (!A) return out;
    A.rows.forEach(function (a) { if (!seen[a.matricula]) { seen[a.matricula] = 1; out.push(a.matricula); } });
    return out;
  },
  /* explica la diferencia entre dos versiones de un ACU */
  cosCompare(s, a1, a2) {
    var self = this, R = s.tables.byId.rec;
    var c1 = this.cosCalc(s, a1), c2 = this.cosCalc(s, a2);
    var by1 = {}, by2 = {};
    c1.lines.forEach(function (x) { by1[x.rid] = x; }); c2.lines.forEach(function (x) { by2[x.rid] = x; });
    var ids = Object.keys(by1); Object.keys(by2).forEach(function (k) { if (ids.indexOf(k) < 0) ids.push(k); });
    var eff = { precio: 0, cantidad: 0, rend: 0, nuevo: 0, retirado: 0 };
    var rows = ids.map(function (rid) {
      var x = by1[rid], y = by2[rid], rr = R ? findRow(R, rid) : null;
      var name = rr ? rr.nombre : (x || y).d.linea, fam = (x || y).d.familia;
      var dPrecio = 0, dCant = 0, dRend = 0, causa = '';
      if (x && y) {
        dPrecio = (y.p - x.p) * x.q;
        var qCua1 = x.d.cuadrilla !== '' && x.d.cuadrilla != null, sameCua = qCua1 && Number(x.d.cuadrilla) === Number(y.d.cuadrilla);
        var dq = (y.q - x.q) * y.p;
        if (sameCua && Number(a1.rend) !== Number(a2.rend)) dRend = dq; else dCant = dq;
        var parts = [];
        if (Math.abs(dPrecio) > 0.00005) parts.push('precio ' + fmtNumber(x.p, 'money', 2) + ' → ' + fmtNumber(y.p, 'money', 2));
        if (Math.abs(dRend) > 0.00005) parts.push('rendimiento');
        if (Math.abs(dCant) > 0.00005) parts.push('cantidad ' + fmtNumber(x.q, 'number', 4) + ' → ' + fmtNumber(y.q, 'number', 4));
        causa = parts.length ? parts.join(' y ') : 'Sin cambio';
      } else if (y) { causa = 'Recurso nuevo'; } else { causa = 'Recurso retirado'; }
      var delta = (y ? y.par : 0) - (x ? x.par : 0);
      if (x && y) { eff.precio += dPrecio; eff.cantidad += dCant; eff.rend += dRend; }
      else if (y) eff.nuevo += delta; else eff.retirado += delta;
      return { rid: rid, name: name, fam: fam, q1: x ? x.q : null, q2: y ? y.q : null, p1: x ? x.p : null, p2: y ? y.p : null, par1: x ? x.par : 0, par2: y ? y.par : 0, delta: delta, causa: causa };
    });
    rows.sort(function (a, b) { return Math.abs(b.delta) - Math.abs(a.delta); });
    var dFactor = c2.cd * (c2.f - c1.f);
    var comps = [
      { id: 'precio', n: 'Precios de recursos', v: eff.precio * c1.f }, { id: 'rend', n: 'Rendimiento', v: eff.rend * c1.f },
      { id: 'cantidad', n: 'Cantidades', v: eff.cantidad * c1.f }, { id: 'nuevo', n: 'Recursos nuevos', v: eff.nuevo * c1.f },
      { id: 'retirado', n: 'Recursos retirados', v: eff.retirado * c1.f }, { id: 'factor', n: 'Gastos generales y utilidad', v: dFactor }
    ];
    return { c1: c1, c2: c2, rows: rows, comps: comps, dPu: c2.pu - c1.pu };
  },

  /* ---------- importación de cortes ---------- */
  cosStartImport(name, fecha, periodo, rawRows) {
    var s = this.st();
    var m = /(\d{4})-(\d{2})-(\d{2})/.exec(name || '');
    this.setState({ cosTab: 'cortes', cosImp: { name: name, fecha: fecha || (m ? m[0] : todayIso()), periodo: periodo || (/seman/i.test(name) ? 'Semanal' : /mens/i.test(name) ? 'Mensual' : 'Extraordinario'), rows: rawRows, dec: {}, err: '' } });
  },
  cosSample(i) {
    var sm = COS_SAMPLES[i];
    this.cosStartImport(sm.name, sm.fecha, sm.periodo, sm.rows.map(function (r) { return { cod: r[0], desc: r[1], fam: r[2], und: r[3], precio: r[4] }; }));
  },
  async cosFile(e) {
    var self = this, f = null;
    try { f = e.target.files[0]; e.target.value = ''; } catch (err) { f = null; }
    if (!f) return;
    try {
      var rows;
      if (/\.csv$|\.txt$/i.test(f.name)) rows = readCsv(await f.text());
      else if (/\.xlsx$/i.test(f.name)) rows = await readXlsx(await f.arrayBuffer());
      else throw new Error('Usa un archivo .xlsx o .csv. Los .xls antiguos se pueden guardar como .xlsx desde Excel.');
      var norm = cosRowsFromTable(rows);
      if (!norm.length) throw new Error('No encontré filas con código y precio.');
      self.cosStartImport(f.name, null, null, norm);
    } catch (err) {
      self.setState({ cosTab: 'cortes', cosImp: { name: f.name, fecha: todayIso(), periodo: 'Extraordinario', rows: [], dec: {}, err: String(err && err.message || err) } });
    }
  },
  cosAnalyze(s, imp) {
    var self = this, R = s.tables.byId.rec, P = s.tables.byId.prc;
    return (imp.rows || []).map(function (x, i) {
      var r = self.cosRecByCode(R, x.cod), kind, ref = null, cand = null, score = 0, prev = null;
      if (r) {
        ref = r;
        var hs = P.rows.filter(function (p) { return (p.recurso || [])[0] === r.id && p.estado !== 'Rechazado' && p.vigencia <= imp.fecha; }).sort(function (a, b) { return String(a.vigencia).localeCompare(String(b.vigencia)); });
        prev = hs.length ? Number(hs[hs.length - 1].precio) : null;
        kind = prev == null ? 'primero' : Math.abs(prev - x.precio) < 0.005 ? 'igual' : 'cambio';
      } else {
        R.rows.forEach(function (rr) { var sc = simTxt(x.desc, rr.nombre); if (sc > score) { score = sc; cand = rr; } });
        kind = score >= 0.6 ? 'duda' : 'nuevo';
      }
      var d = imp.dec[i] || (kind === 'duda' ? 'same' : '');
      return { i: i, x: x, kind: kind, ref: ref, cand: kind === 'duda' ? cand : null, score: score, prev: prev, dec: d };
    });
  },
  cosConfirm() {
    var self = this, s = this.st(), v = this.viewer(s), imp = s.cosImp;
    if (!imp || !imp.rows.length) return;
    var l = this.lvl(s, 'prc', v.role);
    if (l !== 'edit' && l !== 'full') { this.toastMsg('Con tu permiso no puedes importar precios.'); return; }
    var an = this.cosAnalyze(s, imp);
    var tables = clone(s.tables), R = tables.byId.rec, P = tables.byId.prc, C = tables.byId.cor;
    var seq = s.seq, now = nowIso();
    var kid = 'k' + (++seq);
    var stats = { nuevos: 0, cambios: 0, equiv: 0 };
    var touched = [];
    C.rows.push({ id: kid, _n: C.nextId++, _cAt: now, _cBy: v.id, _eAt: now, _eBy: v.id, _body: '', archivo: imp.name, fecha: imp.fecha, periodo: imp.periodo, filas: an.length, nuevos: 0, cambios: 0, equiv: 0, estado: 'Por validar', importo: [v.id], precios: [] });
    an.forEach(function (a) {
      var target = a.ref ? findRow(R, a.ref.id) : null;
      if (!target && a.kind === 'duda' && a.dec === 'same' && a.cand) { target = findRow(R, a.cand.id); target.alias = (target.alias ? target.alias + '; ' : '') + a.x.cod + ' «' + a.x.desc + '»'; stats.equiv++; }
      if (!target) {
        var rid = 'rc' + (++seq);
        target = { id: rid, _n: R.nextId++, _cAt: now, _cBy: v.id, _eAt: now, _eBy: v.id, _body: '', nombre: a.x.desc || a.x.cod, codigo: a.x.cod, familia: a.x.fam || '', unidad: a.x.und || '', alias: '', precios: [], estado: 'Importado' };
        R.rows.push(target); stats.nuevos++;
      }
      if (a.kind === 'cambio') stats.cambios++;
      var pid = 'pz' + (++seq);
      P.rows.push({ id: pid, _n: P.nextId++, _cAt: now, _cBy: v.id, _eAt: now, _eBy: v.id, _body: '', reg: target.codigo + ' · ' + fmtDdMmY(imp.fecha), recurso: [target.id], precio: a.x.precio, vigencia: imp.fecha, fuente: 'Corte importado', corte: [kid], codorig: a.x.cod, estado: 'Importado', motivo: a.kind === 'duda' && a.dec === 'same' ? 'Equivalencia confirmada por ' + v.name.split(' ')[0] : '' });
      target.precios = (target.precios || []).concat([pid]);
      findRow(C, kid).precios.push(pid);
      touched.push(target.id);
    });
    var k = findRow(C, kid); k.nuevos = stats.nuevos; k.cambios = stats.cambios; k.equiv = stats.equiv;
    this.cosRecompute(tables, touched);
    this.setState({ tables: tables, seq: seq, cosImp: null, cosSelK: kid, log: this.addLog(s, ['importó el corte ' + imp.name + ' (' + an.length + ' filas, ' + stats.cambios + ' cambios de precio)']) });
    this.toastMsg('Corte importado: ' + an.length + ' precios quedan «por validar». ' + stats.nuevos + ' recursos nuevos, ' + stats.cambios + ' cambios y ' + stats.equiv + ' equivalencias.');
  },
  cosValidate(kid, ok) {
    var s = this.st(), v = this.viewer(s), l = this.lvl(s, 'prc', v.role);
    if (l !== 'edit' && l !== 'full') { this.toastMsg('Con tu permiso no puedes validar precios.'); return; }
    var tables = clone(s.tables), P = tables.byId.prc, C = tables.byId.cor, k = findRow(C, kid);
    if (!k) return;
    var touched = [];
    P.rows.forEach(function (p) { if ((p.corte || [])[0] === kid && (p.estado === 'Importado' || p.estado === 'Por validar')) { p.estado = ok ? 'Validado' : 'Rechazado'; p._eAt = nowIso(); p._eBy = v.id; touched.push((p.recurso || [])[0]); } });
    k.estado = ok ? 'Validado' : 'Rechazado';
    this.cosRecompute(tables, touched);
    this.setState({ tables: tables, log: this.addLog(s, [(ok ? 'validó' : 'rechazó') + ' el corte ' + k.archivo]) });
    this.toastMsg(ok ? 'Corte validado: el precio vigente de ' + touched.length + ' recursos se actualizó. Los ACU aprobados no cambian.' : 'Corte rechazado: sus precios no se usarán.');
  },
  cosValidatePrice(pid, ok) {
    var s = this.st(), v = this.viewer(s), l = this.lvl(s, 'prc', v.role);
    if (l !== 'edit' && l !== 'full') { this.toastMsg('Con tu permiso no puedes validar precios.'); return; }
    var tables = clone(s.tables), p = findRow(tables.byId.prc, pid);
    if (!p) return;
    p.estado = ok ? 'Validado' : 'Rechazado'; p._eAt = nowIso(); p._eBy = v.id;
    this.cosRecompute(tables, [(p.recurso || [])[0]]);
    this.setState({ tables: tables });
  },
  /* registra un precio nuevo (compras, cotización) y crea versiones de ACU sin tocar las aprobadas */
  cosImpactApply(mode) {
    var self = this, s = this.st(), v = this.viewer(s), im = s.cosImpact || {};
    var R = s.tables.byId.rec, rr = im.rid ? findRow(R, im.rid) : null, np = parseNum(im.precio);
    if (!rr || np == null) { this.toastMsg('Elige un recurso y escribe el nuevo precio.'); return; }
    var l = this.lvl(s, 'prc', v.role);
    if (l !== 'edit' && l !== 'full') { this.toastMsg('Con tu permiso no puedes registrar precios.'); return; }
    var tables = clone(s.tables), P = tables.byId.prc, seq = s.seq, now = nowIso(), fecha = im.fecha || todayIso();
    var pid = 'pz' + (++seq);
    P.rows.push({ id: pid, _n: P.nextId++, _cAt: now, _cBy: v.id, _eAt: now, _eBy: v.id, _body: '', reg: rr.codigo + ' · ' + fmtDdMmY(fecha), recurso: [rr.id], precio: np, vigencia: fecha, fuente: im.fuente || 'Compras', corte: [], codorig: rr.codigo, estado: 'Por validar', motivo: im.motivo || '' });
    var R2 = tables.byId.rec, r2 = findRow(R2, rr.id); r2.precios = (r2.precios || []).concat([pid]);
    var made = [];
    if (mode === 'versions' && tables.byId.acu) {
      var A = tables.byId.acu, D = tables.byId.acud;
      this.cosImpacted(s, rr.id).forEach(function (it) {
        var a = findRow(A, it.a.id), nid = 'au' + (++seq);
        var maxV = A.rows.filter(function (x) { return x.matricula === a.matricula; }).reduce(function (m, x) { return Math.max(m, Number(x.version) || 0); }, 0);
        var na = { id: nid, _n: A.nextId++, _cAt: now, _cBy: v.id, _eAt: now, _eBy: v.id, _body: '', partida: a.partida, matricula: a.matricula, version: maxV + 1, estado: 'Elaborado', tipo: 'Interna', unidad: a.unidad, rend: a.rend, vigencia: fecha, corte: [], detalle: [], gg: a.gg, ut: a.ut, sustento: 'Nueva versión por cambio de precio de ' + rr.nombre + ' (' + fmtNumber(rr.precio, 'money', 2) + ' → ' + fmtNumber(np, 'money', 2) + '). ' + (im.motivo || '') };
        A.rows.push(na);
        D.rows.filter(function (d) { return (d.acu || [])[0] === a.id; }).forEach(function (d) {
          var did = 'ad' + (++seq);
          var nd = clone(d); nd.id = did; nd._n = D.nextId++; nd._cAt = now; nd._cBy = v.id; nd._eAt = now; nd._eBy = v.id; nd.acu = [nid];
          if ((d.recurso || [])[0] === rr.id) { nd.precio = np; nd.pfecha = fecha; }
          D.rows.push(nd); na.detalle.push(did);
          var rx = findRow(R2, (d.recurso || [])[0]); if (rx && rx.usos) rx.usos = rx.usos.concat([did]);
        });
        made.push(a.matricula + ' v' + na.version);
      });
    }
    this.cosRecompute(tables, [rr.id]);
    this.setState({ tables: tables, seq: seq, cosImpact: Object.assign({}, im, { done: true }), log: this.addLog(s, ['registró precio de ' + rr.nombre + ': ' + fmtNumber(np, 'money', 2) + (made.length ? ' y creó ' + made.join(', ') : '')]) });
    this.toastMsg(made.length ? 'Precio registrado (por validar) y nuevas versiones en elaboración: ' + made.join(', ') + '. Las versiones aprobadas no cambiaron.' : 'Precio registrado como «por validar». No cambia ningún ACU hasta que lo decidas.');
  },
  /* versión más reciente de cada matrícula que usa el recurso */
  cosImpacted(s, rid) {
    var self = this, out = [];
    this.cosMats(s).forEach(function (mat) {
      var vs = self.cosVersions(s, mat).filter(function (a) { return a.estado !== 'Reemplazado'; });
      var a = vs[vs.length - 1];
      if (!a) return;
      var lines = self.cosLinesOf(s, a.id), hit = lines.filter(function (d) { return (d.recurso || [])[0] === rid; })[0];
      if (hit) out.push({ a: a, d: hit });
    });
    return out;
  },
  cosNewVersion(acuId) {
    var s = this.st(), v = this.viewer(s), l = this.lvl(s, 'acu', v.role);
    if (l !== 'edit' && l !== 'full') { this.toastMsg('Con tu permiso no puedes crear versiones de ACU.'); return; }
    var tables = clone(s.tables), A = tables.byId.acu, D = tables.byId.acud, R = tables.byId.rec, a = findRow(A, acuId), seq = s.seq, now = nowIso();
    if (!a) return;
    var maxV = A.rows.filter(function (x) { return x.matricula === a.matricula; }).reduce(function (m, x) { return Math.max(m, Number(x.version) || 0); }, 0);
    var nid = 'au' + (++seq), changed = 0;
    var na = { id: nid, _n: A.nextId++, _cAt: now, _cBy: v.id, _eAt: now, _eBy: v.id, _body: '', partida: a.partida, matricula: a.matricula, version: maxV + 1, estado: 'Elaborado', tipo: 'Interna', unidad: a.unidad, rend: a.rend, vigencia: todayIso(), corte: [], detalle: [], gg: a.gg, ut: a.ut, sustento: 'Recalculado con los precios vigentes validados al ' + fmtDdMmY(todayIso()) };
    A.rows.push(na);
    D.rows.filter(function (d) { return (d.acu || [])[0] === a.id; }).forEach(function (d) {
      var nd = clone(d), r = findRow(R, (d.recurso || [])[0]);
      nd.id = 'ad' + (++seq); nd._n = D.nextId++; nd._cAt = now; nd._cBy = v.id; nd._eAt = now; nd._eBy = v.id; nd.acu = [nid];
      if (r && r.precio !== '' && r.precio != null && Number(r.precio) !== Number(d.precio)) { nd.precio = Number(r.precio); nd.pfecha = r.vigdesde; changed++; }
      D.rows.push(nd); na.detalle.push(nd.id);
      if (r) r.usos = (r.usos || []).concat([nd.id]);
    });
    this.setState({ tables: tables, seq: seq, cosCmp: { mat: a.matricula, a: a.id, b: nid } });
    this.toastMsg('Versión ' + na.version + ' creada en elaboración con ' + changed + (changed === 1 ? ' precio actualizado' : ' precios actualizados') + '. La versión ' + a.version + ' se conserva tal cual.');
  }
});
