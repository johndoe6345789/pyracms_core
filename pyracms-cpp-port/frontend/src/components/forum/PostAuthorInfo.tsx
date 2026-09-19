'use client'

import { UserPostInfo } from './UserPostInfo'
import { getLevel } from '@/components/users/reputationLevels'
import { formatForumDate } from '@/lib/forumDate'
import type { UserStatsData } from '@/hooks/useUserStats'

interface Props {
  username: string
  stats: UserStatsData
}

/** Author sidebar of a post, built from the forum stats endpoint. */
export function PostAuthorInfo({ username, stats }: Props) {
  return (
    <UserPostInfo
      username={username}
      joinDate={formatForumDate(stats.joinedAt).split(' ')[0] ?? ''}
      postCount={stats.postCount}
      reputation={stats.reputation}
      rank={getLevel(stats.reputation).name}
    />
  )
}
