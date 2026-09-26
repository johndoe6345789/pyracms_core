import { preset } from './presetTypes'

// [primary, secondary, background, text], [font, corner radius, spacing]
export const BOLD_PRESETS = [
  preset(
    'Midnight Oil',
    'Deep navy with a lamp-light glow',
    ['#ffb300', '#4dd0e1', '#0f1724', '#e6edf7'],
    ['Inter, sans-serif', 10, 8],
  ),
  preset(
    'Terminal Green',
    'Phosphor on black, monospaced to the bone',
    ['#39ff14', '#00e5ff', '#0a0f0a', '#c8facc'],
    ['Fira Code, monospace', 0, 8],
  ),
  preset(
    'Neon Penguin',
    'Electric magenta and cyan after dark',
    ['#ff2d95', '#00d4ff', '#12081f', '#f3e8ff'],
    ['Montserrat, sans-serif', 12, 8],
  ),
  preset(
    'Sunset Boulevard',
    'Burnt orange sky over a plum skyline',
    ['#f4511e', '#8e24aa', '#fff6f0', '#3a1d1a'],
    ['Montserrat, sans-serif', 12, 10],
  ),
  preset(
    'Storm Front',
    'Slate greys with a bolt of yellow',
    ['#fdd835', '#90a4ae', '#22282e', '#eceff1'],
    ['Roboto, sans-serif', 6, 8],
  ),
  preset(
    'Trainz Dawn',
    'Signal red and steel: first train of the morning',
    ['#c62828', '#455a64', '#f5f5f2', '#212121'],
    ['Roboto, sans-serif', 4, 8],
  ),
] as const
