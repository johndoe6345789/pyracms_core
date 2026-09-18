import { useCallback, useRef } from 'react'

/** Wraps the textarea selection with a prefix and suffix. */
export function useTextInsert(
  value: string,
  onChange: (v: string) => void
) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const insert = useCallback((pre: string, suf: string) => {
    const ta = ref.current
    if (!ta) return
    const s = ta.selectionStart
    const e = ta.selectionEnd
    const sel = value.substring(s, e)
    const inner = sel || 'text'
    onChange(
      value.substring(0, s) + pre + inner + suf
        + value.substring(e)
    )
    setTimeout(() => {
      ta.focus()
      const pos = s + pre.length + inner.length
      ta.setSelectionRange(pos, pos)
    }, 0)
  }, [value, onChange])

  return { ref, insert }
}
