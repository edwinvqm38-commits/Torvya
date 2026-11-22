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
process.exit(fail ? 1 : 0);
