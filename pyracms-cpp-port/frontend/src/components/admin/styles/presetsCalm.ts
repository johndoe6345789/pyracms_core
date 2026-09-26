import { preset } from './presetTypes'

// [primary, secondary, background, text], [font, corner radius, spacing]
export const CALM_PRESETS = [
  preset(
    'Paper & Ink',
    'Warm paper, dark ink: made for long reads',
    ['#37474f', '#8d6e63', '#fbf8f1', '#263238'],
    ['Georgia, serif', 4, 8],
  ),
  preset(
    'Old Library',
    'Leather, brass and quiet corners',
    ['#6d4c41', '#b08d57', '#f6efe4', '#3e2723'],
    ['Merriweather, serif', 2, 10],
  ),
  preset(
    'Mint Julep',
    'Fresh, cool and easy on the eyes',
    ['#00897b', '#7cb342', '#f3fbf8', '#1b3a36'],
    ['Lato, sans-serif', 14, 8],
  ),
  preset(
    'Lavender Fields',
    'Soft purples and plenty of air',
    ['#7e57c2', '#ec407a', '#faf7ff', '#2d2540'],
    ['Open Sans, sans-serif', 16, 10],
  ),
  preset(
    'Sakura',
    'Blossom pink on clean white',
    ['#d81b60', '#5c6bc0', '#fff7fa', '#3b2030'],
    ['Inter, sans-serif', 20, 8],
  ),
  preset(
    'Ocean Breeze',
    'Salt air, sea glass and sandy white',
    ['#0277bd', '#26a69a', '#f4fafd', '#12303f'],
    ['Source Sans Pro, sans-serif', 10, 8],
  ),
] as const
