# Trazya

ERP inteligente configurable por tipo de negocio (estilo Notion + Excel + Power BI), con recomendaciones basadas en PMBOK 6/7/8.
Ejemplo de propuesta: TECSUR (servicios eléctricos: ingeniería de costos, ACU, contratos, OT/SST).

> Nombre de trabajo anterior del prototipo: **Trama**. En el código y en la base de datos aún aparece como `Trama` / `trama_*`; el cambio a Trazya está pendiente.

## Contenido
- `app/Trazya.dc.html`: la app completa (prototipo de Claude Design, datos de ejemplo inventados, en memoria).
- `src/`: fuentes separados. `assemble.py` los concatena en el archivo de `app/`.
- `db/trama_schema_prefijo.sql` y `db/trama_rls_extra.sql`: esquema de Supabase (22 tablas `trama_*`, seguridad por filas, auditoría, bloqueo de ACU aprobados).
- `db/Corte_semana48_2026-11-27.xlsx`: archivo de ejemplo para probar la importación de cortes de precios.

## Cómo probarla
- **En línea (GitHub Pages):** https://edwinvqm38-commits.github.io/Torvya/ (se publica desde la rama `main`; `index.html` y `dc-runtime.js` están en la raíz y también copiados en `docs/`).
- **En tu PC:** descarga el repositorio y desde la carpeta `docs/` ejecuta `python3 -m http.server 8080`; abre http://localhost:8080
- `docs/index.html` es la app y `docs/dc-runtime.js` es el ejecutor propio que reemplaza a Claude Design. `app/Trazya.dc.html` es el mismo archivo en formato Claude Design.
- Los datos son de ejemplo y viven en la memoria del navegador: al recargar la página se reinician.

## Estado
- Persistencia: la app todavía no se conecta a Supabase (sin inicio de sesión ni guardado). La base ya está creada y cargada con datos de ejemplo.
- No incluye claves. La clave pública de Supabase se agregará al conectar la app.

## Módulo TECSUR · Objetivos y procedimientos 2026 (rama `tecsur-objetivos`)
- Módulo M09 en «Tu negocio y módulos»; se instala con la propuesta «Servicios eléctricos y mantenimiento de redes».
- Seis tablas: objetivos, procedimientos de costos (índice maestro), procedimientos operativos, líneas de anexo técnico (153, sin precios), brechas (45) y decisiones (20), más dos páginas: «Vista de Gerencia» y «Procedimientos y anexos técnicos».
- Datos: `db/tecsur_fase1.json` (Fase 1: ninguna línea validada ni con matrícula ACU). `python3 tools/gen_tecsur_data.py` regenera `src/tecsur_data.js`; `python3 src/assemble.py` arma `app/Trazya.dc.html`.
- Pruebas: `APP=app/Trazya.dc.html node src/test_tecsur.js`.
