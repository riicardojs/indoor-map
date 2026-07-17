#!/usr/bin/env node
/**
 * Gera supabase/seed.sql — layout estilo "shopping popular":
 * centenas de boxes em fileiras, agrupados em alas coloridas,
 * em 3 andares (Térreo, Mezanino, Subsolo).
 *
 * Uso: node scripts/generate-seed.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "supabase", "seed.sql");

const BOX_W = 20;
const BOX_H = 28;
const STEP_X = 25;
const STEP_Y = 40;

const CATEGORY_CYCLE = [
  "moda", "eletronicos", "servicos", "beleza", "casa", "lazer", "alimentacao",
];
const DESCRIPTIONS = {
  moda: "Roupas, calçados e acessórios com preço de shopping popular.",
  eletronicos: "Celulares, acessórios e eletrônicos em geral.",
  servicos: "Serviços rápidos e atendimento ao cliente.",
  beleza: "Cosméticos, perfumaria e cuidados pessoais.",
  casa: "Utilidades domésticas e artigos para casa.",
  lazer: "Brinquedos, games e artigos de lazer.",
  alimentacao: "Lanches, doces e bebidas.",
};
const HOURS = "Seg–Sáb 9h–19h · Dom 9h–14h";

const floors = [
  {
    id: "terreo",
    name: "Térreo",
    level: 0,
    outline: "M 120 100 L 880 100 L 950 330 L 780 600 L 200 600 L 120 480 Z",
    decor: {
      streets: [
        { path: "M 600 20 L 1010 170", width: 34, label: "Rua da Juta", labelPos: { x: 840, y: 55 } },
        { path: "M 20 510 L 560 705", width: 34, label: "Rua Rodrigues dos Santos", labelPos: { x: 250, y: 665 } },
      ],
    },
  },
  {
    id: "mezanino",
    name: "Mezanino",
    level: 1,
    outline: "M 200 140 L 820 140 L 880 340 L 740 560 L 300 560 L 200 420 Z",
    decor: {},
  },
  {
    id: "subsolo",
    name: "Subsolo",
    level: -1,
    outline: "M 240 160 L 780 160 L 840 360 L 700 560 L 280 560 L 240 460 Z",
    decor: {},
  },
];

// Limites do lado direito do térreo (arestas diagonais do contorno)
const terreoRightLimit = (y) =>
  y <= 330 ? 880 + (y - 100) * (70 / 230) : 950 - (y - 330) * (170 / 270);
const mezaninoRightLimit = (y) =>
  y <= 340 ? 820 + (y - 140) * (60 / 200) : 880 - (y - 340) * (140 / 220);
const subsoloRightLimit = (y) =>
  y <= 360 ? 780 + (y - 160) * (60 / 200) : 840 - (y - 360) * (140 / 200);

const zones = [
  { id: "ala-azul", floorId: "terreo", name: "Ala Azul", color: "#3b82f6", initials: "AZ", marker: { x: 240, y: 312 } },
  { id: "ala-vermelha", floorId: "terreo", name: "Ala Vermelha", color: "#ef4444", initials: "VM", marker: { x: 495, y: 128 } },
  { id: "ala-amarela", floorId: "terreo", name: "Ala Amarela", color: "#eab308", initials: "AM", marker: { x: 750, y: 128 } },
  { id: "ala-1000", floorId: "terreo", name: "Ala 1000", color: "#9ca3af", initials: "A1", marker: { x: 896, y: 292 } },
  { id: "ala-verde", floorId: "mezanino", name: "Ala Verde", color: "#22c55e", initials: "AV", marker: { x: 355, y: 162 } },
  { id: "ala-laranja", floorId: "mezanino", name: "Ala Laranja", color: "#f97316", initials: "AL", marker: { x: 655, y: 162 } },
  { id: "ala-roxa", floorId: "subsolo", name: "Ala Roxa", color: "#8b5cf6", initials: "AR", marker: { x: 375, y: 182 } },
  { id: "ala-ciano", floorId: "subsolo", name: "Ala Ciano", color: "#06b6d4", initials: "AC", marker: { x: 640, y: 182 } },
];

// Áreas coloridas (piso da ala) desenhadas sob os boxes
const zoneAreas = {
  "ala-azul": [[150, 325], [335, 325], [335, 575], [183, 575], [150, 525]],
  "ala-vermelha": [[360, 140], [630, 140], [630, 430], [360, 430]],
  "ala-amarela": [[655, 140], [845, 140], [845, 430], [655, 430]],
  "ala-1000": [[850, 160], [900, 160], [943, 330], [858, 465]],
  "ala-verde": [[225, 165], [495, 165], [495, 535], [312, 535], [225, 442]],
  "ala-laranja": [[515, 165], [800, 165], [800, 535], [515, 535]],
  "ala-roxa": [[255, 175], [500, 175], [500, 540], [287, 540], [255, 472]],
  "ala-ciano": [[520, 175], [790, 175], [790, 540], [520, 540]],
};

/** Gera uma grade de boxes dentro de um retângulo, com filtros opcionais. */
function grid({ x0, x1, y0, y1, skip, minXAt, maxXAt }) {
  const boxes = [];
  for (let y = y0; y + BOX_H <= y1; y += STEP_Y) {
    const yb = y + BOX_H;
    const minX = minXAt ? Math.max(x0, minXAt(yb)) : x0;
    const maxX = maxXAt ? Math.min(x1, maxXAt(yb)) : x1;
    for (let x = x0; x + BOX_W <= x1; x += STEP_X) {
      if (x < minX || x + BOX_W > maxX) continue;
      if (skip && skip(x, y)) continue;
      boxes.push([x, y]);
    }
  }
  return boxes;
}

const stalls = [];

function addZoneBoxes(zoneId, floorId, numberStart, prefix, gridSpec) {
  const boxes = grid(gridSpec);
  boxes.forEach(([x, y], i) => {
    const n = numberStart + i;
    const number = prefix ? `${prefix}-${n}` : String(n);
    stalls.push({
      id: `box-${floorId}-${number.toLowerCase()}`,
      name: `Box ${number}`,
      number,
      floorId,
      zoneId,
      categoryId: CATEGORY_CYCLE[(x + y + i) % CATEGORY_CYCLE.length],
      polygon: [[x, y], [x + BOX_W, y], [x + BOX_W, y + BOX_H], [x, y + BOX_H]],
      labelPos: { x: x + BOX_W / 2, y: y + BOX_H / 2 },
    });
  });
  return boxes.length;
}

// ---- Térreo -----------------------------------------------------------
// Ala Azul (braço inferior esquerdo, recortado pela diagonal do contorno)
addZoneBoxes("ala-azul", "terreo", 100, "", {
  x0: 160, x1: 330, y0: 335, y1: 575,
  minXAt: (yb) => (yb > 525 ? 120 + (yb - 480) / 1.5 + 10 : 160),
});
// Ala Vermelha (centro-norte, com praça central sem boxes)
addZoneBoxes("ala-vermelha", "terreo", 300, "", {
  x0: 370, x1: 625, y0: 150, y1: 425,
  skip: (x, y) => x >= 455 && x <= 545 && y >= 235 && y <= 345,
});
// Ala Amarela (nordeste)
addZoneBoxes("ala-amarela", "terreo", 600, "", {
  x0: 665, x1: 840, y0: 150, y1: 425,
  maxXAt: (yb) => terreoRightLimit(yb) - 8,
});
// Fileiras inferiores (sem ala)
addZoneBoxes(null, "terreo", 800, "", {
  x0: 370, x1: 785, y0: 450, y1: 575,
  maxXAt: (yb) => terreoRightLimit(yb) - 8,
});
// Ala 1000 (faixa leste, encostada na diagonal)
addZoneBoxes("ala-1000", "terreo", 1000, "", {
  x0: 855, x1: 905, y0: 170, y1: 465,
  maxXAt: (yb) => terreoRightLimit(yb) - 8,
});

// ---- Mezanino ---------------------------------------------------------
addZoneBoxes("ala-verde", "mezanino", 1, "M", {
  x0: 240, x1: 490, y0: 180, y1: 530,
  minXAt: (yb) => (yb > 442 ? 200 + (yb - 420) / 1.4 + 10 : 240),
});
addZoneBoxes("ala-laranja", "mezanino", 200, "M", {
  x0: 525, x1: 795, y0: 180, y1: 530,
  maxXAt: (yb) => mezaninoRightLimit(yb) - 8,
});

// ---- Subsolo ----------------------------------------------------------
addZoneBoxes("ala-roxa", "subsolo", 1, "S", {
  x0: 265, x1: 495, y0: 190, y1: 535,
  minXAt: (yb) => (yb > 472 ? 240 + (yb - 460) / 2.5 + 10 : 265),
});
addZoneBoxes("ala-ciano", "subsolo", 200, "S", {
  x0: 530, x1: 785, y0: 190, y1: 535,
  maxXAt: (yb) => subsoloRightLimit(yb) - 8,
});

// ---- Amenidades e pontos de referência --------------------------------
const amenities = [
  ["t-entrada-juta", "entrada", "terreo", { x: 760, y: 118 }],
  ["t-entrada-rodrigues", "entrada", "terreo", { x: 305, y: 592 }],
  ["t-informacoes", "informacoes", "terreo", { x: 340, y: 585 }],
  ["t-banheiro", "banheiro", "terreo", { x: 350, y: 175 }],
  ["t-banheiro-2", "banheiro", "terreo", { x: 812, y: 445 }],
  ["t-caixa", "caixa_eletronico", "terreo", { x: 400, y: 438 }],
  ["t-escada-rolante", "escada_rolante", "terreo", { x: 488, y: 272 }],
  ["t-elevador", "elevador", "terreo", { x: 528, y: 310 }],
  ["m-banheiro", "banheiro", "mezanino", { x: 505, y: 200 }],
  ["m-escada-rolante", "escada_rolante", "mezanino", { x: 505, y: 350 }],
  ["m-elevador", "elevador", "mezanino", { x: 505, y: 392 }],
  ["m-escada", "escada", "mezanino", { x: 505, y: 470 }],
  ["s-banheiro", "banheiro", "subsolo", { x: 510, y: 210 }],
  ["s-escada-rolante", "escada_rolante", "subsolo", { x: 510, y: 355 }],
  ["s-elevador", "elevador", "subsolo", { x: 510, y: 396 }],
];

const landmarks = [
  ["lm-entrada-juta", "Entrada Rua da Juta", "terreo", { x: 760, y: 128 }],
  ["lm-entrada-rodrigues", "Entrada Rua Rodrigues dos Santos", "terreo", { x: 310, y: 585 }],
  ["lm-praca-central", "Praça Central", "terreo", { x: 508, y: 290 }],
  ["lm-ala-azul", "Ala Azul", "terreo", { x: 240, y: 400 }],
  ["lm-ala-vermelha", "Ala Vermelha", "terreo", { x: 495, y: 200 }],
  ["lm-ala-amarela", "Ala Amarela", "terreo", { x: 750, y: 200 }],
  ["lm-ala-1000", "Ala 1000", "terreo", { x: 885, y: 300 }],
  ["lm-mez-escada", "Escada Rolante (Mezanino)", "mezanino", { x: 505, y: 360 }],
  ["lm-ala-verde", "Ala Verde", "mezanino", { x: 355, y: 300 }],
  ["lm-ala-laranja", "Ala Laranja", "mezanino", { x: 655, y: 300 }],
  ["lm-sub-escada", "Escada Rolante (Subsolo)", "subsolo", { x: 515, y: 360 }],
  ["lm-ala-roxa", "Ala Roxa", "subsolo", { x: 375, y: 300 }],
  ["lm-ala-ciano", "Ala Ciano", "subsolo", { x: 640, y: 300 }],
];

const categories = [
  ["moda", "Moda", "#c7b9e2", "shirt"],
  ["alimentacao", "Alimentação", "#f2c6a0", "utensils-crossed"],
  ["eletronicos", "Eletrônicos", "#a8c5e2", "smartphone"],
  ["servicos", "Serviços", "#b9c2cc", "briefcase"],
  ["beleza", "Beleza & Saúde", "#f0b8c4", "sparkles"],
  ["lazer", "Lazer", "#b5d9b6", "gamepad-2"],
  ["casa", "Casa & Decoração", "#d9ceb2", "lamp"],
  ["ancora", "Âncora", "#9db3c8", "store"],
];

// ---- Emissão do SQL ----------------------------------------------------
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const j = (o) => `'${JSON.stringify(o).replace(/'/g, "''")}'`;

let sql = `-- GERADO por scripts/generate-seed.mjs — não edite à mão.
-- Shopping Popular Estrela do Vale: ${stalls.length} boxes em 3 andares.

insert into public.floors (id, name, level, outline, decor) values
${floors
  .map((f) => `  (${q(f.id)}, ${q(f.name)}, ${f.level}, ${q(f.outline)}, ${j(f.decor)})`)
  .join(",\n")};

insert into public.categories (id, name, color, icon) values
${categories.map(([id, name, color, icon]) => `  (${q(id)}, ${q(name)}, ${q(color)}, ${q(icon)})`).join(",\n")};

insert into public.zones (id, floor_id, name, color, initials, marker, area) values
${zones
  .map(
    (z) =>
      `  (${q(z.id)}, ${q(z.floorId)}, ${q(z.name)}, ${q(z.color)}, ${q(z.initials)}, ${j(z.marker)}, ${j({ points: zoneAreas[z.id] })})`
  )
  .join(",\n")};
`;

// Boxes em lotes para não estourar linha
for (let i = 0; i < stalls.length; i += 50) {
  const batch = stalls.slice(i, i + 50);
  sql += `
insert into public.stores (id, name, number, floor_id, category_id, zone_id, polygon, label_pos, description, hours, phone, logo_initials) values
${batch
    .map((s) => {
      const phone = `(11) 4002-${String(1000 + (stalls.indexOf(s) % 9000)).padStart(4, "0")}`;
      return `  (${q(s.id)}, ${q(s.name)}, ${q(s.number)}, ${q(s.floorId)}, ${q(s.categoryId)}, ${
        s.zoneId ? q(s.zoneId) : "null"
      }, ${j({ points: s.polygon })}, ${j(s.labelPos)}, ${q(DESCRIPTIONS[s.categoryId])}, ${q(HOURS)}, ${q(phone)}, ${q("B" + s.number.replace(/\D/g, "").slice(-1))})`;
    })
    .join(",\n")};
`;
}

sql += `
insert into public.amenities (id, type, floor_id, position) values
${amenities.map(([id, type, f, pos]) => `  (${q(id)}, ${q(type)}, ${q(f)}, ${j(pos)})`).join(",\n")};

insert into public.landmarks (id, name, floor_id, position) values
${landmarks.map(([id, name, f, pos]) => `  (${q(id)}, ${q(name)}, ${q(f)}, ${j(pos)})`).join(",\n")};
`;

writeFileSync(OUT, sql);
console.log(`seed.sql gerado: ${stalls.length} boxes.`);
