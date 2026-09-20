import { Chip, Stack } from '@mui/material'
import { UserRole, USER_ROLE_LABELS } from '@/types'

type Color = 'default' | 'info' | 'warning' | 'error' | 'secondary'

const COLORS: Record<UserRole, Color> = {
  [UserRole.Guest]: 'default',
  [UserRole.User]: 'info',
  [UserRole.Moderator]: 'warning',
  [UserRole.SiteAdmin]: 'error',
  [UserRole.SuperAdmin]: 'secondary',
}

interface Props {
  role: number
  siteOwner?: boolean | undefined
}

/** The account's level as a colored label, plus an owner badge. */
export default function UserLevelChip({ role, siteOwner }: Props) {
  const level = role as UserRole
  return (
    <Stack direction="row" spacing={0.5} data-testid="user-level">
      <Chip
        size="small"
        label={USER_ROLE_LABELS[level] ?? `Level ${role}`}
        color={COLORS[level] ?? 'default'}
        data-testid="user-level-chip"
      />
      {siteOwner && (
        <Chip
          size="small"
          variant="outlined"
          label="Site owner"
          data-testid="user-owner-badge"
        />
      )}
    </Stack>
  )
}
