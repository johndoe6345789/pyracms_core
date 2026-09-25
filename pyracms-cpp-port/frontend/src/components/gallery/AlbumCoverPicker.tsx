import { Box, ButtonBase, Typography } from '@mui/material'
import { CheckCircleOutlined } from '@mui/icons-material'
import type { GalleryPicture } from '@/hooks/useGalleryAlbum'

interface Props {
  pictures: GalleryPicture[]
  value: number
  onChange: (id: number) => void
}

/** Pick the album's cover from its own pictures (0 = no cover). */
export default function AlbumCoverPicker({ pictures, value, onChange }: Props) {
  if (!pictures.length)
    return (
      <Typography variant="body2" color="text.secondary">
        Upload pictures to choose a cover.
      </Typography>
    )
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
        gap: 1,
        maxHeight: 220,
        overflow: 'auto',
      }}
      role="radiogroup"
      aria-label="Cover picture"
    >
      {pictures.map((p) => {
        const on = Number(p.id) === value
        return (
          <ButtonBase
            key={p.id}
            role="radio"
            aria-checked={on}
            aria-label={p.title}
            onClick={() => onChange(on ? 0 : Number(p.id))}
            data-testid={`cover-choice-${p.id}`}
            sx={{
              position: 'relative',
              aspectRatio: '1',
              borderRadius: 1,
              overflow: 'hidden',
              outline: on ? '3px solid' : '1px solid',
              outlineColor: on ? 'primary.main' : 'divider',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.src}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {on && (
              <CheckCircleOutlined
                color="primary"
                sx={{ position: 'absolute', top: 2, right: 2 }}
              />
            )}
          </ButtonBase>
        )
      })}
    </Box>
  )
}
