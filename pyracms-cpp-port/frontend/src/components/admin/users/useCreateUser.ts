import { useState } from 'react'
import api from '@/lib/api'

export function useCreateUser(
  onCreated: () => void = () => window.location.reload(),
) {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)

  const canSubmit =
    !creating &&
    !!username.trim() &&
    !!email.trim() &&
    !!password.trim()

  const submit = () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      return
    }
    setCreating(true)
    setError('')
    api
      .post('/api/auth/register', {
        username: username.trim(),
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      })
      .then(() => {
        setOpen(false)
        setUsername('')
        setEmail('')
        setPassword('')
        setFullName('')
        onCreated()
      })
      .catch((err) => {
        setError(
          err?.response?.data?.error || 'Failed to create user',
        )
      })
      .finally(() => setCreating(false))
  }

  return {
    open, setOpen, username, setUsername, email, setEmail,
    password, setPassword, fullName, setFullName, error,
    creating, canSubmit, submit,
  }
}

export type CreateUserState = ReturnType<typeof useCreateUser>
