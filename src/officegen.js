/* ================= .docx y .xlsx reales generados en el navegador =================
   ZIP sin compresión (método «store») + XML de Office Open. Sin librerías externas. */
var OG = (function () {
  var CRC = null;
  function crc32(u8) {
    if (!CRC) { CRC = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; CRC[n] = c >>> 0; } }
    var x = 0xFFFFFFFF; for (var i = 0; i < u8.length; i++) x = CRC[(x ^ u8[i]) & 0xFF] ^ (x >>> 8); return (x ^ 0xFFFFFFFF) >>> 0;
  }
  function utf8(s) { return new TextEncoder().encode(s); }
  function b64(s) { var bin = atob(s), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
  function zip(files) {
    var parts = [], cen = [], off = 0;
    function w16(a, v) { a.push(v & 0xFF, (v >>> 8) & 0xFF); }
    function w32(a, v) { a.push(v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF); }
    files.forEach(function (f) {
      var name = utf8(f.name), data = typeof f.data === 'string' ? utf8(f.data) : f.data, crc = crc32(data), h = [];
      w32(h, 0x04034b50); w16(h, 20); w16(h, 0x0800); w16(h, 0); w16(h, 0); w16(h, 0x21); w32(h, crc); w32(h, data.length); w32(h, data.length); w16(h, name.length); w16(h, 0);
      parts.push(new Uint8Array(h), name, data);
      var c = [];
      w32(c, 0x02014b50); w16(c, 20); w16(c, 20); w16(c, 0x0800); w16(c, 0); w16(c, 0); w16(c, 0x21); w32(c, crc); w32(c, data.length); w32(c, data.length); w16(c, name.length); w16(c, 0); w16(c, 0); w16(c, 0); w16(c, 0); w32(c, 0); w32(c, off);
      cen.push(new Uint8Array(c), name);
      off += h.length + name.length + data.length;
    });
    var csize = cen.reduce(function (a, x) { return a + x.length; }, 0), e = [];
    w32(e, 0x06054b50); w16(e, 0); w16(e, 0); w16(e, files.length); w16(e, files.length); w32(e, csize); w32(e, off); w16(e, 0);
    return new Blob(parts.concat(cen, [new Uint8Array(e)]), { type: 'application/zip' });
  }
  function x(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/[<]/g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var HDR = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  var W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';

  /* ---------- Word ---------- */
  function docx(spec) {
    // spec: { land, footer, blocks: [{t:'h1'|'p'|'cap'|'src'|'note'|'concl'|'title'|'sub'|'meta'|'pb'|'toc'|'img'|'table'|'kpis', ...}], images: [{id, b64, w, h}] }
    var land = !!spec.land, pgW = land ? 16838 : 11906, pgH = land ? 11906 : 16838, mar = 907, usable = pgW - 2 * mar;
    var rels = [], imgN = 0, media = [];
    function run(t, o) {
      o = o || {};
      var pr = (o.b ? '<w:b/>' : '') + (o.i ? '<w:i/>' : '') + (o.color ? '<w:color w:val="' + o.color + '"/>' : '') + (o.sz ? '<w:sz w:val="' + o.sz + '"/><w:szCs w:val="' + o.sz + '"/>' : '') + (o.font ? '<w:rFonts w:ascii="' + o.font + '" w:hAnsi="' + o.font + '"/>' : '');
      return EL('w:r', '', (pr ? EL('w:rPr', '', pr) : '') + EL('w:t', 'xml:space="preserve"', x(t)));
    }
    function par(content, o) {
      o = o || {};
      var pr = (o.style ? '<w:pStyle w:val="' + o.style + '"/>' : '') + (o.keep ? '<w:keepNext/>' : '') + (o.pbb ? '<w:pageBreakBefore/>' : '') +
        (o.shade ? '<w:pBdr><w:left w:val="single" w:sz="18" w:space="6" w:color="' + o.bar + '"/>' + CL('w:pBdr') + '<w:shd w:val="clear" w:color="auto" w:fill="' + o.shade + '"/>' : '') +
        (o.after != null ? '<w:spacing w:before="' + (o.before || 0) + '" w:after="' + o.after + '"/>' : '') + (o.align ? '<w:jc w:val="' + o.align + '"/>' : '') + (o.ind ? '<w:ind w:left="160" w:right="160"/>' : '');
      return EL('w:p', '', (pr ? EL('w:pPr', '', pr) : '') + content);
    }
    function img(im, wIn) {
      imgN++; var rid = 'rImg' + imgN, fn = 'image' + imgN + '.png';
      rels.push('<Relationship Id="' + rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/' + fn + '"/>');
      media.push({ name: 'word/media/' + fn, data: b64(im.b64) });
      var cx = Math.round(wIn * 914400), cy = Math.round(cx * im.h / im.w);
      return EL('w:r', '', EL('w:drawing', '', EL('wp:inline', 'distT="0" distB="0" distL="0" distR="0"', '<wp:extent cx="' + cx + '" cy="' + cy + '"/><wp:docPr id="' + imgN + '" name="Imagen ' + imgN + '"/>' +
        EL('a:graphic', '', EL('a:graphicData', 'uri="http://schemas.openxmlformats.org/drawingml/2006/picture"', EL('pic:pic', '', EL('pic:nvPicPr', '', '<pic:cNvPr id="' + imgN + '" name="' + fn + '"/><pic:cNvPicPr/>') +
          EL('pic:blipFill', '', '<a:blip r:embed="' + rid + '"/>' + EL('a:stretch', '', '<a:fillRect/>')) + EL('pic:spPr', '', EL('a:xfrm', '', '<a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/>') + EL('a:prstGeom', 'prst="rect"', '<a:avLst/>'))))))));
    }
    function cellXml(t, w, o) {
      o = o || {};
      var tc = '<w:tcW w:w="' + w + '" w:type="dxa"/>' + (o.fill ? '<w:shd w:val="clear" w:color="auto" w:fill="' + o.fill + '"/>' : '') + '<w:tcMar><w:top w:w="50" w:type="dxa"/><w:bottom w:w="50" w:type="dxa"/><w:left w:w="90" w:type="dxa"/><w:right w:w="90" w:type="dxa"/>' + CL('w:tcMar') + '';
      return EL('w:tc', '', EL('w:tcPr', '', tc) + par(run(t, { b: o.b, color: o.color, sz: o.sz || 19 }), { after: 0, align: o.right ? 'right' : null }));
    }
    function table(cols, rows) {
      var n = cols.length, wts = cols.map(function (c) { return c.type === 'title' ? 1.6 : (c.num ? 0.9 : 1.2); }), sum = wts.reduce(function (a, b) { return a + b; }, 0);
      var ws = wts.map(function (v) { return Math.floor(usable * v / sum); }); ws[n - 1] += usable - ws.reduce(function (a, b) { return a + b; }, 0);
      var grid = EL('w:tblGrid', '', ws.map(function (w) { return '<w:gridCol w:w="' + w + '"/>'; }).join(''));
      var pr = EL('w:tblPr', '', '<w:tblW w:w="' + usable + '" w:type="dxa"/><w:tblLayout w:type="fixed"/>' + EL('w:tblBorders', '', '<w:bottom w:val="single" w:sz="4" w:color="C9D3E0"/><w:insideH w:val="single" w:sz="4" w:color="C9D3E0"/>'));
      var head = EL('w:tr', '', EL('w:trPr', '', '<w:tblHeader/><w:cantSplit/>') + cols.map(function (c, i) { return cellXml(c.name, ws[i], { fill: '00468C', color: 'FFFFFF', b: true, right: c.num }); }).join(''));
      var body = rows.map(function (r, k) { return EL('w:tr', '', EL('w:trPr', '', '<w:cantSplit/>') + r.map(function (c, i) { return cellXml(c.t, ws[i], { fill: k % 2 ? 'F2F4F7' : null, right: cols[i].num }); }).join('')); }).join('');
      return EL('w:tbl', '', pr + grid + head + body);
    }
    function kpis(list) {
      var per = 3, wcell = Math.floor(usable / per), out = [];
      for (var i = 0; i < list.length; i += per) {
        var row = list.slice(i, i + per);
        while (row.length < per) row.push(null);
        out.push(EL('w:tr', '', EL('w:trPr', '', '<w:cantSplit/>') + row.map(function (k) {
          var fill = 'FFFFFF', vc = '00468C'; if (k && k.state === 'kpi-ok') vc = '00705A'; if (k && k.state === 'kpi-bad') vc = 'B00020';
          var inner = k ? par(run(k.title, { color: '5A6675', sz: 18 }), { after: 20 }) + par(run(k.value, { b: true, sz: 36, color: vc }), { after: 20 }) + par(run(k.cap, { color: '5A6675', sz: 16 }), { after: k.goal ? 20 : 0 }) + (k.goal ? par(run(k.goal, { b: true, sz: 17, color: vc }), { after: 0 }) : '') : par('', { after: 0 });
          return EL('w:tc', '', EL('w:tcPr', '', '<w:tcW w:w="' + wcell + '" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="' + fill + '"/><w:tcMar><w:top w:w="110" w:type="dxa"/><w:bottom w:w="110" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:right w:w="140" w:type="dxa"/>' + CL('w:tcMar') + '') + inner);
        }).join('')));
      }
      var b = '<w:top w:val="single" w:sz="6" w:color="C9D3E0"/><w:left w:val="single" w:sz="6" w:color="C9D3E0"/><w:bottom w:val="single" w:sz="6" w:color="C9D3E0"/><w:right w:val="single" w:sz="6" w:color="C9D3E0"/><w:insideH w:val="single" w:sz="6" w:color="C9D3E0"/><w:insideV w:val="single" w:sz="6" w:color="C9D3E0"/>';
      return EL('w:tbl', '', EL('w:tblPr', '', '<w:tblW w:w="' + usable + '" w:type="dxa"/><w:tblLayout w:type="fixed"/>' + EL('w:tblBorders', '', b)) + EL('w:tblGrid', '', [0, 1, 2].map(function () { return '<w:gridCol w:w="' + wcell + '"/>'; }).join('')) + out.join(''));
    }
    var body = spec.blocks.map(function (bk) {
      switch (bk.t) {
        case 'logo': return par(img(bk.img, 2.0), { after: 600 });
        case 'bar': return par(run(' ', { sz: 4 }), { shade: 'F8D000', bar: 'F8D000', after: 300 });
        case 'title': return par(run(bk.text, { b: true, sz: 52, color: '00468C' }), { after: 160 });
        case 'sub': return par(run(bk.text, { sz: 26, color: '5A6675' }), { after: 500 });
        case 'meta': return bk.rows.map(function (m) { return par(run(m[0] + ':  ', { b: true, color: '5A6675', sz: 22 }) + run(m[1], { sz: 22 }), { after: 60 }); }).join('');
        case 'fine': return par(run(bk.text, { sz: 18, color: '5A6675' }), { before: 1400, after: 0 });
        case 'pb': return par(EL('w:r', '', '<w:br w:type="page"/>'), { after: 0 });
        case 'toc': return par(run('Índice', { b: true, sz: 25, color: '00468C' }), { after: 120 }) +
          par(EL('w:r', '', '<w:fldChar w:fldCharType="begin"/>') + EL('w:r', '', EL('w:instrText', 'xml:space="preserve"', ' TOC \\o "1-1" \\h \\z \\u ')) + EL('w:r', '', '<w:fldChar w:fldCharType="separate"/>') + run('Haga clic derecho y elija «Actualizar campo» para generar el índice.', { color: '5A6675', i: true }) + EL('w:r', '', '<w:fldChar w:fldCharType="end"/>'), {}) + par(EL('w:r', '', '<w:br w:type="page"/>'), { after: 0 });
        case 'h1': return par(run(bk.text), { style: 'Heading1', pbb: bk.pbb });
        case 'p': return par(run(bk.text), {});
        case 'note': return par(run(bk.text), { shade: 'FFF4C2', bar: 'F8D000', ind: true, before: 60, after: 160 });
        case 'concl': return par(run(bk.text), { shade: 'E3F1EC', bar: '00705A', ind: true, before: 60, after: 160 });
        case 'cap': return par(run(bk.text, { b: true, color: '00468C', sz: 20 }), { keep: true, before: 120, after: 60 });
        case 'src': return par(run(bk.text, { color: '5A6675', sz: 17 }), { before: 40, after: 200 });
        case 'img': return par(img(bk.img, land ? 8.2 : 6.3), { align: 'center', keep: true, after: 60 });
        case 'table': return table(bk.cols, bk.rows);
        case 'kpis': return kpis(bk.list);
      }
      return '';
    }).join('');
    var sect = EL('w:sectPr', '', '<w:footerReference w:type="default" r:id="rFoot"/>' + (spec.cover ? '<w:titlePg/>' : '') + '<w:pgSz w:w="' + pgW + '" w:h="' + pgH + '"' + (land ? ' w:orient="landscape"' : '') + '/><w:pgMar w:top="1020" w:right="' + mar + '" w:bottom="1134" w:left="' + mar + '" w:header="567" w:footer="567" w:gutter="0"/>');
    var doc = HDR + EL('w:document', W, EL('w:body', '', body + sect));
    var fld = function (code) { return EL('w:r', '', '<w:fldChar w:fldCharType="begin"/>') + EL('w:r', '', EL('w:instrText', 'xml:space="preserve"', ' ' + code + ' ')) + EL('w:r', '', '<w:fldChar w:fldCharType="separate"/>') + run('1', { sz: 17, color: '5A6675' }) + EL('w:r', '', '<w:fldChar w:fldCharType="end"/>'); };
    var fs = { sz: 17, color: '5A6675' };
    var footer = HDR + EL('w:ftr', W, EL('w:p', '', EL('w:pPr', '', '<w:tabs><w:tab w:val="right" w:pos="' + usable + '"/>' + CL('w:tabs') + '<w:spacing w:after="0"/>') + run(spec.footer, fs) + EL('w:r', '', '<w:tab/>') + run('Página ', fs) + fld('PAGE') + run(' de ', fs) + fld('NUMPAGES')));
    var styles = HDR + EL('w:styles', W,
      EL('w:docDefaults', '', EL('w:rPrDefault', '', EL('w:rPr', '', '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/><w:color w:val="1E2A38"/><w:sz w:val="21"/><w:szCs w:val="21"/><w:lang w:val="es-PE"/>')) + EL('w:pPrDefault', '', EL('w:pPr', '', '<w:spacing w:after="120" w:line="264" w:lineRule="auto"/>'))) +
      EL('w:style', 'w:type="paragraph" w:default="1" w:styleId="Normal"', '<w:name w:val="Normal"/><w:qFormat/>') +
      EL('w:style', 'w:type="paragraph" w:styleId="Heading1"', '<w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>' + EL('w:pPr', '', '<w:keepNext/><w:spacing w:before="320" w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="10" w:space="3" w:color="00468C"/>' + CL('w:pBdr') + '<w:outlineLvl w:val="0"/>') + EL('w:rPr', '', '<w:b/><w:color w:val="00468C"/><w:sz w:val="30"/><w:szCs w:val="30"/>')) +
      EL('w:style', 'w:type="paragraph" w:styleId="TOC1"', '<w:name w:val="toc 1"/><w:basedOn w:val="Normal"/>' + EL('w:pPr', '', '<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="' + usable + '"/>' + CL('w:tabs') + '<w:spacing w:after="60"/>')));
    var settings = HDR + EL('w:settings', W, '<w:defaultTabStop w:val="709"/><w:updateFields w:val="true"/>');
    var ct = HDR + EL('Types', 'xmlns="http://schemas.openxmlformats.org/package/2006/content-types"', '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>');
    var R = 'xmlns="http://schemas.openxmlformats.org/package/2006/relationships"';
    var root = HDR + EL('Relationships', R, '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>');
    var drels = HDR + EL('Relationships', R, '<Relationship Id="rSty" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rSet" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/><Relationship Id="rFoot" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>' + rels.join(''));
    var core = HDR + EL('cp:coreProperties', 'xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"', EL('dc:title', '', x(spec.title || '')) + EL('dc:creator', '', x(spec.author || '')));
    return zip([{ name: '[Content_Types].xml', data: ct }, { name: '_rels/.rels', data: root }, { name: 'docProps/core.xml', data: core }, { name: 'word/document.xml', data: doc }, { name: 'word/styles.xml', data: styles }, { name: 'word/settings.xml', data: settings }, { name: 'word/footer1.xml', data: footer }, { name: 'word/_rels/document.xml.rels', data: drels }].concat(media));
  }

  /* ---------- Excel ---------- */
  function colName(i) { var s = ''; i++; while (i > 0) { var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
  function xlsx(spec) {
    // spec: { sheets: [{ name, title, sub, head: [..], rows: [[{v, n}]], widths: [..] }] }
    var used = {};
    function nm(n) { var b = String(n).replace(/[\\\/\?\*\[\]:]/g, ' ').slice(0, 28).trim() || 'Hoja', k = b, i = 2; while (used[k.toLowerCase()]) k = b.slice(0, 25) + ' ' + i++; used[k.toLowerCase()] = 1; return k; }
    var sheets = spec.sheets.map(function (sh, si) {
      var rows = [], r = 1;
      function c(ref, v, st) {
        if (typeof v === 'number' && isFinite(v)) return '<c r="' + ref + '" s="' + (st || 4) + '"><v>' + v + CL('v') + CL('c');
        return EL('c', 'r="' + ref + '" t="inlineStr"' + (st ? ' s="' + st + '"' : ''), EL('is', '', EL('t', 'xml:space="preserve"', x(v))));
      }
      rows.push(EL('row', 'r="1"', c('A1', sh.title, 1))); r++;
      rows.push(EL('row', 'r="2"', c('A2', sh.sub, 2))); r++;
      r++;
      var hr = r; rows.push(EL('row', 'r="' + r + '"', sh.head.map(function (h, i) { return c(colName(i) + r, h, 3); }).join(''))); r++;
      sh.rows.forEach(function (row) { rows.push(EL('row', 'r="' + r + '"', row.map(function (v, i) { return c(colName(i) + r, v, typeof v === 'number' ? 4 : 0); }).join(''))); r++; });
      var cols = EL('cols', '', (sh.widths || []).map(function (w, i) { return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>'; }).join(''));
      var views = EL('sheetViews', '', EL('sheetView', 'workbookViewId="0"' + (si === 0 ? ' tabSelected="1"' : ''), '<pane ySplit="' + hr + '" topLeftCell="A' + (hr + 1) + '" activePane="bottomLeft" state="frozen"/>'));
      var last = colName(Math.max(0, sh.head.length - 1)) + (r - 1);
      var xml = HDR + EL('worksheet', 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"', views + cols + EL('sheetData', '', rows.join('')) + (sh.rows.length ? '<autoFilter ref="A' + hr + ':' + last + '"/>' : '') + '<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/><pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/>' + EL('headerFooter', '', EL('oddFooter', '', x('&L' + spec.footer + '&RHoja &A · Página &P de &N'))));
      return { name: nm(sh.name), xml: xml };
    });
    var styles = HDR + EL('styleSheet', 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"',
      EL('numFmts', 'count="1"', '<numFmt numFmtId="164" formatCode="#,##0.##"/>') +
      EL('fonts', 'count="4"', EL('font', '', '<sz val="10.5"/><color rgb="FF1E2A38"/><name val="Calibri"/>') + EL('font', '', '<b/><sz val="14"/><color rgb="FF00468C"/><name val="Calibri"/>') + EL('font', '', '<sz val="9"/><color rgb="FF5A6675"/><name val="Calibri"/>') + EL('font', '', '<b/><sz val="10.5"/><color rgb="FFFFFFFF"/><name val="Calibri"/>')) +
      EL('fills', 'count="3"', EL('fill', '', '<patternFill patternType="none"/>') + EL('fill', '', '<patternFill patternType="gray125"/>') + EL('fill', '', EL('patternFill', 'patternType="solid"', '<fgColor rgb="FF00468C"/><bgColor indexed="64"/>'))) +
      EL('borders', 'count="1"', EL('border', '', '<left/><right/><top/><bottom/><diagonal/>')) +
      EL('cellStyleXfs', 'count="1"', '<xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>') +
      EL('cellXfs', 'count="5"', '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="3" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>') +
      EL('cellStyles', 'count="1"', '<cellStyle name="Normal" xfId="0" builtinId="0"/>'));
    var wb = HDR + EL('workbook', 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"', EL('sheets', '', sheets.map(function (s, i) { return '<sheet name="' + x(s.name) + '" sheetId="' + (i + 1) + '" r:id="rS' + (i + 1) + '"/>'; }).join('')));
    var R = 'xmlns="http://schemas.openxmlformats.org/package/2006/relationships"';
    var wrels = HDR + EL('Relationships', R, sheets.map(function (s, i) { return '<Relationship Id="rS' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>'; }).join('') + '<Relationship Id="rSt" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>');
    var ct = HDR + EL('Types', 'xmlns="http://schemas.openxmlformats.org/package/2006/content-types"', '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' + sheets.map(function (s, i) { return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'; }).join(''));
    var root = HDR + EL('Relationships', R, '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>');
    return zip([{ name: '[Content_Types].xml', data: ct }, { name: '_rels/.rels', data: root }, { name: 'xl/workbook.xml', data: wb }, { name: 'xl/_rels/workbook.xml.rels', data: wrels }, { name: 'xl/styles.xml', data: styles }].concat(sheets.map(function (s, i) { return { name: 'xl/worksheets/sheet' + (i + 1) + '.xml', data: s.xml }; })));
  }
  return { docx: docx, xlsx: xlsx, zip: zip };
})();
