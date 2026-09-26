import { render, screen } from '@testing-library/react'
import BackupStatus from '@/components/admin/backup/BackupStatus'

it('shows progress while working', () => {
  render(<BackupStatus busy progress="Article A" error="" done="" />)
  expect(screen.getByText('Article A')).toBeInTheDocument()
  render(<BackupStatus busy progress="" error="" done="" />)
  expect(screen.getByText('Working...')).toBeInTheDocument()
})
