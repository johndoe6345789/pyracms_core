import api from '@/lib/api'

/** Loosely typed handle on the mocked api (see apiMock). */
export const m = api as unknown as Record<
  'get' | 'post' | 'put' | 'delete',
  jest.Mock
>
