'use client'

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import api from '@/lib/api'
import { adoptFreshToken } from '@/store/endpoints/freshToken'
import { passwordProblem } from '@/hooks/useResetPassword'
import { useFormSubmit } from '@/hooks/useFormSubmit'
import type { RootState } from '@/store/store'

/** Change own password; keeps this session signed in via the fresh token. */
export function useChangePasswordForm(userId: number | undefined) {
  const dispatch = useDispatch()
  const user = useSelector((s: RootState) => s.auth.user)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const f = useFormSubmit('Could not change the password')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!current) return f.fail('Current password is required')
    const problem = passwordProblem(next, confirm)
    if (problem) return f.fail(problem)
    const ok = await f.run(async () => {
      const r = await api.put(`/api/users/${userId}/password`, {
        currentPassword: current,
        newPassword: next,
      })
      adoptFreshToken(r.data, user, dispatch)
    })
    if (ok) {
      setCurrent('')
      setNext('')
      setConfirm('')
    }
    return ok
  }

  return {
    current,
    setCurrent,
    next,
    setNext,
    confirm,
    setConfirm,
    submit,
    ...f,
  }
}
