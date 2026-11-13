"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

export function usePdfFullscreen(rootRef: RefObject<HTMLDivElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = rootRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => setIsFullscreen(false));
      return;
    }
    if (typeof el.requestFullscreen === "function") {
      try {
        await el.requestFullscreen();
        return;
      } catch {
        // Fallback to CSS fullscreen on iOS / restricted contexts
      }
    }
    setIsFullscreen((prev) => !prev);
  }, [rootRef]);

  return { isFullscreen, toggleFullscreen };
}
