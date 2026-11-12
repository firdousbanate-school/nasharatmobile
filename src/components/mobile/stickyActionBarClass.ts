/**
 * Add to a form's submit/cancel row: below md it sticks to the bottom of the scroll area, full
 * width, with equal-width buttons (the primary action stays reachable on long forms).
 * Assumes the page container is padded by 1rem (`p-4`), which the app shell main is.
 */
export const STICKY_ACTION_BAR_CLASS =
  "max-md:sticky max-md:bottom-0 max-md:z-10 max-md:-mx-4 max-md:-mb-4 max-md:border-t max-md:border-border max-md:bg-card/95 max-md:p-3 max-md:backdrop-blur-md max-md:[&>*]:flex-1";
