import { screen } from '@testing-library/react'

export const items = [
  { text: 'A', type: 'article', url: '/a' },
  { text: 'F', type: 'forum_post', url: '/f' },
  { text: 'S', type: 'snippet', url: '/s' },
  { text: 'G', type: 'gamedep', url: '/g' },
  { text: 'O', type: 'other', url: '/o' },
]
export const input = () =>
  screen.getByTestId('search-autocomplete-input').querySelector('input')!
