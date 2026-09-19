export interface Level {
  name: string
  min: number
  max: number
  color: string
}

const LEVELS: Level[] = [
  { name: 'Newcomer', min: 0, max: 50, color: '#9e9e9e' },
  { name: 'Member', min: 50, max: 200, color: '#8d6e63' },
  { name: 'Active', min: 200, max: 500, color: '#43a047' },
  { name: 'Trusted', min: 500, max: 1000, color: '#1976d2' },
  { name: 'Expert', min: 1000, max: 2500, color: '#7b1fa2' },
  { name: 'Master', min: 2500, max: 5000, color: '#f57c00' },
  { name: 'Legend', min: 5000, max: 10000, color: '#FFD700' },
]

export function getLevel(points: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    const level = LEVELS[i]
    if (level && points >= level.min) return level
  }
  return LEVELS[0]!
}

export function getProgress(points: number): number {
  const level = getLevel(points)
  const range = level.max - level.min
  return Math.min(((points - level.min) / range) * 100, 100)
}

export function getNextLevel(points: number): Level | null {
  const idx = LEVELS.findIndex(
    (l) => l.min <= points && points < l.max)
  if (idx >= 0 && idx < LEVELS.length - 1) return LEVELS[idx + 1] ?? null
  return null
}
