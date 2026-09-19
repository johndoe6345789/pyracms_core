export function initialOf(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase()
}

export function gradientFor(name: string): string {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360
  return (
    `linear-gradient(135deg, hsl(${h} 55% 28%), ` +
    `hsl(${(h + 50) % 360} 60% 14%))`
  )
}
