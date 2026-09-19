import { renderHook, act } from '@testing-library/react'
import { useSaveGame } from '@/hooks/useSaveGame'
import api from '@/lib/api'
import { st } from '../helpers/tenantPagesMocks'

jest.mock('next/navigation', () =>
  jest.requireActual('../helpers/tenantPagesMocks').navMock(),
)

jest.mock('@/lib/api', () =>
  jest.requireActual('../helpers/tenantPagesMocks').apiMock(),
)

jest.mock('@/components/common/CommentSection', () =>
  jest.requireActual('../helpers/commentMock').commentSectionMock(),
)

jest.mock('@/components/launcher/GameLibrary', () =>
  jest.requireActual('../helpers/tenantPagesMocks').libMock(),
)

jest.mock('@/components/common/TenantBreadcrumbs', () =>
  jest.requireActual('../helpers/tenantPagesMocks').crumbsMock(),
)

jest.mock('@/hooks/useTenant', () =>
  jest.requireActual('../helpers/tenantPagesMocks').tenantMock(),
)

const put = api.put as jest.Mock

const push = st.push

describe('useSaveGame', () => {
  it('swallows failures and resets saving', async () => {
    push.mockClear()
    put.mockRejectedValue(new Error('x'))
    const { result } = renderHook(() => useSaveGame('s', 'n'))
    await act(() =>
      result.current.save({ displayName: 'a', description: 'b', tags: [] }),
    )
    expect(result.current.saving).toBe(false)
    expect(push).not.toHaveBeenCalled()
  })
})
