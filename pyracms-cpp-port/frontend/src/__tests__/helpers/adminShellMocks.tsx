import './adminBarMocks'
import { Stub as mockStub, StatsStub as mockStats } from './stubs'

jest.mock('@/components/common/TenantBreadcrumbs', () => mockStub)
jest.mock('@/components/dashboard/DashboardStats', () => mockStats)
