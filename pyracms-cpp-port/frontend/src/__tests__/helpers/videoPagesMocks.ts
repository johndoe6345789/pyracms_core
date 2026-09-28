import { makeVideo } from './videoFixture'

export const push = jest.fn()
export const state = {
  signedIn: true,
  canManage: true,
  video: makeVideo() as unknown,
  missing: false,
  items: [makeVideo(), makeVideo({ id: 8, title: 'Dog' })],
  total: 2,
  channel: 'bob',
}

export const list = {
  loadMore: jest.fn(),
  calls: [] as unknown[],
}
export const video = {
  vote: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}

export const navMock = {
  useRouter: () => ({ push }),
  useParams: () => ({ slug: 's', videoId: '7', userId: '2' }),
}
export const tenantMock = { useTenantId: () => ({ tenantId: 1 }) }
export const sessionMock = { useSiteSession: () => state.signedIn }
export const manageMock = { useCanManage: () => state.canManage }
export const channelMock = { useChannelName: () => state.channel }
export const listMock = {
  useVideoList: (...args: unknown[]) => {
    list.calls.push(args)
    return {
      items: state.items,
      total: state.total,
      loading: false,
      hasMore: false,
      loadMore: list.loadMore,
    }
  },
}
export const videoMock = {
  useVideo: () => ({ video: state.video, missing: state.missing, ...video }),
}
