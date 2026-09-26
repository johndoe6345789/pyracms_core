import { IconButton, Tooltip } from '@mui/material'
import { ColorizeOutlined } from '@mui/icons-material'

interface EyeDropperApi {
  open: () => Promise<{ sRGBHex: string }>
}

/** Pick any colour from the screen (Chrome/Edge); hidden where unsupported. */
export default function EyeDropperButton({
  onPick,
}: {
  onPick: (hex: string) => void
}) {
  const Dropper = (
    globalThis as unknown as { EyeDropper?: new () => EyeDropperApi }
  ).EyeDropper
  if (!Dropper) return null
  return (
    <Tooltip title="Pick a colour from the screen">
      <IconButton
        size="small"
        aria-label="Pick a colour from the screen"
        onClick={() =>
          new Dropper()
            .open()
            .then((r) => onPick(r.sRGBHex))
            .catch(() => undefined)
        }
      >
        <ColorizeOutlined fontSize="small" />
      </IconButton>
    </Tooltip>
  )
}
