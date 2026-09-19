export const game = {
  name: 'g',
  displayName: 'Gee',
  description: 'd',
  tags: [],
  likes: 0,
  dislikes: 0,
  views: 1500,
  created: '2024-01-01',
}
export const detail = {
  ...game,
  owner: 'o',
  revisions: [
    { version: '2', published: true, date: 'x' },
    { version: '1', published: false, date: 'y' },
  ],
  binaries: [],
  dependencies: [],
  screenshots: [],
}
