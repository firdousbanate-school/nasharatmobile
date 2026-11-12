# Release 2026-11: phone UI, security hardening, write-action tests

One release made of three independent workstreams. All of them were verified together from a clean
checkout (see "Verification"). Nothing here changes desktop layout (768px and up) except the notification
badge colour (item M6).

## M. Phone-first adaptive UI (PWA)

- **M1** Phone shell: compact top bar with back button, bottom tab bar (Dashboard, Circulars, Calendar,
  Maintenance, More), More sheet with the same permission gating as desktop (Documents need
  `canViewDocuments`; language and theme stay owner-only).
- **M2** Lists as cards with a Filters sheet, "Show more" and a floating create button (circulars, maintenance).
- **M3** Detail screens as tabs (circular, maintenance); dashboard widgets as tabs; compact stat cards.
- **M4** Phone calendar: compact month grid, day agenda, event dialog as a bottom sheet.
- **M5** Settings tables reflow into cards; report tables become labelled cards; report filters in a sheet.
- **M6** Notification badge is gold with a bar-coloured ring (it was invisible on the navy top bar; this
  also changes desktop).
- **M7** Sticky form action bars, touch-size controls, safe-area handling, `dvh` heights
  (`docs/mobile-ui.md`, `.agent/skills/mobile-pwa-ui/SKILL.md`, rules #16 and #17 in `AGENTS.md`).

## S. Security and robustness

- **S1** Shared (cross-instance) auth rate limiting: migration `0064_rate_limit_counters.sql`.
- **S2** Design prototypes moved out of `public/` to `docs/prototypes/`; unused starter SVGs removed.
- **S3** `/api/bypass` no longer accepts the secret in the URL (`docs/runbooks/under_construction_bypass.md`).
- **S4** `npm audit fix` (lockfile only): removed the high-severity advisory and about 40 transitive dev packages.
- **S5** Errors are no longer swallowed silently (`recoverWithFallback`); data failures reach the error page.
- **S6** Locale-aware links (`@/i18n` `Link`) in ten components.

## T. Tests and defects found by them

All 48 server actions are covered. Fixes: role permissions are never emptied by a failed update; scoped
updates and deletes that match no row now report "not found" instead of success (calendar publish/cancel/
archive, circular publish, department and location update/toggle, achievements); achievement update is
school-scoped. Details: `docs/audits/2026-11-06-write-action-tests.md`.

## Deploy checklist (in this order)

1. Create a restore point on `main`: `git tag pre-release-2026-11`.
2. Apply the release on a branch (`release/2026-11`) and open a Pull Request. Never commit to `main` directly.
3. **Database first:** apply migration `0064` to the hosted Supabase project (it only ADDS a table and a
   function). Without it the app still works (auth rate limiting fails open and logs an error per attempt).
4. Rotate `UNDER_CONSTRUCTION_BYPASS_SECRET` if it was ever sent in a URL; update how you unlock the site
   (see the runbook).
5. Run `npm run test:rls` against a LOCAL Supabase stack before merging (the SQL policies are not covered
   by unit tests).
6. Open the Vercel preview on a real phone, installed as a PWA, in Arabic and English, light and dark and
   your other themes. Check: tab bar and More sheet, circular and maintenance lists, circular detail tabs,
   calendar day agenda, a create form with the sticky save bar, settings users, reports, safe areas on iPhone.
7. Merge the Pull Request, then watch the logs for `rateLimit.consumeSharedRateLimit` errors for a day.

## Rollback

- Code: revert the merge commit (`git revert -m 1 <merge>`), or redeploy the previous Vercel deployment.
- Database (only if needed): `drop function public.consume_rate_limit(text, integer, integer);
drop table public.rate_limit_counters;`

## Behaviour changes to know about

- Acting on a record that does not exist, or belongs to another school, now shows an error instead of a
  silent success.
- The bypass secret can no longer be sent as `?secret=`.
- Prototypes are no longer served at `/prototype_*.html`.

## Known limits

- The old `MobileNav` drawer files remain but are unused.
- Dashboard and tabbed widgets are rendered twice (one copy hidden by CSS).
- Not verified: a real iPhone PWA, hosted-database behaviour of migration 0064 (it was tested on a real
  PostgreSQL 16, not on the full Supabase stack), and themes other than the default and dark.
