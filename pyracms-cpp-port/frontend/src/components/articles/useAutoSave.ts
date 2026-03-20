import { useEffect } from 'react'

export function useAutoSave(
  value: string,
  onChange: (v: string) => void,
  autoSaveKey?: string,
) {
  useEffect(() => {
    if (!autoSaveKey) return
    const t = setTimeout(() => {
      localStorage.setItem(
        `autosave-${autoSaveKey}`, value)
    }, 1000)
    return () => clearTimeout(t)
  }, [value, autoSaveKey])

  useEffect(() => {
    if (!autoSaveKey) return
    const s = localStorage.getItem(
      `autosave-${autoSaveKey}`)
    if (s && !value) onChange(s)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSaveKey])
}
