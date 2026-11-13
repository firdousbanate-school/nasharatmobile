import type { KeyboardEvent } from "react";

interface KeyHandlerDeps {
  currentPage: number;
  isSearchOpen: boolean;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onNavigatePage: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function handlePdfViewerKeyDown(
  e: KeyboardEvent<HTMLDivElement>,
  deps: KeyHandlerDeps,
): void {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
    e.preventDefault();
    deps.onOpenSearch();
    return;
  }
  if (e.key === "Escape" && deps.isSearchOpen) {
    deps.onCloseSearch();
    return;
  }
  if (e.target instanceof HTMLInputElement) return;

  const actions: Record<string, () => void> = {
    PageDown: () => deps.onNavigatePage(deps.currentPage + 1),
    ArrowRight: () => deps.onNavigatePage(deps.currentPage + 1),
    PageUp: () => deps.onNavigatePage(deps.currentPage - 1),
    ArrowLeft: () => deps.onNavigatePage(deps.currentPage - 1),
    "+": deps.onZoomIn,
    "=": deps.onZoomIn,
    "-": deps.onZoomOut,
  };
  actions[e.key]?.();
}
