/* ================= organigrama, proyectos (PMBOK), páginas tipo Notion ================= */
var APP_NAME = 'Trazya';
var PM_TABLES = ['proy', 'tar', 'rie', 'int'];
var PM_EDS = [{ id: '6', n: 'PMBOK 6' }, { id: '7', n: 'PMBOK 7' }, { id: '8', n: 'PMBOK 8' }];
var PM_ED_NOTE = {
  '6': '5 grupos de procesos y 10 áreas de conocimiento (49 procesos).',
  '7': '12 principios y 8 dominios de desempeño, con adaptación (tailoring).',
  '8': '6 principios, 7 dominios de desempeño y 5 áreas de enfoque con 40 procesos.'
};
var COVERS = [
  'linear-gradient(120deg, #1E3A8A 0%, #4F46E5 55%, #0EA5E9 100%)',
  'linear-gradient(120deg, #064E3B 0%, #0F766E 50%, #34D399 100%)',
  'linear-gradient(120deg, #7C2D12 0%, #C2410C 50%, #F59E0B 100%)',
  'linear-gradient(120deg, #4C1D95 0%, #7C3AED 50%, #EC4899 100%)',
  'linear-gradient(120deg, #0F172A 0%, #334155 60%, #64748B 100%)',
  'linear-gradient(135deg, #E0E7FF 0%, #F5F3FF 50%, #FCE7F3 100%)',
  'linear-gradient(135deg, #ECFDF5 0%, #F0F9FF 100%)',
  'radial-gradient(circle at 20% 30%, #FDE68A 0%, transparent 40%), radial-gradient(circle at 80% 70%, #93C5FD 0%, transparent 45%), #F8FAFC'
];
var SLASH = [
  { spec: 'text', n: 'Texto', d: 'Escribe libremente', icon: 'para', k: 'texto parrafo nota' },
  { spec: 'heading', n: 'Encabezado', d: 'Título de sección', icon: 'heading', k: 'titulo encabezado h1 seccion' },
  { spec: 'newdb', n: 'Tabla nueva', d: 'Crea una base de datos aquí', icon: 'table', k: 'tabla base de datos nueva crear db' },
  { spec: 'db', n: 'Tabla existente', d: 'Muestra una base de datos', icon: 'db', k: 'tabla base de datos existente vinculada vista' },
  { spec: 'cols:2', n: '2 columnas', d: 'Divide la fila en dos', icon: 'half', k: '2 dos columnas' },
  { spec: 'cols:3', n: '3 columnas', d: 'Divide la fila en tres', icon: 'grid', k: '3 tres columnas' },
  { spec: 'cols:4', n: '4 columnas', d: 'Divide la fila en cuatro', icon: 'grid', k: '4 cuatro columnas' },
  { spec: 'kpi', n: 'Indicador (KPI)', d: 'Un número clave', icon: 'kpi', k: 'kpi indicador numero' },
  { spec: 'chart:column', n: 'Gráfico de columnas', d: 'Comparar categorías', icon: 'chart', k: 'grafico columnas barras verticales' },
  { spec: 'chart:bar', n: 'Gráfico de barras', d: 'Rankings', icon: 'barh', k: 'grafico barras horizontales ranking' },
  { spec: 'chart:line', n: 'Gráfico de línea', d: 'Evolución', icon: 'line', k: 'grafico linea tendencia tiempo' },
  { spec: 'chart:donut', n: 'Gráfico de anillo', d: 'Partes de un total', icon: 'pie', k: 'grafico anillo torta pastel circular dona' },
  { spec: 'slicer', n: 'Segmentación', d: 'Filtra toda la página', icon: 'slicer', k: 'segmentacion filtro slicer' },
  { spec: 'sheet', n: 'Hoja de cálculo', d: 'Celdas y fórmulas', icon: 'sheet', k: 'hoja calculo excel celdas formulas' },
  { spec: 'todo', n: 'Lista de tareas', d: 'Casillas para marcar', icon: 'i-checks', k: 'tareas lista checklist pendientes por hacer' },
  { spec: 'callout', n: 'Aviso', d: 'Nota destacada', icon: 'info', k: 'aviso callout nota destacado' },
  { spec: 'pm', n: 'Salud de proyectos', d: 'Recomendaciones PMBOK', icon: 'shield', k: 'pmbok proyectos salud recomendaciones buenas practicas' },
  { spec: 'map', n: 'Mapa de relaciones', d: 'Cómo se unen las tablas', icon: 'map', k: 'mapa relaciones modelo' },
  { spec: 'divider', n: 'Separador', d: 'Línea divisoria', icon: 'divider', k: 'separador linea divisor' }
];
function normTxt(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function slashMatches(q) {
  var words = normTxt(String(q || '').replace(/^\//, '')).split(/\s+/).filter(function (w) { return w; });
  return SLASH.filter(function (c) {
    var hay = normTxt(c.n + ' ' + c.k).split(/\s+/);
    return words.every(function (w) { return hay.some(function (h) { return h.indexOf(w) === 0; }); });
  });
}
function placeBlock(pg, b, opt) {
  opt = opt || {};
  if (opt.replace) {
    var i = -1;
    pg.blocks.forEach(function (x, k) { if (x.id === opt.replace) i = k; });
    if (i >= 0) { if (opt.keepW) b.w = pg.blocks[i].w; pg.blocks.splice(i, 1, b); return; }
  }
  if (opt.at != null && opt.at >= 0 && opt.at <= pg.blocks.length) { pg.blocks.splice(opt.at, 0, b); return; }
  pg.blocks.push(b);
}

/* ---------- organigrama de ejemplo ---------- */
function seedOrg() {
  return {
    areas: [
      { id: 'a-ger', name: 'Gerencia General', color: '#4F46E5', icon: 'i-landmark', parent: null },
      { id: 'a-adm', name: 'Administración y Finanzas', color: '#047857', icon: 'i-wallet', parent: 'a-ger' },
      { id: 'a-com', name: 'Comercial', color: '#BE185D', icon: 'i-handshake', parent: 'a-ger' },
      { id: 'a-ope', name: 'Operaciones y Proyectos', color: '#B45309', icon: 'i-hardhat', parent: 'a-ger' }
    ],
    cargos: [
      { id: 'c1', name: 'Gerente general', area: 'a-ger', parent: null, person: 'ana' },
      { id: 'c2', name: 'Jefa de Administración y Finanzas', area: 'a-adm', parent: 'c1', person: 'marta' },
      { id: 'c3', name: 'Jefa comercial', area: 'a-com', parent: 'c1', person: 'sofia' },
      { id: 'c5', name: 'Jefe de Operaciones y Proyectos', area: 'a-ope', parent: 'c1', person: 'jorge' },
      { id: 'c7', name: 'Analista contable', area: 'a-adm', parent: 'c2', person: null },
      { id: 'c4', name: 'Ejecutivo de ventas', area: 'a-com', parent: 'c3', person: 'luis' },
      { id: 'c6', name: 'Asistente de proyectos', area: 'a-ope', parent: 'c5', person: null }
    ]
  };
}

/* ---------- bases de datos de proyectos ---------- */
function seedPM() {
  var fases = [so('Inicio', 'gray', 'todo'), so('Planificación', 'violet', 'doing'), so('Ejecución', 'blue', 'doing'), so('Monitoreo y control', 'amber', 'doing'), so('Cierre', 'green', 'done')];
  var proy = {
    id: 'proy', name: 'Proyectos', desc: 'Cartera de proyectos con acta, presupuesto y valor ganado', color: '#B45309', icon: 'i-target', abbr: 'Py', nextId: 4,
    props: [
      { key: 'nombre', name: 'Proyecto', type: 'title' },
      { key: 'codigo', name: 'Código', type: 'id', prefix: 'PRY' },
      { key: 'fase', name: 'Fase', type: 'status', options: fases, desc: 'Áreas de enfoque / grupos de procesos' },
      { key: 'enfoque', name: 'Enfoque', type: 'select', options: [o('Predictivo', 'blue'), o('Ágil', 'green'), o('Híbrido', 'violet')], desc: 'Enfoque de desarrollo y ciclo de vida' },
      { key: 'director', name: 'Director', type: 'person', single: true },
      { key: 'patrocinador', name: 'Patrocinador', type: 'person', single: true },
      { key: 'acta', name: 'Acta aprobada', type: 'checkbox' },
      { key: 'inicio', name: 'Inicio', type: 'date', dateFmt: 'short' },
      { key: 'fin', name: 'Fin', type: 'date', dateFmt: 'short' },
      { key: 'presupuesto', name: 'Presupuesto', type: 'number', fmt: 'money', desc: 'BAC: presupuesto hasta la conclusión' },
      { key: 'costo', name: 'Costo real', type: 'number', fmt: 'money', desc: 'AC: costo real a la fecha' },
      { key: 'avance', name: 'Avance', type: 'number', fmt: 'percent', showAs: 'bar', max: 100 },
      { key: 'plan', name: 'Avance planificado', type: 'number', fmt: 'percent' },
      { key: 'ev', name: 'Valor ganado', type: 'formula', expr: '=[Presupuesto] * [Avance] / 100', resFmt: 'money', resDec: 0, desc: 'EV = BAC × % avance' },
      { key: 'cpi', name: 'CPI', type: 'formula', expr: '=SI([Costo real] > 0; REDONDEAR([Valor ganado] / [Costo real]; 2); "")', desc: 'Índice de desempeño del costo = EV / AC' },
      { key: 'spi', name: 'SPI', type: 'formula', expr: '=SI([Avance planificado] > 0; REDONDEAR([Avance] / [Avance planificado]; 2); "")', desc: 'Índice de desempeño del cronograma = EV / PV' },
      { key: 'tareas', name: 'Tareas', type: 'relation', target: 'tar', pair: 'proyecto' },
      { key: 'riesgos', name: 'Riesgos', type: 'relation', target: 'rie', pair: 'proyecto' },
      { key: 'interesados', name: 'Interesados', type: 'relation', target: 'int', pair: 'proyecto' },
      { key: 'solicitudes', name: 'Solicitudes', type: 'relation', target: 'sol', pair: 'proyecto' },
      { key: 'partes', name: 'Partes diarios', type: 'relation', target: 'pd', pair: 'proyecto', desc: 'Reportes de campo enviados desde la app móvil' },
      { key: 'mo', name: 'Costo mano de obra', type: 'rollup', rel: 'tareas', prop: 'costo', fn: 'sum', desc: 'Suma del costo de las horas de sus tareas (según la planilla)' },
      { key: 'lecciones', name: 'Lecciones aprendidas', type: 'text' }
    ],
    rows: [
      mkRow('y1', 1, { nombre: 'Ampliación del almacén central', fase: 'Ejecución', enfoque: 'Predictivo', director: ['jorge'], patrocinador: ['ana'], acta: true, inicio: '2026-09-01', fin: '2027-01-31', presupuesto: 180000, costo: 96000, avance: 45, plan: 50, tareas: [], riesgos: [], interesados: [], solicitudes: [], lecciones: '' }, '2026-08-20T09:00', 'jorge'),
      mkRow('y2', 2, { nombre: 'Implementación del ERP', fase: 'Planificación', enfoque: 'Híbrido', director: ['marta'], patrocinador: ['ana'], acta: false, inicio: '2026-10-15', fin: '2027-03-31', presupuesto: 60000, costo: 8000, avance: 12, plan: 15, tareas: [], riesgos: [], interesados: [], solicitudes: [], lecciones: '' }, '2026-10-10T11:00', 'marta'),
      mkRow('y3', 3, { nombre: 'Campaña comercial de verano', fase: 'Cierre', enfoque: 'Ágil', director: ['sofia'], patrocinador: [], acta: true, inicio: '2026-08-01', fin: '2026-11-10', presupuesto: 25000, costo: 23500, avance: 100, plan: 100, tareas: [], riesgos: [], interesados: [], solicitudes: [], lecciones: '' }, '2026-07-25T10:00', 'sofia')
    ],
    views: [
      mkView('vy1', 'Cartera', 'table', { hidden: ['lecciones', 'tareas', 'riesgos', 'interesados', 'solicitudes', 'partes', 'inicio', 'plan', 'ev'], calcs: { presupuesto: 'sum', costo: 'sum' } }),
      mkView('vy2', 'Por fase', 'board', { group: 'fase' })
    ],
    automations: []
  };
  var est = [so('Sin empezar', 'gray', 'todo'), so('En curso', 'blue', 'doing'), so('Bloqueada', 'red', 'doing'), so('Hecha', 'green', 'done')];
  var T = function (id, n, nombre, py, who, estado, ini, fin, h, ent, crit) { return mkRow(id, n, { nombre: nombre, proyecto: [py], responsable: who ? [who] : [], estado: estado, inicio: ini, fin: fin, horas: h, entregable: ent, criterio: crit }, '2026-09-01T09:00', 'jorge'); };
  var tar = {
    id: 'tar', name: 'Tareas', desc: 'EDT y cronograma de todos los proyectos', color: '#1D4ED8', icon: 'i-checks', abbr: 'Ta', nextId: 12,
    props: [
      { key: 'nombre', name: 'Tarea', type: 'title' },
      { key: 'proyecto', name: 'Proyecto', type: 'relation', target: 'proy', pair: 'tareas', single: true },
      { key: 'responsable', name: 'Responsable', type: 'person', single: true },
      { key: 'estado', name: 'Estado', type: 'status', options: est },
      { key: 'inicio', name: 'Inicio', type: 'date', dateFmt: 'short' },
      { key: 'fin', name: 'Fin', type: 'date', dateFmt: 'relative' },
      { key: 'horas', name: 'Horas', type: 'number' },
      { key: 'entregable', name: 'Entregable', type: 'text' },
      { key: 'criterio', name: 'Criterio de aceptación', type: 'text' },
      { key: 'costo', name: 'Costo mano de obra', type: 'formula', expr: '=SI(ESBLANCO([Responsable]); ""; SI.ERROR([Horas] * BUSCAR([Responsable]; Personal[Usuario de la app]; Personal[Costo por hora]); ""))', resFmt: 'money', resDec: 0, desc: 'Horas × costo por hora del responsable (planilla)' },
      { key: 'dias', name: 'Días restantes', type: 'formula', expr: '=SI([Estado] = "Hecha"; ""; DIAS([Fin]; HOY()))' }
    ],
    rows: [
      T('t1', 1, 'Acta de constitución firmada', 'y1', 'jorge', 'Hecha', '2026-09-01', '2026-09-05', 16, 'Acta del proyecto', 'Firmada por el patrocinador'),
      T('t2', 2, 'Levantamiento topográfico', 'y1', 'jorge', 'Hecha', '2026-09-08', '2026-09-19', 40, 'Plano topográfico', 'Aprobado por ingeniería'),
      T('t3', 3, 'Compra de estructuras metálicas', 'y1', 'marta', 'En curso', '2026-10-01', '2026-11-15', 60, 'Orden de compra', ''),
      T('t4', 4, 'Montaje de racks', 'y1', 'jorge', 'Sin empezar', '2026-11-20', '2026-12-20', 120, 'Racks instalados', 'Prueba de carga aprobada'),
      T('t5', 5, 'Definir alcance del ERP', 'y2', 'marta', 'En curso', '2026-10-20', '2026-11-25', 32, 'Enunciado del alcance', 'Aprobado por gerencia'),
      T('t6', 6, 'Migración de datos de clientes', 'y2', null, 'Sin empezar', '2026-12-01', '', 24, 'Base de clientes migrada', ''),
      T('t7', 7, 'Capacitación a usuarios', 'y2', 'luis', 'Sin empezar', '2027-02-01', '2027-02-15', 20, 'Usuarios capacitados', 'Asistencia mayor al 90 %'),
      T('t8', 8, 'Informe final de campaña', 'y3', 'sofia', 'En curso', '2026-11-05', '2026-11-12', 12, 'Informe de resultados', 'Revisado por gerencia'),
      T('t9', 9, 'Seguimiento de clientes nuevos', 'y3', 'luis', 'Hecha', '2026-10-01', '2026-10-31', 30, 'Lista de clientes contactados', 'Todos contactados'),
      T('t10', 10, 'Aprobar presupuesto de la ampliación', 'y1', 'ana', 'En curso', '2026-11-16', '2026-11-21', 6, 'Presupuesto aprobado', 'Firmado por gerencia'),
      T('t11', 11, 'Revisión mensual de la cartera', 'y2', 'ana', 'Sin empezar', '2026-11-25', '2026-11-28', 4, 'Acta de revisión', '')
    ],
    views: [
      mkView('vt1', 'EDT por proyecto', 'table', { group: 'proyecto', hidden: ['entregable', 'inicio'], calcs: { horas: 'sum', costo: 'sum' } }),
      mkView('vt2', 'Tablero', 'board', { group: 'estado', hidden: ['estado', 'inicio', 'horas', 'entregable', 'criterio', 'dias'] }),
      mkView('vt3', 'Mis tareas', 'table', { filters: [{ prop: 'responsable', op: 'contains', value: 'me' }], hidden: ['entregable', 'criterio', 'inicio', 'responsable'] }),
      mkView('vt4', 'Calendario', 'calendar', { dateProp: 'fin' })
    ],
    automations: []
  };
  var R = function (id, n, nombre, py, pr, im, est2, who, estado, resp) { return mkRow(id, n, { nombre: nombre, proyecto: [py], prob: pr, impacto: im, estrategia: est2, responsable: who ? [who] : [], estado: estado, respuesta: resp }, '2026-10-01T10:00', 'jorge'); };
  var rie = {
    id: 'rie', name: 'Riesgos', desc: 'Registro de riesgos y respuestas', color: '#B91C1C', icon: 'i-shield', abbr: 'Ri', nextId: 6,
    props: [
      { key: 'nombre', name: 'Riesgo', type: 'title', desc: 'Causa → evento → efecto' },
      { key: 'proyecto', name: 'Proyecto', type: 'relation', target: 'proy', pair: 'riesgos', single: true },
      { key: 'prob', name: 'Probabilidad', type: 'select', options: [o('Baja', 'green'), o('Media', 'amber'), o('Alta', 'red')] },
      { key: 'impacto', name: 'Impacto', type: 'select', options: [o('Bajo', 'green'), o('Medio', 'amber'), o('Alto', 'red')] },
      { key: 'nivel', name: 'Nivel', type: 'formula', expr: '=SI(Y([Probabilidad] = "Alta"; [Impacto] = "Alto"); "Alto"; SI(O([Probabilidad] = "Alta"; [Impacto] = "Alto"); "Medio"; "Bajo"))' },
      { key: 'estrategia', name: 'Estrategia', type: 'select', options: [o('Evitar', 'violet'), o('Mitigar', 'blue'), o('Transferir', 'teal'), o('Aceptar', 'gray'), o('Escalar', 'red')] },
      { key: 'responsable', name: 'Responsable', type: 'person', single: true },
      { key: 'estado', name: 'Estado', type: 'status', options: [so('Abierto', 'red', 'todo'), so('En tratamiento', 'amber', 'doing'), so('Cerrado', 'green', 'done')] },
      { key: 'respuesta', name: 'Plan de respuesta', type: 'text' }
    ],
    rows: [
      R('r1', 1, 'Retraso en la importación de estructuras', 'y1', 'Alta', 'Alto', 'Mitigar', 'marta', 'En tratamiento', 'Cotizar con un proveedor nacional alterno'),
      R('r2', 2, 'Lluvias durante el montaje', 'y1', 'Media', 'Medio', 'Aceptar', 'jorge', 'Abierto', 'Reserva de 5 días en el cronograma'),
      R('r3', 3, 'Resistencia al cambio de los usuarios', 'y2', 'Alta', 'Medio', '', null, 'Abierto', ''),
      R('r4', 4, 'Datos de clientes duplicados', 'y2', 'Alta', 'Alto', '', null, 'Abierto', ''),
      R('r5', 5, 'Cambio de prioridades de la gerencia', 'y2', 'Media', 'Alto', '', 'ana', 'Abierto', '')
    ],
    views: [mkView('ve1', 'Registro de riesgos', 'table', { hidden: ['respuesta'] }), mkView('ve2', 'Mis riesgos', 'list', { filters: [{ prop: 'responsable', op: 'contains', value: 'me' }] })],
    automations: []
  };
  var I = function (id, n, nombre, py, rol, pod, inte, com) { return mkRow(id, n, { nombre: nombre, proyecto: [py], rol: rol, poder: pod, interes: inte, comunicacion: com }, '2026-09-02T10:00', 'jorge'); };
  var int = {
    id: 'int', name: 'Interesados', desc: 'Registro de interesados y cómo involucrarlos', color: '#6D28D9', icon: 'i-contact', abbr: 'In', nextId: 5,
    props: [
      { key: 'nombre', name: 'Interesado', type: 'title' },
      { key: 'proyecto', name: 'Proyecto', type: 'relation', target: 'proy', pair: 'interesados', single: true },
      { key: 'rol', name: 'Rol en el proyecto', type: 'text' },
      { key: 'poder', name: 'Poder', type: 'select', options: [o('Alto', 'red'), o('Bajo', 'gray')] },
      { key: 'interes', name: 'Interés', type: 'select', options: [o('Alto', 'blue'), o('Bajo', 'gray')] },
      { key: 'estrategia', name: 'Cómo involucrarlo', type: 'formula', expr: '=SI(Y([Poder] = "Alto"; [Interés] = "Alto"); "Gestionar de cerca"; SI([Poder] = "Alto"; "Mantener satisfecho"; SI([Interés] = "Alto"; "Mantener informado"; "Monitorear")))' },
      { key: 'comunicacion', name: 'Comunicación', type: 'select', options: [o('Semanal', 'blue'), o('Quincenal', 'teal'), o('Mensual', 'gray')] }
    ],
    rows: [
      I('i1', 1, 'Gerencia General', 'y1', 'Patrocinador', 'Alto', 'Alto', 'Semanal'),
      I('i2', 2, 'Municipalidad distrital', 'y1', 'Otorga licencias', 'Alto', 'Bajo', ''),
      I('i3', 3, 'Equipo de almacén', 'y1', 'Usuarios del almacén', 'Bajo', 'Alto', 'Quincenal'),
      I('i4', 4, 'Clientes frecuentes', 'y3', 'Público de la campaña', 'Bajo', 'Alto', 'Mensual')
    ],
    views: [mkView('vi1', 'Registro de interesados', 'table', {})],
    automations: []
  };
  return { proy: proy, tar: tar, rie: rie, int: int };
}

/* ---------- reglas de buenas prácticas (sin IA: se evalúan al instante) ---------- */
var PM_TIPS = {
  proy: ['Aprueba el acta antes de planificar: objetivo, alcance general, patrocinador y presupuesto.', 'Elige el enfoque (predictivo, ágil o híbrido) y adapta el proceso al proyecto.', 'Mide con valor ganado: un CPI o SPI menor que 0,9 pide una acción correctiva.'],
  tar: ['Redacta cada tarea como un entregable que se pueda verificar.', 'Una sola persona responsable por tarea.', 'Si supera 80 horas, divídela (regla 8/80 de la EDT).', 'Define el criterio de aceptación antes de empezar.'],
  rie: ['Descríbelo como causa → evento → efecto.', 'Todo riesgo alto necesita responsable y plan de respuesta.', 'Revisa el registro en cada reunión de seguimiento.'],
  int: ['Clasifícalo por poder e interés para decidir cómo involucrarlo.', 'Define con qué frecuencia y por qué medio se le informa.']
};
var PM_RULES = [
  { id: 'acta', t: 'proy', sev: 'alta', when: function (g) { return !g('acta') && g('fase') !== 'Cierre'; }, msg: 'Falta aprobar el acta de constitución', tip: 'Formaliza objetivo, alcance general, patrocinador y presupuesto antes de seguir.', fix: { label: 'Marcar acta aprobada', kind: 'set', prop: 'acta', value: true },
    ref: { '6': 'Integración · 4.1 Desarrollar el acta de constitución', '7': 'Dominio de Planificación · artefacto: acta del proyecto', '8': 'Dominio de Gobernanza · Área de enfoque: Inicio' } },
  { id: 'sponsor', t: 'proy', sev: 'alta', when: function (g) { return isEmptyVal(g('patrocinador')); }, msg: 'El proyecto no tiene patrocinador', tip: 'El patrocinador aprueba el acta, da recursos y resuelve lo que escapa al director.', fix: { label: 'Abrir y asignar', kind: 'open' },
    ref: { '6': 'Integración · 4.1 Acta (patrocinador)', '7': 'Dominio de Interesados', '8': 'Dominio de Gobernanza · Inicio' } },
  { id: 'approach', t: 'proy', sev: 'baja', when: function (g) { return !g('enfoque'); }, msg: 'No se eligió el enfoque de desarrollo', tip: 'Predictivo, ágil o híbrido: define cómo se planifica y se entrega.', fix: { label: 'Abrir y elegir', kind: 'open' },
    ref: { '6': 'Integración · 4.2 Plan para la dirección (ciclo de vida)', '7': 'Dominio de Enfoque de desarrollo y ciclo de vida', '8': 'Dominio de Gobernanza · Planificación (adaptación)' } },
  { id: 'stake', t: 'proy', sev: 'media', when: function (g) { return isEmptyVal(g('interesados')); }, msg: 'Sin interesados registrados', tip: 'Identifica a quién afecta o influye el proyecto desde el inicio.', fix: { label: 'Añadir interesado', kind: 'add', table: 'int', rel: 'proyecto' },
    ref: { '6': 'Interesados · 13.1 Identificar a los interesados', '7': 'Dominio de Interesados', '8': 'Dominio de Interesados · Inicio' } },
  { id: 'risks', t: 'proy', sev: 'media', when: function (g) { return isEmptyVal(g('riesgos')) && g('fase') !== 'Inicio'; }, msg: 'Sin riesgos identificados', tip: 'Registra al menos los riesgos principales con su probabilidad e impacto.', fix: { label: 'Añadir riesgo', kind: 'add', table: 'rie', rel: 'proyecto' },
    ref: { '6': 'Riesgos · 11.2 Identificar los riesgos', '7': 'Dominio de Incertidumbre', '8': 'Dominio de Riesgos · Planificación' } },
  { id: 'cpi', t: 'proy', sev: 'alta', when: function (g) { var c = g('cpi'); return typeof c === 'number' && c < 0.9; }, msg: function (g) { return 'Costo por encima de lo planificado (CPI ' + String(g('cpi')).replace('.', ',') + ')'; }, tip: 'Cada sol gastado rinde menos de lo previsto: revisa compras y rendimiento, y evalúa una solicitud de cambio.', fix: { label: 'Abrir proyecto', kind: 'open' },
    ref: { '6': 'Costos · 7.4 Controlar los costos (valor ganado)', '7': 'Dominio de Medición', '8': 'Dominio de Finanzas · Monitoreo y control' } },
  { id: 'spi', t: 'proy', sev: 'media', when: function (g) { var c = g('spi'); return typeof c === 'number' && c < 0.9; }, msg: function (g) { return 'Atraso respecto al plan (SPI ' + String(g('spi')).replace('.', ',') + ')'; }, tip: 'Reprograma, comprime el cronograma (más recursos o tareas en paralelo) o ajusta la línea base.', fix: { label: 'Abrir proyecto', kind: 'open' },
    ref: { '6': 'Cronograma · 6.6 Controlar el cronograma', '7': 'Dominio de Medición', '8': 'Dominio de Cronograma · Monitoreo y control' } },
  { id: 'lessons', t: 'proy', sev: 'media', when: function (g) { return g('fase') === 'Cierre' && !String(g('lecciones') || '').trim(); }, msg: 'Proyecto en cierre sin lecciones aprendidas', tip: 'Registra qué funcionó y qué no antes de liberar al equipo.', fix: { label: 'Abrir y escribir', kind: 'open' },
    ref: { '6': 'Integración · 4.7 Cerrar el proyecto o fase', '7': 'Dominio de Entrega', '8': 'Dominio de Gobernanza · Cierre' } },
  { id: 'owner', t: 'tar', sev: 'media', when: function (g) { return isEmptyVal(g('responsable')) && g('estado') !== 'Hecha'; }, msg: 'Tarea sin responsable', tip: 'Asigna una sola persona que responda por el resultado (la «A» de la matriz RACI).', fix: { label: 'Asignármela', kind: 'set', prop: 'responsable', value: '__me' },
    ref: { '6': 'Recursos · 9.1 Planificar la gestión de recursos (RACI)', '7': 'Dominio del Equipo', '8': 'Dominio de Recursos · Planificación' } },
  { id: 'nodate', t: 'tar', sev: 'media', when: function (g) { return !g('fin') && g('estado') !== 'Hecha'; }, msg: 'Tarea sin fecha de fin', tip: 'Sin fecha no entra al cronograma ni a la ruta crítica.', fix: { label: 'Abrir y fechar', kind: 'open' },
    ref: { '6': 'Cronograma · 6.5 Desarrollar el cronograma', '7': 'Dominio de Planificación', '8': 'Dominio de Cronograma · Planificación' } },
  { id: 'late', t: 'tar', sev: 'alta', when: function (g) { var f = String(g('fin') || '').slice(0, 10); return f && f < todayIso() && g('estado') !== 'Hecha'; }, msg: 'Tarea vencida', tip: 'Actualiza el estado o reprograma y avisa a los afectados.', fix: { label: 'Marcar como hecha', kind: 'set', prop: 'estado', value: 'Hecha' },
    ref: { '6': 'Cronograma · 6.6 Controlar el cronograma', '7': 'Dominio del Trabajo del proyecto', '8': 'Dominio de Cronograma · Monitoreo y control' } },
  { id: 'big', t: 'tar', sev: 'baja', when: function (g) { return Number(g('horas')) > 80; }, msg: function (g) { return 'Tarea de ' + g('horas') + ' h: conviene dividirla'; }, tip: 'Regla 8/80: los paquetes de trabajo deberían durar entre 8 y 80 horas.', fix: { label: 'Abrir tarea', kind: 'open' },
    ref: { '6': 'Alcance · 5.4 Crear la EDT', '7': 'Dominio de Planificación', '8': 'Dominio de Alcance · Planificación' } },
  { id: 'accept', t: 'tar', sev: 'baja', when: function (g) { return !String(g('criterio') || '').trim() && g('estado') !== 'Hecha'; }, msg: 'Sin criterio de aceptación', tip: 'Define cómo se comprobará que el entregable está bien hecho.', fix: { label: 'Abrir y definir', kind: 'open' },
    ref: { '6': 'Alcance · 5.5 Validar el alcance', '7': 'Dominio de Entrega', '8': 'Dominio de Alcance · Monitoreo y control' } },
  { id: 'riskowner', t: 'rie', sev: 'alta', when: function (g) { return g('nivel') === 'Alto' && isEmptyVal(g('responsable')) && g('estado') !== 'Cerrado'; }, msg: 'Riesgo alto sin responsable', tip: 'Cada riesgo alto necesita un dueño que vigile disparadores y ejecute la respuesta.', fix: { label: 'Asignármelo', kind: 'set', prop: 'responsable', value: '__me' },
    ref: { '6': 'Riesgos · 11.5 Planificar la respuesta a los riesgos', '7': 'Dominio de Incertidumbre', '8': 'Dominio de Riesgos · Planificación' } },
  { id: 'riskplan', t: 'rie', sev: 'media', when: function (g) { return !g('estrategia') && g('estado') !== 'Cerrado'; }, msg: 'Riesgo sin estrategia de respuesta', tip: 'Elige evitar, mitigar, transferir, aceptar o escalar, y escribe el plan.', fix: { label: 'Mitigar', kind: 'set', prop: 'estrategia', value: 'Mitigar' },
    ref: { '6': 'Riesgos · 11.5 Planificar la respuesta a los riesgos', '7': 'Dominio de Incertidumbre', '8': 'Dominio de Riesgos · Planificación' } },
  { id: 'comms', t: 'int', sev: 'media', when: function (g) { return g('poder') === 'Alto' && !g('comunicacion'); }, msg: 'Interesado de alto poder sin plan de comunicación', tip: 'Define frecuencia y medio para mantenerlo satisfecho e informado.', fix: { label: 'Comunicación quincenal', kind: 'set', prop: 'comunicacion', value: 'Quincenal' },
    ref: { '6': 'Comunicaciones · 10.1 Planificar la gestión de las comunicaciones', '7': 'Dominio de Interesados', '8': 'Dominio de Interesados · Planificación' } }
];
var SEV_NAME = { alta: 'Alta', media: 'Media', baja: 'Baja' };
var SEV_ORDER = { alta: 0, media: 1, baja: 2 };

Object.assign(Component.prototype, {
  /* ---------- organigrama ---------- */
  orgArea(s, id) { var r = null; s.org.areas.forEach(function (a) { if (a.id === id) r = a; }); return r; },
  orgCargo(s, id) { var r = null; s.org.cargos.forEach(function (c) { if (c.id === id) r = c; }); return r; },
  cargoOf(s, mid) { var r = null; s.org.cargos.forEach(function (c) { if (c.person === mid) r = c; }); return r; },
  areaAncestors(s, aid) { var out = [], a = this.orgArea(s, aid), guard = 0; while (a && guard++ < 20) { out.push(a.id); a = this.orgArea(s, a.parent); } return out; },
  pageVisible(s, v, pg) {
    if (!pg) return false;
    if (pg.mine || !pg.area || v.role === 'admin') return true;
    var c = this.cargoOf(s, v.id);
    if (!c) return false;
    return this.areaAncestors(s, pg.area).indexOf(c.area) >= 0;
  },
  orgSetLvl(d, hex) { this.updOrg(function (org) { var l = (org.lvl || []).slice(); l[d] = hex; org.lvl = l; }); },
  orgSel(id) { this.setState({ orgSel: this.st().orgSel === id ? null : id }); },
  updOrg(fn, logText) { var s = this.st(); var org = clone(s.org); if (fn(org) === false) return; var patch = { org: org }; if (logText) patch.log = this.addLog(s, logText); this.setState(patch); },
  orgAddChild(pid) {
    var s = this.st(); var id = 'c' + (s.seq + 1);
    var parent = this.orgCargo(s, pid);
    this.updOrg(function (org) { org.cargos.push({ id: id, name: 'Nuevo cargo', area: parent ? parent.area : org.areas[0].id, parent: parent ? parent.id : null, person: null }); }, 'agregó un cargo al organigrama');
    this.setState({ seq: s.seq + 1, orgSel: id });
  },
  orgDel(cid) {
    var s = this.st();
    if (s.org.cargos.some(function (c) { return c.parent === cid; })) { this.toastMsg('Primero mueve o elimina los cargos que dependen de este.'); return; }
    if (s.confirmDel !== 'cargo:' + cid) { this.setState({ confirmDel: 'cargo:' + cid }); return; }
    this.updOrg(function (org) { org.cargos = org.cargos.filter(function (c) { return c.id !== cid; }); }, 'eliminó un cargo del organigrama');
    this.setState({ orgSel: null, confirmDel: null });
  },
  orgAddArea() {
    var s = this.st(); var id = 'a' + (s.seq + 1); var n = s.org.areas.length;
    this.updOrg(function (org) { org.areas.push({ id: id, name: 'Nueva área', color: NEW_COLORS[(n + 2) % NEW_COLORS.length], icon: 'i-folder', parent: org.areas[0] ? org.areas[0].id : null }); }, 'creó un área');
    this.setState({ seq: s.seq + 1, orgAreaSel: id });
  },
  /* disposición del árbol: posiciones por cargo (x en píxeles, d = nivel) */
  orgLayout(s, cargos) {
    var W = 204, H = 98, GX = 22, GY = 56, kids = {}, ids = {};
    cargos.forEach(function (c) { ids[c.id] = true; });
    cargos.forEach(function (c) { var k = c.parent && ids[c.parent] ? c.parent : '__root'; (kids[k] = kids[k] || []).push(c); });
    var pos = {}, nextX = 0, depthMax = 0;
    function place(c, d) {
      if (d > 40 || pos[c.id]) return;
      depthMax = Math.max(depthMax, d);
      var ch = kids[c.id] || [];
      if (!ch.length) { pos[c.id] = { x: nextX, d: d }; nextX += W + GX; return; }
      ch.forEach(function (k) { place(k, d + 1); });
      var f = pos[ch[0].id], l = pos[ch[ch.length - 1].id];
      pos[c.id] = { x: f && l ? (f.x + l.x) / 2 : nextX, d: d };
    }
    (kids.__root || []).forEach(function (c) { place(c, 0); });
    return { pos: pos, kids: kids, nextX: nextX, depthMax: depthMax, W: W, H: H, GX: GX, GY: GY };
  },
  orgLvlColor(s, d) { var l = s.org && s.org.lvl; return (l && l[d]) || ORG_LVL[d % ORG_LVL.length]; },
  /* simula mover un cargo: 'child' = pasa a depender de target, 'above' = queda como jefe de target, 'before'/'after' = junto a target */
  orgSimMove(cargos, cid, target, zone) {
    var arr = cargos.map(function (c) { return Object.assign({}, c); });
    var it = arr.filter(function (c) { return c.id === cid; })[0], tc = arr.filter(function (c) { return c.id === target; })[0];
    if (!it || !tc) return arr;
    arr.splice(arr.indexOf(it), 1);
    if (zone === 'child') { it.parent = target; arr.push(it); }
    else if (zone === 'above') { it.parent = tc.parent || null; tc.parent = it.id; arr.splice(arr.indexOf(tc), 0, it); }
    else { it.parent = tc.parent || null; var j = arr.indexOf(tc); arr.splice(zone === 'after' ? j + 1 : j, 0, it); }
    return arr;
  },
  orgData(s, v) {
    var self = this;
    var cargos = s.org.cargos, dr = s.orgDrag || null;
    var sim = !!(dr && dr.target && !dr.bad && !dr.commit);
    var layCargos = sim ? this.orgSimMove(cargos, dr.cid, dr.target, dr.zone) : cargos;
    var lay = this.orgLayout(s, layCargos), pos = lay.pos, kids = lay.kids, W = lay.W, H = lay.H, GX = lay.GX, GY = lay.GY, nextX = lay.nextX, depthMax = lay.depthMax;
    this._orgLay = lay;
    var hiArea = s.orgAreaSel;
    var mineC = this.cargoOf(s, v.id);
    var HINT = { child: 'Pasa a depender de este cargo', above: 'Quedará por encima de este cargo', before: 'Quedará a su izquierda', after: 'Quedará a su derecha' };
    var boxes = cargos.slice().sort(function (x, y) { return x.id < y.id ? -1 : x.id > y.id ? 1 : 0; }).filter(function (c) { return pos[c.id]; }).map(function (c) {
      var a = self.orgArea(s, c.area) || { name: 'Sin área', color: '#8C8C86', icon: 'i-folder' };
      var m = c.person ? self.memberById(s, c.person) : null;
      var p = pos[c.id], lc = self.orgLvlColor(s, p.d);
      var held = !!(dr && dr.cid === c.id && !dr.commit);
      var bx = held ? dr.ox : p.x, by = held ? dr.oy : p.d * (H + GY);
      var isT = !!(dr && dr.target === c.id && !dr.commit);
      var cls = (s.orgSel === c.id ? 'on ' : '') + (hiArea && hiArea !== c.area ? 'dim ' : '') + (mineC && mineC.id === c.id ? 'me ' : '') + (m ? '' : 'vacant ')
        + (held ? 'dragging ' : '') + (isT ? (dr.bad ? 'tgt-bad ' : 'tgt tz-' + dr.zone + ' ') : '') + (s.orgLanded === c.id ? 'landed ' : '') + (v.role === 'admin' ? 'can-drag' : '');
      return { id: c.id, key: 'n-' + c.id, x: p.x, y: p.d * (H + GY), w: W, h: H, raw: c, name: c.name, areaName: a.name, color: lc, areaColor: a.color, icon: ICON[a.icon] || ICON.db,
        lvl: 'N' + (p.d + 1), hint: isT ? (dr.bad ? 'No se puede: depende del cargo que mueves' : HINT[dr.zone]) : '',
        style: 'left: ' + bx + 'px; top: ' + by + 'px; width: ' + W + 'px; height: ' + H + 'px; --c: ' + lc + '; --a: ' + a.color + (dr && dr.cid === c.id && dr.commit ? '; transition: none' : ''),
        cls: cls.trim(), hasPerson: !!m, vacant: !m, person: m ? m.name : 'Vacante', initials: m ? initialsOf(m.name) : '', avatar: m ? m.color : '#8C8C86',
        nKids: (kids[c.id] || []).length, kidsTxt: (kids[c.id] || []).length ? String((kids[c.id] || []).length) : '', hasKids: (kids[c.id] || []).length > 0,
        pick: function () { if (self._noClick && Date.now() - self._noClick < 350) return; self.orgSel(c.id); }, aria: c.name + (m ? ', ' + m.name : ', vacante') };
    });
    var links = [];
    layCargos.slice().sort(function (x, y) { return x.id < y.id ? -1 : x.id > y.id ? 1 : 0; }).forEach(function (c) {
      if (!c.parent || !pos[c.id] || !pos[c.parent]) return;
      var a = pos[c.parent], b = pos[c.id];
      var x1 = a.x + W / 2, y1 = a.d * (H + GY) + H, x2 = b.x + W / 2, y2 = b.d * (H + GY), ym = y1 + GY / 2;
      var dd = 'M' + x1 + ' ' + y1 + ' V' + ym + ' H' + x2 + ' V' + y2;
      links.push({ id: c.id, key: 'l-' + c.id, x1: x1, y1: y1, x2: x2, y2: y2, ym: ym, d: dd, cd: "path('" + dd + "')", cls: (s.orgSel === c.id || s.orgSel === c.parent) ? 'hi' : '' });
    });
    var ghost = { has: false, style: '' };
    if (sim && pos[dr.cid]) { var gp = pos[dr.cid]; ghost = { has: true, style: 'left: ' + gp.x + 'px; top: ' + gp.d * (H + GY) + 'px; width: ' + W + 'px; height: ' + H + 'px; --c: ' + this.orgLvlColor(s, gp.d) }; }
    var width = Math.max(nextX - GX, W), height = (depthMax + 1) * (H + GY) - GY;
    var sel = s.orgSel ? this.orgCargo(s, s.orgSel) : null;
    var isAdmin = v.role === 'admin';
    var panel = { has: !!sel };
    if (sel) {
      var sa = this.orgArea(s, sel.area);
      var boss = sel.parent ? this.orgCargo(s, sel.parent) : null;
      var bossM = boss && boss.person ? this.memberById(s, boss.person) : null;
      panel = {
        has: true, name: sel.name, canEdit: isAdmin, readOnly: !isAdmin,
        rename: function (e) { var val = e.target.value; self.updOrg(function (org) { org.cargos.forEach(function (c) { if (c.id === sel.id) c.name = val; }); }); },
        areaName: sa ? sa.name : 'Sin área', areaColor: sa ? sa.color : '#888',
        boss: boss ? boss.name + (bossM ? ' · ' + bossM.name : ' · vacante') : 'Nadie (cargo principal)',
        areaOpts: s.org.areas.map(function (a) { return { label: a.name, color: a.color, cls: a.id === sel.area ? 'on' : '', on: a.id === sel.area, pick: function () { self.updOrg(function (org) { org.cargos.forEach(function (c) { if (c.id === sel.id) c.area = a.id; }); }); } }; }),
        people: [{ id: null, name: 'Vacante', color: '#8C8C86' }].concat(s.members.filter(function (m) { return !m.pending; })).map(function (m) {
          var busy = m.id && self.cargoOf(s, m.id);
          var on = (sel.person || null) === m.id;
          return { name: m.name, initials: m.id ? initialsOf(m.name) : '—', color: m.color, cls: on ? 'on' : '', on: on, note: busy && !on ? busy.name : '', hasNote: !!(busy && !on),
            pick: function () { self.orgAssign(sel.id, m.id); } };
        }),
        pages: s.pages.order.map(function (id) { return s.pages.byId[id]; }).filter(function (pg) { return pg.area && self.areaAncestors(s, pg.area).indexOf(sel.area) >= 0; }).map(function (pg) { return { name: pg.title, icon: ICON[pg.icon] || ICON.page, color: pg.color, go: function () { self.goPage(pg.id); } }; }),
        addChild: function () { self.orgAddChild(sel.id); },
        del: function () { self.orgDel(sel.id); }, delLabel: s.confirmDel === 'cargo:' + sel.id ? 'Pulsa otra vez para eliminar' : 'Eliminar cargo',
        close: function () { self.setState({ orgSel: null }); }
      };
      panel.noPages = panel.pages.length === 0;
    }
    var areas = s.org.areas.map(function (a) {
      var nC = cargos.filter(function (c) { return c.area === a.id; });
      var nP = s.pages.order.filter(function (id) { return s.pages.byId[id].area === a.id; }).length;
      return { id: a.id, name: a.name, color: a.color, icon: ICON[a.icon] || ICON.db, meta: nC.length + (nC.length === 1 ? ' cargo · ' : ' cargos · ') + nP + (nP === 1 ? ' página' : ' páginas'), cls: hiArea === a.id ? 'on' : '', on: hiArea === a.id,
        pick: function () { self.setState({ orgAreaSel: hiArea === a.id ? null : a.id }); } };
    });
    var selArea = hiArea ? this.orgArea(s, hiArea) : null;
    var ap = { has: !!selArea };
    if (selArea) {
      ap = { has: true, name: selArea.name, canEdit: isAdmin, color: selArea.color,
        rename: function (e) { var val = e.target.value; self.updOrg(function (org) { org.areas.forEach(function (a) { if (a.id === selArea.id) a.name = val; }); }); },
        colors: NEW_COLORS.map(function (c) { return { hex: c, cls: selArea.color === c ? 'on' : '', on: selArea.color === c, aria: 'Color ' + c, pick: function () { self.updOrg(function (org) { org.areas.forEach(function (a) { if (a.id === selArea.id) a.color = c; }); }); } }; }),
        icons: DB_ICONS.slice(0, 24).map(function (k) { return { icon: ICON[k], cls: selArea.icon === k ? 'on' : '', on: selArea.icon === k, aria: 'Icono ' + k.slice(2), pick: function () { self.updOrg(function (org) { org.areas.forEach(function (a) { if (a.id === selArea.id) a.icon = k; }); }); } }; }),
        newPage: function () { self.newPage(selArea.id); } };
    }
    var lvRows = [];
    for (var di = 0; di <= depthMax; di++) (function (d) {
      var cur = self.orgLvlColor(s, d);
      lvRows.push({ n: 'Nivel ' + (d + 1), tag: 'N' + (d + 1), color: cur,
        opts: ORG_LVL_PAL.map(function (h) { var on = cur.toLowerCase() === h.toLowerCase(); return { hex: h, cls: on ? 'on' : '', on: on, aria: 'Color ' + h + ' para el nivel ' + (d + 1), pick: function () { self.orgSetLvl(d, h); } }; }),
        custom: function (e) { self.orgSetLvl(d, e.target.value); } });
    })(di);
    var lv = { canEdit: isAdmin, open: !!s.orgLvlOpen, toggle: function () { self.setState({ orgLvlOpen: !s.orgLvlOpen }); }, rows: lvRows,
      reset: function () { self.updOrg(function (org) { delete org.lvl; }, 'restableció los colores por nivel'); } };
    var vac = cargos.filter(function (c) { return !c.person; }).length;
    return { w: width, h: height, boxes: boxes, links: links, ghost: ghost, hasGhost: ghost.has, lv: lv, style: 'width: ' + width + 'px; height: ' + height + 'px', vb: '0 0 ' + width + ' ' + height, panel: panel, areas: areas, ap: ap, isAdmin: isAdmin,
      stats: cargos.length + ' cargos · ' + (cargos.length - vac) + ' ocupados · ' + vac + (vac === 1 ? ' vacante' : ' vacantes') + ' · ' + s.org.areas.length + ' áreas',
      addRoot: function () { self.orgAddChild(s.orgSel || (cargos[0] ? cargos[0].id : null)); }, addArea: function () { self.orgAddArea(); } };
  },

  /* ---------- buenas prácticas PMBOK ---------- */
  pmGetter(s, t, row) {
    var self = this;
    return function (key) { var p = propOf(t, key); if (!p) return null; try { return self.rawOf(s, t, p, row, 0); } catch (e) { return null; } };
  },
  pmIssues(s, v, opt) {
    var self = this; opt = opt || {};
    var ed = s.pmEd || '8';
    var out = [];
    PM_RULES.forEach(function (ru) {
      if (opt.tid && ru.t !== opt.tid) return;
      var t = s.tables.byId[ru.t];
      if (!t || self.lvl(s, t.id, v.role) === 'none') return;
      var rows = self.rowsFor(s, t.id, v);
      if (opt.rowId) rows = rows.filter(function (r) { return r.id === opt.rowId; });
      rows.forEach(function (r) {
        if (opt.mine) { var mine = ['responsable', 'director'].some(function (k) { var x = r[k]; return Array.isArray(x) && x.indexOf(v.id) >= 0; }); if (!mine) return; }
        var g = self.pmGetter(s, t, r);
        var bad = false; try { bad = ru.when(g); } catch (e) { bad = false; }
        if (!bad) return;
        var py = ru.t === 'proy' ? r : (r.proyecto && r.proyecto[0] ? findRow(s.tables.byId.proy, r.proyecto[0]) : null);
        out.push({ rule: ru, tid: t.id, rid: r.id, sev: ru.sev, sevName: SEV_NAME[ru.sev], sevCls: 'sev-' + ru.sev,
          title: typeof ru.msg === 'function' ? ru.msg(g) : ru.msg, tip: ru.tip, ref: ru.ref[ed] || '', where: self.titleOf(t, r) + (py && ru.t !== 'proy' ? ' · ' + self.titleOf(s.tables.byId.proy, py) : ''),
          tname: t.name, ticon: ICON[t.icon] || ICON.db, tcolor: t.color,
          fixLabel: ru.fix.label, fix: function () { self.pmFix(ru, t.id, r.id); }, open: function () { self.openRec(t.id, r.id); } });
      });
    });
    out.sort(function (a, b) { return SEV_ORDER[a.sev] - SEV_ORDER[b.sev]; });
    return out;
  },
  pmFix(ru, tid, rid) {
    var s = this.st(), v = this.viewer(s);
    var l = this.lvl(s, tid, v.role);
    if (ru.fix.kind === 'open') { this.openRec(tid, rid); return; }
    if (ru.fix.kind === 'set') {
      if (l !== 'edit' && l !== 'full') { this.toastMsg('Con tu permiso no puedes cambiar este registro.'); return; }
      var val = ru.fix.value === '__me' ? [v.id] : ru.fix.value;
      this.setField(tid, rid, ru.fix.prop, val, 'aplicó una recomendación PMBOK');
      this.toastMsg('Recomendación aplicada: ' + ru.fix.label);
      return;
    }
    if (ru.fix.kind === 'add') {
      var preset = {}; preset[ru.fix.rel] = [tid === 'proy' ? rid : rid];
      var id = this.newRow(ru.fix.table, preset, true);
      if (id) this.openRec(ru.fix.table, id);
    }
  },
  pmProjects(s, v) {
    var self = this, t = s.tables.byId.proy;
    if (!t || this.lvl(s, 'proy', v.role) === 'none') return [];
    var all = this.pmIssues(s, v, {});
    return this.rowsFor(s, 'proy', v).map(function (r) {
      var g = self.pmGetter(s, t, r);
      var fase = optOf(propOf(t, 'fase'), g('fase'));
      var related = all.filter(function (x) { if (x.tid === 'proy') return x.rid === r.id; var rr = findRow(s.tables.byId[x.tid], x.rid); return rr && rr.proyecto && rr.proyecto[0] === r.id; });
      var cpi = g('cpi'), spi = g('spi');
      function idx(x) { return typeof x === 'number' ? { txt: String(x.toFixed(2)).replace('.', ','), cls: x < 0.9 ? 'bad' : x < 1 ? 'warn' : 'ok' } : { txt: '—', cls: '' }; }
      var dm = self.memberById(s, (g('director') || [])[0]);
      return { title: self.titleOf(t, r), fase: g('fase') || 'Sin fase', faseCls: 'p-' + (fase ? fase.c : 'gray'), pct: Math.max(0, Math.min(100, Number(g('avance')) || 0)), pctTxt: (Number(g('avance')) || 0) + ' %',
        cpi: idx(cpi).txt, cpiCls: idx(cpi).cls, spi: idx(spi).txt, spiCls: idx(spi).cls, director: dm ? dm.name : 'Sin director', dInitials: dm ? initialsOf(dm.name) : '?', dColor: dm ? dm.color : '#8C8C86',
        issues: String(related.length), hasIssues: related.length > 0, noIssues: related.length === 0, open: function () { self.openRec('proy', r.id); } };
    });
  },
  pmBlock(s, v, b) {
    var self = this;
    var ed = s.pmEd || '8';
    var issues = this.pmIssues(s, v, { mine: b.scope === 'me' });
    var nChecks = 0;
    PM_RULES.forEach(function (ru) { var t = s.tables.byId[ru.t]; if (t && self.lvl(s, t.id, v.role) !== 'none') nChecks += self.rowsFor(s, t.id, v).length; });
    var score = nChecks ? Math.round((1 - issues.length / nChecks) * 100) : 100;
    var expanded = !!(s.pmOpen || {})[b.id];
    var shown = expanded ? issues : issues.slice(0, 6);
    return {
      ed: ed, edName: 'PMBOK ' + ed, edNote: PM_ED_NOTE[ed], scope: b.scope === 'me' ? 'Solo lo que me toca' : 'Toda la cartera',
      edSeg: PM_EDS.map(function (x) { return { label: x.n, cls: x.id === ed ? 'on' : '', pick: function () { self.setState({ pmEd: x.id }); } }; }),
      score: score + ' %', scoreCls: score >= 85 ? 'ok' : score >= 65 ? 'warn' : 'bad', scorePct: score,
      nAlta: String(issues.filter(function (x) { return x.sev === 'alta'; }).length), nMedia: String(issues.filter(function (x) { return x.sev === 'media'; }).length), nBaja: String(issues.filter(function (x) { return x.sev === 'baja'; }).length),
      projects: b.scope === 'me' ? [] : this.pmProjects(s, v), hasProjects: b.scope !== 'me' && this.lvl(s, 'proy', v.role) !== 'none',
      issues: shown, noIssues: issues.length === 0, hasMore: issues.length > 6, moreLabel: expanded ? 'Ver menos' : 'Ver las ' + issues.length + ' recomendaciones',
      toggleMore: function () { var po = Object.assign({}, s.pmOpen || {}); po[b.id] = !expanded; self.setState({ pmOpen: po }); },
      newProject: function () { self.pmNewProject(); }, canNew: this.lvl(s, 'proy', v.role) === 'edit' || this.lvl(s, 'proy', v.role) === 'full'
    };
  },
  pmRec(s, v, t, row) {
    if (PM_TABLES.indexOf(t.id) < 0) return { has: false, items: [], tips: [] };
    var ed = s.pmEd || '8';
    var items = this.pmIssues(s, v, { tid: t.id, rowId: row.id });
    return { has: true, edName: 'PMBOK ' + ed, items: items, ok: items.length === 0, tips: (PM_TIPS[t.id] || []).map(function (x) { return { text: x }; }) };
  },
  pmNewProject() {
    var s = this.st(), v = this.viewer(s);
    var l = this.lvl(s, 'proy', v.role);
    if (l !== 'edit' && l !== 'full') { this.toastMsg('Con tu permiso no puedes crear proyectos.'); return; }
    var tables = clone(s.tables);
    var P = tables.byId.proy, TT = tables.byId.tar;
    var seq = s.seq, now = nowIso();
    var pid = 'n' + (++seq);
    var steps = [['Acta de constitución', 'Inicio'], ['Registro de interesados', 'Inicio'], ['Enunciado del alcance y EDT', 'Planificación'], ['Cronograma con línea base', 'Planificación'], ['Presupuesto y curva S', 'Planificación'], ['Plan de respuesta a riesgos', 'Planificación'], ['Informe de avance (valor ganado)', 'Monitoreo y control'], ['Acta de cierre y lecciones aprendidas', 'Cierre']];
    var ids = [];
    steps.forEach(function (st2, i) {
      var id = 'n' + (++seq);
      ids.push(id);
      TT.rows.push({ id: id, _n: TT.nextId++, _cAt: now, _cBy: v.id, _eAt: now, _eBy: v.id, _body: 'Fase: ' + st2[1], nombre: st2[0], proyecto: [pid], responsable: [v.id], estado: 'Sin empezar', inicio: '', fin: '', horas: 8, entregable: st2[0], criterio: '', });
    });
    P.rows.unshift({ id: pid, _n: P.nextId++, _cAt: now, _cBy: v.id, _eAt: now, _eBy: v.id, _body: '', nombre: 'Nuevo proyecto', fase: 'Inicio', enfoque: '', director: [v.id], patrocinador: [], acta: false, inicio: todayIso(), fin: '', presupuesto: 0, costo: 0, avance: 0, plan: 0, tareas: ids, riesgos: [], interesados: [], solicitudes: [], lecciones: '' });
    this.setState({ tables: tables, seq: seq + 1, rec: { tid: 'proy', id: pid }, recFull: null, log: this.addLog(s, 'creó un proyecto con la plantilla PMBOK') });
    this.toastMsg('Proyecto creado con 8 entregables de la plantilla PMBOK');
  },

  /* ---------- menú «/», portada, arrastrar ---------- */
  slashPick(pid, spec, opt) {
    var s = this.st();
    opt = opt || {};
    var tid0 = s.tables.order.filter(function (id) { return this.lvl(s, id, this.viewer(s).role) !== 'none'; }, this)[0];
    if (spec === 'newdb') { this.newDb(pid, opt); this.setState({ slashQ: '' }); return; }
    if (spec === 'db') { this.setState({ addBlockOpen: 'db', addCtx: opt, slashQ: '' }); return; }
    if (spec.indexOf('cols:') === 0) {
      var n = Number(spec.split(':')[1]) || 2;
      var pages = clone(s.pages), pg = pages.byId[pid], seq = s.seq;
      var at = pg.blocks.length;
      if (opt.replace) { pg.blocks.forEach(function (x, k) { if (x.id === opt.replace) at = k; }); pg.blocks = pg.blocks.filter(function (x) { return x.id !== opt.replace; }); }
      for (var i = 0; i < n; i++) pg.blocks.splice(at + i, 0, blk('b' + (++seq), 'text', 12 / n, { text: '' }));
      this.setState({ pages: pages, seq: seq + 1, slashQ: '', addBlockOpen: false });
      return;
    }
    this.addBlock(pid, spec, Object.assign({ table: tid0 }, opt));
    this.setState({ slashQ: '' });
  },
  slashList(pid, q, opt) {
    var self = this;
    return slashMatches(q).map(function (c, i) { return { name: c.n, desc: c.d, icon: ICON[c.icon] || ICON.plus, cls: i === 0 ? 'first' : '', pick: function () { self.slashPick(pid, c.spec, opt); } }; });
  },
  coverSet(pid, cover) { this.updPage(pid, function (pg) { pg.cover = cover; }); },
  coverUpload(pid, e) {
    var self = this;
    var f = e && e.target && e.target.files && e.target.files[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) { this.toastMsg('Elige un archivo de imagen.'); return; }
    if (f.size > 3 * 1024 * 1024) { this.toastMsg('La imagen pesa más de 3 MB. Usa una más liviana.'); return; }
    try {
      var rd = new FileReader();
      rd.onload = function () { self.coverSet(pid, { kind: 'img', v: String(rd.result), pos: 50 }); self.setState({ coverPick: null }); };
      rd.readAsDataURL(f);
    } catch (err) { this.toastMsg('No se pudo leer la imagen.'); }
  },
  coverStyle(cv) {
    if (!cv) return '';
    if (cv.kind === 'img') return 'background-image: url("' + String(cv.v).replace(/"/g, '') + '"); background-position: center ' + (cv.pos == null ? 50 : cv.pos) + '%';
    if (cv.kind === 'color') return 'background: ' + cv.v;
    return 'background: ' + (COVERS[cv.v] || COVERS[0]);
  },
  blkDragStart(bid, e) { this._dragBlk = bid; try { e.dataTransfer.setData('text/plain', 'blk:' + bid); e.dataTransfer.effectAllowed = 'move'; var el = e.target.closest('.blk'); if (el && e.dataTransfer.setDragImage) e.dataTransfer.setDragImage(el, 24, 20); if (el) setTimeout(function () { el.classList.add('jk-src'); }, 0); } catch (err) { } },
  blkDragEnd(e) { this._dragBlk = null; try { document.querySelectorAll('.blk.drop-before, .blk.drop-after, .blk.jk-src').forEach(function (n) { n.classList.remove('drop-before', 'drop-after', 'jk-src'); }); } catch (err) { } },
  dropSide(e) {
    try {
      var el = e.currentTarget, r = el.getBoundingClientRect();
      var wide = r.width > (el.parentNode.getBoundingClientRect().width * 0.7);
      return wide ? (e.clientY < r.top + r.height / 2 ? 'before' : 'after') : (e.clientX < r.left + r.width / 2 ? 'before' : 'after');
    } catch (err) { return 'before'; }
  },
  blkDragOver(e) {
    if (!this._dragBlk) return;
    try { e.preventDefault(); var side = this.dropSide(e); var el = e.currentTarget; el.classList.toggle('drop-before', side === 'before'); el.classList.toggle('drop-after', side === 'after'); } catch (err) { }
  },
  blkDragLeave(e) { try { e.currentTarget.classList.remove('drop-before', 'drop-after'); } catch (err) { } },
  blkDrop(target, e) {
    var bid = this._dragBlk;
    if (!bid) return;
    var side = this.dropSide(e);
    this.blkDragEnd(e);
    try { e.preventDefault(); } catch (err) { }
    if (bid === target) return;
    this.updBlock(bid, function (b, pg) {
      var from = pg.blocks.indexOf(b);
      pg.blocks.splice(from, 1);
      var to = -1; pg.blocks.forEach(function (x, k) { if (x.id === target) to = k; });
      if (to < 0) { pg.blocks.splice(from, 0, b); return false; }
      pg.blocks.splice(side === 'after' ? to + 1 : to, 0, b);
    });
    this.jellyOn(bid);
  },
  rzStart(bid, e) { this._rz = { bid: bid, x: 0 }; try { e.dataTransfer.setData('text/plain', 'rz'); e.dataTransfer.effectAllowed = 'move'; var img = document.createElement('canvas'); img.width = img.height = 1; e.dataTransfer.setDragImage(img, 0, 0); } catch (err) { } },
  rzMove(e) { if (this._rz && e.clientX) this._rz.x = e.clientX; },
  rzEnd(bid, e) {
    var rz = this._rz; this._rz = null;
    if (!rz) return;
    var x = (e && e.clientX) || rz.x;
    try {
      var el = e.target.closest('.blk'), grid = e.target.closest('.pg-grid');
      var gr = grid.getBoundingClientRect(), br = el.getBoundingClientRect();
      var gap = 16, colW = (gr.width + gap) / 12;
      var w = Math.round((x - br.left + gap) / colW);
      w = Math.max(2, Math.min(12, w));
      this.updBlock(bid, function (b) { if (b.w === w) return false; b.w = w; }); this.jellyOn(bid);
    } catch (err) { }
  },
  todoUpd(bid, fn) { this.updBlock(bid, function (b) { if (!b.items) b.items = []; return fn(b); }); },
  pageSetArea(pid, aid) { this.updPage(pid, function (pg) { pg.area = aid; }); this.setState({ areaPick: null }); }
});
