/** The server wraps matched words in these two private-use characters, so
 * the page marks them without ever trusting markup from search results. */
export const MARK_OPEN = ''
export const MARK_CLOSE = ''

export interface Piece {
  text: string
  hit: boolean
}

/** Splits marked text into plain and matched pieces. */
export function splitMarks(marked: string): Piece[] {
  const pieces: Piece[] = []
  let hit = false
  for (const part of marked.split(/([])/)) {
    if (part === MARK_OPEN) hit = true
    else if (part === MARK_CLOSE) hit = false
    else if (part) pieces.push({ text: part, hit })
  }
  return pieces
}

/** The text with its markers removed. */
export const stripMarks = (marked: string) => marked.replace(/[]/g, '')
