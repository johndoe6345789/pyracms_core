import { useState } from 'react'

/** Copies text and reports which item was copied for 1.5s. */
export function useCopyFeedback() {
  const [copied, setCopied] = useState('')

  const copy = (what: string, text: string) => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(what)
        setTimeout(() => setCopied(''), 1500)
      })
      .catch(() => {})
  }

  return { copied, copy }
}
