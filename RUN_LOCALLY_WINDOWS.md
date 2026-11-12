# Run everything locally on Windows 11 (PowerShell)

## 0. Install once

| Tool | Why | Install |
|---|---|---|
| Node.js 24+ and npm 10+ | the app requires it (README) | nodejs.org, then `node -v` |
| Git | patches, branches | git-scm.com |
| Docker Desktop (WSL2 backend) | runs the LOCAL Supabase stack | docker.com, start it and wait until it says "running" |
| Supabase CLI | `supabase start`, and `npm run test:rls` calls it | `scoop bucket add supabase https://github.com/supabase/scoop-bucket.git` then `scoop install supabase` |

Do not add the Supabase CLI to `package.json`; install it with Scoop so the project's dependencies stay unchanged.

## 1. Get the code and apply the release (on a branch, never on main)

```powershell
cd path\to\School-Administration-Portal
git status                      # must be clean
git tag pre-release-2026-11
git checkout -b release/2026-11
git apply --check ..\release-2026-11.patch   # must print nothing
git apply ..\release-2026-11.patch
npm ci
```

If `git apply --check` complains about line endings, run `git config core.autocrlf false`, re-checkout the
files (`git checkout -- .`) and try again. The repo already forces LF through `.gitattributes`.

## 2. Start the LOCAL database (not your hosted project)

```powershell
supabase start            # first run downloads images (several GB), then prints local URLs and keys
supabase db reset         # applies ALL migrations to the local database, including 0064
npm run seed:local        # optional: demo data and the four demo accounts (see 3b)
                          # run it AFTER npm run test:rls (the RLS suite asserts exact counts)
supabase status -o env    # shows API_URL, ANON_KEY, SERVICE_ROLE_KEY for the local stack
```

Local ports: API 54321, database 54322, Studio (a web UI for the local database) 54323.

## 3. Point the app at the local database

**Your `.env.local` points at the hosted production project.** Do not use it for destructive testing. Put the
local values in `.env.development.local` instead; Next.js loads it before `.env.local` when you run
`npm run dev`, so production credentials are overridden and your `.env.local` stays untouched.

```powershell
# values come from: supabase status -o env
@"
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY from supabase status>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY from supabase status>
SCHOOL_TIMEZONE=Asia/Kuwait
APP_URL=http://localhost:3000
"@ | Set-Content .env.development.local
```

`.env.development.local` is ignored by the project's `.env*` rule in `.gitignore`; confirm with `git status` that it
does not appear, and never commit it.

## 3b. Sign in (demo accounts from `npm run seed:local`)

Every demo account uses the password `LocalDev123!` (local only):

| Email | Role | Good for testing |
|---|---|---|
| `owner@local.test` | platform owner | everything, language/theme switchers, Backup, Achievements |
| `admin@local.test` | school admin | settings, reports, documents |
| `head@local.test` | department head (Science) | circular responses |
| `staff@local.test` | staff (Arabic) | the most restricted phone view (no Reports/Settings in More) |

Without the seed you would create the first owner yourself through the "claim owner" flow, which needs
`PLATFORM_BOOTSTRAP_SECRET` and/or `PLATFORM_OWNER_EMAIL` in your env (see `.env.example`).

## 4. Run the app

```powershell
npm run dev
```

- Arabic (default): http://localhost:3000
- English: http://localhost:3000/en

## 5. See the phone UI

Chrome or Edge: press F12, then Ctrl+Shift+M (device toolbar), choose "iPhone 14" or 390x844, and try 360x640.
Switch language with the owner's language button (in the More sheet on phones). Try the themes too.

Installing it as a PWA and the iPhone safe-area check need HTTPS, so use the Vercel preview URL on the phone for
that (a phone on your Wi-Fi reaching `http://192.168...` cannot install a PWA, and `127.0.0.1` in the browser
bundle would point at the phone itself).

## 6. Run all the checks

```powershell
npm run typecheck
npm run lint
npm run test                 # may take a few minutes; or in parts:
npx vitest run src/actions src/messages src/proxy.test.ts
npx vitest run src/lib
npx vitest run src/components src/app
npm run scan:secrets
npm run build                # needs internet for Google Fonts
npm run test:rls             # local Supabase must be running and UNSEEDED (run supabase db reset first if you seeded);
                             # it refuses non-local hosts by design
npx playwright install chromium
npm run test:e2e             # builds and serves on port 3100 against the LOCAL stack, seeds and cleans its own users
```

The phone journeys are `npx playwright test tests/e2e/mobile.spec.ts --project=mobile-pixel7 --project=mobile-small`.

## 7. Check the new database function (migration 0064)

In Studio (http://127.0.0.1:54323) open "SQL Editor" and run, as the default (service) role:

```sql
select public.consume_rate_limit('t', 3, 60);  -- run it 4 times: true, true, true, false
```

Calling it as `anon` or `authenticated` must say "permission denied" (the automated suite does not cover this;
`npm run test:rls` covers the policies).

## 8. Stop and clean up

```powershell
supabase stop          # stops the containers, keeps data
supabase stop --no-backup   # also discards local data
```

## Common problems

- `supabase: command not found`: open a NEW PowerShell window after installing with Scoop.
- `Cannot connect to the Docker daemon`: start Docker Desktop and wait for "running".
- Port already in use (3000, 3100, 54321): close the other app, or `npm run dev -- -p 3001`.
- Build fails downloading fonts: you are offline or behind a proxy.
- Login works but data is empty: you are pointed at the wrong database; compare `NEXT_PUBLIC_SUPABASE_URL`.
