-- =====================================================================
-- Trama · esquema con prefijo trama_ (proyecto OFICINA_IA) (PostgreSQL / Supabase)
-- Versión 0.1 · aplicada en OFICINA_IA (EKA MINING SAC) con prefijo trama_ para no chocar con tablas existentes.
--
-- Idea central: Trama es configurable por tipo de negocio. Por eso las tablas
-- que crea cada empresa (Recursos, ACU, OT, Proyectos…) no son tablas físicas
-- distintas: se guardan en un modelo genérico (tablas → columnas → filas) con
-- validación, permisos por rol, historial y auditoría. Los módulos (M01, M02…)
-- son plantillas que crean esas tablas, columnas, vistas y páginas.
--
-- Reglas de la especificación que este esquema hace cumplir:
--   RN03  versiones aprobadas inmutables (row_locks + trigger)
--   RN11  lo importado no queda validado (import_batches.status)
--   RN12  importes en numeric, nunca float
--   RN13  vigencia ≠ creación ≠ actualización ≠ aprobación (columnas separadas)
--   RN14  toda acción crítica con usuario, fecha, fuente y motivo (audit_log)
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- espacio de trabajo y personas ----------
create table trama_workspaces (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  rubro        text,                       -- general, electrico, construccion, comercio…
  settings     jsonb not null default '{}',-- tema, marca, parámetros globales
  created_at   timestamptz not null default now()
);

create table trama_roles (
  workspace_id uuid not null references trama_workspaces(id) on delete cascade,
  key          text not null,              -- admin, finanzas, operaciones…
  name         text not null,
  is_admin     boolean not null default false,
  primary key (workspace_id, key)
);

create table trama_members (
  workspace_id uuid not null references trama_workspaces(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role_key     text not null,
  display_name text not null,
  color        text,
  status       text not null default 'active' check (status in ('invited','active','disabled')),
  joined_at    timestamptz not null default now(),
  primary key (workspace_id, user_id),
  foreign key (workspace_id, role_key) references trama_roles(workspace_id, key)
);

-- ---------- organigrama ----------
create table trama_org_areas (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references trama_workspaces(id) on delete cascade,
  parent_id    uuid references trama_org_areas(id),
  name         text not null,
  color        text, icon text
);
create table trama_org_positions (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references trama_workspaces(id) on delete cascade,
  area_id      uuid not null references trama_org_areas(id),
  parent_id    uuid references trama_org_positions(id),
  name         text not null,
  user_id      uuid references auth.users(id),
  position     int not null default 0
);

-- ---------- módulos instalados ----------
create table trama_modules (
  workspace_id uuid not null references trama_workspaces(id) on delete cascade,
  key          text not null,              -- maestros, acu, ops…
  version      text not null,
  installed_at timestamptz not null default now(),
  installed_by uuid references auth.users(id),
  primary key (workspace_id, key)
);

-- ---------- tablas, columnas, filas (modelo configurable) ----------
create table trama_db_tables (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references trama_workspaces(id) on delete cascade,
  key          text not null,              -- identificador estable: rec, prc, acu…
  name         text not null,              -- nombre visible, renombrable
  description  text, icon text, color text,
  module_key   text,
  next_number  bigint not null default 1,
  created_at   timestamptz not null default now(),
  unique (workspace_id, key)
);

create table trama_db_props (
  id           uuid primary key default gen_random_uuid(),
  table_id     uuid not null references trama_db_tables(id) on delete cascade,
  key          text not null,              -- estable: las fórmulas usan este id
  name         text not null,
  type         text not null check (type in ('title','text','number','select','multi_select','status','date','person','files','checkbox','url','email','phone','place','formula','relation','rollup','created_time','created_by','last_edited_time','last_edited_by','button','id','ai')),
  config       jsonb not null default '{}',-- opciones, formato, fórmula, destino de relación, par…
  required     boolean not null default false,
  position     int not null default 0,
  unique (table_id, key)
);

create table trama_db_rows (
  id           uuid primary key default gen_random_uuid(),
  table_id     uuid not null references trama_db_tables(id) on delete cascade,
  number       bigint not null,            -- correlativo visible (PRY-12, SST-…)
  data         jsonb not null default '{}',-- valores por clave de columna; números como numeric JSON
  body         text,                       -- contenido de la fila como página
  created_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_by   uuid references auth.users(id),
  updated_at   timestamptz not null default now(),
  source       text,                       -- formulario, importación, app móvil, API
  source_ref   text,                       -- id del formulario o del lote de importación
  deleted_at   timestamptz,
  unique (table_id, number)
);
create index trama_db_rows_table on trama_db_rows(table_id) where deleted_at is null;
create index trama_db_rows_data on trama_db_rows using gin (data jsonb_path_ops);

-- relaciones normalizadas: permiten trazabilidad en ambos sentidos e integridad
create table trama_db_links (
  prop_id      uuid not null references trama_db_props(id) on delete cascade,
  from_row     uuid not null references trama_db_rows(id) on delete cascade,
  to_row       uuid not null references trama_db_rows(id) on delete cascade,
  position     int not null default 0,
  primary key (prop_id, from_row, to_row)
);
create index trama_db_links_to on trama_db_links(to_row);

-- RN03: una fila bloqueada (ACU aprobado, valorización aprobada) no se edita; se versiona
create table trama_row_locks (
  row_id       uuid primary key references trama_db_rows(id) on delete cascade,
  reason       text not null,              -- «Aprobado en contrato», «Valorización conformada»
  locked_by    uuid references auth.users(id),
  locked_at    timestamptz not null default now()
);

create table trama_db_views (
  id           uuid primary key default gen_random_uuid(),
  table_id     uuid not null references trama_db_tables(id) on delete cascade,
  name         text not null,
  layout       text not null,              -- table, board, calendar, gallery, list, chart, form
  config       jsonb not null default '{}',-- filtros, orden, grupos, columnas ocultas, colores
  locked       boolean not null default false,
  position     int not null default 0
);

create table trama_forms (
  id           uuid primary key default gen_random_uuid(),
  table_id     uuid not null references trama_db_tables(id) on delete cascade,
  name         text not null,
  config       jsonb not null,             -- secciones, preguntas, condiciones, automáticos
  published    boolean not null default false,
  updated_at   timestamptz not null default now()
);

create table trama_row_templates (
  id           uuid primary key default gen_random_uuid(),
  table_id     uuid not null references trama_db_tables(id) on delete cascade,
  name         text not null,
  vals         jsonb not null,
  created_by   uuid references auth.users(id)
);

-- ---------- importación de cortes (RN11) ----------
create table trama_import_batches (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references trama_workspaces(id) on delete cascade,
  table_id     uuid not null references trama_db_tables(id),
  file_name    text not null,
  file_sha256  text,                       -- evita importar dos veces el mismo archivo
  cut_date     date not null,              -- vigencia del corte
  rows_total   int not null default 0,
  rows_new     int not null default 0,
  rows_changed int not null default 0,
  rows_equiv   int not null default 0,
  status       text not null default 'por_validar' check (status in ('por_validar','validado','rechazado')),
  imported_by  uuid references auth.users(id),
  imported_at  timestamptz not null default now(),
  validated_by uuid references auth.users(id),
  validated_at timestamptz
);

-- ---------- páginas y bloques ----------
create table trama_pages (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references trama_workspaces(id) on delete cascade,
  area_id      uuid references trama_org_areas(id),  -- visibilidad por área
  owner_id     uuid references auth.users(id), -- páginas personales («Mi tablero»)
  title        text not null,
  icon text, color text, cover jsonb, description text,
  position     int not null default 0,
  updated_at   timestamptz not null default now()
);
create table trama_blocks (
  id           uuid primary key default gen_random_uuid(),
  page_id      uuid not null references trama_pages(id) on delete cascade,
  type         text not null,
  width        int not null default 12 check (width between 1 and 12),
  position     int not null,
  config       jsonb not null default '{}'
);

-- ---------- permisos ----------
create table trama_table_access (
  table_id     uuid not null references trama_db_tables(id) on delete cascade,
  workspace_id uuid not null,
  role_key     text not null,
  level        text not null check (level in ('none','view','comment','edit','full')),
  primary key (table_id, role_key),
  foreign key (workspace_id, role_key) references trama_roles(workspace_id, key)
);
create table trama_column_hidden (
  prop_id      uuid not null references trama_db_props(id) on delete cascade,
  role_key     text not null,
  primary key (prop_id, role_key)
);
create table trama_row_rules (                      -- ej.: «cada vendedor solo ve sus pedidos»
  id           uuid primary key default gen_random_uuid(),
  table_id     uuid not null references trama_db_tables(id) on delete cascade,
  role_key     text not null,
  filter       jsonb not null,
  enabled      boolean not null default true
);

-- ---------- avisos y auditoría (RN14) ----------
create table trama_notifications (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references trama_workspaces(id) on delete cascade,
  user_id      uuid not null references auth.users(id),
  text         text not null,
  row_id       uuid references trama_db_rows(id) on delete set null,
  page_id      uuid references trama_pages(id) on delete set null,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create table trama_audit_log (
  id           bigserial primary key,
  workspace_id uuid not null,
  table_id     uuid,
  row_id       uuid,
  user_id      uuid,
  at           timestamptz not null default now(),
  action       text not null,              -- insert, update, delete, validate, approve, import, lock
  old_data     jsonb,
  new_data     jsonb,
  reason       text,                       -- motivo exigido en acciones críticas
  source       text                        -- web, app móvil, importación
);
create index trama_audit_row on trama_audit_log(row_id, at desc);

-- ---------- funciones de permiso ----------
create or replace function trama_my_role(ws uuid) returns text
language sql stable security definer set search_path = public as $$
  select role_key from trama_members where workspace_id = ws and user_id = auth.uid() and status = 'active'
$$;

create or replace function trama_is_ws_admin(ws uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select r.is_admin from trama_members m join trama_roles r on r.workspace_id = m.workspace_id and r.key = m.role_key
                   where m.workspace_id = ws and m.user_id = auth.uid() and m.status = 'active'), false)
$$;

create or replace function trama_table_level(tid uuid) returns int
language sql stable security definer set search_path = public as $$
  select case
    when trama_is_ws_admin(t.workspace_id) then 4
    else coalesce((select case a.level when 'view' then 1 when 'comment' then 2 when 'edit' then 3 when 'full' then 4 else 0 end
                   from trama_table_access a where a.table_id = tid and a.role_key = trama_my_role(t.workspace_id)), 0)
  end
  from trama_db_tables t where t.id = tid
$$;

-- ---------- seguridad a nivel de fila ----------
alter table trama_workspaces enable row level security;
alter table trama_members enable row level security;
alter table trama_db_tables enable row level security;
alter table trama_db_props enable row level security;
alter table trama_db_rows enable row level security;
alter table trama_db_links enable row level security;
alter table trama_audit_log enable row level security;
alter table trama_notifications enable row level security;

create policy ws_read on trama_workspaces for select using (trama_my_role(id) is not null);
create policy members_read on trama_members for select using (trama_my_role(workspace_id) is not null);
create policy members_admin on trama_members for all using (trama_is_ws_admin(workspace_id)) with check (trama_is_ws_admin(workspace_id));
create policy tables_read on trama_db_tables for select using (trama_table_level(id) >= 1);
create policy tables_admin on trama_db_tables for all using (trama_table_level(id) >= 4) with check (trama_is_ws_admin(workspace_id));
create policy props_read on trama_db_props for select using (trama_table_level(table_id) >= 1);
create policy props_full on trama_db_props for all using (trama_table_level(table_id) >= 4) with check (trama_table_level(table_id) >= 4);
create policy rows_read on trama_db_rows for select using (trama_table_level(table_id) >= 1 and deleted_at is null);
create policy rows_insert on trama_db_rows for insert with check (trama_table_level(table_id) >= 3);
create policy rows_update on trama_db_rows for update using (trama_table_level(table_id) >= 3 and not exists (select 1 from trama_row_locks l where l.row_id = id));
create policy links_read on trama_db_links for select using (exists (select 1 from trama_db_rows r where r.id = from_row and trama_table_level(r.table_id) >= 1));
create policy links_write on trama_db_links for all using (exists (select 1 from trama_db_rows r where r.id = from_row and trama_table_level(r.table_id) >= 3));
create policy audit_read on trama_audit_log for select using (trama_is_ws_admin(workspace_id));
create policy notif_own on trama_notifications for all using (user_id = auth.uid());
-- Pendiente de diseñar con el equipo: reglas por fila (row_rules) y columnas ocultas
-- se aplicarán en vistas o funciones RPC, no solo en la interfaz.

-- ---------- auditoría automática ----------
create or replace function trama_audit_rows() returns trigger
language plpgsql security definer set search_path = public as $$
declare ws uuid;
begin
  select workspace_id into ws from trama_db_tables where id = coalesce(new.table_id, old.table_id);
  insert into trama_audit_log(workspace_id, table_id, row_id, user_id, action, old_data, new_data, reason, source)
  values (ws, coalesce(new.table_id, old.table_id), coalesce(new.id, old.id), auth.uid(), lower(tg_op),
          case when tg_op <> 'INSERT' then to_jsonb(old.data) end,
          case when tg_op <> 'DELETE' then to_jsonb(new.data) end,
          current_setting('trama.reason', true), current_setting('trama.source', true));
  return coalesce(new, old);
end $$;
create trigger trama_t_audit_rows after insert or update or delete on trama_db_rows for each row execute function trama_audit_rows();

create or replace function trama_touch_row() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at := now(); new.updated_by := auth.uid(); return new; end $$;
create trigger trama_t_touch_rows before update on trama_db_rows for each row execute function trama_touch_row();

-- RN03: impedir editar filas bloqueadas incluso con permisos amplios
create or replace function trama_block_locked() returns trigger language plpgsql set search_path = public as $$
begin
  if exists (select 1 from trama_row_locks where row_id = old.id) then
    raise exception 'Registro aprobado: crea una nueva versión en lugar de editarlo';
  end if;
  return coalesce(new, old);
end $$;
create trigger trama_t_block_locked before update or delete on trama_db_rows for each row execute function trama_block_locked();

-- Tiempo real (Supabase): publicar los cambios para que todos vean lo mismo al instante
alter publication supabase_realtime add table trama_db_rows, trama_db_links, trama_notifications, trama_pages, trama_blocks;
