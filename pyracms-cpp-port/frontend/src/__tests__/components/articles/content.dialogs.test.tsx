import { render, screen } from '@testing-library/react'
import { renderBBCode } from '@/components/articles/bbcodeRenderer'
import { RevisionViewDialog } from '@/components/articles/RevisionViewDialog'
import { RevertConfirmDialog } from '@/components/articles/RevertConfirmDialog'

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
      sanitizedContent="<b>c</b>"
    />,
  )
  expect(screen.getByTestId('revision-content').innerHTML).toContain('<b>')
  rerender(
    <RevisionViewDialog
      open
      onClose={jest.fn()}
      revision={null}
      sanitizedContent=""
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
