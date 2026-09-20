import { useEffect, useRef, useState } from 'react'

const storageKey = (key: string) => `autosave-${key}`

/** Drafts cleared after a save must not be re-written by a pending timer. */
const cleared = new Set<string>()

function store(op: () => void) {
  try {
    op()
  } catch {
    // storage unavailable (private mode): drafts just are not kept
  }
}

/** Forget a draft for good, e.g. once the article has been saved. */
export function clearDraft(key: string) {
  cleared.add(key)
  store(() => localStorage.removeItem(storageKey(key)))
}

/**
 * Keeps an unsaved draft under `autoSaveKey` and puts it back into an empty
 * editor. `restored` says a draft was put back; `discard` throws it away.
 */
export function useAutoSave(
  value: string,
  onChange: (v: string) => void,
  autoSaveKey?: string,
) {
  const latest = useRef({ value, onChange })
  const [restored, setRestored] = useState(false)
  useEffect(() => {
    latest.current = { value, onChange }
  })

  useEffect(() => {
    if (!autoSaveKey || cleared.has(autoSaveKey)) return
    const t = setTimeout(() => {
      if (cleared.has(autoSaveKey)) return // saved while this was pending
      store(() => localStorage.setItem(storageKey(autoSaveKey), value))
    }, 1000)
    return () => clearTimeout(t)
  }, [value, autoSaveKey])

  useEffect(() => {
    if (!autoSaveKey) return
    cleared.delete(autoSaveKey) // a fresh editor starts a new draft
    store(() => {
      const s = localStorage.getItem(storageKey(autoSaveKey))
      if (s && !latest.current.value) {
        latest.current.onChange(s)
        setRestored(true)
      }
    })
  }, [autoSaveKey])

  const discard = () => {
    if (autoSaveKey)
      store(() => localStorage.removeItem(storageKey(autoSaveKey)))
    latest.current.onChange('')
    setRestored(false)
  }
  return { restored, discard }
}
