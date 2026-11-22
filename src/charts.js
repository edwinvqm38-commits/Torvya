/* ================= gráficas avanzadas (Apache ECharts, carga diferida) =================
   Curva S del proyecto: programado, ejecutado y proyección. Las cifras salen de la tabla
   Proyectos (avance, avance planificado, fechas, SPI y CPI con sus fórmulas actuales). */
var SC_MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function scMs(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || '')); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null; }
function scFecha(ms) { var d = new Date(ms); return d.getUTCDate() + ' ' + SC_MES[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
function scR1(x) { return Math.round(x * 10) / 10; }
/* Curva en S (logística normalizada a 0..1) con pendiente fija; se desplaza el centro "c" para pasar por el punto conocido. */
var SC_K = 8;
function scL(x, c) { var f = function (u) { return 1 / (1 + Math.exp(-SC_K * (u - c))); }, f0 = f(0), f1 = f(1); return (f(x) - f0) / (f1 - f0); }
function scFit(x0, y0) {
  if (!(x0 > 0 && x0 < 1) || y0 == null || !isFinite(y0)) return 0.5;
  var y = Math.min(0.995, Math.max(0.005, y0)), lo = -1, hi = 2;
  for (var i = 0; i < 50; i++) { var mid = (lo + hi) / 2; if (scL(x0, mid) > y) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
function scAt(arr, ms) {
  if (!arr || !arr.length || ms < arr[0][0] || ms > arr[arr.length - 1][0]) return null;
  for (var i = 1; i < arr.length; i++) if (ms <= arr[i][0]) { var a = arr[i - 1], b = arr[i], u = b[0] === a[0] ? 1 : (ms - a[0]) / (b[0] - a[0]); return scR1(a[1] + (b[1] - a[1]) * u); }
  return arr[arr.length - 1][1];
}
function scAlpha(c, a) { return /^#[0-9a-f]{6}$/i.test(c) ? c + a : c; }

Object.assign(Component.prototype, {
  scurveBlock(s, v, b) {
    var self = this, t = s.tables.byId.proy;
    var out = { has: false, noAccess: false, noRows: false };
    if (!t || this.lvl(s, 'proy', v.role) === 'none') { out.noAccess = true; return out; }
    var rows = this.rowsFor(s, 'proy', v);
    if (!rows.length) { out.noRows = true; return out; }
    var row = rows.filter(function (r) { return r.id === b.proj; })[0] || rows[0];
    function g(key) { var p = propOf(t, key); return p ? self.fval(s, t, p, row) : null; }
    function num(x) { return typeof x === 'number' && isFinite(x) ? x : null; }
    var t0 = scMs(g('inicio')), t1 = scMs(g('fin')), now = scMs(todayIso());
    var av = num(g('avance')), pl = num(g('plan')), spi = num(g('spi')), cpi = num(g('cpi'));
    out.projOpts = rows.map(function (r) { return { id: r.id, name: self.titleOf(t, r), sel: r.id === row.id }; });
    out.setProj = function (e) { var val = e.target.value; var ss = Object.assign({}, self.st().scSel || {}); delete ss[b.id]; self.setState({ scSel: ss }); self.updBlock(b.id, function (bb) { bb.proj = val; }); };
    out.projName = this.titleOf(t, row);
    if (t0 == null || t1 == null || t1 <= t0 || av == null) { out.noDates = true; return out; }
    var xT = Math.min(1, Math.max(0, (now - t0) / (t1 - t0)));
    var tNow = t0 + xT * (t1 - t0);
    var cP = scFit(xT, pl == null ? null : pl / 100), cE = scFit(xT, av / 100);
    var N = 24, prog = [], ejec = [], i, x, tm;
    for (i = 0; i <= N; i++) { x = i / N; tm = t0 + x * (t1 - t0); prog.push([tm, scR1(100 * scL(x, cP))]); if (x < xT) ejec.push([tm, scR1(100 * scL(x, cE))]); }
    prog.push([tNow, pl == null ? scR1(100 * scL(xT, cP)) : pl]); prog.sort(function (p, q) { return p[0] - q[0]; });
    ejec.push([tNow, av]);
    var proy = [];
    var rate = xT > 0 ? av / xT : null, fin = null;
    if (rate && av < 100 && xT < 1) {
      var x100 = xT + (100 - av) / rate, xe = Math.min(1, x100);
      fin = scR1(Math.min(100, av + rate * (xe - xT)));
      proy = [[tNow, av], [t0 + xe * (t1 - t0), fin]];
    } else if (av >= 100) fin = 100;
    var selS = (s.scSel || {})[b.id], selD = null;
    if (selS && selS.ms >= t0 && selS.ms <= t1) {
      var ii = 0, bd = Infinity;
      prog.forEach(function (p, k) { var dd = Math.abs(p[0] - selS.ms); if (dd < bd) { bd = dd; ii = k; } });
      if (ii === 0) ii = 1;
      var pA = prog[ii - 1], pB = prog[ii], eA = scAt(ejec, pA[0]), eB = scAt(ejec, pB[0]);
      var gap = eB == null ? null : scR1(eB - pB[1]);
      selD = pB[0];
      out.sel = { title: 'Período ' + scFecha(pA[0]) + ' → ' + scFecha(pB[0]), rows: [
        { l: 'Programado acumulado', v: pB[1] + ' %' },
        { l: 'Programado en el período', v: '+' + scR1(pB[1] - pA[1]) + ' pts' },
        { l: 'Ejecutado acumulado', v: eB == null ? 'Aún no ocurre' : eB + ' %' },
        { l: 'Ejecutado en el período', v: eB == null || eA == null ? '—' : '+' + scR1(eB - eA) + ' pts' },
        { l: 'Brecha frente al plan', v: gap == null ? '—' : (gap >= 0 ? '+' : '−') + Math.abs(gap) + ' pts' }
      ], clear: function () { var ss = Object.assign({}, self.st().scSel || {}); delete ss[b.id]; self.setState({ scSel: ss }); } };
      out.hasSel = true;
    }
    out.noSel = !out.hasSel;
    var dpts = pl == null ? null : scR1(av - pl);
    var d = { sel: selD, prog: prog, ejec: ejec, proy: proy, today: tNow, start: t0, end: t1, month: [Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), 1), Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth() + 1, 0)] };
    function idx(x) { return x == null ? '—' : (Math.round(x * 100) / 100).toFixed(2); }
    function tone(x) { return x == null ? '' : x < 0.9 ? 'bad' : x < 1 ? 'warn' : 'ok'; }
    out.has = true;
    out.json = JSON.stringify(d);
    out.aria = 'Curva S de ' + out.projName + ': programado ' + (pl == null ? 'sin dato' : pl + ' %') + ', ejecutado ' + av + ' %' + (fin != null ? ', proyección a la fecha de fin ' + fin + ' %' : '') + '.';
    out.range = scFecha(t0) + ' → ' + scFecha(t1);
    out.metrics = [
      { label: 'Avance real', value: av + ' %', cap: pl == null ? 'Sin avance planificado' : 'Programado ' + pl + ' % · ' + (dpts >= 0 ? '+' : '−') + Math.abs(dpts) + ' pts', cls: dpts == null ? '' : dpts < -10 ? 'bad' : dpts < 0 ? 'warn' : 'ok' },
      { label: 'SPI (cronograma)', value: idx(spi), cap: spi == null ? 'Sin datos' : spi < 1 ? 'Atraso respecto al plan' : 'Al día o adelantado', cls: tone(spi) },
      { label: 'CPI (costo)', value: idx(cpi), cap: cpi == null ? 'Sin costo real' : cpi < 1 ? 'Costo sobre lo ganado' : 'Dentro del presupuesto', cls: tone(cpi) },
      { label: 'Proyección a fin', value: fin == null ? '—' : fin + ' %', cap: fin == null ? 'Sin ritmo medible' : fin >= 100 ? 'Termina a tiempo si sigue así' : 'Si se mantiene el ritmo', cls: fin == null ? '' : fin >= 100 ? 'ok' : fin < 90 ? 'bad' : 'warn' }
    ];
    out.note = 'Curva teórica en S entre el inicio y el fin, ajustada al avance programado y al ejecutado de hoy. Se reemplazará por los avances periódicos reales cuando existan.';
    return out;
  },

  /* ---------- montaje de las gráficas en pantalla ---------- */
  chartsColors(el) {
    var host = el.closest('.app') || document.body, cs = getComputedStyle(host);
    function c(n, d) { return (cs.getPropertyValue(n) || '').trim() || d; }
    return { acc: c('--acc', '#4F46E5'), text: c('--text', '#222'), muted: c('--muted', '#777'), line: c('--line', '#ddd'), panel: c('--panel', '#fff'), font: cs.fontFamily };
  },
  chartsSync() {
    if (typeof document === 'undefined') return;
    var self = this, list = this._chs = this._chs || [], els = document.querySelectorAll('.sc-chart'), i;
    for (i = list.length - 1; i >= 0; i--) if (!document.body.contains(list[i])) { try { if (list[i]._ro) list[i]._ro.disconnect(); if (list[i]._ch) list[i]._ch.dispose(); } catch (e) { } list.splice(i, 1); }
    if (!els.length) return;
    var need = false;
    for (i = 0; i < els.length; i++) { var el = els[i], sig = el.getAttribute('data-sc') + '|' + JSON.stringify(this.chartsColors(el)) + '|' + TRZ.cfg.level + TRZ.cfg.charts + TRZ.cfg.speed; if (el._sig !== sig) { need = true; break; } }
    if (!need) return;
    if (!window.TrzEcharts) {
      TRZ.load('trz-echarts.js', function () { return !!window.TrzEcharts; }).then(function (ok) {
        if (ok) self.chartsSync();
        else Array.prototype.forEach.call(document.querySelectorAll('.sc-chart'), function (e) { e.setAttribute('data-fail', '1'); });
      });
      return;
    }
    for (i = 0; i < els.length; i++) {
      var e2 = els[i], col = this.chartsColors(e2), sg = e2.getAttribute('data-sc') + '|' + JSON.stringify(col) + '|' + TRZ.cfg.level + TRZ.cfg.charts + TRZ.cfg.speed;
      if (e2._sig === sg) continue;
      var data; try { data = JSON.parse(e2.getAttribute('data-sc')); } catch (er) { continue; }
      var first = !e2._ch;
      if (first) {
        e2._ch = window.TrzEcharts.init(e2, null, { renderer: 'canvas' });
        if (window.ResizeObserver) { e2._ro = new ResizeObserver(function (ent) { var t = ent[0].target; if (t._ch) t._ch.resize(); }); e2._ro.observe(e2); }
        list.push(e2);
        (function (el) {
          el._ch.getZr().on('click', function (p) {
            try {
              var pt = [p.offsetX, p.offsetY];
              if (!el._ch.containPixel('grid', pt)) return;
              var cv = el._ch.convertFromPixel({ gridIndex: 0 }, pt), ms = Array.isArray(cv) ? cv[0] : cv, bid = el.getAttribute('data-bid');
              if (bid && isFinite(ms)) { var ss = Object.assign({}, self.st().scSel || {}); ss[bid] = { ms: ms }; self.setState({ scSel: ss }); TRZ.sound('click'); }
            } catch (er) { }
          });
        })(e2);
        e2.removeAttribute('data-ld');
      }
      e2._sig = sg;
      e2._ch.setOption(this.scOption(data, col, e2.clientWidth < 520), { replaceMerge: ['series'] });
    }
  },
  scOption(d, c, narrow) {
    var anim = TRZ.on('charts');
    function pct(x) { return x == null ? '—' : (Math.round(x * 10) / 10) + ' %'; }
    function dline(color, w, type) { return { width: w, color: color, type: type || 'solid' }; }
    var series = [
      { id: 'prog', name: 'Programado', type: 'line', smooth: true, showSymbol: false, data: d.prog, z: 2, lineStyle: dline(c.muted, 2, 'dashed'), itemStyle: { color: c.muted },
        markArea: { silent: true, itemStyle: { color: c.acc, opacity: 0.07 }, data: [[{ xAxis: d.month[0] }, { xAxis: d.month[1] }]] },
        markLine: { silent: true, symbol: 'none', lineStyle: { color: c.text, type: 'solid', width: 1, opacity: 0.55 }, label: { formatter: 'Hoy', color: c.text, position: 'insideEndTop', fontSize: 11 }, data: [{ xAxis: d.today }] } },
      { id: 'ejec', name: 'Ejecutado', type: 'line', smooth: true, showSymbol: false, data: d.ejec, z: 4, lineStyle: dline(c.acc, 3), itemStyle: { color: c.acc },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: scAlpha(c.acc, '33') }, { offset: 1, color: scAlpha(c.acc, '00') }] } },
        markPoint: { symbolSize: 46, itemStyle: { color: c.acc }, label: { color: '#fff', fontSize: 11, formatter: function (p) { return Math.round(p.value) + '%'; } }, data: [{ coord: d.ejec[d.ejec.length - 1], value: d.ejec[d.ejec.length - 1][1] }] } }
    ];
    if (d.proy && d.proy.length) series.push({ id: 'proy', name: 'Proyección', type: 'line', showSymbol: false, data: d.proy, z: 3, lineStyle: dline(c.acc, 2, 'dotted'), itemStyle: { color: c.acc } });
    if (d.sel != null) series[1].markLine = { silent: true, symbol: 'none', lineStyle: { color: c.acc, type: 'dashed', width: 1.5 }, label: { show: false }, data: [{ xAxis: d.sel }] };
    return {
      aria: { enabled: true },
      animation: anim, animationDuration: TRZ.dur(900), animationDurationUpdate: TRZ.dur(600), animationEasing: 'cubicOut', animationEasingUpdate: 'cubicInOut',
      textStyle: { fontFamily: c.font, color: c.muted },
      grid: { left: 44, right: 20, top: 44, bottom: 30 },
      legend: { top: 4, left: 0, icon: 'roundRect', itemWidth: 18, itemHeight: 3, itemGap: 18, textStyle: { color: c.muted, fontSize: 12 } },
      toolbox: { show: !narrow, top: 0, right: 0, itemSize: 14, iconStyle: { borderColor: c.muted }, emphasis: { iconStyle: { borderColor: c.acc } },
        feature: { dataZoom: { yAxisIndex: 'none', title: { zoom: 'Zoom', back: 'Deshacer zoom' } }, restore: { title: 'Restablecer' }, saveAsImage: { title: 'Guardar imagen', name: 'curva-s', pixelRatio: 2, backgroundColor: c.panel } } },
      tooltip: { trigger: 'axis', confine: true, backgroundColor: c.panel, borderColor: c.line, textStyle: { color: c.text, fontSize: 12 }, axisPointer: { type: 'line', lineStyle: { color: c.muted } },
        formatter: function (ps) {
          if (!ps || !ps.length) return '';
          var h = scFecha(ps[0].value[0]), seen = {};
          ps.forEach(function (p) { if (seen[p.seriesName]) return; seen[p.seriesName] = 1; h += '<br/><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + p.color + ';margin-right:6px">' + '<' + '/span>' + p.seriesName + ': <b>' + pct(p.value[1]) + '<' + '/b>'; });
          return h;
        } },
      dataZoom: [{ type: 'inside', filterMode: 'none', zoomOnMouseWheel: 'ctrl', moveOnMouseMove: true }],
      xAxis: { type: 'time', min: d.start, max: d.end, axisLine: { lineStyle: { color: c.line } }, axisTick: { show: false }, axisLabel: { color: c.muted, hideOverlap: true, formatter: function (v) { var x = new Date(v); return SC_MES[x.getUTCMonth()] + ' ' + String(x.getUTCFullYear()).slice(2); } }, splitLine: { show: false } },
      yAxis: { type: 'value', min: 0, max: 100, interval: 25, axisLabel: { color: c.muted, formatter: '{value} %' }, splitLine: { lineStyle: { color: c.line, type: 'dashed' } } },
      series: series
    };
  }
});
