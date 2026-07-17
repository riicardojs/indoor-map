-- Schema do mapa interno do shopping
create table public.floors (
  id      text primary key,
  name    text not null,
  level   int  not null unique,
  outline text not null
);

create table public.categories (
  id    text primary key,
  name  text not null,
  color text not null,
  icon  text not null
);

create table public.stores (
  id            text primary key,
  name          text not null,
  number        text not null,
  floor_id      text not null references public.floors(id),
  category_id   text not null references public.categories(id),
  polygon       jsonb not null,
  label_pos     jsonb not null,
  description   text not null,
  hours         text not null,
  phone         text not null,
  logo_initials text not null
);
create unique index stores_number_key on public.stores(number);

create table public.amenities (
  id       text primary key,
  type     text not null,
  floor_id text not null references public.floors(id),
  position jsonb not null
);

create table public.landmarks (
  id       text primary key,
  name     text not null,
  floor_id text not null references public.floors(id),
  position jsonb not null
);

-- Somente o servidor (secret key → service_role) pode ler as tabelas.
grant select on public.floors, public.categories, public.stores,
  public.amenities, public.landmarks to service_role;

-- RLS deny-all: o servidor acessa com a secret key (ignora RLS);
-- nenhuma policy é criada de propósito.
alter table public.floors     enable row level security;
alter table public.categories enable row level security;
alter table public.stores     enable row level security;
alter table public.amenities  enable row level security;
alter table public.landmarks  enable row level security;
