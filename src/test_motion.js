// Piloto de movimiento y curva S: lógica sin navegador (la parte visual se prueba con Playwright).
const fs = require('fs');
const src = fs.readFileSync(process.env.APP || '/home/claude/torvya/app/Trazya.dc.html', 'utf8');
const js = src.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];
global.navigator = { clipboard: { writeText: () => Promise.resolve() } };
global.setTimeout = () => 0;
const DCLogic = class { setState(p) { this.state = Object.assign({}, this.state || {}, p); } };
const Component = new Function('DCLogic', js + '\nreturn Component;')(DCLogic);
const c = new Component({});
let fail = 0;
const ok = (n, v) => { console.log((v ? 'OK   ' : 'FALLA') + ' ' + n); if (!v) fail++; };
const s = c.st(), v = c.viewer(s);
for (const id of ['y1', 'y2', 'y3']) {
  const r = c.scurveBlock(s, v, { id: 'x', proj: id });
  ok('curva S ' + id + ' tiene datos', r.has && r.metrics.length === 4);
  const d = JSON.parse(r.json);
  const mono = a => a.every((p, i) => i === 0 || p[1] >= a[i - 1][1] - 0.01);
  ok(id + ': programado creciente de 0 a 100', mono(d.prog) && d.prog[0][1] === 0 && Math.abs(d.prog[d.prog.length - 1][1] - 100) < 0.5);
  ok(id + ': ejecutado creciente', mono(d.ejec));
  console.log('   ', r.metrics.map(m => m.label + '=' + m.value).join(' · '));
}
const rows = c.rowsFor(s, 'proy', v);
const y1 = rows.find(r => r.id === 'y1'), T = s.tables.byId.proy;
ok('SPI y CPI vienen de las fórmulas de la tabla', c.scurveBlock(s, v, { id: 'x', proj: 'y1' }).metrics[1].value === Number(c.fval(s, T, T.props.find(p => p.key === 'spi'), y1)).toFixed(2));
ok('modo Sistema resuelve claro/oscuro', ['light', 'dark'].includes(c.sysMode()));
const vals = c.mvVals(s);
ok('ajustes: 4 niveles, 4 tipos, 3 duraciones', vals.mvLevelOpts.length === 4 && vals.mvToggles.length === 4 && vals.mvSpeedOpts.length === 3);

// --- etapa 1b: indicadores clicleables, ventana de detalle, curva S, sonidos ---
c.props = {};
{
  let s2 = c.st(); const v2 = c.viewer(s2);
  const pid = s2.pages.order.find(id => s2.pages.byId[id].blocks.some(b => b.type === 'kpi' && (b.filters || []).length));
  const pg = s2.pages.byId[pid], kf = pg.blocks.find(b => b.type === 'kpi' && (b.filters || []).length);
  const xf = { table: kf.table, kpi: kf.id, filters: kf.filters, label: 'Indicador' };
  c.setXf(pid, xf);
  const sets = c.xfSets(c.st(), c.st().xf[pid], v2);
  const want = c.applyFilters(c.st(), c.st().tables.byId[kf.table], c.rowsFor(c.st(), kf.table, v2), kf.filters, v2).length;
  ok('KPI con filtro: el filtro cruzado deja solo sus registros', sets && Object.keys(sets[kf.table]).length === want);
  const bv = c.blockView(c.st(), v2, pg, kf, { xf: c.st().xf[pid], xfSets: sets, canEditPage: true, index: 0, count: 1 });
  ok('KPI origen: queda marcado y conserva su valor', bv.kpi.on && bv.kpi.onCls === 'kpi-on' && /^\d/.test(bv.kpi.value));
  c.setXf(pid, xf);
  ok('volver a pulsar el KPI quita el filtro', !c.st().xf[pid]);
  c.openKd(pid, kf.id);
  const kd = c.kdData(c.st(), v2);
  ok('ventana de detalle del KPI lista sus registros', kd && kd.isKpi && kd.rows.length === want && kd.cols.length >= 2);
  c.closeKd(); ok('cerrar la ventana limpia el estado', !c.st().kd);
  const chb = pg.blocks.find(b => b.type === 'chart');
  if (chb) { c.openKd(pid, chb.id); const k2 = c.kdData(c.st(), v2); ok('ventana de detalle del gráfico incluye el gráfico', k2 && k2.isChart && !!k2.ch); c.closeKd(); }
  const ms = JSON.parse(c.scurveBlock(c.st(), v2, { id: 'sc1', proj: 'y1' }).json);
  c.setState({ scSel: { sc1: { ms: ms.prog[10][0] } } });
  const r = c.scurveBlock(c.st(), v2, { id: 'sc1', proj: 'y1' });
  ok('curva S: elegir un punto muestra el detalle del período', r.hasSel && r.sel.rows.length === 5 && JSON.parse(r.json).sel === ms.prog[10][0]);
  r.sel.clear(); ok('curva S: quitar la selección', !c.scurveBlock(c.st(), v2, { id: 'sc1', proj: 'y1' }).hasSel);
  const mv = c.mvVals(c.st());
  ok('ajustes de sonido: activar, volumen y 4 tipos', mv.sndOn.length === 2 && mv.sndVol.length === 3 && mv.sndToggles.length === 4);
}
process.exit(fail ? 1 : 0);
