/* ================= reportes exportables =================
   La plantilla define el orden y el formato; la pantalla no. Así el PDF, Word y Excel salen siempre ordenados.
   Nota: este archivo no puede contener la secuencia de cierre de etiqueta literal; se arma con CL(). */
var TECSUR_LOGO = 'data:image/png;base64,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';
var REP_TPLS = [
  { id: 'ejecutivo', n: 'Ejecutivo (Gerencia)', d: 'Portada, indicadores, gráficos y conclusión. Tablas resumidas: 15 filas y 7 columnas.' },
  { id: 'tecnico', n: 'Técnico completo', d: 'Portada, índice, todas las filas y columnas, y anexo con las fórmulas usadas.' }
];
var REP_STATUS = ['Borrador técnico · Pendiente de aprobación', 'En revisión', 'Revisado · Pendiente de conformidad', 'Aprobado'];
function CL(t) { return '<' + '/' + t + '>'; }
function EL(t, a, inner) { return '<' + t + (a ? ' ' + a : '') + '>' + (inner == null ? '' : inner) + CL(t); }
function escH(x) { return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/[<]/g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function dTxt(d) {
  if (!d) return '';
  if (d.kPills) return d.pills.map(function (p) { return p.text; }).join(', ');
  if (d.kChips) return d.chips.map(function (c) { return c.label || ''; }).join(', ');
  if (d.kPeople) return d.people.map(function (p) { return p.name; }).join(', ');
  if (d.kCheck) return d.checked ? 'Sí' : 'No';
  if (d.kLink) return d.linkText || d.href || '';
  if (d.kFiles) return d.files.map(function (f) { return f.name; }).join(', ');
  return d.text || '';
}
Object.assign(Component.prototype, {
  /* ---------- configuración ---------- */
  repSecsOf(s, pid) {
    var pg = s.pages.byId[pid]; if (!pg) return [];
    var ok = { kpi: 1, chart: 1, db: 1, callout: 1, text: 1, heading: 1 };
    return pg.blocks.filter(function (b) { return ok[b.type] && !(b.type === 'text' && !String(b.text || '').trim()); }).map(function (b) { return { bid: b.id, on: true }; });
  },
  repOpen(pid) {
    var s = this.st(), pg = s.pages.byId[pid]; if (!pg) return;
    var v = this.viewer(s), old = s.rep && s.rep.pid === pid ? s.rep : null;
    this.setState({ rep: old || { pid: pid, tpl: 'ejecutivo', title: pg.title || 'Reporte', sub: pg.desc || '', author: v.name, area: 'Ingeniería de Costos', status: REP_STATUS[0], ver: 'v0.1', concl: '', orient: 'v', cover: true, secs: this.repSecsOf(s, pid) } });
  },
  repSet(patch) { var s = this.st(); if (!s.rep) return; var r = clone(s.rep); for (var k in patch) r[k] = patch[k]; this.setState({ rep: r }); },
  repBlockLabel(s, b) {
    var T = b.table ? s.tables.byId[b.table] : null;
    if (b.type === 'db') { var vw = T ? (T.views.filter(function (x) { return x.id === b.view; })[0] || T.views[0]) : null; return { kind: 'Tabla', name: (T ? T.name : 'Tabla') + (vw ? ' · ' + vw.name : '') }; }
    if (b.type === 'kpi') return { kind: 'Indicador', name: b.title || 'Indicador' };
    if (b.type === 'chart') return { kind: 'Gráfico', name: b.title || 'Gráfico' };
    var tx = String(b.text || '');
    if (b.type === 'heading') return { kind: 'Título', name: tx || 'Título' };
    return { kind: b.type === 'callout' ? 'Nota' : 'Texto', name: tx.slice(0, 70) + (tx.length > 70 ? '…' : '') };
  },
  repView(s, v) {
    var self = this, r = s.rep; if (!r) return { open: false };
    var pg = s.pages.byId[r.pid]; if (!pg) return { open: false };
    var byId = {}; pg.blocks.forEach(function (b) { byId[b.id] = b; });
    var secs = r.secs.filter(function (x) { return byId[x.bid]; });
    function seg(list, cur, fn) { return list.map(function (o) { var on = o.id === cur; return { label: o.n, cls: on ? 'on' : '', on: on, pick: function () { fn(o.id); } }; }); }
    function inp(key) { return function (e) { var p = {}; p[key] = e.target.value; self.repSet(p); }; }
    var nOn = secs.filter(function (x) { return x.on; }).length;
    return {
      open: true, close: function () { self.setState({ rep: null }); },
      tplSeg: seg(REP_TPLS, r.tpl, function (k) { self.repSet({ tpl: k }); }), tplDesc: (REP_TPLS.filter(function (x) { return x.id === r.tpl; })[0] || {}).d || '',
      orientSeg: seg([{ id: 'v', n: 'Vertical' }, { id: 'h', n: 'Horizontal' }], r.orient, function (k) { self.repSet({ orient: k }); }),
      coverSeg: seg([{ id: 'si', n: 'Con portada' }, { id: 'no', n: 'Sin portada' }], r.cover ? 'si' : 'no', function (k) { self.repSet({ cover: k === 'si' }); }),
      statusSeg: seg(REP_STATUS.map(function (x) { return { id: x, n: x }; }), r.status, function (k) { self.repSet({ status: k }); }),
      title: r.title, sub: r.sub, author: r.author, area: r.area, ver: r.ver, concl: r.concl,
      setTitle: inp('title'), setSub: inp('sub'), setAuthor: inp('author'), setArea: inp('area'), setVer: inp('ver'), setConcl: inp('concl'),
      count: nOn + ' de ' + secs.length + ' secciones incluidas',
      secs: secs.map(function (x, i) {
        var L = self.repBlockLabel(s, byId[x.bid]);
        return { kind: L.kind, name: L.name, on: x.on, cls: (x.on ? '' : 'off') + (s.jellyKey === 'rep:' + x.bid ? ' jelly' : ''), num: String(i + 1), aria: (x.on ? 'Quitar del reporte: ' : 'Incluir en el reporte: ') + L.name,
          toggle: function () { var list = clone(self.st().rep.secs); list.forEach(function (y) { if (y.bid === x.bid) y.on = !y.on; }); self.repSet({ secs: list }); },
          noUp: i === 0, noDown: i === secs.length - 1,
          up: function () { self.repMove(x.bid, -1); }, down: function () { self.repMove(x.bid, 1); } };
      }),
      reset: function () { self.repSet({ secs: self.repSecsOf(self.st(), r.pid) }); },
      preview: function () { self.repPreview(); }, word: function () { self.repWord(); }, excel: function () { self.repExcel(); }
    };
  },
  repMove(bid, d) {
    var list = clone(this.st().rep.secs), i = -1; list.forEach(function (x, k) { if (x.bid === bid) i = k; });
    var j = i + d; if (i < 0 || j < 0 || j >= list.length) return;
    var t = list[i]; list[i] = list[j]; list[j] = t; this.repSet({ secs: list }); this.jellyOn('rep:' + bid);
  },
  /* ---------- datos de cada sección ---------- */
  repData() {
    var self = this, s = this.st(), v = this.viewer(s), r = s.rep, pg = s.pages.byId[r.pid];
    var byId = {}; pg.blocks.forEach(function (b) { byId[b.id] = b; });
    var exec = r.tpl === 'ejecutivo', out = [];
    r.secs.forEach(function (x) {
      var b = byId[x.bid]; if (!b || !x.on) return;
      var T = b.table ? s.tables.byId[b.table] : null;
      if (T && self.lvl(s, T.id, v.role) === 'none') return;
      var rows = T ? self.rowsFor(s, T.id, v) : [];
      if (b.type === 'kpi' && T) { var k = self.kpiData(s, T, self.applyFilters(s, T, rows, b.filters, v), b); out.push({ type: 'kpi', title: b.title || 'Indicador', value: k.value, cap: k.caption, goal: k.goalText, state: k.stateCls }); }
      else if (b.type === 'chart' && T) {
        var P = self.chartData(s, T, self.applyFilters(s, T, rows, b.filters, v), { goal: b.goal, goalDir: b.goalDir, goalColor: !!b.goalColor, labels: b.labels, pal: b.pal, legend: b.legend, head: false, title: b.title, kind: b.kind, by: b.by, bucket: b.bucket, val: b.val, sort: b.sort, limit: b.limit }, null);
        out.push({ type: 'chart', title: b.title || 'Gráfico', sub: P.sub, donut: P.isDonut, bars: (P.bars || []).map(function (y) { return { label: y.label, value: y.value, text: y.valueText, color: y.color, share: y.share }; }), goal: b.goal == null ? null : Number(b.goal), goalText: P.goalText, empty: P.empty, emptyText: P.emptyText, src: T.name });
      }
      else if (b.type === 'db' && T) {
        var vw = T.views.filter(function (y) { return y.id === b.view; })[0] || T.views[0];
        var rr = self.applyFilters(s, T, rows, vw.filters, v);
        var props = T.props.filter(function (p) { return (vw.hidden || []).indexOf(p.key) < 0 && ['button', 'ai'].indexOf(p.type) < 0; });
        var tp = props.filter(function (p) { return p.type === 'title'; }); props = tp.concat(props.filter(function (p) { return p.type !== 'title'; }));
        var total = rr.length, cut = exec && props.length > 7;
        if (exec) { props = props.slice(0, 7); rr = rr.slice(0, 15); }
        out.push({ type: 'table', title: T.name + (vw.name && vw.name !== T.name ? ' · ' + vw.name : ''), src: T.name, view: vw.name,
          cols: props.map(function (p) { return { name: p.name, num: isNumericProp(p), type: p.type }; }),
          rows: rr.map(function (row) { return props.map(function (p) {
            if (p.type === 'title') return { t: self.titleOf(T, row), n: null };
            var d = self.dispOf(s, T, p, row, v, false), n = null;
            if (isNumericProp(p)) { try { n = self.fval(s, T, p, row); } catch (e) { n = null; } }
            return { t: dTxt(d), n: typeof n === 'number' ? n : null }; }); }),
          note: (exec && total > rr.length ? 'se muestran ' + rr.length + ' de ' + total + ' registros' : total + ' registros') + (cut ? '; columnas resumidas' : ''),
          formulas: T.props.filter(function (p) { return p.type === 'formula'; }).map(function (p) { return { name: p.name, expr: p.expr || '', desc: p.desc || '' }; }) });
      }
      else if (b.type === 'callout' || b.type === 'text') out.push({ type: 'text', text: b.text || '', callout: b.type === 'callout' });
      else if (b.type === 'heading') out.push({ type: 'heading', text: b.text || '' });
    });
    return out;
  },
  /* ---------- gráfico como SVG (PDF); en Word se convierte a imagen ---------- */
  repSvg(c) {
    if (c.empty || !c.bars.length) return EL('p', 'class="muted"', escH(c.emptyText || 'Sin datos'));
    var W = 640, F = 'font-family="Calibri, Carlito, Arial, sans-serif"';
    if (c.donut) {
      var tot = c.bars.reduce(function (a, b) { return a + (b.value || 0); }, 0) || 1, R = 70, C = 2 * Math.PI * R, off = 0, segs = '', leg = '';
      c.bars.forEach(function (b, i) {
        var len = (b.value || 0) / tot * C;
        segs += '<circle cx="100" cy="100" r="' + R + '" fill="none" stroke="' + b.color + '" stroke-width="30" stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 100 100)"/>';
        off += len;
        var y = 30 + i * 24;
        leg += '<rect x="240" y="' + (y - 10) + '" width="12" height="12" rx="3" fill="' + b.color + '"/>' + EL('text', 'x="260" y="' + y + '" font-size="13" fill="#1E2A38" ' + F, escH(b.label)) + EL('text', 'x="620" y="' + y + '" font-size="13" text-anchor="end" font-weight="700" fill="#1E2A38" ' + F, escH(b.text + '  (' + b.share + ')'));
      });
      var H = Math.max(200, 30 + c.bars.length * 24);
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' + segs + leg + CL('svg');
    }
    var max = Math.max.apply(null, [0, c.goal || 0].concat(c.bars.map(function (b) { return b.value || 0; }))) || 1;
    var x0 = 190, bw = 330, rh = 28, H2 = 16 + c.bars.length * rh + (c.goal != null ? 20 : 0), body = '';
    c.bars.forEach(function (b, i) {
      var y = 10 + i * rh, w = Math.max(2, (b.value || 0) / max * bw);
      body += EL('text', 'x="' + (x0 - 10) + '" y="' + (y + 15) + '" font-size="12.5" text-anchor="end" fill="#1E2A38" ' + F, escH(String(b.label).slice(0, 30)));
      body += '<rect x="' + x0 + '" y="' + (y + 3) + '" width="' + bw + '" height="16" rx="4" fill="#F2F4F7"/><rect x="' + x0 + '" y="' + (y + 3) + '" width="' + w.toFixed(1) + '" height="16" rx="4" fill="' + b.color + '"/>';
      body += EL('text', 'x="' + (x0 + bw + 10) + '" y="' + (y + 15) + '" font-size="12.5" font-weight="700" fill="#1E2A38" ' + F, escH(b.text));
    });
    if (c.goal != null) { var gx = x0 + c.goal / max * bw; body += '<line x1="' + gx.toFixed(1) + '" x2="' + gx.toFixed(1) + '" y1="6" y2="' + (H2 - 18) + '" stroke="#1E2A38" stroke-width="1.5" stroke-dasharray="5 4"/>' + EL('text', 'x="' + gx.toFixed(1) + '" y="' + (H2 - 4) + '" font-size="11" text-anchor="middle" fill="#5A6675" ' + F, escH(c.goalText)); }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H2 + '" width="' + W + '" height="' + H2 + '">' + body + CL('svg');
  },
  /* ---------- documento ---------- */
  repHtml(forWord, imgs) {
    var self = this, s = this.st(), r = s.rep, data = this.repData(), exec = r.tpl === 'ejecutivo';
    var today = new Date(), fecha = ('0' + today.getDate()).slice(-2) + '/' + ('0' + (today.getMonth() + 1)).slice(-2) + '/' + today.getFullYear();
    var foot = 'TECSUR | ' + r.area + ' · ' + r.status + ' · ' + r.ver;
    var nSec = 0, nTab = 0, nFig = 0, toc = [], body = '', kpis = [];
    function flushK() {
      if (!kpis.length) return;
      nSec++; toc.push(nSec + '. Indicadores');
      var cells = '';
      kpis.forEach(function (k, i) { if (i && i % 3 === 0) cells += CL('tr') + '<tr>'; cells += EL('td', 'class="k ' + k.state + '"', EL('div', 'class="kt"', escH(k.title)) + EL('div', 'class="kv"', escH(k.value)) + EL('div', 'class="kc"', escH(k.cap)) + (k.goal ? EL('div', 'class="kg"', escH(k.goal)) : '')); });
      body += EL('h1', '', nSec + '. Indicadores') + EL('table', 'class="kpis"', EL('tr', '', cells));
      kpis = [];
    }
    data.forEach(function (d) {
      if (d.type === 'kpi') { kpis.push(d); return; }
      flushK();
      if (d.type === 'heading') { nSec++; toc.push(nSec + '. ' + d.text); body += EL('h1', '', nSec + '. ' + escH(d.text)); }
      else if (d.type === 'text') body += EL('p', d.callout ? 'class="note"' : '', escH(d.text));
      else if (d.type === 'chart') {
        nSec++; nFig++; toc.push(nSec + '. ' + d.title);
        var img = forWord ? (imgs && imgs[nFig - 1] && imgs[nFig - 1].b64 ? '<img src="' + imgs[nFig - 1].loc + '" width="600">' : '') : self.repSvg(d);
        body += EL('h1', '', nSec + '. ' + escH(d.title)) + EL('div', 'class="fig"', img) + EL('p', 'class="cap"', 'Figura ' + nFig + '. ' + escH(d.title)) + EL('p', 'class="src"', 'Fuente: tabla ' + escH(d.src) + ' · ' + escH(d.sub || ''));
      }
      else if (d.type === 'table') {
        nSec++; nTab++; toc.push(nSec + '. ' + d.title);
        var th = EL('tr', '', d.cols.map(function (c) { return EL('th', c.num ? 'class="n"' : '', escH(c.name)); }).join(''));
        var tb = d.rows.map(function (row, i) { return EL('tr', i % 2 ? 'class="alt"' : '', row.map(function (c, j) { return EL('td', d.cols[j].num ? 'class="n"' : '', escH(c.t)); }).join('')); }).join('');
        body += EL('h1', '', nSec + '. ' + escH(d.title)) + EL('p', 'class="cap"', 'Tabla ' + nTab + '. ' + escH(d.title)) + EL('table', 'class="dt"', EL('thead', '', th) + EL('tbody', '', tb)) + EL('p', 'class="src"', 'Fuente: tabla ' + escH(d.src) + ', vista ' + escH(d.view) + ' · ' + escH(d.note));
      }
    });
    flushK();
    if (r.concl && r.concl.trim()) { nSec++; toc.push(nSec + '. Conclusión'); body += EL('h1', '', nSec + '. Conclusión') + EL('div', 'class="concl"', escH(r.concl).replace(/\n/g, '<br>')); }
    if (!exec) {
      var fx = [], seen = {};
      data.forEach(function (d) { if (d.type === 'table') d.formulas.forEach(function (f) { var k2 = d.src + '|' + f.name; if (!seen[k2]) { seen[k2] = 1; fx.push([d.src, f.name, f.expr, f.desc]); } }); });
      if (fx.length) {
        nSec++; nTab++; toc.push(nSec + '. Anexo: fórmulas');
        body += EL('h1', 'class="pb"', nSec + '. Anexo: fórmulas') + EL('p', 'class="cap"', 'Tabla ' + nTab + '. Fórmulas usadas') + EL('table', 'class="dt"', EL('thead', '', EL('tr', '', EL('th', '', 'Tabla') + EL('th', '', 'Campo') + EL('th', '', 'Fórmula') + EL('th', '', 'Descripción'))) + EL('tbody', '', fx.map(function (f, i) { return EL('tr', i % 2 ? 'class="alt"' : '', f.map(function (c, j) { return EL('td', j === 2 ? 'class="mono"' : '', escH(c)); }).join('')); }).join('')));
      }
    }
    var meta = [['Área', r.area], ['Elaborado por', r.author], ['Fecha', fecha], ['Versión', r.ver], ['Estado', r.status]].map(function (m) { return EL('tr', '', EL('td', 'class="ml"', m[0]) + EL('td', '', escH(m[1]))); }).join('');
    var cover = r.cover ? EL('div', 'class="cover"', '<img class="clogo" src="' + (forWord ? 'logo.png' : TECSUR_LOGO) + '" width="190">' + EL('div', 'class="cbar"', '&nbsp;') + EL('div', 'class="ct"', escH(r.title)) + EL('div', 'class="cs"', escH(r.sub)) + EL('table', 'class="meta"', meta) +
      EL('div', 'class="cf"', 'Elaborado no equivale a aprobado. Este documento requiere revisión y conformidad antes de su uso formal.')) : '';
    var tocH = !exec && toc.length ? EL('div', 'class="toc"', EL('h2', '', 'Índice') + toc.map(function (t) { return EL('p', '', escH(t)); }).join('')) : '';
    var land = r.orient === 'h';
    var css = '@page{size:A4 ' + (land ? 'landscape' : 'portrait') + ';margin:18mm 16mm 20mm 16mm;@bottom-left{content:"' + foot.replace(/"/g, '') + '";font:9pt Calibri,Carlito,Arial;color:#5A6675}@bottom-right{content:"Página " counter(page) " de " counter(pages);font:9pt Calibri,Carlito,Arial;color:#5A6675}}' +
      (r.cover ? '@page:first{@bottom-left{content:none}@bottom-right{content:none}}' : '') +
      'body{font-family:Calibri,Carlito,Arial,sans-serif;font-size:10.5pt;color:#1E2A38;margin:0;line-height:1.35}' +
      'h1{font-size:15pt;color:#00468C;margin:18pt 0 6pt;border-bottom:1.5pt solid #00468C;padding-bottom:3pt;page-break-after:avoid}h2{font-size:12.5pt;color:#00468C}' +
      '.cover{page-break-after:always;padding-top:30mm}.clogo{display:block;margin-bottom:24mm}.cbar{height:5pt;width:60mm;background:#F8D000;margin-bottom:10mm;font-size:2pt}.ct{font-size:26pt;font-weight:700;color:#00468C;line-height:1.15}.cs{font-size:13pt;color:#5A6675;margin:6mm 0 14mm}' +
      '.meta{border-collapse:collapse}.meta td{padding:4pt 14pt 4pt 0;font-size:11pt}.ml{color:#5A6675;font-weight:700}.cf{margin-top:30mm;font-size:9.5pt;color:#5A6675;border-top:1pt solid #C9D3E0;padding-top:4mm}' +
      '.toc{page-break-after:always}.toc p{margin:4pt 0;border-bottom:.5pt dotted #C9D3E0}' +
      '.kpis{width:100%;border-collapse:separate;border-spacing:6pt}.k{border:1pt solid #C9D3E0;border-radius:6pt;padding:8pt 10pt;vertical-align:top;width:33%}.kt{font-size:9.5pt;color:#5A6675}.kv{font-size:20pt;font-weight:700;color:#00468C}.kc{font-size:8.5pt;color:#5A6675}.kg{font-size:9pt;font-weight:700;margin-top:3pt}.k.kpi-ok .kv,.k.kpi-ok .kg{color:#00705A}.k.kpi-bad .kv,.k.kpi-bad .kg{color:#B00020}' +
      '.fig{text-align:center;page-break-inside:avoid}.fig svg{max-width:100%;height:auto}.cap{font-weight:700;color:#00468C;font-size:10pt;margin:6pt 0 3pt}.src{font-size:9pt;color:#5A6675;margin:2pt 0 10pt}' +
      '.dt{width:100%;border-collapse:collapse;font-size:9.5pt}.dt th{background:#00468C;color:#FFFFFF;text-align:left;padding:4pt 6pt;font-weight:700}.dt td{padding:3.5pt 6pt;border-bottom:.5pt solid #C9D3E0;vertical-align:top}.dt tr.alt td{background:#F2F4F7}.dt .n{text-align:right;white-space:nowrap}.dt thead{display:table-header-group}.dt tr{page-break-inside:avoid}.mono{font-family:Consolas,monospace;font-size:8.5pt}' +
      '.note{background:#FFF4C2;border-left:3pt solid #F8D000;padding:6pt 10pt}.concl{background:#E3F1EC;border-left:3pt solid #00705A;padding:8pt 12pt}.pb{page-break-before:always}.muted{color:#5A6675}' +
      '.bar{position:fixed;top:0;left:0;right:0;display:flex;gap:8px;align-items:center;padding:10px 14px;background:#00468C;color:#fff;font:13px Calibri,Carlito,Arial;z-index:9}.bar button{font:inherit;padding:8px 14px;border-radius:8px;border:0;background:#F8D000;color:#1E2A38;font-weight:700;cursor:pointer}.wrap{max-width:' + (land ? '270mm' : '185mm') + ';margin:60px auto 40px;padding:0 12px}@media print{.bar{display:none}.wrap{margin:0;max-width:none;padding:0}}';
    var head = '<meta charset="utf-8">' + EL('title', '', escH(r.title)) + EL('style', '', css);
    if (forWord) return { head: head, body: cover + tocH + body };
    var bar = EL('div', 'class="bar"', EL('span', 'style="flex:1"', 'Vista previa · ' + escH(r.title)) + EL('button', 'onclick="window.print()"', 'Imprimir o guardar como PDF'));
    return '<!doctype html><html lang="es"><head>' + head + CL('head') + '<body>' + bar + EL('div', 'class="wrap"', cover + tocH + body) + CL('body') + CL('html');
  },
  repFile() { var r = this.st().rep; return 'TECSUR_Reporte_' + String(r.title || 'Reporte').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 60) + '_' + String(r.ver || 'v0.1').replace(/[^A-Za-z0-9.]+/g, ''); },
  repDownload(name, content, mime) {
    try { var blob = content instanceof Blob ? content : new Blob([content], { type: mime || 'text/plain' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); this.toastMsg('Descargado: ' + name); } catch (e) { this.toastMsg('No se pudo descargar el archivo.'); }
  },
  repPreview() {
    var html = this.repHtml(false), w = null;
    try { w = window.open('', '_blank'); } catch (e) { w = null; }
    if (w && w.document) { w.document.open(); w.document.write(html); w.document.close(); }
    else this.repDownload(this.repFile() + '.html', html, 'text/html');
  },
  repPng(svg) {
    return new Promise(function (res) {
      var m = /viewBox="0 0 (\d+) (\d+)"/.exec(svg); if (!m) { res(null); return; }
      var w = Number(m[1]), h = Number(m[2]), img = new Image();
      img.onload = function () { try { var cv = document.createElement('canvas'); cv.width = w * 2; cv.height = h * 2; var g = cv.getContext('2d'); g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height); res({ b64: cv.toDataURL('image/png').split(',')[1], w: w, h: h }); } catch (e) { res(null); } };
      img.onerror = function () { res(null); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  },
  /* Word (.docx real): mismos datos y orden que el PDF */
  repWord() {
    var self = this, s = this.st(), r = s.rep, data = this.repData(), exec = r.tpl === 'ejecutivo';
    var charts = data.filter(function (d) { return d.type === 'chart' && !d.empty && d.bars.length; });
    this.toastMsg('Preparando el Word…');
    Promise.all(charts.map(function (c) { return self.repPng(self.repSvg(c)); })).then(function (pngs) {
      var today = new Date(), fecha = ('0' + today.getDate()).slice(-2) + '/' + ('0' + (today.getMonth() + 1)).slice(-2) + '/' + today.getFullYear();
      var B = [], nSec = 0, nTab = 0, nFig = 0, kp = [], ci = 0;
      if (r.cover) {
        B.push({ t: 'logo', img: { b64: TECSUR_LOGO.split(',')[1], w: 330, h: 120 } }, { t: 'bar' }, { t: 'title', text: r.title }, { t: 'sub', text: r.sub || ' ' },
          { t: 'meta', rows: [['Área', r.area], ['Elaborado por', r.author], ['Fecha', fecha], ['Versión', r.ver], ['Estado', r.status]] },
          { t: 'fine', text: 'Elaborado no equivale a aprobado. Este documento requiere revisión y conformidad antes de su uso formal.' }, { t: 'pb' });
      }
      if (!exec) B.push({ t: 'toc' });
      function flush() { if (!kp.length) return; nSec++; B.push({ t: 'h1', text: nSec + '. Indicadores' }, { t: 'kpis', list: kp }, { t: 'src', text: ' ' }); kp = []; }
      data.forEach(function (d) {
        if (d.type === 'kpi') { kp.push(d); return; }
        flush();
        if (d.type === 'heading') { nSec++; B.push({ t: 'h1', text: nSec + '. ' + d.text }); }
        else if (d.type === 'text') B.push({ t: d.callout ? 'note' : 'p', text: d.text });
        else if (d.type === 'chart') {
          nSec++; nFig++; B.push({ t: 'h1', text: nSec + '. ' + d.title });
          if (!d.empty && d.bars.length) { var im = pngs[ci++]; if (im) B.push({ t: 'img', img: im }); } else B.push({ t: 'p', text: d.emptyText || 'Sin datos' });
          B.push({ t: 'cap', text: 'Figura ' + nFig + '. ' + d.title }, { t: 'src', text: 'Fuente: tabla ' + d.src + ' · ' + (d.sub || '') });
        }
        else if (d.type === 'table') {
          nSec++; nTab++;
          B.push({ t: 'h1', text: nSec + '. ' + d.title }, { t: 'cap', text: 'Tabla ' + nTab + '. ' + d.title }, { t: 'table', cols: d.cols, rows: d.rows }, { t: 'src', text: 'Fuente: tabla ' + d.src + ', vista ' + d.view + ' · ' + d.note });
        }
      });
      flush();
      if (r.concl && r.concl.trim()) { nSec++; B.push({ t: 'h1', text: nSec + '. Conclusión' }, { t: 'concl', text: r.concl }); }
      if (!exec) {
        var fx = [], seen = {};
        data.forEach(function (d) { if (d.type === 'table') d.formulas.forEach(function (f) { var k2 = d.src + '|' + f.name; if (!seen[k2]) { seen[k2] = 1; fx.push([d.src, f.name, f.expr, f.desc]); } }); });
        if (fx.length) { nSec++; nTab++; B.push({ t: 'h1', text: nSec + '. Anexo: fórmulas', pbb: true }, { t: 'cap', text: 'Tabla ' + nTab + '. Fórmulas usadas' }, { t: 'table', cols: [{ name: 'Tabla' }, { name: 'Campo' }, { name: 'Fórmula', type: 'title' }, { name: 'Descripción' }], rows: fx.map(function (f) { return f.map(function (c) { return { t: c }; }); }) }); }
      }
      var blob = OG.docx({ land: r.orient === 'h', cover: r.cover, title: r.title, author: r.author, footer: 'TECSUR | ' + r.area + ' · ' + r.status + ' · ' + r.ver, blocks: B });
      self.repDownload(self.repFile() + '.docx', blob);
    });
  },
  /* Excel (.xlsx real): indicadores, una hoja por gráfico y tabla, y fórmulas */
  repExcel() {
    var data = this.repData(), r = this.st().rep, sh = [], sub = 'TECSUR | ' + r.area + ' · ' + r.status + ' · ' + r.ver;
    var k = data.filter(function (d) { return d.type === 'kpi'; });
    if (k.length) sh.push({ name: 'Indicadores', title: r.title + ' · Indicadores', sub: sub, head: ['Indicador', 'Valor', 'Detalle', 'Meta'], rows: k.map(function (d) { return [d.title, d.value, d.cap, d.goal || '']; }), widths: [34, 18, 40, 30] });
    data.forEach(function (d) {
      if (d.type === 'chart') sh.push({ name: 'G ' + d.title, title: d.title, sub: sub, head: ['Categoría', 'Valor', 'Participación'], rows: d.bars.map(function (b) { return [b.label, b.value, b.share]; }), widths: [32, 16, 14] });
      if (d.type === 'table') sh.push({ name: d.src, title: d.title, sub: sub + ' · ' + d.note, head: d.cols.map(function (c) { return c.name; }), rows: d.rows.map(function (row) { return row.map(function (c) { return c.n != null ? c.n : c.t; }); }), widths: d.cols.map(function (c) { return c.type === 'title' ? 22 : (c.num ? 15 : 24); }) });
    });
    var fx = [], seen = {};
    data.forEach(function (d) { if (d.type === 'table') d.formulas.forEach(function (f) { var k2 = d.src + '|' + f.name; if (!seen[k2]) { seen[k2] = 1; fx.push([d.src, f.name, f.expr, f.desc]); } }); });
    if (fx.length) sh.push({ name: 'Fórmulas', title: 'Fórmulas usadas', sub: sub, head: ['Tabla', 'Campo', 'Fórmula', 'Descripción'], rows: fx, widths: [22, 24, 70, 50] });
    if (!sh.length) sh.push({ name: 'Reporte', title: r.title, sub: sub, head: ['Sin datos'], rows: [], widths: [30] });
    this.repDownload(this.repFile() + '.xlsx', OG.xlsx({ sheets: sh, footer: sub }));
  }
});
