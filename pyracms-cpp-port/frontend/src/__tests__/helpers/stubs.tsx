import type { ReactNode } from 'react'

/** Empty placeholder for a heavy child component. */
export function Stub() {
  return <i />
}

/** Placeholder exposing a test id. */
export function StatsStub() {
  return <i data-testid="stats" />
}

/** JSON-LD placeholder. */
export function LdStub() {
  return <i data-testid="ld" />
}

/** Renders its children untouched (wrapper components). */
export function Passthrough({ children }: { children: ReactNode }) {
  return <>{children}</>
}

/** Admin shell placeholder. */
export function ShellStub({ children }: { children: ReactNode }) {
  return <div data-testid="shell">{children}</div>
}
