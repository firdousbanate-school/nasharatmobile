# Write-action tests and the defects they exposed (2026-11-06)

Every server action under `src/actions` (48 `*Action.ts` files) is now referenced by a test. The tests
assert the contract that protects data: the permission guard runs first and a refusal performs no
write; invalid input performs no write; successful writes are scoped to the caller's school; database
failures are reported (never as success); pages are refreshed only after a successful write.

`src/test-utils/createQueryChain.ts` is a small fake of Supabase's chained query builder that records
every call, so tests can assert exactly what was written and for which school.

## Defects found while writing the tests (fixed in this change)

1. **Role permissions could be wiped by a failed update.** `syncRolePermissions` deleted all of a role's
   permissions and then inserted the new set; an unknown permission key (foreign-key violation) left the
   role with none. It now adds missing permissions first and removes dropped ones afterwards, so a failed
   insert changes nothing. A failed delete leaves old plus new permissions and can be retried safely.
2. **"Success" when nothing changed.** These scoped updates reported success when no row matched (unknown
   id, or a row of another school): calendar publish / cancel / archive, circular publish, department and
   location update and toggle, achievement update and delete. They now confirm a row was affected and
   report "not found" otherwise.
3. **Achievement update was not school-scoped in code.** `updateAchievementRecord` filtered by id only
   (row-level security still applied). It now also filters by the caller's school, like delete.

## Behaviour change to be aware of

Acting on a record that does not exist, or belongs to another school, now returns an error instead of a
silent success. A UI flow that relied on that silent success would now show the error.

## Observations (not changed)

- `addMaintenanceNoteAction` loads the ticket by id and reads its `school_id` but does not compare it with
  the caller's school; row-level security scopes the read. A comparison would be defence in depth, but it
  may affect a platform owner supporting several schools, so it needs a product decision.
- `deleteCircularAction` / `deleteCircularAttachmentAction` delete by id and rely on row-level security
  for school scoping (circular publish and most other writes also filter by school in code).
- Not covered: the SQL policies themselves. Run `npm run test:rls` against a local Supabase stack.
