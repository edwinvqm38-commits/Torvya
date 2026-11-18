// Recorrido de prueba v3: ejecuta la lógica y "renderiza" la plantilla para detectar huecos sin resolver.
const fs = require('fs');
const src = fs.readFileSync('/home/claude/erp/project/Main.dc.html', 'utf8');
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

/* ---------- página 1: panel tipo Power BI ---------- */
/* ---------- v4: mi tablero, PMBOK, menú /, arrastrar, portada, organigrama ---------- */
R('mi tablero');
log('Marca:', r.appName, '| inicio:', r.sideHome.map(p => p.name).join(','), '| general:', r.sideGeneral.map(p => p.name).join(','), '| áreas:', r.sideAreas.map(a => a.name + ': ' + a.pages.map(p => p.name).join('/')).join(' || '));
log('Saludo:', r.pg.greet, '|', r.pg.greetSub, '| KPIs:', ['m1', 'm2', 'm3'].map(id => blk(id).title + '=' + blk(id).kpi.value).join(' | '));
log('Mis recomendaciones:', blk('m4').pm.issues.map(i => i.sevName + ': ' + i.title + ' (' + i.where + ') [' + i.ref + ']').join(' || '));
blk('m6').td.items[0].toggle(); R('todo'); blk('m6').td.add(); R('todo add'); blk('m6').td.items[3].setText({ target: { value: 'Nuevo' } }); R('todo txt'); blk('m6').td.items[3].del(); R('todo del'); log('Todo:', blk('m6').td.progress);
c.goPage('pg4'); R('proyectos');
const pm = () => blk('e5').pm;
log('PM score:', pm().score, pm().nAlta, pm().nMedia, pm().nBaja, '| proyectos:', pm().projects.map(p => p.title + ' CPI ' + p.cpi + ' SPI ' + p.spi + ' alertas ' + p.issues).join(' | '));
for (const e of [0, 1, 2]) { pm().edSeg[e].pick(); R('ed'); log('Edición', pm().edName, '→', pm().issues[0].title, '·', pm().issues[0].ref); }
pm().toggleMore(); R('more'); log('Total recomendaciones:', pm().issues.length);
pm().issues.find(i => i.title.indexOf('acta') >= 0).fix(); R('fix acta'); log('Tras aprobar acta:', pm().score);
pm().issues.find(i => i.title === 'Tarea sin responsable').fix(); R('fix owner');
pm().issues.find(i => i.title === 'Sin interesados registrados').fix(); R('fix add'); log('Abierto tras añadir:', r.rec.tname, '| reglas:', r.rec.pm.items.map(x => x.title).join(','), '| consejos', r.rec.pm.tips.length); r.closeRec(); R('x');
pm().newProject(); R('nuevo proyecto'); log('Nuevo proyecto:', r.rec.titleText, '| recomendaciones:', r.rec.pm.items.map(x => x.title).join(' / '), '| tareas creadas:', c.st().tables.byId.tar.rows.length); r.rec.pm.items[0].fix(); R('fix en rec'); r.closeRec(); R('x');
blk('e0').co.cycle(); R('callout'); blk('e0').setText({ target: { value: 'Aviso editado' } }); R('callout txt');
r.pg.setSlashQ({ target: { value: '/tab' } }); R('slash'); log('Slash /tab:', r.pg.slash.map(x => x.name).join(','));
r.pg.setSlashQ({ target: { value: '/2 col' } }); R('slash2'); r.pg.slash[0].pick(); R('2 cols'); log('Tras /2 columnas:', r.pg.blocks.slice(-2).map(b => b.cls).join(' | '));
r.pg.blocks.slice(-1)[0].setText({ target: { value: '/graf' } }); R('slash en bloque'); log('Menú en bloque:', r.pg.blocks.slice(-1)[0].slash.map(x => x.name).join(','));
r.pg.blocks.slice(-1)[0].slash[0].pick(); R('reemplazo'); log('Reemplazado por:', r.pg.blocks.slice(-1)[0].typeName, r.pg.blocks.slice(-1)[0].cls); if (r.drawerOpen) r.closeDrawer(); R('x');
r.pg.blocks.slice(-2)[0].setText({ target: { value: '/3 col' } }); R('s3'); r.pg.blocks.slice(-2)[0].slash[0].pick(); R('3 en col'); log('Columnas anidadas:', r.pg.blocks.slice(-4).map(b => b.cls.split(' ')[1]).join(','));
r.pg.setSlashQ({ target: { value: '/zzz' } }); R('vacío'); log('Sin coincidencias:', r.pg.slashEmpty);
r.pg.slashKey({ key: 'Enter', target: { value: 'Nota rápida' } }); R('enter texto'); log('Último bloque:', r.pg.blocks.slice(-1)[0].text);
r.pg.slashKey({ key: 'Enter', target: { value: '/tabla nueva' } }); R('enter tabla'); log('Último bloque:', r.pg.blocks.slice(-1)[0].typeName);
r.pg.setSlashQ({ target: { value: '/tabla existente' } }); R('s'); r.pg.slash[0].pick(); R('db pick'); log('Elegir tabla:', r.pg.addDb); r.pg.addTables[4].pick(); R('db add'); log('Último bloque:', r.pg.blocks.slice(-1)[0].dv.name);
const fakeE = (x, y) => ({ preventDefault() { }, clientX: x, clientY: y, dataTransfer: { setData() { }, effectAllowed: '', setDragImage() { } }, target: { closest: () => ({ getBoundingClientRect: () => ({ left: 0, top: 0, width: 1200, height: 100 }) }) }, currentTarget: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 300, height: 100 }), parentNode: { getBoundingClientRect: () => ({ width: 1200 }) }, classList: { toggle() { }, remove() { }, add() { } } } });
global.document = { querySelectorAll: () => [], createElement: () => ({}) };
const ids0 = r.pg.blocks.map(b => b.id);
r.pg.blocks[2].dragStart(fakeE(0, 0)); r.pg.blocks[0].dragOver(fakeE(10, 10)); r.pg.blocks[0].drop(fakeE(10, 10)); R('drop'); log('Orden:', ids0.slice(0, 3).join(','), '→', r.pg.blocks.slice(0, 3).map(b => b.id).join(','));
r.pg.blocks[0].dragStart(fakeE(0, 0)); r.pg.dropEndOk(fakeE(0, 0)); r.pg.dropEnd(fakeE(0, 0)); R('drop fin'); log('Al final:', r.pg.blocks.slice(-1)[0].id);
r.pg.blocks[0].rzStart(fakeE(0, 0)); r.pg.blocks[0].rzMove(fakeE(590, 0)); r.pg.blocks[0].rzEnd(fakeE(600, 0)); R('resize'); log('Ancho tras arrastrar:', r.pg.blocks[0].cls, r.pg.blocks[0].wLabel);
r.pg.toggleCover(); R('cover'); r.pg.coverGrads[3].pick(); R('grad'); r.pg.coverColors[1].pick(); R('color'); r.pg.coverPos(); R('pos'); r.pg.coverRemove(); R('rm'); log('Sin portada:', r.pg.noCover, r.pg.canAddCover); r.pg.addCover(); R('add'); log('Portada:', r.pg.coverStyle.slice(0, 50));
r.pg.toggleArea(); R('area'); r.pg.areaOpts[2].pick(); R('area pick'); log('Área página:', r.pg.areaName);
r.goOrg(); R('org'); log('Org:', r.org.stats, '| nodos:', r.org.boxes.map(b => b.name + ' (' + b.person + ')').join(', '), '| enlaces', r.org.links.length);
r.org.boxes.find(b => b.vacant).pick(); R('sel'); log('Panel:', r.org.panel.name, '·', r.org.panel.boss, '| páginas:', r.org.panel.pages.map(p => p.name).join(','));
r.org.panel.people.find(p => p.name === 'Carla Mendoza').pick(); R('asignar'); r.org.panel.rename({ target: { value: 'Analista de proyectos (PMO)' } }); R('ren');
r.org.panel.addChild(); R('hijo'); r.org.panel.areaOpts[1].pick(); R('area cargo'); r.org.panel.del(); R('conf'); r.org.panel.del(); R('del'); log('Cargos:', c.st().org.cargos.length);
r.org.areas[3].pick(); R('area sel'); r.org.ap.colors[2].pick(); R('c'); r.org.ap.icons[3].pick(); R('i'); r.org.ap.rename({ target: { value: 'Operaciones' } }); R('ren area'); r.org.ap.newPage(); R('pagina de area'); log('Nueva página del área:', r.pg.areaName);
r.goOrg(); R('org2'); r.org.addArea(); R('nueva area'); r.org.addRoot(); R('nuevo cargo');
c.previewAs('luis'); c.goPage('pgme'); R('luis'); log('Luis ve:', r.sideGeneral.map(p => p.name).join(','), '|', r.sideAreas.map(a => a.name + ': ' + a.pages.map(p => p.name).join('/')).join(' || '), '| recs:', blk('m4').pm.issues.length);
c.previewAs('jorge'); R('jorge'); log('Jorge ve áreas:', r.sideAreas.map(a => a.name).join(','), '| recs:', blk('m4').pm.issues.map(i => i.title).join(' / '));
c.previewAs('carla'); R('carla'); log('Carla ve áreas:', r.sideAreas.map(a => a.name).join(','));
/* ---------- v4b: organigrama trazable, solicitudes, planilla, exportar ---------- */
c.previewAs('ana'); r = c.renderVals(); r.goOrg(); R('org b');
log('Nodos con carga:', r.org.boxes.map(b => b.name + ' [' + b.load + (b.hasAlerts ? ' · ' + b.alerts + ' alertas' : '') + ']').join(' | '));
c.orgSel('c5'); R('sel jorge'); log('Ficha Jorge:', r.org.panel.load, '|', r.org.panel.ficha.map(f => f.label + ': ' + f.value).join(' · '), '| pendientes:', r.org.panel.items.length);
r.org.panel.items[0].open(); R('abrir pendiente'); log('Abierto:', r.rec.titleText); r.closeRec(); R('x');
const fk = (x) => ({ preventDefault() { }, clientX: x, dataTransfer: { setData() { } }, currentTarget: { getBoundingClientRect: () => ({ left: 0, width: 200 }), classList: { toggle() { }, remove() { }, add() { } } } });
let nodeOf = id => r.org.boxes.find(b => b.id === id);
nodeOf('c4').dragStart(fk(0)); nodeOf('c5').dragOver(fk(100)); nodeOf('c5').drop(fk(100)); R('drag hijo'); log('Ejecutivo reporta a:', c.st().org.cargos.find(x => x.id === 'c4').parent, '|', c.st().toast);
nodeOf('c1').dragStart(fk(0)); nodeOf('c6').drop(fk(100)); R('ciclo'); log('Ciclo bloqueado:', c.st().toast);
nodeOf('c6').dragStart(fk(0)); nodeOf('c3').drop(fk(10)); R('hermano'); log('Asistente junto a Jefa comercial, padre:', c.st().org.cargos.find(x => x.id === 'c6').parent);
nodeOf('c7').dragStart(fk(0)); r.org.areas[3].drop(fk(0)); R('area'); log('Área de analista:', c.st().org.cargos.find(x => x.id === 'c7').area);
c.setState({ orgSel: 'c5' }); R('s'); r.org.panel.people.find(p => p.name === 'Luis Ramírez').pick(); R('reasignar'); log('Modal:', r.org.ra.title, '|', r.org.ra.items.map(x => x.what + ': ' + x.label).join(' / '));
r.org.ra.items[0].toggle(); R('t'); log('Botón:', r.org.ra.applyLabel); r.org.ra.none(); R('n'); r.org.ra.all(); R('a'); r.org.ra.apply(); R('apply');
log('Tareas de Luis ahora:', c.st().tables.byId.tar.rows.filter(x => (x.responsable || []).includes('luis') && x.estado !== 'Hecha').map(x => x.nombre).join(', '), '| Personal Luis cargo:', c.st().tables.byId.per.rows.find(x => x.id === 'w5').cargo);
c.setState({ orgSel: 'c5' }); R('s2'); log('Historial:', r.org.panel.hist.map(h => h.text).join(' | '));
const files = {}; c.download = (n, m, d) => { files[n] = d; fs.writeFileSync('/tmp/' + n, Buffer.from(d instanceof Uint8Array ? d : String(d))); };
r.org.exPptx(); r.org.exPdf(); r.org.exSvg(); log('Exportados:', Object.keys(files).join(', '));
// solicitudes
c.previewAs('luis'); c.goPage('pgme'); R('luis tablero');
const nid0 = c.newRow('sol', null, true); c.openRec('sol', nid0); R('nueva sol'); log('Nueva solicitud de Luis:', r.rec.tname, '| pasos:', r.rec.sol.steps.map(x => x.label + ' ' + x.who + ' ' + x.txt).join(' / '), '| puede aprobar:', r.rec.sol.canAct);
const nid = c.st().rec.id; r.closeRec(); R('x');
c.previewAs('jorge'); R('jorge'); c.openRec('sol', nid); R('jorge abre'); log('Jorge (nuevo jefe de Luis) puede aprobar:', r.rec.sol.canAct); if (r.rec.sol.canAct) { r.rec.sol.approve(); R('aprueba jefe'); }
log('Tras jefe:', r.rec.sol.steps.map(x => x.txt).join(' / '), '|', c.st().tables.byId.sol.rows.find(x => x.id === nid).estado);
c.previewAs('ana'); c.goPage('pgme'); R('ana'); log('Por aprobar de Ana:', blk('m7').dv.tgroups[0].rows.length);
c.openRec('sol', nid); R('ana abre'); r.rec.sol.approve(); R('aprueba admin'); log('Final:', c.st().tables.byId.sol.rows.find(x => x.id === nid).estado, '|', r.rec.sol.hist.map(h => h.text).join(' / '));
c.openRec('sol', 's3'); R('s3'); log('Override admin:', r.rec.sol.hasOverride); r.rec.sol.reject(); R('rechazo'); r.closeRec(); R('x');
c.goPage('pg5'); R('planilla'); log('Planilla KPIs:', ['f1', 'f2', 'f3', 'f4'].map(id => blk(id).title + '=' + blk(id).kpi.value).join(' | '));
c.previewAs('luis'); c.goPage('pg4'); R('luis pg4'); c.previewAs('ana');
/* ---------- v4c: escritura tipo Notion ---------- */
c.previewAs('ana'); r = c.renderVals(); r.newPage(); R('pagina doc');
const pidD = c.st().page; let docB = () => r.pg.blocks.filter(b => b.isDoc);
const kev = (key, val, pos) => ({ key, shiftKey: false, preventDefault() { }, target: { value: val, selectionStart: pos == null ? val.length : pos, selectionEnd: pos == null ? val.length : pos } });
docB()[0].setText({ target: { value: '# Plan de la semana' } }); R('h1'); log('H1:', docB()[0].docCls, '|', docB()[0].text);
docB()[0].key(kev('Enter', 'Plan de la semana')); R('enter'); log('Bloques doc:', docB().map(b => b.docCls).join(','));
docB()[1].setText({ target: { value: '- ' } }); R('bullet'); docB()[1].setText({ target: { value: 'Revisar avance' } }); R('t'); docB()[1].key(kev('Enter', 'Revisar avance')); R('enter2');
docB()[2].setText({ target: { value: 'Coordinar con @Jor' } }); R('mention'); log('Menciones sugeridas:', docB()[2].men.map(x => x.label + ' (' + x.sub + ')').join(', '));
docB()[2].men[0].pick(); R('pick'); log('Texto con mención:', docB()[2].text, '| chips:', docB()[2].mentions.map(m => m.label).join(','), '| aviso para jorge:', c.st().notifs[0].text);
docB()[2].key(kev('Enter', docB()[2].text)); R('enter3'); docB()[3].key(kev('Enter', '')); R('salir de lista'); log('Tras Enter vacío:', docB().map(b => b.docCls).join(','));
docB()[3].setText({ target: { value: '[] Enviar informe' } }); R('check'); docB()[3].toggleDone(); R('done'); docB()[3].key(kev('Enter', 'Enviar informe')); R('e');
docB()[4].key(kev('Enter', '')); R('exit check'); docB()[4].setText({ target: { value: '1. Primero' } }); R('num'); docB()[4].key(kev('Enter', 'Primero')); R('e'); docB()[5].setText({ target: { value: 'Segundo' } }); R('t'); log('Numeración:', docB().filter(b => b.isNumber).map(b => b.num).join(' '));
docB()[5].key(kev('Enter', 'Segundo')); R('e'); docB()[6].key(kev('Enter', '')); R('fin lista'); docB()[6].setText({ target: { value: '> Cita importante' } }); R('quote'); docB()[6].key(kev('Enter', 'Cita importante')); R('e');
docB()[7].setText({ target: { value: 'Dividir aquí' } }); R('t'); docB()[7].key(kev('Enter', 'Dividir aquí', 7)); R('split'); log('Partido:', docB()[7].text, '|', docB()[8].text);
docB()[8].setText({ target: { value: 'Ver @Montaje' } }); R('m2'); docB()[8].men.find(x => x.label === 'Montaje de racks').pick(); R('pick rec');
docB()[7].setText({ target: { value: '' } }); R('v'); const nBefore = r.pg.blocks.length; docB()[7].key(kev('Backspace', '', 0)); R('bksp'); log('Backspace borra bloque vacío:', nBefore, '→', r.pg.blocks.length);
docB()[1].key(kev('Backspace', 'Revisar avance', 0)); R('bksp lista'); log('Viñeta a texto:', docB()[1].docCls);
docB()[0].setText({ target: { value: 'Plan de la semana' } }); R('t'); docB().slice(-1)[0].setText({ target: { value: '---' } }); R('hr'); log('Separador:', r.pg.blocks.map(b => b.typeName).slice(-3).join(','));
docB().slice(-1)[0].setText({ target: { value: '/tabla nu' } }); R('slash doc'); docB().slice(-1)[0].key(kev('Enter', '/tabla nu')); R('slash enter'); log('Último:', r.pg.blocks.slice(-1)[0].typeName);
c.openRec('tar', 't4'); R('rec'); log('Mencionado en:', r.rec.backlinks.map(x => x.name).join(',')); r.rec.backlinks[0].go(); R('go'); r.closeRec(); R('x');
r.inbox.length && c.previewAs('jorge'); R('jorge'); log('Avisos de Jorge:', r.inbox.slice(0, 1).map(n => n.text).join('')); r.inbox[0].open(); R('abre aviso'); log('Página abierta:', r.pg.titleText); c.previewAs('ana');
c.previewAs('ana'); c.goPage('pg1'); R('panel inicio');
log('Bases:', r.sideDbs.map(d => d.name + '(' + d.count + ')').join(', '));
log('KPIs:', ['b2', 'b3', 'b4', 'b5'].map(id => blk(id).title + '=' + blk(id).kpi.value).join(' | '));
log('Columnas vendedor:', blk('b8').ch.bars.map(b => b.label + ':' + b.valueText).join(', '));
log('Anillo estado:', blk('b9').ch.bars.map(b => b.label + ':' + b.valueText + ' ' + b.share).join(', '), '| total', blk('b9').ch.total);
log('Línea fechas puntos:', blk('b10').ch.ldots.length, '| grid', blk('b10').ch.lgrid.map(g => g.label).join('/'));
log('Top clientes:', blk('b11').ch.bars.map(b => b.label + ':' + b.valueText).join(', '));
log('Slicer ciudad:', blk('b7').sl.opts.map(o => o.label + '(' + o.count + ')').join(', '));
log('Tabla bloque filas:', blk('b13').dv.tgroups[0].rows.length);
// filtro cruzado desde gráfico
blk('b8').ch.bars[0].pick(); R('xf vendedor');
log('Filtro:', r.pg.xfLabel, '|', r.pg.xfHint, '| KPI ventas:', blk('b2').kpi.value, blk('b2').xfTag, '| tabla filas:', blk('b13').dv.tgroups[0].rows.length, '| barras:', blk('b8').ch.bars.map(b => b.cls || '-').join(','));
log('Slicer ciudad tras filtro:', blk('b7').sl.opts.map(o => o.label + '(' + o.count + ')').join(', '), '| tag', blk('b7').xfTag);
blk('b8').ch.bars[0].pick(); R('xf quitar por toggle'); log('Filtro activo:', r.pg.hasXf);
// segmentación por ciudad (otra tabla, viaja por relación)
blk('b7').sl.opts[0].pick(); R('xf ciudad');
log('Filtro ciudad:', r.pg.xfLabel, '| KPI pedidos:', blk('b3').kpi.value, '| tabla:', blk('b13').dv.tgroups[0].rows.length, '| nota tabla:', blk('b13').dv.xfText);
blk('b9').ch.bars[0].pick(); R('xf anillo'); log('Filtro anillo:', r.pg.xfLabel, '| segs:', blk('b9').ch.segs.map(s => s.cls || '-').join(','));
blk('b10').ch.ldots[0].pick(); R('xf linea'); log('Filtro línea:', r.pg.xfLabel, '| ventas:', blk('b2').kpi.value);
r.pg.clearXf(); R('xf limpiar');
// herramientas de bloque
blk('b8').cycleW(); R('ancho'); log('Ancho b8:', blk('b8').cls);
blk('b8').down(); R('bajar'); blk('b8').up(); R('subir');
blk('b8').config(); R('config grafico'); log('Drawer:', r.dTitle, '| tipos:', r.bk.kindSeg.map(k => k.label).join(','), '| origen:', r.bk.srcRadio.map(x => x.label).join(','));
r.bk.kindSeg[1].pick(); R('a barras'); r.bk.byRadio.find(x => x.label === 'Estado').pick(); R('por estado');
r.bk.aggSeg.find(x => x.label === 'Promedio').pick(); R('promedio'); log('Barras promedio por estado:', blk('b8').ch.bars.map(b => b.label + ':' + b.valueText).join(', '));
r.bk.topSeg[1].pick(); R('top5'); r.bk.sortSeg[2].pick(); R('por etiqueta');
r.brl.toggleRuleAdd(); R('add filtro bloque'); r.brl.ruleProps.find(x => x.name === 'Pagado').pick(); R('filtro pagado'); log('Filtro bloque:', r.brl.rulesV.map(x => x.propName + ' ' + x.ops.find(o => o.cls === 'on').label).join(','));
r.brl.rulesV[0].remove(); R('quitar filtro bloque');
r.bk.setTitle({ target: { value: 'Ticket medio por estado' } }); R('titulo');
r.bk.srcRadio.find(x => x.label === 'Productos').pick(); R('origen productos'); log('Gráfico productos:', blk('b8').ch.sub, '|', blk('b8').ch.bars.length, 'barras');
r.bk.kindSeg[2].pick(); R('linea'); log('Línea productos por:', blk('b8').ch.sub);
r.bk.kindSeg[3].pick(); R('anillo');
r.bk.widthSeg[4].pick(); R('ancho completo');
r.closeDrawer(); R('cerrar drawer');
blk('b2').config(); R('cfg kpi'); r.bk.aggSeg.find(x => x.label === 'Máximo').pick(); R('kpi max'); log('KPI máx:', blk('b2').kpi.value, blk('b2').kpi.caption);
r.bk.aggSeg[0].pick(); R('kpi contar'); r.closeDrawer(); R('x');
blk('b6').config(); R('cfg slicer'); r.bk.propRadio.find(x => x.label === 'Prioridad').pick(); R('slicer prioridad'); log('Slicer prioridad:', blk('b6').sl.opts.map(o => o.label).join(','));
r.closeDrawer(); R('x');
blk('b1').setText({ target: { value: 'Nota editada' } }); R('texto');
// añadir bloques
r.pg.toggleAdd(); R('menu añadir'); log('Añadir:', r.pg.addGroups.map(g => g.title + ': ' + g.items.map(i => i.name).join('/')).join(' || '));
for (const name of ['Indicador (KPI)', 'Gráfico de columnas', 'Gráfico de barras', 'Gráfico de línea', 'Gráfico de anillo', 'Segmentación', 'Hoja de cálculo', 'Mapa de relaciones', 'Encabezado', 'Texto', 'Separador']) {
  r = c.renderVals(); r.pg.toggleAdd(); r = c.renderVals(); const it = r.pg.addGroups.flatMap(g => g.items).find(i => i.name === name); it.pick(); R('añadir ' + name); r.closeDrawer && r.drawerOpen && r.closeDrawer(); R('x ' + name);
}
r.pg.toggleAdd(); R('m'); r.pg.addGroups[0].items[0].pick(); R('elegir tabla'); log('Tablas para bloque:', r.pg.addTables.map(t => t.name).join(', ')); r.pg.addTables[2].pick(); R('bloque productos');
r.pg.toggleAdd(); R('m2'); r.pg.addGroups[0].items[1].pick(); R('nueva tabla en página'); log('Bloques en página:', r.pg.blocks.length, '| última:', r.pg.blocks.slice(-1)[0].dv.name, '| toast:', c.st().toast);
const nb = r.pg.blocks.slice(-1)[0]; nb.dv.openRelate(); R('relacionar'); log('Drawer relacionar:', r.dTitle, r.newPropSearch, '| rel rápida:', r.relQuick.map(x => x.name).join(','));
r.relQuick[0].pick(); R('relación creada'); r.closeDrawer(); R('x');
// borrar un bloque (doble clic)
const last = r.pg.blocks.slice(-1)[0]; last.del(); R('conf borrar'); r.pg.blocks.slice(-1)[0].del(); R('borrado'); log('Bloques tras borrar:', r.pg.blocks.length);

// tabla dentro de la página: celda tipo Excel, menú de columna, registro con trazabilidad
const dvb = () => blk('b13').dv;
dvb().tgroups[0].rows[0].cells.find(x => x.aria && x.aria.indexOf('Editar Total') === 0).select(); R('celda'); log('Barra de celda:', dvb().cb.prop, '·', dvb().cb.rowTitle, '| campos:', dvb().cb.fields.length);
dvb().cb.fields[0].onChange({ target: { value: '9999' } }); R('editar celda'); log('Total editado:', c.st().tables.byId.ped.rows[0].total);
dvb().tgroups[0].rows[0].cells.find(x => !x.isTitle && x.d && x.d.text && /%|S\//.test(x.d.text) && x.aria.indexOf('Ganancia') >= 0) && dvb().tgroups[0].rows[0].cells.find(x => x.aria && x.aria.indexOf('Ganancia') >= 0).select(); R('celda formula'); log('Celda fórmula:', dvb().cb.isFormula, dvb().cb.formula);
dvb().cb.close(); R('cerrar celda');
dvb().headCols[1].menu(); R('menu col'); dvb().hm.wrap(); R('wrap'); dvb().hm.widthOpts[2].pick(); R('ancha'); log('Cabecera menú:', dvb().hm.name, dvb().hm.wrapOn); dvb().hm.close(); R('x');
dvb().viewTabs[1].pick(); R('tablero en bloque'); log('Vista bloque:', dvb().isBoard, dvb().board.map(b => b.label + ':' + b.cards.length).join(','));
dvb().viewTabs[0].pick(); R('tabla');
dvb().tgroups[0].rows[0].cells[0].open(); R('abrir registro'); log('Registro:', r.rec.titleText, '| tabla:', r.rec.tname, '| traza:', r.rec.trace.map(t => t.name + ': ' + t.items.map(i => i.title + (i.subs.length ? ' → ' + i.subs.map(s => s.name + ' ' + s.chips.map(x => x.title).join('/')).join(';') : '')).join(', ')).join(' || '));
r.rec.trace[0].items[0].open(); R('abrir traza'); log('Registro abierto desde traza:', r.rec.titleText, '(' + r.rec.tname + ')');
r.toggleRecFull(); R('rec full'); log('Modo:', r.recMode); r.closeRec(); R('cerrar');

/* ---------- página 2: hoja de cálculo ---------- */
c.goPage('pg2'); R('operaciones');
const sh = () => blk('c9').sh;
log('Hoja:', sh().rows.slice(0, 8).map(rw => rw.cells.slice(0, 5).map(x => x.text).join(' | ')).join('\n      '));
sh().rows[1].cells[1].pick(); R('sel B2'); log('B2:', sh().raw, '→', sh().result);
sh().rows[9].cells[0].pick(); R('sel A10'); sh().setRaw({ target: { value: '=SUMA(B2:B3)' } }); R('fórmula A10'); log('A10:', sh().result);
sh().fns.find(f => f.label === 'PROMEDIO').pick(); R('insertar fn'); log('A10 tras insertar:', sh().raw, '|', sh().result);
sh().setRaw({ target: { value: '=A11' } }); R('ref'); sh().rows[10].cells[0].pick(); R('A11'); sh().setRaw({ target: { value: '=A10' } }); R('circular'); log('Circular:', sh().result);
sh().setRaw({ target: { value: '=SUMAR.SI(Pedidos[Estado]; "Pendiente"; Pedidos[Total])' } }); R('sumar.si'); log('SUMAR.SI pendientes:', sh().result);
sh().refs[0].pick(); R('ref tabla');
blk('c9').config(); R('cfg hoja'); r.bk.colsSeg[2].pick(); R('8 cols'); r.bk.rowsSeg[2].pick(); R('20 filas'); log('Hoja tamaño:', sh().cols.length, 'x', sh().rows.length); r.closeDrawer(); R('x');
blk('c4').sl.opts[0].pick(); R('xf proveedor'); log('Filtro proveedor:', r.pg.xfLabel, '| productos:', blk('c5').dv.tgroups[0].rows.length, '| KPI reponer:', blk('c1').kpi.value);
r.pg.clearXf(); R('x');

/* ---------- página 3: mapa ---------- */
c.goPage('pg3'); R('mapa');
const mp = blk('d2').mp; log('Mapa:', mp.boxes.map(b => b.name).join(', '), '| enlaces:', mp.links.map(l => l.l1 + '-' + l.l2).join(', '));
mp.boxes[1].rows.find(x => x.isRel).pick(); R('resaltar'); log('Resaltado:', blk('d2').mp.links.filter(l => l.cls).length);
blk('d2').mp.boxes[0].open(); R('abrir tabla desde mapa'); log('Pantalla:', r.scrDb, r.db.name);

/* ---------- base de datos a pantalla completa ---------- */
c.go('ped', null); R('pedidos');
const dv = () => r.db.dv;
log('Pedidos columnas:', dv().headCols.map(h => h.label).join(', '));
log('Fila 1:', dv().tgroups[0].rows[0].cells.map(cellTxt).join(' | '));
dv().openFilter(); R('filtro'); r.rl.toggleRuleAdd(); R('props'); r.rl.ruleProps.find(x => x.name === 'Estado').pick(); R('estado'); r.rl.rulesV[0].choices[0].pick(); R('pendiente');
log('Filas Pendiente:', dv().tgroups[0].rows.length, '| chips:', dv().activeChips.map(x => x.label).join(' / '));
dv().clearFilters(); R('limpiar');
dv().openSettings(); R('root'); log('Raíz:', r.rootGroups.map(g => g.rows.map(x => x.label).join(' · ')).join(' || '));
r.rootGroups[0].rows[0].go(); R('diseño');
for (const l of ['Tablero', 'Lista', 'Galería', 'Calendario', 'Gráfico', 'Formulario', 'Tabla']) { r.layOpts.find(x => x.name === l).pick(); R('layout ' + l); }
r.layOpts.find(x => x.name === 'Gráfico').pick(); R('g'); r.chartKindSeg[3].pick(); R('anillo vista'); log('Vista gráfico anillo:', dv().chart.showDonut, dv().chart.bars.length);
r.chartByRadio.find(x => x.label === 'Fecha').pick(); R('por fecha'); r.bucketSeg[2].pick(); R('mes'); r.chartKindSeg[2].pick(); R('linea'); log('Vista gráfico línea por mes:', dv().chart.sub, dv().chart.ldots.length);
r.layOpts.find(x => x.name === 'Tabla').pick(); R('tabla');
r.closeDrawer(); R('x');
for (let i = 0; i < dv().viewTabs.length; i++) { dv().viewTabs[i].pick(); R('vista ' + i); }
dv().viewTabs[0].pick(); R('v0');

// configuración por tipo de columna
const ed = key => { c.openDrawer('propEdit', { dCtx: { tid: c.st().table, vid: null, where: 'scr' }, dProp: key }); R('editar ' + key); };
ed('total'); log('Número fmt:', r.pe.fmtOpts.map(x => x.label).join(','), '|', r.pe.example);
r.pe.fmtOpts.find(x => x.label.indexOf('Dólares') === 0).pick(); R('usd'); r.pe.decSeg[3].pick(); R('2 dec'); r.pe.toggleSep(); R('sin sep'); log('Ejemplo:', r.pe.example);
r.pe.showSeg[1].pick(); R('barra'); r.pe.setMax({ target: { value: '20000' } }); R('max'); log('Celda barra:', dv().tgroups[0].rows[0].cells.find(x => x.aria && x.aria.indexOf('Editar Total') === 0).d.kBar);
r.pe.showSeg[2].pick(); R('anillo'); r.pe.showSeg[0].pick(); R('numero'); r.pe.fmtOpts[1].pick(); R('soles'); r.pe.toggleSep(); R('sep');
r.pe.setDesc({ target: { value: 'Importe con IGV' } }); R('desc'); r.pe.toggleReq(); R('req'); r.pe.widthSeg[2].pick(); R('ancho'); r.pe.toggleWrap(); R('wrap');
ed('entrega'); r.pe.dateSeg.find(x => x.label.indexOf('Relativa') === 0).pick(); R('relativa'); r.pe.defDateSeg[1].pick(); R('hoy'); log('Fecha relativa:', dv().tgroups[0].rows[0].cells.find(x => x.aria && x.aria.indexOf('Editar Entrega') === 0).d.text);
ed('pagado'); r.pe.checkSeg[1].pick(); R('interruptor'); r.pe.toggleDefCheck(); R('def'); log('Casilla estilo:', dv().tgroups[0].rows[0].cells.find(x => x.aria && x.aria.indexOf('Editar Pagado') === 0).d.checkCls);
ed('prioridad'); r.pe.sortAZ(); R('az'); r.pe.opts[1].up(); R('up'); r.pe.defOpts[1].pick(); R('def opt'); log('Prioridad opciones:', r.pe.opts.map(o => o.v).join(','), '| def:', c.st().tables.byId.ped.props.find(p => p.key === 'prioridad').def);
ed('cliente'); log('Relación:', r.pe.relTarget, '|', r.pe.relPair); r.pe.toggleSingle(); R('single');
ed('ganancia'); log('Fórmula:', r.pe.expr, '|', r.pe.preview);
r.pe.setExpr({ target: { value: '=SI([Total] > 5000; "Grande"; "Normal")' } }); R('excel si'); log('Preview SI:', r.pe.preview);
r.pe.setExpr({ target: { value: '=REDONDEAR([Total] * [Margen] / 100; 0)' } }); R('excel redondear'); r.pe.resSeg.find(x => x.label.indexOf('Soles') === 0).pick(); R('res soles'); log('Preview soles:', r.pe.preview);
r.pe.insertFns[0].pick(); R('ins fn'); r.pe.setExpr({ target: { value: '=[Total] * ' } }); R('mal'); log('Error:', r.pe.preview, r.pe.previewErr);
r.pe.setExpr({ target: { value: '=REDONDEAR([Total] * [Margen] / 100; 0)' } }); R('ok');
r.pe.insertProps[0].pick(); R('ins prop'); r.pe.setExpr({ target: { value: '=REDONDEAR([Total] * [Margen] / 100; 0)' } }); R('ok2');
c.setState({ table: 'cli' }); c.go('cli', null); R('clientes'); ed('entregado'); log('Clientes.entregado:', r.pe.expr, '|', r.pe.preview);
ed('segmento'); log('Segmento:', r.pe.expr, '|', r.pe.preview);
ed('ciudad'); r.pe.toggleType(); R('tipos'); r.pe.typeList.find(x => x.name === 'Texto').pick(); R('a texto'); r = c.renderVals(); r.pe.toggleType(); r = c.renderVals(); r.pe.typeList.find(x => x.name === 'Seleccionar').pick(); R('a select');
c.go('ped', null); R('ped');
// crear todos los tipos
dv().openNewProp(); R('nueva');
const typeNames = r.typesV.map(x => x.name);
for (const tn of typeNames) { r = c.renderVals(); r.db.dv.openNewProp(); r = c.renderVals(); r.typesV.find(x => x.name === tn).pick(); R('crear ' + tn); if (r.dp_propEdit !== true) issues.push('no abre editor tras crear ' + tn); }
log('Tipos creados:', typeNames.length, '| columnas pedidos:', c.st().tables.byId.ped.props.length);
c.openDrawer('more', { dCtx: { tid: 'ped', vid: null, where: 'scr' } }); R('más'); r.dbIcons[3].pick(); R('icono db'); r.dbColors[2].pick(); R('color'); log('Icono pedidos:', c.st().tables.byId.ped.icon);
c.openDrawer('automations', { dCtx: { tid: 'ped', vid: null, where: 'scr' } }); R('autos'); r.newAuto(); R('nueva auto'); r.actSeg[1].pick(); R('set');
r.closeDrawer(); R('x');
r.db.toggleIcon(); R('picker db'); r.db.iconOpts[5].pick(); R('icono'); r.db.toggleIcon(); R('cerrar picker');

/* ---------- páginas nuevas ---------- */
r.newPage(); R('nueva página'); log('Página nueva:', r.pg.titleText, '| abre añadir:', r.pg.addOpen);
r.pg.setTitle({ target: { value: 'Compras 2026' } }); R('titulo'); r.pg.toggleIcon(); R('icono'); r.pg.iconOpts[10].pick(); R('pick'); r.pg.colorOpts[3].pick(); R('color');
r.pg.addGroups[0].items[1].pick(); R('nueva tabla'); r.pg.toggleAdd(); R('add'); r.pg.addGroups[1].items[1].pick(); R('grafico'); r.closeDrawer(); R('x');
log('Página nueva bloques:', r.pg.blocks.map(b => b.typeName).join(', '));
r.pg.delPage(); R('conf'); r.pg.delPage(); R('borrar página'); log('Páginas:', r.sideGeneral.concat(...r.sideAreas.map(a => a.pages)).map(p => p.name).join(', '));

/* ---------- roles (maqueta) ---------- */
c.goPage('pg1'); R('pg1');
r.previewLuis(); R('luis'); log('Luis bloques bloqueados:', r.pg.blocks.filter(b => b.isLocked).length, '| KPI ventas:', blk('b2') ? blk('b2').kpi.value : 'sin acceso a la página');
c.previewAs('carla'); R('carla'); log('Carla puede editar página:', r.pg.canEdit, '| bloqueados:', r.pg.blocks.filter(b => b.isLocked).length);
c.previewAs('ana'); R('ana');
r.goPerm(); R('permisos'); for (let i = 0; i < 4; i++) { r.permTabs[i].pick(); R('tab ' + i); }
r.goAi(); R('ia'); r.aiSugs[0].pick(); R('sug'); r.aiCreate(); R('creado'); log('Tablas:', c.st().tables.order.map(id => c.st().tables.byId[id].name).join(', '));
for (const id of c.st().tables.order) { c.go(id, null); R('tabla ' + id); }
r.goInbox(); R('avisos'); r.goTheme(); R('tema'); r.modeOpts[1].pick(); R('oscuro'); c.goPage('pg1'); R('pg1 oscuro');
r.toggleNav(); R('nav');

/* ---------- v4d: formularios, app móvil, plantillas, listas vinculadas ---------- */
c.previewAs('ana'); R('ana d');
r.goForms(); R('formularios'); log('Form sel:', r.fb.fm.name, '| items:', r.fb.fm.items.length, '| stats:', r.fb.fm.stats);
log('Preview secciones:', r.fb.prev.sections.map(x => x.title + '(' + x.fields.length + ')').join(', '), '| foto:', r.fb.prev.hasPhoto, '| gps:', r.fb.prev.hasGps);
r.fb.prev.submit(); R('prev submit vacío'); log('Errores prev:', r.fb.prev.hasErr, r.fb.prev.errText, '| filas con error:', r.fb.prev.sections.flatMap(x => x.fields).filter(f => /f-err/.test(f.rowCls)).map(f => f.label).join(' / '));
// condicional: incidente
let fInc = () => r.fb.prev.sections.flatMap(x => x.fields).find(f => /incidente\?/.test(f.label));
log('Campos antes de incidente:', r.fb.prev.sections.flatMap(x => x.fields).length); fInc().toggle(); R('inc on'); log('Campos con incidente:', r.fb.prev.sections.flatMap(x => x.fields).length);
// editar pregunta, condición, mover, sección, auto
const it3 = r.fb.fm.items.find(x => x.isField && x.propName === 'Clima'); it3.toggleReq(); R('req'); it3.setHelp({ target: { value: 'Mira al cielo' } }); R('help');
r = c.renderVals(); let itc = r.fb.fm.items.find(x => x.isField && x.propName === 'Clima'); itc.addCond(); R('cond'); itc = r.fb.fm.items.find(x => x.isField && x.propName === 'Clima'); log('Cond clima:', itc.condTxt, '| keys:', itc.condKeys.map(k => k.label).join(','), '| vals:', itc.condVals.map(k => k.label).join(','));
itc.setCondVal({ target: { value: 'Tarde' } }); R('cond val'); itc = r.fb.fm.items.find(x => x.isField && x.propName === 'Clima'); log('Cond clima 2:', itc.condTxt); itc.clearCond(); R('clear cond');
r.fb.fm.items[2].down(); R('down'); r.fb.fm.items[3].up(); R('up');
r.fb.fm.items[1].dragStart({ dataTransfer: { setData() {} } }); R('drag'); r.fb.fm.items[4].dragOver({ preventDefault() {} }); R('over'); log('Drag cls:', r.fb.fm.items[4].cls); r.fb.fm.items[4].drop({ preventDefault() {} }); R('drop');
r.fb.fm.addSection(); R('sec'); r.fb.fm.toggleAdd(); R('add'); log('Addable:', r.fb.fm.addable.map(a => a.name).join(', ')); r.fb.fm.addable.find(a => a.name === 'Horas hombre').pick(); R('pick add');
r.fb.fm.autos[0].toggle(); R('gps off'); log('Autos:', r.fb.fm.autos.map(a => a.label + '=' + a.on).join(' | ')); r = c.renderVals(); r.fb.fm.autos[0].toggle(); R('gps on');
r.fb.groups.find(g => g.tname === 'Solicitudes').forms[0].pick(); R('form sol'); log('Sol form:', r.fb.fm.name, '| cond:', r.fb.fm.items.filter(i => i.hasCond).map(i => i.condTxt).join(' / '));
r.fb.groups.find(g => g.tname === 'Riesgos').forms[0].pick(); R('form rie'); log('Rie pub:', r.fb.fm.pubTxt);
r.fb.toggleNew(); R('nuevo'); r.fb.newTables.find(x => x.name === 'Clientes').pick(); R('nuevo cli'); log('Nuevo form:', r.fb.fm.name, '| autos:', r.fb.fm.autos.map(a => a.on).join(','), '| items:', r.fb.fm.items.map(i => i.propName).join(','));
r.fb.fm.setName({ target: { value: 'Registro de visita' } }); R('nombre'); r.fb.fm.togglePub(); R('pub'); r.fb.fm.del(); R('del');
// app móvil como Jorge
c.previewAs('jorge'); R('jorge'); r.goMob(); R('movil'); log('Móvil inicio:', r.mob.hello, '| tareas:', r.mob.tasks.length, '| quick:', r.mob.quick.map(q => q.name).join(', '), '| aprob:', r.mob.approvals.length);
log('Jorge tar:', c.st().tables.byId.tar.rows.filter(x => (x.responsable||[]).includes('jorge')).map(x => x.nombre + ':' + x.estado).join(' / '));
r.mob.quick[0].go(); R('llenar parte'); log('Fill:', r.mob.fill.title, '| secciones:', r.mob.fill.sections.length, '| autos:', r.mob.fill.autos.map(a => a.text).join(', '));
r.mob.fill.submit(); R('submit vacío'); log('Err móvil:', r.mob.fill.errText);
const F = () => r.mob.fill.sections.flatMap(x => x.fields);
F().find(f => /Proyecto/.test(f.label)).togglePicker(); R('picker'); F().find(f => /Proyecto/.test(f.label)).pick[0].toggle(); R('proy');
F().find(f => /Turno/.test(f.label)).options[0].pick(); R('turno'); F().find(f => /Clima/.test(f.label)).options[1].pick(); R('clima');
F().find(f => /Avance/.test(f.label)).onChange({ target: { value: '4' } }); R('avance');
F().find(f => /Personal/.test(f.label)).onChange({ target: { value: '12' } }); R('pers');
F().find(f => /incidente\?/.test(f.label)).toggle(); R('inc');
F().find(f => /Tipo de incidente/.test(f.label)).options[1].pick(); R('tinc');
F().find(f => /Gravedad/.test(f.label)).options[2].pick(); R('grav');
F().find(f => /Descripción/.test(f.label)).onChange({ target: { value: 'Caída de material desde andamio' } }); R('desc');
r.mob.fill.captureGps(); R('gps'); log('GPS:', r.mob.fill.gpsText);
r.mob.fill.addPhoto({ target: { files: [{ name: 'andamio.jpg' }], value: 'x' } }); R('foto'); log('Fotos:', r.mob.fill.photos.map(p => p.name).join(','));
r.mob.fill.submit(); R('enviar'); if (r.mob.fill) log('Aún falta:', r.mob.fill.errText, F().filter(f => /f-err/.test(f.rowCls)).map(f => f.label).join(',')); log('Done:', r.mob.doneTitle, '|', r.mob.doneMsg);
const pdT = c.st().tables.byId.pd; const nr = pdT.rows[pdT.rows.length - 1];
log('Nuevo parte:', nr.titulo, '| resp:', nr.resp, '| fecha:', nr.fecha, '| gps:', nr.ubicacion, '| fotos:', nr.fotos, '| origen:', nr.origen, '| form:', nr._form, '| proy.partes:', c.st().tables.byId.proy.rows.find(x => x.id === nr.proyecto[0]).partes);
log('Aviso incidente:', c.st().notifs.filter(n => n.table === 'pd').map(n => n.to + ': ' + n.text).join(' / '));
r.mob.openDone(); R('ver registro'); log('Rec origen:', r.rec.originTxt); r.closeRec(); R('cerrar');
// sin señal
r.mob.netOpts[1].pick(); R('offline'); log('Offline:', r.mob.offline, r.mob.netTxt);
r.mob.tabs[1].go(); R('registrar'); log('Forms móvil:', r.mob.forms.map(f => f.name).join(', '));
r.mob.forms.find(f => /Solicitud/.test(f.name)).go(); R('sol fill'); log('Sol campos:', F().map(f => f.label).join(' | '));
F().find(f => /necesitas/.test(f.label)).onChange({ target: { value: '20 cascos de seguridad' } }); R('t');
F().find(f => /Tipo/.test(f.label)).options[3].pick(); R('vacaciones'); log('Sin monto (vacaciones):', !F().some(f => /Monto/.test(f.label)));
F().find(f => /Tipo/.test(f.label)).options[0].pick(); R('compra'); F().find(f => /Monto/.test(f.label)).onChange({ target: { value: '600' } }); R('monto');
log('Botón:', r.mob.fill.submitLabel); r.mob.fill.submit(); R('cola'); log('Cola:', c.st().mobQueue.length, '|', r.mob.doneTitle, '| nav badge:', r.mobQueuedTxt);
r.mob.tabs[2].go(); R('mis registros'); log('Mis registros:', r.mob.queue.length, 'en cola,', r.mob.mine.length, 'enviados');
r.mob.netOpts[0].pick(); R('online'); log('Tras señal: cola', c.st().mobQueue.length, '| toast:', c.st().toast);
const sol = c.st().tables.byId.sol; const ns = sol.rows[sol.rows.length - 1]; log('Nueva sol:', ns.titulo, ns.estado, 'aprobador', ns.aprobador, '| solicitante', ns.solicitante);
c.previewAs('marta'); R('marta'); r.mob.tabs[0].go(); R('inicio'); log('Marta tareas:', r.mob.taskCount, '| aprob:', r.mob.approvals.length); const tk0 = r.mob.tasks[0]; log('Tarea 0:', tk0.title, tk0.sub); tk0.done(); R('hecha'); log('Tareas tras marcar:', r.mob.tasks.length);
r.mob.tabs[3].go(); R('avisos m'); log('Avisos móvil:', r.mob.notifs.length);
// como Ana: aprobar desde el celular
c.previewAs('ana'); R('ana m'); r.mob.tabs[0].go(); R('ana inicio'); log('Ana por aprobar:', r.mob.approvals.map(a => a.title + ' · ' + a.step).join(' / '));
if (r.mob.approvals.length) { r.mob.approvals[0].ok(); R('aprobar'); }
// carla (invitado) sin formularios
c.previewAs('carla'); R('carla m'); r.mob.tabs[1].go(); R('carla reg'); log('Carla forms:', r.mob.forms.length);
c.previewAs('ana'); R('ana back');
// plantillas
c.go('tar', null); R('tareas'); r.db.dv.toggleTpl(); R('tpl menu'); log('Plantillas tar:', r.db.dv.tpls.map(t => t.name).join(', '));
const nT = c.st().tables.byId.tar.rows.length; r.db.dv.tpls[0].pick(); R('desde tpl'); const tr = c.st().tables.byId.tar.rows[c.st().tables.byId.tar.rows.length - 1];
log('Tarea plantilla:', c.st().tables.byId.tar.rows.length - nT, tr.nombre, tr.horas, tr.criterio, '| rec abierto:', r.hasRec);
r.rec.saveTpl(); R('guardar tpl'); log('Plantillas ahora:', c.st().tables.byId.tar.templates.map(t => t.name).join(', '));
r.closeRec(); R('x'); r.db.dv.toggleTpl(); R('menu'); r.db.dv.tpls[2].del(); R('del tpl'); r.db.dv.newBlank(); R('blank'); r.closeRec(); R('x2');
// listas vinculadas
c.go('proy', 'y1'); R('proy y1'); log('Listas:', r.rec.linked.map(l => l.name + '(' + l.count + (l.open ? ',abierta' : '') + ')').join(', '));
const lkT = r.rec.linked.find(l => l.name === 'Tareas'); lkT.add(); R('nueva vinculada'); const lk2 = r.rec.linked.find(l => l.name === 'Tareas'); const ed2 = lk2.rows.find(x => x.editing);
log('Editando:', !!ed2, '| count:', lk2.count); ed2.setTitle({ target: { value: 'Pruebas de carga de racks' } }); R('titulo vinc'); r.rec.linked.find(l => l.name === 'Tareas').rows.find(x => x.editing).done(); R('listo');
log('Tarea vinculada:', c.st().tables.byId.tar.rows.slice(-1)[0].nombre, c.st().tables.byId.tar.rows.slice(-1)[0].proyecto);
r.rec.linked.find(l => l.name === 'Partes diarios').toggle(); R('toggle'); r.rec.linked[0].rows[0] && r.rec.linked[0].rows[0].open(); R('abrir vinc');
// form layout link y página de proyectos
c.go('pd', null); R('pd'); log('Partes vistas:', c.st().tables.byId.pd.views.map(v => v.name).join(', '), '| filas:', r.db.dv.tgroups[0].rows.length);
c.goPage('pg4'); R('pg4 partes'); log('pg4 bloques:', r.pg.blocks.length);
c.previewAs('luis'); R('luis'); r.goForms(); R('luis forms'); log('Luis forms grupos:', r.fb.groups.map(g => g.tname).join(', '), '| ro:', r.fb.has && r.fb.fm.readOnly);
c.previewAs('ana'); R('ana fin');

const propOf = (t, k) => t.props.find(p => p.key === k);
/* ---------- v5: arreglos, negocio configurable y módulo de costos ---------- */
c.previewAs('ana'); R('ana v5');
c.go('tar', null); R('tar');
const t6 = c.st().tables.byId.tar.rows.find(x => x.id === 't6'); log('Costo t6 sin responsable:', JSON.stringify(c.fval(c.st(), c.st().tables.byId.tar, propOf(c.st().tables.byId.tar, 'costo'), t6)));
r.goBiz(); R('negocio'); log('Rubros:', r.biz.rubros.map(x => x.name + '(' + x.pendTxt + ')').join(' | '));
r.biz.rubros[1].pick(); R('pick electrico'); log('Cambios:', r.biz.sel.changes.map(x => x.name).join(', '));
r.biz.sel.apply(); R('aplicar'); log('Toast:', c.st().toast); log('Tablas:', c.st().tables.order.join(','));
log('Áreas:', c.st().org.areas.map(a => a.name).join(', '), '| cargos nuevos:', c.st().org.cargos.slice(-3).map(x => x.name + '>' + x.parent).join(', '));
log('Módulos:', r.biz.mods.map(m => m.name + '=' + m.stateTxt).join(' | '));
r.biz.tnames.find(x => x.name === 'Órdenes de trabajo').set({ target: { value: 'SST y órdenes de trabajo' } }); R('rename');
const RC = c.st().tables.byId.rec; log('Recursos:', RC.rows.length, '| EP-201:', JSON.stringify(['precio', 'vigdesde', 'anterior', 'ultimo', 'estado', 'fuente'].map(k => RC.rows.find(x => x.codigo === 'EP-201')[k])), '| EP-202 alias:', RC.rows.find(x => x.codigo === 'EP-202').alias);
log('Variación casco:', c.fval(c.st(), RC, propOf(RC, 'variacion'), RC.rows.find(x => x.codigo === 'EP-201')));
const AC = c.st().tables.byId.acu; AC.rows.forEach(a => log('ACU', a.matricula, 'v' + a.version, a.estado, '| CD', c.fval(c.st(), AC, propOf(AC, 'cd'), a), '| PU', c.fval(c.st(), AC, propOf(AC, 'pu'), a), '| calc', c.cosCalc(c.st(), a).pu));
const OT = c.st().tables.byId.ot; log('OT importes:', OT.rows.map(o => o.codigo + '=' + c.fval(c.st(), OT, propOf(OT, 'importe'), o)).join(' '));
c.goPage('pgcos'); R('pg costos'); log('pgcos:', r.pg.blocks.map(b => b.typeName + (b.kpi ? '=' + b.kpi.value : '')).join(' | '));
c.goPage('pgops'); R('pg ops'); log('pgops:', r.pg.blocks.map(b => b.typeName + (b.kpi ? '=' + b.kpi.value : '')).join(' | '));
r.goCos(); R('costos'); log('KPIs costos:', r.cos.kpis.map(k => k.n + '=' + k.v).join(' | '), '| tabs:', r.cos.tabs.map(x => x.n).join(','));
log('Cortes:', r.cos.cortes.map(k => k.name + ' ' + k.estado).join(' / '));
log('Corte sel:', r.cos.k.name, '| filas:', r.cos.k.rows.slice(0, 4).map(x => x.cod + ' ' + x.prev + '→' + x.precio + ' ' + x.delta).join(' ; '));
r.cos.k.validate(); R('validar k4'); log('Toast:', c.st().toast); log('Casco tras validar:', JSON.stringify(['precio', 'anterior', 'estado'].map(k => c.st().tables.byId.rec.rows.find(x => x.codigo === 'EP-201')[k])));
log('Samples:', r.cos.samples.map(x => x.name).join(', ')); r.cos.samples[0].pick(); R('sample'); log('Imp resumen:', r.cos.imp.summary.map(x => x.v + ' ' + x.n).join(', '));
log('Imp filas:', r.cos.imp.rows.map(x => x.cod + ':' + x.kindTxt + (x.isDuda ? '[' + x.candTxt + ']' : '')).join(' | '));
r.cos.imp.rows.find(x => x.isDuda).same(); R('same'); r.cos.imp.setFecha({ target: { value: '2026-11-20' } }); R('fecha'); r.cos.imp.confirm(); R('confirmar'); log('Toast:', c.st().toast);
log('Recurso HE-303 alias:', c.st().tables.byId.rec.rows.find(x => x.codigo === 'HE-303').alias, '| nuevo MT-107:', !!c.st().tables.byId.rec.rows.find(x => x.codigo === 'MT-107'));
log('Corte nuevo sel:', r.cos.k.name, r.cos.k.estado, '| canValidate', r.cos.k.canValidate);
r.cos.tabs[1].pick(); R('precios'); log('Recursos lista:', r.cos.recs.length, '| primero:', r.cos.recs[0].cod, r.cos.recs[0].estado); r.cos.recs.find(x => x.cod === 'EP-201').pick(); R('casco');
log('Casco hist:', r.cos.r.hist.map(h => h.fecha + ' ' + h.precio + ' ' + h.delta + ' ' + h.estado).join(' | '), '| dots', r.cos.r.chart.dots.length, '| line', r.cos.r.chart.line.slice(0, 40), '| usado en', r.cos.r.users.length);
r.cos.r.hist.find(h => h.canAct) && r.cos.r.hist.find(h => h.canAct).ok(); R('validar precio'); r.cos.setQ({ target: { value: 'diel' } }); R('buscar'); log('Buscar diel:', r.cos.recs.map(x => x.cod).join(','));
r.cos.fams[5].pick(); R('fam EPP'); r.cos.setQ({ target: { value: '' } }); R('q');
r.cos.tabs[2].pick(); R('acu'); log('Mats:', r.cos.mats.map(m => m.mat + ' ' + m.meta).join(' | '));
log('Comparación:', r.cos.acu.cmp.puA, '→', r.cos.acu.cmp.puB, r.cos.acu.cmp.dPu, r.cos.acu.cmp.dPct); log('Explicación:', r.cos.acu.cmp.explain);
log('Componentes:', r.cos.acu.cmp.comps.map(x => x.n + ' ' + x.v).join(' | ')); log('Filas:', r.cos.acu.cmp.rows.slice(0, 4).map(x => x.name + ' ' + x.delta + ' (' + x.causa + ')').join(' ; '));
r.cos.acu.newVer(); R('nueva version'); log('Toast:', c.st().toast, '| cmp', r.cos.acu.cmp.aName, '→', r.cos.acu.cmp.bName, r.cos.acu.cmp.dPu);
r.cos.mats[2].pick(); R('mat 100322'); log('Single:', r.cos.acu.single, r.cos.acu.noCmp);
r.cos.tabs[3].pick(); R('impacto'); r.cos.imp2.setRec({ target: { value: c.st().tables.byId.rec.rows.find(x => x.codigo === 'EP-201').id } }); R('rec'); r.cos.imp2.setPrecio({ target: { value: '61.5' } }); R('precio'); r.cos.imp2.setMotivo({ target: { value: 'OC-2026-118 nuevo proveedor' } }); R('motivo');
log('Impacto:', r.cos.imp2.summary, '|', r.cos.imp2.rows.map(x => x.mat + ' ' + x.puA + '→' + x.puB + ' ' + x.d + ' ' + x.ots).join(' ; '));
const nA = c.st().tables.byId.acu.rows.length; r.cos.imp2.applyVersions(); R('aplicar impacto'); log('Toast:', c.st().toast, '| ACU nuevos:', c.st().tables.byId.acu.rows.length - nA, '| done', r.cos.imp2.done);
const au1 = c.st().tables.byId.acu.rows.find(x => x.id === 'au1'); log('au1 intacto PU:', c.cosCalc(c.st(), au1).pu);
// permisos
c.previewAs('marta'); R('marta'); log('Marta costos:', r.hasCos, '| canEdit:', r.cos && r.cos.canEdit);
c.previewAs('jorge'); R('jorge'); r.goCos(); R('jorge cos'); log('Jorge costos ro:', r.cos.readOnly);
c.previewAs('carla'); R('carla'); log('Carla nav costos:', r.hasCos); c.setScreen('costos'); R('carla cos'); log('Carla scrCosNo:', r.scrCosNo);
c.setScreen('negocio'); R('carla negocio'); log('Carla negocio:', r.scrBiz);
c.previewAs('ana'); R('ana');
c.go('ot', null); R('ot'); c.go('acu', null); R('acu tabla'); c.go('rec', null); R('rec tabla'); c.go('prc', null); R('prc'); c.go('acud', null); R('acud'); c.go('ctr', null); R('ctr'); c.go('srv', null); R('srv'); c.go('cor', null); R('cor');
c.openRec('acu', 'au2'); R('rec au2'); log('au2 listas:', r.rec.linked.map(l => l.name + '(' + l.count + ')').join(', ')); c.setState({ rec: null });
r.goBiz(); R('biz2'); log('Construcción pend:', r.biz.rubros[2].pendTxt);

log('\nTOTAL avisos de plantilla:', issues.length);
[...new Set(issues.map(i => i.replace(/^[^:]+: /, '')))].slice(0, 60).forEach(i => log(' -', i));

(async () => {
  const fsx = require('fs');
  c.setScreen('costos');
  const buf = fsx.readFileSync('/tmp/xl/Corte_semana48_2026-11-27.xlsx');
  await c.cosFile({ target: { files: [{ name: 'Corte_semana48_2026-11-27.xlsx', arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) }], value: 'x' } });
  R('xlsx'); log('XLSX:', r.cos.imp.name, r.cos.imp.fecha, '| err:', r.cos.imp.err, '| filas:', r.cos.imp.rows.map(x => x.cod + ' ' + x.precio + ' ' + x.kindTxt + (x.isDuda ? ' [' + x.candTxt + ']' : '')).join(' | '));
  await c.cosFile({ target: { files: [{ name: 'malo.csv', text: async () => 'a;b\n1;2' }], value: 'x' } }); R('csv malo'); log('CSV malo:', r.cos.imp.err);
  await c.cosFile({ target: { files: [{ name: 'tarifas.csv', text: async () => 'Código;Descripción;Unidad;Precio\nMO-002;Oficial electricista;hh;"24,50"\nX-1;Nuevo item;und;3.2\n' }], value: 'x' } }); R('csv ok'); log('CSV:', r.cos.imp.rows.map(x => x.cod + ' ' + x.precio + ' ' + x.kindTxt).join(' | '));
  log('\nTOTAL avisos v5 async:', issues.length);
})();
