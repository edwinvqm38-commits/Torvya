/* ================= escritura tipo Notion en las páginas ================= */
var DOC_TYPES = ['text', 'heading', 'bullet', 'number', 'check', 'quote'];
var DOC_LIST = ['bullet', 'number', 'check'];
var _blockViewBase = Component.prototype.blockView;
Object.assign(Component.prototype, {
  focusBlock(bid, atEnd) {
    setTimeout(function () {
      try {
        var el = document.querySelector('[data-bid="' + bid + '"] .doc-in');
        if (!el) return;
        el.focus();
        var n = atEnd ? String(el.value || '').length : 0;
        if (el.setSelectionRange) el.setSelectionRange(n, n);
      } catch (e) { }
    }, 40);
  },
  docEdit(pid, fn) {
    var s = this.st();
    var pages = clone(s.pages), pg = pages.byId[pid];
    if (!pg) return null;
    var res = fn(pg, s.seq);
    if (res === false) return null;
    this.setState({ pages: pages, seq: s.seq + 3 });
    return res;
  },
  docChange(pid, bid, val) {
    var s = this.st(), self = this;
    var pg = s.pages.byId[pid]; if (!pg) return;
    var b = pg.blocks.filter(function (x) { return x.id === bid; })[0]; if (!b) return;
    var conv = null, m;
    if (b.type === 'text') {
      if ((m = val.match(/^(#{1,3})\s/))) conv = { type: 'heading', lvl: m[1].length, text: val.slice(m[0].length) };
      else if ((m = val.match(/^[-*•]\s/))) conv = { type: 'bullet', text: val.slice(m[0].length) };
      else if ((m = val.match(/^1[.)]\s/))) conv = { type: 'number', text: val.slice(m[0].length) };
      else if ((m = val.match(/^\[\s?\]\s?/))) conv = { type: 'check', done: false, text: val.slice(m[0].length) };
      else if ((m = val.match(/^>\s/))) conv = { type: 'quote', text: val.slice(m[0].length) };
      else if (/^---$/.test(val)) conv = { type: 'divider', text: '' };
    }
    if (conv) {
      var newId = null;
      this.docEdit(pid, function (p, seq) {
        p.blocks.forEach(function (x, i) {
          if (x.id !== bid) return;
          for (var k in conv) x[k] = conv[k];
          if (conv.type === 'divider') { newId = 'b' + (seq + 1); p.blocks.splice(i + 1, 0, blk(newId, 'text', x.w, { text: '' })); }
        });
      });
      this.focusBlock(newId || bid, true);
      return;
    }
    var mm = val.match(/(?:^|\s)@([^\s@]{0,30})$/);
    var patch = {};
    if (mm) patch.mention = { bid: bid, q: mm[1] };
    else if (s.mention && s.mention.bid === bid) patch.mention = null;
    this.updBlock(bid, function (x) { x.text = val; });
    if (Object.keys(patch).length) this.setState(patch);
  },
  docKey(pid, bid, e) {
    if (!e || e.isComposing) return;
    var el = e.target || {}, val = String(el.value || '');
    var s = this.st(), pg = s.pages.byId[pid]; if (!pg) return;
    var idx = -1; pg.blocks.forEach(function (x, i) { if (x.id === bid) idx = i; });
    var b = pg.blocks[idx]; if (!b) return;
    if (e.key === 'Escape' && s.mention) { this.setState({ mention: null }); return; }
    if (e.key === 'Enter' && !e.shiftKey) {
      if (s.mention && s.mention.bid === bid) {
        var ml = this.mentionList(s, this.viewer(s), pid, bid, s.mention.q);
        if (ml[0]) { try { e.preventDefault(); } catch (er) { } ml[0].pick(); }
        return;
      }
      if (/^\//.test(val)) { var sm = slashMatches(val)[0]; try { e.preventDefault(); } catch (er) { } if (sm) this.slashPick(pid, sm.spec, { replace: bid, keepW: true }); return; }
      try { e.preventDefault(); } catch (er) { }
      if (DOC_LIST.indexOf(b.type) >= 0 && val === '') { this.docEdit(pid, function (p) { p.blocks[idx].type = 'text'; }); this.focusBlock(bid, true); return; }
      var pos = typeof el.selectionStart === 'number' ? el.selectionStart : val.length;
      var before = val.slice(0, pos), after = val.slice(pos);
      var nt = DOC_LIST.indexOf(b.type) >= 0 ? b.type : 'text';
      var nid = this.docEdit(pid, function (p, seq) {
        var id = 'b' + (seq + 1);
        p.blocks[idx].text = before;
        p.blocks.splice(idx + 1, 0, blk(id, nt, p.blocks[idx].w, nt === 'check' ? { text: after, done: false } : { text: after }));
        return id;
      });
      if (nid) this.focusBlock(nid, false);
      return;
    }
    if (e.key === 'Backspace' && el.selectionStart === 0 && el.selectionEnd === 0) {
      if (b.type !== 'text') { try { e.preventDefault(); } catch (er) { } this.docEdit(pid, function (p) { p.blocks[idx].type = 'text'; delete p.blocks[idx].lvl; }); this.focusBlock(bid, false); return; }
      if (val === '' && pg.blocks.length > 1) {
        try { e.preventDefault(); } catch (er) { }
        var prev = null;
        for (var i = idx - 1; i >= 0; i--) if (DOC_TYPES.indexOf(pg.blocks[i].type) >= 0) { prev = pg.blocks[i].id; break; }
        this.docEdit(pid, function (p) { p.blocks.splice(idx, 1); });
        if (prev) this.focusBlock(prev, true);
      }
    }
  },
  mentionList(s, v, pid, bid, q) {
    var self = this, nq = normTxt(q), out = [];
    function ok(txt) { return !nq || normTxt(txt).split(/\s+/).some(function (w) { return w.indexOf(nq) === 0; }) || normTxt(txt).indexOf(nq) === 0; }
    s.members.filter(function (m) { return !m.pending && ok(m.name); }).slice(0, 5).forEach(function (m) {
      var c = self.cargoOf(s, m.id);
      out.push({ kind: 'person', id: m.id, label: m.name, sub: c ? c.name : 'Persona', isPerson: true, notPerson: false, initials: initialsOf(m.name), color: m.color, icon: ICON.person });
    });
    s.pages.order.filter(function (id) { var pg = s.pages.byId[id]; return self.pageVisible(s, v, pg) && ok(pg.title); }).slice(0, 4).forEach(function (id) {
      var pg = s.pages.byId[id];
      out.push({ kind: 'page', id: id, label: pg.title, sub: 'Página', isPerson: false, notPerson: true, initials: '', color: pg.color, icon: ICON[pg.icon] || ICON.page });
    });
    if (nq.length >= 1) {
      var n = 0;
      s.tables.order.forEach(function (tid) {
        if (n >= 6 || self.lvl(s, tid, v.role) === 'none') return;
        var t = s.tables.byId[tid];
        self.rowsFor(s, tid, v).forEach(function (r) {
          if (n >= 6) return;
          var ti = self.titleOf(t, r);
          if (!ok(ti)) return;
          n++;
          out.push({ kind: 'rec', id: r.id, tid: tid, label: ti, sub: t.name, isPerson: false, notPerson: true, initials: '', color: t.color, icon: ICON[t.icon] || ICON.db });
        });
      });
    }
    return out.slice(0, 10).map(function (it, i) { it.cls = i === 0 ? 'first' : ''; it.pick = function () { self.mentionPick(pid, bid, it); }; return it; });
  },
  mentionPick(pid, bid, it) {
    var s = this.st(), v = this.viewer(s), pg = s.pages.byId[pid];
    this.updBlock(bid, function (x) {
      x.text = String(x.text || '').replace(/@([^\s@]{0,30})$/, '@' + it.label + ' ');
      x.mentions = (x.mentions || []).filter(function (m) { return !(m.kind === it.kind && m.id === it.id); }).concat([{ kind: it.kind, id: it.id, tid: it.tid || null, label: it.label }]);
    });
    var patch = { mention: null };
    if (it.kind === 'person' && it.id !== v.id) {
      var notifs = this.st().notifs.slice();
      notifs.unshift({ id: 'nt' + Math.random().toString(36).slice(2, 10), to: it.id, text: v.name + ' te mencionó en «' + (pg ? pg.title : 'una página') + '»', when: 'Ahora', page: pid, table: null, row: null, read: false });
      patch.notifs = notifs;
    }
    this.setState(patch);
    this.focusBlock(bid, true);
  },
  mentionOpen(m) {
    if (m.kind === 'page') this.goPage(m.id);
    else if (m.kind === 'rec') this.openRec(m.tid, m.id);
    else { var c = this.cargoOf(this.st(), m.id); this.setState({ screen: 'org', orgSel: c ? c.id : null, rec: null }); }
  },
  backlinks(s, v, tid, rid) {
    var self = this, out = [];
    s.pages.order.forEach(function (id) {
      var pg = s.pages.byId[id];
      if (!self.pageVisible(s, v, pg)) return;
      var hit = pg.blocks.some(function (b) { return (b.mentions || []).some(function (m) { return m.kind === 'rec' && m.id === rid && m.tid === tid; }); });
      if (hit) out.push({ name: pg.title, icon: ICON[pg.icon] || ICON.page, color: pg.color, go: function () { self.goPage(id); } });
    });
    return out;
  },
  blockView(s, v, pg, b, ctx) {
    var self = this, bv = _blockViewBase.call(this, s, v, pg, b, ctx);
    bv.isDoc = DOC_TYPES.indexOf(b.type) >= 0;
    if (!bv.isDoc) return bv;
    bv.isHeading = false; bv.isText = false;
    bv.typeName = { text: 'Texto', heading: 'Encabezado', bullet: 'Viñeta', number: 'Lista numerada', check: 'Casilla', quote: 'Cita' }[b.type];
    bv.cls += ' blk-doc';
    bv.isBullet = b.type === 'bullet'; bv.isNumber = b.type === 'number'; bv.isCheck = b.type === 'check';
    var num = 1;
    if (bv.isNumber) { for (var i = ctx.index - 1; i >= 0 && pg.blocks[i].type === 'number'; i--) num++; }
    bv.num = num + '.';
    bv.done = !!b.done; bv.chkCls = b.done ? 'on' : '';
    bv.toggleDone = function () { self.updBlock(b.id, function (x) { x.done = !x.done; }); };
    bv.docCls = 'doc-' + (b.type === 'heading' ? 'h' + (b.lvl || 1) : b.type) + (b.done ? ' done' : '');
    bv.key = function (e) { self.docKey(pg.id, b.id, e); };
    bv.setText = function (e) { self.docChange(pg.id, b.id, e.target.value); };
    bv.docPh = b.type === 'heading' ? 'Encabezado' : DOC_LIST.indexOf(b.type) >= 0 ? 'Elemento de la lista' : b.type === 'quote' ? 'Cita' : b.w < 12 ? 'Escribe «/» para elegir qué va en esta columna' : 'Escribe; «/» para insertar bloques, «@» para mencionar, «# » título, «- » viñeta';
    var isSlash = ctx.canEditPage && /^\//.test(b.text || '');
    bv.slashOpen = isSlash; bv.slash = isSlash ? this.slashList(pg.id, b.text, { replace: b.id, keepW: true }) : []; bv.slashEmpty = isSlash && bv.slash.length === 0;
    bv.menOpen = !!(s.mention && s.mention.bid === b.id && ctx.canEditPage);
    bv.men = bv.menOpen ? this.mentionList(s, v, pg.id, b.id, s.mention.q) : [];
    bv.menEmpty = bv.menOpen && bv.men.length === 0;
    bv.mentions = (b.mentions || []).map(function (m) {
      var color = m.kind === 'person' ? ((self.memberById(s, m.id) || {}).color || '#888') : m.kind === 'page' ? ((s.pages.byId[m.id] || {}).color || '#888') : ((s.tables.byId[m.tid] || {}).color || '#888');
      return { label: m.label, color: color, kindTxt: m.kind === 'person' ? 'Persona' : m.kind === 'page' ? 'Página' : (s.tables.byId[m.tid] || {}).name || 'Registro', open: function () { self.mentionOpen(m); } };
    });
    bv.hasMentions = bv.mentions.length > 0;
    return bv;
  }
});
