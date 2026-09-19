import {
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
} from '@mui/material'
import { FavoriteOutlined } from '@mui/icons-material'
import type { GameDepItem } from '@/hooks/useGameDepList'

interface Props {
  games: GameDepItem[]
  selected: string | null
  onSelect: (name: string) => void
  installed: Record<string, string>
  favs: Record<string, string>
}

/** Scrollable list of games with install / favourite markers. */
export default function SidebarList(p: Props) {
  return (
    <List dense sx={{ overflowY: 'auto', flex: 1 }}>
      {p.games.map((g) => (
        <ListItemButton
          key={g.name}
          selected={p.selected === g.name}
          onClick={() => p.onSelect(g.name)}
        >
          <ListItemText
            primary={g.displayName}
            secondary={
              p.installed[g.name]
                ? `Marked installed v${p.installed[g.name]}`
                : undefined
            }
          />
          {p.favs[g.name] && (
            <ListItemIcon sx={{ minWidth: 0 }}>
              <FavoriteOutlined fontSize="small" color="error" />
            </ListItemIcon>
          )}
        </ListItemButton>
      ))}
      {p.games.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No games match.
        </Typography>
      )}
    </List>
  )
}
