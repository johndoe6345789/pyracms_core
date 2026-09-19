import type { ProfileBadge } from './ProfileBadges'

export interface UserProfileCardProps {
  username: string
  avatarUrl?: string | undefined
  bio: string
  location?: string | undefined
  website?: string | undefined
  githubUrl?: string | undefined
  twitterUrl?: string | undefined
  joinDate: string
  postCount: number
  reputation: number
  badges: ProfileBadge[]
  isFollowing?: boolean | undefined
  onFollow?: (() => void) | undefined
}
