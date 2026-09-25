import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material'

interface Props {
  mode: string
  hasChosen: boolean
  disabled: boolean
  onChange: (mode: 'chosen' | 'random') => void
}

/** Random photo on every visit, or the one photo you picked. */
export default function AlbumCoverMode({
  mode,
  hasChosen,
  disabled,
  onChange,
}: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
      <FormControl disabled={disabled}>
        <FormLabel id="cover-mode-label">
          <Typography variant="h6" component="h2">
            Album cover
          </Typography>
        </FormLabel>
        <RadioGroup
          aria-labelledby="cover-mode-label"
          value={mode}
          onChange={(e) => onChange(e.target.value as 'chosen' | 'random')}
        >
          <FormControlLabel
            value="random"
            control={<Radio inputProps={{ 'aria-label': 'Random photo' }} />}
            label="A random photo from the album (changes every visit)"
          />
          <FormControlLabel
            value="chosen"
            control={<Radio inputProps={{ 'aria-label': 'Chosen photo' }} />}
            label={
              hasChosen
                ? 'The photo I choose (marked below)'
                : 'The photo I choose (use "Set as cover" below)'
            }
          />
        </RadioGroup>
      </FormControl>
    </Paper>
  )
}
