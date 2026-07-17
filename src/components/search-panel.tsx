"use client";

import type { Category, Floor, Store } from "@/lib/mall-types";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

interface SearchPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  floors: Floor[];
  stores: Store[];
  categoriesById: Map<string, Category>;
  onSelectStore: (store: Store) => void;
}

export function SearchPanel({
  open,
  onOpenChange,
  floors,
  stores,
  categoriesById,
  onSelectStore,
}: SearchPanelProps) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Buscar loja"
      description="Busque por nome ou número do box"
    >
      <Command
        filter={(value, search) => (value.includes(normalize(search)) ? 1 : 0)}
      >
        <CommandInput placeholder="Nome ou número do box…" />
        <CommandList>
          <CommandEmpty>Nenhuma loja encontrada.</CommandEmpty>
          {floors.map((floor) => {
            const floorStores = stores.filter((s) => s.floorId === floor.id);
            if (floorStores.length === 0) return null;
            return (
              <CommandGroup key={floor.id} heading={floor.name}>
                {floorStores.map((store) => {
                  const cat = categoriesById.get(store.categoryId);
                  return (
                    <CommandItem
                      key={store.id}
                      value={`${normalize(store.name)} ${normalize(store.number)}`}
                      onSelect={() => {
                        onOpenChange(false);
                        onSelectStore(store);
                      }}
                    >
                      <span className="flex-1 truncate">{store.name}</span>
                      <span className="text-xs text-muted-foreground">{store.number}</span>
                      {cat && (
                        <Badge variant="outline" className="ml-1 hidden sm:inline-flex">
                          {cat.name}
                        </Badge>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            );
          })}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
