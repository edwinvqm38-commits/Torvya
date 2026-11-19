"""Copia app/Trazya.dc.html a docs/index.html e index.html (título y ejecutor propios)."""
import os
B = os.path.dirname(os.path.abspath(__file__)) + '/../'
s = open(B + 'app/Trazya.dc.html', encoding='utf-8').read()
a = s.replace('<title>Trama — App</title>', '<title>Trazya</title>')
a = a.replace('<script src="./support.js"></script>', '<script src="./dc-runtime.js"></script>')
for dest in ('docs/index.html', 'index.html'):
    open(B + dest, 'w', encoding='utf-8').write(a)
print('publicado', len(a))
