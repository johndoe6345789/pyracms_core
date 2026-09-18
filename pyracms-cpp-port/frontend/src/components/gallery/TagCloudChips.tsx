import Link from 'next/link'
import { Box, Chip } from '@mui/material'
import { LocalOfferOutlined } from '@mui/icons-material'
import type { TagCloudViewItem } from '@/hooks/useTagCloudPage'

export default function TagCloudChips(
  { items }: { items: TagCloudViewItem[] },
) {
  return (
    <Box
      sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
      aria-label="Tag cloud"
    >
      {items.map((tag) => (
        <Chip
          key={tag.name}
          component={Link}
          href={tag.href}
          clickable
          icon={<LocalOfferOutlined />}
          label={`${tag.name} (${tag.count})`}
          data-testid={`tag-cloud-chip-${tag.name}`}
          sx={{
            fontSize: tag.fontSize,
            height: tag.height,
            borderColor: 'primary.light',
            bgcolor: 'primary.50',
            '& .MuiChip-label': { px: 1.25 },
          }}
          variant="outlined"
          color="primary"
        />
      ))}
    </Box>
  )
}
