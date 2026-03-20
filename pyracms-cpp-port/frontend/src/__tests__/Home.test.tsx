import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { makeStore } from '@/store/store'
import Home from '@/app/page'

jest.mock('@/hooks/useTenantList', () => ({
  useTenantList: () => ({ sites: [], loading: false }),
}))

function renderWithStore(ui: React.ReactElement) {
  const { store } = makeStore()
  return render(
    <Provider store={store}>{ui}</Provider>,
  )
}

describe('Home Page', () => {
  it('renders welcome message', () => {
    renderWithStore(<Home />)
    expect(
      screen.getByText(/Welcome to PyraCMS/i),
    ).toBeInTheDocument()
  })

  it('renders create site button', () => {
    renderWithStore(<Home />)
    expect(
      screen.getByTestId('create-site-button'),
    ).toBeInTheDocument()
  })

  it('renders the portal page container', () => {
    renderWithStore(<Home />)
    expect(
      screen.getByTestId('portal-page'),
    ).toBeInTheDocument()
  })
})
