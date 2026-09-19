import { Stub as mockStub } from './stubs'

// Importing this file registers the mocks (jest.mock is hoisted in here).
jest.mock('@/components/common/NotificationBell', () => mockStub)
jest.mock('@/components/common/ThemeToggle', () => mockStub)
jest.mock('@/components/common/LanguageSelect', () => mockStub)
jest.mock('@/components/common/UserBubble', () => mockStub)
