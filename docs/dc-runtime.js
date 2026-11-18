/* Ejecutor independiente para las plantillas .dc.html de Trazya.
   Lee <x-dc> (plantilla con {{huecos}}, <sc-for>, <sc-if>) y el script text/x-dc
   (clase Component extends DCLogic) y pinta la app en el navegador sin Claude Design. */
(function () {
  'use strict';

  var HOLE = /\{\{\s*([^{}]+?)\s*\}\}/g;
  var ONE = /^\s*\{\{\s*([^{}]+?)\s*\}\}\s*$/;
  var BOOLATTR = { disabled: 1, multiple: 1, hidden: 1, readonly: 1, checked: 1, selected: 1, required: 1, open: 1, autofocus: 1 };
  var TEXTLIKE = { '': 1, text: 1, search: 1, email: 1, url: 1, tel: 1, number: 1, password: 1 };

  /* ---------- base de la lógica ---------- */
  function DCLogic(props) { this.props = props || {}; this.state = {}; this._rt = null; }
  DCLogic.prototype.setState = function (patch) {
    var cur = this.state || {}, next = {}, k;
    if (typeof patch === 'function') patch = patch(cur, this.props);
    for (k in cur) next[k] = cur[k];
    for (k in (patch || {})) next[k] = patch[k];
    this.state = next;
    if (this._rt) this._rt.schedule();
  };
  window.DCLogic = DCLogic;

  /* ---------- evaluación de huecos ---------- */
  function lookup(path, scope) {
    var parts = path.split('.'), name = parts[0], v;
    if (name in scope) v = scope[name];
    else v = window[name];
    for (var i = 1; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    return v;
  }
  function str(v) { return v == null || v === false ? '' : String(v); }
  function interp(s, scope) { return s.replace(HOLE, function (m, p) { return str(lookup(p, scope)); }); }

  /* ---------- plantilla → nodos virtuales ---------- */
  function build(node, scope, out) {
    if (node.nodeType === 3) { out.push({ t: '#text', v: interp(node.nodeValue, scope) }); return; }
    if (node.nodeType !== 1) return;
    var tag = node.localName, i, kids = node.childNodes;
    if (tag === 'sc-for') {
      var lm = ONE.exec(node.getAttribute('list') || ''), list = lm ? lookup(lm[1], scope) : null, as = node.getAttribute('as') || 'item';
      if (!list || !list.length) return;
      for (var n = 0; n < list.length; n++) {
        var sc = Object.create(scope); sc[as] = list[n];
        for (i = 0; i < kids.length; i++) build(kids[i], sc, out);
      }
      return;
    }
    if (tag === 'sc-if') {
      var vm = ONE.exec(node.getAttribute('value') || '');
      if (vm && lookup(vm[1], scope)) for (i = 0; i < kids.length; i++) build(kids[i], scope, out);
      return;
    }
    var a = {}, h = {}, attrs = node.attributes;
    for (i = 0; i < attrs.length; i++) {
      var name = attrs[i].name, val = attrs[i].value, one = ONE.exec(val);
      if (name.length > 2 && name.charAt(0) === 'o' && name.charAt(1) === 'n' && one) {
        var fn = lookup(one[1], scope);
        if (typeof fn === 'function') h[name.slice(2)] = fn;
        continue;
      }
      if (val.indexOf('{{') < 0) { a[name] = val; continue; }
      if (one) {
        var raw = lookup(one[1], scope);
        if (BOOLATTR[name]) { if (raw) a[name] = ''; }
        else if (raw === true || raw === false) a[name] = String(raw);
        else a[name] = str(raw);
      } else a[name] = interp(val, scope);
    }
    var c = [];
    for (i = 0; i < kids.length; i++) build(kids[i], scope, c);
    out.push({ t: tag, ns: node.namespaceURI, a: a, h: h, c: c });
  }

  /* ---------- nodos virtuales → DOM real ---------- */
  function evName(vn, ev) {
    if (ev === 'change' && (vn.t === 'textarea' || (vn.t === 'input' && TEXTLIKE[(vn.a.type || '').toLowerCase()]))) return 'input';
    return ev;
  }
  function setAttrs(el, vn) {
    var prev = el._a || {}, a = vn.a, k;
    for (k in prev) if (!(k in a)) { el.removeAttribute(k); }
    for (k in a) {
      if (k === 'value' && (vn.t === 'input' || vn.t === 'textarea' || vn.t === 'select')) continue;
      if (el.getAttribute(k) !== a[k]) el.setAttribute(k, a[k]);
    }
    el._a = a;
    var ph = el._h || {}, hh = {}, ev;
    for (ev in vn.h) hh[evName(vn, ev)] = vn.h[ev];
    for (ev in ph) if (!(ev in hh)) el['on' + ev] = null;
    for (ev in hh) el['on' + ev] = hh[ev];
    el._h = hh;
  }
  function setValue(el, vn) {
    if (!('value' in vn.a)) return;
    var v = vn.a.value;
    if (vn.t === 'input' && (vn.a.type === 'checkbox' || vn.a.type === 'radio' || vn.a.type === 'file')) { el.setAttribute('value', v); return; }
    if (el.value !== v && !(document.activeElement === el && el.value === v)) el.value = v;
  }
  function create(vn) {
    if (vn.t === '#text') return document.createTextNode(vn.v);
    var el = vn.ns && vn.ns !== 'http://www.w3.org/1999/xhtml' ? document.createElementNS(vn.ns, vn.t) : document.createElement(vn.t);
    setAttrs(el, vn);
    for (var i = 0; i < vn.c.length; i++) el.appendChild(create(vn.c[i]));
    setValue(el, vn);
    return el;
  }
  function patch(parent, vnodes) {
    var kids = parent.childNodes, i;
    for (i = 0; i < vnodes.length; i++) {
      var vn = vnodes[i], el = kids[i];
      if (!el) { parent.appendChild(create(vn)); continue; }
      if (vn.t === '#text') {
        if (el.nodeType === 3) { if (el.nodeValue !== vn.v) el.nodeValue = vn.v; }
        else parent.replaceChild(create(vn), el);
        continue;
      }
      if (el.nodeType !== 1 || el.localName !== vn.t || (el.namespaceURI || '') !== (vn.ns || '')) { parent.replaceChild(create(vn), el); continue; }
      setAttrs(el, vn);
      patch(el, vn.c);
      setValue(el, vn);
    }
    while (parent.childNodes.length > vnodes.length) parent.removeChild(parent.lastChild);
  }

  /* ---------- arranque ---------- */
  function start() {
    var host = document.querySelector('x-dc'), scriptEl = document.querySelector('script[data-dc-script]');
    if (!host || !scriptEl) { console.error('Trazya: falta <x-dc> o el script de la app'); return; }
    var props = {};
    try {
      var meta = JSON.parse(scriptEl.getAttribute('data-props') || '{}');
      Object.keys(meta).forEach(function (k) { if (k.charAt(0) !== '$' && meta[k] && 'default' in meta[k]) props[k] = meta[k].default; });
    } catch (e) { }
    var helmet = host.querySelector('helmet');
    if (helmet) { while (helmet.firstChild) document.head.appendChild(helmet.firstChild); helmet.remove(); }
    var tpl = document.createElement('div');
    while (host.firstChild) tpl.appendChild(host.firstChild);
    var root = document.createElement('div');
    root.id = 'dc-root'; root.style.display = 'contents';
    host.parentNode.replaceChild(root, host);

    var Component = new Function('DCLogic', scriptEl.textContent + '\n;return Component;')(DCLogic);
    var comp = new Component(props);
    var rt = {
      pending: false,
      schedule: function () {
        if (rt.pending) return;
        rt.pending = true;
        Promise.resolve().then(function () { rt.pending = false; rt.render(); });
      },
      render: function () {
        try {
          var vals = comp.renderVals(), out = [];
          var scope = Object.create(vals || {});
          for (var i = 0; i < tpl.childNodes.length; i++) build(tpl.childNodes[i], scope, out);
          patch(root, out);
        } catch (e) { console.error('Trazya: error al pintar', e); throw e; }
      }
    };
    comp._rt = rt;
    window.__trazya = comp;
    rt.render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
