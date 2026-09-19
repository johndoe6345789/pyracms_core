import type { Plugin } from '../types'

export const forumSettings: NonNullable<Plugin['settings']> = {
  postsPerPage: {
    type: 'number',
    label: 'Posts per page',
    default: 20,
  },
  allowAnonymousPosts: {
    type: 'boolean',
    label: 'Allow anonymous posts',
    default: false,
  },
  moderationEnabled: {
    type: 'boolean',
    label: 'Enable moderation',
    default: true,
  },
}
