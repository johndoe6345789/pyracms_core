import { useState, useCallback, useRef, useEffect } from 'react'
import api from '@/lib/api'

export interface MentionUser {
  id: number
  username: string
}
type El = HTMLTextAreaElement | HTMLInputElement

export function useMention(inputRef: React.RefObject<El | null>) {
  const [list, setList] = useState<MentionUser[]>([])
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const timer = useRef<NodeJS.Timeout>(null)

  const handle = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    const before = (el.value || '').substring(0, el.selectionStart || 0)
    const mention = before.match(/@(\w*)$/)?.[1]
    if (mention && mention.length >= 1) {
      setAnchor(el as HTMLElement)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(async () => {
        try {
          const r = await api.get('/api/users?search=' + mention + '&limit=5')
          setList(Array.isArray(r.data) ? r.data : [])
        } catch {
          setList([])
        }
      }, 200)
    } else {
      setList([])
      setAnchor(null)
    }
  }, [inputRef])

  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.addEventListener('input', handle)
    el.addEventListener('keyup', handle)
    return () => {
      el.removeEventListener('input', handle)
      el.removeEventListener('keyup', handle)
    }
  }, [inputRef, handle])

  const clear = () => {
    setList([])
    setAnchor(null)
  }
  return { list, anchor, clear }
}
