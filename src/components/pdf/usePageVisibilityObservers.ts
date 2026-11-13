"use client";

import { useEffect, useState, type RefObject } from "react";

export function usePageVisibilityObservers(
  containerRef: RefObject<HTMLDivElement | null>,
  scrollRoot: HTMLDivElement | null,
  pageNumber: number,
  onBecomeVisible?: (pageNumber: number) => void,
): boolean {
  const [isNearViewport, setIsNearViewport] = useState(pageNumber <= 2);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const preloadObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsNearViewport(true);
        }
      },
      { root: scrollRoot, rootMargin: "350px 0px", threshold: 0.01 },
    );

    const activeObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onBecomeVisible?.(pageNumber);
        }
      },
      { root: scrollRoot, rootMargin: "0px", threshold: 0.55 },
    );

    preloadObserver.observe(node);
    activeObserver.observe(node);
    return () => {
      preloadObserver.disconnect();
      activeObserver.disconnect();
    };
  }, [containerRef, onBecomeVisible, pageNumber, scrollRoot]);

  return isNearViewport;
}
