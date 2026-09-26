import { useState } from 'react'
import { Box, ButtonBase, Popover, Typography } from '@mui/material'
import { HexColorInput, HexColorPicker } from 'react-colorful'
import EyeDropperButton from './EyeDropperButton'
import SwatchRow from './SwatchRow'

interface Props {
  label: string
  /** What this colour is used for, in plain words */
  help?: string
  color: string
  onChange: (color: string) => void
}

/** A colour: click the swatch for a full picker (with a hex box, ready
 * colours and, where the browser allows, an eyedropper for the screen). */
export default function ColorPickerField(p: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <ButtonBase
        data-testid={`swatch-${p.label}`}
        aria-label={`Change ${p.label}`}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: p.color,
          border: 2,
          borderColor: 'divider',
          boxShadow: 1,
          flexShrink: 0,
        }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2">{p.label}</Typography>
        <Typography variant="caption" color="text.secondary">
          {p.help ?? p.color}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{ ml: 'auto', fontFamily: 'monospace' }}
        data-testid={`hex-${p.label}`}
      >
        {p.color}
      </Typography>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 232, display: 'grid', gap: 1.5 }}>
          <HexColorPicker
            color={p.color}
            onChange={p.onChange}
            style={{ width: '100%' }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">#</Typography>
            <HexColorInput
              color={p.color}
              onChange={p.onChange}
              aria-label={`${p.label} hex`}
              style={{ width: 90, padding: 6, fontFamily: 'monospace' }}
            />
            <EyeDropperButton onPick={p.onChange} />
          </Box>
          <SwatchRow onPick={p.onChange} />
        </Box>
      </Popover>
    </Box>
  )
}
