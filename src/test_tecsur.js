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


/* ---------- módulo TECSUR (M09) ---------- */
const propOf = (t, k) => t.props.find(p => p.key === k);
R('inicio');
c.setState({ viewerId: 'ana' });
c.bizApply('electrico'); R('aplicar propuesta');
const T = c.st().tables.byId;
log('Tablas TECSUR:', ['tobj','tpro','tpo','tli','tbr','tde'].map(k => k + '=' + (T[k] ? T[k].rows.length : 'NO')).join(' '));
log('Instalado:', c.bizInstalled(c.st(), 'tecsur'));
const PO = T.tpo; log('PO líneas (rollup):', PO.rows.map(x => x.cod + '=' + c.fval(c.st(), PO, propOf(PO, 'nlin'), x)).join(' '));
const DE = T.tde; log('Decisiones con brechas:', DE.rows.slice(0,4).map(x => x.cod + '=' + c.fval(c.st(), DE, propOf(DE, 'nbr'), x)).join(' '), '| total brechas enlazadas:', DE.rows.reduce((a, x) => a + (x.brechas || []).length, 0));
log('Objetivo→procedimientos:', T.tobj.rows.map(x => x.codigo + '=' + (x.procs || []).length).join(' '));
for (const pid of ['pgtec', 'pgtec2']) { c.goPage(pid); R(pid); log(pid + ':', r.pg.blocks.map(b => b.typeName + (b.kpi ? '=' + b.kpi.value : '')).join(' | ')); }
c.goPage('pgtec'); R('gerencia');
log('KPIs Gerencia:', r.pg.blocks.filter(b => b.kpi).map(b => b.title + '=' + b.kpi.value).join(' | '));
log('Avisos de plantilla:', issues.length); issues.slice(0, 20).forEach(i => log(' -', i));
log('DBG lineas len:', (T.tpo.rows[0].lineas || []).length, '| st:', (c.st().tables.byId.tpo.rows[0].lineas || []).length, '| tli.po:', JSON.stringify(c.st().tables.byId.tli.rows[0].po), '| brechas dec:', JSON.stringify(c.st().tables.byId.tbr.rows[0].dec), c.st().tables.byId.tde.rows[0].brechas.length);
