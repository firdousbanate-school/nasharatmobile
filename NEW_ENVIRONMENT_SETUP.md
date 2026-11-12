# New accounts: GitHub repo + Vercel project + Supabase project

Based on what is actually in your code (env template, `vercel.json`, `next.config.mjs`, migrations, CI).
Dashboard menu names change over time; if a label differs, search for the setting name.

## Order

1. Supabase project (database first). 2. GitHub repo. 3. Vercel project. 4. First owner. 5. Smoke test.

## 1. Supabase (new project)

- **Region:** pick the one closest to your users and remember it; set the Vercel function region next to it.
- **Postgres version:** your `supabase/config.toml` uses 17; new projects default to a current version, which is fine.
- **Apply the database from your migrations (not by hand):**
  ```powershell
  supabase login
  supabase link --project-ref <your-new-project-ref>
  supabase db push          # applies 0001 ... 0064: tables, RLS, functions and both storage buckets
  ```
  Never run `seed.sql` against it (your config says it is local only) and never run `npm run test:rls` against it.
- **Keys (Project Settings, API):** your `.env.example` expects the new key style. `NEXT_PUBLIC_SUPABASE_ANON_KEY` takes the
  publishable key (`sb_publishable_...`); `SUPABASE_SERVICE_ROLE_KEY` takes the secret key (`sb_secret_...`).
  The secret key is server only; never paste it into chat, a screenshot or a `NEXT_PUBLIC_` variable.
- **Auth settings (important, defaults are not safe for this app):**
  - **Turn OFF "Allow new users to sign up".** Your local config has sign-ups disabled; a new hosted project has them
    ON by default. Users are created by admins through the server, which still works with sign-ups off.
  - **URL Configuration:** Site URL = your production URL; Redirect URLs = production URL, `http://localhost:3000`, and the
    Vercel preview pattern (for example `https://*-<your-team>.vercel.app/**`). `APP_URL` must match the Site URL.
  - **Custom SMTP** (Auth, Emails): the built-in email sender is very rate limited, so password-reset emails will fail
    or be delayed for a real school. Use a provider (Resend, Postmark, SES...) and Arabic email templates.
  - Password policy: raise the minimum length; keep email confirmation on for anything but admin-created users.
- **Storage:** the migrations create `circular-attachments` and `school-documents` (private). Check both exist.
- **Backups:** daily backups and point-in-time recovery depend on your plan. The free plan also pauses a project after about
  a week of inactivity (your `/api/keepalive` cron every 3 days helps, and needs `CRON_SECRET`). For real school data use
  a paid plan and also schedule the app's own Backup export (Settings, Backup) as a second copy.
- **Staging:** consider a SECOND Supabase project for Vercel Preview deployments, so previews never touch production data.
- **Your old data:** a new project is empty. If the old one has real data, use the app's backup export and restore
  (it reports created auth users); rehearse it on the staging project first.

## 2. GitHub (new repo)

- Private repo. Push the release as the first commit (history from the old repo does not carry over; keep the old repo
  archived if you need it). Before pushing: `npm run scan:secrets` and `git status` (no `.env*`).
- **Branch protection on `main`:** require a Pull Request and the CI checks, block force-push and deletion.
- Turn on secret scanning with push protection, Dependabot alerts and security updates. Add `.github/dependabot.yml`
  (there is none) for weekly npm and GitHub Actions updates.
- **CI needs no secrets:** your `ci.yml` builds against a throwaway local Supabase inside the runner (Node 24).
  It should work unchanged in the new repo.
- Enable 2-step verification on the new account and keep the recovery codes.

## 3. Vercel (new project)

- Import the repo; framework Next.js. **Set Node.js version to 24.x** (Project Settings, General); `package.json` requires it.
- **Region:** Project Settings, Functions: choose the region nearest your Supabase region.
- **Environment variables** (mark secrets as Sensitive; set them per environment):

| Variable                                                  | Production                                                               | Preview                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`                                | prod project                                                             | staging project (or same, if you accept the risk)                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                           | prod publishable key                                                     | staging key                                                        |
| `SUPABASE_SERVICE_ROLE_KEY`                               | prod secret key                                                          | staging secret key                                                 |
| `SCHOOL_TIMEZONE`                                         | e.g. `Asia/Kuwait`                                                       | same                                                               |
| `APP_URL`                                                 | final URL, no trailing slash                                             | leave unset or use the staging URL (auth emails are built from it) |
| `PLATFORM_BOOTSTRAP_SECRET` and/or `PLATFORM_OWNER_EMAIL` | needed only until the first owner exists                                 | optional                                                           |
| `CRON_SECRET`                                             | long random value; Vercel sends it to the cron as a Bearer token         | not needed                                                         |
| `HEALTH_CHECK_SECRET`                                     | long random value                                                        | optional                                                           |
| `ERROR_REPORTING_URL` / `_TOKEN`                          | optional Sentry-style endpoint, otherwise errors are only in Vercel logs | optional                                                           |

Do not bother with `DISABLE_UNDER_CONSTRUCTION` or `UNDER_CONSTRUCTION_BYPASS_SECRET`: in your code
`isUnderConstruction()` always returns false ("cancelled"), so those settings do nothing.

- **Deployment Protection:** keep "Vercel Authentication" on for Preview deployments so previews are not public.
- **Plan:** Vercel's free (Hobby) plan is for non-commercial use; check their terms for a school deployment.
  Your cron (every 3 days) fits the free limits.
- **Custom domain:** add it, then update `APP_URL`, Supabase Site URL and redirect URLs together.
- **HSTS:** `next.config.mjs` sends `max-age=63072000; includeSubDomains; preload`. That is strict and very sticky on a new
  domain; if any subdomain might not have HTTPS, drop `preload` until you are sure.

## 4. First owner

Your admin guide says the first user is created in Supabase and then claims the owner role from `/dashboard`.
Because sign-ups are off, create that user in Supabase (Authentication, Users, Add user, auto-confirm), set
`PLATFORM_OWNER_EMAIL` (and/or `PLATFORM_BOOTSTRAP_SECRET`) in Vercel, redeploy, sign in and claim. After an owner exists, remove
those two variables.

## 5. Smoke test (production URL, on a real phone too)

`/api/health` returns ok; sign in; claim owner; fill the school profile; create a department and a user (password reset email
arrives); create a circular with an attachment (checks Storage); open the More sheet and the lists on the phone; install the PWA
(HTTPS needed); call `/api/keepalive` once with `Authorization: Bearer <CRON_SECRET>`; run a Backup export.

## Small code suggestions for the new setup (I can make these as a patch)

1. **Hard-coded school link:** `src/components/public/PublicInstagramLink.tsx` defaults to the old school's Instagram
   (`alfirdous_sc`) and it appears in the header for every user. Make it a setting or remove it. Same for `KuwaitMoeLink`
   if the new school is elsewhere.
2. **Manifest:** `public/manifest.json` has `"orientation": "portrait-primary"`, which also forces tablets and installed
   desktop apps into portrait. Use `"any"` if tablets matter. Update `name`, `short_name` and icons
   (`scripts/generate-icons.mjs`) for the new school.
3. **Vestigial under-construction feature:** the bypass route and its env vars do nothing while the feature is cancelled;
   removing them shrinks the attack surface (and `docs/audits/PRODUCTION_READINESS.md` is stale about it).
4. Cosmetic: `package.json` name and `supabase/config.toml` `project_id`.

## New-account hygiene

Two-step verification on GitHub, Vercel and Supabase; secrets only in the Vercel and Supabase dashboards and a password
manager (never in the repo, chat or screenshots); rotate any key that was ever shared; use a team or organization account
so the project is not tied to one person.
