import type { GameDepItem } from '../useGameDepList'

type Stats = [likes: number, dislikes: number, views: number]

const dep = (
  name: string, displayName: string, description: string,
  tags: string[], [likes, dislikes, views]: Stats, created: string,
): GameDepItem => ({
  name, displayName, description, tags, likes, dislikes, views, created,
})

export const PLACEHOLDER_DEPS: GameDepItem[] = [
  dep('sdl2', 'SDL2',
    'Simple DirectMedia Layer - a cross-platform development library ' +
    'for low level access to audio, keyboard, mouse, joystick, and ' +
    'graphics hardware.',
    ['graphics', 'audio', 'utility'], [245, 8, 8920], '2023-11-10'),
  dep('opengl-utils', 'OpenGL Utils',
    'A collection of utilities and helpers for OpenGL rendering, ' +
    'including shader compilation, texture loading, and matrix ' +
    'operations.',
    ['graphics', 'math'], [189, 12, 6540], '2024-01-22'),
  dep('game-audio', 'Game Audio Lib',
    'High-performance audio library supporting 3D positional audio, ' +
    'streaming, and multiple format decoding.',
    ['audio'], [134, 5, 4210], '2024-02-15'),
  dep('physics-engine', 'Physics Engine',
    'A lightweight 2D/3D physics engine with rigid body dynamics, ' +
    'collision detection, and constraints.',
    ['physics', 'math'], [201, 14, 7320], '2023-09-05'),
  dep('net-sync', 'NetSync',
    'Real-time networking library for game state synchronization ' +
    'with lag compensation and prediction.',
    ['networking'], [98, 7, 3180], '2024-04-18'),
  dep('math-lib', 'Math Library',
    'Fast SIMD-optimized math library for vectors, matrices, ' +
    'quaternions, and common game math operations.',
    ['math', 'utility'], [167, 3, 5890], '2024-03-02'),
]
