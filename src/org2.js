/* ================= personal, planilla, solicitudes, organigrama trazable, exportar ================= */
var PAR = function (c) { return 'BUSCAR("' + c + '"; Parámetros[Concepto]; Parámetros[Valor])'; };
function seedHR() {
  var P = function (id, n, nombre, user, cargo, area, correo, tel, sede, ingreso, sueldo, af, he, pen) {
    return mkRow(id, n, { nombre: nombre, usuario: user ? [user] : [], cargo: cargo, area: area, correo: correo, telefono: tel, sede: sede, ingreso: ingreso, sueldo: sueldo, asigfam: af, hextra: he, pension: pen }, '2026-01-05T09:00', 'ana');
  };
  var areas = [o('Gerencia General', 'indigo'), o('Administración y Finanzas', 'green'), o('Comercial', 'pink'), o('Operaciones y Proyectos', 'amber')];
  var per = {
    id: 'per', name: 'Personal', desc: 'Ficha de cada persona y su planilla mensual', color: '#047857', icon: 'i-contact', abbr: 'Pe', nextId: 8,
    props: [
      { key: 'nombre', name: 'Nombre', type: 'title' },
      { key: 'usuario', name: 'Usuario de la app', type: 'person', single: true, desc: 'Vincula la ficha con su usuario: así se calcula el costo de sus horas en los proyectos' },
      { key: 'cargo', name: 'Cargo', type: 'text', desc: 'Se actualiza solo desde el organigrama' },
      { key: 'area', name: 'Área', type: 'select', options: areas },
      { key: 'correo', name: 'Correo', type: 'email' },
      { key: 'telefono', name: 'Teléfono', type: 'phone' },
      { key: 'sede', name: 'Sede', type: 'select', options: [o('Lima', 'blue'), o('Arequipa', 'amber'), o('Trujillo', 'teal')] },
      { key: 'ingreso', name: 'Fecha de ingreso', type: 'date', dateFmt: 'short' },
      { key: 'sueldo', name: 'Sueldo básico', type: 'number', fmt: 'money' },
      { key: 'asigfam', name: 'Asignación familiar', type: 'checkbox' },
      { key: 'hextra', name: 'Horas extra', type: 'number', desc: 'Horas extra del mes' },
      { key: 'pension', name: 'Sistema de pensiones', type: 'select', options: [o('ONP', 'blue'), o('AFP', 'violet')] },
      { key: 'vhora', name: 'Valor hora', type: 'formula', expr: '=[Sueldo básico] / ' + PAR('Divisor de horas al mes'), resFmt: 'money', resDec: 2 },
      { key: 'afm', name: 'Asig. familiar (S/)', type: 'formula', expr: '=SI([Asignación familiar]; ' + PAR('RMV') + ' * ' + PAR('Asignación familiar %') + ' / 100; 0)', resFmt: 'money', resDec: 2 },
      { key: 'hem', name: 'Pago horas extra', type: 'formula', expr: '=[Horas extra] * [Valor hora] * (1 + ' + PAR('Recargo horas extra %') + ' / 100)', resFmt: 'money', resDec: 2 },
      { key: 'bruto', name: 'Remuneración bruta', type: 'formula', expr: '=[Sueldo básico] + [Asig. familiar (S/)] + [Pago horas extra]', resFmt: 'money', resDec: 2 },
      { key: 'dpen', name: 'Descuento pensión', type: 'formula', expr: '=SI([Sistema de pensiones] = "ONP"; ' + PAR('ONP %') + '; ' + PAR('AFP % (aporte + prima + comisión)') + ') * [Remuneración bruta] / 100', resFmt: 'money', resDec: 2 },
      { key: 'neto', name: 'Neto a pagar', type: 'formula', expr: '=[Remuneración bruta] - [Descuento pensión]', resFmt: 'money', resDec: 2 },
      { key: 'essalud', name: 'EsSalud (empleador)', type: 'formula', expr: '=[Remuneración bruta] * ' + PAR('EsSalud %') + ' / 100', resFmt: 'money', resDec: 2 },
      { key: 'cmes', name: 'Costo empresa mensual', type: 'formula', expr: '=[Remuneración bruta] * (1 + (' + PAR('EsSalud %') + ' + ' + PAR('Provisión de beneficios %') + ') / 100)', resFmt: 'money', resDec: 0 },
      { key: 'chora', name: 'Costo por hora', type: 'formula', expr: '=REDONDEAR([Costo empresa mensual] / ' + PAR('Divisor de horas al mes') + '; 2)', resFmt: 'money', resDec: 2, desc: 'Se usa para el costo de mano de obra de cada tarea' }
    ],
    rows: [
      P('w1', 1, 'Ana Torres', 'ana', 'Gerente general', 'Gerencia General', 'ana.torres@andina.example', '+51 900 000 101', 'Lima', '2019-03-01', 12000, true, 0, 'AFP'),
      P('w2', 2, 'Marta Quispe', 'marta', 'Jefa de Administración y Finanzas', 'Administración y Finanzas', 'marta.quispe@andina.example', '+51 900 000 102', 'Lima', '2020-07-15', 8500, true, 0, 'AFP'),
      P('w3', 3, 'Sofía Paredes', 'sofia', 'Jefa comercial', 'Comercial', 'sofia.paredes@andina.example', '+51 900 000 103', 'Lima', '2021-02-01', 7800, false, 0, 'ONP'),
      P('w4', 4, 'Jorge Salazar', 'jorge', 'Jefe de Operaciones y Proyectos', 'Operaciones y Proyectos', 'jorge.salazar@andina.example', '+51 900 000 104', 'Lima', '2018-11-12', 9000, true, 6, 'AFP'),
      P('w5', 5, 'Luis Ramírez', 'luis', 'Ejecutivo de ventas', 'Comercial', 'luis.ramirez@andina.example', '+51 900 000 105', 'Arequipa', '2023-05-02', 3500, false, 0, 'ONP'),
      P('w6', 6, 'Pedro Huamán', null, 'Operario de almacén', 'Operaciones y Proyectos', 'pedro.huaman@andina.example', '+51 900 000 106', 'Lima', '2024-01-08', 1500, true, 12, 'ONP'),
      P('w7', 7, 'Rosa Ccori', null, 'Operaria de almacén', 'Operaciones y Proyectos', 'rosa.ccori@andina.example', '+51 900 000 107', 'Trujillo', '2025-04-21', 1300, false, 4, 'AFP')
    ],
    views: [
      mkView('vp1', 'Planilla del mes', 'table', { hidden: ['usuario', 'correo', 'telefono', 'ingreso', 'vhora', 'afm', 'hem', 'sede'], calcs: { sueldo: 'sum', bruto: 'sum', neto: 'sum', essalud: 'sum', cmes: 'sum' } }),
      mkView('vp2', 'Fichas', 'gallery', { hidden: ['sueldo', 'asigfam', 'hextra', 'pension', 'vhora', 'afm', 'hem', 'bruto', 'dpen', 'neto', 'essalud', 'cmes', 'chora'] }),
      mkView('vp3', 'Por área', 'table', { group: 'area', hidden: ['usuario', 'telefono', 'vhora', 'afm', 'hem', 'dpen', 'essalud'] })
    ],
    automations: []
  };
  var Q = function (id, n, c, v, nota) { return mkRow(id, n, { concepto: c, valor: v, nota: nota }, '2026-10-01T09:00', 'marta'); };
  var par = {
    id: 'par', name: 'Parámetros', desc: 'Valores que usa la planilla: cámbialos aquí y todo se recalcula', color: '#0E7490', icon: 'i-calc', abbr: 'Pa', nextId: 9,
    props: [{ key: 'concepto', name: 'Concepto', type: 'title' }, { key: 'valor', name: 'Valor', type: 'number' }, { key: 'nota', name: 'Nota', type: 'text' }],
    rows: [
      Q('k1', 1, 'RMV', 1230, 'Remuneración mínima vital desde el 1/10/2026 (D.S. 015-2026-TR)'),
      Q('k2', 2, 'Asignación familiar %', 10, '10 % de la RMV'),
      Q('k3', 3, 'ONP %', 13, 'Verifica la tasa vigente'),
      Q('k4', 4, 'AFP % (aporte + prima + comisión)', 11.7, 'Ejemplo: depende de la AFP de cada persona'),
      Q('k5', 5, 'EsSalud %', 9, 'Aporte del empleador'),
      Q('k6', 6, 'Provisión de beneficios %', 30, 'Estimado de gratificaciones, CTS y vacaciones'),
      Q('k7', 7, 'Divisor de horas al mes', 240, '30 días × 8 horas'),
      Q('k8', 8, 'Recargo horas extra %', 25, 'Recargo de las dos primeras horas')
    ],
    views: [mkView('vq1', 'Parámetros', 'table', {})],
    automations: []
  };
  var S = function (id, n, t, tipo, who, monto, py, estado, apr, hist, fecha) { return mkRow(id, n, { titulo: t, tipo: tipo, solicitante: [who], monto: monto, proyecto: py ? [py] : [], estado: estado, aprobador: apr ? [apr] : [], historial: hist, fecha: fecha }, fecha + 'T09:00', who); };
  var sol = {
    id: 'sol', name: 'Solicitudes', desc: 'Compras, gastos y cambios que aprueba el jefe directo y luego administración', color: '#9333EA', icon: 'i-clipboard', abbr: 'So', nextId: 5,
    props: [
      { key: 'titulo', name: 'Solicitud', type: 'title' },
      { key: 'tipo', name: 'Tipo', type: 'select', options: [o('Compra', 'blue'), o('Gasto', 'teal'), o('Cambio de alcance', 'violet'), o('Vacaciones', 'green'), o('Contratación', 'amber')] },
      { key: 'solicitante', name: 'Solicitante', type: 'person', single: true },
      { key: 'monto', name: 'Monto', type: 'number', fmt: 'money' },
      { key: 'proyecto', name: 'Proyecto', type: 'relation', target: 'proy', pair: 'solicitudes', single: true },
      { key: 'estado', name: 'Estado', type: 'status', options: [so('Pendiente jefe', 'amber', 'todo'), so('Pendiente administración', 'violet', 'doing'), so('Aprobada', 'green', 'done'), so('Rechazada', 'red', 'done')] },
      { key: 'aprobador', name: 'Aprobador actual', type: 'person', single: true },
      { key: 'fecha', name: 'Fecha', type: 'date', dateFmt: 'short' },
      { key: 'historial', name: 'Historial', type: 'text' }
    ],
    rows: [
      S('s1', 1, 'Compra de 40 racks adicionales', 'Compra', 'jorge', 18500, 'y1', 'Pendiente administración', 'ana', '16/11 · Jorge Salazar envió la solicitud\n16/11 · Ana Torres (jefe directo) la recibió', '2026-11-16'),
      S('s2', 2, 'Licencias del ERP para 10 usuarios', 'Compra', 'marta', 6400, 'y2', 'Pendiente administración', 'ana', '17/11 · Marta Quispe envió la solicitud', '2026-11-17'),
      S('s3', 3, 'Viáticos visita a cliente en Arequipa', 'Gasto', 'luis', 850, 'y3', 'Pendiente jefe', 'sofia', '17/11 · Luis Ramírez envió la solicitud', '2026-11-17'),
      S('s4', 4, 'Ampliar alcance: módulo de compras', 'Cambio de alcance', 'marta', 9000, 'y2', 'Aprobada', null, '10/11 · Marta Quispe envió la solicitud\n11/11 · Ana Torres aprobó (administración)', '2026-11-10')
    ],
    views: [
      mkView('vs1', 'Todas', 'table', { hidden: ['historial'] }),
      mkView('vs2', 'Por aprobar', 'table', { filters: [{ prop: 'aprobador', op: 'contains', value: 'me' }], hidden: ['historial', 'aprobador'] }),
      mkView('vs3', 'Tablero', 'board', { group: 'estado' })
    ],
    automations: []
  };
  return { per: per, par: par, sol: sol };
}

/* ---------- empaquetado ZIP (sin compresión) y descarga ---------- */
var CRC_T = (function () { var t = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(u8) { var c = 0xFFFFFFFF; for (var i = 0; i < u8.length; i++) c = CRC_T[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function utf8(s) { return new TextEncoder().encode(s); }
function zipStore(files) {
  var parts = [], central = [], off = 0;
  function u16(v) { return [v & 255, (v >>> 8) & 255]; }
  function u32(v) { return [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]; }
  files.forEach(function (f) {
    var name = utf8(f.name), data = typeof f.data === 'string' ? utf8(f.data) : f.data, crc = crc32(data);
    var head = [].concat([0x50, 0x4B, 0x03, 0x04], u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0));
    parts.push(new Uint8Array(head), name, data);
    central.push(new Uint8Array([].concat([0x50, 0x4B, 0x01, 0x02], u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off))), name);
    off += head.length + name.length + data.length;
  });
  var cdSize = central.reduce(function (a, b) { return a + b.length; }, 0);
  var end = new Uint8Array([].concat([0x50, 0x4B, 0x05, 0x06], u16(0), u16(0), u16(files.length), u16(files.length), u32(cdSize), u32(off), u16(0)));
  var all = parts.concat(central, [end]), len = all.reduce(function (a, b) { return a + b.length; }, 0), out = new Uint8Array(len), p = 0;
  all.forEach(function (b) { out.set(b, p); p += b.length; });
  return out;
}
function xmlEsc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/[<]/g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function hex6(c) { return String(c || '#888888').replace('#', '').toUpperCase(); }
function rgb01(c) { var h = hex6(c); return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255].map(function (x) { return x.toFixed(3); }).join(' '); }
function fitTxt(s, max) { s = String(s || ''); return s.length > max ? s.slice(0, max - 1) + '…' : s; }

/* organigrama → SVG */
function orgSvg(L, title) {
  var M = 40, T = 56, W = L.w + M * 2, H = L.h + M + T;
  var out = ['<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" font-family="Inter, Arial, sans-serif">', '<rect width="100%" height="100%" fill="#FFFFFF"/>',
    '<text x="' + M + '" y="34" font-size="20" font-weight="700" fill="#1F1F1C">' + xmlEsc(title) + '<\/text>'];
  L.links.forEach(function (k) { out.push('<path d="M' + (k.x1 + M) + ' ' + (k.y1 + T) + ' V' + (k.ym + T) + ' H' + (k.x2 + M) + ' V' + (k.y2 + T) + '" fill="none" stroke="#A8A6A0" stroke-width="1.4"/>'); });
  L.boxes.forEach(function (b) {
    var x = b.x + M, y = b.y + T;
    out.push('<rect x="' + x + '" y="' + y + '" width="' + b.w + '" height="' + b.h + '" rx="10" fill="#FFFFFF" stroke="#DEDCD6"/>');
    out.push('<rect x="' + x + '" y="' + y + '" width="' + b.w + '" height="4" rx="2" fill="' + b.color + '"/>');
    out.push('<text x="' + (x + 12) + '" y="' + (y + 22) + '" font-size="10.5" font-weight="600" fill="#6B6A65">' + xmlEsc(fitTxt(b.areaName, 30)) + '<\/text>');
    out.push('<text x="' + (x + 12) + '" y="' + (y + 42) + '" font-size="13" font-weight="700" fill="#1F1F1C">' + xmlEsc(fitTxt(b.name, 26)) + '<\/text>');
    out.push('<text x="' + (x + 12) + '" y="' + (y + 62) + '" font-size="12" fill="' + (b.vacant ? '#8C8C86' : '#3D3D3A') + '">' + xmlEsc(fitTxt(b.person, 28)) + '<\/text>');
  });
  out.push('<\/svg>');
  return out.join('');
}
/* organigrama → PDF vectorial (A4 horizontal) */
function orgPdf(L, title) {
  var PW = 842, PH = 595, M = 30, TOP = 58;
  var sc = Math.min((PW - M * 2) / L.w, (PH - TOP - M) / L.h, 1);
  var ox = (PW - L.w * sc) / 2, oy = PH - TOP;
  function X(v) { return (ox + v * sc).toFixed(2); }
  function Y(v) { return (oy - v * sc).toFixed(2); }
  function str(s) { return '(' + String(s).replace(/[—–]/g, '-').replace(/…/g, '...').replace(/[^\x20-\xFF]/g, '?').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)') + ')'; }
  var c = [];
  c.push('BT /F2 16 Tf 0.12 0.12 0.11 rg ' + M + ' ' + (PH - 36) + ' Td ' + str(title) + ' Tj ET');
  c.push('0.66 0.65 0.63 RG ' + (1.2 * sc).toFixed(2) + ' w');
  L.links.forEach(function (k) { c.push(X(k.x1) + ' ' + Y(k.y1) + ' m ' + X(k.x1) + ' ' + Y(k.ym) + ' l ' + X(k.x2) + ' ' + Y(k.ym) + ' l ' + X(k.x2) + ' ' + Y(k.y2) + ' l S'); });
  L.boxes.forEach(function (b) {
    var x = X(b.x), y = Y(b.y + b.h), w = (b.w * sc).toFixed(2), h = (b.h * sc).toFixed(2);
    c.push('1 1 1 rg 0.87 0.86 0.84 RG 0.8 w ' + x + ' ' + y + ' ' + w + ' ' + h + ' re B');
    c.push(rgb01(b.color) + ' rg ' + x + ' ' + (Number(y) + Number(h) - 3 * sc).toFixed(2) + ' ' + w + ' ' + (3 * sc).toFixed(2) + ' re f');
    var tx = (Number(x) + 10 * sc).toFixed(2);
    c.push('BT /F1 ' + (8.5 * sc).toFixed(2) + ' Tf 0.42 0.42 0.4 rg ' + tx + ' ' + Y(b.y + 22) + ' Td ' + str(fitTxt(b.areaName, 30)) + ' Tj ET');
    c.push('BT /F2 ' + (11 * sc).toFixed(2) + ' Tf 0.12 0.12 0.11 rg ' + tx + ' ' + Y(b.y + 42) + ' Td ' + str(fitTxt(b.name, 26)) + ' Tj ET');
    c.push('BT /F1 ' + (10 * sc).toFixed(2) + ' Tf 0.3 0.3 0.28 rg ' + tx + ' ' + Y(b.y + 62) + ' Td ' + str(fitTxt(b.person, 28)) + ' Tj ET');
  });
  var content = c.join('\n');
  var objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PW + ' ' + PH + '] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    '<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream'
  ];
  var pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', offs = [];
  objs.forEach(function (ob, i) { offs.push(pdf.length); pdf += (i + 1) + ' 0 obj\n' + ob + '\nendobj\n'; });
  var xref = pdf.length;
  pdf += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n' + offs.map(function (o) { return ('0000000000' + o).slice(-10) + ' 00000 n \n'; }).join('') + 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
  var u8 = new Uint8Array(pdf.length);
  for (var i = 0; i < pdf.length; i++) u8[i] = pdf.charCodeAt(i) & 0xFF;
  return u8;
}
/* organigrama → PowerPoint editable (cada cargo es una forma con texto) */
function orgPptx(L, title) {
  var EMU = 12700, SW = 12192000, SH = 6858000, M = 0.4 * 914400, TOP = 0.95 * 914400;
  var sc = Math.min((SW - M * 2) / (L.w * EMU), (SH - TOP - M) / (L.h * EMU), 1.2);
  var ox = Math.round((SW - L.w * EMU * sc) / 2), oy = TOP;
  function E(v) { return Math.round(v * EMU * sc); }
  var id = 2, sp = [];
  function run(text, sz, bold, color) { return '<a:r><a:rPr lang="es-PE" sz="' + Math.max(600, Math.round(sz * 100 * sc)) + '"' + (bold ? ' b="1"' : '') + ' dirty="0"><a:solidFill><a:srgbClr val="' + color + '"/><\/a:solidFill><a:latin typeface="Calibri"/><\/a:rPr><a:t>' + xmlEsc(text) + '<\/a:t><\/a:r>'; }
  sp.push('<p:sp><p:nvSpPr><p:cNvPr id="' + (id++) + '" name="Título"/><p:cNvSpPr txBox="1"/><p:nvPr/><\/p:nvSpPr><p:spPr><a:xfrm><a:off x="' + M + '" y="' + Math.round(0.3 * 914400) + '"/><a:ext cx="' + (SW - M * 2) + '" cy="' + Math.round(0.5 * 914400) + '"/><\/a:xfrm><a:prstGeom prst="rect"><a:avLst/><\/a:prstGeom><a:noFill/><\/p:spPr><p:txBody><a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0"/><a:lstStyle/><a:p>' + run(title, 22 / sc, true, '1F1F1C') + '<\/a:p><\/p:txBody><\/p:sp>');
  function line(x1, y1, x2, y2) {
    var x = Math.min(x1, x2), y = Math.min(y1, y2), w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
    sp.push('<p:cxnSp><p:nvCxnSpPr><p:cNvPr id="' + (id++) + '" name="Línea ' + id + '"/><p:cNvCxnSpPr/><p:nvPr/><\/p:nvCxnSpPr><p:spPr><a:xfrm><a:off x="' + (ox + E(x)) + '" y="' + (oy + E(y)) + '"/><a:ext cx="' + E(w) + '" cy="' + E(h) + '"/><\/a:xfrm><a:prstGeom prst="line"><a:avLst/><\/a:prstGeom><a:ln w="15875"><a:solidFill><a:srgbClr val="A8A6A0"/><\/a:solidFill><\/a:ln><\/p:spPr><\/p:cxnSp>');
  }
  L.links.forEach(function (k) { line(k.x1, k.y1, k.x1, k.ym); line(Math.min(k.x1, k.x2), k.ym, Math.max(k.x1, k.x2), k.ym); line(k.x2, k.ym, k.x2, k.y2); });
  L.boxes.forEach(function (b) {
    var x = ox + E(b.x), y = oy + E(b.y), w = E(b.w), h = E(b.h);
    sp.push('<p:sp><p:nvSpPr><p:cNvPr id="' + (id++) + '" name="' + xmlEsc(b.name) + '"/><p:cNvSpPr/><p:nvPr/><\/p:nvSpPr><p:spPr><a:xfrm><a:off x="' + x + '" y="' + y + '"/><a:ext cx="' + w + '" cy="' + h + '"/><\/a:xfrm><a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 10000"/><\/a:avLst><\/a:prstGeom><a:solidFill><a:srgbClr val="FFFFFF"/><\/a:solidFill><a:ln w="12700"><a:solidFill><a:srgbClr val="' + hex6(b.color) + '"/><\/a:solidFill><\/a:ln><\/p:spPr>' +
      '<p:txBody><a:bodyPr wrap="square" lIns="91440" tIns="45720" rIns="91440" bIns="45720" anchor="ctr"><a:normAutofit/><\/a:bodyPr><a:lstStyle/>' +
      '<a:p>' + run(b.areaName, 8, true, hex6(b.color)) + '<\/a:p><a:p>' + run(b.name, 11, true, '1F1F1C') + '<\/a:p><a:p>' + run(b.person, 9.5, false, b.vacant ? '8C8C86' : '3D3D3A') + '<\/a:p><\/p:txBody><\/p:sp>');
  });
  var NS = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"';
  var HDR = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  var grp = '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/><\/p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/><\/a:xfrm><\/p:grpSpPr>';
  var REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/';
  var theme = HDR + '<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Trama"><a:themeElements><a:clrScheme name="Trama"><a:dk1><a:srgbClr val="1F1F1C"/><\/a:dk1><a:lt1><a:srgbClr val="FFFFFF"/><\/a:lt1><a:dk2><a:srgbClr val="312E81"/><\/a:dk2><a:lt2><a:srgbClr val="F4F3EF"/><\/a:lt2><a:accent1><a:srgbClr val="4F46E5"/><\/a:accent1><a:accent2><a:srgbClr val="047857"/><\/a:accent2><a:accent3><a:srgbClr val="BE185D"/><\/a:accent3><a:accent4><a:srgbClr val="B45309"/><\/a:accent4><a:accent5><a:srgbClr val="0E7490"/><\/a:accent5><a:accent6><a:srgbClr val="6D28D9"/><\/a:accent6><a:hlink><a:srgbClr val="4F46E5"/><\/a:hlink><a:folHlink><a:srgbClr val="6D28D9"/><\/a:folHlink><\/a:clrScheme>' +
    '<a:fontScheme name="Trama"><a:majorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/><\/a:majorFont><a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/><\/a:minorFont><\/a:fontScheme>' +
    '<a:fmtScheme name="Trama"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/><\/a:solidFill><a:solidFill><a:schemeClr val="phClr"/><\/a:solidFill><a:solidFill><a:schemeClr val="phClr"/><\/a:solidFill><\/a:fillStyleLst><a:lnStyleLst><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/><\/a:solidFill><\/a:ln><a:ln w="12700"><a:solidFill><a:schemeClr val="phClr"/><\/a:solidFill><\/a:ln><a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/><\/a:solidFill><\/a:ln><\/a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/><\/a:effectStyle><a:effectStyle><a:effectLst/><\/a:effectStyle><a:effectStyle><a:effectLst/><\/a:effectStyle><\/a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/><\/a:solidFill><a:solidFill><a:schemeClr val="phClr"/><\/a:solidFill><a:solidFill><a:schemeClr val="phClr"/><\/a:solidFill><\/a:bgFillStyleLst><\/a:fmtScheme><\/a:themeElements><\/a:theme>';
  var files = [
    { name: '[Content_Types].xml', data: HDR + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/><\/Types>' },
    { name: '_rels/.rels', data: HDR + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + REL + 'officeDocument" Target="ppt/presentation.xml"/><\/Relationships>' },
    { name: 'ppt/presentation.xml', data: HDR + '<p:presentation ' + NS + '><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/><\/p:sldMasterIdLst><p:sldIdLst><p:sldId id="256" r:id="rId2"/><\/p:sldIdLst><p:sldSz cx="' + SW + '" cy="' + SH + '"/><p:notesSz cx="6858000" cy="9144000"/><\/p:presentation>' },
    { name: 'ppt/_rels/presentation.xml.rels', data: HDR + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + REL + 'slideMaster" Target="slideMasters/slideMaster1.xml"/><Relationship Id="rId2" Type="' + REL + 'slide" Target="slides/slide1.xml"/><Relationship Id="rId3" Type="' + REL + 'theme" Target="theme/theme1.xml"/><\/Relationships>' },
    { name: 'ppt/slides/slide1.xml', data: HDR + '<p:sld ' + NS + '><p:cSld><p:spTree>' + grp + sp.join('') + '<\/p:spTree><\/p:cSld><p:clrMapOvr><a:masterClrMapping/><\/p:clrMapOvr><\/p:sld>' },
    { name: 'ppt/slides/_rels/slide1.xml.rels', data: HDR + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + REL + 'slideLayout" Target="../slideLayouts/slideLayout1.xml"/><\/Relationships>' },
    { name: 'ppt/slideLayouts/slideLayout1.xml', data: HDR + '<p:sldLayout ' + NS + ' type="blank" preserve="1"><p:cSld name="En blanco"><p:spTree>' + grp + '<\/p:spTree><\/p:cSld><p:clrMapOvr><a:masterClrMapping/><\/p:clrMapOvr><\/p:sldLayout>' },
    { name: 'ppt/slideLayouts/_rels/slideLayout1.xml.rels', data: HDR + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + REL + 'slideMaster" Target="../slideMasters/slideMaster1.xml"/><\/Relationships>' },
    { name: 'ppt/slideMasters/slideMaster1.xml', data: HDR + '<p:sldMaster ' + NS + '><p:cSld><p:bg><p:bgRef idx="1001"><a:schemeClr val="bg1"/><\/p:bgRef><\/p:bg><p:spTree>' + grp + '<\/p:spTree><\/p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/><\/p:sldLayoutIdLst><\/p:sldMaster>' },
    { name: 'ppt/slideMasters/_rels/slideMaster1.xml.rels', data: HDR + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + REL + 'slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="' + REL + 'theme" Target="../theme/theme1.xml"/><\/Relationships>' },
    { name: 'ppt/theme/theme1.xml', data: theme }
  ];
  return zipStore(files);
}

Object.assign(Component.prototype, {
  /* ---------- descargas ---------- */
  download(name, mime, data) {
    try {
      var blob = data instanceof Blob ? data : new Blob([data], { type: mime });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = name; a.rel = 'noopener';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
      this.toastMsg('Descargando ' + name);
    } catch (e) { this.toastMsg('Este visor no permite descargas. En la versión publicada sí funciona.'); }
  },
  orgExport(kind) {
    var self = this, s = this.st(), v = this.viewer(s);
    var d = this.orgData(s, v);
    var L = { w: d.w, h: d.h, boxes: d.boxes, links: d.links };
    var title = 'Organigrama · ' + s.ws;
    var base = 'organigrama-' + String(s.ws).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (kind === 'svg') { this.download(base + '.svg', 'image/svg+xml', orgSvg(L, title)); return; }
    if (kind === 'pdf') { this.download(base + '.pdf', 'application/pdf', orgPdf(L, title)); return; }
    if (kind === 'pptx') { this.download(base + '.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', orgPptx(L, title)); return; }
    if (kind === 'png') {
      try {
        var svg = orgSvg(L, title), img = new Image();
        img.onload = function () {
          var cv = document.createElement('canvas'); cv.width = img.width * 2; cv.height = img.height * 2;
          var cx = cv.getContext('2d'); cx.scale(2, 2); cx.drawImage(img, 0, 0);
          cv.toBlob(function (b) { if (b) self.download(base + '.png', 'image/png', b); }, 'image/png');
        };
        img.onerror = function () { self.toastMsg('No se pudo generar la imagen.'); };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      } catch (e) { this.toastMsg('No se pudo generar la imagen.'); }
    }
  },

  /* ---------- personas ---------- */
  personRow(s, mid) { var t = s.tables.byId.per; if (!t || !mid) return null; return t.rows.filter(function (r) { return (r.usuario || []).indexOf(mid) >= 0; })[0] || null; },
  workload(s, mid) {
    var t = s.tables.byId.tar, h = 0, n = 0;
    if (t) t.rows.forEach(function (r) { if ((r.responsable || []).indexOf(mid) >= 0 && r.estado !== 'Hecha') { n++; h += Number(r.horas) || 0; } });
    var al = this.pmIssues(s, { id: mid, role: 'admin' }, { mine: true }).length;
    return { h: h, n: n, al: al };
  },
  openItems(s, mid) {
    var out = [], self = this;
    function add(tid, prop, ok, what) { var t = s.tables.byId[tid]; if (!t) return; t.rows.forEach(function (r) { if ((r[prop] || []).indexOf(mid) >= 0 && ok(r)) out.push({ tid: tid, rid: r.id, prop: prop, label: self.titleOf(t, r), what: what, icon: ICON[t.icon] || ICON.db, color: t.color, on: true }); }); }
    add('tar', 'responsable', function (r) { return r.estado !== 'Hecha'; }, 'Tarea');
    add('rie', 'responsable', function (r) { return r.estado !== 'Cerrado'; }, 'Riesgo');
    add('proy', 'director', function (r) { return r.fase !== 'Cierre'; }, 'Proyecto que dirige');
    add('sol', 'aprobador', function (r) { return r.estado === 'Pendiente jefe' || r.estado === 'Pendiente administración'; }, 'Solicitud por aprobar');
    return out;
  },
  orgAssign(cid, mid) {
    var s = this.st(), self = this;
    var c = this.orgCargo(s, cid);
    if (!c) return;
    var prev = c.person || null;
    if (prev === (mid || null)) return;
    var today = todayIso();
    var org = clone(s.org);
    org.cargos.forEach(function (x) {
      if (mid && x.person === mid && x.id !== cid) { x.hist = (x.hist || []).concat([{ person: mid, hasta: today }]); x.person = null; }
      if (x.id === cid) { x.hist = (x.hist || []); if (prev) x.hist.push({ person: prev, hasta: today }); x.person = mid || null; x.desde = today; }
    });
    var tables = clone(s.tables), per = tables.byId.per;
    if (per) per.rows.forEach(function (r) {
      var u = (r.usuario || [])[0]; if (!u) return;
      var cc = null; org.cargos.forEach(function (x) { if (x.person === u) cc = x; });
      var a = cc ? org.areas.filter(function (y) { return y.id === cc.area; })[0] : null;
      r.cargo = cc ? cc.name : 'Sin cargo'; if (a) r.area = a.name;
    });
    var m = mid ? this.memberById(s, mid) : null;
    var patch = { org: org, tables: tables, log: this.addLog(s, (m ? 'asignó a ' + m.name : 'dejó vacante') + ' el cargo «' + c.name + '»') };
    var items = prev && mid ? this.openItems(s, prev) : [];
    if (items.length) patch.reassign = { cid: cid, from: prev, to: mid, items: items };
    this.setState(patch);
  },
  reassignApply() {
    var s = this.st(), ra = s.reassign;
    if (!ra) return;
    var tables = clone(s.tables), n = 0;
    ra.items.forEach(function (it) {
      if (!it.on) return;
      var r = findRow(tables.byId[it.tid], it.rid); if (!r) return;
      r[it.prop] = (r[it.prop] || []).map(function (x) { return x === ra.from ? ra.to : x; }); n++;
    });
    var to = this.memberById(s, ra.to), from = this.memberById(s, ra.from);
    var notifs = s.notifs.slice();
    if (n) notifs.unshift({ id: 'nt' + Math.random().toString(36).slice(2, 10), to: ra.to, text: 'Recibiste ' + n + ' pendientes de ' + (from ? from.name : 'tu antecesor') + ' por cambio de cargo', when: 'Ahora', table: 'tar', row: null, read: false });
    this.setState({ tables: tables, reassign: null, notifs: notifs, log: this.addLog(s, 'transfirió ' + n + ' pendientes de ' + (from ? from.name : '') + ' a ' + (to ? to.name : '')) });
    this.toastMsg(n ? 'Se transfirieron ' + n + ' pendientes a ' + (to ? to.name : '') : 'No se transfirió nada');
  },

  /* ---------- arrastrar cargos ---------- */
  orgDescends(s, cid, target) { var c = this.orgCargo(s, target), g = 0; while (c && g++ < 50) { if (c.id === cid) return true; c = this.orgCargo(s, c.parent); } return false; },
  orgMoveOK(s, cid, target, zone) {
    if (!cid || cid === target) return false;
    var tc = this.orgCargo(s, target); if (!tc) return false;
    if (zone === 'above') return !this.orgDescends(s, cid, target);
    var np = zone === 'child' ? target : tc.parent;
    return !(np && this.orgDescends(s, cid, np));
  },
  orgMoveCommit(cid, target, zone) {
    var self = this, s = this.st(), c = this.orgCargo(s, cid), tc = this.orgCargo(s, target);
    if (!c || !tc) return;
    var txt = zone === 'child' ? '«' + c.name + '» ahora reporta a «' + tc.name + '»' : zone === 'above' ? '«' + c.name + '» quedó por encima de «' + tc.name + '»' : '«' + c.name + '» se movió junto a «' + tc.name + '»';
    this.updOrg(function (org) { org.cargos = self.orgSimMove(org.cargos, cid, target, zone); }, 'reorganizó el organigrama: ' + txt);
    this.toastMsg(txt);
  },
  /* puntero: pulsar, mover más de 6 px = arrastrar.
     La tarjeta se mueve con un contenedor interno (.org-jel) que la plantilla nunca reescribe,
     así los repintados no la hacen parpadear. La física usa el tiempo real entre cuadros. */
  orgPtrDown(cid, e) {
    if (this._od) return;
    if (e.button != null && e.button !== 0) return;
    var el = e.currentTarget, chart = el && el.closest ? el.closest('.org-chart') : null;
    var jel = el ? el.parentNode : null;
    if (!chart || !jel || !jel.classList || !jel.classList.contains('org-jel')) return;
    var self = this;
    this._od = { cid: cid, el: el, jel: jel, chart: chart, sx: e.clientX, sy: e.clientY, px: e.clientX, py: e.clientY, started: false, cx: 0, cy: 0, rot: 0, rv: 0, kx: 1, ky: 1, kxv: 0, kyv: 0, t: 0, pend: null, pendAt: 0 };
    this._omv = function (ev) { self.orgPtrMove(ev); };
    this._oup = function (ev) { self.orgPtrUp(ev, false); };
    this._okd = function (ev) { if (ev.key === 'Escape') self.orgPtrUp(ev, true); };
    window.addEventListener('pointermove', this._omv); window.addEventListener('pointerup', this._oup);
    window.addEventListener('pointercancel', this._oup); window.addEventListener('keydown', this._okd);
  },
  orgPtrUnbind() {
    window.removeEventListener('pointermove', this._omv); window.removeEventListener('pointerup', this._oup);
    window.removeEventListener('pointercancel', this._oup); window.removeEventListener('keydown', this._okd);
  },
  orgPtrMove(ev) {
    var d = this._od; if (!d || d.landing) return;
    d.px = ev.clientX; d.py = ev.clientY;
    if (!d.started) { if (Math.hypot(d.px - d.sx, d.py - d.sy) < 6) return; this.orgDragBegin(); }
  },
  orgScale(d) { var r = d.chart.getBoundingClientRect(), w = d.chart.offsetWidth; return w ? r.width / w : 1; },
  orgDragBegin() {
    var d = this._od, s = this.st(), lay = this._orgLay || this.orgLayout(s, s.org.cargos), p = lay.pos[d.cid];
    if (!p) { this.orgPtrUnbind(); this._od = null; return; }
    d.ox = p.x; d.oy = p.d * (lay.H + lay.GY); d.r0 = d.chart.getBoundingClientRect(); d.k = this.orgScale(d) || 1; d.started = true;
    try { document.body.classList.add('org-dragging'); } catch (e) { }
    d.jel.style.transition = 'none'; d.jel.style.willChange = 'transform';
    this.setState({ orgDrag: { cid: d.cid, ox: d.ox, oy: d.oy, target: null, zone: null, bad: false, area: null }, orgLanded: null });
    this.orgLoop(0);
  },
  orgLoop(ts) {
    var self = this, d = this._od; if (!d || !d.started || d.landing) return;
    var dt = d.t && ts ? Math.min(64, Math.max(1, ts - d.t)) : 16.7; d.t = ts || 0;
    var f = dt / 16.7, ease = function (k) { return 1 - Math.pow(1 - k, f); };
    var rn = d.chart.getBoundingClientRect();
    var tx = ((d.px - d.sx) + (d.r0.left - rn.left)) / d.k, ty = ((d.py - d.sy) + (d.r0.top - rn.top)) / d.k;
    d.cx += (tx - d.cx) * ease(0.32); d.cy += (ty - d.cy) * ease(0.32);
    var lx = tx - d.cx, ly = ty - d.cy;
    var cl = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
    var rt = cl(lx * 0.12, -8, 8);
    d.rv = (d.rv + (rt - d.rot) * 0.18 * f) * Math.pow(0.78, f); d.rot += d.rv * f;
    var kxT = 1.04 + cl(Math.abs(lx) * 0.003, 0, 0.07) - cl(Math.abs(ly) * 0.0015, 0, 0.04);
    var kyT = 1.04 + cl(Math.abs(ly) * 0.003, 0, 0.07) - cl(Math.abs(lx) * 0.0015, 0, 0.04);
    d.kxv = (d.kxv + (kxT - d.kx) * 0.2 * f) * Math.pow(0.76, f); d.kx += d.kxv * f;
    d.kyv = (d.kyv + (kyT - d.ky) * 0.2 * f) * Math.pow(0.76, f); d.ky += d.kyv * f;
    d.jel.style.transform = 'translate3d(' + d.cx.toFixed(2) + 'px,' + d.cy.toFixed(2) + 'px,0) rotate(' + d.rot.toFixed(2) + 'deg) scale(' + d.kx.toFixed(4) + ',' + d.ky.toFixed(4) + ')';
    try {
      var sc = d.chart.parentNode, rr = sc.getBoundingClientRect();
      if (d.px < rr.left + 50) sc.scrollLeft -= 10 * f; else if (d.px > rr.right - 50) sc.scrollLeft += 10 * f;
      if (d.py < 70) window.scrollBy(0, -12 * f); else if (d.py > window.innerHeight - 70) window.scrollBy(0, 12 * f);
    } catch (err) { }
    this.orgHitUpdate(Date.now());
    d.raf = requestAnimationFrame(function (t2) { self.orgLoop(t2); });
  },
  /* calcula sobre qué cargo y en qué zona está el puntero; solo repinta si la zona se mantiene 70 ms */
  orgHitCalc() {
    var d = this._od, s = this.st(), lay = this._orgLay;
    var aid = null;
    try { var els = document.elementsFromPoint(d.px, d.py); for (var i = 0; i < els.length; i++) { var a = els[i].getAttribute && els[i].getAttribute('data-aid'); if (a) { aid = a; break; } } } catch (err) { }
    if (aid) return { area: aid, target: null, zone: null, bad: false };
    var r = d.chart.getBoundingClientRect(), px = (d.px - r.left) / d.k, py = (d.py - r.top) / d.k, step = lay.H + lay.GY, W = lay.W, H = lay.H;
    var gp = lay.pos[d.cid];
    var dr = s.orgDrag || {};
    if (gp && px >= gp.x && px <= gp.x + W && py >= gp.d * step && py <= gp.d * step + H) return { area: null, target: dr.target || null, zone: dr.zone || null, bad: !!dr.bad };
    for (var id in lay.pos) {
      if (id === d.cid) continue;
      var p = lay.pos[id], x = p.x, y = p.d * step;
      if (px >= x && px <= x + W && py >= y && py <= y + H) {
        var fx = (px - x) / W, fy = (py - y) / H;
        var zone = fy < 0.24 ? 'above' : fx < 0.24 ? 'before' : fx > 0.76 ? 'after' : 'child';
        return { area: null, target: id, zone: zone, bad: !this.orgMoveOK(s, d.cid, id, zone) };
      }
    }
    /* sobre un hueco dentro del organigrama: se mantiene la vista previa (evita que salte); fuera de él se cancela */
    var cw = d.chart.offsetWidth || (r.width / d.k), ch = d.chart.offsetHeight || (r.height / d.k);
    if (px > -40 && py > -40 && px < cw + 40 && py < ch + 40) return { area: null, target: dr.target || null, zone: dr.zone || null, bad: !!dr.bad };
    return { area: null, target: null, zone: null, bad: false };
  },
  orgHitUpdate(now) {
    var d = this._od, s = this.st(); if (!d || !d.started || !this._orgLay) return;
    if (d.freeze && now < d.freeze) return;
    var h = this.orgHitCalc(), dr = s.orgDrag || {};
    var same = function (a, b) { return a && b && a.target === b.target && a.zone === b.zone && a.area === b.area && !!a.bad === !!b.bad; };
    if (same(h, { target: dr.target || null, zone: dr.zone || null, area: dr.area || null, bad: dr.bad })) { d.pend = null; return; }
    if (!same(h, d.pend)) { d.pend = h; d.pendAt = now; return; }
    if (now - d.pendAt < 70) return;
    d.pend = null;
    /* mientras los demás cargos se acomodan no se vuelve a medir: así la vista previa no oscila */
    if (h.target !== dr.target) d.freeze = now + 380;
    this.setState({ orgDrag: Object.assign({}, dr, h) });
  },
  orgPtrUp(ev, cancel) {
    var d = this._od; this.orgPtrUnbind();
    if (!d) return;
    if (!d.started) { this._od = null; return; }
    if (d.landing) return;
    if (!cancel && !(d.freeze && Date.now() < d.freeze)) { var h = this.orgHitCalc(); var dr0 = this.st().orgDrag || {}; if (h.target !== dr0.target || h.zone !== dr0.zone || h.area !== dr0.area) this.setState({ orgDrag: Object.assign({}, dr0, h) }); }
    d.landing = true; cancelAnimationFrame(d.raf);
    this._noClick = Date.now();
    var self = this, s = this.st(), dr = s.orgDrag || {};
    var okMove = !cancel && dr.target && !dr.bad, okArea = !cancel && !!dr.area, jel = d.jel;
    var tx = 0, ty = 0, fin = null;
    if (okMove) {
      var sim = this.orgLayout(s, this.orgSimMove(s.org.cargos, d.cid, dr.target, dr.zone)), p = sim.pos[d.cid];
      if (p) { fin = { x: p.x, y: p.d * (sim.H + sim.GY) }; tx = fin.x - d.ox; ty = fin.y - d.oy; }
    }
    jel.style.transition = 'transform .42s cubic-bezier(.3,1.5,.5,1)';
    jel.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0) rotate(0deg) scale(1,1)';
    if (!okMove) this.setState({ orgDrag: { cid: d.cid, ox: d.ox, oy: d.oy, target: null, zone: null, bad: false, area: null } });
    setTimeout(function () {
      try { document.body.classList.remove('org-dragging'); } catch (e) { }
      var slot = jel.parentNode;
      jel.style.transition = 'none'; jel.style.transform = ''; jel.style.willChange = '';
      if (okMove && fin && slot && slot.style) { slot.style.transition = 'none'; slot.style.left = fin.x + 'px'; slot.style.top = fin.y + 'px'; }
      if (okMove) {
        self.orgMoveCommit(d.cid, dr.target, dr.zone);
        self.setState({ orgDrag: { cid: d.cid, commit: true }, orgLanded: d.cid });
        setTimeout(function () { self.setState({ orgDrag: null }); if (slot && slot.style) slot.style.transition = ''; jel.style.transition = ''; }, 90);
        setTimeout(function () { if (self.st().orgLanded === d.cid) self.setState({ orgLanded: null }); }, 900);
      } else {
        jel.style.transition = '';
        if (okArea) { var ar = self.orgArea(self.st(), dr.area); self.updOrg(function (org) { org.cargos.forEach(function (x) { if (x.id === d.cid) x.area = dr.area; }); }, 'cambió de área un cargo'); self.toastMsg('Cargo movido al área ' + (ar ? ar.name : '')); self.setState({ orgDrag: null, orgLanded: d.cid }); setTimeout(function () { if (self.st().orgLanded === d.cid) self.setState({ orgLanded: null }); }, 900); }
        else self.setState({ orgDrag: null });
      }
      self._od = null;
    }, 430);
  },

  /* ---------- solicitudes y aprobaciones ---------- */
  bossOf(s, mid) {
    var c = this.cargoOf(s, mid), g = 0;
    var p = c ? this.orgCargo(s, c.parent) : null;
    while (p && g++ < 30) { if (p.person && p.person !== mid) return p.person; p = this.orgCargo(s, p.parent); }
    return null;
  },
  appAdmin(s) { var a = s.members.filter(function (m) { return m.role === 'admin' && !m.pending; })[0]; return a ? a.id : 'ana'; },
  solInit(s, row, v) {
    var boss = this.bossOf(s, v.id), admin = this.appAdmin(s);
    row.solicitante = [v.id]; row.fecha = todayIso();
    if (boss && boss !== admin) { row.estado = 'Pendiente jefe'; row.aprobador = [boss]; }
    else { row.estado = 'Pendiente administración'; row.aprobador = [admin]; }
    row.historial = fmtShort(todayIso()) + ' · ' + v.name + ' envió la solicitud';
  },
  solAct(rid, ok) {
    var s = this.st(), v = this.viewer(s);
    var tables = clone(s.tables), t = tables.byId.sol, r = findRow(t, rid);
    if (!r) return;
    var admin = this.appAdmin(s), isAdmin = v.role === 'admin';
    var cur = (r.aprobador || [])[0];
    if (cur !== v.id && !isAdmin) { this.toastMsg('Solo el aprobador actual o administración pueden decidir.'); return; }
    var stage = r.estado === 'Pendiente jefe' ? 'jefe directo' : 'administración';
    var line = fmtShort(todayIso()) + ' · ' + v.name + (ok ? ' aprobó' : ' rechazó') + ' (' + stage + ')';
    var notifs = s.notifs.slice(), who = (r.solicitante || [])[0];
    if (!ok) { r.estado = 'Rechazada'; r.aprobador = []; }
    else if (r.estado === 'Pendiente jefe' && admin !== v.id) { r.estado = 'Pendiente administración'; r.aprobador = [admin]; notifs.unshift({ id: 'nt' + Math.random().toString(36).slice(2, 10), to: admin, text: 'Tienes por aprobar: ' + r.titulo, when: 'Ahora', table: 'sol', row: r.id, read: false }); }
    else { r.estado = 'Aprobada'; r.aprobador = []; }
    r.historial = (r.historial ? r.historial + '\n' : '') + line;
    r._eAt = nowIso(); r._eBy = v.id;
    if (who) notifs.unshift({ id: 'nt' + Math.random().toString(36).slice(2, 10), to: who, text: 'Tu solicitud «' + r.titulo + '» está ' + r.estado.toLowerCase(), when: 'Ahora', table: 'sol', row: r.id, read: false });
    this.setState({ tables: tables, notifs: notifs, log: this.addLog(s, (ok ? 'aprobó' : 'rechazó') + ' la solicitud «' + r.titulo + '»') });
    this.toastMsg('Solicitud ' + r.estado.toLowerCase());
  },
  solView(s, v, row) {
    var self = this;
    var name = function (id) { var m = self.memberById(s, id); return m ? m.name : '—'; };
    var who = (row.solicitante || [])[0], boss = this.bossOf(s, who), admin = this.appAdmin(s), cur = (row.aprobador || [])[0];
    var st = row.estado;
    var jefeState = st === 'Pendiente jefe' ? 'now' : (st === 'Rechazada' && /jefe directo/.test(row.historial || '') && /rechazó \(jefe/.test(row.historial || '')) ? 'no' : (boss && boss !== admin ? 'ok' : 'skip');
    var admState = st === 'Pendiente administración' ? 'now' : st === 'Aprobada' ? 'ok' : st === 'Rechazada' && jefeState !== 'no' ? 'no' : 'wait';
    var lab = { now: 'Pendiente', ok: 'Aprobó', no: 'Rechazó', skip: 'No aplica', wait: 'En espera' };
    var steps = [
      { label: 'Solicitud', who: name(who), state: 'ok', txt: 'Enviada' },
      { label: 'Jefe directo', who: boss && boss !== admin ? name(boss) : 'Sin jefe intermedio', state: jefeState, txt: lab[jefeState] },
      { label: 'Administración', who: name(admin), state: admState, txt: lab[admState] }
    ].map(function (x, i) { return { label: x.label, who: x.who, cls: 'st-' + x.state, txt: x.txt, n: String(i + 1) }; });
    var pending = st === 'Pendiente jefe' || st === 'Pendiente administración';
    var canAct = pending && (cur === v.id || v.role === 'admin');
    return { has: true, steps: steps, canAct: canAct, waiting: pending && !canAct, waitTxt: 'Esperando a ' + name(cur),
      overrideNote: canAct && cur !== v.id ? 'Como administración puedes decidir aunque no seas el aprobador actual.' : '',
      hasOverride: canAct && cur !== v.id,
      hist: String(row.historial || '').split('\n').filter(function (x) { return x.trim(); }).map(function (x) { return { text: x }; }),
      approve: function () { self.solAct(row.id, true); }, reject: function () { self.solAct(row.id, false); } };
  }
});
function fmtShort(iso) { var d = String(iso || '').slice(0, 10).split('-'); return d.length === 3 ? d[2] + '/' + d[1] : ''; }

/* ---------- organigrama: datos extra para la pantalla ---------- */
var _orgDataBase = Component.prototype.orgData;
Object.assign(Component.prototype, {
  orgData(s, v) {
    var self = this, d = _orgDataBase.call(this, s, v), isAdmin = v.role === 'admin' && !s.useMode;
    d.boxes.forEach(function (b) {
      var c = b.raw, wl = c.person ? self.workload(s, c.person) : null;
      b.hasLoad = !!wl; b.load = wl ? (wl.n ? wl.h + ' h · ' + wl.n + (wl.n === 1 ? ' tarea' : ' tareas') : 'Sin tareas abiertas') : '';
      b.loadCls = !wl ? '' : wl.h > 80 ? 'bad' : wl.h > 40 ? 'warn' : 'ok';
      b.hasAlerts = !!wl && wl.al > 0; b.alerts = wl ? String(wl.al) : ''; b.alertsAria = wl ? wl.al + ' recomendaciones PMBOK pendientes' : '';
      b.ptrDown = isAdmin ? function (e) { self.orgPtrDown(c.id, e); } : null;
      delete b.raw;
    });
    var dra = s.orgDrag; d.areas.forEach(function (a) { a.aid = a.id; if (dra && dra.area === a.id) a.cls = (a.cls + ' drop-area').trim(); });
    d.exPng = function () { self.orgExport('png'); }; d.exSvg = function () { self.orgExport('svg'); };
    d.exPdf = function () { self.orgExport('pdf'); }; d.exPptx = function () { self.orgExport('pptx'); };
    if (d.panel.has) {
      var sel = this.orgCargo(s, s.orgSel), mid = sel.person, P = d.panel;
      var m = mid ? this.memberById(s, mid) : null;
      P.hasPerson = !!m; P.personName = m ? m.name : 'Vacante'; P.desde = sel.desde ? 'En el cargo desde ' + fmtShort(sel.desde) : '';
      var wl = mid ? this.workload(s, mid) : null;
      P.load = wl ? wl.h + ' h abiertas en ' + wl.n + (wl.n === 1 ? ' tarea' : ' tareas') + ' · ' + wl.al + (wl.al === 1 ? ' recomendación' : ' recomendaciones') : '';
      P.loadCls = !wl ? '' : wl.h > 80 ? 'bad' : wl.h > 40 ? 'warn' : 'ok';
      var t = s.tables.byId.per, pr = this.personRow(s, mid), canSee = t && pr && this.lvl(s, 'per', v.role) !== 'none';
      P.hasFicha = !!canSee; P.noFicha = !!m && !canSee;
      P.ficha = canSee ? ['correo', 'telefono', 'sede', 'ingreso', 'chora'].map(function (k) { var p = propOf(t, k); return { label: p.name, value: dispText(self.dispOf(s, t, p, pr, v, false)) || '—' }; }) : [];
      P.openFicha = function () { if (pr) self.openRec('per', pr.id); };
      var items = mid ? this.openItems(s, mid) : [];
      P.items = items.map(function (it) { return { label: it.label, what: it.what, icon: it.icon, color: it.color, open: function () { self.openRec(it.tid, it.rid); } }; });
      P.hasItems = items.length > 0; P.noItems = !!m && items.length === 0;
      P.hist = (sel.hist || []).slice().reverse().map(function (h) { var hm = self.memberById(s, h.person); return { text: (hm ? hm.name : 'Alguien') + ' · hasta ' + fmtShort(h.hasta) }; });
      P.hasHist = P.hist.length > 0;
    }
    var ra = s.reassign;
    d.ra = { has: !!ra };
    if (ra) {
      var fm = this.memberById(s, ra.from), tm = this.memberById(s, ra.to), rc = this.orgCargo(s, ra.cid);
      var nOn = ra.items.filter(function (x) { return x.on; }).length;
      var setItems = function (fn) { var r2 = clone(ra); r2.items.forEach(fn); self.setState({ reassign: r2 }); };
      d.ra = { has: true, title: (tm ? tm.name : '') + ' ahora ocupa «' + (rc ? rc.name : '') + '»',
        sub: (fm ? fm.name : 'La persona anterior') + ' tenía ' + ra.items.length + ' pendientes abiertos. Elige cuáles pasan a ' + (tm ? tm.name.split(' ')[0] : 'la nueva persona') + ':',
        items: ra.items.map(function (it, i) { return { label: it.label, what: it.what, icon: it.icon, color: it.color, cls: it.on ? 'on' : '', on: it.on, toggle: function () { setItems(function (x, k) { if (k === i) x.on = !x.on; }); } }; }),
        all: function () { setItems(function (x) { x.on = true; }); }, none: function () { setItems(function (x) { x.on = false; }); },
        applyLabel: nOn ? 'Transferir ' + nOn + (nOn === 1 ? ' pendiente' : ' pendientes') : 'Continuar sin transferir',
        apply: function () { self.reassignApply(); }, cancel: function () { self.setState({ reassign: null }); self.toastMsg('Los pendientes se quedaron con ' + (fm ? fm.name : 'la persona anterior')); } };
    }
    return d;
  }
});
