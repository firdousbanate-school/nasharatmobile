# Task: Apply Release 2026-11 (phone UI + security hardening + write-action tests) and open ONE Pull Request

You are working in my local clone of the Nasharat Mobile (Next.js 16, Supabase, next-intl, Vercel). I use Windows 11 and VS Code, so use PowerShell-compatible commands. Report after every step.

## Input

`release-2026-11.patch`: one git diff made against my latest repo files (look in Downloads and the project folder; if you cannot find it, ask me). Do NOT use any other patch file; this one contains everything.

## What it contains (so you can check scope)

- **Phone UI:** about 50 new and 50+ modified files under `src/components/**` (mobile, layout, circulars, maintenance, calendar, dashboard, reports, settings, rbac, ui/page-header), a few `src/app/[locale]/(app)/**` pages, `src/messages/{en,ar}.json` (added keys only), `src/app/globals.css`, `src/app/[locale]/layout.tsx` (viewport only), `playwright.config.ts`, `tests/e2e/mobile.spec.ts`, `.agent/skills/mobile-pwa-ui/`, `docs/mobile-ui.md`.
- **Security:** migration `supabase/migrations/0064_rate_limit_counters.sql`, `src/lib/rateLimit/consumeSharedRateLimit.ts`, async `checkAuthRateLimit` (login, password-reset, owner-claim), `/api/bypass` no longer takes the secret in the URL, prototypes moved from `public/` to `docs/prototypes/`, `package-lock.json`, `src/lib/errors/recoverWithFallback.ts`, locale-aware links in ten components.
- **Tests and fixes:** about 29 new test files, `src/test-utils/createQueryChain.ts`, and small source fixes (role permission sync, zero-row updates reporting "not found", achievement school scoping).
- **Docs:** `docs/RELEASE_2026-11.md` (the deploy checklist and rollback), runbook, audit notes, two appended rules (#16 git safety, #17 phone UI) in `AGENTS.md`, one appended entry in `docs/decisions.md`.

## Rules (non-negotiable)

1. Read `AGENTS.md` first and obey all of it, including Rule #14 (completion report with statuses VERIFIED / TESTED - PASSED / TESTED - FAILED / NOT VERIFIED / BLOCKED).
2. Never commit or push to `main`. Work on `release/2026-11`.
3. Forbidden without my explicit written approval: `git push --force`, `git reset --hard`, `git clean`, `git rebase`, deleting branches or tags, editing `.git/`, `npm audit fix --force`, adding or upgrading dependencies.
4. Never read, print or commit `.env*` or secrets. **Never run the migration or any command against my production or hosted Supabase project.** Use only the LOCAL Supabase stack.
5. Do not weaken or delete any test, lint rule or type check to make something pass. If something fails, show the real error and stop.
6. Do not reformat unrelated files; never run `prettier --write` on the whole repo.
7. Never claim a check passed unless you ran it and saw the result. Reply in English only. Ask me before every step marked **[ASK ME]**.

## Steps

1. **Pre-flight (read only):** `git status`, `git branch --show-current`, `git remote -v`, `git log --oneline -5`, `node -v`, `npm -v`, `gh --version`. If there are uncommitted changes you did not make, stop and ask.
2. **Restore point and branch:** `git fetch origin`; `git tag pre-release-2026-11` (ask if it exists); `git checkout -b release/2026-11`.
3. **Apply:** `git apply --check release-2026-11.patch` (must print nothing; on conflicts stop and show me), then `git apply release-2026-11.patch`. Show `git diff --stat`. Expect about 86 added, 95 modified, 4 deleted and 2 renamed files. **[ASK ME]** if the change set touches `src/app/api/**` other than the bypass tests, auth/RBAC logic beyond what is listed above, `vercel.json` or CI.
4. **Install and verify (show real results):** `npm ci`; `npm run typecheck`; `npm run lint`; `npm run test` (if slow, in parts: `npx vitest run src/actions src/messages src/proxy.test.ts`, `npx vitest run src/lib`, `npx vitest run src/components src/app`; expect 261 files and 936 tests passing); `npm run scan:secrets`; `npm audit --omit=dev` (expect 0 vulnerabilities); `npm run build` (needs my local env; if it fails only because Google Fonts are unreachable, mark NOT VERIFIED); and `npx prettier --check` on the files in `git diff --name-only`.
5. **Local database check (LOCAL stack only; ask before `supabase start`):** `supabase db reset` (local), then `npm run test:rls`, and these SQL checks: `select public.consume_rate_limit('t', 3, 60);` four times as `service_role` returns true, true, true, false; the same call as `anon` and as `authenticated` is "permission denied"; `select * from public.rate_limit_counters` as `authenticated` is "permission denied". Report real output.
6. **Phone and desktop journeys (local stack):** `npx playwright install chromium` if needed, then `npx playwright test --project=chromium` (existing desktop journeys, must still pass) and `npx playwright test tests/e2e/mobile.spec.ts --project=mobile-pixel7 --project=mobile-small`. If you have a browser tool, open the app at 390x844 and 360x640 in Arabic and English and screenshot: login, dashboard, circulars list and detail, maintenance, calendar, reports, settings/users, the More sheet. Report anything that overflows sideways, hides behind the bottom tab bar, or breaks in RTL. Do not change code for visual issues without telling me what and why first.
7. **Commit** (`release: phone UI, security hardening and write-action tests (2026-11)`), after `git status` shows only expected files (no `.env*`, screenshots, `test-results/`, `playwright-report/`, `.next*`).
8. **[ASK ME]** before pushing, then `git push -u origin release/2026-11` and `git push origin pre-release-2026-11` (never `--force`). Open the PR (`gh pr create --base main --head release/2026-11`, or give me the compare URL). The PR body must be the contents of `docs/RELEASE_2026-11.md` plus your test results with statuses. State clearly: **apply migration 0064 to the hosted database BEFORE or WITH the deploy** (otherwise each login attempt logs an error but still works), rotate `UNDER_CONSTRUCTION_BYPASS_SECRET` if it was ever sent in a URL, and the rollback steps. Do not merge or deploy; give me the Vercel preview link.

## Final report (Rule #14 format)

Findings, root cause (if anything failed), changes made (commit hash, file counts), functionality preserved, security impact, tests executed (exact commands and real results), unverified items, remaining risks. End with the PR link, the Vercel preview link, and what I should check by hand on my phone as an installed PWA (tab bar, More sheet, lists, detail tabs, calendar day agenda, a form with the sticky save bar, reports, settings, Arabic RTL, dark mode and my other themes). If you are unsure at any step, stop and ask me.
