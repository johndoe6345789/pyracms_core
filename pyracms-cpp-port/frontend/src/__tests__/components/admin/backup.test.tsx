import { render, screen, fireEvent } from '@testing-library/react'
import FeatureToggleCard from '@/components/admin/FeatureToggleCard'

it('FeatureToggleCard toggles', () => {
  const onToggle = jest.fn()
  render(
    <FeatureToggleCard
      onToggle={onToggle}
      feature={{
        id: 'forum',
        name: 'Forum',
        description: 'd',
        enabled: true,
      }}
    />,
  )
  expect(screen.getByTestId('feature-card-forum')).toHaveTextContent('Forum')
  fireEvent.click(screen.getByRole('checkbox'))
  expect(onToggle).toHaveBeenCalledWith('forum')
})
