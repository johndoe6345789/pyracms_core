import {
  Card, CardContent, CardActionArea, Typography, Box,
} from '@mui/material'
import Link from 'next/link'
import type { ModuleInfo } from './moduleData'

/** One module tile on the site home page. */
export default function ModuleCard(
  { mod, slug }: { mod: ModuleInfo; slug: string },
) {
  const Icon = mod.icon
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: mod.color,
          boxShadow: 3,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardActionArea
        component={Link}
        href={`/site/${slug}/${mod.key}`}
        data-testid={`module-${mod.key}`}
        sx={{ height: '100%' }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}
          >
            <Box
              sx={{
                width: 44, height: 44, borderRadius: 2, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                bgcolor: `${mod.color}14`,
              }}
            >
              <Icon sx={{ color: mod.color, fontSize: 26 }} />
            </Box>
            <Typography variant="h4" component="h2">
              {mod.label}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            {mod.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
