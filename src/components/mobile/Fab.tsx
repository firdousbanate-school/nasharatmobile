import { Link } from "@/i18n";
import { PlusIcon } from "lucide-react";

/** Floating create button, phones only. Sits above the bottom tab bar (which is in normal flow). */
export function Fab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="fixed end-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 md:hidden"
    >
      <PlusIcon className="size-6" />
    </Link>
  );
}
