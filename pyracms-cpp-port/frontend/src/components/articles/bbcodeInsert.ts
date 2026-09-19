export interface InsertResult {
  text: string
  cursor: number
}

/** Pure BBCode tag insertion around a selection. */
export function insertBBCode(
  value: string,
  start: number,
  end: number,
  tag: string,
  attr?: string,
): InsertResult {
  const sel = value.substring(start, end)
  const open = attr === undefined ? `[${tag}]` : `[${tag}=${attr}]`
  const close = `[/${tag}]`
  const before = value.substring(0, start)
  const after = value.substring(end)

  if (tag === 'list') {
    const items = sel
      ? sel
          .split('\n')
          .map((l) => `[*]${l}`)
          .join('\n')
      : '[*]item'
    const text = `${before}${open}\n${items}\n${close}${after}`
    return { text, cursor: text.length - after.length }
  }
  const inner = sel || tag
  return {
    text: `${before}${open}${inner}${close}${after}`,
    cursor: start + open.length + inner.length,
  }
}
