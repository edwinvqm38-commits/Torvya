/* ================= componente: panel de configuración ================= */
Object.assign(Component.prototype, {
  drawerVals(s, v) {
    var self = this;
    var page = s.drawer;
    function radio(list, cur, pick) { return list.map(function (x) { return { label: x.label, icon: x.icon || '', hasIcon: !!x.icon, on: String(x.id) === String(cur), cls: String(x.id) === String(cur) ? 'on' : '', pick: function () { pick(x.id); } }; }); }
    function seg(list, cur, pick) { return list.map(function (x) { return { label: x.label, icon: x.icon || '', hasIcon: !!x.icon, cls: String(x.id) === String(cur) ? 'on' : '', pick: function () { pick(x.id); } }; }); }
    var titles = { root: 'Configuración', layout: 'Diseño', visibility: 'Columnas visibles', filter: 'Filtrar', color: 'Color condicional', sort: 'Ordenar', group: 'Agrupar', props: 'Editar columnas', propEdit: 'Configurar columna', newProp: 'Nueva columna', automations: 'Automatizaciones', autoNew: 'Nueva automatización', ai: 'Autocompletado con IA', more: 'Más configuraciones', sources: 'Gestionar fuentes de datos', origin: 'Origen', block: 'Configurar bloque' };
    var parent = { propEdit: 'props', newProp: 'props', autoNew: 'automations' };
    var D = {
      drawerOpen: !!page, dCtxName: '', hasDCtx: false, dTitle: titles[page] || 'Configuración', dHasBack: !!page && page !== 'root' && page !== 'block', dNoBack: page === 'root' || page === 'block',
      dBack: function () { self.setState({ drawer: parent[page] || 'root', dAdding: false, dTypeChange: false, confirmDel: null }); },
      closeDrawer: function () { self.setState({ drawer: null, dAdding: false, dTypeChange: false, confirmDel: null }); },
      dNote: '', hasDNote: false,
      rootGroups: [], layOpts: [], groupRadio: [], dateRadio: [], chartByRadio: [], chartValRadio: [], chartKindSeg: [], bucketSeg: [], openRadio: [], visRows: [], roleHiddenRows: [],
      rl: { rulesV: [], ruleProps: [] }, brl: { rulesV: [], ruleProps: [] }, sortsV: [], sortProps: [], groupAll: [], propsV: [], typesV: [], aiItems: [], conns: [], relQuick: [], autosV: [],
      trigSeg: [], trigProps: [], trigVals: [], actSeg: [], whoOpts: [], actProps: [], actVals: [], aiPropsV: [], dbColors: [], dbIcons: [], srcs: [],
      pe: { opts: [], typeList: [], fmtOpts: [], decSeg: [], showSeg: [], dateSeg: [], defOpts: [], checkSeg: [], resSeg: [], widthSeg: [], rollRels: [], rollProps: [], rollFns: [], insertProps: [], insertFns: [], btnProps: [], btnVals: [], aiModes: [] },
      bk: { widthSeg: [], kindSeg: [], srcRadio: [], byRadio: [], bucketSeg: [], aggSeg: [], valRadio: [], sortSeg: [], topSeg: [], palSeg: [], legendSeg: [], labelsSeg: [], goalColorSeg: [], goalDirSeg: [], goal: '', setGoal: null, propRadio: [], colsSeg: [], rowsSeg: [] }
    };
    ['root', 'layout', 'visibility', 'rules', 'sort', 'group', 'props', 'propEdit', 'newProp', 'automations', 'autoNew', 'ai', 'more', 'sources', 'block'].forEach(function (k) { D['dp_' + k] = false; });
    if (!page) return D;

    /* ----- bloque de página ----- */
    if (page === 'block') {
      var fb = s.dCtx ? this.findBlock(s.pages, s.dCtx.bid) : null;
      if (!fb) { D.drawerOpen = false; return D; }
      D.dp_block = true;
      var b = fb.block, bid = b.id;
      var BT = { chart: 'Gráfico', kpi: 'Indicador', slicer: 'Segmentación', db: 'Base de datos', sheet: 'Hoja de cálculo', map: 'Mapa de relaciones', heading: 'Encabezado', text: 'Texto', divider: 'Separador' };
      D.dTitle = 'Configurar ' + (BT[b.type] || 'bloque').toLowerCase();
      var upd = function (fn) { self.updBlock(bid, fn); };
      var tables = s.tables.order.filter(function (id) { return self.lvl(s, id, v.role) !== 'none'; });
      var T = s.tables.byId[b.table] || null;
      var bk = {
        hasTitle: ['chart', 'kpi', 'slicer', 'sheet', 'map'].indexOf(b.type) >= 0, title: b.title || '', setTitle: function (e) { var val = e.target.value; upd(function (x) { x.title = val; }); },
        widthSeg: seg(WIDTHS.map(function (w) { return { id: w.id, label: w.n }; }), b.w, function (k) { upd(function (x) { x.w = Number(k); }); }),
        isChart: b.type === 'chart', isKpi: b.type === 'kpi', hasRules: !!T && (b.type === 'chart' || b.type === 'kpi'), isSlicer: b.type === 'slicer', isDb: b.type === 'db', isSheet: b.type === 'sheet',
        hasSource: ['chart', 'kpi', 'slicer', 'db'].indexOf(b.type) >= 0,
        srcRadio: radio(tables.map(function (id) { var tt = s.tables.byId[id]; return { id: id, label: tt.name, icon: ICON[tt.icon] || ICON.db }; }), b.table, function (k) {
          var T2 = s.tables.byId[k];
          var g = T2.props.filter(function (p) { return p.type === 'status' || p.type === 'select'; })[0] || T2.props.filter(isChartGroupable)[0];
          var num = T2.props.filter(function (p) { return p.type === 'number'; })[0];
          upd(function (x) { x.table = k; x.filters = []; if (x.type === 'db') x.view = T2.views[0].id; if (x.type === 'chart' || x.type === 'slicer') { x.by = g ? g.key : null; x.prop = g ? g.key : null; } if (x.type === 'chart' || x.type === 'kpi') x.val = num ? 'sum:' + num.key : 'count'; });
        }),
        up: function () { self.moveBlock(bid, -1); }, down: function () { self.moveBlock(bid, 1); },
        del: function () { self.delBlock(bid); }, delLabel: s.confirmDel === 'blk:' + bid ? 'Pulsa otra vez para quitar el bloque' : 'Quitar bloque',
        kindSeg: [], byRadio: [], bucketSeg: [], aggSeg: [], valRadio: [], sortSeg: [], topSeg: [], palSeg: [], legendSeg: [], labelsSeg: [], goalColorSeg: [], goalDirSeg: [], goal: '', setGoal: null, propRadio: [], colsSeg: [], rowsSeg: [], hasBucket: false, needsVal: false
      };
      bk.goal = b.goal == null ? '' : String(b.goal);
      bk.setGoal = function (e) { var val = String(e.target.value).trim().replace(',', '.'); upd(function (x) { x.goal = val === '' || isNaN(Number(val)) ? null : Number(val); }); };
      bk.goalDirSeg = seg([{ id: 'up', label: 'Mayor es mejor' }, { id: 'down', label: 'Menor es mejor' }], b.goalDir || 'up', function (k) { upd(function (x) { x.goalDir = k; }); });
      if (T && (b.type === 'chart' || b.type === 'kpi')) {
        var rp = this.rprops(s, T, v.role);
        var spec = String(b.val || 'count').split(':'), fn = spec[0], vk = spec[1];
        var aggProps = rp.filter(isAggProp);
        bk.aggSeg = seg([{ id: 'count', label: 'Contar' }, { id: 'sum', label: 'Suma' }, { id: 'avg', label: 'Promedio' }, { id: 'min', label: 'Mínimo' }, { id: 'max', label: 'Máximo' }], fn, function (k) { upd(function (x) { if (k === 'count') x.val = 'count'; else { var cur = String(x.val).split(':')[1] || (aggProps[0] ? aggProps[0].key : ''); x.val = cur ? k + ':' + cur : 'count'; } }); });
        bk.needsVal = fn !== 'count';
        bk.valRadio = radio(aggProps.map(function (p) { return { id: p.key, label: p.name, icon: ICON[p.type] }; }), vk, function (k) { upd(function (x) { x.val = (String(x.val).split(':')[0] === 'count' ? 'sum' : String(x.val).split(':')[0]) + ':' + k; }); });
        bk.noAggProps = aggProps.length === 0;
        D.brl = this.rulesUI(s, T, rp, b.filters || [], 'filters', {
          set: function (i, patch) { upd(function (x) { for (var k in patch) x.filters[i][k] = patch[k]; }); }, del: function (i) { upd(function (x) { x.filters.splice(i, 1); }); },
          add: function (key) { var p = propOf(T, key); upd(function (x) { if (!x.filters) x.filters = []; x.filters.push({ prop: key, op: OPS[catOf(p.type)][0], value: '' }); }); self.setState({ dAdding: false }); },
          adding: s.dAdding, toggleAdd: function () { self.setState({ dAdding: !s.dAdding }); }, intro: 'Solo se calculan los registros que cumplen estas condiciones.', addLabel: 'Añadir filtro', emptyText: 'Sin filtros propios.'
        });
      }
      if (T && b.type === 'chart') {
        var rp2 = this.rprops(s, T, v.role);
        bk.kindSeg = seg(CHART_KINDS.map(function (k) { return { id: k.id, label: k.n, icon: ICON[k.icon] }; }), b.kind, function (k) { upd(function (x) { x.kind = k; if (k === 'line') { x.sort = 'label'; var dpp = T.props.filter(isDateType)[0]; if (dpp && !isDateType(propOf(T, x.by) || {})) x.by = dpp.key; } else if (x.sort === 'label') x.sort = 'desc'; }); });
        bk.byRadio = radio(rp2.filter(isChartGroupable).map(function (p) { return { id: p.key, label: p.name, icon: ICON[p.type] }; }), b.by, function (k) { upd(function (x) { x.by = k; }); });
        var byP = propOf(T, b.by);
        bk.hasBucket = !!byP && isDateType(byP);
        bk.bucketSeg = seg([{ id: 'day', label: 'Día' }, { id: 'week', label: 'Semana' }, { id: 'month', label: 'Mes' }], b.bucket || 'day', function (k) { upd(function (x) { x.bucket = k; }); });
        bk.sortSeg = seg([{ id: 'desc', label: 'Mayor a menor' }, { id: 'asc', label: 'Menor a mayor' }, { id: 'label', label: 'Por etiqueta' }], b.sort || 'desc', function (k) { upd(function (x) { x.sort = k; }); });
        bk.palSeg = seg(CHART_PALS.map(function (x) { return { id: x.id, label: x.n }; }), b.pal || 'auto', function (k) { upd(function (x) { x.pal = k; }); });
        bk.legendSeg = seg([{ id: 'show', label: 'Mostrar leyenda' }, { id: 'hide', label: 'Ocultar' }], b.legend || 'show', function (k) { upd(function (x) { x.legend = k; }); });
        bk.labelsSeg = seg([{ id: 'show', label: 'Mostrar valores' }, { id: 'hide', label: 'Ocultar' }], b.labels || 'show', function (k) { upd(function (x) { x.labels = k; }); });
        bk.goalColorSeg = seg([{ id: 'off', label: 'Colores normales' }, { id: 'on', label: 'Verde o rojo según la meta' }], b.goalColor ? 'on' : 'off', function (k) { upd(function (x) { x.goalColor = k === 'on'; }); });
        bk.topSeg = seg([{ id: 0, label: 'Todos' }, { id: 5, label: 'Top 5' }, { id: 10, label: 'Top 10' }], b.limit || 0, function (k) { upd(function (x) { x.limit = Number(k); }); });
      }
      if (T && b.type === 'slicer') {
        bk.propRadio = radio(this.rprops(s, T, v.role).filter(function (p) { return isChartGroupable(p) && !isDateType(p); }).map(function (p) { return { id: p.key, label: p.name, icon: ICON[p.type] }; }), b.prop, function (k) { upd(function (x) { x.prop = k; }); });
      }
      if (b.type === 'sheet') {
        bk.colsSeg = seg([{ id: 4, label: '4' }, { id: 6, label: '6' }, { id: 8, label: '8' }, { id: 10, label: '10' }], b.cols || 6, function (k) { upd(function (x) { x.cols = Number(k); }); });
        bk.rowsSeg = seg([{ id: 8, label: '8' }, { id: 12, label: '12' }, { id: 20, label: '20' }, { id: 30, label: '30' }], b.rows || 12, function (k) { upd(function (x) { x.rows = Number(k); }); });
        bk.clearAll = function () { upd(function (x) { x.cells = {}; }); self.toastMsg('Hoja vaciada'); };
      }
      D.bk = bk;
      return D;
    }

    /* ----- vistas y columnas de una base de datos ----- */
    var c = s.dCtx || { tid: this.curTid(s), vid: null, where: 'scr' };
    var t = s.tables.byId[c.tid];
    if (!t) { D.drawerOpen = false; return D; }
    var tid = t.id;
    var vw = this.viewOf(t, c.vid);
    var vid = vw.id;
    var lvl = this.lvl(s, tid, v.role);
    var canEdit = lvl === 'edit' || lvl === 'full', canStructure = lvl === 'full';
    var locked = !!vw.locked;
    var rprops = this.rprops(s, t, v.role);
    function nav(pg, extra) { return function () { self.openDrawer(pg, extra); }; }
    function uv(fn) { self.updView(tid, vid, fn); }
    D.dCtxName = t.name + ' · ' + vw.name; D.hasDCtx = true;
    if (!canEdit) { D.hasDNote = true; D.dNote = 'Tu permiso en ' + t.name + ' es «' + LEVEL_NAME[lvl] + '»: puedes mirar la configuración, pero no cambiarla.'; }
    else if (locked && page !== 'root') { D.hasDNote = true; D.dNote = 'Esta vista está bloqueada. Desbloquéala desde Configuración para hacer cambios.'; }
    var gprop = propOf(t, vw.group);
    if (page === 'root') {
      D.dp_root = true;
      D.viewName = vw.name; D.viewIcon = ICON[vw.layout];
      D.renameView = function (e) { var val = e.target.value; uv(function (x) { x.name = val; }); };
      D.canRenameView = canEdit && !locked; D.cannotRenameView = !D.canRenameView;
      var sortTxt = vw.sorts.length ? ((propOf(t, vw.sorts[0].prop) || {}).name || '') + (vw.sorts.length > 1 ? ' +' + (vw.sorts.length - 1) : '') : '';
      var visCount = rprops.filter(function (p) { return vw.hidden.indexOf(p.key) < 0; }).length;
      var aiCount = t.props.filter(function (p) { return p.type === 'ai'; }).length;
      var autoOn = (t.automations || []).filter(function (a) { return a.on; }).length;
      var row = function (icon, label, value, go, opts) {
        var r = { icon: icon, label: label, value: value || '', hasValue: !!value, go: go, isSwitch: false, on: false, cls: '', action: false };
        if (opts) for (var k in opts) r[k] = opts[k];
        r.swCls = r.on ? 'on' : ''; r.pressed = r.isSwitch ? !!r.on : undefined; r.chev = !r.isSwitch && !r.action;
        return r;
      };
      D.rootGroups = [
        { title: '', hasTitle: false, rows: [
          row(ICON[vw.layout], 'Diseño', LAYOUT_NAME[vw.layout], nav('layout')),
          row(ICON.eye, 'Columnas visibles', String(visCount), nav('visibility')),
          row(ICON.filter, 'Filtrar', vw.filters.length ? String(vw.filters.length) : '', nav('filter')),
          row(ICON.sort, 'Ordenar', sortTxt, nav('sort')),
          row(ICON.group, 'Agrupar', gprop ? gprop.name : '', nav('group')),
          row(ICON.paint, 'Color condicional', vw.colors.length ? String(vw.colors.length) : '', nav('color')),
          row(ICON.link, 'Copiar enlace a la vista', '', function () { self.copyLink(tid, vid, 'view'); }, { action: true })
        ] },
        { title: 'Configuración de fuente de datos', hasTitle: true, rows: [
          row(ICON.origin, 'Origen', t.name, nav('origin')),
          row(ICON.props, 'Editar columnas', String(t.props.length), nav('props')),
          row(ICON.bolt, 'Automatizaciones', autoOn ? autoOn + ' activas' : '', nav('automations')),
          row(ICON.ai, 'Autocompletado con IA', aiCount ? String(aiCount) : '', nav('ai')),
          row(ICON.more, 'Más configuraciones', '', nav('more'))
        ] },
        { title: '', hasTitle: false, rows: [row(ICON.expand, 'Abrir registros como página completa', '', function () { uv(function (x) { x.openFull = !x.openFull; }); }, { isSwitch: true, on: !!vw.openFull })] },
        { title: '', hasTitle: false, rows: [
          row(ICON.db, 'Gestionar fuentes de datos', String(s.tables.order.length), nav('sources')),
          row(ICON.lock, 'Bloquear vistas', '', function () {
            if (lvl !== 'full') { self.toastMsg('Solo quien tiene permiso «Total» puede bloquear vistas.'); return; }
            self.updView(tid, vid, function (x) { x.locked = !x.locked; }, true);
            self.toastMsg(vw.locked ? 'Vista desbloqueada' : 'Vista bloqueada: nadie puede cambiar filtros, orden ni columnas');
          }, { isSwitch: true, on: locked })
        ] },
        { title: '', hasTitle: false, rows: [
          row(ICON.copy, 'Duplicar esta vista', '', function () { self.dupView(tid, vid, c.where); }, { action: true }),
          row(ICON.trash, 'Eliminar esta vista', '', function () { self.delView(tid, vid, c.where); }, { action: true, cls: 'danger' })
        ] }
      ];
    }
    if (page === 'layout') {
      D.dp_layout = true;
      D.layOpts = LAYOUTS.map(function (l) { return { name: l.n, icon: ICON[l.id], cls: vw.layout === l.id ? 'on' : '', pick: function () { uv(function (x) {
        x.layout = l.id;
        if (l.id === 'board' && !propOf(t, x.group)) { var g2 = t.props.filter(function (pp) { return pp.type === 'status' || pp.type === 'select'; })[0]; x.group = g2 ? g2.key : null; }
        if (l.id === 'calendar' && !propOf(t, x.dateProp)) { var d2 = t.props.filter(function (pp) { return pp.type === 'date'; })[0]; x.dateProp = d2 ? d2.key : null; }
        if (l.id === 'chart' && !propOf(t, x.chartBy)) { var c2 = t.props.filter(isGroupable)[0]; x.chartBy = c2 ? c2.key : null; }
      }); } }; });
      D.layBoard = vw.layout === 'board'; D.layCal = vw.layout === 'calendar'; D.layChart = vw.layout === 'chart';
      D.groupRadio = radio(rprops.filter(isGroupable).map(function (p) { return { id: p.key, label: p.name, icon: ICON[p.type] }; }), vw.group, function (k) { uv(function (x) { x.group = k; }); });
      D.dateRadio = radio(rprops.filter(isDateType).map(function (p) { return { id: p.key, label: p.name, icon: ICON[p.type] }; }), vw.dateProp, function (k) { uv(function (x) { x.dateProp = k; }); });
      D.chartKindSeg = seg(CHART_KINDS.map(function (k) { return { id: k.id, label: k.n, icon: ICON[k.icon] }; }), vw.chartKind || 'column', function (k) { uv(function (x) { x.chartKind = k; }); });
      D.chartByRadio = radio(rprops.filter(isChartGroupable).map(function (p) { return { id: p.key, label: p.name, icon: ICON[p.type] }; }), vw.chartBy, function (k) { uv(function (x) { x.chartBy = k; }); });
      var cbp = propOf(t, vw.chartBy);
      D.hasBucket = !!cbp && isDateType(cbp);
      D.bucketSeg = seg([{ id: 'day', label: 'Día' }, { id: 'week', label: 'Semana' }, { id: 'month', label: 'Mes' }], vw.chartBucket || 'day', function (k) { uv(function (x) { x.chartBucket = k; }); });
      var cv = String(vw.chartVal || 'count'); if (cv !== 'count' && cv.indexOf(':') < 0) cv = 'sum:' + cv;
      D.chartValRadio = radio([{ id: 'count', label: 'Contar registros', icon: ICON.number }].concat(rprops.filter(isAggProp).map(function (p) { return { id: 'sum:' + p.key, label: 'Suma de ' + p.name, icon: ICON.formula }; })), cv, function (k) { uv(function (x) { x.chartVal = k; }); });
      D.openRadio = radio([{ id: 'side', label: 'Panel lateral' }, { id: 'full', label: 'Página completa' }], vw.openFull ? 'full' : 'side', function (k) { uv(function (x) { x.openFull = k === 'full'; }); });
    }
    if (page === 'visibility') {
      D.dp_visibility = true;
      D.visRows = rprops.map(function (p) {
        var on = vw.hidden.indexOf(p.key) < 0 || p.type === 'title';
        return { name: p.name, icon: ICON[p.type], on: on, notOn: !on, isTitle: p.type === 'title', notTitle: p.type !== 'title', aria: (on ? 'Ocultar ' : 'Mostrar ') + p.name, toggle: function () { uv(function (x) { var i = x.hidden.indexOf(p.key); if (i >= 0) x.hidden.splice(i, 1); else x.hidden.push(p.key); }); } };
      });
      var roleHidden = t.props.filter(function (p) { return rprops.indexOf(p) < 0; });
      D.roleHiddenRows = roleHidden.map(function (p) { return { name: p.name, icon: ICON[p.type] }; });
      D.hasRoleHidden = roleHidden.length > 0;
      D.showAll = function () { uv(function (x) { x.hidden = []; }); };
      D.hideAll = function () { uv(function (x) { x.hidden = t.props.filter(function (p) { return p.type !== 'title'; }).map(function (p) { return p.key; }); }); };
    }
    if (page === 'filter' || page === 'color') {
      D.dp_rules = true;
      var kind = page === 'filter' ? 'filters' : 'colors';
      D.rl = this.rulesUI(s, t, rprops, vw[kind], kind, {
        set: function (i, patch) { uv(function (x) { if (!x[kind][i]) return; for (var k in patch) x[kind][i][k] = patch[k]; }); },
        del: function (i) { uv(function (x) { x[kind].splice(i, 1); }); },
        add: function (key) { self.addRule(tid, vid, kind, key); },
        adding: s.dAdding, toggleAdd: function () { self.setState({ dAdding: !s.dAdding }); },
        intro: kind === 'filters' ? 'Solo se muestran los registros que cumplen todas las condiciones.' : 'Pinta las filas y tarjetas que cumplan cada regla. Gana la primera que coincida.',
        addLabel: kind === 'filters' ? 'Añadir filtro' : 'Añadir regla de color', emptyText: kind === 'filters' ? 'Esta vista no tiene filtros.' : 'Esta vista no tiene reglas de color.'
      });
    }
    if (page === 'sort') {
      D.dp_sort = true;
      D.sortsV = vw.sorts.map(function (x, i) {
        var p = propOf(t, x.prop);
        if (!p) return null;
        return { name: p.name, icon: ICON[p.type], ascCls: x.dir === 'asc' ? 'on' : '', descCls: x.dir === 'desc' ? 'on' : '', notFirst: i > 0,
          setAsc: function () { uv(function (y) { y.sorts[i].dir = 'asc'; }); }, setDesc: function () { uv(function (y) { y.sorts[i].dir = 'desc'; }); },
          up: function () { uv(function (y) { var tmp = y.sorts[i - 1]; y.sorts[i - 1] = y.sorts[i]; y.sorts[i] = tmp; }); },
          remove: function () { uv(function (y) { y.sorts.splice(i, 1); }); }, removeAria: 'Quitar orden por ' + p.name };
      }).filter(function (x) { return x; });
      D.sortsEmpty = D.sortsV.length === 0;
      D.sortAdding = !!s.dAdding;
      D.toggleSortAdd = function () { self.setState({ dAdding: !s.dAdding }); };
      D.sortProps = rprops.filter(function (p) { return p.type !== 'button' && !vw.sorts.some(function (x) { return x.prop === p.key; }); }).map(function (p) { return { name: p.name, icon: ICON[p.type], pick: function () { uv(function (y) { y.sorts.push({ prop: p.key, dir: 'asc' }); }); self.setState({ dAdding: false }); } }; });
    }
    if (page === 'group') {
      D.dp_group = true;
      D.groupAll = radio([{ id: '__none', label: 'Ninguno' }].concat(rprops.filter(isGroupable).map(function (p) { return { id: p.key, label: p.name, icon: ICON[p.type] }; })), vw.group || '__none', function (k) { uv(function (x) { x.group = k === '__none' ? null : k; }); });
      D.hideEmptyCls = vw.hideEmpty ? 'on' : ''; D.hideEmptyOn = !!vw.hideEmpty;
      D.toggleHideEmpty = function () { uv(function (x) { x.hideEmpty = !x.hideEmpty; }); };
      D.groupNote = 'Agrupa la tabla y define las columnas del tablero. Se puede agrupar por Seleccionar, Estado, Selección múltiple, Personas, Casilla y Relación.';
    }
    if (page === 'props') {
      D.dp_props = true;
      D.propsV = t.props.map(function (p, i) {
        var roleH = (s.colHide[tid] || {})[p.key] || [];
        return { name: p.name, icon: ICON[p.type], typeName: TYPE_NAME[p.type] + (roleH.length ? ' · oculta a ' + roleH.length + (roleH.length === 1 ? ' rol' : ' roles') : ''), edit: function () { self.openDrawer('propEdit', { dProp: p.key }); }, canUp: i > 1, canDown: i > 0 && i < t.props.length - 1, up: function () { self.moveProp(tid, p.key, -1); }, down: function () { self.moveProp(tid, p.key, 1); }, upAria: 'Subir ' + p.name, downAria: 'Bajar ' + p.name };
      });
      D.openNewPropD = function () { self.openDrawer('newProp'); };
      D.canStructureD = canStructure && !locked;
    }
    if (page === 'newProp') {
      D.dp_newProp = true;
      D.newPropName = s.newPropName || '';
      D.setNewPropName = function (e) { self.setState({ newPropName: e.target.value }); };
      D.newPropSearch = s.newPropSearch || '';
      D.setNewPropSearch = function (e) { self.setState({ newPropSearch: e.target.value }); };
      var qq = String(s.newPropSearch || '').toLowerCase().trim();
      D.typesV = TYPES.filter(function (x) { return !qq || x.n.toLowerCase().indexOf(qq) >= 0; }).map(function (x) { return { name: x.n, icon: ICON[x.t], pick: function () { self.createProp(tid, x.t, String(s.newPropName || '').trim()); } }; });
      D.typesEmpty = D.typesV.length === 0;
      D.aiItems = [{ name: 'Resumir', mode: 'summary', icon: ICON.ai }, { name: 'Traducir', mode: 'translate', icon: ICON.translate }].map(function (x) { return { name: x.name, icon: x.icon, pick: function () { self.createProp(tid, 'ai', String(s.newPropName || '').trim(), { mode: x.mode }); } }; });
      D.conns = CONNECTIONS.map(function (n) { return { name: n }; });
      D.relQuick = s.tables.order.filter(function (id) { return id !== tid; }).map(function (id) { var tt = s.tables.byId[id]; return { name: tt.name, icon: ICON[tt.icon] || ICON.db, color: tt.color, pick: function () { self.createProp(tid, 'relation', String(s.newPropName || '').trim(), { target: id }); } }; });
    }
    if (page === 'propEdit') {
      D.dp_propEdit = true;
      var p = propOf(t, s.dProp);
      if (!p) { D.dp_propEdit = false; D.dp_props = true; return D; }
      var pk = p.key;
      function cfg(patch) { self.setPropCfg(tid, pk, patch); }
      var pe = {
        name: p.name, icon: ICON[p.type], typeName: TYPE_NAME[p.type], isTitle: p.type === 'title', notTitle: p.type !== 'title',
        setName: function (e) { self.renameProp(tid, pk, e.target.value); },
        desc: p.desc || '', setDesc: function (e) { cfg({ desc: e.target.value }); },
        typeChanging: !!s.dTypeChange, toggleType: function () { self.setState({ dTypeChange: !s.dTypeChange }); },
        typeList: TYPES.filter(function (x) { return x.t !== p.type; }).map(function (x) { return { name: x.n, icon: ICON[x.t], pick: function () { self.changeType(tid, pk, x.t); } }; }),
        cNumber: p.type === 'number', cOptions: ['select', 'multi_select', 'status'].indexOf(p.type) >= 0, isStatus: p.type === 'status', cDefOpt: p.type === 'select' || p.type === 'status',
        cRelation: p.type === 'relation', cRollup: p.type === 'rollup', cFormula: p.type === 'formula', cButton: p.type === 'button', cId: p.type === 'id', cAi: p.type === 'ai',
        cDate: p.type === 'date', cCheck: p.type === 'checkbox', cText: p.type === 'text', cUrl: p.type === 'url', cPerson: p.type === 'person',
        cAuto: ['created_time', 'created_by', 'last_edited_time', 'last_edited_by'].indexOf(p.type) >= 0,
        canRequire: !COMPUTED[p.type] && ['button', 'ai', 'title'].indexOf(p.type) < 0, reqOn: !!p.required, reqCls: p.required ? 'on' : '', toggleReq: function () { cfg({ required: !p.required }); },
        widthSeg: seg([{ id: 'S', label: 'Estrecha' }, { id: 'M', label: 'Normal' }, { id: 'L', label: 'Ancha' }], (vw.widths || {})[pk] || 'M', function (k) { uv(function (x) { x.widths[pk] = k; }); }),
        wrapOn: !!(vw.wrap || {})[pk], wrapCls: (vw.wrap || {})[pk] ? 'on' : '', toggleWrap: function () { uv(function (x) { x.wrap[pk] = !x.wrap[pk]; }); },
        hiddenInView: vw.hidden.indexOf(pk) >= 0, toggleHidden: function () { uv(function (x) { var i = x.hidden.indexOf(pk); if (i >= 0) x.hidden.splice(i, 1); else x.hidden.push(pk); }); },
        dup: function () { self.dupProp(tid, pk); }, canDup: p.type !== 'title' && p.type !== 'relation',
        del: function () { if (s.confirmDel === 'prop:' + pk) self.deleteProp(tid, pk); else self.setState({ confirmDel: 'prop:' + pk }); },
        delLabel: s.confirmDel === 'prop:' + pk ? 'Pulsa otra vez para eliminar «' + p.name + '»' : 'Eliminar columna',
        viewName: vw.name
      };
      pe.visLabel = pe.hiddenInView ? 'Mostrar en «' + vw.name + '»' : 'Ocultar en «' + vw.name + '»';
      pe.autoNote = { created_time: 'Guarda la fecha y hora en que se creó cada registro.', created_by: 'Guarda quién creó cada registro.', last_edited_time: 'Se actualiza cada vez que alguien edita el registro.', last_edited_by: 'Guarda quién hizo la última edición.' }[p.type] || '';
      if (p.type === 'number') {
        pe.fmtOpts = radio(NUM_FMTS.map(function (x) { return { id: x.id, label: x.n }; }), p.fmt || 'number', function (k) { cfg({ fmt: k }); });
        pe.decSeg = seg([{ id: 'auto', label: 'Auto' }, { id: 0, label: '0' }, { id: 1, label: '1' }, { id: 2, label: '2' }], p.dec == null ? 'auto' : p.dec, function (k) { cfg({ dec: k === 'auto' ? 'auto' : Number(k) }); });
        pe.sepOn = p.sep !== false; pe.sepCls = p.sep !== false ? 'on' : ''; pe.toggleSep = function () { cfg({ sep: p.sep === false }); };
        pe.showSeg = seg([{ id: 'number', label: 'Número', icon: ICON.number }, { id: 'bar', label: 'Barra', icon: ICON.width }, { id: 'ring', label: 'Anillo', icon: ICON.ring }], p.showAs || 'number', function (k) { cfg({ showAs: k === 'number' ? undefined : k, max: p.max || 100 }); });
        pe.hasMax = p.showAs === 'bar' || p.showAs === 'ring'; pe.max = String(p.max || 100);
        pe.setMax = function (e) { var n = Number(String(e.target.value).replace(/[^0-9.]/g, '')); cfg({ max: n || 1 }); };
        pe.def = p.def == null ? '' : String(p.def); pe.setDef = function (e) { var val = e.target.value; cfg({ def: val === '' ? undefined : val }); };
        pe.example = 'Ejemplo: ' + fmtNumber(1234.5, p.fmt, p.dec, p.sep);
      }
      if (p.type === 'date') {
        pe.dateSeg = radio(DATE_FMTS.map(function (x) { return { id: x.id, label: x.n }; }), p.dateFmt || 'long', function (k) { cfg({ dateFmt: k }); });
        pe.defDateSeg = seg([{ id: 'none', label: 'Vacía' }, { id: '__today', label: 'Hoy' }], p.def === '__today' ? '__today' : 'none', function (k) { cfg({ def: k === 'none' ? undefined : '__today' }); });
      }
      if (p.type === 'checkbox') {
        pe.checkSeg = seg([{ id: 'box', label: 'Casilla', icon: ICON.checkbox }, { id: 'switch', label: 'Interruptor', icon: ICON.toggle }], p.checkStyle || 'box', function (k) { cfg({ checkStyle: k === 'box' ? undefined : k }); });
        pe.defCheckOn = p.def === true; pe.defCheckCls = p.def === true ? 'on' : ''; pe.toggleDefCheck = function () { cfg({ def: p.def === true ? undefined : true }); };
      }
      if (p.type === 'text') { pe.def = p.def || ''; pe.setDef = function (e) { var val = e.target.value; cfg({ def: val === '' ? undefined : val }); }; }
      if (p.type === 'url') { pe.urlOn = !!p.urlShort; pe.urlCls = p.urlShort ? 'on' : ''; pe.toggleUrl = function () { cfg({ urlShort: !p.urlShort }); }; }
      if (p.type === 'person') { pe.singleOn = !!p.single; pe.singleCls = p.single ? 'on' : ''; pe.toggleSingle = function () { cfg({ single: !p.single }); }; }
      if (pe.cOptions) {
        pe.opts = p.options.map(function (x, i) {
          var g = STATUS_GROUPS.filter(function (y) { return y.id === x.g; })[0];
          return { v: x.v, cls: 'p-' + x.c, groupName: g ? g.n : '', canUp: i > 0, up: function () { self.moveOption(tid, pk, i, -1); },
            rename: function (e) { self.renameOption(tid, pk, i, e.target.value); }, cycleColor: function () { self.cycleOptColor(tid, pk, i); }, cycleGroup: function () { self.cycleOptGroup(tid, pk, i); }, remove: function () { self.delOption(tid, pk, i); },
            aria: 'Eliminar opción ' + x.v, colorAria: 'Cambiar color de ' + x.v + ' (ahora ' + (COLOR_NAME[x.c] || x.c) + ')', upAria: 'Subir ' + x.v };
        });
        pe.optDraft = s.optDraft || '';
        pe.setOptDraft = function (e) { self.setState({ optDraft: e.target.value }); };
        pe.addOpt = function () { self.addOption(tid, pk, self.st().optDraft); };
        pe.sortAZ = function () { self.sortOptions(tid, pk); };
        pe.defOpts = radio([{ id: '__none', label: 'Sin valor por defecto' }].concat(p.options.map(function (x) { return { id: x.v, label: x.v }; })), p.def || '__none', function (k) { cfg({ def: k === '__none' ? undefined : k }); });
      }
      if (p.type === 'relation') {
        var T2 = s.tables.byId[p.target], P2 = T2 && p.pair ? propOf(T2, p.pair) : null;
        pe.relTarget = T2 ? T2.name : '—'; pe.relIcon = T2 ? (ICON[T2.icon] || ICON.db) : ICON.db; pe.relColor = T2 ? T2.color : '#888';
        pe.relPair = P2 ? 'En ' + T2.name + ' aparece como «' + P2.name + '». Los cambios se reflejan en los dos lados.' : 'Relación en un solo sentido.';
        pe.singleOn = !!p.single; pe.singleCls = p.single ? 'on' : ''; pe.toggleSingle = function () { cfg({ single: !p.single }); };
        pe.goMap = function () { self.goPage('pg3'); };
      }
      if (p.type === 'rollup') {
        var rels = t.props.filter(function (x) { return x.type === 'relation'; });
        pe.rollRels = radio(rels.map(function (x) { return { id: x.key, label: x.name, icon: ICON.relation }; }), p.rel, function (k) { cfg({ rel: k, prop: '' }); });
        var rel = propOf(t, p.rel), T3 = rel ? s.tables.byId[rel.target] : null;
        pe.hasRollTarget = !!T3;
        pe.rollProps = T3 ? radio(T3.props.filter(function (x) { return x.type !== 'button'; }).map(function (x) { return { id: x.key, label: x.name, icon: ICON[x.type] }; }), p.prop, function (k) { cfg({ prop: k }); }) : [];
        pe.rollFns = radio(ROLLUP_FNS.map(function (x) { return { id: x.id, label: x.n }; }), p.fn, function (k) { cfg({ fn: k }); });
        pe.rollNone = rels.length === 0;
      }
      if (p.type === 'formula') {
        pe.expr = p.expr || '';
        pe.setExpr = function (e) { cfg({ expr: e.target.value }); };
        pe.insertProps = t.props.filter(function (x) { return x.key !== pk; }).map(function (x) { return { label: '[' + x.name + ']', pick: function () { var cur = (propOf(self.st().tables.byId[tid], pk) || {}).expr || ''; cfg({ expr: joinExpr(cur, '[' + x.name + ']') }); } }; });
        pe.insertFns = [
          { label: 'SI', code: 'SI(condición; "sí"; "no")' }, { label: 'SUMA', code: 'SUMA(' }, { label: 'REDONDEAR', code: 'REDONDEAR(número; 2)' }, { label: 'SUMAR.SI', code: 'SUMAR.SI(Tabla[Columna]; "criterio"; Tabla[Columna])' },
          { label: 'CONTAR.SI', code: 'CONTAR.SI(Tabla[Columna]; "criterio")' }, { label: 'BUSCAR', code: 'BUSCAR(valor; Tabla[Columna]; Tabla[Resultado])' }, { label: 'DIAS', code: 'DIAS([Fecha fin]; HOY())' },
          { label: 'CONCATENAR', code: 'CONCATENAR("texto"; [Columna])' }, { label: 'HOY', code: 'HOY()' }
        ].map(function (x) { return { label: x.label, pick: function () { var cur = (propOf(self.st().tables.byId[tid], pk) || {}).expr || ''; cfg({ expr: joinExpr(cur, x.code) }); } }; });
        pe.resSeg = radio(RES_FMTS.map(function (x) { return { id: x.id, label: x.n }; }), p.resFmt || 'auto', function (k) { cfg({ resFmt: k }); });
        pe.resDecSeg = seg([{ id: 'auto', label: 'Auto' }, { id: 0, label: '0' }, { id: 1, label: '1' }, { id: 2, label: '2' }], p.resDec == null ? 'auto' : p.resDec, function (k) { cfg({ resDec: k === 'auto' ? undefined : Number(k) }); });
        var sample = t.rows[0] || null;
        pe.previewOk = false; pe.previewErr = false; pe.preview = '';
        if (!String(p.expr || '').trim()) { pe.preview = 'Escribe una fórmula. Ejemplos: =[Precio] * [Stock] · =SI([Stock] < 20; "Reponer"; "OK")'; pe.previewOk = true; }
        else if (sample) {
          try { var res = self.formulaVal(s, t, p, sample, 0); var d0 = self.dispOf(s, t, p, sample, v, false); pe.preview = 'Resultado en «' + self.titleOf(t, sample) + '»: ' + (res == null ? '(vacío)' : dispText(d0)); pe.previewOk = true; }
          catch (e) { pe.preview = 'Error: ' + e.message; pe.previewErr = true; }
        }
      }
      if (p.type === 'button') {
        pe.btnLabel = p.label || '';
        pe.setBtnLabel = function (e) { cfg({ label: e.target.value }); };
        var acts = t.props.filter(function (x) { return ['status', 'select', 'checkbox', 'date', 'person'].indexOf(x.type) >= 0; });
        pe.btnProps = radio(acts.map(function (x) { return { id: x.key, label: x.name, icon: ICON[x.type] }; }), p.action ? p.action.prop : null, function (k) { var ap = propOf(t, k); var dv = ap.type === 'checkbox' ? true : ap.type === 'date' ? '__today' : ap.type === 'person' ? '__me' : (ap.options[0] ? ap.options[0].v : ''); cfg({ action: { prop: k, value: dv } }); });
        var ap2 = p.action ? propOf(t, p.action.prop) : null;
        pe.hasBtnVals = !!ap2;
        var bvals = !ap2 ? [] : ap2.type === 'checkbox' ? [{ id: true, label: 'Marcada' }, { id: false, label: 'Sin marcar' }] : ap2.type === 'date' ? [{ id: '__today', label: 'Hoy' }] : ap2.type === 'person' ? [{ id: '__me', label: 'Quien pulsa el botón' }] : ap2.options.map(function (x) { return { id: x.v, label: x.v }; });
        pe.btnVals = radio(bvals, p.action ? p.action.value : null, function (k) { var real = bvals.filter(function (x) { return String(x.id) === String(k); })[0]; cfg({ action: { prop: p.action.prop, value: real ? real.id : k } }); });
      }
      if (p.type === 'id') {
        pe.prefix = p.prefix || '';
        pe.setPrefix = function (e) { cfg({ prefix: String(e.target.value).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) }); };
        pe.idPreview = 'Siguiente: ' + (p.prefix ? p.prefix + '-' : '') + (t.nextId || 1);
      }
      if (p.type === 'ai') {
        pe.aiModes = radio([{ id: 'summary', label: 'Resumir' }, { id: 'translate', label: 'Traducir' }], p.mode, function (k) { cfg({ mode: k, src: k === 'translate' ? self.titleProp(t).key : undefined, lang: 'Inglés' }); });
        pe.aiAutoCls = p.auto ? 'on' : ''; pe.aiAutoOn = !!p.auto;
        pe.toggleAiAuto = function () { cfg({ auto: !p.auto }); };
        pe.aiNote = p.mode === 'translate' ? 'La traducción la hará Claude cuando conectemos la IA real. En el prototipo queda pendiente.' : 'En el prototipo el resumen se arma con los datos del registro. En la versión real lo escribe Claude.';
        pe.aiRefresh = function () { var ok = self.updTable(tid, function (tt, tables) { var s2 = Object.assign({}, s, { tables: tables }); var pp = propOf(tt, pk); tt.rows.forEach(function (r) { r[pk] = self.aiText(s2, tt, pp, r); }); }); if (ok) self.toastMsg('Valores actualizados en ' + t.rows.length + ' registros'); };
      }
      for (var dk in D.pe) if (pe[dk] === undefined) pe[dk] = D.pe[dk];
      D.pe = pe;
    }
    if (page === 'automations') {
      D.dp_automations = true;
      D.autosV = (t.automations || []).map(function (a) {
        return { text: self.describeAuto(s, t, a), on: a.on, swCls: a.on ? 'on' : '', runs: 'Se ejecutó ' + (a.runs || 0) + (a.runs === 1 ? ' vez' : ' veces'),
          toggle: function () { self.updTable(tid, function (tt) { (tt.automations || []).forEach(function (x) { if (x.id === a.id) x.on = !x.on; }); }, (a.on ? 'desactivó' : 'activó') + ' una automatización'); },
          remove: function () { self.updTable(tid, function (tt) { tt.automations = (tt.automations || []).filter(function (x) { return x.id !== a.id; }); }, 'eliminó una automatización'); },
          aria: (a.on ? 'Desactivar' : 'Activar') + ' automatización' };
      });
      D.autosEmpty = D.autosV.length === 0;
      D.newAuto = function () { if (self.canDo(s, tid, vid, 'struct')) self.openDrawer('autoNew', { autoDraft: { trig: 'changed', tprop: null, tval: null, act: 'notify', who: null, aprop: null, aval: null } }); };
    }
    if (page === 'autoNew') {
      D.dp_autoNew = true;
      var d = s.autoDraft || { trig: 'changed', act: 'notify' };
      var setD = function (patch) { self.setState({ autoDraft: Object.assign({}, d, patch) }); };
      var trigProps = t.props.filter(function (x) { return ['status', 'select', 'checkbox'].indexOf(x.type) >= 0; });
      D.trigSeg = seg([{ id: 'created', label: 'Se crea un registro' }, { id: 'changed', label: 'Una propiedad cambia' }], d.trig, function (k) { setD({ trig: k }); });
      D.trigChanged = d.trig === 'changed';
      D.trigProps = radio(trigProps.map(function (x) { return { id: x.key, label: x.name, icon: ICON[x.type] }; }), d.tprop, function (k) { setD({ tprop: k, tval: null }); });
      var tp = propOf(t, d.tprop);
      D.hasTrigVals = D.trigChanged && !!tp;
      var tvals = !tp ? [] : (tp.type === 'checkbox' ? [{ id: true, label: 'Marcada' }, { id: false, label: 'Sin marcar' }] : tp.options.map(function (x) { return { id: x.v, label: x.v }; }));
      D.trigVals = radio(tvals, d.tval, function (k) { var real = tvals.filter(function (x) { return String(x.id) === String(k); })[0]; setD({ tval: real ? real.id : k }); });
      D.actSeg = seg([{ id: 'notify', label: 'Enviar un aviso' }, { id: 'set', label: 'Cambiar una propiedad' }], d.act, function (k) { setD({ act: k }); });
      D.actNotify = d.act === 'notify'; D.actSet = d.act === 'set';
      D.whoOpts = radio(ROLES.map(function (r) { return { id: 'role:' + r.id, label: 'Rol ' + r.name, icon: ICON['i-users'] }; }).concat(t.props.filter(function (x) { return x.type === 'person'; }).map(function (x) { return { id: 'prop:' + x.key, label: 'Personas en ' + x.name, icon: ICON.person }; })), d.who, function (k) { setD({ who: k }); });
      var setProps = t.props.filter(function (x) { return ['status', 'select', 'checkbox', 'date', 'person'].indexOf(x.type) >= 0; });
      D.actProps = radio(setProps.map(function (x) { return { id: x.key, label: x.name, icon: ICON[x.type] }; }), d.aprop, function (k) { setD({ aprop: k, aval: null }); });
      var ap = propOf(t, d.aprop);
      D.hasActVals = D.actSet && !!ap;
      var avals = !ap ? [] : ap.type === 'checkbox' ? [{ id: true, label: 'Marcada' }, { id: false, label: 'Sin marcar' }] : ap.type === 'date' ? [{ id: '__today', label: 'Hoy' }] : ap.type === 'person' ? [{ id: '__me', label: 'Quien hace el cambio' }] : ap.options.map(function (x) { return { id: x.v, label: x.v }; });
      D.actVals = radio(avals, d.aval, function (k) { var real = avals.filter(function (x) { return String(x.id) === String(k); })[0]; setD({ aval: real ? real.id : k }); });
      var trigOk = d.trig === 'created' || (tp && d.tval != null);
      var actOk = d.act === 'notify' ? !!d.who : (ap && d.aval != null);
      D.autoReady = !!(trigOk && actOk);
      D.autoPreview = D.autoReady ? this.describeAuto(s, t, { trigger: d.trig === 'created' ? { type: 'created' } : { type: 'changed', prop: d.tprop, value: d.tval }, action: d.act === 'notify' ? { type: 'notify', who: d.who } : { type: 'set', prop: d.aprop, value: d.aval } }) : 'Completa el disparador y la acción.';
      D.autoCreate = function () { self.autoCreate(tid); };
    }
    if (page === 'ai') {
      D.dp_ai = true;
      D.aiPropsV = t.props.filter(function (x) { return x.type === 'ai'; }).map(function (x) { return { name: x.name, mode: x.mode === 'translate' ? 'Traducir' : 'Resumir', icon: x.mode === 'translate' ? ICON.translate : ICON.ai, edit: function () { self.openDrawer('propEdit', { dProp: x.key }); } }; });
      D.aiNone = D.aiPropsV.length === 0;
      D.aiAddSummary = function () { self.createProp(tid, 'ai', '', { mode: 'summary' }); };
      D.aiAddTranslate = function () { self.createProp(tid, 'ai', '', { mode: 'translate' }); };
    }
    if (page === 'more') {
      D.dp_more = true;
      D.dbName = t.name; D.dbDesc = t.desc || '';
      D.setDbName = function (e) { var val = e.target.value; self.updTable(tid, function (tt) { tt.name = val; if (val.trim()) tt.abbr = abbrOf(val); }); };
      D.setDbDesc = function (e) { var val = e.target.value; self.updTable(tid, function (tt) { tt.desc = val; }); };
      D.dbColors = NEW_COLORS.map(function (cc) { return { hex: cc, cls: t.color === cc ? 'on' : '', on: t.color === cc, aria: 'Color ' + cc, pick: function () { self.updTable(tid, function (tt) { tt.color = cc; }); } }; });
      D.dbIcons = DB_ICONS.map(function (k) { return { icon: ICON[k], cls: t.icon === k ? 'on' : '', on: t.icon === k, aria: 'Icono ' + k.slice(2), pick: function () { self.updTable(tid, function (tt) { tt.icon = k; }); } }; });
      D.isAdminD = v.role === 'admin';
      D.dupDb = function () { self.dupTable(tid); };
      D.delDb = function () { self.delTable(tid); };
      D.delDbLabel = s.confirmDel === 'db:' + tid ? 'Pulsa otra vez para eliminar «' + t.name + '»' : 'Eliminar base de datos';
      D.dbStats = t.rows.length + ' registros · ' + t.props.length + ' columnas · ' + t.views.length + ' vistas';
    }
    if (page === 'sources' || page === 'origin') {
      D.dp_sources = true;
      D.srcIntro = page === 'origin' ? 'Esta vista muestra los datos de «' + t.name + '». Elige otra base de datos para abrirla.' : 'Todas las bases de datos del espacio a las que tienes acceso.';
      D.srcs = s.tables.order.filter(function (id) { return self.lvl(s, id, v.role) !== 'none'; }).map(function (id) {
        var tt = s.tables.byId[id];
        return { name: tt.name, icon: ICON[tt.icon] || ICON.db, color: tt.color, meta: tt.rows.length + ' registros · ' + tt.props.length + ' columnas', cls: id === tid ? 'on' : '', isCur: id === tid, open: function () { self.go(id, null); } };
      });
      D.canNewDb = v.role === 'admin';
      D.newDbD = function () { self.newDb(null); };
    }
    return D;
  }
});
