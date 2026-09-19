import type { GameDepItem } from '../useGameDepList'

type Stats = [likes: number, dislikes: number, views: number]

const game = (
  name: string, displayName: string, description: string,
  tags: string[], [likes, dislikes, views]: Stats, created: string,
): GameDepItem => ({
  name, displayName, description, tags, likes, dislikes, views, created,
})

export const PLACEHOLDER_GAMES: GameDepItem[] = [
  game('space-blaster', 'Space Blaster',
    'A fast-paced space shooter with procedurally generated levels ' +
    'and power-ups.',
    ['action', 'shooter'], [128, 12, 3420], '2024-06-15'),
  game('puzzle-quest', 'Puzzle Quest',
    'Solve increasingly complex puzzles across 50 handcrafted levels.',
    ['puzzle', 'strategy'], [96, 5, 2180], '2024-08-22'),
  game('dungeon-crawl', 'Dungeon Crawl',
    'Explore procedurally generated dungeons with turn-based combat ' +
    'and loot.',
    ['rpg', 'action'], [214, 18, 5640], '2024-03-10'),
  game('tower-defense-pro', 'Tower Defense Pro',
    'Build and upgrade towers to defend against waves of enemies.',
    ['strategy', 'simulation'], [75, 8, 1890], '2024-09-01'),
  game('pixel-platformer', 'Pixel Platformer',
    'A retro-style platformer with tight controls and challenging ' +
    'levels.',
    ['platformer', 'action'], [167, 14, 4200], '2024-05-18'),
  game('city-builder', 'City Builder',
    'Design and manage your own city with realistic economy and ' +
    'traffic simulation.',
    ['simulation', 'strategy'], [89, 7, 2560], '2024-07-30'),
]
