import { render, screen, fireEvent } from '@testing-library/react'
import AnimatedList from '@/components/common/AnimatedList'
import PageTransition from '@/components/common/PageTransition'
import TabPanel from '@/components/common/TabPanel'
import JsonLd from '@/components/common/JsonLd'
import VoteButtons from '@/components/common/VoteButtons'
import TagChips from '@/components/common/TagChips'

describe('common simple components', () => {
  it('AnimatedList renders each child', () => {
    render(
      <AnimatedList staggerDelay={0}>
        {[<b key="1">a</b>, <i key="2">b</i>]}
      </AnimatedList>,
    )
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
  })

  it('PageTransition renders children', () => {
    render(
      <PageTransition>
        <p>hi</p>
      </PageTransition>,
    )
    expect(screen.getByText('hi')).toBeInTheDocument()
  })

  it('TabPanel shows children only for the active tab', () => {
    const { rerender } = render(
      <TabPanel value={1} index={1}>
        body
      </TabPanel>,
    )
    expect(screen.getByText('body')).toBeInTheDocument()
    rerender(
      <TabPanel value={0} index={1}>
        body
      </TabPanel>,
    )
    expect(screen.queryByText('body')).toBeNull()
  })

  it('JsonLd emits a JSON-LD script', () => {
    const { container } = render(<JsonLd data={{ a: 1 }} />)
    const s = container.querySelector('script')
    expect(s?.getAttribute('type')).toBe('application/ld+json')
    expect(s?.innerHTML).toBe('{"a":1}')
  })

  it('VoteButtons fires like and dislike', () => {
    const [l, d] = [jest.fn(), jest.fn()]
    render(<VoteButtons likes={3} dislikes={4} onLike={l} onDislike={d} />)
    const [b1, b2] = screen.getAllByRole('button')
    fireEvent.click(b1!)
    fireEvent.click(b2!)
    expect(l).toHaveBeenCalledTimes(1)
    expect(d).toHaveBeenCalledTimes(1)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('TagChips supports optional delete', () => {
    const onDelete = jest.fn()
    const { rerender } = render(<TagChips tags={['a']} />)
    expect(screen.queryByTestId('CancelIcon')).toBeNull()
    rerender(<TagChips tags={['a']} onDelete={onDelete} />)
    fireEvent.click(screen.getByTestId('CancelIcon'))
    expect(onDelete).toHaveBeenCalledWith('a')
  })
})
