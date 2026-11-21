import re, json

import os
BASE = os.path.dirname(os.path.abspath(__file__)) + '/'
OUT = os.environ.get('OUT', BASE + '../app/Trazya.dc.html')
H = 'hint-placeholder-val'

# Iconos: el trazo (grosor, color, puntas) va en CSS (.ic) para no depender de atributos SVG con guion.
def ic(expr, size=''):
    cls = 'ic' + (' ic-' + size if size else '')
    return '<svg class="%s" viewBox="0 0 24 24" aria-hidden="true"><path d="{{%s}}"></path></svg>' % (cls, expr)

CHECK = '<svg class="ic ic-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>'


def disp(x):
    return (
        '<sc-if value="{{X.kText}}" H="{{true}}"><span class="v-text {{X.cls}}">{{X.text}}</span></sc-if>'
        '<sc-if value="{{X.kPills}}" H="{{false}}"><span class="v-pills"><sc-for list="{{X.pills}}" as="pl" hint-placeholder-count="1">'
        '<span class="pill {{pl.cls}}"><sc-if value="{{pl.dot}}" H="{{false}}"><span class="sdot"></span></sc-if>{{pl.text}}</span></sc-for></span></sc-if>'
        '<sc-if value="{{X.kChips}}" H="{{false}}"><span class="chips"><sc-for list="{{X.chips}}" as="ch" hint-placeholder-count="1">'
        '<sc-if value="{{ch.locked}}" H="{{false}}"><span class="chip chip-locked">Restringido</span></sc-if>'
        '<sc-if value="{{ch.ok}}" H="{{true}}"><button type="button" class="chip lift" onClick="{{ch.open}}"><span class="chip-dot" style="background: {{ch.color}}"></span>{{ch.label}}</button></sc-if>'
        '</sc-for></span></sc-if>'
        '<sc-if value="{{X.kPeople}}" H="{{false}}"><span class="v-people"><sc-for list="{{X.people}}" as="pp" hint-placeholder-count="1">'
        '<span class="person"><span class="av sm" style="background: {{pp.color}}">{{pp.initials}}</span>{{pp.name}}</span></sc-for></span></sc-if>'
        '<sc-if value="{{X.kCheck}}" H="{{false}}">'
        '<sc-if value="{{X.canToggle}}" H="{{false}}"><button type="button" class="cbox lift {{X.checkCls}}" onClick="{{X.toggle}}" aria-pressed="{{X.checked}}" aria-label="{{X.aria}}">CHECK</button></sc-if>'
        '<sc-if value="{{X.noToggle}}" H="{{true}}"><span class="cbox {{X.checkCls}}">CHECK<span class="sr-only">{{X.srText}}</span></span></sc-if>'
        '</sc-if>'
        '<sc-if value="{{X.kBar}}" H="{{false}}"><span class="v-bar"><span class="vb-track"><span class="vb-fill" style="width: {{X.pct}}%"></span></span><span class="vb-txt">{{X.text}}</span></span></sc-if>'
        '<sc-if value="{{X.kRing}}" H="{{false}}"><span class="v-bar"><svg class="ring" viewBox="0 0 18 18" aria-hidden="true"><circle class="ring-bg" cx="9" cy="9" r="7"></circle><circle class="ring-fg" cx="9" cy="9" r="7" style="stroke-dasharray: {{X.dash}}"></circle></svg><span class="vb-txt">{{X.text}}</span></span></sc-if>'
        '<sc-if value="{{X.kLink}}" H="{{false}}"><a class="v-link lift" href="{{X.href}}" target="_blank" rel="noopener noreferrer">{{X.linkText}}</a></sc-if>'
        '<sc-if value="{{X.kFiles}}" H="{{false}}"><span class="v-files"><sc-for list="{{X.files}}" as="fl" hint-placeholder-count="1"><span class="file-chip">FILEIC{{fl.name}}</span></sc-for></span></sc-if>'
        '<sc-if value="{{X.kButton}}" H="{{false}}"><button type="button" class="btn btn-xs lift" onClick="{{X.run}}" disabled="{{X.btnDis}}">BOLTIC{{X.btnLabel}}</button></sc-if>'
    ).replace(' H="', ' ' + H + '="').replace('X.', x + '.').replace('CHECK', CHECK).replace('FILEIC', ic('ICON.files', 'xs')).replace('BOLTIC', ic('ICON.bolt', 'xs'))


def radio(x):
    return ('<div class="radio-list"><sc-for list="{{%s}}" as="rd" hint-placeholder-count="3">'
            '<button type="button" class="radio {{rd.cls}}" onClick="{{rd.pick}}" aria-pressed="{{rd.on}}"><span class="rdot"></span>'
            '<sc-if value="{{rd.hasIcon}}" %s="{{false}}">%s</sc-if><span>{{rd.label}}</span></button>'
            '</sc-for></div>') % (x, H, ic('rd.icon'))


def seg(x):
    return ('<div class="seg"><sc-for list="{{%s}}" as="o" hint-placeholder-count="3">'
            '<button type="button" class="seg-btn {{o.cls}}" onClick="{{o.pick}}"><sc-if value="{{o.hasIcon}}" %s="{{false}}">%s</sc-if><span>{{o.label}}</span></button>'
            '</sc-for></div>') % (x, H, ic('o.icon', 'sm'))


def fields(lst):
    return ('''<sc-for list="{{%(L)s}}" as="f" hint-placeholder-count="6">
<div class="frow {{f.rowCls}}" data-fkey="{{f.fkey}}">
<div class="flabel" title="{{f.desc}}">%(ICON)s<span>{{f.label}}</span></div>
<div class="fval">
<sc-if value="{{f.eInput}}" H="{{true}}"><div class="fin-row"><input class="finput" type="{{f.itype}}" value="{{f.value}}" onChange="{{f.onChange}}" placeholder="{{f.placeholder}}" aria-label="{{f.label}}"><sc-if value="{{f.hasLink}}" H="{{false}}"><a class="icon-btn sm" href="{{f.linkHref}}" target="_blank" rel="noopener noreferrer" aria-label="{{f.linkAria}}" title="{{f.linkAria}}">%(EXT)s</a></sc-if></div></sc-if>
<sc-if value="{{f.eNum}}" H="{{false}}"><div class="fin-row fnum {{f.numCls}}"><input class="finput" type="text" inputmode="decimal" value="{{f.value}}" onChange="{{f.onChange}}" placeholder="{{f.placeholder}}" aria-label="{{f.label}}"><span class="fnum-disp" aria-hidden="true">{{f.fmtText}}</span><sc-if value="{{f.hasMeter}}" H="{{false}}"><span class="fnum-meter" aria-hidden="true"><span style="width: {{f.meterPct}}%%"></span></span></sc-if></div></sc-if>
<sc-if value="{{f.eDrop}}" H="{{false}}"><div class="fdrop" data-opa="{{f.opa}}"><button type="button" class="fdrop-btn" onClick="{{f.openDrop}}" aria-haspopup="listbox" aria-label="{{f.dropAria}}"><sc-for list="{{f.dropPills}}" as="dq" hint-placeholder-count="2"><sc-if value="{{dq.isPerson}}" H="{{false}}"><span class="person"><span class="av xs" style="background: {{dq.color}}">{{dq.initials}}</span>{{dq.text}}</span></sc-if><sc-if value="{{dq.isPill}}" H="{{true}}"><span class="pill {{dq.cls}}"><sc-if value="{{dq.dot}}" H="{{false}}"><span class="sdot"></span></sc-if>{{dq.text}}</span></sc-if></sc-for><sc-if value="{{f.dropEmpty}}" H="{{false}}"><span class="fdrop-ph">Vacío</span></sc-if><span class="fdrop-chev">%(CHEV)s</span></button></div></sc-if>
<sc-if value="{{f.eSelect}}" H="{{false}}"><div class="opts"><sc-for list="{{f.options}}" as="o" hint-placeholder-count="3"><button type="button" class="pill pill-btn {{o.cls}}" onClick="{{o.pick}}" aria-pressed="{{o.on}}"><sc-if value="{{o.dot}}" H="{{false}}"><span class="sdot"></span></sc-if>{{o.v}}</button></sc-for></div></sc-if>
<sc-if value="{{f.ePeople}}" H="{{false}}"><div class="opts"><sc-for list="{{f.people}}" as="p" hint-placeholder-count="4"><button type="button" class="person-opt {{p.cls}}" onClick="{{p.pick}}" aria-pressed="{{p.on}}"><span class="av sm" style="background: {{p.color}}">{{p.initials}}</span>{{p.first}}</button></sc-for></div></sc-if>
<sc-if value="{{f.eCheck}}" H="{{false}}"><div><button type="button" class="cbox lg {{f.checkCls}}" onClick="{{f.toggle}}" aria-pressed="{{f.checked}}" aria-label="{{f.label}}">%(CHECK)s</button></div></sc-if>
<sc-if value="{{f.eFiles}}" H="{{false}}"><div class="chips wrap"><sc-for list="{{f.files}}" as="fl" hint-placeholder-count="1"><span class="relchip"><span class="chip joined">%(FILE)s{{fl.name}}</span><button type="button" class="unlink" onClick="{{fl.remove}}" aria-label="{{fl.aria}}">%(X12)s</button></span></sc-for><label class="link-btn">%(FILE)sAdjuntar<input type="file" class="sr-only" onChange="{{f.addFile}}" multiple="{{true}}"></label></div></sc-if>
<sc-if value="{{f.eRel}}" H="{{false}}">
<div class="chips wrap">
<sc-for list="{{f.chips}}" as="ch" hint-placeholder-count="2"><span class="relchip">
<sc-if value="{{ch.locked}}" H="{{false}}"><span class="chip chip-locked">Restringido</span></sc-if>
<sc-if value="{{ch.ok}}" H="{{true}}"><button type="button" class="chip {{ch.joinCls}}" onClick="{{ch.open}}"><span class="chip-dot" style="background: {{ch.color}}"></span>{{ch.label}}</button></sc-if>
<sc-if value="{{ch.canUnlink}}" H="{{false}}"><button type="button" class="unlink" onClick="{{ch.unlink}}" aria-label="{{ch.unlinkAria}}" title="{{ch.unlinkAria}}">%(X12)s</button></sc-if>
</span></sc-for>
<sc-if value="{{f.canLink}}" H="{{false}}"><button type="button" class="link-btn" onClick="{{f.togglePicker}}" aria-expanded="{{f.pickerOpen}}">%(LINK)sVincular</button></sc-if>
</div>
<sc-if value="{{f.pickerOpen}}" H="{{false}}"><div class="picker"><div class="picker-head">{{f.pickerTitle}}</div><sc-for list="{{f.pick}}" as="pk" hint-placeholder-count="4"><button type="button" class="pk-item {{pk.cls}}" onClick="{{pk.toggle}}" aria-pressed="{{pk.on}}"><span class="pk-check"><sc-if value="{{pk.on}}" H="{{false}}">%(CHECK)s</sc-if></span><span>{{pk.label}}</span></button></sc-for></div></sc-if>
</sc-if>
<sc-if value="{{f.eButton}}" H="{{false}}"><div><button type="button" class="btn btn-sm" onClick="{{f.run}}">%(BOLT)s{{f.btnLabel}}</button></div></sc-if>
<sc-if value="{{f.eAi}}" H="{{false}}"><div class="ai-val"><span class="v-ai">{{f.aiText}}</span><button type="button" class="link-btn" onClick="{{f.aiGen}}">%(AI)s{{f.aiBtn}}</button></div></sc-if>
<sc-if value="{{f.eRead}}" H="{{false}}"><div class="fro">%(DISP)s<sc-if value="{{f.hasFx}}" H="{{false}}"><button type="button" class="fx-tog {{f.fxCls}}" onClick="{{f.fxToggle}}" aria-expanded="{{f.fxOpen}}" aria-label="Ver cómo se calcula" title="Ver cómo se calcula">ƒx</button></sc-if></div><sc-if value="{{f.fxOpen}}" H="{{false}}"><div class="fx-detail">{{f.fxText}}</div></sc-if></sc-if>
<sc-if value="{{f.hasNote}}" H="{{false}}"><span class="fnote">{{f.note}}</span></sc-if><sc-if value="{{f.hasRefs}}" H="{{false}}"><span class="frefs" title="{{f.refsTip}}"><span class="frefs-t">Se calcula con</span><sc-for list="{{f.refs}}" as="rf" hint-placeholder-count="2"><button type="button" class="fref {{rf.cls}}" onClick="{{rf.go}}" title="{{rf.tip}}">{{rf.label}}</button></sc-for></span></sc-if>
</div>
</div>
</sc-for>''' % dict(L=lst, ICON=ic('f.icon', 'sm'), EXT=ic('ICON.ext', 'sm'), CHECK=CHECK, FILE=ic('ICON.files', 'xs'), X12=ic('ICON.x', 'xs'),
                    LINK=ic('ICON.link', 'xs'), BOLT=ic('ICON.bolt', 'sm'), AI=ic('ICON.ai', 'xs'), CHEV=ic('ICON.chevdown', 'xs'), DISP=disp('f.d'))).replace(' H="', ' ' + H + '="')


def tpl(name):
    return open(BASE + 'tpl_' + name + '.html', encoding='utf-8').read()


markup = open(BASE + 'markup.html', encoding='utf-8').read()
# plantillas reutilizables (el prefijo $ se cambia por la ruta real)
for _ in range(3):
    for name in ('dbview', 'chart', 'rules', 'slash', 'fill', 'rt'):
        body = tpl(name)
        markup = re.sub(r'\[\[' + name + r':([\w.]+)\]\]', lambda m: body.replace('$.', m.group(1) + '.'), markup)
markup = re.sub(r'\[\[disp:([\w.]+)\]\]', lambda m: disp(m.group(1)), markup)
markup = re.sub(r'\[\[radio:([\w.]+)\]\]', lambda m: radio(m.group(1)), markup)
markup = re.sub(r'\[\[seg:([\w.]+)\]\]', lambda m: seg(m.group(1)), markup)
markup = re.sub(r'\[\[fields:([\w.]+)\]\]', lambda m: fields(m.group(1)), markup)
markup = re.sub(r'\[\[ic:([\w.]+)\]\]', lambda m: ic(m.group(1)), markup)
markup = re.sub(r'\[\[ics:([\w.]+)\]\]', lambda m: ic(m.group(1), 'sm'), markup)
markup = re.sub(r'\[\[icx:([\w.]+)\]\]', lambda m: ic(m.group(1), 'xs'), markup)
markup = re.sub(r'\[\[icl:([\w.]+)\]\]', lambda m: ic(m.group(1), 'lg'), markup)
markup = markup.replace('[[CHECK]]', CHECK)
assert '[[' not in markup, markup[markup.index('[['):markup.index('[[') + 60]
assert '$.' not in markup

css = open(BASE + 'style.css', encoding='utf-8').read()
js = '\n'.join(open(BASE + f, encoding='utf-8').read() for f in ['icons.js', 'lib.js', 'core.js', 'actions.js', 'views.js', 'drawer.js', 'render.js', 'pm.js', 'org2.js', 'doc.js', 'forms.js', 'costos.js', 'tecsur_data.js', 'tecsur.js', 'portafolio.js', 'touchdrag.js', 'officegen.js', 'report.js', 'negocio.js', 'v6.js', 'uso.js'])
assert '</' not in js

props = {
    "accent": {"editor": "enum", "options": ["tecsur", "indigo", "azul", "esmeralda", "ambar", "rosa", "grafito"], "default": "tecsur", "section": "Tema"},
    "dark": {"editor": "boolean", "default": False, "section": "Tema"},
    "$preview": {"width": 1440, "height": 960}
}
dp = json.dumps(props, ensure_ascii=False, separators=(',', ':'))
assert "'" not in dp and '&' not in dp

html = ('<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="theme-color" content="#00468C">\n<title>Trama — App</title>\n'
        '<script src="./support.js"></script>\n</head>\n<body>\n<x-dc>\n<helmet>\n'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Carlito:wght@400;700&amp;family=Inter:wght@400;500;600;700&amp;family=Space+Grotesk:wght@500;600;700&amp;family=IBM+Plex+Sans:wght@400;500;600&amp;family=IBM+Plex+Mono:wght@500;600&amp;display=swap">\n'
        '<style>\n' + css + '</style>\n</helmet>\n' + markup + '\n</x-dc>\n'
        "<script type=\"text/x-dc\" data-dc-script data-props='" + dp + "'>\n" + js + '\n</script>\n</body>\n</html>\n')
open(OUT, 'w', encoding='utf-8').write(html)
print('written', len(html), 'bytes; markup', len(markup), '; js', len(js))
