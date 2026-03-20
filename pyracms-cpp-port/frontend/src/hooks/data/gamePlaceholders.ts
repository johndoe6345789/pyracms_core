import type { GameDepItem } from '../useGameDepList'
import type { GameDepDetailData } from '../useGameDepDetail'
import type { Revision } from '../useGameDepDetail'

export const GAME_TAGS = [
  'action',
  'puzzle',
  'rpg',
  'strategy',
  'simulation',
  'platformer',
]

export const PLACEHOLDER_GAMES: GameDepItem[] = [
  {
    name: 'space-blaster',
    displayName: 'Space Blaster',
    description:
      'A fast-paced space shooter with procedurally generated levels and power-ups.',
    tags: ['action', 'shooter'],
    likes: 128,
    dislikes: 12,
    views: 3420,
    created: '2024-06-15',
  },
  {
    name: 'puzzle-quest',
    displayName: 'Puzzle Quest',
    description:
      'Solve increasingly complex puzzles across 50 handcrafted levels.',
    tags: ['puzzle', 'strategy'],
    likes: 96,
    dislikes: 5,
    views: 2180,
    created: '2024-08-22',
  },
  {
    name: 'dungeon-crawl',
    displayName: 'Dungeon Crawl',
    description:
      'Explore procedurally generated dungeons with turn-based combat and loot.',
    tags: ['rpg', 'action'],
    likes: 214,
    dislikes: 18,
    views: 5640,
    created: '2024-03-10',
  },
  {
    name: 'tower-defense-pro',
    displayName: 'Tower Defense Pro',
    description:
      'Build and upgrade towers to defend against waves of enemies.',
    tags: ['strategy', 'simulation'],
    likes: 75,
    dislikes: 8,
    views: 1890,
    created: '2024-09-01',
  },
  {
    name: 'pixel-platformer',
    displayName: 'Pixel Platformer',
    description:
      'A retro-style platformer with tight controls and challenging levels.',
    tags: ['platformer', 'action'],
    likes: 167,
    dislikes: 14,
    views: 4200,
    created: '2024-05-18',
  },
  {
    name: 'city-builder',
    displayName: 'City Builder',
    description:
      'Design and manage your own city with realistic economy and traffic simulation.',
    tags: ['simulation', 'strategy'],
    likes: 89,
    dislikes: 7,
    views: 2560,
    created: '2024-07-30',
  },
]

export const PLACEHOLDER_GAME_DETAIL: GameDepDetailData = {
  name: 'space-blaster',
  displayName: 'Space Blaster',
  description:
    'A fast-paced space shooter with procedurally generated levels and power-ups. Features multiplayer co-op mode, leaderboards, and custom ship designs. Built with a custom C++ engine.',
  owner: 'johndoe',
  created: '2024-06-15',
  views: 3420,
  likes: 128,
  dislikes: 12,
  tags: ['action', 'shooter', 'multiplayer', 'sci-fi'],
  revisions: [
    { version: '1.0.0', published: true, date: '2024-06-15' },
    { version: '1.1.0', published: true, date: '2024-07-20' },
    { version: '1.2.0-beta', published: false, date: '2024-08-10' },
  ],
  binaries: [
    { os: 'Windows', arch: 'x64', size: '45 MB', url: '#' },
    { os: 'Windows', arch: 'x86', size: '42 MB', url: '#' },
    { os: 'Linux', arch: 'x64', size: '40 MB', url: '#' },
    { os: 'macOS', arch: 'arm64', size: '43 MB', url: '#' },
    { os: 'macOS', arch: 'x64', size: '44 MB', url: '#' },
  ],
  dependencies: [
    { name: 'sdl2', displayName: 'SDL2', version: '2.28.5' },
    { name: 'opengl-utils', displayName: 'OpenGL Utils', version: '4.6.0' },
    { name: 'game-audio', displayName: 'Game Audio Lib', version: '1.3.2' },
  ],
  screenshots: Array.from({ length: 6 }, (_, i) => ({
    id: `ss-${i + 1}`,
    src: `https://picsum.photos/seed/game${i + 1}/600/400`,
    title: `Screenshot ${i + 1}`,
  })),
}

export const GAME_EDIT_REVISIONS: Revision[] = [
  { version: '1.0.0', published: true, date: '2024-06-15' },
  { version: '1.1.0', published: true, date: '2024-07-20' },
  { version: '1.2.0-beta', published: false, date: '2024-08-10' },
]
