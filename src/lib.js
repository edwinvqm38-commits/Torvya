/* ================= constantes ================= */
var ACCENTS = [
  { id: 'tecsur', name: 'TECSUR', hex: '#00468C' },
  { id: 'indigo', name: 'Índigo', hex: '#4F46E5' }, { id: 'azul', name: 'Azul', hex: '#1D4ED8' }, { id: 'esmeralda', name: 'Esmeralda', hex: '#047857' },
  { id: 'ambar', name: 'Ámbar', hex: '#B45309' }, { id: 'rosa', name: 'Rosa', hex: '#BE185D' }, { id: 'grafito', name: 'Grafito', hex: '#27272A' }
];
var ROLES = [{ id: 'admin', name: 'Administración' }, { id: 'finanzas', name: 'Finanzas' }, { id: 'ventas', name: 'Ventas' }, { id: 'almacen', name: 'Almacén' }, { id: 'invitado', name: 'Invitado' }];
var ROLE_NAME = { admin: 'Administración', finanzas: 'Finanzas', ventas: 'Ventas', almacen: 'Almacén', invitado: 'Invitado' };
var LEVELS = ['none', 'view', 'comment', 'edit', 'full'];
var LEVEL_NAME = { none: 'Sin acceso', view: 'Ver', comment: 'Comentar', edit: 'Editar', full: 'Total' };
var LEVEL_CLS = { none: 'dashed', view: 'p-blue', comment: 'p-teal', edit: 'p-violet', full: 'p-green' };
var TYPES = [
  { t: 'text', n: 'Texto' }, { t: 'number', n: 'Número' }, { t: 'select', n: 'Seleccionar' }, { t: 'multi_select', n: 'Selección múltiple' },
  { t: 'status', n: 'Estado' }, { t: 'date', n: 'Fecha' }, { t: 'person', n: 'Personas' }, { t: 'files', n: 'Archivos y multimedia' },
  { t: 'checkbox', n: 'Casilla' }, { t: 'url', n: 'URL' }, { t: 'email', n: 'Correo electrónico' }, { t: 'phone', n: 'Teléfono' },
  { t: 'formula', n: 'Fórmula' }, { t: 'relation', n: 'Relación' }, { t: 'rollup', n: 'Rollup' }, { t: 'created_time', n: 'Fecha de creación' },
  { t: 'created_by', n: 'Creado por' }, { t: 'last_edited_time', n: 'Última edición' }, { t: 'last_edited_by', n: 'Última edición por' },
  { t: 'button', n: 'Botón' }, { t: 'place', n: 'Lugar' }, { t: 'id', n: 'ID' }
];
var TYPE_NAME = { title: 'Título', ai: 'Autocompletado con IA' };
TYPES.forEach(function (x) { TYPE_NAME[x.t] = x.n; });
var LAYOUTS = [{ id: 'table', n: 'Tabla' }, { id: 'board', n: 'Tablero' }, { id: 'list', n: 'Lista' }, { id: 'gallery', n: 'Galería' }, { id: 'calendar', n: 'Calendario' }, { id: 'chart', n: 'Gráfico' }, { id: 'form', n: 'Formulario' }];
var LAYOUT_NAME = {};
LAYOUTS.forEach(function (l) { LAYOUT_NAME[l.id] = l.n; });
var CHART_KINDS = [{ id: 'column', n: 'Columnas', icon: 'chart' }, { id: 'bar', n: 'Barras', icon: 'barh' }, { id: 'line', n: 'Línea', icon: 'line' }, { id: 'donut', n: 'Anillo', icon: 'pie' }];
var COLORS = ['gray', 'blue', 'green', 'amber', 'violet', 'teal', 'red', 'pink'];
var COLOR_NAME = { gray: 'Gris', blue: 'Azul', green: 'Verde', amber: 'Ámbar', violet: 'Violeta', teal: 'Turquesa', red: 'Rojo', pink: 'Rosa' };
var SOLID = { gray: '#8C8C86', blue: '#3B6FD8', green: '#2F9A5C', amber: '#D08A1E', violet: '#7C4FDB', teal: '#1E9A92', red: '#D2483B', pink: '#D14A8A' };
var PALETTE = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#64748B', '#84CC16'];
var OPS = {
  text: ['contains', 'not_contains', 'is', 'is_not', 'empty', 'not_empty'],
  number: ['eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'empty', 'not_empty'],
  select: ['is', 'is_not', 'empty', 'not_empty'],
  multi: ['contains', 'not_contains', 'empty', 'not_empty'],
  person: ['contains', 'not_contains', 'empty', 'not_empty'],
  date: ['is', 'before', 'after', 'empty', 'not_empty'],
  check: ['checked', 'unchecked'],
  rel: ['contains', 'not_contains', 'empty', 'not_empty'],
  calc: ['eq', 'gt', 'lt', 'contains', 'empty', 'not_empty']
};
var OP_NAME = { contains: 'contiene', not_contains: 'no contiene', is: 'es', is_not: 'no es', empty: 'está vacío', not_empty: 'no está vacío', eq: '=', neq: '≠', gt: '>', lt: '<', gte: '≥', lte: '≤', before: 'antes de', after: 'después de', checked: 'marcada', unchecked: 'sin marcar' };
var NOVAL = { empty: 1, not_empty: 1, checked: 1, unchecked: 1 };
var NUM_FMTS = [{ id: 'number', n: 'Número' }, { id: 'money', n: 'Soles (S/)' }, { id: 'usd', n: 'Dólares (US$)' }, { id: 'eur', n: 'Euros (€)' }, { id: 'percent', n: 'Porcentaje' }];
var RES_FMTS = [{ id: 'auto', n: 'Automático' }, { id: 'number', n: 'Número' }, { id: 'money', n: 'Soles (S/)' }, { id: 'usd', n: 'Dólares (US$)' }, { id: 'percent', n: 'Porcentaje' }, { id: 'text', n: 'Texto' }];
var DATE_FMTS = [{ id: 'long', n: '14 nov 2026' }, { id: 'short', n: '14/11/2026' }, { id: 'relative', n: 'Relativa (hace 2 días)' }, { id: 'iso', n: '2026-11-14' }];
var ROLLUP_FNS = [{ id: 'show', n: 'Mostrar original' }, { id: 'count', n: 'Contar registros' }, { id: 'count_values', n: 'Contar valores' }, { id: 'sum', n: 'Suma' }, { id: 'avg', n: 'Promedio' }, { id: 'min', n: 'Mínimo' }, { id: 'max', n: 'Máximo' }];
var AGG_NAME = { count: 'Contar registros', sum: 'Suma', avg: 'Promedio', min: 'Mínimo', max: 'Máximo' };
var CALC_NAME = { none: 'Calcular', count: 'Contar', not_empty: 'No vacíos', empty: 'Vacíos', sum: 'Suma', avg: 'Promedio', min: 'Mín.', max: 'Máx.', checked: 'Marcadas', pct_checked: '% marcadas' };
var STATUS_GROUPS = [{ id: 'todo', n: 'Por hacer' }, { id: 'doing', n: 'En curso' }, { id: 'done', n: 'Completado' }];
var WIDTHS = [{ id: 3, n: '¼' }, { id: 4, n: '⅓' }, { id: 6, n: '½' }, { id: 8, n: '⅔' }, { id: 12, n: 'Completo' }];
var MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
var MONTHS_LONG = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
var DOW = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
var NEW_COLORS = ['#0F766E', '#6D28D9', '#9A3412', '#1D4ED8', '#BE185D', '#4D7C0F', '#0E7490', '#B45309', '#4F46E5', '#047857'];
var ORG_LVL = ['#6366F1', '#0EA5E9', '#14B8A6', '#F59E0B', '#EC4899', '#A855F7'];
var ORG_LVL_PAL = ['#6366F1', '#0EA5E9', '#14B8A6', '#22C55E', '#F59E0B', '#F97316', '#EF4444', '#EC4899', '#A855F7', '#64748B'];
var DB_ICONS = Object.keys(ICON).filter(function (k) { return k.indexOf('i-') === 0; });
var COMPUTED = { formula: 1, rollup: 1, created_time: 1, created_by: 1, last_edited_time: 1, last_edited_by: 1, id: 1 };
var SHEET_COLS = 'ABCDEFGHIJ'.split('');
var RULE_FN = {
  own: function (row, v) { return (row.vendedor || []).indexOf(v.id) >= 0; },
  despacho: function (row) { return row.estado === 'En preparación' || row.estado === 'Enviado'; },
  cerrados: function (row) { return row.estado === 'Entregado'; }
};
var CONNECTIONS = ['Google Drive Archivo', 'Figma Archivo', 'PRs de GitHub', 'Zendesk Ticket'];
var BLOCK_TYPES = [
  { id: 'heading', n: 'Encabezado', d: 'Título de sección', icon: 'heading' },
  { id: 'text', n: 'Texto', d: 'Notas y explicaciones', icon: 'para' },
  { id: 'db', n: 'Base de datos existente', d: 'Muestra una tabla con sus vistas', icon: 'db' },
  { id: 'newdb', n: 'Nueva base de datos', d: 'Crea una tabla aquí mismo', icon: 'table' },
  { id: 'chart:column', n: 'Gráfico de columnas', d: 'Comparar categorías', icon: 'chart' },
  { id: 'chart:bar', n: 'Gráfico de barras', d: 'Rankings y top N', icon: 'barh' },
  { id: 'chart:line', n: 'Gráfico de línea', d: 'Evolución en el tiempo', icon: 'line' },
  { id: 'chart:donut', n: 'Gráfico de anillo', d: 'Partes de un total', icon: 'pie' },
  { id: 'kpi', n: 'Indicador (KPI)', d: 'Un número clave', icon: 'kpi' },
  { id: 'slicer', n: 'Segmentación', d: 'Filtra todo el panel con un clic', icon: 'slicer' },
  { id: 'sheet', n: 'Hoja de cálculo', d: 'Celdas y fórmulas tipo Excel', icon: 'sheet' },
  { id: 'map', n: 'Mapa de relaciones', d: 'Cómo se vinculan tus tablas', icon: 'map' },
  { id: 'divider', n: 'Separador', d: 'Línea divisoria', icon: 'divider' },
  { id: 'todo', n: 'Lista de tareas', d: 'Casillas para marcar', icon: 'i-checks' },
  { id: 'callout', n: 'Aviso', d: 'Nota destacada', icon: 'info' },
  { id: 'pm', n: 'Salud de proyectos (PMBOK)', d: 'Recomendaciones de buenas prácticas', icon: 'shield' },
  { id: 'cols:2', n: '2 columnas', d: 'Divide la fila en dos', icon: 'half' },
  { id: 'cols:3', n: '3 columnas', d: 'Divide la fila en tres', icon: 'grid' }
];

/* ================= utilidades ================= */
function o(v, c) { return { v: v, c: c }; }
function so(v, c, g) { return { v: v, c: c, g: g }; }
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function todayIso() { var d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function nowIso() { var d = new Date(); return todayIso() + 'T' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
function clone(x) { return JSON.parse(JSON.stringify(x)); }
function fmtNum(n, dec, sep) {
  var x = Number(n);
  if (n === '' || n == null || isNaN(x)) return String(n == null ? '' : n);
  var neg = x < 0;
  var s;
  if (dec === 0 || dec === 1 || dec === 2) s = Math.abs(x).toFixed(dec);
  else s = (Math.round(Math.abs(x) * 100) / 100).toString();
  var parts = s.split('.');
  if (sep !== false) parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (neg ? '-' : '') + parts.join('.');
}
function fmtNumber(val, fmt, dec, sep) {
  if (val === '' || val == null) return '';
  var x = Number(val);
  if (isNaN(x)) return String(val);
  var d = (dec === 0 || dec === 1 || dec === 2) ? dec : undefined;
  if (fmt === 'money') return 'S/ ' + fmtNum(x, d, sep);
  if (fmt === 'usd') return 'US$ ' + fmtNum(x, d, sep);
  if (fmt === 'eur') return fmtNum(x, d, sep) + ' €';
  if (fmt === 'percent') return fmtNum(x, d, sep) + ' %';
  return fmtNum(x, d, sep);
}
function fmtDate(d, fmt) {
  if (!d) return '';
  var s = String(d).slice(0, 10);
  var p = s.split('-');
  if (p.length !== 3 || !MONTHS[Number(p[1]) - 1]) return String(d);
  if (fmt === 'short') return p[2] + '/' + p[1] + '/' + p[0];
  if (fmt === 'iso') return s;
  if (fmt === 'relative') {
    var t = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
    var n = new Date(); var tn = Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
    var days = Math.round((t - tn) / 86400000);
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Mañana';
    if (days === -1) return 'Ayer';
    return days > 0 ? 'En ' + days + ' días' : 'Hace ' + (-days) + ' días';
  }
  return Number(p[2]) + ' ' + MONTHS[Number(p[1]) - 1] + ' ' + p[0];
}
function fmtDateTime(d) { if (!d) return ''; var s = String(d); return fmtDate(s) + (s.length > 10 ? ', ' + s.slice(11, 16) : ''); }
function initialsOf(name) {
  var parts = String(name || '?').split('@')[0].split(/[\s._-]+/).filter(function (x) { return x; });
  return ((parts[0] || '?').charAt(0) + (parts[1] ? parts[1].charAt(0) : '')).toUpperCase();
}
function abbrOf(name) { var s = String(name || '').trim(); return s ? s.charAt(0).toUpperCase() + (s.charAt(1) || '').toLowerCase() : '··'; }
function slugOf(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function isEmptyVal(v) { return v == null || v === '' || (Array.isArray(v) && v.length === 0); }
function flat(v) { var out = []; (function rec(x) { if (Array.isArray(x)) x.forEach(rec); else out.push(x); })(v); return out; }
function toNum(v) {
  if (typeof v === 'number') return isNaN(v) ? 0 : v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v == null || v === '') return 0;
  if (Array.isArray(v)) return flat(v).reduce(function (a, b) { return a + toNum(b); }, 0);
  var n = Number(String(v).replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? 0 : n;
}
function toNumOrNull(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return isNaN(v) ? null : v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  var n = Number(v);
  return isNaN(n) ? null : n;
}
function toStr(v) {
  if (v == null) return '';
  if (Array.isArray(v)) return flat(v).map(toStr).filter(function (x) { return x !== ''; }).join(', ');
  if (typeof v === 'boolean') return v ? 'VERDADERO' : 'FALSO';
  if (typeof v === 'number') return String(Math.round(v * 1e6) / 1e6);
  return String(v);
}
function truthy(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (Array.isArray(v)) return v.length > 0;
  return v != null && v !== '';
}
function looseEq(a, b) {
  if (typeof a === 'number' || typeof b === 'number') return toNum(a) === toNum(b);
  if (typeof a === 'boolean' || typeof b === 'boolean') return truthy(a) === truthy(b);
  return toStr(a).toLowerCase() === toStr(b).toLowerCase();
}
function cmpVals(a, b) {
  if (typeof a === 'number' || typeof b === 'number') return toNum(a) - toNum(b);
  var x = toStr(a).toLowerCase(), y = toStr(b).toLowerCase();
  return x < y ? -1 : (x > y ? 1 : 0);
}
function parseDateVal(v) { var s = toStr(v); if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return null; return new Date(Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10))); }
function isoOfDate(d) { return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate()); }
function optOf(p, val) { var r = null; (p.options || []).forEach(function (x) { if (x.v === val) r = x; }); return r; }
function propOf(t, key) { if (!t) return null; var r = null; t.props.forEach(function (p) { if (p.key === key) r = p; }); return r; }
function propByName(t, name) { var nm = String(name).trim().toLowerCase(); var r = null; t.props.forEach(function (p) { if (String(p.name).trim().toLowerCase() === nm) r = p; }); return r; }
function findRow(t, id) { if (!t) return null; var r = null; t.rows.forEach(function (x) { if (x.id === id) r = x; }); return r; }
function catOf(type) {
  if (type === 'number' || type === 'id') return 'number';
  if (type === 'select' || type === 'status') return 'select';
  if (type === 'multi_select') return 'multi';
  if (type === 'person' || type === 'created_by' || type === 'last_edited_by') return 'person';
  if (type === 'date' || type === 'created_time' || type === 'last_edited_time') return 'date';
  if (type === 'checkbox') return 'check';
  if (type === 'relation' || type === 'files') return 'rel';
  if (type === 'formula' || type === 'rollup') return 'calc';
  if (type === 'button') return 'none';
  return 'text';
}
function isNumericProp(p) { return p.type === 'number' || p.type === 'id' || (p.type === 'rollup' && p.fn !== 'show') || (p.type === 'formula' && ['number', 'money', 'usd', 'percent'].indexOf(p.resFmt) >= 0); }
function isAggProp(p) { return p.type === 'number' || (p.type === 'rollup' && p.fn !== 'show') || p.type === 'formula'; }
function isGroupable(p) { return ['select', 'status', 'multi_select', 'person', 'created_by', 'last_edited_by', 'checkbox', 'relation'].indexOf(p.type) >= 0; }
function isChartGroupable(p) { return ['number', 'files', 'button', 'ai', 'url', 'email', 'phone', 'id'].indexOf(p.type) < 0; }
function isDateType(p) { return p.type === 'date' || p.type === 'created_time' || p.type === 'last_edited_time'; }
function uniqueName(t, name) { var base = String(name || 'Propiedad').trim() || 'Propiedad'; var n = base, i = 2; while (t.props.some(function (p) { return p.name === n; })) { n = base + ' ' + i; i++; } return n; }
function dispText(d) {
  if (!d) return '';
  if (d.kText) return d.text;
  if (d.kPills) return d.pills.map(function (x) { return x.text; }).join(', ');
  if (d.kChips) return d.chips.map(function (x) { return x.label; }).join(', ');
  if (d.kPeople) return d.people.map(function (x) { return x.name; }).join(', ');
  if (d.kCheck) return d.checked ? 'Sí' : 'No';
  if (d.kLink) return d.linkText;
  if (d.kFiles) return d.files.map(function (x) { return x.name; }).join(', ');
  if (d.kBar || d.kRing) return d.text;
  return '';
}
function autoValLabel(v) {
  if (v === true) return 'Marcada';
  if (v === false) return 'Sin marcar';
  if (v === '__today') return 'hoy';
  if (v === '__me') return 'quien hace el cambio';
  return String(v);
}
function cellIdx(ref) { var m = /^([A-Z]+)(\d+)$/.exec(ref); if (!m) return null; var c = 0; for (var i = 0; i < m[1].length; i++) c = c * 26 + (m[1].charCodeAt(i) - 64); return { c: c - 1, r: Number(m[2]) - 1 }; }
function cellRef(c, r) { return SHEET_COLS[c] + (r + 1); }
/* inserta un trozo al final de una fórmula: si lo anterior ya es un valor completo, lo une con + */
function joinExpr(cur, code) { cur = String(cur || ''); if (cur === '' || cur === '=') return '=' + code; if (/[=(;,+\-*\/&<>^\s]$/.test(cur)) return cur + code; return cur + ' + ' + code; }

/* ================= fórmulas (tipo Notion y tipo Excel) ================= */
var FN_ALIAS = {
  SUMA: 'SUM', PROMEDIO: 'AVERAGE', AVG: 'AVERAGE', CONTAR: 'COUNT', CONTARA: 'COUNTA', SI: 'IF', 'SI.ERROR': 'IFERROR', Y: 'AND', O: 'OR', NO: 'NOT',
  REDONDEAR: 'ROUND', 'REDONDEAR.MAS': 'ROUNDUP', 'REDONDEAR.MENOS': 'ROUNDDOWN', ENTERO: 'INT', POTENCIA: 'POWER', RAIZ: 'SQRT', RESIDUO: 'MOD',
  CONCATENAR: 'CONCAT', TEXTO: 'TEXT', FORMAT: 'TEXT', MAYUSC: 'UPPER', MINUSC: 'LOWER', LARGO: 'LEN', LENGTH: 'LEN', CONTIENE: 'CONTAINS',
  IZQUIERDA: 'LEFT', DERECHA: 'RIGHT', ESPACIOS: 'TRIM', ESBLANCO: 'ISBLANK', EMPTY: 'ISBLANK', HOY: 'TODAY', AHORA: 'TODAY', NOW: 'TODAY',
  DIAS: 'DAYS', 'AÑO': 'YEAR', ANO: 'YEAR', MES: 'MONTH', DIA: 'DAY', 'SUMAR.SI': 'SUMIF', 'CONTAR.SI': 'COUNTIF', 'PROMEDIO.SI': 'AVERAGEIF',
  'SUMAR.SI.CONJUNTO': 'SUMIFS', 'CONTAR.SI.CONJUNTO': 'COUNTIFS', BUSCARX: 'XLOOKUP', BUSCAR: 'XLOOKUP', VALOR: 'TONUMBER', DATEBETWEEN: 'DATEBETWEEN', DATEADD: 'DATEADD', FORMATDATE: 'FORMATDATE'
};
function tokenize(src) {
  var toks = [];
  var s = String(src || '').trim();
  if (s.charAt(0) === '=') s = s.slice(1);
  var i = 0;
  function readBracket(start) {
    var k = start + 1, str = '';
    while (k < s.length && s.charAt(k) !== ']') { str += s.charAt(k); k++; }
    if (k >= s.length) throw new Error('Falta cerrar un corchete');
    return { str: str.trim(), end: k + 1 };
  }
  while (i < s.length) {
    var c = s.charAt(i);
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(s.charAt(i + 1)))) {
      var j = i;
      while (j < s.length && /[0-9.]/.test(s.charAt(j))) j++;
      toks.push({ t: 'num', v: parseFloat(s.slice(i, j)) }); i = j; continue;
    }
    if (c === '"' || c === "'") {
      var q = c, k = i + 1, str = '';
      while (k < s.length && s.charAt(k) !== q) { if (s.charAt(k) === '\\' && k + 1 < s.length) k++; str += s.charAt(k); k++; }
      if (k >= s.length) throw new Error('Falta cerrar una comilla');
      i = k + 1;
      if (s.charAt(i) === '[') { var br = readBracket(i); toks.push({ t: 'sref', table: str, col: br.str }); i = br.end; continue; }
      toks.push({ t: 'str', v: str }); continue;
    }
    if (c === '[') { var b2 = readBracket(i); toks.push({ t: 'this', col: b2.str }); i = b2.end; continue; }
    if (/[A-Za-z_áéíóúñÁÉÍÓÚÑ]/.test(c)) {
      var m = i;
      while (m < s.length && /[A-Za-z0-9_.áéíóúñÁÉÍÓÚÑ]/.test(s.charAt(m))) m++;
      var word = s.slice(i, m);
      i = m;
      if (s.charAt(i) === '[') { var b3 = readBracket(i); toks.push({ t: 'sref', table: word, col: b3.str }); i = b3.end; continue; }
      if (/^[A-J]\d{1,3}$/.test(word) && s.charAt(i) !== '(') { toks.push({ t: 'cell', v: word }); continue; }
      toks.push({ t: 'id', v: word }); continue;
    }
    var two = s.substr(i, 2);
    if (['==', '!=', '>=', '<=', '&&', '||', '<>'].indexOf(two) >= 0) { toks.push({ t: 'op', v: two === '<>' ? '!=' : two }); i += 2; continue; }
    if (c === '=') { toks.push({ t: 'op', v: '==' }); i++; continue; }
    if ('+-*/%^&<>!(),;:'.indexOf(c) >= 0) { toks.push({ t: 'op', v: c === ';' ? ',' : c }); i++; continue; }
    throw new Error('Carácter no válido: ' + c);
  }
  return toks;
}
function parseFormula(src) {
  var toks = tokenize(src);
  var pos = 0;
  var PREC = { '||': 1, '&&': 2, '==': 3, '!=': 3, '>': 3, '<': 3, '>=': 3, '<=': 3, '&': 4, '+': 5, '-': 5, '*': 6, '/': 6, '%': 6, '^': 7 };
  function isOp(v) { var t = toks[pos]; return !!t && t.t === 'op' && t.v === v; }
  function expect(v) { if (!isOp(v)) throw new Error('Se esperaba «' + v + '»'); pos++; }
  function parseExpr(minP) {
    var left = parseUnary();
    for (;;) {
      var t = toks[pos];
      if (!t || t.t !== 'op' || !PREC[t.v] || PREC[t.v] < minP) break;
      pos++;
      var right = parseExpr(t.v === '^' ? PREC[t.v] : PREC[t.v] + 1);
      left = { k: 'bin', op: t.v, a: left, b: right };
    }
    return left;
  }
  function parseUnary() {
    if (isOp('-')) { pos++; return { k: 'neg', a: parseUnary() }; }
    if (isOp('+')) { pos++; return parseUnary(); }
    if (isOp('!')) { pos++; return { k: 'not', a: parseUnary() }; }
    return parsePrimary();
  }
  function parsePrimary() {
    var t = toks[pos++];
    if (!t) throw new Error('La fórmula está incompleta');
    if (t.t === 'num' || t.t === 'str') return { k: 'lit', v: t.v };
    if (t.t === 'sref') return { k: 'sref', table: t.table, col: t.col };
    if (t.t === 'this') return { k: 'this', col: t.col };
    if (t.t === 'cell') {
      if (isOp(':')) { pos++; var t2 = toks[pos++]; if (!t2 || t2.t !== 'cell') throw new Error('Rango incompleto'); return { k: 'range', a: t.v, b: t2.v }; }
      return { k: 'cell', v: t.v };
    }
    if (t.t === 'op' && t.v === '(') { var e = parseExpr(1); expect(')'); return e; }
    if (t.t === 'id') {
      var name = t.v.toUpperCase();
      if (name === 'TRUE' || name === 'VERDADERO') return { k: 'lit', v: true };
      if (name === 'FALSE' || name === 'FALSO') return { k: 'lit', v: false };
      if (isOp('(')) {
        pos++;
        var args = [];
        if (!isOp(')')) { args.push(parseExpr(1)); while (isOp(',')) { pos++; args.push(parseExpr(1)); } }
        expect(')');
        return { k: 'call', f: FN_ALIAS[name] || name, args: args };
      }
      throw new Error('Nombre desconocido: ' + t.v);
    }
    throw new Error('Símbolo inesperado: ' + (t.v || t.t));
  }
  if (!toks.length) return { k: 'lit', v: null };
  var ast = parseExpr(1);
  if (pos < toks.length) throw new Error('Sobra texto al final de la fórmula');
  return ast;
}
function evalAst(n, ctx) {
  switch (n.k) {
    case 'lit': return n.v;
    case 'neg': return -toNum(evalAst(n.a, ctx));
    case 'not': return !truthy(evalAst(n.a, ctx));
    case 'call': return callFn(n.f, n.args, ctx);
    case 'sref': if (!ctx.sref) throw new Error('Aquí no se pueden usar referencias a tablas'); return ctx.sref(n.table, n.col);
    case 'this': if (!ctx.prop) throw new Error('[' + n.col + '] solo funciona dentro de una tabla'); return ctx.prop(n.col);
    case 'cell': if (!ctx.cell) throw new Error('Las celdas como ' + n.v + ' solo existen en la hoja de cálculo'); return ctx.cell(n.v);
    case 'range': if (!ctx.range) throw new Error('Los rangos solo existen en la hoja de cálculo'); return ctx.range(n.a, n.b);
  }
  if (n.op === '&&') return truthy(evalAst(n.a, ctx)) && truthy(evalAst(n.b, ctx));
  if (n.op === '||') return truthy(evalAst(n.a, ctx)) || truthy(evalAst(n.b, ctx));
  var a = evalAst(n.a, ctx), b = evalAst(n.b, ctx);
  switch (n.op) {
    case '&': return toStr(a) + toStr(b);
    case '+': return (typeof a === 'string' && a !== '' && isNaN(Number(a))) || (typeof b === 'string' && b !== '' && isNaN(Number(b))) ? toStr(a) + toStr(b) : toNum(a) + toNum(b);
    case '-': return toNum(a) - toNum(b);
    case '*': return toNum(a) * toNum(b);
    case '/': if (toNum(b) === 0) throw new Error('División entre cero'); return toNum(a) / toNum(b);
    case '%': return toNum(a) % toNum(b);
    case '^': return Math.pow(toNum(a), toNum(b));
    case '==': return looseEq(a, b);
    case '!=': return !looseEq(a, b);
    case '>': return cmpVals(a, b) > 0;
    case '<': return cmpVals(a, b) < 0;
    case '>=': return cmpVals(a, b) >= 0;
    case '<=': return cmpVals(a, b) <= 0;
  }
  return null;
}
function critMatch(v, crit) {
  if (Array.isArray(v)) return flat(v).some(function (x) { return critMatch(x, crit); });
  if (typeof crit === 'number') return toNumOrNull(v) === crit;
  if (typeof crit === 'boolean') return truthy(v) === crit;
  var c = toStr(crit);
  var m = /^(>=|<=|<>|>|<|=)(.*)$/.exec(c);
  if (m) {
    var rhs = m[2];
    var num = rhs !== '' && !isNaN(Number(rhs));
    var lhs = num ? toNumOrNull(v) : toStr(v).toLowerCase();
    var r = num ? Number(rhs) : rhs.toLowerCase();
    if (num && lhs == null) return m[1] === '<>';
    switch (m[1]) { case '>=': return lhs >= r; case '<=': return lhs <= r; case '>': return lhs > r; case '<': return lhs < r; case '<>': return lhs !== r; default: return lhs === r; }
  }
  if (c.indexOf('*') >= 0) { var re = new RegExp('^' + c.toLowerCase().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$'); return re.test(toStr(v).toLowerCase()); }
  return toStr(v).toLowerCase() === c.toLowerCase();
}
function callFn(f, args, ctx) {
  function A(i) { return evalAst(args[i], ctx); }
  function all() { return args.map(function (x, i) { return A(i); }); }
  function nums() { return flat(all()).map(toNumOrNull).filter(function (x) { return x != null; }); }
  function need(n) { if (args.length < n) throw new Error(f + ' necesita ' + n + ' argumentos'); }
  function arr(v) { return Array.isArray(v) ? v : [v]; }
  switch (f) {
    case 'PROP': return ctx.prop ? ctx.prop(toStr(A(0))) : (function () { throw new Error('prop() solo funciona dentro de una tabla'); })();
    case 'IF': need(2); return truthy(A(0)) ? A(1) : (args.length > 2 ? A(2) : false);
    case 'IFERROR': need(2); try { return A(0); } catch (e) { return A(1); }
    case 'AND': return flat(all()).every(truthy);
    case 'OR': return flat(all()).some(truthy);
    case 'NOT': return !truthy(A(0));
    case 'SUM': return nums().reduce(function (a, b) { return a + b; }, 0);
    case 'AVERAGE': { var n1 = nums(); if (!n1.length) throw new Error('PROMEDIO sin números'); return n1.reduce(function (a, b) { return a + b; }, 0) / n1.length; }
    case 'COUNT': return nums().length;
    case 'COUNTA': return flat(all()).filter(function (x) { return !isEmptyVal(x); }).length;
    case 'MAX': { var n2 = nums(); return n2.length ? Math.max.apply(null, n2) : 0; }
    case 'MIN': { var n3 = nums(); return n3.length ? Math.min.apply(null, n3) : 0; }
    case 'ROUND': { var d = args.length > 1 ? toNum(A(1)) : 0; var m = Math.pow(10, d); return Math.round(toNum(A(0)) * m) / m; }
    case 'ROUNDUP': { var du = args.length > 1 ? toNum(A(1)) : 0; var mu = Math.pow(10, du); return Math.ceil(toNum(A(0)) * mu) / mu; }
    case 'ROUNDDOWN': { var dd = args.length > 1 ? toNum(A(1)) : 0; var md = Math.pow(10, dd); return Math.floor(toNum(A(0)) * md) / md; }
    case 'INT': case 'FLOOR': return Math.floor(toNum(A(0)));
    case 'CEIL': return Math.ceil(toNum(A(0)));
    case 'ABS': return Math.abs(toNum(A(0)));
    case 'POWER': return Math.pow(toNum(A(0)), toNum(A(1)));
    case 'SQRT': return Math.sqrt(toNum(A(0)));
    case 'MOD': return toNum(A(0)) % toNum(A(1));
    case 'CONCAT': return flat(all()).map(toStr).join('');
    case 'TEXT': { var tv = A(0); return typeof tv === 'number' ? fmtNum(tv) : toStr(tv); }
    case 'UPPER': return toStr(A(0)).toUpperCase();
    case 'LOWER': return toStr(A(0)).toLowerCase();
    case 'LEN': { var lv = A(0); return Array.isArray(lv) ? lv.length : toStr(lv).length; }
    case 'CONTAINS': return toStr(A(0)).toLowerCase().indexOf(toStr(A(1)).toLowerCase()) >= 0;
    case 'LEFT': return toStr(A(0)).slice(0, args.length > 1 ? toNum(A(1)) : 1);
    case 'RIGHT': { var rs = toStr(A(0)); var rn = args.length > 1 ? toNum(A(1)) : 1; return rs.slice(Math.max(0, rs.length - rn)); }
    case 'TRIM': return toStr(A(0)).trim().replace(/\s+/g, ' ');
    case 'ISBLANK': return isEmptyVal(A(0));
    case 'TONUMBER': return toNum(A(0));
    case 'TODAY': return todayIso();
    case 'YEAR': { var y = parseDateVal(A(0)); return y ? y.getUTCFullYear() : null; }
    case 'MONTH': { var mo = parseDateVal(A(0)); return mo ? mo.getUTCMonth() + 1 : null; }
    case 'DAY': { var da = parseDateVal(A(0)); return da ? da.getUTCDate() : null; }
    case 'DAYS': { var e1 = parseDateVal(A(0)), s1 = parseDateVal(A(1)); if (!e1 || !s1) return null; return Math.round((e1 - s1) / 86400000); }
    case 'DATEBETWEEN': {
      var d1 = parseDateVal(A(0)), d2 = parseDateVal(A(1));
      if (!d1 || !d2) return null;
      var days = Math.round((d1 - d2) / 86400000);
      var u = args.length > 2 ? toStr(A(2)).toLowerCase() : 'days';
      if (u === 'weeks') return Math.trunc(days / 7);
      if (u === 'months') return Math.trunc(days / 30);
      if (u === 'years') return Math.trunc(days / 365);
      return days;
    }
    case 'DATEADD': {
      var base = parseDateVal(A(0));
      if (!base) return null;
      var nn = toNum(A(1));
      var unit = args.length > 2 ? toStr(A(2)).toLowerCase() : 'days';
      if (unit === 'months') base.setUTCMonth(base.getUTCMonth() + nn);
      else if (unit === 'years') base.setUTCFullYear(base.getUTCFullYear() + nn);
      else base.setUTCDate(base.getUTCDate() + (unit === 'weeks' ? nn * 7 : nn));
      return isoOfDate(base);
    }
    case 'FORMATDATE': return fmtDate(toStr(A(0)));
    case 'SUMIF': case 'COUNTIF': case 'AVERAGEIF': {
      need(2);
      var rng = arr(A(0)), crit = A(1), sumR = args.length > 2 ? arr(A(2)) : rng;
      var picked = [];
      rng.forEach(function (v, i) { if (critMatch(v, crit)) picked.push(sumR[i]); });
      if (f === 'COUNTIF') return picked.length;
      var pn = flat(picked).map(toNumOrNull).filter(function (x) { return x != null; });
      if (f === 'SUMIF') return pn.reduce(function (a, b) { return a + b; }, 0);
      if (!pn.length) throw new Error('PROMEDIO.SI sin coincidencias');
      return pn.reduce(function (a, b) { return a + b; }, 0) / pn.length;
    }
    case 'SUMIFS': case 'COUNTIFS': {
      var start = f === 'SUMIFS' ? 1 : 0;
      var sumRange = f === 'SUMIFS' ? arr(A(0)) : null;
      var pairs = [];
      for (var k = start; k + 1 < args.length; k += 2) pairs.push({ r: arr(A(k)), c: A(k + 1) });
      if (!pairs.length) throw new Error(f + ' necesita pares de rango y criterio');
      var len = pairs[0].r.length;
      var total = 0, count = 0;
      for (var i2 = 0; i2 < len; i2++) {
        if (pairs.every(function (pp) { return critMatch(pp.r[i2], pp.c); })) { count++; if (sumRange) total += toNum(sumRange[i2]); }
      }
      return f === 'SUMIFS' ? total : count;
    }
    case 'XLOOKUP': {
      need(3);
      var val = A(0), look = arr(A(1)), ret = arr(A(2));
      for (var i3 = 0; i3 < look.length; i3++) if (critMatch(look[i3], typeof val === 'number' ? val : '=' + toStr(val))) return ret[i3];
      if (args.length > 3) return A(3);
      throw new Error('BUSCAR: no se encontró «' + toStr(val) + '»');
    }
  }
  throw new Error('Función desconocida: ' + f);
}

/* ================= datos de ejemplo ================= */
function mkRow(id, n, data, cAt, cBy) { var r = { id: id, _n: n, _cAt: cAt, _cBy: cBy, _eAt: cAt, _eBy: cBy, _body: '' }; for (var k in data) r[k] = data[k]; return r; }
function mkView(id, name, layout, extra) {
  var v = { id: id, name: name, layout: layout, hidden: [], filters: [], sorts: [], group: null, hideEmpty: false, colors: [], calcs: {}, widths: {}, wrap: {}, locked: false, openFull: false, dateProp: null, chartBy: null, chartVal: 'count', chartKind: 'column', chartBucket: 'day' };
  for (var k in (extra || {})) v[k] = extra[k];
  return v;
}
function syncPairs(tables) {
  tables.order.forEach(function (tid) {
    var t = tables.byId[tid];
    t.props.forEach(function (p) {
      if (p.type !== 'relation' || !p.pair) return;
      var T2 = tables.byId[p.target];
      var P2 = propOf(T2, p.pair);
      if (!P2) return;
      t.rows.forEach(function (r) {
        (r[p.key] || []).forEach(function (id) {
          var tr = findRow(T2, id);
          if (!tr) return;
          var arr = tr[P2.key] || [];
          if (arr.indexOf(r.id) < 0) tr[P2.key] = arr.concat([r.id]);
        });
      });
    });
  });
  return tables;
}
function seedTables() {
  var cli = {
    id: 'cli', name: 'Clientes', desc: 'Empresas a las que vendemos', color: '#0E7490', icon: 'i-building', abbr: 'Cl', nextId: 6,
    props: [
      { key: 'nombre', name: 'Cliente', type: 'title' },
      { key: 'ruc', name: 'RUC', type: 'text', desc: 'Registro Único de Contribuyentes (11 dígitos)' },
      { key: 'sector', name: 'Sector', type: 'select', options: [o('Ferretería', 'blue'), o('Construcción', 'amber'), o('Retail', 'green'), o('Distribución', 'violet')] },
      { key: 'ciudad', name: 'Ciudad', type: 'select', options: [o('Lima', 'blue'), o('Arequipa', 'amber'), o('Trujillo', 'green'), o('Cusco', 'violet')] },
      { key: 'etiquetas', name: 'Etiquetas', type: 'multi_select', options: [o('VIP', 'violet'), o('Crédito 30 días', 'teal'), o('Nuevo', 'green'), o('Moroso', 'red')] },
      { key: 'contacto', name: 'Contacto', type: 'text' },
      { key: 'correo', name: 'Correo', type: 'email' },
      { key: 'telefono', name: 'Teléfono', type: 'phone' },
      { key: 'direccion', name: 'Dirección', type: 'place' },
      { key: 'pedidos', name: 'Pedidos', type: 'relation', target: 'ped', pair: 'cliente' },
      { key: 'total', name: 'Total comprado', type: 'rollup', rel: 'pedidos', prop: 'total', fn: 'sum' },
      { key: 'entregado', name: 'Ventas entregadas', type: 'formula', expr: '=SUMAR.SI.CONJUNTO(Pedidos[Total]; Pedidos[Cliente]; [Cliente]; Pedidos[Estado]; "Entregado")', resFmt: 'money', desc: 'Fórmula tipo Excel que suma en otra tabla' },
      { key: 'segmento', name: 'Segmento', type: 'formula', expr: 'if(prop("Total comprado") >= 10000, "Cuenta clave", "Estándar")', resFmt: 'text' }
    ],
    rows: [
      mkRow('c1', 1, { nombre: 'Ferretería Andina SAC', ruc: '20512345671', sector: 'Ferretería', ciudad: 'Lima', etiquetas: ['VIP', 'Crédito 30 días'], contacto: 'Rosa Huamán', correo: 'compras@ferreteria-andina.example', telefono: '+51 1 555 0101', direccion: 'Av. Argentina 1450, Lima', pedidos: [] }, '2026-08-04T10:12', 'ana'),
      mkRow('c2', 2, { nombre: 'Constructora Pacífico', ruc: '20456789012', sector: 'Construcción', ciudad: 'Arequipa', etiquetas: ['VIP'], contacto: 'Diego Vargas', correo: 'logistica@constructora-pacifico.example', telefono: '+51 54 555 0202', direccion: 'Calle Mercaderes 210, Arequipa', pedidos: [] }, '2026-08-19T16:40', 'sofia'),
      mkRow('c3', 3, { nombre: 'Distribuidora El Sol', ruc: '20678901234', sector: 'Distribución', ciudad: 'Trujillo', etiquetas: ['Crédito 30 días'], contacto: 'Lucía Castro', correo: 'pedidos@elsol.example', telefono: '+51 44 555 0303', direccion: 'Av. España 880, Trujillo', pedidos: [] }, '2026-09-02T09:05', 'luis'),
      mkRow('c4', 4, { nombre: 'Inversiones Inca EIRL', ruc: '20345678905', sector: 'Construcción', ciudad: 'Cusco', etiquetas: ['Nuevo'], contacto: 'Raúl Mamani', correo: 'raul@inversionesinca.example', telefono: '+51 84 555 0404', direccion: 'Av. El Sol 315, Cusco', pedidos: [] }, '2026-10-21T11:30', 'luis'),
      mkRow('c5', 5, { nombre: 'Tienda Miraflores', ruc: '20789012346', sector: 'Retail', ciudad: 'Lima', etiquetas: ['Moroso'], contacto: 'Elena Rojas', correo: 'elena@tiendamiraflores.example', telefono: '+51 1 555 0505', direccion: 'Av. Larco 640, Lima', pedidos: [] }, '2026-09-28T15:15', 'luis')
    ],
    views: [
      mkView('vc1', 'Todos los clientes', 'table', { hidden: ['correo', 'telefono', 'direccion', 'contacto', 'ruc'], sorts: [{ prop: 'total', dir: 'desc' }], calcs: { total: 'sum', entregado: 'sum', nombre: 'count' }, colors: [{ prop: 'etiquetas', op: 'contains', value: 'Moroso', color: 'red' }] }),
      mkView('vc2', 'Por ciudad', 'board', { group: 'ciudad', hidden: ['ruc', 'correo', 'telefono', 'direccion', 'pedidos', 'contacto', 'segmento', 'entregado'] }),
      mkView('vc3', 'Fichas', 'gallery', { hidden: ['ruc', 'pedidos', 'total', 'segmento', 'direccion', 'entregado'] })
    ],
    automations: []
  };
  var ped = {
    id: 'ped', name: 'Pedidos', desc: 'Ventas a clientes, vinculadas a productos', color: '#4F46E5', icon: 'i-cart', abbr: 'Pe', nextId: 1043,
    props: [
      { key: 'concepto', name: 'Pedido', type: 'title' },
      { key: 'num', name: 'Nº', type: 'id', prefix: 'PED' },
      { key: 'cliente', name: 'Cliente', type: 'relation', target: 'cli', pair: 'pedidos', single: true },
      { key: 'productos', name: 'Productos', type: 'relation', target: 'pro', pair: 'pedidos' },
      { key: 'total', name: 'Total', type: 'number', fmt: 'money', dec: 'auto', required: true },
      { key: 'estado', name: 'Estado', type: 'status', options: [so('Pendiente', 'amber', 'todo'), so('En preparación', 'blue', 'doing'), so('Enviado', 'violet', 'doing'), so('Entregado', 'green', 'done')] },
      { key: 'prioridad', name: 'Prioridad', type: 'select', options: [o('Alta', 'red'), o('Media', 'amber'), o('Baja', 'gray')], def: 'Media' },
      { key: 'vendedor', name: 'Vendedor', type: 'person' },
      { key: 'fecha', name: 'Fecha', type: 'date', dateFmt: 'long', def: '__today' },
      { key: 'entrega', name: 'Entrega', type: 'date', dateFmt: 'relative' },
      { key: 'margen', name: 'Margen', type: 'number', fmt: 'percent', showAs: 'ring', max: 30 },
      { key: 'ganancia', name: 'Ganancia', type: 'formula', expr: '=REDONDEAR([Total] * [Margen] / 100; 0)', resFmt: 'money', desc: 'Total × Margen, con sintaxis de Excel' },
      { key: 'pagado', name: 'Pagado', type: 'checkbox', checkStyle: 'switch' },
      { key: 'docs', name: 'Documentos', type: 'files' },
      { key: 'resumen', name: 'Resumen IA', type: 'ai', mode: 'summary', auto: true },
      { key: 'accion', name: 'Acción rápida', type: 'button', label: 'Marcar entregado', action: { prop: 'estado', value: 'Entregado' } },
      { key: 'creado', name: 'Creado por', type: 'created_by' },
      { key: 'editado', name: 'Última edición', type: 'last_edited_time' }
    ],
    rows: [
      mkRow('p1', 1042, { concepto: 'Reposición de herramientas', cliente: ['c1'], productos: ['r1', 'r3'], total: 4850, estado: 'Pendiente', prioridad: 'Alta', vendedor: ['luis'], fecha: '2026-11-14', entrega: '2026-11-20', pagado: false, margen: 22, docs: ['cotizacion-1042.pdf'], resumen: '' }, '2026-11-14T09:20', 'luis'),
      mkRow('p2', 1041, { concepto: 'Cemento para obra Yanahuara', cliente: ['c2'], productos: ['r2'], total: 12300, estado: 'En preparación', prioridad: 'Alta', vendedor: ['sofia'], fecha: '2026-11-13', entrega: '2026-11-18', pagado: true, margen: 18, docs: ['orden-compra-OC-778.pdf'], resumen: '' }, '2026-11-13T11:02', 'sofia'),
      mkRow('p3', 1040, { concepto: 'Material eléctrico para tienda', cliente: ['c3'], productos: ['r4', 'r5'], total: 3120, estado: 'Enviado', prioridad: 'Media', vendedor: ['luis'], fecha: '2026-11-12', entrega: '2026-11-17', pagado: false, margen: 25, docs: [], resumen: '' }, '2026-11-12T16:45', 'luis'),
      mkRow('p4', 1039, { concepto: 'Pedido mensual de noviembre', cliente: ['c1'], productos: ['r2', 'r6'], total: 8740, estado: 'Entregado', prioridad: 'Media', vendedor: ['sofia'], fecha: '2026-11-10', entrega: '2026-11-13', pagado: true, margen: 20, docs: ['factura-F001-1039.pdf', 'guia-T001-552.pdf'], resumen: '' }, '2026-11-10T10:00', 'sofia'),
      mkRow('p5', 1038, { concepto: 'Taladros para nueva sede', cliente: ['c4'], productos: ['r1'], total: 1980, estado: 'Pendiente', prioridad: 'Baja', vendedor: ['luis'], fecha: '2026-11-09', entrega: '2026-11-24', pagado: false, margen: 27, docs: [], resumen: '' }, '2026-11-09T12:30', 'luis'),
      mkRow('p6', 1037, { concepto: 'Llaves y cable para mostrador', cliente: ['c5'], productos: ['r3', 'r4'], total: 2560, estado: 'Entregado', prioridad: 'Baja', vendedor: ['luis'], fecha: '2026-11-07', entrega: '2026-11-11', pagado: false, margen: 24, docs: [], resumen: '' }, '2026-11-07T17:10', 'luis'),
      mkRow('p7', 1036, { concepto: 'Acero y tableros, etapa 2', cliente: ['c2'], productos: ['r5', 'r6'], total: 15400, estado: 'Enviado', prioridad: 'Alta', vendedor: ['sofia'], fecha: '2026-11-05', entrega: '2026-11-19', pagado: true, margen: 16, docs: [], resumen: '' }, '2026-11-05T08:55', 'sofia')
    ],
    views: [
      mkView('vp1', 'Todos los pedidos', 'table', { hidden: ['resumen', 'creado', 'editado', 'docs', 'accion', 'fecha', 'productos'], sorts: [{ prop: 'num', dir: 'desc' }], calcs: { total: 'sum', ganancia: 'sum', concepto: 'count', margen: 'avg' }, colors: [{ prop: 'prioridad', op: 'is', value: 'Alta', color: 'red' }], widths: { concepto: 'L' } }),
      mkView('vp2', 'Por estado', 'board', { group: 'estado', hidden: ['num', 'productos', 'prioridad', 'fecha', 'entrega', 'pagado', 'margen', 'docs', 'resumen', 'accion', 'creado', 'editado', 'ganancia'] }),
      mkView('vp3', 'Mis pedidos', 'list', { filters: [{ prop: 'vendedor', op: 'contains', value: 'me' }], hidden: ['productos', 'fecha', 'margen', 'docs', 'resumen', 'accion', 'creado', 'editado', 'prioridad', 'pagado', 'num', 'ganancia'] }),
      mkView('vp4', 'Entregas', 'calendar', { dateProp: 'entrega' }),
      mkView('vp5', 'Ventas por vendedor', 'chart', { chartBy: 'vendedor', chartVal: 'sum:total', chartKind: 'column' }),
      mkView('vp6', 'Formulario de pedido', 'form', { hidden: ['num', 'margen', 'docs', 'resumen', 'accion', 'creado', 'editado', 'fecha', 'ganancia'] })
    ],
    automations: [
      { id: 'a1', on: true, trigger: { type: 'changed', prop: 'estado', value: 'Entregado' }, action: { type: 'notify', who: 'role:finanzas' }, runs: 3 },
      { id: 'a2', on: true, trigger: { type: 'created' }, action: { type: 'notify', who: 'role:almacen' }, runs: 12 },
      { id: 'a3', on: false, trigger: { type: 'changed', prop: 'prioridad', value: 'Alta' }, action: { type: 'notify', who: 'prop:vendedor' }, runs: 0 }
    ]
  };
  var pro = {
    id: 'pro', name: 'Productos', desc: 'Catálogo e inventario', color: '#B45309', icon: 'i-package', abbr: 'Pr', nextId: 7,
    props: [
      { key: 'nombre', name: 'Producto', type: 'title' },
      { key: 'sku', name: 'SKU', type: 'text' },
      { key: 'categoria', name: 'Categoría', type: 'select', options: [o('Herramientas', 'blue'), o('Construcción', 'amber'), o('Eléctricos', 'violet')] },
      { key: 'precio', name: 'Precio', type: 'number', fmt: 'money', dec: 2 },
      { key: 'costo', name: 'Costo', type: 'number', fmt: 'money', dec: 2 },
      { key: 'stock', name: 'Stock', type: 'number', fmt: 'number', showAs: 'bar', max: 100 },
      { key: 'valor', name: 'Valor de inventario', type: 'formula', expr: '=[Precio] * [Stock]', resFmt: 'money' },
      { key: 'margenu', name: 'Margen unitario', type: 'formula', expr: '=REDONDEAR(([Precio] - [Costo]) / [Precio] * 100; 1)', resFmt: 'percent' },
      { key: 'reposicion', name: 'Reposición', type: 'formula', expr: '=SI([Stock] < 20; "Reponer"; "OK")', resFmt: 'text' },
      { key: 'proveedor', name: 'Proveedor', type: 'relation', target: 'prov', pair: 'productos', single: true },
      { key: 'pedidos', name: 'Pedidos', type: 'relation', target: 'ped', pair: 'productos' },
      { key: 'vendidos', name: 'Nº de pedidos', type: 'rollup', rel: 'pedidos', prop: '', fn: 'count' },
      { key: 'activo', name: 'Activo', type: 'checkbox', def: true },
      { key: 'ficha', name: 'Ficha técnica', type: 'files' }
    ],
    rows: [
      mkRow('r1', 1, { nombre: 'Taladro percutor 800W', sku: 'HER-001', categoria: 'Herramientas', precio: 289, costo: 205, stock: 14, proveedor: ['v1'], pedidos: [], activo: true, ficha: ['ficha-taladro-800w.pdf'] }, '2026-07-01T09:00', 'jorge'),
      mkRow('r2', 2, { nombre: 'Cemento Portland 42.5 kg', sku: 'CON-014', categoria: 'Construcción', precio: 32, costo: 24, stock: 420, proveedor: ['v2'], pedidos: [], activo: true, ficha: [] }, '2026-07-01T09:05', 'jorge'),
      mkRow('r3', 3, { nombre: 'Juego de llaves mixtas', sku: 'HER-007', categoria: 'Herramientas', precio: 119, costo: 78, stock: 36, proveedor: ['v1'], pedidos: [], activo: true, ficha: [] }, '2026-07-02T10:20', 'jorge'),
      mkRow('r4', 4, { nombre: 'Cable THW 2.5 mm (100 m)', sku: 'ELE-022', categoria: 'Eléctricos', precio: 185, costo: 140, stock: 9, proveedor: ['v3'], pedidos: [], activo: true, ficha: [] }, '2026-07-03T11:40', 'jorge'),
      mkRow('r5', 5, { nombre: 'Varilla de acero 1/2 pulgada', sku: 'CON-031', categoria: 'Construcción', precio: 41, costo: 31, stock: 260, proveedor: ['v2'], pedidos: [], activo: true, ficha: [] }, '2026-07-03T11:55', 'jorge'),
      mkRow('r6', 6, { nombre: 'Tablero eléctrico 12 polos', sku: 'ELE-040', categoria: 'Eléctricos', precio: 210, costo: 150, stock: 18, proveedor: ['v3'], pedidos: [], activo: true, ficha: [] }, '2026-07-04T15:00', 'jorge')
    ],
    views: [
      mkView('vr1', 'Inventario', 'table', { colors: [{ prop: 'stock', op: 'lt', value: '20', color: 'red' }], calcs: { stock: 'sum', valor: 'sum', nombre: 'count' }, hidden: ['pedidos', 'ficha', 'costo', 'sku'], sorts: [{ prop: 'stock', dir: 'asc' }] }),
      mkView('vr2', 'Catálogo', 'gallery', { hidden: ['sku', 'costo', 'margenu', 'pedidos', 'vendidos', 'ficha', 'activo', 'valor'], colors: [{ prop: 'stock', op: 'lt', value: '20', color: 'red' }] }),
      mkView('vr3', 'Por categoría', 'board', { group: 'categoria', hidden: ['sku', 'costo', 'margenu', 'pedidos', 'vendidos', 'ficha', 'activo', 'reposicion', 'valor'] })
    ],
    automations: []
  };
  var prov = {
    id: 'prov', name: 'Proveedores', desc: 'A quién compramos', color: '#047857', icon: 'i-truck', abbr: 'Pv', nextId: 4,
    props: [
      { key: 'nombre', name: 'Proveedor', type: 'title' },
      { key: 'origen', name: 'Origen', type: 'select', options: [o('Nacional', 'green'), o('Importado', 'blue')] },
      { key: 'contacto', name: 'Contacto', type: 'text' },
      { key: 'correo', name: 'Correo', type: 'email' },
      { key: 'telefono', name: 'Teléfono', type: 'phone' },
      { key: 'catalogo', name: 'Catálogo', type: 'url', urlShort: true },
      { key: 'productos', name: 'Productos', type: 'relation', target: 'pro', pair: 'proveedor' },
      { key: 'condicion', name: 'Pago', type: 'select', options: [o('Contado', 'gray'), o('30 días', 'teal'), o('60 días', 'violet')] },
      { key: 'direccion', name: 'Dirección', type: 'place' }
    ],
    rows: [
      mkRow('v1', 1, { nombre: 'Herramientas Norte SA', origen: 'Importado', contacto: 'Karen Silva', correo: 'ventas@herramientasnorte.example', telefono: '+51 1 555 0606', catalogo: 'https://example.com/catalogo-herramientas', productos: [], condicion: '30 días', direccion: 'Av. Colonial 2210, Lima' }, '2026-06-15T10:00', 'marta'),
      mkRow('v2', 2, { nombre: 'Aceros y Cementos del Sur', origen: 'Nacional', contacto: 'Miguel Chávez', correo: 'pedidos@acerosdelsur.example', telefono: '+51 54 555 0707', catalogo: 'https://example.com/catalogo-aceros', productos: [], condicion: '60 días', direccion: 'Parque Industrial, Arequipa' }, '2026-06-15T10:20', 'marta'),
      mkRow('v3', 3, { nombre: 'Electro Import Perú', origen: 'Importado', contacto: 'Patricia León', correo: 'ventas@electroimport.example', telefono: '+51 1 555 0808', catalogo: 'https://example.com/catalogo-electro', productos: [], condicion: 'Contado', direccion: 'Jr. Paruro 920, Lima' }, '2026-06-16T12:00', 'marta')
    ],
    views: [mkView('vv1', 'Todos', 'table', { hidden: ['direccion'] }), mkView('vv2', 'Contactos', 'list', { hidden: ['catalogo', 'productos', 'direccion', 'origen'] })],
    automations: []
  };
  var pm = seedPM(), hr = seedHR();
  var tb = syncPairs({ order: ['cli', 'ped', 'pro', 'prov', 'proy', 'tar', 'rie', 'int', 'pd', 'sol', 'per', 'par'], byId: { cli: cli, ped: ped, pro: pro, prov: prov, proy: pm.proy, tar: pm.tar, rie: pm.rie, int: pm.int, pd: seedPD(), sol: hr.sol, per: hr.per, par: hr.par } });
  seedForms(tb);
  return tb;
}
function blk(id, type, w, extra) { var b = { id: id, type: type, w: w }; for (var k in (extra || {})) b[k] = extra[k]; return b; }
function seedPages() {
  return {
    order: ['pgme', 'pg4', 'pg5', 'pg1', 'pg2', 'pg3'],
    byId: {
      pgme: { id: 'pgme', mine: true, area: null, cover: { kind: 'grad', v: 0 }, title: 'Mi tablero', icon: 'i-star', color: '#4F46E5', desc: 'Lo que te toca hoy: tus tareas, tus riesgos y las recomendaciones para ti', blocks: [
        blk('m1', 'kpi', 4, { title: 'Mis tareas abiertas', table: 'tar', val: 'count', filters: [{ prop: 'responsable', op: 'contains', value: 'me' }, { prop: 'estado', op: 'is_not', value: 'Hecha' }] }),
        blk('m2', 'kpi', 4, { title: 'Horas asignadas', table: 'tar', val: 'sum:horas', filters: [{ prop: 'responsable', op: 'contains', value: 'me' }, { prop: 'estado', op: 'is_not', value: 'Hecha' }] }),
        blk('m3', 'kpi', 4, { title: 'Mis riesgos abiertos', table: 'rie', val: 'count', filters: [{ prop: 'responsable', op: 'contains', value: 'me' }, { prop: 'estado', op: 'is_not', value: 'Cerrado' }] }),
        blk('m4', 'pm', 12, { title: 'Mis recomendaciones', scope: 'me' }),
        blk('m5', 'db', 8, { table: 'tar', view: 'vt3' }),
        blk('m7', 'db', 12, { table: 'sol', view: 'vs2' }),
        blk('m6', 'todo', 4, { title: 'Pendientes personales', items: [{ id: 'q1', text: 'Revisar el informe de avance', done: false }, { id: 'q2', text: 'Confirmar reunión con el patrocinador', done: true }, { id: 'q3', text: 'Actualizar el registro de riesgos', done: false }] })
      ] },
      pg5: { id: 'pg5', area: 'a-adm', cover: { kind: 'grad', v: 1 }, title: 'Personal y planilla', icon: 'i-contact', color: '#047857', desc: 'Fichas del personal, planilla del mes y parámetros editables', blocks: [
        blk('f0', 'callout', 12, { icon: 'i-bulb', text: 'Plantilla de planilla editable. Cambia sueldos, asignación familiar, horas extra o sistema de pensiones en cada persona; las tasas están en «Parámetros» y todo se recalcula. Las tasas son de ejemplo: verifícalas antes de usarlas para pagar. El «Costo por hora» alimenta el costo de mano de obra de cada tarea y proyecto.' }),
        blk('f1', 'kpi', 3, { title: 'Remuneración bruta', table: 'per', val: 'sum:bruto', filters: [] }),
        blk('f2', 'kpi', 3, { title: 'Neto a pagar', table: 'per', val: 'sum:neto', filters: [] }),
        blk('f3', 'kpi', 3, { title: 'EsSalud (empleador)', table: 'per', val: 'sum:essalud', filters: [] }),
        blk('f4', 'kpi', 3, { title: 'Costo empresa', table: 'per', val: 'sum:cmes', filters: [] }),
        blk('f5', 'db', 12, { table: 'per', view: 'vp1' }),
        blk('f6', 'chart', 7, { title: 'Costo empresa por área', table: 'per', kind: 'bar', by: 'area', val: 'sum:cmes', sort: 'desc', limit: 0, filters: [] }),
        blk('f7', 'db', 5, { table: 'par', view: 'vq1' }),
        blk('f8', 'db', 12, { table: 'sol', view: 'vs1' })
      ] },
      pg4: { id: 'pg4', area: 'a-ope', cover: { kind: 'grad', v: 1 }, title: 'Proyectos', icon: 'i-target', color: '#B45309', desc: 'Cartera de proyectos con buenas prácticas del PMBOK', blocks: [
        blk('e0', 'callout', 12, { icon: 'info', text: 'Esta página sigue la Guía del PMBOK. Elige la edición (6, 7 u 8) en «Salud de los proyectos»: cada recomendación cita su proceso, dominio o área de enfoque. Las reglas se revisan solas, sin IA, cada vez que cambias un dato.' }),
        blk('e1', 'kpi', 3, { title: 'Proyectos activos', table: 'proy', val: 'count', filters: [{ prop: 'fase', op: 'is_not', value: 'Cierre' }] }),
        blk('e2', 'kpi', 3, { title: 'Presupuesto (BAC)', table: 'proy', val: 'sum:presupuesto', filters: [] }),
        blk('e3', 'kpi', 3, { title: 'Costo real (AC)', table: 'proy', val: 'sum:costo', filters: [] }),
        blk('e4', 'kpi', 3, { title: 'Riesgos altos abiertos', table: 'rie', val: 'count', filters: [{ prop: 'nivel', op: 'contains', value: 'Alto' }, { prop: 'estado', op: 'is_not', value: 'Cerrado' }] }),
        blk('e5', 'pm', 12, { title: 'Salud de los proyectos', scope: 'all' }),
        blk('e6', 'chart', 6, { title: 'Tareas por estado', table: 'tar', kind: 'donut', by: 'estado', val: 'count', sort: 'label', limit: 0, filters: [] }),
        blk('e7', 'chart', 6, { title: 'Horas por responsable', table: 'tar', kind: 'bar', by: 'responsable', val: 'sum:horas', sort: 'desc', limit: 0, filters: [] }),
        blk('e8', 'db', 12, { table: 'proy', view: 'vy1' }),
        blk('e9', 'db', 12, { table: 'tar', view: 'vt1' }),
        blk('e10', 'db', 7, { table: 'rie', view: 've1' }),
        blk('e11', 'db', 5, { table: 'int', view: 'vi1' }),
        blk('e12', 'db', 12, { table: 'pd', view: 'vd1' })
      ] },
      pg1: { id: 'pg1', area: 'a-com', cover: { kind: 'grad', v: 3 }, title: 'Panel de ventas', icon: 'i-dash', color: '#BE185D', desc: 'Indicadores, gráficos y pedidos en una sola hoja', blocks: [
        blk('b1', 'text', 12, { text: 'Toca una columna, un sector del anillo o una opción de segmentación para filtrar todo el panel. El filtro viaja por las relaciones: si eliges una ciudad de Clientes, los pedidos, los indicadores y los gráficos se recalculan solo con esa ciudad.' }),
        blk('b2', 'kpi', 3, { title: 'Ventas totales', table: 'ped', val: 'sum:total', filters: [] }),
        blk('b3', 'kpi', 3, { title: 'Pedidos', table: 'ped', val: 'count', filters: [] }),
        blk('b4', 'kpi', 3, { title: 'Ticket promedio', table: 'ped', val: 'avg:total', filters: [] }),
        blk('b5', 'kpi', 3, { title: 'Por entregar', table: 'ped', val: 'sum:total', filters: [{ prop: 'estado', op: 'is_not', value: 'Entregado' }] }),
        blk('b6', 'slicer', 6, { title: 'Estado del pedido', table: 'ped', prop: 'estado' }),
        blk('b7', 'slicer', 6, { title: 'Ciudad del cliente', table: 'cli', prop: 'ciudad' }),
        blk('b8', 'chart', 6, { title: 'Ventas por vendedor', table: 'ped', kind: 'column', by: 'vendedor', val: 'sum:total', sort: 'desc', limit: 0, filters: [] }),
        blk('b9', 'chart', 6, { title: 'Pedidos por estado', table: 'ped', kind: 'donut', by: 'estado', val: 'count', sort: 'label', limit: 0, filters: [] }),
        blk('b10', 'chart', 8, { title: 'Ventas por fecha de pedido', table: 'ped', kind: 'line', by: 'fecha', bucket: 'day', val: 'sum:total', sort: 'label', limit: 0, filters: [] }),
        blk('b11', 'chart', 4, { title: 'Top clientes', table: 'ped', kind: 'bar', by: 'cliente', val: 'sum:total', sort: 'desc', limit: 5, filters: [] }),
        blk('b12', 'heading', 12, { text: 'Pedidos' }),
        blk('b13', 'db', 12, { table: 'ped', view: 'vp1' })
      ] },
      pg2: { id: 'pg2', area: 'a-ope', cover: { kind: 'grad', v: 2 }, title: 'Inventario y compras', icon: 'i-warehouse', color: '#B45309', desc: 'Inventario, proveedores y cálculos en la misma hoja', blocks: [
        blk('c1', 'kpi', 4, { title: 'Productos por reponer', table: 'pro', val: 'count', filters: [{ prop: 'stock', op: 'lt', value: '20' }] }),
        blk('c2', 'kpi', 4, { title: 'Valor del inventario', table: 'pro', val: 'sum:valor', filters: [] }),
        blk('c3', 'kpi', 4, { title: 'Proveedores', table: 'prov', val: 'count', filters: [] }),
        blk('c4', 'slicer', 12, { title: 'Proveedor', table: 'prov', prop: 'nombre' }),
        blk('c5', 'db', 12, { table: 'pro', view: 'vr1' }),
        blk('c6', 'chart', 6, { title: 'Valor de inventario por categoría', table: 'pro', kind: 'bar', by: 'categoria', val: 'sum:valor', sort: 'desc', limit: 0, filters: [] }),
        blk('c7', 'db', 6, { table: 'prov', view: 'vv2' }),
        blk('c8', 'heading', 12, { text: 'Cálculos rápidos' }),
        blk('c9', 'sheet', 12, { title: 'Análisis tipo Excel', cells: {
          A1: 'Concepto', B1: 'Valor', D1: 'Escenario', E1: 'Valor',
          A2: 'Ventas totales', B2: '=SUMA(Pedidos[Total])',
          A3: 'Ventas entregadas', B3: '=SUMAR.SI(Pedidos[Estado]; "Entregado"; Pedidos[Total])',
          A4: '% entregado', B4: '=REDONDEAR(B3 / B2 * 100; 1)',
          A5: 'Nº de pedidos', B5: '=CONTARA(Pedidos[Pedido])',
          A6: 'Ticket promedio', B6: '=REDONDEAR(B2 / B5; 2)',
          A7: 'Productos por reponer', B7: '=CONTAR.SI(Productos[Stock]; "<20")',
          A8: 'Valor del inventario', B8: '=SUMA(Productos[Valor de inventario])',
          D2: 'Meta de ventas', E2: '60000',
          D3: 'Avance de la meta', E3: '=TEXTO(REDONDEAR(B2 / E2 * 100; 0)) & " %"',
          D4: 'Descuento a aplicar (%)', E4: '5',
          D5: 'Ventas con descuento', E5: '=B2 * (1 - E4 / 100)',
          D6: 'Stock del taladro', E6: '=BUSCAR("Taladro percutor 800W"; Productos[Producto]; Productos[Stock])',
          D7: 'Estado', E7: '=SI(B2 >= E2; "Meta cumplida"; "Faltan " & TEXTO(E2 - B2))'
        } })
      ] },
      pg3: { id: 'pg3', area: null, cover: { kind: 'grad', v: 6 }, title: 'Modelo de datos', icon: 'i-layers', color: '#0E7490', desc: 'Cómo se relacionan tus bases de datos', blocks: [
        blk('d1', 'text', 12, { text: 'Cada línea une dos bases de datos con una relación de ida y vuelta. «1» significa un solo registro y «N» muchos: un Cliente tiene N Pedidos y cada Pedido tiene 1 Cliente. Toca una propiedad para resaltar su relación, o el nombre de una tabla para abrirla.' }),
        blk('d2', 'map', 12, { title: 'Mapa de relaciones' }),
        blk('d3', 'text', 12, { text: 'Trazabilidad: abre cualquier pedido y verás el camino completo de sus vínculos (cliente, productos y el proveedor de cada producto).' })
      ] }
    }
  };
}
function seedMembers() {
  return [
    { id: 'ana', name: 'Ana Torres', role: 'admin', team: 'Dirección', last: 'Ahora', color: '#4F46E5' },
    { id: 'marta', name: 'Marta Quispe', role: 'finanzas', team: 'Finanzas', last: 'Hace 2 h', color: '#047857' },
    { id: 'luis', name: 'Luis Ramírez', role: 'ventas', team: 'Comercial', last: 'Hace 15 min', color: '#B45309' },
    { id: 'sofia', name: 'Sofía Paredes', role: 'ventas', team: 'Comercial', last: 'Ayer', color: '#BE185D' },
    { id: 'jorge', name: 'Jorge Salazar', role: 'almacen', team: 'Operaciones', last: 'Hace 1 h', color: '#0E7490' },
    { id: 'carla', name: 'Carla Mendoza', role: 'invitado', team: 'Auditoría externa', last: 'Hace 3 días', color: '#7C3AED' }
  ];
}
function seedAccess() {
  return {
    cli: { admin: 'full', finanzas: 'view', ventas: 'edit', almacen: 'none', invitado: 'none' },
    ped: { admin: 'full', finanzas: 'edit', ventas: 'edit', almacen: 'view', invitado: 'comment' },
    pro: { admin: 'full', finanzas: 'view', ventas: 'view', almacen: 'full', invitado: 'none' },
    prov: { admin: 'full', finanzas: 'edit', ventas: 'none', almacen: 'edit', invitado: 'none' },
    proy: { admin: 'full', finanzas: 'edit', ventas: 'view', almacen: 'full', invitado: 'none' },
    tar: { admin: 'full', finanzas: 'edit', ventas: 'edit', almacen: 'full', invitado: 'none' },
    rie: { admin: 'full', finanzas: 'edit', ventas: 'view', almacen: 'full', invitado: 'none' },
    int: { admin: 'full', finanzas: 'edit', ventas: 'view', almacen: 'full', invitado: 'none' },
    sol: { admin: 'full', finanzas: 'edit', ventas: 'edit', almacen: 'edit', invitado: 'none' },
    pd: { admin: 'full', finanzas: 'view', ventas: 'none', almacen: 'edit', invitado: 'none' },
    per: { admin: 'full', finanzas: 'full', ventas: 'none', almacen: 'none', invitado: 'none' },
    par: { admin: 'full', finanzas: 'full', ventas: 'none', almacen: 'none', invitado: 'none' }
  };
}
function seedColHide() {
  return { ped: { margen: ['ventas', 'almacen', 'invitado'], ganancia: ['ventas', 'almacen', 'invitado'] }, cli: { ruc: ['invitado'] }, pro: { costo: ['ventas', 'invitado'], margenu: ['ventas', 'invitado'] }, prov: { contacto: ['invitado'], correo: ['invitado'], telefono: ['invitado'] } };
}
function seedRules() {
  return [
    { id: 'own', table: 'ped', role: 'ventas', text: 'Cada vendedor solo ve sus propios pedidos', detail: 'Vendedor contiene al usuario actual', on: true },
    { id: 'despacho', table: 'ped', role: 'almacen', text: 'Almacén solo ve los pedidos por despachar', detail: 'Estado es En preparación o Enviado', on: true },
    { id: 'cerrados', table: 'ped', role: 'invitado', text: 'Los invitados solo ven pedidos entregados', detail: 'Estado es Entregado', on: true }
  ];
}
function seedLog() {
  return [
    { who: 'Ana Torres', color: '#4F46E5', what: 'creó la página Panel de ventas', when: 'Hoy, 09:30' },
    { who: 'Marta Quispe', color: '#047857', what: 'comentó en Reposición de herramientas', when: 'Hoy, 08:47' },
    { who: 'Jorge Salazar', color: '#0E7490', what: 'actualizó el stock de Cable THW 2.5 mm', when: 'Ayer, 17:30' }
  ];
}
function seedNotifs() {
  return [
    { id: 'n1', to: 'role:finanzas', text: 'Pedido mensual de noviembre: Estado cambió a «Entregado»', when: 'Hace 3 días', table: 'ped', row: 'p4', read: false },
    { id: 'n2', to: 'role:almacen', text: 'Nuevo registro en Pedidos: Reposición de herramientas', when: 'Hace 2 días', table: 'ped', row: 'p1', read: false }
  ];
}
function makeInitial() {
  return {
    screen: 'page', page: 'pgme', table: 'ped', viewSel: {}, rec: null, recFull: null, q: '', picker: null, viewMenu: false, navOpen: false,
    viewAs: 'ana', tables: seedTables(), pages: seedPages(), access: seedAccess(), colHide: seedColHide(), rowRules: seedRules(), members: seedMembers(),
    permTab: 'miembros', permTable: 'ped', inviteEmail: '', inviteRole: 'ventas', inviteErr: '',
    security: { twofa: true, exportGuest: false, linkExpiry: true, audit: true, ipLock: false },
    log: seedLog(), notifs: seedNotifs(),
    comments: { p1: [{ who: 'marta', text: 'Confirmar el descuento antes de facturar.', when: 'Hoy, 08:47' }] },
    draft: '', aiText: '', aiProp: null, aiAns: null, aiCreated: {}, reqSent: {},
    ws: 'TECSUR · Ingeniería de Costos', accent: null, mode: null, density: 'comfy', corners: 'round', font: 'calibri', seq: 400,
    drawer: null, dCtx: null, dProp: null, dAdding: false, dTypeChange: false, newPropName: '', newPropSearch: '', optDraft: '', confirmDel: null, autoDraft: null,
    addViewOpen: null, headMenu: null, selCell: null, collapsed: {}, calMonth: {}, formDrafts: {}, sheetSel: {}, xf: {}, mapHi: null,
    addBlockOpen: false, iconPick: null, toast: null, toastId: 0,
    org: seedOrg(), mention: null, reassign: null, orgSel: null, orgAreaSel: null, pmEd: '8', pmOpen: {}, slashQ: '', coverPick: null, addCtx: null, areaPick: null
  };
}

/* ================= plantillas del asistente ================= */
var AI_TEMPLATES = {
  inventario: {
    title: 'Control de inventario y compras', intro: 'Tres bases de datos nuevas que se conectan con tus Productos y Proveedores actuales.',
    tables: [
      { ref: 'Compras', icon: 'i-receipt', color: '#9A3412', desc: 'Órdenes de compra a proveedores', fields: [['Nº de compra', 'title'], ['Proveedor', 'relation', 'prov'], ['Productos', 'relation', 'pro'], ['Fecha', 'date'], ['Estado', 'status', ['Solicitada', 'Aprobada', 'Recibida']], ['Total', 'money']] },
      { ref: 'Almacenes', icon: 'i-warehouse', color: '#0F766E', desc: 'Dónde se guarda el stock', fields: [['Almacén', 'title'], ['Dirección', 'place'], ['Responsable', 'person']] },
      { ref: 'Movimientos', icon: 'i-boxes', color: '#6D28D9', desc: 'Entradas y salidas de stock', fields: [['Movimiento', 'title'], ['Tipo', 'select', ['Entrada', 'Salida', 'Ajuste']], ['Producto', 'relation', 'pro'], ['Almacén', 'relation', '@Almacenes'], ['Cantidad', 'number'], ['Fecha', 'date']] }
    ],
    links: ['Compras se vincula con tus Proveedores y Productos actuales', 'Cada Movimiento indica qué Producto entra o sale y de qué Almacén', 'Las relaciones son de ida y vuelta: cada Producto, Proveedor y Almacén muestra lo que tiene vinculado'],
    perms: ['Almacén puede editar Almacenes y Movimientos', 'Finanzas puede editar Compras', 'Ventas solo puede ver', 'Los invitados no tienen acceso'],
    access: { Compras: { finanzas: 'edit', almacen: 'view', ventas: 'view' }, Almacenes: { finanzas: 'view', almacen: 'edit', ventas: 'view' }, Movimientos: { finanzas: 'view', almacen: 'edit', ventas: 'view' } }, colHide: {}
  },
  proyectos: {
    title: 'Proyectos, tareas y horas', intro: 'Proyectos por cliente, tareas con responsable y registro de horas para facturar.',
    tables: [
      { ref: 'Proyectos', icon: 'i-briefcase', color: '#1D4ED8', desc: 'Proyectos por cliente', fields: [['Proyecto', 'title'], ['Cliente', 'relation', 'cli'], ['Responsable', 'person'], ['Estado', 'status', ['Planificado', 'En curso', 'Cerrado']], ['Presupuesto', 'money'], ['Entrega', 'date']] },
      { ref: 'Tareas', icon: 'i-checks', color: '#0F766E', desc: 'Trabajo por hacer en cada proyecto', fields: [['Tarea', 'title'], ['Proyecto', 'relation', '@Proyectos'], ['Responsable', 'person'], ['Estado', 'status', ['Por hacer', 'En curso', 'Hecha']], ['Fecha límite', 'date']] },
      { ref: 'Horas', icon: 'i-clock', color: '#9A3412', desc: 'Horas trabajadas por tarea', fields: [['Registro', 'title'], ['Tarea', 'relation', '@Tareas'], ['Persona', 'person'], ['Horas', 'number'], ['Fecha', 'date']] }
    ],
    links: ['Cada Proyecto pertenece a uno de tus Clientes actuales', 'Las Tareas cuelgan de un Proyecto y las Horas de una Tarea', 'Las relaciones son de ida y vuelta: cada Cliente ve sus Proyectos'],
    perms: ['Ventas puede editar Proyectos y Tareas', 'Todos los equipos pueden registrar Horas', 'Solo Administración y Finanzas ven el Presupuesto', 'Los invitados no tienen acceso'],
    access: { Proyectos: { finanzas: 'view', ventas: 'edit', almacen: 'view' }, Tareas: { finanzas: 'view', ventas: 'edit', almacen: 'edit' }, Horas: { finanzas: 'edit', ventas: 'edit', almacen: 'edit' } },
    colHide: { Proyectos: { Presupuesto: ['ventas', 'almacen', 'invitado'] } }
  },
  rrhh: {
    title: 'Reclutamiento y selección', intro: 'Vacantes abiertas, candidatos por vacante y entrevistas con puntaje.',
    tables: [
      { ref: 'Vacantes', icon: 'i-contact', color: '#BE185D', desc: 'Puestos que buscas cubrir', fields: [['Vacante', 'title'], ['Área', 'select', ['Comercial', 'Operaciones', 'Finanzas']], ['Responsable', 'person'], ['Estado', 'status', ['Abierta', 'En entrevistas', 'Cubierta']], ['Apertura', 'date']] },
      { ref: 'Candidatos', icon: 'i-users', color: '#6D28D9', desc: 'Personas que postulan', fields: [['Candidato', 'title'], ['Vacante', 'relation', '@Vacantes'], ['Etapa', 'status', ['Nuevo', 'Entrevista', 'Oferta']], ['Correo', 'email'], ['Pretensión salarial', 'money']] },
      { ref: 'Entrevistas', icon: 'i-calendar', color: '#0F766E', desc: 'Entrevistas y evaluación', fields: [['Entrevista', 'title'], ['Candidato', 'relation', '@Candidatos'], ['Entrevistador', 'person'], ['Fecha', 'date'], ['Puntaje', 'number']] }
    ],
    links: ['Cada Candidato postula a una Vacante', 'Cada Entrevista se vincula a un Candidato', 'En cada Vacante ves sus candidatos sin buscarlos'],
    perms: ['Solo Administración y Finanzas ven la Pretensión salarial', 'El resto de equipos puede ver Vacantes y Candidatos', 'Ventas y Almacén pueden comentar Entrevistas', 'Los invitados no tienen acceso'],
    access: { Vacantes: { finanzas: 'view', ventas: 'view', almacen: 'view' }, Candidatos: { finanzas: 'view', ventas: 'view', almacen: 'view' }, Entrevistas: { finanzas: 'view', ventas: 'comment', almacen: 'comment' } },
    colHide: { Candidatos: { 'Pretensión salarial': ['ventas', 'almacen', 'invitado'] } }
  }
};
var AI_SUGS = [
  { label: 'Control de inventario con almacenes y compras', text: 'Quiero controlar el inventario de mis almacenes y las compras a proveedores' },
  { label: 'Proyectos con tareas y horas', text: 'Necesito gestionar proyectos por cliente con tareas y registro de horas' },
  { label: 'Reclutamiento de personal', text: 'Quiero organizar el reclutamiento: vacantes, candidatos y entrevistas' },
  { label: '¿Qué cliente ha comprado más?', text: '¿Qué cliente ha comprado más?' },
  { label: '¿Qué productos hay que reponer?', text: '¿Qué productos hay que reponer?' },
  { label: '¿Cuánto ha vendido cada vendedor?', text: '¿Cuánto ha vendido cada vendedor?' }
];

/* paletas de gráficos: «auto» usa el color de cada opción */
var CHART_PALS = [
  { id: 'auto', n: 'Colores de la tabla', c: [] },
  { id: 'tecsur', n: 'TECSUR', c: ['#00468C', '#00705A', '#F8D000', '#5A6675', '#3F7FBF', '#4FA88E', '#B9A23A', '#93A0AE'] },
  { id: 'sobria', n: 'Sobria', c: ['#1E3A5F', '#4C6A8A', '#7B93AD', '#A9BACB', '#5A6675', '#8C969F', '#C2C8CE', '#2F4858'] },
  { id: 'viva', n: 'Viva', c: ['#2563EB', '#F97316', '#10B981', '#E11D48', '#8B5CF6', '#F59E0B', '#06B6D4', '#84CC16'] },
  { id: 'mono', n: 'Un solo tono', c: ['#00468C', '#1A5C9F', '#3473B2', '#4E8AC5', '#68A1D8', '#82B8EB', '#9CCFFE', '#B6E0FF'] }
];
