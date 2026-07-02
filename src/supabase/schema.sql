-- Xoá bảng cũ (nếu có) trước khi tạo lại
drop table if exists public.menu_items;
drop table if exists public.tables;

create table public.tables (
  id bigint primary key,
  name text not null,
  type text not null default 'Bida lỗ',
  "hourlyRate" integer not null default 50000,
  occupied boolean not null default false,
  "startTime" timestamptz,
  items jsonb not null default '[]'::jsonb
);

alter table public.tables enable row level security;

create policy "Allow all" on public.tables
  for all using (true) with check (true);

create table public.menu_items (
  id text primary key,
  name text not null,
  category text not null,
  price integer not null default 0
);

alter table public.menu_items enable row level security;

create policy "Allow all" on public.menu_items
  for all using (true) with check (true);

create or replace function get_server_time()
returns timestamptz as $$ select now(); $$ language sql;
