import { parseImport } from '@/hooks/admin/backupPayloads'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { put: jest.fn() },
}))

const put = api.put as jest.Mock

beforeEach(() => {
  put.mockReset()
})

it('rejects malformed exports', () => {
  expect(() => parseImport('{}')).toThrow('Invalid format')
})
