/** Factory for `jest.mock('@/lib/api', ...)` in scope tests. */
export const apiMock = {
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}
