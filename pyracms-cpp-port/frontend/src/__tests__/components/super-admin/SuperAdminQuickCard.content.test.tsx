import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  renderCard, renderTwoCards,
} from '@/__tests__/helpers/quickCard'

describe('SuperAdminQuickCard content', () => {
  describe('card root', () => {
    it('applies the testId prop as data-testid', () => {
      renderCard()
      expect(screen.getByTestId('quick-tenants')).toBeInTheDocument()
    })

    it('uses a different testId when provided', () => {
      renderCard({ testId: 'quick-users' })
      expect(screen.getByTestId('quick-users')).toBeInTheDocument()
    })
  })

  describe('label', () => {
    it('renders the label text', () => {
      renderCard()
      expect(screen.getByText('Manage Tenants')).toBeInTheDocument()
    })

    it('renders a different label when provided', () => {
      renderCard({ label: 'Global Users' })
      expect(screen.getByText('Global Users')).toBeInTheDocument()
    })
  })

  describe('description', () => {
    it('renders the description text', () => {
      renderCard()
      expect(
        screen.getByText('Create, view and delete sites'),
      ).toBeInTheDocument()
    })

    it('renders a different description when provided', () => {
      const desc = 'Manage users and assign roles'
      renderCard({ description: desc })
      expect(screen.getByText(desc)).toBeInTheDocument()
    })
  })

  describe('icon container', () => {
    it('icon wrapper has aria-hidden="true"', () => {
      const { container } = renderCard()
      const iconWrapper = container.querySelector(
        '[aria-hidden="true"]',
      )
      expect(iconWrapper).toBeInTheDocument()
    })
  })

  describe('independence of multiple cards', () => {
    it('two cards rendered side by side have distinct testIds', () => {
      renderTwoCards()
      expect(screen.getByTestId('quick-tenants')).toBeInTheDocument()
      expect(screen.getByTestId('quick-users')).toBeInTheDocument()
    })

    it('two cards do not share label text', () => {
      renderTwoCards()
      expect(screen.queryByText('Global Users')).toBeInTheDocument()
      expect(screen.queryByText('Manage Tenants')).toBeInTheDocument()
    })
  })
})
