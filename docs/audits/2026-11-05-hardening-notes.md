# Hardening notes (2026-11-05)

Follow-up to an audit of the repository. Each item below is a separate, reviewable change.

## 1. Shared rate limiting for authentication

- **Problem:** login, password-reset and owner-claim limits lived in each serverless instance's memory,
  so they did not hold across instances.
- **Change:** new migration `supabase/migrations/0064_rate_limit_counters.sql` adds a server-only table
  `rate_limit_counters` (RLS on, no policies) and `consume_rate_limit(key, limit, window_seconds)`
  (security definer, executable only by `service_role`). `checkAuthRateLimit` is now async: it checks the
  in-process counter, then the shared counter. Keys are SHA-256 hashed (no IP or e-mail is stored).
- **Failure mode:** if the shared store is unreachable the check fails OPEN after logging; the in-process
  limit and Supabase Auth's own limits still apply.
- **Deploy order:** apply the migration BEFORE (or together with) deploying the app. Without it every auth
  attempt logs an error (it still works, because the check fails open).
- **Rollback:** `drop function public.consume_rate_limit(text, integer, integer); drop table public.rate_limit_counters;`
- **Verified:** the SQL was run on a real PostgreSQL 16: limit counting, window reset, argument validation,
  privileges (anon and authenticated denied, service_role allowed), and 20 simultaneous callers with a
  limit of 5 produced exactly 5 allowed. NOT verified against the full Supabase stack: run `npm run test:rls`.

## 2. Prototypes no longer served publicly

`public/prototype_*.html` moved to `docs/prototypes/` (README links updated). Unused starter SVGs removed
(`globe`, `next`, `vercel`, `window`); `public/file.svg` is kept because `scripts/generate-icons.mjs` writes it.
`experiments/` was left in place (it is not served).

## 3. Bypass secret is no longer accepted in the URL

`/api/bypass` reads the secret only from the `x-bypass-secret` header or a POST JSON body. See
`docs/runbooks/under_construction_bypass.md` for the new way to unlock a browser. Rotate
`UNDER_CONSTRUCTION_BYPASS_SECRET` if it was ever sent in a URL.

## 4. Dependencies

`npm audit fix` (no `--force`), lockfile only. Removed the high-severity advisory and about 40 transitive
dev-tool packages that came in through the shadcn CLI. Remaining advisories are moderate/low and need
breaking upgrades (for example the typescript-eslint chain).

## 5. Errors are no longer swallowed silently

- New `recoverWithFallback(fallback, context)` logs the failure, then returns the fallback. Used only for
  optional data (layout permissions / unread count / backup access, school working days for calendar).
- Data whose absence would be misread as "empty" now reaches the error boundary instead of showing an empty
  list: audit log, circular responses, school departments, circular attachments, calendar circulars.
- Fail-closed permission checks (`hasPermission(...).catch(() => false)`) were left as they are.

## 6. Locale-aware links

Components that built `/${locale}/...` hrefs with plain `next/link` now use `Link` from `@/i18n`. With
`localePrefix: "as-needed"` the old Arabic links (`/ar/...`) cost an extra redirect. `src/app/global-error.tsx`
and `src/app/not-found.tsx` stay on plain `next/link` (they render outside the locale tree).
