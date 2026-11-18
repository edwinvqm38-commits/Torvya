-- Trama · políticas para las demás tablas y función para tomar la administración
alter table trama_roles enable row level security;
alter table trama_org_areas enable row level security;
alter table trama_org_positions enable row level security;
alter table trama_modules enable row level security;
alter table trama_row_locks enable row level security;
alter table trama_db_views enable row level security;
alter table trama_forms enable row level security;
alter table trama_row_templates enable row level security;
alter table trama_import_batches enable row level security;
alter table trama_pages enable row level security;
alter table trama_blocks enable row level security;
alter table trama_table_access enable row level security;
alter table trama_column_hidden enable row level security;
alter table trama_row_rules enable row level security;

-- lectura para miembros del espacio, escritura para administración
create policy roles_read on trama_roles for select using (trama_my_role(workspace_id) is not null);
create policy roles_admin on trama_roles for all using (trama_is_ws_admin(workspace_id)) with check (trama_is_ws_admin(workspace_id));
create policy areas_read on trama_org_areas for select using (trama_my_role(workspace_id) is not null);
create policy areas_admin on trama_org_areas for all using (trama_is_ws_admin(workspace_id)) with check (trama_is_ws_admin(workspace_id));
create policy pos_read on trama_org_positions for select using (trama_my_role(workspace_id) is not null);
create policy pos_admin on trama_org_positions for all using (trama_is_ws_admin(workspace_id)) with check (trama_is_ws_admin(workspace_id));
create policy modules_read on trama_modules for select using (trama_my_role(workspace_id) is not null);
create policy modules_admin on trama_modules for all using (trama_is_ws_admin(workspace_id)) with check (trama_is_ws_admin(workspace_id));
create policy access_read on trama_table_access for select using (trama_my_role(workspace_id) is not null);
create policy access_admin on trama_table_access for all using (trama_is_ws_admin(workspace_id)) with check (trama_is_ws_admin(workspace_id));
create policy batches_read on trama_import_batches for select using (trama_table_level(table_id) >= 1);
create policy batches_write on trama_import_batches for all using (trama_table_level(table_id) >= 3) with check (trama_table_level(table_id) >= 3);
-- según el nivel en la tabla
create policy views_read on trama_db_views for select using (trama_table_level(table_id) >= 1);
create policy views_write on trama_db_views for all using (trama_table_level(table_id) >= 4) with check (trama_table_level(table_id) >= 4);
create policy forms_read on trama_forms for select using (trama_table_level(table_id) >= 1);
create policy forms_write on trama_forms for all using (trama_table_level(table_id) >= 4) with check (trama_table_level(table_id) >= 4);
create policy tpl_read on trama_row_templates for select using (trama_table_level(table_id) >= 1);
create policy tpl_write on trama_row_templates for all using (trama_table_level(table_id) >= 3) with check (trama_table_level(table_id) >= 3);
create policy rules_read on trama_row_rules for select using (trama_table_level(table_id) >= 1);
create policy rules_admin on trama_row_rules for all using (trama_table_level(table_id) >= 4) with check (trama_table_level(table_id) >= 4);
create policy hidden_read on trama_column_hidden for select using (exists (select 1 from trama_db_props p where p.id = prop_id and trama_table_level(p.table_id) >= 1));
create policy hidden_admin on trama_column_hidden for all using (exists (select 1 from trama_db_props p where p.id = prop_id and trama_table_level(p.table_id) >= 4));
create policy locks_read on trama_row_locks for select using (exists (select 1 from trama_db_rows r where r.id = row_id and trama_table_level(r.table_id) >= 1));
create policy locks_write on trama_row_locks for insert with check (exists (select 1 from trama_db_rows r where r.id = row_id and trama_table_level(r.table_id) >= 4));
-- páginas: personales del dueño o del área (la visibilidad fina por área se resolverá en la app y luego en una función)
create policy pages_read on trama_pages for select using (trama_my_role(workspace_id) is not null and (owner_id is null or owner_id = auth.uid()));
create policy pages_write on trama_pages for all using (trama_my_role(workspace_id) is not null and (owner_id is null and trama_is_ws_admin(workspace_id) or owner_id = auth.uid())) with check (trama_my_role(workspace_id) is not null);
create policy blocks_read on trama_blocks for select using (exists (select 1 from trama_pages p where p.id = page_id and trama_my_role(p.workspace_id) is not null and (p.owner_id is null or p.owner_id = auth.uid())));
create policy blocks_write on trama_blocks for all using (exists (select 1 from trama_pages p where p.id = page_id and (trama_is_ws_admin(p.workspace_id) or p.owner_id = auth.uid())));
-- borrar filas: solo acceso total y nunca si están bloqueadas
create policy rows_delete on trama_db_rows for delete using (trama_table_level(table_id) >= 4 and not exists (select 1 from trama_row_locks l where l.row_id = id));

-- la primera persona que entra a un espacio sin miembros queda como administración
create or replace function trama_claim_admin(ws uuid, display text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Inicia sesión primero'; end if;
  if exists (select 1 from trama_members where workspace_id = ws) then return false; end if;
  insert into trama_members(workspace_id, user_id, role_key, display_name) values (ws, auth.uid(), 'admin', display);
  return true;
end $$;
revoke all on function trama_claim_admin(uuid, text) from public, anon;
grant execute on function trama_claim_admin(uuid, text) to authenticated;
