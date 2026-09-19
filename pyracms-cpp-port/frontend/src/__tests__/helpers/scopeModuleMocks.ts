import { apiMock as mockApi } from './apiMock'
import { navMock as mockNav, tenantMock as mockTenant } from './scopeMocks'

// Importing this file registers the mocks (jest.mock is hoisted in here).
jest.mock('@/lib/api', () => mockApi)
jest.mock('next/navigation', () => mockNav)
jest.mock('@/hooks/useTenantId', () => mockTenant)
