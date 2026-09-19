export const nav = {
  push: jest.fn(),
  params: {} as Record<string, string>,
}

export const navMock = {
  useRouter: () => ({ push: nav.push }),
  useParams: () => nav.params,
  usePathname: () => '/site/demo/forum',
}

export const resetNav = () => {
  nav.push.mockClear()
  nav.params = {}
  localStorage.clear()
}
