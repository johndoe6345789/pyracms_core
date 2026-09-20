import type { ReactNode } from 'react'
import { act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { makeStore } from '@/store/store'
import type { CreateSiteForm } from '@/hooks/createSiteForm'
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

/** The hook dispatches the new admin's session, so it needs a store. */
export const withStore = ({ children }: { children: ReactNode }) => (
  <Provider store={makeStore().store}>{children}</Provider>
)

type Fields = {
  current: { updateField: (f: keyof CreateSiteForm, v: string) => void }
}

/** Fills the administrator account the form now asks for. */
export function fillAdmin(result: Fields) {
  act(() => {
    result.current.updateField('adminUsername', 'owner')
    result.current.updateField('adminEmail', 'owner@x.io')
    result.current.updateField('adminPassword', 'password123')
  })
}
