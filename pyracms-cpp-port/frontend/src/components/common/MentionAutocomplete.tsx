'use client'

import {
  useState, useCallback, useRef, useEffect,
} from 'react'
import {
  Paper, List, ListItem,
  ListItemText, Popper, Typography,
} from '@mui/material'
import api from '@/lib/api'

interface Props {
  inputRef: React.RefObject<
    HTMLTextAreaElement | HTMLInputElement | null>
  onSelect: (username: string) => void
}
interface User { id: number; username: string }

export function MentionAutocomplete({
  inputRef, onSelect,
}: Props) {
  const [list, setList] = useState<User[]>([])
  const [anchor, setAnchor] =
    useState<HTMLElement | null>(null)
  const timer = useRef<NodeJS.Timeout>(null)

  const handle = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    const val = el.value || ''
    const pos = el.selectionStart || 0
    const before = val.substring(0, pos)
    const m = before.match(/@(\w*)$/)
    if (m && m[1].length >= 1) {
      setAnchor(el as HTMLElement)
      if (timer.current)
        clearTimeout(timer.current)
      timer.current = setTimeout(async () => {
        try {
          const r = await api.get(
            '/api/users?search='
            + m[1] + '&limit=5')
          setList(Array.isArray(r.data)
            ? r.data : [])
        } catch { setList([]) }
      }, 200)
    } else {
      setList([]); setAnchor(null)
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

  if (list.length === 0 || !anchor) return null

  return (
    <Popper open anchorEl={anchor}
      placement="bottom-start"
      sx={{ zIndex: 1300 }}>
      <Paper elevation={8} sx={{
        maxWidth: 250, maxHeight: 200,
        overflow: 'auto' }}>
        <Typography variant="caption" sx={{
          px: 1.5, py: 0.5, display: 'block',
          color: 'text.secondary' }}>
          Mention user
        </Typography>
        <List dense>
          {list.map((u) => (
            <ListItem key={u.id}
              onClick={() => {
                onSelect(u.username)
                setList([]); setAnchor(null)
              }}
              data-testid={
                `mention-item-${u.id}`}
              sx={{ cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover' } }}>
              <ListItemText
                primary={`@${u.username}`} />
            </ListItem>))}
        </List>
      </Paper>
    </Popper>
  )
}
