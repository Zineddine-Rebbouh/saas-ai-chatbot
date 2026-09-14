/**
 * `cache` ships with the React "react-server" build that Next.js 14 uses for
 * Server Components and Server Actions, but @types/react 18 does not declare
 * it (it only exists in @types/react/canary). Declaring it here keeps the
 * call sites fully typed instead of reaching for `any` or pulling in the whole
 * canary type surface.
 *
 * Signature mirrors @types/react/canary:
 *   export function cache<CachedFunction extends Function>(fn: CachedFunction): CachedFunction;
 */
import 'react'

declare module 'react' {
  export function cache<T extends (...args: never[]) => unknown>(fn: T): T
}
