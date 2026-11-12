# Phone UI (PWA) guide

Phones are viewports below Tailwind's `md` breakpoint (<768px). The same pages serve phones and
desktop; the layout adapts with CSS. Desktop (`md` and up) is unchanged.

## App shell

- `AppShell` is `h-dvh` on phones: a compact top bar, a scrolling `<main>`, and a bottom tab bar
  (in normal flow, not `position: fixed`). On `md+` it keeps the original sidebar layout.
- `data-app-shell` on the shell turns off the global `body` safe-area padding (`globals.css`);
  the top bar and tab bar pad themselves with `env(safe-area-inset-*)` (`viewportFit: "cover"`).
- Top bar: back button on nested screens (`getParentPath`), school brand on top-level screens,
  notification bell, user menu. The top bar keeps the themed gradient and gold rule. For the owner,
  language and theme live in the **More** sheet on phones (they are owner-only on desktop too).
- Bottom tab bar: Dashboard, Circulars, Calendar, Maintenance, More. The More sheet shows
  Notifications, Achievements (owner), Reports, School documents (`canViewDocuments`), Settings
  and Backup with the same permission flags as the desktop sidebar.

## Primitives (`src/components/mobile/`)

| Piece                     | Use                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------- |
| `BottomSheet`             | Modal sheet (phones only): focus, Esc, backdrop, scroll lock, safe-area padding     |
| `SegmentedTabs`           | Phones: one panel at a time. `md+`: every panel shown (desktop layout unchanged)    |
| `FilterSheet`             | Phones: "Filters" button + sheet. `md+`: filters inline as before                   |
| `LoadMoreList`            | First N items + "Show more" to keep card lists short                                |
| `Fab`                     | Floating create button above the tab bar (phones only)                              |
| `STACKED_TABLE_CLASS`     | Pass to `<Table className>`: rows reflow into cards below `md`, no logic duplicated |
| `STICKY_ACTION_BAR_CLASS` | Form submit row sticks to the bottom of the scroll area on phones                   |

## Screen patterns

- Lists (circulars, maintenance): cards below `md`, the existing table from `md`; filters in a
  sheet; "Show more"; FAB for create.
- Detail screens (circular, maintenance): `SegmentedTabs` (Details / Your response / Responses,
  Details / Activity). The in-page "Back" row is hidden on phones (the top bar has one).
- Dashboard: compact 2-column stats; widgets split into tabs on phones (the desktop widget grid is
  rendered separately and hidden below `md`).
- Calendar: compact month grid with dots and the selected day's items below; the event dialog
  becomes a bottom sheet.
- Settings: tables reflow into cards with `STACKED_TABLE_CLASS`. Reports: filters in a sheet, 2-column KPIs,
  and the three data tables (department compliance, circulars, maintenance) become labelled cards
  (`DepartmentComplianceCard`, `CircularReportCard` with a "who responded" expander, `MaintenanceReportCard`)
  with "Show more"; the original tables are unchanged from `md` up.

## Adding a new page

1. Use logical spacing (`ps/pe/ms/me/start/end`, `text-start`), never `left/right`.
2. Put long content in `SegmentedTabs`; use cards (not tables) for lists; filters in `FilterSheet`.
3. Add strings to both `ar` and `en`.
4. Use `dvh`, not `vh`. Tap targets >= 44px. Check 360x640 and 390x844, ar/en, light/dark.
5. Add or update `tests/e2e/mobile.spec.ts`. It runs only in the phone Playwright projects and uses the
   seeded users of the local Supabase stack (`seedE2eFixture`, `loginAs`).
