---
name: mobile-pwa-ui
description: Use this skill whenever creating or changing any screen, layout, component, dialog, form, table, or navigation in the School Administration Portal, so it works well on phones when installed as a PWA (bilingual Arabic RTL / English LTR, light and dark). Trigger on requests about mobile, phone, responsive, PWA, bottom navigation, bottom sheet, long pages, tables on small screens, or UI/UX.
---

# Mobile PWA UI skill

Applies on top of `AGENTS.md` (the rules there always win). Phones are below the Tailwind `md` breakpoint (<768px). Desktop (`md` and up) must not change.

## When to use

Any task that adds or edits UI under `src/app/[locale]/**` or `src/components/**`. Skip for backend-only, database, or API work.

## Workflow (follow in order)

1. **Check branch and state.** `git branch --show-current` must not be `main`. `git status` must be clean (or contain only your work).
2. **Audit the target screen first.** Read the page and its components. Note: tables, wide grids, long forms, modals, hover-only UI, `min-h-screen`/`vh`, `left/right` classes. Report findings, then plan. Ask if unclear.
3. **Reuse primitives** from `src/components/mobile/` before creating anything new (see list below). Create a missing primitive only once, in its own file, and export it from the barrel.
4. **Change presentation only.** Do not touch queries, permissions, RLS, API routes, or business logic.
5. **Verify** (see checklist), then commit one small logical step.

## Layout decisions

**Page shell on phones**

- Compact sticky top bar (title or back + title, notification bell, overflow/profile).
- Bottom tab bar (in normal flow at the bottom of the shell column, not `position: fixed`): Home, Circulars, Calendar, Maintenance, More. It stays visible on every screen; form screens add a sticky action bar above it.
- More sheet: Notifications, Achievements (owner), Reports (`canViewReports`), School documents (`canViewDocuments`), Settings (`canManageSettings`), Backup (`canBackupRestore`). Language and theme switchers appear only for the owner, exactly like the desktop header. Reuse the exact gating from `MobileNavLinks` and `AppHeader`.
- The shell is `h-dvh` on phones: top bar and tab bar are fixed-height rows and `<main>` scrolls between them, so no extra bottom padding is needed. The shell sets `data-app-shell` so the global body safe-area padding is switched off for it.

**Keep pages short (target: top-level screen <= ~2 viewport heights)**

| Content                       | Phone pattern                                               |
| ----------------------------- | ----------------------------------------------------------- |
| Distinct sections on one page | `SegmentedTabs`                                             |
| Secondary info                | `CollapsibleSection` (collapsed by default)                 |
| KPI / stat cards              | 2x2 grid or horizontal snap carousel                        |
| Recent items on dashboard     | latest 3 + "See all" link                                   |
| Long lists                    | cards + "Load more"                                         |
| Table                         | stacked cards (title, 2-3 meta, status badge, chevron)      |
| Filter bar                    | one "Filters" button (with active count) -> `FilterSheet`   |
| Modal/dialog                  | `ResponsiveDialog` (Dialog on md+, `BottomSheet` on phones) |
| Row actions                   | action sheet                                                |
| Form                          | single column, collapsible groups, `StickyActionBar`        |
| Primary "create"              | `Fab` at `end-4`, above the tab bar                         |

One data source, two presentational components. Never fetch twice for mobile and desktop.

**Responsive technique**

- CSS-first: `md:hidden` / `hidden md:block`, Tailwind breakpoints. Avoid `useMediaQuery` and UA sniffing for layout (hydration mismatch). A JS hook is allowed only when the component tree must differ (Dialog vs BottomSheet) and must be SSR-safe.
- Prefer server components; add `"use client"` only where needed.

## Hard UI rules

- **RTL-safe:** logical utilities only (`ps/pe`, `ms/me`, `start/end`, `text-start/end`, `border-s/e`). Never `left/right`, `pl/pr`, `ml/mr`, `text-left/right`. Flip directional icons (chevrons, back arrows) in RTL.
- **No hardcoded strings:** add keys to both `ar` and `en` message files (including `aria-label`s and toasts).
- **Touch:** tap targets >= 44x44px, spacing >= 8px, no hover-only interactions.
- **Inputs:** >= 16px font on phones (prevents iOS zoom); correct `type`, `inputmode`, `autocomplete`.
- **Viewport:** use `dvh`, not `vh`/`min-h-screen`. `viewport-fit=cover`. Respect safe-area insets (top in standalone mode, bottom for the tab bar).
- **No horizontal page scroll**, ever. Wide content becomes cards or scrolls inside its own container only when unavoidable.
- **Keyboard:** focused inputs scroll into view; the on-screen keyboard and sticky bar must not cover the field.
- **Sheets/dialogs:** focus trap, Esc/back closes, max height ~85dvh with internal scroll, safe-area padding.
- **Theme:** design tokens only (no hardcoded colors): the top and tab bars use `--topbar-from/--topbar-to`, `sidebar`, and `gold`; panels use `PANEL` / `--panel`; check light and dark. Class merging is `cn` from `@/lib/cn`.
- **Motion:** subtle; respect `prefers-reduced-motion`.
- **Accessibility:** semantic elements, labelled controls, visible focus, sufficient contrast.
- **Permissions:** gating must be identical on every screen size.

## Primitives (src/components/mobile/, one per file, barrel index.ts)

`BottomSheet`, `SegmentedTabs`, `FilterSheet`, `Fab`, `LoadMoreList`, `MobileTabBar`, `MobileBackButton`, plus the class constants `STACKED_TABLE_CLASS` (table rows reflow into cards) and `STICKY_ACTION_BAR_CLASS` (sticky form submit row). Each file: one export, <= 300 lines, with a Vitest test.

## Verification checklist (do all, report real results)

- [ ] `npm run verify` passes (format, lint, typecheck, tests, secrets scan, build).
- [ ] Viewed at **360x640** and **390x844**: layout correct, nothing clipped behind the tab bar or keyboard.
- [ ] `document.documentElement.scrollWidth <= window.innerWidth` (no horizontal overflow).
- [ ] Checked in **Arabic (RTL) and English (LTR)**, **light and dark**.
- [ ] Page height measured in viewport heights, before vs after; top-level screens <= ~2.
- [ ] Desktop (1280px) looks identical to before (screenshot compare).
- [ ] Playwright mobile check added/updated in `tests/e2e/mobile.spec.ts` (phone projects only; uses the seeded local-stack fixtures, never a hosted project).
- [ ] Permission-gated items still hidden/shown correctly for owner, settings, reports, backup combinations.
- [ ] If a browser/Playwright tool is available, test the real running app at phone size instead of reasoning from code.

## Do not

- Do not change `supabase/`, auth, RBAC, API routes, env/deploy config, or add dependencies without asking.
- Do not refactor unrelated code or reformat files you are not changing; mention unrelated issues instead.
- Do not leave screenshots, logs, or scratch files in the repo.
- Do not mark the task done without running the checklist.

## Final report format

List: screens changed, primitives added/reused, commits created, checks run with results, anything noticed but intentionally left alone, and any decision the owner should review.
