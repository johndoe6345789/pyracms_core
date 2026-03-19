'use client'

import { TextField } from '@mui/material'
import type { CreateSiteForm } from '@/hooks/useCreateSite'

interface Props {
  form: CreateSiteForm
  updateField: (
    field: keyof CreateSiteForm,
    value: string,
  ) => void
}

export default function CreateSiteFields({
  form,
  updateField,
}: Props) {
  return (
    <>
      <TextField
        fullWidth
        label="Site Name"
        required
        value={form.name}
        onChange={(e) =>
          updateField('name', e.target.value)
        }
        inputProps={{
          'data-testid': 'site-name-input',
          'aria-label': 'Site name',
        }}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="URL Slug"
        required
        value={form.slug}
        onChange={(e) =>
          updateField('slug', e.target.value)
        }
        helperText={
          form.slug
            ? `Your site will be at /site/${form.slug}`
            : 'Auto-filled from name'
        }
        inputProps={{
          'data-testid': 'site-slug-input',
          'aria-label': 'URL slug',
        }}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Description"
        multiline
        rows={3}
        value={form.description}
        onChange={(e) =>
          updateField('description', e.target.value)
        }
        inputProps={{
          'data-testid': 'site-description-input',
          'aria-label': 'Site description',
        }}
        sx={{ mb: 3 }}
      />
    </>
  )
}
