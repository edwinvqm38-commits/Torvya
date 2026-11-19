/* ================= Portafolio de proyectos · DATOS DEMO con fórmulas =================
   Ejemplo para entender y configurar después. Nombres, montos y avances son ficticios.
   Tablas: ppr Proyectos · phi Hitos · pum Umbrales.
   Cadena de cálculo: Hito (Plan, Real, Avance) → Valor ganado = Plan × Avance →
   Proyecto (suma de hitos) → Avance ponderado, Variación de costo, Índice de costo, Desvío → Semáforo según los umbrales. */
function seedPortafolio() {
  var NOW = '2026-11-18T09:00', BY = 'ana';
  // ---- Umbrales (parámetros que usan las fórmulas del semáforo) ----
  var pum = {
    id: 'pum', name: 'Umbrales', desc: 'Parámetros del semáforo. Cambia un valor y el semáforo de todos los proyectos se recalcula.', color: '#5A6675', icon: 'i-scale', abbr: 'Um', nextId: 4,
    props: [
      { key: 'concepto', name: 'Concepto', type: 'title' },
      { key: 'valor', name: 'Valor', type: 'number', dec: 'auto' },
      { key: 'nota', name: 'Nota', type: 'text' }
    ],
    rows: [
      mkRow('pum1', 1, { concepto: 'Umbral amarillo', valor: 5, nota: 'Desvío (en % del plan) a partir del cual el proyecto pasa a Amarillo. Valor demo.' }, NOW, BY),
      mkRow('pum2', 2, { concepto: 'Umbral rojo', valor: 15, nota: 'Desvío (en % del plan) a partir del cual el proyecto pasa a Rojo. Valor demo.' }, NOW, BY),
      mkRow('pum3', 3, { concepto: 'Meses de holgura', valor: 2, nota: 'Ejemplo de parámetro para usar en otras fórmulas. Valor demo.' }, NOW, BY)
    ],
    views: [mkView('xu1', 'Umbrales', 'table', {})], automations: []
  };
  // ---- Proyectos ----
  var P = [
    ['PRY-D1', 'Renovación de redes BT · sector demo A', 'Redes BT', 'En ejecución', 'Responsable demo 1', '2026-03-02', '2026-12-18'],
    ['PRY-D2', 'Mantenimiento preventivo MT · ciclo 2026', 'Mantenimiento MT', 'En ejecución', 'Responsable demo 2', '2026-02-09', '2026-12-04'],
    ['PRY-D3', 'Programa de capacitación QHSE', 'Capacitación', 'En ejecución', 'Responsable demo 3', '2026-01-12', '2026-12-11'],
    ['PRY-D4', 'Estandarización de ACU (ejemplo)', 'Gestión de costos', 'Planificado', 'Responsable demo 4', '2026-12-01', '2027-03-26'],
    ['PRY-D5', 'Actualización de la propuesta de EPP (ejemplo)', 'Gestión de costos', 'En ejecución', 'Responsable demo 4', '2026-09-07', '2026-12-31'],
    ['PRY-D6', 'Alumbrado público · obra cerrada (ejemplo)', 'Redes BT', 'Cerrado', 'Responsable demo 1', '2026-01-19', '2026-08-28']
  ];
  var ppr = {
    id: 'ppr', name: 'Proyectos', desc: 'DEMO · Portafolio de ejemplo. Los totales vienen de los hitos y el semáforo de la tabla Umbrales: haz clic en una columna para ver su fórmula.', color: '#00468C', icon: 'i-folder', abbr: 'Pr', nextId: P.length + 1,
    props: [
      { key: 'cod', name: 'Código', type: 'title' },
      { key: 'nombre', name: 'Proyecto', type: 'text' },
      { key: 'programa', name: 'Programa', type: 'select', options: [o('Redes BT', 'blue'), o('Mantenimiento MT', 'teal'), o('Capacitación', 'violet'), o('Gestión de costos', 'amber')] },
      { key: 'estado', name: 'Estado', type: 'status', options: [so('Planificado', 'gray', 'todo'), so('En ejecución', 'blue', 'doing'), so('En pausa', 'amber', 'doing'), so('Cerrado', 'green', 'done')] },
      { key: 'resp', name: 'Responsable', type: 'text' },
      { key: 'inicio', name: 'Inicio', type: 'date', dateFmt: 'short' },
      { key: 'fin', name: 'Fin previsto', type: 'date', dateFmt: 'short' },
      { key: 'hitos', name: 'Hitos', type: 'relation', target: 'phi', pair: 'proy' },
      { key: 'nhit', name: 'N.º de hitos', type: 'rollup', rel: 'hitos', prop: 'cod', fn: 'count' },
      { key: 'plan', name: 'Plan total', type: 'rollup', rel: 'hitos', prop: 'plan', fn: 'sum', fmt: 'money' },
      { key: 'real', name: 'Costo real', type: 'rollup', rel: 'hitos', prop: 'real', fn: 'sum', fmt: 'money' },
      { key: 'gan', name: 'Valor ganado', type: 'rollup', rel: 'hitos', prop: 'gan', fn: 'sum', fmt: 'money' },
      { key: 'avp', name: 'Avance ponderado', type: 'formula', expr: '=SI([Plan total] > 0; REDONDEAR([Valor ganado] / [Plan total] * 100; 1); 0)', resFmt: 'percent', desc: 'Valor ganado ÷ Plan total. Pondera cada hito por su plan.' },
      { key: 'vc', name: 'Variación de costo', type: 'formula', expr: '=[Valor ganado] - [Costo real]', resFmt: 'money', desc: 'Negativo = se gastó más de lo que se avanzó.' },
      { key: 'idc', name: 'Índice de costo', type: 'formula', expr: '=SI([Costo real] > 0; REDONDEAR([Valor ganado] / [Costo real]; 2); 0)', resFmt: 'number', desc: 'Menor que 1 = sobrecosto. Solo es confiable con avance físico verificable.' },
      { key: 'desv', name: 'Desvío', type: 'formula', expr: '=SI([Plan total] > 0; REDONDEAR(([Costo real] - [Valor ganado]) / [Plan total] * 100; 1); 0)', resFmt: 'percent', desc: 'Sobrecosto en % del plan. Alimenta el semáforo.' },
      { key: 'sema', name: 'Semáforo', type: 'formula', expr: '=SI([Desvío] > BUSCAR("Umbral rojo"; Umbrales[Concepto]; Umbrales[Valor]); "Rojo"; SI([Desvío] > BUSCAR("Umbral amarillo"; Umbrales[Concepto]; Umbrales[Valor]); "Amarillo"; "Verde"))', resFmt: 'text', desc: 'Compara el Desvío con los valores de la tabla Umbrales.' },
      { key: 'carpeta', name: 'Carpeta (OneDrive / Drive)', type: 'url', urlShort: true, desc: 'Pega el enlace compartido de la carpeta del proyecto. La conexión automática con OneDrive o Drive queda para una fase posterior.' }
    ],
    rows: P.map(function (x, i) { return mkRow('ppr' + (i + 1), i + 1, { cod: x[0], nombre: x[1], programa: x[2], estado: x[3], resp: x[4], inicio: x[5], fin: x[6], hitos: [], carpeta: '' }, NOW, BY); }),
    views: [mkView('xr1', 'Portafolio', 'table', { hidden: ['resp', 'inicio', 'fin', 'hitos', 'nhit', 'vc', 'idc'] }), mkView('xr2', 'Por estado', 'board', { group: 'estado', hidden: ['estado', 'resp', 'inicio', 'fin', 'hitos', 'nhit', 'plan', 'gan', 'vc', 'idc', 'carpeta'] }), mkView('xr3', 'Calculo completo', 'table', { hidden: ['hitos', 'carpeta'] })], automations: []
  };
  // ---- Hitos: [proyecto, fase, nombre, plan, real, avance] ----
  var H = [
    [1, 'Inicio', 'Replanteo y permisos', 12000, 11800, 100], [1, 'Ejecución', 'Tendido y conexión', 48000, 55000, 80], [1, 'Ejecución', 'Pruebas', 9000, 0, 0], [1, 'Cierre', 'Cierre y liquidación', 4000, 0, 0],
    [2, 'Planificación', 'Inspección de equipos', 15000, 14200, 100], [2, 'Ejecución', 'Intervención', 30000, 21000, 60], [2, 'Cierre', 'Informe técnico', 5000, 0, 0],
    [3, 'Planificación', 'Plan anual', 3000, 3000, 100], [3, 'Ejecución', 'Sesiones primer trimestre', 6000, 5900, 100], [3, 'Ejecución', 'Sesiones segundo trimestre', 6000, 6500, 100], [3, 'Ejecución', 'Sesiones tercer trimestre', 6000, 2000, 40], [3, 'Ejecución', 'Sesiones cuarto trimestre', 6000, 0, 0],
    [4, 'Planificación', 'Levantamiento de partidas', 8000, 0, 0], [4, 'Ejecución', 'Modelo estándar', 10000, 0, 0],
    [5, 'Planificación', 'Relevamiento de precios', 4000, 4200, 100], [5, 'Ejecución', 'Propuesta económica', 9000, 6000, 55], [5, 'Cierre', 'Revisión con Operaciones', 3000, 0, 0],
    [6, 'Ejecución', 'Obra', 60000, 61500, 100], [6, 'Cierre', 'Liquidación', 5000, 5200, 100]
  ];
  var cnt = {};
  var phi = {
    id: 'phi', name: 'Hitos', desc: 'DEMO · Cada hito tiene un plan, un costo real y un avance. El valor ganado es Plan × Avance y sube al proyecto.', color: '#00705A', icon: 'i-flag', abbr: 'Hi', nextId: H.length + 1,
    props: [
      { key: 'cod', name: 'Código', type: 'title' },
      { key: 'hito', name: 'Hito', type: 'text' },
      { key: 'proy', name: 'Proyecto', type: 'relation', target: 'ppr', pair: 'hitos', single: true },
      { key: 'fase', name: 'Fase', type: 'select', options: [o('Inicio', 'gray'), o('Planificación', 'blue'), o('Ejecución', 'teal'), o('Cierre', 'green')] },
      { key: 'plan', name: 'Plan', type: 'number', fmt: 'money', dec: 'auto' },
      { key: 'real', name: 'Real', type: 'number', fmt: 'money', dec: 'auto' },
      { key: 'av', name: 'Avance', type: 'number', fmt: 'percent', showAs: 'bar', max: 100 },
      { key: 'gan', name: 'Valor ganado', type: 'formula', expr: '=[Plan] * [Avance] / 100', resFmt: 'money', desc: 'Plan × Avance. Es lo que se debería haber gastado por el avance logrado.' },
      { key: 'dif', name: 'Diferencia', type: 'formula', expr: '=[Real] - [Valor ganado]', resFmt: 'money', desc: 'Positivo = se gastó más de lo ganado.' },
      { key: 'est', name: 'Estado del hito', type: 'formula', expr: '=SI([Avance] >= 100; "Completo"; SI([Avance] > 0; "En curso"; "Sin iniciar"))', resFmt: 'text' }
    ],
    rows: H.map(function (x, i) { cnt[x[0]] = (cnt[x[0]] || 0) + 1; return mkRow('phi' + (i + 1), i + 1, { cod: 'D' + x[0] + '-' + (cnt[x[0]] < 10 ? '0' : '') + cnt[x[0]], hito: x[2], proy: ['ppr' + x[0]], fase: x[1], plan: x[3], real: x[4], av: x[5] }, NOW, BY); }),
    views: [mkView('xh1', 'Hitos', 'table', { hidden: ['hito'] }), mkView('xh2', 'Por fase', 'board', { group: 'fase', hidden: ['fase', 'gan', 'dif'] }),
      mkView('xh3', 'Hitos PRY-D1', 'table', { filters: [{ prop: 'cod', op: 'contains', value: 'D1-' }], hidden: ['proy', 'hito'] }),
      mkView('xh4', 'Hitos PRY-D2', 'table', { filters: [{ prop: 'cod', op: 'contains', value: 'D2-' }], hidden: ['proy', 'hito'] }),
      mkView('xh5', 'Hitos PRY-D5', 'table', { filters: [{ prop: 'cod', op: 'contains', value: 'D5-' }], hidden: ['proy', 'hito'] })], automations: []
  };
  return { ppr: ppr, phi: phi, pum: pum };
}
