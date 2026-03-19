import type { GameDepItem } from '../useGameDepList'
import type { GameDepDetailData } from '../useGameDepDetail'
import type { Revision } from '../useGameDepDetail'

export const DEP_TAGS = [
  'graphics',
  'audio',
  'networking',
  'physics',
  'math',
  'utility',
]

export const PLACEHOLDER_DEPS: GameDepItem[] = [
  {
    name: 'sdl2',
    displayName: 'SDL2',
    description:
      'Simple DirectMedia Layer - a cross-platform development library for low level access to audio, keyboard, mouse, joystick, and graphics hardware.',
    tags: ['graphics', 'audio', 'utility'],
    likes: 245,
    dislikes: 8,
    views: 8920,
    created: '2023-11-10',
  },
  {
    name: 'opengl-utils',
    displayName: 'OpenGL Utils',
    description:
      'A collection of utilities and helpers for OpenGL rendering, including shader compilation, texture loading, and matrix operations.',
    tags: ['graphics', 'math'],
    likes: 189,
    dislikes: 12,
    views: 6540,
    created: '2024-01-22',
  },
  {
    name: 'game-audio',
    displayName: 'Game Audio Lib',
    description:
      'High-performance audio library supporting 3D positional audio, streaming, and multiple format decoding.',
    tags: ['audio'],
    likes: 134,
    dislikes: 5,
    views: 4210,
    created: '2024-02-15',
  },
  {
    name: 'physics-engine',
    displayName: 'Physics Engine',
    description:
      'A lightweight 2D/3D physics engine with rigid body dynamics, collision detection, and constraints.',
    tags: ['physics', 'math'],
    likes: 201,
    dislikes: 14,
    views: 7320,
    created: '2023-09-05',
  },
  {
    name: 'net-sync',
    displayName: 'NetSync',
    description:
      'Real-time networking library for game state synchronization with lag compensation and prediction.',
    tags: ['networking'],
    likes: 98,
    dislikes: 7,
    views: 3180,
    created: '2024-04-18',
  },
  {
    name: 'math-lib',
    displayName: 'Math Library',
    description:
      'Fast SIMD-optimized math library for vectors, matrices, quaternions, and common game math operations.',
    tags: ['math', 'utility'],
    likes: 167,
    dislikes: 3,
    views: 5890,
    created: '2024-03-02',
  },
]

export const PLACEHOLDER_DEP_DETAIL: GameDepDetailData = {
  name: 'sdl2',
  displayName: 'SDL2',
  description:
    'Simple DirectMedia Layer - a cross-platform development library designed to provide low level access to audio, keyboard, mouse, joystick, and graphics hardware via OpenGL and Direct3D. It is used by video playback software, emulators, and popular games.',
  owner: 'libsdl-org',
  created: '2023-11-10',
  views: 8920,
  likes: 245,
  dislikes: 8,
  tags: ['graphics', 'audio', 'utility', 'cross-platform'],
  revisions: [
    { version: '2.26.0', published: true, date: '2023-11-10' },
    { version: '2.28.0', published: true, date: '2024-02-14' },
    { version: '2.28.5', published: true, date: '2024-06-20' },
    { version: '2.30.0-rc1', published: false, date: '2024-09-01' },
  ],
  binaries: [
    { os: 'Windows', arch: 'x64', size: '12 MB', url: '#' },
    { os: 'Windows', arch: 'x86', size: '11 MB', url: '#' },
    { os: 'Linux', arch: 'x64', size: '10 MB', url: '#' },
    { os: 'Linux', arch: 'arm64', size: '9 MB', url: '#' },
    { os: 'macOS', arch: 'arm64', size: '11 MB', url: '#' },
    { os: 'macOS', arch: 'x64', size: '11 MB', url: '#' },
  ],
  dependencies: [
    { name: 'math-lib', displayName: 'Math Library', version: '1.2.0' },
  ],
  screenshots: Array.from({ length: 4 }, (_, i) => ({
    id: `dep-ss-${i + 1}`,
    src: `https://picsum.photos/seed/dep${i + 1}/600/400`,
    title: `Screenshot ${i + 1}`,
  })),
}

export const DEP_EDIT_REVISIONS: Revision[] = [
  { version: '2.26.0', published: true, date: '2023-11-10' },
  { version: '2.28.0', published: true, date: '2024-02-14' },
  { version: '2.28.5', published: true, date: '2024-06-20' },
  { version: '2.30.0-rc1', published: false, date: '2024-09-01' },
]
