import { render, screen } from '@testing-library/react'
import { renderBBCode } from '@/components/articles/bbcodeRenderer'
import { RevisionViewDialog } from '@/components/articles/RevisionViewDialog'
import { RevertConfirmDialog } from '@/components/articles/RevertConfirmDialog'

jest.mock(
  'react-markdown',
  () => jest.requireActual('../../helpers/scopeMocks').markdownMock,
)
jest.mock(
  'remark-gfm',
  () => jest.requireActual('../../helpers/scopeMocks').gfmMock,
)

it('renderBBCode converts every tag', () => {
  const html = renderBBCode(
    '[b]b[/b][i]i[/i][u]u[/u][url=http://a]l[/url][url]http://b[/url]' +
      '[img]http://i.png[/img][code]c[/code][quote]q[/quote]' +
      '[list][*]one[*]two[/list][color=red]r[/color][size=9]s[/size]\nx',
  )
  for (const t of [
    '<strong>',
    '<em>',
    '<u>',
    'href="http://a"',
    '<img',
    '<pre',
    '<blockquote',
    '<li>one</li>',
    'color',
    'font-size',
    '<br',
  ]) {
    expect(html).toContain(t)
  }
})

it('revision dialogs render and close', () => {
  const rev = { number: 3, author: 'a', date: 'd', summary: 's' }
  const { rerender } = render(
    <RevisionViewDialog
      open
      onClose={jest.fn()}
      revision={rev}
      content="**c**"
      renderer="markdown"
    />,
  )
  expect(screen.getByTestId('article-content')).toHaveTextContent('c')
  rerender(
    <RevisionViewDialog
      open
      onClose={jest.fn()}
      revision={null}
      content=""
      renderer="markdown"
    />,
  )
  render(
    <RevertConfirmDialog
      revisionNumber={4}
      onClose={jest.fn()}
      onConfirm={jest.fn()}
    />,
  )
  expect(screen.getByText(/Revert to revision 4/)).toBeInTheDocument()
})
