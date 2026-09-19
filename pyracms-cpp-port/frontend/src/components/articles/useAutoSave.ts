import { useEffect, useRef } from 'react'

export function useAutoSave(
  value: string,
  onChange: (v: string) => void,
  autoSaveKey?: string,
) {
  const latest = useRef({ value, onChange })
  useEffect(() => {
    latest.current = { value, onChange }
  })

  useEffect(() => {
    if (!autoSaveKey) return
    const t = setTimeout(() => {
      localStorage.setItem(`autosave-${autoSaveKey}`, value)
    }, 1000)
    return () => clearTimeout(t)
  }, [value, autoSaveKey])

  useEffect(() => {
    if (!autoSaveKey) return
    const s = localStorage.getItem(`autosave-${autoSaveKey}`)
    if (s && !latest.current.value) latest.current.onChange(s)
  }, [autoSaveKey])
}
