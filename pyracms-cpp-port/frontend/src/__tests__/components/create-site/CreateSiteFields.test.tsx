/**
 * Tests for CreateSiteFields component.
 *
 * Verifies that name / slug / description fields render
 * correctly, that onChange calls updateField with the right
 * arguments, and that the slug helper text reflects state.
 */
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import CreateSiteFields
  from '@/components/create-site/CreateSiteFields'
import type { CreateSiteForm } from '@/hooks/useCreateSite'

/** Default empty form fixture. */
const emptyForm: CreateSiteForm = {
  name: '',
  slug: '',
  description: '',
}

/** Form fixture with a slug already set. */
const filledForm: CreateSiteForm = {
  name: 'My Site',
  slug: 'my-site',
  description: 'A test site',
}

describe('CreateSiteFields', () => {
  // ── Renders all three fields ──────────────────────────────

  it('renders the Site Name input', () => {
    const updateField = jest.fn()
    render(
      <CreateSiteFields
        form={emptyForm}
        updateField={updateField}
      />,
    )
    const input = screen.getByTestId('site-name-input')
    expect(input).toBeInTheDocument()
  })

  it('renders the URL Slug input', () => {
    const updateField = jest.fn()
    render(
      <CreateSiteFields
        form={emptyForm}
        updateField={updateField}
      />,
    )
    expect(
      screen.getByTestId('site-slug-input'),
    ).toBeInTheDocument()
  })

  it('renders the Description input', () => {
    const updateField = jest.fn()
    render(
      <CreateSiteFields
        form={emptyForm}
        updateField={updateField}
      />,
    )
    expect(
      screen.getByTestId('site-description-input'),
    ).toBeInTheDocument()
  })

  // ── onChange fires updateField ────────────────────────────

  it('calls updateField("name", value) when name changes', () => {
    const updateField = jest.fn()
    render(
      <CreateSiteFields
        form={emptyForm}
        updateField={updateField}
      />,
    )
    fireEvent.change(
      screen.getByTestId('site-name-input'),
      { target: { value: 'Hello' } },
    )
    expect(updateField).toHaveBeenCalledWith('name', 'Hello')
  })

  it('calls updateField("slug", value) when slug changes', () => {
    const updateField = jest.fn()
    render(
      <CreateSiteFields
        form={emptyForm}
        updateField={updateField}
      />,
    )
    fireEvent.change(
      screen.getByTestId('site-slug-input'),
      { target: { value: 'hello-world' } },
    )
    expect(updateField).toHaveBeenCalledWith(
      'slug',
      'hello-world',
    )
  })

  it('calls updateField("description", value) when description changes',
    () => {
      const updateField = jest.fn()
      render(
        <CreateSiteFields
          form={emptyForm}
          updateField={updateField}
        />,
      )
      fireEvent.change(
        screen.getByTestId('site-description-input'),
        { target: { value: 'My desc' } },
      )
      expect(updateField).toHaveBeenCalledWith(
        'description',
        'My desc',
      )
    },
  )

  // ── Slug helper text ──────────────────────────────────────

  it('shows "Auto-filled from name" when slug is empty', () => {
    const updateField = jest.fn()
    render(
      <CreateSiteFields
        form={emptyForm}
        updateField={updateField}
      />,
    )
    expect(
      screen.getByText('Auto-filled from name'),
    ).toBeInTheDocument()
  })

  it('shows /site/{slug} URL when slug is set', () => {
    const updateField = jest.fn()
    render(
      <CreateSiteFields
        form={filledForm}
        updateField={updateField}
      />,
    )
    expect(
      screen.getByText('Your site will be at /site/my-site'),
    ).toBeInTheDocument()
  })

  // ── aria-label attributes ─────────────────────────────────

  it('site name input has aria-label "Site name"', () => {
    const updateField = jest.fn()
    render(
      <CreateSiteFields
        form={emptyForm}
        updateField={updateField}
      />,
    )
    expect(
      screen.getByTestId('site-name-input'),
    ).toHaveAttribute('aria-label', 'Site name')
  })

  it('slug input has aria-label "URL slug"', () => {
    const updateField = jest.fn()
    render(
      <CreateSiteFields
        form={emptyForm}
        updateField={updateField}
      />,
    )
    expect(
      screen.getByTestId('site-slug-input'),
    ).toHaveAttribute('aria-label', 'URL slug')
  })

  it('description input has aria-label "Site description"', () => {
    const updateField = jest.fn()
    render(
      <CreateSiteFields
        form={emptyForm}
        updateField={updateField}
      />,
    )
    expect(
      screen.getByTestId('site-description-input'),
    ).toHaveAttribute('aria-label', 'Site description')
  })

  // ── Current values are reflected in inputs ────────────────

  it('reflects form.name value in the name input', () => {
    const updateField = jest.fn()
    render(
      <CreateSiteFields
        form={filledForm}
        updateField={updateField}
      />,
    )
    expect(
      screen.getByTestId('site-name-input'),
    ).toHaveValue('My Site')
  })

  it('reflects form.slug value in the slug input', () => {
    const updateField = jest.fn()
    render(
      <CreateSiteFields
        form={filledForm}
        updateField={updateField}
      />,
    )
    expect(
      screen.getByTestId('site-slug-input'),
    ).toHaveValue('my-site')
  })

  it('reflects form.description value in the description input',
    () => {
      const updateField = jest.fn()
      render(
        <CreateSiteFields
          form={filledForm}
          updateField={updateField}
        />,
      )
      expect(
        screen.getByTestId('site-description-input'),
      ).toHaveValue('A test site')
    },
  )
})
