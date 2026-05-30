"use client";

import { useCallback, useMemo, useState } from "react";

export function useBulkSelect<T extends { id: string }>(items: T[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const ids = useMemo(() => items.map((i) => i.id), [items]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(new Set(ids));
  }, [ids]);

  const clear = useCallback(() => {
    setSelected(new Set());
  }, []);

  const selectedIds = useMemo(() => [...selected], [selected]);

  const allSelected = ids.length > 0 && selected.size === ids.length;

  return {
    selected,
    selectedIds,
    selectedCount: selected.size,
    allSelected,
    toggle,
    selectAll,
    clear,
    isSelected: (id: string) => selected.has(id)
  };
}
