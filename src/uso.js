/* Modo uso: vista limpia, sin botones de configuración, arrastre ni anchos. Registrar y actuar sigue igual. */
(function () {
  var baseRv = Component.prototype.renderVals;
  Component.prototype.renderVals = function () {
    var self = this, out = baseRv.call(this), s = this.st(), on = !!s.useMode;
    out.useCls = on ? 'usemode' : '';
    out.useOn = on; out.useOnCls = on ? 'on' : '';
    out.useLabel = on ? 'Modo uso' : 'Modo edición';
    out.useHint = on ? 'Vista limpia para trabajar. Toca para volver a editar la estructura.' : 'Activa el modo uso para ocultar la configuración.';
    out.toggleUse = function () { self.setState({ useMode: !s.useMode, viewMenu: false, headMenu: null, drawer: null, bkPal: null }); };
    return out;
  };
})();
