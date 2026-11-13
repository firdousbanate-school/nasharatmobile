/**
 * Highlights spans in a rendered PDF.js textLayer matching the active search query.
 */
export function highlightTextLayer(
  container: HTMLElement,
  rawQuery: string,
  activePageMatchIndex: number | null,
): void {
  const spans = Array.from(container.querySelectorAll("span"));
  const query = rawQuery.trim().toLocaleLowerCase();
  let pageMatchCounter = 0;

  for (const span of spans) {
    span.classList.remove("pdf-search-hit", "pdf-search-hit-active");
    if (!query) continue;

    const text = (span.textContent ?? "").toLocaleLowerCase();
    if (!text.includes(query)) continue;

    span.classList.add("pdf-search-hit");
    if (activePageMatchIndex !== null && pageMatchCounter === activePageMatchIndex) {
      span.classList.add("pdf-search-hit-active");
    }
    pageMatchCounter += 1;
  }
}
