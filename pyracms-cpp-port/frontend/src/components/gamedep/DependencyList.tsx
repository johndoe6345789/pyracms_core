import {
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { LinkOutlined } from '@mui/icons-material'
import type { Dependency } from '@/hooks/useGameDepDetail'

interface DependencyListProps {
  dependencies: Dependency[]
  slug: string
}

export default function DependencyList({
  dependencies,
  slug,
}: DependencyListProps) {
  if (dependencies.length === 0) {
    return <Typography color="text.secondary">No dependencies.</Typography>
  }

  return (
    <List>
      {dependencies.map((dep) => (
        <ListItem
          key={dep.name}
          component={Link}
          href={`/site/${slug}/dependencies/${dep.name}`}
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            borderRadius: 2,
            mb: 1,
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <LinkOutlined sx={{ mr: 2, color: 'text.secondary' }} />
          <ListItemText
            primary={dep.displayName}
            secondary={`Version ${dep.version}`}
          />
        </ListItem>
      ))}
    </List>
  )
}
