import api from '@/lib/api'

type ApiMethod = {
  [Key in keyof typeof api]:
    (typeof api)[Key] extends (...args: never[]) => unknown
      ? Key
      : never
}[keyof typeof api]

export type MockApi<Methods extends ApiMethod> = {
  [Method in Methods]: jest.MockedFunction<
    Extract<(typeof api)[Method], (...args: never[]) => unknown>
  >
}

export function asMockApi<Methods extends ApiMethod>(
  value: typeof api,
) {
  return value as unknown as MockApi<Methods>
}
