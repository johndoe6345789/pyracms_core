import { OUTSIDE_GROUP, type MenuTarget } from './menuTargets'

const same = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase()

/** Options that match what was typed (title or route), best first; a typed
 * outside link or path is offered as itself so it can be picked. */
export function matchTargets(all: MenuTarget[], typed: string): MenuTarget[] {
  const q = typed.trim().toLowerCase()
  if (!q) return all
  const hits = all
    .filter((t) => `${t.label} ${t.value}`.toLowerCase().includes(q))
    .sort(
      (a, b) =>
        Number(b.label.toLowerCase().startsWith(q)) -
        Number(a.label.toLowerCase().startsWith(q)),
    )
  const custom =
    /^(https?:\/\/|mailto:)/i.test(q) || q.startsWith('/')
      ? all.some((t) => same(t.value, typed))
        ? []
        : [{ value: typed.trim(), label: typed.trim(), group: OUTSIDE_GROUP }]
      : []
  return [...hits, ...custom]
}

/** A friendly name for a stored route, else the route itself. */
export function targetTitle(all: MenuTarget[], route: string): string {
  return all.find((t) => same(t.value, route))?.label ?? route
}

/** What the visitor's browser will open, for the "Opens:" helper text. */
export function opensText(slug: string, route: string): string {
  const r = route.trim()
  if (!r) return ''
  if (/^(https?:\/\/|mailto:)/i.test(r)) return `Opens ${r} (outside your site)`
  return `Opens /site/${slug}${r === '/' ? '' : r}`
}
