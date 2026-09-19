import { renderHook, act } from '@testing-library/react'
import { useSaveGame } from '@/hooks/useSaveGame'
import api from '@/lib/api'
import { st } from '../helpers/tenantPagesMocks'

jest.mock('next/navigation', () =>
  require('../helpers/tenantPagesMocks').navMock(),
)

jest.mock('@/lib/api', () => require('../helpers/tenantPagesMocks').apiMock())

jest.mock('@/components/common/CommentSection', () =>
  require('../helpers/commentMock').commentSectionMock(),
)

jest.mock('@/components/launcher/GameLibrary', () =>
  require('../helpers/tenantPagesMocks').libMock(),
)

jest.mock('@/components/common/TenantBreadcrumbs', () =>
  require('../helpers/tenantPagesMocks').crumbsMock(),
)

jest.mock('@/hooks/useTenant', () =>
  require('../helpers/tenantPagesMocks').tenantMock(),
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
