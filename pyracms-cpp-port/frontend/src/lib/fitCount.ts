/**
 * How many items fit in a row of `room` px. Everything fits when the whole
 * row does; otherwise a "More" button of `moreWidth` px takes a slot and as
 * many items as still fit stay in the row.
 */
export function fitCount(
  widths: number[],
  room: number,
  moreWidth: number,
): number {
  const total = widths.reduce((sum, w) => sum + w, 0)
  if (total <= room) return widths.length
  let used = 0
  let n = 0
  for (const w of widths) {
    if (used + w > room - moreWidth) break
    used += w
    n++
  }
  return n
}
