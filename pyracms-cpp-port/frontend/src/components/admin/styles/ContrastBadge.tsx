import { Chip } from '@mui/material'
import { contrastGrade, contrastRatio } from '@/lib/colorContrast'

/** How readable `fg` is on `bg`: the ratio and a plain verdict. */
export default function ContrastBadge({
  fg,
  bg,
  label,
}: {
  fg: string
  bg: string
  label: string
}) {
  const ratio = contrastRatio(fg, bg)
  if (ratio === null) return null
  const grade = contrastGrade(ratio)
  return (
    <Chip
      size="small"
      variant="outlined"
      data-testid={`contrast-${label}`}
      color={
        grade === 'Too low'
          ? 'error'
          : grade === 'AAA' || grade === 'AA'
            ? 'success'
            : 'warning'
      }
      label={`${label}: ${ratio.toFixed(1)}:1 ${grade}`}
    />
  )
}
