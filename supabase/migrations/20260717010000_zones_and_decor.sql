-- Alas (zonas coloridas) e decoração do entorno (ruas) por andar
create table public.zones (
  id       text primary key,
  floor_id text not null references public.floors(id),
  name     text not null,
  color    text not null,
  initials text not null,
  marker   jsonb not null,           -- {"x":..,"y":..} posição do pin da ala
  area     jsonb not null            -- {"points":[[x,y],...]} piso colorido da ala
);

alter table public.floors add column decor jsonb not null default '{}'::jsonb;
alter table public.stores add column zone_id text references public.zones(id);

grant select on public.zones to service_role;
alter table public.zones enable row level security;
