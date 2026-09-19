/** Stub for next/navigation, used by UserBubble in the AppBar. */
export const navigationMock = () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useParams: () => ({ slug: 'demo' }),
  usePathname: () => '/super-admin',
})
