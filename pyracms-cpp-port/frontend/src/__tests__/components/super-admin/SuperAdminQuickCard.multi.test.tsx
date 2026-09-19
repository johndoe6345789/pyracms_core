/** Tests for multiple independent SuperAdminQuickCards. */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderTwoCards } from
  '../../helpers/superAdminQuickCardHelpers'

describe('SuperAdminQuickCard', () => {
  describe('independence of multiple cards', () => {
    it('two cards rendered side by side have distinct testIds', () => {
      renderTwoCards()
      expect(
        screen.getByTestId('quick-tenants'),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('quick-users'),
      ).toBeInTheDocument()
    })

    it('two cards do not share label text', () => {
      renderTwoCards()
      expect(
        screen.queryByText('Global Users'),
      ).toBeInTheDocument()
      expect(
        screen.queryByText('Manage Tenants'),
      ).toBeInTheDocument()
    })
  })
})
