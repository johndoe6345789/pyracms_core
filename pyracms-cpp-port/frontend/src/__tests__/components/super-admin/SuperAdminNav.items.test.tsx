/** Tests for SuperAdminNav: heading, item presence and labels. */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  NAV_ITEMS, renderNav,
} from '../../helpers/superAdminNav'

describe('SuperAdminNav', () => {
  describe('heading and icon', () => {
    it('renders the "Super Admin" heading', () => {
      renderNav()
      expect(
        screen.getByText('Super Admin'),
      ).toBeInTheDocument()
    })

    it('ShieldOutlined svg icon is rendered aria-hidden', () => {
      const { container } = renderNav()
      // The first svg in the component is the ShieldOutlined icon.
      const icon = container.querySelector(
        '[aria-hidden="true"] svg, svg[aria-hidden="true"]',
      )
      expect(icon).toBeInTheDocument()
    })
  })

  describe('primary nav items – presence', () => {
    NAV_ITEMS.forEach(({ testId, label }) => {
      it(`renders the ${label} nav item`, () => {
        renderNav()
        expect(
          screen.getByTestId(testId),
        ).toBeInTheDocument()
      })
    })

    it('renders exactly 4 primary nav items', () => {
      renderNav()
      expect(
        screen.getAllByTestId(/^super-admin-nav-(?!list)/),
      ).toHaveLength(4)
    })
  })

  describe('primary nav items – labels', () => {
    NAV_ITEMS.forEach(({ label }) => {
      it(`renders the text "${label}"`, () => {
        renderNav()
        expect(
          screen.getByText(label),
        ).toBeInTheDocument()
      })
    })
  })
})
