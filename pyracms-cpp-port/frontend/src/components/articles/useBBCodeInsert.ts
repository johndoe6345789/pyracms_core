import { useCallback, useRef } from 'react'
import { insertBBCode } from './bbcodeInsert'

export function useBBCodeInsert(value: string, onChange: (v: string) => void) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const insertTag = useCallback(
    (tag: string, hasAttr?: boolean, attrPrompt?: string) => {
      const ta = ref.current
      if (!ta) return
      let attr: string | undefined
      if (hasAttr && attrPrompt) {
        const answer = window.prompt(attrPrompt)
        if (answer === null) return
        attr = answer
      }
      const r = insertBBCode(
        value,
        ta.selectionStart,
        ta.selectionEnd,
        tag,
        attr,
      )
      onChange(r.text)
      if (tag === 'list') return
      setTimeout(() => {
        ta.focus()
        ta.setSelectionRange(r.cursor, r.cursor)
      }, 0)
    },
    [value, onChange],
  )

  return { ref, insertTag }
}
