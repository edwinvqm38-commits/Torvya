// Recorrido de prueba v3: ejecuta la lógica y "renderiza" la plantilla para detectar huecos sin resolver.
const fs = require('fs');
const src = fs.readFileSync('' + (process.env.APP || '/home/claude/erp/project/Main.dc.html') + '', 'utf8');
const xm = src.match(/<x-dc>([\s\S]*)<\/x-dc>/)[1].replace(/<helmet>[\s\S]*<\/helmet>/, '');
const js = src.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];

global.navigator = { clipboard: { writeText: () => Promise.resolve() } };
global.setTimeout = () => 0;
const DCLogic = class { setState(p) { this.state = Object.assign({}, this.state || {}, p); } };
const Component = new Function('DCLogic', js + '\nreturn Component;')(DCLogic);

const VOID = new Set(['input', 'meta', 'link', 'br', 'img', 'hr']);
function parse(html) {
  const root = { tag: '#root', attrs: {}, children: [] };
  const stack = [root];
  const re = /<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s=>\/]+(?:="[^"]*"|='[^']*')?)*)\s*(\/?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[5] !== undefined) { if (m[5].trim()) stack[stack.length - 1].children.push({ text: m[5] }); continue; }
    const [, close, tag, attrStr] = m;
    if (close) { const top = stack.pop(); if (top.tag !== tag) throw new Error('Mismatch </' + tag + '> vs <' + top.tag + '>'); continue; }
    const attrs = {};
    attrStr.replace(/([^\s=>\/]+)(?:="([^"]*)"|='([^']*)')?/g, (_, k, v1, v2) => { attrs[k] = v1 !== undefined ? v1 : (v2 !== undefined ? v2 : ''); });
    const node = { tag, attrs, children: [] };
    stack[stack.length - 1].children.push(node);
    if (!VOID.has(tag) && !m[4]) stack.push(node);
  }
  if (stack.length !== 1) throw new Error('Unclosed: ' + stack.map(n => n.tag).join('>'));
  return root;
}
const tree = parse(xm);
function resolve(path, scopes) {
  path = path.trim();
  if (path === 'true') return true;
  if (path === 'false') return false;
  const parts = path.split('.');
  let base;
  for (let i = scopes.length - 1; i >= 0; i--) { if (Object.prototype.hasOwnProperty.call(scopes[i], parts[0])) { base = scopes[i][parts[0]]; break; } if (i === 0) return { __missing: parts[0] }; }
  let v = base;
  for (let i = 1; i < parts.length; i++) { if (v == null) return { __missing: parts.slice(0, i + 1).join('.') }; v = v[parts[i]]; }
  return v;
}
function check(vals, label, issues) {
  function holes(str, scopes, where, isEvent) {
    const re = /\{\{\s*([^}]+?)\s*\}\}/g; let m;
    while ((m = re.exec(str))) {
      const v = resolve(m[1], scopes);
      if (v && v.__missing) issues.push(label + ': falta «' + m[1] + '» en ' + where);
      else if (v === undefined && !/pressed$/.test(m[1])) issues.push(label + ': indefinido «' + m[1] + '» en ' + where);
      else if (isEvent && typeof v !== 'function') issues.push(label + ': evento no es función «' + m[1] + '» en ' + where);
      else if (!isEvent && v && typeof v === 'object' && !Array.isArray(v)) issues.push(label + ': objeto en texto «' + m[1] + '» en ' + where);
    }
  }
  function walk(node, scopes) {
    if (node.text !== undefined) { holes(node.text, scopes, 'texto'); return; }
    if (node.tag === 'sc-for') {
      const list = resolve(node.attrs.list.replace(/[{}]/g, ''), scopes);
      if (!Array.isArray(list)) { issues.push(label + ': sc-for no es lista «' + node.attrs.list + '»'); return; }
      list.slice(0, 4).forEach((item, i) => { const sc = {}; sc[node.attrs.as] = item; node.children.forEach(c => walk(c, scopes.concat([sc]))); });
      return;
    }
    if (node.tag === 'sc-if') {
      const v = resolve(node.attrs.value.replace(/[{}]/g, ''), scopes);
      if (v && v.__missing) { issues.push(label + ': sc-if falta «' + node.attrs.value + '»'); return; }
      if (!v) return;
      node.children.forEach(c => walk(c, scopes));
      return;
    }
    for (const k in node.attrs) if (node.attrs[k].indexOf('{{') >= 0) holes(node.attrs[k], scopes, '<' + node.tag + ' ' + k + '>', /^on[A-Z]/.test(k));
    node.children.forEach(c => walk(c, scopes));
  }
  walk(tree, [vals]);
}

const c = new Component(); c.props = {};
const issues = [];
let r;
function R(label) { r = c.renderVals(); check(r, label, issues); return r; }
const S = p => c.setState(p);
const log = (...a) => console.log(...a);
const blk = id => r.pg.blocks.find(b => b.id === id);
const cellTxt = cc => cc.isTitle ? cc.title : (cc.d.text || (cc.d.pills[0] || {}).text || cc.d.chips.map(x => x.label).join('+') || cc.d.people.map(x => x.name).join('+') || (cc.d.kCheck ? (cc.d.checked ? 'sí' : 'no') : ''));



const propOf = (t, k) => t.props.find(p => p.key === k);
R('inicio');
c.setState({ viewerId: 'ana' });
c.bizApply('electrico'); R('aplicar propuesta');
let T = c.st().tables.byId;
log('Instalado portafolio:', c.bizInstalled(c.st(), 'portafolio'));
log('Tablas:', ['ppr','phi','pum'].map(k => k + '=' + (T[k] ? T[k].rows.length : 'NO')).join(' '));
const PR = T.ppr;
const fv = (t, k, row) => c.fval(c.st(), t, propOf(t, k), row);
log('--- Proyectos (cálculo) ---');
PR.rows.forEach(x => log(x.cod, '| hitos', fv(PR,'nhit',x), '| plan', fv(PR,'plan',x), '| real', fv(PR,'real',x), '| ganado', fv(PR,'gan',x), '| av', fv(PR,'avp',x), '| VC', fv(PR,'vc',x), '| IDC', fv(PR,'idc',x), '| desv', fv(PR,'desv',x), '|', fv(PR,'sema',x)));
// Verificación independiente del cálculo
const HI = T.phi; let bad = 0;
PR.rows.forEach(p => { const hs = HI.rows.filter(h => (h.proy || [])[0] === p.id); const plan = hs.reduce((a,h)=>a+h.plan,0), real = hs.reduce((a,h)=>a+h.real,0), gan = hs.reduce((a,h)=>a+h.plan*h.av/100,0);
  const exp = { plan, real, gan, desv: plan ? Math.round((real-gan)/plan*1000)/10 : 0 };
  const got = { plan: Number(fv(PR,'plan',p)), real: Number(fv(PR,'real',p)), gan: Number(fv(PR,'gan',p)), desv: Number(fv(PR,'desv',p)) };
  for (const k in exp) if (Math.abs(exp[k]-got[k]) > 0.051) { bad++; log('  DIFIERE', p.cod, k, 'esperado', exp[k], 'obtenido', got[k]); } });
log('Diferencias vs cálculo independiente:', bad);
// el semáforo responde a los umbrales
const U = T.pum.rows.find(x => x.concepto === 'Umbral rojo');
const before = PR.rows.map(x => fv(PR,'sema',x)).join(',');
c.setField('pum', U.id, 'valor', 1); let T2 = c.st().tables.byId; const after = T2.ppr.rows.map(x => c.fval(c.st(), T2.ppr, propOf(T2.ppr, 'sema'), x)).join(','); c.setField('pum', U.id, 'valor', 15);
log('Semáforo con umbral 15:', before, '\nSemáforo con umbral 1: ', after);

log('--- Subpáginas ---');
c.goPage('pgpf'); R('pgpf');
log('Home/General/Áreas:', r.sideHome.length, r.sideGeneral.length, JSON.stringify(r.sideAreas.map(a => a.name + ':' + a.pages.length)));
const area = r.sideAreas.find(a => a.name === 'Ingeniería de Costos');
log('Árbol visible:', area.pages.map(p => '  '.repeat(Number(p.depth)) + p.name + (p.hasKids ? ' (+' + p.kidCount + ')' : '')).join('\n'));
// plegar pgpf2 y volver a plegar/abrir
area.pages.find(p => p.id === 'pgpf2').toggle(); R('plegar');
log('Tras plegar Proyectos:', r.sideAreas.find(a => a.name === 'Ingeniería de Costos').pages.length, 'filas');
r.sideAreas.find(a => a.name === 'Ingeniería de Costos').pages.find(p => p.id === 'pgpf2').toggle(); R('abrir');
// migas y subpáginas en una página de nivel 3
c.goPage('pgpf2a'); R('nivel 3');
log('Migas:', r.pg.crumbs.map(x => x.name).join(' / '), '| padre:', r.pg.parentName);
c.goPage('pgpf2'); R('nivel 2'); log('Subpáginas de Proyectos:', r.pg.subs.map(x => x.name).join(' | '));
// crear subpágina y mover
c.newPage(null, 'pgpf4'); R('nueva sub');
const nid = c.st().page; log('Nueva subpágina:', c.st().pages.byId[nid].parent, '| área:', c.st().pages.byId[nid].area, '| jelly:', c.st().jellyKey);
c.pageSetParent('pgpf', nid); log('Ciclo (padre dentro de hija) bloqueado:', c.st().pages.byId['pgpf'].parent == null);
c.pageSetParent(nid, 'pgpf3'); log('Movida a Hitos y costos:', c.st().pages.byId[nid].parent);
c.pageSetParent(nid, null); log('Subida al nivel principal:', c.st().pages.byId[nid].parent);
// arrastrar en la barra lateral
c._dragPg = nid; c.pgDrop('pgpf5', { preventDefault(){}, currentTarget: {classList:{remove(){},add(){}}} }); log('Arrastrar a Archivos:', c.st().pages.byId[nid].parent);
// borrar padre reubica hijas
c.goPage('pgpf2'); c.delPage('pgpf2'); c.delPage('pgpf2'); R('borrar padre');
log('Tras borrar Proyectos, hijas →', ['pgpf2a','pgpf2b','pgpf2c'].map(k => c.st().pages.byId[k].parent).join(','));
// TECSUR anidado
log('pgtec2 dentro de:', c.st().pages.byId['pgtec2'] && c.st().pages.byId['pgtec2'].parent);
// páginas del portafolio
for (const pid of ['pgpf','pgpf1','pgpf3','pgpf4','pgpf5','pgpf2a']) { c.goPage(pid); R(pid); log(pid + ':', r.pg.blocks.map(b => b.typeName + (b.kpi ? '=' + b.kpi.value : '')).join(' | ')); }
// jelly
c.jellyOn('pg:pgpf3'); R('jelly'); const sa = r.sideAreas.find(a => a.name === 'Ingeniería de Costos'); log('Jelly en barra:', sa.pages.filter(p => p.jl).map(p => p.name).join(','));
// enlace a OneDrive / Drive
const row0 = c.st().tables.byId.ppr.rows[0]; row0.carpeta = 'https://tecsur.sharepoint.com/sites/costos/Shared%20Documents/PRY-D1';
c.goPage('pgpf'); R('carpeta');
c.goPage('pgpf'); R('pg'); r.pg.exportRep(); R('reporte abierto');
log('Reporte:', r.rp.open, r.rp.count, '|', r.rp.secs.map(x => x.kind + ':' + x.name.slice(0,20)).join(' / '));
r.rp.secs[1].down(); R('mover'); r.rp.secs[0].toggle(); R('toggle'); r.rp.tplSeg[1].pick(); R('tecnico');
const d = c.repData(); log('Datos:', d.map(x => x.type + (x.rows ? '(' + x.rows.length + 'f×' + x.cols.length + 'c)' : '')).join(' '));
const html = c.repHtml(false); log('HTML:', html.length, 'bytes | h1:', (html.match(/<h1/g)||[]).length, '| tablas:', (html.match(/class="dt"/g)||[]).length, '| svg:', (html.match(/<svg/g)||[]).length, '| índice:', html.includes('Índice'));
c.goPage('pgpf1'); R('pg1'); r.pg.exportRep(); R('rep2'); log('HTML pgpf1 svg:', (c.repHtml(false).match(/<svg/g)||[]).length);
r.rp.close(); R('cerrar');
log('Avisos de plantilla:', issues.length); issues.slice(0, 25).forEach(i => log(' -', i));
