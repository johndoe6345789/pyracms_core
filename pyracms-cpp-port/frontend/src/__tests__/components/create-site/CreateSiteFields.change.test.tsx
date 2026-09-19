/**
 * Tests for CreateSiteFields: onChange calls updateField.
 */
import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderFields } from '../../helpers/createSiteFields'

describe('CreateSiteFields', () => {
  // ── onChange fires updateField ────────────────────────────

  it('calls updateField("name", value) when name changes', () => {
    const updateField = renderFields()
    fireEvent.change(screen.getByTestId('site-name-input'), {
      target: { value: 'Hello' },
    })
    expect(updateField).toHaveBeenCalledWith('name', 'Hello')
  })

  it('calls updateField("slug", value) when slug changes', () => {
    const updateField = renderFields()
    fireEvent.change(screen.getByTestId('site-slug-input'), {
      target: { value: 'hello-world' },
    })
    expect(updateField).toHaveBeenCalledWith('slug', 'hello-world')
  })

  it('calls updateField("description", value) when description changes', () => {
    const updateField = renderFields()
    fireEvent.change(screen.getByTestId('site-description-input'), {
      target: { value: 'My desc' },
    })
    expect(updateField).toHaveBeenCalledWith('description', 'My desc')
  })
})
