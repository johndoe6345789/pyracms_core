const thread = {
  title: 'Title',
  description: '',
  forumId: '3',
  forumName: 'F',
  pinned: false,
  locked: false,
  views: 0,
}

export const tp = {
  push: jest.fn(),
  refresh: jest.fn(),
  tenantLoading: false,
  live: { typingUsers: [] as unknown[] },
  onNewPost: (() => {}) as () => void,
  t: {} as Record<string, unknown>,
}

export const navMock = {
  useParams: () => ({ slug: 's', threadId: '9' }),
  useRouter: () => ({ push: tp.push }),
}
export const tenantMock = {
  useTenantId: () => ({ tenantId: 1, loading: tp.tenantLoading }),
}
export const userMock = {
  useForumUser: () => ({ isAuthenticated: true, isModerator: true }),
}
export const threadMock = { useThread: () => tp.t }
export const liveMock = {
  useThreadLive: (o: { onNewPost: () => void }) => {
    tp.onNewPost = o.onNewPost
    return { ...tp.live, sendTypingStart: jest.fn() }
  },
}

export const resetThreadPage = () => {
  tp.push.mockClear()
  tp.tenantLoading = false
  tp.live = { typingUsers: [] }
  tp.t = {
    thread,
    posts: [],
    loading: false,
    error: '',
    refresh: tp.refresh,
    replyContent: '',
    setReplyContent: jest.fn(),
    replyError: '',
    submitting: false,
    handleSubmitReply: jest.fn().mockResolvedValue(0),
    handleDeleteThread: jest.fn().mockResolvedValue(undefined),
    handleTogglePin: jest.fn(),
    handleToggleLock: jest.fn(),
    handleVotePost: jest.fn(),
    handleEditPost: jest.fn(),
    handleDeletePost: jest.fn(),
    handleQuote: jest.fn(),
  }
}
