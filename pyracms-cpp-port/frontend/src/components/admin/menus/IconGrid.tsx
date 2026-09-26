import { Box, ButtonBase, Tooltip, Typography } from '@mui/material'
import type { IconEntry } from '@/lib/menuIcons'

interface Props {
  icons: IconEntry[]
  value: string
  onPick: (name: string) => void
}

/** The icons, as buttons; the chosen one is outlined. */
export default function IconGrid({ icons, value, onPick }: Props) {
  if (!icons.length)
    return (
      <Typography color="text.secondary" sx={{ p: 2 }}>
        No icon matches that.
      </Typography>
    )
  return (
    <Box
      role="listbox"
      aria-label="Icons"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))',
        gap: 0.5,
        maxHeight: 300,
        overflow: 'auto',
        p: 0.5,
      }}
    >
      {icons.map(({ name, label, Icon }) => (
        <Tooltip key={name} title={label}>
          <ButtonBase
            role="option"
            aria-selected={name === value}
            aria-label={label}
            onClick={() => onPick(name)}
            data-testid={`icon-${name}`}
            sx={{
              height: 48,
              borderRadius: 1,
              border: 2,
              borderColor: name === value ? 'primary.main' : 'transparent',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Icon />
          </ButtonBase>
        </Tooltip>
      ))}
    </Box>
  )
}
