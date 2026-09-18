'use client'

import {
  Paper, List, ListItemButton, ListItemText, ListItemIcon,
  Typography, Badge,
} from '@mui/material'
import { SelectAllOutlined } from '@mui/icons-material'
import { TYPE_CONFIG } from './facetConfig'

interface FacetSidebarProps {
  facets: Record<string, number>
  activeType: string
  onTypeChange: (type: string) => void
  totalCount: number
}

export default function FacetSidebar({
  facets, activeType, onTypeChange, totalCount,
}: FacetSidebarProps) {
  return (
    <Paper variant="outlined" sx={{ p: 1 }}>
      <Typography variant="subtitle2" sx={{ px: 1, py: 1, fontWeight: 700 }}>
        Filter by Type
      </Typography>
      <List dense>
        <ListItemButton
          selected={activeType === 'all'}
          onClick={() => onTypeChange('all')}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <SelectAllOutlined />
          </ListItemIcon>
          <ListItemText primary="All" />
          <Badge badgeContent={totalCount} color="primary" max={999} />
        </ListItemButton>

        {Object.entries(TYPE_CONFIG).map(([type, config]) => {
          const count = facets[type] || 0
          return (
            <ListItemButton
              key={type}
              selected={activeType === type}
              onClick={() => onTypeChange(type)}
              disabled={count === 0}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {config.icon}
              </ListItemIcon>
              <ListItemText primary={config.label} />
              <Badge badgeContent={count} color="default" max={999} />
            </ListItemButton>
          )
        })}
      </List>
    </Paper>
  )
}
