export const mockUseCreateSite = jest.fn()

/** Stub for CreateSiteFields (module is the component itself). */
export const MockFields = () => <div data-testid="mock-create-site-fields" />
MockFields.displayName = 'MockCreateSiteFields'

/** Default (idle) hook return value. */
export const idleHook = {
  form: { name: '', slug: '', description: '' },
  updateField: jest.fn(),
  loading: false,
  error: '',
  handleSubmit: jest.fn(),
}

export function resetCreateSite() {
  jest.clearAllMocks()
  mockUseCreateSite.mockReturnValue(idleHook)
}

export const withHook = (o: Partial<typeof idleHook>) =>
  mockUseCreateSite.mockReturnValue({ ...idleHook, ...o })
