import './scopeModuleMocks'
import { m } from './scopeApi'

export { m }
export const noop = () => {}

beforeEach(() => {
  jest.resetAllMocks()
  m.put.mockResolvedValue({})
  m.post.mockResolvedValue({ data: { id: 7 } })
})
