'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Paper, List, ListItem, ListItemText, Popper, Typography } from '@mui/material'
import api from '@/lib/api'

interface MentionAutocompleteProps {
  inputRef: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>
  onSelect: (username: string) => void
}

interface UserSuggestion {
  id: number
  username: string
}

export function MentionAutocomplete({ inputRef, onSelect }: MentionAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([])
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [mentionQuery, setMentionQuery] = useState('')
  const debounceRef = useRef<NodeJS.Timeout>(null)

  const handleInput = useCallback(() => {
    const el = inputRef.current
    if (!el) return

    const value = el.value || ''
    const cursorPos = el.selectionStart || 0
    const beforeCursor = value.substring(0, cursorPos)

    // Find @ mention pattern before cursor
    const match = beforeCursor.match(/@(\w*)$/)
    if (match && match[1].length >= 1) {
      setMentionQuery(match[1])
      setAnchorEl(el as HTMLElement)

      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await api.get(`/api/users?search=${match[1]}&limit=5`)
          setSuggestions(Array.isArray(res.data) ? res.data : [])
        } catch {
          setSuggestions([])
        }
      }, 200)
    } else {
      setSuggestions([])
      setAnchorEl(null)
    }
  }, [inputRef])

  useEffect(() => {
    const el = inputRef.current
    if (!el) return

    el.addEventListener('input', handleInput)
    el.addEventListener('keyup', handleInput)
    return () => {
      el.removeEventListener('input', handleInput)
      el.removeEventListener('keyup', handleInput)
    }
  }, [inputRef, handleInput])

  const handleSelect = (username: string) => {
    onSelect(username)
    setSuggestions([])
    setAnchorEl(null)
  }

  if (suggestions.length === 0 || !anchorEl) return null

  return (
    <Popper open anchorEl={anchorEl} placement="bottom-start" sx={{ zIndex: 1300 }}>
      <Paper elevation={8} sx={{ maxWidth: 250, maxHeight: 200, overflow: 'auto' }}>
        <Typography variant="caption" sx={{ px: 1.5, py: 0.5, display: 'block', color: 'text.secondary' }}>
          Mention user
        </Typography>
        <List dense>
          {suggestions.map((user) => (
            <ListItem
              key={user.id}
              onClick={() => handleSelect(user.username)}
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
            >
              <ListItemText primary={`@${user.username}`} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Popper>
  )
}
