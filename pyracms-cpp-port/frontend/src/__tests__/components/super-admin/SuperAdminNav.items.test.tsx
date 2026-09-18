import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  NAV_ITEMS, renderNav,
} from '@/__tests__/helpers/superAdminNav'

describe('SuperAdminNav primary items', () => {
  describe('presence', () => {
    NAV_ITEMS.forEach(({ testId, label }) => {
      it(`renders the ${label} nav item`, () => {
        renderNav()
        expect(screen.getByTestId(testId)).toBeInTheDocument()
      })
    })

    it('renders exactly 4 primary nav items', () => {
      renderNav()
      expect(
        screen.getAllByTestId(/^super-admin-nav-(?!list)/),
      ).toHaveLength(4)
    })
  })

  describe('hrefs', () => {
    NAV_ITEMS.forEach(({ testId, label, path }) => {
      it(`${label} item links to ${path}`, () => {
        renderNav()
        expect(
          screen.getByTestId(testId),
        ).toHaveAttribute('href', path)
      })
    })
  })

  describe('labels', () => {
    NAV_ITEMS.forEach(({ label }) => {
      it(`renders the text "${label}"`, () => {
        renderNav()
        expect(screen.getByText(label)).toBeInTheDocument()
      })
    })
  })
})
