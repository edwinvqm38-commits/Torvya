/* ================= TECSUR · Objetivos y procedimientos 2026 (datos de la Fase 1, sin precios) =================
   Tablas: tobj Objetivos · tpro Procedimientos PR-COS · tpo Procedimientos operativos · tli Líneas de anexo técnico
           tbr Brechas · tde Decisiones. Datos en tecsur_data.js (generado por tools/gen_tecsur_data.py). */
function seedTecsur() {
  var D = TECSUR_DATA, COL = ['blue', 'violet', 'teal', 'amber', 'red', 'green', 'gray'];
  function uniq(list, key) { var seen = {}, out = []; list.forEach(function (x) { var v = x[key]; if (v && !seen[v]) { seen[v] = 1; out.push(v); } }); return out; }
  function opts(list, key, fixed) { return uniq(list, key).map(function (v, i) { return o(v, (fixed && fixed[v]) || COL[i % COL.length]); }); }
  var NOW = '2026-11-18T09:00', BY = 'ana';
  var pri = { Alta: 'red', Media: 'amber', Baja: 'gray' };

  // ---- Objetivos ----
  var tobj = {
    id: 'tobj', name: 'Objetivos 2026', desc: 'Resumen analítico de los cuatro objetivos. La fuente operativa sigue siendo la plataforma corporativa o Planner: aquí no se duplican registros.', color: '#00468C', icon: 'i-target', abbr: 'Ob', nextId: D.obj.length + 1,
    props: [
      { key: 'nombre', name: 'Objetivo', type: 'title' },
      { key: 'codigo', name: 'Código', type: 'text' },
      { key: 'desc', name: 'Alcance', type: 'text' },
      { key: 'plataforma', name: 'Fuente operativa', type: 'text', desc: 'Dónde se registra el avance real' },
      { key: 'estado', name: 'Estado', type: 'status', options: [so('Por validar', 'amber', 'todo'), so('En elaboración', 'blue', 'doing'), so('Enviado', 'violet', 'doing'), so('Observado', 'red', 'doing'), so('Aprobado', 'green', 'done'), so('Incorporado', 'green', 'done')], desc: 'Elaborado no significa enviado, aprobado ni cerrado' },
      { key: 'hito', name: 'Siguiente hito', type: 'text' },
      { key: 'fecha', name: 'Fecha objetivo', type: 'date', dateFmt: 'short' },
      { key: 'procs', name: 'Procedimientos', type: 'relation', target: 'tpro', pair: 'obj' }
    ],
    rows: D.obj.map(function (x, i) { return mkRow('tob' + (i + 1), i + 1, { nombre: x.nombre, codigo: x.id, desc: x.desc, plataforma: x.plataforma, estado: x.estado, hito: x.hito, fecha: x.fecha || '', procs: [] }, NOW, BY); }),
    views: [mkView('xo1', 'Objetivos', 'table', {})], automations: []
  };
  var objId = {}; D.obj.forEach(function (x, i) { objId[x.id] = 'tob' + (i + 1); });

  // ---- Procedimientos PR-COS (índice maestro) ----
  var tpro = {
    id: 'tpro', name: 'Procedimientos de costos', desc: 'Índice maestro: manual, procedimientos, instructivos y formatos. El estado de flujo no equivale a aprobación.', color: '#00468C', icon: 'i-clipboard', abbr: 'PR', nextId: D.proc.length + 1,
    props: [
      { key: 'codigo', name: 'Código', type: 'title' },
      { key: 'nombre', name: 'Nombre', type: 'text' },
      { key: 'tipo', name: 'Tipo', type: 'select', options: opts(D.proc, 'tipo') },
      { key: 'alcance', name: 'Alcance', type: 'text' },
      { key: 'origen', name: 'Origen', type: 'select', options: opts(D.proc, 'origen') },
      { key: 'naturaleza', name: 'Naturaleza', type: 'select', options: opts(D.proc, 'naturaleza') },
      { key: 'estado', name: 'Estado de flujo', type: 'status', options: [so('No iniciado', 'gray', 'todo'), so('En elaboración', 'blue', 'doing'), so('Enviado', 'violet', 'doing'), so('En revisión', 'teal', 'doing'), so('Observado', 'red', 'doing'), so('Levantando observaciones', 'amber', 'doing'), so('Aprobado', 'green', 'done'), so('Incorporado', 'green', 'done')] },
      { key: 'prioridad', name: 'Prioridad', type: 'select', options: [o('Alta', 'red'), o('Media', 'amber'), o('Baja', 'gray')] },
      { key: 'concord', name: 'Código en fuentes', type: 'select', options: [o('Coincide', 'green'), o('Difiere', 'red'), o('Nuevo', 'blue')], desc: 'Compara el código propuesto con Manual, Matriz, procedimiento de evaluación y CSV' },
      { key: 'obj', name: 'Objetivo', type: 'relation', target: 'tobj', pair: 'procs', single: true, desc: 'Asignación propuesta; por validar' }
    ],
    rows: D.proc.map(function (x, i) { return mkRow('tpr' + (i + 1), i + 1, { codigo: x.codigo, nombre: x.nombre, tipo: x.tipo, alcance: x.alcance, origen: x.origen, naturaleza: x.naturaleza, estado: x.estado, prioridad: x.prioridad, concord: x.concord, obj: [objId[x.obj]] }, NOW, BY); }),
    views: [mkView('xp1', 'Índice maestro', 'table', { hidden: ['alcance', 'naturaleza', 'origen'] }), mkView('xp2', 'Por estado', 'board', { group: 'estado', hidden: ['estado', 'alcance', 'naturaleza', 'origen', 'concord'] })], automations: []
  };

  // ---- Procedimientos operativos ----
  var tpo = {
    id: 'tpo', name: 'Procedimientos operativos', desc: 'PO recibidos de Operaciones. No se modifican: cada página prohíbe cambios sin autorización de quien los aprueba.', color: '#00705A', icon: 'i-wrench', abbr: 'PO', nextId: D.po.length + 1,
    props: [
      { key: 'cod', name: 'ID', type: 'title' },
      { key: 'codigo', name: 'Código', type: 'text' },
      { key: 'rev', name: 'Revisión', type: 'text' },
      { key: 'fecha', name: 'Fecha de la carátula', type: 'text' },
      { key: 'paginas', name: 'Páginas', type: 'number' },
      { key: 'nombre', name: 'Denominación', type: 'text' },
      { key: 'vig', name: 'Vigencia', type: 'select', options: [o('Por verificar', 'amber'), o('Vigente', 'green'), o('Reemplazado', 'gray')], desc: 'Hoy no hay constancia de que cada revisión sea la vigente' },
      { key: 'lineas', name: 'Líneas de anexo', type: 'relation', target: 'tli', pair: 'po' },
      { key: 'nlin', name: 'N.º de líneas', type: 'rollup', rel: 'lineas', prop: 'recurso', fn: 'count' }
    ],
    rows: D.po.map(function (x, i) { return mkRow('tpp' + (i + 1), i + 1, { cod: x.id, codigo: x.codigo, rev: x.rev, fecha: x.fecha, paginas: x.paginas, nombre: x.nombre, vig: 'Por verificar', lineas: [] }, NOW, BY); }),
    views: [mkView('xq1', 'PO', 'table', {})], automations: []
  };
  var poId = {}; D.po.forEach(function (x, i) { poId[x.id] = 'tpp' + (i + 1); });

  // ---- Líneas de anexo técnico (sin precios) ----
  var tli = {
    id: 'tli', name: 'Líneas de anexo técnico', desc: 'Una fila por recurso y actividad, tal como figura en el PO. Sin precios. Una cantidad vacía no es cero: el PO no la indica.', color: '#00705A', icon: 'i-layers', abbr: 'Ln', nextId: D.lin.length + 1,
    props: [
      { key: 'recurso', name: 'Recurso (según el PO)', type: 'title' },
      { key: 'cod', name: 'ID de línea', type: 'text' },
      { key: 'po', name: 'PO', type: 'relation', target: 'tpo', pair: 'lineas', single: true },
      { key: 'poid', name: 'ID del PO', type: 'select', options: opts(D.lin, 'po') },
      { key: 'actividad', name: 'Actividad técnica', type: 'text' },
      { key: 'familia', name: 'Familia', type: 'select', options: opts(D.lin, 'familia') },
      { key: 'naturaleza', name: 'Naturaleza', type: 'select', options: opts(D.lin, 'naturaleza', { 'Exigido por seguridad': 'red', 'Necesario para ejecutar': 'blue', 'Condicional': 'amber' }) },
      { key: 'uso', name: 'Tipo de uso', type: 'select', options: opts(D.lin, 'uso') },
      { key: 'base', name: 'Base de la cantidad', type: 'select', options: opts(D.lin, 'base') },
      { key: 'ca', name: 'Cant. A (carátula)', type: 'number' },
      { key: 'cb', name: 'Cant. B (lista de verificación)', type: 'number' },
      { key: 'cc', name: 'Cant. C (texto)', type: 'number' },
      { key: 'coinc', name: 'Coincidencia de cantidades', type: 'select', options: opts(D.lin, 'coinc', { 'Difiere': 'red', 'Coincide': 'green', 'Una sola fuente': 'blue', 'Cantidad no indicada': 'gray', 'Cantidad en texto': 'amber' }) },
      { key: 'texto', name: 'Cantidad o condición (texto del PO)', type: 'text' },
      { key: 'fuente', name: 'Fuentes', type: 'text' },
      { key: 'acu', name: 'Matrícula ACU', type: 'text', desc: 'Queda «ACU pendiente de vinculación» mientras no exista una matrícula validada' },
      { key: 'estado', name: 'Estado de validación', type: 'status', options: [so('Extraído (sin validar)', 'amber', 'todo'), so('Observado', 'red', 'doing'), so('Validado', 'green', 'done')] },
      { key: 'resp', name: 'Responsable técnico (por confirmar)', type: 'text' },
      { key: 'brechas', name: 'Brechas', type: 'text' }
    ],
    rows: D.lin.map(function (x, i) { return mkRow('tl' + (i + 1), i + 1, { recurso: x.recurso, cod: x.id, po: [poId[x.po]], poid: x.po, actividad: x.actividad || '', familia: x.familia, naturaleza: x.naturaleza, uso: x.uso, base: x.base, ca: x.ca === null ? '' : x.ca, cb: x.cb === null ? '' : x.cb, cc: x.cc === null ? '' : x.cc, coinc: x.coinc, texto: x.texto || '', fuente: x.fuente || '', acu: x.acu, estado: x.estado, resp: x.resp || '', brechas: x.brechas || '' }, NOW, BY); }),
    views: [mkView('xl1', 'Líneas', 'table', { hidden: ['actividad', 'texto', 'fuente', 'resp', 'poid', 'cb', 'cc'] }), mkView('xl2', 'Por PO', 'table', { group: 'po', hidden: ['actividad', 'texto', 'fuente', 'resp', 'poid'] })], automations: []
  };

  // ---- Brechas ----
  var tde, decId = {}; D.dec.forEach(function (x, i) { decId[x.id] = 'tdc' + (i + 1); });
  var tbr = {
    id: 'tbr', name: 'Brechas', desc: 'Datos faltantes, inconsistencias y decisiones sin responsable. Siguen abiertas hasta que el responsable las resuelva con constancia.', color: '#B00020', icon: 'i-clipcheck', abbr: 'Br', nextId: D.bre.length + 1,
    props: [
      { key: 'cod', name: 'ID', type: 'title' },
      { key: 'ambito', name: 'Ámbito', type: 'select', options: opts(D.bre, 'ambito') },
      { key: 'brecha', name: 'Brecha', type: 'text' },
      { key: 'impacto', name: 'Impacto en el costeo', type: 'text' },
      { key: 'tipo', name: 'Tipo', type: 'select', options: opts(D.bre, 'tipo') },
      { key: 'prioridad', name: 'Prioridad', type: 'select', options: [o('Alta', 'red'), o('Media', 'amber'), o('Baja', 'gray')] },
      { key: 'valida', name: 'Quién valida', type: 'select', options: opts(D.bre, 'valida') },
      { key: 'accion', name: 'Acción propuesta', type: 'text' },
      { key: 'estado', name: 'Estado', type: 'status', options: [so('Abierta', 'amber', 'todo'), so('En gestión', 'blue', 'doing'), so('Cerrada', 'green', 'done')] },
      { key: 'dec', name: 'Decisión', type: 'relation', target: 'tde', pair: 'brechas', single: true }
    ],
    rows: D.bre.map(function (x, i) { return mkRow('tb' + (i + 1), i + 1, { cod: x.id, ambito: x.ambito, brecha: x.brecha, impacto: x.impacto, tipo: x.tipo, prioridad: x.prioridad, valida: x.valida, accion: x.accion, estado: x.estado, dec: decId[x.dec] ? [decId[x.dec]] : [] }, NOW, BY); }),
    views: [mkView('xb1', 'Brechas', 'table', { hidden: ['impacto', 'accion'] }), mkView('xb2', 'Por prioridad', 'board', { group: 'prioridad', hidden: ['prioridad', 'impacto', 'accion', 'estado'] })], automations: []
  };

  // ---- Decisiones ----
  tde = {
    id: 'tde', name: 'Decisiones pendientes', desc: 'Cada decisión tiene opciones, una recomendación de la Fase 1 y un responsable. Se cierra con acta o correo oficial.', color: '#B45309', icon: 'i-handshake', abbr: 'De', nextId: D.dec.length + 1,
    props: [
      { key: 'cod', name: 'ID', type: 'title' },
      { key: 'decision', name: 'Decisión requerida', type: 'text' },
      { key: 'opciones', name: 'Opciones', type: 'text' },
      { key: 'recomendacion', name: 'Recomendación de la Fase 1', type: 'text' },
      { key: 'valida', name: 'Quién valida', type: 'select', options: opts(D.dec, 'valida') },
      { key: 'prioridad', name: 'Prioridad', type: 'select', options: [o('Alta', 'red'), o('Media', 'amber'), o('Baja', 'gray')] },
      { key: 'estado', name: 'Estado', type: 'status', options: [so('Pendiente', 'amber', 'todo'), so('Decidida', 'green', 'done')] },
      { key: 'brechas', name: 'Brechas', type: 'relation', target: 'tbr', pair: 'dec' },
      { key: 'nbr', name: 'N.º de brechas', type: 'rollup', rel: 'brechas', prop: 'cod', fn: 'count' }
    ],
    rows: D.dec.map(function (x, i) { return mkRow('tdc' + (i + 1), i + 1, { cod: x.id, decision: x.decision, opciones: x.opciones, recomendacion: x.recomendacion, valida: x.valida, prioridad: x.prioridad, estado: x.estado, brechas: [] }, NOW, BY); }),
    views: [mkView('xd1', 'Decisiones', 'table', { hidden: ['opciones'] }), mkView('xd2', 'Por responsable', 'board', { group: 'valida', hidden: ['valida', 'opciones'] })], automations: []
  };
  return { tobj: tobj, tpro: tpro, tpo: tpo, tli: tli, tbr: tbr, tde: tde };
}
