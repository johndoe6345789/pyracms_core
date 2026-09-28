import { Button, ButtonGroup } from '@mui/material'
import {
  ThumbDown,
  ThumbDownOutlined,
  ThumbUp,
  ThumbUpOutlined,
} from '@mui/icons-material'
import { compactCount } from '@/lib/videoFormat'
import type { MyVote } from '@/lib/videos'

interface Props {
  likes: number
  dislikes: number
  myVote: MyVote
  disabled: boolean
  onVote: (isLike: boolean) => void
}

/** Like/dislike pair; the active vote is filled, clicking it clears it. */
export default function VideoVotes(p: Props) {
  const buttons = [
    ['like', 'Like', p.likes, ThumbUp, ThumbUpOutlined],
    ['dislike', 'Dislike', p.dislikes, ThumbDown, ThumbDownOutlined],
  ] as const
  return (
    <ButtonGroup variant="outlined" size="small" aria-label="Rate this video">
      {buttons.map(([kind, label, count, On, Off]) => {
        const active = p.myVote === kind
        return (
          <Button
            key={kind}
            aria-label={label}
            aria-pressed={active}
            color={active ? 'primary' : 'inherit'}
            disabled={p.disabled}
            startIcon={active ? <On /> : <Off />}
            onClick={() => p.onVote(kind === 'like')}
            data-testid={`video-${kind}`}
          >
            {compactCount(count)}
          </Button>
        )
      })}
    </ButtonGroup>
  )
}
