import { Box, Typography, Link as MuiLink } from '@mui/material'
import {
  LocationOnOutlined, LanguageOutlined,
  CalendarTodayOutlined,
} from '@mui/icons-material'

const iSx = {
  fontSize: 18, color: 'text.secondary',
}
const rowSx = {
  display: 'flex',
  alignItems: 'center', gap: 0.5,
}

interface ProfileInfoProps {
  location?: string; website?: string
  joinDate: string
}

export function ProfileInfo({
  location, website, joinDate,
}: ProfileInfoProps) {
  return (
    <Box sx={{
      display: 'flex', flexWrap: 'wrap',
      gap: 2, mb: 2,
    }} data-testid="profile-info">
      {location && (
        <Box sx={rowSx}>
          <LocationOnOutlined sx={iSx} />
          <Typography variant="body2"
            color="text.secondary">
            {location}
          </Typography>
        </Box>
      )}
      {website && (
        <Box sx={rowSx}>
          <LanguageOutlined sx={iSx} />
          <MuiLink href={website}
            target="_blank" rel="noopener"
            variant="body2"
            data-testid="website-link">
            {website}
          </MuiLink>
        </Box>
      )}
      <Box sx={rowSx}>
        <CalendarTodayOutlined sx={iSx} />
        <Typography variant="body2"
          color="text.secondary">
          Joined {joinDate}
        </Typography>
      </Box>
    </Box>
  )
}
