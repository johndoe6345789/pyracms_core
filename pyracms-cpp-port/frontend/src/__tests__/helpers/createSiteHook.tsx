import { makeMockFormEvent } from './mockFormEvent'

/** Router push spy used by the next/navigation mock. */
export const mockPush = jest.fn()

/** API post spy used by the @/lib/api mock. */
export const mockPost = jest.fn()

/** Factory for the '@/lib/api' module mock. */
export const apiMock = () => ({
  __esModule: true,
  default: { post: (...args: unknown[]) => mockPost(...args) },
})

/** Factory for the 'next/navigation' module mock. */
export const navigationMock = () => ({
  useRouter: () => ({ push: mockPush }),
})

export const fakeSubmitEvent = () => makeMockFormEvent().event

export { makeMockFormEvent }
