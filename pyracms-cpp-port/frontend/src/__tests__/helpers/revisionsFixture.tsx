export const revs = [
  { number: 2, author: 'a', date: 'd', summary: 's' },
  { number: 1, author: 'b', date: 'd', summary: 't' },
]

export const diffViewerMock = {
  __esModule: true,
  DiffMethod: { WORDS: 'words' },
  default: (p: { oldValue: string; newValue: string; splitView: boolean }) => (
    <div data-testid="diff">
      {p.oldValue}|{p.newValue}|{String(p.splitView)}
    </div>
  ),
}
