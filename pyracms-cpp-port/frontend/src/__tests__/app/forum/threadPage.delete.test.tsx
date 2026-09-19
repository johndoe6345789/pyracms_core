import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ViewThreadPage } from '../../helpers/pages/ViewThreadPage'
import { tp, resetThreadPage } from '../../helpers/threadPageState'

jest.mock(
  'next/navigation',
  () => require('../../helpers/threadPageState').navMock,
)
jest.mock(
  '@/hooks/useTenantId',
  () => require('../../helpers/threadPageState').tenantMock,
)
jest.mock(
  '@/hooks/useForumUser',
  () => require('../../helpers/threadPageState').userMock,
)
jest.mock(
  '@/hooks/useThread',
  () => require('../../helpers/threadPageState').threadMock,
)
jest.mock(
  '@/hooks/useThreadLive',
  () => require('../../helpers/threadPageState').liveMock,
)

beforeEach(resetThreadPage)

it('deletes the thread and returns to the forum', async () => {
  render(<ViewThreadPage />)
  fireEvent.click(screen.getByTestId('thread-actions-9'))
  fireEvent.click(screen.getByTestId('thread-action-delete'))
  fireEvent.click(screen.getByTestId('delete-thread-confirm'))
  await waitFor(() => expect(tp.push).toHaveBeenCalledWith('/site/s/forum/3'))
})
