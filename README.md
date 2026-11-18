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
- **En línea (GitHub Pages):** https://edwinvqm38-commits.github.io/Torvya/ (se publica desde la carpeta `docs/` de la rama `main`).
- **En tu PC:** descarga el repositorio y desde la carpeta `docs/` ejecuta `python3 -m http.server 8080`; abre http://localhost:8080
- `docs/index.html` es la app y `docs/dc-runtime.js` es el ejecutor propio que reemplaza a Claude Design. `app/Trazya.dc.html` es el mismo archivo en formato Claude Design.
- Los datos son de ejemplo y viven en la memoria del navegador: al recargar la página se reinician.

## Estado
- Persistencia: la app todavía no se conecta a Supabase (sin inicio de sesión ni guardado). La base ya está creada y cargada con datos de ejemplo.
- No incluye claves. La clave pública de Supabase se agregará al conectar la app.
