export type QueryCall = [method: string, ...args: unknown[]];

/**
 * Test helper: a fake Supabase query builder. Every chained method (`select`, `eq`, `update`...)
 * is recorded in `calls` and returns the same chain; awaiting the chain (or `.maybeSingle()` /
 * `.single()`) resolves to `result`. Lets tests assert what was written and for which school.
 */
export function createQueryChain(
  result: { data?: unknown; error?: unknown; count?: number | null } = {},
) {
  const resolved = { data: null, error: null, count: null, ...result };
  const calls: QueryCall[] = [];
  const chain: unknown = new Proxy(
    {},
    {
      get(_target, property: string) {
        if (property === "then") {
          return (resolve: (value: unknown) => unknown) => resolve(resolved);
        }
        return (...args: unknown[]) => {
          calls.push([property, ...args]);
          return chain;
        };
      },
    },
  );
  return { chain, calls };
}
