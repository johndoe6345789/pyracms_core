import { render, screen, fireEvent } from '@testing-library/react'
import CreateSiteAdminFields from '@/components/create-site/CreateSiteAdminFields'
import { adminProblem, INITIAL } from '@/hooks/createSiteForm'

describe('CreateSiteAdminFields', () => {
  it('edits the three admin account fields', () => {
    const update = jest.fn()
    render(<CreateSiteAdminFields form={INITIAL} updateField={update} />)
    for (const [id, field] of [
      ['admin-username-input', 'adminUsername'],
      ['admin-email-input', 'adminEmail'],
      ['admin-password-input', 'adminPassword'],
    ] as const) {
      fireEvent.change(screen.getByTestId(id), { target: { value: 'x' } })
      expect(update).toHaveBeenCalledWith(field, 'x')
    }
  })
})

describe('adminProblem', () => {
  const ok = {
    ...INITIAL,
    adminUsername: 'owner',
    adminEmail: 'o@x.io',
    adminPassword: 'password123',
  }
  it('accepts complete details', () => {
    expect(adminProblem(ok)).toBe('')
  })
  it.each([
    [{ adminUsername: 'ab' }, /username/],
    [{ adminEmail: 'nope' }, /email/],
    [{ adminPassword: 'short' }, /8 characters/],
  ])('rejects %p', (patch, msg) => {
    expect(adminProblem({ ...ok, ...patch })).toMatch(msg)
  })
})
