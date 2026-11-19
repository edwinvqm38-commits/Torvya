import json, re
n = json.load(open('/home/claude/vendor/node_modules/lucide-static/icon-nodes.json'))

def f(x):
    x = float(x); s = ('%.3f' % x).rstrip('0').rstrip('.')
    return s if s not in ('-0', '') else '0'

def to_d(nodes):
    out = []
    for tag, a in nodes:
        if tag == 'path':
            dd = a['d'].strip()
            out.append(('M0 0' + dd) if dd[:1] == 'm' else dd)
        elif tag == 'circle':
            cx, cy, r = float(a['cx']), float(a['cy']), float(a['r'])
            out.append('M%s %sa%s %s 0 1 0 %s 0a%s %s 0 1 0 %s 0' % (f(cx - r), f(cy), f(r), f(r), f(2 * r), f(r), f(r), f(-2 * r)))
        elif tag == 'ellipse':
            cx, cy, rx, ry = float(a['cx']), float(a['cy']), float(a['rx']), float(a['ry'])
            out.append('M%s %sa%s %s 0 1 0 %s 0a%s %s 0 1 0 %s 0' % (f(cx - rx), f(cy), f(rx), f(ry), f(2 * rx), f(rx), f(ry), f(-2 * rx)))
        elif tag == 'rect':
            x, y, w, h = float(a.get('x', 0)), float(a.get('y', 0)), float(a['width']), float(a['height'])
            rx = float(a.get('rx', a.get('ry', 0))); ry = float(a.get('ry', rx))
            if rx:
                out.append('M%s %sh%sa%s %s 0 0 1 %s %sv%sa%s %s 0 0 1 %s %sh%sa%s %s 0 0 1 %s %sv%sa%s %s 0 0 1 %s %sz' % (
                    f(x + rx), f(y), f(w - 2 * rx), f(rx), f(ry), f(rx), f(ry), f(h - 2 * ry), f(rx), f(ry), f(-rx), f(ry),
                    f(-(w - 2 * rx)), f(rx), f(ry), f(-rx), f(-ry), f(-(h - 2 * ry)), f(rx), f(ry), f(rx), f(-ry)))
            else:
                out.append('M%s %sh%sv%sh%sz' % (f(x), f(y), f(w), f(h), f(-w)))
        elif tag == 'line':
            out.append('M%s %sL%s %s' % (f(a['x1']), f(a['y1']), f(a['x2']), f(a['y2'])))
        elif tag in ('polyline', 'polygon'):
            pts = re.findall(r'-?[\d.]+', a['points'])
            pairs = [(pts[i], pts[i + 1]) for i in range(0, len(pts), 2)]
            out.append('M' + 'L'.join('%s %s' % (f(p[0]), f(p[1])) for p in pairs) + ('z' if tag == 'polygon' else ''))
        else:
            raise Exception('tag ' + tag)
    return ''.join(out)

WANT = {
 # tipos de propiedad
 'title': ['type'], 'text': ['text-align-start', 'text'], 'number': ['hash'], 'select': ['circle-chevron-down'], 'multi_select': ['list'],
 'status': ['loader'], 'date': ['calendar'], 'person': ['users'], 'files': ['paperclip'], 'checkbox': ['square-check'],
 'url': ['link'], 'email': ['at-sign'], 'phone': ['phone'], 'formula': ['sigma'], 'relation': ['arrow-up-right'], 'rollup': ['search'],
 'created_time': ['clock'], 'created_by': ['circle-user'], 'last_edited_time': ['clock-arrow-up', 'clock-fading', 'clock'], 'last_edited_by': ['user-round-pen', 'user-pen'],
 'button': ['mouse-pointer-click'], 'place': ['map-pin'], 'id': ['fingerprint-pattern', 'fingerprint', 'barcode'], 'ai': ['sparkles'], 'translate': ['languages'],
 # vistas y bloques
 'table': ['table-2', 'table'], 'board': ['kanban'], 'list': ['layout-list'], 'gallery': ['layout-grid'], 'calendar': ['calendar-days'],
 'chart': ['chart-column'], 'form': ['clipboard-list'], 'barh': ['chart-bar'], 'line': ['chart-line'], 'pie': ['chart-pie'], 'kpi': ['gauge'],
 'sheet': ['sheet'], 'map': ['network'], 'heading': ['heading-1'], 'para': ['pilcrow'], 'divider': ['minus'], 'slicer': ['funnel'],
 'page': ['file-text'], 'dashboard': ['layout-dashboard'], 'combo': ['chart-no-axes-combined'],
 # interfaz
 'eye': ['eye'], 'eyeoff': ['eye-off'], 'filter': ['list-filter'], 'filterx': ['funnel-x'], 'sort': ['arrow-up-down'], 'group': ['group'], 'paint': ['paint-roller'],
 'link': ['link'], 'origin': ['workflow'], 'props': ['list'], 'bolt': ['zap'], 'more': ['ellipsis'], 'expand': ['maximize-2'], 'db': ['database'],
 'lock': ['lock'], 'plus': ['plus'], 'trash': ['trash-2', 'trash'], 'copy': ['copy'], 'up': ['arrow-up'], 'down': ['arrow-down'], 'left': ['chevron-left'],
 'right': ['chevron-right'], 'chevdown': ['chevron-down'], 'x': ['x'], 'check': ['check'], 'bell': ['bell'], 'sliders': ['sliders-horizontal'],
 'menu': ['menu'], 'search': ['search'], 'org': ['list-tree'], 'slides': ['presentation'], 'download': ['download'], 'image': ['image'], 'imageup': ['image-up'], 'book': ['book-open'], 'checks': ['list-checks'], 'star': ['star'], 'users': ['users'], 'grid': ['layout-grid'], 'ext': ['external-link'], 'settings': ['settings-2'], 'grip': ['grip-vertical'], 'trace': ['git-fork'], 'half': ['columns-2'],
 'full': ['rectangle-horizontal'], 'edit': ['square-pen'], 'calc': ['calculator'], 'fx': ['square-function'], 'home': ['house'], 'palette': ['palette'],
 'user': ['user'], 'shield': ['shield-check'], 'info': ['info'], 'wrap': ['text-wrap'], 'width': ['move-horizontal'], 'required': ['asterisk'],
 'az': ['arrow-down-a-z'], 'unlink': ['unlink'], 'layers': ['layers'], 'arrowr': ['arrow-right'], 'toggle': ['toggle-right'], 'ring': ['circle-gauge'], 'dot': ['circle-dot'],
 # iconos para bases de datos y páginas
 'i-cart': ['shopping-cart'], 'i-package': ['package'], 'i-users': ['users'], 'i-building': ['building-2', 'building'], 'i-truck': ['truck'], 'i-warehouse': ['warehouse'],
 'i-wallet': ['wallet'], 'i-receipt': ['receipt'], 'i-file': ['file-text'], 'i-clipboard': ['clipboard-list'], 'i-briefcase': ['briefcase'], 'i-factory': ['factory'],
 'i-hardhat': ['hard-hat'], 'i-wrench': ['wrench'], 'i-hammer': ['hammer'], 'i-store': ['store'], 'i-tag': ['tag'], 'i-boxes': ['boxes'], 'i-banknote': ['banknote'],
 'i-card': ['credit-card'], 'i-landmark': ['landmark'], 'i-handshake': ['handshake'], 'i-phone': ['phone'], 'i-mail': ['mail'], 'i-pin': ['map-pin'], 'i-globe': ['globe'],
 'i-clock': ['clock'], 'i-target': ['target'], 'i-flag': ['flag'], 'i-star': ['star'], 'i-heart': ['heart'], 'i-rocket': ['rocket'], 'i-bulb': ['lightbulb'],
 'i-book': ['book-open'], 'i-grad': ['graduation-cap'], 'i-steth': ['stethoscope'], 'i-leaf': ['leaf'], 'i-zap': ['zap'], 'i-shield': ['shield'], 'i-folder': ['folder'],
 'i-db': ['database'], 'i-checks': ['list-checks'], 'i-contact': ['contact'], 'i-scale': ['scale'], 'i-trend': ['trending-up'], 'i-piggy': ['piggy-bank'],
 'i-calc': ['calculator'], 'i-dash': ['layout-dashboard'], 'i-calendar': ['calendar'], 'i-chart': ['chart-column'], 'i-pie': ['chart-pie'], 'i-layers': ['layers'], 'i-map': ['map'],
 'mobile': ['smartphone'], 'camera': ['camera'], 'pin': ['map-pin'], 'wifioff': ['wifi-off'], 'wifi': ['wifi'], 'sync': ['refresh-cw'], 'send': ['send'],
 'template': ['layout-template'], 'formb': ['clipboard-pen-line', 'clipboard-pen', 'file-pen-line'], 'cond': ['split'], 'section': ['heading-2', 'type'], 'inbox': ['inbox'],
 'i-clipcheck': ['clipboard-check'], 'chevup': ['chevron-up'],
 'sidebar': ['panel-right', 'panel-left'], 'italic': ['italic'], 'underline': ['underline'], 'strike': ['strikethrough'], 'code': ['code'], 'quote': ['quote', 'text-quote'], 'tgl': ['list-collapse', 'chevrons-down-up', 'chevron-right'], 'hilite': ['highlighter'], 'tcolor': ['baseline', 'type'], 'h2': ['heading-2'], 'h3': ['heading-3'], 'bullets': ['list'], 'numbers': ['list-ordered'], 'todo2': ['square-check'], 'eraser': ['eraser', 'remove-formatting']
}
out = {}; miss = []
for k, cands in WANT.items():
    for c in cands:
        if c in n: out[k] = to_d(n[c]); break
    else: miss.append(k)
print('missing:', miss)
js = '/* Iconos: Lucide (https://lucide.dev), licencia ISC. */\nvar ICON = ' + json.dumps(out, ensure_ascii=False, indent=0) + ';\n'
open('/home/claude/erp/build/icons.js', 'w').write(js)
print(len(js), 'bytes,', len(out), 'iconos')
