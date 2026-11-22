"""Copia app/Trazya.dc.html a docs/index.html e index.html (título y ejecutor propios)."""
import os
B = os.path.dirname(os.path.abspath(__file__)) + '/../'
s = open(B + 'app/Trazya.dc.html', encoding='utf-8').read()
a = s.replace('<title>Trama — App</title>', '<title>Trazya</title>')
a = a.replace('<script src="./support.js"></script>', '<script src="./dc-runtime.js"></script>')
for dest in ('docs/index.html', 'index.html'):
    open(B + dest, 'w', encoding='utf-8').write(a)
import shutil
shutil.copy(B + 'dc-runtime.js', B + 'docs/dc-runtime.js')
shutil.rmtree(B + 'docs/vendor', ignore_errors=True)
shutil.copytree(B + 'vendor', B + 'docs/vendor')
print('publicado', len(a))
