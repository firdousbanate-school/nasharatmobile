# Release 2026-11: start here

This bundle contains everything you need and nothing else.

| File                             | What it is                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `release-2026-11.patch`          | The whole release as one git patch (phone UI, security hardening, tests). Made against your `School-Administration-Portal-LAST.zip` files. |
| `gemini-apply-release-prompt.md` | Paste this into Gemini (Antigravity). It applies the patch on a branch, runs every check, and opens ONE Pull Request.                      |
| `RUN_LOCALLY_WINDOWS.md`         | How to run and test everything on localhost on Windows 11 (PowerShell).                                                                    |
| `reference/`                     | Screenshots of the phone UI for comparison (4 images). Optional.                                                                           |
| `optional-full-project/`         | The complete updated project as a zip. Only for Path B below.                                                                              |
| `SHA256SUMS.txt`                 | Checksums, to confirm nothing was corrupted in download.                                                                                   |

## Path A (recommended): patch + Gemini

1. Unzip this bundle next to your project folder.
2. In Gemini, paste `gemini-apply-release-prompt.md` and let it run (it asks before pushing).
3. Follow the deploy checklist in `docs/RELEASE_2026-11.md` (inside the repo after the patch):
   apply migration `0064` to the hosted database first, test on a real phone with the Vercel preview, then merge.

Or by hand (PowerShell, inside your project folder, working tree clean):

```powershell
git tag pre-release-2026-11
git checkout -b release/2026-11
git apply --check ..\release-2026-11.patch
git apply ..\release-2026-11.patch
```

## Path B (alternative): copy the full project

Use only if you cannot apply the patch. Do this on a NEW branch, never on `main`:

1. `git checkout -b release/2026-11`
2. Unzip `optional-full-project\School-Administration-Portal-release-2026-11.zip` and copy its contents over
   your project, replacing files. Keep your own `.env*` files, `node_modules` and `.git` (the zip has none of them).
3. Copying does not delete files. Delete these 4 by hand (unused starter images):
   `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`.
   And delete the 2 old copies of the prototypes (they now live in `docs/prototypes/`):
   `public/prototype_creative_ux.html`, `public/prototype_human_creative_v2.html`.
4. `git status` to review, then `npm ci` and run the checks (see `RUN_LOCALLY_WINDOWS.md`).

## Do NOT use

Older patches, older Gemini prompts, or any standalone `AGENTS.md` or `SKILL.md` from earlier in the conversation.
The release already carries the right ones: your own `AGENTS.md` is kept and only two rules are appended, and the
skill is installed at `.agent/skills/mobile-pwa-ui/`.

## Not verified (please check yourself)

A real iPhone PWA, your real data, themes other than default and dark, `npm run test:rls` and the Playwright journeys
against your local Supabase stack, and migration 0064 on the full Supabase stack.
