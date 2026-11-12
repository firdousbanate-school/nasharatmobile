"use client";

import { useState, useMemo } from "react";
import type { CircularRow } from "@/lib/circulars/types";

export function usePublicCircularFilters(
  circulars: CircularRow[] = [],
  initialMonth = "all",
) {
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredCirculars = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return circulars.filter((circular) => {
      if (selectedMonth !== "all") {
        const rawDate = circular.publish_at || circular.created_at;
        if (!rawDate) return false;
        const date = new Date(rawDate);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const key = `${year}-${month}`;
        if (key !== selectedMonth) return false;
      }

      if (query) {
        const titleMatch = circular.title.toLowerCase().includes(query);
        const refMatch = circular.ref_number.toLowerCase().includes(query);
        const bodyMatch = circular.body?.toLowerCase().includes(query);
        if (!titleMatch && !refMatch && !bodyMatch) return false;
      }

      return true;
    });
  }, [circulars, selectedMonth, searchQuery]);

  const resetFilters = () => {
    setSelectedMonth(initialMonth);
    setSearchQuery("");
  };

  return {
    selectedMonth,
    setSelectedMonth,
    searchQuery,
    setSearchQuery,
    filteredCirculars,
    resetFilters,
  };
}
