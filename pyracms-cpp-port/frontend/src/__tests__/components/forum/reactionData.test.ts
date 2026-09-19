import {
  mapReactions, toggleReaction, REACTIONS,
} from '@/components/forum/reactionData'

const r = (label: string, count: number, reacted: boolean) => ({
  emoji: label, label, count, reacted,
})

describe('reaction data', () => {
  it('offers the six contract emojis', () => {
    expect(REACTIONS.map((x) => x.label)).toEqual(
      ['thumbs_up', 'heart', 'laugh', 'wow', 'sad', 'party'])
  })
  it('maps API rows to glyph badges and drops unknown ones', () => {
    expect(mapReactions([
      { emoji: 'heart', count: 2, mine: true },
      { emoji: 'nope', count: 1 },
      { emoji: 'wow', count: 0 },
    ])).toEqual([{ emoji: '❤️', label: 'heart', count: 2, reacted: true }])
    expect(mapReactions(undefined)).toEqual([])
  })
})

describe('toggleReaction', () => {
  it('adds a new reaction', () => {
    expect(toggleReaction([], 'x', 'lx'))
      .toEqual([{ emoji: 'x', label: 'lx', count: 1, reacted: true }])
  })
  it('increments an unreacted one', () => {
    expect(toggleReaction([r('a', 1, false), r('b', 1, false)], 'a', 'a'))
      .toEqual([r('a', 2, true), r('b', 1, false)])
  })
  it('decrements a reacted one and removes at zero', () => {
    expect(toggleReaction([r('a', 3, true), r('b', 1, false)], 'a', 'a'))
      .toEqual([r('a', 2, false), r('b', 1, false)])
    expect(toggleReaction([r('a', 1, true)], 'a', 'a')).toEqual([])
  })
})
