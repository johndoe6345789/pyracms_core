import { render, screen } from '@testing-library/react'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import StatCard from '@/components/admin/StatCard'
import QuickLinkCard from '@/components/admin/QuickLinkCard'
import QuickActionsPanel from '@/components/admin/QuickActionsPanel'
import RecentActivityList from '@/components/admin/RecentActivityList'
import SystemHealthPanel from '@/components/admin/SystemHealthPanel'
import { stubResizeObserver } from '../../helpers/scopeMocks'

beforeAll(stubResizeObserver)

it('renders the dashboard', () => {
  render(<AdminDashboard />)
  expect(screen.getByTestId('stat-card-total-users')).toHaveTextContent(
    '1247')
  expect(screen.getByText('Activity This Week')).toBeInTheDocument()
  expect(screen.getByTestId('recent-activity-panel')).toBeInTheDocument()
  expect(screen.getByTestId('create-article-btn')).toBeInTheDocument()
})

it('renders a stat card', () => {
  render(<StatCard label="A B" value={3} icon={<i />} color="#fff" />)
  expect(screen.getByTestId('stat-card-a-b')).toHaveTextContent('3')
})

it('renders a quick link', () => {
  render(<QuickLinkCard label="My Link" description="d" icon={<i />}
    href="/x" />)
  expect(screen.getByTestId('quick-link-my-link')).toBeInTheDocument()
  expect(screen.getByRole('link')).toHaveAttribute('href', '/x')
})

it('renders quick actions with health', () => {
  render(<QuickActionsPanel />)
  expect(screen.getByTestId('upload-file-btn')).toHaveAttribute(
    'href', '/admin/files')
  expect(screen.getByTestId('new-forum-post-btn')).toBeInTheDocument()
  expect(screen.getByTestId('health-storage')).toHaveTextContent('warning')
})

it('renders health rows', () => {
  render(<SystemHealthPanel />)
  expect(screen.getByTestId('health-database')).toHaveTextContent(
    'healthy')
})

it('renders recent activity', () => {
  render(<RecentActivityList />)
  expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0)
})
