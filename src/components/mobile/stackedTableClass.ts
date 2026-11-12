/**
 * Pass to `<Table className={...}>` to reflow each row into a card below md (no logic duplicated,
 * desktop table unchanged). Header row is hidden; cells flow inline and wrap.
 */
export const STACKED_TABLE_CLASS =
  "max-md:block max-md:[&_thead]:hidden max-md:[&_tbody]:block max-md:[&_tbody]:p-0.5 max-md:[&_tr]:mb-2 max-md:[&_tr]:flex max-md:[&_tr]:flex-wrap max-md:[&_tr]:items-center max-md:[&_tr]:gap-x-3 max-md:[&_tr]:gap-y-1 max-md:[&_tr]:rounded-xl max-md:[&_tr]:bg-card max-md:[&_tr]:p-3 max-md:[&_tr]:ring-1 max-md:[&_tr]:ring-border max-md:[&_td]:block max-md:[&_td]:p-0";
