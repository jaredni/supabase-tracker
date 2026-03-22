"use client";

import { useState, useEffect, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { Fte } from "@/lib/types";

interface FteComboboxProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
}

export function FteCombobox({
  value,
  onChange,
  placeholder = "Select person...",
}: FteComboboxProps) {
  const [open, setOpen] = useState(false);
  const [ftes, setFtes] = useState<Fte[]>([]);
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    fetchFtes("");
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchFtes(search);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  async function fetchFtes(query: string) {
    let q = supabase.from("ftes").select("*").order("name");
    if (query) {
      q = q.ilike("name", `%${query}%`);
    }
    const { data } = await q.limit(50);
    if (data) setFtes(data);
  }

  const selectedFte = ftes.find((f) => f.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          />
        }
      >
        {selectedFte ? selectedFte.name : placeholder}
        <span className="ml-2 shrink-0 opacity-50">⌄</span>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search people..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {value && (
                <CommandItem
                  onSelect={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                  className="text-muted-foreground"
                >
                  Clear selection
                </CommandItem>
              )}
              {ftes.map((fte) => (
                <CommandItem
                  key={fte.id}
                  value={String(fte.id)}
                  onSelect={() => {
                    onChange(fte.id);
                    setOpen(false);
                  }}
                >
                  {value === fte.id && <span className="mr-2">✓</span>}
                  {fte.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
