import type { Dispatch, UnknownAction } from '@reduxjs/toolkit'
import api from '@/lib/api'
import { setToken } from '@/lib/session'
import { setCredentials } from '@/store/slices/authSlice'
import type { CreateSiteForm } from './createSiteForm'

/**
 * `POST /api/sites`: creates the site together with its Administrator
 * account, then keeps that account signed in on the new site.
 */
export async function submitNewSite(
  form: CreateSiteForm,
  dispatch: Dispatch<UnknownAction>,
): Promise<void> {
  const res = await api.post('/api/sites', {
    slug: form.slug,
    displayName: form.name,
    description: form.description,
    admin: {
      username: form.adminUsername.trim(),
      email: form.adminEmail.trim(),
      password: form.adminPassword,
    },
  })
  setToken(form.slug, res.data.token)
  dispatch(setCredentials({ user: res.data.user, token: res.data.token }))
}
