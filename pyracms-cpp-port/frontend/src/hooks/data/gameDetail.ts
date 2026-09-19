import type { GameDepDetailData, Revision } from '../useGameDepDetail'

const GAME_EDIT_REVISIONS: Revision[] = [
  { version: '1.0.0', published: true, date: '2024-06-15' },
  { version: '1.1.0', published: true, date: '2024-07-20' },
  { version: '1.2.0-beta', published: false, date: '2024-08-10' },
]

export const PLACEHOLDER_GAME_DETAIL: GameDepDetailData = {
  name: 'space-blaster',
  displayName: 'Space Blaster',
  description:
    'A fast-paced space shooter with procedurally generated levels ' +
    'and power-ups. Features multiplayer co-op mode, leaderboards, ' +
    'and custom ship designs. Built with a custom C++ engine.',
  owner: 'johndoe',
  created: '2024-06-15',
  views: 3420,
  likes: 128,
  dislikes: 12,
  tags: ['action', 'shooter', 'multiplayer', 'sci-fi'],
  revisions: GAME_EDIT_REVISIONS,
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
