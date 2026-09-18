import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderNav } from '@/__tests__/helpers/superAdminNav'

const click = (name: string) =>
  fireEvent.click(screen.getByTestId(`super-admin-nav-${name}`))

describe('SuperAdminNav onNavClick callback', () => {
  it('fires onNavClick when Dashboard is clicked', () => {
    const onNavClick = jest.fn()
    renderNav(onNavClick)
    click('dashboard')
    expect(onNavClick).toHaveBeenCalledTimes(1)
  })

  it('fires onNavClick when Tenants is clicked', () => {
    const onNavClick = jest.fn()
    renderNav(onNavClick)
    click('tenants')
    expect(onNavClick).toHaveBeenCalledTimes(1)
  })

  it('fires onNavClick when Users is clicked', () => {
    const onNavClick = jest.fn()
    renderNav(onNavClick)
    click('users')
    expect(onNavClick).toHaveBeenCalledTimes(1)
  })

  it('fires onNavClick when Settings is clicked', () => {
    const onNavClick = jest.fn()
    renderNav(onNavClick)
    click('settings')
    expect(onNavClick).toHaveBeenCalledTimes(1)
  })

  it('does not throw when onNavClick is omitted', () => {
    renderNav() // no callback passed
    expect(() => click('dashboard')).not.toThrow()
  })
})
