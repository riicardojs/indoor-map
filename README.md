# Mapa do Shopping Popular — Estrela do Vale

Mapa interno interativo estilo quiosque de um shopping popular fictício em 2.5D
(fundo escuro, boxes em fileiras e alas coloridas), construído com Next.js
(App Router), SVG + perspectiva CSS, shadcn/ui e **Supabase local** como banco
de dados.

## Funcionalidades

- Mapa 2.5D (toggle 2D/2.5D), zoom/pan (botões, scroll, pinch e arraste)
- 3 andares (Térreo, Mezanino e Subsolo) com ~540 boxes em alas coloridas
  (Ala Azul, Vermelha, Amarela, 1000, Verde, Laranja, Roxa e Ciano)
- Ruas do entorno, pins das alas, bússola e legenda estilo quiosque
- Busca por nome ou número do box + filtros por categoria
- Painel de detalhes da loja (Sheet no desktop, Drawer no mobile)
- Legenda de categorias e serviços
- Marcador "Você está aqui" simulado (ponto de referência ou toque no mapa),
  persistido por andar no `localStorage`

## Arquitetura de dados

Os dados (andares, categorias, lojas, amenidades e pontos de referência) ficam
no Postgres do Supabase — migrações em `supabase/migrations/` e carga em
`supabase/seed.sql` (gerado por `node scripts/generate-seed.mjs`). O browser nunca fala com o Supabase: o client busca tudo
de `GET /api/mall` (Route Handler), que usa a **secret key** server-side
(`src/lib/supabase.ts`, protegido com `server-only`). RLS fica habilitado sem
policies (deny-all) de propósito.

## Como rodar

Pré-requisitos: Node 20+, Docker e o [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
# 1. Suba o Supabase local (Docker)
supabase start

# 2. Aplique schema + seed
supabase db reset

# 3. Configure as chaves (novo formato, sem anon key legada)
cp .env.example .env.local
# preencha SUPABASE_PUBLISHABLE_KEY e SUPABASE_SECRET_KEY
# com os valores exibidos por `supabase status`

# 4. Rode o app
npm install
npm run dev
```

App em http://localhost:3000 · Supabase Studio em http://127.0.0.1:54323.

> As variáveis **não** usam o prefixo `NEXT_PUBLIC_` de propósito — todo acesso
> ao banco é server-side, nada do Supabase deve vazar para o bundle do client.

## Próximos passos possíveis

- Migração para projeto Supabase hospedado + painel admin
- Rotas passo a passo entre pontos (pathfinding)
- Importação da planta real do shopping
