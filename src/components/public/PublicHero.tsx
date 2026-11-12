"use client";

import { useLocale } from "next-intl";
import { Building2Icon } from "lucide-react";
import type { PublicSchoolProfileRow } from "@/lib/school/getPublicSchoolProfile";
import { resolveLocalizedText } from "@/lib/school/resolveLocalizedText";
import { parseSchoolNameHierarchy } from "@/lib/school/parseSchoolNameHierarchy";
import { PublicHeroCardsGrid } from "./PublicHeroCardsGrid";
import { PublicDocumentsSection } from "./PublicDocumentsSection";
import type { SchoolDocumentRow } from "@/lib/documents/types";

export function PublicHero({
  school,
  documents = [],
}: {
  school: PublicSchoolProfileRow | null;
  documents?: SchoolDocumentRow[];
}) {
  const locale = useLocale();

  const rawSchoolName = resolveLocalizedText(locale, school?.name_ar, school?.name_en);
  const { hierarchy } = parseSchoolNameHierarchy(rawSchoolName);

  return (
    <section
      id="overview"
      className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-primary/5 via-background to-background px-4 sm:px-8 lg:px-12 xl:px-16 pt-10 pb-16 sm:pt-12 sm:pb-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[850px] rounded-full bg-primary/10 blur-3xl animate-ambient-pulse"
      />

      <div className="relative mx-auto w-full max-w-[1720px] text-center space-y-8 sm:space-y-12">
        {hierarchy && (
          <div className="mx-auto max-w-4xl pb-2 sm:pb-4 animate-hero-fade-down">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-5 py-2 text-xs sm:text-sm font-medium text-muted-foreground shadow-2xs backdrop-blur-xs transition-transform duration-300 hover:scale-105">
              <Building2Icon className="size-4 text-primary" />
              <span>{hierarchy}</span>
            </div>
          </div>
        )}

        <div className="pt-4 sm:pt-6">
          <PublicHeroCardsGrid school={school} />
        </div>

        <PublicDocumentsSection documents={documents} />
      </div>
    </section>
  );
}
