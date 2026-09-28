import NextLink from 'next/link'
import { Avatar, Box, Link } from '@mui/material'
import { FollowButton } from '@/components/users/FollowButton'
import { channelHref } from '@/lib/videos'

interface Props {
  slug: string
  userId: number
  username: string
}

/** Uploader's avatar and name (to the channel) with Subscribe. */
export default function VideoChannelRow({ slug, userId, username }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Avatar sx={{ width: 36, height: 36 }}>
        {username.charAt(0).toUpperCase()}
      </Avatar>
      <Link
        component={NextLink}
        href={channelHref(slug, userId)}
        underline="hover"
        color="text.primary"
        fontWeight={600}
        data-testid="video-channel-link"
      >
        {username}
      </Link>
      <FollowButton
        userId={userId}
        followLabel="Subscribe"
        unfollowLabel="Subscribed"
      />
    </Box>
  )
}
