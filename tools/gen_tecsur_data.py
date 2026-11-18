"""Genera src/tecsur_data.js a partir de db/tecsur_fase1.json (extraído del libro de Excel de la Fase 1; sin precios)."""
import json, os
B = os.path.dirname(os.path.abspath(__file__)) + '/../'
D = json.load(open(B + 'db/tecsur_fase1.json', encoding='utf-8'))
open(B + 'src/tecsur_data.js', 'w', encoding='utf-8').write('/* Datos de la Fase 1 (sin precios). Generado por tools/gen_tecsur_data.py */\nvar TECSUR_DATA = ' + json.dumps(D, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('ok', {k: len(v) for k, v in D.items()})
