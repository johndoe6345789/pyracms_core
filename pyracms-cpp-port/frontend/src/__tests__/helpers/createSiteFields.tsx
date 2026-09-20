import { render } from '@testing-library/react'
import CreateSiteFields from '@/components/create-site/CreateSiteFields'
import type { CreateSiteForm } from '@/hooks/useCreateSite'

export const emptyForm: CreateSiteForm = {
  name: '',
  slug: '',
  description: '',
  adminUsername: '',
  adminEmail: '',
  adminPassword: '',
}

export const filledForm: CreateSiteForm = {
  name: 'My Site',
  slug: 'my-site',
  description: 'A test site',
  adminUsername: 'owner',
  adminEmail: 'owner@x.io',
  adminPassword: 'password123',
}

/** Renders CreateSiteFields; returns the updateField spy. */
export function renderFields(form: CreateSiteForm = emptyForm) {
  const updateField = jest.fn()
  render(<CreateSiteFields form={form} updateField={updateField} />)
  return updateField
}
