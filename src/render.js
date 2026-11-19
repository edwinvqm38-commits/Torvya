/* ================= componente: pantalla ================= */
Object.assign(Component.prototype, {
  /* añade a los datos del gráfico lo que necesita la plantilla */
  chartView(P) {
    P.showCol = P.isColumn && !P.empty; P.showBar = P.isBar && !P.empty; P.showLine = P.isLine && !P.empty; P.showDonut = P.isDonut && !P.empty;
    P.lgrid = []; P.ldots = []; P.lxl = [];
    if (P.showLine) {
      P.lgrid = P.grid.map(function (g) { return { top: (Number(g.y) / 200 * 100).toFixed(2), label: g.label }; });
      P.ldots = P.dots.map(function (d, i) { var b = P.bars[i]; return { left: (Number(d.cx) / 640 * 100).toFixed(2), top: (Number(d.cy) / 200 * 100).toFixed(2), tip: d.tip, cls: d.cls, on: b.on, pick: b.pick, aria: b.aria }; });
      P.lxl = P.xlabels.map(function (x, i) { return { label: x.label, left: P.ldots[i].left }; });
    }
    P.colTall = P.bars.length > 8 ? 'many' : '';
    return P;
  },

  /* un bloque de página */
  blockView(s, v, pg, b, ctx) {
    var self = this;
    var pid = pg.id;
    var xf = ctx.xf, xfSets = ctx.xfSets;
    var BT = { chart: 'Gráfico', kpi: 'Indicador', slicer: 'Segmentación', db: 'Base de datos', sheet: 'Hoja de cálculo', map: 'Mapa de relaciones', heading: 'Encabezado', text: 'Texto', divider: 'Separador' };
    var bv = {
      id: b.id, cls: 'blk w-' + b.w + ' blk-' + b.type + (ctx.cfgBid === b.id ? ' is-cfg' : '') + (s.jellyKey === b.id ? ' jelly' : ''), typeName: BT[b.type] || 'Bloque',
      isHeading: b.type === 'heading', isText: b.type === 'text', isDivider: b.type === 'divider', isKpi: false, isSlicer: false, isChart: false, isDb: false, isSheet: b.type === 'sheet', isMap: b.type === 'map', isLocked: false,
      canEdit: ctx.canEditPage, readOnly: !ctx.canEditPage,
      text: b.text || '', setText: function (e) { var val = e.target.value; self.updBlock(b.id, function (x) { x.text = val; }); },
      textRo: b.text || '', hasTextRo: !!b.text,
      up: function () { self.moveBlock(b.id, -1); }, down: function () { self.moveBlock(b.id, 1); }, canUp: ctx.index > 0, canDown: ctx.index < ctx.count - 1,
      cycleW: function () { self.cycleWidth(b.id); }, wLabel: (WIDTHS.filter(function (w) { return w.id === b.w; })[0] || { n: '' }).n, wAria: 'Cambiar ancho del bloque (ahora ' + ((WIDTHS.filter(function (w) { return w.id === b.w; })[0] || { n: '' }).n) + ')',
      hasConfig: ['chart', 'kpi', 'slicer', 'db', 'sheet'].indexOf(b.type) >= 0,
      config: function () { self.openDrawer('block', { dCtx: { pid: pid, bid: b.id } }); }, configAria: 'Configurar ' + (BT[b.type] || 'bloque').toLowerCase(),
      del: function () { self.delBlock(b.id); }, delCls: s.confirmDel === 'blk:' + b.id ? 'danger-on' : '', delAria: s.confirmDel === 'blk:' + b.id ? 'Pulsa otra vez para quitar el bloque' : 'Quitar bloque',
      title: b.title || '', srcName: '', srcIcon: ICON.db, srcColor: '#888', goSrc: null, lockText: '',
      xfTag: '', hasXfTag: false, xfTagCls: '',
      kpi: { value: '', caption: '' }, sl: { opts: [], hasSel: false, clear: null, empty: false }, ch: null, dv: null, sh: null, mp: null
    };
    bv.isTodo = b.type === 'todo'; bv.isCallout = b.type === 'callout'; bv.isPm = b.type === 'pm';
    if (bv.isTodo || bv.isCallout || bv.isPm) bv.hasConfig = false;
    bv.typeName = { todo: 'Lista de tareas', callout: 'Aviso', pm: 'Salud de proyectos' }[b.type] || bv.typeName;
    bv.dragStart = function (e) { self.blkDragStart(b.id, e); }; bv.dragEnd = function (e) { self.blkDragEnd(e); };
    bv.dragOver = function (e) { self.blkDragOver(e); }; bv.dragLeave = function (e) { self.blkDragLeave(e); }; bv.drop = function (e) { self.blkDrop(b.id, e); };
    bv.rzStart = function (e) { self.rzStart(b.id, e); }; bv.rzMove = function (e) { self.rzMove(e); }; bv.rzEnd = function (e) { self.rzEnd(b.id, e); };
    bv.wAria = 'Cambiar ancho (ahora ' + b.w + ' de 12 columnas)'; bv.wLabel = b.w + '/12';
    var isSlash = ctx.canEditPage && (b.type === 'text' || b.type === 'heading') && /^\//.test(b.text || '');
    bv.slashOpen = isSlash; bv.slash = isSlash ? this.slashList(pid, b.text, { replace: b.id, keepW: true }) : []; bv.slashEmpty = isSlash && bv.slash.length === 0;
    bv.textPh = b.w < 12 ? 'Escribe «/» para elegir qué va en esta columna' : 'Escribe, o pulsa «/» para insertar una tabla, un gráfico o columnas';
    bv.slashClose = function () { self.updBlock(b.id, function (x) { x.text = ''; }); };
    if (bv.isTodo) {
      var items = b.items || [];
      var nd = items.filter(function (it) { return it.done; }).length;
      bv.td = { title: b.title || 'Pendientes', setTitle: function (e) { var val = e.target.value; self.updBlock(b.id, function (x) { x.title = val; }); },
        progress: nd + ' de ' + items.length, pct: items.length ? Math.round(nd / items.length * 100) : 0,
        items: items.map(function (it, i) { return { text: it.text, done: !!it.done, cls: it.done ? 'done' : '', cbCls: it.done ? 'on' : '', aria: (it.done ? 'Desmarcar ' : 'Marcar ') + (it.text || 'pendiente'),
          toggle: function () { self.todoUpd(b.id, function (x) { x.items[i].done = !x.items[i].done; }); },
          setText: function (e) { var val = e.target.value; self.todoUpd(b.id, function (x) { x.items[i].text = val; }); },
          del: function () { self.todoUpd(b.id, function (x) { x.items.splice(i, 1); }); } }; }),
        add: function () { self.todoUpd(b.id, function (x) { x.items.push({ id: 'q' + Date.now(), text: '', done: false }); }); } };
      return bv;
    }
    if (bv.isCallout) {
      var CI = ['info', 'i-bulb', 'i-flag', 'i-star', 'shield'];
      bv.co = { icon: ICON[b.icon] || ICON.info, tone: 'tone-' + CI.indexOf(b.icon || 'info'), cycle: function () { self.updBlock(b.id, function (x) { x.icon = CI[(CI.indexOf(x.icon || 'info') + 1) % CI.length]; }); } };
      return bv;
    }
    if (bv.isPm) { bv.pm = this.pmBlock(s, v, b); bv.title = b.title || 'Salud de los proyectos'; return bv; }
    if (bv.isSheet) { bv.sh = this.sheetData(s, b, v, ctx.canEditPage); return bv; }
    if (bv.isMap) { bv.mp = this.mapData(s, v); return bv; }
    if (['kpi', 'slicer', 'chart', 'db'].indexOf(b.type) < 0) return bv;
    var T = s.tables.byId[b.table];
    if (!T) { bv.isLocked = true; bv.lockText = 'La base de datos de este bloque ya no existe.'; return bv; }
    bv.srcName = T.name; bv.srcIcon = ICON[T.icon] || ICON.db; bv.srcColor = T.color; bv.goSrc = function () { self.go(T.id, null); };
    if (this.lvl(s, T.id, v.role) === 'none') { bv.isLocked = true; bv.lockText = 'Sin acceso a ' + T.name + '. Este bloque está oculto para tu rol.'; return bv; }
    function rowsFor(isSource) {
      var rows = self.rowsFor(s, T.id, v);
      var st = 'none';
      if (xfSets) {
        if (isSource) st = 'source';
        else if (xfSets[T.id]) { var ok = xfSets[T.id]; rows = rows.filter(function (r) { return ok[r.id]; }); st = 'filtered'; }
        else st = 'unrelated';
      }
      return { rows: rows, st: st };
    }
    function tag(st) {
      bv.hasXfTag = st !== 'none';
      bv.xfTag = { filtered: 'Filtrado', source: 'Origen del filtro', unrelated: 'Sin relación con el filtro' }[st] || '';
      bv.xfTagCls = st === 'unrelated' ? 'tag-muted' : 'tag-acc';
    }
    if (b.type === 'kpi') {
      bv.isKpi = true;
      var rk = rowsFor(false);
      tag(rk.st);
      bv.kpi = this.kpiData(s, T, this.applyFilters(s, T, rk.rows, b.filters, v), b);
      if ((b.filters || []).length) bv.kpi.caption += ' · ' + b.filters.length + (b.filters.length === 1 ? ' condición' : ' condiciones');
      return bv;
    }
    if (b.type === 'slicer') {
      bv.isSlicer = true;
      var P = propOf(T, b.prop);
      var isSrc = !!(xf && xf.table === T.id && xf.prop === b.prop);
      var rs = rowsFor(isSrc);
      tag(rs.st === 'source' ? 'none' : rs.st);
      if (!P) { bv.sl.empty = true; return bv; }
      var groups = this.groupsOf(s, T, rs.rows, P.key, { hideEmpty: false }) || [];
      if (P.type === 'title') groups = groups.filter(function (g) { return g.rows.length > 0; });
      bv.sl.propName = P.name;
      bv.sl.opts = groups.map(function (g) {
        var on = isSrc && String(xf.key) === String(g.key);
        return { label: g.label, count: String(g.rows.length), color: g.color || PALETTE[0], cls: (on ? 'on' : (isSrc ? 'dim' : '')) + (g.rows.length ? '' : ' zero'), on: on, isPerson: !!g.isPerson, initials: g.initials || '', notPerson: !g.isPerson,
          pick: function () { self.setXf(pid, { table: T.id, prop: P.key, key: g.key, label: P.name + ': ' + g.label }); }, aria: P.name + ': ' + g.label + ', ' + g.rows.length + ' registros' };
      });
      bv.sl.hasSel = isSrc;
      bv.sl.clear = function () { self.setXf(pid, null); };
      bv.sl.empty = bv.sl.opts.length === 0;
      return bv;
    }
    if (b.type === 'chart') {
      bv.isChart = true;
      var isSrcC = !!(xf && xf.table === T.id && xf.prop === b.by);
      var rc = rowsFor(isSrcC);
      tag(rc.st);
      bv.ch = this.chartView(this.chartData(s, T, this.applyFilters(s, T, rc.rows, b.filters, v), { pal: b.pal, legend: b.legend, head: false, title: b.title, kind: b.kind, by: b.by, bucket: b.bucket, val: b.val, sort: b.sort, limit: b.limit }, { pid: pid, current: xf }));
      return bv;
    }
    if (b.type === 'db') {
      bv.isDb = true;
      bv.dv = this.dbViewData(s, T.id, b.view, 'b:' + b.id, { compact: true, xfSets: xfSets, xfLabel: xf ? xf.label : '' });
      bv.dv.goFull = function () { self.go(T.id, null); };
      bv.dv.chart = this.chartView(bv.dv.chart);
      return bv;
    }
    return bv;
  },

  renderVals() {
    var self = this;
    var s = this.st();
    var v = this.viewer(s);
    var isAdminView = v.role === 'admin';
    var previewing = s.viewAs !== 'ana';
    var accent = s.accent || this.props.accent || 'indigo';
    var mode = s.mode || (this.props.dark ? 'dark' : 'light');
    var screen = s.screen;
    if (!isAdminView && (screen === 'permisos' || screen === 'tema')) screen = 'page';
    var canEditPage = v.role !== 'invitado';

    /* barra lateral */
    var inbox = this.inboxFor(s, v);
    var unread = inbox.filter(function (n) { return !n.read; }).length;
    var visPages = s.pages.order.filter(function (id) { return self.pageVisible(s, v, s.pages.byId[id]); });
    var pid = visPages.indexOf(s.page) >= 0 ? s.page : visPages[0];
    var navFold = s.navFold || {};
    var visSet = {}; visPages.forEach(function (id) { visSet[id] = true; });
    function kidsOf(id) { return visPages.filter(function (x) { return s.pages.byId[x].parent === id && x !== id; }); }
    function isRootPg(id) { var par = s.pages.byId[id].parent; return !par || par === id || !visSet[par]; }
    function pItem(id, depth) {
      var pg = s.pages.byId[id]; var kids = kidsOf(id); var d = depth || 0;
      return { id: id, name: pg.title || 'Sin título', icon: ICON[pg.icon] || ICON.page, color: pg.color, on: screen === 'page' && id === pid ? 'on' : '', go: function () { self.goPage(id); },
        depth: String(d), hasKids: kids.length > 0, noKids: kids.length === 0, kidCount: String(kids.length), open: !navFold[id], foldCls: navFold[id] ? '' : 'open',
        foldAria: (navFold[id] ? 'Mostrar' : 'Ocultar') + ' subpáginas de ' + (pg.title || 'Sin título'), toggle: function () { self.navFoldToggle(id); },
        canSub: canEditPage && d < 5, addSub: function () { self.newPage(null, id); },
        jl: s.jellyKey === 'pg:' + id ? 'jelly' : '', canDrag: canEditPage,
        dragStart: function (e) { self.pgDragStart(id, e); }, dragEnd: function (e) { self.pgDragEnd(e); },
        dragOver: function (e) { self.pgDragOver(id, e); }, dragLeave: function (e) { try { e.currentTarget.classList.remove('nav-drop'); } catch (err) { } },
        drop: function (e) { self.pgDrop(id, e); } };
    }
    function pFlat(ids, depth, out) {
      ids.forEach(function (id) { var it = pItem(id, depth); out.push(it); if (it.hasKids && it.open && depth < 6) pFlat(kidsOf(id), depth + 1, out); });
      return out;
    }
    var sideHome = pFlat(visPages.filter(function (id) { return s.pages.byId[id].mine && isRootPg(id); }), 0, []);
    var sideGeneral = pFlat(visPages.filter(function (id) { var pg = s.pages.byId[id]; return !pg.mine && !pg.area && isRootPg(id); }), 0, []);
    var sideAreas = s.org.areas.map(function (a) { return { name: a.name, color: a.color, pages: pFlat(visPages.filter(function (id) { var pg = s.pages.byId[id]; return !pg.mine && pg.area === a.id && isRootPg(id); }), 0, []) }; }).filter(function (g) { return g.pages.length > 0; });
    var myCargo = this.cargoOf(s, v.id), myArea = myCargo ? this.orgArea(s, myCargo.area) : null;
    var tidCur = this.curTid(s);
    var sideDbs = s.tables.order.map(function (id) {
      var tt = s.tables.byId[id];
      var ok = self.lvl(s, id, v.role) !== 'none';
      return { name: tt.name, icon: ICON[tt.icon] || ICON.db, color: ok ? tt.color : '#8C8C86', count: ok ? String(self.rowsFor(s, id, v).length) : '', locked: !ok, unlocked: ok, on: (screen === 'db' && id === tidCur) ? 'on' : '', go: function () { self.go(id, null); } };
    });
    var accessibleCount = sideDbs.filter(function (d) { return d.unlocked; }).length;
    var activeMembers = s.members.filter(function (m) { return !m.pending; });
    var viewOpts = activeMembers.map(function (m) {
      return { name: m.name, initials: initialsOf(m.name), color: m.color, roleName: ROLE_NAME[m.role] + (m.id === 'ana' ? ' · tú' : ''), cls: m.id === v.id ? 'on' : '', pick: function () { self.previewAs(m.id); } };
    });

    /* página */
    var pgv = { title: '', blocks: [] };
    if (screen === 'page') {
      var pg = s.pages.byId[pid];
      var xf = (s.xf || {})[pid] || null;
      var xfSets = xf ? this.xfSets(s, xf, v) : null;
      if (xf && !xfSets) xf = null;
      var cfgBid = s.drawer === 'block' && s.dCtx ? s.dCtx.bid : null;
      var blocks = pg.blocks.map(function (b, i) { return self.blockView(s, v, pg, b, { xf: xf, xfSets: xfSets, canEditPage: canEditPage, cfgBid: cfgBid, index: i, count: pg.blocks.length }); });
      var addOpen = s.addBlockOpen === true, addDb = s.addBlockOpen === 'db';
      var groupsDef = [
        { title: 'Datos', ids: ['db', 'newdb'] },
        { title: 'Visualización tipo Power BI', ids: ['kpi', 'chart:column', 'chart:bar', 'chart:line', 'chart:donut', 'slicer'] },
        { title: 'Proyectos (PMBOK)', ids: ['pm', 'todo', 'callout'] },
        { title: 'Cálculo y estructura', ids: ['sheet', 'map', 'heading', 'text', 'cols:2', 'cols:3', 'divider'] }
      ];
      var bt = {};
      BLOCK_TYPES.forEach(function (x) { bt[x.id] = x; });
      var tid0 = s.tables.order.filter(function (id) { return self.lvl(s, id, v.role) !== 'none'; })[0];
      var nDb = pg.blocks.filter(function (b) { return b.type === 'db'; }).length;
      var nViz = pg.blocks.filter(function (b) { return ['chart', 'kpi', 'slicer'].indexOf(b.type) >= 0; }).length;
      var pick = s.iconPick === 'pg:' + pid;
      pgv = {
        id: pid, title: pg.title || '', titleText: pg.title || 'Sin título', icon: ICON[pg.icon] || ICON.page, color: pg.color, desc: pg.desc || '', hasDesc: !!pg.desc,
        canEdit: canEditPage, readOnly: !canEditPage,
        hasCover: !!pg.cover, noCover: !pg.cover, headCls: pg.cover ? 'has-cover' : '', canAddCover: canEditPage && !pg.cover, coverStyle: this.coverStyle(pg.cover), coverImg: !!(pg.cover && pg.cover.kind === 'img'),
        coverOpen: s.coverPick === pid, toggleCover: function () { self.setState({ coverPick: s.coverPick === pid ? null : pid }); },
        addCover: function () { self.coverSet(pid, { kind: 'grad', v: (s.seq % COVERS.length) }); },
        coverGrads: COVERS.map(function (c, i) { var on = pg.cover && pg.cover.kind === 'grad' && pg.cover.v === i; return { style: 'background: ' + c, cls: on ? 'on' : '', on: !!on, aria: 'Degradado ' + (i + 1), pick: function () { self.coverSet(pid, { kind: 'grad', v: i }); } }; }),
        coverColors: NEW_COLORS.map(function (c) { var on = pg.cover && pg.cover.kind === 'color' && pg.cover.v === c; return { hex: c, cls: on ? 'on' : '', on: !!on, aria: 'Color ' + c, pick: function () { self.coverSet(pid, { kind: 'color', v: c }); } }; }),
        coverUpload: function (e) { self.coverUpload(pid, e); },
        coverRemove: function () { self.coverSet(pid, null); self.setState({ coverPick: null }); },
        coverPos: function () { self.updPage(pid, function (x) { if (!x.cover) return false; var ps = [0, 25, 50, 75, 100]; x.cover.pos = ps[(ps.indexOf(x.cover.pos == null ? 50 : x.cover.pos) + 1) % ps.length]; }); },
        parentName: (pg.parent && s.pages.byId[pg.parent]) ? (s.pages.byId[pg.parent].title || 'Sin título') : 'Nivel principal', hasParent: !!(pg.parent && s.pages.byId[pg.parent]),
        canParent: canEditPage, cannotParent: !canEditPage, parentOpen: s.parentPick === pid, toggleParent: function () { self.setState({ parentPick: s.parentPick === pid ? null : pid, areaPick: null }); },
        parentOpts: this.parentChoices(s, pid).map(function (c) { return { label: c.label, pad: 'padding-left: ' + (10 + c.depth * 14) + 'px', cls: c.on ? 'on' : '', on: c.on, pick: function () { self.pageSetParent(pid, c.id); } }; }),
        subCount: kidsOf(pid).length, hasSubs: kidsOf(pid).length > 0,
        subs: kidsOf(pid).map(function (k) { var kp = s.pages.byId[k]; return { name: kp.title || 'Sin título', icon: ICON[kp.icon] || ICON.page, color: kp.color, go: function () { self.goPage(k); }, n: String(kidsOf(k).length), hasN: kidsOf(k).length > 0 }; }),
        crumbs: this.pageCrumbs(s, pid).map(function (c) { return { name: c.title || 'Sin título', go: function () { self.goPage(c.id); } }; }), hasCrumbs: this.pageCrumbs(s, pid).length > 0,
        areaName: pg.area ? ((this.orgArea(s, pg.area) || {}).name || 'Sin área') : (pg.mine ? 'Personal' : 'General · todos'), areaColor: pg.area ? ((this.orgArea(s, pg.area) || {}).color || '#888') : '#8C8C86',
        canArea: canEditPage && !pg.mine, cannotArea: !(canEditPage && !pg.mine), areaOpen: s.areaPick === pid, toggleArea: function () { self.setState({ areaPick: s.areaPick === pid ? null : pid }); },
        areaOpts: [{ id: null, name: 'General · todos', color: '#8C8C86' }].concat(s.org.areas).map(function (a) { var on = (pg.area || null) === a.id; return { label: a.name, color: a.color, cls: on ? 'on' : '', on: on, pick: function () { self.pageSetArea(pid, a.id); } }; }),
        isMine: !!pg.mine, greet: 'Hola, ' + v.name.split(' ')[0], greetSub: (myCargo ? myCargo.name + ' · ' + (myArea ? myArea.name : '') : 'Sin cargo en el organigrama') + ' · ' + this.pmIssues(s, v, { mine: true }).length + ' recomendaciones para ti',
        slashQ: s.slashQ || '', setSlashQ: function (e) { self.setState({ slashQ: e.target.value }); },
        slashOpen: /^\//.test(s.slashQ || ''), slash: /^\//.test(s.slashQ || '') ? this.slashList(pid, s.slashQ, {}) : [], slashEmpty: /^\//.test(s.slashQ || '') && slashMatches(s.slashQ).length === 0,
        slashKey: function (e) {
          if (!e || e.key !== 'Enter') return;
          var q = String((e.target && e.target.value) || '');
          if (/^\//.test(q)) { var m = slashMatches(q)[0]; if (m) self.slashPick(pid, m.spec, {}); return; }
          if (q.trim()) { self.addBlock(pid, 'text', {}); var s2 = self.st(); var pg2 = s2.pages.byId[pid]; var nb = pg2.blocks[pg2.blocks.length - 1]; self.updBlock(nb.id, function (x) { x.text = q; }); self.setState({ slashQ: '' }); }
        },
        dropEndOk: function (e) { if (self._dragBlk) { try { e.preventDefault(); } catch (err) { } } },
        dropEnd: function (e) { var bid = self._dragBlk; self.blkDragEnd(e); if (!bid) return; try { e.preventDefault(); } catch (err) { } self.updBlock(bid, function (b, pg2) { pg2.blocks.splice(pg2.blocks.indexOf(b), 1); pg2.blocks.push(b); }); },
        setTitle: function (e) { var val = e.target.value; self.updPage(pid, function (x) { x.title = val; }); },
        setDesc: function (e) { var val = e.target.value; self.updPage(pid, function (x) { x.desc = val; }); },
        iconOpen: pick, toggleIcon: function () { self.setState({ iconPick: pick ? null : 'pg:' + pid }); },
        iconOpts: DB_ICONS.map(function (k) { return { icon: ICON[k], cls: pg.icon === k ? 'on' : '', on: pg.icon === k, aria: 'Icono ' + k.slice(2), pick: function () { self.updPage(pid, function (x) { x.icon = k; }); } }; }),
        colorOpts: NEW_COLORS.map(function (c) { return { hex: c, cls: pg.color === c ? 'on' : '', on: pg.color === c, aria: 'Color ' + c, pick: function () { self.updPage(pid, function (x) { x.color = c; }); } }; }),
        stats: pg.blocks.length + (pg.blocks.length === 1 ? ' bloque' : ' bloques') + ' · ' + nDb + (nDb === 1 ? ' tabla' : ' tablas') + ' · ' + nViz + (nViz === 1 ? ' visual' : ' visuales'),
        hasXf: !!xf, xfLabel: xf ? xf.label : '', clearXf: function () { self.setXf(pid, null); },
        xfHint: xf ? 'Afecta a ' + blocks.filter(function (b) { return b.xfTag === 'Filtrado'; }).length + ' bloques por sus relaciones' : '',
        blocks: blocks, noBlocks: blocks.length === 0,
        addOpen: addOpen, addDb: addDb, addAny: addOpen || addDb,
        toggleAdd: function () { self.setState({ addBlockOpen: s.addBlockOpen ? false : true, drawer: null }); },
        closeAdd: function () { self.setState({ addBlockOpen: false }); },
        addGroups: groupsDef.map(function (g) {
          return { title: g.title, items: g.ids.filter(function (id) { return bt[id]; }).map(function (id) {
            var x = bt[id];
            return { name: x.n, desc: x.d, icon: ICON[x.icon] || ICON.plus, pick: function () {
              if (id === 'db') { self.setState({ addBlockOpen: 'db' }); return; }
              if (id === 'newdb') { self.newDb(pid); return; }
              self.addBlock(pid, id, { table: tid0 });
            } };
          }) };
        }),
        addTables: s.tables.order.filter(function (id) { return self.lvl(s, id, v.role) !== 'none'; }).map(function (id) {
          var tt = s.tables.byId[id];
          return { name: tt.name, icon: ICON[tt.icon] || ICON.db, color: tt.color, meta: tt.rows.length + ' registros · ' + tt.views.length + ' vistas', pick: function () { self.addBlock(pid, 'db', Object.assign({ table: id }, s.addCtx || {})); } };
        }),
        addBack: function () { self.setState({ addBlockOpen: true }); },
        canDel: canEditPage && s.pages.order.length > 1 && !pg.mine, delPage: function () { self.delPage(pid); }, delLabel: s.confirmDel === 'pg:' + pid ? 'Pulsa otra vez para eliminar la página' : 'Eliminar página', delCls: s.confirmDel === 'pg:' + pid ? 'danger-on' : ''
      };
    }

    /* base de datos a pantalla completa */
    var t = s.tables.byId[tidCur];
    var tLvl = this.lvl(s, tidCur, v.role);
    var hasAccess = tLvl !== 'none';
    var dbv = { dv: null };
    if (screen === 'db' && hasAccess) {
      var vw = this.screenView(s, t);
      var people = s.members.filter(function (m) { return !m.pending && self.lvl(s, tidCur, m.role) !== 'none'; });
      var pickDb = s.iconPick === 'db:' + tidCur;
      var canStruct = tLvl === 'full';
      var relCount = t.props.filter(function (p) { return p.type === 'relation'; }).length;
      var mapPage = s.pages.order.filter(function (id) { return s.pages.byId[id].blocks.some(function (b) { return b.type === 'map'; }); })[0];
      dbv = {
        name: t.name, desc: t.desc || '', icon: ICON[t.icon] || ICON.db, color: t.color,
        canStructure: canStruct, cannotStructure: !canStruct,
        rename: function (e) { var val = e.target.value; self.updTable(tidCur, function (tt) { tt.name = val; if (val.trim()) tt.abbr = abbrOf(val); }); },
        setDesc: function (e) { var val = e.target.value; self.updTable(tidCur, function (tt) { tt.desc = val; }); },
        iconOpen: pickDb && canStruct, toggleIcon: function () { if (canStruct) self.setState({ iconPick: pickDb ? null : 'db:' + tidCur }); },
        iconOpts: DB_ICONS.map(function (k) { return { icon: ICON[k], cls: t.icon === k ? 'on' : '', on: t.icon === k, aria: 'Icono ' + k.slice(2), pick: function () { self.updTable(tidCur, function (tt) { tt.icon = k; }); } }; }),
        colorOpts: NEW_COLORS.map(function (c) { return { hex: c, cls: t.color === c ? 'on' : '', on: t.color === c, aria: 'Color ' + c, pick: function () { self.updTable(tidCur, function (tt) { tt.color = c; }); } }; }),
        people: people.slice(0, 5).map(function (m) { return { name: m.name + ' · ' + ROLE_NAME[m.role], initials: initialsOf(m.name), color: m.color }; }), peopleAria: people.length + ' personas tienen acceso',
        roBadge: tLvl !== 'edit' && tLvl !== 'full', levelName: LEVEL_NAME[tLvl],
        relText: relCount + (relCount === 1 ? ' relación' : ' relaciones'), hasMap: !!mapPage, goMap: function () { if (mapPage) self.goPage(mapPage); },
        share: function () { self.setScreen('permisos', { permTab: 'accesos', permTable: tidCur }); },
        dv: this.dbViewData(s, tidCur, vw.id, 'scr')
      };
      dbv.dv.goFull = function () { };
      dbv.dv.chart = this.chartView(dbv.dv.chart);
    }

    /* registro abierto (vista rápida) */
    var recT = s.rec ? s.tables.byId[s.rec.tid] : null;
    var recRow = null;
    if (recT && this.lvl(s, recT.id, v.role) !== 'none') { var rr = findRow(recT, s.rec.id); if (rr && this.rowsFor(s, recT.id, v).indexOf(rr) >= 0) recRow = rr; }
    var rec = { fields: [], comments: [], trace: [] };
    var recFull = false;
    if (recRow) {
      var rLvl = this.lvl(s, recT.id, v.role);
      var rEdit = rLvl === 'edit' || rLvl === 'full';
      var rComment = rLvl !== 'view';
      var titleP = this.titleProp(recT);
      var rprops = this.rprops(s, recT, v.role);
      var openFullDefault = screen === 'db' && recT.id === tidCur ? !!this.screenView(s, recT).openFull : false;
      recFull = s.recFull != null ? s.recFull : openFullDefault;
      var rid = recRow.id, rtid = recT.id;
      var cm = this.memberById(s, recRow._cBy), em = this.memberById(s, recRow._eBy);
      var trace = this.traceData(s, recT, recRow, v);
      rec = {
        tname: recT.name, ticon: ICON[recT.icon] || ICON.db, tcolor: recT.color,
        title: recRow[titleP.key] || '', titleText: recRow[titleP.key] || 'Sin título',
        setTitle: function (e) { self.setField(rtid, rid, titleP.key, e.target.value); },
        canEdit: rEdit, cannotEdit: !rEdit, canComment: rComment, cannotComment: !rComment,
        fields: rprops.filter(function (p) { return p.type !== 'title'; }).map(function (p) { return self.fieldView(s, recT, p, recRow, v, rEdit, self.recCtx(rtid, rid)); }),
        body: recRow._body || '', bodyText: recRow._body || 'Sin contenido.', setBody: function (e) { self.setField(rtid, rid, '_body', e.target.value); },
        meta: 'Creado por ' + (cm ? cm.name : '—') + ' · ' + fmtDateTime(recRow._cAt) + ' — Editado por ' + (em ? em.name : '—') + ' · ' + fmtDateTime(recRow._eAt),
        comments: (s.comments[rid] || []).map(function (c) { var m = self.memberById(s, c.who) || { name: String(c.who), color: '#64748B' }; return { name: m.name, initials: initialsOf(m.name), color: m.color, text: c.text, when: c.when }; }),
        trace: trace, hasTrace: trace.length > 0, noTrace: trace.length === 0,
        addComment: function () { self.addComment(rtid, rid); }, del: function () { self.delRec(rtid, rid); },
        openTable: function () { self.go(rtid, rid); }, notInTable: !(screen === 'db' && rtid === tidCur)
      };
      rec.noComments = rec.comments.length === 0;
      rec.pm = this.pmRec(s, v, recT, recRow);
      rec.sol = recT.id === 'sol' ? this.solView(s, v, recRow) : { has: false };
      rec.backlinks = this.backlinks(s, v, recT.id, recRow.id); rec.hasBacklinks = rec.backlinks.length > 0;
    }

    /* aviso de vista previa */
    var bd = [];
    if (previewing) {
      bd.push('Accede a ' + accessibleCount + ' de ' + s.tables.order.length + ' bases de datos.');
      if (screen === 'db' && hasAccess) {
        var hiddenCount = t.props.length - this.rprops(s, t, v.role).length;
        var visN = this.rowsFor(s, tidCur, v).length;
        var d2 = 'En ' + t.name + ' ve ' + visN + ' de ' + t.rows.length + ' registros';
        if (hiddenCount) d2 += ', con ' + hiddenCount + (hiddenCount === 1 ? ' columna oculta' : ' columnas ocultas');
        d2 += ' y permiso «' + LEVEL_NAME[tLvl] + '».';
        bd.push(d2);
      }
    }

    /* permisos */
    var permT = s.tables.byId[s.permTable] ? s.permTable : s.tables.order[0];
    var pt = s.tables.byId[permT];
    var permTabs = [{ id: 'miembros', label: 'Miembros' }, { id: 'accesos', label: 'Accesos por base de datos' }, { id: 'columnas', label: 'Columnas y filas' }, { id: 'seguridad', label: 'Seguridad y auditoría' }]
      .map(function (x) { return { label: x.label, cls: s.permTab === x.id ? 'on' : '', pick: function () { self.setState({ permTab: x.id }); } }; });
    var members = s.members.map(function (m) {
      var you = m.id === 'ana';
      return { name: m.name, initials: initialsOf(m.name), color: m.color, team: m.team, last: m.last, role: m.role, isYou: you, pending: !!m.pending, canPreview: !you && !m.pending, roleAria: 'Rol de ' + m.name,
        setRole: function (e) { self.setRole(m.id, e.target.value); }, preview: function () { self.previewAs(m.id); } };
    });
    var matrix = s.tables.order.map(function (id) {
      var tt = s.tables.byId[id];
      return { name: tt.name, icon: ICON[tt.icon] || ICON.db, color: tt.color, cells: ROLES.map(function (r) { var l = self.lvl(s, id, r.id); var lk = r.id === 'admin'; return { label: LEVEL_NAME[l], cls: LEVEL_CLS[l], locked: lk, aria: r.name + ' en ' + tt.name + ': ' + LEVEL_NAME[l] + (lk ? '' : '. Pulsa para cambiar'), cycle: function () { self.cycleAccess(id, r.id); } }; }) };
    });
    var permTables = s.tables.order.map(function (id) { var tt = s.tables.byId[id]; return { name: tt.name, icon: ICON[tt.icon] || ICON.db, color: tt.color, cls: id === permT ? 'on' : '', pick: function () { self.setState({ permTable: id }); } }; });
    var colRows = pt.props.map(function (p) {
      var isT = p.type === 'title';
      var hide = (s.colHide[permT] || {})[p.key] || [];
      return { label: p.name, icon: ICON[p.type], always: isT, notAlways: !isT,
        roles: ROLES.filter(function (r) { return r.id !== 'admin'; }).map(function (r) { var on = hide.indexOf(r.id) < 0; return { name: r.name, on: on, off: !on, cls: on ? '' : 'off', aria: (on ? 'Ocultar ' : 'Mostrar ') + p.name + ' a ' + r.name, toggle: function () { self.toggleColHide(permT, p.key, r.id); } }; }) };
    });
    var rules = s.rowRules.filter(function (r) { return r.table === permT; }).map(function (r) { return { text: r.text, detail: r.detail, roleName: ROLE_NAME[r.role], on: r.on, onCls: r.on ? 'on' : '', toggle: function () { self.toggleRule(r.id); } }; });
    var secRows = [
      { key: 'twofa', text: 'Exigir verificación en dos pasos', detail: 'Para todos los miembros del espacio' },
      { key: 'exportGuest', text: 'Permitir que los invitados exporten', detail: 'Descarga en CSV, Excel o PDF' },
      { key: 'linkExpiry', text: 'Los enlaces públicos caducan a los 30 días', detail: 'Formularios y vistas compartidas fuera de la empresa' },
      { key: 'audit', text: 'Registro de auditoría', detail: 'Guarda quién ve, cambia o exporta cada registro' },
      { key: 'ipLock', text: 'Solo desde la red de la oficina', detail: 'Bloquea el acceso desde IPs no autorizadas' }
    ].map(function (x) { var on = !!s.security[x.key]; return { text: x.text, detail: x.detail, on: on, onCls: on ? 'on' : '', toggle: function () { self.toggleSec(x.key, x.text); } }; });
    var logRows = s.log.map(function (l) { return { who: l.who, what: l.what, when: l.when, color: l.color || '#64748B', initials: initialsOf(l.who) }; });

    /* asistente IA */
    var prop = { title: '', intro: '', tables: [], links: [], perms: [], canCreate: false, created: false, noAdmin: false };
    if (s.aiProp && AI_TEMPLATES[s.aiProp]) {
      var tp = AI_TEMPLATES[s.aiProp];
      var created = !!s.aiCreated[s.aiProp];
      prop = {
        title: tp.title, intro: tp.intro, created: created, canCreate: !created && isAdminView, noAdmin: !created && !isAdminView,
        tables: tp.tables.map(function (tt) {
          return { name: tt.ref, icon: ICON[tt.icon] || ICON.db, color: tt.color, fields: tt.fields.map(function (f) {
            var ty = f[1] === 'money' ? 'number' : f[1];
            var tn = f[1] === 'money' ? 'Número · Soles' : TYPE_NAME[ty];
            if (f[1] === 'relation') { var ref = String(f[2]); tn = 'Relación → ' + (ref.charAt(0) === '@' ? ref.slice(1) : (s.tables.byId[ref] ? s.tables.byId[ref].name : ref)); }
            if (f[1] === 'select' || f[1] === 'status') tn = TYPE_NAME[ty] + ': ' + (f[2] || []).join(' · ');
            return { label: f[0], icon: ICON[ty], typeName: tn };
          }) };
        }),
        links: tp.links.map(function (x) { return { text: x }; }), perms: tp.perms.map(function (x) { return { text: x }; })
      };
    }
    var ans = s.aiAns ? this.answerView(s, s.aiAns, v) : { q: '', text: '', items: [], hasItems: false, hasGo: false, goName: '', go: null, scope: '' };
    var aiSugs = AI_SUGS.map(function (x) { return { label: x.label, pick: function () { self.aiRun(x.text); } }; });

    /* personalizar */
    var swatches = ACCENTS.map(function (a) { var on = a.id === accent; return { name: a.name, hex: a.hex, on: on, cls: on ? 'on' : '', pick: function () { self.setState({ accent: a.id }); } }; });
    function opts(list, cur, key) { return list.map(function (x) { var pp = {}; pp[key] = x.id; return { label: x.label, cls: (x.id === cur ? 'on ' : '') + (x.ff || ''), pick: function () { self.setState(pp); } }; }); }

    /* avisos */
    var inboxV = inbox.map(function (n) { var tt = s.tables.byId[n.table]; return { text: n.text, icon: tt ? (ICON[tt.icon] || ICON.db) : ICON.bell, color: tt ? tt.color : '#888', meta: (tt ? tt.name + ' · ' : '') + n.when + (v.role === 'admin' ? ' · para ' + self.whoLabel(s, tt || t, n.to) : ''), cls: n.read ? 'read' : 'unread', open: function () { self.openNotif(n.id); } }; });

    var D = this.drawerVals(s, v);

    var out = {
      mode: mode, accent: accent, density: s.density, corners: s.corners, font: s.font,
      navCls: s.navOpen ? 'nav-open' : '', navOpenB: !!s.navOpen, toggleNav: function () { self.setState({ navOpen: !s.navOpen }); }, navAria: s.navOpen ? 'Cerrar menú' : 'Abrir menú',
      ws: s.ws, wsInitial: (String(s.ws || 'M').trim().charAt(0) || 'M').toUpperCase(), wsSub: activeMembers.length + ' miembros · ' + s.pages.order.length + ' páginas',
      isAdminView: isAdminView, previewing: previewing,
      viewer: { name: v.name, initials: initialsOf(v.name), color: v.color, roleName: ROLE_NAME[v.role] + (v.id === 'ana' ? ' · tú' : '') },
      viewerFirst: v.name.split(' ')[0],
      viewMenu: !!s.viewMenu, viewOpts: viewOpts,
      toggleViewMenu: function () { self.setState({ viewMenu: !s.viewMenu }); },
      exitPreview: function () { self.previewAs('ana'); },
      previewLuis: function () { self.previewAs('luis'); },
      newPage: function () { self.newPage(); }, canNewPage: canEditPage,
      sideDbs: sideDbs, newDb: function () { self.newDb(null); },
      navAi: screen === 'ia' ? 'on' : '', navPerm: screen === 'permisos' ? 'on' : '', navTheme: screen === 'tema' ? 'on' : '', navInbox: screen === 'avisos' ? 'on' : '',
      goAi: function () { self.setScreen('ia'); }, goPerm: function () { self.setScreen('permisos'); }, goTheme: function () { self.setScreen('tema'); }, goInbox: function () { self.setScreen('avisos'); },
      hasUnread: unread > 0, unreadCount: String(unread),
      bannerDetail: bd.join(' '),
      hasToast: !!s.toast, toast: s.toast || '', closeToast: function () { self.setState({ toast: null }); },

      appName: APP_NAME, pgRootOver: function (e) { self.pgRootOver(e); }, pgRootLeave: function (e) { self.pgRootLeave(e); }, pgRootDrop: function (e) { self.pgRootDrop(e); }, sideHome: sideHome, sideGeneral: sideGeneral, hasGeneral: sideGeneral.length > 0, sideAreas: sideAreas,
      navOrg: screen === 'org' ? 'on' : '', goOrg: function () { self.setScreen('org'); }, scrOrg: screen === 'org', org: screen === 'org' ? this.orgData(s, v) : null,
      scrPage: screen === 'page', scrDb: screen === 'db' && hasAccess, scrNoAccess: screen === 'db' && !hasAccess,
      scrAi: screen === 'ia', scrPerm: screen === 'permisos', scrTheme: screen === 'tema', scrInbox: screen === 'avisos',
      pg: pgv, db: dbv,
      noAccessName: t.name, noAccessIcon: ICON[t.icon] || ICON.db,

      hasRec: !!recRow, rec: rec, recMode: recFull ? 'full' : 'side', recFullB: recFull,
      toggleRecFull: function () { self.setState({ recFull: !recFull }); }, recFullAria: recFull ? 'Abrir como panel lateral' : 'Abrir como página completa',
      closeRec: function () { self.setState({ rec: null, picker: null, recFull: null }); },
      draft: s.draft, setDraft: function (e) { self.setState({ draft: e.target.value }); },

      reqSent: !!s.reqSent[tidCur], reqNotSent: !s.reqSent[tidCur], requestAccess: function () { self.requestAccess(tidCur); },

      aiText: s.aiText, setAiText: function (e) { self.setState({ aiText: e.target.value }); },
      aiGo: function () { self.aiRun(); }, aiSugs: aiSugs, hasProp: !!s.aiProp, prop: prop, aiCreate: function () { self.aiCreate(); },
      hasAns: !!s.aiAns, ans: ans,

      permTabs: permTabs, ptMembers: s.permTab === 'miembros', ptAccess: s.permTab === 'accesos', ptCols: s.permTab === 'columnas', ptSec: s.permTab === 'seguridad',
      inviteEmail: s.inviteEmail, setInviteEmail: function (e) { self.setState({ inviteEmail: e.target.value, inviteErr: '' }); },
      inviteRole: s.inviteRole, setInviteRole: function (e) { self.setState({ inviteRole: e.target.value }); },
      invite: function () { self.invite(); }, hasInviteErr: !!s.inviteErr, inviteErr: s.inviteErr,
      members: members, roles: ROLES, matrix: matrix, permTables: permTables, colRows: colRows, rules: rules, noRules: rules.length === 0,
      secRows: secRows, logRows: logRows,

      setWs: function (e) { self.setState({ ws: e.target.value }); },
      swatches: swatches,
      modeOpts: opts([{ id: 'light', label: 'Claro' }, { id: 'dark', label: 'Oscuro' }], mode, 'mode'),
      densOpts: opts([{ id: 'comfy', label: 'Cómoda' }, { id: 'compact', label: 'Compacta' }], s.density, 'density'),
      cornerOpts: opts([{ id: 'round', label: 'Redondeadas' }, { id: 'square', label: 'Rectas' }], s.corners, 'corners'),
      fontOpts: opts([{ id: 'inter', label: 'Inter', ff: 'ff-inter' }, { id: 'grotesk', label: 'Space Grotesk', ff: 'ff-grotesk' }, { id: 'plex', label: 'IBM Plex Sans', ff: 'ff-plex' }], s.font, 'font'),

      inbox: inboxV, inboxEmpty: inboxV.length === 0, markAllRead: function () { self.markAllRead(); }, previewIcon: ICON['i-cart'],
      ICON: ICON
    };
    for (var k in D) out[k] = D[k];
    return out;
  }
});
