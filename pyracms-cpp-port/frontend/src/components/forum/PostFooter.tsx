'use client'

import { Box } from '@mui/material'
import { VoteButtons } from './VoteButtons'
import { QuoteButton } from './QuoteButton'
import { PostReactions } from './PostReactions'
import type { Post } from '@/hooks/useThread'

interface Props {
  post: Post
  canVote: boolean
  onVote?: ((id: string, l: boolean) => void) | undefined
  onQuote?: ((author: string, content: string) => void) | undefined
}

/** Votes, reactions and the quote button under a post body. */
export function PostFooter({ post, canVote, onVote, onQuote }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      <VoteButtons
        likes={post.likes}
        dislikes={post.dislikes}
        disabled={!canVote}
        onVote={(l) => onVote?.(post.id, l)}
      />
      <PostReactions
        postId={post.id}
        disabled={!canVote}
        {...(post.reactions ? { reactions: post.reactions } : {})}
      />
      {onQuote && (
        <QuoteButton
          author={post.author}
          content={post.content}
          onQuote={() => onQuote(post.author, post.content)}
        />
      )}
    </Box>
  )
}
