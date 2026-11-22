/* ====== tarjetas clicleables: ventana de detalle central ====== */
Object.assign(Component.prototype, {
  openKd(pid, bid) { this.setState({ kd: { pid: pid, bid: bid } }); },
  closeKd() { this.setState({ kd: null }); },
  kdData(s, v) {
    var self = this;
    if (!s.kd) return null;
    var pg = s.pages.byId[s.kd.pid];
    if (!pg) return null;
    var b = pg.blocks.filter(function (x) { return x.id === s.kd.bid; })[0];
    if (!b || ['kpi', 'chart'].indexOf(b.type) < 0) return null;
    var xf = (s.xf || {})[pg.id] || null, xfSets = xf ? this.xfSets(s, xf, v) : null;
    if (xf && !xfSets) xf = null;
    var bv = this.blockView(s, v, pg, b, { xf: xf, xfSets: xfSets, canEditPage: false, cfgBid: null, index: 0, count: 1 });
    var T = s.tables.byId[b.table];
    if (!T || bv.isLocked) return null;
    var rows = this.rowsFor(s, T.id, v);
    if (xfSets && xfSets[T.id]) { var ok = xfSets[T.id]; rows = rows.filter(function (r) { return ok[r.id]; }); }
    rows = this.applyFilters(s, T, rows, b.filters, v);
    var props = this.rprops(s, T, v.role);
    var tp = props.filter(function (p) { return p.type === 'title'; });
    var op = props.filter(function (p) { return p.type !== 'title' && ['relation', 'rollup', 'button', 'files'].indexOf(p.type) < 0; });
    var cols = tp.concat(op).slice(0, 5);
    var LIM = 100, shown = rows.slice(0, LIM);
    var out = {
      title: bv.title || b.title || T.name, isKpi: b.type === 'kpi', isChart: b.type === 'chart', kpi: bv.kpi, ch: bv.ch,
      sub: T.name + ' · ' + rows.length + (rows.length === 1 ? ' registro' : ' registros') + (xf ? ' · ' + xf.label : ''),
      srcColor: T.color, srcIcon: bv.srcIcon,
      cols: cols.map(function (p) { return { name: p.name }; }),
      gridStyle: 'grid-template-columns: ' + cols.map(function (p, i) { return i === 0 ? 'minmax(150px,2fr)' : 'minmax(90px,1fr)'; }).join(' '),
      rows: shown.map(function (r) {
        var cells = cols.map(function (p) { var t = ''; try { t = dispText(self.dispOf(s, T, p, r, v, false)) || ''; } catch (e) { t = ''; } return { t: t || '—' }; });
        return { cells: cells, aria: 'Abrir registro ' + (cells[0] ? cells[0].t : ''), open: function () { self.setState({ kd: null }); self.openRec(T.id, r.id); } };
      }),
      hasRows: shown.length > 0, noRows: shown.length === 0, hasMore: rows.length > LIM, moreText: 'Se muestran los primeros ' + LIM + ' de ' + rows.length + '. Abre la tabla completa para ver el resto.',
      close: function () { self.closeKd(); },
      openTable: function () { self.setState({ kd: null }); self.go(T.id, null); },
      tableName: T.name
    };
    return out;
  },
  scPickClear() { }
});
(function () {
  var baseRv = Component.prototype.renderVals;
  Component.prototype.renderVals = function () {
    var o = baseRv.call(this), s = this.st(), v = this.viewer(s), kd = null;
    try { kd = this.kdData(s, v); } catch (e) { kd = null; }
    o.hasKd = !!kd; o.kd = kd || { title: '', sub: '', cols: [], rows: [], kpi: {}, ch: null };
    return o;
  };
})();
